/**
 * Genie Integrations Architecture Diagram
 * 12 Core Providers • 5-Zone Routing • 143+ Edge Functions
 * Updated: 2026-01-25
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Plug, Globe, Cloud, Database, Shield, Zap, Radio, CheckCircle, Clock, Brain, Mic, Video, Image } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

// Core 12 AI Providers
const coreProviders = [
  { name: 'OpenAI', services: ['GPT-4o', 'GPT-4o Mini', 'TTS', 'Whisper', 'DALL-E 3'], status: 'active', type: 'LLM + Media', zone: 'Global' },
  { name: 'Anthropic', services: ['Claude 3.5 Sonnet', 'Claude 3 Opus'], status: 'active', type: 'LLM', zone: 'Claude Zone' },
  { name: 'Google', services: ['Gemini 2.5 Pro', 'Gemini Flash', 'Vision', 'TTS'], status: 'active', type: 'LLM + TTS', zone: 'Gemini Zone' },
  { name: 'DeepSeek', services: ['DeepSeek-V3', 'DeepSeek Coder'], status: 'active', type: 'LLM', zone: 'Fallback' },
  { name: 'Alibaba', services: ['Qwen-Max', 'Qwen-MT', 'CosyVoice', 'Wan2.2'], status: 'active', type: 'CJK Specialist', zone: 'Alibaba Zone' },
  { name: 'Azure', services: ['Neural TTS', 'Visemes', 'OCR', 'Form Recognizer'], status: 'active', type: 'Enterprise', zone: 'Arabic Zone' },
  { name: 'ModelsLab', services: ['FLUX', 'AnimateDiff', '3D Mesh', 'Realtime'], status: 'active', type: 'Media Gen', zone: 'Global' },
  { name: 'ElevenLabs', services: ['TTS', 'Voice Clone', 'SFX'], status: 'active', type: 'Voice', zone: 'Global' },
  { name: 'DeepL', services: ['Translation (29 langs)', 'Document Trans'], status: 'active', type: 'Translation', zone: 'EU' },
  { name: 'Replicate', services: ['Avatar Fallback', 'Custom Models'], status: 'active', type: 'Fallback', zone: 'Global' },
  { name: 'Supabase', services: ['Auth', 'Database', 'Storage', 'Edge Functions'], status: 'active', type: 'Infrastructure', zone: 'Global' },
  { name: 'Stripe', services: ['Payments', 'Subscriptions', 'Webhooks'], status: 'active', type: 'Payments', zone: 'Global' },
];

// 5-Zone Regional Routing
const routingZones = [
  { name: 'Claude Zone', regions: ['US', 'UK', 'EU', 'LATAM'], primary: 'Claude 3.5', fallback: 'GPT-4o', color: 'violet' },
  { name: 'Alibaba Zone', regions: ['China', 'Japan', 'Korea', 'Taiwan'], primary: 'Qwen-Max', fallback: 'Gemini', color: 'orange' },
  { name: 'Arabic Zone', regions: ['MENA', 'Gulf', 'Egypt'], primary: 'GPT-4o', fallback: 'Azure', color: 'emerald' },
  { name: 'Gemini Zone', regions: ['India', 'SEA', 'Africa'], primary: 'Gemini Pro', fallback: 'Claude', color: 'blue' },
  { name: 'Fallback Zone', regions: ['Other', 'Code Tasks'], primary: 'DeepSeek-V3', fallback: 'GPT-4o Mini', color: 'slate' },
];

const platformIntegrations = [
  { name: 'n8n', services: ['Workflow Automation', 'MCP Integration'], status: 'active', type: 'Automation' },
  { name: 'Resend', services: ['Transactional Email', 'Templates'], status: 'active', type: 'Email' },
  { name: 'YouTube', services: ['Upload API', 'Analytics'], status: 'partial', type: 'Genie Cast' },
  { name: 'LinkedIn', services: ['Video Upload', 'Post API'], status: 'partial', type: 'Genie Cast' },
  { name: 'TikTok', services: ['Short-form Video'], status: 'planned', type: 'Genie Cast' },
  { name: 'Instagram', services: ['Reels', 'Stories'], status: 'planned', type: 'Genie Cast' },
  { name: 'Twitter/X', services: ['Post API', 'Media Upload'], status: 'planned', type: 'Genie Cast' },
  { name: 'Zapier', services: ['5000+ App Integrations'], status: 'active', type: 'Automation' },
];

const edgeFunctionGroups = [
  { category: 'AI Processing', count: 35, examples: ['ai-universal-processor', 'ai-video-generator', 'ai-image-generator'] },
  { category: 'Voice & Audio', count: 25, examples: ['text-to-speech', 'elevenlabs-voice', 'voice-clone-processor'] },
  { category: 'Content & Media', count: 30, examples: ['media-processor', 'auto-thumbnail', 'video-encoder'] },
  { category: 'Translation', count: 15, examples: ['translate-content', 'multi-language-dubbing'] },
  { category: 'Auth & Payments', count: 20, examples: ['stripe-webhook', 'auth-handler', 'subscription-sync'] },
  { category: 'Utilities', count: 18, examples: ['send-email', 'n8n-webhook', 'export-handler'] },
];

export const GenieIntegrationsDiagram: React.FC = () => {
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
      link.download = 'genie-integrations-architecture.png';
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
        return <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">✓ Active</Badge>;
      case 'partial':
        return <Badge className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">◐ Partial</Badge>;
      default:
        return <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">○ Planned</Badge>;
    }
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-background rounded-xl space-y-6 border border-border">
      {/* Header */}
      <div className="text-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
          <Plug className="h-8 w-8 text-cyan-500" />
          Genie Suite Integration Architecture (7 Products)
        </h2>
        <p className="text-muted-foreground mt-2">12 Core Providers • 5-Zone Routing • 143+ Edge Functions • 119 Pipelines</p>
      </div>

      {/* Stats Bar */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-2 border-cyan-200 dark:border-cyan-800/40">
        <CardContent className="pt-4">
          <div className="grid grid-cols-7 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">12</div>
              <div className="text-xs text-muted-foreground font-medium">Core Providers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">5</div>
              <div className="text-xs text-muted-foreground font-medium">Routing Zones</div>
            </div>
            <div>
              <div className="text-xl font-bold text-violet-600 dark:text-violet-400">143+</div>
              <div className="text-xs text-muted-foreground font-medium">Edge Functions</div>
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">119</div>
              <div className="text-xs text-muted-foreground font-medium">Pipelines</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">180+</div>
              <div className="text-xs text-muted-foreground font-medium">DB Tables</div>
            </div>
            <div>
              <div className="text-xl font-bold text-pink-600 dark:text-pink-400">120+</div>
              <div className="text-xs text-muted-foreground font-medium">Languages</div>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-1">
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs text-muted-foreground">Configured</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core 12 Providers */}
      <Card className="border-2 border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Core 12 AI Provider Ecosystem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {coreProviders.map((provider) => (
              <div key={provider.name} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-foreground font-semibold text-sm">{provider.name}</span>
                  {getStatusBadge(provider.status)}
                </div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {provider.services.slice(0, 3).map((service) => (
                    <Badge key={service} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      {service}
                    </Badge>
                  ))}
                  {provider.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{provider.services.length - 3}</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{provider.type} • {provider.zone}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5-Zone Routing */}
      <Card className="border-2 border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            5-Zone Regional Routing Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {routingZones.map((zone) => (
              <div key={zone.name} className={`bg-background rounded-lg p-3 border-2 border-${zone.color}-200 dark:border-${zone.color}-800/40 shadow-sm`}>
                <div className={`text-${zone.color}-600 dark:text-${zone.color}-400 font-semibold text-sm mb-2`}>{zone.name}</div>
                <div className="space-y-1 text-xs">
                  <div><span className="text-muted-foreground">Primary:</span> <span className="text-foreground font-medium">{zone.primary}</span></div>
                  <div><span className="text-muted-foreground">Fallback:</span> <span className="text-foreground">{zone.fallback}</span></div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {zone.regions.slice(0, 3).map((r) => (
                      <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edge Functions */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            143+ Edge Functions (by Category)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {edgeFunctionGroups.map((group) => (
              <div key={group.category} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">{group.category}</div>
                <div className="text-2xl font-bold text-foreground my-1">{group.count}</div>
                <div className="text-xs text-muted-foreground">
                  {group.examples.slice(0, 2).map((ex, i) => (
                    <div key={ex} className="truncate">{ex}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Integrations */}
      <Card className="border-2 border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Platform & Social Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {platformIntegrations.map((integration) => (
              <div key={integration.name} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-foreground font-semibold text-sm">{integration.name}</span>
                  {getStatusBadge(integration.status)}
                </div>
                <Badge variant="secondary" className="text-xs">{integration.type}</Badge>
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
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-foreground font-semibold text-lg">Genie Integration Architecture</h2>
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
          <Plug className="h-5 w-5 text-cyan-500" />
          Integrations Architecture
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

export default GenieIntegrationsDiagram;
