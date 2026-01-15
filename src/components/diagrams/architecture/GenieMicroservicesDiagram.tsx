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

const domainServices = [
  {
    domain: 'AI Intelligence',
    color: 'violet',
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
    color: 'sky',
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
    color: 'emerald',
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
    color: 'orange',
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
    color: 'blue',
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
    color: 'pink',
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

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200 dark:border-violet-800/40', text: 'text-violet-600 dark:text-violet-400' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-200 dark:border-sky-800/40', text: 'text-sky-600 dark:text-sky-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40', text: 'text-emerald-600 dark:text-emerald-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800/40', text: 'text-orange-600 dark:text-orange-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800/40', text: 'text-blue-600 dark:text-blue-400' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-800/40', text: 'text-pink-600 dark:text-pink-400' },
};

export const GenieMicroservicesDiagram: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#ffffff',
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
        return <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">✓</Badge>;
      case 'partial':
        return <Badge className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">◐</Badge>;
      default:
        return <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">○</Badge>;
    }
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-background rounded-xl space-y-6 border border-border">
      {/* Header */}
      <div className="text-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
          <Layers className="h-8 w-8 text-violet-500" />
          Genie Suite Microservices Architecture
        </h2>
        <p className="text-muted-foreground mt-2">Genie-Specific Services • P0-P2 Complete • P3 In Progress</p>
      </div>

      {/* Architecture Stats */}
      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-2 border-violet-200 dark:border-violet-800/40">
        <CardContent className="pt-4">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{domainServices.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Domains</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {domainServices.reduce((acc, d) => acc + d.services.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Services</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sharedServices.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Shared</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {domainServices.reduce((acc, d) => acc + d.services.filter(s => s.status === 'active').length, 0)}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {domainServices.reduce((acc, d) => acc + d.services.filter(s => s.status === 'planned').length, 0)}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Planned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Services Grid */}
      <div className="grid grid-cols-3 gap-4">
        {domainServices.map((domain) => {
          const colors = colorClasses[domain.color];
          return (
            <Card key={domain.domain} className={`${colors.bg} border-2 ${colors.border}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm flex items-center gap-2 ${colors.text}`}>
                  <span className="text-lg">{domain.icon}</span>
                  {domain.domain}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {domain.services.map((service) => (
                    <div key={service.name} className="bg-background rounded p-2 border-2 border-border flex items-center justify-between shadow-sm">
                      <div>
                        <code className={`text-xs font-semibold ${colors.text}`}>{service.name}</code>
                        <p className="text-muted-foreground text-xs">{service.responsibility}</p>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Shared Services */}
      <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Shared Infrastructure Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {sharedServices.map((service) => (
              <div key={service.name} className="bg-background rounded-lg p-3 border-2 border-border text-center shadow-sm">
                <service.icon className="h-6 w-6 mx-auto mb-2 text-cyan-500" />
                <div className="text-foreground text-sm font-semibold">{service.name}</div>
                <p className="text-muted-foreground text-xs mt-1">{service.description}</p>
                <div className="mt-2">{getStatusBadge(service.status)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card className="border-2 border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Request Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
            {dataFlow.map((flow, index) => (
              <React.Fragment key={index}>
                <div className="flex-shrink-0 bg-background rounded-lg p-3 border-2 border-border text-center min-w-[120px] shadow-sm">
                  <div className="text-foreground text-sm font-semibold">{flow.from}</div>
                  <Badge variant="secondary" className="text-xs mt-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                    {flow.protocol}
                  </Badge>
                </div>
                {index < dataFlow.length - 1 && (
                  <div className="text-orange-500 text-lg flex-shrink-0 font-bold">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Principles */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400">Architecture Principles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <div className="bg-background rounded-lg p-3 border-2 border-emerald-200 dark:border-emerald-800/40 shadow-sm">
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Domain Isolation</div>
              <div className="text-xs text-muted-foreground mt-1">Each service owns its data</div>
            </div>
            <div className="bg-background rounded-lg p-3 border-2 border-blue-200 dark:border-blue-800/40 shadow-sm">
              <div className="text-blue-600 dark:text-blue-400 font-semibold">API Contracts</div>
              <div className="text-xs text-muted-foreground mt-1">Clear service boundaries</div>
            </div>
            <div className="bg-background rounded-lg p-3 border-2 border-purple-200 dark:border-purple-800/40 shadow-sm">
              <div className="text-purple-600 dark:text-purple-400 font-semibold">Event-Driven</div>
              <div className="text-xs text-muted-foreground mt-1">Async communication</div>
            </div>
            <div className="bg-background rounded-lg p-3 border-2 border-orange-200 dark:border-orange-800/40 shadow-sm">
              <div className="text-orange-600 dark:text-orange-400 font-semibold">Horizontal Scale</div>
              <div className="text-xs text-muted-foreground mt-1">Edge function isolation</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-foreground font-semibold text-lg">Microservices Architecture</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
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
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-foreground text-lg flex items-center gap-2">
          <Layers className="h-5 w-5 text-violet-500" />
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
