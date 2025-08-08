import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Plug, 
  Shield, 
  Zap,
  Check,
  AlertCircle,
  Settings,
  ExternalLink,
  PowerOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VoiceConnectors = () => {
  const { toast } = useToast();
  const [testingConnector, setTestingConnector] = useState<string | null>(null);

  const connectors = [
    {
      id: 'twilio-sip',
      name: 'Twilio SIP Trunk',
      type: 'SIP',
      status: 'connected',
      description: 'Primary SIP trunk for voice communication',
      endpoints: ['sip.twilio.com', 'backup.twilio.com'],
      features: ['Failover', 'Load Balancing', 'E911']
    },
    {
      id: 'five9-api',
      name: 'Five9 API Integration',
      type: 'API',
      status: 'connected',
      description: 'Cloud contact center integration',
      endpoints: ['api.five9.com'],
      features: ['Real-time Events', 'Agent Status', 'Call Control']
    },
    {
      id: 'genesys-cloud',
      name: 'Genesys Cloud',
      type: 'Cloud',
      status: 'warning',
      description: 'Omnichannel orchestration platform',
      endpoints: ['mypurecloud.com'],
      features: ['Omnichannel', 'AI Insights', 'Workforce Management']
    },
    {
      id: 'vonage-api',
      name: 'Vonage Voice API',
      type: 'API',
      status: 'connected',
      description: 'Global voice communication platform',
      endpoints: ['api.nexmo.com'],
      features: ['Global Coverage', 'WebRTC', 'Recording']
    }
  ];

  const handleTestConnector = async (connectorId: string, connectorName: string) => {
    setTestingConnector(connectorId);
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: `${connectorName} Test Successful`,
        description: "Connector is responding normally with good latency.",
      });
    } catch (error) {
      toast({
        title: `${connectorName} Test Failed`,
        description: "Unable to establish connection. Check configuration.",
        variant: "destructive",
      });
    } finally {
      setTestingConnector(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Check className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6">
        <h3 className="font-bold text-indigo-900 mb-2">Voice System Connectors</h3>
        <p className="text-indigo-700">
          Manage and monitor voice system integrations and API connections.
        </p>
      </div>

      {/* Connection Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Connectors</p>
                <p className="text-2xl font-bold">{connectors.length}</p>
              </div>
              <Network className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {connectors.filter(c => c.status === 'connected').length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {connectors.filter(c => c.status === 'warning').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Types</p>
                <p className="text-2xl font-bold">
                  {new Set(connectors.map(c => c.type)).size}
                </p>
              </div>
              <Plug className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connectors.map((connector) => (
          <Card key={connector.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(connector.status)}`} />
                  <div>
                    <CardTitle className="text-lg">{connector.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {connector.type}
                      </Badge>
                      {getStatusIcon(connector.status)}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {connector.description}
              </p>

              <div>
                <h4 className="text-sm font-medium mb-2">Endpoints</h4>
                <div className="space-y-1">
                  {connector.endpoints.map((endpoint, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-3 w-3" />
                      <span className="font-mono text-xs">{endpoint}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Features</h4>
                <div className="flex gap-1 flex-wrap">
                  {connector.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={testingConnector === connector.id}
                  onClick={() => handleTestConnector(connector.id, connector.name)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {testingConnector === connector.id ? 'Testing...' : 'Test'}
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="ghost">
                  <PowerOff className="h-4 w-4 mr-2" />
                  Disable
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Encryption Status</h4>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">TLS 1.3 Enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">SRTP Media Encryption</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Compliance</h4>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">SOC 2 Type II</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Monitoring</h4>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Real-time Health Checks</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Automated Alerts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceConnectors;