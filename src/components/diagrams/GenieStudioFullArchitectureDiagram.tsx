import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, CheckCircle2, Clock, Calendar, Layers, FileImage, FileCode } from 'lucide-react';
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
    features: [
      { name: 'Recording Studio UI', status: 'completed', layer: 'presentation' },
      { name: 'Multi-Track Recorder', status: 'completed', layer: 'application' },
      { name: 'Audio Processing', status: 'completed', layer: 'domain' },
      { name: 'WebRTC/MediaRecorder', status: 'completed', layer: 'infrastructure' },
    ]
  },
  {
    id: 'P2',
    name: 'AI Integration',
    status: 'in-progress',
    completion: 60,
    features: [
      { name: 'AI Assistant Panel', status: 'completed', layer: 'presentation' },
      { name: 'Script Generation', status: 'completed', layer: 'application' },
      { name: 'NLP Processing', status: 'in-progress', layer: 'domain' },
      { name: 'OpenAI/Claude APIs', status: 'in-progress', layer: 'infrastructure' },
    ]
  },
  {
    id: 'P3',
    name: 'Collaboration',
    status: 'planned',
    completion: 15,
    features: [
      { name: 'Review Dashboard', status: 'planned', layer: 'presentation' },
      { name: 'Workflow Engine', status: 'in-progress', layer: 'application' },
      { name: 'Approval Domain', status: 'planned', layer: 'domain' },
      { name: 'Real-time Sync', status: 'planned', layer: 'infrastructure' },
    ]
  },
  {
    id: 'P4',
    name: 'Analytics',
    status: 'planned',
    completion: 0,
    features: [
      { name: 'Analytics Dashboard', status: 'planned', layer: 'presentation' },
      { name: 'Metrics Service', status: 'planned', layer: 'application' },
      { name: 'Usage Tracking', status: 'planned', layer: 'domain' },
      { name: 'Data Warehouse', status: 'planned', layer: 'infrastructure' },
    ]
  },
];

