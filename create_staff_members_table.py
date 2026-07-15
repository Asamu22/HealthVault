"""Create the staff_members table via Supabase Management API."""
import os
import httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / '.env')

url = os.environ['SUPABASE_URL']
key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
project_ref = url.replace('https://', '').split('.')[0]

sql = """
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT '',
    department TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending',
    last_active TEXT NOT NULL DEFAULT 'Never',
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_members' AND policyname = 'allow_anon_read_staff') THEN
        CREATE POLICY allow_anon_read_staff ON staff_members FOR SELECT TO anon USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_members' AND policyname = 'allow_service_role_all_staff') THEN
        CREATE POLICY allow_service_role_all_staff ON staff_members FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END
$$;
"""

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
}

endpoints = [
    f'{url}/pg/sql',
    f'{url}/rest/v1/rpc/raw_sql',
]

success = False
for endpoint in endpoints:
    print(f'Trying: {endpoint}')
    try:
        resp = httpx.post(endpoint, headers=headers, json={'query': sql}, timeout=15)
        print(f'  Status: {resp.status_code}, Body: {resp.text[:400]}')
        if resp.status_code < 400:
            success = True
            break
    except Exception as e:
        print(f'  Error: {e}')

# Verify
from supabase import create_client
sb = create_client(url, key)
try:
    result = sb.table('staff_members').select('*').limit(1).execute()
    print(f'\nSUCCESS: staff_members table is accessible!')
except Exception as e:
    print(f'\nTable not accessible yet: {e}')
    if not success:
        print('\nAutomatic creation failed. Please run the SQL manually:')
        print(f'  https://supabase.com/dashboard/project/{project_ref}/sql/new')
        print('  Paste contents of: backend/create_staff_members_table.sql')
