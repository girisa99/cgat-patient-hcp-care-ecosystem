/**
 * Genie Investor Dashboard
 * Comprehensive visual analytics for investor presentations
 * Updated 2026-01-11 with collaboration features
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Plane,
  Briefcase,
  GraduationCap,
  Heart,
  Building,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  Star,
  Target,
  Zap,
  Download,
  Maximize2,
  PieChart,
  BarChart3,
  LineChart,
  Lightbulb,
  Shield,
  Globe,
  Smartphone,
  MessageSquare,
  RefreshCw,
  Award,
  ArrowRight,
  Clock,
  DollarSign,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

// Enhanced Segment Data with Collaboration Features
const segments = [
  {
    id: 'creator',
    name: 'Creator Economy',
    icon: Users,
    marketSize: '$50B+',
    growthRate: '+20%',
    tam: '$50B',
    sam: '$12B',
    som: '$600M',
    genieFit: 5,
    priority: 'P0',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    collaboration: 'Basic',
    competitors: [
      { name: 'Descript', pricing: '$12-24/mo', threat: 'High', gap: 'No real-time collaboration', userBase: '3M+', revenue: '$50M ARR', founded: 2017, languages: 25 },
      { name: 'CapCut', pricing: 'Free/$8/mo', threat: 'High', gap: 'No script-first workflow', userBase: '500M+', revenue: '$200M+ ARR', founded: 2020, languages: 45 },
      { name: 'Riverside.fm', pricing: '$15-24/mo', threat: 'Medium', gap: 'Limited post-production', userBase: '500K+', revenue: '$15M ARR', founded: 2020, languages: 12 },
      { name: 'Kapwing', pricing: '$16-24/mo', threat: 'Medium', gap: 'Basic AI features', userBase: '10M+', revenue: '$20M ARR', founded: 2017, languages: 8 },
    ],
    painPoints: [
      '"I spend 2 hours editing a 60-second reel"',
      '"Finding music and syncing takes forever"',
      '"No feedback loop with sponsors"',
    ],
    genieAdvantage: [
      'Script → TTS → Record → Publish unified',
      'AI auto-edit and clip extraction',
      'Basic collaboration for guest reviews',
    ],
    improvementNeeded: ['Match voice cloning quality (ElevenLabs level)', 'Add trending sounds library', 'Viral scoring algorithm'],
    appOpportunities: ['ScriptGenius', 'VoiceOver Pro', 'ClipMaster', 'ReelGenius'],
    integrations: ['YouTube', 'TikTok', 'Instagram', 'Spotify', 'Canva'],
    aiAgents: ['script_generation_agent', 'clip_extraction_agent', 'social_publish_agent'],
    userPreferences: { mobile: 72, desktop: 28, collaboration: 35 },
  },
  {
    id: 'traveler',
    name: 'Travel Experience',
    icon: Plane,
    marketSize: '$8B+',
    growthRate: '+15%',
    tam: '$8B',
    sam: '$2B',
    som: '$100M',
    genieFit: 4,
    priority: 'P1',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    collaboration: 'None',
    competitors: [
      { name: 'InShot', pricing: 'Free/$3.99/mo', threat: 'Medium', gap: 'No AI narration', userBase: '500M+', revenue: '$100M+ ARR', founded: 2015, languages: 30 },
      { name: 'GoPro Quik', pricing: 'Free/$9.99/yr', threat: 'Low', gap: 'GoPro-only', userBase: '10M+', revenue: 'N/A', founded: 2016, languages: 12 },
    ],
    painPoints: [
      '"500 photos/videos sit unused in my camera roll"',
      '"No time to edit trip memories"',
      '"Offline editing impossible"',
    ],
    genieAdvantage: [
      'Offline-first recording & sync',
      'AI location tagging & auto-edit',
      'Travel montage templates',
    ],
    improvementNeeded: ['Match InShot filter variety', 'Add social story templates', 'GPS-triggered auto-record'],
    appOpportunities: ['TripClip', 'TravelMontage'],
    integrations: ['Google Maps', 'Expedia'],
    aiAgents: ['location_tagging_agent', 'montage_generation_agent'],
    userPreferences: { mobile: 92, desktop: 8, collaboration: 5 },
  },
  {
    id: 'smb',
    name: 'SMB Marketing',
    icon: Briefcase,
    marketSize: '$15B+',
    growthRate: '+25%',
    tam: '$15B',
    sam: '$4B',
    som: '$200M',
    genieFit: 5,
    priority: 'P0',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    collaboration: 'Standard',
    competitors: [
      { name: 'Loom', pricing: '$12.50/mo', threat: 'High', gap: 'No AI editing', userBase: '25M+', revenue: '$150M ARR', founded: 2015, languages: 10 },
      { name: 'Synthesia', pricing: '$22-67/mo', threat: 'High', gap: 'Expensive, robotic', userBase: '100K+', revenue: '$60M ARR', founded: 2017, languages: 140 },
      { name: 'Pictory', pricing: '$19-39/mo', threat: 'Medium', gap: 'Template-bound', userBase: '200K+', revenue: '$10M ARR', founded: 2020, languages: 8 },
      { name: 'Canva Video', pricing: '$12.99/mo', threat: 'Medium', gap: 'Basic editing', userBase: '170M+', revenue: '$2.3B ARR', founded: 2013, languages: 100 },
    ],
    painPoints: [
      '"Cannot afford a video team"',
      '"Product demos are outdated"',
      '"No easy way to get manager approval"',
    ],
    genieAdvantage: [
      'Affordable AI + product templates',
      'Team feedback without email chains',
      'Auto-update demos from product changes',
    ],
    improvementNeeded: ['Add AI avatar option', 'Quick screen recording mode', 'Blog/article import'],
    appOpportunities: ['QuickPromo', 'DemoMaker', 'TrainingForge'],
    integrations: ['HubSpot', 'Shopify', 'Zapier', 'Salesforce'],
    aiAgents: ['product_demo_agent', 'marketing_video_agent', 'brand_voice_agent'],
    userPreferences: { mobile: 35, desktop: 65, collaboration: 68 },
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    marketSize: '$12B+',
    growthRate: '+18%',
    tam: '$12B',
    sam: '$3B',
    som: '$150M',
    genieFit: 4,
    priority: 'P1',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    collaboration: 'Full',
    competitors: [
      { name: 'Panopto', pricing: 'Custom', threat: 'High', gap: 'Enterprise pricing', userBase: '1000+ inst', revenue: '$100M+ ARR', founded: 2007, languages: 20 },
      { name: 'Edpuzzle', pricing: 'Free/$8/mo', threat: 'Medium', gap: 'Limited creation', userBase: '20M+ teachers', revenue: '$30M ARR', founded: 2013, languages: 15 },
      { name: 'WeVideo', pricing: '$4.99-15.99/mo', threat: 'Medium', gap: 'Dated UI', userBase: '30M+', revenue: '$25M ARR', founded: 2011, languages: 8 },
    ],
    painPoints: [
      '"Recording is easy, making it engaging takes hours"',
      '"No way to get student feedback on content"',
      '"LMS integration is a nightmare"',
    ],
    genieAdvantage: [
      'Lesson builder from curriculum notes',
      'Student review cycles with status tracking',
      'Native LMS integration (Canvas, Blackboard)',
    ],
    improvementNeeded: ['Deepen LMS integrations', 'Add interactive quiz overlay', 'Chromebook optimization'],
    appOpportunities: ['EduClip', 'LectureGenius'],
    integrations: ['Canvas LMS', 'Blackboard', 'Google Classroom'],
    aiAgents: ['lesson_builder_agent', 'curriculum_agent', 'assessment_agent'],
    userPreferences: { mobile: 25, desktop: 75, collaboration: 82 },
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    marketSize: '$25B+',
    growthRate: '+22%',
    tam: '$25B',
    sam: '$6B',
    som: '$300M',
    genieFit: 5,
    priority: 'P0',
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-500/10',
    collaboration: 'Full',
    competitors: [
      { name: 'Healthwise', pricing: 'Custom', threat: 'Medium', gap: 'No customization', userBase: '2000+ hosp', revenue: '$80M ARR', founded: 1975, languages: 20 },
      { name: 'Emmi Solutions', pricing: 'Custom', threat: 'Medium', gap: 'Expensive', userBase: '500+ health sys', revenue: '$50M ARR', founded: 2002, languages: 25 },
    ],
    painPoints: [
      '"Patients forget 80% of what I tell them"',
      '"HIPAA makes video complicated"',
      '"Need content in 15 languages"',
    ],
    genieAdvantage: [
      'First HIPAA-compliant AI video under $100/mo',
      'Multi-stakeholder approval workflows',
      'Multi-language patient education',
    ],
    improvementNeeded: ['Build clinical content library partnerships', 'Add patient engagement tracking', 'EHR deep integration'],
    appOpportunities: ['HealthNarrate', 'PatientEducator'],
    integrations: ['Epic', 'Cerner', 'Zoom Healthcare'],
    aiAgents: ['patient_education_agent', 'compliance_agent', 'translation_agent'],
    userPreferences: { mobile: 40, desktop: 60, collaboration: 95 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building,
    marketSize: '$40B+',
    growthRate: '+15%',
    tam: '$40B',
    sam: '$10B',
    som: '$500M',
    genieFit: 4,
    priority: 'P1',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-500/10',
    collaboration: 'Full',
    competitors: [
      { name: 'Brightcove', pricing: 'Custom', threat: 'Medium', gap: 'No creation tools', userBase: '3000+ ent', revenue: '$200M ARR', founded: 2004, languages: 20 },
      { name: 'Kaltura', pricing: 'Custom', threat: 'High', gap: 'Overwhelming complexity', userBase: '1000+ ent', revenue: '$170M ARR', founded: 2006, languages: 30 },
      { name: 'Synthesia Enterprise', pricing: 'Custom', threat: 'Medium', gap: 'Robotic feel', userBase: '500+ ent', revenue: '$40M ARR', founded: 2017, languages: 140 },
    ],
    painPoints: [
      '"Training videos are 3 years old"',
      '"Approval chains take weeks"',
      '"Localization at scale is impossible"',
    ],
    genieAdvantage: [
      'White-label + full approval workflows',
      'Real-time collaboration with audit trails',
      'Multi-language automation at scale',
    ],
    improvementNeeded: ['Add M365 deep integration', 'Enterprise CDN options', 'Open source option'],
    appOpportunities: ['TrainBot', 'PolicyCaster', 'GlobalVoice'],
    integrations: ['Microsoft 365', 'Workday', 'Okta/Azure AD', 'n8n'],
    aiAgents: ['training_agent', 'compliance_agent', 'localization_agent', 'approval_workflow_agent'],
    userPreferences: { mobile: 20, desktop: 80, collaboration: 98 },
  },
];

// Genie Differentiators
const differentiators = [
  {
    icon: Layers,
    title: 'Unified Pipeline',
    description: 'Script → TTS → Record → Publish in one platform',
    competitors: 'Competitors require 3-5 tools',
    metric: '73%',
    metricLabel: 'users want "one app for everything"',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Collaboration',
    description: 'Two-way host/participant feedback with live status sync',
    competitors: 'Competitors rely on email chains',
    metric: '42%',
    metricLabel: 'want "team feedback without email"',
  },
  {
    icon: RefreshCw,
    title: 'Bidirectional Flow',
    description: 'Content → AI Analysis → Enhanced Script → Production',
    competitors: 'One-way workflows only',
    metric: 'Unique',
    metricLabel: 'no competitor offers this',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First',
    description: 'Full production suite on mobile with offline support',
    competitors: 'Desktop-only or limited mobile',
    metric: '68%',
    metricLabel: 'want mobile-first editing',
  },
  {
    icon: Shield,
    title: 'Healthcare Compliant',
    description: 'HIPAA-compliant AI video under $100/month',
    competitors: '$1000+/month for compliance',
    metric: '<$100',
    metricLabel: 'vs $1000+ competitors',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'AI translation and dubbing at scale',
    competitors: 'Manual or expensive services',
    metric: '15+',
    metricLabel: 'languages supported',
  },
];

// Roadmap phases
const roadmapPhases = [
  { phase: 'P0', name: 'Core + Collaboration', status: 'completed', completion: 100, scenarios: 14, quarter: 'Q1 2026' },
  { phase: 'P1', name: 'Mobile & Remix', status: 'in-progress', completion: 30, scenarios: 10, quarter: 'Q2 2026' },
  { phase: 'P2', name: 'Advanced Features', status: 'planned', completion: 10, scenarios: 10, quarter: 'Q3 2026' },
  { phase: 'P3', name: 'Segment-Specific', status: 'planned', completion: 0, scenarios: 10, quarter: 'Q4 2026' },
  { phase: 'P4', name: 'Enterprise', status: 'planned', completion: 0, scenarios: 10, quarter: 'Q1 2027' },
  { phase: 'P5', name: 'Innovation', status: 'planned', completion: 0, scenarios: 10, quarter: 'Q2 2027' },
];

// Key metrics for investors
const keyMetrics = [
  { label: 'Total Addressable Market', value: '$150B+', icon: DollarSign },
  { label: 'Serviceable Market', value: '$37B', icon: Target },
  { label: 'Initial Target (SOM)', value: '$1.85B', icon: Zap },
  { label: 'Scenarios Implemented', value: '14/140', icon: Check },
  { label: 'AI Agents Ready', value: '12', icon: Lightbulb },
  { label: 'Integration Partners', value: '25+', icon: Globe },
];

export const GenieInvestorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      const html2canvasModule = await import('html2canvas');
      const canvas = await html2canvasModule.default(diagramRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `genie-investor-dashboard-${activeTab}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Dashboard exported as PNG');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const getSegmentById = (id: string) => segments.find(s => s.id === id);

  return (
    <Card className="w-full border border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Genie Suite — Investor Dashboard
          </CardTitle>
          <CardDescription>
            Market Analysis • Competitive Landscape • User Analytics • Roadmap
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="segments">6 Segments</TabsTrigger>
            <TabsTrigger value="differentiators">Why Genie?</TabsTrigger>
            <TabsTrigger value="analytics">User Analytics</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="financials">TAM/SAM/SOM</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[650px]">
            <div ref={diagramRef} className="p-6 bg-white dark:bg-slate-900 rounded-lg space-y-6">
              
              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Key Metrics */}
                <div className="grid grid-cols-6 gap-3">
                  {keyMetrics.map((metric, i) => (
                    <Card key={i} className="p-4 text-center">
                      <metric.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </Card>
                  ))}
                </div>

                {/* Quick Segment Summary */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Market Segments at a Glance
                  </h3>
                  <div className="grid grid-cols-6 gap-3">
                    {segments.map((seg) => (
                      <div
                        key={seg.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all hover:scale-105",
                          seg.bgColor,
                          selectedSegment === seg.id && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedSegment(seg.id === selectedSegment ? null : seg.id)}
                      >
                        <seg.icon className="h-6 w-6 mb-2" />
                        <div className="font-semibold text-sm">{seg.name}</div>
                        <div className="text-xs text-muted-foreground">{seg.marketSize}</div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {seg.collaboration} Collab
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Competitive Advantage Summary */}
                <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Why Genie Wins
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">73%</div>
                      <div className="text-sm text-muted-foreground">Want unified platform</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500">42%</div>
                      <div className="text-sm text-muted-foreground">Need team collaboration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500">68%</div>
                      <div className="text-sm text-muted-foreground">Prefer mobile-first</div>
                    </div>
                  </div>
                </Card>

                {/* Implementation Progress */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Implementation Progress
                  </h3>
                  <div className="space-y-3">
                    {roadmapPhases.slice(0, 3).map((phase) => (
                      <div key={phase.phase} className="flex items-center gap-4">
                        <Badge variant={phase.status === 'completed' ? 'default' : phase.status === 'in-progress' ? 'secondary' : 'outline'}>
                          {phase.phase}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{phase.name}</span>
                            <span>{phase.completion}%</span>
                          </div>
                          <Progress value={phase.completion} className="h-2" />
                        </div>
                        <span className="text-xs text-muted-foreground">{phase.scenarios} scenarios</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* SEGMENTS TAB */}
              <TabsContent value="segments" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {segments.map((seg) => (
                    <Card key={seg.id} className={cn("p-4", seg.bgColor)}>
                      <div className="flex items-center gap-3 mb-3">
                        <seg.icon className="h-8 w-8" />
                        <div>
                          <h3 className="font-semibold">{seg.name}</h3>
                          <div className="flex gap-2">
                            <Badge variant="outline">{seg.marketSize}</Badge>
                            <Badge variant="outline">{seg.growthRate}</Badge>
                            <Badge>{seg.collaboration} Collab</Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pain Points */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-muted-foreground mb-1">Pain Points:</div>
                        {seg.painPoints.slice(0, 2).map((pain, i) => (
                          <div key={i} className="text-xs italic text-muted-foreground">{pain}</div>
                        ))}
                      </div>

                      {/* Genie Advantage */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-green-600 mb-1">Genie Advantage:</div>
                        {seg.genieAdvantage.slice(0, 2).map((adv, i) => (
                          <div key={i} className="text-xs flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-500" />
                            {adv}
                          </div>
                        ))}
                      </div>

                      {/* Competitors */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-red-600 mb-1">Key Competitors:</div>
                        <div className="flex flex-wrap gap-1">
                          {seg.competitors.map((c, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">
                              {c.name} ({c.pricing})
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* User Preferences */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold">{seg.userPreferences.mobile}%</div>
                          <div className="text-xs text-muted-foreground">Mobile</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{seg.userPreferences.desktop}%</div>
                          <div className="text-xs text-muted-foreground">Desktop</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{seg.userPreferences.collaboration}%</div>
                          <div className="text-xs text-muted-foreground">Need Collab</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* DIFFERENTIATORS TAB */}
              <TabsContent value="differentiators" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {differentiators.map((diff, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <diff.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{diff.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{diff.description}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <X className="h-3 w-3 text-red-500" />
                            <span className="text-red-600">{diff.competitors}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{diff.metric}</div>
                          <div className="text-xs text-muted-foreground">{diff.metricLabel}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* NEW: Collaboration Feature Highlight */}
                <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                    <MessageSquare className="h-5 w-5" />
                    NEW: Two-Way Session Collaboration (Just Launched)
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl">📝</div>
                      <div className="text-sm font-medium">Suggestion Box</div>
                      <div className="text-xs text-muted-foreground">Script, title, recording feedback</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">🔄</div>
                      <div className="text-sm font-medium">Live Status Sync</div>
                      <div className="text-xs text-muted-foreground">ARC ↔ Production Hub</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">🔔</div>
                      <div className="text-sm font-medium">Push/Pull Notifications</div>
                      <div className="text-xs text-muted-foreground">Host & participant alerts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">✅</div>
                      <div className="text-sm font-medium">Approval Workflow</div>
                      <div className="text-xs text-muted-foreground">Multi-stage review</div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* ANALYTICS TAB */}
              <TabsContent value="analytics" className="space-y-4 mt-0">
                {/* User Preference Charts */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Platform Preference by Segment
                    </h3>
                    <div className="space-y-3">
                      {segments.map((seg) => (
                        <div key={seg.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{seg.name}</span>
                            <span className="text-muted-foreground">
                              📱 {seg.userPreferences.mobile}% | 🖥️ {seg.userPreferences.desktop}%
                            </span>
                          </div>
                          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                            <div 
                              className="bg-blue-500" 
                              style={{ width: `${seg.userPreferences.mobile}%` }}
                            />
                            <div 
                              className="bg-gray-400" 
                              style={{ width: `${seg.userPreferences.desktop}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Collaboration Need by Segment
                    </h3>
                    <div className="space-y-3">
                      {segments.map((seg) => (
                        <div key={seg.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{seg.name}</span>
                            <span className={cn(
                              seg.userPreferences.collaboration > 80 ? "text-green-600 font-semibold" :
                              seg.userPreferences.collaboration > 50 ? "text-amber-600" : "text-muted-foreground"
                            )}>
                              {seg.userPreferences.collaboration}%
                            </span>
                          </div>
                          <Progress 
                            value={seg.userPreferences.collaboration} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* User Research Quotes */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    User Research Highlights
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-3xl mb-2">73%</div>
                      <div className="text-sm font-medium">"One app for everything"</div>
                      <div className="text-xs text-muted-foreground">Want unified platform</div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-3xl mb-2">42%</div>
                      <div className="text-sm font-medium">"No more email chains"</div>
                      <div className="text-xs text-muted-foreground">Want team feedback</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl mb-2">38%</div>
                      <div className="text-sm font-medium">"Know when approved"</div>
                      <div className="text-xs text-muted-foreground">Want real-time status</div>
                    </div>
                  </div>
                </Card>

                {/* AI Agents Summary */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    AI Agents by Segment (12 Total)
                  </h3>
                  <div className="grid grid-cols-6 gap-2">
                    {segments.map((seg) => (
                      <div key={seg.id} className={cn("p-2 rounded-lg text-center", seg.bgColor)}>
                        <seg.icon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">{seg.name}</div>
                        <div className="text-lg font-bold">{seg.aiAgents.length}</div>
                        <div className="text-xs text-muted-foreground">agents</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* ROADMAP TAB */}
              <TabsContent value="roadmap" className="space-y-4 mt-0">
                <div className="space-y-4">
                  {roadmapPhases.map((phase, i) => (
                    <Card 
                      key={phase.phase} 
                      className={cn(
                        "p-4",
                        phase.status === 'completed' && "bg-green-50 dark:bg-green-900/20 border-green-500/30",
                        phase.status === 'in-progress' && "bg-amber-50 dark:bg-amber-900/20 border-amber-500/30",
                        phase.status === 'planned' && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={phase.status === 'completed' ? 'default' : phase.status === 'in-progress' ? 'secondary' : 'outline'}
                            className="text-lg px-3 py-1"
                          >
                            {phase.phase}
                          </Badge>
                          <div>
                            <h3 className="font-semibold">{phase.name}</h3>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                              <span>{phase.scenarios} scenarios</span>
                              <span>•</span>
                              <span>{phase.quarter}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32">
                            <Progress value={phase.completion} className="h-3" />
                          </div>
                          <span className="font-bold text-lg">{phase.completion}%</span>
                          {phase.status === 'completed' && <Check className="h-6 w-6 text-green-500" />}
                          {phase.status === 'in-progress' && <Clock className="h-6 w-6 text-amber-500" />}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Timeline Visual */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">18-Month Timeline</h3>
                  <div className="flex items-center justify-between">
                    {roadmapPhases.map((phase, i) => (
                      <React.Fragment key={phase.phase}>
                        <div className="text-center">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white",
                            phase.status === 'completed' && "bg-green-500",
                            phase.status === 'in-progress' && "bg-amber-500",
                            phase.status === 'planned' && "bg-gray-300"
                          )}>
                            {phase.phase}
                          </div>
                          <div className="text-xs mt-1">{phase.quarter}</div>
                        </div>
                        {i < roadmapPhases.length - 1 && (
                          <ArrowRight className="h-6 w-6 text-muted-foreground" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* FINANCIALS TAB */}
              <TabsContent value="financials" className="space-y-4 mt-0">
                {/* TAM/SAM/SOM Summary */}
                <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
                  <h3 className="font-semibold mb-4 text-xl">Total Addressable Market Analysis</h3>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="text-4xl font-bold text-primary">$150B+</div>
                      <div className="text-lg font-medium">TAM</div>
                      <div className="text-sm text-muted-foreground">Total Addressable Market</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-green-500">$37B</div>
                      <div className="text-lg font-medium">SAM</div>
                      <div className="text-sm text-muted-foreground">Serviceable Addressable Market</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-amber-500">$1.85B</div>
                      <div className="text-lg font-medium">SOM</div>
                      <div className="text-sm text-muted-foreground">Serviceable Obtainable Market</div>
                    </div>
                  </div>
                </Card>

                {/* By Segment */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Market Size by Segment</h3>
                  <div className="space-y-4">
                    {segments.map((seg) => (
                      <div key={seg.id} className="flex items-center gap-4">
                        <seg.icon className="h-6 w-6" />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{seg.name}</span>
                            <span className="text-sm">{seg.marketSize} TAM</span>
                          </div>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>SAM: {seg.sam}</span>
                            <span>•</span>
                            <span>SOM: {seg.som}</span>
                            <span>•</span>
                            <span className="text-green-600">{seg.growthRate} YoY</span>
                          </div>
                        </div>
                        <Badge variant={seg.priority === 'P0' ? 'default' : 'outline'}>
                          {seg.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Revenue Model */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Subscription Tiers</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { tier: 'Free', price: '$0', target: 'Trial', collab: 'None' },
                      { tier: 'Starter', price: '$9.99/mo', target: 'Creator/Traveler', collab: 'Basic' },
                      { tier: 'Business', price: '$29.99/mo', target: 'SMB', collab: 'Standard' },
                      { tier: 'Pro', price: '$79.99/mo', target: 'Education', collab: 'Full' },
                      { tier: 'Enterprise', price: 'Custom', target: 'Healthcare/Enterprise', collab: 'Full' },
                    ].map((tier, i) => (
                      <div key={tier.tier} className={cn(
                        "p-3 rounded-lg border text-center",
                        i === 2 && "border-primary bg-primary/5"
                      )}>
                        <div className="font-bold">{tier.tier}</div>
                        <div className="text-xl font-bold text-primary">{tier.price}</div>
                        <div className="text-xs text-muted-foreground">{tier.target}</div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {tier.collab} Collab
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GenieInvestorDashboard;
