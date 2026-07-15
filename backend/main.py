import os
import secrets
import hmac
import hashlib
import time
import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

import httpx

from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import jwt
from postgrest.exceptions import APIError

from backend.supabase_client import sb
from backend.mailer import send_email_async, EmailSendError

# Configuration (env)
OTP_TTL_MINUTES = int(os.environ.get('OTP_TTL_MINUTES', '10'))
OTP_MAX_ATTEMPTS = int(os.environ.get('OTP_MAX_ATTEMPTS', '5'))
OTP_LENGTH = int(os.environ.get('OTP_LENGTH', '6'))
REQUEST_COOLDOWN_SECONDS = int(os.environ.get('REQUEST_COOLDOWN_SECONDS', '60'))
PEPPER = os.environ.get('OTP_HASH_PEPPER', None)  # REQUIRED
OTP_ENABLED = os.environ.get('OTP_ENABLED', 'false').strip().lower() in ('1', 'true', 'yes')
JWT_SECRET = os.environ.get('OTP_JWT_SECRET', 'dev-secret')
JWT_ALG = 'HS256'
STORAGE_BUCKET = os.environ.get('SUPABASE_RECORDS_BUCKET', 'patient-records').strip() or 'patient-records'

if not PEPPER:
    raise RuntimeError('Missing OTP_HASH_PEPPER environment variable')

if not JWT_SECRET:
    raise RuntimeError('Missing OTP_JWT_SECRET environment variable')

# Simple in-memory rate limiter (replace with Redis for production)
_last_request_at: dict[str, float] = {}


def _hash_code(code: str, salt: str) -> str:
    msg = f"{salt}:{code}".encode()
    return hmac.new(PEPPER.encode(), msg, hashlib.sha256).hexdigest()


def _generate_code() -> str:
    return str(secrets.randbelow(10**OTP_LENGTH)).zfill(OTP_LENGTH)


def _audit(event_type: str, subject: str, detail: dict | None = None) -> None:
    payload = {
        'event_type': event_type,
        'subject': subject,
        'detail': detail or {},
    }
    try:
        sb.table('audit_log').insert(payload).execute()
    except Exception as exc:
        # Audit failures must never block real operations — log and continue.
        print(f'[AUDIT WARNING] Could not write audit log ({event_type}): {exc}')


def issue_session_token(email: str) -> str:
    return jwt.encode(
        {
            'sub': email,
            'exp': datetime.utcnow() + timedelta(minutes=30),
        },
        JWT_SECRET,
        algorithm=JWT_ALG,
    )


app = FastAPI()

# CORS: allow the Vite dev server and common local origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

router = APIRouter(prefix='/api/otp', tags=['otp'])
records_router = APIRouter(prefix='/api/records', tags=['records'])
users_router = APIRouter(prefix='/api/users', tags=['users'])
access_router = APIRouter(prefix='/api/access', tags=['access'])
audit_router = APIRouter(prefix='/api/audit', tags=['audit'])


class OtpRequestBody(BaseModel):
    email: EmailStr


class OtpVerifyBody(BaseModel):
    email: EmailStr
    code: str


