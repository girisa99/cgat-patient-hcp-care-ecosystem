import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Database, Shield, Brain, Activity } from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useMasterToast } from '@/hooks/useMasterToast';

interface BusinessToolFormData {
  category_id: string;
  type_key: string;
  display_name: string;
  description: string;
  detailed_explanation: string;
  icon: string;
  color: string;
  capabilities: string[];
  requirements: Record<string, any>;
  default_config: Record<string, any>;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
}

const COMMON_ICONS = [
  'shield', 'database', 'brain', 'activity', 'user-check', 'pill',
  'stethoscope', 'shield-check', 'globe', 'building', 'file-text',
  'search', 'check-circle', 'alert-triangle', 'zap', 'settings'
];

const BUSINESS_CATEGORIES = [
  {
    id: 'healthcare_compliance',
    name: 'Healthcare & Compliance',
    description: 'Healthcare validation and compliance tools',
    color: '#dc2626'
  },
  {
    id: 'financial_services',
    name: 'Financial Services',
    description: 'Banking, payments, and financial validation',
    color: '#059669'
  },
  {
    id: 'government_apis',
    name: 'Government APIs',
    description: 'Government databases and regulatory services',
    color: '#7c3aed'
  },
  {
    id: 'business_intelligence',
    name: 'Business Intelligence',
    description: 'Analytics, reporting, and data insights',
    color: '#ea580c'
  }
];

const TEMPLATE_TOOLS = {
  api_validator: {
    display_name: 'API Validator',
    description: 'Validate data using external APIs',
    capabilities: ['api_integration', 'data_validation', 'real_time_check'],
    requirements: { api_endpoint: true, auth_method: 'optional' },
    default_config: { timeout: 30000, retry_attempts: 3, cache_duration: 300 },
    input_schema: { 
      data: { type: 'object', required: true },
      validation_rules: { type: 'array', required: false }
    },
    output_schema: {
      is_valid: { type: 'boolean' },
      validation_results: { type: 'object' },
      errors: { type: 'array' }
    }
  },
  compliance_checker: {
    display_name: 'Compliance Checker',
    description: 'Check regulatory compliance requirements',
    capabilities: ['compliance_validation', 'regulatory_check', 'audit_trail'],
    requirements: { compliance_framework: true, security_level: 'high' },
    default_config: { scan_depth: 'full', generate_report: true },
    input_schema: {
      data_flow: { type: 'object', required: true },
      compliance_rules: { type: 'array', required: true }
    },
    output_schema: {
      compliance_score: { type: 'number' },
      violations: { type: 'array' },
      recommendations: { type: 'array' }
    }
  },
  data_enrichment: {
    display_name: 'Data Enrichment',
    description: 'Enrich data with external information',
    capabilities: ['data_enrichment', 'external_lookup', 'data_transformation'],
    requirements: { data_sources: true, mapping_rules: 'optional' },
    default_config: { max_enrichment_fields: 10, cache_results: true },
    input_schema: {
      base_data: { type: 'object', required: true },
      enrichment_fields: { type: 'array', required: true }
    },
    output_schema: {
      enriched_data: { type: 'object' },
      enrichment_status: { type: 'string' },
      metadata: { type: 'object' }
    }
  }
};

export const BusinessToolManager: React.FC = () => {
  const { categories, createNodeType, isCreating } = useWorkflowNodes();
  const { toast } = useMasterToast();
  const [activeTab, setActiveTab] = useState('create');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  const [formData, setFormData] = useState<BusinessToolFormData>({
    category_id: '',
    type_key: '',
    display_name: '',
    description: '',
    detailed_explanation: '',
    icon: 'settings',
    color: '#6366f1',
    capabilities: [],
    requirements: {},
    default_config: {},
    input_schema: {},
    output_schema: {}
  });

  const handleInputChange = (field: keyof BusinessToolFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (templateKey: string) => {
    const template = TEMPLATE_TOOLS[templateKey as keyof typeof TEMPLATE_TOOLS];
    if (template) {
      setFormData(prev => ({
        ...prev,
        ...template,
        type_key: templateKey,
      }));
      setSelectedTemplate(templateKey);
    }
  };

  const handleCapabilityAdd = (capability: string) => {
    if (capability && !formData.capabilities.includes(capability)) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, capability]
      }));
    }
  };

  const handleCapabilityRemove = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(c => c !== capability)
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.category_id || !formData.type_key || !formData.display_name) {
        toast.error('Please fill in all required fields');
        return;
      }

      await createNodeType({
        type: formData.type_key,
        category: formData.category_id,
        label: formData.display_name,
        description: formData.description || '',
        configuration: formData.default_config || {}
      });
      
      // Reset form
      setFormData({
        category_id: '',
        type_key: '',
        display_name: '',
        description: '',
        detailed_explanation: '',
        icon: 'settings',
        color: '#6366f1',
        capabilities: [],
        requirements: {},
        default_config: {},
        input_schema: {},
        output_schema: {}
      });
      setSelectedTemplate('');
      
    } catch (error) {
      console.error('Error creating business tool:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Business Tool Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Tool</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type_key">Type Key * (unique identifier)</Label>
                    <Input
                      id="type_key"
                      value={formData.type_key}
                      onChange={(e) => handleInputChange('type_key', e.target.value)}
                      placeholder="e.g., npi_validator"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name *</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                      placeholder="e.g., NPI Validator"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of the tool's purpose"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="detailed_explanation">Detailed Explanation</Label>
                    <Textarea
                      id="detailed_explanation"
                      value={formData.detailed_explanation}
                      onChange={(e) => handleInputChange('detailed_explanation', e.target.value)}
                      placeholder="Comprehensive explanation of functionality, use cases, and integration details"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuration</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Select value={formData.icon} onValueChange={(value) => handleInputChange('icon', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_ICONS.map(icon => (
                            <SelectItem key={icon} value={icon}>
                              {icon}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Capabilities</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.capabilities.map(capability => (
                        <Badge 
                          key={capability} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleCapabilityRemove(capability)}
                        >
                          {capability} ×
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add capability"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCapabilityAdd((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements (JSON)</Label>
                    <Textarea
                      id="requirements"
                      value={JSON.stringify(formData.requirements, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          handleInputChange('requirements', parsed);
                        } catch (error) {
                          // Invalid JSON, don't update
                        }
                      }}
                      placeholder='{"api_key": true, "rate_limit": 1000}'
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_config">Default Config (JSON)</Label>
                    <Textarea
                      id="default_config"
                      value={JSON.stringify(formData.default_config, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          handleInputChange('default_config', parsed);
                        } catch (error) {
                          // Invalid JSON, don't update
                        }
                      }}
                      placeholder='{"timeout": 30000, "cache": true}'
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isCreating}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {isCreating ? 'Creating...' : 'Create Business Tool'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(TEMPLATE_TOOLS).map(([key, template]) => (
                  <Card 
                    key={key} 
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === key ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleTemplateSelect(key)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{template.display_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.capabilities.slice(0, 3).map(cap => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BUSINESS_CATEGORIES.map(category => (
                  <Card key={category.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};