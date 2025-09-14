/**
 * GENIE PROVIDER STATUS PANEL
 * Real-time AI provider health monitoring and testing interface
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { enhancedAIService } from '@/services/enhancedAIService';
import { useMasterToast } from '@/hooks/useMasterToast';

interface ProviderStatusPanelProps {
  onProviderSelect?: (provider: string) => void;
  compact?: boolean;
}

export const GenieProviderStatusPanel: React.FC<ProviderStatusPanelProps> = ({
  onProviderSelect,
  compact = false
}) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  
  const { showSuccess, showError } = useMasterToast();

  const loadProviderStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await enhancedAIService.getProviderStatus();
      setProviders(status);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load provider status:', error);
      showError('Failed to load provider status');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const testProvider = useCallback(async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const success = await enhancedAIService.testProvider(providerId as any);
      if (success) {
        showSuccess(`${providerId} connection test successful`);
      } else {
        showError(`${providerId} connection test failed`);
      }
      await loadProviderStatus(); // Refresh status
    } catch (error) {
      showError(`Failed to test ${providerId}`);
    } finally {
      setTestingProvider(null);
    }
  }, [showSuccess, showError, loadProviderStatus]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadProviderStatus();
    const interval = setInterval(loadProviderStatus, 30000);
    return () => clearInterval(interval);
  }, [loadProviderStatus]);

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'openai': return '🤖';
      case 'claude': return '🧠';
      case 'gemini': return '💎';
      default: return '🔧';
    }
  };

  const getStatusColor = (available: boolean) => {
    return available ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (available: boolean) => {
    return available ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <Check className="h-3 w-3 mr-1" />
        Online
      </Badge>
    ) : (
      <Badge variant="destructive">
        <X className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  };

  const overallHealth = providers.filter(p => p.available).length / providers.length;
  const healthyCount = providers.filter(p => p.available).length;

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-medium">AI Providers</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadProviderStatus}
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="space-y-2">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getProviderIcon(provider.id)}</span>
                  <span className="text-sm font-medium">{provider.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(provider.available)}
                  {onProviderSelect && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onProviderSelect(provider.id)}
                      disabled={!provider.available}
                    >
                      Use
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-muted-foreground">
            {healthyCount}/{providers.length} providers online
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health</span>
              <span className="text-lg font-bold">
                {Math.round(overallHealth * 100)}%
              </span>
            </div>
            
            <Progress value={overallHealth * 100} className="h-2" />
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{healthyCount} of {providers.length} providers online</span>
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadProviderStatus}
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Provider Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {providers.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`transition-all duration-200 ${
                provider.available ? 'border-green-200' : 'border-red-200'
              }`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getProviderIcon(provider.id)}</span>
                      <span className="text-sm">{provider.name}</span>
                    </div>
                    {getStatusBadge(provider.available)}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Status Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <span>#{provider.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Models:</span>
                      <span>{provider.models.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capabilities:</span>
                      <span>{provider.capabilities.join(', ')}</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className={`flex items-center gap-2 p-2 rounded text-xs ${
                    provider.available 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {provider.available ? (
                      <>
                        <TrendingUp className="h-3 w-3" />
                        <span>Operational</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3" />
                        <span>Unavailable</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testProvider(provider.id)}
                      disabled={testingProvider === provider.id}
                      className="flex-1"
                    >
                      {testingProvider === provider.id ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Zap className="h-3 w-3 mr-1" />
                      )}
                      Test
                    </Button>
                    
                    {onProviderSelect && (
                      <Button
                        variant={provider.available ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onProviderSelect(provider.id)}
                        disabled={!provider.available}
                        className="flex-1"
                      >
                        Use
                      </Button>
                    )}
                  </div>

                  {/* Last Check Time */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Checked: {new Date(provider.lastChecked).toLocaleTimeString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* System Alerts */}
      {healthyCount === 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">All AI Providers Offline</p>
                <p className="text-sm">
                  All AI services are currently unavailable. Please check your configuration and try again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {healthyCount < providers.length && healthyCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Partial Service Degradation</p>
                <p className="text-sm">
                  Some AI providers are unavailable. Fallback providers will be used automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};