/**
 * Investor Dashboard Tab - Financials, Projections, Go-to-Market
 * Enterprise design with proper design system tokens
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp,
  BarChart3, PieChart,
  ArrowUpRight, Rocket
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  financialProjections,
  unitEconomics,
  goToMarketPhases,
  competitorPricing,
  pricingTiers,
} from '../data/financial-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
};

export const InvestorDashboardTab: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-10"
    >
      {/* Executive Summary */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-green-500/10 via-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Investor Executive Summary</h2>
        <div className="grid grid-cols-5 gap-6">
          {[
            { label: 'Total Addressable Market', value: '$89.5B', sublabel: 'AI Video by 2030', color: 'text-green-600 dark:text-green-400' },
            { label: 'Serviceable Addressable Market', value: '$12.3B', sublabel: 'Creator Economy', color: 'text-primary' },
            { label: 'Serviceable Obtainable Market', value: '$45M', sublabel: 'Year 1 Target', color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Development Investment', value: '$2.1M', sublabel: 'Seed to Series A', color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Projected ARR 2027', value: '$8.5M', sublabel: 'Conservative', color: 'text-accent' },
          ].map((item, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-foreground font-medium mt-2 text-sm">{item.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Financial Projections */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          Financial Projections (2026-2028)
        </h3>
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left text-foreground font-semibold px-4 py-4">Period</th>
                <th className="text-right text-foreground font-semibold px-4 py-4">Users</th>
                <th className="text-right text-foreground font-semibold px-4 py-4">MRR</th>
                <th className="text-right text-foreground font-semibold px-4 py-4">ARR</th>
                <th className="text-right text-foreground font-semibold px-4 py-4">Total Costs</th>
                <th className="text-right text-foreground font-semibold px-4 py-4">Net Income</th>
                <th className="text-right text-foreground font-semibold px-4 py-4">Margin</th>
              </tr>
            </thead>
            <tbody>
              {financialProjections.map((proj, index) => {
                const margin = proj.revenue > 0 ? Math.round((proj.netIncome / proj.revenue) * 100) : 0;
                return (
                  <tr 
                    key={index}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4 text-foreground font-medium">
                      {proj.quarter ? `${proj.year} ${proj.quarter}` : proj.year}
                    </td>
                    <td className="px-4 py-4 text-right text-muted-foreground">{proj.users.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-green-600 dark:text-green-400 font-medium">{formatCurrency(proj.mrr)}</td>
                    <td className="px-4 py-4 text-right text-primary font-medium">{formatCurrency(proj.arr)}</td>
                    <td className="px-4 py-4 text-right text-amber-600 dark:text-amber-400">{formatCurrency(proj.totalCost)}</td>
                    <td className={`px-4 py-4 text-right font-medium ${proj.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                      {formatCurrency(proj.netIncome)}
                    </td>
                    <td className={`px-4 py-4 text-right font-medium ${margin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                      {margin}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Unit Economics */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-primary" />
          </div>
          Unit Economics by Segment
        </h3>
        <div className="grid grid-cols-3 gap-5">
          {unitEconomics.map((ue, index) => (
            <motion.div 
              key={index} 
              className="bg-card rounded-2xl p-5 border border-border shadow-sm"
              whileHover={{ y: -4 }}
            >
              <h4 className="text-lg font-semibold text-foreground mb-4">{ue.segment}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-medium">ARPU</div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">${ue.arpu}/mo</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-medium">CAC</div>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">${ue.cac}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-medium">LTV</div>
                  <div className="text-xl font-bold text-primary">${ue.ltv}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-medium">LTV:CAC</div>
                  <div className={`text-xl font-bold ${ue.ltvCacRatio >= 3 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {ue.ltvCacRatio}x
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                <span className="text-muted-foreground">Churn: <span className="text-foreground font-medium">{ue.churnRate}%</span></span>
                <span className="text-muted-foreground">Payback: <span className="text-foreground font-medium">{ue.paybackMonths}mo</span></span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Go-to-Market Strategy */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-accent" />
          </div>
          Go-to-Market Strategy
        </h3>
        <div className="space-y-4">
          {goToMarketPhases.map((phase, index) => (
            <motion.div 
              key={index} 
              className="bg-card rounded-2xl p-6 border border-border shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">{phase.name}</h4>
                    <p className="text-sm text-muted-foreground">{phase.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{phase.targetUsers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Target Users</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h5 className="text-sm font-semibold text-primary mb-2">Target Segments</h5>
                  <div className="flex flex-wrap gap-2">
                    {phase.segments.map((seg, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {seg}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">Countries</h5>
                  <div className="flex flex-wrap gap-2">
                    {phase.countries.map((country, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 font-medium">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Key Activities</h5>
                  <ul className="space-y-1">
                    {phase.activities.slice(0, 3).map((activity, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-amber-500" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pricing Comparison */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          Competitive Pricing Analysis
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Competitor Pricing */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h4 className="text-lg font-semibold text-foreground mb-4">Competitor Pricing</h4>
            <div className="space-y-3">
              {competitorPricing.map((cp, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="text-foreground font-medium">{cp.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({cp.segment})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {typeof cp.price === 'number' ? `$${cp.price}/mo` : cp.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Genie Pricing */}
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
            <h4 className="text-lg font-semibold text-foreground mb-4">Genie Suite Pricing Tiers</h4>
            <div className="space-y-3">
              {Object.entries(pricingTiers).map(([segment, tiers], index) => (
                <div key={index} className="border-b border-primary/20 last:border-0 pb-3">
                  <div className="text-xs font-semibold text-primary uppercase mb-2">{segment}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(tiers).map(([tierName, tierData]) => (
                      <div key={tierName} className="flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border">
                        <span className="text-foreground text-sm font-medium capitalize">{tierName}</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          {typeof tierData.price === 'number' ? `$${tierData.price}` : tierData.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <span className="text-green-700 dark:text-green-400 text-sm font-medium">
                💰 Sweet Spot: 40-60% below competitor pricing with more features
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cost Breakdown */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Monthly Cost Projections (Year 1)
        </h3>
        <div className="grid grid-cols-6 gap-4">
          {[
            { label: 'AI Models (OpenAI, Claude, ElevenLabs)', value: '$15,000', pct: 25 },
            { label: 'Cloud Infrastructure', value: '$8,000', pct: 13 },
            { label: 'Development Team', value: '$25,000', pct: 42 },
            { label: 'Marketing', value: '$8,000', pct: 13 },
            { label: 'Support', value: '$3,000', pct: 5 },
            { label: 'Other', value: '$1,000', pct: 2 },
          ].map((cost, index) => (
            <div key={index} className="bg-muted/50 rounded-xl p-4">
              <div className="text-xl font-bold text-foreground">{cost.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{cost.label}</div>
              <div className="mt-3">
                <Progress value={cost.pct} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1 text-right">{cost.pct}%</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-muted-foreground">
          Estimated monthly burn rate at launch: <span className="text-xl font-bold text-foreground">$60,000</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
