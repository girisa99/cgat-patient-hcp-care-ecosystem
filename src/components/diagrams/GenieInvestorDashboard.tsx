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
    scenarios: '60/177',
    milestones: ['HIPAA certification', 'Mobile app v2', 'Enterprise pilot'],
  },
  year2: {
    year: '2027',
    users: '250K',
    arr: '$15M',
    segments: 'All 6 segments active',
    scenarios: '130/177',
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
  { phase: 'P0', name: 'Core + Collaboration', quarter: 'Q1 2026', completion: 100, status: 'completed' },
  { phase: 'P1', name: 'Mobile & Remix', quarter: 'Q2 2026', completion: 30, status: 'in-progress' },
  { phase: 'P2', name: 'Advanced Features', quarter: 'Q3 2026', completion: 10, status: 'planned' },
  { phase: 'P3', name: 'Segment-Specific', quarter: 'Q4 2026', completion: 0, status: 'planned' },
  { phase: 'P4', name: 'Enterprise', quarter: 'Q1 2027', completion: 0, status: 'planned' },
  { phase: 'P5', name: 'Innovation', quarter: 'Q2 2027', completion: 0, status: 'planned' },
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
        <TabsList className="mb-4 flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
          <TabsTrigger value="overview" className="px-4">Overview</TabsTrigger>
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
