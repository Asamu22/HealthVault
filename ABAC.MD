Wire real request authentication and ABAC policy enforcement into the HealthVault backend. Right now policies save correctly to `access_policies` and `/api/access/evaluate` correctly computes allow/deny decisions, but nothing calls that evaluator from the actual data endpoints, and no endpoint currently knows who's calling it — no `Authorization` header is sent by the frontend, and nothing on the backend verifies one.

## Design decided
- Enforcement is endpoint-level, not per-record: a request is either fully allowed or fully denied based on the caller's role/department/action/etc against saved policies. No per-record filtering.
- Auth identity comes from the same Supabase session already used for login (`supabase.auth.signInWithPassword` in `LoginScreen.tsx`) — not the custom OTP JWT (`issue_session_token`), since that's only issued when the separate OTP/MFA flow completes, which is currently disabled via the `OTP_ENABLED` flag. Don't conflate the two token systems.

## Frontend (`src/lib/api.ts`, `src/lib/supabase.ts`)
1. Add a helper in `api.ts` that gets the current Supabase access token:
   ```ts
   import { supabase } from './supabase';
   export async function getAuthHeader(): Promise<Record<string, string>> {
     const { data: { session } } = await supabase.auth.getSession();
     return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
   }
   ```
   (Watch for the circular import risk between `api.ts` and `supabase.ts` — if it's a problem, move `getAuthHeader` into `supabase.ts` instead and export it from there.)
2. Update every `fetch` call in `supabase.ts` that hits a protected backend route (`/api/records/list`, `/api/records/upload`, `/api/records/pdf-proxy`, `/api/records/pdf-url`) to spread in `await getAuthHeader()` alongside existing headers.
3. Leave `/api/otp/*` calls unchanged — those aren't gated by this system.

## Admin bypass (required)
Admin accounts must never be blocked by policy enforcement — not by an explicit `deny` policy, and not by the default-deny-when-no-policy-matches behavior. This protects the superuser account from being locked out of their own platform by a policy they (or someone else) created, including by mistake.

In `get_current_staff`, the resolved `staff_members` row already includes `is_admin`. In each protected endpoint, check `is_admin` immediately after resolving identity and skip the `evaluate_policy` call entirely when true — go straight to the real work, same as if a matching `allow` policy had fired. Do not run admin requests through `evaluate_policy` at all, even to log an `access_allowed` audit entry via that path — instead write a distinct audit event (e.g. `admin_access_bypass`) so it's still visible in the audit trail that this was an unconditional admin pass-through, not a policy-based decision. This keeps the audit log honest: someone reviewing it later can tell "policy allowed this" apart from "admin override allowed this."

## Backend (`backend/main.py`)
1. Add a FastAPI dependency that verifies the Supabase access token and resolves the caller's role/department:
   ```python
   from fastapi import Depends, Header

   async def get_current_staff(authorization: str = Header(None)):
       if not authorization or not authorization.startswith('Bearer '):
           raise HTTPException(status_code=401, detail='Missing or invalid Authorization header.')
       token = authorization.removeprefix('Bearer ').strip()
       try:
           user_response = sb.auth.get_user(token)
       except Exception as exc:
           raise HTTPException(status_code=401, detail='Invalid or expired session.') from exc
       user = getattr(user_response, 'user', None)
       if not user:
           raise HTTPException(status_code=401, detail='Invalid or expired session.')

       # Resolve role/department from staff_members (source of truth for
       # medical role + department; user_metadata.role only distinguishes
       # admin vs non-admin, per existing App.tsx logic).
       result = sb.table('staff_members').select('*').eq('id', user.id).limit(1).execute()
       rows = result.data or []
       if not rows:
           raise HTTPException(status_code=403, detail='No staff profile found for this account.')
       return rows[0]  # dict with role, department, is_admin, email, etc.
   ```
2. Extract the policy-matching logic currently inline inside `evaluate_access` into a standalone function `evaluate_policy(subject_role, action, resource_sensitivity, department, environment) -> dict` returning the same `{decision, matched_policy, reason}` shape. `evaluate_access` (the `/api/access/evaluate` route) becomes a thin wrapper calling this function with the request body's fields, unchanged in behavior. This lets the records endpoints call the exact same logic.
3. Add enforcement to each protected records endpoint by depending on `get_current_staff`. Immediately after resolving identity, check `is_admin` first:
   - If `is_admin` is true: skip `evaluate_policy` entirely, write an `admin_access_bypass` audit entry, proceed to the real work.
   - Otherwise, call `evaluate_policy` before doing the real work:
   - `list_records`: action=`"view"`, resource_sensitivity=`"standard"` (or whatever your policy taxonomy uses — check what values `PoliciesScreen.tsx` lets admins pick and match them), department=staff member's department, environment=`"production"` or however `environment` is currently populated elsewhere.
   - `upload_record_pdf`: action=`"upload"` (or `"write"` — match existing taxonomy), department= either the staff member's department or the `department` form field, whichever your policy model is meant to key off — confirm which before hardcoding.
   - `proxy_pdf` / `get_pdf_url`: action=`"view"` (or `"download"`), same pattern.
   - On `decision == 'deny'` (non-admin only), raise `HTTPException(status_code=403, detail=reason)` before touching Supabase/storage.
4. Do NOT add enforcement to `/api/otp/*`, `/api/users/*`, or `/api/access/*` routes in this pass — those are out of scope for this fix. Flag if you think they need it too, but don't change them without confirming first.

## Verify
1. Create a `deny` policy for a specific role/action/department combination via the Policies UI.
2. Log in as a staff account matching that combination, attempt the corresponding action (e.g. view records), confirm it's now blocked with a 403 and a clear message — not a silent success like before.
3. Confirm the audit log still shows the correct `access_denied` / `access_allowed` entries, now actually correlated with a real blocked/allowed request rather than only appearing when someone manually used the Access Control test screen.
4. Confirm accounts with no matching deny policy still work normally (default-deny only kicks in when no policy matches at all, per the existing `evaluate_policy` logic — double check this doesn't accidentally lock out roles that have no policies configured yet, since "no policy" currently means default deny, which could break the app for any role/action combo nobody's created a policy for yet).
5. Create a `deny` policy that would, in theory, block the admin account too (e.g. matching their department/role broadly). Confirm the admin account is still able to perform the action anyway, and that the audit log shows `admin_access_bypass` rather than `access_denied` or `access_allowed` for that request.