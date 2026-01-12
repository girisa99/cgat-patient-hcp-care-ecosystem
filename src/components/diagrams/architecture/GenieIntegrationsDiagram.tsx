/**
 * Genie Integrations Architecture Diagram
 * All APIs, External Services, and Integration Points
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Plug, Globe, Cloud, Database, Shield, Zap, Radio } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const colors = {
  active: { bg: '#10b981', text: '#ffffff' },
  partial: { bg: '#f59e0b', text: '#ffffff' },
  planned: { bg: '#6366f1', text: '#ffffff' },
};

const aiIntegrations = [
  { name: 'OpenAI', services: ['GPT-4o', 'GPT-4o Mini', 'TTS', 'Whisper'], status: 'active', type: 'AI' },
  { name: 'Anthropic', services: ['Claude 3.5 Sonnet', 'Claude 3 Opus'], status: 'active', type: 'AI' },
  { name: 'Google AI', services: ['Gemini Pro', 'Gemini Flash', 'Gemini Vision'], status: 'active', type: 'AI' },
  { name: 'ElevenLabs', services: ['TTS', 'Voice Cloning', 'Speech-to-Speech'], status: 'active', type: 'TTS' },
  { name: 'Azure AI', services: ['Speech Services', 'Cognitive Services'], status: 'planned', type: 'AI' },
  { name: 'AWS Bedrock', services: ['Claude', 'Titan', 'Stable Diffusion'], status: 'planned', type: 'AI' },
];

const platformIntegrations = [
  { name: 'Supabase', services: ['Auth', 'Database', 'Storage', 'Realtime', 'Edge Functions'], status: 'active', type: 'Backend' },
  { name: 'Stripe', services: ['Payments', 'Subscriptions', 'Invoicing'], status: 'active', type: 'Payments' },
  { name: 'YouTube', services: ['Upload API', 'Analytics', 'Live Streaming'], status: 'planned', type: 'Social' },
  { name: 'TikTok', services: ['Video Upload', 'Creator API'], status: 'planned', type: 'Social' },
  { name: 'Spotify/Anchor', services: ['Podcast Distribution'], status: 'planned', type: 'Social' },
  { name: 'LinkedIn', services: ['Video Upload', 'Post API'], status: 'planned', type: 'Social' },
];

const enterpriseIntegrations = [
  { name: 'Epic FHIR', services: ['Patient Data', 'Clinical Documents'], status: 'planned', type: 'Healthcare' },
  { name: 'Cerner', services: ['EHR Integration'], status: 'planned', type: 'Healthcare' },
  { name: 'Salesforce', services: ['CRM Sync', 'Marketing Cloud'], status: 'planned', type: 'CRM' },
  { name: 'HubSpot', services: ['CRM', 'Marketing Automation'], status: 'planned', type: 'CRM' },
  { name: 'Microsoft 365', services: ['Teams', 'SharePoint', 'OneDrive'], status: 'planned', type: 'Enterprise' },
  { name: 'Okta/Azure AD', services: ['SSO', 'SAML', 'OIDC'], status: 'planned', type: 'Security' },
];

const internalApis = [
  { name: 'ai-universal-processor', description: 'Multi-model AI orchestration', status: 'active', method: 'POST' },
  { name: 'tts-generate', description: 'Text-to-speech generation', status: 'active', method: 'POST' },
  { name: 'process-documents', description: 'Document parsing & extraction', status: 'active', method: 'POST' },
  { name: 'elevenlabs-tts', description: 'ElevenLabs TTS wrapper', status: 'active', method: 'POST' },
  { name: 'stripe-webhook', description: 'Payment event handling', status: 'active', method: 'POST' },
  { name: 'generate-script', description: 'AI script generation', status: 'active', method: 'POST' },
  { name: 'enhance-script', description: 'Script enhancement & polish', status: 'active', method: 'POST' },
  { name: 'media-processor', description: 'Video/audio processing', status: 'partial', method: 'POST' },
  { name: 'clip-assembly', description: 'Multi-clip video assembly', status: 'planned', method: 'POST' },
  { name: 'collaboration-sync', description: 'Real-time team sync', status: 'partial', method: 'WS' },
  { name: 'shows-api', description: 'Show/event management', status: 'partial', method: 'REST' },
  { name: 'calendar-sync', description: 'External calendar integration', status: 'planned', method: 'REST' },
];

const webhooks = [
  { name: 'stripe-payments', events: ['checkout.completed', 'subscription.created', 'invoice.paid'], status: 'active' },
  { name: 'auth-events', events: ['user.created', 'user.updated', 'session.ended'], status: 'active' },
  { name: 'media-events', events: ['upload.complete', 'transcode.done', 'export.ready'], status: 'partial' },
  { name: 'distribution-events', events: ['publish.success', 'publish.failed'], status: 'planned' },
];

export const GenieIntegrationsDiagram: React.FC = () => {
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
        return <Badge className="text-xs" style={{ backgroundColor: colors.active.bg, color: colors.active.text }}>✓ Active</Badge>;
      case 'partial':
        return <Badge className="text-xs" style={{ backgroundColor: colors.partial.bg, color: colors.partial.text }}>◐ Partial</Badge>;
      default:
        return <Badge className="text-xs" style={{ backgroundColor: colors.planned.bg, color: colors.planned.text }}>○ Planned</Badge>;
    }
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-slate-900 rounded-xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
          <Plug className="h-8 w-8 text-cyan-400" />
          Genie Integrations Architecture
        </h2>
        <p className="text-slate-400 mt-2">APIs • External Services • Webhooks • Data Flow</p>
      </div>

      {/* Stats Bar */}
      <Card className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30">
        <CardContent className="pt-4">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-300">{aiIntegrations.length}</div>
              <div className="text-xs text-slate-400">AI Providers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-300">{platformIntegrations.length}</div>
              <div className="text-xs text-slate-400">Platform APIs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-300">{enterpriseIntegrations.length}</div>
              <div className="text-xs text-slate-400">Enterprise</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-300">{internalApis.length}</div>
              <div className="text-xs text-slate-400">Edge Functions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-300">{webhooks.length}</div>
              <div className="text-xs text-slate-400">Webhooks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* AI Integrations */}
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI & ML Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiIntegrations.map((integration) => (
                <div key={integration.name} className="bg-slate-700/50 rounded-lg p-2 border border-slate-600">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{integration.name}</span>
                    {getStatusBadge(integration.status)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {integration.services.map((service) => (
                      <Badge key={service} variant="outline" className="text-xs text-purple-300 border-purple-500/30">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Integrations */}
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platformIntegrations.map((integration) => (
                <div key={integration.name} className="bg-slate-700/50 rounded-lg p-2 border border-slate-600">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{integration.name}</span>
                    {getStatusBadge(integration.status)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {integration.services.map((service) => (
                      <Badge key={service} variant="outline" className="text-xs text-blue-300 border-blue-500/30">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enterprise Integrations */}
      <Card className="bg-slate-800/50 border-emerald-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enterprise Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {enterpriseIntegrations.map((integration) => (
              <div key={integration.name} className="bg-slate-700/50 rounded-lg p-2 border border-slate-600">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">{integration.name}</span>
                  {getStatusBadge(integration.status)}
                </div>
                <Badge variant="outline" className="text-xs text-emerald-300 border-emerald-500/30">
                  {integration.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Internal APIs (Edge Functions) */}
      <Card className="bg-slate-800/50 border-orange-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-300 flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Internal Edge Functions (Microservices)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {internalApis.map((api) => (
              <div key={api.name} className="bg-slate-700/50 rounded-lg p-2 border border-slate-600">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-orange-300 text-xs">{api.name}</code>
                  {getStatusBadge(api.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">{api.description}</span>
                  <Badge variant="outline" className="text-xs text-slate-300">{api.method}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="bg-slate-800/50 border-pink-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-pink-300 flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Webhooks & Event Handlers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {webhooks.map((webhook) => (
              <div key={webhook.name} className="bg-slate-700/50 rounded-lg p-2 border border-slate-600">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-pink-300 text-xs">{webhook.name}</code>
                  {getStatusBadge(webhook.status)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.slice(0, 2).map((event) => (
                    <Badge key={event} variant="outline" className="text-xs text-slate-400">
                      {event}
                    </Badge>
                  ))}
                  {webhook.events.length > 2 && (
                    <Badge variant="outline" className="text-xs text-slate-500">+{webhook.events.length - 2}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-auto">
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Genie Integrations Architecture</h2>
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
          <Plug className="h-5 w-5 text-cyan-400" />
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
