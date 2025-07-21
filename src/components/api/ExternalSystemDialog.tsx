import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Database, Cloud, Zap, Globe, Server, Code, 
  CheckCircle, AlertCircle, Key, Settings,
  ExternalLink, Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMasterApiServices } from '@/hooks/useMasterApiServices';

interface ExternalSystemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSystemAdded?: (system: any) => void;
}

// Pre-defined external systems with their configurations
const EXTERNAL_SYSTEMS = [
  {
    id: 'sap',
    name: 'SAP ERP',
    category: 'Enterprise Resource Planning',
    description: 'SAP ERP integration for business processes',
    icon: <Database className="h-6 w-6" />,
    color: 'blue',
    authTypes: ['oauth', 'basic', 'api_key'],
    endpoints: ['users', 'purchase_orders', 'invoices', 'materials'],
    documentation: 'https://api.sap.com/docs'
  },
  {
    id: 'oracle',
    name: 'Oracle Database',
    category: 'Database',
    description: 'Oracle database connectivity and operations',
    icon: <Server className="h-6 w-6" />,
    color: 'red',
    authTypes: ['database_auth', 'ldap', 'ssl_cert'],
    endpoints: ['query', 'stored_procedures', 'transactions'],
    documentation: 'https://docs.oracle.com/database'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Automation',
    description: 'Zapier webhook integrations and automations',
    icon: <Zap className="h-6 w-6" />,
    color: 'orange',
    authTypes: ['webhook', 'api_key'],
    endpoints: ['trigger_zap', 'webhook_receive'],
    documentation: 'https://zapier.com/developer'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    description: 'Salesforce CRM integration',
    icon: <Cloud className="h-6 w-6" />,
    color: 'blue',
    authTypes: ['oauth', 'jwt', 'session'],
    endpoints: ['accounts', 'contacts', 'opportunities', 'cases'],
    documentation: 'https://developer.salesforce.com'
  },
  {
    id: 'microsoft_graph',
    name: 'Microsoft Graph',
    category: 'Office 365',
    description: 'Microsoft 365 and Azure AD integration',
    icon: <Globe className="h-6 w-6" />,
    color: 'blue',
    authTypes: ['oauth', 'app_only'],
    endpoints: ['users', 'calendars', 'emails', 'files'],
    documentation: 'https://docs.microsoft.com/graph'
  },
  {
    id: 'custom_rest',
    name: 'Custom REST API',
    category: 'Custom',
    description: 'Custom REST API integration',
    icon: <Code className="h-6 w-6" />,
    color: 'green',
    authTypes: ['api_key', 'bearer', 'basic', 'oauth'],
    endpoints: [],
    documentation: ''
  }
];

