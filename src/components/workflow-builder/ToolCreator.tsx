import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Code, Key, Link, Search, Settings } from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useMasterToast } from '@/hooks/useMasterToast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'settings': Settings,
    'code': Code,
    'key': Key,
    'link': Link,
    'search': Search,
    'plus': Plus,
    'x': X,
  };
  return iconMap[iconName] || Settings;
};

export const ToolCreator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showExistingTools, setShowExistingTools] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { categories, nodeTypes, createNodeType, isCreating } = useWorkflowNodes();
  const { toast } = useMasterToast();

  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    detailed_explanation: '',
    category_id: '',
    type_key: '',
    icon: 'settings',
    color: '#6366f1',
    capabilities: [] as string[],
    is_draggable: true,
    is_configurable: true,
    default_config: {},
    input_schema: [] as Array<{
      property: string;
      type: string;
      description: string;
      required: boolean;
    }>,
    output_schema: {},
    requirements: {},
    order_index: 100,
    credential_requirements: {
      auth_type: 'api_key' as 'api_key' | 'oauth' | 'bearer' | 'custom',
      required_fields: [] as string[],
      optional_fields: [] as string[],
      instructions: '',
      documentation_url: ''
    },
    javascript_function: ''
  });

  const [newCapability, setNewCapability] = useState('');
  const [newRequiredField, setNewRequiredField] = useState('');
  const [newOptionalField, setNewOptionalField] = useState('');
  const [newInputProperty, setNewInputProperty] = useState({
    property: '',
    type: 'string',
    description: '',
    required: false
  });
  const [selectedExistingTool, setSelectedExistingTool] = useState<string>('');

  // Listen for tool creator events
  useEffect(() => {
    const handleToolCreator = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-tool-creator', handleToolCreator);
    return () => window.removeEventListener('open-tool-creator', handleToolCreator);
  }, []);

  // Filter existing tools based on search
  const filteredNodeTypes = React.useMemo(() => {
    if (!searchTerm) return nodeTypes;
    return nodeTypes.filter(tool => 
      tool.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.type_key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nodeTypes, searchTerm]);

  // Get existing tools grouped by category with search
  const existingToolsByCategory = React.useMemo(() => {
    const grouped: Record<string, typeof filteredNodeTypes> = {};
    filteredNodeTypes.forEach(tool => {
      const categoryName = tool.category?.name || 'uncategorized';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(tool);
    });
    return grouped;
  }, [filteredNodeTypes]);

  const selectedTool = React.useMemo(() => {
    return nodeTypes.find(tool => tool.id === selectedExistingTool);
  }, [nodeTypes, selectedExistingTool]);

  useEffect(() => {
    const handleOpenToolCreator = () => {
      setIsCreatingCategory(false);
      setIsOpen(true);
    };

    const handleOpenCategoryCreator = () => {
      setIsCreatingCategory(true);
      setIsOpen(true);
    };

    window.addEventListener('open-tool-creator', handleOpenToolCreator as EventListener);
    window.addEventListener('open-category-creator', handleOpenCategoryCreator as EventListener);

    return () => {
      window.removeEventListener('open-tool-creator', handleOpenToolCreator as EventListener);
      window.removeEventListener('open-category-creator', handleOpenCategoryCreator as EventListener);
    };
  }, []);

  // Pre-fill form data when tool is selected
  useEffect(() => {
    if (selectedTool) {
      setFormData(prev => ({
        ...prev,
        display_name: selectedTool.display_name,
        description: selectedTool.description,
        detailed_explanation: selectedTool.detailed_explanation || '',
        category_id: selectedTool.category_id || '',
        type_key: selectedTool.type_key,
        icon: selectedTool.icon || 'settings',
        color: selectedTool.color || '#6366f1',
        capabilities: Array.isArray(selectedTool.capabilities) ? selectedTool.capabilities : [],
        default_config: selectedTool.default_config || {},
        input_schema: Array.isArray(selectedTool.input_schema) ? selectedTool.input_schema : [],
        output_schema: selectedTool.output_schema || {},
        requirements: selectedTool.requirements || {},
        credential_requirements: {
          auth_type: 'api_key',
          required_fields: [],
          optional_fields: [],
          instructions: '',
          documentation_url: ''
        }
      }));
    }
  }, [selectedTool]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showExistingTools && (!formData.display_name || !formData.description || !formData.category_id)) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (showExistingTools && !selectedExistingTool) {
      toast.error('Please select a tool to configure');
      return;
    }

    const typeKey = formData.type_key || formData.display_name.toLowerCase().replace(/\s+/g, '_');

    try {
      if (showExistingTools) {
        // Configuration save for existing tool
        toast.success('Tool configuration saved successfully!');
      } else {
        // Create new tool
        await createNodeType({
          ...formData,
          type_key: typeKey,
          is_active: true
        });
        toast.success('Tool created successfully!');
      }
      
      // Reset form
      setFormData({
        display_name: '',
        description: '',
        detailed_explanation: '',
        category_id: '',
        type_key: '',
        icon: 'settings',
        color: '#6366f1',
        capabilities: [],
        is_draggable: true,
        is_configurable: true,
        default_config: {},
        input_schema: [],
        output_schema: {},
        requirements: {},
        order_index: 100,
        credential_requirements: {
          auth_type: 'api_key' as 'api_key' | 'oauth' | 'bearer' | 'custom',
          required_fields: [],
          optional_fields: [],
          instructions: '',
          documentation_url: ''
        },
        javascript_function: ''
      });
      
      setSelectedExistingTool('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create/configure tool:', error);
    }
  };

  const addCapability = () => {
    if (newCapability.trim() && !formData.capabilities.includes(newCapability.trim())) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, newCapability.trim()]
      }));
      setNewCapability('');
    }
  };

  const removeCapability = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(c => c !== capability)
    }));
  };

  if (isCreatingCategory) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input placeholder="e.g., Custom AI Models" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Brief description of this category..." />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Icon</Label>
                <Select defaultValue="settings">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="settings">Settings</SelectItem>
                    <SelectItem value="bot">Bot</SelectItem>
                    <SelectItem value="brain">Brain</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Color</Label>
                <Input type="color" defaultValue="#6366f1" />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1" disabled>
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {showExistingTools ? 'Configure Tool/Node' : 'Create Custom Tool/Node'}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant={showExistingTools ? 'default' : 'outline'}
              onClick={() => {
                setShowExistingTools(true);
                setSelectedExistingTool('');
              }}
            >
              Configure Existing
            </Button>
            <Button
              size="sm"
              variant={!showExistingTools ? 'default' : 'outline'}
              onClick={() => {
                setShowExistingTools(false);
                setSelectedExistingTool('');
              }}
            >
              Create New
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto">
          {showExistingTools ? (
            // Existing Tools View - Enhanced with Icons and Logos
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Select an existing tool to configure credentials, input schema, and functions.
              </div>
              
              {/* Enhanced Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools by name, description, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Tools Grid with Icons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                {Object.entries(existingToolsByCategory).map(([categoryName, tools]) => 
                  tools.map(tool => {
                    const IconComponent = getIconComponent(tool.icon || 'settings');
                    const category = categories.find(c => c.name === categoryName);
                    
                    return (
                      <Card
                        key={tool.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedExistingTool === tool.id ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => {
                          setSelectedExistingTool(selectedExistingTool === tool.id ? '' : tool.id);
                        }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ 
                                backgroundColor: `${tool.color || category?.color || '#6366f1'}20`,
                                color: tool.color || category?.color || '#6366f1'
                              }}
                            >
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm truncate">{tool.display_name}</CardTitle>
                              <CardDescription className="text-xs">
                                {category?.display_name || categoryName}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {tool.type_key}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {tool.description}
                          </p>
                          {tool.capabilities && Array.isArray(tool.capabilities) && tool.capabilities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tool.capabilities.slice(0, 3).map(capability => (
                                <Badge key={capability} variant="secondary" className="text-xs">
                                  {capability}
                                </Badge>
                              ))}
                              {tool.capabilities.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{tool.capabilities.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
              
              {/* Enhanced Configuration Panel */}
              {selectedExistingTool && selectedTool && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configure {selectedTool.display_name}
                    </CardTitle>
                    <CardDescription>
                      Configure credentials, input schema, and functions for this tool to activate it in your workspace.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="credentials" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="credentials">Credentials</TabsTrigger>
                        <TabsTrigger value="schema">Input Schema</TabsTrigger>
                        <TabsTrigger value="function">Function</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="credentials" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Authentication Type</Label>
                            <Select
                              value={formData.credential_requirements.auth_type}
                              onValueChange={(value: any) => setFormData(prev => ({
                                ...prev,
                                credential_requirements: {
                                  ...prev.credential_requirements,
                                  auth_type: value
                                }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="api_key">API Key</SelectItem>
                                <SelectItem value="oauth">OAuth 2.0</SelectItem>
                                <SelectItem value="bearer">Bearer Token</SelectItem>
                                <SelectItem value="custom">Custom Authentication</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Required Fields</Label>
                            <div className="space-y-2">
                              {formData.credential_requirements.required_fields.map((field, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input value={field} className="flex-1" 
                                    onChange={(e) => {
                                      const updated = [...formData.credential_requirements.required_fields];
                                      updated[index] = e.target.value;
                                      setFormData(prev => ({
                                        ...prev,
                                        credential_requirements: {
                                          ...prev.credential_requirements,
                                          required_fields: updated
                                        }
                                      }));
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const updated = formData.credential_requirements.required_fields.filter((_, i) => i !== index);
                                      setFormData(prev => ({
                                        ...prev,
                                        credential_requirements: {
                                          ...prev.credential_requirements,
                                          required_fields: updated
                                        }
                                      }));
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Enter required field name"
                                  value={newRequiredField}
                                  onChange={(e) => setNewRequiredField(e.target.value)}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (newRequiredField.trim()) {
                                      setFormData(prev => ({
                                        ...prev,
                                        credential_requirements: {
                                          ...prev.credential_requirements,
                                          required_fields: [...prev.credential_requirements.required_fields, newRequiredField.trim()]
                                        }
                                      }));
                                      setNewRequiredField('');
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Documentation URL</Label>
                            <Input
                              value={formData.credential_requirements.documentation_url}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                credential_requirements: {
                                  ...prev.credential_requirements,
                                  documentation_url: e.target.value
                                }
                              }))}
                              placeholder="https://docs.example.com/api-setup"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Setup Instructions</Label>
                            <Textarea
                              value={formData.credential_requirements.instructions}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                credential_requirements: {
                                  ...prev.credential_requirements,
                                  instructions: e.target.value
                                }
                              }))}
                              placeholder="Provide step-by-step instructions for setting up credentials..."
                              rows={4}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="schema" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            Configure the input schema for this tool. This defines what parameters users can provide.
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  input_schema: [...prev.input_schema, { property: '', type: 'string', description: '', required: false }]
                                }));
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Property
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                              <div>Property</div>
                              <div>Type</div>
                              <div>Description</div>
                              <div>Required</div>
                            </div>
                            
                            {formData.input_schema.map((item, index) => (
                              <div key={index} className="grid grid-cols-4 gap-2 items-center">
                                <Input
                                  value={item.property}
                                  onChange={(e) => {
                                    const newSchema = [...formData.input_schema];
                                    newSchema[index].property = e.target.value;
                                    setFormData(prev => ({ ...prev, input_schema: newSchema }));
                                  }}
                                  placeholder="property_name"
                                  className="h-8"
                                />
                                <Select
                                  value={item.type}
                                  onValueChange={(value) => {
                                    const newSchema = [...formData.input_schema];
                                    newSchema[index].type = value;
                                    setFormData(prev => ({ ...prev, input_schema: newSchema }));
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="string">String</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="boolean">Boolean</SelectItem>
                                    <SelectItem value="array">Array</SelectItem>
                                    <SelectItem value="object">Object</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={item.description}
                                  onChange={(e) => {
                                    const newSchema = [...formData.input_schema];
                                    newSchema[index].description = e.target.value;
                                    setFormData(prev => ({ ...prev, input_schema: newSchema }));
                                  }}
                                  placeholder="Description"
                                  className="h-8"
                                />
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={item.required}
                                    onChange={(e) => {
                                      const newSchema = [...formData.input_schema];
                                      newSchema[index].required = e.target.checked;
                                      setFormData(prev => ({ ...prev, input_schema: newSchema }));
                                    }}
                                    className="rounded"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newSchema = formData.input_schema.filter((_, i) => i !== index);
                                      setFormData(prev => ({ ...prev, input_schema: newSchema }));
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="function" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            Configure the JavaScript function that will be executed when this tool is used.
                          </div>
                          
                          <div className="relative">
                            <Textarea
                              value={formData.javascript_function}
                              onChange={(e) => setFormData(prev => ({ ...prev, javascript_function: e.target.value }))}
                              placeholder="// Enter your JavaScript function here&#10;function processData(input) {&#10;  // Your code here&#10;  return result;&#10;}"
                              rows={15}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="advanced" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            Advanced configuration and tool settings.
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Tool Icon</Label>
                              <Input
                                value={formData.icon}
                                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                placeholder="icon-name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Tool Color</Label>
                              <Input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Capabilities</Label>
                            <div className="flex gap-2 mb-2">
                              <Input
                                value={newCapability}
                                onChange={(e) => setNewCapability(e.target.value)}
                                placeholder="Add capability (e.g., 'text processing')"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                              />
                              <Button type="button" onClick={addCapability} size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {formData.capabilities.map(capability => (
                                <Badge key={capability} variant="secondary" className="text-xs">
                                  {capability}
                                  <button
                                    type="button"
                                    onClick={() => removeCapability(capability)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Create New Tool View - Keep existing implementation
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="credentials">Credentials</TabsTrigger>
                <TabsTrigger value="schema">Input Schema</TabsTrigger>
                <TabsTrigger value="function">Function</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-4">
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_name">Tool Name *</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="My New Tool"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category_id">Category *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Tool Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description of what the tool does. This is for ChatGPT to determine when to use this tool."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="icon">Tool Icon Source</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="https://raw.githubusercontent.com/gilbarbara/logos/main/logos/airtable.svg"
                    />
                  </div>

                  <div>
                    <Label>Capabilities</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newCapability}
                        onChange={(e) => setNewCapability(e.target.value)}
                        placeholder="Add capability (e.g., 'text processing')"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                      />
                      <Button type="button" onClick={addCapability} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {formData.capabilities.map(capability => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability}
                          <button
                            type="button"
                            onClick={() => removeCapability(capability)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="credentials" className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                      <Key className="h-4 w-4" />
                      Credential Requirements
                    </div>
                    <p className="text-sm text-yellow-700">
                      Define what credentials this tool needs to function properly.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="auth_type">Authentication Type *</Label>
                    <Select
                      value={formData.credential_requirements.auth_type}
                      onValueChange={(value: any) => setFormData(prev => ({
                        ...prev,
                        credential_requirements: { ...prev.credential_requirements, auth_type: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="documentation_url">Documentation URL</Label>
                    <Input
                      id="documentation_url"
                      value={formData.credential_requirements.documentation_url}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        credential_requirements: { ...prev.credential_requirements, documentation_url: e.target.value }
                      }))}
                      placeholder="https://docs.example.com/api-setup"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions">Setup Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={formData.credential_requirements.instructions}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        credential_requirements: { ...prev.credential_requirements, instructions: e.target.value }
                      }))}
                      placeholder="Provide step-by-step instructions for setting up credentials..."
                      rows={4}
                    />
                  </div>

                  {formData.credential_requirements.auth_type === 'oauth' && (
                    <div className="space-y-3 border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium text-blue-900">OAuth Configuration</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Authorization URL *</Label>
                          <Input placeholder="https://login.example.com/oauth2/authorize" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-sm">Access Token URL *</Label>
                          <Input placeholder="https://login.example.com/oauth2/token" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-sm">Client ID *</Label>
                          <Input placeholder="Client ID from provider" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-sm">Client Secret *</Label>
                          <Input type="password" placeholder="Client Secret" className="h-8" />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="schema" className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                      <Code className="h-4 w-4" />
                      Input Schema
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const schema = JSON.stringify([
                            { property: "input", type: "string", description: "Input text", required: true }
                          ], null, 2);
                          setFormData(prev => ({ ...prev, input_schema: JSON.parse(schema) }));
                        }}
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Paste JSON
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          input_schema: [...prev.input_schema, { property: '', type: 'string', description: '', required: false }]
                        }))}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Item
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                      <div>Property</div>
                      <div>Type</div>
                      <div>Description</div>
                      <div>Required</div>
                    </div>
                    
                    {formData.input_schema.map((item, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-center">
                        <Input
                          value={item.property}
                          onChange={(e) => {
                            const newSchema = [...formData.input_schema];
                            newSchema[index].property = e.target.value;
                            setFormData(prev => ({ ...prev, input_schema: newSchema }));
                          }}
                          placeholder="property_name"
                          className="h-8"
                        />
                        <Select
                          value={item.type}
                          onValueChange={(value) => {
                            const newSchema = [...formData.input_schema];
                            newSchema[index].type = value;
                            setFormData(prev => ({ ...prev, input_schema: newSchema }));
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="array">Array</SelectItem>
                            <SelectItem value="object">Object</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={item.description}
                          onChange={(e) => {
                            const newSchema = [...formData.input_schema];
                            newSchema[index].description = e.target.value;
                            setFormData(prev => ({ ...prev, input_schema: newSchema }));
                          }}
                          placeholder="Description"
                          className="h-8"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.required}
                            onChange={(e) => {
                              const newSchema = [...formData.input_schema];
                              newSchema[index].required = e.target.checked;
                              setFormData(prev => ({ ...prev, input_schema: newSchema }));
                            }}
                            className="rounded"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newSchema = formData.input_schema.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, input_schema: newSchema }));
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="function" className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-green-800 font-medium">
                        <Code className="h-4 w-4" />
                        JavaScript Function
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm">
                          How To Use Function
                        </Button>
                        <Button type="button" variant="outline" size="sm">
                          See Example
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Textarea
                      value={formData.javascript_function}
                      onChange={(e) => setFormData(prev => ({ ...prev, javascript_function: e.target.value }))}
                      placeholder="// Enter your JavaScript function here&#10;function processData(input) {&#10;  // Your code here&#10;  return result;&#10;}"
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <div className="absolute top-2 right-2">
                      <Button type="button" variant="ghost" size="sm" className="h-8">
                        Add
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <div className="flex gap-2 pt-6 border-t">
                  <Button type="button" onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating} className="flex-1">
                    {isCreating ? 'Creating...' : 'Create Tool'}
                  </Button>
                </div>
              </form>
            </Tabs>
          )}
        </div>

        {/* Action Buttons */}
        {showExistingTools && (
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedExistingTool}
              className="flex-1"
            >
              Save Configuration
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
