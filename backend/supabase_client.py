import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load root .env for local backend development.
ROOT_ENV = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=ROOT_ENV, override=False)

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')

sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
