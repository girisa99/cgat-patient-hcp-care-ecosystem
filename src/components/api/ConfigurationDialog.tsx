import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Shield, Clock, Database, Zap, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConfigurationDialogProps {
  service: any;
  isOpen: boolean;
  onClose: () => void;
}

const ConfigurationDialog: React.FC<ConfigurationDialogProps> = ({
  service,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("endpoints");
  
  // Configuration state
  const [config, setConfig] = useState({
    endpoints: {
      baseUrl: service?.base_url || '',
      paths: ['/api/v1/data', '/api/v1/health'],
      timeout: 30000
    },
    authentication: {
      type: 'api_key',
      enabled: true,
      keyHeader: 'X-API-Key',
      allowedMethods: ['GET', 'POST']
    },
    rateLimit: {
      enabled: true,
      requests: 1000,
      window: 'hour',
      burst: 50
    },
    documentation: {
      autoGenerate: true,
      includeExamples: true,
      format: 'openapi'
    }
  });

  const handleSaveConfiguration = () => {
    console.log('💾 Saving configuration for:', service?.name, config);
    
    toast({
      title: "Configuration Saved",
      description: `Configuration for ${service?.name} has been updated successfully.`,
    });
    
    onClose();
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {service.name}
          </DialogTitle>
        </DialogHeader>

        {/* Service Info Header */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Service ID:</span>
                <p className="font-mono text-xs">{service.id.slice(0, 8)}...</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Type:</span>
                <Badge variant="outline">{service.type}</Badge>
              </div>
              <div>
                <span className="font-medium text-gray-500">Direction:</span>
                <Badge variant="outline">{service.direction}</Badge>
              </div>
              <div>
                <span className="font-medium text-gray-500">Status:</span>
                <Badge variant={service.status === 'active' ? "default" : "secondary"}>
                  {service.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="endpoints" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="rateLimit" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Rate Limiting
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          {/* Endpoints Configuration */}
          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Endpoints Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={config.endpoints.baseUrl}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      endpoints: { ...prev.endpoints, baseUrl: e.target.value }
                    }))}
                    placeholder="https://api.example.com"
                  />
                </div>
                
                <div>
                  <Label>Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={config.endpoints.timeout}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      endpoints: { ...prev.endpoints, timeout: parseInt(e.target.value) }
                    }))}
                  />
                </div>

                <div>
                  <Label>Available Endpoints</Label>
                  <div className="space-y-2">
                    {config.endpoints.paths.map((path, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={path} readOnly />
                        <Badge variant="outline">GET</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Configuration */}
          <TabsContent value="auth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auth-enabled">Enable Authentication</Label>
                  <Switch
                    id="auth-enabled"
                    checked={config.authentication.enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      authentication: { ...prev.authentication, enabled: checked }
                    }))}
                  />
                </div>

                <div>
                  <Label>Authentication Type</Label>
                  <Select
                    value={config.authentication.type}
                    onValueChange={(value) => setConfig(prev => ({
                      ...prev,
                      authentication: { ...prev.authentication, type: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>API Key Header</Label>
                  <Input
                    value={config.authentication.keyHeader}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      authentication: { ...prev.authentication, keyHeader: e.target.value }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Limiting Configuration */}
          <TabsContent value="rateLimit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Rate Limiting Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rate-enabled">Enable Rate Limiting</Label>
                  <Switch
                    id="rate-enabled"
                    checked={config.rateLimit.enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      rateLimit: { ...prev.rateLimit, enabled: checked }
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Requests per Window</Label>
                    <Input
                      type="number"
                      value={config.rateLimit.requests}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        rateLimit: { ...prev.rateLimit, requests: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Time Window</Label>
                    <Select
                      value={config.rateLimit.window}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        rateLimit: { ...prev.rateLimit, window: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minute">Per Minute</SelectItem>
                        <SelectItem value="hour">Per Hour</SelectItem>
                        <SelectItem value="day">Per Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Burst Limit</Label>
                  <Input
                    type="number"
                    value={config.rateLimit.burst}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      rateLimit: { ...prev.rateLimit, burst: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Configuration */}
          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Documentation Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-docs">Auto-generate Documentation</Label>
                  <Switch
                    id="auto-docs"
                    checked={config.documentation.autoGenerate}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      documentation: { ...prev.documentation, autoGenerate: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-examples">Include Examples</Label>
                  <Switch
                    id="include-examples"
                    checked={config.documentation.includeExamples}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      documentation: { ...prev.documentation, includeExamples: checked }
                    }))}
                  />
                </div>

                <div>
                  <Label>Documentation Format</Label>
                  <Select
                    value={config.documentation.format}
                    onValueChange={(value) => setConfig(prev => ({
                      ...prev,
                      documentation: { ...prev.documentation, format: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openapi">OpenAPI 3.0</SelectItem>
                      <SelectItem value="swagger">Swagger 2.0</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveConfiguration}>
            <Settings className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigurationDialog;