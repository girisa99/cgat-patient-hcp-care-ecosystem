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
  Shield
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

// Consistent enterprise color palette (matching Full Architecture diagram)
const colors = {
  // Status colors
  completed: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  inProgress: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  planned: { bg: '#6366f1', text: '#ffffff', light: '#e0e7ff' },
  
  // Priority colors
  p0: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  p1: { bg: '#0ea5e9', text: '#ffffff', light: '#e0f2fe' },
  p2: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  p3: { bg: '#8b5cf6', text: '#ffffff', light: '#ede9fe' },
  p4: { bg: '#64748b', text: '#ffffff', light: '#f1f5f9' },
  
  // Neutral
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
  ],
  p1: [
    { id: 11, name: 'Screen + Camera PiP Recording', category: 'Recording', status: 'partial', description: 'Picture-in-picture screen recording' },
    { id: 12, name: 'Multi-track Audio Mixing', category: 'Audio', status: 'implemented', description: 'Layer multiple audio tracks' },
    { id: 13, name: 'Background Music Integration', category: 'Audio', status: 'implemented', description: 'Add background music to recordings' },
    { id: 81, name: 'One-Tap Mobile Record', category: 'Mobile-First', status: 'planned', description: '68% want mobile-first editing' },
    { id: 83, name: 'Quick Templates (Social)', category: 'Mobile-First', status: 'planned', description: 'TikTok, Reels, Shorts presets' },
    { id: 85, name: 'Social Integration', category: 'Mobile-First', status: 'planned', description: 'One-click multi-platform publish' },
    { id: 90, name: 'Quick Clips Generator', category: 'Remix', status: 'planned', description: 'Auto-create shorts (82% creators want this)' },
    { id: 101, name: 'Multi-Clip Timeline', category: 'Remix', status: 'planned', description: 'Drag-drop clip assembly' },
    { id: 107, name: 'Template-Based Assembly', category: 'Remix', status: 'planned', description: 'Pre-built remix templates' },
    { id: 108, name: 'Highlight Reel Generator', category: 'Remix', status: 'planned', description: 'AI identifies best moments' },
  ],
  p2: [
    { id: 21, name: 'Collaborative Script Editing', category: 'Collaboration', status: 'planned', description: 'Real-time multi-user editing' },
    { id: 82, name: 'Offline Recording', category: 'Mobile-First', status: 'planned', description: '54% need offline capability' },
    { id: 84, name: 'Voice-First Editing', category: 'Mobile-First', status: 'planned', description: '47% want voice commands' },
    { id: 89, name: 'Location Story Mode', category: 'Traveler', status: 'planned', description: 'Geo-tagged travel content' },
    { id: 91, name: 'Traveler Kit', category: 'Segment', status: 'planned', description: 'Auto-edit trip footage (76% want this)' },
    { id: 102, name: 'AI Auto-Arrange', category: 'Remix', status: 'planned', description: 'AI sequences clips intelligently' },
    { id: 103, name: 'Smart Transitions', category: 'Remix', status: 'planned', description: 'Context-aware transition effects' },
    { id: 104, name: 'Music Sync Assembly', category: 'Remix', status: 'planned', description: 'Beat-matched clip cutting' },
    { id: 105, name: 'Remix Public Content', category: 'Remix', status: 'planned', description: 'Remix with attribution' },
    { id: 109, name: 'Before/After Split Screen', category: 'Remix', status: 'planned', description: 'Side-by-side comparison' },
  ],
  p3: [
    { id: 32, name: 'Voice Cloning', category: 'TTS', status: 'planned', description: 'Clone custom voices (61% want this)' },
    { id: 35, name: 'Accessibility Compliance', category: 'Compliance', status: 'planned', description: 'Auto-generate captions, transcripts' },
    { id: 36, name: 'HIPAA-Compliant Recordings', category: 'Healthcare', status: 'planned', description: '94% want HIPAA under $100/mo' },
    { id: 86, name: 'Product Demo Mode', category: 'SMB', status: 'planned', description: '71% want quick product templates' },
    { id: 87, name: 'Testimonial Collector', category: 'SMB', status: 'planned', description: 'Customer video testimonials' },
    { id: 88, name: 'Lesson Builder', category: 'Education', status: 'planned', description: '69% want AI lesson scripts' },
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
};

