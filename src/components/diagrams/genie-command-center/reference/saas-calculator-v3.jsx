import React, { useState, useMemo } from 'react';
import { Plus, Trash2, DollarSign, Users, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Calculator, PieChart, Cpu, Database, Mail, CreditCard, Shield, Code, BarChart3, Target, Zap, Lightbulb, ArrowUp, ArrowDown, TrendingDown, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export default function SaaSPricingCalculator() {
  // Pricing tiers with detailed usage
  const [pricingTiers, setPricingTiers] = useState([
    { id: 1, name: 'Starter', price: 29, customers: 100, inputTokens: 100000, outputTokens: 50000, storageGB: 1, emailsPerMonth: 500, transactions: 10 },
    { id: 2, name: 'Professional', price: 79, customers: 50, inputTokens: 500000, outputTokens: 250000, storageGB: 5, emailsPerMonth: 2000, transactions: 50 },
    { id: 3, name: 'Enterprise', price: 199, customers: 20, inputTokens: 2000000, outputTokens: 1000000, storageGB: 25, emailsPerMonth: 10000, transactions: 200 },
  ]);

  // AI/LLM Provider Costs (per 1M tokens) - fully editable
  const [aiProviders, setAiProviders] = useState([
    { id: 1, name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPer1M: 3.00, outputPer1M: 15.00, enabled: true, usagePercent: 60 },
    { id: 2, name: 'Claude 3 Haiku', provider: 'Anthropic', inputPer1M: 0.25, outputPer1M: 1.25, enabled: true, usagePercent: 20 },
    { id: 3, name: 'GPT-4o', provider: 'OpenAI', inputPer1M: 2.50, outputPer1M: 10.00, enabled: true, usagePercent: 15 },
    { id: 4, name: 'GPT-4o Mini', provider: 'OpenAI', inputPer1M: 0.15, outputPer1M: 0.60, enabled: false, usagePercent: 0 },
    { id: 5, name: 'Gemini 1.5 Pro', provider: 'Google', inputPer1M: 1.25, outputPer1M: 5.00, enabled: true, usagePercent: 5 },
    { id: 6, name: 'Gemini 1.5 Flash', provider: 'Google', inputPer1M: 0.075, outputPer1M: 0.30, enabled: false, usagePercent: 0 },
  ]);

  // Storage Providers
  const [storageProviders, setStorageProviders] = useState([
    { id: 1, name: 'AWS S3', pricePerGB: 0.023, transferPerGB: 0.09, enabled: true },
    { id: 2, name: 'Google Cloud Storage', pricePerGB: 0.020, transferPerGB: 0.12, enabled: false },
    { id: 3, name: 'Azure Blob', pricePerGB: 0.018, transferPerGB: 0.087, enabled: false },
    { id: 4, name: 'Cloudflare R2', pricePerGB: 0.015, transferPerGB: 0.00, enabled: false },
  ]);

  // Email Service Providers
  const [emailProviders, setEmailProviders] = useState([
    { id: 1, name: 'SendGrid', pricePer1000: 0.80, monthlyBase: 19.95, freeEmails: 6000, enabled: true },
    { id: 2, name: 'Mailgun', pricePer1000: 0.80, monthlyBase: 35, freeEmails: 5000, enabled: false },
    { id: 3, name: 'AWS SES', pricePer1000: 0.10, monthlyBase: 0, freeEmails: 62000, enabled: false },
    { id: 4, name: 'Postmark', pricePer1000: 1.25, monthlyBase: 15, freeEmails: 0, enabled: false },
    { id: 5, name: 'Resend', pricePer1000: 1.00, monthlyBase: 20, freeEmails: 3000, enabled: false },
  ]);

  // Payment Processors
  const [paymentProviders, setPaymentProviders] = useState([
    { id: 1, name: 'Stripe', percentFee: 2.9, fixedFee: 0.30, monthlyBase: 0, enabled: true },
    { id: 2, name: 'PayPal', percentFee: 2.99, fixedFee: 0.49, monthlyBase: 0, enabled: false },
    { id: 3, name: 'Paddle', percentFee: 5.0, fixedFee: 0.50, monthlyBase: 0, enabled: false },
    { id: 4, name: 'Lemon Squeezy', percentFee: 5.0, fixedFee: 0.50, monthlyBase: 0, enabled: false },
  ]);

  // Auth Providers
  const [authProviders, setAuthProviders] = useState([
    { id: 1, name: 'Auth0', monthlyBase: 23, freeMAU: 7500, pricePerMAU: 0.07, enabled: true },
    { id: 2, name: 'Clerk', monthlyBase: 25, freeMAU: 10000, pricePerMAU: 0.02, enabled: false },
    { id: 3, name: 'Supabase Auth', monthlyBase: 25, freeMAU: 50000, pricePerMAU: 0.00325, enabled: false },
    { id: 4, name: 'Firebase Auth', monthlyBase: 0, freeMAU: 50000, pricePerMAU: 0.0055, enabled: false },
  ]);

  // Database Providers
  const [dbProviders, setDbProviders] = useState([
    { id: 1, name: 'AWS RDS PostgreSQL', monthlyBase: 50, pricePerGB: 0.115, enabled: true },
    { id: 2, name: 'PlanetScale', monthlyBase: 39, pricePerGB: 2.50, enabled: false },
    { id: 3, name: 'Supabase', monthlyBase: 25, pricePerGB: 0.125, enabled: false },
    { id: 4, name: 'MongoDB Atlas', monthlyBase: 57, pricePerGB: 0.25, enabled: false },
    { id: 5, name: 'Neon', monthlyBase: 19, pricePerGB: 0.00, enabled: false },
  ]);

  // Development Tools
  const [devTools, setDevTools] = useState([
    { id: 1, name: 'Cursor Pro', monthlyBase: 20, seats: 3, enabled: true },
    { id: 2, name: 'GitHub Copilot', monthlyBase: 19, seats: 3, enabled: true },
    { id: 3, name: 'Lovable', monthlyBase: 50, seats: 1, enabled: false },
    { id: 4, name: 'Vercel Pro', monthlyBase: 20, seats: 1, enabled: true },
    { id: 5, name: 'Railway', monthlyBase: 20, seats: 1, enabled: false },
    { id: 6, name: 'Linear', monthlyBase: 8, seats: 3, enabled: true },
  ]);

  // Monitoring & Operations
  const [opsTools, setOpsTools] = useState([
    { id: 1, name: 'Datadog', monthlyBase: 70, enabled: false },
    { id: 2, name: 'Sentry', monthlyBase: 26, enabled: true },
    { id: 3, name: 'LogRocket', monthlyBase: 99, enabled: false },
    { id: 4, name: 'PostHog', monthlyBase: 0, enabled: true },
    { id: 5, name: 'Axiom', monthlyBase: 25, enabled: false },
    { id: 6, name: 'BetterStack', monthlyBase: 24, enabled: true },
  ]);

  // Fixed Team/Overhead Costs
  const [fixedCosts, setFixedCosts] = useState([
    { id: 1, name: 'Engineering Team', amount: 25000, category: 'personnel' },
    { id: 2, name: 'Customer Support', amount: 5000, category: 'personnel' },
    { id: 3, name: 'Marketing & Sales', amount: 8000, category: 'growth' },
    { id: 4, name: 'Office & Admin', amount: 2000, category: 'overhead' },
    { id: 5, name: 'Legal & Compliance', amount: 1500, category: 'overhead' },
    { id: 6, name: 'Insurance', amount: 500, category: 'overhead' },
  ]);

  // Support & Success Costs
  const [supportCosts, setSupportCosts] = useState({
    hourlyRate: 35,
    hoursPerCustomerPerMonth: { Starter: 0.25, Professional: 0.5, Enterprise: 2 },
  });

  // Customer Acquisition - fully editable
  const [acquisition, setAcquisition] = useState({
    monthlyMarketingSpend: 8000,
    paidAdsSpend: 4000,
    contentMarketingSpend: 2000,
    salesTeamSpend: 2000,
    newCustomersPerMonth: 25,
    organicCustomersPercent: 40,
    paidCustomersPercent: 45,
    referralCustomersPercent: 15,
    churnRatePercent: 5,
    avgCustomerLifetimeMonths: 24,
    expansionRevenuePercent: 10,
    conversionRatePercent: 3,
    avgDealCycleWeeks: 2,
  });

  const [expandedSections, setExpandedSections] = useState({
    pricing: true,
    ai: true,
    infrastructure: false,
    payments: false,
    tools: false,
    team: false,
    acquisition: true,
    recommendations: true,
  });

  const [editingAI, setEditingAI] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Main Calculations
  const calculations = useMemo(() => {
    const totalCustomers = pricingTiers.reduce((sum, tier) => sum + tier.customers, 0);
    const totalMRR = pricingTiers.reduce((sum, tier) => sum + (tier.price * tier.customers), 0);
    const totalARR = totalMRR * 12;

    // Calculate AI costs per tier
    const enabledAI = aiProviders.filter(p => p.enabled);
    const totalAIUsagePercent = enabledAI.reduce((sum, p) => sum + p.usagePercent, 0);
    
    const calculateAICostPerTier = (tier) => {
      let cost = 0;
      enabledAI.forEach(ai => {
        const usageRatio = totalAIUsagePercent > 0 ? ai.usagePercent / 100 : 0;
        const inputCost = (tier.inputTokens / 1000000) * ai.inputPer1M * usageRatio;
        const outputCost = (tier.outputTokens / 1000000) * ai.outputPer1M * usageRatio;
        cost += inputCost + outputCost;
      });
      return cost;
    };

    // Calculate total AI costs
    const totalAICosts = pricingTiers.reduce((sum, tier) => {
      return sum + (calculateAICostPerTier(tier) * tier.customers);
    }, 0);

    // Storage costs
    const activeStorage = storageProviders.find(p => p.enabled);
    const calculateStorageCost = (storageGB) => {
      if (!activeStorage) return 0;
      return (storageGB * activeStorage.pricePerGB) + (storageGB * 0.5 * activeStorage.transferPerGB);
    };

    // Email costs
    const activeEmail = emailProviders.find(p => p.enabled);
    const calculateEmailCost = (emailCount) => {
      if (!activeEmail) return 0;
      const billableEmails = Math.max(0, emailCount - (activeEmail.freeEmails / totalCustomers));
      return (billableEmails / 1000) * activeEmail.pricePer1000;
    };
    const emailBaseCost = activeEmail ? activeEmail.monthlyBase : 0;

    // Payment processing
    const activePayment = paymentProviders.find(p => p.enabled);
    const calculatePaymentCost = (price, transactions) => {
      if (!activePayment) return 0;
      const percentCost = price * (activePayment.percentFee / 100);
      const fixedCost = transactions * activePayment.fixedFee;
      return percentCost + fixedCost;
    };

    // Total payment costs
    const totalPaymentCosts = pricingTiers.reduce((sum, tier) => {
      return sum + (calculatePaymentCost(tier.price, tier.transactions) * tier.customers);
    }, 0);

    // Auth costs
    const activeAuth = authProviders.find(p => p.enabled);
    const authBaseCost = activeAuth ? activeAuth.monthlyBase : 0;
    const authPerCustomer = activeAuth && totalCustomers > activeAuth.freeMAU 
      ? activeAuth.pricePerMAU 
      : 0;

    // Database costs
    const activeDB = dbProviders.find(p => p.enabled);
    const dbBaseCost = activeDB ? activeDB.monthlyBase : 0;
    const totalStorageGB = pricingTiers.reduce((sum, t) => sum + (t.storageGB * t.customers), 0);
    const dbStorageCost = activeDB ? totalStorageGB * activeDB.pricePerGB : 0;

    // Dev tools costs
    const devToolsCost = devTools.filter(t => t.enabled).reduce((sum, t) => sum + (t.monthlyBase * t.seats), 0);

    // Ops tools costs
    const opsToolsCost = opsTools.filter(t => t.enabled).reduce((sum, t) => sum + t.monthlyBase, 0);

    // Fixed costs total
    const totalFixedCosts = fixedCosts.reduce((sum, c) => sum + c.amount, 0);

    // Platform/Infrastructure base costs
    const platformBaseCosts = emailBaseCost + authBaseCost + dbBaseCost + devToolsCost + opsToolsCost + dbStorageCost;

    // Support costs total
    const totalSupportCosts = pricingTiers.reduce((sum, tier) => {
      const hours = supportCosts.hoursPerCustomerPerMonth[tier.name] || 0.5;
      return sum + (hours * supportCosts.hourlyRate * tier.customers);
    }, 0);

    // Tier Analysis
    const tierAnalysis = pricingTiers.map(tier => {
      const aiCost = calculateAICostPerTier(tier);
      const storageCost = calculateStorageCost(tier.storageGB);
      const emailCost = calculateEmailCost(tier.emailsPerMonth);
      const paymentCost = calculatePaymentCost(tier.price, tier.transactions);
      const authCost = authPerCustomer;
      const supportHours = supportCosts.hoursPerCustomerPerMonth[tier.name] || 0.5;
      const supportCost = supportHours * supportCosts.hourlyRate;

      const variableCostPerCustomer = aiCost + storageCost + emailCost + paymentCost + authCost + supportCost;
      const totalVariableCosts = variableCostPerCustomer * tier.customers;

      const revenueShare = totalMRR > 0 ? (tier.price * tier.customers) / totalMRR : 0;
      const allocatedFixed = (totalFixedCosts + platformBaseCosts) * revenueShare;
      
      const totalCosts = totalVariableCosts + allocatedFixed;
      const revenue = tier.price * tier.customers;
      const grossProfit = revenue - totalVariableCosts;
      const netProfit = revenue - totalCosts;
      const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      return {
        ...tier,
        costs: {
          ai: aiCost,
          storage: storageCost,
          email: emailCost,
          payment: paymentCost,
          auth: authCost,
          support: supportCost,
        },
        variableCostPerCustomer,
        totalVariableCosts,
        allocatedFixed,
        totalCosts,
        revenue,
        grossProfit,
        netProfit,
        grossMargin,
        netMargin,
        costPerCustomer: tier.customers > 0 ? totalCosts / tier.customers : 0,
        profitPerCustomer: tier.customers > 0 ? netProfit / tier.customers : 0,
      };
    });

    // Totals
    const totalVariableCosts = tierAnalysis.reduce((sum, t) => sum + t.totalVariableCosts, 0);
    const totalCosts = totalFixedCosts + platformBaseCosts + totalVariableCosts;
    const grossProfit = totalMRR - totalVariableCosts;
    const netProfit = totalMRR - totalCosts;
    const grossMargin = totalMRR > 0 ? (grossProfit / totalMRR) * 100 : 0;
    const netMargin = totalMRR > 0 ? (netProfit / totalMRR) * 100 : 0;

    // Unit Economics
    const arpu = totalCustomers > 0 ? totalMRR / totalCustomers : 0;
    const costPerCustomer = totalCustomers > 0 ? totalCosts / totalCustomers : 0;
    const profitPerCustomer = arpu - costPerCustomer;
    
    // CAC & LTV with more detail
    const totalMarketingSpend = acquisition.monthlyMarketingSpend;
    const cac = acquisition.newCustomersPerMonth > 0 
      ? totalMarketingSpend / acquisition.newCustomersPerMonth 
      : 0;
    
    // Blended CAC by channel
    const organicCAC = 0; // Organic is "free"
    const paidCAC = acquisition.paidCustomersPercent > 0 
      ? (acquisition.paidAdsSpend / (acquisition.newCustomersPerMonth * acquisition.paidCustomersPercent / 100))
      : 0;
    const referralCAC = acquisition.referralCustomersPercent > 0
      ? (acquisition.contentMarketingSpend * 0.3 / (acquisition.newCustomersPerMonth * acquisition.referralCustomersPercent / 100))
      : 0;
    
    // LTV with expansion revenue
    const monthlyExpansion = arpu * (acquisition.expansionRevenuePercent / 100);
    const effectiveARPU = arpu + monthlyExpansion;
    const ltv = effectiveARPU * acquisition.avgCustomerLifetimeMonths * (grossMargin / 100);
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    // Break-even
    const avgVariableCostPerCustomer = totalCustomers > 0 ? totalVariableCosts / totalCustomers : 0;
    const contributionMargin = arpu - avgVariableCostPerCustomer;
    const breakEvenCustomers = contributionMargin > 0 
      ? Math.ceil((totalFixedCosts + platformBaseCosts) / contributionMargin)
      : Infinity;

    // Months to profitability
    const monthlyChurn = totalCustomers * acquisition.churnRatePercent / 100;
    const monthlyCustomerGrowth = acquisition.newCustomersPerMonth - monthlyChurn;
    const monthsToBreakeven = breakEvenCustomers > totalCustomers && monthlyCustomerGrowth > 0
      ? Math.ceil((breakEvenCustomers - totalCustomers) / monthlyCustomerGrowth)
      : breakEvenCustomers <= totalCustomers ? 0 : Infinity;

    // Payback period
    const paybackPeriod = cac > 0 && contributionMargin > 0 ? cac / contributionMargin : Infinity;

    // Cost breakdown by category
    const costBreakdown = {
      ai: totalAICosts,
      payment: totalPaymentCosts,
      support: totalSupportCosts,
      infrastructure: platformBaseCosts,
      fixed: totalFixedCosts,
    };

    // Find highest cost driver
    const costDrivers = Object.entries(costBreakdown).sort((a, b) => b[1] - a[1]);

    return {
      totalCustomers,
      totalMRR,
      totalARR,
      totalFixedCosts,
      platformBaseCosts,
      totalVariableCosts,
      totalCosts,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      arpu,
      effectiveARPU,
      costPerCustomer,
      profitPerCustomer,
      cac,
      paidCAC,
      organicCAC,
      referralCAC,
      ltv,
      ltvCacRatio,
      breakEvenCustomers,
      monthsToBreakeven,
      paybackPeriod,
      contributionMargin,
      monthlyChurn,
      monthlyCustomerGrowth,
      tierAnalysis,
      costBreakdown,
      costDrivers,
      totalAICosts,
      totalPaymentCosts,
      totalSupportCosts,
    };
  }, [pricingTiers, aiProviders, storageProviders, emailProviders, paymentProviders, authProviders, dbProviders, devTools, opsTools, fixedCosts, supportCosts, acquisition]);

  // Smart Recommendations Engine
  const recommendations = useMemo(() => {
    const recs = [];
    const { tierAnalysis, grossMargin, netMargin, ltvCacRatio, paybackPeriod, cac, costDrivers, totalAICosts, totalMRR, arpu, churnRatePercent } = calculations;

    // Priority score: 1 = Critical, 2 = High, 3 = Medium, 4 = Low
    
    // 1. LTV:CAC Analysis
    if (ltvCacRatio < 1) {
      recs.push({
        priority: 1,
        category: 'Unit Economics',
        title: 'Critical: Unsustainable Customer Acquisition',
        issue: `Your LTV:CAC ratio is ${ltvCacRatio.toFixed(2)}x - you're spending more to acquire customers than they generate.`,
        actions: [
          `Reduce CAC from $${cac.toFixed(0)} to under $${(calculations.ltv / 3).toFixed(0)} for healthy economics`,
          'Shift budget from paid ads to organic/content marketing',
          'Implement referral program to reduce acquisition costs',
          'Increase prices by 20-30% to improve LTV',
        ],
        impact: 'High',
        effort: 'Medium',
      });
    } else if (ltvCacRatio < 3) {
      recs.push({
        priority: 2,
        category: 'Unit Economics',
        title: 'Improve LTV:CAC Ratio',
        issue: `Your LTV:CAC of ${ltvCacRatio.toFixed(2)}x is below the 3x benchmark for healthy SaaS.`,
        actions: [
          'Focus on reducing churn to extend customer lifetime',
          'Implement expansion revenue strategies (upsells, add-ons)',
          'Optimize paid ad spend - current paid CAC: $' + calculations.paidCAC.toFixed(0),
          'Test price increases on new customers',
        ],
        impact: 'High',
        effort: 'Medium',
      });
    }

    // 2. Gross Margin Analysis
    if (grossMargin < 50) {
      const aiPercent = (totalAICosts / totalMRR * 100).toFixed(1);
      recs.push({
        priority: 1,
        category: 'Profitability',
        title: 'Critical: Low Gross Margin',
        issue: `Gross margin of ${grossMargin.toFixed(1)}% is well below the 70%+ SaaS benchmark.`,
        actions: [
          `AI costs are ${aiPercent}% of revenue - switch to cheaper models for non-critical tasks`,
          'Route simple queries to Haiku/GPT-4o-mini instead of Sonnet/GPT-4o',
          'Implement token caching to reduce repeated API calls',
          'Consider raising prices - your ARPU of $' + arpu.toFixed(0) + ' may be too low',
        ],
        impact: 'Critical',
        effort: 'Medium',
      });
    } else if (grossMargin < 70) {
      recs.push({
        priority: 2,
        category: 'Profitability',
        title: 'Optimize Gross Margin',
        issue: `Gross margin of ${grossMargin.toFixed(1)}% is below the 70% SaaS target.`,
        actions: [
          'Review AI model mix - use smaller models for 80% of requests',
          'Negotiate volume discounts with providers',
          'Implement usage limits on lower tiers',
        ],
        impact: 'High',
        effort: 'Low',
      });
    }

    // 3. AI Cost Optimization
    const aiCostPercent = (totalAICosts / totalMRR * 100);
    if (aiCostPercent > 20) {
      const enabledExpensiveModels = aiProviders.filter(a => a.enabled && a.outputPer1M > 5);
      recs.push({
        priority: 2,
        category: 'AI Costs',
        title: 'Reduce AI Token Costs',
        issue: `AI costs are ${aiCostPercent.toFixed(1)}% of revenue - target should be under 15%.`,
        actions: [
          'Implement intelligent model routing based on query complexity',
          `Reduce usage of expensive models: ${enabledExpensiveModels.map(m => m.name).join(', ')}`,
          'Add prompt caching for repeated queries (can save 30-50%)',
          'Set token limits per user/tier to prevent abuse',
          'Consider fine-tuning smaller models for specific tasks',
        ],
        impact: 'High',
        effort: 'Medium',
      });
    }

    // 4. Tier-specific recommendations
    const unprofitableTiers = tierAnalysis.filter(t => t.netMargin < 0 && t.customers > 0);
    const lowMarginTiers = tierAnalysis.filter(t => t.netMargin >= 0 && t.netMargin < 15 && t.customers > 0);
    const highMarginTiers = tierAnalysis.filter(t => t.netMargin > 30 && t.customers > 0);

    if (unprofitableTiers.length > 0) {
      unprofitableTiers.forEach(tier => {
        const priceIncrease = Math.ceil(tier.costPerCustomer * 1.3);
        recs.push({
          priority: 1,
          category: 'Pricing',
          title: `Fix Unprofitable Tier: ${tier.name}`,
          issue: `${tier.name} tier loses $${Math.abs(tier.profitPerCustomer).toFixed(2)} per customer (${tier.netMargin.toFixed(1)}% margin).`,
          actions: [
            `Increase price from $${tier.price} to at least $${priceIncrease}`,
            `Reduce AI allocation - currently $${tier.costs.ai.toFixed(2)}/user`,
            'Limit included tokens/storage on this tier',
            'Consider eliminating this tier if low customer count',
          ],
          impact: 'Critical',
          effort: 'Low',
        });
      });
    }

    if (highMarginTiers.length > 0 && lowMarginTiers.length > 0) {
      const bestTier = highMarginTiers.sort((a, b) => b.netMargin - a.netMargin)[0];
      recs.push({
        priority: 3,
        category: 'Growth',
        title: `Focus Growth on ${bestTier.name} Tier`,
        issue: `${bestTier.name} has your best margin at ${bestTier.netMargin.toFixed(1)}% - grow this segment.`,
        actions: [
          `Target marketing at ${bestTier.name} tier customer profile`,
          'Create upgrade paths from lower tiers',
          'Add premium features to justify the price point',
          `Each new ${bestTier.name} customer adds $${bestTier.profitPerCustomer.toFixed(2)} profit`,
        ],
        impact: 'Medium',
        effort: 'Medium',
      });
    }

    // 5. Churn Analysis
    if (acquisition.churnRatePercent > 5) {
      const churnImpact = calculations.monthlyChurn * arpu;
      recs.push({
        priority: 2,
        category: 'Retention',
        title: 'Reduce Customer Churn',
        issue: `${acquisition.churnRatePercent}% monthly churn costs you $${churnImpact.toFixed(0)}/month in lost revenue.`,
        actions: [
          'Implement proactive churn prediction and outreach',
          'Add onboarding sequences to improve activation',
          'Create switching costs (integrations, data lock-in)',
          'Survey churned customers to identify patterns',
          `Reducing churn by 1% would save $${(churnImpact / acquisition.churnRatePercent).toFixed(0)}/month`,
        ],
        impact: 'High',
        effort: 'Medium',
      });
    }

    // 6. Payback Period
    if (paybackPeriod > 12) {
      recs.push({
        priority: 2,
        category: 'Cash Flow',
        title: 'Improve CAC Payback Period',
        issue: `${paybackPeriod.toFixed(1)} month payback is too long - target is under 12 months.`,
        actions: [
          'Offer annual plans with discount to get cash upfront',
          'Reduce CAC through organic channels',
          'Implement usage-based upsells to increase early revenue',
          'Focus on higher-value customer segments',
        ],
        impact: 'High',
        effort: 'Medium',
      });
    }

    // 7. Expansion Revenue
    if (acquisition.expansionRevenuePercent < 20) {
      recs.push({
        priority: 3,
        category: 'Revenue',
        title: 'Increase Expansion Revenue',
        issue: `Only ${acquisition.expansionRevenuePercent}% expansion revenue - top SaaS companies achieve 30%+.`,
        actions: [
          'Add usage-based pricing components',
          'Create add-on features (extra seats, API calls, storage)',
          'Implement in-app upgrade prompts at usage limits',
          'Build enterprise features for large account expansion',
        ],
        impact: 'Medium',
        effort: 'Medium',
      });
    }

    // 8. Cost Structure
    const topCostDriver = costDrivers[0];
    if (topCostDriver && topCostDriver[1] > totalMRR * 0.3) {
      const categoryNames = {
        ai: 'AI/LLM Costs',
        payment: 'Payment Processing',
        support: 'Customer Support',
        infrastructure: 'Infrastructure',
        fixed: 'Fixed Costs',
      };
      recs.push({
        priority: 3,
        category: 'Cost Optimization',
        title: `Optimize Largest Cost: ${categoryNames[topCostDriver[0]]}`,
        issue: `${categoryNames[topCostDriver[0]]} at $${topCostDriver[1].toFixed(0)}/month is ${(topCostDriver[1] / totalMRR * 100).toFixed(1)}% of revenue.`,
        actions: [
          'Benchmark against industry standards',
          'Negotiate volume discounts with vendors',
          'Evaluate alternative providers',
          'Consider automation to reduce manual costs',
        ],
        impact: 'Medium',
        effort: 'Low',
      });
    }

    // 9. Positive recommendation if things are good
    if (netMargin >= 20 && ltvCacRatio >= 3 && grossMargin >= 70) {
      recs.push({
        priority: 4,
        category: 'Growth',
        title: '✓ Healthy Economics - Scale Up',
        issue: 'Your unit economics are healthy! Time to accelerate growth.',
        actions: [
          'Increase marketing spend - your LTV:CAC supports it',
          'Expand to new markets or customer segments',
          'Invest in product development for competitive moat',
          'Consider raising prices - you have margin headroom',
        ],
        impact: 'High',
        effort: 'Medium',
        positive: true,
      });
    }

    return recs.sort((a, b) => a.priority - b.priority);
  }, [calculations, aiProviders, acquisition]);

  const formatCurrency = (amount, decimals = 2) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const SectionHeader = ({ title, section, icon: Icon, badge }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700/80 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-blue-400" />
        <span className="font-semibold text-white">{title}</span>
        {badge && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">{badge}</span>}
      </div>
      {expandedSections[section] ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
    </button>
  );

  const ProviderToggle = ({ provider, onToggle, children }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg transition-all ${provider.enabled ? 'bg-slate-700/70 border border-blue-500/30' : 'bg-slate-800/50 opacity-60'}`}>
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={() => onToggle(!provider.enabled)}
          className={`w-10 h-6 rounded-full transition-colors relative ${provider.enabled ? 'bg-blue-500' : 'bg-slate-600'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${provider.enabled ? 'left-5' : 'left-1'}`} />
        </button>
        {children}
      </div>
    </div>
  );

  const updateAIProvider = (id, field, value) => {
    setAiProviders(aiProviders.map(ai => 
      ai.id === id ? { ...ai, [field]: ['name', 'provider'].includes(field) ? value : Number(value) } : ai
    ));
  };

  const addAIProvider = () => {
    const newProvider = {
      id: Date.now(),
      name: 'New Model',
      provider: 'Custom',
      inputPer1M: 1.00,
      outputPer1M: 2.00,
      enabled: true,
      usagePercent: 0,
    };
    setAiProviders([...aiProviders, newProvider]);
    setEditingAI(newProvider.id);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">SaaS Unit Economics Calculator</h1>
          </div>
          <p className="text-slate-400 text-sm">Real-time P&L analysis with AI costs, infrastructure, and smart recommendations</p>
        </div>

        {/* Top Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4">
            <div className="text-blue-100 text-xs mb-1">Monthly Revenue</div>
            <div className="text-xl font-bold text-white">{formatCurrency(calculations.totalMRR, 0)}</div>
            <div className="text-blue-200 text-xs mt-1">ARR: {formatCurrency(calculations.totalARR, 0)}</div>
          </div>
          <div className={`bg-gradient-to-br rounded-xl p-4 ${calculations.netProfit >= 0 ? 'from-emerald-600 to-emerald-700' : 'from-red-600 to-red-700'}`}>
            <div className={`text-xs mb-1 ${calculations.netProfit >= 0 ? 'text-emerald-100' : 'text-red-100'}`}>Net Profit</div>
            <div className="text-xl font-bold text-white">{formatCurrency(calculations.netProfit, 0)}</div>
            <div className={`text-xs mt-1 ${calculations.netProfit >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>{calculations.netMargin.toFixed(1)}% margin</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
            <div className="text-purple-100 text-xs mb-1">ARPU</div>
            <div className="text-xl font-bold text-white">{formatCurrency(calculations.arpu)}</div>
            <div className="text-purple-200 text-xs mt-1">{calculations.totalCustomers} customers</div>
          </div>
          <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-4">
            <div className="text-amber-100 text-xs mb-1">LTV:CAC</div>
            <div className="text-xl font-bold text-white">{calculations.ltvCacRatio.toFixed(1)}x</div>
            <div className="text-amber-200 text-xs mt-1">Target: 3x+</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl p-4">
            <div className="text-cyan-100 text-xs mb-1">CAC Payback</div>
            <div className="text-xl font-bold text-white">{calculations.paybackPeriod === Infinity ? '∞' : calculations.paybackPeriod.toFixed(1)} mo</div>
            <div className="text-cyan-200 text-xs mt-1">CAC: {formatCurrency(calculations.cac, 0)}</div>
          </div>
          <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-4">
            <div className="text-pink-100 text-xs mb-1">Break-even</div>
            <div className="text-xl font-bold text-white">{calculations.breakEvenCustomers === Infinity ? '∞' : calculations.breakEvenCustomers}</div>
            <div className="text-pink-200 text-xs mt-1">{calculations.monthsToBreakeven === Infinity ? '∞' : calculations.monthsToBreakeven} months away</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Pricing & AI */}
          <div className="space-y-4">
            {/* Pricing Tiers */}
            <div>
              <SectionHeader title="Pricing Tiers" section="pricing" icon={DollarSign} />
              {expandedSections.pricing && (
                <div className="mt-2 bg-slate-800/50 rounded-lg p-4 space-y-3">
                  {pricingTiers.map((tier) => (
                    <div key={tier.id} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-3">
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => setPricingTiers(pricingTiers.map(t => t.id === tier.id ? {...t, name: e.target.value} : t))}
                          className="bg-transparent font-semibold text-white text-lg focus:outline-none focus:border-b border-blue-400"
                        />
                        <button
                          onClick={() => setPricingTiers(pricingTiers.filter(t => t.id !== tier.id))}
                          className="p-1 text-red-400 hover:bg-red-400/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <label className="text-xs text-slate-400">Price/mo ($)</label>
                          <input type="number" value={tier.price}
                            onChange={(e) => setPricingTiers(pricingTiers.map(t => t.id === tier.id ? {...t, price: Number(e.target.value)} : t))}
                            className="w-full bg-slate-600 rounded px-2 py-1 text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Customers</label>
                          <input type="number" value={tier.customers}
                            onChange={(e) => setPricingTiers(pricingTiers.map(t => t.id === tier.id ? {...t, customers: Number(e.target.value)} : t))}
                            className="w-full bg-slate-600 rounded px-2 py-1 text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Input Tokens/mo</label>
                          <input type="number" value={tier.inputTokens}
                            onChange={(e) => setPricingTiers(pricingTiers.map(t => t.id === tier.id ? {...t, inputTokens: Number(e.target.value)} : t))}
                            className="w-full bg-slate-600 rounded px-2 py-1 text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Output Tokens/mo</label>
                          <input type="number" value={tier.outputTokens}
                            onChange={(e) => setPricingTiers(pricingTiers.map(t => t.id === tier.id ? {...t, outputTokens: Number(e.target.value)} : t))}
                            className="w-full bg-slate-600 rounded px-2 py-1 text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Storage (GB)</label>
                          <input type="number" value={tier.storageGB}
                            onChange={(e) => setPricingTiers(pricingTiers.map(t => t.id === tier.id ? {...t, storageGB: Number(e.target.value)} : t))}
                            className="w-full bg-slate-600 rounded px-2 py-1 text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Emails/mo</label>
                          <input type="number" value={tier.emailsPerMonth}
                            onChange={(e) => setPricingTiers(pricingTiers.map(t => t.id === tier.id ? {...t, emailsPerMonth: Number(e.target.value)} : t))}
                            className="w-full bg-slate-600 rounded px-2 py-1 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setPricingTiers([...pricingTiers, { id: Date.now(), name: 'New Tier', price: 49, customers: 0, inputTokens: 200000, outputTokens: 100000, storageGB: 2, emailsPerMonth: 1000, transactions: 20 }])}
                    className="w-full py-2 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-blue-400 hover:text-blue-400 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Tier
                  </button>
                </div>
              )}
            </div>

            {/* AI/LLM Providers - Fully Editable */}
            <div>
              <SectionHeader title="AI/LLM Token Costs" section="ai" icon={Cpu} badge={`${aiProviders.filter(p => p.enabled).length} active`} />
              {expandedSections.ai && (
                <div className="mt-2 bg-slate-800/50 rounded-lg p-4 space-y-2">
                  {aiProviders.map((ai) => (
                    <div key={ai.id} className={`rounded-lg transition-all ${ai.enabled ? 'bg-slate-700/70 border border-blue-500/30' : 'bg-slate-800/50 opacity-60'}`}>
                      <div className="p-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setAiProviders(aiProviders.map(a => a.id === ai.id ? {...a, enabled: !a.enabled} : a))}
                            className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${ai.enabled ? 'bg-blue-500' : 'bg-slate-600'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${ai.enabled ? 'left-5' : 'left-1'}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            {editingAI === ai.id ? (
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={ai.name}
                                  onChange={(e) => updateAIProvider(ai.id, 'name', e.target.value)}
                                  placeholder="Model Name"
                                  className="bg-slate-600 rounded px-2 py-1 text-sm text-white"
                                />
                                <input
                                  type="text"
                                  value={ai.provider}
                                  onChange={(e) => updateAIProvider(ai.id, 'provider', e.target.value)}
                                  placeholder="Provider"
                                  className="bg-slate-600 rounded px-2 py-1 text-sm text-white"
                                />
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-slate-400">In:</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={ai.inputPer1M}
                                    onChange={(e) => updateAIProvider(ai.id, 'inputPer1M', e.target.value)}
                                    className="w-20 bg-slate-600 rounded px-2 py-1 text-sm text-white"
                                  />
                                  <span className="text-xs text-slate-400">/1M</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-slate-400">Out:</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={ai.outputPer1M}
                                    onChange={(e) => updateAIProvider(ai.id, 'outputPer1M', e.target.value)}
                                    className="w-20 bg-slate-600 rounded px-2 py-1 text-sm text-white"
                                  />
                                  <span className="text-xs text-slate-400">/1M</span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium text-sm">{ai.name}</span>
                                  <span className="text-xs text-slate-400">({ai.provider})</span>
                                </div>
                                <div className="flex gap-4 mt-1 text-xs">
                                  <span className="text-slate-400">In: ${ai.inputPer1M}/1M</span>
                                  <span className="text-slate-400">Out: ${ai.outputPer1M}/1M</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {ai.enabled && (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={ai.usagePercent}
                                  onChange={(e) => updateAIProvider(ai.id, 'usagePercent', e.target.value)}
                                  className="w-14 bg-slate-600 rounded px-2 py-1 text-xs text-white text-center"
                                />
                                <span className="text-xs text-slate-400">%</span>
                              </div>
                            )}
                            <button
                              onClick={() => setEditingAI(editingAI === ai.id ? null : ai.id)}
                              className="p-1 text-slate-400 hover:text-blue-400 hover:bg-blue-400/20 rounded"
                            >
                              <Code className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setAiProviders(aiProviders.filter(a => a.id !== ai.id))}
                              className="p-1 text-red-400 hover:bg-red-400/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addAIProvider}
                    className="w-full py-2 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-blue-400 hover:text-blue-400 flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add AI Provider
                  </button>
                  <div className="bg-slate-700/30 rounded-lg p-3 mt-2">
                    <div className="text-xs text-slate-400 mb-1">Total AI Cost/Month</div>
                    <div className="text-lg font-bold text-white">{formatCurrency(calculations.totalAICosts)}</div>
                    <div className="text-xs text-slate-500">{(calculations.totalAICosts / calculations.totalMRR * 100).toFixed(1)}% of revenue</div>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Acquisition - Fully Editable */}
            <div>
              <SectionHeader title="Customer Acquisition" section="acquisition" icon={Target} />
              {expandedSections.acquisition && (
                <div className="mt-2 bg-slate-800/50 rounded-lg p-4 space-y-4">
                  {/* Marketing Spend Breakdown */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2">MARKETING SPEND</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-300 w-32">Paid Ads</label>
                        <div className="flex items-center bg-slate-600 rounded flex-1">
                          <span className="text-slate-400 pl-2">$</span>
                          <input type="number" value={acquisition.paidAdsSpend}
                            onChange={(e) => setAcquisition({...acquisition, paidAdsSpend: Number(e.target.value), monthlyMarketingSpend: Number(e.target.value) + acquisition.contentMarketingSpend + acquisition.salesTeamSpend})}
                            className="w-full bg-transparent px-2 py-1.5 text-white text-sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-300 w-32">Content/SEO</label>
                        <div className="flex items-center bg-slate-600 rounded flex-1">
                          <span className="text-slate-400 pl-2">$</span>
                          <input type="number" value={acquisition.contentMarketingSpend}
                            onChange={(e) => setAcquisition({...acquisition, contentMarketingSpend: Number(e.target.value), monthlyMarketingSpend: acquisition.paidAdsSpend + Number(e.target.value) + acquisition.salesTeamSpend})}
                            className="w-full bg-transparent px-2 py-1.5 text-white text-sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-300 w-32">Sales Team</label>
                        <div className="flex items-center bg-slate-600 rounded flex-1">
                          <span className="text-slate-400 pl-2">$</span>
                          <input type="number" value={acquisition.salesTeamSpend}
                            onChange={(e) => setAcquisition({...acquisition, salesTeamSpend: Number(e.target.value), monthlyMarketingSpend: acquisition.paidAdsSpend + acquisition.contentMarketingSpend + Number(e.target.value)})}
                            className="w-full bg-transparent px-2 py-1.5 text-white text-sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-700">
                        <label className="text-sm text-slate-300 w-32 font-semibold">Total Spend</label>
                        <div className="text-white font-bold">{formatCurrency(acquisition.monthlyMarketingSpend, 0)}/mo</div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Acquisition Sources */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2">ACQUISITION CHANNELS (%)</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-slate-400">Organic</label>
                        <div className="flex items-center">
                          <input type="number" value={acquisition.organicCustomersPercent}
                            onChange={(e) => setAcquisition({...acquisition, organicCustomersPercent: Number(e.target.value)})}
                            className="w-full bg-slate-600 rounded px-2 py-1.5 text-white text-sm" />
                          <span className="text-slate-400 ml-1">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Paid</label>
                        <div className="flex items-center">
                          <input type="number" value={acquisition.paidCustomersPercent}
                            onChange={(e) => setAcquisition({...acquisition, paidCustomersPercent: Number(e.target.value)})}
                            className="w-full bg-slate-600 rounded px-2 py-1.5 text-white text-sm" />
                          <span className="text-slate-400 ml-1">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Referral</label>
                        <div className="flex items-center">
                          <input type="number" value={acquisition.referralCustomersPercent}
                            onChange={(e) => setAcquisition({...acquisition, referralCustomersPercent: Number(e.target.value)})}
                            className="w-full bg-slate-600 rounded px-2 py-1.5 text-white text-sm" />
                          <span className="text-slate-400 ml-1">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Metrics */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2">CUSTOMER METRICS</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400">New Customers/mo</label>
                        <input type="number" value={acquisition.newCustomersPerMonth}
                          onChange={(e) => setAcquisition({...acquisition, newCustomersPerMonth: Number(e.target.value)})}
                          className="w-full bg-slate-600 rounded px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Monthly Churn (%)</label>
                        <input type="number" step="0.1" value={acquisition.churnRatePercent}
                          onChange={(e) => setAcquisition({...acquisition, churnRatePercent: Number(e.target.value)})}
                          className="w-full bg-slate-600 rounded px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Avg Lifetime (months)</label>
                        <input type="number" value={acquisition.avgCustomerLifetimeMonths}
                          onChange={(e) => setAcquisition({...acquisition, avgCustomerLifetimeMonths: Number(e.target.value)})}
                          className="w-full bg-slate-600 rounded px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Expansion Revenue (%)</label>
                        <input type="number" step="1" value={acquisition.expansionRevenuePercent}
                          onChange={(e) => setAcquisition({...acquisition, expansionRevenuePercent: Number(e.target.value)})}
                          className="w-full bg-slate-600 rounded px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Conversion Rate (%)</label>
                        <input type="number" step="0.1" value={acquisition.conversionRatePercent}
                          onChange={(e) => setAcquisition({...acquisition, conversionRatePercent: Number(e.target.value)})}
                          className="w-full bg-slate-600 rounded px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Deal Cycle (weeks)</label>
                        <input type="number" step="0.5" value={acquisition.avgDealCycleWeeks}
                          onChange={(e) => setAcquisition({...acquisition, avgDealCycleWeeks: Number(e.target.value)})}
                          className="w-full bg-slate-600 rounded px-3 py-2 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Calculated Metrics */}
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-2">CALCULATED METRICS</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-xs text-slate-400">Blended CAC</div>
                        <div className="text-lg font-bold text-white">{formatCurrency(calculations.cac, 0)}</div>
                      </div>
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-xs text-slate-400">Paid CAC</div>
                        <div className="text-lg font-bold text-white">{formatCurrency(calculations.paidCAC, 0)}</div>
                      </div>
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-xs text-slate-400">LTV</div>
                        <div className="text-lg font-bold text-white">{formatCurrency(calculations.ltv, 0)}</div>
                      </div>
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-xs text-slate-400">LTV:CAC</div>
                        <div className={`text-lg font-bold ${calculations.ltvCacRatio >= 3 ? 'text-emerald-400' : calculations.ltvCacRatio >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
                          {calculations.ltvCacRatio.toFixed(2)}x
                        </div>
                      </div>
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-xs text-slate-400">Monthly Churn</div>
                        <div className="text-lg font-bold text-white">{calculations.monthlyChurn.toFixed(0)} customers</div>
                      </div>
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-xs text-slate-400">Net Growth</div>
                        <div className={`text-lg font-bold ${calculations.monthlyCustomerGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {calculations.monthlyCustomerGrowth >= 0 ? '+' : ''}{calculations.monthlyCustomerGrowth.toFixed(0)}/mo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Infrastructure & Tools */}
          <div className="space-y-4">
            {/* Infrastructure Providers */}
            <div>
              <SectionHeader title="Infrastructure & Services" section="infrastructure" icon={Database} />
              {expandedSections.infrastructure && (
                <div className="mt-2 bg-slate-800/50 rounded-lg p-4 space-y-4">
                  {/* Storage */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                      <Database className="w-3 h-3" /> STORAGE
                    </div>
                    {storageProviders.map((p) => (
                      <ProviderToggle key={p.id} provider={p}
                        onToggle={(enabled) => setStorageProviders(storageProviders.map(s => s.id === p.id ? {...s, enabled} : {...s, enabled: false}))}>
                        <div>
                          <span className="text-white text-sm">{p.name}</span>
                          <div className="text-xs text-slate-400">${p.pricePerGB}/GB + ${p.transferPerGB}/GB transfer</div>
                        </div>
                      </ProviderToggle>
                    ))}
                  </div>

                  {/* Database */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                      <Database className="w-3 h-3" /> DATABASE
                    </div>
                    {dbProviders.map((p) => (
                      <ProviderToggle key={p.id} provider={p}
                        onToggle={(enabled) => setDbProviders(dbProviders.map(d => d.id === p.id ? {...d, enabled} : {...d, enabled: false}))}>
                        <div>
                          <span className="text-white text-sm">{p.name}</span>
                          <div className="text-xs text-slate-400">${p.monthlyBase}/mo base + ${p.pricePerGB}/GB</div>
                        </div>
                      </ProviderToggle>
                    ))}
                  </div>

                  {/* Email */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> EMAIL SERVICE
                    </div>
                    {emailProviders.map((p) => (
                      <ProviderToggle key={p.id} provider={p}
                        onToggle={(enabled) => setEmailProviders(emailProviders.map(e => e.id === p.id ? {...e, enabled} : {...e, enabled: false}))}>
                        <div>
                          <span className="text-white text-sm">{p.name}</span>
                          <div className="text-xs text-slate-400">
                            ${p.monthlyBase}/mo + ${p.pricePer1000}/1k emails ({formatNumber(p.freeEmails)} free)
                          </div>
                        </div>
                      </ProviderToggle>
                    ))}
                  </div>

                  {/* Auth */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                      <Shield className="w-3 h-3" /> AUTHENTICATION
                    </div>
                    {authProviders.map((p) => (
                      <ProviderToggle key={p.id} provider={p}
                        onToggle={(enabled) => setAuthProviders(authProviders.map(a => a.id === p.id ? {...a, enabled} : {...a, enabled: false}))}>
                        <div>
                          <span className="text-white text-sm">{p.name}</span>
                          <div className="text-xs text-slate-400">
                            ${p.monthlyBase}/mo + ${p.pricePerMAU}/MAU ({formatNumber(p.freeMAU)} free)
                          </div>
                        </div>
                      </ProviderToggle>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Processing */}
            <div>
              <SectionHeader title="Payment Processing" section="payments" icon={CreditCard} />
              {expandedSections.payments && (
                <div className="mt-2 bg-slate-800/50 rounded-lg p-4 space-y-2">
                  {paymentProviders.map((p) => (
                    <ProviderToggle key={p.id} provider={p}
                      onToggle={(enabled) => setPaymentProviders(paymentProviders.map(pp => pp.id === p.id ? {...pp, enabled} : {...pp, enabled: false}))}>
                      <div>
                        <span className="text-white text-sm">{p.name}</span>
                        <div className="text-xs text-slate-400">
                          {p.percentFee}% + ${p.fixedFee.toFixed(2)} per transaction
                        </div>
                      </div>
                    </ProviderToggle>
                  ))}
                </div>
              )}
            </div>

            {/* Development & Operations Tools */}
            <div>
              <SectionHeader title="Dev & Ops Tools" section="tools" icon={Code} badge={formatCurrency(devTools.filter(t => t.enabled).reduce((s,t) => s + t.monthlyBase * t.seats, 0) + opsTools.filter(t => t.enabled).reduce((s,t) => s + t.monthlyBase, 0), 0) + '/mo'} />
              {expandedSections.tools && (
                <div className="mt-2 bg-slate-800/50 rounded-lg p-4 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2">DEV TOOLS</div>
                    <div className="space-y-1">
                      {devTools.map((t) => (
                        <ProviderToggle key={t.id} provider={{enabled: t.enabled}}
                          onToggle={(enabled) => setDevTools(devTools.map(d => d.id === t.id ? {...d, enabled} : d))}>
                          <div className="flex-1">
                            <span className="text-white text-sm">{t.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="number" value={t.seats}
                              onChange={(e) => setDevTools(devTools.map(d => d.id === t.id ? {...d, seats: Number(e.target.value)} : d))}
                              className="w-12 bg-slate-600 rounded px-2 py-1 text-xs text-white text-center" />
                            <span className="text-xs text-slate-400">× ${t.monthlyBase}</span>
                          </div>
                        </ProviderToggle>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-2">MONITORING & OPS</div>
                    <div className="space-y-1">
                      {opsTools.map((t) => (
                        <ProviderToggle key={t.id} provider={{enabled: t.enabled}}
                          onToggle={(enabled) => setOpsTools(opsTools.map(o => o.id === t.id ? {...o, enabled} : o))}>
                          <div className="flex-1">
                            <span className="text-white text-sm">{t.name}</span>
                          </div>
                          <span className="text-xs text-slate-400">${t.monthlyBase}/mo</span>
                        </ProviderToggle>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Team Costs */}
            <div>
              <SectionHeader title="Team & Fixed Costs" section="team" icon={Users} badge={formatCurrency(fixedCosts.reduce((s,c) => s + c.amount, 0), 0) + '/mo'} />
              {expandedSections.team && (
                <div className="mt-2 bg-slate-800/50 rounded-lg p-4 space-y-2">
                  {fixedCosts.map((cost) => (
                    <div key={cost.id} className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-2">
                      <select value={cost.category}
                        onChange={(e) => setFixedCosts(fixedCosts.map(c => c.id === cost.id ? {...c, category: e.target.value} : c))}
                        className="bg-slate-600 rounded px-2 py-1 text-xs text-white">
                        <option value="personnel">Personnel</option>
                        <option value="growth">Growth</option>
                        <option value="overhead">Overhead</option>
                      </select>
                      <input type="text" value={cost.name}
                        onChange={(e) => setFixedCosts(fixedCosts.map(c => c.id === cost.id ? {...c, name: e.target.value} : c))}
                        className="flex-1 bg-slate-600 rounded px-2 py-1 text-sm text-white" />
                      <div className="flex items-center bg-slate-600 rounded px-2">
                        <span className="text-slate-400 text-sm">$</span>
                        <input type="number" value={cost.amount}
                          onChange={(e) => setFixedCosts(fixedCosts.map(c => c.id === cost.id ? {...c, amount: Number(e.target.value)} : c))}
                          className="w-20 bg-transparent px-1 py-1 text-sm text-white text-right" />
                      </div>
                      <button onClick={() => setFixedCosts(fixedCosts.filter(c => c.id !== cost.id))}
                        className="p-1 text-red-400 hover:bg-red-400/20 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setFixedCosts([...fixedCosts, { id: Date.now(), name: 'New Cost', amount: 0, category: 'overhead' }])}
                    className="w-full py-2 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-blue-400 hover:text-blue-400 flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Fixed Cost
                  </button>

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-xs font-semibold text-slate-400 mb-2">SUPPORT TIME</div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-300">Hourly Rate: $</span>
                      <input type="number" value={supportCosts.hourlyRate}
                        onChange={(e) => setSupportCosts({...supportCosts, hourlyRate: Number(e.target.value)})}
                        className="w-16 bg-slate-600 rounded px-2 py-1 text-white" />
                    </div>
                    <div className="mt-2 text-xs text-slate-400">Hours per customer per month:</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pricingTiers.map(tier => (
                        <div key={tier.id} className="flex items-center gap-1 bg-slate-700 rounded px-2 py-1">
                          <span className="text-xs text-slate-300">{tier.name}:</span>
                          <input type="number" step="0.25" 
                            value={supportCosts.hoursPerCustomerPerMonth[tier.name] || 0.5}
                            onChange={(e) => setSupportCosts({
                              ...supportCosts, 
                              hoursPerCustomerPerMonth: {...supportCosts.hoursPerCustomerPerMonth, [tier.name]: Number(e.target.value)}
                            })}
                            className="w-12 bg-slate-600 rounded px-1 py-0.5 text-xs text-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Analysis & Recommendations */}
          <div className="space-y-4">
            {/* Smart Recommendations */}
            <div>
              <SectionHeader title="Smart Recommendations" section="recommendations" icon={Lightbulb} badge={`${recommendations.length} insights`} />
              {expandedSections.recommendations && (
                <div className="mt-2 space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className={`rounded-xl p-4 border ${
                      rec.positive ? 'bg-emerald-500/10 border-emerald-500/30' :
                      rec.priority === 1 ? 'bg-red-500/10 border-red-500/30' :
                      rec.priority === 2 ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          rec.positive ? 'bg-emerald-500/20' :
                          rec.priority === 1 ? 'bg-red-500/20' :
                          rec.priority === 2 ? 'bg-amber-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          {rec.positive ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                           rec.priority === 1 ? <AlertCircle className="w-5 h-5 text-red-400" /> :
                           rec.priority === 2 ? <TrendingUp className="w-5 h-5 text-amber-400" /> :
                           <Lightbulb className="w-5 h-5 text-blue-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              rec.positive ? 'bg-emerald-500/20 text-emerald-400' :
                              rec.priority === 1 ? 'bg-red-500/20 text-red-400' :
                              rec.priority === 2 ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {rec.category}
                            </span>
                            <span className={`text-xs ${
                              rec.impact === 'Critical' ? 'text-red-400' :
                              rec.impact === 'High' ? 'text-amber-400' :
                              'text-slate-400'
                            }`}>
                              {rec.impact} Impact
                            </span>
                          </div>
                          <h4 className="font-semibold text-white text-sm mb-1">{rec.title}</h4>
                          <p className="text-xs text-slate-400 mb-2">{rec.issue}</p>
                          <div className="space-y-1">
                            {rec.actions.slice(0, 3).map((action, actionIdx) => (
                              <div key={actionIdx} className="flex items-start gap-2 text-xs">
                                <Sparkles className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300">{action}</span>
                              </div>
                            ))}
                            {rec.actions.length > 3 && (
                              <span className="text-xs text-slate-500 ml-5">+{rec.actions.length - 3} more actions</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Per-Tier P&L */}
            <div className="bg-slate-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-400" />
                Per-Tier P&L Analysis
              </h3>
              <div className="space-y-3">
                {calculations.tierAnalysis.map((tier) => (
                  <div key={tier.id} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-semibold text-white">{tier.name}</span>
                        <span className="text-slate-400 text-sm ml-2">({tier.customers} customers)</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tier.netMargin >= 30 ? 'bg-emerald-500/20 text-emerald-400' :
                        tier.netMargin >= 10 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {tier.netMargin.toFixed(1)}% net margin
                      </span>
                    </div>
                    
                    {/* Cost breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-slate-400">AI Costs</div>
                        <div className="text-white font-medium">{formatCurrency(tier.costs.ai)}/user</div>
                      </div>
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-slate-400">Storage</div>
                        <div className="text-white font-medium">{formatCurrency(tier.costs.storage)}/user</div>
                      </div>
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-slate-400">Payment</div>
                        <div className="text-white font-medium">{formatCurrency(tier.costs.payment)}/user</div>
                      </div>
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-slate-400">Email</div>
                        <div className="text-white font-medium">{formatCurrency(tier.costs.email)}/user</div>
                      </div>
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-slate-400">Support</div>
                        <div className="text-white font-medium">{formatCurrency(tier.costs.support)}/user</div>
                      </div>
                      <div className="bg-slate-600/50 rounded p-2">
                        <div className="text-slate-400">Auth</div>
                        <div className="text-white font-medium">{formatCurrency(tier.costs.auth)}/user</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400">Revenue</span>
                        <div className="text-white font-medium">{formatCurrency(tier.revenue)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Total Cost/User</span>
                        <div className="text-white font-medium">{formatCurrency(tier.costPerCustomer)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Gross Profit</span>
                        <div className={`font-medium ${tier.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(tier.grossProfit)}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Net Profit</span>
                        <div className={`font-medium ${tier.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(tier.netProfit)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown Summary */}
            <div className="bg-slate-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Total Cost Breakdown</h3>
              <div className="space-y-2">
                {calculations.costDrivers.map(([category, amount]) => {
                  const categoryNames = {
                    ai: 'AI/LLM Costs',
                    payment: 'Payment Processing',
                    support: 'Customer Support',
                    infrastructure: 'Infrastructure & Tools',
                    fixed: 'Fixed Costs (Team, etc.)',
                  };
                  const percent = (amount / calculations.totalCosts * 100).toFixed(1);
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">{categoryNames[category]}</span>
                          <span className="text-white">{formatCurrency(amount)} ({percent}%)</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="border-t border-slate-700 pt-3 mt-3 flex justify-between">
                  <span className="text-white font-semibold">Total Monthly Costs</span>
                  <span className="text-white font-bold">{formatCurrency(calculations.totalCosts)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
