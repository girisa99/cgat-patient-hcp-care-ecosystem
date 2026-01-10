import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, CheckCircle2, Clock, Calendar, Layers, FileImage, FileCode, Smartphone, Users, Package, Globe, Shield } from 'lucide-react';
import { toast } from 'sonner';

// Enterprise color palette - consistent across all diagrams
const colors = {
  // Status colors
  completed: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  inProgress: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  planned: { bg: '#6366f1', text: '#ffffff', light: '#e0e7ff' },
  
  // Layer colors
  presentation: { bg: '#0ea5e9', text: '#ffffff', light: '#e0f2fe' },
  application: { bg: '#8b5cf6', text: '#ffffff', light: '#ede9fe' },
  domain: { bg: '#ec4899', text: '#ffffff', light: '#fce7f3' },
  infrastructure: { bg: '#64748b', text: '#ffffff', light: '#f1f5f9' },
  
  // Segment colors
  creator: { bg: '#8b5cf6', text: '#ffffff', light: '#ede9fe' },
  traveler: { bg: '#0ea5e9', text: '#ffffff', light: '#e0f2fe' },
  smb: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  education: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  healthcare: { bg: '#ec4899', text: '#ffffff', light: '#fce7f3' },
  enterprise: { bg: '#64748b', text: '#ffffff', light: '#f1f5f9' },
  
  // Neutral
  border: '#e2e8f0',
  background: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
};

interface PhaseData {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'planned';
  completion: number;
  marketDriver: string;
  features: {
    name: string;
    status: 'completed' | 'in-progress' | 'planned';
    layer: 'presentation' | 'application' | 'domain' | 'infrastructure';
  }[];
}

const phases: PhaseData[] = [
  {
    id: 'P0',
    name: 'Foundation',
    status: 'completed',
    completion: 100,
    marketDriver: 'Core MVP',
    features: [
      { name: 'Script Repository UI', status: 'completed', layer: 'presentation' },
      { name: 'Template CRUD Service', status: 'completed', layer: 'application' },
      { name: 'Script Domain Model', status: 'completed', layer: 'domain' },
      { name: 'Supabase Storage', status: 'completed', layer: 'infrastructure' },
    ]
  },
  {
    id: 'P1',
    name: 'Recording Core',
    status: 'completed',
    completion: 100,
    marketDriver: 'Basic Recording',
    features: [
      { name: 'Genie Vibe UI', status: 'completed', layer: 'presentation' },
      { name: 'Multi-Track Recorder', status: 'completed', layer: 'application' },
      { name: 'Audio Processing', status: 'completed', layer: 'domain' },
      { name: 'WebRTC/MediaRecorder', status: 'completed', layer: 'infrastructure' },
    ]
  },
  {
    id: 'P2',
    name: 'AI + Vibe↔Mind',
    status: 'completed',
    completion: 100,
    marketDriver: 'Bidirectional AI',
    features: [
      { name: 'ContentAnalyzer', status: 'completed', layer: 'presentation' },
      { name: 'Script Generation', status: 'completed', layer: 'application' },
      { name: 'NLP Processing', status: 'completed', layer: 'domain' },
      { name: 'OpenAI/Claude APIs', status: 'completed', layer: 'infrastructure' },
    ]
  },
  {
    id: 'P3',
    name: 'Mobile-First',
    status: 'planned',
    completion: 0,
    marketDriver: '68% want mobile',
    features: [
      { name: 'One-Tap Record', status: 'planned', layer: 'presentation' },
      { name: 'Offline Mode', status: 'planned', layer: 'application' },
      { name: 'Voice Commands', status: 'planned', layer: 'domain' },
      { name: 'PWA/Native', status: 'planned', layer: 'infrastructure' },
    ]
  },
  {
    id: 'P4',
    name: 'Segment-Specific',
    status: 'planned',
    completion: 0,
    marketDriver: 'SMB/Edu/Healthcare',
    features: [
      { name: 'Product Demo Mode', status: 'planned', layer: 'presentation' },
      { name: 'Lesson Builder', status: 'planned', layer: 'application' },
      { name: 'Patient Education', status: 'planned', layer: 'domain' },
      { name: 'HIPAA Compliance', status: 'planned', layer: 'infrastructure' },
    ]
  },
  {
    id: 'P5',
    name: 'Enterprise',
    status: 'planned',
    completion: 0,
    marketDriver: 'White-label',
    features: [
      { name: 'White-label UI', status: 'planned', layer: 'presentation' },
      { name: 'Multi-tenant', status: 'planned', layer: 'application' },
      { name: 'Approval Workflows', status: 'planned', layer: 'domain' },
      { name: 'SSO/SAML', status: 'planned', layer: 'infrastructure' },
    ]
  },
];

const layers = [
  { id: 'presentation', name: 'Presentation Layer', description: 'UI Components & UX' },
  { id: 'application', name: 'Application Layer', description: 'Services & Logic' },
  { id: 'domain', name: 'Domain Layer', description: 'Core Models & Rules' },
  { id: 'infrastructure', name: 'Infrastructure Layer', description: 'External Services' },
];

