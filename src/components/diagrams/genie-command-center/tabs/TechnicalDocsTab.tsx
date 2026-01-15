/**
 * Technical Docs Tab - PRD, BRD, FRS Documentation
 * Updated: 2026-01-15 with accurate implementation status
 * 289 Total Scenarios | 165 Implemented (57%) | P0-P2 Complete
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Book, Layers, Target,
  CheckCircle2, Clock, Shield, Users,
  TrendingUp, BarChart3, Zap, Globe,
  Brain, Video, Sparkles, MessageSquare
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

// =============================================================================
// PRD Requirements by Priority - UPDATED 2026-01-15
// =============================================================================
const prdRequirements = {
  P0: [
    { id: 'PRD-001', name: 'User Authentication & Authorization', status: 'done', segment: 'All', scenarios: '111-115' },
    { id: 'PRD-002', name: 'Script Generation Engine (AI-Powered)', status: 'done', segment: 'All', scenarios: '1-4' },
    { id: 'PRD-003', name: 'Recording Studio Core (WebRTC)', status: 'done', segment: 'All', scenarios: '61-65' },
    { id: 'PRD-004', name: 'Multi-Provider TTS (5 providers)', status: 'done', segment: 'All', scenarios: '7-10' },
    { id: 'PRD-005', name: 'Subscription & Billing (Stripe)', status: 'done', segment: 'All', scenarios: '66-70' },
    { id: 'PRD-006', name: 'Export Pipeline (MP4, WebM, WAV, SRT)', status: 'done', segment: 'All', scenarios: '141-145' },
    { id: 'PRD-007', name: 'Mind↔Vibe Bidirectional Bridge', status: 'done', segment: 'All', scenarios: '61-65' },
    { id: 'PRD-008', name: 'Agent Integration Core', status: 'done', segment: 'All', scenarios: '111-120' },
  ],
  P1: [
    { id: 'PRD-010', name: 'Mobile Responsive Design (23 components)', status: 'done', segment: 'All', scenarios: '81-90' },
    { id: 'PRD-011', name: 'Voice Synthesis Selection (Multi-provider)', status: 'done', segment: 'Creators', scenarios: '11-16' },
    { id: 'PRD-012', name: 'Project Management & Library', status: 'done', segment: 'All', scenarios: '21-24' },
    { id: 'PRD-013', name: 'Calendar Integration', status: 'done', segment: 'Enterprise', scenarios: '151-152' },
    { id: 'PRD-014', name: 'Credit System (ai_credit_packages)', status: 'done', segment: 'All', scenarios: '146-150' },
    { id: 'PRD-015', name: 'Route Guards & Protected Routes', status: 'done', segment: 'All', scenarios: '71-75' },
    { id: 'PRD-016', name: 'Module Access Gates (RBAC)', status: 'done', segment: 'All', scenarios: '116-120' },
  ],
  P2: [
    { id: 'PRD-020', name: 'AI Agent System (15+ agents)', status: 'done', segment: 'All', scenarios: '166-177' },
    { id: 'PRD-021', name: 'Ask Genie Context-Aware Assistant', status: 'done', segment: 'All', scenarios: '211-225' },
    { id: 'PRD-022', name: 'Production Hub Kanban', status: 'done', segment: 'Enterprise', scenarios: '196-200' },
    { id: 'PRD-023', name: 'Guided Wizards (Spark 5-phase, Vibe 7-phase, Hub 7-phase)', status: 'done', segment: 'All', scenarios: '171-177' },
    { id: 'PRD-024', name: 'PWA Installation & Offline Mode', status: 'done', segment: 'All', scenarios: '156-165' },
    { id: 'PRD-025', name: 'Cross-Product Integration (Mind↔Vibe↔Spark↔Hub)', status: 'done', segment: 'All', scenarios: '178-195' },
    { id: 'PRD-026', name: 'Voice Director Agent', status: 'done', segment: 'All', scenarios: '166-167' },
    { id: 'PRD-027', name: 'Scene Analyzer Agent', status: 'done', segment: 'All', scenarios: '168-169' },
    { id: 'PRD-028', name: 'Music Composer Agent', status: 'done', segment: 'All', scenarios: '173-174' },
    { id: 'PRD-029', name: 'Auto-Editor Agent', status: 'done', segment: 'All', scenarios: '175-176' },
  ],
  P3: [
    { id: 'PRD-030', name: 'Bulk Video Generation', status: 'pending', segment: 'Enterprise', scenarios: '33-35' },
    { id: 'PRD-031', name: 'Social Cuts Automation (TikTok/Reels)', status: 'pending', segment: 'Creators', scenarios: '39' },
    { id: 'PRD-032', name: 'Voice Cloning Integration', status: 'pending', segment: 'All', scenarios: '5' },
    { id: 'PRD-033', name: 'Viral Score Predictor', status: 'pending', segment: 'Creators', scenarios: '41' },
    { id: 'PRD-034', name: 'Direct Platform Publishing (YouTube, LinkedIn)', status: 'pending', segment: 'All', scenarios: '42' },
    { id: 'PRD-035', name: 'Auto Thumbnail Generation', status: 'pending', segment: 'All', scenarios: '37' },
    { id: 'PRD-036', name: 'SEO Optimization Tools', status: 'pending', segment: 'All', scenarios: '38' },
    { id: 'PRD-037', name: 'B-Roll Library Integration', status: 'pending', segment: 'All', scenarios: '14' },
  ],
  P4: [
    { id: 'PRD-040', name: 'Multi-Language Support (140+ languages)', status: 'pending', segment: 'All', scenarios: '51-54' },
    { id: 'PRD-041', name: 'Real-time Collaboration', status: 'pending', segment: 'Enterprise', scenarios: '55-57' },
    { id: 'PRD-042', name: 'Version Control & History', status: 'pending', segment: 'All', scenarios: '59-60' },
    { id: 'PRD-043', name: 'HIPAA Full Compliance', status: 'pending', segment: 'Healthcare', scenarios: '45' },
    { id: 'PRD-044', name: 'Advanced Analytics Dashboard', status: 'pending', segment: 'Enterprise', scenarios: '238-250' },
    { id: 'PRD-045', name: 'Compliance & Legal Review Gates', status: 'pending', segment: 'Enterprise', scenarios: '43-46' },
  ],
  P5: [
    { id: 'PRD-050', name: 'SSO/SAML Integration', status: 'pending', segment: 'Enterprise', scenarios: '269-276' },
    { id: 'PRD-051', name: 'White-Label Options', status: 'pending', segment: 'Enterprise', scenarios: '277-284' },
    { id: 'PRD-052', name: 'Custom AI Model Training', status: 'pending', segment: 'Enterprise', scenarios: '285-289' },
    { id: 'PRD-053', name: 'Data Residency Controls', status: 'pending', segment: 'Enterprise', scenarios: '290-296' },
    { id: 'PRD-054', name: 'Enterprise Admin Console', status: 'pending', segment: 'Enterprise', scenarios: '269-276' },
  ],
};

// =============================================================================
// Segment Feature Matrix - UPDATED with product mapping
// =============================================================================
const segmentFeatureMatrix = [
  { feature: 'Script Generation (Mind)', creators: true, enterprise: true, healthcare: true, education: true, agencies: true, travelers: true, status: 'done', scenarios: 32 },
  { feature: 'Video Recording (Vibe)', creators: true, enterprise: true, healthcare: true, education: true, agencies: true, travelers: true, status: 'done', scenarios: 52 },
  { feature: 'Text-to-Speech (5 providers)', creators: true, enterprise: true, healthcare: true, education: true, agencies: true, travelers: true, status: 'done', scenarios: 15 },
  { feature: 'AI Agents (15+)', creators: true, enterprise: true, healthcare: true, education: true, agencies: true, travelers: true, status: 'done', scenarios: 20 },
  { feature: 'Ask Genie Assistant', creators: true, enterprise: true, healthcare: true, education: true, agencies: true, travelers: true, status: 'done', scenarios: 16 },
  { feature: 'Guided Wizards', creators: true, enterprise: true, healthcare: true, education: true, agencies: true, travelers: true, status: 'done', scenarios: 12 },
  { feature: 'Production Hub', creators: false, enterprise: true, healthcare: true, education: false, agencies: true, travelers: false, status: 'done', scenarios: 22 },
  { feature: 'Quick Start (Spark)', creators: true, enterprise: true, healthcare: true, education: true, agencies: true, travelers: true, status: 'done', scenarios: 25 },
  { feature: 'Mobile PWA', creators: true, enterprise: true, healthcare: true, education: true, agencies: true, travelers: true, status: 'done', scenarios: 23 },
  { feature: 'Bulk Generation', creators: false, enterprise: true, healthcare: false, education: false, agencies: true, travelers: false, status: 'pending', scenarios: 10 },
  { feature: 'Voice Cloning', creators: true, enterprise: true, healthcare: false, education: false, agencies: true, travelers: false, status: 'pending', scenarios: 5 },
  { feature: 'Multi-Language (140+)', creators: true, enterprise: true, healthcare: true, education: true, agencies: true, travelers: true, status: 'pending', scenarios: 8 },
  { feature: 'HIPAA Compliance', creators: false, enterprise: false, healthcare: true, education: false, agencies: false, travelers: false, status: 'pending', scenarios: 5 },
  { feature: 'White-Label', creators: false, enterprise: true, healthcare: true, education: false, agencies: true, travelers: false, status: 'pending', scenarios: 8 },
  { feature: 'SSO/SAML', creators: false, enterprise: true, healthcare: true, education: false, agencies: false, travelers: false, status: 'pending', scenarios: 8 },
];

// =============================================================================
// Product Scenario Cross-Reference
// =============================================================================
const productScenarioMapping = [
  { product: 'Genie Mind', icon: Brain, implemented: 32, total: 45, crossFunctional: ['Vibe', 'Spark', 'Hub'], color: 'emerald' },
  { product: 'Genie Vibe', icon: Video, implemented: 52, total: 65, crossFunctional: ['Mind', 'Spark', 'Hub'], color: 'purple' },
  { product: 'Genie Spark', icon: Sparkles, implemented: 25, total: 35, crossFunctional: ['Mind', 'Vibe'], color: 'amber' },
  { product: 'Production Hub', icon: Users, implemented: 22, total: 32, crossFunctional: ['Arc', 'Vibe', 'Mind'], color: 'blue' },
  { product: 'Genie Arc', icon: Layers, implemented: 18, total: 28, crossFunctional: ['Hub', 'Vibe'], color: 'indigo' },
  { product: 'Ask Genie', icon: MessageSquare, implemented: 16, total: 20, crossFunctional: ['All Products'], color: 'rose' },
];

// =============================================================================
// BRD Business Objectives & Metrics
// =============================================================================
const businessObjectives = [
  { objective: 'Capture 2% of AI video market by 2027', metric: '$500M market opportunity', status: 'on-track' },
  { objective: 'Achieve $8.5M ARR by end of Year 2', metric: 'Current: $0 (pre-launch)', status: 'planned' },
  { objective: 'LTV:CAC ratio above 3x', metric: 'Target: 3.5x', status: 'planned' },
  { objective: 'Reduce content production time by 75%', metric: 'Current: 70% reduction achieved', status: 'achieved' },
  { objective: 'Support 6 initial market segments', metric: '6/6 segments configured', status: 'achieved' },
  { objective: 'Deploy 15+ AI agents', metric: '15/15 agents deployed', status: 'achieved' },
];

const successMetrics = [
  { metric: 'Monthly Active Users', target: '50,000 by Month 18', current: 'Pre-launch' },
  { metric: 'Free to Paid Conversion', target: '5%', current: 'N/A' },
  { metric: 'Monthly Churn Rate', target: 'Below 5%', current: 'N/A' },
  { metric: 'Net Promoter Score', target: 'Above 40', current: 'N/A' },
  { metric: 'Support Response Time', target: 'Under 4 hours', current: 'N/A' },
  { metric: 'P0-P2 Completion', target: '100%', current: '100% ✅' },
];

// =============================================================================
// FRS Functional Requirements
// =============================================================================
const functionalRequirements = [
  {
    title: 'Authentication & Authorization',
    icon: Shield,
    reqs: [
      { name: 'Email/password authentication (Supabase)', status: 'done' },
      { name: 'OAuth integration (Google)', status: 'done' },
      { name: 'Role-based access control (RBAC)', status: 'done' },
      { name: 'Session management & refresh', status: 'done' },
      { name: 'Row Level Security on all tables', status: 'done' },
      { name: 'Module access gates (useModuleAccess)', status: 'done' },
      { name: 'Route guards (protected routes)', status: 'done' },
    ],
    status: 'complete',
    completion: 100,
  },
  {
    title: 'Content Production Pipeline',
    icon: Layers,
    reqs: [
      { name: 'Script CRUD operations', status: 'done' },
      { name: 'Video recording with WebRTC', status: 'done' },
      { name: 'Multi-format export (MP4, WebM, WAV, SRT)', status: 'done' },
      { name: 'Teleprompter with sync scrolling', status: 'done' },
      { name: 'Audio mixing & mastering (4-track)', status: 'done' },
      { name: 'Background blur (ML-based)', status: 'done' },
      { name: '7-phase guided editing experience', status: 'done' },
    ],
    status: 'complete',
    completion: 100,
  },
  {
    title: 'AI Integration Layer',
    icon: Brain,
    reqs: [
      { name: 'Multi-provider TTS routing (5 providers)', status: 'done' },
      { name: 'LLM script generation (GPT-4, Claude)', status: 'done' },
      { name: 'Scene analysis AI (visual detection)', status: 'done' },
      { name: 'Agent orchestration (15+ agents)', status: 'done' },
      { name: 'RAG knowledge base integration', status: 'done' },
      { name: 'Context-aware Ask Genie (1,318 lines)', status: 'done' },
      { name: 'Universal AI processor (edge function)', status: 'done' },
    ],
    status: 'complete',
    completion: 100,
  },
  {
    title: 'Subscription & Billing',
    icon: TrendingUp,
    reqs: [
      { name: 'Stripe checkout integration', status: 'done' },
      { name: 'Customer portal (manage subscription)', status: 'done' },
      { name: 'Credit system (ai_credit_packages)', status: 'done' },
      { name: 'Usage tracking per module', status: 'done' },
      { name: 'Plan upgrade/downgrade flow', status: 'done' },
      { name: 'Free trial management', status: 'partial' },
      { name: 'Invoice generation', status: 'pending' },
    ],
    status: 'partial',
    completion: 85,
  },
  {
    title: 'Mobile & PWA',
    icon: Globe,
    reqs: [
      { name: 'Responsive design (23 components)', status: 'done' },
      { name: 'PWA installation prompts', status: 'done' },
      { name: 'Service worker caching', status: 'done' },
      { name: 'Offline studio mode', status: 'done' },
      { name: 'One-tap recording', status: 'done' },
      { name: 'Voice-first editing commands', status: 'done' },
      { name: 'Location story mode', status: 'done' },
    ],
    status: 'complete',
    completion: 100,
  },
  {
    title: 'Cross-Product Integration',
    icon: Zap,
    reqs: [
      { name: 'Mind↔Vibe bidirectional bridge', status: 'done' },
      { name: 'Spark→Mind/Vibe export', status: 'done' },
      { name: 'Hub↔Arc project sync', status: 'done' },
      { name: 'Ask Genie context awareness', status: 'done' },
      { name: 'Shared asset library', status: 'done' },
      { name: 'Cross-product guided wizards', status: 'done' },
      { name: 'Unified analytics tracking', status: 'partial' },
    ],
    status: 'partial',
    completion: 90,
  },
];

export const TechnicalDocsTab: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState('prd');

  // Calculate PRD stats
  const totalPrdItems = Object.values(prdRequirements).flat().length;
  const donePrdItems = Object.values(prdRequirements).flat().filter(r => r.status === 'done').length;
  const prdCompletion = Math.round((donePrdItems / totalPrdItems) * 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-6 p-6"
    >
      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Scenarios', value: '289', color: 'primary' },
          { label: 'Implemented', value: '165 (57%)', color: 'green' },
          { label: 'PRD Items', value: `${donePrdItems}/${totalPrdItems}`, color: 'blue' },
          { label: 'FRS Modules', value: '6/6', color: 'purple' },
          { label: 'Segments', value: '6', color: 'amber' },
        ].map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Document Selector */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeDoc} onValueChange={setActiveDoc}>
          <ScrollArea className="w-full whitespace-nowrap pb-3">
            <TabsList className="inline-flex h-auto gap-1 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger 
                value="prd" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="w-4 h-4" />
                <span className="whitespace-nowrap">PRD ({prdCompletion}%)</span>
              </TabsTrigger>
              <TabsTrigger 
                value="brd" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Book className="w-4 h-4" />
                <span className="whitespace-nowrap">BRD</span>
              </TabsTrigger>
              <TabsTrigger 
                value="frs" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Layers className="w-4 h-4" />
                <span className="whitespace-nowrap">FRS</span>
              </TabsTrigger>
              <TabsTrigger 
                value="segments" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="w-4 h-4" />
                <span className="whitespace-nowrap">Segment Matrix</span>
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="whitespace-nowrap">Product-Scenario Map</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* PRD Content */}
          <TabsContent value="prd" className="mt-6 border-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Product Requirements Document - P0 to P5</span>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                    {prdCompletion}% Complete
                  </Badge>
                </CardTitle>
                <CardDescription>
                  289 Total Scenarios | 165 Implemented | P0-P2 100% Complete
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(prdRequirements).map(([priority, reqs]) => {
                  const doneCount = reqs.filter(r => r.status === 'done').length;
                  const isComplete = doneCount === reqs.length;
                  return (
                    <div key={priority}>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant={isComplete ? 'default' : 'secondary'} 
                          className={isComplete
                            ? 'bg-green-500/10 text-green-600 border-green-500/30'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          }
                        >
                          {priority}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          {doneCount}/{reqs.length} Complete
                        </span>
                        <Progress value={(doneCount / reqs.length) * 100} className="h-2 w-24" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {reqs.map((req, index) => (
                          <div 
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              req.status === 'done' 
                                ? 'bg-green-500/5 border-green-500/20' 
                                : 'bg-muted/30 border-border'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {req.status === 'done' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-muted-foreground" />
                              )}
                              <div>
                                <span className="text-foreground font-medium text-sm">{req.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-muted-foreground">{req.id}</span>
                                  <span className="text-xs text-muted-foreground">• Scenarios: {req.scenarios}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {req.segment}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BRD Content */}
          <TabsContent value="brd" className="mt-6 border-0 p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Business Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessObjectives.map((obj, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          obj.status === 'achieved' ? 'bg-green-500' :
                          obj.status === 'on-track' ? 'bg-amber-500' : 'bg-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <p className="text-foreground text-sm font-medium">{obj.objective}</p>
                          <p className="text-xs text-muted-foreground mt-1">{obj.metric}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          obj.status === 'achieved' ? 'border-green-500/30 text-green-600' :
                          obj.status === 'on-track' ? 'border-amber-500/30 text-amber-600' : ''
                        }`}>
                          {obj.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Success Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {successMetrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                        <div>
                          <p className="text-foreground text-sm font-medium">{metric.metric}</p>
                          <p className="text-xs text-muted-foreground mt-1">Target: {metric.target}</p>
                        </div>
                        <Badge variant="outline" className={metric.current.includes('✅') ? 'border-green-500/30 text-green-600' : ''}>
                          {metric.current}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FRS Content */}
          <TabsContent value="frs" className="mt-6 border-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>Functional Requirements Specification</CardTitle>
                <CardDescription>6 Core Modules | 42 Requirements | 95% Complete</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {functionalRequirements.map((section, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <section.icon className="w-5 h-5 text-primary" />
                            <CardTitle className="text-base">{section.title}</CardTitle>
                          </div>
                          <Badge className={
                            section.status === 'complete' 
                              ? 'bg-green-500/10 text-green-600 border-green-500/30'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          }>
                            {section.completion}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 mb-4">
                          {section.reqs.map((req, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              {req.status === 'done' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : req.status === 'partial' ? (
                                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              ) : (
                                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className={req.status === 'done' ? 'text-foreground' : 'text-muted-foreground'}>
                                {req.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segment Feature Matrix */}
          <TabsContent value="segments" className="mt-6 border-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>Segment Feature Matrix</CardTitle>
                <CardDescription>6 Market Segments | 15 Features | Implementation Status</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left text-muted-foreground font-medium px-4 py-3 rounded-tl-lg">Feature</th>
                      <th className="text-center text-muted-foreground font-medium px-3 py-3">Creators</th>
                      <th className="text-center text-muted-foreground font-medium px-3 py-3">Enterprise</th>
                      <th className="text-center text-muted-foreground font-medium px-3 py-3">Healthcare</th>
                      <th className="text-center text-muted-foreground font-medium px-3 py-3">Education</th>
                      <th className="text-center text-muted-foreground font-medium px-3 py-3">Agencies</th>
                      <th className="text-center text-muted-foreground font-medium px-3 py-3">Travelers</th>
                      <th className="text-center text-muted-foreground font-medium px-3 py-3">Status</th>
                      <th className="text-center text-muted-foreground font-medium px-3 py-3 rounded-tr-lg">Scenarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentFeatureMatrix.map((row, index) => (
                      <tr 
                        key={index}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-foreground font-medium">{row.feature}</td>
                        {[row.creators, row.enterprise, row.healthcare, row.education, row.agencies, row.travelers].map((val, i) => (
                          <td key={i} className="px-3 py-3 text-center">
                            {val ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-3 text-center">
                          <Badge className={
                            row.status === 'done' 
                              ? 'bg-green-500/10 text-green-600 border-green-500/30'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          }>
                            {row.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">{row.scenarios}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product-Scenario Mapping */}
          <TabsContent value="products" className="mt-6 border-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>Product-Scenario Cross-Reference</CardTitle>
                <CardDescription>Which scenarios belong to which product & cross-functional sharing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productScenarioMapping.map((product, index) => {
                    const completion = Math.round((product.implemented / product.total) * 100);
                    return (
                      <Card key={index} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-${product.color}-500/10 flex items-center justify-center`}>
                              <product.icon className={`w-5 h-5 text-${product.color}-600`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">{product.product}</h4>
                              <p className="text-xs text-muted-foreground">
                                {product.implemented}/{product.total} scenarios
                              </p>
                            </div>
                          </div>
                          <Progress value={completion} className="h-2 mb-3" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Completion</span>
                            <span className="font-medium text-foreground">{completion}%</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-1">Cross-functional with:</p>
                            <div className="flex flex-wrap gap-1">
                              {product.crossFunctional.map((cf, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {cf}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};
