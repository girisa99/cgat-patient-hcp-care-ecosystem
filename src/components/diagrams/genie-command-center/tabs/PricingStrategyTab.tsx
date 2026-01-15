/**
 * Genie Command Center - Pricing Strategy Tab
 * Comprehensive P&L calculator with unit economics, breakeven analysis, and smart recommendations
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Calculator, Users, Layers, DollarSign, Check, X, TrendingUp, Zap, Crown, Gift, Building,
  Heart, GraduationCap, Plane, Camera, BookOpen, Smartphone, Target, BarChart3, 
  Plus, Trash2, Coins, Receipt, ArrowUpRight, ArrowDownRight, AlertCircle, 
  Lightbulb, CheckCircle2, Sparkles, TrendingDown, Calendar
} from 'lucide-react';
import {
  segmentPricingProfiles,
  pricingModels,
  pricingPermutations,
  pricingRecommendations,
  segmentBundles,
} from '../data/pricing-options-data';
import {
  aiModelCosts as defaultAIModels,
  ttsCosts as defaultTTSCosts,
  acquisitionChannels,
  tierAllocations,
  monthlyFixedCosts as defaultFixedCosts,
  type AIModelCost,
  type TTSCost,
  type MonthlyEconomics,
} from '../data/infrastructure-costs';

// ==================== TYPES ====================
interface Recommendation {
  priority: 1 | 2 | 3 | 4;
  category: string;
  title: string;
  issue: string;
  actions: string[];
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  positive?: boolean;
}

interface TierAnalysis {
  tier: string;
  subscribers: number;
  price: number;
  aiCostPerUser: number;
  ttsCostPerUser: number;
  storageCostPerUser: number;
  variableCostPerUser: number;
  contribution: number;
  marginPercent: number;
  totalRevenue: number;
  totalVariableCost: number;
  totalContribution: number;
  videosPerMonth: number;
  scriptsPerMonth: number;
  ttsMinutesPerMonth: number;
}

// ==================== COMPREHENSIVE P&L CALCULATOR ====================
const ComprehensivePLCalculator: React.FC = () => {
  // AI/LLM Providers with usage percentages
  const [aiProviders, setAiProviders] = useState([
    { id: 1, name: 'Gemini 2.0 Flash', provider: 'Google', inputPer1M: 0.075, outputPer1M: 0.30, enabled: true, usagePercent: 50 },
    { id: 2, name: 'Gemini 2.5 Pro', provider: 'Google', inputPer1M: 1.25, outputPer1M: 5.00, enabled: true, usagePercent: 20 },
    { id: 3, name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPer1M: 3.00, outputPer1M: 15.00, enabled: true, usagePercent: 20 },
    { id: 4, name: 'GPT-4o Mini', provider: 'OpenAI', inputPer1M: 0.15, outputPer1M: 0.60, enabled: true, usagePercent: 10 },
    { id: 5, name: 'Claude 3 Haiku', provider: 'Anthropic', inputPer1M: 0.25, outputPer1M: 1.25, enabled: false, usagePercent: 0 },
  ]);

  // TTS Providers
  const [ttsProviders, setTtsProviders] = useState([
    { id: 1, name: 'ElevenLabs Pro', costPerMinute: 0.18, enabled: true, usagePercent: 70 },
    { id: 2, name: 'OpenAI TTS', costPerMinute: 0.015, enabled: true, usagePercent: 25 },
    { id: 3, name: 'Google Cloud TTS', costPerMinute: 0.016, enabled: true, usagePercent: 5 },
  ]);

  // Pricing tiers with detailed usage
  const [pricingTiers, setPricingTiers] = useState([
    { id: 1, name: 'Free', price: 0, customers: 5000, inputTokens: 50000, outputTokens: 25000, ttsMinutes: 1, storageGB: 1, videosPerMonth: 3 },
    { id: 2, name: 'Starter', price: 9.99, customers: 500, inputTokens: 200000, outputTokens: 100000, ttsMinutes: 10, storageGB: 5, videosPerMonth: 15 },
    { id: 3, name: 'Creator', price: 19.99, customers: 200, inputTokens: 500000, outputTokens: 250000, ttsMinutes: 30, storageGB: 25, videosPerMonth: 50 },
    { id: 4, name: 'Business', price: 49.99, customers: 50, inputTokens: 1500000, outputTokens: 750000, ttsMinutes: 100, storageGB: 100, videosPerMonth: 150 },
    { id: 5, name: 'Pro', price: 99.99, customers: 20, inputTokens: 5000000, outputTokens: 2500000, ttsMinutes: 300, storageGB: 500, videosPerMonth: 500 },
    { id: 6, name: 'Healthcare', price: 199.99, customers: 10, inputTokens: 10000000, outputTokens: 5000000, ttsMinutes: 600, storageGB: 1000, videosPerMonth: 1000 },
  ]);

  // Fixed costs
  const [fixedCosts, setFixedCosts] = useState([
    { id: 1, name: 'Supabase Pro', amount: 25, category: 'infrastructure' },
    { id: 2, name: 'Vercel Pro', amount: 20, category: 'infrastructure' },
    { id: 3, name: 'Resend Pro', amount: 20, category: 'infrastructure' },
    { id: 4, name: 'Analytics (PostHog)', amount: 0, category: 'infrastructure' },
    { id: 5, name: 'Monitoring (Sentry)', amount: 26, category: 'infrastructure' },
    { id: 6, name: 'CDN/Bandwidth', amount: 50, category: 'infrastructure' },
    { id: 7, name: 'Storage Overage', amount: 100, category: 'infrastructure' },
    { id: 8, name: 'Domain/SSL', amount: 15, category: 'overhead' },
  ]);

  // Customer Acquisition
  const [acquisition, setAcquisition] = useState({
    paidAdsSpend: 2000,
    contentSpend: 1500,
    affiliateSpend: 500,
    seoSpend: 500,
    newCustomersPerMonth: 50,
    churnRatePercent: 5,
    avgLifetimeMonths: 18,
    expansionRevenuePercent: 12,
  });

  // Storage cost per GB
  const storageCostPerGB = 0.023;

  // ==================== CALCULATIONS ====================
  const calculations = useMemo(() => {
    const totalCustomers = pricingTiers.reduce((sum, t) => sum + t.customers, 0);
    const paidTiers = pricingTiers.filter(t => t.price > 0);
    const totalPaidCustomers = paidTiers.reduce((sum, t) => sum + t.customers, 0);
    const totalMRR = pricingTiers.reduce((sum, t) => sum + (t.price * t.customers), 0);
    const totalARR = totalMRR * 12;

    // Calculate blended AI cost per 1M tokens
    const enabledAI = aiProviders.filter(p => p.enabled);
    const totalAIPercent = enabledAI.reduce((sum, p) => sum + p.usagePercent, 0) || 100;
    
    const blendedInputCost = enabledAI.reduce((sum, ai) => 
      sum + (ai.inputPer1M * (ai.usagePercent / totalAIPercent)), 0);
    const blendedOutputCost = enabledAI.reduce((sum, ai) => 
      sum + (ai.outputPer1M * (ai.usagePercent / totalAIPercent)), 0);

    // Calculate blended TTS cost per minute
    const enabledTTS = ttsProviders.filter(p => p.enabled);
    const totalTTSPercent = enabledTTS.reduce((sum, p) => sum + p.usagePercent, 0) || 100;
    const blendedTTSCost = enabledTTS.reduce((sum, tts) => 
      sum + (tts.costPerMinute * (tts.usagePercent / totalTTSPercent)), 0);

    // Tier analysis with full cost breakdown
    const tierAnalysis: TierAnalysis[] = pricingTiers.map(tier => {
      const aiCost = (tier.inputTokens / 1000000 * blendedInputCost) + (tier.outputTokens / 1000000 * blendedOutputCost);
      const ttsCost = tier.ttsMinutes * blendedTTSCost;
      const storageCost = tier.storageGB * storageCostPerGB;
      const variableCost = aiCost + ttsCost + storageCost;
      const contribution = tier.price - variableCost;
      const marginPercent = tier.price > 0 ? (contribution / tier.price) * 100 : (variableCost > 0 ? -100 : 0);

      return {
        tier: tier.name,
        subscribers: tier.customers,
        price: tier.price,
        aiCostPerUser: aiCost,
        ttsCostPerUser: ttsCost,
        storageCostPerUser: storageCost,
        variableCostPerUser: variableCost,
        contribution,
        marginPercent,
        totalRevenue: tier.price * tier.customers,
        totalVariableCost: variableCost * tier.customers,
        totalContribution: contribution * tier.customers,
        videosPerMonth: tier.videosPerMonth,
        scriptsPerMonth: Math.round(tier.videosPerMonth * 1.5),
        ttsMinutesPerMonth: tier.ttsMinutes,
      };
    });

    // Totals
    const totalVariableCosts = tierAnalysis.reduce((sum, t) => sum + t.totalVariableCost, 0);
    const totalFixedCosts = fixedCosts.reduce((sum, c) => sum + c.amount, 0);
    const totalMarketingSpend = acquisition.paidAdsSpend + acquisition.contentSpend + acquisition.affiliateSpend + acquisition.seoSpend;
    const totalCosts = totalVariableCosts + totalFixedCosts + totalMarketingSpend;

    const grossProfit = totalMRR - totalVariableCosts;
    const netProfit = totalMRR - totalCosts;
    const grossMargin = totalMRR > 0 ? (grossProfit / totalMRR) * 100 : 0;
    const netMargin = totalMRR > 0 ? (netProfit / totalMRR) * 100 : 0;

    // Unit Economics
    const arpu = totalPaidCustomers > 0 ? totalMRR / totalPaidCustomers : 0;
    const cac = acquisition.newCustomersPerMonth > 0 ? totalMarketingSpend / acquisition.newCustomersPerMonth : 0;
    const ltv = arpu * acquisition.avgLifetimeMonths * (grossMargin / 100) * (1 + acquisition.expansionRevenuePercent / 100);
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    // Break-even Analysis
    const avgVariableCostPerCustomer = totalPaidCustomers > 0 
      ? tierAnalysis.filter(t => t.price > 0).reduce((sum, t) => sum + t.variableCostPerUser * t.subscribers, 0) / totalPaidCustomers 
      : 0;
    const contributionMargin = arpu - avgVariableCostPerCustomer;
    const breakEvenCustomers = contributionMargin > 0 
      ? Math.ceil((totalFixedCosts + totalMarketingSpend) / contributionMargin) 
      : Infinity;

    // Months to profitability
    const monthlyChurn = totalPaidCustomers * (acquisition.churnRatePercent / 100);
    const netCustomerGrowth = acquisition.newCustomersPerMonth - monthlyChurn;
    const monthsToBreakeven = breakEvenCustomers > totalPaidCustomers && netCustomerGrowth > 0
      ? Math.ceil((breakEvenCustomers - totalPaidCustomers) / netCustomerGrowth)
      : breakEvenCustomers <= totalPaidCustomers ? 0 : Infinity;

    // Payback period (months to recover CAC)
    const paybackPeriod = contributionMargin > 0 ? cac / contributionMargin : Infinity;

    // Total AI costs
    const totalAICosts = tierAnalysis.reduce((sum, t) => sum + (t.aiCostPerUser * t.subscribers), 0);
    const aiCostPercent = totalMRR > 0 ? (totalAICosts / totalMRR) * 100 : 0;

    // Total TTS costs
    const totalTTSCosts = tierAnalysis.reduce((sum, t) => sum + (t.ttsCostPerUser * t.subscribers), 0);

    // Production capacity
    const totalVideosProduced = tierAnalysis.reduce((sum, t) => sum + (t.videosPerMonth * t.subscribers), 0);
    const totalScriptsProduced = tierAnalysis.reduce((sum, t) => sum + (t.scriptsPerMonth * t.subscribers), 0);
    const totalTTSMinutes = tierAnalysis.reduce((sum, t) => sum + (t.ttsMinutesPerMonth * t.subscribers), 0);

    // Profitability projection (12 months)
    const monthlyProjection = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const projectedCustomers = totalPaidCustomers + (netCustomerGrowth * month);
      const projectedMRR = projectedCustomers * arpu;
      const projectedVariableCosts = projectedCustomers * avgVariableCostPerCustomer;
      const projectedNetProfit = projectedMRR - projectedVariableCosts - totalFixedCosts - totalMarketingSpend;
      return {
        month,
        customers: Math.round(projectedCustomers),
        mrr: projectedMRR,
        netProfit: projectedNetProfit,
        isProfitable: projectedNetProfit >= 0,
      };
    });

    const firstProfitableMonth = monthlyProjection.find(m => m.isProfitable)?.month || null;

    return {
      totalCustomers,
      totalPaidCustomers,
      totalMRR,
      totalARR,
      totalVariableCosts,
      totalFixedCosts,
      totalMarketingSpend,
      totalCosts,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      arpu,
      cac,
      ltv,
      ltvCacRatio,
      breakEvenCustomers,
      monthsToBreakeven,
      paybackPeriod,
      contributionMargin,
      monthlyChurn,
      netCustomerGrowth,
      tierAnalysis,
      totalAICosts,
      aiCostPercent,
      totalTTSCosts,
      blendedInputCost,
      blendedOutputCost,
      blendedTTSCost,
      totalVideosProduced,
      totalScriptsProduced,
      totalTTSMinutes,
      monthlyProjection,
      firstProfitableMonth,
    };
  }, [pricingTiers, aiProviders, ttsProviders, fixedCosts, acquisition]);

  // ==================== SMART RECOMMENDATIONS ====================
  const recommendations = useMemo((): Recommendation[] => {
    const recs: Recommendation[] = [];

    // LTV:CAC Analysis
    if (calculations.ltvCacRatio < 1) {
      recs.push({
        priority: 1,
        category: 'Unit Economics',
        title: 'Critical: Unsustainable Customer Acquisition',
        issue: `LTV:CAC is ${calculations.ltvCacRatio.toFixed(2)}x - spending more to acquire customers than they generate.`,
        actions: [
          `Reduce CAC from $${calculations.cac.toFixed(0)} to under $${(calculations.ltv / 3).toFixed(0)}`,
          'Shift budget to organic/content marketing',
          'Implement referral program',
          'Increase prices by 20-30%',
        ],
        impact: 'Critical',
      });
    } else if (calculations.ltvCacRatio < 3) {
      recs.push({
        priority: 2,
        category: 'Unit Economics',
        title: 'Improve LTV:CAC Ratio',
        issue: `LTV:CAC of ${calculations.ltvCacRatio.toFixed(2)}x is below 3x benchmark.`,
        actions: [
          'Reduce churn to extend customer lifetime',
          'Add expansion revenue (upsells, add-ons)',
          'Optimize paid ad spend',
        ],
        impact: 'High',
      });
    }

    // Gross Margin Analysis
    if (calculations.grossMargin < 50) {
      recs.push({
        priority: 1,
        category: 'Profitability',
        title: 'Critical: Low Gross Margin',
        issue: `Gross margin of ${calculations.grossMargin.toFixed(1)}% is below 70% SaaS benchmark.`,
        actions: [
          `AI costs are ${calculations.aiCostPercent.toFixed(1)}% of revenue - use cheaper models`,
          'Route simple tasks to Haiku/GPT-4o-mini',
          'Implement token caching',
          `Raise prices - ARPU of $${calculations.arpu.toFixed(0)} may be too low`,
        ],
        impact: 'Critical',
      });
    } else if (calculations.grossMargin < 70) {
      recs.push({
        priority: 2,
        category: 'Profitability',
        title: 'Optimize Gross Margin',
        issue: `Gross margin of ${calculations.grossMargin.toFixed(1)}% is below 70% target.`,
        actions: [
          'Use smaller models for 80% of requests',
          'Negotiate volume discounts',
          'Implement usage limits on lower tiers',
        ],
        impact: 'High',
      });
    }

    // AI Cost Optimization
    if (calculations.aiCostPercent > 20) {
      recs.push({
        priority: 2,
        category: 'AI Costs',
        title: 'Reduce AI Token Costs',
        issue: `AI costs are ${calculations.aiCostPercent.toFixed(1)}% of revenue - target under 15%.`,
        actions: [
          'Implement intelligent model routing',
          'Add prompt caching (saves 30-50%)',
          'Set token limits per tier',
          'Fine-tune smaller models for specific tasks',
        ],
        impact: 'High',
      });
    }

    // Unprofitable Tiers
    const unprofitableTiers = calculations.tierAnalysis.filter(t => t.marginPercent < 0 && t.subscribers > 0);
    unprofitableTiers.forEach(tier => {
      const minPrice = Math.ceil(tier.variableCostPerUser * 1.4);
      recs.push({
        priority: 1,
        category: 'Pricing',
        title: `Fix Unprofitable: ${tier.tier}`,
        issue: `${tier.tier} loses $${Math.abs(tier.contribution).toFixed(2)}/user (${tier.marginPercent.toFixed(0)}% margin).`,
        actions: [
          `Increase price to at least $${minPrice}`,
          `Reduce AI allocation - currently $${tier.aiCostPerUser.toFixed(2)}/user`,
          'Limit tokens/storage on this tier',
        ],
        impact: 'Critical',
      });
    });

    // Churn Analysis
    if (acquisition.churnRatePercent > 5) {
      const churnCost = calculations.monthlyChurn * calculations.arpu;
      recs.push({
        priority: 2,
        category: 'Retention',
        title: 'Reduce Customer Churn',
        issue: `${acquisition.churnRatePercent}% monthly churn = $${churnCost.toFixed(0)}/mo lost revenue.`,
        actions: [
          'Implement proactive churn prediction',
          'Add onboarding sequences',
          'Create switching costs (integrations)',
          `1% reduction saves $${(churnCost / acquisition.churnRatePercent).toFixed(0)}/mo`,
        ],
        impact: 'High',
      });
    }

    // Payback Period
    if (calculations.paybackPeriod > 12) {
      recs.push({
        priority: 2,
        category: 'Cash Flow',
        title: 'Improve CAC Payback',
        issue: `${calculations.paybackPeriod.toFixed(1)} month payback is too long (target <12).`,
        actions: [
          'Offer annual plans with discount',
          'Reduce CAC through organic channels',
          'Add usage-based upsells early',
        ],
        impact: 'High',
      });
    }

    // Positive case
    if (calculations.netMargin >= 20 && calculations.ltvCacRatio >= 3 && calculations.grossMargin >= 70) {
      recs.push({
        priority: 4,
        category: 'Growth',
        title: '✓ Healthy Economics - Scale Up!',
        issue: 'Unit economics are healthy. Time to accelerate growth.',
        actions: [
          'Increase marketing spend - LTV:CAC supports it',
          'Expand to new markets',
          'Invest in product development',
          'Consider raising prices for more margin',
        ],
        impact: 'Medium',
        positive: true,
      });
    }

    return recs.sort((a, b) => a.priority - b.priority);
  }, [calculations, acquisition]);

  // Helper: format currency
  const fmt = (n: number, decimals = 0) => `$${n.toLocaleString(undefined, { maximumFractionDigits: decimals })}`;

  return (
    <div className="space-y-6">
      {/* Top Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className={calculations.netProfit >= 0 ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Net Profit/Loss</span>
              {calculations.netProfit >= 0 ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
            </div>
            <p className={`text-xl font-bold ${calculations.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{fmt(calculations.netProfit)}</p>
            <p className="text-xs text-muted-foreground">{calculations.netMargin.toFixed(1)}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Monthly Revenue</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl font-bold">{fmt(calculations.totalMRR)}</p>
            <p className="text-xs text-muted-foreground">ARR: {fmt(calculations.totalARR)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">LTV:CAC</span>
              <Target className="w-4 h-4 text-purple-500" />
            </div>
            <p className={`text-xl font-bold ${calculations.ltvCacRatio >= 3 ? 'text-green-500' : calculations.ltvCacRatio >= 1 ? 'text-amber-500' : 'text-red-500'}`}>
              {calculations.ltvCacRatio.toFixed(1)}x
            </p>
            <p className="text-xs text-muted-foreground">{calculations.ltvCacRatio >= 3 ? 'Healthy' : 'Needs work'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">CAC Payback</span>
              <Calendar className="w-4 h-4 text-cyan-500" />
            </div>
            <p className="text-xl font-bold">{calculations.paybackPeriod === Infinity ? '∞' : calculations.paybackPeriod.toFixed(1)} mo</p>
            <p className="text-xs text-muted-foreground">CAC: {fmt(calculations.cac)}</p>
          </CardContent>
        </Card>

        <Card className={calculations.monthsToBreakeven === 0 ? 'border-green-500/50 bg-green-500/5' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Break-even</span>
              <BarChart3 className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xl font-bold">{calculations.breakEvenCustomers === Infinity ? '∞' : calculations.breakEvenCustomers}</p>
            <p className="text-xs text-muted-foreground">
              {calculations.monthsToBreakeven === 0 ? '✓ Profitable now!' : 
               calculations.monthsToBreakeven === Infinity ? 'Not achievable' : 
               `${calculations.monthsToBreakeven} months away`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Gross Margin</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <p className={`text-xl font-bold ${calculations.grossMargin >= 70 ? 'text-green-500' : calculations.grossMargin >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
              {calculations.grossMargin.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Target: 70%+</p>
          </CardContent>
        </Card>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Inputs */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Pricing & Cost Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="h-[500px] overflow-y-auto space-y-4 pr-1">
              {/* Pricing Tiers */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">PRICING TIERS</h4>
                <div className="space-y-2">
                  {pricingTiers.map(tier => (
                    <div key={tier.id} className="p-2 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{tier.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={tier.price}
                            onChange={e => setPricingTiers(prev => prev.map(t => t.id === tier.id ? { ...t, price: parseFloat(e.target.value) || 0 } : t))}
                            className="h-6 w-16 text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px]">Customers</Label>
                          <Input
                            type="number"
                            value={tier.customers}
                            onChange={e => setPricingTiers(prev => prev.map(t => t.id === tier.id ? { ...t, customers: parseInt(e.target.value) || 0 } : t))}
                            className="h-6 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]">Input Tokens</Label>
                          <Input
                            type="number"
                            value={tier.inputTokens}
                            onChange={e => setPricingTiers(prev => prev.map(t => t.id === tier.id ? { ...t, inputTokens: parseInt(e.target.value) || 0 } : t))}
                            className="h-6 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]">TTS Minutes</Label>
                          <Input
                            type="number"
                            value={tier.ttsMinutes}
                            onChange={e => setPricingTiers(prev => prev.map(t => t.id === tier.id ? { ...t, ttsMinutes: parseInt(e.target.value) || 0 } : t))}
                            className="h-6 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]">Videos/mo</Label>
                          <Input
                            type="number"
                            value={tier.videosPerMonth}
                            onChange={e => setPricingTiers(prev => prev.map(t => t.id === tier.id ? { ...t, videosPerMonth: parseInt(e.target.value) || 0 } : t))}
                            className="h-6 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* AI Providers */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">AI MODELS (% usage routing)</h4>
                <div className="space-y-2">
                  {aiProviders.map(ai => (
                    <div key={ai.id} className={`flex items-center gap-2 p-2 rounded-lg ${ai.enabled ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30 opacity-60'}`}>
                      <Switch
                        checked={ai.enabled}
                        onCheckedChange={checked => setAiProviders(prev => prev.map(a => a.id === ai.id ? { ...a, enabled: checked, usagePercent: checked ? a.usagePercent || 10 : 0 } : a))}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{ai.name}</p>
                        <p className="text-[10px] text-muted-foreground">${ai.inputPer1M}/${ai.outputPer1M}/1M</p>
                      </div>
                      {ai.enabled && (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={ai.usagePercent}
                            onChange={e => setAiProviders(prev => prev.map(a => a.id === ai.id ? { ...a, usagePercent: parseInt(e.target.value) || 0 } : a))}
                            className="h-6 w-12 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                  <span className="text-muted-foreground">Blended: </span>
                  <span className="font-medium">${calculations.blendedInputCost.toFixed(3)}/${calculations.blendedOutputCost.toFixed(3)}/1M</span>
                </div>
              </div>

              <Separator />

              {/* Acquisition */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">CUSTOMER ACQUISITION</h4>
                <div className="space-y-2">
                  {[
                    { key: 'paidAdsSpend', label: 'Paid Ads' },
                    { key: 'contentSpend', label: 'Content/SEO' },
                    { key: 'affiliateSpend', label: 'Affiliates' },
                    { key: 'seoSpend', label: 'Organic/SEO' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Label className="text-xs w-20">{label}</Label>
                      <div className="flex-1 flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={acquisition[key as keyof typeof acquisition]}
                          onChange={e => setAcquisition(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                          className="h-6 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1 border-t">
                    <Label className="text-xs w-20 font-medium">Total Spend</Label>
                    <span className="font-bold text-sm">{fmt(calculations.totalMarketingSpend)}/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-20">New/mo</Label>
                    <Input
                      type="number"
                      value={acquisition.newCustomersPerMonth}
                      onChange={e => setAcquisition(prev => ({ ...prev, newCustomersPerMonth: parseInt(e.target.value) || 0 }))}
                      className="h-6 text-xs flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-20">Churn %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={acquisition.churnRatePercent}
                      onChange={e => setAcquisition(prev => ({ ...prev, churnRatePercent: parseFloat(e.target.value) || 0 }))}
                      className="h-6 text-xs flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Middle: Tier Analysis + Breakeven */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Unit Economics by Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="h-[500px] overflow-y-auto space-y-3 pr-1">
              {calculations.tierAnalysis.map(tier => (
                <div key={tier.tier} className={`p-3 rounded-lg border ${
                  tier.marginPercent >= 40 ? 'border-green-500/30 bg-green-500/5' :
                  tier.marginPercent >= 0 ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-red-500/30 bg-red-500/5'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{tier.tier}</span>
                      <span className="text-xs text-muted-foreground ml-2">({tier.subscribers})</span>
                    </div>
                    <Badge variant={tier.marginPercent >= 40 ? 'default' : tier.marginPercent >= 0 ? 'secondary' : 'destructive'}>
                      {tier.marginPercent.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span>{fmt(tier.price, 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Variable:</span>
                      <span>{fmt(tier.variableCostPerUser, 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AI Cost:</span>
                      <span>{fmt(tier.aiCostPerUser, 3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TTS Cost:</span>
                      <span>{fmt(tier.ttsCostPerUser, 2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">{tier.subscribers} users →</span>
                    <span className={tier.totalContribution >= 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                      {fmt(tier.totalContribution)}/mo
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] text-center">
                    <div className="bg-background/50 rounded p-1">
                      <p className="font-bold">{tier.videosPerMonth}</p>
                      <p className="text-muted-foreground">videos</p>
                    </div>
                    <div className="bg-background/50 rounded p-1">
                      <p className="font-bold">{tier.scriptsPerMonth}</p>
                      <p className="text-muted-foreground">scripts</p>
                    </div>
                    <div className="bg-background/50 rounded p-1">
                      <p className="font-bold">{tier.ttsMinutesPerMonth}</p>
                      <p className="text-muted-foreground">TTS min</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Profitability Timeline */}
              <div className="p-3 rounded-lg border-2 border-primary/30 bg-primary/5">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Profitability Timeline (12 Months)
                </h4>
                <div className="space-y-1">
                  {calculations.monthlyProjection.filter((_, i) => i % 3 === 0).map(m => (
                    <div key={m.month} className="flex items-center justify-between text-xs">
                      <span>Month {m.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{m.customers} users</span>
                        <span className={m.isProfitable ? 'text-green-500' : 'text-red-500'}>
                          {fmt(m.netProfit)}
                        </span>
                        {m.isProfitable && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>
                  ))}
                </div>
                {calculations.firstProfitableMonth && (
                  <p className="text-xs text-green-500 font-medium mt-2 pt-2 border-t">
                    ✓ Profitable from Month {calculations.firstProfitableMonth}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Recommendations */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              Smart Recommendations
              <Badge variant="outline" className="ml-auto">{recommendations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="h-[500px] overflow-y-auto space-y-3 pr-1">
              {recommendations.map((rec, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${
                  rec.positive ? 'border-green-500/30 bg-green-500/5' :
                  rec.priority === 1 ? 'border-red-500/30 bg-red-500/5' :
                  rec.priority === 2 ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-blue-500/30 bg-blue-500/5'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded ${
                      rec.positive ? 'bg-green-500/20' :
                      rec.priority === 1 ? 'bg-red-500/20' :
                      rec.priority === 2 ? 'bg-amber-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {rec.positive ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                       rec.priority === 1 ? <AlertCircle className="w-4 h-4 text-red-500" /> :
                       rec.priority === 2 ? <TrendingUp className="w-4 h-4 text-amber-500" /> :
                       <Lightbulb className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] h-4">{rec.category}</Badge>
                        <span className={`text-[10px] ${
                          rec.impact === 'Critical' ? 'text-red-500' :
                          rec.impact === 'High' ? 'text-amber-500' :
                          'text-muted-foreground'
                        }`}>{rec.impact} Impact</span>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{rec.issue}</p>
                      <div className="space-y-1">
                        {rec.actions.slice(0, 3).map((action, i) => (
                          <div key={i} className="flex items-start gap-1 text-xs">
                            <Sparkles className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {recommendations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">All metrics look healthy!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Capacity & Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Total Production Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{calculations.totalVideosProduced.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Videos/mo</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{calculations.totalScriptsProduced.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Scripts/mo</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{calculations.totalTTSMinutes.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">TTS min/mo</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{fmt(calculations.totalVariableCosts / Math.max(calculations.totalVideosProduced, 1), 2)}</p>
                <p className="text-xs text-muted-foreground">Cost/Video</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Monthly Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Variable Costs (AI/TTS)</span>
                <span>{fmt(calculations.totalVariableCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fixed Infrastructure</span>
                <span>{fmt(calculations.totalFixedCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marketing/CAC</span>
                <span>{fmt(calculations.totalMarketingSpend)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Costs</span>
                <span className="text-destructive">{fmt(calculations.totalCosts)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Net Profit</span>
                <span className={calculations.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {fmt(calculations.netProfit)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ==================== SEGMENT CARDS ====================
const SegmentProfileCard: React.FC<{ segment: typeof segmentPricingProfiles[0] }> = ({ segment }) => {
  const bundle = segmentBundles.find(b => b.segment === segment.id);
  const segmentIcons: Record<string, React.ReactNode> = {
    creator: <Camera className="w-5 h-5" />,
    influencer: <Users className="w-5 h-5" />,
    knowledge: <BookOpen className="w-5 h-5" />,
    traveler: <Plane className="w-5 h-5" />,
    smb: <Building className="w-5 h-5" />,
    education: <GraduationCap className="w-5 h-5" />,
    healthcare: <Heart className="w-5 h-5" />,
    enterprise: <Crown className="w-5 h-5" />,
  };
  
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {segmentIcons[segment.id] || <Users className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {segment.name}
              <Badge variant={segment.priority === 'P0' ? 'default' : segment.priority === 'P1' ? 'secondary' : 'outline'}>
                {segment.priority}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">{segment.marketSize}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50 italic text-sm">
          "{segment.voiceOfCustomer}"
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Current Spend</p>
            <p className="font-medium">{segment.currentSpend}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Price Threshold</p>
            <p className="font-medium">{segment.priceThreshold}</p>
          </div>
        </div>

        {bundle && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{bundle.bundleName}</span>
              <Badge variant="default" className="bg-green-600">{bundle.price}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{bundle.valueProposition}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ==================== MOBILE PRICING ====================
const MobileAppPricingSection: React.FC = () => (
  <Card className="border-2 border-primary/30">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Smartphone className="w-5 h-5 text-primary" />
        Mobile App Pricing Strategy
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold">Free</h4>
          </div>
          <p className="text-2xl font-bold mb-4">$0</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />3 videos/month</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />720p export</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />5 TTS voices</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 relative">
          <Badge className="absolute -top-2 right-4">Popular</Badge>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Mobile Pro</h4>
          </div>
          <p className="text-2xl font-bold text-primary mb-4">$4.99<span className="text-sm text-muted-foreground">/mo</span></p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />Unlimited videos</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />4K export</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />All TTS voices</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl border bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <h4 className="font-semibold">Desktop + Mobile</h4>
          </div>
          <p className="text-2xl font-bold mb-1">$12.99<span className="text-sm text-muted-foreground">/mo</span></p>
          <Badge variant="secondary" className="mb-4">Save $2/mo</Badge>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />Full desktop access</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />Full mobile access</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />Cross-device sync</li>
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ==================== MAIN TAB COMPONENT ====================
export const PricingStrategyTab: React.FC = () => {
  const [subTab, setSubTab] = useState('calculator');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Pricing Strategy & Unit Economics
          </h2>
          <p className="text-sm text-muted-foreground">
            P&L Calculator • Breakeven Analysis • Smart Recommendations
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-shrink-0 p-1 bg-muted rounded-lg w-fit">
        {[
          { id: 'calculator', label: 'Calculator', icon: Calculator },
          { id: 'segments', label: 'Segments', icon: Users },
          { id: 'models', label: 'Models', icon: Layers },
          { id: 'mobile', label: 'Mobile', icon: Smartphone },
          { id: 'comparison', label: 'Compare', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              subTab === id 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {subTab === 'calculator' && <ComprehensivePLCalculator />}
        
        {subTab === 'segments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {segmentPricingProfiles.map((segment) => (
              <SegmentProfileCard key={segment.id} segment={segment} />
            ))}
          </div>
        )}
        
        {subTab === 'models' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingModels.map((model) => (
              <Card key={model.id} className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge variant={model.complexity === 'Low' ? 'secondary' : model.complexity === 'Medium' ? 'outline' : 'destructive'}>
                      {model.complexity}
                    </Badge>
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-2 rounded bg-muted/50 font-mono text-sm">{model.example}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-2">Pros</p>
                      <ul className="space-y-1">
                        {model.pros.slice(0, 3).map((pro, idx) => (
                          <li key={idx} className="text-xs flex items-start gap-1">
                            <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-600 mb-2">Cons</p>
                      <ul className="space-y-1">
                        {model.cons.slice(0, 3).map((con, idx) => (
                          <li key={idx} className="text-xs flex items-start gap-1">
                            <X className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {subTab === 'mobile' && <MobileAppPricingSection />}
        
        {subTab === 'comparison' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricingRecommendations.map((rec) => (
                    <div key={rec.priority} className={`p-4 rounded-lg border ${rec.priority === 1 ? 'border-primary bg-primary/5' : 'bg-muted/30'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={rec.priority === 1 ? 'default' : 'secondary'}>#{rec.priority}</Badge>
                          <h4 className="font-semibold">{rec.option}</h4>
                        </div>
                        <Badge variant="outline">{rec.implementationComplexity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Pricing Permutations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pricingPermutations.map((perm) => (
                    <div key={perm.id} className={`p-4 rounded-lg border ${
                      perm.recommendation === 'Strong' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
                      perm.recommendation === 'Medium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' :
                      'border-red-500 bg-red-50 dark:bg-red-950/20'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{perm.name}</h4>
                        <Badge variant={
                          perm.recommendation === 'Strong' ? 'default' :
                          perm.recommendation === 'Medium' ? 'secondary' : 'destructive'
                        }>
                          {perm.recommendation}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{perm.model} • {perm.structure}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{perm.targetSegments.join(', ')}</span>
                        <span className="font-medium">{perm.estimatedConversion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
