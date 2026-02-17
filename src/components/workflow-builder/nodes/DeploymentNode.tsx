import React, { useState } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Code, Copy, ExternalLink, Settings } from 'lucide-react';

interface DeploymentConfig {
  environment: 'development' | 'testing' | 'staging' | 'production';
  platform: 'web' | 'mobile' | 'api' | 'webhook' | 'embed';
  domain?: string;
  apiKey?: string;
  webhookUrl?: string;
  embedCode?: string;
}

export const DeploymentNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState<DeploymentConfig>(data.deploymentConfig || {
    environment: 'development',
    platform: 'web',
    domain: '',
    apiKey: '',
    webhookUrl: '',
    embedCode: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const updateConfig = (updates: Partial<DeploymentConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const generateEmbedCode = () => {
    const embedCode = `<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.lovable.ai/agent-embed.js';
    script.onload = function() {
      LovableAgent.init({
        agentId: '${id}',
        apiKey: '${config.apiKey}',
        container: '#agent-container'
      });
    };
    document.head.appendChild(script);
  })();
</script>
<div id="agent-container"></div>`;
    
    updateConfig({ embedCode });
    navigator.clipboard.writeText(embedCode);
  };

  const generateAPIExample = () => {
    return `curl -X POST https://api.lovable.ai/v1/agents/${id}/chat \\
  -H "Authorization: Bearer ${config.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, how can you help me?",
    "sessionId": "user-session-123"
  }'`;
  };

  const getEnvironmentColor = (env: string) => {
    const colors = {
      development: 'bg-blue-100 text-blue-800',
      testing: 'bg-yellow-100 text-yellow-800',
      staging: 'bg-orange-100 text-orange-800',
      production: 'bg-green-100 text-green-800'
    };
    return colors[env as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Rocket}
      title="Deployment"
      className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${getEnvironmentColor(config.environment)}`}>
              {config.environment}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {config.platform}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            {isExpanded ? 'Close' : 'Config'}
          </Button>
        </div>

        {!isExpanded && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Deploy to {config.platform} in {config.environment} environment
            </div>
            {config.domain && (
              <div className="text-xs">
                <span className="font-medium">Domain:</span> {config.domain}
              </div>
            )}
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Environment</Label>
                <Select value={config.environment} onValueChange={(value: any) => updateConfig({ environment: value })}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Platform</Label>
                <Select value={config.platform} onValueChange={(value: any) => updateConfig({ platform: value })}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web App</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="embed">Embed Widget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-7">
                <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
                <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="config" className="space-y-2 mt-2">
                {config.platform === 'web' && (
                  <div>
                    <Label className="text-xs">Domain</Label>
                    <Input
                      value={config.domain || ''}
                      onChange={(e) => updateConfig({ domain: e.target.value })}
                      placeholder="https://your-domain.com"
                      className="h-7 text-xs"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-xs">API Key</Label>
                  <Input
                    value={config.apiKey || ''}
                    onChange={(e) => updateConfig({ apiKey: e.target.value })}
                    placeholder="Enter API key"
                    type="password"
                    className="h-7 text-xs"
                  />
                </div>

                {config.platform === 'webhook' && (
                  <div>
                    <Label className="text-xs">Webhook URL</Label>
                    <Input
                      value={config.webhookUrl || ''}
                      onChange={(e) => updateConfig({ webhookUrl: e.target.value })}
                      placeholder="https://your-webhook-url.com"
                      className="h-7 text-xs"
                    />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="code" className="space-y-2 mt-2">
                {config.platform === 'embed' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Embed Code</Label>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={generateEmbedCode}
                          className="h-6 px-2 text-xs"
                        >
                          Generate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(config.embedCode || '')}
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={config.embedCode || ''}
                      readOnly
                      className="min-h-[100px] text-xs font-mono"
                      placeholder="Click Generate to create embed code"
                    />
                  </div>
                )}

                {config.platform === 'api' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">API Example</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(generateAPIExample())}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={generateAPIExample()}
                      readOnly
                      className="min-h-[100px] text-xs font-mono"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1 h-7 text-xs">
                <Rocket className="h-3 w-3 mr-1" />
                Deploy
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseWorkflowNode>
  );
};