import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, Save, FileText, Wand2, Bot, MessageSquare, Users, 
  Phone, Database, Zap, Plus, Copy, Download, Upload, CheckCircle2, 
  AlertTriangle, Info, XCircle 
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useNodeSchemaRegistry } from '@/hooks/useNodeSchemaRegistry';
import { NODE_SCHEMAS } from './DynamicNodeConfigurator';

interface PersonalizedNodeManagerProps {
  onCreateNode?: (nodeConfig: any) => void;
  onTemplateApply?: (template: any) => void;
}

export const PersonalizedNodeManager: React.FC<PersonalizedNodeManagerProps> = ({
  onCreateNode,
  onTemplateApply
}) => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedNodeType, setSelectedNodeType] = useState('customer-support-agent');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const { showSuccess, showError } = useMasterToast();
  
  const {
    nodeTemplates,
    createNodeTemplate,
    applyTemplate,
    validateConfiguration,
    detectNodeType,
    getAllSchemas
  } = useNodeSchemaRegistry();

  const availableSchemas = getAllSchemas();
  const currentSchema = NODE_SCHEMAS[selectedNodeType];

  // Reset config when node type changes
  useEffect(() => {
    if (currentSchema) {
      const defaultConfig: Record<string, any> = {};
      currentSchema.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaultConfig[field.name] = field.defaultValue;
        }
      });
      setConfig(defaultConfig);
    }
  }, [selectedNodeType, currentSchema]);

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateNode = () => {
    if (!currentSchema) {
      showError('No schema selected');
      return;
    }

    const validation = validateConfiguration(selectedNodeType, config);
    if (!validation.valid) {
      showError(`Configuration invalid: ${validation.errors.join(', ')}`);
      return;
    }

    const nodeConfig = {
      type: selectedNodeType,
      data: {
        ...config,
        nodeType: selectedNodeType,
        displayName: currentSchema.displayName,
        configured: true,
        created_at: new Date().toISOString()
      }
    };

    if (onCreateNode) {
      onCreateNode(nodeConfig);
    }

    showSuccess(`${currentSchema.displayName} node created`);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      showError('Please enter a template name');
      return;
    }

    try {
      await createNodeTemplate({
        name: templateName,
        description: templateDescription,
        node_type: selectedNodeType,
        template_config: config,
        category: currentSchema?.scenarios?.[0] || 'General',
        use_case: templateDescription || 'Custom template'
      });

      setTemplateName('');
      setTemplateDescription('');
      showSuccess('Template saved successfully');
    } catch (error) {
      showError('Failed to save template');
    }
  };

  const handleApplyTemplate = (template: any) => {
    const appliedConfig = applyTemplate(template);
    setConfig(appliedConfig);
    setSelectedNodeType(template.node_type);

    if (onTemplateApply) {
      onTemplateApply(appliedConfig);
    }

    showSuccess(`Applied template: ${template.name}`);
  };

  const getNodeTypeIcon = (nodeType: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'customer-support-agent': MessageSquare,
      'sales-agent': Users,
      'voice-agent': Phone,
      'data-processor': Database,
    };
    return iconMap[nodeType] || Bot;
  };

  const getValidationStatus = () => {
    if (!currentSchema) return { status: 'error', message: 'No schema available' };
    
    const validation = validateConfiguration(selectedNodeType, config);
    if (validation.valid) {
      return { status: 'success', message: 'Configuration is valid' };
    } else {
      return { status: 'error', message: `Missing: ${validation.errors.join(', ')}` };
    }
  };

  const validationStatus = getValidationStatus();

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Personalized Node Manager
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Create and customize nodes for any agent type or scenario
        </p>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Node</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            {/* Node Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Node Type</Label>
              <Select value={selectedNodeType} onValueChange={setSelectedNodeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NODE_SCHEMAS).map(([key, schema]) => {
                    const IconComponent = getNodeTypeIcon(key);
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {schema.displayName}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {currentSchema && (
                <p className="text-sm text-muted-foreground">{currentSchema.description}</p>
              )}
            </div>

            <Separator />

            {/* Configuration Fields */}
            {currentSchema && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Configuration</Label>
                  <div className="flex items-center gap-2">
                    {validationStatus.status === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {validationStatus.message}
                    </span>
                  </div>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-4 pr-4">
                    {currentSchema.categories.map(category => {
                      const categoryFields = currentSchema.fields.filter(f => f.category === category);
                      if (categoryFields.length === 0) return null;

                      return (
                        <div key={category} className="space-y-3">
                          <h4 className="text-sm font-medium capitalize">{category}</h4>
                          {categoryFields.map(field => (
                            <div key={field.id} className="space-y-2">
                              <Label className="text-sm">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </Label>
                              
                              {field.type === 'text' && (
                                <Input
                                  value={config[field.name] || ''}
                                  onChange={(e) => updateConfig(field.name, e.target.value)}
                                  placeholder={field.description}
                                  className="text-sm"
                                />
                              )}
                              
                              {field.type === 'textarea' && (
                                <Textarea
                                  value={config[field.name] || ''}
                                  onChange={(e) => updateConfig(field.name, e.target.value)}
                                  placeholder={field.description}
                                  className="text-sm"
                                  rows={3}
                                />
                              )}
                              
                              {field.type === 'select' && field.options && (
                                <Select 
                                  value={config[field.name] || ''} 
                                  onValueChange={(value) => updateConfig(field.name, value)}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder={field.description} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              
                              {field.description && (
                                <p className="text-xs text-muted-foreground">{field.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleSaveTemplate}>
                <FileText className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
              <Button 
                onClick={handleCreateNode}
                disabled={validationStatus.status !== 'success'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Node
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {/* Save Template Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Save Current Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe what this template does"
                    rows={2}
                  />
                </div>
                <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </CardContent>
            </Card>

            {/* Available Templates */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Available Templates</Label>
              <div className="grid gap-3">
                {nodeTemplates.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {NODE_SCHEMAS[template.node_type]?.displayName || template.node_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApplyTemplate(template)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {nodeTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>No templates saved yet</p>
                    <p className="text-sm">Create and save configurations as reusable templates</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(NODE_SCHEMAS).map(([key, schema]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <schema.icon className="h-5 w-5" />
                      {schema.displayName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{schema.description}</p>
                  </CardHeader>
                  <CardContent>
                    {schema.scenarios && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Common Scenarios:</Label>
                        <div className="flex flex-wrap gap-2">
                          {schema.scenarios.map(scenario => (
                            <Badge key={scenario} variant="outline" className="text-xs">
                              {scenario}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {schema.capabilities && (
                      <div className="space-y-2 mt-3">
                        <Label className="text-sm font-medium">Capabilities:</Label>
                        <div className="flex flex-wrap gap-2">
                          {schema.capabilities.map(capability => (
                            <Badge key={capability} variant="secondary" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      className="mt-4"
                      onClick={() => setSelectedNodeType(key)}
                      variant="outline"
                      size="sm"
                    >
                      Use This Type
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};