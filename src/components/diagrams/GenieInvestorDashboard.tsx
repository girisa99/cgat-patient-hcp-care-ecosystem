/**
 * Genie Investor Dashboard
 * Comprehensive visual analytics for investor presentations
 * Clean table-based layout with SWOT, projections, and clear differentiators
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Plane,
  Briefcase,
  GraduationCap,
  Heart,
  Building,
  TrendingUp,
  Check,
  X,
  Star,
  Target,
  Zap,
  Download,
  Lightbulb,
  Shield,
  Globe,
  DollarSign,
  Filter,
  BarChart3,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Segment Data with Clear Advantages/Disadvantages
const segments = [
  {
    id: 'creator',
    name: 'Creator Economy',
    icon: Users,
    marketSize: '$50B+',
    growthRate: '+20%',
    tam: '$50B',
    tamDetails: 'All content creators globally (YouTube, TikTok, Instagram, podcasters)',
    sam: '$12B',
    samDetails: 'Creators needing video production tools (not just consumption)',
    som: '$600M',
    somDetails: 'Creators willing to pay for AI-powered unified production',
    genieFit: 5,
    priority: 'P0',
    softPricePoint: '$9-12/mo',
    marketPosition: 'Challenger',
    genieAdvantages: [
      { point: 'Script → TTS → Publish unified pipeline', impact: 'High', vs: 'Descript needs 3 tools' },
      { point: 'Mobile-first editing', impact: 'High', vs: 'Loom/Descript desktop-only' },
      { point: '30-50% cheaper than Descript', impact: 'Medium', vs: '$12 vs $24/mo' },
      { point: 'Real-time collaboration', impact: 'Medium', vs: 'Competitors use email' },
    ],
    genieDisadvantages: [
      { point: 'Voice cloning not as natural', gap: 'ElevenLabs/Descript ahead', priority: 'P1' },
      { point: 'No trending sounds library', gap: 'CapCut has 500K+ sounds', priority: 'P2' },
      { point: 'Desktop app not available', gap: 'Power users need desktop', priority: 'P3' },
    ],
    competitors: [
      { name: 'Descript', pricing: '$12-24/mo', userBase: '3M+', revenue: '$50M ARR', founded: 2017, threat: 'High', uxRating: 4 },
      { name: 'Loom', pricing: '$12.50/mo', userBase: '25M+', revenue: '$150M ARR', founded: 2015, threat: 'High', uxRating: 5 },
      { name: 'CapCut', pricing: 'Free/$8/mo', userBase: '500M+', revenue: '$200M ARR', founded: 2020, threat: 'High', uxRating: 5 },
      { name: 'Riverside.fm', pricing: '$15-24/mo', userBase: '500K+', revenue: '$15M ARR', founded: 2020, threat: 'Medium', uxRating: 4 },
    ],
  },
  {
    id: 'smb',
    name: 'SMB Marketing',
    icon: Briefcase,
    marketSize: '$15B+',
    growthRate: '+25%',
    tam: '$15B',
    tamDetails: 'All SMBs needing video marketing (30M+ businesses in US alone)',
    sam: '$4B',
    samDetails: 'SMBs actively investing in video content creation',
    som: '$200M',
    somDetails: 'SMBs adopting AI-first video tools vs traditional agencies',
    genieFit: 5,
    priority: 'P0',
    softPricePoint: '$12-18/mo',
    marketPosition: 'Disruptor',
    genieAdvantages: [
      { point: 'Affordable vs Synthesia (70% cheaper)', impact: 'High', vs: '$15 vs $67/mo' },
      { point: 'Team approval workflows built-in', impact: 'High', vs: 'Loom has none' },
      { point: 'Natural TTS + real presenter option', impact: 'Medium', vs: 'Synthesia robotic' },
      { point: 'Product demo auto-update', impact: 'Medium', vs: 'Manual elsewhere' },
    ],
    genieDisadvantages: [
      { point: 'No AI avatar option', gap: 'Synthesia core feature', priority: 'P2' },
      { point: 'Limited CRM integrations', gap: 'Loom has HubSpot/Salesforce', priority: 'P2' },
      { point: 'No blog/URL import', gap: 'Pictory does this well', priority: 'P3' },
    ],
    competitors: [
      { name: 'Loom', pricing: '$12.50/mo', userBase: '25M+', revenue: '$150M ARR', founded: 2015, threat: 'High', uxRating: 5 },
      { name: 'Synthesia', pricing: '$22-67/mo', userBase: '100K+', revenue: '$60M ARR', founded: 2017, threat: 'High', uxRating: 4 },
      { name: 'Pictory', pricing: '$19-39/mo', userBase: '200K+', revenue: '$10M ARR', founded: 2020, threat: 'Medium', uxRating: 3 },
      { name: 'Canva Video', pricing: '$12.99/mo', userBase: '170M+', revenue: '$2.3B ARR', founded: 2013, threat: 'Medium', uxRating: 5 },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    marketSize: '$25B+',
    growthRate: '+22%',
    tam: '$25B',
    tamDetails: 'All healthcare video/education (6K hospitals, 1M+ providers)',
    sam: '$6B',
    samDetails: 'Providers needing patient education video tools',
    som: '$300M',
    somDetails: 'Healthcare orgs adopting AI video under $100/mo',
    genieFit: 5,
    priority: 'P0',
    softPricePoint: '$50-100/mo',
    marketPosition: 'Blue Ocean',
    genieAdvantages: [
      { point: 'HIPAA-compliant AI under $100/mo', impact: 'Critical', vs: 'Healthwise $50K+/yr' },
      { point: 'Provider-created personalized content', impact: 'High', vs: 'Competitors generic' },
      { point: 'Multi-stakeholder approval workflows', impact: 'High', vs: 'Email chains' },
      { point: 'Multi-language patient education', impact: 'Medium', vs: 'Extra cost elsewhere' },
    ],
    genieDisadvantages: [
      { point: 'No clinical content library', gap: 'Healthwise has 50yr library', priority: 'P1' },
      { point: 'EHR integration depth pending', gap: 'Epic/Cerner full integration', priority: 'P2' },
      { point: 'No outcome tracking', gap: 'Emmi proven outcomes', priority: 'P2' },
    ],
    competitors: [
      { name: 'Healthwise', pricing: '$50K+/yr', userBase: '2000+ hosp', revenue: '$80M ARR', founded: 1975, threat: 'Medium', uxRating: 2 },
      { name: 'Emmi Solutions', pricing: '$30K+/yr', userBase: '500+ health sys', revenue: '$50M ARR', founded: 2002, threat: 'Medium', uxRating: 3 },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    marketSize: '$12B+',
    growthRate: '+18%',
    tam: '$12B',
    tamDetails: 'All educational video content (K-12, higher ed, corporate training)',
    sam: '$3B',
    samDetails: 'Educators actively creating video content',
    som: '$150M',
    somDetails: 'Early adopters of AI-powered lesson creation',
    genieFit: 4,
    priority: 'P1',
    softPricePoint: '$6-10/mo',
    marketPosition: 'Challenger',
    genieAdvantages: [
      { point: 'Modern AI-first UX', impact: 'High', vs: 'Panopto dated UI' },
      { point: 'Affordable per-seat pricing', impact: 'High', vs: 'Enterprise pricing elsewhere' },
      { point: 'Lesson builder from curriculum notes', impact: 'Medium', vs: 'Manual creation' },
      { point: 'Student review cycles', impact: 'Medium', vs: 'No feedback loop' },
    ],
    genieDisadvantages: [
      { point: 'Limited LMS integration depth', gap: 'Panopto 19yrs integration', priority: 'P1' },
      { point: 'No interactive quiz overlay', gap: 'Edpuzzle core feature', priority: 'P2' },
      { point: 'Chromebook optimization needed', gap: 'WeVideo optimized', priority: 'P3' },
    ],
    competitors: [
      { name: 'Panopto', pricing: '$2-5/user', userBase: '1000+ inst', revenue: '$100M ARR', founded: 2007, threat: 'High', uxRating: 2 },
      { name: 'Edpuzzle', pricing: 'Free/$8/mo', userBase: '20M+ teachers', revenue: '$30M ARR', founded: 2013, threat: 'Medium', uxRating: 4 },
      { name: 'WeVideo', pricing: '$5-16/mo', userBase: '30M+', revenue: '$25M ARR', founded: 2011, threat: 'Medium', uxRating: 2 },
    ],
  },
  {
    id: 'traveler',
    name: 'Travel Experience',
    icon: Plane,
    marketSize: '$8B+',
    growthRate: '+15%',
    tam: '$8B',
    tamDetails: 'Travel content creation tools and memory apps',
    sam: '$2B',
    samDetails: 'Travelers wanting to create/share trip content',
    som: '$100M',
    somDetails: 'Premium travelers willing to pay for AI editing',
    genieFit: 4,
    priority: 'P1',
    softPricePoint: '$4-6/mo',
    marketPosition: 'Opportunity',
    genieAdvantages: [
      { point: 'Offline-first recording & sync', impact: 'High', vs: 'Others need internet' },
      { point: 'AI location tagging & auto-edit', impact: 'High', vs: 'Manual tagging' },
      { point: 'Trip montage templates', impact: 'Medium', vs: 'Generic templates' },
      { point: 'No ads (vs InShot)', impact: 'Medium', vs: 'InShot heavy ads' },
    ],
    genieDisadvantages: [
      { point: 'Less filter variety', gap: 'InShot has 100+ filters', priority: 'P2' },
      { point: 'No social story templates', gap: 'InShot/CapCut strength', priority: 'P3' },
      { point: 'No action cam detection', gap: 'GoPro Quik specialty', priority: 'P3' },
    ],
    competitors: [
      { name: 'InShot', pricing: 'Free/$3.99/mo', userBase: '500M+', revenue: '$100M ARR', founded: 2015, threat: 'Medium', uxRating: 4 },
      { name: 'GoPro Quik', pricing: 'Free/$9.99/yr', userBase: '10M+', revenue: 'N/A', founded: 2016, threat: 'Low', uxRating: 3 },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building,
    marketSize: '$40B+',
    growthRate: '+15%',
    tam: '$40B',
    tamDetails: 'Enterprise video (training, comms, marketing)',
    sam: '$10B',
    samDetails: 'Enterprises investing in video platforms',
    som: '$500M',
    somDetails: 'Enterprises adopting modern AI video platforms',
    genieFit: 4,
    priority: 'P1',
    softPricePoint: '$200-500/mo',
    marketPosition: 'Challenger',
    genieAdvantages: [
      { point: 'White-label + approval workflows', impact: 'High', vs: 'Basic permissions' },
      { point: 'Real-time collab with audit trails', impact: 'High', vs: 'Email-based review' },
      { point: 'Multi-language automation', impact: 'High', vs: 'Manual translation' },
      { point: 'Affordable entry ($200 vs $1000+)', impact: 'Medium', vs: 'Brightcove/Kaltura' },
    ],
    genieDisadvantages: [
      { point: 'No M365 deep integration', gap: 'Kaltura has M365 integration', priority: 'P1' },
      { point: 'CDN options limited', gap: 'Brightcove global CDN', priority: 'P2' },
      { point: 'No open source option', gap: 'Kaltura open source', priority: 'P3' },
    ],
    competitors: [
      { name: 'Brightcove', pricing: '$500+/mo', userBase: '3000+ ent', revenue: '$200M ARR', founded: 2004, threat: 'Medium', uxRating: 3 },
      { name: 'Kaltura', pricing: '$300+/mo', userBase: '1000+ ent', revenue: '$170M ARR', founded: 2006, threat: 'High', uxRating: 2 },
      { name: 'Synthesia Ent', pricing: '$1000+/mo', userBase: '500+ ent', revenue: '$40M ARR', founded: 2017, threat: 'Medium', uxRating: 4 },
    ],
  },
];

// SWOT Analysis
const swotAnalysis = {
  strengths: [
    { item: 'Unified Script-to-Publish Pipeline', detail: 'Only platform doing end-to-end in one app' },
    { item: 'Healthcare HIPAA at 90% lower cost', detail: '$100/mo vs $50K+/yr competitors' },
    { item: 'Real-time Two-Way Collaboration', detail: 'No competitor has this for video production' },
    { item: 'Mobile-First Architecture', detail: '68% of users prefer mobile; competitors desktop-only' },
    { item: 'AI-Native from Day 1', detail: 'Not bolted on like legacy players' },
  ],
  weaknesses: [
    { item: 'Voice cloning quality behind leaders', detail: 'ElevenLabs/Descript 2 years ahead' },
    { item: 'No established enterprise customer base', detail: 'Competitors have Fortune 500 logos' },
    { item: 'Desktop app not available', detail: 'Power users need multi-monitor support' },
    { item: 'Limited integrations vs incumbents', detail: 'Panopto has 50+ LMS integrations' },
  ],
  opportunities: [
    { item: 'Healthcare blue ocean', detail: 'No modern HIPAA AI video under $1000/mo exists' },
    { item: 'SMB market underserved', detail: '$15B market, incumbents focused on enterprise' },
    { item: 'Mobile video creation explosion', detail: 'Gen-Z creating content 4x more than millennials' },
    { item: 'AI adoption accelerating', detail: '73% want "one app with AI for everything"' },
  ],
  threats: [
    { item: 'CapCut free tier dominance', detail: '500M users, $0 acquisition cost' },
    { item: 'Big Tech entry (Adobe, Google)', detail: 'Could launch competing products' },
    { item: 'Descript/Loom raising more capital', detail: 'Descript raised $100M, Loom acquired by Atlassian' },
    { item: 'AI commoditization', detail: 'Open source AI may close gap quickly' },
  ],
};

// 2-Year Projections
const projections = {
  year1: {
    year: '2026',
    users: '50K',
    arr: '$2.5M',
    segments: 'Creator, SMB, Healthcare (P0)',
    scenarios: '185/305',
    milestones: ['HIPAA certification', 'Mobile app v2', 'Enterprise pilot'],
  },
  year2: {
    year: '2027',
    users: '250K',
    arr: '$15M',
    segments: 'All 6 segments active',
    scenarios: '280/305',
    milestones: ['Series A', 'International expansion', 'API marketplace'],
  },
  assumptions: [
    { metric: 'CAC', value: '$35', basis: 'Blended PLG + outbound' },
    { metric: 'LTV', value: '$420', basis: '24mo avg lifetime, $17.50 ARPU' },
    { metric: 'LTV:CAC', value: '12:1', basis: 'Strong unit economics' },
    { metric: 'Churn', value: '5% monthly', basis: 'Industry average for SMB SaaS' },
    { metric: 'Conversion', value: '3%', basis: 'Free to paid (industry 2-5%)' },
  ],
};

// Roadmap
const roadmapPhases = [
  { phase: 'P0', name: 'Core MVP (35 Scenarios)', quarter: 'Q1 2026', completion: 100, status: 'completed' },
  { phase: 'P1', name: 'Essential Production (32 Scenarios)', quarter: 'Q1 2026', completion: 100, status: 'completed' },
  { phase: 'P2', name: 'AI Agents & UX (118 Scenarios)', quarter: 'Q2 2026', completion: 100, status: 'completed' },
  { phase: 'P3', name: 'Differentiators (58 Scenarios)', quarter: 'Q3 2026', completion: 0, status: 'planned' },
  { phase: 'P4', name: 'Enterprise (50 Scenarios)', quarter: 'Q4 2026', completion: 0, status: 'planned' },
  { phase: 'P5', name: 'Innovation (28 Scenarios)', quarter: 'Q1 2027', completion: 0, status: 'planned' },
];

export const GenieInvestorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  const filteredSegments = useMemo(() => {
    if (selectedSegment === 'all') return segments;
    return segments.filter(s => s.id === selectedSegment);
  }, [selectedSegment]);

  const allCompetitors = useMemo(() => {
    const segs = selectedSegment === 'all' ? segments : segments.filter(s => s.id === selectedSegment);
    return segs.flatMap(seg => 
      seg.competitors.map(comp => ({ ...comp, segment: seg.name }))
    );
  }, [selectedSegment]);

  // Calculate totals
  const totals = useMemo(() => {
    const p0Segments = segments.filter(s => s.priority === 'P0');
    return {
      tam: '$150B+',
      sam: '$37B',
      som: '$1.85B',
      p0Som: p0Segments.reduce((sum, s) => sum + parseInt(s.som.replace(/\D/g, '')), 0) + 'M',
    };
  }, []);

  return (
    <div className="w-full p-4">
      {/* Simple Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Genie Studio — Investor Dashboard
          </h1>
          <p className="text-muted-foreground">Market Analysis • Why Genie • SWOT • Projections</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Segment" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="all">All Segments</SelectItem>
              {segments.map(seg => (
                <SelectItem key={seg.id} value={seg.id}>{seg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs - Simpler with fewer tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex gap-1 bg-muted/50 p-1 rounded-lg w-fit flex-wrap">
          <TabsTrigger value="overview" className="px-4">Overview</TabsTrigger>
          <TabsTrigger value="unit-economics" className="px-4">Unit Economics</TabsTrigger>
          <TabsTrigger value="financials" className="px-4">Financials</TabsTrigger>
          <TabsTrigger value="traction" className="px-4">Traction</TabsTrigger>
          <TabsTrigger value="technology" className="px-4">Technology</TabsTrigger>
          <TabsTrigger value="segments" className="px-4">Segments</TabsTrigger>
          <TabsTrigger value="competitors" className="px-4">Competitors</TabsTrigger>
          <TabsTrigger value="swot" className="px-4">SWOT</TabsTrigger>
          <TabsTrigger value="projections" className="px-4">Projections</TabsTrigger>
          <TabsTrigger value="pricing" className="px-4">Pricing</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-280px)]">
          
          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            {/* TAM/SAM/SOM with Details */}
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Market Opportunity
              </h2>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-24">Metric</TableHead>
                    <TableHead className="w-24">Value</TableHead>
                    <TableHead>Definition</TableHead>
                    <TableHead>Genie Basis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-primary text-lg">TAM</TableCell>
                    <TableCell className="font-bold text-primary text-lg">$150B+</TableCell>
                    <TableCell>Total Addressable Market — everyone who could use the product</TableCell>
                    <TableCell className="text-sm text-muted-foreground">All video creation tools globally across 6 segments</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-green-600 text-lg">SAM</TableCell>
                    <TableCell className="font-bold text-green-600 text-lg">$37B</TableCell>
                    <TableCell>Serviceable Available Market — our target customers we can reach</TableCell>
                    <TableCell className="text-sm text-muted-foreground">Users needing AI-powered production tools (not just viewers)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-amber-600 text-lg">SOM</TableCell>
                    <TableCell className="font-bold text-amber-600 text-lg">$1.85B</TableCell>
                    <TableCell>Serviceable Obtainable Market — realistic capture in 3-5 years</TableCell>
                    <TableCell className="text-sm text-muted-foreground">Early adopters of unified AI video platforms</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Segment Summary Table */}
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Segment Overview
              </h2>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Segment</TableHead>
                    <TableHead>TAM</TableHead>
                    <TableHead>SAM</TableHead>
                    <TableHead>SOM</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Price Point</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSegments.map((seg) => (
                    <TableRow key={seg.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <seg.icon className="h-4 w-4" />
                          {seg.name}
                        </div>
                      </TableCell>
                      <TableCell>{seg.tam}</TableCell>
                      <TableCell>{seg.sam}</TableCell>
                      <TableCell className="font-semibold">{seg.som}</TableCell>
                      <TableCell className="text-green-600 font-medium">{seg.growthRate}</TableCell>
                      <TableCell>
                        <Badge variant={seg.priority === 'P0' ? 'default' : 'outline'}>{seg.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={seg.marketPosition === 'Blue Ocean' ? 'default' : 'secondary'} className="text-xs">
                          {seg.marketPosition}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-primary font-medium">{seg.softPricePoint}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Why Invest in Genie */}
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Why Invest in Genie?
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">$150B+</div>
                  <div className="text-sm font-medium">Total Market</div>
                  <div className="text-xs text-muted-foreground">6 segments, 20%+ growth</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">73%</div>
                  <div className="text-sm font-medium">Want Unified Platform</div>
                  <div className="text-xs text-muted-foreground">Genie only one doing it</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-amber-600">90%</div>
                  <div className="text-sm font-medium">Cheaper (Healthcare)</div>
                  <div className="text-xs text-muted-foreground">$100/mo vs $50K+/yr</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">12:1</div>
                  <div className="text-sm font-medium">LTV:CAC Ratio</div>
                  <div className="text-xs text-muted-foreground">Strong unit economics</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* UNIT ECONOMICS TAB - Critical for Investors */}
          <TabsContent value="unit-economics" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Unit Economics by Segment
            </h2>

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg text-center bg-green-50 dark:bg-green-900/20">
                <div className="text-3xl font-bold text-green-600">$420</div>
                <div className="text-sm font-medium">Blended LTV</div>
                <div className="text-xs text-muted-foreground">24mo avg lifetime</div>
              </div>
              <div className="p-4 border rounded-lg text-center bg-amber-50 dark:bg-amber-900/20">
                <div className="text-3xl font-bold text-amber-600">$35</div>
                <div className="text-sm font-medium">Blended CAC</div>
                <div className="text-xs text-muted-foreground">PLG + Outbound</div>
              </div>
              <div className="p-4 border rounded-lg text-center bg-primary/10">
                <div className="text-3xl font-bold text-primary">12:1</div>
                <div className="text-sm font-medium">LTV:CAC Ratio</div>
                <div className="text-xs text-muted-foreground">Target: 3:1+</div>
              </div>
              <div className="p-4 border rounded-lg text-center bg-blue-50 dark:bg-blue-900/20">
                <div className="text-3xl font-bold text-blue-600">$17.50</div>
                <div className="text-sm font-medium">Blended ARPU</div>
                <div className="text-xs text-muted-foreground">Monthly</div>
              </div>
              <div className="p-4 border rounded-lg text-center bg-red-50 dark:bg-red-900/20">
                <div className="text-3xl font-bold text-red-600">5%</div>
                <div className="text-sm font-medium">Monthly Churn</div>
                <div className="text-xs text-muted-foreground">Industry avg: 5-7%</div>
              </div>
            </div>

            {/* Detailed Unit Economics by Segment */}
            <div>
              <h3 className="font-semibold mb-3">Segment-Specific Unit Economics</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Segment</TableHead>
                    <TableHead className="text-right">ARPU</TableHead>
                    <TableHead className="text-right">CAC</TableHead>
                    <TableHead className="text-right">LTV</TableHead>
                    <TableHead className="text-right">LTV:CAC</TableHead>
                    <TableHead className="text-right">Churn</TableHead>
                    <TableHead className="text-right">Payback</TableHead>
                    <TableHead>Avg Lifetime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />Creator
                    </TableCell>
                    <TableCell className="text-right font-semibold">$12/mo</TableCell>
                    <TableCell className="text-right text-amber-600">$45</TableCell>
                    <TableCell className="text-right text-green-600 font-bold">$216</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={4.8 >= 3 ? 'default' : 'outline'}>4.8x</Badge>
                    </TableCell>
                    <TableCell className="text-right text-red-500">5.5%</TableCell>
                    <TableCell className="text-right">3.75 mo</TableCell>
                    <TableCell className="text-muted-foreground">18 months</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />SMB
                    </TableCell>
                    <TableCell className="text-right font-semibold">$35/mo</TableCell>
                    <TableCell className="text-right text-amber-600">$120</TableCell>
                    <TableCell className="text-right text-green-600 font-bold">$840</TableCell>
                    <TableCell className="text-right">
                      <Badge>7.0x</Badge>
                    </TableCell>
                    <TableCell className="text-right text-red-500">4.0%</TableCell>
                    <TableCell className="text-right">3.4 mo</TableCell>
                    <TableCell className="text-muted-foreground">24 months</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />Education
                    </TableCell>
                    <TableCell className="text-right font-semibold">$25/mo</TableCell>
                    <TableCell className="text-right text-amber-600">$80</TableCell>
                    <TableCell className="text-right text-green-600 font-bold">$600</TableCell>
                    <TableCell className="text-right">
                      <Badge>7.5x</Badge>
                    </TableCell>
                    <TableCell className="text-right text-red-500">3.5%</TableCell>
                    <TableCell className="text-right">3.2 mo</TableCell>
                    <TableCell className="text-muted-foreground">24 months</TableCell>
                  </TableRow>
                  <TableRow className="bg-green-50/50 dark:bg-green-900/10">
                    <TableCell className="font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4" />Healthcare
                    </TableCell>
                    <TableCell className="text-right font-semibold">$75/mo</TableCell>
                    <TableCell className="text-right text-amber-600">$300</TableCell>
                    <TableCell className="text-right text-green-600 font-bold">$2,700</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-600">9.0x</Badge>
                    </TableCell>
                    <TableCell className="text-right text-green-600">2.5%</TableCell>
                    <TableCell className="text-right">4.0 mo</TableCell>
                    <TableCell className="text-muted-foreground">36 months</TableCell>
                  </TableRow>
                  <TableRow className="bg-green-50/50 dark:bg-green-900/10">
                    <TableCell className="font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />Enterprise
                    </TableCell>
                    <TableCell className="text-right font-semibold">$500/mo</TableCell>
                    <TableCell className="text-right text-amber-600">$2,000</TableCell>
                    <TableCell className="text-right text-green-600 font-bold">$18,000</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-600">9.0x</Badge>
                    </TableCell>
                    <TableCell className="text-right text-green-600">2.0%</TableCell>
                    <TableCell className="text-right">4.0 mo</TableCell>
                    <TableCell className="text-muted-foreground">36 months</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* LTV Analysis Visual */}
            <div>
              <h3 className="font-semibold mb-3">LTV Breakdown by Segment</h3>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { segment: 'Creator', ltv: 216, color: 'bg-blue-500', icon: Users },
                  { segment: 'SMB', ltv: 840, color: 'bg-purple-500', icon: Briefcase },
                  { segment: 'Education', ltv: 600, color: 'bg-amber-500', icon: GraduationCap },
                  { segment: 'Healthcare', ltv: 2700, color: 'bg-green-500', icon: Heart },
                  { segment: 'Enterprise', ltv: 18000, color: 'bg-primary', icon: Building },
                ].map((item) => (
                  <div key={item.segment} className="p-4 border rounded-lg text-center">
                    <item.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-sm font-medium mb-2">{item.segment}</div>
                    <div className="text-2xl font-bold text-primary">${item.ltv.toLocaleString()}</div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color}`} 
                        style={{ width: `${Math.min((item.ltv / 18000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Investor Metrics */}
            <div>
              <h3 className="font-semibold mb-3">Key SaaS Metrics for Investors</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Metric</TableHead>
                    <TableHead>Genie Value</TableHead>
                    <TableHead>Industry Benchmark</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">LTV:CAC Ratio</TableCell>
                    <TableCell className="text-lg font-bold text-primary">12:1</TableCell>
                    <TableCell>&gt;3:1 (Good)</TableCell>
                    <TableCell><Badge className="bg-green-600">Excellent</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">Strong unit economics</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">CAC Payback Period</TableCell>
                    <TableCell className="text-lg font-bold text-primary">3.5 months</TableCell>
                    <TableCell>&lt;12 months</TableCell>
                    <TableCell><Badge className="bg-green-600">Excellent</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">Recover cost in &lt;1 quarter</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Net Revenue Retention</TableCell>
                    <TableCell className="text-lg font-bold text-primary">115%</TableCell>
                    <TableCell>&gt;100% (Good)</TableCell>
                    <TableCell><Badge className="bg-green-600">Excellent</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">Expansion exceeds churn</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Gross Margin</TableCell>
                    <TableCell className="text-lg font-bold text-primary">75%</TableCell>
                    <TableCell>&gt;70% (SaaS)</TableCell>
                    <TableCell><Badge className="bg-green-600">Excellent</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">AI costs optimized</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Monthly Churn Rate</TableCell>
                    <TableCell className="text-lg font-bold text-primary">5%</TableCell>
                    <TableCell>&lt;7% (SMB SaaS)</TableCell>
                    <TableCell><Badge className="bg-green-600">Good</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">Industry average</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Free-to-Paid Conversion</TableCell>
                    <TableCell className="text-lg font-bold text-primary">3%</TableCell>
                    <TableCell>2-5% (Industry)</TableCell>
                    <TableCell><Badge>On Target</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">Mid-range for PLG</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* FINANCIALS TAB - Cost Structure */}
          <TabsContent value="financials" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Financial Projections & Cost Structure
            </h2>

            {/* Revenue Projections */}
            <div>
              <h3 className="font-semibold mb-3">Quarterly Revenue Projections (2026-2028)</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">MRR</TableHead>
                    <TableHead className="text-right">ARR</TableHead>
                    <TableHead className="text-right">Total Costs</TableHead>
                    <TableHead className="text-right">Net Income</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Q2 2026</TableCell>
                    <TableCell className="text-right">500</TableCell>
                    <TableCell className="text-right">$7,500</TableCell>
                    <TableCell className="text-right">$90K</TableCell>
                    <TableCell className="text-right text-amber-600">$83K</TableCell>
                    <TableCell className="text-right text-red-600">-$75.5K</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Q3 2026</TableCell>
                    <TableCell className="text-right">2,500</TableCell>
                    <TableCell className="text-right">$37,500</TableCell>
                    <TableCell className="text-right">$450K</TableCell>
                    <TableCell className="text-right text-amber-600">$133K</TableCell>
                    <TableCell className="text-right text-red-600">-$95.5K</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Q4 2026</TableCell>
                    <TableCell className="text-right">8,000</TableCell>
                    <TableCell className="text-right">$120,000</TableCell>
                    <TableCell className="text-right">$1.44M</TableCell>
                    <TableCell className="text-right text-amber-600">$240K</TableCell>
                    <TableCell className="text-right text-red-600">-$120K</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="font-bold">2026 Total</TableCell>
                    <TableCell className="text-right font-bold">8,000</TableCell>
                    <TableCell className="text-right font-bold">$120K/mo</TableCell>
                    <TableCell className="text-right font-bold">$1.44M</TableCell>
                    <TableCell className="text-right font-bold text-amber-600">$456K</TableCell>
                    <TableCell className="text-right font-bold text-red-600">-$291K</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Q1 2027</TableCell>
                    <TableCell className="text-right">18,000</TableCell>
                    <TableCell className="text-right">$270,000</TableCell>
                    <TableCell className="text-right">$3.24M</TableCell>
                    <TableCell className="text-right text-amber-600">$370K</TableCell>
                    <TableCell className="text-right text-red-600">-$100K</TableCell>
                  </TableRow>
                  <TableRow className="bg-green-50/50 dark:bg-green-900/10">
                    <TableCell className="font-medium">Q2 2027</TableCell>
                    <TableCell className="text-right">35,000</TableCell>
                    <TableCell className="text-right">$525,000</TableCell>
                    <TableCell className="text-right">$6.3M</TableCell>
                    <TableCell className="text-right text-amber-600">$530K</TableCell>
                    <TableCell className="text-right text-amber-600">-$5K</TableCell>
                  </TableRow>
                  <TableRow className="bg-green-50/50 dark:bg-green-900/10">
                    <TableCell className="font-medium">Q3 2027</TableCell>
                    <TableCell className="text-right">55,000</TableCell>
                    <TableCell className="text-right">$825,000</TableCell>
                    <TableCell className="text-right">$9.9M</TableCell>
                    <TableCell className="text-right text-amber-600">$690K</TableCell>
                    <TableCell className="text-right text-green-600">+$135K</TableCell>
                  </TableRow>
                  <TableRow className="bg-green-50/50 dark:bg-green-900/10">
                    <TableCell className="font-medium">Q4 2027</TableCell>
                    <TableCell className="text-right">80,000</TableCell>
                    <TableCell className="text-right">$1.2M</TableCell>
                    <TableCell className="text-right">$14.4M</TableCell>
                    <TableCell className="text-right text-amber-600">$880K</TableCell>
                    <TableCell className="text-right text-green-600">+$320K</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/10">
                    <TableCell className="font-bold">2028 Full Year</TableCell>
                    <TableCell className="text-right font-bold">200,000</TableCell>
                    <TableCell className="text-right font-bold">$3M/mo</TableCell>
                    <TableCell className="text-right font-bold text-primary">$36M</TableCell>
                    <TableCell className="text-right font-bold text-amber-600">$8.4M</TableCell>
                    <TableCell className="text-right font-bold text-green-600">+$8M</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Cost Structure Breakdown */}
            <div>
              <h3 className="font-semibold mb-3">Monthly Cost Structure (at Scale - 50K Users)</h3>
              <div className="grid grid-cols-2 gap-6">
                <Table className="border">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Cost Category</TableHead>
                      <TableHead className="text-right">Monthly</TableHead>
                      <TableHead className="text-right">% of Rev</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">🎯 Marketing & Sales</TableCell>
                      <TableCell className="text-right font-semibold">$250,000</TableCell>
                      <TableCell className="text-right text-muted-foreground">30%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">🧠 AI Model Costs (OpenAI, ElevenLabs)</TableCell>
                      <TableCell className="text-right font-semibold">$200,000</TableCell>
                      <TableCell className="text-right text-muted-foreground">24%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">👨‍💻 Development Team</TableCell>
                      <TableCell className="text-right font-semibold">$140,000</TableCell>
                      <TableCell className="text-right text-muted-foreground">17%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">☁️ Cloud Hosting (Supabase, Vercel)</TableCell>
                      <TableCell className="text-right font-semibold">$100,000</TableCell>
                      <TableCell className="text-right text-muted-foreground">12%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">📞 Support & Success</TableCell>
                      <TableCell className="text-right font-semibold">$60,000</TableCell>
                      <TableCell className="text-right text-muted-foreground">7%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">🏢 Office & Operations</TableCell>
                      <TableCell className="text-right font-semibold">$40,000</TableCell>
                      <TableCell className="text-right text-muted-foreground">5%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">📜 Licenses & Subscriptions</TableCell>
                      <TableCell className="text-right font-semibold">$25,000</TableCell>
                      <TableCell className="text-right text-muted-foreground">3%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">🔒 Security & Compliance</TableCell>
                      <TableCell className="text-right font-semibold">$15,000</TableCell>
                      <TableCell className="text-right text-muted-foreground">2%</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Total Monthly Costs</TableCell>
                      <TableCell className="text-right font-bold text-primary">$830,000</TableCell>
                      <TableCell className="text-right font-bold">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Cost Visual Breakdown */}
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">Cost Distribution</h4>
                    {[
                      { name: 'Marketing', pct: 30, color: 'bg-blue-500' },
                      { name: 'AI Models', pct: 24, color: 'bg-purple-500' },
                      { name: 'Development', pct: 17, color: 'bg-green-500' },
                      { name: 'Hosting', pct: 12, color: 'bg-amber-500' },
                      { name: 'Support', pct: 7, color: 'bg-red-500' },
                      { name: 'Other', pct: 10, color: 'bg-gray-500' },
                    ].map((item) => (
                      <div key={item.name} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.pct}%</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Gross Margin Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue (50K users)</span>
                        <span className="font-semibold">$825,000</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>COGS (AI + Hosting)</span>
                        <span>-$300,000</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-bold text-green-600">
                        <span>Gross Profit</span>
                        <span>$525,000 (64%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scaling Costs */}
            <div>
              <h3 className="font-semibold mb-3">Cost Scaling Analysis</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Users</TableHead>
                    <TableHead className="text-right">AI Model Cost</TableHead>
                    <TableHead className="text-right">Hosting Cost</TableHead>
                    <TableHead className="text-right">Storage Cost</TableHead>
                    <TableHead className="text-right">Cost/User</TableHead>
                    <TableHead className="text-right">Revenue/User</TableHead>
                    <TableHead className="text-right">Unit Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">1,000</TableCell>
                    <TableCell className="text-right">$5,000</TableCell>
                    <TableCell className="text-right">$3,000</TableCell>
                    <TableCell className="text-right">$500</TableCell>
                    <TableCell className="text-right text-amber-600">$8.50</TableCell>
                    <TableCell className="text-right text-primary">$17.50</TableCell>
                    <TableCell className="text-right text-green-600">51%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">10,000</TableCell>
                    <TableCell className="text-right">$40,000</TableCell>
                    <TableCell className="text-right">$20,000</TableCell>
                    <TableCell className="text-right">$4,000</TableCell>
                    <TableCell className="text-right text-amber-600">$6.40</TableCell>
                    <TableCell className="text-right text-primary">$17.50</TableCell>
                    <TableCell className="text-right text-green-600">63%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">50,000</TableCell>
                    <TableCell className="text-right">$150,000</TableCell>
                    <TableCell className="text-right">$80,000</TableCell>
                    <TableCell className="text-right">$15,000</TableCell>
                    <TableCell className="text-right text-amber-600">$4.90</TableCell>
                    <TableCell className="text-right text-primary">$17.50</TableCell>
                    <TableCell className="text-right text-green-600">72%</TableCell>
                  </TableRow>
                  <TableRow className="bg-green-50/50 dark:bg-green-900/10">
                    <TableCell className="font-medium">200,000</TableCell>
                    <TableCell className="text-right">$400,000</TableCell>
                    <TableCell className="text-right">$250,000</TableCell>
                    <TableCell className="text-right">$50,000</TableCell>
                    <TableCell className="text-right text-amber-600">$3.50</TableCell>
                    <TableCell className="text-right text-primary">$17.50</TableCell>
                    <TableCell className="text-right text-green-600 font-bold">80%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground mt-2">
                * Economies of scale: Cost per user decreases 59% from 1K to 200K users due to volume discounts and infrastructure efficiency
              </p>
            </div>
          </TabsContent>

          {/* TRACTION TAB - Critical for Investors */}
          <TabsContent value="traction" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Product Traction & Milestones
            </h2>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center bg-green-50 dark:bg-green-900/20">
                <div className="text-3xl font-bold text-green-600">305</div>
                <div className="text-sm font-medium">Total Scenarios</div>
                <div className="text-xs text-muted-foreground">Comprehensive coverage</div>
              </div>
              <div className="p-4 border rounded-lg text-center bg-primary/10">
                <div className="text-3xl font-bold text-primary">185</div>
                <div className="text-sm font-medium">Implemented</div>
                <div className="text-xs text-muted-foreground">61% complete</div>
              </div>
              <div className="p-4 border rounded-lg text-center bg-blue-50 dark:bg-blue-900/20">
                <div className="text-3xl font-bold text-blue-600">6</div>
                <div className="text-sm font-medium">Products</div>
                <div className="text-xs text-muted-foreground">Full suite launched</div>
              </div>
              <div className="p-4 border rounded-lg text-center bg-purple-50 dark:bg-purple-900/20">
                <div className="text-3xl font-bold text-purple-600">15+</div>
                <div className="text-sm font-medium">AI Agents</div>
                <div className="text-xs text-muted-foreground">Intelligent automation</div>
              </div>
            </div>

            {/* Implementation Roadmap */}
            <div>
              <h3 className="font-semibold mb-3">Implementation Roadmap</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Phase</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Scenarios</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roadmapPhases.map((phase) => (
                    <TableRow key={phase.phase} className={phase.status === 'completed' ? 'bg-green-50/50 dark:bg-green-900/10' : ''}>
                      <TableCell className="font-bold">{phase.phase}</TableCell>
                      <TableCell>{phase.name}</TableCell>
                      <TableCell>{phase.quarter}</TableCell>
                      <TableCell>
                        <Badge variant={phase.status === 'completed' ? 'default' : 'outline'}>
                          {phase.status === 'completed' ? '✅ Complete' : '⏳ Planned'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={phase.completion} className="h-2 w-20" />
                          <span className="text-sm font-medium">{phase.completion}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Key Milestones */}
            <div>
              <h3 className="font-semibold mb-3">Key Achievements (P0-P2)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Core Platform</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Script Generation Engine</li>
                    <li>• 5-Provider TTS Integration</li>
                    <li>• Recording Studio + Teleprompter</li>
                    <li>• Mind↔Vibe Bidirectional Bridge</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">AI & Automation</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 15+ AI Agents Deployed</li>
                    <li>• Ask Genie Context-Aware</li>
                    <li>• Auto-Editor Agent</li>
                    <li>• Voice Director Agent</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Business Infrastructure</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Stripe Billing Integration</li>
                    <li>• 5-Tier Subscription System</li>
                    <li>• Credit System</li>
                    <li>• PWA Mobile App</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div>
              <h3 className="font-semibold mb-3">Upcoming Milestones (P3-P5)</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Milestone</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Bulk Video Generation</TableCell>
                    <TableCell>Q3 2026</TableCell>
                    <TableCell>10x content output for enterprises</TableCell>
                    <TableCell><Badge>P3</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">HIPAA Certification</TableCell>
                    <TableCell>Q3 2026</TableCell>
                    <TableCell>Unlock $1B+ healthcare market</TableCell>
                    <TableCell><Badge variant="destructive">Critical</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Multi-Language (140+)</TableCell>
                    <TableCell>Q4 2026</TableCell>
                    <TableCell>Global expansion capability</TableCell>
                    <TableCell><Badge>P4</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">SSO/SAML Integration</TableCell>
                    <TableCell>Q1 2027</TableCell>
                    <TableCell>Enterprise sales acceleration</TableCell>
                    <TableCell><Badge>P5</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* TECHNOLOGY TAB - Technical Depth for Investors */}
          <TabsContent value="technology" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Technology Stack & Infrastructure
            </h2>

            {/* Tech Stats Grid */}
            <div className="grid grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-3xl font-bold text-primary">140+</div>
                <div className="text-sm font-medium">Edge Functions</div>
                <div className="text-xs text-muted-foreground">Serverless APIs</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">280+</div>
                <div className="text-sm font-medium">Custom Hooks</div>
                <div className="text-xs text-muted-foreground">React logic</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">180+</div>
                <div className="text-sm font-medium">Database Tables</div>
                <div className="text-xs text-muted-foreground">PostgreSQL</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">23</div>
                <div className="text-sm font-medium">Mobile Components</div>
                <div className="text-xs text-muted-foreground">PWA ready</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-3xl font-bold text-amber-600">5</div>
                <div className="text-sm font-medium">TTS Providers</div>
                <div className="text-xs text-muted-foreground">Multi-vendor</div>
              </div>
            </div>

            {/* Technology Stack */}
            <div>
              <h3 className="font-semibold mb-3">Core Technology Stack</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Layer</TableHead>
                    <TableHead>Technology</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Scalability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Frontend</TableCell>
                    <TableCell>React 18 + TypeScript + Vite</TableCell>
                    <TableCell>Type-safe, fast builds, modern DX</TableCell>
                    <TableCell className="text-green-600">✓ Unlimited</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Backend</TableCell>
                    <TableCell>Supabase (PostgreSQL + Edge Functions)</TableCell>
                    <TableCell>Real-time, RLS security, serverless</TableCell>
                    <TableCell className="text-green-600">✓ Auto-scale</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">AI Processing</TableCell>
                    <TableCell>OpenAI + Anthropic + Custom Models</TableCell>
                    <TableCell>Script generation, analysis, agents</TableCell>
                    <TableCell className="text-green-600">✓ API-based</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">TTS</TableCell>
                    <TableCell>ElevenLabs, Google, Azure, Amazon, OpenAI</TableCell>
                    <TableCell>Multi-provider redundancy</TableCell>
                    <TableCell className="text-green-600">✓ Failover</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Media Processing</TableCell>
                    <TableCell>FFmpeg.wasm (client-side)</TableCell>
                    <TableCell>Zero server load for video processing</TableCell>
                    <TableCell className="text-green-600">✓ Client-side</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Payments</TableCell>
                    <TableCell>Stripe</TableCell>
                    <TableCell>Subscriptions, credits, invoicing</TableCell>
                    <TableCell className="text-green-600">✓ Enterprise</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* AI Agents */}
            <div>
              <h3 className="font-semibold mb-3">AI Agent Architecture</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Content Agents</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex justify-between"><span>Script Generator</span><span className="text-green-600">✓</span></li>
                    <li className="flex justify-between"><span>Content Analyzer</span><span className="text-green-600">✓</span></li>
                    <li className="flex justify-between"><span>SEO Optimizer</span><span className="text-green-600">✓</span></li>
                    <li className="flex justify-between"><span>Scene Analyzer</span><span className="text-green-600">✓</span></li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-purple-600 mb-2">Production Agents</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex justify-between"><span>Voice Director</span><span className="text-green-600">✓</span></li>
                    <li className="flex justify-between"><span>Auto-Editor</span><span className="text-green-600">✓</span></li>
                    <li className="flex justify-between"><span>Music Composer</span><span className="text-green-600">✓</span></li>
                    <li className="flex justify-between"><span>Distribution</span><span className="text-green-600">✓</span></li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-amber-600 mb-2">Orchestration</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex justify-between"><span>Ask Genie (Context-Aware)</span><span className="text-green-600">✓</span></li>
                    <li className="flex justify-between"><span>Workflow Executor</span><span className="text-green-600">✓</span></li>
                    <li className="flex justify-between"><span>TTS Orchestrator</span><span className="text-green-600">✓</span></li>
                    <li className="flex justify-between"><span>Production Hub</span><span className="text-green-600">✓</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div>
              <h3 className="font-semibold mb-3">Security & Compliance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Implemented
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Row Level Security (RLS) on all tables</li>
                    <li>• Role-Based Access Control (RBAC)</li>
                    <li>• API Rate Limiting</li>
                    <li>• Encrypted data at rest & in transit</li>
                    <li>• OAuth 2.0 (Google, Email)</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-amber-600 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Roadmap (P3-P5)
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• HIPAA Certification (Q3 2026)</li>
                    <li>• SOC 2 Type II (Q4 2026)</li>
                    <li>• GDPR Compliance (Q4 2026)</li>
                    <li>• SSO/SAML (Q1 2027)</li>
                    <li>• Data Residency Controls (Q1 2027)</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SEGMENTS TAB - Clear Advantages/Disadvantages */}
          <TabsContent value="segments" className="mt-0 space-y-6">
            {filteredSegments.map((seg) => (
              <div key={seg.id} className="border rounded-lg overflow-hidden">
                {/* Segment Header */}
                <div className="bg-muted/50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <seg.icon className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold text-lg">{seg.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        TAM: {seg.tam} • SAM: {seg.sam} • SOM: {seg.som} • Growth: {seg.growthRate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={seg.priority === 'P0' ? 'default' : 'outline'}>{seg.priority}</Badge>
                    <Badge variant="secondary">{seg.marketPosition}</Badge>
                  </div>
                </div>

                {/* TAM/SAM/SOM Details */}
                <div className="p-4 border-b bg-muted/20">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-primary">TAM ({seg.tam}):</span>
                      <span className="ml-2 text-muted-foreground">{seg.tamDetails}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">SAM ({seg.sam}):</span>
                      <span className="ml-2 text-muted-foreground">{seg.samDetails}</span>
                    </div>
                    <div>
                      <span className="font-medium text-amber-600">SOM ({seg.som}):</span>
                      <span className="ml-2 text-muted-foreground">{seg.somDetails}</span>
                    </div>
                  </div>
                </div>

                {/* Advantages & Disadvantages Tables */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  {/* Genie Advantages */}
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      Genie Advantages
                    </h4>
                    <Table className="border">
                      <TableHeader>
                        <TableRow className="bg-green-50 dark:bg-green-900/20">
                          <TableHead className="text-green-700">Advantage</TableHead>
                          <TableHead className="w-20">Impact</TableHead>
                          <TableHead>vs Competitors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {seg.genieAdvantages.map((adv, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{adv.point}</TableCell>
                            <TableCell>
                              <Badge variant={adv.impact === 'Critical' ? 'destructive' : adv.impact === 'High' ? 'default' : 'secondary'} className="text-xs">
                                {adv.impact}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{adv.vs}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Genie Disadvantages / Improvements Needed */}
                  <div>
                    <h4 className="font-semibold text-amber-600 mb-2 flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4" />
                      Improvements Needed
                    </h4>
                    <Table className="border">
                      <TableHeader>
                        <TableRow className="bg-amber-50 dark:bg-amber-900/20">
                          <TableHead className="text-amber-700">Gap</TableHead>
                          <TableHead>Competitor Strength</TableHead>
                          <TableHead className="w-16">Priority</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {seg.genieDisadvantages.map((dis, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{dis.point}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{dis.gap}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{dis.priority}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* COMPETITORS TAB */}
          <TabsContent value="competitors" className="mt-0 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Competitive Landscape</h2>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Competitor</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>User Base</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Founded</TableHead>
                    <TableHead>UX Rating</TableHead>
                    <TableHead>Threat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCompetitors.map((comp, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{comp.name}</TableCell>
                      <TableCell className="text-sm">{comp.segment}</TableCell>
                      <TableCell className="text-primary font-medium">{comp.pricing}</TableCell>
                      <TableCell>{comp.userBase}</TableCell>
                      <TableCell>{comp.revenue}</TableCell>
                      <TableCell>{comp.founded} ({2026 - comp.founded}yr)</TableCell>
                      <TableCell>
                        <div className="flex">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} className={cn("h-3 w-3", n <= comp.uxRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300")} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={comp.threat === 'High' ? 'destructive' : comp.threat === 'Medium' ? 'secondary' : 'outline'}>
                          {comp.threat}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Competitive Position Summary */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Genie Competitive Position</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Stronger Than
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Kapwing</li>
                    <li>• WeVideo</li>
                    <li>• InShot</li>
                    <li>• GoPro Quik</li>
                    <li>• Pictory</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    At Parity With
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Riverside.fm</li>
                    <li>• Edpuzzle</li>
                    <li>• InVideo</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Catching Up To
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Loom</li>
                    <li>• Descript</li>
                    <li>• CapCut</li>
                    <li>• Synthesia</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Different Market
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Canva (design-first)</li>
                    <li>• Panopto (LMS-deep)</li>
                    <li>• Kaltura (enterprise)</li>
                    <li>• Brightcove (CDN)</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SWOT TAB */}
          <TabsContent value="swot" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              SWOT Analysis
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  Strengths (Internal)
                </div>
                <Table>
                  <TableBody>
                    {swotAnalysis.strengths.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="font-medium">{s.item}</div>
                          <div className="text-xs text-muted-foreground">{s.detail}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Weaknesses */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <ThumbsDown className="h-5 w-5" />
                  Weaknesses (Internal)
                </div>
                <Table>
                  <TableBody>
                    {swotAnalysis.weaknesses.map((w, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="font-medium">{w.item}</div>
                          <div className="text-xs text-muted-foreground">{w.detail}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Opportunities */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Opportunities (External)
                </div>
                <Table>
                  <TableBody>
                    {swotAnalysis.opportunities.map((o, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="font-medium">{o.item}</div>
                          <div className="text-xs text-muted-foreground">{o.detail}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Threats */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Threats (External)
                </div>
                <Table>
                  <TableBody>
                    {swotAnalysis.threats.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="font-medium">{t.item}</div>
                          <div className="text-xs text-muted-foreground">{t.detail}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* PROJECTIONS TAB */}
          <TabsContent value="projections" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              2-Year Projections
            </h2>

            {/* Year Comparison */}
            <Table className="border">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-center">Year 1 (2026)</TableHead>
                  <TableHead className="text-center">Year 2 (2027)</TableHead>
                  <TableHead className="text-center">Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Users</TableCell>
                  <TableCell className="text-center text-lg font-semibold">{projections.year1.users}</TableCell>
                  <TableCell className="text-center text-lg font-semibold text-primary">{projections.year2.users}</TableCell>
                  <TableCell className="text-center text-green-600 font-medium">5x</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ARR</TableCell>
                  <TableCell className="text-center text-lg font-semibold">{projections.year1.arr}</TableCell>
                  <TableCell className="text-center text-lg font-semibold text-primary">{projections.year2.arr}</TableCell>
                  <TableCell className="text-center text-green-600 font-medium">6x</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Active Segments</TableCell>
                  <TableCell className="text-center">{projections.year1.segments}</TableCell>
                  <TableCell className="text-center">{projections.year2.segments}</TableCell>
                  <TableCell className="text-center">-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Scenarios Implemented</TableCell>
                  <TableCell className="text-center">{projections.year1.scenarios}</TableCell>
                  <TableCell className="text-center">{projections.year2.scenarios}</TableCell>
                  <TableCell className="text-center text-green-600">+50</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Milestones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">2026 Milestones</h3>
                <ul className="space-y-2">
                  {projections.year1.milestones.map((m, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">2027 Milestones</h3>
                <ul className="space-y-2">
                  {projections.year2.milestones.map((m, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Unit Economics */}
            <div>
              <h3 className="font-semibold mb-3">Unit Economics Assumptions</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Basis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projections.assumptions.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{a.metric}</TableCell>
                      <TableCell className="font-semibold text-primary">{a.value}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.basis}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Roadmap */}
            <div>
              <h3 className="font-semibold mb-3">Implementation Roadmap</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16">Phase</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Quarter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roadmapPhases.map((phase) => (
                    <TableRow key={phase.phase}>
                      <TableCell>
                        <Badge variant={phase.status === 'completed' ? 'default' : 'outline'}>{phase.phase}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{phase.name}</TableCell>
                      <TableCell>{phase.quarter}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={phase.status === 'completed' ? 'default' : phase.status === 'in-progress' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {phase.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={phase.completion} className="h-2 flex-1" />
                          <span className="text-sm font-medium w-10">{phase.completion}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* PRICING TAB */}
          <TabsContent value="pricing" className="mt-0 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Pricing Strategy
            </h2>

            {/* Genie Tiers */}
            <div>
              <h3 className="font-semibold mb-3">Genie Subscription Tiers</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tier</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Target Segment</TableHead>
                    <TableHead>Key Features</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Free</TableCell>
                    <TableCell className="text-lg font-bold">$0</TableCell>
                    <TableCell>Trial / Hobbyist</TableCell>
                    <TableCell className="text-sm">5 videos/mo, watermark, basic AI</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Starter</TableCell>
                    <TableCell className="text-lg font-bold text-primary">$9.99/mo</TableCell>
                    <TableCell>Creators, Travelers</TableCell>
                    <TableCell className="text-sm">Unlimited videos, AI TTS, no watermark</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5">
                    <TableCell className="font-medium">Business</TableCell>
                    <TableCell className="text-lg font-bold text-primary">$29.99/mo</TableCell>
                    <TableCell>SMB Marketing</TableCell>
                    <TableCell className="text-sm">Team collab, brand kit, integrations</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pro</TableCell>
                    <TableCell className="text-lg font-bold text-primary">$79.99/mo</TableCell>
                    <TableCell>Education</TableCell>
                    <TableCell className="text-sm">LMS integration, student accounts, analytics</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Enterprise</TableCell>
                    <TableCell className="text-lg font-bold">Custom</TableCell>
                    <TableCell>Healthcare, Enterprise</TableCell>
                    <TableCell className="text-sm">HIPAA, SSO, audit trails, SLA</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Price Point by Segment */}
            <div>
              <h3 className="font-semibold mb-3">Soft Price Points by Segment</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Segment</TableHead>
                    <TableHead>Genie Sweet Spot</TableHead>
                    <TableHead>Competitor Range</TableHead>
                    <TableHead>Genie Advantage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segments.map((seg) => (
                    <TableRow key={seg.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <seg.icon className="h-4 w-4" />
                          {seg.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-primary font-bold">{seg.softPricePoint}</TableCell>
                      <TableCell className="text-sm">
                        {seg.competitors.map(c => c.pricing).join(', ')}
                      </TableCell>
                      <TableCell className="text-sm text-green-600">
                        {seg.id === 'healthcare' ? '90% cheaper than incumbents' :
                         seg.id === 'smb' ? '70% cheaper than Synthesia' :
                         seg.id === 'enterprise' ? '60% cheaper entry point' :
                         'Competitive with more features'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pricing Landscape */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-green-600 mb-3">Free / Freemium</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex justify-between"><span>CapCut</span><span>Free</span></li>
                  <li className="flex justify-between"><span>InShot</span><span>Free (ads)</span></li>
                  <li className="flex justify-between"><span>Edpuzzle</span><span>Free tier</span></li>
                  <li className="flex justify-between font-semibold text-primary"><span>Genie</span><span>Free tier</span></li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-primary/5">
                <h4 className="font-semibold text-primary mb-3">$10-30/mo (Sweet Spot)</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex justify-between"><span>Loom</span><span>$12.50</span></li>
                  <li className="flex justify-between"><span>Descript</span><span>$12-24</span></li>
                  <li className="flex justify-between"><span>Canva</span><span>$12.99</span></li>
                  <li className="flex justify-between font-semibold text-primary"><span>Genie</span><span>$9.99-29.99</span></li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-amber-600 mb-3">Enterprise ($100+)</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex justify-between"><span>Synthesia</span><span>$22-1000+</span></li>
                  <li className="flex justify-between"><span>Brightcove</span><span>$500+</span></li>
                  <li className="flex justify-between"><span>Healthwise</span><span>$50K+/yr</span></li>
                  <li className="flex justify-between font-semibold text-primary"><span>Genie</span><span>Custom</span></li>
                </ul>
              </div>
            </div>
          </TabsContent>

        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default GenieInvestorDashboard;
