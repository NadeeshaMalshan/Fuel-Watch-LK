// Base URL for all API calls.
// In dev, you may have VITE_API_URL pointing to hosted backend.
// When running on localhost, we always want to use the local Vite proxy (/api -> localhost:3000).
const envApiBase = import.meta.env.VITE_API_URL;
const isLocalDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE = isLocalDev ? '/api' : envApiBase || '/api';
