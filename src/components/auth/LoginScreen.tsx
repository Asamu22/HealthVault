import { useState } from 'react';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { supabase, isSupabaseConfigured, fetchCurrentUserProfile } from '../../lib/supabase';
import type { StaffMember } from '../../types';

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l7 3v5.5c0 5.5-3.6 10.7-7 12-3.4-1.3-7-6.5-7-12V5l7-3Z"
        fill="#0f4fff"
      />
      <path d="M10.5 12.5 11.94 14.94 14.5 10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InstitutionIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" stroke="#64748b" strokeWidth="1.5">
      <rect x="4" y="7" width="16" height="10" rx="2" fill="#f8fafc" />
      <path d="M6 13h12" />
      <path d="M9 7v-2h6v2" />
    </svg>
  );
}

function ClinicianIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" stroke="#64748b" strokeWidth="1.5">
      <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M5 21c0-3.5 2.7-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" stroke="#475569" strokeWidth="1.5">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" stroke="#475569" strokeWidth="1.5">
      <path d="M17.94 17.94C16.24 19.09 14.2 19.7 12 19.7c-7 0-11-7-11-7 1.06-1.8 2.44-3.36 4.04-4.6" />
      <path d="M21 21 3 3" />
      <path d="M10.2 10.2a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="#fff" strokeWidth="1.5">
      <rect x="6" y="11" width="12" height="8" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'staff', profile: StaffMember | null) => void;
}

type AuthRole = 'admin' | 'staff';

interface LoginScreenState {
  institutionEmail: string;
  clinicianId: string;
  password: string;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [values, setValues] = useState<LoginScreenState>({
    institutionEmail: '',
    clinicianId: '',
    password: '',
  });
  const [showPasscode, setShowPasscode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (field: 'institutionEmail' | 'clinicianId' | 'password') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!isSupabaseConfigured) {
      setMessage('Supabase is not ready yet. Please confirm the values in .env and restart the dev server if needed.');
      setSubmitting(false);
      return;
    }

    const loginEmail = values.institutionEmail.trim();

    if (!loginEmail) {
      setMessage('Please enter your institution email.');
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: values.password,
    });

    setSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    // Role must come only from the server-verified session metadata.
    // We also fetch the staff profile to check if they have admin privileges in the DB.
    const profile = await fetchCurrentUserProfile();
    const isMetadataAdmin = data.user?.user_metadata?.role === 'admin';
    const inferredRole: AuthRole = isMetadataAdmin || profile?.isAdmin ? 'admin' : 'staff';

    setMessage(`Welcome back, ${loginEmail}. Redirecting to your dashboard now.`);
    onLogin(inferredRole, profile);
  };

  return (
    <div className="login-screen">
      <div className="login-status-pill">System Online</div>
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <ShieldIcon />
          </div>
          <div>
            <h1>HealthVault Secure</h1>
            <p>Authorized Clinical Personnel Only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <TextField
            label="Institution Email"
            placeholder="Enter institution email"
            value={values.institutionEmail}
            onChange={handleChange('institutionEmail')}
            startIcon={<InstitutionIcon />}
            autoComplete="email"
            type="email"
          />

          <TextField
            label="Clinician ID"
            placeholder="e.g. jvane-cardio"
            value={values.clinicianId}
            onChange={handleChange('clinicianId')}
            startIcon={<ClinicianIcon />}
            autoComplete="username"
          />

          <TextField
            label="Password"
            placeholder="•••••••••"
            value={values.password}
            onChange={handleChange('password')}
            type={showPasscode ? 'text' : 'password'}
            startIcon={<LockIcon />}
            endIcon={<button type="button" className="icon-button" onClick={() => setShowPasscode((current) => !current)}>{<EyeIcon visible={showPasscode} />}</button>}
            autoComplete="current-password"
          />

          <Button type="submit" className="login-submit" loading={submitting} icon={<LockIcon />}>
            Authenticate Session
          </Button>

          {message ? <p className="login-note">{message}</p> : null}
        </form>
      </div>

      <div className="login-note">End-to-End TLS 1.3 Encryption Active</div>
    </div>
  );
}