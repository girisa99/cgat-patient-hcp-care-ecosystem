/**
 * Genie Command Center - Pricing Strategy Tab
 * Comprehensive P&L calculator with guided journey, user-editable costs, breakeven analysis, and smart recommendations
 */

import React, { useState, useMemo, createContext, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Steps, Step } from '@/components/ui/steps';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator, Users, Layers, DollarSign, Check, X, TrendingUp, Zap, Crown, Gift, Building,
  Heart, GraduationCap, Plane, Camera, BookOpen, Smartphone, Target, BarChart3, 
  Plus, Trash2, Coins, Receipt, ArrowUpRight, ArrowDownRight, AlertCircle, 
  Lightbulb, CheckCircle2, Sparkles, TrendingDown, Calendar, Edit2, ChevronRight,
  ChevronLeft, Info, Award, Percent, RefreshCw, Settings, HelpCircle, Play
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
interface AIProvider {
  id: number;
  name: string;
  provider: string;
  inputPer1M: number;
  outputPer1M: number;
  enabled: boolean;
  usagePercent: number;
}

interface TTSProvider {
  id: number;
  name: string;
  costPerMinute: number;
  enabled: boolean;
  usagePercent: number;
}

interface PricingTier {
  id: number;
  name: string;
  price: number;
  yearlyPrice: number;
  customers: number;
  inputTokens: number;
  outputTokens: number;
  ttsMinutes: number;
  storageGB: number;
  videosPerMonth: number;
  isFreeTier: boolean;
}

interface FixedCost {
  id: number;
  name: string;
  amount: number;
  category: string;
  minCapacity?: number;
  maxCapacity?: number;
  scaleFactor?: number;
}

interface Acquisition {
  paidAdsSpend: number;
  contentSpend: number;
  affiliateSpend: number;
  seoSpend: number;
  newCustomersPerMonth: number;
  churnRatePercent: number;
  avgLifetimeMonths: number;
  expansionRevenuePercent: number;
  yearlyDiscountPercent: number;
  yearlyAdoptionPercent: number;
}

interface CompetitorBenchmark {
  name: string;
  freeLimit: string;
  starterPrice: number;
  proPrice: number;
  enterprisePrice: number;
  freeToPaidRate: number;
}

interface TierAnalysis {
  tier: string;
  isFreeTier: boolean;
  subscribers: number;
  price: number;
  yearlyPrice: number;
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

interface Recommendation {
  priority: 1 | 2 | 3 | 4;
  category: string;
  title: string;
  issue: string;
  actions: string[];
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  positive?: boolean;
  tier?: string;
}

// ==================== CONTEXT FOR SHARED STATE ====================
interface CalculatorState {
  pricingTiers: PricingTier[];
  aiProviders: AIProvider[];
  ttsProviders: TTSProvider[];
  fixedCosts: FixedCost[];
  acquisition: Acquisition;
  competitors: CompetitorBenchmark[];
  calculations: any;
  recommendations: Recommendation[];
}

const CalculatorContext = createContext<CalculatorState | null>(null);

// ==================== GUIDED JOURNEY WIZARD ====================
const GuidedWizard: React.FC<{
  currentStep: number;
  setCurrentStep: (step: number) => void;
  pricingTiers: PricingTier[];
  setPricingTiers: React.Dispatch<React.SetStateAction<PricingTier[]>>;
  aiProviders: AIProvider[];
  setAiProviders: React.Dispatch<React.SetStateAction<AIProvider[]>>;
  ttsProviders: TTSProvider[];
  setTtsProviders: React.Dispatch<React.SetStateAction<TTSProvider[]>>;
  fixedCosts: FixedCost[];
  setFixedCosts: React.Dispatch<React.SetStateAction<FixedCost[]>>;
  acquisition: Acquisition;
  setAcquisition: React.Dispatch<React.SetStateAction<Acquisition>>;
  competitors: CompetitorBenchmark[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorBenchmark[]>>;
  calculations: any;
}> = ({ currentStep, setCurrentStep, pricingTiers, setPricingTiers, aiProviders, setAiProviders, ttsProviders, setTtsProviders, fixedCosts, setFixedCosts, acquisition, setAcquisition, competitors, setCompetitors, calculations }) => {
  const steps = [
    { title: 'Tiers', description: 'Define pricing tiers' },
    { title: 'AI Costs', description: 'Configure AI providers' },
    { title: 'Fixed Costs', description: 'Set infrastructure costs' },
    { title: 'Acquisition', description: 'CAC & growth metrics' },
    { title: 'Competitors', description: 'Benchmark pricing' },
  ];

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0));

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-muted/30 rounded-lg p-4">
        <Steps currentStep={currentStep} onStepClick={setCurrentStep}>
          {steps.map((step, idx) => (
            <Step key={idx} title={step.title} description={step.description} />
          ))}
        </Steps>
        <Progress value={(currentStep + 1) / steps.length * 100} className="mt-4 h-2" />
      </div>

      {/* Step Content */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">Step {currentStep + 1}/{steps.length}</Badge>
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button size="sm" onClick={nextStep}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Step 0: Pricing Tiers */}
          {currentStep === 0 && (
            <TiersEditor 
              pricingTiers={pricingTiers} 
              setPricingTiers={setPricingTiers}
              calculations={calculations}
            />
          )}

          {/* Step 1: AI Providers */}
          {currentStep === 1 && (
            <AIProvidersEditor 
              aiProviders={aiProviders} 
              setAiProviders={setAiProviders}
              ttsProviders={ttsProviders}
              setTtsProviders={setTtsProviders}
              calculations={calculations}
            />
          )}

          {/* Step 2: Fixed Costs */}
          {currentStep === 2 && (
            <FixedCostsEditor 
              fixedCosts={fixedCosts} 
              setFixedCosts={setFixedCosts}
            />
          )}

          {/* Step 3: Acquisition */}
          {currentStep === 3 && (
            <AcquisitionEditor 
              acquisition={acquisition} 
              setAcquisition={setAcquisition}
              calculations={calculations}
            />
          )}

