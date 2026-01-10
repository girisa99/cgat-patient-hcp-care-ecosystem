/**
 * Market Analysis Dashboard
 * Comprehensive view of competitive landscape, opportunities, and integration possibilities
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
  Smartphone,
  Globe,
  Code,
  Bot,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  X,
  AlertCircle,
  Star,
  Target,
  Zap,
  Link,
  Download,
  Maximize2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Package,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';

// Types
interface Segment {
  id: string;
  name: string;
  icon: React.ElementType;
  marketSize: string;
  growthRate: string;
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  entryBarrier: 'Low' | 'Medium' | 'High' | 'Very High';
  genieFit: number; // 1-5 stars
  priority: 'P0' | 'P1' | 'P2';
  color: string;
}

interface Competitor {
  name: string;
  segment: string;
  type: 'Direct' | 'Feature' | 'Platform';
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  threat: 'Low' | 'Medium' | 'High';
}

interface AppOpportunity {
  name: string;
  description: string;
  platforms: ('iOS' | 'Android' | 'Web' | 'Desktop' | 'API')[];
  segment: string;
  priority: 'P0' | 'P1' | 'P2';
  complexity: 'Low' | 'Medium' | 'High';
  marketGap: string;
}

interface Integration {
  partner: string;
  type: 'API' | 'Plugin' | 'LTI' | 'SSO' | 'Partnership';
  segment: string;
  value: string;
  priority: 'P0' | 'P1' | 'P2';
}

interface FeatureModule {
  name: string;
  standaloneApp: string;
  apiEndpoint: string;
  agentCapability: string;
  segments: string[];
}

// Data
const SEGMENTS: Segment[] = [
  {
    id: 'creator',
    name: 'Creator Economy',
    icon: Users,
    marketSize: '$50B+',
    growthRate: '20%',
    competitionLevel: 'Very High',
    entryBarrier: 'Medium',
    genieFit: 5,
    priority: 'P0',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'traveler',
    name: 'Traveler/Experience',
    icon: Plane,
    marketSize: '$8B+',
    growthRate: '15%',
    competitionLevel: 'Medium',
    entryBarrier: 'Low',
    genieFit: 4,
    priority: 'P1',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'smb',
    name: 'SMB',
    icon: Briefcase,
    marketSize: '$15B+',
    growthRate: '25%',
    competitionLevel: 'High',
    entryBarrier: 'Medium',
    genieFit: 5,
    priority: 'P0',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    marketSize: '$12B+',
    growthRate: '18%',
    competitionLevel: 'Medium',
    entryBarrier: 'High',
    genieFit: 4,
    priority: 'P1',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    marketSize: '$25B+',
    growthRate: '22%',
    competitionLevel: 'Low',
    entryBarrier: 'Very High',
    genieFit: 5,
    priority: 'P0',
    color: 'from-red-500 to-rose-500'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building,
    marketSize: '$40B+',
    growthRate: '15%',
    competitionLevel: 'High',
    entryBarrier: 'High',
    genieFit: 4,
    priority: 'P1',
    color: 'from-indigo-500 to-violet-500'
  }
];

const COMPETITORS: Competitor[] = [
  // Creator
  { name: 'Descript', segment: 'creator', type: 'Direct', strengths: ['Transcription-first editing', 'Overdub voice cloning'], weaknesses: ['Expensive', 'Complex for beginners'], pricing: '$12-24/mo', threat: 'High' },
  { name: 'Riverside.fm', segment: 'creator', type: 'Direct', strengths: ['Studio-quality remote recording'], weaknesses: ['Limited post-production'], pricing: '$15-24/mo', threat: 'Medium' },
  { name: 'Kapwing', segment: 'creator', type: 'Direct', strengths: ['Easy-to-use', 'Collaborative'], weaknesses: ['Basic features', 'Watermarks on free'], pricing: '$16-24/mo', threat: 'Medium' },
  { name: 'CapCut', segment: 'creator', type: 'Direct', strengths: ['Free', 'TikTok integration'], weaknesses: ['Limited professional features'], pricing: 'Free/$8/mo', threat: 'High' },
  { name: 'ElevenLabs', segment: 'creator', type: 'Feature', strengths: ['Best-in-class voice cloning'], weaknesses: ['No editing workflow'], pricing: '$5-99/mo', threat: 'Low' },
  { name: 'Opus Clip', segment: 'creator', type: 'Feature', strengths: ['AI clip generation'], weaknesses: ['No production suite'], pricing: '$15-39/mo', threat: 'Medium' },
  // SMB
  { name: 'Loom', segment: 'smb', type: 'Direct', strengths: ['Screen recording', 'Quick sharing'], weaknesses: ['Limited editing'], pricing: '$12.50/mo', threat: 'High' },
  { name: 'Synthesia', segment: 'smb', type: 'Direct', strengths: ['AI avatars'], weaknesses: ['Expensive', 'No audio'], pricing: '$22-67/mo', threat: 'High' },
  { name: 'Pictory', segment: 'smb', type: 'Direct', strengths: ['Blog-to-video'], weaknesses: ['Template-bound'], pricing: '$19-39/mo', threat: 'Medium' },
  { name: 'InVideo', segment: 'smb', type: 'Direct', strengths: ['Templates', 'Stock library'], weaknesses: ['Quality ceiling'], pricing: '$15-30/mo', threat: 'Medium' },
  // Education
  { name: 'Loom Education', segment: 'education', type: 'Direct', strengths: ['Free for edu', 'Simple'], weaknesses: ['No production tools'], pricing: 'Free', threat: 'Low' },
  { name: 'Panopto', segment: 'education', type: 'Platform', strengths: ['LMS integration'], weaknesses: ['Enterprise pricing'], pricing: 'Custom', threat: 'High' },
  { name: 'Edpuzzle', segment: 'education', type: 'Feature', strengths: ['Interactive videos'], weaknesses: ['Limited creation'], pricing: 'Free/$8/mo', threat: 'Medium' },
  // Healthcare
  { name: 'Healthwise', segment: 'healthcare', type: 'Direct', strengths: ['Clinical content library'], weaknesses: ['No customization'], pricing: 'Custom', threat: 'Medium' },
  { name: 'Emmi Solutions', segment: 'healthcare', type: 'Direct', strengths: ['Patient engagement'], weaknesses: ['Expensive', 'Limited'], pricing: 'Custom', threat: 'Medium' },
  // Enterprise
  { name: 'Brightcove', segment: 'enterprise', type: 'Platform', strengths: ['Scalable', 'Reliable'], weaknesses: ['No creation tools'], pricing: 'Custom', threat: 'Medium' },
  { name: 'Kaltura', segment: 'enterprise', type: 'Platform', strengths: ['Feature-rich'], weaknesses: ['Overwhelming'], pricing: 'Custom', threat: 'High' },
  { name: 'Microsoft Stream', segment: 'enterprise', type: 'Platform', strengths: ['M365 integration'], weaknesses: ['Basic features'], pricing: 'Bundled', threat: 'Medium' },
];

const APP_OPPORTUNITIES: AppOpportunity[] = [
  { name: 'ScriptGenius', description: 'AI script generation from prompts', platforms: ['iOS', 'Android', 'Web', 'API'], segment: 'creator', priority: 'P0', complexity: 'Medium', marketGap: 'No mobile-first script writing' },
  { name: 'VoiceOver Pro', description: 'TTS with voice selection', platforms: ['iOS', 'Android', 'Web', 'API'], segment: 'creator', priority: 'P0', complexity: 'Low', marketGap: 'Quick voiceover on mobile' },
  { name: 'ClipMaster', description: 'Auto-trim to highlights', platforms: ['iOS', 'Android', 'Web', 'Desktop', 'API'], segment: 'creator', priority: 'P0', complexity: 'Medium', marketGap: 'Social-first editing' },
  { name: 'TranscribeNow', description: 'Real-time transcription', platforms: ['iOS', 'Android', 'API'], segment: 'creator', priority: 'P1', complexity: 'Low', marketGap: 'Accurate mobile transcription' },
  { name: 'TravelMontage', description: 'Auto-edit trip highlights', platforms: ['iOS', 'Android'], segment: 'traveler', priority: 'P1', complexity: 'High', marketGap: 'Story-first editing' },
  { name: 'DemoMaker', description: 'Product demo automation', platforms: ['Web', 'Desktop'], segment: 'smb', priority: 'P0', complexity: 'Medium', marketGap: 'Self-service demo creation' },
  { name: 'TrainingForge', description: 'SOP → Video converter', platforms: ['Web', 'API'], segment: 'smb', priority: 'P1', complexity: 'High', marketGap: 'Document-first video' },
  { name: 'LectureGenius', description: 'Curriculum → video course', platforms: ['Web'], segment: 'education', priority: 'P1', complexity: 'High', marketGap: 'Automated course creation' },
  { name: 'PatientEducator', description: 'Condition-specific video library', platforms: ['iOS', 'Android', 'Web'], segment: 'healthcare', priority: 'P0', complexity: 'High', marketGap: 'Personalized patient content' },
  { name: 'PolicyCaster', description: 'Compliance doc → video', platforms: ['Web', 'API'], segment: 'enterprise', priority: 'P1', complexity: 'Medium', marketGap: 'Policy automation' },
  { name: 'GlobalVoice', description: 'Multi-language automation', platforms: ['Web', 'API'], segment: 'enterprise', priority: 'P1', complexity: 'Medium', marketGap: 'Localization at scale' },
];

const INTEGRATIONS: Integration[] = [
  { partner: 'YouTube', type: 'API', segment: 'creator', value: 'Direct publish, analytics sync', priority: 'P0' },
  { partner: 'Spotify/Anchor', type: 'API', segment: 'creator', value: 'Podcast distribution', priority: 'P0' },
  { partner: 'TikTok', type: 'API', segment: 'creator', value: 'Auto-format for vertical', priority: 'P0' },
  { partner: 'Canva', type: 'Plugin', segment: 'creator', value: 'Design-to-video pipeline', priority: 'P0' },
  { partner: 'Notion', type: 'API', segment: 'creator', value: 'Script storage/collaboration', priority: 'P0' },
  { partner: 'HubSpot', type: 'API', segment: 'smb', value: 'CRM-triggered video personalization', priority: 'P0' },
  { partner: 'Salesforce', type: 'API', segment: 'smb', value: 'Sales enablement', priority: 'P1' },
  { partner: 'Shopify', type: 'Plugin', segment: 'smb', value: 'Product video generation', priority: 'P1' },
  { partner: 'Canvas', type: 'LTI', segment: 'education', value: 'LMS embedding', priority: 'P1' },
  { partner: 'Google Classroom', type: 'API', segment: 'education', value: 'K-12 distribution', priority: 'P1' },
  { partner: 'Epic', type: 'API', segment: 'healthcare', value: 'EHR embedding via FHIR', priority: 'P0' },
  { partner: 'Cerner', type: 'API', segment: 'healthcare', value: 'EHR embedding via FHIR', priority: 'P1' },
  { partner: 'Zoom Healthcare', type: 'API', segment: 'healthcare', value: 'Telehealth + content', priority: 'P1' },
  { partner: 'Microsoft 365', type: 'API', segment: 'enterprise', value: 'Teams/SharePoint embedding', priority: 'P0' },
  { partner: 'Workday', type: 'API', segment: 'enterprise', value: 'HR/training integration', priority: 'P1' },
  { partner: 'Okta/Azure AD', type: 'SSO', segment: 'enterprise', value: 'Enterprise authentication', priority: 'P0' },
  { partner: 'Zapier', type: 'API', segment: 'smb', value: 'Multi-app workflows', priority: 'P0' },
  { partner: 'n8n', type: 'API', segment: 'enterprise', value: 'Self-hosted workflows', priority: 'P1' },
];

const FEATURE_MODULES: FeatureModule[] = [
  { name: 'Trim/Clips', standaloneApp: 'ClipMaster Pro', apiEndpoint: '/api/trim', agentCapability: 'Auto-clip extraction', segments: ['creator', 'smb', 'education'] },
  { name: 'TTS/Voiceover', standaloneApp: 'VoiceGenius', apiEndpoint: '/api/tts', agentCapability: 'Voice generation agent', segments: ['creator', 'smb', 'education', 'healthcare'] },
  { name: 'Transcription', standaloneApp: 'TranscribeNow', apiEndpoint: '/api/transcribe', agentCapability: 'Real-time transcription', segments: ['creator', 'smb', 'enterprise'] },
  { name: 'Script Gen', standaloneApp: 'ScriptAI', apiEndpoint: '/api/script', agentCapability: 'Content generation agent', segments: ['creator', 'smb', 'education'] },
  { name: 'Doc-to-Video', standaloneApp: 'DocuCast', apiEndpoint: '/api/doc-to-video', agentCapability: 'Document processing agent', segments: ['smb', 'education', 'enterprise'] },
  { name: 'Translation', standaloneApp: 'GlobalCast', apiEndpoint: '/api/translate', agentCapability: 'Multi-language agent', segments: ['healthcare', 'enterprise'] },
];

// Helper functions
const getCompetitionColor = (level: string) => {
  switch (level) {
    case 'Low': return 'text-green-500 bg-green-500/10';
    case 'Medium': return 'text-amber-500 bg-amber-500/10';
    case 'High': return 'text-orange-500 bg-orange-500/10';
    case 'Very High': return 'text-red-500 bg-red-500/10';
    default: return 'text-muted-foreground bg-muted';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'P0': return 'bg-red-500 text-white';
    case 'P1': return 'bg-amber-500 text-white';
    case 'P2': return 'bg-blue-500 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getThreatColor = (threat: string) => {
  switch (threat) {
    case 'Low': return 'text-green-500';
    case 'Medium': return 'text-amber-500';
    case 'High': return 'text-red-500';
    default: return 'text-muted-foreground';
  }
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'iOS':
    case 'Android':
      return <Smartphone className="h-3 w-3" />;
    case 'Web':
      return <Globe className="h-3 w-3" />;
    case 'Desktop':
      return <Layers className="h-3 w-3" />;
    case 'API':
      return <Code className="h-3 w-3" />;
    default:
      return null;
  }
};

export const MarketAnalysisDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dashboardRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = 'market-analysis-dashboard.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download PNG:', error);
    }
  };

  const filteredCompetitors = selectedSegment
    ? COMPETITORS.filter(c => c.segment === selectedSegment)
    : COMPETITORS;

  const filteredApps = selectedSegment
    ? APP_OPPORTUNITIES.filter(a => a.segment === selectedSegment)
    : APP_OPPORTUNITIES;

  const filteredIntegrations = selectedSegment
    ? INTEGRATIONS.filter(i => i.segment === selectedSegment)
    : INTEGRATIONS;

  return (
    <AnimatePresence>
      <motion.div
        ref={dashboardRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "space-y-6 p-6 bg-background rounded-xl",
          isFullscreen && "fixed inset-0 z-50 overflow-auto"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Market & Competitive Analysis
            </h1>
            <p className="text-muted-foreground">
              Comprehensive assessment across 6 segments with opportunities analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
              <Download className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Segment Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSegment === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSegment(null)}
          >
            All Segments
          </Button>
          {SEGMENTS.map(segment => (
            <Button
              key={segment.id}
              variant={selectedSegment === segment.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSegment(segment.id)}
              className="gap-2"
            >
              <segment.icon className="h-4 w-4" />
              {segment.name}
            </Button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="apps">Standalone Apps</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="modules">Feature Modules</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Segment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SEGMENTS.map((segment, idx) => (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg",
                      selectedSegment === segment.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedSegment(segment.id === selectedSegment ? null : segment.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "p-2 rounded-lg bg-gradient-to-br",
                          segment.color
                        )}>
                          <segment.icon className="h-5 w-5 text-white" />
                        </div>
                        <Badge className={getPriorityColor(segment.priority)}>
                          {segment.priority}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{segment.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Market Size</span>
                          <p className="font-semibold">{segment.marketSize}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Growth</span>
                          <p className="font-semibold flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            {segment.growthRate} CAGR
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Competition</span>
                        <Badge variant="outline" className={getCompetitionColor(segment.competitionLevel)}>
                          {segment.competitionLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Entry Barrier</span>
                        <Badge variant="outline" className={getCompetitionColor(segment.entryBarrier)}>
                          {segment.entryBarrier}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Genie Fit</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < segment.genieFit
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">$150B+</div>
                  <p className="text-muted-foreground text-sm">Total Addressable Market</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-500">{COMPETITORS.length}</div>
                  <p className="text-muted-foreground text-sm">Competitors Analyzed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-500">{APP_OPPORTUNITIES.length}</div>
                  <p className="text-muted-foreground text-sm">App Opportunities</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-purple-500">{INTEGRATIONS.length}</div>
                  <p className="text-muted-foreground text-sm">Integration Partners</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Competitor Analysis
                </CardTitle>
                <CardDescription>
                  {selectedSegment 
                    ? `Showing competitors for ${SEGMENTS.find(s => s.id === selectedSegment)?.name}`
                    : 'All competitors across segments'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Competitor</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead>Threat</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompetitors.map((competitor, idx) => (
                        <React.Fragment key={`${competitor.name}-${idx}`}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setExpandedCompetitor(
                              expandedCompetitor === competitor.name ? null : competitor.name
                            )}
                          >
                            <TableCell className="font-medium">{competitor.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {SEGMENTS.find(s => s.id === competitor.segment)?.name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{competitor.type}</Badge>
                            </TableCell>
                            <TableCell>{competitor.pricing}</TableCell>
                            <TableCell>
                              <span className={getThreatColor(competitor.threat)}>
                                {competitor.threat}
                              </span>
                            </TableCell>
                            <TableCell>
                              {expandedCompetitor === competitor.name 
                                ? <ChevronUp className="h-4 w-4" />
                                : <ChevronDown className="h-4 w-4" />
                              }
                            </TableCell>
                          </TableRow>
                          {expandedCompetitor === competitor.name && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/30">
                                <div className="grid grid-cols-2 gap-4 p-4">
                                  <div>
                                    <h4 className="font-medium text-green-500 mb-2 flex items-center gap-2">
                                      <Check className="h-4 w-4" />
                                      Strengths
                                    </h4>
                                    <ul className="space-y-1 text-sm">
                                      {competitor.strengths.map((s, i) => (
                                        <li key={i}>• {s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-red-500 mb-2 flex items-center gap-2">
                                      <X className="h-4 w-4" />
                                      Weaknesses
                                    </h4>
                                    <ul className="space-y-1 text-sm">
                                      {competitor.weaknesses.map((w, i) => (
                                        <li key={i}>• {w}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Standalone Apps Tab */}
          <TabsContent value="apps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Standalone App Opportunities
                </CardTitle>
                <CardDescription>
                  Features that can be launched as independent apps (iOS/Android/Web)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredApps.map((app, idx) => (
                    <motion.div
                      key={app.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="h-full">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{app.name}</CardTitle>
                            <Badge className={getPriorityColor(app.priority)}>
                              {app.priority}
                            </Badge>
                          </div>
                          <CardDescription>{app.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {app.platforms.map(platform => (
                              <Badge key={platform} variant="outline" className="gap-1">
                                <PlatformIcon platform={platform} />
                                {platform}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Segment: </span>
                            <Badge variant="secondary">
                              {SEGMENTS.find(s => s.id === app.segment)?.name}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Complexity: </span>
                            <Badge variant="outline" className={getCompetitionColor(app.complexity)}>
                              {app.complexity}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Market Gap: </span>
                            <span className="text-foreground">{app.marketGap}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  Integration Opportunities
                </CardTitle>
                <CardDescription>
                  Strategic partnerships and API integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead>Value Proposition</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIntegrations.map((integration, idx) => (
                        <TableRow key={`${integration.partner}-${idx}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {integration.partner}
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{integration.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {SEGMENTS.find(s => s.id === integration.segment)?.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {integration.value}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(integration.priority)}>
                              {integration.priority}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Feature Module Extraction
                </CardTitle>
                <CardDescription>
                  Core features that can be deployed as standalone apps, APIs, and agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {FEATURE_MODULES.map((module, idx) => (
                    <motion.div
                      key={module.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="h-full bg-gradient-to-br from-background to-muted/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-500" />
                            {module.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 rounded-lg bg-primary/10">
                              <Smartphone className="h-5 w-5 mx-auto mb-1 text-primary" />
                              <p className="text-xs font-medium">{module.standaloneApp}</p>
                              <p className="text-xs text-muted-foreground">App</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-blue-500/10">
                              <Code className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                              <p className="text-xs font-medium">{module.apiEndpoint}</p>
                              <p className="text-xs text-muted-foreground">API</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-purple-500/10">
                              <Bot className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                              <p className="text-xs font-medium truncate">{module.agentCapability}</p>
                              <p className="text-xs text-muted-foreground">Agent</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Target Segments:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {module.segments.map(segId => (
                                <Badge key={segId} variant="outline" className="text-xs">
                                  {SEGMENTS.find(s => s.id === segId)?.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Compatibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  Platform Compatibility Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature/App</TableHead>
                      <TableHead className="text-center">iOS</TableHead>
                      <TableHead className="text-center">Android</TableHead>
                      <TableHead className="text-center">Web</TableHead>
                      <TableHead className="text-center">Desktop</TableHead>
                      <TableHead className="text-center">API</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {APP_OPPORTUNITIES.slice(0, 6).map(app => (
                      <TableRow key={app.name}>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        {['iOS', 'Android', 'Web', 'Desktop', 'API'].map(platform => (
                          <TableCell key={platform} className="text-center">
                            {app.platforms.includes(platform as any) 
                              ? <Check className="h-4 w-4 text-green-500 mx-auto" />
                              : <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
                            }
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarketAnalysisDashboard;
