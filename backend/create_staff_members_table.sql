-- Create staff_members table for HealthVault
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY,                          -- matches Supabase auth.users.id
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT '',
    department TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending',       -- 'Active' | 'Pending'
    last_active TEXT NOT NULL DEFAULT 'Never',
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Allow anon key to read (frontend lists staff using anon key)
CREATE POLICY "Allow anon read"
    ON staff_members
    FOR SELECT
    TO anon
    USING (true);

-- Allow service_role full access (backend uses service_role key)
CREATE POLICY "Allow service_role full access"
    ON staff_members
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