@router.post('/request')
async def request_otp(body: OtpRequestBody, request: Request):
    if not OTP_ENABLED:
        return {'status': 'disabled', 'message': 'OTP enforcement is disabled on this server.'}

    email = body.email.lower().strip()
    now = time.time()
    last = _last_request_at.get(email, 0)
    if now - last < REQUEST_COOLDOWN_SECONDS:
        raise HTTPException(status_code=429, detail='Please wait before requesting another code.')

    _last_request_at[email] = now

    try:
        sb.table('otp_codes').update({'consumed': True}).eq('email', email).eq('consumed', False).execute()
    except APIError as exc:
        raise HTTPException(status_code=500, detail='Unable to invalidate previous OTPs. Please try again.') from exc

    code = _generate_code()
    salt = secrets.token_hex(16)
    code_hash = _hash_code(code, salt)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)

    otp_payload = {
        'id': str(uuid.uuid4()),
        'email': email,
        'code_hash': code_hash,
        'salt': salt,
        'expires_at': expires_at.isoformat(),
        'attempts': 0,
        'max_attempts': OTP_MAX_ATTEMPTS,
        'consumed': False,
    }

    try:
        sb.table('otp_codes').insert(otp_payload).execute()
    except APIError as exc:
        raise HTTPException(status_code=500, detail='Unable to save verification code. Please try again.') from exc

    try:
        await send_email_async(user_email=email, otp_code=code, expiry_minutes=OTP_TTL_MINUTES)
    except EmailSendError as exc:
        _audit('otp_email_send_failed', email, {'error': str(exc)})
        raise HTTPException(status_code=502, detail='Could not send verification email. Try again shortly.')
    except Exception as exc:
        _audit('otp_email_send_failed', email, {'error': str(exc)})
        raise HTTPException(status_code=502, detail='Could not send verification email. Try again shortly.')

    _audit('otp_issued', email, {'expires_at': expires_at.isoformat()})
    return {'status': 'sent', 'expires_in_minutes': OTP_TTL_MINUTES}


@router.post('/verify')
async def verify_otp(body: OtpVerifyBody):
    if not OTP_ENABLED:
        raise HTTPException(status_code=403, detail='OTP verification is disabled on this server.')

    email = body.email.lower().strip()
    submitted_code = body.code.strip()

    try:
        result = (
            sb.table('otp_codes')
            .select('*')
            .eq('email', email)
            .eq('consumed', False)
            .order('created_at', desc=True)
            .limit(1)
            .execute()
        )
    except APIError as exc:
        raise HTTPException(status_code=500, detail='Unable to verify the code at this time. Please try again.') from exc

    rows = result.data or []
    if not rows:
        _audit('otp_verify_failed', email, {'reason': 'no_active_code'})
        raise HTTPException(status_code=400, detail='No active verification code for this email.')

    row = rows[0]
    if row['attempts'] >= row['max_attempts']:
        _audit('otp_verify_failed', email, {'reason': 'max_attempts_exceeded'})
        raise HTTPException(status_code=429, detail='Too many attempts. Request a new code.')

    expires_at = datetime.fromisoformat(row['expires_at'])
    if datetime.now(timezone.utc) > expires_at:
        _audit('otp_verify_failed', email, {'reason': 'expired'})
        raise HTTPException(status_code=400, detail='Code has expired. Request a new one.')

    expected_hash = _hash_code(submitted_code, row['salt'])
    if not hmac.compare_digest(expected_hash, row['code_hash']):
        attempts = row['attempts'] + 1
        try:
            sb.table('otp_codes').update({'attempts': attempts}).eq('id', row['id']).execute()
        except APIError as exc:
            raise HTTPException(status_code=500, detail='Unable to update attempt count. Please try again.') from exc
        _audit('otp_verify_failed', email, {'reason': 'mismatch', 'attempt': attempts})
        raise HTTPException(status_code=400, detail='Incorrect code.')

    try:
        sb.table('otp_codes').update({'consumed': True}).eq('id', row['id']).execute()
    except APIError as exc:
        raise HTTPException(status_code=500, detail='Unable to mark code as consumed. Please try again.') from exc
    _audit('otp_verified', email, {})

    token = issue_session_token(email)
    return {'status': 'verified', 'token': token}


@records_router.get('/list')
async def list_records():
    try:
        result = (
            sb.table('patient_records')
            .select('*')
            .order('created_at', desc=True)
            .execute()
        )
        return {'records': result.data or []}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to fetch records: {exc}') from exc


