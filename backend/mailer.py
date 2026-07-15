import os
import httpx

EMAILJS_SERVICE_ID = os.environ.get('EMAILJS_SERVICE_ID')
EMAILJS_TEMPLATE_ID = os.environ.get('EMAILJS_TEMPLATE_ID')
EMAILJS_PUBLIC_KEY = os.environ.get('EMAILJS_PUBLIC_KEY')
EMAILJS_PRIVATE_KEY = os.environ.get('EMAILJS_PRIVATE_KEY')
EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

class EmailSendError(Exception):
    pass

if not EMAILJS_SERVICE_ID or not EMAILJS_TEMPLATE_ID or not EMAILJS_PUBLIC_KEY or not EMAILJS_PRIVATE_KEY:
    raise RuntimeError('Missing one or more EmailJS environment variables: EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY')

async def send_email_async(user_email: str, otp_code: str, expiry_minutes: int) -> None:
    payload = {
        'service_id': EMAILJS_SERVICE_ID,
        'template_id': EMAILJS_TEMPLATE_ID,
        'user_id': EMAILJS_PUBLIC_KEY,
        'accessToken': EMAILJS_PRIVATE_KEY,
        'template_params': {
            'user_email': user_email,
            'otp_code': otp_code,
            'expiry_minutes': expiry_minutes,
        },
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(EMAILJS_ENDPOINT, json=payload)

    if response.status_code < 200 or response.status_code >= 300:
        raise EmailSendError(f'EmailJS send failed: {response.status_code} - {response.text}')
