import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Play, 
  Save, 
  Settings, 
  Database, 
  Brain, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  X,
  Plus,
  Trash2,
  Eye,
  History
} from 'lucide-react';
import { useNodeConfiguration } from '@/hooks/useNodeConfiguration';
import { DynamicConfigurationForm } from './DynamicConfigurationForm';
import { useIntegrationOptions } from '@/hooks/useIntegrationOptions';
import { format } from 'date-fns';

interface EnhancedNodeConfigurationPanelProps {
  node?: any;
  nodeId?: string;
  nodeType?: string;
  nodeName?: string;
  nodeCategory?: string;
  initialConfiguration?: any;
  isOpen?: boolean;
  onClose: () => void;
  onSave?: (nodeId: string, configuration: any) => void;
  onTest?: (nodeId: string, result: any) => void;
  sessionId?: string;
  workflowId?: string;
}

export const EnhancedNodeConfigurationPanel: React.FC<EnhancedNodeConfigurationPanelProps> = ({
  node,
  nodeId,
  nodeType,
  nodeName,
  nodeCategory,
  initialConfiguration,
  isOpen = true,
  onClose,
  onSave,
  onTest,
  sessionId,
  workflowId,
}) => {
  // Normalize node data from props
  const normalizedNode = node || {
    id: nodeId,
    type: nodeType,
    data: initialConfiguration || {},
  };
  const [activeTab, setActiveTab] = useState('configuration');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolInputData, setToolInputData] = useState<string>('{}');
  
  // Knowledge Base state
  const [kbSourceTable, setKbSourceTable] = useState<string>('');
  const [kbSourceColumn, setKbSourceColumn] = useState<string>('');
  
  // Vector Store state
  const [vectorStoreType, setVectorStoreType] = useState<string>('supabase');
  const [embeddingModel, setEmbeddingModel] = useState<string>('text-embedding-3-small');
  const [knowledgeName, setKnowledgeName] = useState<string>('');
  const [vectorDescription, setVectorDescription] = useState<string>('');

  const {
    nodeConfig,
    toolExecutions,
    saveConfiguration,
    executeTool,
    saveVectorConfig,
    saveKnowledgeConfig,
    isSaving,
    isExecuting,
  } = useNodeConfiguration(normalizedNode.id, sessionId, workflowId);

  const { tables, mcpLikeTools } = useIntegrationOptions();

  const handleConfigurationChange = (newConfig: any) => {
    saveConfiguration({
      node_type: normalizedNode.type,
      configuration: newConfig,
      change_summary: `Updated configuration at ${new Date().toLocaleString()}`,
    });
    
    // Call external onSave if provided
    if (onSave && normalizedNode.id) {
      onSave(normalizedNode.id, newConfig);
    }
  };

  const handleToolExecution = () => {
    if (!selectedTool) return;

    try {
      const inputData = JSON.parse(toolInputData);
      executeTool({
        toolName: selectedTool,
        toolType: 'manual_execution',
        inputData,
        executionContext: {
          node_id: normalizedNode.id,
          executed_via: 'configuration_panel',
        },
      });
    } catch (error) {
      alert('Invalid JSON in input data');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Extract tools from node configuration
  const nodeTools = normalizedNode.data?.tools || [];
  const availableTools = [...nodeTools.map((t: any) => t.name), ...mcpLikeTools.map(m => m.name)];
  
  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg w-[90vw] h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Node Configuration</h2>
            <Badge variant="outline">{normalizedNode.type}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="tools">Tools & Execution</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              <TabsTrigger value="vectors">Vector Store</TabsTrigger>
              <TabsTrigger value="history">Execution History</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="configuration" className="h-full">
                <ScrollArea className="h-full p-4">
                  <DynamicConfigurationForm
                    nodeType={normalizedNode.type}
                    configAction="configure"
                    configuration={normalizedNode.data || {}}
                    onChange={handleConfigurationChange}
                  />
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => handleConfigurationChange(normalizedNode.data)} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tools" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-6">
                    {/* MCP SDK Integration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          MCP SDK Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="mcp-enabled"
                            checked={normalizedNode.data?.mcpEnabled}
                            onCheckedChange={(checked) => {
                              handleConfigurationChange({ 
                                ...normalizedNode.data, 
                                mcpEnabled: checked 
                              });
                            }}
                          />
                          <Label htmlFor="mcp-enabled">Enable MCP SDK</Label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Data Sync Target</Label>
                            <Select 
                              value={normalizedNode.data?.mcpSyncTarget || ''}
                              onValueChange={(value) => {
                                handleConfigurationChange({ 
                                  ...normalizedNode.data, 
                                  mcpSyncTarget: value 
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select target" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="supabase">Supabase Database</SelectItem>
                                <SelectItem value="external_api">External API</SelectItem>
                                <SelectItem value="webhook">Webhook</SelectItem>
                                <SelectItem value="salesforce">Salesforce CRM</SelectItem>
                                <SelectItem value="hubspot">HubSpot</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Sync Mode</Label>
                            <Select 
                              value={normalizedNode.data?.mcpSyncMode || 'realtime'}
                              onValueChange={(value) => {
                                handleConfigurationChange({ 
                                  ...normalizedNode.data, 
                                  mcpSyncMode: value 
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="realtime">Real-time</SelectItem>
                                <SelectItem value="batch">Batch</SelectItem>
                                <SelectItem value="manual">Manual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>External Webhook URL</Label>
                          <Input 
                            placeholder="https://your-api.com/webhook" 
                            value={normalizedNode.data?.webhookUrl || ''}
                            onChange={(e) => {
                              handleConfigurationChange({ 
                                ...normalizedNode.data, 
                                webhookUrl: e.target.value 
                              });
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Execute Tools */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Execute Tools
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Select Tool</Label>
                          <Select value={selectedTool} onValueChange={setSelectedTool}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a tool to execute" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTools.length > 0 ? (
                                availableTools.map((tool) => (
                                  <SelectItem key={tool} value={tool}>
                                    {tool}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="npi_verification">NPI Verification</SelectItem>
                                  <SelectItem value="insurance_validation">Insurance Validation</SelectItem>
                                  <SelectItem value="sync_to_database">Sync to Database</SelectItem>
                                  <SelectItem value="push_to_crm">Push to CRM</SelectItem>
                                  <SelectItem value="send_notification">Send Notification</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Input Data (JSON)</Label>
                          <Textarea
                            value={toolInputData}
                            onChange={(e) => setToolInputData(e.target.value)}
                            placeholder='{"npi_number": "1234567890"}'
                            className="font-mono text-sm"
                            rows={6}
                          />
                        </div>

                        <Button 
                          onClick={handleToolExecution} 
                          disabled={!selectedTool || isExecuting}
                          className="w-full"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {isExecuting ? 'Executing...' : 'Run Tool'}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Available Tools from Node + MCP */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Available Tools</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {nodeTools.length > 0 || mcpLikeTools.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {nodeTools.map((tool: any, index: number) => (
                              <Badge key={`node-${index}`} variant="secondary" className="justify-center">
                                {tool.name}
                              </Badge>
                            ))}
                            {mcpLikeTools.map((tool: any, index: number) => (
                              <Badge key={`mcp-${index}`} variant="outline" className="justify-center">
                                {tool.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No tools configured. Add tools via the Configuration tab.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="knowledge" className="h-full">
                <ScrollArea className="h-full p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Knowledge Base Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Accordion type="single" collapsible defaultValue="document-stores">
                        <AccordionItem value="document-stores">
                          <AccordionTrigger>Document Stores</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Source Table</Label>
                                  <Select value={kbSourceTable} onValueChange={setKbSourceTable}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select table" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {tables.map((table) => (
                                        <SelectItem key={table.table_name} value={table.table_name}>
                                          {table.table_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Source Column</Label>
                                  <Select value={kbSourceColumn} onValueChange={setKbSourceColumn}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="content">content</SelectItem>
                                      <SelectItem value="description">description</SelectItem>
                                      <SelectItem value="data">data</SelectItem>
                                      <SelectItem value="text">text</SelectItem>
                                      <SelectItem value="body">body</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <Button 
                                onClick={() => {
                                  if (!kbSourceTable || !kbSourceColumn) {
                                    alert('Please select both table and column');
                                    return;
                                  }
                                  saveKnowledgeConfig({
                                    knowledge_type: 'document_store',
                                    source_table: kbSourceTable,
                                    source_column: kbSourceColumn,
                                    configuration: {},
                                  });
                                }}
                                size="sm"
                                disabled={!kbSourceTable || !kbSourceColumn}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Document Store
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="vector-embeddings">
                          <AccordionTrigger>Vector Embeddings</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Embedding Model</Label>
                                  <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text-embedding-3-small">OpenAI Small</SelectItem>
                                      <SelectItem value="text-embedding-3-large">OpenAI Large</SelectItem>
                                      <SelectItem value="text-embedding-ada-002">OpenAI Ada</SelectItem>
                                      <SelectItem value="voyage-3">Voyage AI</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Collection Name</Label>
                                  <Input 
                                    placeholder="knowledge-base" 
                                    value={knowledgeName}
                                    onChange={(e) => setKnowledgeName(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch id="source-documents" />
                                <Label htmlFor="source-documents">Return Source Documents</Label>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="vectors" className="h-full">
                <ScrollArea className="h-full p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Vector Store Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Vector Store Type</Label>
                          <Select value={vectorStoreType} onValueChange={setVectorStoreType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vector store" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="supabase">Supabase Vector</SelectItem>
                              <SelectItem value="pinecone">Pinecone</SelectItem>
                              <SelectItem value="weaviate">Weaviate</SelectItem>
                              <SelectItem value="chroma">Chroma</SelectItem>
                              <SelectItem value="qdrant">Qdrant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Embedding Model</Label>
                          <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select embedding model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text-embedding-3-small">OpenAI Small</SelectItem>
                              <SelectItem value="text-embedding-3-large">OpenAI Large</SelectItem>
                              <SelectItem value="text-embedding-ada-002">OpenAI Ada</SelectItem>
                              <SelectItem value="voyage-3">Voyage AI</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Knowledge Name</Label>
                        <Input 
                          placeholder="Enter knowledge base name" 
                          value={knowledgeName}
                          onChange={(e) => setKnowledgeName(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea 
                          placeholder="Describe this vector store configuration" 
                          value={vectorDescription}
                          onChange={(e) => setVectorDescription(e.target.value)}
                        />
                      </div>

                      <Button 
                        onClick={() => {
                          if (!knowledgeName) {
                            alert('Please enter a knowledge base name');
                            return;
                          }
                          saveVectorConfig({
                            vector_store_type: vectorStoreType,
                            embedding_model: embeddingModel,
                            knowledge_name: knowledgeName,
                            description: vectorDescription,
                            configuration: {},
                          });
                        }}
                        disabled={!knowledgeName}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Vector Configuration
                      </Button>
                    </CardContent>
                  </Card>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="history" className="h-full">
                <ScrollArea className="h-full p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Tool Execution History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {toolExecutions && toolExecutions.length > 0 ? (
                        <div className="space-y-4">
                          {toolExecutions.map((execution) => (
                            <div key={execution.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(execution.status)}
                                  <span className="font-medium">{execution.tool_name}</span>
                                  <Badge variant="outline">{execution.tool_type}</Badge>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(execution.created_at), 'MMM dd, HH:mm:ss')}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label>Status</Label>
                                  <p className="capitalize">{execution.status}</p>
                                </div>
                                {execution.duration_ms && (
                                  <div>
                                    <Label>Duration</Label>
                                    <p>{execution.duration_ms}ms</p>
                                  </div>
                                )}
                              </div>

                              {execution.error_details && (
                                <div className="mt-3 p-2 bg-red-50 border-red-200 border rounded">
                                  <Label className="text-red-700">Error</Label>
                                  <p className="text-red-600 text-sm font-mono">
                                    {JSON.stringify(execution.error_details, null, 2)}
                                  </p>
                                </div>
                              )}

                              {execution.output_data && Object.keys(execution.output_data).length > 0 && (
                                <div className="mt-3 p-2 bg-green-50 border-green-200 border rounded">
                                  <Label className="text-green-700">Output</Label>
                                  <pre className="text-green-600 text-sm">
                                    {JSON.stringify(execution.output_data, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Eye className="h-8 w-8 mx-auto mb-2" />
                          <p>No tool executions yet</p>
                          <p className="text-sm">Execute tools to see their history here</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};