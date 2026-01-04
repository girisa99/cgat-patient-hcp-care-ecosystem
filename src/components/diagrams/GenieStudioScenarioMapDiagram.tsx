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

// Color legend for consistent enterprise styling
const colorLegend = {
  background: '#1e293b',
  cardBg: '#0f172a',
  headerBg: '#1e3a5f',
  borderDefault: '#475569',
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  done: '#22c55e',
  partial: '#f59e0b',
  planned: '#475569',
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
    { id: 9, name: 'Voice Selection', category: 'TTS', status: 'implemented', description: 'Choose from available TTS voices' },
    { id: 10, name: 'Script Preview', category: 'Review', status: 'implemented', description: 'Preview script with TTS before recording' },
  ],
  p1: [
    { id: 11, name: 'Screen + Camera PiP Recording', category: 'Recording', status: 'partial', description: 'Picture-in-picture screen recording' },
    { id: 12, name: 'Multi-track Audio Mixing', category: 'Audio', status: 'implemented', description: 'Layer multiple audio tracks' },
    { id: 13, name: 'Background Music Integration', category: 'Audio', status: 'implemented', description: 'Add background music to recordings' },
    { id: 14, name: 'Audio Ducking', category: 'Audio', status: 'partial', description: 'Auto-lower music during speech' },
    { id: 15, name: 'Teleprompter Speed Control', category: 'Recording', status: 'implemented', description: 'Adjustable scroll speed' },
    { id: 16, name: 'Recording Countdown', category: 'Recording', status: 'implemented', description: 'Countdown before recording starts' },
    { id: 17, name: 'Pause/Resume Recording', category: 'Recording', status: 'implemented', description: 'Pause and continue recording' },
    { id: 18, name: 'Knowledge Base RAG', category: 'AI', status: 'partial', description: 'Generate scripts from knowledge base' },
    { id: 19, name: 'Multi-format Export', category: 'Export', status: 'partial', description: 'Export in MP4, WebM, MP3 formats' },
    { id: 20, name: 'Project Templates', category: 'Templates', status: 'partial', description: 'Start from pre-built templates' },
  ],
  p2: [
    { id: 21, name: 'Collaborative Script Editing', category: 'Collaboration', status: 'planned', description: 'Real-time multi-user editing' },
    { id: 22, name: 'Script Version History', category: 'Versioning', status: 'planned', description: 'Track and revert script changes' },
    { id: 23, name: 'Recording Analytics', category: 'Analytics', status: 'partial', description: 'Track recording metrics and quality' },
    { id: 24, name: 'Batch TTS Generation', category: 'Automation', status: 'planned', description: 'Generate multiple TTS tracks at once' },
    { id: 25, name: 'Video Timeline Editor', category: 'Editing', status: 'planned', description: 'Non-linear video editing interface' },
    { id: 26, name: 'Segment Re-recording', category: 'Editing', status: 'planned', description: 'Re-record specific segments only' },
    { id: 27, name: 'Quality Review Workflow', category: 'Review', status: 'planned', description: 'Formal review and approval process' },
    { id: 28, name: 'Performance Dashboard', category: 'Analytics', status: 'partial', description: 'View content performance metrics' },
    { id: 29, name: 'API/Webhook Integration', category: 'Integration', status: 'planned', description: 'External system integration' },
    { id: 30, name: 'Custom Voice Profiles', category: 'TTS', status: 'planned', description: 'Save and reuse TTS configurations' },
  ],
  p3: [
    { id: 31, name: 'Multi-language Script Translation', category: 'Localization', status: 'planned', description: 'Translate scripts to multiple languages' },
    { id: 32, name: 'Voice Cloning', category: 'TTS', status: 'planned', description: 'Clone custom voices for TTS' },
    { id: 33, name: 'Branching Video Scenarios', category: 'Advanced', status: 'planned', description: 'Interactive branching videos' },
    { id: 34, name: 'A/B Testing Scripts', category: 'Optimization', status: 'planned', description: 'Test different script versions' },
    { id: 35, name: 'Accessibility Compliance', category: 'Compliance', status: 'planned', description: 'Auto-generate captions, transcripts' },
    { id: 36, name: 'HIPAA-Compliant Recordings', category: 'Compliance', status: 'planned', description: 'Healthcare-compliant video storage' },
    { id: 37, name: 'Legal Review Gate', category: 'Compliance', status: 'planned', description: 'Legal approval workflow' },
    { id: 38, name: 'Regulatory Audit Trail', category: 'Compliance', status: 'planned', description: 'Complete audit logging' },
    { id: 39, name: 'YouTube Direct Upload', category: 'Distribution', status: 'planned', description: 'Publish directly to YouTube' },
    { id: 40, name: 'LMS Integration', category: 'Distribution', status: 'planned', description: 'Integrate with learning systems' },
  ],
  p4: [
    { id: 41, name: 'AI Avatar Presenter', category: 'AI Advanced', status: 'planned', description: 'AI-generated video presenter' },
    { id: 42, name: 'Real-time Translation Dubbing', category: 'Localization', status: 'planned', description: 'Live translation with lip-sync' },
    { id: 43, name: 'Sentiment Analysis Review', category: 'AI', status: 'planned', description: 'Analyze script emotional tone' },
    { id: 44, name: 'Auto-generated B-roll', category: 'AI', status: 'planned', description: 'AI suggests relevant imagery' },
    { id: 45, name: 'Interactive Video Elements', category: 'Advanced', status: 'planned', description: 'Quizzes, CTAs in video' },
    { id: 46, name: 'Mobile Recording App', category: 'Platform', status: 'planned', description: 'Record from mobile devices' },
    { id: 47, name: 'Offline Mode', category: 'Platform', status: 'planned', description: 'Work without internet' },
    { id: 48, name: 'White-label Solution', category: 'Enterprise', status: 'planned', description: 'Custom branded solution' },
    { id: 49, name: 'Multi-tenant Workspaces', category: 'Enterprise', status: 'planned', description: 'Organization isolation' },
    { id: 50, name: 'Advanced Analytics AI', category: 'Analytics', status: 'planned', description: 'AI-powered insights' },
  ],
};

