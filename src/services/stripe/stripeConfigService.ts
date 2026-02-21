/**
 * Stripe Configuration Service
 *
 * Single source of truth for all Stripe product/price IDs.
 * Loads from environment variables with typed fallbacks.
 * NEVER hardcode Stripe IDs in components — always import from here.
 *
 * Usage:
 *   import { getStripeConfig, getTierPriceId } from '@/services/stripe/stripeConfigService';
 *   const priceId = getTierPriceId('starter', 'monthly');
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type SubscriptionTierId = 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';

export interface StripeTierConfig {
  productId: string;
  priceIds: Record<BillingInterval, string>;
}

export interface StripeConfig {
  tiers: Record<SubscriptionTierId, StripeTierConfig>;
  publishableKey: string;
  successUrl: string;
  cancelUrl: string;
}

// ─── Configuration Loader ───────────────────────────────────────────────────

/**
 * Load Stripe config from environment.
 * Falls back to known IDs when env vars are not set (dev mode).
 * In production, ALL values should come from env vars or a config endpoint.
 */
function loadStripeConfig(): StripeConfig {
  // Helper: read env var with fallback
  const env = (key: string, fallback: string): string => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env[key] as string) || fallback;
    }
    return fallback;
  };

  return {
    publishableKey: env('VITE_STRIPE_PUBLISHABLE_KEY', ''),
    successUrl: env('VITE_STRIPE_SUCCESS_URL', '/subscription?status=success'),
    cancelUrl: env('VITE_STRIPE_CANCEL_URL', '/subscription?status=cancelled'),

    tiers: {
      free: {
        productId: env('VITE_STRIPE_PRODUCT_FREE', ''),
        priceIds: {
          monthly: '',
          yearly: '',
        },
      },
      starter: {
        productId: env('VITE_STRIPE_PRODUCT_STARTER', 'prod_TlkXDVA4NXZrx6'),
        priceIds: {
          monthly: env('VITE_STRIPE_PRICE_STARTER_MONTHLY', 'price_1SoD2hCEkh96ps4f9SU3pLVL'),
          yearly: env('VITE_STRIPE_PRICE_STARTER_YEARLY', ''),
        },
      },
      creator: {
        productId: env('VITE_STRIPE_PRODUCT_CREATOR', ''),
        priceIds: {
          monthly: env('VITE_STRIPE_PRICE_CREATOR_MONTHLY', ''),
          yearly: env('VITE_STRIPE_PRICE_CREATOR_YEARLY', ''),
        },
      },
      pro: {
        productId: env('VITE_STRIPE_PRODUCT_PRO', 'prod_TlkYBT75Nu2vt5'),
        priceIds: {
          monthly: env('VITE_STRIPE_PRICE_PRO_MONTHLY', 'price_1SoD3QCEkh96ps4fI0kTG9oo'),
          yearly: env('VITE_STRIPE_PRICE_PRO_YEARLY', ''),
        },
      },
      business: {
        productId: env('VITE_STRIPE_PRODUCT_BUSINESS', 'prod_TlkYpiRUnldeAk'),
        priceIds: {
          monthly: env('VITE_STRIPE_PRICE_BUSINESS_MONTHLY', 'price_1SoD35CEkh96ps4f5bUVwLVm'),
          yearly: env('VITE_STRIPE_PRICE_BUSINESS_YEARLY', ''),
        },
      },
      enterprise: {
        productId: env('VITE_STRIPE_PRODUCT_ENTERPRISE', ''),
        priceIds: {
          monthly: env('VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY', ''),
          yearly: env('VITE_STRIPE_PRICE_ENTERPRISE_YEARLY', ''),
        },
      },
    },
  };
}

// Singleton — loaded once, reused everywhere
let _config: StripeConfig | null = null;

// ─── Public API ─────────────────────────────────────────────────────────────

/** Get the full Stripe configuration */
export function getStripeConfig(): StripeConfig {
  if (!_config) {
    _config = loadStripeConfig();
  }
  return _config;
}

/** Get the price ID for a specific tier and billing interval */
export function getTierPriceId(tier: SubscriptionTierId, interval: BillingInterval): string {
  const config = getStripeConfig();
  return config.tiers[tier]?.priceIds[interval] || '';
}

/** Get the product ID for a specific tier */
export function getTierProductId(tier: SubscriptionTierId): string {
  const config = getStripeConfig();
  return config.tiers[tier]?.productId || '';
}

/** Get tier config by Stripe price ID (reverse lookup) */
export function getTierByPriceId(priceId: string): { tier: SubscriptionTierId; interval: BillingInterval } | null {
  const config = getStripeConfig();
  for (const [tierId, tierConfig] of Object.entries(config.tiers)) {
    for (const [interval, pid] of Object.entries(tierConfig.priceIds)) {
      if (pid === priceId) {
        return { tier: tierId as SubscriptionTierId, interval: interval as BillingInterval };
      }
    }
  }
  return null;
}

/** Get tier config by Stripe product ID (reverse lookup) */
export function getTierByProductId(productId: string): SubscriptionTierId | null {
  const config = getStripeConfig();
  for (const [tierId, tierConfig] of Object.entries(config.tiers)) {
    if (tierConfig.productId === productId) {
      return tierId as SubscriptionTierId;
    }
  }
  return null;
}

/** Force reload config (useful if env vars change at runtime) */
export function reloadStripeConfig(): StripeConfig {
  _config = null;
  return getStripeConfig();
}
