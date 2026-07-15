// Central place for the backend base URL. In local dev this falls back to
// the FastAPI server's usual port; in production it must come from
// VITE_API_URL (set in Vercel/Netlify's env vars) since there's no dev
// proxy once the frontend is a static deployed build.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';