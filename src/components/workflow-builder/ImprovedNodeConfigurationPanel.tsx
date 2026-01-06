/**
 * IMPROVED NODE CONFIGURATION PANEL
 * User-friendly, intuitive configuration with quick toggles, visual indicators,
 * and streamlined UX for all 185+ node types
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { 
  X, Save, Play, Settings, Zap, Database, Brain, FileText,
  ChevronDown, CheckCircle, AlertCircle, Info, Eye, EyeOff,
  ToggleLeft, ToggleRight, Cpu, Globe, Layers, RefreshCw,
  Scan, FileSearch, Image, Shield, Clock, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NodeConfigurationPanelProps {
  nodeId: string;
  nodeType: string;
  nodeLabel?: string;
  configuration: Record<string, any>;
  onSave: (config: Record<string, any>) => void;
  onClose: () => void;
  onTest?: (nodeId: string) => void;
}

// Quick toggle configuration item
const QuickToggle: React.FC<{
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  icon?: React.ReactNode;
}> = ({ id, label, description, enabled, onChange, icon }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
    <div className="flex items-center gap-3">
      {icon && <div className="p-2 rounded-md bg-primary/10">{icon}</div>}
      <div>
        <Label htmlFor={id} className="font-medium cursor-pointer">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
    <Switch id={id} checked={enabled} onCheckedChange={onChange} />
  </div>
);

// Status indicator for configuration sections
const SectionStatus: React.FC<{ isConfigured: boolean; label: string }> = ({ isConfigured, label }) => (
  <div className="flex items-center gap-2">
    {isConfigured ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-amber-500" />
    )}
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

// Collapsible configuration section
const ConfigSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isConfigured?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, isConfigured, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">{icon}</div>
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isConfigured !== undefined && (
            <SectionStatus isConfigured={isConfigured} label={isConfigured ? 'Configured' : 'Not configured'} />
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 pt-0 border-t">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ImprovedNodeConfigurationPanel: React.FC<NodeConfigurationPanelProps> = ({
  nodeId,
  nodeType,
  nodeLabel,
  configuration,
  onSave,
  onClose,
  onTest,
}) => {
  const [config, setConfig] = useState<Record<string, any>>(configuration || {});
  const [activeTab, setActiveTab] = useState('quick');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setConfig(configuration || {});
  }, [configuration, nodeId]);

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave(config);
      toast.success('Configuration saved');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Determine node category for showing relevant options
  const isDocumentNode = nodeType.includes('ocr') || nodeType.includes('doc') || nodeType.includes('form') || nodeType.includes('image');
  const isAINode = nodeType.includes('ai') || nodeType.includes('llm') || nodeType.includes('agent');
  const isMultiAgentNode = nodeType.includes('a2a') || nodeType.includes('swarm') || nodeType.includes('react') || nodeType.includes('team');
  const isIntegrationNode = nodeType.includes('api') || nodeType.includes('webhook') || nodeType.includes('crm');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{nodeLabel || 'Node Configuration'}</h2>
              <p className="text-sm text-muted-foreground">{nodeType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onTest && (
              <Button variant="outline" size="sm" onClick={() => onTest(nodeId)}>
                <Play className="h-4 w-4 mr-2" />
                Test
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
            <TabsTrigger value="quick" className="gap-2">
              <Zap className="h-4 w-4" />
              Quick Setup
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Settings className="h-4 w-4" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              AI & Models
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Data & Output
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden p-4 pt-2">
            {/* Quick Setup Tab */}
            <TabsContent value="quick" className="h-full mt-0">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {/* Essential Configuration */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ToggleRight className="h-4 w-4" />
                        Essential Features
                      </CardTitle>
                      <CardDescription>Enable/disable core functionality with one click</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <QuickToggle
                        id="enabled"
                        label="Node Enabled"
                        description="Enable or disable this node in the workflow"
                        enabled={config.enabled !== false}
                        onChange={(v) => updateConfig('enabled', v)}
                        icon={config.enabled !== false ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      />
                      
                      <QuickToggle
                        id="autoRetry"
                        label="Auto Retry on Failure"
                        description="Automatically retry if the node fails"
                        enabled={config.autoRetry === true}
                        onChange={(v) => updateConfig('autoRetry', v)}
                        icon={<RefreshCw className="h-4 w-4" />}
                      />

                      <QuickToggle
                        id="logExecution"
                        label="Log Execution Details"
                        description="Save detailed logs for debugging"
                        enabled={config.logExecution !== false}
                        onChange={(v) => updateConfig('logExecution', v)}
                        icon={<Activity className="h-4 w-4" />}
                      />
                    </CardContent>
                  </Card>

                  {/* Document Processing Quick Options */}
                  {isDocumentNode && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Document Processing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <QuickToggle
                          id="ocrEnabled"
                          label="OCR Processing"
                          description="Extract text from images and scanned documents"
                          enabled={config.ocrEnabled === true}
                          onChange={(v) => updateConfig('ocrEnabled', v)}
                          icon={<Scan className="h-4 w-4" />}
                        />
                        
                        <QuickToggle
                          id="metadataExtraction"
                          label="Extract Metadata"
                          description="Extract document properties and attributes"
                          enabled={config.metadataExtraction === true}
                          onChange={(v) => updateConfig('metadataExtraction', v)}
                          icon={<Layers className="h-4 w-4" />}
                        />

                        <QuickToggle
                          id="formRecognition"
                          label="Form Field Recognition"
                          description="Detect and extract form fields automatically"
                          enabled={config.formRecognition === true}
                          onChange={(v) => updateConfig('formRecognition', v)}
                          icon={<FileSearch className="h-4 w-4" />}
                        />

                        <QuickToggle
                          id="imageAnalysis"
                          label="Image Analysis"
                          description="Analyze images for objects, text, and quality"
                          enabled={config.imageAnalysis === true}
                          onChange={(v) => updateConfig('imageAnalysis', v)}
                          icon={<Image className="h-4 w-4" />}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Node Quick Options */}
                  {isAINode && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          AI Processing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <QuickToggle
                          id="streamingEnabled"
                          label="Streaming Responses"
                          description="Enable real-time streaming of AI responses"
                          enabled={config.streamingEnabled === true}
                          onChange={(v) => updateConfig('streamingEnabled', v)}
                          icon={<Zap className="h-4 w-4" />}
                        />
                        
                        <QuickToggle
                          id="contextAware"
                          label="Context Awareness"
                          description="Include conversation history and context"
                          enabled={config.contextAware !== false}
                          onChange={(v) => updateConfig('contextAware', v)}
                          icon={<Brain className="h-4 w-4" />}
                        />

                        <QuickToggle
                          id="ragEnabled"
                          label="RAG Enhancement"
                          description="Enhance responses with knowledge base retrieval"
                          enabled={config.ragEnabled === true}
                          onChange={(v) => updateConfig('ragEnabled', v)}
                          icon={<Database className="h-4 w-4" />}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Multi-Agent Quick Options */}
                  {isMultiAgentNode && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          Multi-Agent Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <QuickToggle
                          id="a2aEnabled"
                          label="A2A Protocol"
                          description="Enable Google A2A agent-to-agent communication"
                          enabled={config.a2aEnabled === true}
                          onChange={(v) => updateConfig('a2aEnabled', v)}
                          icon={<Globe className="h-4 w-4" />}
                        />
                        
                        <QuickToggle
                          id="toolSharing"
                          label="Tool Sharing"
                          description="Allow agents to share tools and capabilities"
                          enabled={config.toolSharing === true}
                          onChange={(v) => updateConfig('toolSharing', v)}
                          icon={<Layers className="h-4 w-4" />}
                        />

                        <QuickToggle
                          id="selfReflection"
                          label="Self Reflection"
                          description="Enable agent self-evaluation and learning"
                          enabled={config.selfReflection === true}
                          onChange={(v) => updateConfig('selfReflection', v)}
                          icon={<Eye className="h-4 w-4" />}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Integration Quick Options */}
                  {isIntegrationNode && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Integration Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <QuickToggle
                          id="webhookEnabled"
                          label="Webhook Notifications"
                          description="Send results to external webhook endpoint"
                          enabled={config.webhookEnabled === true}
                          onChange={(v) => updateConfig('webhookEnabled', v)}
                          icon={<Zap className="h-4 w-4" />}
                        />
                        
                        <QuickToggle
                          id="crmSync"
                          label="CRM Synchronization"
                          description="Sync data with connected CRM systems"
                          enabled={config.crmSync === true}
                          onChange={(v) => updateConfig('crmSync', v)}
                          icon={<Database className="h-4 w-4" />}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Security & Compliance */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security & Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <QuickToggle
                        id="hipaaCompliant"
                        label="HIPAA Compliance"
                        description="Enable HIPAA-compliant data handling"
                        enabled={config.hipaaCompliant === true}
                        onChange={(v) => updateConfig('hipaaCompliant', v)}
                        icon={<Shield className="h-4 w-4" />}
                      />
                      
                      <QuickToggle
                        id="auditLogging"
                        label="Audit Logging"
                        description="Log all operations for compliance auditing"
                        enabled={config.auditLogging === true}
                        onChange={(v) => updateConfig('auditLogging', v)}
                        icon={<Activity className="h-4 w-4" />}
                      />
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="h-full mt-0">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <ConfigSection 
                    title="Execution Settings" 
                    icon={<Clock className="h-4 w-4" />}
                    isConfigured={!!config.timeout || !!config.retryCount}
                    defaultOpen
                  >
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Timeout (seconds)</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[config.timeout || 30]}
                            onValueChange={([v]) => updateConfig('timeout', v)}
                            max={300}
                            min={5}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-12">{config.timeout || 30}s</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Retry Count</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[config.retryCount || 3]}
                            onValueChange={([v]) => updateConfig('retryCount', v)}
                            max={10}
                            min={0}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-8">{config.retryCount || 3}</span>
                        </div>
                      </div>

                      <div>
                        <Label>Priority Level</Label>
                        <Select value={config.priority || 'normal'} onValueChange={(v) => updateConfig('priority', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </ConfigSection>

                  <ConfigSection 
                    title="Input/Output Configuration" 
                    icon={<Layers className="h-4 w-4" />}
                    isConfigured={!!config.inputMapping || !!config.outputMapping}
                  >
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Input Mapping (JSON)</Label>
                        <Textarea
                          placeholder='{"field": "$.data.field"}'
                          value={config.inputMapping || ''}
                          onChange={(e) => updateConfig('inputMapping', e.target.value)}
                          className="font-mono text-sm"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label>Output Mapping (JSON)</Label>
                        <Textarea
                          placeholder='{"result": "$.response.data"}'
                          value={config.outputMapping || ''}
                          onChange={(e) => updateConfig('outputMapping', e.target.value)}
                          className="font-mono text-sm"
                          rows={3}
                        />
                      </div>
                    </div>
                  </ConfigSection>

                  <ConfigSection 
                    title="Error Handling" 
                    icon={<AlertCircle className="h-4 w-4" />}
                    isConfigured={!!config.errorHandler}
                  >
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>On Error Action</Label>
                        <Select value={config.errorHandler || 'continue'} onValueChange={(v) => updateConfig('errorHandler', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="continue">Continue to next node</SelectItem>
                            <SelectItem value="retry">Retry with backoff</SelectItem>
                            <SelectItem value="skip">Skip and log error</SelectItem>
                            <SelectItem value="halt">Halt workflow</SelectItem>
                            <SelectItem value="fallback">Execute fallback node</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Fallback Node ID</Label>
                        <Input
                          placeholder="node-id-for-fallback"
                          value={config.fallbackNodeId || ''}
                          onChange={(e) => updateConfig('fallbackNodeId', e.target.value)}
                        />
                      </div>
                    </div>
                  </ConfigSection>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* AI & Models Tab */}
            <TabsContent value="ai" className="h-full mt-0">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <ConfigSection 
                    title="Primary AI Model" 
                    icon={<Cpu className="h-4 w-4" />}
                    isConfigured={!!config.aiModel}
                    defaultOpen
                  >
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Model Provider</Label>
                        <Select value={config.aiProvider || ''} onValueChange={(v) => updateConfig('aiProvider', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                            <SelectItem value="google">Google Gemini</SelectItem>
                            <SelectItem value="openai">OpenAI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Model</Label>
                        <Select value={config.aiModel || ''} onValueChange={(v) => updateConfig('aiModel', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                            <SelectItem value="claude-sonnet-4">Claude Sonnet 4</SelectItem>
                            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Temperature</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[config.temperature || 0.7]}
                            onValueChange={([v]) => updateConfig('temperature', v)}
                            max={2}
                            min={0}
                            step={0.1}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-10">{(config.temperature || 0.7).toFixed(1)}</span>
                        </div>
                      </div>

                      <div>
                        <Label>Max Tokens</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[config.maxTokens || 2048]}
                            onValueChange={([v]) => updateConfig('maxTokens', v)}
                            max={16000}
                            min={256}
                            step={256}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-16">{config.maxTokens || 2048}</span>
                        </div>
                      </div>
                    </div>
                  </ConfigSection>

                  <ConfigSection 
                    title="Vision & Document AI" 
                    icon={<Image className="h-4 w-4" />}
                    isConfigured={!!config.visionModel}
                  >
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Vision Model</Label>
                        <Select value={config.visionModel || ''} onValueChange={(v) => updateConfig('visionModel', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vision model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o-vision">GPT-4o Vision</SelectItem>
                            <SelectItem value="claude-3-vision">Claude 3 Vision</SelectItem>
                            <SelectItem value="gemini-vision">Gemini Vision</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>OCR Engine</Label>
                        <Select value={config.ocrEngine || ''} onValueChange={(v) => updateConfig('ocrEngine', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select OCR engine" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tesseract">Tesseract</SelectItem>
                            <SelectItem value="google-vision">Google Cloud Vision</SelectItem>
                            <SelectItem value="aws-textract">AWS Textract</SelectItem>
                            <SelectItem value="azure-ocr">Azure OCR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </ConfigSection>

                  <ConfigSection 
                    title="System Prompt" 
                    icon={<FileText className="h-4 w-4" />}
                    isConfigured={!!config.systemPrompt}
                  >
                    <div className="space-y-4 pt-4">
                      <Textarea
                        placeholder="Enter system prompt for AI model..."
                        value={config.systemPrompt || ''}
                        onChange={(e) => updateConfig('systemPrompt', e.target.value)}
                        rows={6}
                      />
                    </div>
                  </ConfigSection>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Data & Output Tab */}
            <TabsContent value="data" className="h-full mt-0">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <ConfigSection 
                    title="Database Output" 
                    icon={<Database className="h-4 w-4" />}
                    isConfigured={!!config.targetTable}
                    defaultOpen
                  >
                    <div className="space-y-4 pt-4">
                      <QuickToggle
                        id="saveToDB"
                        label="Save to Database"
                        description="Persist results to Supabase"
                        enabled={config.saveToDB === true}
                        onChange={(v) => updateConfig('saveToDB', v)}
                        icon={<Database className="h-4 w-4" />}
                      />
                      
                      {config.saveToDB && (
                        <>
                          <div>
                            <Label>Target Table</Label>
                            <Input
                              placeholder="table_name"
                              value={config.targetTable || ''}
                              onChange={(e) => updateConfig('targetTable', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Insert Mode</Label>
                            <Select value={config.insertMode || 'insert'} onValueChange={(v) => updateConfig('insertMode', v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="insert">Insert</SelectItem>
                                <SelectItem value="upsert">Upsert</SelectItem>
                                <SelectItem value="update">Update Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </ConfigSection>

                  <ConfigSection 
                    title="Webhook Output" 
                    icon={<Globe className="h-4 w-4" />}
                    isConfigured={!!config.webhookUrl}
                  >
                    <div className="space-y-4 pt-4">
                      <QuickToggle
                        id="sendToWebhook"
                        label="Send to Webhook"
                        description="POST results to external endpoint"
                        enabled={config.sendToWebhook === true}
                        onChange={(v) => updateConfig('sendToWebhook', v)}
                        icon={<Zap className="h-4 w-4" />}
                      />
                      
                      {config.sendToWebhook && (
                        <>
                          <div>
                            <Label>Webhook URL</Label>
                            <Input
                              placeholder="https://your-api.com/webhook"
                              value={config.webhookUrl || ''}
                              onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Headers (JSON)</Label>
                            <Textarea
                              placeholder='{"Authorization": "Bearer token"}'
                              value={config.webhookHeaders || ''}
                              onChange={(e) => updateConfig('webhookHeaders', e.target.value)}
                              className="font-mono text-sm"
                              rows={2}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </ConfigSection>

                  <ConfigSection 
                    title="Output Format" 
                    icon={<FileText className="h-4 w-4" />}
                    isConfigured={!!config.outputFormat}
                  >
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Format</Label>
                        <Select value={config.outputFormat || 'json'} onValueChange={(v) => updateConfig('outputFormat', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="text">Plain Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <QuickToggle
                        id="prettyPrint"
                        label="Pretty Print Output"
                        description="Format output for readability"
                        enabled={config.prettyPrint === true}
                        onChange={(v) => updateConfig('prettyPrint', v)}
                        icon={<FileText className="h-4 w-4" />}
                      />
                    </div>
                  </ConfigSection>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Changes are saved when you click Save</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedNodeConfigurationPanel;
