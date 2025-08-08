import React from 'react';
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
  TestTube,
  Edit,
  Trash2
} from 'lucide-react';
import { useVoiceConnectors } from '@/hooks/useVoiceConnectors';

interface SharedVoiceConnectorsProps {
  showOverview?: boolean;
  showSecurity?: boolean;
  showActions?: boolean;
  variant?: 'full' | 'simple' | 'overview-only';
}

const SharedVoiceConnectors: React.FC<SharedVoiceConnectorsProps> = ({
  showOverview = true,
  showSecurity = true,
  showActions = true,
  variant = 'full'
}) => {
  const {
    connectors,
    isLoading,
    testConnector,
    updateConnector,
    deleteConnector,
    isTesting,
    isUpdating,
    isDeleting
  } = useVoiceConnectors();

  const getStatusColor = (isActive: boolean, healthStatus: string) => {
    if (!isActive) return 'bg-gray-500';
    switch (healthStatus) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (isActive: boolean, healthStatus: string) => {
    if (!isActive) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    switch (healthStatus) {
      case 'healthy': return <Check className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading voice connectors...</div>;
  }

  if (variant === 'overview-only' && showOverview) {
    return (
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
                  {connectors.filter(c => c.is_active && c.health_status === 'healthy').length}
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
                  {connectors.filter(c => c.health_status === 'warning').length}
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
                <p className="text-sm font-medium text-muted-foreground">Types</p>
                <p className="text-2xl font-bold">
                  {new Set(connectors.map(c => c.connector_type)).size}
                </p>
              </div>
              <Plug className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {variant === 'full' && (
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6">
          <h3 className="font-bold text-indigo-900 mb-2">Voice System Connectors</h3>
          <p className="text-indigo-700">
            Manage and monitor voice system integrations and API connections.
          </p>
        </div>
      )}

      {showOverview && variant !== 'simple' && (
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
                    {connectors.filter(c => c.is_active && c.health_status === 'healthy').length}
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
                    {connectors.filter(c => c.health_status === 'warning').length}
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
                  <p className="text-sm font-medium text-muted-foreground">Types</p>
                  <p className="text-2xl font-bold">
                    {new Set(connectors.map(c => c.connector_type)).size}
                  </p>
                </div>
                <Plug className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connectors.length > 0 ? connectors.map((connector) => (
          <Card key={connector.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(connector.is_active, connector.health_status)}`} />
                  <div>
                    <CardTitle className="text-lg">{connector.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {connector.connector_type}
                      </Badge>
                      {getStatusIcon(connector.is_active, connector.health_status)}
                    </div>
                  </div>
                </div>
                {showActions && (
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {showActions && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={isTesting}
                    onClick={() => testConnector(connector.id)}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {isTesting ? 'Testing...' : 'Test'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    disabled={isUpdating}
                    onClick={() => updateConnector({ id: connector.id, updates: { is_active: !connector.is_active } })}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Toggle
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    disabled={isDeleting}
                    onClick={() => deleteConnector(connector.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-8">
            <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No voice connectors configured</p>
          </div>
        )}
      </div>

      {/* Security & Compliance */}
      {showSecurity && variant === 'full' && (
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
      )}
    </div>
  );
};

export default SharedVoiceConnectors;