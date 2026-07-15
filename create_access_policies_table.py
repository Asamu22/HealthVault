"""Create the access_policies table via Supabase Management API."""
import os, httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / '.env')

url = os.environ['SUPABASE_URL']
key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
project_ref = url.replace('https://', '').split('.')[0]

sql = """
CREATE TABLE IF NOT EXISTS access_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Any',
    subject_role TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_sensitivity TEXT NOT NULL,
    environment TEXT NOT NULL,
    extra_conditions JSONB NOT NULL DEFAULT '[]',
    effect TEXT NOT NULL DEFAULT 'allow' CHECK (effect IN ('allow', 'deny')),
    is_dry_run BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE access_policies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'access_policies' AND policyname = 'allow_service_role_all_policies') THEN
        CREATE POLICY allow_service_role_all_policies ON access_policies FOR ALL TO service_role USING (true) WITH CHECK (true);
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
    sb.table('access_policies').select('id').limit(1).execute()
    print('\nSUCCESS: access_policies table is accessible!')
except Exception as e:
    print(f'\nTable not accessible: {e}')
    print(f'\nPlease run this SQL manually at:')
    print(f'  https://supabase.com/dashboard/project/{project_ref}/sql/new')
    print("""
CREATE TABLE IF NOT EXISTS access_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Any',
    subject_role TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_sensitivity TEXT NOT NULL,
    environment TEXT NOT NULL,
    extra_conditions JSONB NOT NULL DEFAULT '[]',
    effect TEXT NOT NULL DEFAULT 'allow' CHECK (effect IN ('allow', 'deny')),
    is_dry_run BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE access_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY allow_service_role_all_policies ON access_policies FOR ALL TO service_role USING (true) WITH CHECK (true);
""")
