
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

  // Check if ngrok is properly configured with correct port
  const hasCorrectTunnel = tunnels.some(tunnel => 
    tunnel.public_url.includes(PERMANENT_DOMAIN) && 
    tunnel.config.addr.includes('4040')
  );

  const hasWrongPortTunnel = tunnels.some(tunnel => 
    tunnel.public_url.includes(PERMANENT_DOMAIN) && 
    tunnel.config.addr.includes('8080')
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ngrok Integration Dashboard</h1>
          <p className="text-muted-foreground">
            Domain: {PERMANENT_DOMAIN} → Lovable App on port 4040
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

      {/* Success Alert - Show when ngrok is properly configured */}
      {hasCorrectTunnel && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>✅ Perfect! Ngrok is properly configured</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              <p><strong>Success:</strong> Your tunnel is running correctly on port 4040.</p>
              <p>Your Lovable app should now be accessible at: <strong>https://{PERMANENT_DOMAIN}</strong></p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert - Show when there's a port mismatch */}
      {hasWrongPortTunnel && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>⚠️ Port Configuration Issue Detected</AlertTitle>
          <AlertDescription>
            <div className="space-y-3 mt-2">
              <p><strong>Error ERR_NGROK_8012:</strong> Your Lovable app is not running on port 8080.</p>
              
              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">🔧 Solution:</h4>
                <div className="text-sm text-red-700 space-y-2">
                  <p><strong>1. Stop your current ngrok tunnel</strong> (Ctrl+C in terminal)</p>
                  <p><strong>2. Check Lovable's actual port:</strong> Look at your Lovable preview URL - it should show something like localhost:4040</p>
                  <p><strong>3. Restart ngrok with the correct port:</strong></p>
                  <code className="block bg-gray-100 p-2 rounded text-black mt-1">
                    ngrok http --url=dev.geniecellgene.com 4040
                  </code>
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Replace 4040 with whatever port your Lovable app is actually running on
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => copyToClipboard('ngrok http --url=dev.geniecellgene.com 4040')}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Correct Command
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
                className={`flex-1 ${hasCorrectTunnel ? 'bg-green-50 border-green-200' : hasWrongPortTunnel ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}
              />
              <Badge variant={hasCorrectTunnel ? 'default' : hasWrongPortTunnel ? 'destructive' : 'secondary'}>
                {hasCorrectTunnel ? 'Active' : hasWrongPortTunnel ? 'Port Mismatch' : 'Not Connected'}
              </Badge>
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

          <div className={`p-3 rounded-md border ${
            hasCorrectTunnel 
              ? 'bg-green-50 border-green-200' 
              : hasWrongPortTunnel 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-sm ${
              hasCorrectTunnel 
                ? 'text-green-700' 
                : hasWrongPortTunnel 
                  ? 'text-yellow-700' 
                  : 'text-gray-700'
            }`}>
              <strong>Status:</strong> {
                hasCorrectTunnel 
                  ? 'Tunnel is properly configured and active on port 4040!' 
                  : hasWrongPortTunnel 
                    ? 'Tunnel configured but port mismatch detected. Please restart ngrok with the correct port.' 
                    : 'No active tunnel detected. Please start ngrok.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>
            {typeof error === 'string' ? error : 'Unable to connect to ngrok API'}
          </AlertDescription>
        </Alert>
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
              <Terminal className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <p className="text-yellow-600 font-medium">No active tunnels detected</p>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p>🎯 Expected: <strong>https://{PERMANENT_DOMAIN}</strong></p>
                <p>⚠️ Please make sure ngrok is running with the correct command</p>
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
                        <Badge variant="outline">Correct Port</Badge>
                      )}
                      {tunnel.config.addr.includes('8080') && (
                        <Badge variant="destructive">Wrong Port</Badge>
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

      {/* Create Additional Tunnel */}
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
                placeholder="localhost:4040"
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
