/**
 * Overview Tab - Problem Statement & User Journey
 * Enhanced with detailed time/cost breakdowns and Voice of Customer
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, AlertTriangle, DollarSign, 
  TrendingUp, Zap, Target,
  ArrowRight, CheckCircle2, XCircle,
  Sparkles, Users, Layers, MessageSquareQuote,
  Video, FileText, Mic, Globe, BarChart3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Enhanced Journey Steps with detailed metrics
const journeySteps = [
  {
    step: 1,
    title: 'Ideation & Scripting',
    icon: FileText,
    before: { 
      time: '2-4 hours', 
      timePercent: 18,
      cost: '$45-90',
      tools: 'ChatGPT + Google Docs + Research', 
      pain: 'Context switching, version chaos',
      output: '1 script draft'
    },
    after: { 
      time: '15-30 min', 
      tools: 'Genie Mind', 
      wow: 'AI writes, refines, and organizes in one place',
      output: '3-5 script variants'
    },
    criticalPain: true,
    timeWasted: '85%',
  },
  {
    step: 2,
    title: 'Voice & Audio',
    icon: Mic,
    before: { 
      time: '1-3 hours', 
      timePercent: 12,
      cost: '$25-75',
      tools: 'ElevenLabs + Audacity + Multiple logins', 
      pain: 'Manual export/import cycles',
      output: '1 audio file'
    },
    after: { 
      time: '5 min', 
      tools: 'Genie Vibe', 
      wow: '11 TTS providers, auto-sync with script',
      output: 'Multi-language audio'
    },
    criticalPain: false,
    timeWasted: '92%',
  },
  {
    step: 3,
    title: 'Recording & Production',
    icon: Video,
    before: { 
      time: '3-6 hours', 
      timePercent: 28,
      cost: '$75-150',
      tools: 'Loom + OBS + Teleprompter app + Camera', 
      pain: 'Setup time, re-takes, lighting issues',
      output: '1 raw video'
    },
    after: { 
      time: '20 min', 
      tools: 'Genie Arc', 
      wow: 'Smart teleprompter, AI-powered scene cuts',
      output: 'Polished recording'
    },
    criticalPain: true,
    timeWasted: '89%',
  },
  {
    step: 4,
    title: 'Editing & Assembly',
    icon: Layers,
    before: { 
      time: '4-10 hours', 
      timePercent: 35,
      cost: '$100-250',
      tools: 'Premiere + After Effects + Canva', 
      pain: 'Steep learning curve, render times',
      output: '1 edited video'
    },
    after: { 
      time: '30 min', 
      tools: 'Genie Spark', 
      wow: 'AI edits, auto-captions, one-click polish',
      output: 'Platform-ready video'
    },
    criticalPain: true,
    timeWasted: '92%',
  },
  {
    step: 5,
    title: 'Distribution & Publishing',
    icon: Globe,
    before: { 
      time: '1-2 hours', 
      timePercent: 7,
      cost: '$25-50',
      tools: 'Hootsuite + YouTube Studio + Manual uploads', 
      pain: 'Format conversion nightmare',
      output: '1-2 platforms'
    },
    after: { 
      time: '2 min', 
      tools: 'Genie Suite', 
      wow: 'One-click multi-platform publish',
      output: '6+ platforms'
    },
    criticalPain: false,
    timeWasted: '96%',
  },
];

// Enhanced Pain Point Data with Voice of Customer
const segmentPainPoints = [
  {
    segment: 'Content Creators',
    emoji: '🎬',
    avgHoursPerWeek: 25,
    videosPerWeek: 2,
    toolsUsed: 8,
    monthlyToolCost: '$247',
    frustrationScore: 78,
    topPain: 'Switching between 8+ apps for one video',
    biggestTimeWaste: 'Editing & Assembly (40%)',
    voc: {
      quote: "I spend more time fighting with software than actually creating. By the time I export from one tool and import to another, I have lost my creative flow.",
      author: 'Sarah K.',
      role: 'YouTube Creator, 250K subscribers',
    },
    keyGap: 'No unified workflow - each tool solves one piece',
  },
  {
    segment: 'Corporate L&D',
    emoji: '🏢',
    avgHoursPerWeek: 18,
    videosPerWeek: 1,
    toolsUsed: 6,
    monthlyToolCost: '$890',
    frustrationScore: 72,
    topPain: 'Content outdated before rollout',
    biggestTimeWaste: 'Approval cycles (45%)',
    voc: {
      quote: "We spent 3 months creating a compliance video. By the time it was approved, the regulations had changed. We need to update content in hours, not months.",
      author: 'Michael R.',
      role: 'L&D Director, Fortune 500',
    },
    keyGap: 'Slow iteration - cannot quickly update existing content',
  },
  {
    segment: 'Marketing Teams',
    emoji: '📈',
    avgHoursPerWeek: 22,
    videosPerWeek: 4,
    toolsUsed: 10,
    monthlyToolCost: '$1,250',
    frustrationScore: 81,
    topPain: 'Multi-platform format juggling',
    biggestTimeWaste: 'Format conversion (35%)',
    voc: {
      quote: "Every platform wants different specs. TikTok, YouTube Shorts, Instagram Reels - we are basically making the same video 5 times. It is insane.",
      author: 'Jennifer L.',
      role: 'Marketing Manager, SaaS Startup',
    },
    keyGap: 'No automated multi-format export',
  },
  {
    segment: 'Healthcare',
    emoji: '🏥',
    avgHoursPerWeek: 15,
    videosPerWeek: 1,
    toolsUsed: 5,
    monthlyToolCost: '$2,100',
    frustrationScore: 85,
    topPain: 'HIPAA compliance delays everything',
    biggestTimeWaste: 'Compliance review (55%)',
    voc: {
      quote: "We cannot use most video tools because of HIPAA. The ones that are compliant cost a fortune and have terrible UX. Our nurses give up and just do in-person training.",
      author: 'Dr. Patricia M.',
      role: 'Chief Medical Officer, Regional Hospital',
    },
    keyGap: 'Compliance-first video tools do not exist affordably',
  },
  {
    segment: 'Educators',
    emoji: '📚',
    avgHoursPerWeek: 12,
    videosPerWeek: 3,
    toolsUsed: 7,
    monthlyToolCost: '$180',
    frustrationScore: 69,
    topPain: 'No time for video during teaching load',
    biggestTimeWaste: 'Recording retakes (50%)',
    voc: {
      quote: "I want to create engaging video lectures but I teach 5 classes. I tried once and it took my entire weekend for one 10-minute video. Never again.",
      author: 'Prof. David H.',
      role: 'University Professor, Computer Science',
    },
    keyGap: 'Too time-intensive for already-busy educators',
  },
  {
    segment: 'Agencies',
    emoji: '🎯',
    avgHoursPerWeek: 35,
    videosPerWeek: 8,
    toolsUsed: 12,
    monthlyToolCost: '$3,500',
    frustrationScore: 76,
    topPain: 'Client revisions kill margins',
    biggestTimeWaste: 'Client revision cycles (60%)',
    voc: {
      quote: "Client says change one word in the script. That means re-record, re-edit, re-export, re-upload. 4 hours for one word. We are losing money on every project.",
      author: 'Marcus T.',
      role: 'Creative Director, Video Agency',
    },
    keyGap: 'Cannot make surgical edits without full re-work',
  },
];

// Project-level metrics
const projectMetrics = {
  singleVideoTraditional: {
    totalHours: '11-25 hours',
    totalCost: '$270-615',
    toolsRequired: '8-12 apps',
    outputFormats: 1,
    languages: 1,
  },
  singleVideoGenie: {
    totalHours: '1-2 hours',
    totalCost: '$29-79',
    toolsRequired: '1 platform',
    outputFormats: 6,
    languages: 'Unlimited',
  },
};

// Market Stats
const marketStats = [
  { stat: '86%', label: 'Businesses using video for marketing', trend: '+12% YoY', icon: Video },
  { stat: '$400B', label: 'Global video production market by 2030', trend: '19.6% CAGR', icon: DollarSign },
  { stat: '1,200%', label: 'More shares for video vs text+image', trend: 'Consistent', icon: TrendingUp },
  { stat: '72%', label: 'Prefer video over text for product info', trend: '+8% YoY', icon: BarChart3 },
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
      className="max-w-[1920px] mx-auto space-y-10 p-6"
    >
      {/* Hero Problem Statement */}
      <motion.div variants={itemVariants} className="text-center py-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <Badge variant="destructive" className="mb-4 px-4 py-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            The Content Production Crisis
          </Badge>
        </motion.div>
        
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Creators waste{' '}
          <span className="text-primary">25+ hours per week</span>{' '}
          juggling fragmented tools
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The average content professional uses <strong>8-12 disconnected applications</strong> to produce 
          a single piece of content, spending <strong>$270-615 per video</strong> in tool costs and labor.
        </p>
      </motion.div>

      {/* Project Comparison Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traditional Workflow */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-destructive" />
              <CardTitle className="text-destructive">Traditional Workflow (1 Video)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-3xl font-bold text-destructive">{projectMetrics.singleVideoTraditional.totalHours}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Time</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-3xl font-bold text-destructive">{projectMetrics.singleVideoTraditional.totalCost}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Cost</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-foreground">{projectMetrics.singleVideoTraditional.toolsRequired}</div>
                <div className="text-sm text-muted-foreground mt-1">Tools Required</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-foreground">{projectMetrics.singleVideoTraditional.outputFormats} format</div>
                <div className="text-sm text-muted-foreground mt-1">Output</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Genie Workflow */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <CardTitle className="text-green-600 dark:text-green-400">With Genie Suite (1 Video)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{projectMetrics.singleVideoGenie.totalHours}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Time</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{projectMetrics.singleVideoGenie.totalCost}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Cost</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-foreground">{projectMetrics.singleVideoGenie.toolsRequired}</div>
                <div className="text-sm text-muted-foreground mt-1">Tools Required</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-foreground">{projectMetrics.singleVideoGenie.outputFormats}+ formats</div>
                <div className="text-sm text-muted-foreground mt-1">Multi-language</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Market Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {marketStats.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <motion.div 
                    className="text-3xl font-bold text-primary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {item.stat}
                  </motion.div>
                  <div className="text-sm text-muted-foreground mt-2">{item.label}</div>
                </div>
                <item.icon className="w-5 h-5 text-primary/60" />
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-green-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                {item.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* User Journey - Enhanced with Time Distribution */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            Content Creation Journey - Where Time & Money Go
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline" className="border-destructive/30 text-destructive">
              <div className="w-2 h-2 rounded-full bg-destructive mr-2" />
              Critical Pain Points
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {journeySteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className={step.criticalPain ? 'border-destructive/30' : ''}>
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* Step indicator with time % */}
                    <div className="w-28 bg-muted/50 flex flex-col items-center justify-center py-6 border-r border-border">
                      <motion.div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          step.criticalPain 
                            ? 'bg-destructive text-destructive-foreground' 
                            : 'bg-primary text-primary-foreground'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        <step.icon className="w-5 h-5" />
                      </motion.div>
                      <div className="text-xs text-muted-foreground mt-2 font-medium">
                        {step.before.timePercent}% of time
                      </div>
                      {step.criticalPain && (
                        <Badge variant="destructive" className="mt-2 text-[10px] px-1.5 py-0">
                          Pain Point
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-foreground">
                          Step {step.step}: {step.title}
                        </h4>
                        <Badge variant="outline" className="text-green-600 border-green-500/30">
                          {step.timeWasted} time saved
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Before */}
                        <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
                          <div className="flex items-center gap-2 mb-3">
                            <XCircle className="w-4 h-4 text-destructive" />
                            <span className="font-semibold text-destructive text-sm">Before Genie</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium text-foreground">{step.before.time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Cost:</span>
                              <span className="font-medium text-destructive">{step.before.cost}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Output:</span>
                              <span className="font-medium text-foreground">{step.before.output}</span>
                            </div>
                            <div className="pt-2 border-t border-destructive/20">
                              <span className="text-destructive text-xs flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {step.before.pain}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* After */}
                        <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600 text-sm">With Genie Suite</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium text-green-600">{step.after.time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Tool:</span>
                              <span className="font-medium text-foreground">{step.after.tools}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Output:</span>
                              <span className="font-medium text-foreground">{step.after.output}</span>
                            </div>
                            <div className="pt-2 border-t border-green-500/20">
                              <span className="text-green-600 text-xs flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {step.after.wow}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Time Savings Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="mt-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                    <Clock className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      Save 15+ hours per video
                    </div>
                    <div className="text-muted-foreground">
                      Total workflow reduced from 11-25 hours to under 2 hours
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive line-through opacity-60">25h</div>
                    <div className="text-xs text-muted-foreground">Before</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">2h</div>
                    <div className="text-xs text-muted-foreground">After</div>
                  </div>
                  <div className="hidden md:block border-l border-border h-12 mx-4" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive line-through opacity-60">$500+</div>
                    <div className="text-xs text-muted-foreground">Before</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">$50</div>
                    <div className="text-xs text-muted-foreground">After</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Segment Pain Points with Voice of Customer */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-destructive" />
          </div>
          Pain Points by Market Segment
          <Badge variant="secondary" className="ml-3">Voice of Customer</Badge>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {segmentPainPoints.map((segment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{segment.emoji}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{segment.segment}</h4>
                      <span className="text-xs text-muted-foreground">{segment.videosPerWeek} videos/week avg</span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <div className="font-bold text-foreground">{segment.avgHoursPerWeek}h</div>
                      <div className="text-[10px] text-muted-foreground">Weekly Hours</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <div className="font-bold text-foreground">{segment.toolsUsed} apps</div>
                      <div className="text-[10px] text-muted-foreground">Tools Used</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <div className="font-bold text-green-600">{segment.monthlyToolCost}</div>
                      <div className="text-[10px] text-muted-foreground">Monthly Cost</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <div className="font-bold text-destructive">{segment.frustrationScore}%</div>
                      <div className="text-[10px] text-muted-foreground">Frustration</div>
                    </div>
                  </div>

                  {/* Biggest Time Waste */}
                  <div className="bg-amber-500/10 rounded-lg p-3 mb-3 border border-amber-500/20">
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-600 mb-1">
                      <Clock className="w-3 h-3" />
                      Biggest Time Waste
                    </div>
                    <span className="text-sm text-foreground">{segment.biggestTimeWaste}</span>
                  </div>

                  {/* Key Gap */}
                  <div className="bg-destructive/5 rounded-lg p-3 mb-4 border border-destructive/10">
                    <div className="flex items-center gap-2 text-xs font-medium text-destructive mb-1">
                      <AlertTriangle className="w-3 h-3" />
                      Key Gap
                    </div>
                    <span className="text-sm text-foreground">{segment.keyGap}</span>
                  </div>

                  {/* Voice of Customer */}
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
                      <MessageSquareQuote className="w-3 h-3" />
                      Voice of Customer
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-3">
                      &ldquo;{segment.voc.quote}&rdquo;
                    </p>
                    <div className="text-xs">
                      <span className="font-medium text-foreground">{segment.voc.author}</span>
                      <span className="text-muted-foreground"> • {segment.voc.role}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Solution Summary */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <motion.div 
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center"
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
              <div className="flex items-center gap-4">
                <div className="text-center px-4 py-3 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary">289</div>
                  <div className="text-xs text-muted-foreground">Scenarios</div>
                </div>
                <div className="text-center px-4 py-3 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary">6</div>
                  <div className="text-xs text-muted-foreground">Products</div>
                </div>
                <div className="text-center px-4 py-3 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary">90%</div>
                  <div className="text-xs text-muted-foreground">Time Saved</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
