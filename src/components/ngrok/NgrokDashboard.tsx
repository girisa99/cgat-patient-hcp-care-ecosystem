
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNgrokIntegration } from '@/hooks/useNgrokIntegration';
import { Globe, RefreshCw, TestTube, Settings, ExternalLink } from 'lucide-react';

export const NgrokDashboard: React.FC = () => {
  const {
    tunnels,
    config,
    isLoading,
    error,
    getTunnels,
    createTunnel,
    testWebhook,
    registerWebhook
  } = useNgrokIntegration();

  const [newTunnelConfig, setNewTunnelConfig] = React.useState({
    name: '',
    addr: 'localhost:3000',
    proto: 'http',
    inspect: true
  });

  const [webhookTest, setWebhookTest] = React.useState({
    url: '',
    payload: '{"test": "data"}'
  });

  useEffect(() => {
    // Auto-fetch tunnels on component mount
    getTunnels();
  }, [getTunnels]);

  const handleCreateTunnel = async () => {
    if (!newTunnelConfig.name || !newTunnelConfig.addr) {
      console.error('Name and address are required');
      return;
    }

    try {
      await createTunnel(newTunnelConfig);
      setNewTunnelConfig({
        name: '',
        addr: 'localhost:3000',
        proto: 'http',
        inspect: true
      });
    } catch (err) {
      console.error('Failed to create tunnel:', err);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookTest.url) {
      console.error('Webhook URL is required');
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
    } catch (err) {
      console.error('Webhook test failed:', err);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ngrok Integration Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your ngrok tunnels and webhook endpoints for local development
          </p>
        </div>
        <Button onClick={() => getTunnels()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

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
            Active Tunnels
          </CardTitle>
          <CardDescription>
            Currently active ngrok tunnels from your endpoint: https://26a3-52-41-62-68.ngrok-free.app
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tunnels.length === 0 ? (
            <p className="text-muted-foreground py-4">No active tunnels found</p>
          ) : (
            <div className="space-y-4">
              {tunnels.map((tunnel) => (
                <div key={tunnel.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{tunnel.name}</h3>
                      <Badge variant="secondary">{tunnel.proto}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tunnel.config.addr} → {tunnel.public_url}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {tunnel.metrics.conns.count} connections
                    </Badge>
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
            Configure a new ngrok tunnel for your local development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tunnel-name">Tunnel Name</Label>
              <Input
                id="tunnel-name"
                placeholder="my-app"
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
            Create Tunnel
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
            Test webhook endpoints with custom payloads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://your-tunnel.ngrok.io/webhook"
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
