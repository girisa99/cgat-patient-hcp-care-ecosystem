
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNgrokIntegration } from '@/hooks/useNgrokIntegration';
import { Globe, RefreshCw, TestTube, Settings, ExternalLink, AlertCircle, CheckCircle, Copy, Terminal, AlertTriangle } from 'lucide-react';
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
  const CNAME_VALUE = '3malrwhuaftqxamqn.4ab7lasb3cwnlc5r8.ngrok-cname.com';

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
      description: "Text copied to clipboard"
    });
  };

  const testDomainConnection = async () => {
    try {
      const response = await fetch(`https://${PERMANENT_DOMAIN}`, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      toast({
        title: "Domain Test",
        description: "Domain is accessible! DNS propagation complete.",
        variant: "default"
      });
      setConnectionStatus('connected');
    } catch (err) {
      toast({
        title: "Domain Test",
        description: "Domain not yet accessible. DNS may still be propagating.",
        variant: "destructive"
      });
    }
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

      {/* DNS Status Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>DNS Configuration Status</AlertTitle>
        <AlertDescription>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">✅ DNS Configuration Complete!</h4>
              <p className="text-sm text-blue-700 mb-3">
                Great! You've updated your DNS records. Now we need to wait for DNS propagation.
              </p>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-800">What happens next:</p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside ml-4">
                  <li>DNS changes typically take 5-30 minutes to propagate</li>
                  <li>Sometimes it can take up to 2-4 hours globally</li>
                  <li>Your ngrok tunnel should keep running during this time</li>
                </ul>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button size="sm" onClick={testDomainConnection}>
                  <Globe className="h-4 w-4 mr-2" />
                  Test Domain Connection
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open(`https://${PERMANENT_DOMAIN}`, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Try Opening Domain
                </Button>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">🎯 Your Current Setup:</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Domain:</strong> {PERMANENT_DOMAIN}</p>
                <p><strong>CNAME Target:</strong> {CNAME_VALUE}</p>
                <p><strong>Local Port:</strong> 4040</p>
                <p><strong>Command Running:</strong> <code>ngrok http --url={PERMANENT_DOMAIN} 4040</code></p>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Connection Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>
            Configure your ngrok tunnel connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Primary Domain Status</Label>
            <div className="flex space-x-2">
              <Input
                placeholder={`https://${PERMANENT_DOMAIN}`}
                value={`https://${PERMANENT_DOMAIN}`}
                readOnly
                className="flex-1 bg-blue-50 border-blue-200"
              />
              <Badge variant="secondary">DNS Configured - Propagating</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Alternative: Test with ngrok URL</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter ngrok URL (e.g., https://abc123.ngrok-free.app)"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleRefresh} disabled={isLoading}>
                Connect
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <p className="text-sm text-yellow-700">
              <strong>Status:</strong> DNS records updated, waiting for propagation. Keep your ngrok tunnel running.
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-yellow-600 font-medium">Connection Status: {error}</p>
              <div className="text-sm text-yellow-500 space-y-1">
                <p><strong>This is normal during DNS propagation:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>DNS records are still propagating globally</li>
                  <li>Your domain may not be accessible yet</li>
                  <li>Keep your ngrok tunnel running</li>
                  <li>Try testing again in 10-15 minutes</li>
                </ul>
              </div>
            </div>
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
            Manage your active ngrok tunnels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tunnels.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <p className="text-blue-600 font-medium">Waiting for tunnel detection</p>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p className="block">✅ DNS configured, waiting for propagation</p>
                <p className="block">🔄 Keep running: <code className="bg-gray-100 px-1 rounded">ngrok http --url={PERMANENT_DOMAIN} 4040</code></p>
                <p className="block">⏱️ Test again in 10-15 minutes</p>
              </div>
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
                        <Badge variant="default">Your Domain</Badge>
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
            Create Additional Tunnel
          </CardTitle>
          <CardDescription>
            Create additional tunnels for other services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tunnel-name">Tunnel Name</Label>
              <Input
                id="tunnel-name"
                placeholder="additional-service"
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
            Test webhook endpoints (available once DNS propagation is complete)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder={`https://${PERMANENT_DOMAIN}/api/webhook`}
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
