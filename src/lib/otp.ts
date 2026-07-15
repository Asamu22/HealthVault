async function parseJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

export async function requestOtpEmail(email: string) {
  const response = await fetch('/api/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    const message = payload?.detail || payload?.message || 'Unable to request OTP.';
    throw new Error(Array.isArray(message) ? message.map((item: any) => item.msg).join(', ') : String(message));
  }

  window.localStorage.setItem('healthvault:otp-email', email);
  return payload;
}

export async function verifyOtpCode(email: string, code: string) {
  const response = await fetch('/api/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    const message = payload?.detail || payload?.message || 'Unable to verify OTP.';
    throw new Error(Array.isArray(message) ? message.map((item: any) => item.msg).join(', ') : String(message));
  }

  if (payload?.token) {
    window.localStorage.setItem('healthvault:otp-token', payload.token);
  }

  return payload;
}

export function getStoredOtpEmail() {
  return window.localStorage.getItem('healthvault:otp-email');
}

export function clearStoredOtpEmail() {
  window.localStorage.removeItem('healthvault:otp-email');
  window.localStorage.removeItem('healthvault:otp-token');
}