const layers = [
  { id: 'presentation', name: 'Presentation Layer', description: 'UI Components & User Experience' },
  { id: 'application', name: 'Application Layer', description: 'Services & Business Logic' },
  { id: 'domain', name: 'Domain Layer', description: 'Core Models & Rules' },
  { id: 'infrastructure', name: 'Infrastructure Layer', description: 'External Services & Storage' },
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
    if (!diagramRef.current) return;
    
    // Create SVG from the diagram content
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#ffffff"/>
  <text x="600" y="40" text-anchor="middle" fill="${colors.text}" font-size="24" font-weight="bold">Genie Studio - Complete Architecture &amp; Roadmap</text>
  
  <!-- Legend -->
  <g transform="translate(50, 70)">
    <rect width="500" height="60" rx="8" fill="#f8fafc" stroke="${colors.border}"/>
    <text x="20" y="25" fill="${colors.text}" font-size="12" font-weight="bold">Status:</text>
    <rect x="80" y="12" width="16" height="16" rx="2" fill="${colors.completed.bg}"/>
    <text x="102" y="25" fill="${colors.textMuted}" font-size="11">Completed</text>
    <rect x="170" y="12" width="16" height="16" rx="2" fill="${colors.inProgress.bg}"/>
    <text x="192" y="25" fill="${colors.textMuted}" font-size="11">In Progress</text>
    <rect x="270" y="12" width="16" height="16" rx="2" fill="${colors.planned.bg}"/>
    <text x="292" y="25" fill="${colors.textMuted}" font-size="11">Planned</text>
    
    <text x="20" y="48" fill="${colors.text}" font-size="12" font-weight="bold">Layers:</text>
    <rect x="80" y="35" width="16" height="16" rx="2" fill="${colors.presentation.bg}"/>
    <text x="102" y="48" fill="${colors.textMuted}" font-size="11">Presentation</text>
    <rect x="180" y="35" width="16" height="16" rx="2" fill="${colors.application.bg}"/>
    <text x="202" y="48" fill="${colors.textMuted}" font-size="11">Application</text>
    <rect x="280" y="35" width="16" height="16" rx="2" fill="${colors.domain.bg}"/>
    <text x="302" y="48" fill="${colors.textMuted}" font-size="11">Domain</text>
    <rect x="360" y="35" width="16" height="16" rx="2" fill="${colors.infrastructure.bg}"/>
    <text x="382" y="48" fill="${colors.textMuted}" font-size="11">Infrastructure</text>
  </g>
  
  <!-- Phases -->
  ${phases.map((phase, i) => `
    <g transform="translate(${50 + i * 220}, 160)">
      <rect width="200" height="280" rx="8" fill="${getStatusColor(phase.status).light}" stroke="${getStatusColor(phase.status).bg}" stroke-width="2"/>
      <text x="100" y="30" text-anchor="middle" fill="${getStatusColor(phase.status).bg}" font-size="16" font-weight="bold">${phase.id}: ${phase.name}</text>
      <text x="100" y="50" text-anchor="middle" fill="${colors.textMuted}" font-size="12">${phase.completion}% Complete</text>
      ${phase.features.map((f, j) => `
        <rect x="10" y="${70 + j * 50}" width="180" height="40" rx="4" fill="${getStatusColor(f.status).light}" stroke="${getStatusColor(f.status).bg}"/>
        <circle cx="25" cy="${90 + j * 50}" r="6" fill="${getLayerColor(f.layer).bg}"/>
        <text x="40" y="${94 + j * 50}" fill="${colors.text}" font-size="10">${f.name}</text>
      `).join('')}
    </g>
  `).join('')}
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
            Genie Studio - Complete Architecture & Roadmap
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Full technical and functional architecture with implementation status
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/docs/GENIE_STUDIO_TECHNICAL_ARCHITECTURE.md', '_blank')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            Technical Docs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/docs/GENIE_STUDIO_FUNCTIONAL_ARCHITECTURE.md', '_blank')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            Functional Docs
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
        <div ref={diagramRef} className="p-6 bg-white rounded-lg">
          {/* Legend Section */}
          <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: '#f8fafc' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Phase Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>Implementation Roadmap</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {phases.map((phase, index) => (
                <React.Fragment key={phase.id}>
                  <div 
                    className="flex-shrink-0 px-4 py-2 rounded-lg text-center min-w-[100px]"
                    style={{ 
                      backgroundColor: getStatusColor(phase.status).light,
                      borderLeft: `4px solid ${getStatusColor(phase.status).bg}`
                    }}
                  >
                    <div className="text-sm font-bold" style={{ color: getStatusColor(phase.status).bg }}>
                      {phase.id}
                    </div>
                    <div className="text-xs" style={{ color: colors.text }}>{phase.name}</div>
                    <div className="text-xs font-medium mt-1" style={{ color: getStatusColor(phase.status).bg }}>
                      {phase.completion}%
                    </div>
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
            <table className="w-full border-collapse" style={{ minWidth: '800px' }}>
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
                      className="p-3 text-center text-sm font-semibold border"
                      style={{ 
                        borderColor: colors.border, 
                        backgroundColor: getStatusColor(phase.status).light,
                        color: colors.text
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(phase.status)}
                        <span>{phase.id}: {phase.name}</span>
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
                      if (!feature) return <td key={phase.id} className="p-3 border" style={{ borderColor: colors.border }} />;
                      
                      return (
                        <td 
                          key={phase.id}
                          className="p-3 border text-center"
                          style={{ borderColor: colors.border }}
                        >
                          <div 
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: getStatusColor(feature.status).light,
                              color: getStatusColor(feature.status).bg,
                              border: `1px solid ${getStatusColor(feature.status).bg}40`
                            }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getLayerColor(feature.layer).bg }}
                            />
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

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.completed.light }}>
              <div className="text-2xl font-bold" style={{ color: colors.completed.bg }}>18</div>
              <div className="text-xs" style={{ color: colors.textMuted }}>Features Completed</div>
            </div>
            <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.inProgress.light }}>
              <div className="text-2xl font-bold" style={{ color: colors.inProgress.bg }}>6</div>
              <div className="text-xs" style={{ color: colors.textMuted }}>In Progress</div>
            </div>
            <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.planned.light }}>
              <div className="text-2xl font-bold" style={{ color: colors.planned.bg }}>36</div>
              <div className="text-xs" style={{ color: colors.textMuted }}>Planned Features</div>
            </div>
            <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: '#f8fafc' }}>
              <div className="text-2xl font-bold" style={{ color: colors.text }}>40%</div>
              <div className="text-xs" style={{ color: colors.textMuted }}>Overall Progress</div>
            </div>
          </div>

          {/* Documentation Links */}
          <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: '#f8fafc' }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Related Documentation</h4>
            <div className="flex flex-wrap gap-2">
              <a 
                href="/docs/GENIE_STUDIO_TECHNICAL_ARCHITECTURE.md" 
                target="_blank"
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: colors.presentation.light, color: colors.presentation.bg }}
              >
                Technical Architecture →
              </a>
              <a 
                href="/docs/GENIE_STUDIO_FUNCTIONAL_ARCHITECTURE.md" 
                target="_blank"
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: colors.application.light, color: colors.application.bg }}
              >
                Functional Architecture →
              </a>
              <a 
                href="/docs/GENIE_STUDIO_SCENARIO_MAP.md" 
                target="_blank"
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: colors.domain.light, color: colors.domain.bg }}
              >
                Scenario Map →
              </a>
              <a 
                href="/docs/GENIE_UNIVERSAL_SERVICE_ARCHITECTURE.md" 
                target="_blank"
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: colors.infrastructure.light, color: colors.infrastructure.bg }}
              >
                Service Architecture →
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
