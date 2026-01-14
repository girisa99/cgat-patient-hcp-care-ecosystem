/**
 * Overview Tab - Problem Statement & Market Opportunity
 * Shows frustration metrics, time spent, fragmentation data
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, AlertTriangle, DollarSign, Users, 
  TrendingUp, Globe, Zap, Target,
  BarChart3, Layers, ArrowRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Pain Point Data by Segment
const segmentPainPoints = [
  {
    segment: 'Content Creators',
    emoji: '🎬',
    avgHoursPerWeek: 25,
    toolsUsed: 8,
    monthlyToolCost: '$247',
    frustrationScore: 78,
    topPain: 'Switching between 8+ apps for one video',
    learningCurve: '3-6 months to master workflow',
  },
  {
    segment: 'Corporate L&D',
    emoji: '🏢',
    avgHoursPerWeek: 18,
    toolsUsed: 6,
    monthlyToolCost: '$890',
    frustrationScore: 72,
    topPain: 'Content outdated before rollout',
    learningCurve: '2-4 months for training teams',
  },
  {
    segment: 'Marketing Teams',
    emoji: '📈',
    avgHoursPerWeek: 22,
    toolsUsed: 10,
    monthlyToolCost: '$1,250',
    frustrationScore: 81,
    topPain: 'Multi-platform format juggling',
    learningCurve: '4-8 months for full stack',
  },
  {
    segment: 'Healthcare',
    emoji: '🏥',
    avgHoursPerWeek: 15,
    toolsUsed: 5,
    monthlyToolCost: '$2,100',
    frustrationScore: 85,
    topPain: 'HIPAA compliance delays everything',
    learningCurve: '6-12 months with compliance',
  },
  {
    segment: 'Educators',
    emoji: '📚',
    avgHoursPerWeek: 12,
    toolsUsed: 7,
    monthlyToolCost: '$180',
    frustrationScore: 69,
    topPain: 'No time for video during teaching',
    learningCurve: '2-3 months basic setup',
  },
  {
    segment: 'Agencies',
    emoji: '🎯',
    avgHoursPerWeek: 35,
    toolsUsed: 12,
    monthlyToolCost: '$3,500',
    frustrationScore: 76,
    topPain: 'Client revisions kill margins',
    learningCurve: '6+ months to onboard new hires',
  },
];

// Market Fragmentation Data
const fragmentationData = [
  { category: 'Script Writing', tools: 15, leader: 'ChatGPT/Jasper', genieAdvantage: 'Integrated with production' },
  { category: 'Text-to-Speech', tools: 25, leader: 'ElevenLabs', genieAdvantage: '11 providers in one' },
  { category: 'Video Recording', tools: 20, leader: 'Loom/StreamYard', genieAdvantage: 'Teleprompter + sync' },
  { category: 'Video Editing', tools: 30, leader: 'DaVinci/Premiere', genieAdvantage: 'AI-driven editing' },
  { category: 'Thumbnail/Graphics', tools: 18, leader: 'Canva', genieAdvantage: 'Auto-generated' },
  { category: 'Distribution', tools: 22, leader: 'Hootsuite', genieAdvantage: 'One-click multi-platform' },
  { category: 'Analytics', tools: 25, leader: 'VidIQ/TubeBuddy', genieAdvantage: 'Built-in viral predictor' },
  { category: 'Collaboration', tools: 12, leader: 'Frame.io', genieAdvantage: 'Native team workflows' },
];

// Content Importance Metrics
const contentImportanceStats = [
  { stat: '86%', label: 'Businesses using video for marketing', source: 'Wyzowl 2024' },
  { stat: '72%', label: 'Prefer video over text for product info', source: 'HubSpot 2024' },
  { stat: '1,200%', label: 'More shares for video vs text+image', source: 'Brightcove' },
  { stat: '$400B', label: 'Global video production market by 2030', source: 'Grand View Research' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const OverviewTab: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-8 px-6"
    >
      {/* Hero Problem Statement */}
      <motion.div variants={itemVariants} className="text-center py-8">
        <h2 className="text-4xl font-bold text-white mb-4">
          The Content Production Crisis
        </h2>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Creators and businesses waste <span className="text-amber-400 font-semibold">25+ hours per week</span> juggling 
          <span className="text-violet-400 font-semibold"> 8-12 fragmented tools</span> to produce a single piece of content.
          Genie Suite unifies the entire workflow.
        </p>
      </motion.div>

      {/* Key Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
        {contentImportanceStats.map((item, index) => (
          <div 
            key={index}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-violet-500/30 transition-all"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              {item.stat}
            </div>
            <div className="text-sm text-slate-300 mt-2">{item.label}</div>
            <div className="text-xs text-slate-500 mt-1">Source: {item.source}</div>
          </div>
        ))}
      </motion.div>

      {/* Segment Pain Points Grid */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          Pain Points by Segment
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {segmentPainPoints.map((segment, index) => (
            <div
              key={index}
              className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-violet-500/30 transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{segment.emoji}</span>
                <div>
                  <h4 className="text-lg font-semibold text-white">{segment.segment}</h4>
                  <p className="text-xs text-slate-400">{segment.learningCurve}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Weekly Hours
                  </span>
                  <span className="text-white font-medium">{segment.avgHoursPerWeek}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Tools Used
                  </span>
                  <span className="text-white font-medium">{segment.toolsUsed} apps</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Monthly Cost
                  </span>
                  <span className="text-emerald-400 font-medium">{segment.monthlyToolCost}</span>
                </div>
                
                <div className="pt-3 border-t border-slate-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Frustration Score</span>
                    <span className="text-amber-400 font-medium">{segment.frustrationScore}%</span>
                  </div>
                  <Progress value={segment.frustrationScore} className="h-2 bg-slate-700" />
                </div>

                <div className="pt-3 bg-amber-500/10 rounded-lg p-3 -mx-1">
                  <span className="text-xs text-amber-400 font-medium">Top Pain Point:</span>
                  <p className="text-sm text-amber-200 mt-1">{segment.topPain}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Market Fragmentation Table */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-violet-400" />
          Market Fragmentation Analysis
        </h3>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/30">
                <th className="text-left text-slate-300 font-medium px-6 py-4">Category</th>
                <th className="text-center text-slate-300 font-medium px-6 py-4">Tools in Market</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Current Leader</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Genie Suite Advantage</th>
              </tr>
            </thead>
            <tbody>
              {fragmentationData.map((row, index) => (
                <tr 
                  key={index} 
                  className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-6 py-4 text-white font-medium">{row.category}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 text-red-400 font-semibold">
                      {row.tools}+
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{row.leader}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-emerald-400">
                      <Zap className="w-4 h-4" />
                      {row.genieAdvantage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-violet-400" />
            <div>
              <span className="text-violet-300 font-semibold">Total Fragmentation: </span>
              <span className="text-white">167+ tools across 8 categories that users must learn and integrate.</span>
              <span className="text-violet-400 ml-2">Genie Suite replaces them all with one unified platform.</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* The Solution Preview */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-2xl p-8 border border-violet-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Genie Suite: One Platform, Complete Workflow
            </h3>
            <p className="text-slate-300 max-w-2xl">
              From idea to published content in minutes, not days. AI-powered automation handles 
              the tedious work while you focus on creativity.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400">289</div>
              <div className="text-sm text-slate-400">Total Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-violet-400">133</div>
              <div className="text-sm text-slate-400">Implemented</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-400">46%</div>
              <div className="text-sm text-slate-400">Complete</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
