/**
 * Genie Microservices Architecture Diagram
 * 6 Domains • 24 Services • 143+ Edge Functions
 * Updated: 2026-01-25
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Server, Database, Layers, Shield, Workflow, Cpu, Globe, Radio } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const domainServices = [
  { domain: 'AI Intelligence', color: 'violet', icon: '🧠', services: [
    { name: 'ai-universal-processor', responsibility: 'Multi-model orchestration (12 providers)', status: 'active' },
    { name: 'script-generator', responsibility: 'Content generation with 5-zone routing', status: 'active' },
    { name: 'rag-processor', responsibility: 'Knowledge base retrieval', status: 'active' },
    { name: 'regional-router', responsibility: '5-zone LLM routing logic', status: 'active' },
  ]},
  { domain: 'Voice & Audio', color: 'sky', icon: '🎙️', services: [
    { name: 'tts-orchestrator', responsibility: '6 TTS providers (ElevenLabs, Azure, etc)', status: 'active' },
    { name: 'voice-clone-processor', responsibility: 'Voice cloning pipeline', status: 'active' },
    { name: 'audio-processor', responsibility: 'Audio encoding/mixing', status: 'active' },
    { name: 'multi-language-dubbing', responsibility: '120+ language dubbing', status: 'active' },
  ]},
  { domain: 'Media Production', color: 'emerald', icon: '🎬', services: [
    { name: 'video-generator', responsibility: 'AI video generation', status: 'active' },
    { name: 'image-generator', responsibility: 'FLUX/DALL-E/ModelsLab', status: 'active' },
    { name: 'avatar-processor', responsibility: 'Alibaba Wan2.2/OmniAvatar', status: 'active' },
    { name: '3d-mesh-generator', responsibility: 'Meshy AI 3D generation', status: 'partial' },
  ]},
  { domain: 'Document & Export', color: 'orange', icon: '📄', services: [
    { name: 'document-parser', responsibility: 'PDF/DOCX/PPTX parsing', status: 'active' },
    { name: 'comprehensive-export', responsibility: '35+ output formats', status: 'active' },
    { name: 'presentation-generator', responsibility: 'Genie Deck slides', status: 'active' },
    { name: 'translation-service', responsibility: 'DeepL/Qwen-MT translation', status: 'active' },
  ]},
  { domain: 'Collaboration', color: 'blue', icon: '👥', services: [
    { name: 'realtime-sync', responsibility: 'WebSocket coordination', status: 'active' },
    { name: 'approval-workflow', responsibility: '5-stage review pipeline', status: 'active' },
    { name: 'team-management', responsibility: 'RBAC & seat management', status: 'active' },
    { name: 'asset-manager', responsibility: 'Shared asset library', status: 'active' },
  ]},
  { domain: 'Distribution (Genie Cast)', color: 'pink', icon: '📡', services: [
    { name: 'genie-cast-scheduler', responsibility: '14-region content scheduling', status: 'active' },
    { name: 'genie-cast-publisher', responsibility: '6-platform auto-publish', status: 'active' },
    { name: 'social-connectors', responsibility: 'YouTube/TikTok/LinkedIn/IG/X', status: 'partial' },
    { name: 'analytics-collector', responsibility: 'Usage & performance tracking', status: 'active' },
    { name: 'cdn-manager', responsibility: 'Global content delivery', status: 'active' },
  ]},
];

const sharedServices = [
  { name: 'Auth Service', description: 'Supabase Auth + RLS', status: 'active', icon: Shield },
  { name: 'Database Layer', description: 'PostgreSQL + 180 tables', status: 'active', icon: Database },
  { name: 'Storage Service', description: '6 buckets + CDN', status: 'active', icon: Server },
  { name: 'Event Bus', description: 'Realtime pub/sub', status: 'active', icon: Radio },
  { name: 'API Gateway', description: '143+ Edge Functions', status: 'active', icon: Globe },
  { name: 'Job Queue', description: 'Async processing', status: 'active', icon: Workflow },
];

export const GenieMicroservicesDiagram: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, { backgroundColor: '#ffffff', scale: 3, useCORS: true });
      const link = document.createElement('a');
      link.download = 'genie-microservices-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Downloaded!');
    } catch { toast.error('Failed'); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">✓</Badge>;
      case 'partial': return <Badge className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">◐</Badge>;
      default: return <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">○</Badge>;
    }
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    violet: { bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200 dark:border-violet-800/40', text: 'text-violet-600 dark:text-violet-400' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-200 dark:border-sky-800/40', text: 'text-sky-600 dark:text-sky-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40', text: 'text-emerald-600 dark:text-emerald-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800/40', text: 'text-orange-600 dark:text-orange-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800/40', text: 'text-blue-600 dark:text-blue-400' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-800/40', text: 'text-pink-600 dark:text-pink-400' },
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-background rounded-xl space-y-6 border border-border">
      <div className="text-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
          <Layers className="h-8 w-8 text-violet-500" />
          Genie Microservices Architecture (7 Products)
        </h2>
        <p className="text-muted-foreground mt-2">6 Domains • 25 Services • 143+ Edge Functions • 12 Providers • incl. Genie Cast</p>
      </div>

      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-2 border-violet-200 dark:border-violet-800/40">
        <CardContent className="pt-4">
          <div className="grid grid-cols-6 gap-4 text-center">
            <div><div className="text-2xl font-bold text-violet-600">{domainServices.length}</div><div className="text-xs text-muted-foreground">Domains</div></div>
            <div><div className="text-2xl font-bold text-emerald-600">{domainServices.reduce((a, d) => a + d.services.length, 0)}</div><div className="text-xs text-muted-foreground">Services</div></div>
            <div><div className="text-2xl font-bold text-blue-600">{sharedServices.length}</div><div className="text-xs text-muted-foreground">Shared</div></div>
            <div><div className="text-2xl font-bold text-orange-600">143+</div><div className="text-xs text-muted-foreground">Edge Functions</div></div>
            <div><div className="text-2xl font-bold text-pink-600">15</div><div className="text-xs text-muted-foreground">AI Providers</div></div>
            <div><div className="text-2xl font-bold text-cyan-600">95%</div><div className="text-xs text-muted-foreground">Active</div></div>
          </div>
        </CardContent>
      </Card>

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
                    <div key={service.name} className="bg-background rounded p-2 border border-border flex items-center justify-between">
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
              <div key={service.name} className="bg-background rounded-lg p-3 border border-border text-center">
                <service.icon className="h-6 w-6 mx-auto mb-2 text-cyan-500" />
                <div className="text-foreground text-sm font-semibold">{service.name}</div>
                <p className="text-muted-foreground text-xs mt-1">{service.description}</p>
                <div className="mt-2">{getStatusBadge(service.status)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold">Microservices Architecture</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}><Download className="h-4 w-4 mr-2" />Download</Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}><X className="h-4 w-4 mr-2" />Close</Button>
          </div>
        </div>
        <div className="p-8 flex justify-center"><div className="max-w-7xl w-full">{content}</div></div>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-violet-500" />Microservices</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}><Maximize2 className="h-4 w-4" /></Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG}><Download className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default GenieMicroservicesDiagram;
