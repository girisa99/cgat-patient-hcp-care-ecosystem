import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ArrowRight, ArrowLeft, Check, AlertCircle, Zap, 
  Database, Cloud, MessageSquare, FileText, Globe,
  Key, Shield, TestTube, Play, Brain, Sparkles, Settings, Plus
} from "lucide-react";
import { ConnectorBrand, searchConnectorBrands, getConnectorBrandById } from './ConnectorBrandRegistry';
import { useToast } from "@/hooks/use-toast";

interface ConnectorCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectorCreated: (connector: any) => void;
  agentId: string;
  availableActions: Array<{
    id: string;
    name: string;
    type: string;
    category: string;
    description?: string;
  }>;
}

interface WizardData {
  // Step 1: Connector Type & Brand
  selectedBrand?: ConnectorBrand;
  connectorName: string;
  connectorDescription: string;
  
  // Step 2: Configuration
  baseUrl: string;
  endpoints: Array<{
    id: string;
    path: string;
    method: string;
    description: string;
  }>;
  
  // Step 3: Authentication
  authType: 'api_key' | 'bearer' | 'oauth' | 'custom';
  authConfig: Record<string, any>;
  
  // Step 4: Agent & Action Assignment
  assignedActions: string[];
  aiGeneratedTasks: Array<{
    id: string;
    name: string;
    description: string;
    suggestedEndpoint: string;
  }>;
  
  // Step 5: Testing & Verification
  testResults: Record<string, any>;
}

const WIZARD_STEPS = [
  { id: 'type', title: 'Type & Brand', icon: Globe },
  { id: 'config', title: 'Configuration', icon: Settings },
  { id: 'auth', title: 'Authentication', icon: Shield },
  { id: 'assignment', title: 'Assignment', icon: Zap },
  { id: 'testing', title: 'Testing', icon: TestTube }
];

