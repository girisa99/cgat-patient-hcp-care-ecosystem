import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Country code to region mapping
const COUNTRY_TO_REGION: Record<string, string> = {
  // India & South Asia
  'IN': 'india', 'BD': 'india', 'LK': 'india', 'NP': 'india', 'BT': 'india', 'MV': 'india',
  
  // Africa
  'NG': 'africa', 'KE': 'africa', 'ZA': 'africa', 'GH': 'africa', 'TZ': 'africa',
  'UG': 'africa', 'ET': 'africa', 'RW': 'africa', 'SN': 'africa', 'CI': 'africa',
  'CM': 'africa', 'AO': 'africa', 'MZ': 'africa', 'MG': 'africa', 'ZW': 'africa',
  'ZM': 'africa', 'BW': 'africa', 'NA': 'africa', 'ML': 'africa', 'BF': 'africa',
  'NE': 'africa', 'TD': 'africa', 'SO': 'africa', 'CD': 'africa', 'CG': 'africa',
  'GA': 'africa', 'GQ': 'africa', 'DJ': 'africa', 'ER': 'africa', 'SS': 'africa',
  'MW': 'africa', 'LS': 'africa', 'SZ': 'africa', 'MU': 'africa', 'SC': 'africa',
  'GM': 'africa', 'GN': 'africa', 'SL': 'africa', 'LR': 'africa', 'TG': 'africa', 'BJ': 'africa',
  
  // MEA (Middle East & Central Asia)
  'AE': 'mea', 'SA': 'mea', 'EG': 'mea', 'IL': 'mea', 'TR': 'mea',
  'QA': 'mea', 'KW': 'mea', 'BH': 'mea', 'OM': 'mea', 'JO': 'mea',
  'LB': 'mea', 'IQ': 'mea', 'PK': 'mea', 'PS': 'mea', 'YE': 'mea',
  'AF': 'mea', 'KZ': 'mea', 'UZ': 'mea', 'TM': 'mea', 'TJ': 'mea', 'KG': 'mea',
  'AZ': 'mea', 'GE': 'mea', 'AM': 'mea',
  
  // Southeast Asia
  'ID': 'sea', 'TH': 'sea', 'VN': 'sea', 'MY': 'sea', 'SG': 'sea',
  'PH': 'sea', 'MM': 'sea', 'KH': 'sea', 'LA': 'sea', 'BN': 'sea', 'TL': 'sea',
  
  // Caribbean
  'JM': 'caribbean', 'TT': 'caribbean', 'BB': 'caribbean', 'BS': 'caribbean',
  'HT': 'caribbean', 'DO': 'caribbean', 'PR': 'caribbean',
  'AG': 'caribbean', 'DM': 'caribbean', 'GD': 'caribbean', 'KN': 'caribbean',
  'LC': 'caribbean', 'VC': 'caribbean', 'BZ': 'caribbean', 'GY': 'caribbean', 'SR': 'caribbean',
  
  // Latin America
  'BR': 'latam', 'MX': 'latam', 'AR': 'latam', 'CO': 'latam', 'CL': 'latam',
  'PE': 'latam', 'VE': 'latam', 'EC': 'latam', 'BO': 'latam', 'PY': 'latam',
  'UY': 'latam', 'CR': 'latam', 'PA': 'latam', 'GT': 'latam',
  'HN': 'latam', 'SV': 'latam', 'NI': 'latam',
  
  // Europe (incl. Ukraine, Baltics, Balkans, Nordics)
  'GB': 'europe', 'DE': 'europe', 'FR': 'europe', 'IT': 'europe', 'ES': 'europe',
  'NL': 'europe', 'BE': 'europe', 'CH': 'europe', 'AT': 'europe', 'PL': 'europe',
  'SE': 'europe', 'NO': 'europe', 'DK': 'europe', 'FI': 'europe', 'IE': 'europe',
  'PT': 'europe', 'GR': 'europe', 'CZ': 'europe', 'RO': 'europe', 'HU': 'europe',
  'UA': 'europe', 'SK': 'europe', 'HR': 'europe', 'SI': 'europe', 'BG': 'europe',
  'RS': 'europe', 'BA': 'europe', 'ME': 'europe', 'MK': 'europe', 'AL': 'europe',
  'LT': 'europe', 'LV': 'europe', 'EE': 'europe', 'IS': 'europe',
  'MT': 'europe', 'CY': 'europe', 'LU': 'europe', 'MD': 'europe', 'XK': 'europe',
  
  // CJK (East Asia)
  'CN': 'cjk', 'JP': 'cjk', 'KR': 'cjk', 'TW': 'cjk', 'HK': 'cjk', 'MO': 'cjk', 'MN': 'cjk',
  
  // Global/US/Canada/Australia/NZ/Pacific
  'US': 'global', 'CA': 'global', 'AU': 'global', 'NZ': 'global',
  'FJ': 'global', 'PG': 'global', 'WS': 'global', 'TO': 'global',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GEO-DETECT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get client IP from headers (Supabase Edge Functions provide this)
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "unknown";
    
    logStep("Client IP detected", { clientIP });

    // Check if geo detection is enabled
    const { data: settings } = await supabaseClient
      .from('genie_pricing_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['is_regional_enabled', 'geo_detection_enabled', 'fallback_region']);
    
    const settingsMap: Record<string, unknown> = {};
    for (const s of (settings || [])) {
      try {
        settingsMap[s.setting_key] = typeof s.setting_value === 'string' 
          ? JSON.parse(s.setting_value) 
          : s.setting_value;
      } catch {
        // If JSON parse fails, use raw value (handles unquoted strings)
        settingsMap[s.setting_key] = s.setting_value;
      }
    }
    
    const isRegionalEnabled = settingsMap['is_regional_enabled'] === true || settingsMap['is_regional_enabled'] === 'true';
    const geoDetectionEnabled = settingsMap['geo_detection_enabled'] !== false && settingsMap['geo_detection_enabled'] !== 'false';
    const fallbackRegion = (settingsMap['fallback_region'] as string) || 'global';
    
    logStep("Settings loaded", { isRegionalEnabled, geoDetectionEnabled, fallbackRegion });

    // If regional pricing is disabled, return global immediately
    if (!isRegionalEnabled) {
      logStep("Regional pricing disabled, returning global");
      return await returnRegionData(supabaseClient, 'global', corsHeaders);
    }

    // If geo detection is disabled, return fallback
    if (!geoDetectionEnabled) {
      logStep("Geo detection disabled, returning fallback");
      return await returnRegionData(supabaseClient, fallbackRegion, corsHeaders);
    }

    // Try to get country code from request body (if provided by client)
    let countryCode = null;
    try {
      const body = await req.json();
      countryCode = body?.countryCode?.toUpperCase();
    } catch {
      // No body provided, will use IP detection
    }

    // If no country code provided, try IP-based detection using free service
    if (!countryCode && clientIP !== "unknown") {
      try {
        // Using ip-api.com (free, no API key needed, 45 requests/minute)
        const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=countryCode`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          countryCode = geoData.countryCode;
          logStep("IP geo lookup successful", { countryCode });
        }
      } catch (geoError) {
        logStep("IP geo lookup failed", { error: String(geoError) });
      }
    }

    // Map country to region
    const regionCode = countryCode ? (COUNTRY_TO_REGION[countryCode] || fallbackRegion) : fallbackRegion;
    logStep("Region determined", { countryCode, regionCode });

    return await returnRegionData(supabaseClient, regionCode, corsHeaders, countryCode);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in geo-detect", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function returnRegionData(
  supabaseClient: any,
  regionCode: string,
  corsHeaders: Record<string, string>,
  detectedCountry?: string | null
) {
  // Fetch region pricing data
  const { data: regionData, error } = await supabaseClient
    .from('genie_regional_pricing')
    .select('*')
    .eq('region_code', regionCode)
    .eq('is_active', true)
    .single();

  // If region not found or inactive, fallback to global
  if (error || !regionData) {
    const { data: globalData } = await supabaseClient
      .from('genie_regional_pricing')
      .select('*')
      .eq('region_code', 'global')
      .single();

    return new Response(JSON.stringify({
      success: true,
      region: globalData || {
        region_code: 'global',
        region_name: 'Global/US',
        display_name: 'United States',
        currency_code: 'USD',
        language_zone: 'global',
        default_language: 'en',
        supported_languages: ['en'],
        payment_methods: ['card'],
        ppp_multiplier: 1.00,
      },
      detected_country: detectedCountry,
      fallback_used: true,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  return new Response(JSON.stringify({
    success: true,
    region: regionData,
    detected_country: detectedCountry,
    fallback_used: false,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}
