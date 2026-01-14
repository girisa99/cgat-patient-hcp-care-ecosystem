/**
 * Investor Dashboard Tab - Financials, Projections, Go-to-Market
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Users, Globe,
  Calendar, Target, BarChart3, PieChart,
  ArrowUpRight, Rocket, Building2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  financialProjections,
  unitEconomics,
  goToMarketPhases,
  competitorPricing,
  geniePricingTiers,
} from '../data/financial-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
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
      className="max-w-[1920px] mx-auto space-y-8 px-6"
    >
      {/* Executive Summary */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-emerald-600/20 via-violet-600/20 to-fuchsia-600/20 rounded-2xl p-8 border border-violet-500/30"
      >
        <h2 className="text-3xl font-bold text-white mb-6">Investor Executive Summary</h2>
        <div className="grid grid-cols-5 gap-6">
          {[
            { label: 'Target Market (Total Addressable Market)', value: '$89.5B', sublabel: 'AI Video by 2030', color: 'emerald' },
            { label: 'Serviceable Addressable Market', value: '$12.3B', sublabel: 'Creator Economy Segment', color: 'violet' },
            { label: 'Serviceable Obtainable Market Year 1', value: '$45M', sublabel: 'Initial 6 Countries', color: 'blue' },
            { label: 'Development Investment', value: '$2.1M', sublabel: 'Seed to Series A', color: 'amber' },
            { label: 'Projected Annual Recurring Revenue 2027', value: '$8.5M', sublabel: 'Conservative Estimate', color: 'fuchsia' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className={`text-3xl font-bold text-${item.color}-400`}>{item.value}</div>
              <div className="text-white font-medium mt-2">{item.label}</div>
              <div className="text-xs text-slate-400 mt-1">{item.sublabel}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Financial Projections */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          Financial Projections (2025-2028)
        </h3>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700/30">
                <th className="text-left text-slate-300 font-medium px-4 py-3">Period</th>
                <th className="text-right text-slate-300 font-medium px-4 py-3">Users</th>
                <th className="text-right text-slate-300 font-medium px-4 py-3">Monthly Recurring Revenue</th>
                <th className="text-right text-slate-300 font-medium px-4 py-3">Annual Recurring Revenue</th>
                <th className="text-right text-slate-300 font-medium px-4 py-3">Total Costs</th>
                <th className="text-right text-slate-300 font-medium px-4 py-3">Net Income</th>
                <th className="text-right text-slate-300 font-medium px-4 py-3">Margin</th>
              </tr>
            </thead>
            <tbody>
              {financialProjections.map((proj, index) => {
                const margin = proj.revenue > 0 ? Math.round((proj.netIncome / proj.revenue) * 100) : 0;
                return (
                  <tr 
                    key={index}
                    className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {proj.quarter ? `${proj.year} ${proj.quarter}` : proj.year}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">{proj.users.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">{formatCurrency(proj.mrr)}</td>
                    <td className="px-4 py-3 text-right text-violet-400 font-medium">{formatCurrency(proj.arr)}</td>
                    <td className="px-4 py-3 text-right text-amber-400">{formatCurrency(proj.totalCost)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${proj.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(proj.netIncome)}
                    </td>
                    <td className={`px-4 py-3 text-right ${margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <PieChart className="w-6 h-6 text-violet-400" />
          Unit Economics by Segment
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {unitEconomics.map((ue, index) => (
            <div key={index} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <h4 className="text-lg font-semibold text-white mb-4">{ue.segment}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase">Average Revenue Per User</div>
                  <div className="text-xl font-bold text-emerald-400">${ue.arpu}/mo</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase">Customer Acquisition Cost</div>
                  <div className="text-xl font-bold text-amber-400">${ue.cac}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase">Lifetime Value</div>
                  <div className="text-xl font-bold text-violet-400">${ue.ltv}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase">Lifetime Value to Customer Acquisition Cost Ratio</div>
                  <div className={`text-xl font-bold ${ue.ltvCacRatio >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {ue.ltvCacRatio}x
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between text-sm">
                <span className="text-slate-400">Churn Rate: <span className="text-white">{ue.churnRate}%</span></span>
                <span className="text-slate-400">Payback: <span className="text-white">{ue.paybackMonths}mo</span></span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Go-to-Market Strategy */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-fuchsia-400" />
          Go-to-Market Strategy
        </h3>
        <div className="space-y-4">
          {goToMarketPhases.map((phase, index) => (
            <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
                    {phase.phase}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{phase.name}</h4>
                    <p className="text-sm text-slate-400">{phase.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">{phase.targetUsers.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">Target Users</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-violet-400 mb-2">Target Segments</h5>
                  <div className="flex flex-wrap gap-2">
                    {phase.segments.map((seg, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded bg-violet-500/20 text-violet-300">
                        {seg}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-emerald-400 mb-2">Countries</h5>
                  <div className="flex flex-wrap gap-2">
                    {phase.countries.map((country, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-amber-400 mb-2">Key Activities</h5>
                  <ul className="space-y-1">
                    {phase.activities.slice(0, 3).map((activity, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-amber-400" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pricing Comparison */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-amber-400" />
          Competitive Pricing Analysis
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Competitor Pricing */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h4 className="text-lg font-semibold text-white mb-4">Competitor Pricing by Segment</h4>
            <div className="space-y-4">
              {competitorPricing.map((cp, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                  <div>
                    <span className="text-white font-medium">{cp.competitor}</span>
                    <span className="text-xs text-slate-400 ml-2">({cp.segment})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-medium">${cp.startingPrice}/mo</span>
                    <span className="text-xs text-slate-400 ml-2">to ${cp.enterprisePrice}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Genie Pricing */}
          <div className="bg-violet-500/10 rounded-xl p-6 border border-violet-500/20">
            <h4 className="text-lg font-semibold text-white mb-4">Genie Suite Pricing Tiers</h4>
            <div className="space-y-4">
              {geniePricingTiers.map((tier, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-violet-500/20 last:border-0">
                  <div>
                    <span className="text-white font-medium">{tier.name}</span>
                    <div className="text-xs text-violet-300">{tier.features.slice(0, 2).join(', ')}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-400">${tier.monthlyPrice}</span>
                    <span className="text-sm text-slate-400">/mo</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <span className="text-emerald-300 text-sm">
                <strong>Sweet Spot:</strong> 40-60% below competitor pricing with more features included
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cost Breakdown */}
      <motion.div variants={itemVariants} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Monthly Cost Projections (Year 1)
        </h3>
        <div className="grid grid-cols-6 gap-4">
          {[
            { label: 'AI Model Costs (OpenAI, Claude, ElevenLabs)', value: '$15,000', pct: 25 },
            { label: 'Cloud Infrastructure (Supabase, CDN)', value: '$8,000', pct: 13 },
            { label: 'Development Team (5 engineers)', value: '$25,000', pct: 42 },
            { label: 'Marketing & User Acquisition', value: '$8,000', pct: 13 },
            { label: 'Support & Operations', value: '$3,000', pct: 5 },
            { label: 'Miscellaneous (Legal, Tools)', value: '$1,000', pct: 2 },
          ].map((cost, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-xl font-bold text-white">{cost.value}</div>
              <div className="text-xs text-slate-400 mt-1">{cost.label}</div>
              <div className="mt-3">
                <Progress value={cost.pct} className="h-2 bg-slate-600" />
                <div className="text-xs text-slate-500 mt-1 text-right">{cost.pct}%</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-slate-400">
          <span className="text-xl font-bold text-white">$60,000</span> estimated monthly burn rate at launch
        </div>
      </motion.div>
    </motion.div>
  );
};
