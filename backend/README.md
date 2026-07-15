# HealthVault OTP Backend (FastAPI)

This is a minimal FastAPI backend that implements server-side OTP issuance and verification for HealthVault Secure.

Features
- `/api/otp/request`: request a one-time code sent via EmailJS REST from the backend
- `/api/otp/verify`: verify a code and receive a short JWT token
- Stores salted+peppered OTP hashes in Supabase Postgres
- Writes events to the existing `audit_log` table

Requirements
- Python 3.10+

Quick start

1. Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Set required environment variables (example)

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export OTP_HASH_PEPPER="your-server-only-pepper"
export OTP_JWT_SECRET="a-long-random-secret"
export EMAILJS_SERVICE_ID="your-service-id"
export EMAILJS_TEMPLATE_ID="your-template-id"
export EMAILJS_PUBLIC_KEY="your-public-key"
export EMAILJS_PRIVATE_KEY="your-private-key"
```

For local development, you can also place these values in the root `.env` file. Backend env vars without the `VITE_` prefix are not exposed to the browser.

4. Run the server

```bash
python main.py
```

The frontend Vite dev server proxies `/api` to `http://127.0.0.1:3001` by default, so this server will be available to the app.

Notes
- This backend now uses Supabase Postgres for OTP storage and EmailJS REST for email delivery.
- Do not expose `EMAILJS_PRIVATE_KEY` or `OTP_HASH_PEPPER` to the browser.
- Replace the in-memory rate limiter with Redis in multi-instance deployments.
- Replace JWT issuance with your production session logic if needed.
