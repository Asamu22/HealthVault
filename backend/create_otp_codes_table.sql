-- Supabase migration: create otp_codes table for server-side OTP storage

CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  salt text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 5,
  consumed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS otp_codes_email_idx ON otp_codes(email);
CREATE INDEX IF NOT EXISTS otp_codes_consumed_created_at_idx ON otp_codes(email, consumed, created_at DESC);