@records_router.get('/pdf-url')
async def get_pdf_url(file_path: str):
    """Generate a short-lived signed URL for a stored PDF using the service role key."""
    try:
        result = sb.storage.from_(STORAGE_BUCKET).create_signed_url(file_path, 3600)
        if isinstance(result, dict):
            signed_url = result.get('signedURL') or result.get('signedUrl') or result.get('signed_url')
        else:
            signed_url = getattr(result, 'signed_url', None) or getattr(result, 'signedUrl', None)

        if not signed_url:
            raise HTTPException(status_code=500, detail='Signed URL generation returned empty result.')

        return {'signed_url': signed_url}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to generate signed URL: {exc}') from exc


@records_router.get('/pdf-proxy')
async def proxy_pdf(file_path: str):
    """Stream PDF bytes from Supabase storage with inline Content-Disposition so browsers display it."""
    # 1. Get a short-lived signed URL
    try:
        result = sb.storage.from_(STORAGE_BUCKET).create_signed_url(file_path, 300)
        if isinstance(result, dict):
            signed_url = result.get('signedURL') or result.get('signedUrl') or ''
        else:
            signed_url = getattr(result, 'signed_url', None) or getattr(result, 'signedUrl', None) or ''
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Could not generate storage URL: {exc}') from exc

    if not signed_url:
        raise HTTPException(status_code=500, detail='Empty signed URL returned from storage.')

    # 2. Fetch the PDF bytes and stream them with inline disposition
    filename = file_path.split('/')[-1] or 'document.pdf'
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            upstream = await client.get(signed_url)
            upstream.raise_for_status()
            pdf_bytes = upstream.content
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail=f'Storage returned {exc.response.status_code}.') from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f'Failed to fetch PDF: {exc}') from exc

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type='application/pdf',
        headers={
            'Content-Disposition': f'inline; filename="{filename}"',
            'Cache-Control': 'private, max-age=300',
        },
    )


@records_router.post('/upload')
async def upload_record_pdf(
    file: Annotated[UploadFile, File(...)],
    patient_name: Annotated[str, Form()],
    patient_initials: Annotated[str, Form()],
    sensitivity: Annotated[str, Form()],
    department: Annotated[str, Form()],
    author: Annotated[str, Form()],
    record_id: Annotated[str, Form()],
):
    if not file.filename:
        raise HTTPException(status_code=400, detail='A PDF file is required.')

    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail='Only PDF files are supported.')

    try:
        buckets = sb.storage.list_buckets()
        # list_buckets() returns a plain list in current supabase-py versions
        if isinstance(buckets, (list, tuple)):
            items = buckets if isinstance(buckets, list) else buckets[1]
            bucket_names = {item.name for item in items if getattr(item, 'name', None)}
        else:
            bucket_names = set()
    except Exception:
        bucket_names = set()

    if STORAGE_BUCKET not in bucket_names:
        try:
            sb.storage.create_bucket(STORAGE_BUCKET)
        except Exception:
            # Bucket may already exist (race condition or detection failure) — proceed
            pass

    file_bytes = await file.read()
    object_path = f"records/{record_id}/{file.filename}"
    try:
        sb.storage.from_(STORAGE_BUCKET).upload(object_path, file_bytes)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to upload PDF to storage: {exc}') from exc

    metadata_payload = {
        'id': record_id,
        'patient_name': patient_name,
        'patient_initials': patient_initials,
        'sensitivity': sensitivity,
        'status': 'Encrypted',
        'encryption': 'AES-GCM',
        'department': department,
        'author': author,
        'file_path': object_path,
        'file_name': file.filename,
        'date': datetime.now().strftime('%Y-%m-%d'),
        'created_at': datetime.now(timezone.utc).isoformat(),
    }

    try:
        sb.table('patient_records').insert(metadata_payload).execute()
    except Exception as exc:
        print(f'patient_records metadata insert error: {exc}')
        raise HTTPException(
            status_code=500,
            detail=f'PDF uploaded to storage, but saving record metadata failed: {exc}. '
                   'Please ensure the patient_records table exists in Supabase.',
        ) from exc

    return {
        'status': 'uploaded',
        'record': metadata_payload,
    }


