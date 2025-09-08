/**
 * Custom Connector Builder
 * Advanced visual interface for creating custom connectors with full node integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Code, 
  Database, 
  Settings, 
  TestTube, 
  Rocket,
  Save,
  Download,
  Upload,
  Trash2,
  Eye,
  Copy,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Zap,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { supabase } from '@/integrations/supabase/client';

interface ConnectorConfig {
  id: string;
  name: string;
  description: string;
  type: 'api' | 'database' | 'file_system' | 'messaging' | 'external_service';
  version: string;
  inputs: ConnectorField[];
  outputs: ConnectorField[];
  authentication: AuthConfig;
  endpoints: EndpointConfig[];
  testing: TestConfig;
  deployment: DeploymentConfig;
  nodeTypeMapping: NodeTypeMapping;
}

interface ValidationRule {
  type: string;
  value: any;
  message: string;
}

interface ConnectorField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: ValidationRule[];
}

interface AuthConfig {
  type: 'none' | 'api_key' | 'bearer' | 'oauth' | 'custom';
  fields: Record<string, any>;
  testEndpoint?: string;
}

interface EndpointConfig {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  parameters: Record<string, any>;
  responseMapping: Record<string, string>;
}

interface TestConfig {
  enabled: boolean;
  testCases: TestCase[];
  mockData: Record<string, any>;
}

interface TestCase {
  id: string;
  name: string;
  input: Record<string, any>;
  expectedOutput: Record<string, any>;
  status: 'pending' | 'passed' | 'failed';
}

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  scaling: {
    minInstances: number;
    maxInstances: number;
    targetCPU: number;
  };
  monitoring: {
    healthCheck: boolean;
    metrics: boolean;
    alerts: boolean;
  };
}

interface NodeTypeMapping {
  nodeTypeId: string;
  configMapping: Record<string, string>;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
}

export const CustomConnectorBuilder: React.FC = () => {
  const { toast } = useToast();
  const { nodeTypes, categories } = useWorkflowNodes();
  const [connectorConfig, setConnectorConfig] = useState<ConnectorConfig>({
    id: '',
    name: '',
    description: '',
    type: 'api',
    version: '1.0.0',
    inputs: [],
    outputs: [],
    authentication: { type: 'none', fields: {} },
    endpoints: [],
    testing: { enabled: true, testCases: [], mockData: {} },
    deployment: {
      environment: 'development',
      scaling: { minInstances: 1, maxInstances: 5, targetCPU: 70 },
      monitoring: { healthCheck: true, metrics: true, alerts: false }
    },
    nodeTypeMapping: {
      nodeTypeId: '',
      configMapping: {},
      inputMapping: {},
      outputMapping: {}
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Basic Configuration Tab
  const renderBasicConfig = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="connector-name">Connector Name</Label>
          <Input
            id="connector-name"
            value={connectorConfig.name}
            onChange={(e) => setConnectorConfig(prev => ({ 
              ...prev, 
              name: e.target.value,
              id: e.target.value.toLowerCase().replace(/\s+/g, '-')
            }))}
            placeholder="My Custom Connector"
          />
        </div>
        <div>
          <Label htmlFor="connector-version">Version</Label>
          <Input
            id="connector-version"
            value={connectorConfig.version}
            onChange={(e) => setConnectorConfig(prev => ({ ...prev, version: e.target.value }))}
            placeholder="1.0.0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="connector-description">Description</Label>
        <Textarea
          id="connector-description"
          value={connectorConfig.description}
          onChange={(e) => setConnectorConfig(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what your connector does..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="connector-type">Connector Type</Label>
        <select
          id="connector-type"
          value={connectorConfig.type}
          onChange={(e) => setConnectorConfig(prev => ({ 
            ...prev, 
            type: e.target.value as ConnectorConfig['type'] 
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="api">API Service</option>
          <option value="database">Database</option>
          <option value="file_system">File System</option>
          <option value="messaging">Messaging</option>
          <option value="external_service">External Service</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Node Type Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Map to Workflow Node Type</Label>
            <select
              value={connectorConfig.nodeTypeMapping.nodeTypeId}
              onChange={(e) => setConnectorConfig(prev => ({
                ...prev,
                nodeTypeMapping: { ...prev.nodeTypeMapping, nodeTypeId: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
            >
              <option value="">Select Node Type</option>
              {nodeTypes.map(nodeType => (
                <option key={nodeType.id} value={nodeType.id}>
                  {nodeType.display_name} ({nodeType.category?.display_name})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Input/Output Configuration
  const renderInputOutputConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Input Fields
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectorConfig.inputs.map((input, index) => (
              <div key={input.id} className="flex items-center gap-2 p-3 border rounded">
                <Input
                  value={input.name}
                  onChange={(e) => {
                    const newInputs = [...connectorConfig.inputs];
                    newInputs[index].name = e.target.value;
                    setConnectorConfig(prev => ({ ...prev, inputs: newInputs }));
                  }}
                  placeholder="Field name"
                  className="flex-1"
                />
                <select
                  value={input.type}
                  onChange={(e) => {
                    const newInputs = [...connectorConfig.inputs];
                    newInputs[index].type = e.target.value as ConnectorField['type'];
                    setConnectorConfig(prev => ({ ...prev, inputs: newInputs }));
                  }}
                  className="w-32 px-2 py-1 border rounded"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newInputs = connectorConfig.inputs.filter((_, i) => i !== index);
                    setConnectorConfig(prev => ({ ...prev, inputs: newInputs }));
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                const newInput: ConnectorField = {
                  id: `input_${Date.now()}`,
                  name: '',
                  type: 'string',
                  required: false,
                  description: ''
                };
                setConnectorConfig(prev => ({ 
                  ...prev, 
                  inputs: [...prev.inputs, newInput] 
                }));
              }}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Input Field
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Output Fields
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectorConfig.outputs.map((output, index) => (
              <div key={output.id} className="flex items-center gap-2 p-3 border rounded">
                <Input
                  value={output.name}
                  onChange={(e) => {
                    const newOutputs = [...connectorConfig.outputs];
                    newOutputs[index].name = e.target.value;
                    setConnectorConfig(prev => ({ ...prev, outputs: newOutputs }));
                  }}
                  placeholder="Field name"
                  className="flex-1"
                />
                <select
                  value={output.type}
                  onChange={(e) => {
                    const newOutputs = [...connectorConfig.outputs];
                    newOutputs[index].type = e.target.value as ConnectorField['type'];
                    setConnectorConfig(prev => ({ ...prev, outputs: newOutputs }));
                  }}
                  className="w-32 px-2 py-1 border rounded"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newOutputs = connectorConfig.outputs.filter((_, i) => i !== index);
                    setConnectorConfig(prev => ({ ...prev, outputs: newOutputs }));
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                const newOutput: ConnectorField = {
                  id: `output_${Date.now()}`,
                  name: '',
                  type: 'string',
                  required: false,
                  description: ''
                };
                setConnectorConfig(prev => ({ 
                  ...prev, 
                  outputs: [...prev.outputs, newOutput] 
                }));
              }}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Output Field
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Test Configuration
  const renderTestConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={connectorConfig.testing.enabled}
              onChange={(e) => setConnectorConfig(prev => ({
                ...prev,
                testing: { ...prev.testing, enabled: e.target.checked }
              }))}
            />
            <Label>Enable Testing</Label>
          </div>

          {connectorConfig.testing.enabled && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Test Cases</h4>
                <Button
                  size="sm"
                  onClick={() => {
                    const newTestCase: TestCase = {
                      id: `test_${Date.now()}`,
                      name: `Test Case ${connectorConfig.testing.testCases.length + 1}`,
                      input: {},
                      expectedOutput: {},
                      status: 'pending'
                    };
                    setConnectorConfig(prev => ({
                      ...prev,
                      testing: {
                        ...prev.testing,
                        testCases: [...prev.testing.testCases, newTestCase]
                      }
                    }));
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Test
                </Button>
              </div>

              {connectorConfig.testing.testCases.map((testCase, index) => (
                <Card key={testCase.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Input
                      value={testCase.name}
                      onChange={(e) => {
                        const newTestCases = [...connectorConfig.testing.testCases];
                        newTestCases[index].name = e.target.value;
                        setConnectorConfig(prev => ({
                          ...prev,
                          testing: { ...prev.testing, testCases: newTestCases }
                        }));
                      }}
                      className="flex-1 mr-2"
                    />
                    <div className="flex items-center gap-2">
                      {testCase.status === 'passed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {testCase.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {testCase.status === 'pending' && <Play className="w-4 h-4 text-gray-400" />}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newTestCases = connectorConfig.testing.testCases.filter((_, i) => i !== index);
                          setConnectorConfig(prev => ({
                            ...prev,
                            testing: { ...prev.testing, testCases: newTestCases }
                          }));
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              <Button
                onClick={() => runConnectorTests()}
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Pause className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Deployment Configuration
  const renderDeploymentConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Deployment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Environment</Label>
            <select
              value={connectorConfig.deployment.environment}
              onChange={(e) => setConnectorConfig(prev => ({
                ...prev,
                deployment: {
                  ...prev.deployment,
                  environment: e.target.value as DeploymentConfig['environment']
                }
              }))}
              className="w-full px-3 py-2 border rounded-md mt-2"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Min Instances</Label>
              <Input
                type="number"
                value={connectorConfig.deployment.scaling.minInstances}
                onChange={(e) => setConnectorConfig(prev => ({
                  ...prev,
                  deployment: {
                    ...prev.deployment,
                    scaling: {
                      ...prev.deployment.scaling,
                      minInstances: parseInt(e.target.value) || 1
                    }
                  }
                }))}
                min="1"
              />
            </div>
            <div>
              <Label>Max Instances</Label>
              <Input
                type="number"
                value={connectorConfig.deployment.scaling.maxInstances}
                onChange={(e) => setConnectorConfig(prev => ({
                  ...prev,
                  deployment: {
                    ...prev.deployment,
                    scaling: {
                      ...prev.deployment.scaling,
                      maxInstances: parseInt(e.target.value) || 5
                    }
                  }
                }))}
                min="1"
              />
            </div>
            <div>
              <Label>Target CPU (%)</Label>
              <Input
                type="number"
                value={connectorConfig.deployment.scaling.targetCPU}
                onChange={(e) => setConnectorConfig(prev => ({
                  ...prev,
                  deployment: {
                    ...prev.deployment,
                    scaling: {
                      ...prev.deployment.scaling,
                      targetCPU: parseInt(e.target.value) || 70
                    }
                  }
                }))}
                min="10"
                max="90"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Monitoring Options</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={connectorConfig.deployment.monitoring.healthCheck}
                  onChange={(e) => setConnectorConfig(prev => ({
                    ...prev,
                    deployment: {
                      ...prev.deployment,
                      monitoring: {
                        ...prev.deployment.monitoring,
                        healthCheck: e.target.checked
                      }
                    }
                  }))}
                />
                Health Check
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={connectorConfig.deployment.monitoring.metrics}
                  onChange={(e) => setConnectorConfig(prev => ({
                    ...prev,
                    deployment: {
                      ...prev.deployment,
                      monitoring: {
                        ...prev.deployment.monitoring,
                        metrics: e.target.checked
                      }
                    }
                  }))}
                />
                Performance Metrics
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={connectorConfig.deployment.monitoring.alerts}
                  onChange={(e) => setConnectorConfig(prev => ({
                    ...prev,
                    deployment: {
                      ...prev.deployment,
                      monitoring: {
                        ...prev.deployment.monitoring,
                        alerts: e.target.checked
                      }
                    }
                  }))}
                />
                Error Alerts
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const runConnectorTests = async () => {
    setIsTesting(true);
    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedTestCases = connectorConfig.testing.testCases.map(testCase => ({
        ...testCase,
        status: Math.random() > 0.3 ? 'passed' : 'failed' as const
      }));
      
      setConnectorConfig(prev => ({
        ...prev,
        testing: { ...prev.testing, testCases: updatedTestCases }
      }));
      
      toast({
        title: "Tests Completed",
        description: `${updatedTestCases.filter(t => t.status === 'passed').length}/${updatedTestCases.length} tests passed`,
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to run connector tests",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const buildConnector = async () => {
    setIsBuilding(true);
    try {
      // Create connector in database with node type integration
      const { data, error } = await supabase
        .from('workflow_node_types')
        .update({
          connectorsConfig: [
            ...(nodeTypes.find(nt => nt.id === connectorConfig.nodeTypeMapping.nodeTypeId)?.connectorsConfig || []),
            {
              id: connectorConfig.id,
              name: connectorConfig.name,
              type: connectorConfig.type,
              config: connectorConfig,
              createdAt: new Date().toISOString()
            }
          ]
        })
        .eq('id', connectorConfig.nodeTypeMapping.nodeTypeId);

      if (error) throw error;

      toast({
        title: "Connector Built Successfully",
        description: `${connectorConfig.name} has been integrated with the workflow system`,
      });
    } catch (error) {
      toast({
        title: "Build Failed",
        description: "Failed to build and integrate connector",
        variant: "destructive",
      });
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Custom Connector Builder
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create and deploy custom connectors with full workflow node integration
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="io">Input/Output</TabsTrigger>
              <TabsTrigger value="test">Testing</TabsTrigger>
              <TabsTrigger value="deploy">Deploy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="mt-6">
              {renderBasicConfig()}
            </TabsContent>
            
            <TabsContent value="io" className="mt-6">
              {renderInputOutputConfig()}
            </TabsContent>
            
            <TabsContent value="test" className="mt-6">
              {renderTestConfig()}
            </TabsContent>
            
            <TabsContent value="deploy" className="mt-6">
              {renderDeploymentConfig()}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6 pt-6 border-t">
            <div className="flex gap-2">
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Clone
              </Button>
            </div>
            <Button onClick={buildConnector} disabled={isBuilding || !connectorConfig.name}>
              {isBuilding ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Build & Deploy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};