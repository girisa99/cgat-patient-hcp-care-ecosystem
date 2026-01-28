import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Country code to region mapping (same as geo-detect)
const COUNTRY_TO_REGION: Record<string, string> = {
  'IN': 'india', 'NG': 'africa', 'KE': 'africa', 'ZA': 'africa',
  'AE': 'mea', 'SA': 'mea', 'EG': 'mea', 'ID': 'sea', 'TH': 'sea',
  'JM': 'caribbean', 'TT': 'caribbean', 'BR': 'latam', 'MX': 'latam',
  'GB': 'europe', 'DE': 'europe', 'FR': 'europe', 'CN': 'cjk', 'JP': 'cjk',
  'US': 'global', 'CA': 'global', 'AU': 'global',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { priceId, tier, successUrl, cancelUrl, regionOverride } = await req.json();
    if (!priceId) throw new Error("Price ID is required");
    logStep("Request body parsed", { priceId, tier, regionOverride });

    // Regional pricing lookup
    let finalPriceId = priceId;
    let detectedRegion = 'global';
    
    // Check if regional pricing is enabled
    const { data: settings } = await supabaseClient
      .from('genie_pricing_settings')
      .select('setting_key, setting_value')
      .eq('setting_key', 'is_regional_enabled')
      .single();
    
    const isRegionalEnabled = settings?.setting_value === 'true' || settings?.setting_value === true;
    logStep("Regional pricing status", { isRegionalEnabled });

    if (isRegionalEnabled) {
      // Detect region from IP or use override
      const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      
      if (regionOverride) {
        detectedRegion = regionOverride;
      } else if (clientIP !== "unknown") {
        try {
          const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=countryCode`);
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            detectedRegion = COUNTRY_TO_REGION[geoData.countryCode] || 'global';
          }
        } catch {
          logStep("IP geo lookup failed, using global");
        }
      }
      
      logStep("Region detected", { detectedRegion, clientIP });

      // Fetch regional price if available
      const { data: regionData } = await supabaseClient
        .from('genie_regional_pricing')
        .select('stripe_price_ids')
        .eq('region_code', detectedRegion)
        .eq('is_active', true)
        .single();

      if (regionData?.stripe_price_ids && tier) {
        const regionalPriceId = regionData.stripe_price_ids[tier];
        if (regionalPriceId) {
          finalPriceId = regionalPriceId;
          logStep("Using regional price", { tier, regionalPriceId });
        }
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      logStep("No existing customer, will create during checkout");
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${origin}/subscription?success=true`,
      cancel_url: cancelUrl || `${origin}/subscription?canceled=true`,
      metadata: {
        user_id: user.id,
        tier: tier || 'unknown',
        region: detectedRegion,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url, region: detectedRegion });

    return new Response(JSON.stringify({ url: session.url, region: detectedRegion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
