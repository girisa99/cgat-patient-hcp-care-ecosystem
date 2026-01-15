/**
 * Genie Command Center - Pricing Strategy Tab
 * Comprehensive P&L calculator with unit economics
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Calculator, Users, Layers, DollarSign, Sparkles,
  Check, X, TrendingUp, TrendingDown, Zap, Crown, Gift, Building,
  Heart, GraduationCap, Plane, Camera, BookOpen,
  Smartphone, Target, BarChart3, Server,
  Megaphone, CreditCard, AlertTriangle, PieChart,
  Coins, Receipt, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  segmentPricingProfiles,
  pricingModels,
  pricingPermutations,
  pricingRecommendations,
  segmentBundles,
} from '../data/pricing-options-data';
import {
  aiModelCosts,
  ttsCosts,
  infrastructureCosts,
  acquisitionChannels,
  tierAllocations,
  assetProductionCosts,
  monthlyFixedCosts,
} from '../data/infrastructure-costs';

// ==================== COMPREHENSIVE P&L CALCULATOR ====================
const ComprehensivePLCalculator: React.FC = () => {
  // Subscriber counts by tier
  const [subscriberCounts, setSubscriberCounts] = useState({
    free: 5000,
    starter: 500,
    creator: 200,
    business: 50,
    pro: 20,
    healthcare: 10,
  });

  // Pricing inputs (editable)
  const [prices, setPrices] = useState({
    starter: 9.99,
    creator: 19.99,
    business: 49.99,
    pro: 99.99,
    healthcare: 199.99,
  });

  // Acquisition spend
  const [adSpend, setAdSpend] = useState({
    youtube: 2000,
    tiktok: 1500,
    instagram: 1000,
    google: 1500,
    seo: 500,
    affiliate: 300,
  });

  // AI Provider selection
  const [selectedAIModel, setSelectedAIModel] = useState('Gemini 2.0 Flash');
  const [selectedTTS, setSelectedTTS] = useState('ElevenLabs Pro');

  const aiModel = aiModelCosts.find(m => m.model === selectedAIModel) || aiModelCosts[0];
  const ttsModel = ttsCosts.find(t => `${t.provider} ${t.tier}` === selectedTTS) || ttsCosts[1];

  // Calculate unit economics per tier
  const tierEconomics = useMemo(() => {
    return tierAllocations.map(tier => {
      const subscribers = subscriberCounts[tier.tier.toLowerCase() as keyof typeof subscriberCounts] || 0;
      const price = prices[tier.tier.toLowerCase() as keyof typeof prices] || tier.monthlyPrice;
      
      // Calculate actual AI cost based on selected model
      const aiCostPerUser = (tier.tokensPerMonth / 1000000) * (aiModel.inputCostPer1MTok + aiModel.outputCostPer1MTok) / 2;
      
      // Calculate TTS cost
      const ttsCostPerUser = tier.ttsMinutes * ttsModel.costPerMinute;
      
      // Total variable cost
      const variableCost = aiCostPerUser + ttsCostPerUser;
      
      // Contribution margin
      const contribution = price - variableCost;
      const marginPercent = price > 0 ? ((contribution / price) * 100) : (tier.tier === 'Free' ? -100 : 0);
      
      return {
        ...tier,
        subscribers,
        price,
        aiCostPerUser,
        ttsCostPerUser,
        variableCost,
        contribution,
        marginPercent,
        totalRevenue: subscribers * price,
        totalVariableCost: subscribers * variableCost,
        totalContribution: subscribers * contribution,
      };
    });
  }, [subscriberCounts, prices, aiModel, ttsModel]);

  // Calculate total acquisition cost
  const totalAdSpend = useMemo(() => 
    Object.values(adSpend).reduce((sum, val) => sum + val, 0),
  [adSpend]);

  // Calculate CAC by channel
  const cacByChannel = useMemo(() => {
    const totalNewCustomers = Object.values(subscriberCounts).reduce((sum, val) => sum + val, 0) * 0.1; // Assume 10% new
    return acquisitionChannels.map(ch => ({
      ...ch,
      spend: adSpend[ch.channel.toLowerCase().replace(' ads', '').replace(' (organic)', '').replace('/', '') as keyof typeof adSpend] || 0,
      estimatedCustomers: Math.floor((adSpend[ch.channel.toLowerCase().replace(' ads', '').replace(' (organic)', '').replace('/', '') as keyof typeof adSpend] || 0) / ch.estimatedCAC),
    }));
  }, [adSpend]);

  // Fixed costs
  const totalFixedCosts = useMemo(() => 
    monthlyFixedCosts.reduce((sum, c) => sum + c.fixedCosts, 0),
  []);

  // P&L Summary
  const plSummary = useMemo(() => {
    const totalRevenue = tierEconomics.reduce((sum, t) => sum + t.totalRevenue, 0);
    const totalVariableCosts = tierEconomics.reduce((sum, t) => sum + t.totalVariableCost, 0);
    const grossProfit = totalRevenue - totalVariableCosts;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    const operatingExpenses = totalFixedCosts + totalAdSpend;
    const netProfit = grossProfit - operatingExpenses;
    const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    const totalPaidSubscribers = Object.entries(subscriberCounts)
      .filter(([key]) => key !== 'free')
      .reduce((sum, [, val]) => sum + val, 0);
    
    const arpu = totalPaidSubscribers > 0 ? totalRevenue / totalPaidSubscribers : 0;
    const blendedCAC = totalPaidSubscribers > 0 ? totalAdSpend / (totalPaidSubscribers * 0.1) : 0; // Assuming 10% new monthly
    const ltv = arpu * 12; // Assuming 12 month average lifetime
    const ltvCacRatio = blendedCAC > 0 ? ltv / blendedCAC : 0;
    
    return {
      totalRevenue,
      totalVariableCosts,
      grossProfit,
      grossMarginPercent,
      operatingExpenses,
      totalFixedCosts,
      totalAdSpend,
      netProfit,
      netMarginPercent,
      totalSubscribers: Object.values(subscriberCounts).reduce((sum, val) => sum + val, 0),
      totalPaidSubscribers,
      arpu,
      blendedCAC,
      ltv,
      ltvCacRatio,
      breakEvenUsers: grossProfit > 0 ? Math.ceil(totalFixedCosts / (grossProfit / totalPaidSubscribers)) : Infinity,
    };
  }, [tierEconomics, totalFixedCosts, totalAdSpend, subscriberCounts]);

  return (
    <div className="space-y-6">
      {/* P&L Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className={plSummary.netProfit >= 0 ? 'border-green-500/50' : 'border-red-500/50'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Net Profit/Loss</span>
              {plSummary.netProfit >= 0 ? 
                <ArrowUpRight className="w-4 h-4 text-green-500" /> : 
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              }
            </div>
            <p className={`text-xl font-bold ${plSummary.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${plSummary.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">{plSummary.netMarginPercent.toFixed(1)}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Monthly Revenue</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">${plSummary.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground">{plSummary.totalPaidSubscribers} paid users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Gross Profit</span>
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-foreground">${plSummary.grossProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground">{plSummary.grossMarginPercent.toFixed(1)}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">ARPU</span>
              <Receipt className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-foreground">${plSummary.arpu.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Avg revenue/user</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">LTV:CAC Ratio</span>
              <Target className="w-4 h-4 text-purple-500" />
            </div>
            <p className={`text-xl font-bold ${plSummary.ltvCacRatio >= 3 ? 'text-green-500' : plSummary.ltvCacRatio >= 1 ? 'text-amber-500' : 'text-red-500'}`}>
              {plSummary.ltvCacRatio.toFixed(1)}x
            </p>
            <p className="text-xs text-muted-foreground">{plSummary.ltvCacRatio >= 3 ? 'Healthy' : 'Needs work'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Break-Even</span>
              <BarChart3 className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xl font-bold text-foreground">{plSummary.breakEvenUsers === Infinity ? '∞' : plSummary.breakEvenUsers}</p>
            <p className="text-xs text-muted-foreground">paid users needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Three-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Subscriber & Pricing Inputs */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Subscriber Mix & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
              <div className="space-y-3">
                {Object.entries(subscriberCounts).map(([tier, count]) => (
                  <div key={tier} className="grid grid-cols-3 gap-2 items-center">
                    <Label className="text-xs capitalize">{tier}</Label>
                    <Input
                      type="number"
                      value={count}
                      onChange={(e) => setSubscriberCounts(prev => ({ ...prev, [tier]: parseInt(e.target.value) || 0 }))}
                      className="h-8 text-xs"
                    />
                    {tier !== 'free' && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={prices[tier as keyof typeof prices]}
                          onChange={(e) => setPrices(prev => ({ ...prev, [tier]: parseFloat(e.target.value) || 0 }))}
                          className="h-8 text-xs"
                        />
                      </div>
                    )}
                    {tier === 'free' && <span className="text-xs text-muted-foreground">$0</span>}
                  </div>
                ))}
              </div>

              <Separator />

              {/* AI Model Selection */}
              <div className="space-y-2">
                <Label className="text-xs">AI Model</Label>
                <Select value={selectedAIModel} onValueChange={setSelectedAIModel}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                    {aiModelCosts.map(m => (
                      <SelectItem key={m.model} value={m.model} className="text-xs">
                        {m.provider} {m.model} (${m.costPerScript.toFixed(4)}/script)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">TTS Provider</Label>
                <Select value={selectedTTS} onValueChange={setSelectedTTS}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                    {ttsCosts.map(t => (
                      <SelectItem key={`${t.provider} ${t.tier}`} value={`${t.provider} ${t.tier}`} className="text-xs">
                        {t.provider} {t.tier} (${t.costPerMinute}/min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Ad Spend Inputs */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Ad Spend (${totalAdSpend}/mo)</h4>
                <div className="space-y-2">
                  {Object.entries(adSpend).map(([channel, spend]) => (
                    <div key={channel} className="grid grid-cols-2 gap-2 items-center">
                      <Label className="text-xs capitalize">{channel}</Label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={spend}
                          onChange={(e) => setAdSpend(prev => ({ ...prev, [channel]: parseInt(e.target.value) || 0 }))}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Middle: Unit Economics Per Tier */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Unit Economics by Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-[400px] overflow-y-auto pr-2 space-y-3">
              {tierEconomics.map((tier) => (
                <div key={tier.tier} className={`p-3 rounded-lg border ${
                  tier.marginPercent >= 40 ? 'border-green-500/30 bg-green-500/5' :
                  tier.marginPercent >= 0 ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-red-500/30 bg-red-500/5'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{tier.tier}</span>
                    <Badge variant={tier.marginPercent >= 40 ? 'default' : tier.marginPercent >= 0 ? 'secondary' : 'destructive'}>
                      {tier.marginPercent.toFixed(0)}% margin
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="text-right">${tier.price.toFixed(2)}</span>
                    <span className="text-muted-foreground">AI Cost:</span>
                    <span className="text-right">${tier.aiCostPerUser.toFixed(4)}</span>
                    <span className="text-muted-foreground">TTS Cost:</span>
                    <span className="text-right">${tier.ttsCostPerUser.toFixed(2)}</span>
                    <span className="text-muted-foreground font-medium">Contribution:</span>
                    <span className={`text-right font-medium ${tier.contribution >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${tier.contribution.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{tier.subscribers} users →</span>
                      <span className={tier.totalContribution >= 0 ? 'text-green-500' : 'text-red-500'}>
                        ${tier.totalContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Fixed & Variable Cost Breakdown */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
              {/* Variable Costs Summary */}
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  VARIABLE COSTS (Per User)
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>AI ({selectedAIModel})</span>
                    <span>${((aiModel.inputCostPer1MTok + aiModel.outputCostPer1MTok) / 2).toFixed(4)}/1M tok</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TTS ({selectedTTS})</span>
                    <span>${ttsModel.costPerMinute.toFixed(2)}/min</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t mt-1">
                    <span>Total Variable/Month</span>
                    <span className="text-amber-600">${plSummary.totalVariableCosts.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Costs */}
              <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                  <Server className="w-3 h-3" />
                  FIXED COSTS (Monthly)
                </h4>
                <div className="space-y-1 text-xs">
                  {monthlyFixedCosts.map((cost, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{cost.category}</span>
                      <span className="text-muted-foreground">${cost.fixedCosts}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium pt-1 border-t mt-1">
                    <span>Total Fixed/Month</span>
                    <span className="text-blue-600">${totalFixedCosts.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Acquisition */}
              <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5">
                <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
                  <Megaphone className="w-3 h-3" />
                  CUSTOMER ACQUISITION
                </h4>
                <div className="space-y-1 text-xs">
                  {cacByChannel.filter(c => c.spend > 0).map((ch, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{ch.channel}</span>
                      <span className="text-muted-foreground">
                        ~{ch.estimatedCustomers} @ ${ch.estimatedCAC}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium pt-1 border-t mt-1">
                    <span>Total CAC/Month</span>
                    <span className="text-purple-600">${totalAdSpend.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Blended CAC</span>
                    <span>${plSummary.blendedCAC.toFixed(2)}/user</span>
                  </div>
                </div>
              </div>

              {/* Total Cost Summary */}
              <div className="p-3 rounded-lg border-2 border-red-500/30 bg-red-500/5">
                <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">TOTAL MONTHLY COSTS</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Variable Costs</span>
                    <span>${plSummary.totalVariableCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fixed Infrastructure</span>
                    <span>${totalFixedCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing/Ads</span>
                    <span>${totalAdSpend.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t mt-1 text-red-600">
                    <span>TOTAL</span>
                    <span>${(plSummary.totalVariableCosts + plSummary.operatingExpenses).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full P&L Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Monthly P&L Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue Section */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-500 border-b pb-1">REVENUE</h4>
              {tierEconomics.filter(t => t.price > 0).map(tier => (
                <div key={tier.tier} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{tier.tier} ({tier.subscribers})</span>
                  <span>${tier.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Total Revenue</span>
                <span className="text-green-500">${plSummary.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* COGS Section */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-amber-500 border-b pb-1">COST OF GOODS SOLD</h4>
              {tierEconomics.map(tier => (
                <div key={tier.tier} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{tier.tier} Variable</span>
                  <span>${tier.totalVariableCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Total COGS</span>
                <span className="text-amber-500">${plSummary.totalVariableCosts.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-blue-500">
                <span>Gross Profit</span>
                <span>${plSummary.grossProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({plSummary.grossMarginPercent.toFixed(0)}%)</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-red-500 border-b pb-1">OPERATING EXPENSES</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Infrastructure</span>
                <span>${totalFixedCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Marketing/Ads</span>
                <span>${totalAdSpend.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Total OpEx</span>
                <span className="text-red-500">${plSummary.operatingExpenses.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between text-sm font-bold pt-2 border-t-2 ${plSummary.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <span>NET PROFIT</span>
                <span>${plSummary.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({plSummary.netMarginPercent.toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
          <p className="text-2xl font-bold text-foreground mb-4">$0</p>
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
          <p className="text-2xl font-bold text-foreground mb-1">$12.99<span className="text-sm text-muted-foreground">/mo</span></p>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Pricing Strategy & Unit Economics
          </h2>
          <p className="text-sm text-muted-foreground">
            P&L Calculator • Cost Analysis • Segment Pricing
          </p>
        </div>
      </div>

      {/* Sub-navigation - Simple button style, no nested tabs */}
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

      {/* Content Area - Scrollable */}
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

export default PricingStrategyTab;