          {/* Step 4: Competitors */}
          {currentStep === 4 && (
            <CompetitorBenchmarkEditor 
              competitors={competitors} 
              setCompetitors={setCompetitors}
              pricingTiers={pricingTiers}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== TIER EDITOR ====================
const TiersEditor: React.FC<{
  pricingTiers: PricingTier[];
  setPricingTiers: React.Dispatch<React.SetStateAction<PricingTier[]>>;
  calculations: any;
}> = ({ pricingTiers, setPricingTiers, calculations }) => {
  const [showAddTier, setShowAddTier] = useState(false);
  const [newTier, setNewTier] = useState<Partial<PricingTier>>({
    name: '', price: 0, yearlyPrice: 0, customers: 0, inputTokens: 0, outputTokens: 0, 
    ttsMinutes: 0, storageGB: 0, videosPerMonth: 0, isFreeTier: false
  });

  const addTier = () => {
    if (newTier.name) {
      setPricingTiers(prev => [...prev, {
        id: Date.now(),
        name: newTier.name || 'New Tier',
        price: newTier.price || 0,
        yearlyPrice: newTier.yearlyPrice || (newTier.price || 0) * 10,
        customers: newTier.customers || 0,
        inputTokens: newTier.inputTokens || 0,
        outputTokens: newTier.outputTokens || 0,
        ttsMinutes: newTier.ttsMinutes || 0,
        storageGB: newTier.storageGB || 0,
        videosPerMonth: newTier.videosPerMonth || 0,
        isFreeTier: newTier.price === 0,
      }]);
      setNewTier({ name: '', price: 0, yearlyPrice: 0, customers: 0, inputTokens: 0, outputTokens: 0, ttsMinutes: 0, storageGB: 0, videosPerMonth: 0, isFreeTier: false });
      setShowAddTier(false);
    }
  };

  const updateTier = (id: number, field: keyof PricingTier, value: any) => {
    setPricingTiers(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, [field]: value };
        if (field === 'price') {
          updated.isFreeTier = value === 0;
          updated.yearlyPrice = value * 10;
        }
        return updated;
      }
      return t;
    }));
  };

  const deleteTier = (id: number) => {
    setPricingTiers(prev => prev.filter(t => t.id !== id));
  };

  const tierAnalysis = calculations?.tierAnalysis || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Define your pricing tiers with usage limits and customer counts</span>
        </div>
        <Dialog open={showAddTier} onOpenChange={setShowAddTier}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add Tier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Pricing Tier</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="col-span-2">
                <Label>Tier Name</Label>
                <Input 
                  value={newTier.name || ''} 
                  onChange={(e) => setNewTier(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Starter, Pro, Enterprise"
                />
              </div>
              <div>
                <Label>Monthly Price ($)</Label>
                <Input 
                  type="number" 
                  value={newTier.price || 0} 
                  onChange={(e) => setNewTier(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Expected Customers</Label>
                <Input 
                  type="number" 
                  value={newTier.customers || 0} 
                  onChange={(e) => setNewTier(prev => ({ ...prev, customers: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Input Tokens/mo</Label>
                <Input 
                  type="number" 
                  value={newTier.inputTokens || 0} 
                  onChange={(e) => setNewTier(prev => ({ ...prev, inputTokens: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Output Tokens/mo</Label>
                <Input 
                  type="number" 
                  value={newTier.outputTokens || 0} 
                  onChange={(e) => setNewTier(prev => ({ ...prev, outputTokens: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>TTS Minutes/mo</Label>
                <Input 
                  type="number" 
                  value={newTier.ttsMinutes || 0} 
                  onChange={(e) => setNewTier(prev => ({ ...prev, ttsMinutes: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Videos/mo</Label>
                <Input 
                  type="number" 
                  value={newTier.videosPerMonth || 0} 
                  onChange={(e) => setNewTier(prev => ({ ...prev, videosPerMonth: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddTier(false)}>Cancel</Button>
              <Button onClick={addTier}>Add Tier</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pricingTiers.map((tier, idx) => {
          const analysis = tierAnalysis.find((t: TierAnalysis) => t.tier === tier.name);
          return (
            <Card key={tier.id} className={`relative ${tier.isFreeTier ? 'border-green-500/30 bg-green-500/5' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tier.isFreeTier && <Gift className="w-4 h-4 text-green-500" />}
                    <Input
                      value={tier.name}
                      onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                      className="h-7 text-sm font-semibold w-24 bg-transparent border-none p-0 focus-visible:ring-0"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTier(tier.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
                {analysis && (
                  <Badge variant={analysis.marginPercent >= 40 ? 'default' : analysis.marginPercent >= 0 ? 'secondary' : 'destructive'} className="w-fit">
                    {analysis.marginPercent.toFixed(0)}% margin
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Monthly $</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tier.price}
                      onChange={(e) => updateTier(tier.id, 'price', parseFloat(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Yearly $</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tier.yearlyPrice}
                      onChange={(e) => updateTier(tier.id, 'yearlyPrice', parseFloat(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Customers</Label>
                    <Input
                      type="number"
                      value={tier.customers}
                      onChange={(e) => updateTier(tier.id, 'customers', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Videos/mo</Label>
                    <Input
                      type="number"
                      value={tier.videosPerMonth}
                      onChange={(e) => updateTier(tier.id, 'videosPerMonth', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Input Tokens</Label>
                    <Input
                      type="number"
                      value={tier.inputTokens}
                      onChange={(e) => updateTier(tier.id, 'inputTokens', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">TTS Min</Label>
                    <Input
                      type="number"
                      value={tier.ttsMinutes}
                      onChange={(e) => updateTier(tier.id, 'ttsMinutes', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
                {analysis && (
                  <div className="pt-2 border-t text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost/user:</span>
                      <span>${analysis.variableCostPerUser.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-foreground">Contribution:</span>
                      <span className={analysis.totalContribution >= 0 ? 'text-green-500' : 'text-red-500'}>
                        ${analysis.totalContribution.toFixed(0)}/mo
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ==================== AI PROVIDERS EDITOR ====================
const AIProvidersEditor: React.FC<{
  aiProviders: AIProvider[];
  setAiProviders: React.Dispatch<React.SetStateAction<AIProvider[]>>;
  ttsProviders: TTSProvider[];
  setTtsProviders: React.Dispatch<React.SetStateAction<TTSProvider[]>>;
  calculations: any;
}> = ({ aiProviders, setAiProviders, ttsProviders, setTtsProviders, calculations }) => {
  const [showAddAI, setShowAddAI] = useState(false);
  const [showAddTTS, setShowAddTTS] = useState(false);
  const [newAI, setNewAI] = useState<Partial<AIProvider>>({ name: '', provider: '', inputPer1M: 0, outputPer1M: 0, usagePercent: 10 });
  const [newTTS, setNewTTS] = useState<Partial<TTSProvider>>({ name: '', costPerMinute: 0, usagePercent: 10 });

  const addAIProvider = () => {
    if (newAI.name) {
      setAiProviders(prev => [...prev, {
        id: Date.now(),
        name: newAI.name || 'New Model',
        provider: newAI.provider || 'Custom',
        inputPer1M: newAI.inputPer1M || 0,
        outputPer1M: newAI.outputPer1M || 0,
        enabled: true,
        usagePercent: newAI.usagePercent || 10,
      }]);
      setNewAI({ name: '', provider: '', inputPer1M: 0, outputPer1M: 0, usagePercent: 10 });
      setShowAddAI(false);
    }
  };

  const addTTSProvider = () => {
    if (newTTS.name) {
      setTtsProviders(prev => [...prev, {
        id: Date.now(),
        name: newTTS.name || 'New TTS',
        costPerMinute: newTTS.costPerMinute || 0,
        enabled: true,
        usagePercent: newTTS.usagePercent || 10,
      }]);
      setNewTTS({ name: '', costPerMinute: 0, usagePercent: 10 });
      setShowAddTTS(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* AI Models */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            AI/LLM Providers
          </h4>
          <Dialog open={showAddAI} onOpenChange={setShowAddAI}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Add Model
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add AI Provider</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="col-span-2">
                  <Label>Model Name</Label>
                  <Input value={newAI.name || ''} onChange={(e) => setNewAI(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., GPT-4o" />
                </div>
                <div>
                  <Label>Provider</Label>
                  <Input value={newAI.provider || ''} onChange={(e) => setNewAI(prev => ({ ...prev, provider: e.target.value }))} placeholder="e.g., OpenAI" />
                </div>
                <div>
                  <Label>Usage %</Label>
                  <Input type="number" value={newAI.usagePercent || 0} onChange={(e) => setNewAI(prev => ({ ...prev, usagePercent: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Input $/1M tokens</Label>
                  <Input type="number" step="0.01" value={newAI.inputPer1M || 0} onChange={(e) => setNewAI(prev => ({ ...prev, inputPer1M: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Output $/1M tokens</Label>
                  <Input type="number" step="0.01" value={newAI.outputPer1M || 0} onChange={(e) => setNewAI(prev => ({ ...prev, outputPer1M: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddAI(false)}>Cancel</Button>
                <Button onClick={addAIProvider}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {aiProviders.map(ai => (
            <div key={ai.id} className={`p-3 rounded-lg border transition-colors ${ai.enabled ? 'border-primary/30 bg-primary/5' : 'border-muted bg-muted/30 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <Switch
                  checked={ai.enabled}
                  onCheckedChange={(checked) => setAiProviders(prev => prev.map(a => a.id === ai.id ? { ...a, enabled: checked, usagePercent: checked ? (a.usagePercent || 10) : 0 } : a))}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ai.name}</p>
                  <p className="text-xs text-muted-foreground">{ai.provider} • ${ai.inputPer1M}/{ai.outputPer1M}/1M</p>
                </div>
                {ai.enabled && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={ai.usagePercent}
                      onChange={(e) => setAiProviders(prev => prev.map(a => a.id === ai.id ? { ...a, usagePercent: parseInt(e.target.value) || 0 } : a))}
                      className="h-7 w-14 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAiProviders(prev => prev.filter(a => a.id !== ai.id))}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 bg-muted/50 rounded-lg text-sm">
          <span className="text-muted-foreground">Blended cost: </span>
          <span className="font-medium">${calculations?.blendedInputCost?.toFixed(3) || '0.000'}/${calculations?.blendedOutputCost?.toFixed(3) || '0.000'}/1M tokens</span>
        </div>
      </div>

      {/* TTS Providers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            TTS Providers
          </h4>
          <Dialog open={showAddTTS} onOpenChange={setShowAddTTS}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Add TTS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add TTS Provider</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="col-span-2">
                  <Label>Provider Name</Label>
                  <Input value={newTTS.name || ''} onChange={(e) => setNewTTS(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., ElevenLabs" />
                </div>
                <div>
                  <Label>Cost per Minute ($)</Label>
                  <Input type="number" step="0.001" value={newTTS.costPerMinute || 0} onChange={(e) => setNewTTS(prev => ({ ...prev, costPerMinute: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Usage %</Label>
                  <Input type="number" value={newTTS.usagePercent || 0} onChange={(e) => setNewTTS(prev => ({ ...prev, usagePercent: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddTTS(false)}>Cancel</Button>
                <Button onClick={addTTSProvider}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {ttsProviders.map(tts => (
            <div key={tts.id} className={`p-3 rounded-lg border transition-colors ${tts.enabled ? 'border-primary/30 bg-primary/5' : 'border-muted bg-muted/30 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <Switch
                  checked={tts.enabled}
                  onCheckedChange={(checked) => setTtsProviders(prev => prev.map(t => t.id === tts.id ? { ...t, enabled: checked, usagePercent: checked ? (t.usagePercent || 10) : 0 } : t))}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tts.name}</p>
                  <p className="text-xs text-muted-foreground">${tts.costPerMinute.toFixed(3)}/min</p>
                </div>
                {tts.enabled && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={tts.usagePercent}
                      onChange={(e) => setTtsProviders(prev => prev.map(t => t.id === tts.id ? { ...t, usagePercent: parseInt(e.target.value) || 0 } : t))}
                      className="h-7 w-14 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTtsProviders(prev => prev.filter(t => t.id !== tts.id))}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 bg-muted/50 rounded-lg text-sm">
          <span className="text-muted-foreground">Blended TTS cost: </span>
          <span className="font-medium">${calculations?.blendedTTSCost?.toFixed(3) || '0.000'}/min</span>
        </div>
      </div>
    </div>
  );
};

// ==================== FIXED COSTS EDITOR ====================
const FixedCostsEditor: React.FC<{
  fixedCosts: FixedCost[];
  setFixedCosts: React.Dispatch<React.SetStateAction<FixedCost[]>>;
}> = ({ fixedCosts, setFixedCosts }) => {
  const [showAddCost, setShowAddCost] = useState(false);
  const [newCost, setNewCost] = useState<Partial<FixedCost>>({ name: '', amount: 0, category: 'infrastructure', minCapacity: 0, maxCapacity: 1000, scaleFactor: 1 });

  const categories = ['infrastructure', 'overhead', 'personnel', 'marketing', 'tools'];
  const categoryColors: Record<string, string> = {
    infrastructure: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    overhead: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    personnel: 'bg-green-500/10 text-green-500 border-green-500/30',
    marketing: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    tools: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
  };

  const addCost = () => {
    if (newCost.name) {
      setFixedCosts(prev => [...prev, {
        id: Date.now(),
        name: newCost.name || 'New Cost',
        amount: newCost.amount || 0,
        category: newCost.category || 'infrastructure',
        minCapacity: newCost.minCapacity || 0,
        maxCapacity: newCost.maxCapacity || 1000,
        scaleFactor: newCost.scaleFactor || 1,
      }]);
      setNewCost({ name: '', amount: 0, category: 'infrastructure', minCapacity: 0, maxCapacity: 1000, scaleFactor: 1 });
      setShowAddCost(false);
    }
  };

  const totalByCategory = categories.reduce((acc, cat) => {
    acc[cat] = fixedCosts.filter(c => c.category === cat).reduce((sum, c) => sum + c.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  const totalFixed = fixedCosts.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Total Fixed Costs: </span>
            <span className="font-bold text-lg">${totalFixed.toLocaleString()}/mo</span>
          </div>
        </div>
        <Dialog open={showAddCost} onOpenChange={setShowAddCost}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add Cost
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Fixed Cost</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="col-span-2">
                <Label>Cost Name</Label>
                <Input value={newCost.name || ''} onChange={(e) => setNewCost(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Supabase Pro" />
              </div>
              <div>
                <Label>Monthly Amount ($)</Label>
                <Input type="number" value={newCost.amount || 0} onChange={(e) => setNewCost(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newCost.category} onValueChange={(v) => setNewCost(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Min Capacity (users)</Label>
                <Input type="number" value={newCost.minCapacity || 0} onChange={(e) => setNewCost(prev => ({ ...prev, minCapacity: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Max Capacity (users)</Label>
                <Input type="number" value={newCost.maxCapacity || 0} onChange={(e) => setNewCost(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddCost(false)}>Cancel</Button>
              <Button onClick={addCost}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-5 gap-2">
        {categories.map(cat => (
          <div key={cat} className={`p-3 rounded-lg border ${categoryColors[cat]}`}>
            <p className="text-xs font-medium capitalize">{cat}</p>
            <p className="text-lg font-bold">${totalByCategory[cat] || 0}</p>
          </div>
        ))}
      </div>

      {/* Cost Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
        {fixedCosts.map(cost => (
          <div key={cost.id} className={`p-3 rounded-lg border ${categoryColors[cost.category]}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <Input
                  value={cost.name}
                  onChange={(e) => setFixedCosts(prev => prev.map(c => c.id === cost.id ? { ...c, name: e.target.value } : c))}
                  className="h-6 text-sm font-medium bg-transparent border-none p-0 focus-visible:ring-0"
                />
              </div>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setFixedCosts(prev => prev.filter(c => c.id !== cost.id))}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">$</span>
              <Input
                type="number"
                value={cost.amount}
                onChange={(e) => setFixedCosts(prev => prev.map(c => c.id === cost.id ? { ...c, amount: parseFloat(e.target.value) || 0 } : c))}
                className="h-7 text-sm"
              />
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
            {cost.maxCapacity && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Supports {cost.minCapacity || 0} - {cost.maxCapacity} users
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== ACQUISITION EDITOR ====================
const AcquisitionEditor: React.FC<{
  acquisition: Acquisition;
  setAcquisition: React.Dispatch<React.SetStateAction<Acquisition>>;
  calculations: any;
}> = ({ acquisition, setAcquisition, calculations }) => {
  const updateField = (field: keyof Acquisition, value: number) => {
    setAcquisition(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Marketing Spend */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Marketing Spend
        </h4>
        <div className="space-y-3">
          {[
            { key: 'paidAdsSpend', label: 'Paid Ads', icon: DollarSign },
            { key: 'contentSpend', label: 'Content Marketing', icon: BookOpen },
            { key: 'affiliateSpend', label: 'Affiliates', icon: Users },
            { key: 'seoSpend', label: 'SEO/Organic', icon: TrendingUp },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <Label className="w-28 text-sm">{label}</Label>
              <div className="flex-1 flex items-center gap-1">
                <span className="text-xs text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={acquisition[key as keyof Acquisition] as number}
                  onChange={(e) => updateField(key as keyof Acquisition, parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
            <span className="font-medium">Total Marketing Spend</span>
            <span className="text-xl font-bold text-primary">${calculations?.totalMarketingSpend?.toLocaleString() || 0}/mo</span>
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Growth Metrics
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">New Customers/mo</Label>
              <Input
                type="number"
                value={acquisition.newCustomersPerMonth}
                onChange={(e) => updateField('newCustomersPerMonth', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Monthly Churn %</Label>
              <Input
                type="number"
                step="0.1"
                value={acquisition.churnRatePercent}
                onChange={(e) => updateField('churnRatePercent', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Avg Lifetime (months)</Label>
              <Input
                type="number"
                value={acquisition.avgLifetimeMonths}
                onChange={(e) => updateField('avgLifetimeMonths', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Expansion Revenue %</Label>
              <Input
                type="number"
                step="0.1"
                value={acquisition.expansionRevenuePercent}
                onChange={(e) => updateField('expansionRevenuePercent', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
          </div>

          <Separator />
          
          <h5 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Yearly Subscription Benefits
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Yearly Discount %</Label>
              <Input
                type="number"
                value={acquisition.yearlyDiscountPercent}
                onChange={(e) => updateField('yearlyDiscountPercent', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Yearly Adoption %</Label>
              <Input
                type="number"
                value={acquisition.yearlyAdoptionPercent}
                onChange={(e) => updateField('yearlyAdoptionPercent', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
          </div>
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm">
            <p className="text-green-600 font-medium">Yearly Subscription Benefits:</p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• Upfront cash: ${(calculations?.totalMRR * 12 * (acquisition.yearlyAdoptionPercent / 100) * (1 - acquisition.yearlyDiscountPercent / 100) || 0).toFixed(0)}</li>
              <li>• Reduced churn (locked in for 12 months)</li>
              <li>• Better LTV:CAC ratio</li>
            </ul>
          </div>
        </div>

        {/* Calculated Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">CAC</p>
            <p className="text-xl font-bold">${calculations?.cac?.toFixed(0) || 0}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">LTV</p>
            <p className="text-xl font-bold">${calculations?.ltv?.toFixed(0) || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPETITOR BENCHMARK EDITOR ====================
interface ExtendedCompetitor extends CompetitorBenchmark {
  segment?: string;
  strengths?: string[];
  weaknesses?: string[];
  genieDifferentiator?: string;
  features?: {
    aiVoiceover: boolean;
    scriptGeneration: boolean;
    mobileApp: boolean;
    teamCollab: boolean;
    hipaCompliant: boolean;
    approvalWorkflow: boolean;
  };
}

// Prepopulated competitor data from market analysis
const marketCompetitors: ExtendedCompetitor[] = [
  { 
    name: 'CapCut', 
    freeLimit: 'Unlimited (basic)', 
    starterPrice: 7.99, 
    proPrice: 7.99, 
    enterprisePrice: 0, 
    freeToPaidRate: 2,
    segment: 'Creator',
    strengths: ['Free tier dominates', 'TikTok ecosystem', 'Best mobile UX'],
    weaknesses: ['No AI voiceover', 'Limited collaboration', 'Consumer focus only'],
    genieDifferentiator: 'Script-first workflow, enterprise-grade security',
    features: { aiVoiceover: false, scriptGeneration: false, mobileApp: true, teamCollab: false, hipaCompliant: false, approvalWorkflow: false }
  },
  { 
    name: 'Descript', 
    freeLimit: '1 hour/mo', 
    starterPrice: 12, 
    proPrice: 24, 
    enterprisePrice: 40, 
    freeToPaidRate: 5,
    segment: 'Creator',
    strengths: ['Transcription-first editing', 'Overdub voice cloning', 'Word-based editing'],
    weaknesses: ['Expensive for features', 'Complex UI', 'No mobile app'],
    genieDifferentiator: 'Mobile-first, 50% cheaper, unified script-to-publish',
    features: { aiVoiceover: true, scriptGeneration: false, mobileApp: false, teamCollab: true, hipaCompliant: false, approvalWorkflow: false }
  },
  { 
    name: 'Loom', 
    freeLimit: '25 videos', 
    starterPrice: 12.50, 
    proPrice: 12.50, 
    enterprisePrice: 25, 
    freeToPaidRate: 8,
    segment: 'SMB',
    strengths: ['Frictionless recording', 'Quick sharing', 'Viewer analytics'],
    weaknesses: ['No real editing', 'No AI features', 'No TTS'],
    genieDifferentiator: 'Full AI editing suite, script generation, approval workflows',
    features: { aiVoiceover: false, scriptGeneration: false, mobileApp: true, teamCollab: true, hipaCompliant: false, approvalWorkflow: false }
  },
  { 
    name: 'Synthesia', 
    freeLimit: '3 mins free', 
    starterPrice: 22, 
    proPrice: 67, 
    enterprisePrice: 249, 
    freeToPaidRate: 3,
    segment: 'SMB',
    strengths: ['AI avatars (150+)', 'Multi-language (140)', 'Enterprise ready'],
    weaknesses: ['Expensive ($67/mo Teams)', 'Robotic feel', 'No mobile'],
    genieDifferentiator: '70% cheaper, natural TTS, real presenter + AI hybrid',
    features: { aiVoiceover: true, scriptGeneration: true, mobileApp: false, teamCollab: true, hipaCompliant: false, approvalWorkflow: true }
  },
  { 
    name: 'HeyGen', 
    freeLimit: '1 min/mo', 
    starterPrice: 29, 
    proPrice: 89, 
    enterprisePrice: 199, 
    freeToPaidRate: 4,
    segment: 'Enterprise',
    strengths: ['High-quality avatars', 'Good voice quality', 'API access'],
    weaknesses: ['Very expensive', 'Limited free tier', 'Complex pricing'],
    genieDifferentiator: 'More affordable, integrated workflow, HIPAA option',
    features: { aiVoiceover: true, scriptGeneration: true, mobileApp: false, teamCollab: true, hipaCompliant: false, approvalWorkflow: true }
  },
  { 
    name: 'Pictory', 
    freeLimit: '3 videos/mo', 
    starterPrice: 23, 
    proPrice: 47, 
    enterprisePrice: 119, 
    freeToPaidRate: 3,
    segment: 'SMB',
    strengths: ['Blog-to-video', 'Auto-captions', 'Stock media'],
    weaknesses: ['Limited editing', 'No live recording', 'Basic TTS'],
    genieDifferentiator: 'Live recording, better TTS, healthcare compliant',
    features: { aiVoiceover: true, scriptGeneration: true, mobileApp: false, teamCollab: false, hipaCompliant: false, approvalWorkflow: false }
  },
  { 
    name: 'Canva Video', 
    freeLimit: 'Limited exports', 
    starterPrice: 12.99, 
    proPrice: 12.99, 
    enterprisePrice: 30, 
    freeToPaidRate: 6,
    segment: 'SMB',
    strengths: ['Brand kits', 'Design ecosystem', 'Huge template library'],
    weaknesses: ['Basic video editing', 'No AI narration', 'Not video-first'],
    genieDifferentiator: 'AI TTS, script-first workflow, advanced video editing',
    features: { aiVoiceover: false, scriptGeneration: false, mobileApp: true, teamCollab: true, hipaCompliant: false, approvalWorkflow: false }
  },
  { 
    name: 'VIDIZMO', 
    freeLimit: 'None', 
    starterPrice: 500, 
    proPrice: 1000, 
    enterprisePrice: 2000, 
    freeToPaidRate: 0,
    segment: 'Healthcare',
    strengths: ['Enterprise security', 'Compliance features', 'Large deployments'],
    weaknesses: ['Very expensive', 'Complex setup', 'Overkill for small teams'],
    genieDifferentiator: '90% cost savings, HIPAA at $50-200/mo vs $1000+',
    features: { aiVoiceover: false, scriptGeneration: false, mobileApp: false, teamCollab: true, hipaCompliant: true, approvalWorkflow: true }
  },
];

// Genie features for comparison
const genieFeatures = {
  aiVoiceover: true,
  scriptGeneration: true,
  mobileApp: true,
  teamCollab: true,
  hipaCompliant: true,
  approvalWorkflow: true,
};

const CompetitorBenchmarkEditor: React.FC<{
  competitors: CompetitorBenchmark[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorBenchmark[]>>;
  pricingTiers: PricingTier[];
}> = ({ competitors, setCompetitors, pricingTiers }) => {
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [showFeatureComparison, setShowFeatureComparison] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [newCompetitor, setNewCompetitor] = useState<Partial<CompetitorBenchmark>>({
    name: '', freeLimit: '', starterPrice: 0, proPrice: 0, enterprisePrice: 0, freeToPaidRate: 0
  });

  const addCompetitor = () => {
    if (newCompetitor.name) {
      setCompetitors(prev => [...prev, newCompetitor as CompetitorBenchmark]);
      setNewCompetitor({ name: '', freeLimit: '', starterPrice: 0, proPrice: 0, enterprisePrice: 0, freeToPaidRate: 0 });
      setShowAddCompetitor(false);
    }
  };

  const addFromMarket = (marketComp: ExtendedCompetitor) => {
    const exists = competitors.some(c => c.name === marketComp.name);
    if (!exists) {
      setCompetitors(prev => [...prev, {
        name: marketComp.name,
        freeLimit: marketComp.freeLimit,
        starterPrice: marketComp.starterPrice,
        proPrice: marketComp.proPrice,
        enterprisePrice: marketComp.enterprisePrice,
        freeToPaidRate: marketComp.freeToPaidRate,
      }]);
    }
  };

  const segments = ['all', ...new Set(marketCompetitors.map(c => c.segment).filter(Boolean))];
  const filteredMarketCompetitors = selectedSegment === 'all' 
    ? marketCompetitors 
    : marketCompetitors.filter(c => c.segment === selectedSegment);

  const avgStarterPrice = competitors.length > 0 ? competitors.reduce((sum, c) => sum + c.starterPrice, 0) / competitors.length : 0;
  const avgProPrice = competitors.length > 0 ? competitors.reduce((sum, c) => sum + c.proPrice, 0) / competitors.length : 0;
  const avgEnterprisePrice = competitors.length > 0 ? competitors.reduce((sum, c) => sum + c.enterprisePrice, 0) / competitors.length : 0;
  const yourStarterPrice = pricingTiers.find(t => !t.isFreeTier)?.price || 0;
  const yourProPrice = pricingTiers.filter(t => !t.isFreeTier)[1]?.price || 0;
  const yourEnterprisePrice = pricingTiers.filter(t => !t.isFreeTier).slice(-1)[0]?.price || 0;

  // Calculate sweet spot
  const sweetSpotStarter = { min: avgStarterPrice * 0.7, max: avgStarterPrice * 0.95 };
  const sweetSpotPro = { min: avgProPrice * 0.7, max: avgProPrice * 0.95 };

  // Feature comparison data
  const featureLabels: Record<string, string> = {
    aiVoiceover: 'AI Voiceover/TTS',
    scriptGeneration: 'Script Generation',
    mobileApp: 'Mobile App',
    teamCollab: 'Team Collaboration',
    hipaCompliant: 'HIPAA Compliant',
    approvalWorkflow: 'Approval Workflow',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Benchmark against competitors to find optimal pricing</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant={showFeatureComparison ? 'default' : 'outline'}
            onClick={() => setShowFeatureComparison(!showFeatureComparison)}
          >
            <Layers className="w-4 h-4 mr-1" /> Feature Matrix
          </Button>
          <Dialog open={showAddCompetitor} onOpenChange={setShowAddCompetitor}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Add Custom
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Competitor</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="col-span-2">
                  <Label>Competitor Name</Label>
                  <Input value={newCompetitor.name || ''} onChange={(e) => setNewCompetitor(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <Label>Free Tier Limit</Label>
                  <Input value={newCompetitor.freeLimit || ''} onChange={(e) => setNewCompetitor(prev => ({ ...prev, freeLimit: e.target.value }))} placeholder="e.g., 5 videos/mo" />
                </div>
                <div>
                  <Label>Starter Price</Label>
                  <Input type="number" value={newCompetitor.starterPrice || 0} onChange={(e) => setNewCompetitor(prev => ({ ...prev, starterPrice: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Pro Price</Label>
                  <Input type="number" value={newCompetitor.proPrice || 0} onChange={(e) => setNewCompetitor(prev => ({ ...prev, proPrice: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Enterprise Price</Label>
                  <Input type="number" value={newCompetitor.enterprisePrice || 0} onChange={(e) => setNewCompetitor(prev => ({ ...prev, enterprisePrice: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Free→Paid Rate %</Label>
                  <Input type="number" value={newCompetitor.freeToPaidRate || 0} onChange={(e) => setNewCompetitor(prev => ({ ...prev, freeToPaidRate: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddCompetitor(false)}>Cancel</Button>
                <Button onClick={addCompetitor}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Market Competitors to Add */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">📊 Market Analysis Data (Click to Add)</h4>
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-32 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {segments.map(seg => (
                <SelectItem key={seg} value={seg} className="text-xs">
                  {seg === 'all' ? 'All Segments' : seg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredMarketCompetitors.map(comp => {
            const isAdded = competitors.some(c => c.name === comp.name);
            return (
              <Button
                key={comp.name}
                size="sm"
                variant={isAdded ? 'secondary' : 'outline'}
                className="text-xs h-7"
                onClick={() => !isAdded && addFromMarket(comp)}
                disabled={isAdded}
              >
                {isAdded ? <Check className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                {comp.name} (${comp.starterPrice})
                <Badge variant="outline" className="ml-1 text-[10px]">{comp.segment}</Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      {showFeatureComparison && (
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Feature Comparison Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-1 font-medium">Feature</th>
                    <th className="text-center py-2 px-1 font-medium bg-primary/10">Genie</th>
                    {marketCompetitors.filter(c => competitors.some(cc => cc.name === c.name)).map(c => (
                      <th key={c.name} className="text-center py-2 px-1 font-medium">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(featureLabels).map(([key, label]) => (
                    <tr key={key} className="border-b border-muted">
                      <td className="py-2 px-1">{label}</td>
                      <td className="text-center py-2 px-1 bg-primary/5">
                        {genieFeatures[key as keyof typeof genieFeatures] ? 
                          <Check className="w-4 h-4 text-green-500 mx-auto" /> : 
                          <X className="w-4 h-4 text-red-400 mx-auto" />}
                      </td>
                      {marketCompetitors.filter(c => competitors.some(cc => cc.name === c.name)).map(c => (
                        <td key={c.name} className="text-center py-2 px-1">
                          {c.features?.[key as keyof typeof genieFeatures] ? 
                            <Check className="w-4 h-4 text-green-500 mx-auto" /> : 
                            <X className="w-4 h-4 text-red-400 mx-auto" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t-2 border-primary/30 bg-muted/30">
                    <td className="py-2 px-1 font-medium">Starter Price</td>
                    <td className="text-center py-2 px-1 font-bold text-primary">${yourStarterPrice}</td>
                    {marketCompetitors.filter(c => competitors.some(cc => cc.name === c.name)).map(c => (
                      <td key={c.name} className="text-center py-2 px-1">${c.starterPrice}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-500/30">
              <p className="text-xs font-medium text-green-700 dark:text-green-400">
                💡 Genie Advantage: All 6 features at ${yourStarterPrice}/mo vs competitors averaging ${avgStarterPrice.toFixed(0)}/mo with fewer features
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sweet Spot Analysis */}
      {competitors.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-500/30">
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Sweet Spot (Starter)</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-400">
                ${sweetSpotStarter.min.toFixed(0)} - ${sweetSpotStarter.max.toFixed(0)}
              </p>
              <Badge variant={yourStarterPrice >= sweetSpotStarter.min && yourStarterPrice <= sweetSpotStarter.max ? 'default' : 'secondary'} className="mt-1">
                You: ${yourStarterPrice} {yourStarterPrice < sweetSpotStarter.min ? '↓ Low' : yourStarterPrice > sweetSpotStarter.max ? '↑ High' : '✓ Optimal'}
              </Badge>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-500/30">
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Sweet Spot (Pro)</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                ${sweetSpotPro.min.toFixed(0)} - ${sweetSpotPro.max.toFixed(0)}
              </p>
              <Badge variant={yourProPrice >= sweetSpotPro.min && yourProPrice <= sweetSpotPro.max ? 'default' : 'secondary'} className="mt-1">
                You: ${yourProPrice} {yourProPrice < sweetSpotPro.min ? '↓ Low' : yourProPrice > sweetSpotPro.max ? '↑ High' : '✓ Optimal'}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Competitor Avg (Starter)</p>
              <p className="text-lg font-bold">${avgStarterPrice.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">
                Your discount: {avgStarterPrice > 0 ? ((1 - yourStarterPrice / avgStarterPrice) * 100).toFixed(0) : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Competitor Avg (Pro)</p>
              <p className="text-lg font-bold">${avgProPrice.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">
                Your discount: {avgProPrice > 0 ? ((1 - yourProPrice / avgProPrice) * 100).toFixed(0) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Competitor Cards with Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {competitors.map((comp, idx) => {
          const marketData = marketCompetitors.find(m => m.name === comp.name);
          return (
            <Card key={idx} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">{comp.name}</CardTitle>
                    {marketData?.segment && (
                      <Badge variant="outline" className="text-[10px]">{marketData.segment}</Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCompetitors(prev => prev.filter((_, i) => i !== idx))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Free:</span>
                    <span>{comp.freeLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Free→Paid:</span>
                    <span>{comp.freeToPaidRate}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 p-2 bg-muted/50 rounded">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Starter</p>
                    <p className="font-bold">${comp.starterPrice}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Pro</p>
                    <p className="font-bold">${comp.proPrice}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Enterprise</p>
                    <p className="font-bold">${comp.enterprisePrice}</p>
                  </div>
                </div>
                {marketData && (
                  <>
                    {marketData.weaknesses && (
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-[10px]">
                        <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">Their Gaps:</p>
                        <p className="text-muted-foreground">{marketData.weaknesses.slice(0, 2).join(', ')}</p>
                      </div>
                    )}
                    {marketData.genieDifferentiator && (
                      <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded text-[10px]">
                        <p className="font-medium text-green-700 dark:text-green-400 mb-1">Our Advantage:</p>
                        <p className="text-muted-foreground">{marketData.genieDifferentiator}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {competitors.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No competitors added yet. Click buttons above to add from market data.</p>
        </div>
      )}
    </div>
  );
};

// ==================== RESULTS DASHBOARD ====================
const ResultsDashboard: React.FC<{
  calculations: any;
  recommendations: Recommendation[];
  pricingTiers: PricingTier[];
}> = ({ calculations, recommendations, pricingTiers }) => {
  const fmt = (n: number, decimals = 0) => `$${n.toLocaleString(undefined, { maximumFractionDigits: decimals })}`;

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
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

      {/* Main Content: Tiers + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Economics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Unit Economics by Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {calculations.tierAnalysis?.map((tier: TierAnalysis) => (
                <div key={tier.tier} className={`p-3 rounded-lg border ${
                  tier.isFreeTier ? 'border-green-500/30 bg-green-500/5' :
                  tier.marginPercent >= 40 ? 'border-primary/30 bg-primary/5' :
                  tier.marginPercent >= 0 ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-red-500/30 bg-red-500/5'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {tier.isFreeTier && <Gift className="w-4 h-4 text-green-500" />}
                      <span className="font-medium">{tier.tier}</span>
                      <span className="text-xs text-muted-foreground">({tier.subscribers} users)</span>
                    </div>
                    <Badge variant={tier.marginPercent >= 40 ? 'default' : tier.marginPercent >= 0 ? 'secondary' : 'destructive'}>
                      {tier.marginPercent.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <span className="ml-1 font-medium">{fmt(tier.price)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="ml-1 font-medium">{fmt(tier.variableCostPerUser, 2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="ml-1 font-medium">{fmt(tier.totalRevenue)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Profit:</span>
                      <span className={`ml-1 font-medium ${tier.totalContribution >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {fmt(tier.totalContribution)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] text-center">
                    <div className="bg-background/50 rounded p-1">
                      <p className="font-bold">{tier.videosPerMonth}</p>
                      <p className="text-muted-foreground">videos/user</p>
                    </div>
                    <div className="bg-background/50 rounded p-1">
                      <p className="font-bold">{tier.scriptsPerMonth}</p>
                      <p className="text-muted-foreground">scripts/user</p>
                    </div>
                    <div className="bg-background/50 rounded p-1">
                      <p className="font-bold">{tier.ttsMinutesPerMonth}</p>
                      <p className="text-muted-foreground">TTS min/user</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Smart Recommendations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              Smart Recommendations
              <Badge variant="outline" className="ml-auto">{recommendations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
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

      {/* Profitability Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            12-Month Profitability Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2">
            {calculations.monthlyProjection?.map((m: any) => (
              <div key={m.month} className={`p-2 rounded-lg text-center ${m.isProfitable ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <p className="text-xs text-muted-foreground">M{m.month}</p>
                <p className={`text-sm font-bold ${m.isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                  {m.netProfit >= 0 ? '+' : ''}{(m.netProfit / 1000).toFixed(0)}k
                </p>
                <p className="text-[10px] text-muted-foreground">{m.customers} users</p>
              </div>
            ))}
          </div>
          {calculations.firstProfitableMonth && (
            <p className="text-sm text-green-500 font-medium mt-3 text-center">
              ✓ Break-even at Month {calculations.firstProfitableMonth}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== CONNECTED SEGMENT TAB ====================
const ConnectedSegmentsTab: React.FC<{ calculations: any; pricingTiers: PricingTier[] }> = ({ calculations, pricingTiers }) => {
  const segments = segmentPricingProfiles.map(segment => {
    const bundle = segmentBundles.find(b => b.segment === segment.id);
    const recommendedTier = pricingTiers.find(t => {
      const threshold = parseFloat(segment.priceThreshold.replace(/[^0-9.]/g, ''));
      return t.price <= threshold && t.price > 0;
    });
    
    return {
      ...segment,
      bundle,
      recommendedTier: recommendedTier?.name || 'Custom',
      potentialMRR: recommendedTier ? recommendedTier.price * (parseInt(segment.marketSize.replace(/[^0-9]/g, '')) / 1000) : 0,
    };
  });

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
    <div className="space-y-4">
      <div className="p-4 bg-primary/10 rounded-lg">
        <h4 className="font-medium mb-2">Segment Analysis Based on Your Pricing</h4>
        <p className="text-sm text-muted-foreground">
          Segments are matched to your tiers based on their price thresholds. Your current tiers: {pricingTiers.filter(t => !t.isFreeTier).map(t => `${t.name} ($${t.price})`).join(', ')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map(segment => (
          <Card key={segment.id} className="h-full hover:shadow-lg transition-shadow">
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
            <CardContent className="space-y-3">
              <div className="p-2 rounded bg-muted/50 text-xs">
                <p className="text-muted-foreground">Recommended Tier:</p>
                <p className="font-semibold text-primary">{segment.recommendedTier}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Threshold</p>
                  <p className="font-medium">{segment.priceThreshold}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Current Spend</p>
                  <p className="font-medium">{segment.currentSpend}</p>
                </div>
              </div>

              {segment.bundle && (
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs">{segment.bundle.bundleName}</span>
                    <Badge variant="default" className="bg-green-600 text-xs">{segment.bundle.price}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ==================== CONNECTED MODELS TAB ====================
const ConnectedModelsTab: React.FC<{ calculations: any }> = ({ calculations }) => {
  const modelsWithMetrics = pricingModels.map(model => ({
    ...model,
    estimatedMargin: model.id === 'usage' ? calculations.grossMargin * 0.9 :
                     model.id === 'tiered' ? calculations.grossMargin :
                     model.id === 'hybrid' ? calculations.grossMargin * 1.1 : calculations.grossMargin,
    fitScore: model.id === 'tiered' ? 95 : model.id === 'hybrid' ? 85 : 70,
  }));

  return (
    <div className="space-y-4">
      <div className="p-4 bg-primary/10 rounded-lg">
        <h4 className="font-medium mb-2">Pricing Model Analysis</h4>
        <p className="text-sm text-muted-foreground">
          Based on your current gross margin of {calculations.grossMargin?.toFixed(1) || 0}%, here's how different models would perform.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modelsWithMetrics.map((model) => (
          <Card key={model.id} className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={model.complexity === 'Low' ? 'secondary' : model.complexity === 'Medium' ? 'outline' : 'destructive'}>
                    {model.complexity}
                  </Badge>
                  <Badge variant="default">{model.fitScore}% fit</Badge>
                </div>
              </div>
              <CardDescription>{model.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-2 rounded bg-muted/50 font-mono text-sm">{model.example}</div>
              <div className="p-2 rounded bg-primary/10 text-center">
                <p className="text-xs text-muted-foreground">Est. Gross Margin</p>
                <p className="text-lg font-bold text-primary">{model.estimatedMargin?.toFixed(1)}%</p>
              </div>
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
    </div>
  );
};

// ==================== CONNECTED MOBILE TAB ====================
const ConnectedMobileTab: React.FC<{ pricingTiers: PricingTier[]; calculations: any }> = ({ pricingTiers, calculations }) => {
  const mobileTiers = [
    { 
      name: 'Free', 
      price: 0, 
      yearlyPrice: 0,
      features: ['3 videos/month', '720p export', '5 TTS voices'], 
      match: pricingTiers.find(t => t.isFreeTier) 
    },
    { 
      name: 'Mobile Pro', 
      price: 4.99, 
      yearlyPrice: 49,
      features: ['Unlimited videos', '4K export', 'All TTS voices'], 
      match: pricingTiers.find(t => t.price > 0 && t.price < 15) 
    },
    { 
      name: 'Desktop + Mobile', 
      price: 12.99, 
      yearlyPrice: 129,
      features: ['Full desktop access', 'Full mobile access', 'Cross-device sync'], 
      match: pricingTiers.find(t => t.price >= 15 && t.price < 30) 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Synced Data Summary */}
      <Card className="bg-primary/5 border-primary/30">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Desktop Paid</p>
              <p className="text-xl font-bold">{calculations.totalPaidCustomers || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Desktop MRR</p>
              <p className="text-xl font-bold">${(calculations.totalMRR || 0).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Yearly Customers</p>
              <p className="text-xl font-bold">{calculations.yearlyCustomers || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Yearly Upfront</p>
              <p className="text-xl font-bold text-green-600">${(calculations.yearlyUpfrontCash || 0).toFixed(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Mobile App Pricing Strategy
          </CardTitle>
          <CardDescription>
            Derived from calculator. Yearly adoption at {calculations.yearlyAdoptionPercent || 0}% with {calculations.yearlyDiscountPercent || 0}% discount.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mobileTiers.map((tier, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${idx === 1 ? 'border-2 border-primary bg-primary/5 relative' : 'bg-muted/30'}`}>
                {idx === 1 && <Badge className="absolute -top-2 right-4">Popular</Badge>}
                <div className="flex items-center gap-2 mb-3">
                  {tier.price === 0 ? <Gift className="w-5 h-5 text-green-500" /> : 
                   idx === 1 ? <Zap className="w-5 h-5 text-primary" /> : 
                   <Crown className="w-5 h-5 text-amber-500" />}
                  <h4 className="font-semibold">{tier.name}</h4>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <p className={`text-2xl font-bold ${idx === 1 ? 'text-primary' : ''}`}>
                    ${tier.price}<span className="text-sm text-muted-foreground">/mo</span>
                  </p>
                  {tier.yearlyPrice > 0 && (
                    <p className="text-sm text-muted-foreground">
                      or ${tier.yearlyPrice}/yr
                    </p>
                  )}
                </div>
                <ul className="space-y-2 text-sm">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {tier.match && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    Maps to: <span className="text-primary font-medium">{tier.match.name}</span> (${tier.match.price}/mo)
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== CONNECTED COMPARISON TAB ====================
const ConnectedComparisonTab: React.FC<{ calculations: any; recommendations: Recommendation[] }> = ({ calculations, recommendations }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">MRR</p>
              <p className="text-lg font-bold">${(calculations.totalMRR || 0).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gross Margin</p>
              <p className="text-lg font-bold">{(calculations.grossMargin || 0).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">LTV:CAC</p>
              <p className="text-lg font-bold">{(calculations.ltvCacRatio || 0).toFixed(2)}x</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Break-even</p>
              <p className="text-lg font-bold">{calculations.monthsToBreakeven === Infinity ? '∞' : `${calculations.monthsToBreakeven} mo`}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Yearly Cash</p>
              <p className="text-lg font-bold text-green-600">${(calculations.yearlyUpfrontCash || 0).toFixed(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Recommendations from Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Smart Recommendations (Based on Your Data)
          </CardTitle>
          <CardDescription>
            {recommendations.length} recommendations based on your current tier structure and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${
                  rec.priority === 1 ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
                  rec.priority === 2 ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' :
                  rec.positive ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
                  'bg-muted/30'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {rec.positive ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                       rec.priority === 1 ? <AlertCircle className="w-4 h-4 text-red-500" /> :
                       <Lightbulb className="w-4 h-4 text-amber-500" />}
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                    </div>
                    <Badge variant={
                      rec.impact === 'Critical' ? 'destructive' :
                      rec.impact === 'High' ? 'default' : 'secondary'
                    }>
                      {rec.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{rec.issue}</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.actions.slice(0, 3).map((action, aidx) => (
                      <Badge key={aidx} variant="outline" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Enter data in the Calculator tab to see personalized recommendations
            </p>
          )}
        </CardContent>
      </Card>

      {/* Yearly vs Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Monthly vs Yearly Subscription Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-3">Monthly Subscriptions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customers</span>
                  <span className="font-medium">{calculations.monthlyCustomers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Revenue</span>
                  <span className="font-medium">${(calculations.monthlyRevenue || 0).toFixed(0)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Value</span>
                  <span className="font-medium">${((calculations.monthlyRevenue || 0) * 12).toFixed(0)}/yr</span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-500/30">
              <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">Yearly Subscriptions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customers ({calculations.yearlyAdoptionPercent || 0}%)</span>
                  <span className="font-medium">{calculations.yearlyCustomers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upfront Cash</span>
                  <span className="font-medium text-green-600">${(calculations.yearlyUpfrontCash || 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount Given</span>
                  <span className="font-medium">{calculations.yearlyDiscountPercent || 0}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {calculations.yearlySavingsPerCustomer && calculations.yearlySavingsPerCustomer.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Per-Tier Yearly Savings</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Tier</th>
                      <th className="text-right py-2">Monthly</th>
                      <th className="text-right py-2">Yearly</th>
                      <th className="text-right py-2">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.yearlySavingsPerCustomer.filter((t: any) => t.monthlyPrice > 0).map((tier: any, idx: number) => (
                      <tr key={idx} className="border-b border-muted">
                        <td className="py-2">{tier.tier}</td>
                        <td className="text-right">${tier.monthlyPrice}/mo</td>
                        <td className="text-right">${tier.yearlyPrice}/yr</td>
                        <td className="text-right text-green-600">{tier.savingsPercent.toFixed(0)}% off</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Pricing Permutations</CardTitle>
          <CardDescription>
            Evaluated against your current tier structure with {calculations.tierAnalysis?.length || 0} tiers
          </CardDescription>
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
  );
};



// ==================== MAIN TAB COMPONENT ====================
export const PricingStrategyTab: React.FC = () => {
  const [subTab, setSubTab] = useState('calculator');
  const [wizardMode, setWizardMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // LIFTED STATE - shared across all tabs
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    { id: 1, name: 'Free', price: 0, yearlyPrice: 0, customers: 5000, inputTokens: 50000, outputTokens: 25000, ttsMinutes: 1, storageGB: 1, videosPerMonth: 3, isFreeTier: true },
    { id: 2, name: 'Starter', price: 9.99, yearlyPrice: 99, customers: 500, inputTokens: 200000, outputTokens: 100000, ttsMinutes: 10, storageGB: 5, videosPerMonth: 15, isFreeTier: false },
    { id: 3, name: 'Creator', price: 19.99, yearlyPrice: 199, customers: 200, inputTokens: 500000, outputTokens: 250000, ttsMinutes: 30, storageGB: 25, videosPerMonth: 50, isFreeTier: false },
    { id: 4, name: 'Business', price: 49.99, yearlyPrice: 499, customers: 50, inputTokens: 1500000, outputTokens: 750000, ttsMinutes: 100, storageGB: 100, videosPerMonth: 150, isFreeTier: false },
    { id: 5, name: 'Pro', price: 99.99, yearlyPrice: 999, customers: 20, inputTokens: 5000000, outputTokens: 2500000, ttsMinutes: 300, storageGB: 500, videosPerMonth: 500, isFreeTier: false },
    { id: 6, name: 'Healthcare', price: 199.99, yearlyPrice: 1999, customers: 10, inputTokens: 10000000, outputTokens: 5000000, ttsMinutes: 600, storageGB: 1000, videosPerMonth: 1000, isFreeTier: false },
  ]);

  const [aiProviders, setAiProviders] = useState<AIProvider[]>([
    { id: 1, name: 'Gemini 2.0 Flash', provider: 'Google', inputPer1M: 0.075, outputPer1M: 0.30, enabled: true, usagePercent: 50 },
    { id: 2, name: 'Gemini 2.5 Pro', provider: 'Google', inputPer1M: 1.25, outputPer1M: 5.00, enabled: true, usagePercent: 20 },
    { id: 3, name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPer1M: 3.00, outputPer1M: 15.00, enabled: true, usagePercent: 20 },
    { id: 4, name: 'GPT-4o Mini', provider: 'OpenAI', inputPer1M: 0.15, outputPer1M: 0.60, enabled: true, usagePercent: 10 },
    { id: 5, name: 'Claude 3 Haiku', provider: 'Anthropic', inputPer1M: 0.25, outputPer1M: 1.25, enabled: false, usagePercent: 0 },
  ]);

  const [ttsProviders, setTtsProviders] = useState<TTSProvider[]>([
    { id: 1, name: 'ElevenLabs Pro', costPerMinute: 0.18, enabled: true, usagePercent: 70 },
    { id: 2, name: 'OpenAI TTS', costPerMinute: 0.015, enabled: true, usagePercent: 25 },
    { id: 3, name: 'Google Cloud TTS', costPerMinute: 0.016, enabled: true, usagePercent: 5 },
  ]);

  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([
    { id: 1, name: 'Supabase Pro', amount: 25, category: 'infrastructure', minCapacity: 0, maxCapacity: 10000 },
    { id: 2, name: 'Vercel Pro', amount: 20, category: 'infrastructure', minCapacity: 0, maxCapacity: 50000 },
    { id: 3, name: 'Resend Pro', amount: 20, category: 'infrastructure', minCapacity: 0, maxCapacity: 100000 },
    { id: 4, name: 'Analytics (PostHog)', amount: 0, category: 'tools', minCapacity: 0, maxCapacity: 1000000 },
    { id: 5, name: 'Monitoring (Sentry)', amount: 26, category: 'tools', minCapacity: 0, maxCapacity: 100000 },
    { id: 6, name: 'CDN/Bandwidth', amount: 50, category: 'infrastructure', minCapacity: 0, maxCapacity: 1000000 },
    { id: 7, name: 'Storage Overage', amount: 100, category: 'infrastructure', minCapacity: 1000, maxCapacity: 10000 },
    { id: 8, name: 'Domain/SSL', amount: 15, category: 'overhead', minCapacity: 0, maxCapacity: 1000000 },
  ]);

  const [acquisition, setAcquisition] = useState<Acquisition>({
    paidAdsSpend: 2000,
    contentSpend: 1500,
    affiliateSpend: 500,
    seoSpend: 500,
    newCustomersPerMonth: 50,
    churnRatePercent: 5,
    avgLifetimeMonths: 18,
    expansionRevenuePercent: 12,
    yearlyDiscountPercent: 17,
    yearlyAdoptionPercent: 30,
  });

  const [competitors, setCompetitors] = useState<CompetitorBenchmark[]>([
    { name: 'Pictory', freeLimit: '3 videos/mo', starterPrice: 23, proPrice: 47, enterprisePrice: 119, freeToPaidRate: 3 },
    { name: 'Synthesia', freeLimit: '3 mins free', starterPrice: 29, proPrice: 89, enterprisePrice: 249, freeToPaidRate: 2.5 },
    { name: 'HeyGen', freeLimit: '1 min/mo', starterPrice: 29, proPrice: 89, enterprisePrice: 199, freeToPaidRate: 4 },
  ]);

  const storageCostPerGB = 0.023;

  // SHARED CALCULATIONS
  const calculations = useMemo(() => {
    const totalCustomers = pricingTiers.reduce((sum, t) => sum + t.customers, 0);
    const paidTiers = pricingTiers.filter(t => !t.isFreeTier);
    const totalPaidCustomers = paidTiers.reduce((sum, t) => sum + t.customers, 0);
    const freeTierCustomers = pricingTiers.filter(t => t.isFreeTier).reduce((sum, t) => sum + t.customers, 0);
    const totalMRR = pricingTiers.reduce((sum, t) => sum + (t.price * t.customers), 0);
    const totalARR = totalMRR * 12;

    // Blended AI costs
    const enabledAI = aiProviders.filter(p => p.enabled);
    const totalAIPercent = enabledAI.reduce((sum, p) => sum + p.usagePercent, 0) || 100;
    const blendedInputCost = enabledAI.reduce((sum, ai) => sum + (ai.inputPer1M * (ai.usagePercent / totalAIPercent)), 0);
    const blendedOutputCost = enabledAI.reduce((sum, ai) => sum + (ai.outputPer1M * (ai.usagePercent / totalAIPercent)), 0);

    // Blended TTS costs
    const enabledTTS = ttsProviders.filter(p => p.enabled);
    const totalTTSPercent = enabledTTS.reduce((sum, p) => sum + p.usagePercent, 0) || 100;
    const blendedTTSCost = enabledTTS.reduce((sum, tts) => sum + (tts.costPerMinute * (tts.usagePercent / totalTTSPercent)), 0);

    // Tier analysis
    const tierAnalysis: TierAnalysis[] = pricingTiers.map(tier => {
      const aiCost = (tier.inputTokens / 1000000 * blendedInputCost) + (tier.outputTokens / 1000000 * blendedOutputCost);
      const ttsCost = tier.ttsMinutes * blendedTTSCost;
      const storageCost = tier.storageGB * storageCostPerGB;
      const variableCost = aiCost + ttsCost + storageCost;
      const contribution = tier.price - variableCost;
      const marginPercent = tier.price > 0 ? (contribution / tier.price) * 100 : (variableCost > 0 ? -100 : 0);

      return {
        tier: tier.name,
        isFreeTier: tier.isFreeTier,
        subscribers: tier.customers,
        price: tier.price,
        yearlyPrice: tier.yearlyPrice,
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

    // Break-even
    const avgVariableCostPerCustomer = totalPaidCustomers > 0 
      ? tierAnalysis.filter(t => !t.isFreeTier).reduce((sum, t) => sum + t.variableCostPerUser * t.subscribers, 0) / totalPaidCustomers 
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

    const paybackPeriod = contributionMargin > 0 ? cac / contributionMargin : Infinity;

    // Production capacity
    const totalVideosProduced = tierAnalysis.reduce((sum, t) => sum + (t.videosPerMonth * t.subscribers), 0);
    const totalScriptsProduced = tierAnalysis.reduce((sum, t) => sum + (t.scriptsPerMonth * t.subscribers), 0);
    const totalTTSMinutes = tierAnalysis.reduce((sum, t) => sum + (t.ttsMinutesPerMonth * t.subscribers), 0);
    const totalAICosts = tierAnalysis.reduce((sum, t) => sum + (t.aiCostPerUser * t.subscribers), 0);
    const aiCostPercent = totalMRR > 0 ? (totalAICosts / totalMRR) * 100 : 0;

    // YEARLY SUBSCRIPTION ANALYSIS
    const yearlyCustomers = Math.round(totalPaidCustomers * (acquisition.yearlyAdoptionPercent / 100));
    const monthlyCustomers = totalPaidCustomers - yearlyCustomers;
    const yearlyMRREquivalent = paidTiers.reduce((sum, tier) => {
      const tierYearlyCustomers = Math.round(tier.customers * (acquisition.yearlyAdoptionPercent / 100));
      return sum + ((tier.yearlyPrice / 12) * tierYearlyCustomers);
    }, 0);
    const yearlyUpfrontCash = paidTiers.reduce((sum, tier) => {
      const tierYearlyCustomers = Math.round(tier.customers * (acquisition.yearlyAdoptionPercent / 100));
      return sum + (tier.yearlyPrice * tierYearlyCustomers);
    }, 0);
    const monthlyRevenue = paidTiers.reduce((sum, tier) => {
      const tierMonthlyCustomers = tier.customers - Math.round(tier.customers * (acquisition.yearlyAdoptionPercent / 100));
      return sum + (tier.price * tierMonthlyCustomers);
    }, 0);
    const yearlySavingsPerCustomer = paidTiers.map(tier => ({
      tier: tier.name,
      monthlyPrice: tier.price,
      yearlyPrice: tier.yearlyPrice,
      monthlyAnnualized: tier.price * 12,
      savings: (tier.price * 12) - tier.yearlyPrice,
      savingsPercent: tier.price > 0 ? (((tier.price * 12) - tier.yearlyPrice) / (tier.price * 12)) * 100 : 0,
    }));

    // 12-month projection
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

    // Free tier analysis
    const freeTierCost = tierAnalysis.find(t => t.isFreeTier)?.totalVariableCost || 0;
    const freeToPaidConversion = freeTierCustomers > 0 ? (totalPaidCustomers / freeTierCustomers) * 100 : 0;

    return {
      totalCustomers,
      totalPaidCustomers,
      freeTierCustomers,
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
      blendedInputCost,
      blendedOutputCost,
      blendedTTSCost,
      totalVideosProduced,
      totalScriptsProduced,
      totalTTSMinutes,
      monthlyProjection,
      firstProfitableMonth,
      freeTierCost,
      freeToPaidConversion,
      // Yearly subscription data
      yearlyCustomers,
      monthlyCustomers,
      yearlyMRREquivalent,
      yearlyUpfrontCash,
      monthlyRevenue,
      yearlySavingsPerCustomer,
      yearlyDiscountPercent: acquisition.yearlyDiscountPercent,
      yearlyAdoptionPercent: acquisition.yearlyAdoptionPercent,
    };
  }, [pricingTiers, aiProviders, ttsProviders, fixedCosts, acquisition]);

  // SHARED RECOMMENDATIONS
  const recommendations = useMemo((): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Free tier recommendation
    const freeTier = calculations.tierAnalysis?.find((t: TierAnalysis) => t.isFreeTier);
    if (freeTier && freeTier.totalVariableCost > 0) {
      const costPerFreeUser = freeTier.variableCostPerUser;
      if (costPerFreeUser > 0.50) {
        recs.push({
          priority: 2,
          category: 'Free Tier',
          title: 'Optimize Free Tier Costs',
          issue: `Free tier costs $${costPerFreeUser.toFixed(2)}/user. Consider limiting usage further.`,
          actions: [
            'Reduce free tier token limits',
            'Use cheapest AI models for free tier',
            'Add rate limiting to control costs',
            `Current free tier cost: $${freeTier.totalVariableCost.toFixed(0)}/mo`
          ],
          impact: 'High',
          tier: 'Free',
        });
      }
    }

    // Yearly subscription benefit
    if (calculations.totalPaidCustomers > 0) {
      recs.push({
        priority: 3,
        category: 'Revenue',
        title: 'Yearly Subscription Strategy',
        issue: `With ${acquisition.yearlyDiscountPercent}% discount, ${acquisition.yearlyAdoptionPercent}% adopt yearly = $${calculations.yearlyUpfrontCash.toFixed(0)} upfront cash.`,
        actions: [
          `Monthly revenue: $${calculations.monthlyRevenue.toFixed(0)}/mo`,
          `Yearly upfront: $${calculations.yearlyUpfrontCash.toFixed(0)} (${calculations.yearlyCustomers} customers)`,
          'Reduces churn - locked in for 12 months',
          'Use upfront cash for growth investment',
        ],
        impact: 'High',
        positive: true,
      });
    }

    // Free to paid conversion
    if (calculations.freeToPaidConversion < 3) {
      recs.push({
        priority: 2,
        category: 'Conversion',
        title: 'Improve Free-to-Paid Conversion',
        issue: `Only ${calculations.freeToPaidConversion.toFixed(1)}% of free users convert. Industry avg is 3-5%.`,
        actions: [
          'Add upgrade prompts when users hit limits',
          'Offer limited-time discounts for first upgrade',
          'Show premium features with "upgrade to unlock"',
        ],
        impact: 'High',
      });
    }

    // Competitor pricing
    if (competitors.length > 0) {
      const avgCompStarterPrice = competitors.reduce((sum, c) => sum + c.starterPrice, 0) / competitors.length;
      const yourStarterPrice = pricingTiers.find(t => !t.isFreeTier)?.price || 0;
      
      if (yourStarterPrice < avgCompStarterPrice * 0.7) {
        recs.push({
          priority: 3,
          category: 'Pricing',
          title: 'Price Below Market - Room to Increase',
          issue: `Your starter price ($${yourStarterPrice}) is ${((1 - yourStarterPrice / avgCompStarterPrice) * 100).toFixed(0)}% below avg ($${avgCompStarterPrice.toFixed(0)}).`,
          actions: [
            `Consider raising to $${(avgCompStarterPrice * 0.9).toFixed(0)}`,
            'Test higher price with new customers',
            'Add features to justify increase',
          ],
          impact: 'Medium',
        });
      }
    }

    // LTV:CAC
    if (calculations.ltvCacRatio < 3) {
      recs.push({
        priority: calculations.ltvCacRatio < 1 ? 1 : 2,
        category: 'Unit Economics',
        title: calculations.ltvCacRatio < 1 ? 'Critical: Unsustainable Acquisition' : 'Improve LTV:CAC Ratio',
        issue: `LTV:CAC is ${calculations.ltvCacRatio.toFixed(2)}x - ${calculations.ltvCacRatio < 1 ? 'spending more than customers generate' : 'below 3x benchmark'}.`,
        actions: [
          `Reduce CAC from $${calculations.cac.toFixed(0)} to under $${(calculations.ltv / 3).toFixed(0)}`,
          'Shift to organic/content marketing',
          'Increase prices or reduce churn',
        ],
        impact: calculations.ltvCacRatio < 1 ? 'Critical' : 'High',
      });
    }

    // Gross margin
    if (calculations.grossMargin < 70) {
      recs.push({
        priority: calculations.grossMargin < 50 ? 1 : 2,
        category: 'Profitability',
        title: calculations.grossMargin < 50 ? 'Critical: Low Gross Margin' : 'Optimize Gross Margin',
        issue: `${calculations.grossMargin.toFixed(1)}% gross margin is ${calculations.grossMargin < 50 ? 'well ' : ''}below 70% benchmark.`,
        actions: [
          `AI costs are ${calculations.aiCostPercent.toFixed(1)}% of revenue`,
          'Route to cheaper models for simple tasks',
          'Implement token caching',
        ],
        impact: calculations.grossMargin < 50 ? 'Critical' : 'High',
      });
    }

    // Healthy economics
    if (calculations.netMargin >= 20 && calculations.ltvCacRatio >= 3 && calculations.grossMargin >= 70) {
      recs.push({
        priority: 4,
        category: 'Growth',
        title: '✓ Healthy Economics - Scale Up!',
        issue: 'Unit economics are healthy. Time to accelerate.',
        actions: [
          'Increase marketing spend',
          'Expand to new markets',
          'Consider raising prices for more margin',
        ],
        impact: 'Medium',
        positive: true,
      });
    }

    return recs.sort((a, b) => a.priority - b.priority);
  }, [calculations, acquisition, competitors, pricingTiers]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Pricing Strategy & Unit Economics
          </h2>
          <p className="text-sm text-muted-foreground">
            P&L Calculator • Breakeven Analysis • All tabs auto-sync from calculator
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <RefreshCw className="w-3 h-3" />
          Auto-synced: {calculations.totalPaidCustomers} paid, ${calculations.totalMRR.toFixed(0)} MRR
        </Badge>
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
        {subTab === 'calculator' && (
          <SharedCalculatorView
            wizardMode={wizardMode}
            setWizardMode={setWizardMode}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            pricingTiers={pricingTiers}
            setPricingTiers={setPricingTiers}
            aiProviders={aiProviders}
            setAiProviders={setAiProviders}
            ttsProviders={ttsProviders}
            setTtsProviders={setTtsProviders}
            fixedCosts={fixedCosts}
            setFixedCosts={setFixedCosts}
            acquisition={acquisition}
            setAcquisition={setAcquisition}
            competitors={competitors}
            setCompetitors={setCompetitors}
            calculations={calculations}
            recommendations={recommendations}
          />
        )}
        
        {subTab === 'segments' && (
          <ConnectedSegmentsTab calculations={calculations} pricingTiers={pricingTiers} />
        )}
        
        {subTab === 'models' && (
          <ConnectedModelsTab calculations={calculations} />
        )}
        
        {subTab === 'mobile' && (
          <ConnectedMobileTab pricingTiers={pricingTiers} calculations={calculations} />
        )}
        
        {subTab === 'comparison' && (
          <ConnectedComparisonTab calculations={calculations} recommendations={recommendations} />
        )}
      </div>
    </div>
  );
};

// ==================== SHARED CALCULATOR VIEW ====================
const SharedCalculatorView: React.FC<{
  wizardMode: boolean;
  setWizardMode: (mode: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  pricingTiers: PricingTier[];
  setPricingTiers: React.Dispatch<React.SetStateAction<PricingTier[]>>;
  aiProviders: AIProvider[];
  setAiProviders: React.Dispatch<React.SetStateAction<AIProvider[]>>;
  ttsProviders: TTSProvider[];
  setTtsProviders: React.Dispatch<React.SetStateAction<TTSProvider[]>>;
  fixedCosts: FixedCost[];
  setFixedCosts: React.Dispatch<React.SetStateAction<FixedCost[]>>;
  acquisition: Acquisition;
  setAcquisition: React.Dispatch<React.SetStateAction<Acquisition>>;
  competitors: CompetitorBenchmark[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorBenchmark[]>>;
  calculations: any;
  recommendations: Recommendation[];
}> = ({ 
  wizardMode, setWizardMode, currentStep, setCurrentStep,
  pricingTiers, setPricingTiers, aiProviders, setAiProviders,
  ttsProviders, setTtsProviders, fixedCosts, setFixedCosts,
  acquisition, setAcquisition, competitors, setCompetitors,
  calculations, recommendations
}) => {
  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant={wizardMode ? 'outline' : 'default'} 
            size="sm"
            onClick={() => setWizardMode(false)}
          >
            <BarChart3 className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <Button 
            variant={wizardMode ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setWizardMode(true)}
          >
            <Play className="w-4 h-4 mr-1" /> Guided Setup
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HelpCircle className="w-4 h-4" />
          <span>Changes here auto-update Segments, Models, Mobile, Compare tabs</span>
        </div>
      </div>

      {wizardMode ? (
        <GuidedWizard
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          pricingTiers={pricingTiers}
          setPricingTiers={setPricingTiers}
          aiProviders={aiProviders}
          setAiProviders={setAiProviders}
          ttsProviders={ttsProviders}
          setTtsProviders={setTtsProviders}
          fixedCosts={fixedCosts}
          setFixedCosts={setFixedCosts}
          acquisition={acquisition}
          setAcquisition={setAcquisition}
          competitors={competitors}
          setCompetitors={setCompetitors}
          calculations={calculations}
        />
      ) : (
        <ResultsDashboard
          calculations={calculations}
          recommendations={recommendations}
          pricingTiers={pricingTiers}
        />
      )}
    </div>
  );
};
