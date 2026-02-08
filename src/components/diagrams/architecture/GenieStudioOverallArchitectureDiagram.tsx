/**
 * Genie Studio Overall Architecture Diagram
 * Master System Diagram with All Module Relationships
 * Updated: 2026-01-25 - Reflects 12-Provider Ecosystem, 119 Pipelines, 5-Zone Routing
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Layers, Brain, Film, Users, Zap, Presentation, MessageCircle, Database, Cloud, Shield, Server, Key, Plug, Globe, BarChart3 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const modules = [
  { id: 'deck', name: 'Genie Deck', icon: '🎯', color: 'cyan', description: 'AI Presentation Generator', status: 'active', completion: 100 },
  { id: 'mind', name: 'Genie Mind', icon: '🧠', color: 'violet', description: 'AI Intelligence Layer', status: 'active', completion: 92 },
  { id: 'vibe', name: 'Genie Vibe', icon: '🎬', color: 'emerald', description: 'Production Layer', status: 'active', completion: 78 },
  { id: 'spark', name: 'Genie Spark', icon: '⚡', color: 'orange', description: 'Quick-Start Engine', status: 'active', completion: 85 },
  { id: 'arc', name: 'Genie Arc', icon: '🌈', color: 'blue', description: 'Team Collaboration', status: 'partial', completion: 45 },
  { id: 'hub', name: 'Production Hub', icon: '🎥', color: 'purple', description: 'Enterprise Center', status: 'partial', completion: 40 },
  { id: 'cast', name: 'Genie Cast', icon: '📡', color: 'rose', description: 'Marketing Engine', status: 'active', completion: 75 },
];

const coreProviders = [
  { name: 'OpenAI', services: ['GPT-4o', 'TTS', 'Whisper', 'DALL-E'], zone: 'Fallback' },
  { name: 'Claude', services: ['Claude 3.5 Sonnet', 'Vision'], zone: 'Claude Zone (West/EU)' },
  { name: 'Gemini', services: ['2.5 Pro', 'Flash', 'Vision'], zone: 'Gemini Zone (India/SEA)' },
  { name: 'DeepSeek', services: ['V3', 'Coder'], zone: 'Code Zone' },
  { name: 'Alibaba', services: ['Qwen-Max', 'CosyVoice', 'WAN 2.2'], zone: 'Alibaba Zone (CJK)' },
  { name: 'Azure', services: ['Neural TTS', 'OCR', 'Visemes'], zone: 'Arabic/RTL' },
  { name: 'ElevenLabs', services: ['TTS', 'Voice Clone', 'SFX'], zone: 'Global' },
  { name: 'ModelsLab', services: ['FLUX', 'AnimateDiff', '3D'], zone: 'Global' },
];

const techStack = {
  frontend: ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Radix UI', 'React Flow'],
  backend: ['Supabase', '143+ Edge Functions', 'PostgreSQL', 'Realtime', 'Storage'],
  ai: ['12 Core Providers', '5-Zone Routing', 'A2A Protocol', 'Universal AI Hub'],
  infra: ['Netlify CDN', 'Edge Computing', 'WebRTC', 'SSE Streaming'],
  auth: ['Supabase Auth', 'Google OAuth', 'GitHub OAuth', 'Magic Link', 'RBAC'],
  integrations: ['Stripe', 'Resend', 'n8n', 'YouTube', 'LinkedIn', 'Label Studio'],
};

const dataFlows = [
  { from: 'Input (UIG)', to: 'Spark', description: 'Multi-modal input' },
  { from: 'Spark', to: 'Mind', description: 'Ideas & templates' },
  { from: 'Mind', to: 'Vibe', description: 'Scripts & TTS audio' },
  { from: 'Vibe', to: 'Arc', description: 'Media for review' },
  { from: 'Arc', to: 'Hub', description: 'Approved content' },
  { from: 'Hub', to: 'Distribution', description: 'Published media' },
];

const scenarioSummary = {
  total: 119,
  pipelines: 119,
  implemented: 106,
  partial: 8,
  planned: 5,
  p0: { total: 35, done: 35 },
  p1: { total: 32, done: 32 },
  p2: { total: 39, done: 39 },
  p3: { total: 13, done: 0 },
};

const moduleColorClasses: Record<string, { border: string; bg: string; text: string; progress: string }> = {
  cyan: { border: 'border-cyan-400/40', bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', progress: 'bg-cyan-500' },
  violet: { border: 'border-violet-400/40', bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', progress: 'bg-violet-500' },
  emerald: { border: 'border-emerald-400/40', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', progress: 'bg-emerald-500' },
  orange: { border: 'border-orange-400/40', bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', progress: 'bg-orange-500' },
  blue: { border: 'border-blue-400/40', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', progress: 'bg-blue-500' },
  purple: { border: 'border-purple-400/40', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', progress: 'bg-purple-500' },
  pink: { border: 'border-pink-400/40', bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', progress: 'bg-pink-500' },
  rose: { border: 'border-rose-400/40', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', progress: 'bg-rose-500' },
};

export const GenieStudioOverallArchitectureDiagram: React.FC = () => {
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
      link.download = 'genie-studio-overall-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PNG');
    }
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-background rounded-xl space-y-6 border border-border">
      {/* Header */}
      <div className="text-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
          <Layers className="h-8 w-8 text-violet-500" />
          Genie Studio - Complete Architecture
        </h2>
        <p className="text-muted-foreground mt-2">Mind to Media • 119 Pipelines • 12 Core Providers • 5-Zone Routing • 7 Products (incl. Genie Cast)</p>
      </div>

      {/* Implementation Summary */}
      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800/40">
        <CardContent className="pt-4">
          <div className="grid grid-cols-7 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{scenarioSummary.pipelines}</div>
              <div className="text-xs text-muted-foreground font-medium">Pipelines</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{scenarioSummary.implemented}</div>
              <div className="text-xs text-muted-foreground font-medium">Production (89%)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{scenarioSummary.partial}</div>
              <div className="text-xs text-muted-foreground font-medium">Partial</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</div>
              <div className="text-xs text-muted-foreground font-medium">AI Providers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">143+</div>
              <div className="text-xs text-muted-foreground font-medium">Edge Functions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">5</div>
              <div className="text-xs text-muted-foreground font-medium">Routing Zones</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">180+</div>
              <div className="text-xs text-muted-foreground font-medium">DB Tables</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="grid grid-cols-7 gap-3">
        {modules.map((module) => {
          const colors = moduleColorClasses[module.color];
          return (
            <Card key={module.id} className={`${colors.bg} ${colors.border} border-2`}>
              <CardContent className="pt-3 text-center">
                <div className="text-2xl mb-1">{module.icon}</div>
                <div className="text-foreground font-semibold text-xs">{module.name}</div>
                <div className="text-muted-foreground text-xs mb-2">{module.description}</div>
                <div className="w-full h-1.5 bg-muted rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all ${colors.progress}`}
                    style={{ width: `${module.completion}%` }}
                  />
                </div>
                <div className={`text-xs mt-1 font-medium ${colors.text}`}>{module.completion}%</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Core AI Providers - 12 Provider Ecosystem */}
      <Card className="border-2 border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            15 Core AI Providers (4-Zone Routing)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {coreProviders.map((provider) => (
              <div key={provider.name} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-foreground font-semibold text-sm">{provider.name}</span>
                  <Badge className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">Active</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {provider.services.slice(0, 3).map((service) => (
                    <Badge key={service} variant="secondary" className="text-[10px]">{service}</Badge>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground">{provider.zone}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
            {dataFlows.map((flow, index) => (
              <React.Fragment key={index}>
                <div className="flex-shrink-0 bg-background rounded-lg p-3 border-2 border-border text-center min-w-[100px] shadow-sm">
                  <div className="text-foreground text-sm font-semibold">{flow.from}</div>
                  <div className="text-muted-foreground text-xs mt-1">{flow.description}</div>
                </div>
                {index < dataFlows.length - 1 && (
                  <div className="text-cyan-500 text-lg flex-shrink-0 font-bold">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-2 border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Frontend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techStack.frontend.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Server className="h-4 w-4" />
              Backend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techStack.backend.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 dark:text-purple-400 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI/ML
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techStack.ai.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-2 border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techStack.infra.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techStack.auth.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-pink-200 dark:border-pink-800/40 bg-pink-50/50 dark:bg-pink-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-pink-700 dark:text-pink-400 flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techStack.integrations.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Progress */}
      <Card className="border-2 border-pink-200 dark:border-pink-800/40 bg-pink-50/50 dark:bg-pink-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-pink-700 dark:text-pink-400 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Phase Progress (P0-P3 Complete)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'P0', ...scenarioSummary.p0, colorClass: 'emerald', label: 'Foundation' },
              { id: 'P1', ...scenarioSummary.p1, colorClass: 'sky', label: 'Core AI' },
              { id: 'P2', ...scenarioSummary.p2, colorClass: 'amber', label: 'Production' },
              { id: 'P3', ...scenarioSummary.p3, colorClass: 'pink', label: 'Enterprise' },
            ].map((phase) => {
              const percentage = Math.round((phase.done / phase.total) * 100);
              const colorMap: Record<string, string> = {
                emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500',
                sky: 'text-sky-600 dark:text-sky-400 bg-sky-500',
                amber: 'text-amber-600 dark:text-amber-400 bg-amber-500',
                pink: 'text-pink-600 dark:text-pink-400 bg-pink-500',
              };
              const [textColor, , progressColor] = colorMap[phase.colorClass].split(' ');
              return (
                <div key={phase.id} className="bg-background rounded-lg p-3 border-2 border-border text-center shadow-sm">
                  <div className={`text-lg font-bold ${textColor}`}>{phase.id}</div>
                  <div className="text-xs text-muted-foreground mb-1">{phase.label}</div>
                  <div className="text-foreground text-sm font-medium">{phase.done}/{phase.total}</div>
                  <div className="w-full h-1.5 bg-muted rounded-full mt-2">
                    <div 
                      className={`h-full rounded-full ${progressColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-foreground font-semibold text-lg">Genie Studio - Complete Architecture</h2>
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
          Genie Studio - Complete Architecture
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

export default GenieStudioOverallArchitectureDiagram;
