/**
 * Genie Microservices Architecture Diagram
 * Service-Oriented Architecture with Domain Boundaries
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Server, Database, Layers, Shield, Workflow, Cpu, Globe, Radio } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const colors = {
  active: { bg: '#10b981', text: '#ffffff' },
  partial: { bg: '#f59e0b', text: '#ffffff' },
  planned: { bg: '#6366f1', text: '#ffffff' },
};

const domainServices = [
  {
    domain: 'AI Intelligence',
    color: '#7c3aed',
    icon: '🧠',
    services: [
      { name: 'ai-universal-processor', responsibility: 'Multi-model orchestration', status: 'active' },
      { name: 'script-generator', responsibility: 'Content generation', status: 'active' },
      { name: 'script-enhancer', responsibility: 'AI enhancement', status: 'active' },
      { name: 'model-router', responsibility: 'Load balancing & fallback', status: 'partial' },
    ]
  },
  {
    domain: 'Voice & Audio',
    color: '#0ea5e9',
    icon: '🎙️',
    services: [
      { name: 'tts-orchestrator', responsibility: 'TTS provider routing', status: 'active' },
      { name: 'elevenlabs-adapter', responsibility: 'ElevenLabs integration', status: 'active' },
      { name: 'openai-tts-adapter', responsibility: 'OpenAI TTS integration', status: 'active' },
      { name: 'audio-processor', responsibility: 'Audio encoding/mixing', status: 'partial' },
    ]
  },
  {
    domain: 'Media Production',
    color: '#059669',
    icon: '🎬',
    services: [
      { name: 'media-processor', responsibility: 'Video processing', status: 'partial' },
      { name: 'clip-assembler', responsibility: 'Multi-clip assembly', status: 'planned' },
      { name: 'export-service', responsibility: 'Multi-format export', status: 'active' },
      { name: 'thumbnail-generator', responsibility: 'Auto thumbnails', status: 'planned' },
    ]
  },
  {
    domain: 'Document Processing',
    color: '#f97316',
    icon: '📄',
    services: [
      { name: 'document-parser', responsibility: 'Multi-format parsing', status: 'active' },
      { name: 'ocr-service', responsibility: 'Image text extraction', status: 'active' },
      { name: 'pdf-generator', responsibility: 'PDF creation', status: 'active' },
      { name: 'template-engine', responsibility: 'Document templating', status: 'partial' },
    ]
  },
  {
    domain: 'Collaboration',
    color: '#3b82f6',
    icon: '👥',
    services: [
      { name: 'realtime-sync', responsibility: 'WebSocket coordination', status: 'partial' },
      { name: 'approval-workflow', responsibility: 'Review & approval', status: 'partial' },
      { name: 'notification-service', responsibility: 'Multi-channel alerts', status: 'planned' },
      { name: 'asset-manager', responsibility: 'Shared asset library', status: 'partial' },
    ]
  },
  {
    domain: 'Distribution',
    color: '#ec4899',
    icon: '🚀',
    services: [
      { name: 'publish-orchestrator', responsibility: 'Multi-platform publish', status: 'planned' },
      { name: 'social-connectors', responsibility: 'YouTube/TikTok/etc', status: 'planned' },
      { name: 'analytics-collector', responsibility: 'Performance tracking', status: 'planned' },
      { name: 'cdn-manager', responsibility: 'Content delivery', status: 'partial' },
    ]
  },
];

const sharedServices = [
  { name: 'Auth Service', description: 'Supabase Auth + RLS', status: 'active', icon: Shield },
  { name: 'Database Layer', description: 'PostgreSQL + Realtime', status: 'active', icon: Database },
  { name: 'Storage Service', description: 'Object storage + CDN', status: 'active', icon: Server },
  { name: 'Event Bus', description: 'Realtime pub/sub', status: 'partial', icon: Radio },
  { name: 'API Gateway', description: 'Edge Functions router', status: 'active', icon: Globe },
  { name: 'Job Queue', description: 'Background processing', status: 'planned', icon: Workflow },
];

const dataFlow = [
  { from: 'Client', to: 'API Gateway', protocol: 'HTTPS' },
  { from: 'API Gateway', to: 'Domain Services', protocol: 'Edge Functions' },
  { from: 'Domain Services', to: 'Shared Services', protocol: 'Internal' },
  { from: 'Domain Services', to: 'External APIs', protocol: 'HTTPS' },
  { from: 'Shared Services', to: 'Database', protocol: 'PostgreSQL' },
];

export const GenieMicroservicesDiagram: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = 'genie-microservices-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PNG');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="text-xs" style={{ backgroundColor: colors.active.bg, color: colors.active.text }}>✓</Badge>;
      case 'partial':
        return <Badge className="text-xs" style={{ backgroundColor: colors.partial.bg, color: colors.partial.text }}>◐</Badge>;
      default:
        return <Badge className="text-xs" style={{ backgroundColor: colors.planned.bg, color: colors.planned.text }}>○</Badge>;
    }
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-slate-900 rounded-xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
          <Layers className="h-8 w-8 text-violet-400" />
          Microservices Architecture
        </h2>
        <p className="text-slate-400 mt-2">Domain-Driven Design • Edge Functions • Event-Driven • Scalable</p>
      </div>

      {/* Architecture Stats */}
      <Card className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 border-violet-500/30">
        <CardContent className="pt-4">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-violet-300">{domainServices.length}</div>
              <div className="text-xs text-slate-400">Domains</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-300">
                {domainServices.reduce((acc, d) => acc + d.services.length, 0)}
              </div>
              <div className="text-xs text-slate-400">Services</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-300">{sharedServices.length}</div>
              <div className="text-xs text-slate-400">Shared</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-300">
                {domainServices.reduce((acc, d) => acc + d.services.filter(s => s.status === 'active').length, 0)}
              </div>
              <div className="text-xs text-slate-400">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-300">
                {domainServices.reduce((acc, d) => acc + d.services.filter(s => s.status === 'planned').length, 0)}
              </div>
              <div className="text-xs text-slate-400">Planned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Services Grid */}
      <div className="grid grid-cols-3 gap-4">
        {domainServices.map((domain) => (
          <Card key={domain.domain} className="bg-slate-800/50 border-slate-600" style={{ borderColor: `${domain.color}40` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: domain.color }}>
                <span className="text-lg">{domain.icon}</span>
                {domain.domain}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {domain.services.map((service) => (
                  <div key={service.name} className="bg-slate-700/50 rounded p-2 border border-slate-600 flex items-center justify-between">
                    <div>
                      <code className="text-xs" style={{ color: domain.color }}>{service.name}</code>
                      <p className="text-slate-400 text-xs">{service.responsibility}</p>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shared Services */}
      <Card className="bg-slate-800/50 border-cyan-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Shared Infrastructure Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {sharedServices.map((service) => (
              <div key={service.name} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 text-center">
                <service.icon className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
                <div className="text-white text-sm font-medium">{service.name}</div>
                <p className="text-slate-400 text-xs mt-1">{service.description}</p>
                <div className="mt-2">{getStatusBadge(service.status)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card className="bg-slate-800/50 border-orange-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-300 flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Request Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
            {dataFlow.map((flow, index) => (
              <React.Fragment key={index}>
                <div className="flex-shrink-0 bg-slate-700/50 rounded-lg p-3 border border-slate-600 text-center min-w-[120px]">
                  <div className="text-white text-sm font-medium">{flow.from}</div>
                  <Badge variant="outline" className="text-xs text-orange-300 border-orange-500/30 mt-1">
                    {flow.protocol}
                  </Badge>
                </div>
                {index < dataFlow.length - 1 && (
                  <div className="text-orange-400 text-lg flex-shrink-0">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Principles */}
      <Card className="bg-slate-800/50 border-emerald-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-300">Architecture Principles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <div className="bg-slate-700/50 rounded-lg p-3 border border-emerald-500/30">
              <div className="text-emerald-300 font-medium">Domain Isolation</div>
              <div className="text-xs text-slate-400 mt-1">Each service owns its data</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 border border-blue-500/30">
              <div className="text-blue-300 font-medium">API Contracts</div>
              <div className="text-xs text-slate-400 mt-1">Clear service boundaries</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 border border-purple-500/30">
              <div className="text-purple-300 font-medium">Event-Driven</div>
              <div className="text-xs text-slate-400 mt-1">Async communication</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 border border-orange-500/30">
              <div className="text-orange-300 font-medium">Horizontal Scale</div>
              <div className="text-xs text-slate-400 mt-1">Edge function isolation</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-auto">
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Microservices Architecture</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
        <div className="p-8 flex justify-center">
          <div className="max-w-7xl w-full">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Layers className="h-5 w-5 text-violet-400" />
          Microservices Architecture
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)} className="gap-2">
            <Maximize2 className="h-4 w-4" />
            Full Size
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG} className="gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default GenieMicroservicesDiagram;
