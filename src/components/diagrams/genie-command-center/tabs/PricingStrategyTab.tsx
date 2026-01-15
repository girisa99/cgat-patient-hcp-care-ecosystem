/**
 * Genie Command Center - Pricing Strategy Tab
 * Comprehensive P&L calculator with unit economics
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
import {
  Calculator, Users, Layers, DollarSign,
  Check, X, TrendingUp, Zap, Crown, Gift, Building,
  Heart, GraduationCap, Plane, Camera, BookOpen,
  Smartphone, Target, BarChart3, Server,
  Megaphone, PieChart, Plus, Trash2, Edit2,
  Coins, Receipt, ArrowUpRight, ArrowDownRight, Settings
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

// Production capacity calculation type
interface ProductionCapacity {
  tier: string;
  videosPerMonth: number;
  scriptsPerMonth: number;
  ttsMinutesPerMonth: number;
  storageGB: number;
}

// Custom cost item type
interface CustomCostItem {
  id: string;
  name: string;
  type: 'variable' | 'fixed';
  costPerUnit: number;
  unitType: string;
  category: string;
  capacityMin?: string;
  capacityMax?: string;
  scaleFactor?: string;
  unitsPerTier: Record<string, number>;
}

// ==================== COMPREHENSIVE P&L CALCULATOR ====================
const ComprehensivePLCalculator: React.FC = () => {
  // Editable AI Models
  const [aiModels, setAiModels] = useState<AIModelCost[]>([...defaultAIModels]);
  const [ttsProviders, setTtsProviders] = useState<TTSCost[]>([...defaultTTSCosts]);
  
  // Custom cost items
  const [customCosts, setCustomCosts] = useState<CustomCostItem[]>([
    {
      id: 'video-storage',
      name: 'Video Storage',
      type: 'variable',
      costPerUnit: 0.023,
      unitType: 'GB',
      category: 'Storage',
      capacityMin: '0',
      capacityMax: '5TB/mo',
      scaleFactor: '$0.023/GB',
      unitsPerTier: { free: 1, starter: 10, creator: 50, business: 200, pro: 500, healthcare: 1000 }
    },
    {
      id: 'video-encoding',
      name: 'Video Encoding',
      type: 'variable',
      costPerUnit: 0.015,
      unitType: 'minute',
      category: 'Processing',
      capacityMin: '0',
      capacityMax: 'Unlimited',
      scaleFactor: '$0.015/min',
      unitsPerTier: { free: 5, starter: 30, creator: 120, business: 500, pro: 1200, healthcare: 2400 }
    },
    {
      id: 'cdn-bandwidth',
      name: 'CDN Bandwidth',
      type: 'variable',
      costPerUnit: 0.08,
      unitType: 'GB',
      category: 'Delivery',
      capacityMin: '0',
      capacityMax: '10TB/mo',
      scaleFactor: '$0.08/GB',
      unitsPerTier: { free: 5, starter: 50, creator: 200, business: 1000, pro: 2500, healthcare: 5000 }
    },
  ]);

  // Dialog states
  const [showAddCost, setShowAddCost] = useState(false);
  const [newCost, setNewCost] = useState<Partial<CustomCostItem>>({
    name: '', type: 'variable', costPerUnit: 0, unitType: 'unit', category: '',
    capacityMin: '', capacityMax: '', scaleFactor: '',
    unitsPerTier: { free: 0, starter: 0, creator: 0, business: 0, pro: 0, healthcare: 0 }
  });
  
  // Editable Fixed Costs with capacity info
  const [fixedCosts, setFixedCosts] = useState<(MonthlyEconomics & { 
    minCapacity?: string; 
    maxCapacity?: string; 
    scaleFactor?: string;
  })[]>(
    defaultFixedCosts.map(c => ({
      ...c,
      minCapacity: c.category === 'Supabase Pro' ? '1K users' : c.category === 'Resend Pro' ? '50K emails' : '—',
      maxCapacity: c.category === 'Supabase Pro' ? '100K users' : c.category === 'Resend Pro' ? '50K emails' : '—',
      scaleFactor: c.category === 'Supabase Pro' ? '$0.125/GB' : c.category === 'Netlify Pro' ? '$55/100GB' : '—',
    }))
  );

  // Dialog states for adding new items
  const [showAddAI, setShowAddAI] = useState(false);
  const [showAddTTS, setShowAddTTS] = useState(false);
  const [showAddFixed, setShowAddFixed] = useState(false);

  // New item forms
  const [newAI, setNewAI] = useState<Partial<AIModelCost>>({
    provider: '', model: '', inputCostPer1MTok: 0, outputCostPer1MTok: 0,
    avgTokensPerScript: 2500, contextWindow: '128K', bestFor: ''
  });
  const [newTTS, setNewTTS] = useState<Partial<TTSCost>>({
    provider: '', tier: '', costPerCharacter: 0, costPerMinute: 0,
    voiceCount: 100, languages: 10, quality: 'Premium', cloning: false, emotionControl: false
  });
  const [newFixed, setNewFixed] = useState({ category: '', fixedCosts: 0, description: '', minCapacity: '', maxCapacity: '', scaleFactor: '' });

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

  const aiModel = aiModels.find(m => m.model === selectedAIModel) || aiModels[0];
  const ttsModel = ttsProviders.find(t => `${t.provider} ${t.tier}` === selectedTTS) || ttsProviders[1];

  // Add handlers
  const handleAddAI = () => {
    if (newAI.provider && newAI.model) {
      const costPerScript = ((newAI.avgTokensPerScript || 2500) / 1000000) * 
        ((newAI.inputCostPer1MTok || 0) + (newAI.outputCostPer1MTok || 0)) / 2;
      setAiModels([...aiModels, { ...newAI, costPerScript } as AIModelCost]);
      setNewAI({ provider: '', model: '', inputCostPer1MTok: 0, outputCostPer1MTok: 0, avgTokensPerScript: 2500, contextWindow: '128K', bestFor: '' });
      setShowAddAI(false);
    }
  };

  const handleAddTTS = () => {
    if (newTTS.provider && newTTS.tier) {
      setTtsProviders([...ttsProviders, newTTS as TTSCost]);
      setNewTTS({ provider: '', tier: '', costPerCharacter: 0, costPerMinute: 0, voiceCount: 100, languages: 10, quality: 'Premium', cloning: false, emotionControl: false });
      setShowAddTTS(false);
    }
  };

  const handleAddFixed = () => {
    if (newFixed.category) {
      setFixedCosts([...fixedCosts, newFixed]);
      setNewFixed({ category: '', fixedCosts: 0, description: '', minCapacity: '', maxCapacity: '', scaleFactor: '' });
      setShowAddFixed(false);
    }
  };

  const handleAddCustomCost = () => {
    if (newCost.name && newCost.category) {
      setCustomCosts([...customCosts, { ...newCost, id: `custom-${Date.now()}` } as CustomCostItem]);
      setNewCost({
        name: '', type: 'variable', costPerUnit: 0, unitType: 'unit', category: '',
        capacityMin: '', capacityMax: '', scaleFactor: '',
        unitsPerTier: { free: 0, starter: 0, creator: 0, business: 0, pro: 0, healthcare: 0 }
      });
      setShowAddCost(false);
    }
  };

  const updateFixedCost = (index: number, field: string, value: number | string) => {
    setFixedCosts(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const deleteFixedCost = (index: number) => {
    setFixedCosts(prev => prev.filter((_, i) => i !== index));
  };

  const deleteAIModel = (index: number) => {
    setAiModels(prev => prev.filter((_, i) => i !== index));
  };

  const deleteTTSProvider = (index: number) => {
    setTtsProviders(prev => prev.filter((_, i) => i !== index));
  };

  const deleteCustomCost = (id: string) => {
    setCustomCosts(prev => prev.filter(c => c.id !== id));
  };

  const updateCustomCost = (id: string, field: string, value: any) => {
    setCustomCosts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const updateCustomCostTierUnits = (id: string, tier: string, value: number) => {
    setCustomCosts(prev => prev.map(c => 
      c.id === id ? { ...c, unitsPerTier: { ...c.unitsPerTier, [tier]: value } } : c
    ));
  };

  // Production capacity by tier
  const productionCapacity = useMemo((): ProductionCapacity[] => {
    return tierAllocations.map(tier => ({
      tier: tier.tier,
      videosPerMonth: tier.tier === 'Free' ? 3 : tier.tier === 'Starter' ? 15 : tier.tier === 'Creator' ? 50 : tier.tier === 'Business' ? 150 : tier.tier === 'Pro' ? 500 : 1000,
      scriptsPerMonth: tier.tier === 'Free' ? 5 : tier.tier === 'Starter' ? 30 : tier.tier === 'Creator' ? 100 : tier.tier === 'Business' ? 300 : tier.tier === 'Pro' ? 1000 : 2500,
      ttsMinutesPerMonth: tier.ttsMinutes,
      storageGB: tier.tier === 'Free' ? 1 : tier.tier === 'Starter' ? 10 : tier.tier === 'Creator' ? 50 : tier.tier === 'Business' ? 200 : tier.tier === 'Pro' ? 500 : 1000,
    }));
  }, []);

  // Calculate unit economics per tier including custom costs
  const tierEconomics = useMemo(() => {
    return tierAllocations.map(tier => {
      const tierKey = tier.tier.toLowerCase() as keyof typeof subscriberCounts;
      const subscribers = subscriberCounts[tierKey] || 0;
      const price = prices[tierKey as keyof typeof prices] || tier.monthlyPrice;
      
      const aiCostPerUser = (tier.tokensPerMonth / 1000000) * (aiModel.inputCostPer1MTok + aiModel.outputCostPer1MTok) / 2;
      const ttsCostPerUser = tier.ttsMinutes * ttsModel.costPerMinute;
      
      // Calculate custom variable costs per user
      const customVariableCostPerUser = customCosts
        .filter(c => c.type === 'variable')
        .reduce((sum, cost) => sum + (cost.unitsPerTier[tierKey] || 0) * cost.costPerUnit, 0);
      
      const variableCost = aiCostPerUser + ttsCostPerUser + customVariableCostPerUser;
      const contribution = price - variableCost;
      const marginPercent = price > 0 ? ((contribution / price) * 100) : (tier.tier === 'Free' ? -100 : 0);
      
      // Get production capacity for this tier
      const capacity = productionCapacity.find(p => p.tier === tier.tier);
      
      return {
        ...tier,
        subscribers,
        price,
        aiCostPerUser,
        ttsCostPerUser,
        customVariableCostPerUser,
        variableCost,
        contribution,
        marginPercent,
        totalRevenue: subscribers * price,
        totalVariableCost: subscribers * variableCost,
        totalContribution: subscribers * contribution,
        capacity,
      };
    });
  }, [subscriberCounts, prices, aiModel, ttsModel, customCosts, productionCapacity]);

  const totalAdSpend = useMemo(() => Object.values(adSpend).reduce((sum, val) => sum + val, 0), [adSpend]);

  const cacByChannel = useMemo(() => {
    return acquisitionChannels.map(ch => ({
      ...ch,
      spend: adSpend[ch.channel.toLowerCase().replace(' ads', '').replace(' (organic)', '').replace('/', '') as keyof typeof adSpend] || 0,
      estimatedCustomers: Math.floor((adSpend[ch.channel.toLowerCase().replace(' ads', '').replace(' (organic)', '').replace('/', '') as keyof typeof adSpend] || 0) / ch.estimatedCAC),
    }));
  }, [adSpend]);

  const totalFixedCosts = useMemo(() => fixedCosts.reduce((sum, c) => sum + c.fixedCosts, 0), [fixedCosts]);
  
  const totalCustomFixedCosts = useMemo(() => 
    customCosts.filter(c => c.type === 'fixed').reduce((sum, c) => c.costPerUnit, 0), 
  [customCosts]);

  // P&L Summary
  const plSummary = useMemo(() => {
    const totalRevenue = tierEconomics.reduce((sum, t) => sum + t.totalRevenue, 0);
    const totalVariableCosts = tierEconomics.reduce((sum, t) => sum + t.totalVariableCost, 0);
    const grossProfit = totalRevenue - totalVariableCosts;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    const allFixedCosts = totalFixedCosts + totalCustomFixedCosts;
    const operatingExpenses = allFixedCosts + totalAdSpend;
    const netProfit = grossProfit - operatingExpenses;
    const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    const totalPaidSubscribers = Object.entries(subscriberCounts)
      .filter(([key]) => key !== 'free')
      .reduce((sum, [, val]) => sum + val, 0);
    
    const arpu = totalPaidSubscribers > 0 ? totalRevenue / totalPaidSubscribers : 0;
    const blendedCAC = totalPaidSubscribers > 0 ? totalAdSpend / (totalPaidSubscribers * 0.1) : 0; // Assuming 10% new monthly
    const ltv = arpu * 12; // Assuming 12 month average lifetime
    const ltvCacRatio = blendedCAC > 0 ? ltv / blendedCAC : 0;
    
    // Production totals
    const totalVideosProduced = tierEconomics.reduce((sum, t) => 
      sum + (t.capacity?.videosPerMonth || 0) * t.subscribers, 0);
    const totalScriptsProduced = tierEconomics.reduce((sum, t) => 
      sum + (t.capacity?.scriptsPerMonth || 0) * t.subscribers, 0);
    const totalTTSMinutes = tierEconomics.reduce((sum, t) => 
      sum + (t.capacity?.ttsMinutesPerMonth || 0) * t.subscribers, 0);
    
    return {
      totalRevenue,
      totalVariableCosts,
      grossProfit,
      grossMarginPercent,
      operatingExpenses,
      totalFixedCosts: allFixedCosts,
      totalAdSpend,
      netProfit,
      netMarginPercent,
      totalSubscribers: Object.values(subscriberCounts).reduce((sum, val) => sum + val, 0),
      totalPaidSubscribers,
      arpu,
      blendedCAC,
      ltv,
      ltvCacRatio,
      breakEvenUsers: grossProfit > 0 ? Math.ceil(allFixedCosts / (grossProfit / totalPaidSubscribers)) : Infinity,
      totalVideosProduced,
      totalScriptsProduced,
      totalTTSMinutes,
    };
  }, [tierEconomics, totalFixedCosts, totalCustomFixedCosts, totalAdSpend, subscriberCounts]);

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

              {/* AI Model Selection with Add Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">AI Model</Label>
                  <Dialog open={showAddAI} onOpenChange={setShowAddAI}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 px-1">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background">
                      <DialogHeader>
                        <DialogTitle>Add AI Model</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Provider</Label>
                          <Input value={newAI.provider || ''} onChange={e => setNewAI(p => ({ ...p, provider: e.target.value }))} placeholder="OpenAI" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Model Name</Label>
                          <Input value={newAI.model || ''} onChange={e => setNewAI(p => ({ ...p, model: e.target.value }))} placeholder="GPT-5" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Input $/1M tok</Label>
                          <Input type="number" step="0.01" value={newAI.inputCostPer1MTok || 0} onChange={e => setNewAI(p => ({ ...p, inputCostPer1MTok: parseFloat(e.target.value) }))} className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Output $/1M tok</Label>
                          <Input type="number" step="0.01" value={newAI.outputCostPer1MTok || 0} onChange={e => setNewAI(p => ({ ...p, outputCostPer1MTok: parseFloat(e.target.value) }))} className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Context Window</Label>
                          <Input value={newAI.contextWindow || ''} onChange={e => setNewAI(p => ({ ...p, contextWindow: e.target.value }))} placeholder="128K" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Best For</Label>
                          <Input value={newAI.bestFor || ''} onChange={e => setNewAI(p => ({ ...p, bestFor: e.target.value }))} placeholder="General tasks" className="h-8" />
                        </div>
                      </div>
                      <Button onClick={handleAddAI} className="w-full mt-2">Add AI Model</Button>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={selectedAIModel} onValueChange={setSelectedAIModel}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                    {aiModels.map((m, idx) => (
                      <div key={m.model} className="flex items-center justify-between pr-2">
                        <SelectItem value={m.model} className="text-xs flex-1">
                          {m.provider} {m.model} (${m.costPerScript.toFixed(4)}/script)
                        </SelectItem>
                        {idx >= defaultAIModels.length && (
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => deleteAIModel(idx)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TTS Provider Selection with Add Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">TTS Provider</Label>
                  <Dialog open={showAddTTS} onOpenChange={setShowAddTTS}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 px-1">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background">
                      <DialogHeader>
                        <DialogTitle>Add TTS Provider</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Provider</Label>
                          <Input value={newTTS.provider || ''} onChange={e => setNewTTS(p => ({ ...p, provider: e.target.value }))} placeholder="ElevenLabs" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Tier</Label>
                          <Input value={newTTS.tier || ''} onChange={e => setNewTTS(p => ({ ...p, tier: e.target.value }))} placeholder="Pro" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">$/minute</Label>
                          <Input type="number" step="0.01" value={newTTS.costPerMinute || 0} onChange={e => setNewTTS(p => ({ ...p, costPerMinute: parseFloat(e.target.value) }))} className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Voice Count</Label>
                          <Input type="number" value={newTTS.voiceCount || 0} onChange={e => setNewTTS(p => ({ ...p, voiceCount: parseInt(e.target.value) }))} className="h-8" />
                        </div>
                      </div>
                      <Button onClick={handleAddTTS} className="w-full mt-2">Add TTS Provider</Button>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={selectedTTS} onValueChange={setSelectedTTS}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                    {ttsProviders.map((t, idx) => (
                      <div key={`${t.provider} ${t.tier}`} className="flex items-center justify-between pr-2">
                        <SelectItem value={`${t.provider} ${t.tier}`} className="text-xs flex-1">
                          {t.provider} {t.tier} (${t.costPerMinute}/min)
                        </SelectItem>
                        {idx >= defaultTTSCosts.length && (
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => deleteTTSProvider(idx)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        )}
                      </div>
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

        {/* Middle: Unit Economics Per Tier with Production Capacity */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Unit Economics & Capacity by Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="h-[400px] overflow-y-auto space-y-3 pr-1">
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
                  
                  {/* Economics */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="text-right">${tier.price.toFixed(2)}</span>
                    <span className="text-muted-foreground">AI Cost:</span>
                    <span className="text-right">${tier.aiCostPerUser.toFixed(4)}</span>
                    <span className="text-muted-foreground">TTS Cost:</span>
                    <span className="text-right">${tier.ttsCostPerUser.toFixed(2)}</span>
                    {tier.customVariableCostPerUser > 0 && (
                      <>
                        <span className="text-muted-foreground">Other Variable:</span>
                        <span className="text-right">${tier.customVariableCostPerUser.toFixed(2)}</span>
                      </>
                    )}
                    <span className="text-muted-foreground font-medium">Contribution:</span>
                    <span className={`text-right font-medium ${tier.contribution >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${tier.contribution.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Production Capacity */}
                  {tier.capacity && (
                    <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">Production Capacity/User</p>
                      <div className="grid grid-cols-4 gap-1 text-[10px]">
                        <div className="text-center p-1 bg-background rounded">
                          <p className="font-bold text-foreground">{tier.capacity.videosPerMonth}</p>
                          <p className="text-muted-foreground">videos</p>
                        </div>
                        <div className="text-center p-1 bg-background rounded">
                          <p className="font-bold text-foreground">{tier.capacity.scriptsPerMonth}</p>
                          <p className="text-muted-foreground">scripts</p>
                        </div>
                        <div className="text-center p-1 bg-background rounded">
                          <p className="font-bold text-foreground">{tier.capacity.ttsMinutesPerMonth}</p>
                          <p className="text-muted-foreground">TTS min</p>
                        </div>
                        <div className="text-center p-1 bg-background rounded">
                          <p className="font-bold text-foreground">{tier.capacity.storageGB}</p>
                          <p className="text-muted-foreground">GB</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Total for tier */}
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

        {/* Right: Comprehensive Cost Breakdown */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Cost Breakdown
              </CardTitle>
              <Dialog open={showAddCost} onOpenChange={setShowAddCost}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add Cost
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Custom Cost Item</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input value={newCost.name || ''} onChange={e => setNewCost(p => ({ ...p, name: e.target.value }))} placeholder="Video Encoding" className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Input value={newCost.category || ''} onChange={e => setNewCost(p => ({ ...p, category: e.target.value }))} placeholder="Processing" className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select value={newCost.type} onValueChange={(v: 'variable' | 'fixed') => setNewCost(p => ({ ...p, type: v }))}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="variable">Variable (per user)</SelectItem>
                          <SelectItem value="fixed">Fixed (monthly)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Cost per Unit ($)</Label>
                      <Input type="number" step="0.001" value={newCost.costPerUnit || 0} onChange={e => setNewCost(p => ({ ...p, costPerUnit: parseFloat(e.target.value) || 0 }))} className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Unit Type</Label>
                      <Input value={newCost.unitType || ''} onChange={e => setNewCost(p => ({ ...p, unitType: e.target.value }))} placeholder="minute, GB, etc." className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Scale Factor</Label>
                      <Input value={newCost.scaleFactor || ''} onChange={e => setNewCost(p => ({ ...p, scaleFactor: e.target.value }))} placeholder="$0.01/unit" className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Min Capacity</Label>
                      <Input value={newCost.capacityMin || ''} onChange={e => setNewCost(p => ({ ...p, capacityMin: e.target.value }))} placeholder="0" className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Max Capacity</Label>
                      <Input value={newCost.capacityMax || ''} onChange={e => setNewCost(p => ({ ...p, capacityMax: e.target.value }))} placeholder="Unlimited" className="h-8" />
                    </div>
                  </div>
                  {newCost.type === 'variable' && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <Label className="text-xs font-medium">Units per Tier (for variable costs)</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {['free', 'starter', 'creator', 'business', 'pro', 'healthcare'].map(tier => (
                          <div key={tier}>
                            <Label className="text-[10px] capitalize">{tier}</Label>
                            <Input 
                              type="number" 
                              value={newCost.unitsPerTier?.[tier] || 0} 
                              onChange={e => setNewCost(p => ({ 
                                ...p, 
                                unitsPerTier: { ...p.unitsPerTier, [tier]: parseInt(e.target.value) || 0 } 
                              }))} 
                              className="h-7 text-xs" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button onClick={handleAddCustomCost} className="w-full mt-2">Add Cost Item</Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="h-[400px] overflow-y-auto space-y-3 pr-1">
              
              {/* Variable Costs Section */}
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  VARIABLE COSTS (Scales with Usage)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span>AI ({selectedAIModel})</span>
                    <span className="text-muted-foreground">${((aiModel.inputCostPer1MTok + aiModel.outputCostPer1MTok) / 2).toFixed(4)}/1M tok</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>TTS ({selectedTTS})</span>
                    <span className="text-muted-foreground">${ttsModel.costPerMinute.toFixed(2)}/min</span>
                  </div>
                  
                  {/* Custom variable costs */}
                  {customCosts.filter(c => c.type === 'variable').map(cost => (
                    <div key={cost.id} className="group">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span>{cost.name}</span>
                          <Badge variant="outline" className="text-[9px] h-4 px-1">{cost.category}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">${cost.costPerUnit}/{cost.unitType}</span>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100" onClick={() => deleteCustomCost(cost.id)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {(cost.capacityMin || cost.capacityMax) && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Capacity: {cost.capacityMin || '0'} - {cost.capacityMax || '∞'} {cost.scaleFactor && `• ${cost.scaleFactor}`}
                        </p>
                      )}
                    </div>
                  ))}
                  
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Variable/Month</span>
                    <span className="text-amber-600">${plSummary.totalVariableCosts.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Costs Section */}
              <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    FIXED COSTS (Monthly Infrastructure)
                  </h4>
                  <Dialog open={showAddFixed} onOpenChange={setShowAddFixed}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 px-1">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background">
                      <DialogHeader>
                        <DialogTitle>Add Fixed Infrastructure Cost</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Category/Service</Label>
                          <Input value={newFixed.category} onChange={e => setNewFixed(p => ({ ...p, category: e.target.value }))} placeholder="AWS S3" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Monthly Cost ($)</Label>
                          <Input type="number" value={newFixed.fixedCosts} onChange={e => setNewFixed(p => ({ ...p, fixedCosts: parseFloat(e.target.value) || 0 }))} className="h-8" />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Description</Label>
                          <Input value={newFixed.description} onChange={e => setNewFixed(p => ({ ...p, description: e.target.value }))} placeholder="Object storage for videos" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Min Capacity</Label>
                          <Input value={newFixed.minCapacity} onChange={e => setNewFixed(p => ({ ...p, minCapacity: e.target.value }))} placeholder="1K users" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Max Capacity</Label>
                          <Input value={newFixed.maxCapacity} onChange={e => setNewFixed(p => ({ ...p, maxCapacity: e.target.value }))} placeholder="100K users" className="h-8" />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Scale Factor (overage pricing)</Label>
                          <Input value={newFixed.scaleFactor} onChange={e => setNewFixed(p => ({ ...p, scaleFactor: e.target.value }))} placeholder="$0.10/GB after limit" className="h-8" />
                        </div>
                      </div>
                      <Button onClick={handleAddFixed} className="w-full mt-2">Add Fixed Cost</Button>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2 text-xs">
                  {fixedCosts.map((cost, idx) => (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span title={cost.description}>{cost.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={cost.fixedCosts}
                            onChange={(e) => updateFixedCost(idx, 'fixedCosts', parseFloat(e.target.value) || 0)}
                            className="h-6 w-16 text-xs text-right"
                          />
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100" onClick={() => deleteFixedCost(idx)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {(cost.minCapacity && cost.minCapacity !== '—') && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 pl-1">
                          {cost.minCapacity} → {cost.maxCapacity} {cost.scaleFactor && cost.scaleFactor !== '—' && `• Overage: ${cost.scaleFactor}`}
                        </p>
                      )}
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Fixed/Month</span>
                    <span className="text-blue-600">${totalFixedCosts.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Acquisition */}
              <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5">
                <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
                  <Megaphone className="w-3 h-3" />
                  CUSTOMER ACQUISITION (Marketing)
                </h4>
                <div className="space-y-1 text-xs">
                  {cacByChannel.filter(c => c.spend > 0).map((ch, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{ch.channel}</span>
                      <span className="text-muted-foreground">~{ch.estimatedCustomers} users @ ${ch.estimatedCAC}/user</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
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
              <div className="p-3 rounded-lg border-2 border-primary/30 bg-primary/5">
                <h4 className="text-xs font-semibold mb-2">TOTAL MONTHLY COSTS SUMMARY</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Variable Costs</span>
                    <span>${plSummary.totalVariableCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fixed Infrastructure</span>
                    <span>${plSummary.totalFixedCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marketing/Ads</span>
                    <span>${totalAdSpend.toLocaleString()}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span>TOTAL</span>
                    <span className="text-destructive">${(plSummary.totalVariableCosts + plSummary.operatingExpenses).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Capacity Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Total Production Capacity (All Subscribers)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-primary">{plSummary.totalVideosProduced.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Videos/Month</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-primary">{plSummary.totalScriptsProduced.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Scripts/Month</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-primary">{plSummary.totalTTSMinutes.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">TTS Minutes/Month</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-primary">${(plSummary.totalVariableCosts / Math.max(plSummary.totalVideosProduced, 1)).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Cost/Video</p>
            </div>
          </div>
        </CardContent>
      </Card>

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

