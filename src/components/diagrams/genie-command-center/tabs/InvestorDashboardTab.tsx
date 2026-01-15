/**
 * Investor Dashboard Tab - Complete Investor Package
 * All critical metrics investors need for funding decisions
 * DYNAMIC DATA: Metrics sourced from governance-data.ts
 * 
 * DISPLAYS: Genie-specific metrics with scalability context
 * This is an INVESTOR view showing product maturity + market potential.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign, TrendingUp, Users, Building, Heart, GraduationCap, Briefcase, Plane,
  BarChart3, PieChart, Target, Zap, Shield, Globe, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight, Rocket, AlertTriangle, Award, Layers,
  Lightbulb, Lock, Server, Database, Cpu, MessageSquare, Code, Box
} from 'lucide-react';
import {
  financialProjections,
  unitEconomics,
  goToMarketPhases,
  competitorPricing,
  pricingTiers,
} from '../data/financial-data';
import { masterScenarioCounts, masterFinancialMetrics } from '../data/governance-data';
import { 
  GENIE_COUNTS, 
  PLATFORM_TOTALS, 
  SCENARIO_METRICS, 
  PHASES,
  GENIE_DYNAMIC_METRICS,
} from '@/genie-studio/governance';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
};

// Key Metrics Data
const keyMetrics = {
  ltvCacBlended: 12,
  blendedLTV: 420,
  blendedCAC: 35,
  blendedARPU: 17.5,
  monthlyChurn: 5,
  nrr: 115,
  grossMargin: 75,
  paybackMonths: 3.5,
  freeToPaidConversion: 3,
};

// Segment Unit Economics with LTV details
const segmentEconomics = [
  { segment: 'Creator', icon: Users, arpu: 12, cac: 45, ltv: 216, ltvCac: 4.8, churn: 5.5, payback: 3.75, lifetime: '18mo', color: 'blue' },
  { segment: 'SMB', icon: Briefcase, arpu: 35, cac: 120, ltv: 840, ltvCac: 7.0, churn: 4.0, payback: 3.4, lifetime: '24mo', color: 'purple' },
  { segment: 'Education', icon: GraduationCap, arpu: 25, cac: 80, ltv: 600, ltvCac: 7.5, churn: 3.5, payback: 3.2, lifetime: '24mo', color: 'amber' },
  { segment: 'Healthcare', icon: Heart, arpu: 75, cac: 300, ltv: 2700, ltvCac: 9.0, churn: 2.5, payback: 4.0, lifetime: '36mo', color: 'green' },
  { segment: 'Enterprise', icon: Building, arpu: 500, cac: 2000, ltv: 18000, ltvCac: 9.0, churn: 2.0, payback: 4.0, lifetime: '36mo', color: 'primary' },
];

// Cost Structure
const costStructure = [
  { category: 'Marketing & Sales', monthly: 250000, pct: 30, icon: Target },
  { category: 'AI Model Costs', monthly: 200000, pct: 24, icon: Cpu },
  { category: 'Development Team', monthly: 140000, pct: 17, icon: Layers },
  { category: 'Cloud Hosting', monthly: 100000, pct: 12, icon: Server },
  { category: 'Support & Success', monthly: 60000, pct: 7, icon: MessageSquare },
  { category: 'Office & Operations', monthly: 40000, pct: 5, icon: Building },
  { category: 'Licenses & Tools', monthly: 25000, pct: 3, icon: Lock },
  { category: 'Security & Compliance', monthly: 15000, pct: 2, icon: Shield },
];

// Scaling Economics
const scalingEconomics = [
  { users: 1000, aiCost: 5000, hostingCost: 3000, storageCost: 500, costPerUser: 8.50, margin: 51 },
  { users: 10000, aiCost: 40000, hostingCost: 20000, storageCost: 4000, costPerUser: 6.40, margin: 63 },
  { users: 50000, aiCost: 150000, hostingCost: 80000, storageCost: 15000, costPerUser: 4.90, margin: 72 },
  { users: 200000, aiCost: 400000, hostingCost: 250000, storageCost: 50000, costPerUser: 3.50, margin: 80 },
];

// Investment Use of Funds
const useOfFunds = [
  { category: 'Product Development', pct: 40, amount: '4.0M', description: 'Core platform, AI features, mobile apps' },
  { category: 'Sales & Marketing', pct: 30, amount: '3.0M', description: 'Go-to-market, brand, customer acquisition' },
  { category: 'Operations', pct: 15, amount: '1.5M', description: 'Infrastructure, support, compliance' },
  { category: 'Reserve', pct: 15, amount: '1.5M', description: '18-month runway buffer' },
];

// Key Risks
const keyRisks = [
  { risk: 'Competition from Big Tech', mitigation: 'First-mover in unified AI video, healthcare focus', severity: 'High' },
  { risk: 'AI Cost Volatility', mitigation: 'Multi-provider strategy, volume discounts negotiated', severity: 'Medium' },
  { risk: 'Customer Concentration', mitigation: 'Diversified segment strategy, no single customer >5%', severity: 'Low' },
  { risk: 'Regulatory (HIPAA)', mitigation: 'Compliance-first architecture, legal counsel engaged', severity: 'Medium' },
];

// Exit Comparables
const exitComparables = [
  { company: 'Loom → Atlassian', value: '$975M', multiple: '6.5x ARR', year: 2023 },
  { company: 'Descript', value: '$553M (valuation)', multiple: '11x ARR', year: 2022 },
  { company: 'Synthesia', value: '$1B+ (valuation)', multiple: '16x ARR', year: 2023 },
  { company: 'Canva', value: '$26B (valuation)', multiple: '11x ARR', year: 2024 },
];

export const InvestorDashboardTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto"
    >
      {/* Sub-tabs for Investor Dashboard */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="mb-6 flex gap-1 bg-muted/50 p-1 rounded-lg w-fit flex-wrap">
          <TabsTrigger value="overview" className="px-4 text-sm">Executive Summary</TabsTrigger>
          <TabsTrigger value="unit-economics" className="px-4 text-sm">Unit Economics</TabsTrigger>
          <TabsTrigger value="financials" className="px-4 text-sm">Financials</TabsTrigger>
          <TabsTrigger value="gtm" className="px-4 text-sm">Go-to-Market</TabsTrigger>
          <TabsTrigger value="use-of-funds" className="px-4 text-sm">Use of Funds</TabsTrigger>
          <TabsTrigger value="risks-exit" className="px-4 text-sm">Risks & Exit</TabsTrigger>
        </TabsList>

        {/* EXECUTIVE SUMMARY */}
        <TabsContent value="overview" className="space-y-6">
          {/* Hero Metrics */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-r from-green-500/10 via-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20"
          >
            <h2 className="text-xl font-bold text-foreground mb-5">Investment Highlights</h2>
            <div className="grid grid-cols-6 gap-4">
              {[
                { label: 'Total Market (TAM)', value: '$150B+', sublabel: '6 Segments', icon: Globe, color: 'text-green-600' },
                { label: 'Serviceable (SAM)', value: '$37B', sublabel: 'AI Video Tools', icon: Target, color: 'text-primary' },
                { label: 'Obtainable (SOM)', value: '$1.85B', sublabel: '3-5 Year Target', icon: Zap, color: 'text-amber-600' },
                { label: 'LTV:CAC Ratio', value: '12:1', sublabel: 'Excellent', icon: TrendingUp, color: 'text-green-600' },
                { label: 'Gross Margin', value: `${masterFinancialMetrics.unitEconomics.grossMargin}%`, sublabel: 'SaaS Standard', icon: PieChart, color: 'text-blue-600' },
                { label: 'Product Progress', value: `${masterScenarioCounts.completionPercentage}%`, sublabel: `${masterScenarioCounts.implementedScenarios}/${masterScenarioCounts.totalScenarios} Scenarios`, icon: CheckCircle, color: 'text-primary' },
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="text-center p-3 bg-card/50 rounded-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <item.icon className={`w-5 h-5 mx-auto mb-2 ${item.color}`} />
                  <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-foreground font-medium text-xs mt-1">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sublabel}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Key SaaS Metrics Table */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Key SaaS Metrics vs. Benchmarks
            </h3>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left font-semibold px-4 py-3">Metric</th>
                    <th className="text-center font-semibold px-4 py-3">Genie</th>
                    <th className="text-center font-semibold px-4 py-3">Good Benchmark</th>
                    <th className="text-center font-semibold px-4 py-3">Status</th>
                    <th className="text-left font-semibold px-4 py-3">Why It Matters</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'LTV:CAC Ratio', value: '12:1', benchmark: '>3:1', status: 'excellent', why: 'Every $1 marketing → $12 lifetime value' },
                    { metric: 'CAC Payback', value: '3.5 mo', benchmark: '<12 mo', status: 'excellent', why: 'Recover cost in <1 quarter' },
                    { metric: 'Net Revenue Retention', value: '115%', benchmark: '>100%', status: 'excellent', why: 'Expansion exceeds churn' },
                    { metric: 'Gross Margin', value: '75%', benchmark: '>70%', status: 'good', why: 'Strong SaaS economics' },
                    { metric: 'Monthly Churn', value: '5%', benchmark: '<7%', status: 'good', why: 'Industry average for SMB' },
                    { metric: 'Free→Paid Conversion', value: '3%', benchmark: '2-5%', status: 'good', why: 'Mid-range PLG model' },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{row.metric}</td>
                      <td className="px-4 py-3 text-center text-lg font-bold text-primary">{row.value}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{row.benchmark}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={row.status === 'excellent' ? 'bg-green-600' : 'bg-blue-600'}>
                          {row.status === 'excellent' ? '✓ Excellent' : '✓ Good'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{row.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Financial Trajectory */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Financial Trajectory (Path to Profitability)
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { period: 'Q4 2026', users: '8K', arr: '$1.44M', status: 'Building', color: 'amber' },
                { period: 'Q2 2027', users: '35K', arr: '$6.3M', status: 'Breakeven', color: 'blue' },
                { period: 'Q4 2027', users: '80K', arr: '$14.4M', status: 'Profitable', color: 'green' },
                { period: '2028', users: '200K', arr: '$36M', status: 'Scale', color: 'primary' },
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-xl border-2 ${
                  item.color === 'primary' ? 'border-primary bg-primary/5' :
                  item.color === 'green' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                  item.color === 'blue' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                  'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                }`}>
                  <div className="text-sm font-medium text-muted-foreground">{item.period}</div>
                  <div className="text-2xl font-bold text-foreground mt-1">{item.arr}</div>
                  <div className="text-sm text-muted-foreground">{item.users} users</div>
                  <Badge className={`mt-2 ${
                    item.status === 'Profitable' || item.status === 'Scale' ? 'bg-green-600' :
                    item.status === 'Breakeven' ? 'bg-blue-600' : 'bg-amber-600'
                  }`}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Competitive Moat */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Competitive Moat
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { moat: 'Unified Pipeline', desc: 'Script → TTS → Edit → Publish in one app', icon: Layers, competitors: 'Competitors need 3-4 tools' },
                { moat: 'Healthcare Focus', desc: 'HIPAA-compliant AI at 90% lower cost', icon: Heart, competitors: '$100/mo vs $50K+/yr' },
                { moat: 'Mobile-First', desc: '68% of users prefer mobile editing', icon: Zap, competitors: 'Competitors desktop-only' },
                { moat: 'AI-Native', desc: 'Built on AI from day 1, not bolted on', icon: Cpu, competitors: 'Legacy players retrofitting' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-card rounded-xl border border-border">
                  <item.icon className="w-6 h-6 text-primary mb-2" />
                  <div className="font-semibold text-foreground">{item.moat}</div>
                  <div className="text-sm text-muted-foreground mt-1">{item.desc}</div>
                  <div className="text-xs text-green-600 mt-2 font-medium">{item.competitors}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Genie Suite Platform Scalability - Investor View */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Platform Scalability (Genie Suite Infrastructure)
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {[
                { label: 'Edge Functions', genie: GENIE_COUNTS.edgeFunctions, total: PLATFORM_TOTALS.edgeFunctions, icon: Zap, color: 'green' },
                { label: 'Custom Hooks', genie: GENIE_COUNTS.hooks, total: PLATFORM_TOTALS.hooks, icon: Code, color: 'purple' },
                { label: 'DB Tables', genie: GENIE_COUNTS.databaseTables, total: PLATFORM_TOTALS.databaseTables, icon: Database, color: 'blue' },
                { label: 'AI Agents', genie: GENIE_COUNTS.aiAgents, total: PLATFORM_TOTALS.aiAgents, icon: Cpu, color: 'amber' },
                { label: 'Services', genie: GENIE_COUNTS.services, total: PLATFORM_TOTALS.services, icon: Server, color: 'cyan' },
                { label: 'Components', genie: GENIE_COUNTS.components, total: PLATFORM_TOTALS.components, icon: Layers, color: 'pink' },
                { label: 'Pages', genie: GENIE_COUNTS.pages, total: PLATFORM_TOTALS.pages, icon: Box, color: 'indigo' },
                { label: 'Mobile', genie: GENIE_COUNTS.mobileComponents, total: PLATFORM_TOTALS.mobileComponents, icon: Globe, color: 'orange' },
              ].map((item, i) => (
                <div key={i} className={`p-3 rounded-lg border text-center bg-${item.color}-50/50 dark:bg-${item.color}-900/10 border-${item.color}-200 dark:border-${item.color}-800/40`}>
                  <item.icon className={`w-4 h-4 mx-auto mb-1 text-${item.color}-600 dark:text-${item.color}-400`} />
                  <div className="text-lg font-bold text-foreground">
                    {item.genie}
                    <span className="text-xs text-muted-foreground font-normal">/{item.total}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">
                      {SCENARIO_METRICS.implementedScenarios}/{SCENARIO_METRICS.totalScenarios} Scenarios Implemented
                    </div>
                    <div className="text-sm text-muted-foreground">
                      P0-P2 Complete ({PHASES.P0.implemented + PHASES.P1.implemented + PHASES.P2.implemented} scenarios) • P3 In Progress ({PHASES.P3.implemented}/{PHASES.P3.total})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{SCENARIO_METRICS.completionPercentage}%</div>
                  <div className="text-xs text-muted-foreground">Platform Complete</div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* UNIT ECONOMICS */}
        <TabsContent value="unit-economics" className="space-y-6">
          {/* Blended Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-5 gap-4">
            {[
              { label: 'Blended LTV', value: `$${keyMetrics.blendedLTV}`, color: 'green', desc: '24mo avg lifetime' },
              { label: 'Blended CAC', value: `$${keyMetrics.blendedCAC}`, color: 'amber', desc: 'PLG + Outbound' },
              { label: 'LTV:CAC', value: `${keyMetrics.ltvCacBlended}:1`, color: 'primary', desc: 'Target: 3:1+' },
              { label: 'Blended ARPU', value: `$${keyMetrics.blendedARPU}/mo`, color: 'blue', desc: 'All segments' },
              { label: 'Monthly Churn', value: `${keyMetrics.monthlyChurn}%`, color: 'red', desc: 'Industry: 5-7%' },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-xl border text-center ${
                item.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200' :
                item.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200' :
                item.color === 'primary' ? 'bg-primary/10 border-primary/30' :
                item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' :
                'bg-red-50 dark:bg-red-900/20 border-red-200'
              }`}>
                <div className={`text-3xl font-bold ${
                  item.color === 'green' ? 'text-green-600' :
                  item.color === 'amber' ? 'text-amber-600' :
                  item.color === 'primary' ? 'text-primary' :
                  item.color === 'blue' ? 'text-blue-600' :
                  'text-red-600'
                }`}>{item.value}</div>
                <div className="font-medium text-sm mt-1">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </motion.div>

          {/* Segment Breakdown Table */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4">Unit Economics by Segment</h3>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left font-semibold px-4 py-3">Segment</th>
                    <th className="text-right font-semibold px-4 py-3">ARPU</th>
                    <th className="text-right font-semibold px-4 py-3">CAC</th>
                    <th className="text-right font-semibold px-4 py-3">LTV</th>
                    <th className="text-right font-semibold px-4 py-3">LTV:CAC</th>
                    <th className="text-right font-semibold px-4 py-3">Churn</th>
                    <th className="text-right font-semibold px-4 py-3">Payback</th>
                    <th className="text-center font-semibold px-4 py-3">Lifetime</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentEconomics.map((seg, i) => (
                    <tr key={i} className={`border-t border-border hover:bg-muted/30 ${
                      seg.segment === 'Healthcare' || seg.segment === 'Enterprise' ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                    }`}>
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <seg.icon className="w-4 h-4 text-muted-foreground" />
                        {seg.segment}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">${seg.arpu}/mo</td>
                      <td className="px-4 py-3 text-right text-amber-600">${seg.cac}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-bold">${seg.ltv.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge className={seg.ltvCac >= 7 ? 'bg-green-600' : 'bg-blue-600'}>{seg.ltvCac}x</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-red-500">{seg.churn}%</td>
                      <td className="px-4 py-3 text-right">{seg.payback} mo</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{seg.lifetime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* LTV Visual Comparison */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4">LTV by Segment (Visual)</h3>
            <div className="grid grid-cols-5 gap-4">
              {segmentEconomics.map((seg, i) => (
                <div key={i} className="p-4 bg-card rounded-xl border border-border text-center">
                  <seg.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm font-medium">{seg.segment}</div>
                  <div className="text-2xl font-bold text-primary mt-1">${seg.ltv.toLocaleString()}</div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.min((seg.ltv / 18000) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{seg.ltvCac}x LTV:CAC</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cohort Analysis */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4">Cohort Retention Analysis (Projected)</h3>
            <div className="bg-card rounded-xl border border-border p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-semibold py-2">Cohort</th>
                    <th className="text-center font-semibold py-2">Month 1</th>
                    <th className="text-center font-semibold py-2">Month 3</th>
                    <th className="text-center font-semibold py-2">Month 6</th>
                    <th className="text-center font-semibold py-2">Month 12</th>
                    <th className="text-center font-semibold py-2">Month 24</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cohort: 'Creator', m1: 95, m3: 85, m6: 72, m12: 55, m24: 40 },
                    { cohort: 'SMB', m1: 96, m3: 88, m6: 78, m12: 65, m24: 52 },
                    { cohort: 'Education', m1: 97, m3: 90, m6: 82, m12: 70, m24: 58 },
                    { cohort: 'Healthcare', m1: 98, m3: 93, m6: 88, m12: 80, m24: 70 },
                    { cohort: 'Enterprise', m1: 99, m3: 95, m6: 90, m12: 85, m24: 75 },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-2 font-medium">{row.cohort}</td>
                      <td className="py-2 text-center text-green-600">{row.m1}%</td>
                      <td className="py-2 text-center text-green-600">{row.m3}%</td>
                      <td className="py-2 text-center text-amber-600">{row.m6}%</td>
                      <td className="py-2 text-center text-amber-600">{row.m12}%</td>
                      <td className="py-2 text-center">{row.m24}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        {/* FINANCIALS */}
        <TabsContent value="financials" className="space-y-6">
          {/* Revenue Projections */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Revenue Projections (2026-2028)
            </h3>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left font-semibold px-4 py-3">Period</th>
                    <th className="text-right font-semibold px-4 py-3">Users</th>
                    <th className="text-right font-semibold px-4 py-3">MRR</th>
                    <th className="text-right font-semibold px-4 py-3">ARR</th>
                    <th className="text-right font-semibold px-4 py-3">Total Costs</th>
                    <th className="text-right font-semibold px-4 py-3">Net Income</th>
                    <th className="text-right font-semibold px-4 py-3">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {financialProjections.map((proj, i) => {
                    const margin = proj.revenue > 0 ? Math.round((proj.netIncome / proj.revenue) * 100) : 0;
                    return (
                      <tr key={i} className={`border-t border-border hover:bg-muted/30 ${
                        proj.netIncome >= 0 ? 'bg-green-50/30 dark:bg-green-900/5' : ''
                      }`}>
                        <td className="px-4 py-3 font-medium">
                          {proj.quarter ? `${proj.year} ${proj.quarter}` : proj.year}
                        </td>
                        <td className="px-4 py-3 text-right">{proj.users.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">{formatCurrency(proj.mrr)}</td>
                        <td className="px-4 py-3 text-right text-primary font-bold">{formatCurrency(proj.arr)}</td>
                        <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(proj.totalCost)}</td>
                        <td className={`px-4 py-3 text-right font-bold ${proj.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {proj.netIncome >= 0 ? '+' : ''}{formatCurrency(proj.netIncome)}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {margin}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Cost Structure */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-600" />
              Monthly Cost Structure (at 50K Users)
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left font-semibold px-4 py-3">Category</th>
                      <th className="text-right font-semibold px-4 py-3">Monthly</th>
                      <th className="text-right font-semibold px-4 py-3">% of Rev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costStructure.map((cost, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-4 py-2 flex items-center gap-2">
                          <cost.icon className="w-4 h-4 text-muted-foreground" />
                          {cost.category}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">{formatCurrency(cost.monthly)}</td>
                        <td className="px-4 py-2 text-right text-muted-foreground">{cost.pct}%</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border bg-muted/50">
                      <td className="px-4 py-3 font-bold">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">$830K</td>
                      <td className="px-4 py-3 text-right font-bold">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-card rounded-xl border border-border">
                  <h4 className="font-semibold mb-3">Cost Distribution</h4>
                  {costStructure.slice(0, 6).map((cost, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cost.category}</span>
                        <span className="font-medium">{cost.pct}%</span>
                      </div>
                      <Progress value={cost.pct} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Gross Margin</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Revenue (50K users)</span><span className="font-semibold">$825,000</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>COGS (AI + Hosting)</span><span>-$300,000</span></div>
                    <div className="flex justify-between border-t pt-1 font-bold text-green-600"><span>Gross Profit</span><span>$525,000 (64%)</span></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scaling Economics */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4">Scaling Economics (Unit Cost Improvement)</h3>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left font-semibold px-4 py-3">Users</th>
                    <th className="text-right font-semibold px-4 py-3">AI Costs</th>
                    <th className="text-right font-semibold px-4 py-3">Hosting</th>
                    <th className="text-right font-semibold px-4 py-3">Storage</th>
                    <th className="text-right font-semibold px-4 py-3">Cost/User</th>
                    <th className="text-right font-semibold px-4 py-3">Unit Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {scalingEconomics.map((row, i) => (
                    <tr key={i} className={`border-t border-border ${i === 3 ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
                      <td className="px-4 py-3 font-medium">{row.users.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(row.aiCost)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(row.hostingCost)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(row.storageCost)}</td>
                      <td className="px-4 py-3 text-right text-amber-600">${row.costPerUser}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge className={row.margin >= 70 ? 'bg-green-600' : 'bg-blue-600'}>{row.margin}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              * Economies of scale: Cost/user decreases 59% from 1K to 200K users due to volume discounts
            </p>
          </motion.div>
        </TabsContent>

        {/* GO-TO-MARKET */}
        <TabsContent value="gtm" className="space-y-6">
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-accent" />
              Go-to-Market Phases
            </h3>
            <div className="space-y-4">
              {goToMarketPhases.map((phase, i) => (
                <div key={i} className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">{i + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{phase.name}</h4>
                        <p className="text-sm text-muted-foreground">{phase.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{phase.targetUsers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Target Users</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-primary mb-2">Segments</h5>
                      <div className="flex flex-wrap gap-1">
                        {phase.segments.map((seg, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{seg}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-green-600 mb-2">Countries</h5>
                      <div className="flex flex-wrap gap-1">
                        {phase.countries.map((c, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-amber-600 mb-2">Key Activities</h5>
                      <ul className="space-y-1">
                        {phase.activities.slice(0, 3).map((a, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-amber-500" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* USE OF FUNDS */}
        <TabsContent value="use-of-funds" className="space-y-6">
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Use of Funds ($10M Series A)
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {useOfFunds.map((item, i) => (
                <div key={i} className="p-5 bg-card rounded-xl border border-border">
                  <div className="text-3xl font-bold text-primary">{item.pct}%</div>
                  <div className="text-xl font-semibold text-foreground mt-1">{item.amount}</div>
                  <div className="font-medium text-sm mt-2">{item.category}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                  <div className="mt-3">
                    <Progress value={item.pct} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4">Milestones for Series A</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { milestone: 'Product Complete', metric: `${masterScenarioCounts.totalScenarios}/${masterScenarioCounts.totalScenarios} Scenarios`, status: 'Q4 2026' },
                { milestone: 'ARR Target', metric: '$3M ARR', status: 'Q4 2026' },
                { milestone: 'User Base', metric: '25K+ Users', status: 'Q4 2026' },
                { milestone: 'Healthcare Pilots', metric: '5+ Hospital Systems', status: 'Q3 2026' },
                { milestone: 'Enterprise Deals', metric: '10+ Contracts', status: 'Q4 2026' },
                { milestone: 'Team Size', metric: '25 Employees', status: 'Q1 2027' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-card rounded-xl border border-border">
                  <div className="font-semibold text-foreground">{item.milestone}</div>
                  <div className="text-xl font-bold text-primary mt-1">{item.metric}</div>
                  <div className="text-sm text-muted-foreground mt-1">Target: {item.status}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* RISKS & EXIT */}
        <TabsContent value="risks-exit" className="space-y-6">
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Key Risks & Mitigations
            </h3>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left font-semibold px-4 py-3">Risk</th>
                    <th className="text-center font-semibold px-4 py-3">Severity</th>
                    <th className="text-left font-semibold px-4 py-3">Mitigation Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {keyRisks.map((risk, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{risk.risk}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={
                          risk.severity === 'High' ? 'bg-red-600' :
                          risk.severity === 'Medium' ? 'bg-amber-600' : 'bg-green-600'
                        }>{risk.severity}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{risk.mitigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Exit Comparables
            </h3>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left font-semibold px-4 py-3">Company / Deal</th>
                    <th className="text-right font-semibold px-4 py-3">Valuation</th>
                    <th className="text-right font-semibold px-4 py-3">ARR Multiple</th>
                    <th className="text-center font-semibold px-4 py-3">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {exitComparables.map((comp, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{comp.company}</td>
                      <td className="px-4 py-3 text-right text-primary font-bold">{comp.value}</td>
                      <td className="px-4 py-3 text-right text-green-600">{comp.multiple}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{comp.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="font-semibold text-foreground">Genie Exit Scenario (2028-2029)</div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Conservative (6x)</div>
                  <div className="text-xl font-bold text-foreground">$216M</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Base Case (10x)</div>
                  <div className="text-xl font-bold text-primary">$360M</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Optimistic (15x)</div>
                  <div className="text-xl font-bold text-green-600">$540M</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">Based on $36M ARR target for 2028</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-4">Strategic Acquirers</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: 'Adobe', reason: 'Creative suite expansion', fit: 'High' },
                { name: 'Salesforce', reason: 'Video for CRM workflows', fit: 'High' },
                { name: 'Atlassian', reason: 'After Loom acquisition', fit: 'Medium' },
                { name: 'Microsoft', reason: 'Teams/M365 video tools', fit: 'Medium' },
              ].map((acq, i) => (
                <div key={i} className="p-4 bg-card rounded-xl border border-border">
                  <div className="font-semibold text-foreground">{acq.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{acq.reason}</div>
                  <Badge className="mt-2" variant={acq.fit === 'High' ? 'default' : 'secondary'}>
                    {acq.fit} Fit
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