class CreateUserBody(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    role: str
    department: str
    isAdmin: bool = False


@users_router.post('/create')
async def create_user(body: CreateUserBody):
    # 1. Create the auth user via Supabase Admin API
    try:
        auth_response = sb.auth.admin.create_user({
            'email': body.email,
            'password': body.password,
            'email_confirm': True,
        })
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f'Unable to create auth user: {exc}') from exc

    auth_user = auth_response.user
    if not auth_user:
        raise HTTPException(status_code=400, detail='Auth user creation returned no user object.')

    # 2. Derive initials from the full name
    parts = body.fullName.strip().split()
    initials = ''.join(p[0].upper() for p in parts[:2] if p)

    # 3. Insert into staff_members table
    staff_payload = {
        'id': str(auth_user.id),
        'name': body.fullName.strip(),
        'email': body.email.lower().strip(),
        'role': body.role,
        'department': body.department,
        'status': 'Pending',
        'last_active': 'Just created',
        'is_admin': body.isAdmin,
    }

    try:
        sb.table('staff_members').insert(staff_payload).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f'Auth user created but staff profile insert failed: {exc}',
        ) from exc

    _audit('user_created', body.email, {'role': body.role, 'is_admin': body.isAdmin})
    return {'status': 'created', 'staff_member': staff_payload}


@users_router.get('/list')
async def list_staff():
    try:
        result = (
            sb.table('staff_members')
            .select('*')
            .order('name', desc=False)
            .execute()
        )
        return {'staff_members': result.data or []}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to fetch staff: {exc}') from exc


# ─── ABAC Access Control ─────────────────────────────────────────────────────

class PolicyCondition(BaseModel):
    field: str
    value: str


class PolicyBody(BaseModel):
    name: str
    department: str
    subject_role: str
    action: str
    resource_sensitivity: str
    environment: str
    extra_conditions: list[PolicyCondition] = []
    effect: str  # 'allow' | 'deny'
    is_dry_run: bool = False


class EvaluateBody(BaseModel):
    subject_role: str
    action: str
    resource_sensitivity: str
    department: str
    environment: str


@access_router.get('/policies')
async def list_policies():
    try:
        result = (
            sb.table('access_policies')
            .select('*')
            .order('created_at', desc=True)
            .execute()
        )
        return {'policies': result.data or []}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to fetch policies: {exc}') from exc


