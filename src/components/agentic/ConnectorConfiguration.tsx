import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, RefreshCw, Zap, Shield, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ConnectorConfigurationProps {
  autoSuggestMode: boolean;
  tokenThreshold: number;
  onAutoSuggestChange: (enabled: boolean) => void;
  onTokenThresholdChange: (threshold: number) => void;
  onRefreshSuggestions: () => void;
  isRefreshing: boolean;
}

export const ConnectorConfiguration: React.FC<ConnectorConfigurationProps> = ({
  autoSuggestMode,
  tokenThreshold,
  onAutoSuggestChange,
  onTokenThresholdChange,
  onRefreshSuggestions,
  isRefreshing
}) => {
  const [advancedConfig, setAdvancedConfig] = useState({
    maxConnections: 10,
    connectionTimeout: 30,
    retryAttempts: 3,
    securityLevel: 'standard'
  });

  const handleConfigUpdate = (key: string, value: any) => {
    setAdvancedConfig(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Configuration Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been updated.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Connector Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure auto-suggestions, tokens, and thresholds
          </p>
        </div>
        <Button 
          onClick={onRefreshSuggestions}
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Suggestions'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tokens">Tokens & Thresholds</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
                    defaultValue="Bearer"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Token Rotation (days)</Label>
                  <Input 
                    type="number"
                    placeholder="90"
                    defaultValue="90"
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
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Data Validation</Label>
                    <p className="text-sm text-muted-foreground">
                      Validate all incoming and outgoing data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all connector activities for compliance
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce rate limits on connector usage
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compliance Framework</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['HIPAA', 'SOC 2', 'GDPR', 'FDA 21 CFR Part 11'].map((framework) => (
                    <Button
                      key={framework}
                      variant="outline"
                      size="sm"
                      className="justify-start"
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
      </Tabs>
    </div>
  );
};