const priorityConfig = {
  p0: { label: 'P0 - Core', icon: Zap, description: 'Essential MVP features', color: '#22c55e' },
  p1: { label: 'P1 - Enhanced', icon: Layers, description: 'Important enhancements', color: '#3b82f6' },
  p2: { label: 'P2 - Advanced', icon: TrendingUp, description: 'Advanced capabilities', color: '#f59e0b' },
  p3: { label: 'P3 - Differentiator', icon: Target, description: 'Competitive features', color: '#7c3aed' },
  p4: { label: 'P4 - Future', icon: Shield, description: 'Future roadmap', color: '#94a3b8' },
};

export const GenieStudioScenarioMapDiagram = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const diagramRef = useRef<HTMLDivElement>(null);

  const openDocs = () => {
    window.open('/docs/GENIE_STUDIO_SCENARIO_MAP.md', '_blank');
  };

  const handleDownload = async () => {
    if (!diagramRef.current) return;
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: colorLegend.background,
        scale: 2
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `genie-studio-scenario-map-${activeTab}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Diagram downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download diagram');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge variant="outline" className="border-[#22c55e] text-[#86efac] text-xs">✓ Done</Badge>;
      case 'partial':
        return <Badge variant="outline" className="border-[#f59e0b] text-[#fcd34d] text-xs">◐ Partial</Badge>;
      default:
        return <Badge variant="outline" className="border-[#475569] text-[#94a3b8] text-xs">○ Planned</Badge>;
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
      <Card className="bg-[#1e293b] border-[#475569]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-[#94a3b8]" />
              <div>
                <CardTitle className="text-2xl text-[#f1f5f9]">Scenario Priority Map</CardTitle>
                <p className="text-[#94a3b8] text-sm">60 Scenarios across P0-P4 priorities</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 border-[#475569] text-[#cbd5e1] hover:bg-[#334155] hover:text-[#f1f5f9]">
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button variant="outline" size="sm" onClick={openDocs} className="gap-2 border-[#475569] text-[#cbd5e1] hover:bg-[#334155] hover:text-[#f1f5f9]">
                <FileText className="h-4 w-4" />
                Documentation
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full bg-[#0f172a] border border-[#475569]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">Overview</TabsTrigger>
          <TabsTrigger value="p0" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">P0 Core</TabsTrigger>
          <TabsTrigger value="p1" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">P1 Enhanced</TabsTrigger>
          <TabsTrigger value="p2" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">P2 Advanced</TabsTrigger>
          <TabsTrigger value="p3" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">P3 Differentiator</TabsTrigger>
          <TabsTrigger value="p4" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">P4 Future</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <div ref={diagramRef}>
            <TabsContent value="overview" className="space-y-4">
              {/* Overview SVG */}
              <Card className="bg-[#1e293b] border-[#475569]">
                <CardContent className="pt-6">
                  <svg viewBox="0 0 1200 450" className="w-full h-auto">
                    <defs>
                      <filter id="scenarioShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    
                    <rect width="1200" height="450" fill="#1e293b" rx="8" />
                    
                    <text x="600" y="40" textAnchor="middle" fill="#f1f5f9" fontSize="22" fontWeight="600">
                      Genie Studio Scenario Implementation Status
                    </text>
                    <text x="600" y="65" textAnchor="middle" fill="#94a3b8" fontSize="14">
                      60 Total Scenarios | 18 Implemented | 12 Partial | 30 Planned
                    </text>

                    {/* Priority Columns */}
                    {Object.entries(priorityConfig).map(([key, config], index) => {
                      const stats = getStats(key);
                      const x = 60 + index * 220;
                      
                      return (
                        <g key={key} transform={`translate(${x}, 100)`}>
                          <rect width="200" height="300" rx="12" fill="#0f172a" stroke="#475569" strokeWidth="1" filter="url(#scenarioShadow)" />
                          <rect width="200" height="50" rx="12" fill={config.color} fillOpacity="0.2" stroke={config.color} strokeWidth="1" />
                          
                          <text x="100" y="32" textAnchor="middle" fill="#f1f5f9" fontSize="13" fontWeight="600">
                            {config.label}
                          </text>
                          
                          {/* Stats */}
                          <text x="100" y="80" textAnchor="middle" fill="#94a3b8" fontSize="12">
                            {stats.total} scenarios
                          </text>
                          
                          {/* Progress bar */}
                          <rect x="20" y="95" width="160" height="12" rx="6" fill="#1e293b" />
                          <rect x="20" y="95" width={160 * (stats.percent / 100)} height="12" rx="6" fill={config.color} />
                          <text x="100" y="123" textAnchor="middle" fill="#cbd5e1" fontSize="11">
                            {stats.percent}% Complete
                          </text>
                          
                          {/* Status breakdown */}
                          <g transform="translate(20, 140)">
                            <rect width="50" height="20" rx="4" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="1" />
                            <text x="25" y="14" textAnchor="middle" fill="#86efac" fontSize="10">{stats.implemented}</text>
                            <text x="70" y="14" fill="#86efac" fontSize="9">Done</text>
                            
                            <rect y="30" width="50" height="20" rx="4" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="1" />
                            <text x="25" y="44" textAnchor="middle" fill="#fcd34d" fontSize="10">{stats.partial}</text>
                            <text x="70" y="44" fill="#fcd34d" fontSize="9">Partial</text>
                            
                            <rect y="60" width="50" height="20" rx="4" fill="#475569" fillOpacity="0.2" stroke="#475569" strokeWidth="1" />
                            <text x="25" y="74" textAnchor="middle" fill="#94a3b8" fontSize="10">{stats.planned}</text>
                            <text x="70" y="74" fill="#94a3b8" fontSize="9">Planned</text>
                          </g>
                          
                          {/* Category highlights */}
                          <text x="20" y="240" fill="#94a3b8" fontSize="9" fontWeight="600">Top Categories:</text>
                          {scenarios[key]?.slice(0, 3).map((s, i) => (
                            <text key={s.id} x="20" y={258 + i * 14} fill="#cbd5e1" fontSize="8">
                              • {s.category}
                            </text>
                          ))}
                        </g>
                      );
                    })}

                    {/* Legend */}
                    <g transform="translate(60, 420)">
                      <text x="0" y="0" fill="#94a3b8" fontSize="10">Status Legend:</text>
                      <rect x="90" y="-10" width="12" height="12" rx="2" fill="#22c55e" />
                      <text x="108" y="0" fill="#86efac" fontSize="10">Implemented</text>
                      <rect x="190" y="-10" width="12" height="12" rx="2" fill="#f59e0b" />
                      <text x="208" y="0" fill="#fcd34d" fontSize="10">Partial</text>
                      <rect x="270" y="-10" width="12" height="12" rx="2" fill="#475569" />
                      <text x="288" y="0" fill="#94a3b8" fontSize="10">Planned</text>
                    </g>
                  </svg>
                </CardContent>
              </Card>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(priorityConfig).map(([key, config]) => {
                  const stats = getStats(key);
                  const IconComponent = config.icon;
                  return (
                    <Card key={key} className="bg-[#1e293b] border-[#475569]" style={{ borderColor: config.color }}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="h-4 w-4" style={{ color: config.color }} />
                          <span className="text-sm font-medium text-[#cbd5e1]">{config.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-[#f1f5f9]">{stats.percent}%</div>
                        <p className="text-xs text-[#94a3b8]">{stats.implemented}/{stats.total} complete</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Priority-specific tabs */}
            {Object.entries(scenarios).map(([priority, items]) => (
              <TabsContent key={priority} value={priority} className="space-y-4">
                <Card className="bg-[#1e293b] border-[#475569]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-[#f1f5f9]">
                        {React.createElement(priorityConfig[priority as keyof typeof priorityConfig].icon, {
                          className: 'h-5 w-5',
                          style: { color: priorityConfig[priority as keyof typeof priorityConfig].color }
                        })}
                        {priorityConfig[priority as keyof typeof priorityConfig].label} Scenarios
                      </CardTitle>
                      <Badge variant="outline" style={{ 
                        borderColor: priorityConfig[priority as keyof typeof priorityConfig].color,
                        color: priorityConfig[priority as keyof typeof priorityConfig].color
                      }}>
                        {getStats(priority).percent}% Complete
                      </Badge>
                    </div>
                    <p className="text-[#94a3b8] text-sm">
                      {priorityConfig[priority as keyof typeof priorityConfig].description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {items.map((scenario) => (
                        <div key={scenario.id} className="p-4 bg-[#0f172a] rounded-lg border border-[#475569]">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[#94a3b8] text-xs font-mono">#{scenario.id}</span>
                              <span className="text-[#f1f5f9] font-medium text-sm">{scenario.name}</span>
                            </div>
                            {getStatusBadge(scenario.status)}
                          </div>
                          <p className="text-[#94a3b8] text-xs">{scenario.description}</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="border-[#475569] text-[#cbd5e1] text-xs">
                              {scenario.category}
                            </Badge>
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

export default GenieStudioScenarioMapDiagram;