// Market-driven priority configuration
const priorityConfig = {
  p0: { label: 'P0 - Core', icon: Zap, description: 'Essential MVP features', color: colors.p0, marketDriver: 'Foundation' },
  p1: { label: 'P1 - Mobile & Remix', icon: Layers, description: 'Mobile-first + clip assembly', color: colors.p1, marketDriver: '68% want mobile' },
  p2: { label: 'P2 - Advanced', icon: TrendingUp, description: 'Offline + AI features', color: colors.p2, marketDriver: '54% need offline' },
  p3: { label: 'P3 - Segment', icon: Target, description: 'Segment-specific features', color: colors.p3, marketDriver: 'SMB, Edu, Healthcare' },
  p4: { label: 'P4 - Enterprise', icon: Shield, description: 'Enterprise & compliance', color: colors.p4, marketDriver: 'White-label, HIPAA' },
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
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500">
  <rect width="1200" height="500" fill="${colors.background}"/>
  <text x="600" y="30" text-anchor="middle" fill="${colors.text}" font-size="20" font-weight="bold">Genie Mind + Genie Vibe — Scenario Priority Map</text>
  <text x="600" y="52" text-anchor="middle" fill="${colors.textMuted}" font-size="13">60 Total Scenarios | 18 Implemented | 12 Partial | 30 Planned</text>
  
  <!-- Legend -->
  <g transform="translate(50, 70)">
    <rect width="500" height="50" rx="6" fill="${colors.cardBg}" stroke="${colors.border}"/>
    <text x="15" y="22" fill="${colors.text}" font-size="11" font-weight="bold">Status:</text>
    <rect x="60" y="10" width="12" height="12" rx="2" fill="${colors.completed.bg}"/>
    <text x="78" y="20" fill="${colors.textMuted}" font-size="10">Implemented</text>
    <rect x="155" y="10" width="12" height="12" rx="2" fill="${colors.inProgress.bg}"/>
    <text x="173" y="20" fill="${colors.textMuted}" font-size="10">Partial</text>
    <rect x="230" y="10" width="12" height="12" rx="2" fill="${colors.planned.bg}"/>
    <text x="248" y="20" fill="${colors.textMuted}" font-size="10">Planned</text>
    
    <text x="15" y="42" fill="${colors.text}" font-size="11" font-weight="bold">Priority:</text>
    <rect x="70" y="30" width="12" height="12" rx="2" fill="${colors.p0.bg}"/>
    <text x="88" y="40" fill="${colors.textMuted}" font-size="10">P0 Core</text>
    <rect x="145" y="30" width="12" height="12" rx="2" fill="${colors.p1.bg}"/>
    <text x="163" y="40" fill="${colors.textMuted}" font-size="10">P1 Enhanced</text>
    <rect x="245" y="30" width="12" height="12" rx="2" fill="${colors.p2.bg}"/>
    <text x="263" y="40" fill="${colors.textMuted}" font-size="10">P2 Advanced</text>
    <rect x="345" y="30" width="12" height="12" rx="2" fill="${colors.p3.bg}"/>
    <text x="363" y="40" fill="${colors.textMuted}" font-size="10">P3 Differentiator</text>
    <rect x="465" y="30" width="12" height="12" rx="2" fill="${colors.p4.bg}"/>
    <text x="483" y="40" fill="${colors.textMuted}" font-size="10">P4 Future</text>
  </g>
  
  <!-- Priority Columns -->
  ${Object.entries(priorityConfig).map(([key, config], index) => {
    const stats = getStats(key);
    return `
      <g transform="translate(${60 + index * 220}, 140)">
        <rect width="200" height="300" rx="10" fill="${colors.cardBg}" stroke="${colors.border}"/>
        <rect width="200" height="40" rx="10" fill="${config.color.light}" stroke="${config.color.bg}"/>
        <text x="100" y="28" text-anchor="middle" fill="${config.color.bg}" font-size="13" font-weight="bold">${config.label}</text>
        <text x="100" y="70" text-anchor="middle" fill="${colors.textMuted}" font-size="11">${stats.total} scenarios</text>
        <rect x="20" y="85" width="160" height="12" rx="6" fill="${colors.border}"/>
        <rect x="20" y="85" width="${160 * (stats.percent / 100)}" height="12" rx="6" fill="${config.color.bg}"/>
        <text x="100" y="115" text-anchor="middle" fill="${colors.text}" font-size="11">${stats.percent}% Complete</text>
        <text x="100" y="140" text-anchor="middle" fill="${colors.completed.bg}" font-size="10">${stats.implemented} Done</text>
        <text x="100" y="160" text-anchor="middle" fill="${colors.inProgress.bg}" font-size="10">${stats.partial} Partial</text>
        <text x="100" y="180" text-anchor="middle" fill="${colors.planned.bg}" font-size="10">${stats.planned} Planned</text>
      </g>
    `;
  }).join('')}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-muted-foreground" />
              <div>
              <CardTitle className="text-2xl text-foreground">Scenario Priority Map</CardTitle>
                <p className="text-muted-foreground text-sm">110 Scenarios | Mobile-First + Segments + Remix | Market-Driven Priorities</p>
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
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="p0">P0 Core</TabsTrigger>
          <TabsTrigger value="p1">P1 Enhanced</TabsTrigger>
          <TabsTrigger value="p2">P2 Advanced</TabsTrigger>
          <TabsTrigger value="p3">P3 Differentiator</TabsTrigger>
          <TabsTrigger value="p4">P4 Future</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <div ref={diagramRef} className="p-4 bg-white rounded-lg">
            {/* Legend */}
            <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Implementation Status</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.completed.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Implemented</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.inProgress.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Partial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.planned.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Planned</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Priority Levels</h4>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: config.color.bg }} />
                        <span className="text-xs" style={{ color: colors.textMuted }}>{config.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Overview SVG */}
              <Card className="border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                <CardContent className="pt-6">
                  <svg viewBox="0 0 1200 420" className="w-full h-auto">
                    <rect width="1200" height="420" fill={colors.background} rx="8" />
                    
                    <text x="600" y="35" textAnchor="middle" fill={colors.text} fontSize="20" fontWeight="600">
                      Genie Mind Scenario Implementation Status
                    </text>
                    <text x="600" y="58" textAnchor="middle" fill={colors.textMuted} fontSize="13">
                      60 Total Scenarios | 18 Implemented | 12 Partial | 30 Planned
                    </text>

                    {/* Priority Columns */}
                    {Object.entries(priorityConfig).map(([key, config], index) => {
                      const stats = getStats(key);
                      const x = 60 + index * 220;
                      
                      return (
                        <g key={key} transform={`translate(${x}, 85)`}>
                          <rect width="200" height="290" rx="10" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                          <rect width="200" height="45" rx="10" fill={config.color.light} stroke={config.color.bg} strokeWidth="1" />
                          
                          <text x="100" y="30" textAnchor="middle" fill={config.color.bg} fontSize="13" fontWeight="600">
                            {config.label}
                          </text>
                          
                          {/* Stats */}
                          <text x="100" y="70" textAnchor="middle" fill={colors.textMuted} fontSize="11">
                            {stats.total} scenarios
                          </text>
                          
                          {/* Progress bar */}
                          <rect x="20" y="82" width="160" height="10" rx="5" fill={colors.border} />
                          <rect x="20" y="82" width={160 * (stats.percent / 100)} height="10" rx="5" fill={config.color.bg} />
                          <text x="100" y="108" textAnchor="middle" fill={colors.text} fontSize="11">
                            {stats.percent}% Complete
                          </text>
                          
                          {/* Status breakdown */}
                          <g transform="translate(20, 125)">
                            <rect width="50" height="22" rx="4" fill={colors.completed.light} stroke={colors.completed.bg} strokeWidth="1" />
                            <text x="25" y="15" textAnchor="middle" fill={colors.completed.bg} fontSize="10">{stats.implemented}</text>
                            <text x="65" y="15" fill={colors.completed.bg} fontSize="9">Done</text>
                            
                            <rect y="30" width="50" height="22" rx="4" fill={colors.inProgress.light} stroke={colors.inProgress.bg} strokeWidth="1" />
                            <text x="25" y="45" textAnchor="middle" fill={colors.inProgress.bg} fontSize="10">{stats.partial}</text>
                            <text x="65" y="45" fill={colors.inProgress.bg} fontSize="9">Partial</text>
                            
                            <rect y="60" width="50" height="22" rx="4" fill={colors.planned.light} stroke={colors.planned.bg} strokeWidth="1" />
                            <text x="25" y="75" textAnchor="middle" fill={colors.planned.bg} fontSize="10">{stats.planned}</text>
                            <text x="65" y="75" fill={colors.planned.bg} fontSize="9">Planned</text>
                          </g>
                          
                          {/* Category highlights */}
                          <text x="20" y="225" fill={colors.textMuted} fontSize="9" fontWeight="600">Top Categories:</text>
                          {scenarios[key]?.slice(0, 3).map((s, i) => (
                            <text key={s.id} x="20" y={242 + i * 14} fill={colors.text} fontSize="8">
                              • {s.category}
                            </text>
                          ))}
                        </g>
                      );
                    })}
                  </svg>
                </CardContent>
              </Card>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(priorityConfig).map(([key, config]) => {
                  const stats = getStats(key);
                  return (
                    <Card key={key} className="border-2" style={{ borderColor: config.color.bg, backgroundColor: config.color.light }}>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold" style={{ color: config.color.bg }}>{stats.percent}%</div>
                        <div className="text-xs" style={{ color: colors.textMuted }}>{config.label}</div>
                        <div className="mt-2 text-xs" style={{ color: colors.text }}>
                          {stats.implemented} done, {stats.partial} partial
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Priority Detail Tabs */}
            {Object.entries(scenarios).map(([priority, items]) => (
              <TabsContent key={priority} value={priority} className="space-y-4 mt-0">
                <Card className="border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: priorityConfig[priority as keyof typeof priorityConfig].color.bg }}>
                      {React.createElement(priorityConfig[priority as keyof typeof priorityConfig].icon, { className: "h-5 w-5" })}
                      {priorityConfig[priority as keyof typeof priorityConfig].label} Scenarios
                    </CardTitle>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      {priorityConfig[priority as keyof typeof priorityConfig].description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {items.map((scenario) => (
                        <div 
                          key={scenario.id} 
                          className="p-3 rounded-lg border"
                          style={{ 
                            borderColor: colors.border,
                            backgroundColor: scenario.status === 'implemented' ? colors.completed.light : 
                                            scenario.status === 'partial' ? colors.inProgress.light : colors.cardBg
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ 
                                  backgroundColor: priorityConfig[priority as keyof typeof priorityConfig].color.light,
                                  color: priorityConfig[priority as keyof typeof priorityConfig].color.bg
                                }}>
                                  #{scenario.id}
                                </span>
                                <span className="font-medium text-sm" style={{ color: colors.text }}>{scenario.name}</span>
                              </div>
                              <p className="text-xs" style={{ color: colors.textMuted }}>{scenario.description}</p>
                              <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded" style={{ backgroundColor: colors.cardBg, color: colors.textMuted }}>
                                {scenario.category}
                              </span>
                            </div>
                            {getStatusBadge(scenario.status)}
                          </div>
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
