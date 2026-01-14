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

const aiIntegrations = [
  { name: 'OpenAI', services: ['GPT-4o', 'GPT-4o Mini', 'TTS', 'Whisper'], status: 'active', type: 'AI' },
  { name: 'Anthropic', services: ['Claude 3.5 Sonnet', 'Claude 3 Opus'], status: 'active', type: 'AI' },
  { name: 'Google Gemini', services: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Gemini Vision', 'Gemini Flash Lite'], status: 'active', type: 'AI' },
  { name: 'ElevenLabs', services: ['TTS', 'Voice Cloning', 'Speech-to-Speech'], status: 'active', type: 'TTS' },
  { name: 'Lovable AI Gateway', services: ['Multi-Model Router', 'Rate Limiting', 'Cost Tracking'], status: 'active', type: 'AI Gateway' },
  { name: 'AWS Bedrock', services: ['Claude', 'Titan', 'Stable Diffusion'], status: 'planned', type: 'AI' },
];

const platformIntegrations = [
  { name: 'Supabase', services: ['Auth', 'Database', 'Storage', 'Realtime', 'Edge Functions'], status: 'active', type: 'Backend' },
  { name: 'Stripe', services: ['Payments', 'Subscriptions', 'Invoicing', 'Webhooks'], status: 'active', type: 'Payments' },
  { name: 'Resend', services: ['Transactional Email', 'Email Templates', 'Analytics'], status: 'active', type: 'Email' },
  { name: 'n8n', services: ['Workflow Automation', 'MCP Integration', 'Webhooks'], status: 'active', type: 'Automation' },
  { name: 'YouTube', services: ['Upload API', 'Analytics', 'Live Streaming'], status: 'planned', type: 'Social' },
  { name: 'LinkedIn', services: ['Video Upload', 'Post API'], status: 'planned', type: 'Social' },
];

const authIntegrations = [
  { name: 'Supabase Auth', services: ['Email/Password', 'Magic Link', 'OTP', 'MFA'], status: 'active', type: 'Primary' },
  { name: 'Google OAuth', services: ['Google Workspace', 'Gmail Sign-In', 'One Tap'], status: 'active', type: 'Social' },
  { name: 'GitHub OAuth', services: ['Developer Auth', 'Org Access'], status: 'active', type: 'Social' },
  { name: 'Apple Sign-In', services: ['iOS Auth', 'Web Auth'], status: 'planned', type: 'Social' },
  { name: 'Azure AD (SAML)', services: ['Enterprise SSO', 'SCIM Provisioning'], status: 'planned', type: 'Enterprise' },
  { name: 'Okta (OIDC)', services: ['SSO', 'MFA', 'Directory Sync'], status: 'planned', type: 'Enterprise' },
];

const enterpriseIntegrations = [
  { name: 'Epic FHIR', services: ['Patient Data', 'Clinical Documents'], status: 'planned', type: 'Healthcare' },
  { name: 'Cerner', services: ['EHR Integration'], status: 'planned', type: 'Healthcare' },
  { name: 'Salesforce', services: ['CRM Sync', 'Marketing Cloud'], status: 'planned', type: 'CRM' },
  { name: 'HubSpot', services: ['CRM', 'Marketing Automation'], status: 'planned', type: 'CRM' },
  { name: 'Microsoft 365', services: ['Teams', 'SharePoint', 'OneDrive'], status: 'planned', type: 'Enterprise' },
  { name: 'Zapier', services: ['Webhook Triggers', '5000+ App Integrations'], status: 'active', type: 'Automation' },
];

const internalApis = [
  { name: 'ai-universal-processor', description: 'Multi-model AI orchestration', status: 'active', method: 'POST' },
  { name: 'tts-generate', description: 'Text-to-speech generation', status: 'active', method: 'POST' },
  { name: 'process-documents', description: 'Document parsing & extraction', status: 'active', method: 'POST' },
  { name: 'elevenlabs-tts', description: 'ElevenLabs TTS wrapper', status: 'active', method: 'POST' },
  { name: 'stripe-webhook', description: 'Payment event handling', status: 'active', method: 'POST' },
  { name: 'generate-script', description: 'AI script generation', status: 'active', method: 'POST' },
  { name: 'enhance-script', description: 'Script enhancement & polish', status: 'active', method: 'POST' },
  { name: 'send-email', description: 'Resend email dispatch', status: 'active', method: 'POST' },
  { name: 'n8n-webhook', description: 'n8n workflow triggers', status: 'active', method: 'POST' },
  { name: 'media-processor', description: 'Video/audio processing', status: 'partial', method: 'POST' },
  { name: 'collaboration-sync', description: 'Real-time team sync', status: 'partial', method: 'WS' },
  { name: 'shows-api', description: 'Show/event management', status: 'partial', method: 'REST' },
];

const webhooks = [
  { name: 'stripe-payments', events: ['checkout.completed', 'subscription.created', 'invoice.paid'], status: 'active' },
  { name: 'auth-events', events: ['user.created', 'user.updated', 'session.ended'], status: 'active' },
  { name: 'resend-events', events: ['email.sent', 'email.delivered', 'email.bounced'], status: 'active' },
  { name: 'n8n-workflows', events: ['workflow.triggered', 'workflow.completed', 'workflow.failed'], status: 'active' },
  { name: 'media-events', events: ['upload.complete', 'transcode.done', 'export.ready'], status: 'partial' },
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
          Genie Integrations Architecture
        </h2>
        <p className="text-muted-foreground mt-2">APIs • External Services • Webhooks • Data Flow</p>
      </div>

      {/* Stats Bar */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-2 border-cyan-200 dark:border-cyan-800/40">
        <CardContent className="pt-4">
          <div className="grid grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{aiIntegrations.length}</div>
              <div className="text-xs text-muted-foreground font-medium">AI Providers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{platformIntegrations.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Platform APIs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{authIntegrations.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Auth Providers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{enterpriseIntegrations.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Enterprise</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{internalApis.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Edge Functions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{webhooks.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Webhooks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* AI Integrations */}
        <Card className="border-2 border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-700 dark:text-purple-400 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI & ML Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiIntegrations.map((integration) => (
                <div key={integration.name} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-foreground font-semibold text-sm">{integration.name}</span>
                    {getStatusBadge(integration.status)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {integration.services.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
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
        <Card className="border-2 border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platformIntegrations.map((integration) => (
                <div key={integration.name} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-foreground font-semibold text-sm">{integration.name}</span>
                    {getStatusBadge(integration.status)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {integration.services.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
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

      {/* Auth Integrations */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Providers (OAuth & SSO)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {authIntegrations.map((integration) => (
              <div key={integration.name} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-foreground font-semibold text-sm">{integration.name}</span>
                  {getStatusBadge(integration.status)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {integration.services.slice(0, 3).map((service) => (
                    <Badge key={service} variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Integrations */}
      <Card className="border-2 border-violet-200 dark:border-violet-800/40 bg-violet-50/50 dark:bg-violet-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-violet-700 dark:text-violet-400 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Enterprise & Automation Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {enterpriseIntegrations.map((integration) => (
              <div key={integration.name} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-foreground font-semibold text-sm">{integration.name}</span>
                  {getStatusBadge(integration.status)}
                </div>
                <Badge variant="secondary" className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                  {integration.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Internal APIs (Edge Functions) */}
      <Card className="border-2 border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Internal Edge Functions (Microservices)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {internalApis.map((api) => (
              <div key={api.name} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-orange-600 dark:text-orange-400 text-xs font-semibold">{api.name}</code>
                  {getStatusBadge(api.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{api.description}</span>
                  <Badge variant="secondary" className="text-xs">{api.method}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="border-2 border-pink-200 dark:border-pink-800/40 bg-pink-50/50 dark:bg-pink-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-pink-700 dark:text-pink-400 flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Webhooks & Event Handlers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {webhooks.map((webhook) => (
              <div key={webhook.name} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-pink-600 dark:text-pink-400 text-xs font-semibold">{webhook.name}</code>
                  {getStatusBadge(webhook.status)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.slice(0, 2).map((event) => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                  {webhook.events.length > 2 && (
                    <Badge variant="secondary" className="text-xs">+{webhook.events.length - 2}</Badge>
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
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-foreground font-semibold text-lg">Genie Integrations Architecture</h2>
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