const segments = [
  { id: 'creator', name: 'Creator', icon: Users, competitors: 'CapCut, Canva', gap: 'No unified script→TTS→record' },
  { id: 'traveler', name: 'Traveler', icon: Globe, competitors: 'GoPro Quik, Adobe Rush', gap: 'No offline + AI narration' },
  { id: 'smb', name: 'SMB', icon: Package, competitors: 'Loom, Synthesia', gap: 'Synthesia $67/mo too expensive' },
  { id: 'education', name: 'Education', icon: Users, competitors: 'Screencastify, Camtasia', gap: 'No AI lesson scripts' },
  { id: 'healthcare', name: 'Healthcare', icon: Shield, competitors: 'VIDIZMO, Gumlet', gap: 'No affordable HIPAA' },
  { id: 'enterprise', name: 'Enterprise', icon: Layers, competitors: 'Synthesia, HeyGen', gap: 'No integrated workflows' },
];

export const GenieStudioFullArchitectureDiagram: React.FC = () => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = 'genie-studio-full-architecture.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('PNG downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download PNG');
    }
  };

  const handleDownloadSVG = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
  <rect width="1400" height="900" fill="#ffffff"/>
  <text x="700" y="35" text-anchor="middle" fill="${colors.text}" font-size="24" font-weight="bold">Genie Mind + Genie Vibe — Complete Architecture (110 Scenarios)</text>
  <text x="700" y="58" text-anchor="middle" fill="${colors.textMuted}" font-size="12">"From Mind to Media" | 6 Market Segments | 8 Implemented, 6 Partial, 96 Planned</text>
  
  <!-- Legend -->
  <g transform="translate(50, 70)">
    <rect width="600" height="60" rx="8" fill="#f8fafc" stroke="${colors.border}"/>
    <text x="20" y="25" fill="${colors.text}" font-size="12" font-weight="bold">Status:</text>
    <rect x="80" y="12" width="16" height="16" rx="2" fill="${colors.completed.bg}"/>
    <text x="102" y="25" fill="${colors.textMuted}" font-size="11">Completed</text>
    <rect x="170" y="12" width="16" height="16" rx="2" fill="${colors.inProgress.bg}"/>
    <text x="192" y="25" fill="${colors.textMuted}" font-size="11">In Progress</text>
    <rect x="270" y="12" width="16" height="16" rx="2" fill="${colors.planned.bg}"/>
    <text x="292" y="25" fill="${colors.textMuted}" font-size="11">Planned</text>
    
    <text x="20" y="48" fill="${colors.text}" font-size="12" font-weight="bold">Segments:</text>
    <rect x="100" y="35" width="12" height="12" rx="2" fill="${colors.creator.bg}"/>
    <text x="118" y="46" fill="${colors.textMuted}" font-size="10">Creator</text>
    <rect x="175" y="35" width="12" height="12" rx="2" fill="${colors.smb.bg}"/>
    <text x="193" y="46" fill="${colors.textMuted}" font-size="10">SMB</text>
    <rect x="225" y="35" width="12" height="12" rx="2" fill="${colors.education.bg}"/>
    <text x="243" y="46" fill="${colors.textMuted}" font-size="10">Education</text>
    <rect x="310" y="35" width="12" height="12" rx="2" fill="${colors.healthcare.bg}"/>
    <text x="328" y="46" fill="${colors.textMuted}" font-size="10">Healthcare</text>
    <rect x="400" y="35" width="12" height="12" rx="2" fill="${colors.enterprise.bg}"/>
    <text x="418" y="46" fill="${colors.textMuted}" font-size="10">Enterprise</text>
  </g>
