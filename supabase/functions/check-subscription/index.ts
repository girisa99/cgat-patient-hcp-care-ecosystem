import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, checking database subscription");
      
      // Check database for beta/internal subscriptions
      const { data: dbSub } = await supabaseClient
        .from('user_subscriptions')
        .select(`
          *,
          subscription_tiers(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (dbSub) {
        logStep("Found database subscription", { tier: dbSub.subscription_tiers?.name });
        return new Response(JSON.stringify({
          subscribed: true,
          tier: dbSub.subscription_tiers?.name || 'beta',
          product_id: dbSub.subscription_tiers?.stripe_product_id,
          subscription_end: dbSub.current_period_end,
          source: 'database'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let priceId = null;
    let subscriptionEnd = null;
    let tier = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active Stripe subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      productId = subscription.items.data[0].price.product as string;
      priceId = subscription.items.data[0].price.id;
      logStep("Subscription details", { productId, priceId });

      // Map product_id to tier name from database
      const { data: tierData } = await supabaseClient
        .from('subscription_tiers')
        .select('name')
        .eq('stripe_product_id', productId)
        .single();
      
      tier = tierData?.name || 'unknown';
      logStep("Determined subscription tier", { tier });

      // Sync to database
      await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          tier_id: tierData ? (await supabaseClient.from('subscription_tiers').select('id').eq('name', tier).single()).data?.id : null,
          status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: subscriptionEnd,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    } else {
      logStep("No active Stripe subscription found");
      
      // Check database for beta subscriptions
      const { data: dbSub } = await supabaseClient
        .from('user_subscriptions')
        .select(`
          *,
          subscription_tiers(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (dbSub) {
        return new Response(JSON.stringify({
          subscribed: true,
          tier: dbSub.subscription_tiers?.name || 'beta',
          product_id: dbSub.subscription_tiers?.stripe_product_id,
          subscription_end: dbSub.current_period_end,
          source: 'database'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier,
      product_id: productId,
      price_id: priceId,
      subscription_end: subscriptionEnd,
      source: 'stripe'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
