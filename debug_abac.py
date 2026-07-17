import os, sys
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client

sb = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])

print('=== STAFF MEMBERS ===')
staff = sb.table('staff_members').select('id,name,email,role,department,is_admin').execute()
for s in staff.data:
    print('  role=%r dept=%r admin=%s email=%s' % (s['role'], s['department'], s['is_admin'], s['email']))

print()
print('=== LIVE POLICIES (is_dry_run=false) ===')
pols = sb.table('access_policies').select('name,subject_role,action,resource_sensitivity,department,effect,is_dry_run').eq('is_dry_run', False).execute()
for p in pols.data:
    print('  [%s] name=%r role=%r action=%r sensitivity=%r dept=%r' % (
        p['effect'].upper(), p['name'], p['subject_role'], p['action'], p['resource_sensitivity'], p['department']
    ))
