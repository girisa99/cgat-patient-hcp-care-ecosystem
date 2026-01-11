import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-AI-CREDITS] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get or create user credits
    const { data: credits, error: creditsError } = await supabaseClient
      .rpc('get_or_create_user_credits', { p_user_id: user.id });

    if (creditsError) {
      logStep("Error getting credits, creating new record", { error: creditsError.message });
      // Fallback: try direct insert
      const { data: newCredits, error: insertError } = await supabaseClient
        .from('user_ai_credits')
        .upsert({ user_id: user.id, credits_balance: 10 }, { onConflict: 'user_id' })
        .select()
        .single();

      if (insertError) throw new Error(`Failed to get credits: ${insertError.message}`);
      
      return new Response(JSON.stringify({
        credits_balance: newCredits.credits_balance,
        credits_used_total: newCredits.credits_used_total,
        credits_purchased_total: newCredits.credits_purchased_total,
        subscription_credits_monthly: newCredits.subscription_credits_monthly,
        subscription_credits_used: newCredits.subscription_credits_used
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Credits retrieved", { balance: credits?.credits_balance });

    // Get recent transactions
    const { data: transactions } = await supabaseClient
      .from('ai_credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get available packages
    const { data: packages } = await supabaseClient
      .from('ai_credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('credits', { ascending: true });

    // Get feature costs
    const { data: featureCosts } = await supabaseClient
      .from('ai_feature_costs')
      .select('*')
      .eq('is_active', true)
      .order('category');

    return new Response(JSON.stringify({
      credits_balance: credits?.credits_balance || 0,
      credits_used_total: credits?.credits_used_total || 0,
      credits_purchased_total: credits?.credits_purchased_total || 0,
      subscription_credits_monthly: credits?.subscription_credits_monthly || 0,
      subscription_credits_used: credits?.subscription_credits_used || 0,
      recent_transactions: transactions || [],
      available_packages: packages || [],
      feature_costs: featureCosts || []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-ai-credits", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