</svg>`;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'genie-studio-full-architecture.svg';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded successfully');
  };

  const getStatusColor = (status: 'completed' | 'in-progress' | 'planned') => {
    switch (status) {
      case 'completed': return colors.completed;
      case 'in-progress': return colors.inProgress;
      case 'planned': return colors.planned;
    }
  };

  const getLayerColor = (layer: 'presentation' | 'application' | 'domain' | 'infrastructure') => {
    return colors[layer];
  };

  const getStatusIcon = (status: 'completed' | 'in-progress' | 'planned') => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'planned': return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full border border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Genie Mind + Genie Vibe — Complete Architecture (110 Scenarios)
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            6 Market Segments • 6 Phases • Competitive Gaps Addressed
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/docs/GENIE_PHASE_IMPLEMENTATION_ROADMAP.md', '_blank')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            Roadmap
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSVG}
            className="flex items-center gap-1"
          >
            <FileCode className="h-4 w-4" />
            SVG
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadPNG}
            className="flex items-center gap-1"
          >
            <FileImage className="h-4 w-4" />
            PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={diagramRef} className="p-6 bg-white rounded-lg space-y-6">
          {/* Legend Section */}
          <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: '#f8fafc' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Legend */}
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Implementation Status</h4>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.completed.bg }} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.inProgress.bg }} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.planned.bg }} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>Planned</span>
                  </div>
                </div>
              </div>
              
              {/* Layer Legend */}
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Architecture Layers</h4>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.presentation.bg }} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>Presentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.application.bg }} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>Application</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.domain.bg }} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>Domain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.infrastructure.bg }} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>Infrastructure</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Scenario Stats</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.completed.light, color: colors.completed.bg }}>8 Implemented</span>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.inProgress.light, color: colors.inProgress.bg }}>6 Partial</span>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.planned.light, color: colors.planned.bg }}>96 Planned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Segments */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>Target Market Segments & Competitive Gaps</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {segments.map((segment) => {
                const Icon = segment.icon;
                const segmentColor = colors[segment.id as keyof typeof colors] as typeof colors.creator;
                return (
                  <div 
                    key={segment.id}
                    className="p-3 rounded-lg border-2"
                    style={{ 
                      backgroundColor: segmentColor.light,
                      borderColor: segmentColor.bg 
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4" style={{ color: segmentColor.bg }} />
                      <span className="font-semibold text-sm" style={{ color: segmentColor.bg }}>{segment.name}</span>
                    </div>
                    <p className="text-xs mb-1" style={{ color: colors.textMuted }}>vs {segment.competitors}</p>
                    <p className="text-xs font-medium" style={{ color: colors.text }}>Gap: {segment.gap}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase Timeline */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>Implementation Roadmap (6 Phases)</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {phases.map((phase, index) => (
                <React.Fragment key={phase.id}>
                  <div 
                    className="flex-shrink-0 px-4 py-2 rounded-lg text-center min-w-[120px]"
                    style={{ 
                      backgroundColor: getStatusColor(phase.status).light,
                      borderLeft: `4px solid ${getStatusColor(phase.status).bg}`
                    }}
                  >
                    <div className="text-sm font-bold" style={{ color: getStatusColor(phase.status).bg }}>
                      {phase.id}: {phase.name}
                    </div>
                    <div className="text-xs" style={{ color: colors.text }}>{phase.completion}%</div>
                    <div className="text-xs mt-1" style={{ color: colors.textMuted }}>{phase.marketDriver}</div>
                  </div>
                  {index < phases.length - 1 && (
                    <div className="flex-shrink-0 w-8 h-0.5" style={{ backgroundColor: colors.border }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Architecture Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th 
                    className="p-3 text-left text-sm font-semibold border"
                    style={{ borderColor: colors.border, backgroundColor: '#f8fafc', color: colors.text }}
                  >
                    Layer
                  </th>
                  {phases.map((phase) => (
                    <th 
                      key={phase.id}
                      className="p-2 text-center text-sm font-semibold border"
                      style={{ 
                        borderColor: colors.border, 
                        backgroundColor: getStatusColor(phase.status).light,
                        color: colors.text
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {getStatusIcon(phase.status)}
                        <span>{phase.id}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {layers.map((layer) => (
                  <tr key={layer.id}>
                    <td 
                      className="p-3 border"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: getLayerColor(layer.id as any).light,
                      }}
                    >
                      <div className="font-medium text-sm" style={{ color: getLayerColor(layer.id as any).bg }}>
                        {layer.name}
                      </div>
                      <div className="text-xs" style={{ color: colors.textMuted }}>
                        {layer.description}
                      </div>
                    </td>
                    {phases.map((phase) => {
                      const feature = phase.features.find(f => f.layer === layer.id);
                      if (!feature) return <td key={phase.id} className="p-2 border" style={{ borderColor: colors.border }} />;
                      
                      return (
                        <td 
                          key={phase.id}
                          className="p-2 border text-center"
                          style={{ borderColor: colors.border }}
                        >
                          <div 
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: getStatusColor(feature.status).light,
                              color: getStatusColor(feature.status).bg,
                            }}
                          >
                            {feature.name}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bidirectional Flow */}
          <div className="p-4 rounded-lg border-2" style={{ borderColor: colors.completed.bg, backgroundColor: colors.completed.light }}>
            <h4 className="font-semibold mb-2" style={{ color: colors.completed.bg }}>✅ Bidirectional Vibe ↔ Mind Flow (Implemented)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium" style={{ color: colors.text }}>Flow 1 (Default):</p>
                <p style={{ color: colors.textMuted }}>Mind → Script → TTS → Vibe → Publish</p>
              </div>
              <div>
                <p className="font-medium" style={{ color: colors.text }}>Flow 2 (NEW):</p>
                <p style={{ color: colors.textMuted }}>Vibe → ContentAnalyzer → Mind → Script → TTS → Vibe → Publish</p>
              </div>
            </div>
          </div>

          {/* User Quote */}
          <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: '#fef3c7' }}>
            <p className="text-sm italic" style={{ color: colors.text }}>
              "I spend 2 hours editing a 60-second reel. I wish I could just talk and have it edit itself." — TikTok Creator
            </p>
            <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
              This is why we're building mobile-first voice commands (Phase 3-4)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
