/**
 * Genie Market & Competitive Analysis Diagram
 * Dedicated diagram for comprehensive market analysis within Genie Studio
 */

import React, { useState, useRef } from 'react';
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
  Cpu,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import '@/styles/enhanced-tabs.css';

// Types
interface Segment {
  id: string;
  name: string;
  icon: React.ElementType;
  marketSize: string;
  growthRate: string;
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  entryBarrier: 'Low' | 'Medium' | 'High' | 'Very High';
  genieFit: number;
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
  platforms: ('iOS' | 'Android' | 'Web')[];
  priority: 'P0' | 'P1' | 'P2';
}

// Data
const segments: Segment[] = [
  { id: 'creator', name: 'Creator Economy', icon: Users, marketSize: '$104B', growthRate: '+22%', competitionLevel: 'Very High', entryBarrier: 'Medium', genieFit: 5, priority: 'P0', color: 'hsl(var(--primary))' },
  { id: 'traveler', name: 'Traveler/Experience', icon: Plane, marketSize: '$1.1T', growthRate: '+15%', competitionLevel: 'Medium', entryBarrier: 'Low', genieFit: 5, priority: 'P0', color: 'hsl(220, 70%, 50%)' },
  { id: 'smb', name: 'SMB Marketing', icon: Briefcase, marketSize: '$45B', growthRate: '+18%', competitionLevel: 'High', entryBarrier: 'Medium', genieFit: 4, priority: 'P1', color: 'hsl(150, 70%, 40%)' },
  { id: 'education', name: 'Education', icon: GraduationCap, marketSize: '$7.3T', growthRate: '+12%', competitionLevel: 'Medium', entryBarrier: 'High', genieFit: 4, priority: 'P1', color: 'hsl(45, 90%, 50%)' },
  { id: 'healthcare', name: 'Healthcare', icon: Heart, marketSize: '$8.3T', growthRate: '+8%', competitionLevel: 'Low', entryBarrier: 'Very High', genieFit: 5, priority: 'P2', color: 'hsl(350, 70%, 50%)' },
  { id: 'enterprise', name: 'Enterprise', icon: Building, marketSize: '$500B', growthRate: '+10%', competitionLevel: 'High', entryBarrier: 'Very High', genieFit: 3, priority: 'P2', color: 'hsl(270, 60%, 50%)' },
];

const competitors: Competitor[] = [
  { name: 'CapCut', segment: 'Creator Economy', type: 'Direct', strengths: ['Free tier', 'TikTok integration', 'Mobile-first'], weaknesses: ['Limited AI', 'No voice cloning', 'Basic analytics'], pricing: 'Free / $7.99/mo', threat: 'High' },
  { name: 'Descript', segment: 'Creator Economy', type: 'Direct', strengths: ['Text-based editing', 'Overdub', 'Collaboration'], weaknesses: ['Expensive', 'Learning curve', 'Desktop only'], pricing: '$12-24/mo', threat: 'High' },
  { name: 'Canva Video', segment: 'SMB Marketing', type: 'Feature', strengths: ['Brand kits', 'Templates', 'Team features'], weaknesses: ['Basic editing', 'No AI narration', 'Limited effects'], pricing: '$12.99/mo', threat: 'Medium' },
  { name: 'Synthesia', segment: 'Enterprise', type: 'Direct', strengths: ['AI avatars', 'Multi-language', 'Enterprise ready'], weaknesses: ['Very expensive', 'Limited customization', 'Robotic feel'], pricing: '$22-67/mo', threat: 'Medium' },
  { name: 'Loom', segment: 'Enterprise', type: 'Feature', strengths: ['Screen recording', 'Easy sharing', 'Analytics'], weaknesses: ['No AI editing', 'Basic features', 'No mobile app'], pricing: '$12.50/mo', threat: 'Low' },
  { name: 'WeVideo', segment: 'Education', type: 'Direct', strengths: ['LTI integration', 'Student accounts', 'Chromebook support'], weaknesses: ['Dated UI', 'Limited AI', 'Slow rendering'], pricing: '$4.99-15.99/mo', threat: 'Medium' },
  { name: 'Clipchamp', segment: 'Creator Economy', type: 'Platform', strengths: ['Microsoft integration', 'Free tier', 'Web-based'], weaknesses: ['Basic features', 'No AI', 'Limited export'], pricing: 'Free / $11.99/mo', threat: 'Medium' },
  { name: 'InShot', segment: 'Traveler/Experience', type: 'Direct', strengths: ['Mobile-native', 'Social templates', 'Easy filters'], weaknesses: ['Ads', 'Limited pro features', 'No desktop'], pricing: 'Free / $3.99/mo', threat: 'Medium' },
];

