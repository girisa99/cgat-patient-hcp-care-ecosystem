/**
 * Market Analysis Tab - Competitors, Trends, Positioning
 * Comprehensive competitive landscape with real market data
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, DollarSign, Globe,
  Monitor, Smartphone, Cloud, Puzzle,
  Star, Check, X, Minus, ArrowUpRight,
  Building2, BarChart3, Target
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  competitors,
  segments,
  marketTrends,
  marketReferences,
  swotBySegment,
  gartnerPositions,
} from '../data/market-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export const MarketAnalysisTab: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState('creators');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-8 px-6"
    >
      {/* Market Trends Section */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          AI Video Market Growth Trends (2022-2030)
        </h3>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {marketTrends.slice(0, 4).map((trend, index) => (
            <div key={index} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">{trend.year}</div>
              <div className="text-2xl font-bold text-white">${trend.globalMarket}B</div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-violet-400">AI Adoption: {trend.aiAdoption}%</span>
                <span className="text-emerald-400">Creator Growth: {trend.creatorGrowth}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Data Sources & References</h4>
          <div className="grid grid-cols-3 gap-4">
            {marketReferences.map((ref, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <ArrowUpRight className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">
                  <span className="text-slate-300 font-medium">{ref.source}</span> ({ref.year}): {ref.stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Competitor Analysis */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-violet-400" />
          Key Competitors by Segment
        </h3>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700/30 text-left">
                  <th className="px-4 py-3 text-slate-300 font-medium">Competitor</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Segment</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Type</th>
                  <th className="px-4 py-3 text-slate-300 font-medium text-center">Users</th>
                  <th className="px-4 py-3 text-slate-300 font-medium text-center">Revenue</th>
                  <th className="px-4 py-3 text-slate-300 font-medium">Pricing</th>
                  <th className="px-4 py-3 text-slate-300 font-medium text-center">Years</th>
                  <th className="px-4 py-3 text-slate-300 font-medium text-center">Languages</th>
                  <th className="px-4 py-3 text-slate-300 font-medium text-center">Platforms</th>
                  <th className="px-4 py-3 text-slate-300 font-medium text-center">Video Edit</th>
                  <th className="px-4 py-3 text-slate-300 font-medium text-center">Ease of Use</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, index) => (
                  <tr 
                    key={index}
                    className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-white">{comp.name}</td>
                    <td className="px-4 py-3 text-slate-300">{comp.segment}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        comp.type === 'Direct' ? 'bg-red-500/20 text-red-400' :
                        comp.type === 'Feature' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {comp.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">{comp.userBase}</td>
                    <td className="px-4 py-3 text-center text-emerald-400 font-medium">{comp.revenue}</td>
                    <td className="px-4 py-3 text-slate-300">{comp.pricing}</td>
                    <td className="px-4 py-3 text-center text-slate-400">{comp.yearsInMarket}y</td>
                    <td className="px-4 py-3 text-center text-slate-300">{comp.languages}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        {comp.platforms.includes('Web') && <Globe className="w-4 h-4 text-violet-400" />}
                        {comp.platforms.includes('Desktop') && <Monitor className="w-4 h-4 text-blue-400" />}
                        {comp.platforms.includes('Mobile') && <Smartphone className="w-4 h-4 text-emerald-400" />}
                        {comp.platforms.includes('API') && <Cloud className="w-4 h-4 text-amber-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < comp.videoEditingRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < comp.easeOfUse ? 'text-emerald-400 fill-emerald-400' : 'text-slate-600'}`} 
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Competitor Strengths & Weaknesses */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-400" />
          Competitor Strengths, Weaknesses & Genie Differentiators
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {competitors.slice(0, 6).map((comp, index) => (
            <div key={index} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{comp.name}</h4>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                  {comp.learningCurve} to learn
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-xs font-medium text-emerald-400 uppercase mb-2">Strengths</h5>
                  <ul className="space-y-1">
                    {comp.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-red-400 uppercase mb-2">Weaknesses</h5>
                  <ul className="space-y-1">
                    {comp.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <X className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-violet-500/10 rounded-lg p-3 border border-violet-500/20">
                <span className="text-xs text-violet-400 font-medium">Genie Differentiator: </span>
                <span className="text-xs text-violet-200">{comp.genieDifferentiator}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Gartner-Style Quadrant */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-fuchsia-400" />
          Market Positioning Matrix (Gartner-Style)
        </h3>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="relative h-[500px] border-l-2 border-b-2 border-slate-600">
            {/* Axis Labels */}
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 -rotate-90 text-slate-400 text-sm font-medium">
              Ability to Execute →
            </div>
            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-slate-400 text-sm font-medium">
              Completeness of Vision →
            </div>

            {/* Quadrant Labels */}
            <div className="absolute top-4 left-4 text-slate-500 text-sm">Niche Players</div>
            <div className="absolute top-4 right-4 text-emerald-500 text-sm font-medium">Leaders</div>
            <div className="absolute bottom-4 left-4 text-slate-500 text-sm">Challengers</div>
            <div className="absolute bottom-4 right-4 text-violet-500 text-sm">Visionaries</div>

            {/* Quadrant Lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600/50" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-600/50" />

            {/* Positioned Dots */}
            {gartnerPositions.map((pos, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{
                  left: `${pos.visionScore}%`,
                  bottom: `${pos.executionScore}%`,
                }}
              >
                <div className={`w-4 h-4 rounded-full ${
                  pos.name === 'Genie Suite' 
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 ring-4 ring-violet-500/30' 
                    : 'bg-slate-400'
                }`} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {pos.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* SWOT Analysis by Segment */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Puzzle className="w-6 h-6 text-cyan-400" />
          SWOT Analysis by Target Segment
        </h3>
        <Tabs value={selectedSegment} onValueChange={setSelectedSegment}>
          <TabsList className="bg-slate-800/50 p-1 mb-6">
            {Object.keys(swotBySegment).map((seg) => (
              <TabsTrigger 
                key={seg} 
                value={seg}
                className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
              >
                {seg.charAt(0).toUpperCase() + seg.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(swotBySegment).map(([segKey, items]) => (
            <TabsContent key={segKey} value={segKey}>
              <div className="grid grid-cols-4 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/20">
                  <h4 className="text-lg font-semibold text-emerald-400 mb-4">Strengths</h4>
                  <ul className="space-y-2">
                    {items.filter(i => i.category === 'strength').map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {item.text}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                            item.impact === 'High' ? 'bg-emerald-500/20 text-emerald-300' :
                            item.impact === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>{item.impact}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Weaknesses */}
                <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/20">
                  <h4 className="text-lg font-semibold text-red-400 mb-4">Weaknesses</h4>
                  <ul className="space-y-2">
                    {items.filter(i => i.category === 'weakness').map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {item.text}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                            item.impact === 'High' ? 'bg-red-500/20 text-red-300' :
                            item.impact === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>{item.impact}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Opportunities */}
                <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/20">
                  <h4 className="text-lg font-semibold text-blue-400 mb-4">Opportunities</h4>
                  <ul className="space-y-2">
                    {items.filter(i => i.category === 'opportunity').map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <ArrowUpRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {item.text}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                            item.impact === 'High' ? 'bg-blue-500/20 text-blue-300' :
                            item.impact === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>{item.impact}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Threats */}
                <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/20">
                  <h4 className="text-lg font-semibold text-amber-400 mb-4">Threats</h4>
                  <ul className="space-y-2">
                    {items.filter(i => i.category === 'threat').map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <Minus className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {item.text}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                            item.impact === 'High' ? 'bg-amber-500/20 text-amber-300' :
                            item.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>{item.impact}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* What Users Want */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl p-8 border border-cyan-500/30"
      >
        <h3 className="text-2xl font-bold text-white mb-6">
          What Users Are Actively Seeking in the Market
        </h3>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'All-in-One Platform', pct: 78, desc: 'Tired of switching tools' },
            { label: 'AI-Powered Editing', pct: 72, desc: 'Reduce manual work' },
            { label: 'Easy Learning Curve', pct: 85, desc: 'Use within first hour' },
            { label: 'Affordable Pricing', pct: 81, desc: 'Under $50/month ideal' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{item.pct}%</div>
              <div className="text-white font-medium mb-1">{item.label}</div>
              <div className="text-sm text-slate-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
