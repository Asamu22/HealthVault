const rawOtpFlag = import.meta.env.VITE_OTP_ENABLED?.trim().toLowerCase();
export const otpEnabled = rawOtpFlag ? ['1', 'true', 'yes'].includes(rawOtpFlag) : false;
