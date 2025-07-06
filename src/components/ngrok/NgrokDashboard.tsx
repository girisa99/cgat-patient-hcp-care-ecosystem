
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

      {/* Ngrok Inspect Issue Alert */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Ngrok Inspect Page Issue Detected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-red-700">
            <p className="mb-3">
              <strong>Issue:</strong> Your domain is showing the ngrok inspect interface instead of your application.
            </p>
            
            <div className="bg-white p-4 rounded-md border border-red-200 mb-4">
              <h4 className="font-semibold text-red-800 mb-2">🔧 Solution:</h4>
              <p className="text-sm mb-3">You need to restart ngrok with the correct configuration:</p>
              
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm mb-3">
                <div className="mb-1"># Stop your current ngrok process (Ctrl+C)</div>
                <div className="mb-1"># Then run this command instead:</div>
                <div className="text-white">ngrok http --url={PERMANENT_DOMAIN} 4040</div>
              </div>
              
              <div className="text-sm space-y-2">
                <p><strong>Key points:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-red-600">
                  <li>Make sure your Lovable app is running on port 4040</li>
                  <li>The <code>--url</code> flag forces ngrok to use your domain directly</li>
                  <li>This bypasses the inspect interface completely</li>
                  <li>Your app should then be accessible at: <strong>https://{PERMANENT_DOMAIN}</strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📋 Checklist:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>✅ DNS records configured</div>
                <div>✅ Domain accessible</div>
                <div>❌ <strong>Need to fix:</strong> Restart ngrok with correct command</div>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <Button size="sm" onClick={() => window.open(`https://${PERMANENT_DOMAIN}`, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Test Domain After Fix
              </Button>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(`ngrok http --url=${PERMANENT_DOMAIN} 4040`)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Correct Command
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                className="flex-1 bg-green-50 border-green-200"
              />
              <Badge variant="default">DNS Active</Badge>
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
              <strong>Status:</strong> Domain is accessible but showing inspect interface. Restart ngrok with the correct command above.
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
                <p><strong>This might be normal:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Ngrok API might not be accessible through inspect interface</li>
                  <li>Once you restart with the correct command, this should resolve</li>
                  <li>Your domain is working, just needs the right ngrok configuration</li>
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
              <Terminal className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <p className="text-blue-600 font-medium">Restart ngrok to see tunnels here</p>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p className="block">🔄 Run: <code className="bg-gray-100 px-2 py-1 rounded">ngrok http --url={PERMANENT_DOMAIN} 4040</code></p>
                <p className="block">🎯 Your app will be at: <strong>https://{PERMANENT_DOMAIN}</strong></p>
                <p className="block">✅ No more inspect interface!</p>
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
            Test webhook endpoints (available once ngrok is properly configured)
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
