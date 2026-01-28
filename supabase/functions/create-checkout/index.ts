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
  // India
  'IN': 'india',
  
  // Africa
  'NG': 'africa', 'KE': 'africa', 'ZA': 'africa', 'GH': 'africa', 'TZ': 'africa',
  'UG': 'africa', 'ET': 'africa', 'RW': 'africa', 'SN': 'africa', 'CI': 'africa',
  
  // MEA (Middle East)
  'AE': 'mea', 'SA': 'mea', 'EG': 'mea', 'IL': 'mea', 'TR': 'mea',
  'QA': 'mea', 'KW': 'mea', 'BH': 'mea', 'OM': 'mea', 'JO': 'mea',
  
  // Southeast Asia (Indonesia, etc.)
  'ID': 'sea', 'TH': 'sea', 'VN': 'sea', 'MY': 'sea', 'SG': 'sea',
  'PH': 'sea', 'MM': 'sea', 'KH': 'sea', 'LA': 'sea', 'BN': 'sea',
  
  // Caribbean
  'JM': 'caribbean', 'TT': 'caribbean', 'BB': 'caribbean', 'BS': 'caribbean',
  'HT': 'caribbean', 'DO': 'caribbean', 'CU': 'caribbean', 'PR': 'caribbean',
  
  // Latin America
  'BR': 'latam', 'MX': 'latam', 'AR': 'latam', 'CO': 'latam', 'CL': 'latam',
  'PE': 'latam', 'VE': 'latam', 'EC': 'latam', 'BO': 'latam', 'PY': 'latam',
  
  // Europe
  'GB': 'europe', 'DE': 'europe', 'FR': 'europe', 'IT': 'europe', 'ES': 'europe',
  'NL': 'europe', 'BE': 'europe', 'CH': 'europe', 'AT': 'europe', 'PL': 'europe',
  'SE': 'europe', 'NO': 'europe', 'DK': 'europe', 'FI': 'europe', 'IE': 'europe',
  'PT': 'europe', 'GR': 'europe', 'CZ': 'europe', 'RO': 'europe', 'HU': 'europe',
  
  // CJK (China, Japan, Korea)
  'CN': 'cjk', 'JP': 'cjk', 'KR': 'cjk', 'TW': 'cjk', 'HK': 'cjk',
  
  // Global/US/Canada/Australia
  'US': 'global', 'CA': 'global', 'AU': 'global', 'NZ': 'global',
};

// Regional payment methods - Stripe payment_method_types
// Reference: https://stripe.com/docs/payments/payment-methods/overview
const REGION_PAYMENT_METHODS: Record<string, string[]> = {
  // Global - Standard card payments
  'global': ['card'],
  
  // India - Cards + UPI
  'india': ['card', 'link'],
  
  // Africa - Cards (Mobile Money via Stripe varies by country)
  'africa': ['card'],
  
  // MEA (Middle East) - Cards
  'mea': ['card'],
  
  // Southeast Asia - Cards + regional methods
  'sea': ['card', 'grabpay'],
  
  // Caribbean - Cards
  'caribbean': ['card'],
  
  // Latin America - Cards + regional methods
  'latam': ['card'],
  
  // Europe - Cards + SEPA + local methods
  'europe': ['card', 'sepa_debit', 'ideal', 'bancontact', 'giropay', 'sofort', 'link'],
  
  // CJK - Cards + Alipay + WeChat (China), Konbini (Japan)
  'cjk': ['card', 'alipay', 'wechat_pay'],
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
    
    // Get regional payment methods
    const paymentMethods = REGION_PAYMENT_METHODS[detectedRegion] || REGION_PAYMENT_METHODS['global'];
    logStep("Payment methods for region", { detectedRegion, paymentMethods });

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
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
      // Enable automatic payment methods OR specify regional methods
      // Using automatic_payment_methods for best coverage
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // For specific regions, we can add payment_method_options for additional config
    // WeChat Pay requires specific app_id configuration
    if (detectedRegion === 'cjk') {
      sessionConfig.payment_method_options = {
        wechat_pay: {
          client: 'web',
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

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