const appOpportunities: AppOpportunity[] = [
  { name: 'TripClip', description: 'Auto-edit travel videos with location tagging', platforms: ['iOS', 'Android'], segment: 'Traveler/Experience', priority: 'P0', complexity: 'Medium', marketGap: 'No AI travel video editor exists' },
  { name: 'QuickPromo', description: '60-second marketing video generator', platforms: ['Web', 'iOS', 'Android'], segment: 'SMB Marketing', priority: 'P0', complexity: 'Low', marketGap: 'SMBs lack quick video tools' },
  { name: 'EduClip', description: 'Lecture-to-microlearning converter', platforms: ['Web', 'API'], segment: 'Education', priority: 'P1', complexity: 'High', marketGap: 'No automated lecture segmentation' },
  { name: 'HealthNarrate', description: 'HIPAA-compliant patient education videos', platforms: ['Web', 'API'], segment: 'Healthcare', priority: 'P2', complexity: 'High', marketGap: 'No compliant AI video for healthcare' },
  { name: 'ReelGenius', description: 'AI-powered social reel creator', platforms: ['iOS', 'Android', 'Web'], segment: 'Creator Economy', priority: 'P0', complexity: 'Medium', marketGap: 'Creators want one-tap reels' },
  { name: 'TrainBot', description: 'Corporate training video automation', platforms: ['Web', 'Desktop', 'API'], segment: 'Enterprise', priority: 'P1', complexity: 'High', marketGap: 'Training videos take too long' },
];

const integrations: Integration[] = [
  { partner: 'TikTok', type: 'API', segment: 'Creator Economy', value: 'Direct publishing, trending audio', priority: 'P0' },
  { partner: 'Instagram', type: 'API', segment: 'Creator Economy', value: 'Reel publishing, insights sync', priority: 'P0' },
  { partner: 'YouTube', type: 'API', segment: 'Creator Economy', value: 'Shorts publishing, analytics', priority: 'P0' },
  { partner: 'Canvas LMS', type: 'LTI', segment: 'Education', value: 'Grade passback, assignments', priority: 'P1' },
  { partner: 'Blackboard', type: 'LTI', segment: 'Education', value: 'LMS integration', priority: 'P1' },
  { partner: 'Salesforce', type: 'API', segment: 'Enterprise', value: 'CRM video assets', priority: 'P2' },
  { partner: 'HubSpot', type: 'API', segment: 'SMB Marketing', value: 'Marketing automation', priority: 'P1' },
  { partner: 'Shopify', type: 'Plugin', segment: 'SMB Marketing', value: 'Product video generation', priority: 'P0' },
  { partner: 'Epic/Cerner', type: 'Partnership', segment: 'Healthcare', value: 'EHR integration', priority: 'P2' },
  { partner: 'Expedia', type: 'Partnership', segment: 'Traveler/Experience', value: 'Trip memory videos', priority: 'P1' },
];

const featureModules: FeatureModule[] = [
  { name: 'Smart Trim', standaloneApp: 'TrimAI', apiEndpoint: '/api/v1/trim', agentCapability: 'trim_agent', platforms: ['iOS', 'Android', 'Web'], priority: 'P0' },
  { name: 'AI Clips', standaloneApp: 'ClipGenius', apiEndpoint: '/api/v1/clips', agentCapability: 'clips_agent', platforms: ['iOS', 'Android', 'Web'], priority: 'P0' },
  { name: 'Voice Clone', standaloneApp: 'VoiceTwin', apiEndpoint: '/api/v1/voice', agentCapability: 'voice_agent', platforms: ['Web'], priority: 'P0' },
  { name: 'Caption Gen', standaloneApp: 'SubtitlePro', apiEndpoint: '/api/v1/captions', agentCapability: 'caption_agent', platforms: ['iOS', 'Android', 'Web'], priority: 'P0' },
  { name: 'B-Roll Match', standaloneApp: 'SceneMatch', apiEndpoint: '/api/v1/broll', agentCapability: 'broll_agent', platforms: ['Web'], priority: 'P1' },
  { name: 'Music Sync', standaloneApp: 'BeatSync', apiEndpoint: '/api/v1/music', agentCapability: 'music_agent', platforms: ['iOS', 'Android', 'Web'], priority: 'P1' },
];

export const GenieMarketAnalysisDiagram: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const filteredCompetitors = selectedSegment === 'all' 
    ? competitors 
    : competitors.filter(c => c.segment === segments.find(s => s.id === selectedSegment)?.name);

  const filteredApps = selectedSegment === 'all'
    ? appOpportunities
    : appOpportunities.filter(a => a.segment === segments.find(s => s.id === selectedSegment)?.name);

  const filteredIntegrations = selectedSegment === 'all'
    ? integrations
    : integrations.filter(i => i.segment === segments.find(s => s.id === selectedSegment)?.name);

  const handleExportPNG = async () => {
    if (!diagramRef.current) return;
    const canvas = await html2canvas(diagramRef.current, { backgroundColor: '#ffffff', scale: 2 });
    const link = document.createElement('a');
    link.download = `market-analysis-${selectedSegment}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'High': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'Medium': return 'bg-warning/10 text-warning border-warning/30';
      case 'Low': return 'bg-success/10 text-success border-success/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-primary/10 text-primary border-primary/30';
      case 'P1': return 'bg-secondary/50 text-secondary-foreground border-secondary';
      case 'P2': return 'bg-muted text-muted-foreground border-muted';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={cn("h-3 w-3", i < count ? "fill-primary text-primary" : "text-muted")} />
    ));
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Market & Competitive Analysis</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive assessment across 6 segments with opportunities analysis
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPNG}>
                <Download className="h-4 w-4 mr-2" />
                Export PNG
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Segment Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSegment === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSegment('all')}
              className="whitespace-nowrap"
            >
              <Layers className="h-4 w-4 mr-2" />
              All Segments
            </Button>
            {segments.map(segment => {
              const Icon = segment.icon;
              return (
                <Button
                  key={segment.id}
                  variant={selectedSegment === segment.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSegment(segment.id)}
                  className="whitespace-nowrap"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {segment.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div ref={diagramRef}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="parent-tabs">
            <TabsTrigger value="overview" className="parent-tab-trigger">
              <PieChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="competitors" className="parent-tab-trigger">
              <Target className="h-4 w-4 mr-2" />
              Competitors
            </TabsTrigger>
            <TabsTrigger value="standalone" className="parent-tab-trigger">
              <Smartphone className="h-4 w-4 mr-2" />
              Standalone Apps
            </TabsTrigger>
            <TabsTrigger value="integrations" className="parent-tab-trigger">
              <Link className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="modules" className="parent-tab-trigger">
              <Package className="h-4 w-4 mr-2" />
              Feature Modules
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="parent-tab-trigger">
              <LineChart className="h-4 w-4 mr-2" />
              Roadmap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="parent-tab-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {segments.map(segment => {
                const Icon = segment.icon;
                return (
                  <Card 
                    key={segment.id} 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg",
                      selectedSegment === segment.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedSegment(segment.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${segment.color}20` }}>
                            <Icon className="h-5 w-5" style={{ color: segment.color }} />
                          </div>
                          <CardTitle className="text-lg">{segment.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className={getPriorityColor(segment.priority)}>
                          {segment.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Market Size</span>
                          <p className="font-semibold">{segment.marketSize}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Growth</span>
                          <p className="font-semibold text-success">{segment.growthRate}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Competition</span>
                          <Badge variant="secondary" className="text-xs">{segment.competitionLevel}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Entry Barrier</span>
                          <Badge variant="secondary" className="text-xs">{segment.entryBarrier}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Genie Fit</span>
                        <div className="flex">{renderStars(segment.genieFit)}</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="competitors" className="parent-tab-content">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competitor</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Threat</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompetitors.map(competitor => (
                      <React.Fragment key={competitor.name}>
                        <TableRow 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedCompetitor(expandedCompetitor === competitor.name ? null : competitor.name)}
                        >
                          <TableCell className="font-medium">{competitor.name}</TableCell>
                          <TableCell>{competitor.segment}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{competitor.type}</Badge>
                          </TableCell>
                          <TableCell>{competitor.pricing}</TableCell>
                          <TableCell>
                            <Badge className={getThreatColor(competitor.threat)}>{competitor.threat}</Badge>
                          </TableCell>
                          <TableCell>
                            {expandedCompetitor === competitor.name ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </TableCell>
                        </TableRow>
                        {expandedCompetitor === competitor.name && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/30">
                              <div className="grid grid-cols-2 gap-4 p-4">
                                <div>
                                  <h4 className="font-medium text-success mb-2 flex items-center gap-1">
                                    <Check className="h-4 w-4" /> Strengths
                                  </h4>
                                  <ul className="space-y-1">
                                    {competitor.strengths.map((s, i) => (
                                      <li key={i} className="text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                        {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-medium text-destructive mb-2 flex items-center gap-1">
                                    <X className="h-4 w-4" /> Weaknesses
                                  </h4>
                                  <ul className="space-y-1">
                                    {competitor.weaknesses.map((w, i) => (
                                      <li key={i} className="text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                        {w}
                                      </li>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standalone" className="parent-tab-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApps.map(app => (
                <Card key={app.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <Badge className={getPriorityColor(app.priority)}>{app.priority}</Badge>
                    </div>
                    <CardDescription>{app.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {app.platforms.map(p => (
                        <Badge key={p} variant="secondary" className="text-xs">
                          {p === 'iOS' && <Smartphone className="h-3 w-3 mr-1" />}
                          {p === 'Android' && <Smartphone className="h-3 w-3 mr-1" />}
                          {p === 'Web' && <Globe className="h-3 w-3 mr-1" />}
                          {p === 'API' && <Code className="h-3 w-3 mr-1" />}
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Market Gap:</span>
                      <p className="text-foreground">{app.marketGap}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Segment: {app.segment}</span>
                      <Badge variant="outline">Complexity: {app.complexity}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="parent-tab-content">
            <Card>
              <CardContent className="p-0">
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
                    {filteredIntegrations.map(integration => (
                      <TableRow key={integration.partner}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            {integration.partner}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{integration.type}</Badge>
                        </TableCell>
                        <TableCell>{integration.segment}</TableCell>
                        <TableCell className="max-w-xs">{integration.value}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(integration.priority)}>{integration.priority}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="parent-tab-content">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Each Genie feature can be extracted as a standalone app, API endpoint, or AI agent capability.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featureModules.map(module => (
                  <Card key={module.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <Badge className={getPriorityColor(module.priority)}>{module.priority}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">App:</span>
                          <span className="font-medium">{module.standaloneApp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">API:</span>
                          <code className="text-xs bg-muted px-1 rounded">{module.apiEndpoint}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Agent:</span>
                          <code className="text-xs bg-muted px-1 rounded">{module.agentCapability}</code>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-2 border-t">
                        {module.platforms.map(p => (
                          <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roadmap" className="parent-tab-content">
            <Card>
              <CardHeader>
                <CardTitle>24-Week Implementation Roadmap</CardTitle>
                <CardDescription>Phased approach from core platform to segment-specific solutions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { phase: 'Phase 1: Foundation', weeks: '1-4', items: ['Core platform stabilization', 'P0 feature completion', 'iOS/Android app shells'], color: 'hsl(var(--primary))' },
                  { phase: 'Phase 2: Creator & Traveler', weeks: '5-10', items: ['TripClip launch', 'ReelGenius beta', 'Social platform integrations', 'Voice clone API'], color: 'hsl(220, 70%, 50%)' },
                  { phase: 'Phase 3: SMB & Education', weeks: '11-16', items: ['QuickPromo launch', 'EduClip beta', 'LMS integrations', 'Shopify plugin'], color: 'hsl(150, 70%, 40%)' },
                  { phase: 'Phase 4: Healthcare & Enterprise', weeks: '17-24', items: ['HIPAA compliance', 'HealthNarrate pilot', 'TrainBot enterprise', 'API marketplace'], color: 'hsl(270, 60%, 50%)' },
                ].map((phase, idx) => (
                  <div key={phase.phase} className="relative">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                        style={{ backgroundColor: phase.color }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{phase.phase}</h3>
                          <Badge variant="outline">Weeks {phase.weeks}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {phase.items.map(item => (
                            <div key={item} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                              <Check className="h-4 w-4 text-success shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {idx < 3 && (
                      <div className="absolute left-6 top-14 w-0.5 h-8 bg-border" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-auto">
          <div className="p-4">
            <Button 
              variant="outline" 
              className="fixed top-4 right-4 z-50"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <div className="max-w-7xl mx-auto pt-12">
              {/* Render same content in fullscreen */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenieMarketAnalysisDiagram;
