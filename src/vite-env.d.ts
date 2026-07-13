/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string | undefined;
  readonly VITE_SUPABASE_ANON_KEY: string | undefined;
  readonly VITE_ADMIN_EMAIL: string | undefined;
  readonly VITE_ADMIN_CLINICIAN_ID: string | undefined;
  readonly VITE_INSTITUTION_ID: string | undefined;
  readonly VITE_AUTH_MODE: string | undefined;
  readonly VITE_DEFAULT_ROLE: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
