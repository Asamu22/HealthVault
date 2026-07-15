"""Create the audit_log table via Supabase Management API."""
import os, httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / '.env')

url = os.environ['SUPABASE_URL']
key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
project_ref = url.replace('https://', '').split('.')[0]

sql = """
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_log' AND policyname = 'allow_service_role_all_audit') THEN
        CREATE POLICY allow_service_role_all_audit ON audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END
$$;
"""

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
}

success = False
for endpoint in [f'{url}/pg/sql', f'{url}/rest/v1/rpc/raw_sql']:
    print(f'Trying: {endpoint}')
    try:
        resp = httpx.post(endpoint, headers=headers, json={'query': sql}, timeout=15)
        print(f'  Status: {resp.status_code}, Body: {resp.text[:300]}')
        if resp.status_code < 400:
            success = True
            break
    except Exception as e:
        print(f'  Error: {e}')

from supabase import create_client
sb = create_client(url, key)
try:
    sb.table('audit_log').select('id').limit(1).execute()
    print('\nSUCCESS: audit_log table is accessible!')
except Exception as e:
    print(f'\nTable not accessible: {e}')
    print(f'\nPlease run this SQL manually at:')
    print(f'  https://supabase.com/dashboard/project/{project_ref}/sql/new')
    print("""
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY allow_service_role_all_audit ON audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);
""")
