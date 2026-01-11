import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[USE-AI-CREDITS] ${step}${detailsStr}`);
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

    const { featureId, units = 1, metadata = {} } = await req.json();
    if (!featureId) throw new Error("Feature ID is required");
    logStep("Request body parsed", { featureId, units });

    // Deduct credits using database function
    const { data: result, error: deductError } = await supabaseClient
      .rpc('deduct_ai_credits', {
        p_user_id: user.id,
        p_feature_id: featureId,
        p_units: units,
        p_metadata: metadata
      });

    if (deductError) {
      throw new Error(`Failed to deduct credits: ${deductError.message}`);
    }

    const deductResult = result?.[0];
    if (!deductResult?.success) {
      logStep("Credit deduction failed", { error: deductResult?.error_message });
      return new Response(JSON.stringify({
        success: false,
        error: deductResult?.error_message || 'Failed to deduct credits',
        balance: deductResult?.balance_after || 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 402, // Payment Required
      });
    }

    logStep("Credits deducted successfully", { 
      deducted: deductResult.credits_deducted, 
      balance: deductResult.balance_after 
    });

    return new Response(JSON.stringify({
      success: true,
      credits_deducted: deductResult.credits_deducted,
      balance_after: deductResult.balance_after
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in use-ai-credits", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
