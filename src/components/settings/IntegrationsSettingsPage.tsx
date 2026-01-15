/**
 * Central Integrations Settings Page
 * Shared across all Genie products (Mind, Vibe, Spark, Arc, Hub)
 * Manages publishing APIs, external integrations, and webhook configurations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Youtube, Linkedin, Instagram, Twitter, 
  Globe, Key, CheckCircle, AlertCircle, 
  ExternalLink, Settings, RefreshCw, Plus,
  Webhook, Cloud, Shield
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  connected: boolean;
  lastSync?: string;
  features: string[];
}

const IntegrationsSettingsPage: React.FC = () => {
  const { showSuccess, showError } = useMasterToast();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const publishingPlatforms: PlatformConfig[] = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      connected: false,
      features: ['Direct Upload', 'Scheduled Publishing', 'Analytics Sync']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      connected: false,
      features: ['Video Posts', 'Articles', 'Company Pages']
    },
    {
      id: 'instagram',
      name: 'Instagram / Reels',
      icon: Instagram,
      connected: false,
      features: ['Reels Upload', 'Stories', 'IGTV']
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Twitter,
      connected: false,
      features: ['Video Tweets', 'Threads', 'Spaces Clips']
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Globe,
      connected: false,
      features: ['Direct Upload', 'Duets', 'Sounds']
    }
  ];

  const externalAPIs = [
    { id: 'elevenlabs', name: 'ElevenLabs', category: 'Voice Cloning', status: 'configured' },
    { id: 'synthesia', name: 'Synthesia', category: 'Avatar Video', status: 'pending' },
    { id: 'broll', name: 'Pexels/Unsplash', category: 'B-Roll Library', status: 'configured' },
    { id: 'music', name: 'Epidemic Sound', category: 'Music Library', status: 'pending' }
  ];

  const handleConnect = async (platformId: string) => {
    setIsConnecting(platformId);
    // Simulate OAuth flow - in real implementation, this would redirect to OAuth
    setTimeout(() => {
      showSuccess(`${platformId} connection initiated. Complete OAuth in the popup.`);
      setIsConnecting(null);
    }, 1000);
  };

  const handleDisconnect = (platformId: string) => {
    showSuccess(`${platformId} disconnected successfully`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Manage publishing platforms and external APIs across all Genie products
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          Shared Settings
        </Badge>
      </div>

      <Tabs defaultValue="publishing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="publishing" className="gap-2">
            <Globe className="h-4 w-4" />
            Publishing
          </TabsTrigger>
          <TabsTrigger value="external" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            External APIs
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* Publishing Platforms Tab */}
        <TabsContent value="publishing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Publishing Platforms</CardTitle>
              <CardDescription>
                Connect your accounts to enable direct publishing from Vibe and Hub
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {publishingPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <div 
                    key={platform.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{platform.name}</h3>
                        <div className="flex gap-2 mt-1">
                          {platform.features.slice(0, 2).map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {platform.features.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{platform.features.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {platform.connected ? (
                        <>
                          <Badge className="bg-green-100 text-green-800 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Connected
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(platform.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleConnect(platform.id)}
                          disabled={isConnecting === platform.id}
                        >
                          {isConnecting === platform.id ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* External APIs Tab */}
        <TabsContent value="external" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">External API Integrations</CardTitle>
              <CardDescription>
                Configure third-party services for enhanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {externalAPIs.map((api) => (
                <div 
                  key={api.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Key className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{api.name}</h3>
                      <p className="text-sm text-muted-foreground">{api.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={api.status === 'configured' ? 'default' : 'secondary'}
                      className={api.status === 'configured' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {api.status === 'configured' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Configured
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Set
                        </>
                      )}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Custom Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Webhook Configurations</CardTitle>
              <CardDescription>
                Set up webhooks for automation and external triggers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="n8n-webhook">n8n Workflow Webhook</Label>
                <div className="flex gap-2">
                  <Input 
                    id="n8n-webhook"
                    placeholder="https://your-n8n-instance.com/webhook/..."
                    className="flex-1"
                  />
                  <Button variant="outline">Test</Button>
                  <Button>Save</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Triggers n8n workflows when videos are exported from Vibe
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label htmlFor="custom-webhook">Custom Webhook URL</Label>
                <div className="flex gap-2">
                  <Input 
                    id="custom-webhook"
                    placeholder="https://api.yourservice.com/webhook"
                    className="flex-1"
                  />
                  <Button variant="outline">Test</Button>
                  <Button>Save</Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Include Video Metadata</Label>
                  <p className="text-xs text-muted-foreground">
                    Send title, description, tags with webhook payload
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Include Download URL</Label>
                  <p className="text-xs text-muted-foreground">
                    Include temporary signed URL for video download
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsSettingsPage;