const ExternalSystemDialog: React.FC<ExternalSystemDialogProps> = ({
  isOpen,
  onClose,
  onSystemAdded
}) => {
  const { toast } = useToast();
  const { createApiService, isCreatingApiService } = useMasterApiServices();
  
  const [selectedSystem, setSelectedSystem] = useState<any>(null);
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [configuration, setConfiguration] = useState({
    serviceName: '',
    description: '',
    baseUrl: '',
    authType: '',
    apiKey: '',
    username: '',
    password: '',
    clientId: '',
    clientSecret: '',
    webhookUrl: '',
    customEndpoints: [''],
    isActive: true,
    environment: 'production'
  });

  const handleSystemSelect = (system: any) => {
    setSelectedSystem(system);
    setConfiguration(prev => ({
      ...prev,
      serviceName: system.name,
      description: system.description,
      authType: system.authTypes[0] || 'api_key'
    }));
    setStep('configure');
  };

  const handleBackToSelection = () => {
    setStep('select');
    setSelectedSystem(null);
    setConfiguration({
      serviceName: '',
      description: '',
      baseUrl: '',
      authType: '',
      apiKey: '',
      username: '',
      password: '',
      clientId: '',
      clientSecret: '',
      webhookUrl: '',
      customEndpoints: [''],
      isActive: true,
      environment: 'production'
    });
  };

  const handleCreateService = async () => {
    if (!selectedSystem || !configuration.serviceName) {
      toast({
        title: "Validation Error",
        description: "Please provide a service name.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields based on auth type
    if (configuration.authType === 'api_key' && !configuration.apiKey) {
      toast({
        title: "Validation Error", 
        description: "API Key is required for this authentication type.",
        variant: "destructive",
      });
      return;
    }

    if (configuration.authType === 'oauth' && (!configuration.clientId || !configuration.clientSecret)) {
      toast({
        title: "Validation Error",
        description: "Client ID and Client Secret are required for OAuth.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createApiService({
        name: configuration.serviceName,
        description: configuration.description,
        type: 'external',
        category: selectedSystem.category,
        purpose: `${selectedSystem.name} integration`,
        direction: 'bidirectional'
      });

      // Store additional configuration in api_integration_registry metadata or separate table
      console.log('📝 External system configuration:', {
        systemId: selectedSystem.id,
        systemName: selectedSystem.name,
        configuration: {
          ...configuration,
          // Mask sensitive data in logs
          apiKey: configuration.apiKey ? '***masked***' : '',
          password: configuration.password ? '***masked***' : '',
          clientSecret: configuration.clientSecret ? '***masked***' : ''
        }
      });

      toast({
        title: "External System Added",
        description: `${configuration.serviceName} has been successfully configured and added to your available connectors.`,
      });

      onSystemAdded?.(selectedSystem);
      onClose();
      handleBackToSelection();
      
    } catch (error) {
      console.error('❌ Error creating external system:', error);
    }
  };

  const addCustomEndpoint = () => {
    setConfiguration(prev => ({
      ...prev,
      customEndpoints: [...prev.customEndpoints, '']
    }));
  };

  const updateCustomEndpoint = (index: number, value: string) => {
    setConfiguration(prev => ({
      ...prev,
      customEndpoints: prev.customEndpoints.map((endpoint, i) => 
        i === index ? value : endpoint
      )
    }));
  };

  const removeCustomEndpoint = (index: number) => {
    setConfiguration(prev => ({
      ...prev,
      customEndpoints: prev.customEndpoints.filter((_, i) => i !== index)
    }));
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      red: 'border-red-200 bg-red-50 hover:bg-red-100',
      orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100', 
      green: 'border-green-200 bg-green-50 hover:bg-green-100'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'select' ? (
              <>
                <Globe className="h-5 w-5" />
                Add External System Integration
              </>
            ) : (
              <>
                <Settings className="h-5 w-5" />
                Configure {selectedSystem?.name}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Select an external system to integrate with your API services
              </p>
              <Badge variant="outline" className="text-xs">
                {EXTERNAL_SYSTEMS.length} systems available
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXTERNAL_SYSTEMS.map((system) => (
                <Card 
                  key={system.id}
                  className={`cursor-pointer transition-all duration-200 ${getColorClasses(system.color)}`}
                  onClick={() => handleSystemSelect(system)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white border border-${system.color}-200`}>
                        {system.icon}
                      </div>
                      <div>
                        <p className="font-semibold">{system.name}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {system.category}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {system.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Auth Types:</span>
                        <div className="flex gap-1">
                          {system.authTypes.slice(0, 2).map(auth => (
                            <Badge key={auth} variant="outline" className="text-xs">
                              {auth}
                            </Badge>
                          ))}
                          {system.authTypes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{system.authTypes.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {system.endpoints.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Endpoints:</span> {system.endpoints.length} available
                        </div>
                      )}
                      
                      {system.documentation && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <ExternalLink className="h-3 w-3" />
                          <span>Documentation available</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'configure' && selectedSystem && (
          <div className="space-y-6">
            {/* System Info Header */}
            <Card className="border-2 border-dashed">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-white border border-${selectedSystem.color}-200`}>
                    {selectedSystem.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedSystem.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedSystem.description}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {selectedSystem.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Basic Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="serviceName">Service Name *</Label>
                    <Input
                      id="serviceName"
                      value={configuration.serviceName}
                      onChange={(e) => setConfiguration(prev => ({
                        ...prev,
                        serviceName: e.target.value
                      }))}
                      placeholder="My SAP Integration"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={configuration.description}
                      onChange={(e) => setConfiguration(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      placeholder="Describe this integration..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="baseUrl">Base URL</Label>
                    <Input
                      id="baseUrl"
                      value={configuration.baseUrl}
                      onChange={(e) => setConfiguration(prev => ({
                        ...prev,
                        baseUrl: e.target.value
                      }))}
                      placeholder="https://api.example.com/v1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select 
                      value={configuration.environment} 
                      onValueChange={(value) => setConfiguration(prev => ({
                        ...prev,
                        environment: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active</Label>
                    <Switch
                      id="isActive"
                      checked={configuration.isActive}
                      onCheckedChange={(checked) => setConfiguration(prev => ({
                        ...prev,
                        isActive: checked
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Authentication Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="authType">Authentication Type</Label>
                    <Select 
                      value={configuration.authType} 
                      onValueChange={(value) => setConfiguration(prev => ({
                        ...prev,
                        authType: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedSystem.authTypes.map(auth => (
                          <SelectItem key={auth} value={auth}>
                            {auth.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dynamic auth fields based on type */}
                  {configuration.authType === 'api_key' && (
                    <div>
                      <Label htmlFor="apiKey">API Key *</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={configuration.apiKey}
                        onChange={(e) => setConfiguration(prev => ({
                          ...prev,
                          apiKey: e.target.value
                        }))}
                        placeholder="Enter your API key"
                      />
                    </div>
                  )}

                  {configuration.authType === 'basic' && (
                    <>
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={configuration.username}
                          onChange={(e) => setConfiguration(prev => ({
                            ...prev,
                            username: e.target.value
                          }))}
                          placeholder="Username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={configuration.password}
                          onChange={(e) => setConfiguration(prev => ({
                            ...prev,
                            password: e.target.value
                          }))}
                          placeholder="Password"
                        />
                      </div>
                    </>
                  )}

                  {configuration.authType === 'oauth' && (
                    <>
                      <div>
                        <Label htmlFor="clientId">Client ID *</Label>
                        <Input
                          id="clientId"
                          value={configuration.clientId}
                          onChange={(e) => setConfiguration(prev => ({
                            ...prev,
                            clientId: e.target.value
                          }))}
                          placeholder="OAuth Client ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientSecret">Client Secret *</Label>
                        <Input
                          id="clientSecret"
                          type="password"
                          value={configuration.clientSecret}
                          onChange={(e) => setConfiguration(prev => ({
                            ...prev,
                            clientSecret: e.target.value
                          }))}
                          placeholder="OAuth Client Secret"
                        />
                      </div>
                    </>
                  )}

                  {configuration.authType === 'webhook' && (
                    <div>
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input
                        id="webhookUrl"
                        value={configuration.webhookUrl}
                        onChange={(e) => setConfiguration(prev => ({
                          ...prev,
                          webhookUrl: e.target.value
                        }))}
                        placeholder="https://hooks.zapier.com/..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Custom Endpoints */}
            {selectedSystem.id === 'custom_rest' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Custom Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {configuration.customEndpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={endpoint}
                        onChange={(e) => updateCustomEndpoint(index, e.target.value)}
                        placeholder="/api/v1/endpoint"
                      />
                      {configuration.customEndpoints.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomEndpoint(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCustomEndpoint}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Endpoint
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {step === 'configure' && (
              <Button variant="outline" onClick={handleBackToSelection}>
                ← Back to Selection
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {step === 'configure' && (
              <Button 
                onClick={handleCreateService}
                disabled={isCreatingApiService || !configuration.serviceName}
              >
                {isCreatingApiService ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add System
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExternalSystemDialog;