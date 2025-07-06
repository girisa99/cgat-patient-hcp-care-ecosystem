
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNgrokIntegration } from '@/hooks/useNgrokIntegration';
import { Globe, RefreshCw, TestTube, Settings, ExternalLink, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const NgrokDashboard: React.FC = () => {
  const { toast } = useToast();
  const {
    tunnels,
    config,
    isLoading,
    error,
    getTunnels,
    createTunnel,
    testWebhook,
    registerWebhook,
    checkLocalNgrok
  } = useNgrokIntegration();

  const [customApiUrl, setCustomApiUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  const [newTunnelConfig, setNewTunnelConfig] = useState({
    name: '',
    addr: 'localhost:4040',
    proto: 'http',
    inspect: true
  });

  const [webhookTest, setWebhookTest] = useState({
    url: '',
    payload: '{"test": "data"}'
  });

  const PERMANENT_DOMAIN = 'dev.geniecellgene.com';

  useEffect(() => {
    // Check local ngrok first
    const checkConnection = async () => {
      setConnectionStatus('checking');
      try {
        await checkLocalNgrok();
        setConnectionStatus('connected');
      } catch (err) {
        setConnectionStatus('failed');
      }
    };
    
    checkConnection();
  }, [checkLocalNgrok]);

  const handleRefresh = async () => {
    const urlToUse = customApiUrl || undefined;
    try {
      await getTunnels(urlToUse);
      setConnectionStatus('connected');
    } catch (err) {
      setConnectionStatus('failed');
    }
  };

  const handleCreateTunnel = async () => {
    if (!newTunnelConfig.name || !newTunnelConfig.addr) {
      toast({
        title: "Error",
        description: "Name and address are required",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTunnel(newTunnelConfig);
      setNewTunnelConfig({
        name: '',
        addr: 'localhost:4040',
        proto: 'http',
        inspect: true
      });
      toast({
        title: "Success",
        description: "Tunnel created successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create tunnel",
        variant: "destructive"
      });
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookTest.url) {
      toast({
        title: "Error",
        description: "Webhook URL is required",
        variant: "destructive"
      });
      return;
    }

    try {
      let payload;
      try {
        payload = JSON.parse(webhookTest.payload);
      } catch {
        payload = { message: webhookTest.payload };
      }

      await testWebhook(webhookTest.url, payload);
      toast({
        title: "Success",
        description: "Webhook test completed"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Webhook test failed",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard"
    });
  };

  const setupPermanentTunnel = () => {
    const command = `ngrok http 4040 --domain=${PERMANENT_DOMAIN}`;
    copyToClipboard(command);
    toast({
      title: "Command Copied",
      description: "Run this command to start your permanent tunnel"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ngrok Integration Dashboard</h1>
          <p className="text-muted-foreground">
            Permanent development tunnel: {PERMANENT_DOMAIN} → localhost:4040
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus === 'checking' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
            {connectionStatus === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
            {connectionStatus === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
            {connectionStatus === 'checking' ? 'Checking...' : 
             connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Permanent Domain Setup */}
      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold">🎯 Permanent Development Domain Setup</h4>
              <p className="text-sm mt-1">Your custom domain: <strong>{PERMANENT_DOMAIN}</strong></p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium mb-2">Quick Setup Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Reserve domain <code className="bg-gray-200 px-1 rounded">{PERMANENT_DOMAIN}</code> in your ngrok dashboard</li>
                <li>Run the command below to start your permanent tunnel:</li>
              </ol>
              
              <div className="flex items-center gap-2 mt-2 p-2 bg-black text-green-400 rounded font-mono text-sm">
                <code>ngrok http 4040 --domain={PERMANENT_DOMAIN}</code>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={setupPermanentTunnel}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-600 mt-2">
                💡 This will make your app permanently accessible at https://{PERMANENT_DOMAIN} during development
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Connection Status Alert */}
      {connectionStatus === 'failed' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div>
              <p>Unable to connect to ngrok. Make sure ngrok is running with your permanent domain.</p>
              <p><strong>Quick fix:</strong> Run <code>ngrok http 4040 --domain={PERMANENT_DOMAIN}</code> and try refreshing.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>
            Configure your ngrok API endpoint or use the permanent domain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder={`https://${PERMANENT_DOMAIN} (or custom tunnel URL)`}
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleRefresh} disabled={isLoading}>
              Connect
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            For permanent development, use your reserved domain: {PERMANENT_DOMAIN}
          </p>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Active Tunnels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Active Tunnels ({tunnels.length})
          </CardTitle>
          <CardDescription>
            Currently active ngrok tunnels - Your permanent domain should appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tunnels.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active tunnels found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start your permanent tunnel: <code>ngrok http 4040 --domain={PERMANENT_DOMAIN}</code>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tunnels.map((tunnel) => (
                <div key={tunnel.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{tunnel.name}</h3>
                      <Badge variant="secondary">{tunnel.proto}</Badge>
                      {tunnel.public_url.includes(PERMANENT_DOMAIN) && (
                        <Badge variant="default">Permanent Domain</Badge>
                      )}
                      {tunnel.config.addr.includes('4040') && (
                        <Badge variant="outline">Main App</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tunnel.config.addr} → {tunnel.public_url}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {tunnel.metrics.conns.count} connections
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => copyToClipboard(tunnel.public_url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={tunnel.public_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Tunnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Create New Tunnel
          </CardTitle>
          <CardDescription>
            Configure additional ngrok tunnels (your permanent domain is already configured)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tunnel-name">Tunnel Name</Label>
              <Input
                id="tunnel-name"
                placeholder="additional-tunnel"
                value={newTunnelConfig.name}
                onChange={(e) => setNewTunnelConfig(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tunnel-addr">Local Address</Label>
              <Input
                id="tunnel-addr"
                placeholder="localhost:3000"
                value={newTunnelConfig.addr}
                onChange={(e) => setNewTunnelConfig(prev => ({ ...prev, addr: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tunnel-proto">Protocol</Label>
              <Input
                id="tunnel-proto"
                placeholder="http"
                value={newTunnelConfig.proto}
                onChange={(e) => setNewTunnelConfig(prev => ({ ...prev, proto: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="tunnel-inspect"
                checked={newTunnelConfig.inspect}
                onChange={(e) => setNewTunnelConfig(prev => ({ ...prev, inspect: e.target.checked }))}
              />
              <Label htmlFor="tunnel-inspect">Enable inspection</Label>
            </div>
          </div>
          <Button onClick={handleCreateTunnel} disabled={isLoading}>
            Create Additional Tunnel
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Webhook Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Webhook Testing
          </CardTitle>
          <CardDescription>
            Test webhook endpoints using your permanent domain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder={`https://${PERMANENT_DOMAIN}/webhook`}
              value={webhookTest.url}
              onChange={(e) => setWebhookTest(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-payload">Test Payload (JSON)</Label>
            <textarea
              id="webhook-payload"
              className="w-full h-32 p-2 border rounded-md"
              placeholder='{"event": "test", "data": {"key": "value"}}'
              value={webhookTest.payload}
              onChange={(e) => setWebhookTest(prev => ({ ...prev, payload: e.target.value }))}
            />
          </div>
          <Button onClick={handleTestWebhook} disabled={isLoading}>
            <TestTube className="h-4 w-4 mr-2" />
            Test Webhook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
