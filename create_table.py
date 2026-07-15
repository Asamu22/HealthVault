"""Create the patient_records table via Supabase Management API (pg-meta)."""
import os
import httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / '.env')

url = os.environ['SUPABASE_URL']
key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
project_ref = url.replace('https://', '').split('.')[0]

sql = """
CREATE TABLE IF NOT EXISTS patient_records (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_initials TEXT NOT NULL DEFAULT '',
    sensitivity TEXT NOT NULL DEFAULT 'Normal',
    status TEXT NOT NULL DEFAULT 'Encrypted',
    encryption TEXT NOT NULL DEFAULT 'AES-GCM',
    department TEXT NOT NULL DEFAULT '',
    author TEXT NOT NULL DEFAULT '',
    file_path TEXT NOT NULL DEFAULT '',
    file_name TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patient_records' AND policyname = 'allow_anon_read') THEN
        CREATE POLICY allow_anon_read ON patient_records FOR SELECT TO anon USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patient_records' AND policyname = 'allow_anon_insert') THEN
        CREATE POLICY allow_anon_insert ON patient_records FOR INSERT TO anon WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patient_records' AND policyname = 'allow_service_role_all') THEN
        CREATE POLICY allow_service_role_all ON patient_records FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END
$$;
"""

# Try the Supabase pg-meta query endpoint
headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
}

# Method 1: Try the /pg/sql endpoint  
endpoints = [
    f'{url}/pg/sql',
    f'{url}/rest/v1/rpc/raw_sql',
]

for endpoint in endpoints:
    print(f'Trying: {endpoint}')
    try:
        resp = httpx.post(endpoint, headers=headers, json={'query': sql}, timeout=15)
        print(f'  Status: {resp.status_code}, Body: {resp.text[:300]}')
        if resp.status_code < 400:
            break
    except Exception as e:
        print(f'  Error: {e}')

# Final verification
from supabase import create_client
sb = create_client(url, key)
try:
    result = sb.table('patient_records').select('*').limit(1).execute()
    print(f'\nSUCCESS: patient_records table is now accessible!')
except Exception as e:
    print(f'\nTable still not accessible: {e}')
    print('\nYou need to create the table manually.')
    print(f'Go to: https://supabase.com/dashboard/project/{project_ref}/sql/new')
    print('And paste the SQL from: backend/create_patient_records_table.sql')
