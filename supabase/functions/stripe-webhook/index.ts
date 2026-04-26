import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Map Stripe price IDs to subscription tiers
const PRICE_TO_TIER: Record<string, string> = {
  // Add your actual Stripe price IDs here
  // 'price_xxx': 'starter',
  // 'price_yyy': 'creator',
  // 'price_zzz': 'pro',
  // 'price_aaa': 'business',
  // 'price_bbb': 'enterprise',
};

const getTierFromPriceId = (priceId: string): string => {
  return PRICE_TO_TIER[priceId] || 'starter';
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!stripeKey || !webhookSecret) {
    logStep("ERROR: Missing Stripe configuration");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  
  // Create Supabase admin client for database updates
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: Missing stripe-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      logStep("ERROR: Signature verification failed", { error: err instanceof Error ? err.message : String(err) });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabaseAdmin, stripe, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(supabaseAdmin, stripe, subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(supabaseAdmin, stripe, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabaseAdmin, stripe, invoice);
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logStep("ERROR: Webhook processing failed", { error: errMsg });
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleSubscriptionChange(
  supabase: any,
  stripe: Stripe,
  subscription: Stripe.Subscription
) {
  logStep("Processing subscription change", { 
    subscriptionId: subscription.id,
    status: subscription.status,
    customerId: subscription.customer
  });

  // Get customer email
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer.deleted) {
    logStep("Customer deleted, skipping");
    return;
  }

  const email = customer.email;
  if (!email) {
    logStep("No customer email found");
    return;
  }

  // Get price ID to determine tier
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = getTierFromPriceId(priceId || '');

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'pending',
    incomplete_expired: 'canceled',
    trialing: 'active',
    paused: 'paused',
  };

  const subscriptionStatus = statusMap[subscription.status] || 'pending';
  const subscriptionEnd = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;
  const subscriptionStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : null;

  // Update genie_studio_users table
  const { error: updateError } = await supabase
    .from('genie_studio_users')
    .update({
      stripe_customer_id: subscription.customer as string,
      current_subscription_tier: tier,
      subscription_status: subscriptionStatus,
      subscription_start_at: subscriptionStart,
      subscription_end_at: subscriptionEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email);

  if (updateError) {
    logStep("ERROR updating user subscription", { error: updateError.message, email });
    
    // Try by stripe_customer_id as fallback
    const { error: fallbackError } = await supabase
      .from('genie_studio_users')
      .update({
        current_subscription_tier: tier,
        subscription_status: subscriptionStatus,
        subscription_start_at: subscriptionStart,
        subscription_end_at: subscriptionEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', subscription.customer as string);

    if (fallbackError) {
      logStep("ERROR: Fallback update also failed", { error: fallbackError.message });
    } else {
      logStep("Updated via stripe_customer_id fallback");
    }
  } else {
    logStep("Successfully updated subscription", { email, tier, status: subscriptionStatus });
  }
}

async function handleSubscriptionCanceled(
  supabase: any,
  stripe: Stripe,
  subscription: Stripe.Subscription
) {
  logStep("Processing subscription cancellation", { 
    subscriptionId: subscription.id,
    customerId: subscription.customer
  });

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer.deleted) return;

  const email = customer.email;
  if (!email) return;

  // Downgrade to free tier
  const { error } = await supabase
    .from('genie_studio_users')
    .update({
      current_subscription_tier: 'free',
      subscription_status: 'canceled',
      subscription_end_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('email', email);

  if (error) {
    logStep("ERROR canceling subscription", { error: error.message });
  } else {
    logStep("Subscription canceled successfully", { email });
  }
}

async function handlePaymentSucceeded(
  supabase: any,
  stripe: Stripe,
  invoice: Stripe.Invoice
) {
  logStep("Processing successful payment", { 
    invoiceId: invoice.id,
    amount: invoice.amount_paid,
    customerId: invoice.customer
  });

  // Payment succeeded - subscription should be updated via subscription events
  // This can be used for additional logging or credit top-ups
  
  if (invoice.customer) {
    const customer = await stripe.customers.retrieve(invoice.customer as string);
    if (!customer.deleted && customer.email) {
      logStep("Payment succeeded for customer", { email: customer.email, amount: invoice.amount_paid });
    }
  }
}

async function handlePaymentFailed(
  supabase: any,
  stripe: Stripe,
  invoice: Stripe.Invoice
) {
  logStep("Processing failed payment", { 
    invoiceId: invoice.id,
    customerId: invoice.customer,
    attemptCount: invoice.attempt_count
  });

  if (!invoice.customer) return;

  const customer = await stripe.customers.retrieve(invoice.customer as string);
  if (customer.deleted || !customer.email) return;

  // Update subscription status to past_due after payment failure
  const { error } = await supabase
    .from('genie_studio_users')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('email', customer.email);

  if (error) {
    logStep("ERROR updating payment failure status", { error: error.message });
  } else {
    logStep("Marked subscription as past_due", { email: customer.email });
  }

  // TODO: Send email notification about failed payment
  // This could trigger an edge function or use a service like Resend
}
