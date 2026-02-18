/**
 * REGIONAL PRICING SECTION
 * 
 * Displays pricing tiers with localized currency, 
 * regional savings comparisons, and local payment methods.
 * Uses regional config for currency display.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { type RegionSlug } from '@/config/regionalLandingConfig';

// Regional currency and pricing multipliers
const REGIONAL_PRICING: Record<RegionSlug, {
  currency: string;
  symbol: string;
  multiplier: number;
  paymentMethods: string[];
  savingsLabel: string;
}> = {
  nam: { currency: 'USD', symbol: '$', multiplier: 1, paymentMethods: ['Visa', 'Mastercard', 'Apple Pay'], savingsLabel: 'Save $121/mo vs 7 separate tools' },
  europe: { currency: 'EUR', symbol: '€', multiplier: 0.92, paymentMethods: ['Visa', 'Mastercard', 'SEPA', 'Klarna'], savingsLabel: 'Sparen Sie 111€/mo im Vergleich zu 7 Tools' },
  mena: { currency: 'AED', symbol: 'د.إ', multiplier: 3.67, paymentMethods: ['Visa', 'Mastercard', 'Mada', 'Apple Pay'], savingsLabel: 'وفر 444 د.إ/شهر مقارنة بـ 7 أدوات' },
  india: { currency: 'INR', symbol: '₹', multiplier: 83, paymentMethods: ['UPI', 'Visa', 'Mastercard', 'Paytm', 'PhonePe'], savingsLabel: '₹10,000/माह बचाएं — 7 अलग टूल्स की तुलना में' },
  africa: { currency: 'USD', symbol: '$', multiplier: 1, paymentMethods: ['Visa', 'Mastercard', 'M-Pesa', 'Flutterwave'], savingsLabel: 'Save $121/mo vs 7 separate tools' },
  apac: { currency: 'JPY', symbol: '¥', multiplier: 150, paymentMethods: ['Visa', 'Mastercard', 'JCB', 'Alipay', 'WeChat Pay'], savingsLabel: '月額¥18,000節約 — 7つのツール比較' },
  sea: { currency: 'USD', symbol: '$', multiplier: 1, paymentMethods: ['Visa', 'Mastercard', 'GrabPay', 'GCash'], savingsLabel: 'Save $121/mo vs 7 separate tools' },
  cjk: { currency: 'JPY', symbol: '¥', multiplier: 150, paymentMethods: ['Visa', 'Mastercard', 'JCB', 'Alipay', 'WeChat Pay'], savingsLabel: '月額¥18,000節約 — 7つのツール比較' },
  latam: { currency: 'USD', symbol: '$', multiplier: 1, paymentMethods: ['Visa', 'Mastercard', 'Pix', 'Mercado Pago'], savingsLabel: 'Ahorra $121/mes vs 7 herramientas separadas' },
   caribbean: { currency: 'USD', symbol: '$', multiplier: 1, paymentMethods: ['Visa', 'Mastercard'], savingsLabel: 'Save $121/mo vs 7 separate tools' },
   oceania: { currency: 'AUD', symbol: '$', multiplier: 1.5, paymentMethods: ['Visa', 'Mastercard', 'PayPal'], savingsLabel: 'Save $180/mo vs 7 separate tools' },
   turkey: { currency: 'TRY', symbol: '₺', multiplier: 32, paymentMethods: ['Visa', 'Mastercard', 'Troy'], savingsLabel: '₺3,872/ay Tasarruf Edin' },
   pakistan: { currency: 'PKR', symbol: 'Rs', multiplier: 278, paymentMethods: ['Visa', 'Mastercard', 'JazzCash', 'Easypaisa'], savingsLabel: 'Rs 33,600/ماه بچائیں' },
   bangladesh: { currency: 'BDT', symbol: '৳', multiplier: 104, paymentMethods: ['Visa', 'Mastercard', 'bKash', 'Nagad'], savingsLabel: '৳12,584/মাস বাঁচান' },
   eastern_europe: { currency: 'USD', symbol: '$', multiplier: 1, paymentMethods: ['Visa', 'Mastercard', 'Wise', 'Local'], savingsLabel: 'Save $121/mo vs 7 separate tools' },
   central_asia: { currency: 'USD', symbol: '$', multiplier: 1, paymentMethods: ['Visa', 'Mastercard', 'Wise'], savingsLabel: 'Save $121/mo vs 7 separate tools' },
   south_asia: { currency: 'USD', symbol: '$', multiplier: 1, paymentMethods: ['Visa', 'Mastercard'], savingsLabel: 'Save $121/mo vs 7 separate tools' },
};

const BASE_TIERS = [
  { name: 'Free', basePrice: 0, pipelines: 41, languages: 10, credits: 50, features: ['720p', '5 exports/mo', 'Watermark'] },
  { name: 'Creator', basePrice: 29, pipelines: 120, languages: 20, credits: 500, features: ['1080p', '30 exports/mo', 'Basic avatar'] },
  { name: 'Professional', basePrice: 59, pipelines: 165, languages: 40, credits: 1200, features: ['4K', '100 exports/mo', 'Voice cloning', 'API'], popular: true },
  { name: 'Studio', basePrice: 99, pipelines: 194, languages: '70+', credits: 2500, features: ['4K', 'Unlimited', '7 Arabic dialects', '22 Indian langs'] },
  { name: 'Enterprise', basePrice: 299, pipelines: 206, languages: '140+', credits: '10K+', features: ['8K', 'White-label', 'SSO/SAML', 'VR/AR Labs'] },
];

interface RegionalPricingSectionProps {
  regionSlug: RegionSlug;
}

const formatPrice = (price: number, symbol: string, currency: string): string => {
  if (price === 0) return `${symbol}0`;
  
  // For high-value currencies, round to nearest whole number
  if (currency === 'JPY' || currency === 'INR') {
    return `${symbol}${Math.round(price).toLocaleString()}`;
  }
  
  // For AED, show one decimal
  if (currency === 'AED') {
    return `${symbol}${Math.round(price)}`;
  }
  
  return `${symbol}${price.toFixed(0)}`;
};

export const RegionalPricingSection: React.FC<RegionalPricingSectionProps> = ({ regionSlug }) => {
  const regional = REGIONAL_PRICING[regionSlug] || REGIONAL_PRICING.nam;

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Prices shown in <span className="text-primary font-semibold">{regional.currency}</span> • Start free, scale as you grow
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-5 gap-4">
          {BASE_TIERS.map((tier, i) => {
            const localPrice = tier.basePrice * regional.multiplier;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 ${
                  tier.popular
                    ? 'bg-gradient-to-b from-primary to-accent text-white scale-105 shadow-xl relative'
                    : 'bg-card border border-border text-foreground shadow-md'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <div className="my-4">
                  <span className="text-3xl font-bold">
                    {formatPrice(localPrice, regional.symbol, regional.currency)}
                  </span>
                  <span className={tier.popular ? 'text-white/80' : 'text-muted-foreground'}>/mo</span>
                </div>
                
                <div className="space-y-1 text-sm mb-4">
                  <p><span className={tier.popular ? 'text-white font-bold' : 'text-primary font-bold'}>{tier.credits}</span> credits</p>
                  <p><span className={tier.popular ? 'text-white font-bold' : 'text-primary font-bold'}>{tier.pipelines}</span> pipelines</p>
                  <p><span className={tier.popular ? 'text-white font-bold' : 'text-primary font-bold'}>{tier.languages}</span> languages</p>
                </div>

                <ul className="space-y-1 mb-4">
                  {tier.features.map((f) => (
                    <li key={f} className={`text-xs flex items-center gap-1 ${tier.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                      <Check className="h-3 w-3 text-green-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                <Link to={`/genie-studio-auth?tier=${tier.name.toLowerCase()}`}>
                  <Button className={`w-full ${
                    tier.popular ? 'bg-white text-primary hover:bg-gray-100' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}>
                    {tier.basePrice === 0 ? 'Start Free' : 'Get Started'}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Regional savings callout */}
        <div className="mt-12 p-6 bg-green-500/10 rounded-2xl border border-green-500/30 text-center">
          <p className="text-green-600 dark:text-green-400 text-lg font-semibold">
            💰 {regional.savingsLabel}
          </p>
        </div>

        {/* Payment methods */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Accepted payment methods</p>
          <div className="flex flex-wrap justify-center gap-2">
            {regional.paymentMethods.map(method => (
              <Badge key={method} variant="outline" className="text-xs">
                {method}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegionalPricingSection;
