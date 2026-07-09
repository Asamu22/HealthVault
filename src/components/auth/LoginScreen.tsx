import { useState } from 'react';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

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

export function LoginScreen() {
  const [values, setValues] = useState({ institutionId: '', clinicianId: '', passcode: '' });
  const [showPasscode, setShowPasscode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: 'institutionId' | 'clinicianId' | 'passcode') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
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
            label="Institution ID"
            placeholder="Enter ID"
            value={values.institutionId}
            onChange={handleChange('institutionId')}
            startIcon={<InstitutionIcon />}
            autoComplete="organization"
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
            label="Passcode"
            placeholder="•••••••••"
            value={values.passcode}
            onChange={handleChange('passcode')}
            type={showPasscode ? 'text' : 'password'}
            startIcon={<LockIcon />}
            endIcon={<button type="button" className="icon-button" onClick={() => setShowPasscode((current) => !current)}>{<EyeIcon visible={showPasscode} />}</button>}
            autoComplete="current-password"
          />

          <Button type="submit" className="login-submit" loading={submitting} icon={<LockIcon />}>
            Authenticate Session
          </Button>
        </form>

       
      </div>

      <div className="login-note">End-to-End TLS 1.3 Encryption Active</div>
    </div>
  );
}
