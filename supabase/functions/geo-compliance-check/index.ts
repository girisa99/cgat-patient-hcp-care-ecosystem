/**
 * Geo Compliance Check Edge Function
 * 
 * Checks user's IP geolocation and determines if they are accessing
 * from a sanctioned region per OFAC regulations.
 * 
 * CRITICAL: Blocks access from Russia, Belarus, Iran, North Korea, Syria, Cuba
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sanctioned country codes - BLOCK COMPLETELY
const BLOCKED_COUNTRY_CODES = [
  'RU', // Russia
  'BY', // Belarus
  'IR', // Iran
  'KP', // North Korea
  'SY', // Syria
  'CU', // Cuba
];

// Country names for user-friendly messages
const COUNTRY_NAMES: Record<string, string> = {
  'RU': 'Russia',
  'BY': 'Belarus',
  'IR': 'Iran',
  'KP': 'North Korea',
  'SY': 'Syria',
  'CU': 'Cuba',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GEO-COMPLIANCE] ${step}${detailsStr}`);
};

interface GeoResponse {
  countryCode: string | null;
  countryName: string | null;
  isBlocked: boolean;
  blockReason: string | null;
  ip: string | null;
}

/**
 * Get IP geolocation using multiple fallback services
 */
async function getGeoLocation(clientIP: string): Promise<{ countryCode: string; countryName: string } | null> {
  // Try ipapi.co first (free, 1000 requests/day)
  try {
    logStep('Trying ipapi.co', { ip: clientIP });
    const response = await fetch(`https://ipapi.co/${clientIP}/json/`, {
      headers: { 'User-Agent': 'Genie-Studio-Compliance/1.0' }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.country_code && !data.error) {
        logStep('ipapi.co success', { country: data.country_code });
        return {
          countryCode: data.country_code,
          countryName: data.country_name || data.country_code
        };
      }
    }
  } catch (err) {
    logStep('ipapi.co failed', { error: err instanceof Error ? err.message : 'Unknown' });
  }

  // Try ip-api.com as fallback (free, 45 requests/minute)
  try {
    logStep('Trying ip-api.com', { ip: clientIP });
    const response = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,countryCode,country`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.countryCode) {
        logStep('ip-api.com success', { country: data.countryCode });
        return {
          countryCode: data.countryCode,
          countryName: data.country || data.countryCode
        };
      }
    }
  } catch (err) {
    logStep('ip-api.com failed', { error: err instanceof Error ? err.message : 'Unknown' });
  }

  // Try ipinfo.io as final fallback
  try {
    logStep('Trying ipinfo.io', { ip: clientIP });
    const response = await fetch(`https://ipinfo.io/${clientIP}/json`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.country) {
        logStep('ipinfo.io success', { country: data.country });
        return {
          countryCode: data.country,
          countryName: data.country
        };
      }
    }
  } catch (err) {
    logStep('ipinfo.io failed', { error: err instanceof Error ? err.message : 'Unknown' });
  }

  logStep('All geolocation services failed');
  return null;
}

/**
 * Extract client IP from request headers
 */
function getClientIP(req: Request): string {
  // Check various headers for the real IP
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  const xRealIP = req.headers.get('x-real-ip');
  const xForwardedFor = req.headers.get('x-forwarded-for');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (xRealIP) return xRealIP;
  if (xForwardedFor) {
    // Take the first IP in the chain
    return xForwardedFor.split(',')[0].trim();
  }
  
  return ''; // Unknown
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    // Get client IP
    const clientIP = getClientIP(req);
    logStep('Client IP extracted', { ip: clientIP || 'unknown' });

    // If we can't determine IP, allow access but log it
    if (!clientIP) {
      logStep('WARNING: Could not determine client IP, allowing access');
      return new Response(JSON.stringify({
        countryCode: null,
        countryName: null,
        isBlocked: false,
        blockReason: null,
        ip: null
      } as GeoResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Get geolocation
    const geo = await getGeoLocation(clientIP);

    if (!geo) {
      // If geolocation fails, allow access but log it
      logStep('WARNING: Geolocation failed, allowing access');
      return new Response(JSON.stringify({
        countryCode: null,
        countryName: null,
        isBlocked: false,
        blockReason: null,
        ip: clientIP
      } as GeoResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Check if country is sanctioned
    const isBlocked = BLOCKED_COUNTRY_CODES.includes(geo.countryCode);
    
    let blockReason: string | null = null;
    if (isBlocked) {
      const countryName = COUNTRY_NAMES[geo.countryCode] || geo.countryName;
      blockReason = `Access to this service is not available in ${countryName} due to U.S. Treasury Department Office of Foreign Assets Control (OFAC) regulations. We apologize for any inconvenience.`;
      logStep('ACCESS BLOCKED - Sanctioned region', { 
        country: geo.countryCode, 
        ip: clientIP 
      });
    } else {
      logStep('Access allowed', { country: geo.countryCode });
    }

    return new Response(JSON.stringify({
      countryCode: geo.countryCode,
      countryName: geo.countryName,
      isBlocked,
      blockReason,
      ip: clientIP
    } as GeoResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    
    // On error, allow access but log it
    return new Response(JSON.stringify({
      countryCode: null,
      countryName: null,
      isBlocked: false,
      blockReason: null,
      ip: null,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
});
