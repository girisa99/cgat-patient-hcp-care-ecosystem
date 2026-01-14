/**
 * Overview Tab - Problem Statement & User Journey
 * Enterprise design with WOW animations and journey visualization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, AlertTriangle, DollarSign, 
  TrendingUp, Zap, Target,
  ArrowRight, CheckCircle2, XCircle,
  Sparkles, Users, Layers
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
  },
  {
    segment: 'Corporate L&D',
    emoji: '🏢',
    avgHoursPerWeek: 18,
    toolsUsed: 6,
    monthlyToolCost: '$890',
    frustrationScore: 72,
    topPain: 'Content outdated before rollout',
  },
  {
    segment: 'Marketing Teams',
    emoji: '📈',
    avgHoursPerWeek: 22,
    toolsUsed: 10,
    monthlyToolCost: '$1,250',
    frustrationScore: 81,
    topPain: 'Multi-platform format juggling',
  },
  {
    segment: 'Healthcare',
    emoji: '🏥',
    avgHoursPerWeek: 15,
    toolsUsed: 5,
    monthlyToolCost: '$2,100',
    frustrationScore: 85,
    topPain: 'HIPAA compliance delays everything',
  },
  {
    segment: 'Educators',
    emoji: '📚',
    avgHoursPerWeek: 12,
    toolsUsed: 7,
    monthlyToolCost: '$180',
    frustrationScore: 69,
    topPain: 'No time for video during teaching',
  },
  {
    segment: 'Agencies',
    emoji: '🎯',
    avgHoursPerWeek: 35,
    toolsUsed: 12,
    monthlyToolCost: '$3,500',
    frustrationScore: 76,
    topPain: 'Client revisions kill margins',
  },
];

// User Journey Steps - Before vs After
const journeySteps = [
  {
    step: 1,
    title: 'Ideation & Scripting',
    before: { time: '2-4 hours', tools: 'ChatGPT + Google Docs + Research', pain: 'Context switching, version chaos' },
    after: { time: '15-30 min', tools: 'Genie Mind', wow: 'AI writes, refines, and organizes in one place' },
  },
  {
    step: 2,
    title: 'Voice & Audio',
    before: { time: '1-3 hours', tools: 'ElevenLabs + Audacity + Multiple logins', pain: 'Manual export/import cycles' },
    after: { time: '5 min', tools: 'Genie Vibe', wow: '11 TTS providers, auto-sync with script' },
  },
  {
    step: 3,
    title: 'Recording & Production',
    before: { time: '3-6 hours', tools: 'Loom + OBS + Teleprompter app + Camera', pain: 'Setup time, re-takes' },
    after: { time: '20 min', tools: 'Genie Arc', wow: 'Smart teleprompter, AI-powered scene cuts' },
  },
  {
    step: 4,
    title: 'Editing & Assembly',
    before: { time: '4-10 hours', tools: 'Premiere + After Effects + Canva', pain: 'Steep learning curve, render times' },
    after: { time: '30 min', tools: 'Genie Spark', wow: 'AI edits, auto-captions, one-click polish' },
  },
  {
    step: 5,
    title: 'Distribution',
    before: { time: '1-2 hours', tools: 'Hootsuite + YouTube Studio + Manual uploads', pain: 'Format conversion nightmare' },
    after: { time: '2 min', tools: 'Genie Suite', wow: 'One-click multi-platform publish' },
  },
];

// Market Stats
const marketStats = [
  { stat: '86%', label: 'Businesses using video for marketing', trend: '+12% YoY' },
  { stat: '$400B', label: 'Global video production market by 2030', trend: '19.6% CAGR' },
  { stat: '1,200%', label: 'More shares for video vs text+image', trend: 'Consistent' },
  { stat: '72%', label: 'Prefer video over text for product info', trend: '+8% YoY' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const OverviewTab: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-10"
    >
      {/* Hero Problem Statement */}
      <motion.div variants={itemVariants} className="text-center py-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
            <AlertTriangle className="w-4 h-4" />
            The Content Production Crisis
          </span>
        </motion.div>
        
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Creators waste{' '}
          <span className="text-primary">25+ hours per week</span>{' '}
          juggling fragmented tools
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The average content professional uses 8-12 disconnected applications 
          to produce a single piece of content. Genie Suite unifies the entire workflow.
        </p>
      </motion.div>

      {/* Market Stats - Animated Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-5">
        {marketStats.map((item, index) => (
          <motion.div
            key={index}
            className="relative bg-card rounded-2xl p-6 border border-border shadow-sm overflow-hidden group hover:shadow-lg transition-shadow"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative z-10">
              <motion.div 
                className="text-4xl font-bold text-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {item.stat}
              </motion.div>
              <div className="text-sm text-foreground mt-2 font-medium">{item.label}</div>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                <TrendingUp className="w-3 h-3" />
                {item.trend}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full -translate-y-8 translate-x-8" />
          </motion.div>
        ))}
      </motion.div>

      {/* User Journey - Before vs After */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            The Content Creation Journey
          </h3>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/70" />
              <span className="text-muted-foreground">Before Genie (Pain Points)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">With Genie Suite</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {journeySteps.map((step, index) => (
            <motion.div
              key={step.step}
              className="relative bg-card rounded-2xl border border-border overflow-hidden"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              {/* Step Number & Title */}
              <div className="flex items-stretch">
                {/* Step indicator */}
                <div className="w-20 bg-muted/50 flex flex-col items-center justify-center py-6 border-r border-border">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.step}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-4">{step.title}</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* Before */}
                    <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-destructive" />
                        <span className="font-semibold text-destructive">Before Genie</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium text-foreground">{step.before.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Tools:</span>
                          <span className="font-medium text-foreground text-right text-xs">{step.before.tools}</span>
                        </div>
                        <div className="pt-2 border-t border-destructive/20">
                          <span className="text-destructive font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {step.before.pain}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* After */}
                    <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-700 dark:text-green-400">With Genie Suite</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium text-green-700 dark:text-green-400">{step.after.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Tools:</span>
                          <span className="font-medium text-foreground">{step.after.tools}</span>
                        </div>
                        <div className="pt-2 border-t border-green-500/20">
                          <span className="text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {step.after.wow}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                {index < journeySteps.length - 1 && (
                  <div className="absolute -bottom-4 left-10 z-10">
                    <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Time Savings Summary */}
        <motion.div 
          className="mt-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                <Clock className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  Save 15+ hours per week
                </div>
                <div className="text-muted-foreground">
                  Total workflow time reduced from 11-25 hours to under 2 hours
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive line-through opacity-60">25h</div>
                <div className="text-xs text-muted-foreground">Before</div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary" />
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">2h</div>
                <div className="text-xs text-muted-foreground">After</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Segment Pain Points */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-destructive" />
          </div>
          Pain Points by Market Segment
        </h3>
        
        <div className="grid grid-cols-3 gap-5">
          {segmentPainPoints.map((segment, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{segment.emoji}</span>
                <h4 className="text-lg font-semibold text-foreground">{segment.segment}</h4>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Weekly Hours
                  </span>
                  <span className="font-semibold text-foreground">{segment.avgHoursPerWeek}h</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Tools Used
                  </span>
                  <span className="font-semibold text-foreground">{segment.toolsUsed} apps</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Monthly Cost
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{segment.monthlyToolCost}</span>
                </div>
                
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-muted-foreground">Frustration Score</span>
                    <span className="font-semibold text-destructive">{segment.frustrationScore}%</span>
                  </div>
                  <Progress value={segment.frustrationScore} className="h-2" />
                </div>

                <div className="mt-3 bg-destructive/5 rounded-xl p-3 border border-destructive/10">
                  <span className="text-xs font-medium text-destructive">Top Pain Point:</span>
                  <p className="text-sm text-foreground mt-1">{segment.topPain}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Solution Summary */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-8 border border-primary/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Target className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Genie Suite: One Platform, Complete Workflow
              </h3>
              <p className="text-muted-foreground mt-1">
                From idea to published content in minutes, not days. AI-powered automation handles the tedious work.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-primary"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                289
              </motion.div>
              <div className="text-sm text-muted-foreground">Total Scenarios</div>
            </div>
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-green-600 dark:text-green-400"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                133
              </motion.div>
              <div className="text-sm text-muted-foreground">Implemented</div>
            </div>
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-accent"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
              >
                46%
              </motion.div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
