/**
 * STABILITY MONITOR COMPONENT
 * Real-time monitoring of component stability and protection status
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Eye,
  Lock,
  Unlock,
  AlertTriangle 
} from 'lucide-react';
import { componentProtection, ProtectedComponent } from '@/utils/stability/ComponentProtection';

export const StabilityMonitor: React.FC = () => {
  const [protectedComponents, setProtectedComponents] = useState<ProtectedComponent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    refreshComponentStatus();
  }, []);

  const refreshComponentStatus = () => {
    const components = componentProtection.getProtectedComponents();
    setProtectedComponents(components);
    setLastUpdate(new Date());
    console.log('🔄 Stability Monitor: Component status refreshed');
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    console.log('👁️ Stability Monitor: Real-time monitoring started');
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshComponentStatus, 30000);
    
    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    console.log('⏹️ Stability Monitor: Real-time monitoring stopped');
  };

  const getComponentIcon = (component: ProtectedComponent) => {
    if (component.critical) {
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    }
    return <ShieldCheck className="h-4 w-4 text-green-500" />;
  };

  const getComponentStatus = (component: ProtectedComponent) => {
    const validation = componentProtection.validateComponent(component.name);
    return validation.valid ? 'stable' : 'issues';
  };

  const criticalComponents = protectedComponents.filter(c => c.critical);
  const regularComponents = protectedComponents.filter(c => !c.critical);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Component Stability Monitor</h2>
          <p className="text-gray-600">
            Real-time protection status for {protectedComponents.length} components
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshComponentStatus}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isMonitoring ? (
            <Button onClick={stopMonitoring} variant="destructive" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Stop Monitor
            </Button>
          ) : (
            <Button onClick={startMonitoring} variant="default" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Start Monitor
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-blue-500" />
              Total Protected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{protectedComponents.length}</div>
            <p className="text-xs text-gray-500">Components under protection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
              Critical Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalComponents.length}</div>
            <p className="text-xs text-gray-500">Requires special protection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 text-green-500" />
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{lastUpdate.toLocaleTimeString()}</div>
            <p className="text-xs text-gray-500">Status refresh time</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Components Alert */}
      {criticalComponents.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalComponents.length} critical components</strong> are under active protection. 
            Changes to these components should be reviewed carefully.
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Components Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2 text-red-500" />
            Critical Components
          </CardTitle>
          <CardDescription>
            Components essential for application stability and security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criticalComponents.map((component) => (
              <div key={component.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getComponentIcon(component)}
                  <div>
                    <div className="font-medium">{component.name}</div>
                    <div className="text-sm text-gray-500">{component.path}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">v{component.version}</Badge>
                  <Badge 
                    variant={getComponentStatus(component) === 'stable' ? 'default' : 'destructive'}
                  >
                    {getComponentStatus(component)}
                  </Badge>
                  <Lock className="h-4 w-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regular Components Section */}
      {regularComponents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
              Protected Components
            </CardTitle>
            <CardDescription>
              Standard components with basic protection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regularComponents.map((component) => (
                <div key={component.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getComponentIcon(component)}
                    <div>
                      <div className="font-medium">{component.name}</div>
                      <div className="text-sm text-gray-500">{component.path}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">v{component.version}</Badge>
                    <Badge 
                      variant={getComponentStatus(component) === 'stable' ? 'default' : 'destructive'}
                    >
                      {getComponentStatus(component)}
                    </Badge>
                    <Lock className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Monitoring Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Real-time Monitoring: {isMonitoring ? 'Active' : 'Inactive'}
              </p>
              <p className="text-sm text-gray-500">
                {isMonitoring 
                  ? 'Components are being monitored for changes every 30 seconds'
                  : 'Click "Start Monitor" to enable real-time tracking'
                }
              </p>
            </div>
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Monitoring' : 'Standby'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StabilityMonitor;