// Allowed origins per environment — restrict to known frontends
const ALLOWED_ORIGINS = [
  'https://genie-suite-dev.lovable.app',
  'https://genie-suite-uat.lovable.app',
  'https://geniesuite.com',
  'http://localhost:5173',
  'http://localhost:8080',
];

/**
 * Build CORS headers for a given request.
 * Falls back to the first allowed origin when the request origin is not in the allowlist
 * (Supabase invokes functions server-side too, where Origin may be absent).
 */
export function getCorsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers?.get('Origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
  };
}

// Legacy export kept for backward compatibility — new code should use getCorsHeaders(req)
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