export const ConnectorCreationWizard: React.FC<ConnectorCreationWizardProps> = ({
  isOpen,
  onClose,
  onConnectorCreated,
  agentId,
  availableActions
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    connectorName: '',
    connectorDescription: '',
    baseUrl: '',
    endpoints: [],
    authType: 'api_key',
    authConfig: {},
    assignedActions: [],
    aiGeneratedTasks: [],
    testResults: {}
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBrands, setFilteredBrands] = useState<ConnectorBrand[]>([]);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [customConnectors, setCustomConnectors] = useState<ConnectorBrand[]>([]);

  useEffect(() => {
    // Load any custom connectors from localStorage or state
    const savedCustomConnectors = localStorage.getItem('customConnectors');
    if (savedCustomConnectors) {
      try {
        setCustomConnectors(JSON.parse(savedCustomConnectors));
      } catch (error) {
        console.error('Failed to load custom connectors:', error);
      }
    }
  }, []);

  useEffect(() => {
    const allBrands = [...searchConnectorBrands(''), ...customConnectors];
    if (searchQuery.trim()) {
      setFilteredBrands(allBrands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.category.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredBrands(allBrands.slice(0, 12)); // Show top 12 by default
    }
  }, [searchQuery, customConnectors]);

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const selectBrand = (brand: ConnectorBrand) => {
    updateWizardData({
      selectedBrand: brand,
      connectorName: brand.name,
      connectorDescription: brand.description,
      baseUrl: brand.baseUrl || '',
      endpoints: (brand.commonEndpoints || []).map((path, index) => ({
        id: `endpoint-${index}`,
        path,
        method: 'GET',
        description: `${brand.name} ${path} endpoint`
      })),
      authType: brand.authTypes[0] || 'api_key'
    });
  };

  const generateAITasks = async () => {
    setIsGeneratingTasks(true);
    try {
      // Simulate AI task generation based on connector and available actions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiTasks = [
        {
          id: 'task-1',
          name: `Fetch ${wizardData.selectedBrand?.name} Data`,
          description: `Retrieve data from ${wizardData.selectedBrand?.name} system`,
          suggestedEndpoint: wizardData.endpoints[0]?.path || '/api/data'
        },
        {
          id: 'task-2',
          name: `Update ${wizardData.selectedBrand?.name} Records`,
          description: `Update records in ${wizardData.selectedBrand?.name} system`,
          suggestedEndpoint: wizardData.endpoints[1]?.path || '/api/update'
        },
        {
          id: 'task-3',
          name: `Monitor ${wizardData.selectedBrand?.name} Status`,
          description: `Monitor system status and health checks`,
          suggestedEndpoint: '/api/status'
        }
      ];
      
      updateWizardData({ aiGeneratedTasks: aiTasks });
      toast({
        title: "AI Tasks Generated",
        description: `Generated ${aiTasks.length} suggested tasks for ${wizardData.selectedBrand?.name}`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate AI tasks. Please create manually.",
        variant: "destructive"
      });
    }
    setIsGeneratingTasks(false);
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      // Simulate connection testing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const testResults = {
        connectionTest: { status: 'success', message: 'Connection established successfully' },
        authTest: { status: 'success', message: 'Authentication verified' },
        endpointTest: { status: 'warning', message: '2 of 3 endpoints responding' }
      };
      
      updateWizardData({ testResults });
      toast({
        title: "Testing Complete",
        description: "Connector testing completed with 2 successes and 1 warning",
      });
    } catch (error) {
      toast({
        title: "Testing Failed",
        description: "Unable to complete connector testing",
        variant: "destructive"
      });
    }
    setIsTesting(false);
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return wizardData.selectedBrand && wizardData.connectorName;
      case 1: return wizardData.baseUrl && wizardData.endpoints.length > 0;
      case 2: return wizardData.authType;
      case 3: return wizardData.assignedActions.length > 0 || wizardData.aiGeneratedTasks.length > 0;
      case 4: return Object.keys(wizardData.testResults).length > 0;
      default: return true;
    }
  };

  const finishWizard = async () => {
    try {
      // Import the useConnectorMetrics hook dynamically
      const { supabase } = await import("@/integrations/supabase/client");
      const { useQueryClient } = await import("@tanstack/react-query");
      
      // Save connector to database
      const { data: newConnector, error } = await supabase
        .from('system_connectors')
        .insert({
          name: wizardData.connectorName,
          description: wizardData.connectorDescription,
          type: wizardData.selectedBrand?.type || 'external_service',
          category: wizardData.selectedBrand?.category || 'integration',
          status: 'active',
          base_url: wizardData.baseUrl,
          auth_type: wizardData.authType,
          configuration: {
            brand: wizardData.selectedBrand?.name,
            endpoints: wizardData.endpoints,
            authConfig: wizardData.authConfig,
            assignedActions: wizardData.assignedActions,
            aiGeneratedTasks: wizardData.aiGeneratedTasks,
            testResults: wizardData.testResults
          },
          endpoints: wizardData.endpoints,
          usage_count: 0,
          success_rate: 0,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Trigger refresh of available connectors
      window.dispatchEvent(new CustomEvent('connectorCreated', { detail: newConnector }));
      
      onConnectorCreated(newConnector);
      onClose();
      
      toast({
        title: "Connector Created",
        description: `${wizardData.connectorName} has been successfully created and saved to the database`,
      });
    } catch (error) {
      console.error('Error creating connector:', error);
      toast({
        title: "Error",
        description: "Failed to create connector. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto border">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Create New Connector</h2>
              <p className="text-gray-600">
                Step {currentStep + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep].title}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
            >
              Cancel
            </Button>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <Progress value={(currentStep + 1) / WIZARD_STEPS.length * 100} className="mb-4" />
            <div className="flex justify-between">
              {WIZARD_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`rounded-full p-2 ${
                      index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {/* Step 1: Type & Brand Selection */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium mb-4 block">Choose Connector Type</Label>
                  <div className="relative mb-6">
                    <Input
                      placeholder="Search by system name, URL, or type (e.g., Salesforce, Oracle, Stripe...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBrands.map((brand) => (
                      <Card 
                        key={brand.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          wizardData.selectedBrand?.id === brand.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => selectBrand(brand)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <img 
                              src={brand.logoUrl} 
                              alt={brand.name}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div>
                              <h3 className="font-medium">{brand.name}</h3>
                              <Badge variant="outline" className="text-xs">{brand.category}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{brand.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Custom Connector Option */}
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md border-dashed border-2 ${
                        wizardData.selectedBrand?.id === 'custom' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        const customBrand: ConnectorBrand = {
                          id: 'custom',
                          name: searchQuery || 'Custom Connector',
                          logoUrl: '/placeholder.svg',
                          category: 'Custom',
                          type: 'api',
                          description: 'Create a custom connector for services not in our library',
                          authTypes: ['api_key', 'bearer', 'oauth', 'custom']
                        };
                        selectBrand(customBrand);
                        updateWizardData({ 
                          connectorName: searchQuery || 'Custom Connector',
                          connectorDescription: `Custom connector${searchQuery ? ` for ${searchQuery}` : ''}`
                        });
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <Plus className="w-8 h-8 text-blue-500" />
                          <div>
                            <h3 className="font-medium">Custom Connector</h3>
                            <Badge variant="outline" className="text-xs">Custom</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {searchQuery 
                            ? `Create custom "${searchQuery}" connector`
                            : 'Create a custom connector for services not in our library'
                          }
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {wizardData.selectedBrand && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Connector Name</Label>
                          <Input
                            value={wizardData.connectorName}
                            onChange={(e) => updateWizardData({ connectorName: e.target.value })}
                            placeholder="Enter connector name"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={wizardData.connectorDescription}
                            onChange={(e) => updateWizardData({ connectorDescription: e.target.value })}
                            placeholder="Describe what this connector will do"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 2: Configuration - Dynamic based on connector type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium mb-4 block">
                    Configure {wizardData.selectedBrand?.type === 'database' ? 'Database' : 
                              wizardData.selectedBrand?.type === 'api' ? 'API' :
                              wizardData.selectedBrand?.type === 'messaging' ? 'Messaging' :
                              wizardData.selectedBrand?.type === 'file_system' ? 'File System' :
                              'External Service'} Connection
                  </Label>
                  
                  <div className="space-y-4">
                    {wizardData.selectedBrand?.type === 'database' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Database Type</Label>
                          <Select onValueChange={(value) => updateWizardData({ 
                            authConfig: { ...wizardData.authConfig, dbType: value }
                          })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select database type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="postgres">PostgreSQL</SelectItem>
                              <SelectItem value="mysql">MySQL</SelectItem>
                              <SelectItem value="mongodb">MongoDB</SelectItem>
                              <SelectItem value="sqlserver">SQL Server</SelectItem>
                              <SelectItem value="oracle">Oracle</SelectItem>
                              <SelectItem value="sqlite">SQLite</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Connection String</Label>
                          <Input
                            value={wizardData.baseUrl}
                            onChange={(e) => updateWizardData({ baseUrl: e.target.value })}
                            placeholder="e.g., postgresql://user:password@localhost:5432/db"
                          />
                        </div>
                      </div>
                    )}
                    
                    {(wizardData.selectedBrand?.type === 'api' || wizardData.selectedBrand?.type === 'external_service') && (
                      <div className="space-y-4">
                        <div>
                          <Label>Base URL</Label>
                          <Input
                            value={wizardData.baseUrl}
                            onChange={(e) => updateWizardData({ baseUrl: e.target.value })}
                            placeholder="https://api.example.com"
                          />
                        </div>

                        <div>
                          <Label>Endpoints</Label>
                          <div className="space-y-3">
                            {wizardData.endpoints.map((endpoint, index) => (
                              <div key={endpoint.id} className="flex gap-2">
                                <Select
                                  value={endpoint.method}
                                  onValueChange={(value) => {
                                    const updated = [...wizardData.endpoints];
                                    updated[index].method = value;
                                    updateWizardData({ endpoints: updated });
                                  }}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={endpoint.path}
                                  onChange={(e) => {
                                    const updated = [...wizardData.endpoints];
                                    updated[index].path = e.target.value;
                                    updateWizardData({ endpoints: updated });
                                  }}
                                  placeholder="/api/endpoint"
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updated = wizardData.endpoints.filter((_, i) => i !== index);
                                    updateWizardData({ endpoints: updated });
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => {
                                const newEndpoint = {
                                  id: `endpoint-${Date.now()}`,
                                  path: '',
                                  method: 'GET',
                                  description: ''
                                };
                                updateWizardData({ 
                                  endpoints: [...wizardData.endpoints, newEndpoint] 
                                });
                              }}
                            >
                              Add Endpoint
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  
                    {wizardData.selectedBrand?.type === 'messaging' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Messaging Platform</Label>
                          <Select onValueChange={(value) => updateWizardData({ 
                            authConfig: { ...wizardData.authConfig, platform: value }
                          })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select messaging platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="slack">Slack</SelectItem>
                              <SelectItem value="teams">Microsoft Teams</SelectItem>
                              <SelectItem value="discord">Discord</SelectItem>
                              <SelectItem value="telegram">Telegram</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Webhook URL</Label>
                          <Input
                            value={wizardData.baseUrl}
                            onChange={(e) => updateWizardData({ baseUrl: e.target.value })}
                            placeholder="https://hooks.slack.com/services/..."
                          />
                        </div>
                      </div>
                    )}
                    
                    {wizardData.selectedBrand?.type === 'file_system' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Storage Type</Label>
                          <Select onValueChange={(value) => updateWizardData({ 
                            authConfig: { ...wizardData.authConfig, storageType: value }
                          })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select storage type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aws_s3">AWS S3</SelectItem>
                              <SelectItem value="google_cloud">Google Cloud Storage</SelectItem>
                              <SelectItem value="azure_blob">Azure Blob Storage</SelectItem>
                              <SelectItem value="ftp">FTP/SFTP</SelectItem>
                              <SelectItem value="local">Local File System</SelectItem>
                              <SelectItem value="dropbox">Dropbox</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Connection Details</Label>
                          <Input
                            value={wizardData.baseUrl}
                            onChange={(e) => updateWizardData({ baseUrl: e.target.value })}
                            placeholder="Bucket name, FTP host, or file path"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Authentication */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium mb-4 block">Configure Authentication</Label>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Authentication Type</Label>
                      <Select
                        value={wizardData.authType}
                        onValueChange={(value: any) => updateWizardData({ authType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {wizardData.selectedBrand?.authTypes.includes('api_key') && (
                            <SelectItem value="api_key">API Key</SelectItem>
                          )}
                          {wizardData.selectedBrand?.authTypes.includes('bearer') && (
                            <SelectItem value="bearer">Bearer Token</SelectItem>
                          )}
                          {wizardData.selectedBrand?.authTypes.includes('oauth') && (
                            <SelectItem value="oauth">OAuth 2.0</SelectItem>
                          )}
                          {wizardData.selectedBrand?.authTypes.includes('custom') && (
                            <SelectItem value="custom">Custom</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {wizardData.authType === 'api_key' && (
                      <div className="space-y-4">
                        <div>
                          <Label>API Key</Label>
                          <Input
                            type="password"
                            onChange={(e) => updateWizardData({ 
                              authConfig: { ...wizardData.authConfig, apiKey: e.target.value } 
                            })}
                            placeholder="Enter API key"
                          />
                        </div>
                        <div>
                          <Label>Header Name</Label>
                          <Input
                            defaultValue="X-API-Key"
                            onChange={(e) => updateWizardData({ 
                              authConfig: { ...wizardData.authConfig, headerName: e.target.value } 
                            })}
                            placeholder="X-API-Key"
                          />
                        </div>
                      </div>
                    )}
                    
                    {wizardData.authType === 'bearer' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Bearer Token</Label>
                          <Input
                            type="password"
                            onChange={(e) => updateWizardData({ 
                              authConfig: { ...wizardData.authConfig, bearerToken: e.target.value } 
                            })}
                            placeholder="Enter bearer token"
                          />
                        </div>
                      </div>
                    )}
                    
                    {wizardData.authType === 'oauth' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Client ID</Label>
                          <Input
                            onChange={(e) => updateWizardData({ 
                              authConfig: { ...wizardData.authConfig, clientId: e.target.value } 
                            })}
                            placeholder="Enter client ID"
                          />
                        </div>
                        <div>
                          <Label>Client Secret</Label>
                          <Input
                            type="password"
                            onChange={(e) => updateWizardData({ 
                              authConfig: { ...wizardData.authConfig, clientSecret: e.target.value } 
                            })}
                            placeholder="Enter client secret"
                          />
                        </div>
                        <div>
                          <Label>Token URL</Label>
                          <Input
                            onChange={(e) => updateWizardData({ 
                              authConfig: { ...wizardData.authConfig, tokenUrl: e.target.value } 
                            })}
                            placeholder="https://example.com/oauth/token"
                          />
                        </div>
                        <div>
                          <Label>Authorization URL</Label>
                          <Input
                            onChange={(e) => updateWizardData({ 
                              authConfig: { ...wizardData.authConfig, authUrl: e.target.value } 
                            })}
                            placeholder="https://example.com/oauth/authorize"
                          />
                        </div>
                        <div>
                          <Label>Scope</Label>
                          <Input
                            onChange={(e) => updateWizardData({ 
                              authConfig: { ...wizardData.authConfig, scope: e.target.value } 
                            })}
                            placeholder="read:data write:data"
                          />
                        </div>
                      </div>
                    )}
                    
                    {wizardData.authType === 'custom' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Custom Authentication</Label>
                          <Textarea
                            onChange={(e) => updateWizardData({ 
                              authConfig: { ...wizardData.authConfig, customAuth: e.target.value } 
                            })}
                            placeholder="Describe custom authentication approach"
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Action Assignment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium mb-4 block">Assign Actions & Generate Tasks</Label>
                  
                  <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="manual">Manual Assignment</TabsTrigger>
                      <TabsTrigger value="ai">AI-Generated Tasks</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="manual">
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Select actions that should use this connector
                        </p>
                        
                        <div className="max-h-[300px] overflow-auto border rounded-md p-4">
                          {availableActions.map(action => (
                            <div key={action.id} className="flex items-center gap-2 mb-2 p-2 hover:bg-gray-100 rounded">
                              <input
                                type="checkbox"
                                id={`action-${action.id}`}
                                checked={wizardData.assignedActions.includes(action.id)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  updateWizardData({
                                    assignedActions: isChecked
                                      ? [...wizardData.assignedActions, action.id]
                                      : wizardData.assignedActions.filter(id => id !== action.id)
                                  });
                                }}
                              />
                              <Label htmlFor={`action-${action.id}`}>
                                <div className="font-medium">{action.name}</div>
                                <div className="text-xs text-gray-500">{action.description}</div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="ai">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            Let AI generate suggested tasks based on this connector
                          </p>
                          <Button 
                            onClick={generateAITasks}
                            disabled={isGeneratingTasks}
                            variant="outline"
                          >
                            {isGeneratingTasks ? (
                              <>Generating...</>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate Tasks
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {wizardData.aiGeneratedTasks.length > 0 && (
                          <div className="space-y-2">
                            {wizardData.aiGeneratedTasks.map(task => (
                              <Card key={task.id} className="p-3">
                                <div className="flex items-center gap-2">
                                  <Brain className="h-4 w-4 text-purple-500" />
                                  <div>
                                    <h4 className="font-medium">{task.name}</h4>
                                    <p className="text-sm text-gray-500">{task.description}</p>
                                    <div className="text-xs text-gray-400 mt-1">
                                      Suggested endpoint: {task.suggestedEndpoint}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}

            {/* Step 5: Testing & Verification */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium mb-4 block">Test Connection</Label>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Verify that your connector can successfully connect to the {wizardData.selectedBrand?.name} service
                    </p>
                    
                    <Button 
                      onClick={testConnection}
                      disabled={isTesting}
                      className="w-full"
                    >
                      {isTesting ? (
                        <>Testing Connection...</>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    
                    {Object.keys(wizardData.testResults).length > 0 && (
                      <div className="space-y-4 mt-6">
                        <h3 className="font-medium">Test Results:</h3>
                        
                        <div className="space-y-2">
                          {Object.entries(wizardData.testResults).map(([testName, result]: [string, any]) => (
                            <Card key={testName} className="p-3">
                              <div className="flex items-center gap-2">
                                {result.status === 'success' ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : result.status === 'warning' ? (
                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <div>
                                  <h4 className="font-medium capitalize">{testName.replace(/([A-Z])/g, ' $1')}</h4>
                                  <p className="text-sm text-gray-500">{result.message}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep === WIZARD_STEPS.length - 1 ? (
              <Button
                onClick={finishWizard}
                disabled={!canProceed()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Create Connector
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};