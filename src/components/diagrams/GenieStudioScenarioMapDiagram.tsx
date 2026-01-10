import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  FileText, 
  Target, 
  Download,
  Zap,
  Layers,
  TrendingUp,
  Shield,
  Smartphone,
  Film
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

// Consistent enterprise color palette
const colors = {
  completed: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  inProgress: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  planned: { bg: '#6366f1', text: '#ffffff', light: '#e0e7ff' },
  
  p0: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  p1: { bg: '#0ea5e9', text: '#ffffff', light: '#e0f2fe' },
  p2: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  p3: { bg: '#ec4899', text: '#ffffff', light: '#fce7f3' },
  p4: { bg: '#8b5cf6', text: '#ffffff', light: '#ede9fe' },
  p5: { bg: '#64748b', text: '#ffffff', light: '#f1f5f9' },
  
  border: '#e2e8f0',
  background: '#ffffff',
  cardBg: '#f8fafc',
  text: '#1e293b',
  textMuted: '#64748b',
};

interface Scenario {
  id: number;
  name: string;
  category: string;
  status: 'implemented' | 'partial' | 'planned';
  description: string;
  marketData?: string;
}

const scenarios: Record<string, Scenario[]> = {
  p0: [
    { id: 1, name: 'New Script from Scratch', category: 'Script Creation', status: 'implemented', description: 'User writes original script manually' },
    { id: 2, name: 'AI-Generated Script', category: 'Script Creation', status: 'implemented', description: 'AI creates script from topic prompt' },
    { id: 3, name: 'Document-to-Script Conversion', category: 'Script Creation', status: 'implemented', description: 'Convert existing document to video script' },
    { id: 4, name: 'Manual Recording with Teleprompter', category: 'Recording', status: 'implemented', description: 'Record video while reading from teleprompter' },
    { id: 5, name: 'TTS-Only Audio Generation', category: 'Recording', status: 'implemented', description: 'Generate audio-only content via TTS' },
    { id: 6, name: 'Script Enhancement with AI', category: 'Enhancement', status: 'implemented', description: 'Improve existing script with AI assistance' },
    { id: 7, name: 'Basic Video Export', category: 'Export', status: 'implemented', description: 'Export recording as video file' },
    { id: 8, name: 'Project Save/Load', category: 'Management', status: 'implemented', description: 'Persist and retrieve projects' },
    { id: 61, name: 'Recording → Mind → Script', category: 'Vibe↔Mind', status: 'implemented', description: 'Bidirectional: Analyze recording with Mind' },
    { id: 62, name: 'PPT → Mind → Script', category: 'Vibe↔Mind', status: 'implemented', description: 'Bidirectional: Convert PPT via Mind AI' },
    { id: 63, name: 'PDF → Mind → Script', category: 'Vibe↔Mind', status: 'implemented', description: 'Bidirectional: Extract PDF content' },
    { id: 64, name: 'URL → Mind → Script', category: 'Vibe↔Mind', status: 'implemented', description: 'Bidirectional: Scrape and convert web page' },
    { id: 65, name: 'Image → Mind → Script', category: 'Vibe↔Mind', status: 'implemented', description: 'Bidirectional: Vision AI description' },
  ],
  p1: [
    { id: 11, name: 'Screen + Camera PiP Recording', category: 'Recording', status: 'partial', description: 'Picture-in-picture screen recording' },
    { id: 12, name: 'Multi-track Audio Mixing', category: 'Audio', status: 'implemented', description: 'Layer multiple audio tracks' },
    { id: 13, name: 'Background Music Integration', category: 'Audio', status: 'implemented', description: 'Add background music to recordings' },
    { id: 81, name: 'One-Tap Mobile Record', category: 'Mobile-First', status: 'planned', description: 'Quick mobile recording', marketData: '68% want mobile-first' },
    { id: 83, name: 'Quick Templates (Social)', category: 'Mobile-First', status: 'planned', description: 'TikTok, Reels, Shorts presets' },
    { id: 85, name: 'Social Integration', category: 'Mobile-First', status: 'planned', description: 'One-click multi-platform publish' },
    { id: 90, name: 'Quick Clips Generator', category: 'Remix', status: 'planned', description: 'Auto-create shorts from long video', marketData: '82% creators want this' },
    { id: 101, name: 'Multi-Clip Timeline', category: 'Remix', status: 'planned', description: 'Drag-drop clip assembly' },
    { id: 107, name: 'Template-Based Assembly', category: 'Remix', status: 'planned', description: 'Pre-built remix templates' },
    { id: 108, name: 'Highlight Reel Generator', category: 'Remix', status: 'planned', description: 'AI identifies best moments' },
  ],
  p2: [
    { id: 21, name: 'Collaborative Script Editing', category: 'Collaboration', status: 'planned', description: 'Real-time multi-user editing' },
    { id: 82, name: 'Offline Recording', category: 'Mobile-First', status: 'planned', description: 'Record without internet', marketData: '54% need offline' },
    { id: 84, name: 'Voice-First Editing', category: 'Mobile-First', status: 'planned', description: 'Voice commands for editing', marketData: '47% want voice commands' },
    { id: 89, name: 'Location Story Mode', category: 'Traveler', status: 'planned', description: 'Geo-tagged travel content' },
    { id: 91, name: 'Traveler Kit', category: 'Segment', status: 'planned', description: 'Auto-edit trip footage', marketData: '76% want auto-edit' },
    { id: 102, name: 'AI Auto-Arrange', category: 'Remix', status: 'planned', description: 'AI sequences clips intelligently' },
    { id: 103, name: 'Smart Transitions', category: 'Remix', status: 'planned', description: 'Context-aware transition effects' },
    { id: 104, name: 'Music Sync Assembly', category: 'Remix', status: 'planned', description: 'Beat-matched clip cutting' },
    { id: 105, name: 'Remix Public Content', category: 'Remix', status: 'planned', description: 'Remix with attribution' },
    { id: 109, name: 'Before/After Split Screen', category: 'Remix', status: 'planned', description: 'Side-by-side comparison' },
  ],
  p3: [
    { id: 32, name: 'Voice Cloning', category: 'TTS', status: 'planned', description: 'Clone custom voices', marketData: '61% want voice cloning' },
    { id: 35, name: 'Accessibility Compliance', category: 'Compliance', status: 'planned', description: 'Auto-generate captions, transcripts' },
    { id: 36, name: 'HIPAA-Compliant Recordings', category: 'Healthcare', status: 'planned', description: 'Secure healthcare video', marketData: '94% want HIPAA <$100/mo' },
    { id: 86, name: 'Product Demo Mode', category: 'SMB', status: 'planned', description: 'Quick product video templates', marketData: '71% want quick templates' },
    { id: 87, name: 'Testimonial Collector', category: 'SMB', status: 'planned', description: 'Customer video testimonials' },
    { id: 88, name: 'Lesson Builder', category: 'Education', status: 'planned', description: 'AI lesson script generation', marketData: '69% want AI lesson scripts' },
    { id: 92, name: 'Product Scanner', category: 'SMB', status: 'planned', description: 'Scan product → auto-demo video' },
    { id: 93, name: 'Patient Education', category: 'Healthcare', status: 'planned', description: 'Multi-language patient videos' },
    { id: 94, name: 'Training Module Builder', category: 'Education', status: 'planned', description: 'Corporate training creator' },
    { id: 95, name: 'Multi-Language Quick Dub', category: 'Localization', status: 'planned', description: 'One-click 50+ language dubbing' },
  ],
  p4: [
    { id: 41, name: 'AI Avatar Presenter', category: 'AI Advanced', status: 'planned', description: 'AI-generated video presenter' },
    { id: 42, name: 'Real-time Translation Dubbing', category: 'Localization', status: 'planned', description: 'Live translation with lip-sync' },
    { id: 46, name: 'Mobile Recording App', category: 'Platform', status: 'planned', description: 'Native mobile app' },
    { id: 48, name: 'White-label Solution', category: 'Enterprise', status: 'planned', description: 'Custom branded solution' },
    { id: 49, name: 'Multi-tenant Workspaces', category: 'Enterprise', status: 'planned', description: 'Organization isolation' },
    { id: 96, name: 'Influencer Analytics', category: 'Creator', status: 'planned', description: 'Content performance insights' },
    { id: 97, name: 'Franchise Templates', category: 'Enterprise', status: 'planned', description: 'Brand-locked templates' },
    { id: 98, name: 'Team Review Mobile', category: 'Enterprise', status: 'planned', description: 'Mobile approval workflows' },
    { id: 99, name: 'Offline Compliance', category: 'Healthcare', status: 'planned', description: 'Offline HIPAA-compliant mode' },
    { id: 110, name: 'Clip Library Sharing', category: 'Collaboration', status: 'planned', description: 'Team clip asset library' },
  ],
  p5: [
    { id: 51, name: 'Batch Video Processing', category: 'Enterprise', status: 'planned', description: 'Process multiple videos at once' },
    { id: 52, name: 'API Access', category: 'Enterprise', status: 'planned', description: 'Programmatic video generation' },
    { id: 53, name: 'SSO/SAML Integration', category: 'Enterprise', status: 'planned', description: 'Enterprise authentication' },
    { id: 54, name: 'Advanced Analytics Dashboard', category: 'Enterprise', status: 'planned', description: 'Usage and performance metrics' },
    { id: 55, name: 'Custom Model Training', category: 'AI Advanced', status: 'planned', description: 'Train AI on company content' },
    { id: 56, name: 'B-Roll Library', category: 'Content', status: 'planned', description: 'Stock footage integration' },
    { id: 57, name: 'Advanced Editing Suite', category: 'Editing', status: 'planned', description: 'Professional editing tools' },
    { id: 58, name: 'Version Control', category: 'Collaboration', status: 'planned', description: 'Git-like video versioning' },
    { id: 59, name: 'Approval Workflows', category: 'Enterprise', status: 'planned', description: 'Multi-stage content approval' },
    { id: 60, name: 'Compliance Audit Trail', category: 'Enterprise', status: 'planned', description: 'Full activity logging' },
  ],
};

const priorityConfig = {
  p0: { label: 'P0 - Core + Vibe↔Mind', icon: Zap, description: 'Essential MVP + Bidirectional', color: colors.p0, marketDriver: 'Foundation', count: 13 },
  p1: { label: 'P1 - Mobile & Remix', icon: Smartphone, description: 'Mobile-first + clip assembly', color: colors.p1, marketDriver: '68% want mobile', count: 10 },
  p2: { label: 'P2 - Advanced', icon: TrendingUp, description: 'Offline + AI features', color: colors.p2, marketDriver: '54% need offline', count: 10 },
  p3: { label: 'P3 - Segments', icon: Target, description: 'SMB, Education, Healthcare', color: colors.p3, marketDriver: 'Market segments', count: 10 },
  p4: { label: 'P4 - Enterprise', icon: Shield, description: 'White-label, HIPAA', color: colors.p4, marketDriver: 'Enterprise sales', count: 10 },
  p5: { label: 'P5 - Future', icon: Film, description: 'Advanced features', color: colors.p5, marketDriver: 'Innovation', count: 10 },
};

export const GenieStudioScenarioMapDiagram = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const diagramRef = useRef<HTMLDivElement>(null);

  const openDocs = () => {
    window.open('/docs/GENIE_STUDIO_SCENARIO_MAP.md', '_blank');
  };

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: colors.background,
        scale: 2
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `genie-studio-scenario-map-${activeTab}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PNG downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PNG');
    }
  };

  const handleDownloadSVG = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
  <rect width="1200" height="600" fill="${colors.background}"/>
  <text x="600" y="30" text-anchor="middle" fill="${colors.text}" font-size="20" font-weight="bold">Genie Mind + Genie Vibe — 110 Scenario Priority Map</text>
  <text x="600" y="52" text-anchor="middle" fill="${colors.textMuted}" font-size="13">8 Implemented | 6 Partial | 96 Planned | 6 Market Segments</text>
  
  <!-- Legend -->
  <g transform="translate(50, 70)">
    <rect width="600" height="50" rx="6" fill="${colors.cardBg}" stroke="${colors.border}"/>
    <text x="15" y="22" fill="${colors.text}" font-size="11" font-weight="bold">Status:</text>
    <rect x="60" y="10" width="12" height="12" rx="2" fill="${colors.completed.bg}"/>
    <text x="78" y="20" fill="${colors.textMuted}" font-size="10">Implemented (8)</text>
    <rect x="175" y="10" width="12" height="12" rx="2" fill="${colors.inProgress.bg}"/>
    <text x="193" y="20" fill="${colors.textMuted}" font-size="10">Partial (6)</text>
    <rect x="270" y="10" width="12" height="12" rx="2" fill="${colors.planned.bg}"/>
    <text x="288" y="20" fill="${colors.textMuted}" font-size="10">Planned (96)</text>
    
    <text x="15" y="42" fill="${colors.text}" font-size="11" font-weight="bold">Phases:</text>
    <rect x="70" y="30" width="12" height="12" rx="2" fill="${colors.p0.bg}"/>
    <text x="88" y="40" fill="${colors.textMuted}" font-size="10">P0 Core</text>
    <rect x="145" y="30" width="12" height="12" rx="2" fill="${colors.p1.bg}"/>
    <text x="163" y="40" fill="${colors.textMuted}" font-size="10">P1 Mobile</text>
    <rect x="230" y="30" width="12" height="12" rx="2" fill="${colors.p2.bg}"/>
    <text x="248" y="40" fill="${colors.textMuted}" font-size="10">P2 Advanced</text>
    <rect x="325" y="30" width="12" height="12" rx="2" fill="${colors.p3.bg}"/>
    <text x="343" y="40" fill="${colors.textMuted}" font-size="10">P3 Segments</text>
    <rect x="420" y="30" width="12" height="12" rx="2" fill="${colors.p4.bg}"/>
    <text x="438" y="40" fill="${colors.textMuted}" font-size="10">P4 Enterprise</text>
    <rect x="530" y="30" width="12" height="12" rx="2" fill="${colors.p5.bg}"/>
    <text x="548" y="40" fill="${colors.textMuted}" font-size="10">P5 Future</text>
  </g>
</svg>`;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `genie-studio-scenario-map-${activeTab}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded successfully');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge className="text-xs" style={{ backgroundColor: colors.completed.light, color: colors.completed.bg, border: `1px solid ${colors.completed.bg}` }}>✓ Done</Badge>;
      case 'partial':
        return <Badge className="text-xs" style={{ backgroundColor: colors.inProgress.light, color: colors.inProgress.bg, border: `1px solid ${colors.inProgress.bg}` }}>◐ Partial</Badge>;
      default:
        return <Badge className="text-xs" style={{ backgroundColor: colors.planned.light, color: colors.planned.bg, border: `1px solid ${colors.planned.bg}` }}>○ Planned</Badge>;
    }
  };

  const getStats = (priority: string) => {
    const items = scenarios[priority] || [];
    const implemented = items.filter(s => s.status === 'implemented').length;
    const partial = items.filter(s => s.status === 'partial').length;
    const planned = items.filter(s => s.status === 'planned').length;
    const percent = Math.round(((implemented + partial * 0.5) / items.length) * 100);
    return { implemented, partial, planned, total: items.length, percent };
  };

  const getTotalStats = () => {
    let implemented = 0, partial = 0, planned = 0;
    Object.values(scenarios).forEach(items => {
      implemented += items.filter(s => s.status === 'implemented').length;
      partial += items.filter(s => s.status === 'partial').length;
      planned += items.filter(s => s.status === 'planned').length;
    });
    const total = implemented + partial + planned;
    const percent = Math.round(((implemented + partial * 0.5) / total) * 100);
    return { implemented, partial, planned, total, percent };
  };

  const totalStats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-2xl text-foreground">110 Scenario Priority Map</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {totalStats.implemented} Implemented | {totalStats.partial} Partial | {totalStats.planned} Planned | {totalStats.percent}% Complete
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2">
                <Download className="h-4 w-4" />
                SVG
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
                <Download className="h-4 w-4" />
                PNG
              </Button>
              <Button variant="outline" size="sm" onClick={openDocs} className="gap-2">
                <FileText className="h-4 w-4" />
                Documentation
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="p0">P0 Core</TabsTrigger>
          <TabsTrigger value="p1">P1 Mobile</TabsTrigger>
          <TabsTrigger value="p2">P2 Advanced</TabsTrigger>
          <TabsTrigger value="p3">P3 Segments</TabsTrigger>
          <TabsTrigger value="p4">P4 Enterprise</TabsTrigger>
          <TabsTrigger value="p5">P5 Future</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <div ref={diagramRef} className="p-4 bg-white rounded-lg">
            {/* Legend */}
            <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Implementation Status (110 Total)</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.completed.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Implemented ({totalStats.implemented})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.inProgress.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Partial ({totalStats.partial})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.planned.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Planned ({totalStats.planned})</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Priority Phases (6 Phases)</h4>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <div key={key} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: config.color.bg }} />
                        <span className="text-xs" style={{ color: colors.textMuted }}>{key.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Priority Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(priorityConfig).map(([key, config]) => {
                  const stats = getStats(key);
                  const Icon = config.icon;
                  return (
                    <Card 
                      key={key} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-2"
                      style={{ borderColor: config.color.bg, backgroundColor: config.color.light }}
                      onClick={() => setActiveTab(key)}
                    >
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4" style={{ color: config.color.bg }} />
                          <span className="font-semibold text-sm" style={{ color: config.color.bg }}>{key.toUpperCase()}</span>
                        </div>
                        <p className="text-xs mb-2" style={{ color: colors.text }}>{config.description}</p>
                        
                        {/* Progress bar */}
                        <div className="w-full h-2 rounded-full mb-2" style={{ backgroundColor: colors.border }}>
                          <div 
                            className="h-2 rounded-full transition-all" 
                            style={{ width: `${stats.percent}%`, backgroundColor: config.color.bg }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span style={{ color: colors.completed.bg }}>{stats.implemented} ✓</span>
                          <span style={{ color: colors.inProgress.bg }}>{stats.partial} ◐</span>
                          <span style={{ color: colors.planned.bg }}>{stats.planned} ○</span>
                        </div>
                        <p className="text-xs mt-1 font-medium" style={{ color: config.color.bg }}>{stats.percent}%</p>
                        <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{config.marketDriver}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Market Insights */}
              <Card className="border-2" style={{ borderColor: colors.inProgress.bg, backgroundColor: colors.inProgress.light }}>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3" style={{ color: colors.inProgress.bg }}>📊 Market Research Insights</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-bold" style={{ color: colors.text }}>68%</p>
                      <p style={{ color: colors.textMuted }}>want mobile-first editing</p>
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: colors.text }}>54%</p>
                      <p style={{ color: colors.textMuted }}>need offline capability</p>
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: colors.text }}>82%</p>
                      <p style={{ color: colors.textMuted }}>creators want quick clips</p>
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: colors.text }}>94%</p>
                      <p style={{ color: colors.textMuted }}>want HIPAA under $100/mo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Quote */}
              <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: '#fef3c7' }}>
                <p className="text-sm italic" style={{ color: colors.text }}>
                  "I spend 2 hours editing a 60-second reel. I wish I could just talk and have it edit itself." — TikTok Creator
                </p>
              </div>
            </TabsContent>

            {/* Priority Tabs */}
            {Object.entries(priorityConfig).map(([key, config]) => (
              <TabsContent key={key} value={key} className="space-y-4 mt-0">
                <Card className="border-2" style={{ borderColor: config.color.bg }}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <config.icon className="h-5 w-5" style={{ color: config.color.bg }} />
                      <CardTitle style={{ color: config.color.bg }}>{config.label}</CardTitle>
                    </div>
                    <p className="text-sm" style={{ color: colors.textMuted }}>{config.description} • {config.marketDriver}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {(scenarios[key] || []).map((scenario) => (
                        <div 
                          key={scenario.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: config.color.light, color: config.color.bg }}>
                                #{scenario.id}
                              </span>
                              <span className="font-medium text-sm" style={{ color: colors.text }}>{scenario.name}</span>
                              <Badge variant="outline" className="text-xs">{scenario.category}</Badge>
                            </div>
                            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{scenario.description}</p>
                            {scenario.marketData && (
                              <p className="text-xs mt-1 font-medium" style={{ color: config.color.bg }}>📊 {scenario.marketData}</p>
                            )}
                          </div>
                          {getStatusBadge(scenario.status)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
