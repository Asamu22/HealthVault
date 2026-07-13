import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from 'react';
import { supabase } from '../../lib/supabase';

function ShieldBadgeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 5 5v5.5c0 5.5 3.6 10.7 7 12 3.4-1.3 7-6.5 7-12V5l-7-3Z" fill="#0f4fff" />
      <path d="M10.5 12.5 11.94 14.94 14.5 10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="#0f4fff" strokeWidth="1.5">
      <path d="M12 2 5 5v5.5c0 5.5 3.6 10.7 7 12 3.4-1.3 7-6.5 7-12V5l-7-3Z" />
      <path d="m9.2 12.6 1.6 1.6 3.5-4" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="#475569" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M11.25 16h1.5" />
      <path d="M12 8.5a1.5 1.5 0 0 1 1.5 1.5c0 1.5-1.5 1.5-1.5 3" />
    </svg>
  );
}

interface MfaChallengeScreenProps {
  onVerified: () => void;
}

export function MfaChallengeScreen({ onVerified }: MfaChallengeScreenProps) {
  const [values, setValues] = useState<string[]>(Array(6).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [submitting, setSubmitting] = useState(false);
  const [resendActive, setResendActive] = useState(false);
  const [notice, setNotice] = useState('We sent a one-time code to your registered email address.');
  const [helpOpen] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const sendOtpToEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;

      if (!email) {
        setNotice('No email is available for this session yet.');
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        setNotice(`The OTP email could not be sent: ${error.message}`);
        return;
      }

      setNotice(`A one-time code request was accepted for ${email}. If you still receive a magic link, the Supabase email template needs to include the OTP token placeholder.`);
    };

    sendOtpToEmail();
  }, []);

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    if (!value) {
      setValues((current) => {
        const next = [...current];
        next[index] = '';
        return next;
      });
      return;
    }

    const digit = value.slice(-1);
    setValues((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (index < 5) {
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !values[index] && index > 0) {
      setActiveIndex(index - 1);
      setValues((current) => {
        const next = [...current];
        next[index - 1] = '';
        return next;
      });
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
    }
    if (event.key === 'ArrowRight' && index < 5) {
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (!pasted) return;
    event.preventDefault();
    const chars = pasted.slice(0, 6).split('');
    setValues((current) => {
      const next = [...current];
      for (let i = 0; i < 6; i += 1) {
        next[i] = chars[i] || '';
      }
      return next;
    });
    const nextIndex = Math.min(chars.length, 5);
    setActiveIndex(nextIndex);
  };

  const code = values.join('');
  const isComplete = code.length === 6;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete) return;
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email;

    if (!email) {
      setSubmitting(false);
      window.alert('Unable to verify the code without an active account session.');
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    setSubmitting(false);

    if (!error) {
      onVerified();
      return;
    }

    setNotice(error.message);
  };

  const handleResend = () => {
    setResendActive(true);
    setSecondsLeft(180);
    setValues(Array(6).fill(''));
    setActiveIndex(0);
    window.setTimeout(() => setResendActive(false), 1200);
  };

  const displayTime = useMemo(() => {
    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const seconds = String(secondsLeft % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  return (
    <div className="mfa-screen">
      <div className="mfa-card">
        <div className="mfa-brand-icon">
          <ShieldBadgeIcon />
        </div>
        <h1>Reauthentication Required</h1>
        <p>Please enter the 6-digit code sent to your registered email address to continue accessing patient records.</p>

        <form className="mfa-form" onSubmit={handleSubmit} noValidate>
          <div className="mfa-otp-grid">
            {values.map((digit, index) => (
              <div key={index} className="mfa-otp-cell-wrapper">
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className={`mfa-otp-cell ${activeIndex === index ? 'mfa-otp-cell-active' : ''}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={handleChange(index)}
                  onKeyDown={handleKeyDown(index)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${index + 1}`}
                />
                {index === 2 ? <div className="mfa-otp-divider" aria-hidden="true">-</div> : null}
              </div>
            ))}
          </div>

          <div className="mfa-help-row">
            <span className="mfa-help-copy">Code expires in <strong>{displayTime}</strong></span>
            <button type="button" className="mfa-resend-link" onClick={handleResend} disabled={resendActive}>
              Resend Code
            </button>
          </div>

          <button className="btn btn-primary mfa-submit" type="submit" disabled={!isComplete || submitting}>
            Complete Reauthentication
          </button>

          {notice ? <p className="login-note" style={{ marginTop: '0.75rem' }}>{notice}</p> : null}
        </form>

        <div className="mfa-encryption-pill">
          <span className="mfa-pill-icon"><ShieldCheckIcon /></span>
          End-to-End Encrypted Session
        </div>

        <a href="#" className="mfa-support-link">
          <span className="mfa-support-icon"><HelpIcon /></span>
          Need help accessing your account?
        </a>
      </div>
    </div>
  );
}