@access_router.post('/policies')
async def create_policy(body: PolicyBody):
    payload = {
        'id': str(uuid.uuid4()),
        'name': body.name.strip(),
        'department': body.department,
        'subject_role': body.subject_role,
        'action': body.action,
        'resource_sensitivity': body.resource_sensitivity,
        'environment': body.environment,
        'extra_conditions': [c.model_dump() for c in body.extra_conditions],
        'effect': body.effect,
        'is_dry_run': body.is_dry_run,
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    try:
        sb.table('access_policies').insert(payload).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to save policy: {exc}') from exc

    _audit('policy_created', body.name, {'effect': body.effect, 'dry_run': body.is_dry_run})
    return {'status': 'created', 'policy': payload}


@access_router.delete('/policies/{policy_id}')
async def delete_policy(policy_id: str):
    try:
        sb.table('access_policies').delete().eq('id', policy_id).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to delete policy: {exc}') from exc

    _audit('policy_deleted', policy_id, {})
    return {'status': 'deleted'}


@access_router.put('/policies/{policy_id}')
async def update_policy(policy_id: str, body: PolicyBody):
    updates = {
        'name': body.name.strip(),
        'department': body.department,
        'subject_role': body.subject_role,
        'action': body.action,
        'resource_sensitivity': body.resource_sensitivity,
        'environment': body.environment,
        'extra_conditions': [c.model_dump() for c in body.extra_conditions],
        'effect': body.effect,
        'is_dry_run': body.is_dry_run,
    }
    try:
        result = sb.table('access_policies').update(updates).eq('id', policy_id).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to update policy: {exc}') from exc

    if not result.data:
        raise HTTPException(status_code=404, detail='Policy not found.')

    _audit('policy_updated', body.name, {'effect': body.effect})
    return {'status': 'updated', 'policy': result.data[0]}


@access_router.post('/evaluate')
async def evaluate_access(body: EvaluateBody):
    """
    ABAC evaluation engine.
    Loads all non-dry-run 'allow' and 'deny' policies and evaluates them in order.
    Deny-overrides: any matching deny wins. Otherwise first matching allow wins.
    Default effect when no policy matches: deny.
    """
    try:
        result = (
            sb.table('access_policies')
            .select('*')
            .eq('is_dry_run', False)
            .execute()
        )
        policies = result.data or []
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to load policies: {exc}') from exc

    def policy_matches(policy: dict) -> bool:
        """Check if the request attributes satisfy a policy's conditions."""
        if policy['subject_role'].lower() != body.subject_role.lower():
            return False
        if policy['action'].lower() != body.action.lower():
            return False
        if policy['resource_sensitivity'].lower() != body.resource_sensitivity.lower():
            return False
        if policy['department'].lower() not in ('any', body.department.lower()):
            if policy['department'].lower() != body.department.lower():
                return False
        if policy['environment'].lower() not in ('any', body.environment.lower()):
            if policy['environment'].lower() != body.environment.lower():
                return False
        # Check extra conditions (all must match)
        for cond in (policy.get('extra_conditions') or []):
            field = cond.get('field', '').lower()
            val = cond.get('value', '').lower()
            if field == 'subject role' and body.subject_role.lower() != val:
                return False
            if field == 'action' and body.action.lower() != val:
                return False
            if field == 'resource sensitivity' and body.resource_sensitivity.lower() != val:
                return False
            if field == 'environment' and body.environment.lower() != val:
                return False
        return True

    matched_allow = None
    matched_deny = None

    for policy in policies:
        if policy_matches(policy):
            if policy['effect'] == 'deny' and matched_deny is None:
                matched_deny = policy
            elif policy['effect'] == 'allow' and matched_allow is None:
                matched_allow = policy

    # Deny overrides allow
    if matched_deny:
        _audit('access_denied', body.subject_role, {
            'action': body.action,
            'policy': matched_deny['name'],
        })
        return {
            'decision': 'deny',
            'matched_policy': matched_deny['name'],
            'reason': f"Explicitly denied by policy: '{matched_deny['name']}'",
        }

    if matched_allow:
        _audit('access_allowed', body.subject_role, {
            'action': body.action,
            'policy': matched_allow['name'],
        })
        return {
            'decision': 'allow',
            'matched_policy': matched_allow['name'],
            'reason': f"Permitted by policy: '{matched_allow['name']}'",
        }

    # Default deny
    _audit('access_denied', body.subject_role, {
        'action': body.action,
        'reason': 'no_matching_policy',
    })
    return {
        'decision': 'deny',
        'matched_policy': None,
        'reason': 'No policy permits this request (default deny).',
    }


# ─── Audit Logs ──────────────────────────────────────────────────────────────

@audit_router.get('')
async def list_audit_logs():
    try:
        result = (
            sb.table('audit_log')
            .select('*')
            .order('created_at', desc=True)
            .limit(100)
            .execute()
        )
        return {'audit_logs': result.data or []}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unable to fetch audit logs: {exc}') from exc


app.include_router(router)
app.include_router(records_router)
app.include_router(users_router)
app.include_router(access_router)
app.include_router(audit_router)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='127.0.0.1', port=int(os.environ.get('OTP_SERVER_PORT', '3001')), reload=True)
