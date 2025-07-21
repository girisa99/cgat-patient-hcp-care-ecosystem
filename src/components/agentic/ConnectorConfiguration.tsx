import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Settings, RefreshCw, Zap, Shield, Clock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConnectorConfigurationProps {
  autoSuggestMode: boolean;
  tokenThreshold: number;
  onAutoSuggestChange: (enabled: boolean) => void;
  onTokenThresholdChange: (threshold: number) => void;
  onRefreshSuggestions: () => void;
  isRefreshing: boolean;
  sessionId?: string;
}

export const ConnectorConfiguration: React.FC<ConnectorConfigurationProps> = ({
  autoSuggestMode,
  tokenThreshold,
  onAutoSuggestChange,
  onTokenThresholdChange,
  onRefreshSuggestions,
  isRefreshing,
  sessionId
}) => {
  const [advancedConfig, setAdvancedConfig] = useState({
    maxConnections: 10,
    connectionTimeout: 30,
    retryAttempts: 3,
    securityLevel: 'standard',
    apiTokenPrefix: 'Bearer',
    tokenRotationDays: 90,
    encryptionInTransit: true,
    dataValidation: true,
    auditLogging: true,
    rateLimiting: true,
    complianceFrameworks: [] as string[],
    timeoutStrategy: 'progressive' as string,
    errorHandling: 'graceful' as string,
    cacheTTL: 15 as number,
    batchSize: 50 as number,
    circuitBreaker: false as boolean,
    connectionPooling: false as boolean,
    customConfig: {} as any
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load existing configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, [sessionId]);

  const loadConfiguration = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      // Load from agent_sessions or create a separate config table
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('connectors')
        .eq('id', sessionId)
        .single();

      if (data?.connectors && typeof data.connectors === 'object' && 'configuration' in data.connectors) {
        setAdvancedConfig(prev => ({
          ...prev,
          ...(data.connectors as any).configuration
        }));
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!sessionId) {
      toast({
        title: "Save Failed",
        description: "No session ID provided",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .update({
          connectors: {
            ...{}, // existing connectors data
            configuration: advancedConfig,
            auto_suggest_enabled: autoSuggestMode,
            token_threshold: tokenThreshold,
            last_updated: new Date().toISOString()
          }
        })
        .eq('id', sessionId);

      if (error) throw error;

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      toast({
        title: "Configuration Saved",
        description: "Connector configuration has been successfully saved."
      });

    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigUpdate = (key: string, value: any) => {
    setAdvancedConfig(prev => ({
      ...prev,
      [key]: value
    }));
    
    setHasUnsavedChanges(true);
  };

  const toggleComplianceFramework = (framework: string) => {
    setAdvancedConfig(prev => ({
      ...prev,
      complianceFrameworks: prev.complianceFrameworks.includes(framework)
        ? prev.complianceFrameworks.filter(f => f !== framework)
        : [...prev.complianceFrameworks, framework]
    }));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Connector Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure auto-suggestions, tokens, and thresholds
          </p>
          {lastSaved && (
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 text-orange-600" />
              <span className="text-xs text-orange-600">
                You have unsaved changes
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={onRefreshSuggestions}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Suggestions'}
          </Button>
          <Button 
            onClick={saveConfiguration}
            disabled={isSaving || !hasUnsavedChanges}
            variant={hasUnsavedChanges ? "default" : "outline"}
          >
            <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save Config'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tokens">Tokens & Thresholds</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Auto-Suggestion Settings
              </CardTitle>
              <CardDescription>
                Configure how connector suggestions are generated and displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Auto-Suggest Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically suggest connectors based on agent actions
                  </p>
                </div>
                <Switch
                  checked={autoSuggestMode}
                  onCheckedChange={onAutoSuggestChange}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Max Connections</Label>
                  <Badge variant="outline">{advancedConfig.maxConnections}</Badge>
                </div>
                <Slider
                  value={[advancedConfig.maxConnections]}
                  onValueChange={([value]) => handleConfigUpdate('maxConnections', value)}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of simultaneous connector connections
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Connection Timeout (seconds)</Label>
                  <Badge variant="outline">{advancedConfig.connectionTimeout}s</Badge>
                </div>
                <Slider
                  value={[advancedConfig.connectionTimeout]}
                  onValueChange={([value]) => handleConfigUpdate('connectionTimeout', value)}
                  max={120}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Retry Attempts</Label>
                  <Badge variant="outline">{advancedConfig.retryAttempts}</Badge>
                </div>
                <Slider
                  value={[advancedConfig.retryAttempts]}
                  onValueChange={([value]) => handleConfigUpdate('retryAttempts', value)}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Token Configuration
              </CardTitle>
              <CardDescription>
                Configure token thresholds and matching criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Confidence Threshold</Label>
                  <Badge variant="outline">{Math.round(tokenThreshold * 100)}%</Badge>
                </div>
                <Slider
                  value={[tokenThreshold]}
                  onValueChange={([value]) => onTokenThresholdChange(value)}
                  max={1}
                  min={0.1}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum confidence level for connector suggestions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>API Token Prefix</Label>
                  <Input 
                    placeholder="Bearer, API-Key, etc."
                    value={advancedConfig.apiTokenPrefix}
                    onChange={(e) => handleConfigUpdate('apiTokenPrefix', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Token Rotation (days)</Label>
                  <Input 
                    type="number"
                    placeholder="90"
                    value={advancedConfig.tokenRotationDays}
                    onChange={(e) => handleConfigUpdate('tokenRotationDays', parseInt(e.target.value) || 90)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Token Security Level</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['basic', 'standard', 'high'].map((level) => (
                    <Button
                      key={level}
                      variant={advancedConfig.securityLevel === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigUpdate('securityLevel', level)}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and compliance settings for connectors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Encryption in Transit</Label>
                    <p className="text-sm text-muted-foreground">
                      Encrypt all connector communications
                    </p>
                  </div>
                  <Switch 
                    checked={advancedConfig.encryptionInTransit}
                    onCheckedChange={(checked) => handleConfigUpdate('encryptionInTransit', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Data Validation</Label>
                    <p className="text-sm text-muted-foreground">
                      Validate all incoming and outgoing data
                    </p>
                  </div>
                  <Switch 
                    checked={advancedConfig.dataValidation}
                    onCheckedChange={(checked) => handleConfigUpdate('dataValidation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all connector activities for compliance
                    </p>
                  </div>
                  <Switch 
                    checked={advancedConfig.auditLogging}
                    onCheckedChange={(checked) => handleConfigUpdate('auditLogging', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce rate limits on connector usage
                    </p>
                  </div>
                  <Switch 
                    checked={advancedConfig.rateLimiting}
                    onCheckedChange={(checked) => handleConfigUpdate('rateLimiting', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compliance Framework</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['HIPAA', 'SOC 2', 'GDPR', 'FDA 21 CFR Part 11'].map((framework) => (
                    <Button
                      key={framework}
                      variant={advancedConfig.complianceFrameworks.includes(framework) ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => toggleComplianceFramework(framework)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {framework}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>
                Fine-tune connector behavior and performance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Global Timeout Strategy</Label>
                  <Select 
                    value={advancedConfig.timeoutStrategy || 'progressive'}
                    onValueChange={(value) => handleConfigUpdate('timeoutStrategy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Timeout</SelectItem>
                      <SelectItem value="progressive">Progressive Backoff</SelectItem>
                      <SelectItem value="adaptive">Adaptive Timeout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Error Handling Mode</Label>
                  <Select 
                    value={advancedConfig.errorHandling || 'graceful'}
                    onValueChange={(value) => handleConfigUpdate('errorHandling', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">Strict (Fail Fast)</SelectItem>
                      <SelectItem value="graceful">Graceful Degradation</SelectItem>
                      <SelectItem value="retry">Auto-Retry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cache_ttl">Cache TTL (minutes)</Label>
                    <Input
                      id="cache_ttl"
                      type="number"
                      placeholder="15"
                      value={advancedConfig.cacheTTL || ''}
                      onChange={(e) => handleConfigUpdate('cacheTTL', parseInt(e.target.value) || 15)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch_size">Batch Processing Size</Label>
                    <Input
                      id="batch_size"
                      type="number"
                      placeholder="50"
                      value={advancedConfig.batchSize || ''}
                      onChange={(e) => handleConfigUpdate('batchSize', parseInt(e.target.value) || 50)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Enable Circuit Breaker</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically disable failing connectors
                    </p>
                  </div>
                  <Switch
                    checked={advancedConfig.circuitBreaker || false}
                    onCheckedChange={(checked) => handleConfigUpdate('circuitBreaker', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Connection Pooling</Label>
                    <p className="text-sm text-muted-foreground">
                      Reuse connections for better performance
                    </p>
                  </div>
                  <Switch
                    checked={advancedConfig.connectionPooling || false}
                    onCheckedChange={(checked) => handleConfigUpdate('connectionPooling', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="custom_config">Custom Configuration (JSON)</Label>
                  <Textarea
                    id="custom_config"
                    placeholder='{"custom_header": "value", "special_param": true}'
                    value={advancedConfig.customConfig ? JSON.stringify(advancedConfig.customConfig, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        const customConfig = JSON.parse(e.target.value || '{}');
                        handleConfigUpdate('customConfig', customConfig);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Add custom configuration parameters as JSON
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};