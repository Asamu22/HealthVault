-- Create patient_records table for HealthVault
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

CREATE TABLE IF NOT EXISTS patient_records (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_initials TEXT NOT NULL DEFAULT '',
    sensitivity TEXT NOT NULL DEFAULT 'Confidential',
    status TEXT NOT NULL DEFAULT 'Encrypted',
    encryption TEXT NOT NULL DEFAULT 'AES-GCM',
    department TEXT NOT NULL DEFAULT '',
    author TEXT NOT NULL DEFAULT '',
    file_path TEXT NOT NULL DEFAULT '',
    file_name TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) but allow all operations for now
-- (service_role key bypasses RLS, and the anon key needs a policy for reads)
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;

-- Allow the anon key to SELECT (read) all records
CREATE POLICY "Allow anon read access"
    ON patient_records
    FOR SELECT
    TO anon
    USING (true);

-- Allow the anon key to INSERT records
CREATE POLICY "Allow anon insert access"
    ON patient_records
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow service_role full access (this is automatic but explicit for clarity)
CREATE POLICY "Allow service_role full access"
    ON patient_records
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
