// Base URL for all API calls.
// Default: Railway API via .env.development / .env.production.
// Local backend: run `npm run server`, then use .env.development.local with VITE_API_URL empty or unset /api.
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
