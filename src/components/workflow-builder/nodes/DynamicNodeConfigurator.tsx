import React, { useState, useEffect, useMemo } from 'react';
import { Node } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, CheckCircle2, Settings, Key, Code, Zap, X, Bot, Database, MessageSquare, Users, Phone } from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { supabase } from '@/integrations/supabase/client';

interface DynamicNodeConfiguratorProps {
  node: Node | null;
  onNodeUpdate: (nodeId: string, updates: any) => void;
  onClose: () => void;
}

interface NodeField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'slider' | 'password' | 'multiselect';
  label: string;
  description?: string;
  required: boolean;
  category: string;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  validation?: (value: any) => string | null;
}

interface NodeSchema {
  nodeType: string;
  displayName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  categories: string[];
  fields: NodeField[];
  capabilities?: string[];
  channels?: string[];
  scenarios?: string[];
}

// Enhanced Node Schema Registry for all future agent types
const NODE_SCHEMAS: Record<string, NodeSchema> = {
  'customer-support-agent': {
    nodeType: 'customer-support-agent',
    displayName: 'Customer Support Agent',
    description: 'AI agent specialized in customer service and support',
    icon: MessageSquare,
    categories: ['basic', 'ai', 'channels', 'capabilities', 'advanced'],
    scenarios: ['Live Chat Support', 'Email Support', 'Ticket Resolution', 'FAQ Assistance'],
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Agent Name',
        description: 'Display name for this customer support agent',
        required: true,
        category: 'basic',
        defaultValue: 'Customer Support Agent'
      },
      {
        id: 'model',
        name: 'model',
        type: 'select',
        label: 'AI Model',
        description: 'Select the AI model to power this agent',
        required: true,
        category: 'ai',
        options: [
          { value: 'gpt-4o', label: 'GPT-4 Omni' },
          { value: 'gpt-4o-mini', label: 'GPT-4 Omni Mini' },
          { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
          { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' }
        ]
      },
      {
        id: 'system_prompt',
        name: 'system_prompt',
        type: 'textarea',
        label: 'System Prompt',
        description: 'Instructions that define the agent\'s behavior and personality',
        required: true,
        category: 'ai',
        defaultValue: 'You are a helpful customer support agent. Be friendly, professional, and solution-oriented.'
      },
      {
        id: 'temperature',
        name: 'temperature',
        type: 'slider',
        label: 'Temperature',
        description: 'Controls randomness in responses (0 = deterministic, 1 = creative)',
        required: false,
        category: 'ai',
        defaultValue: 0.7,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        id: 'max_tokens',
        name: 'max_tokens',
        type: 'number',
        label: 'Max Response Length',
        description: 'Maximum number of tokens in agent responses',
        required: false,
        category: 'ai',
        defaultValue: 1000,
        min: 100,
        max: 4000
      },
      {
        id: 'channels',
        name: 'channels',
        type: 'multiselect',
        label: 'Communication Channels',
        description: 'Channels where this agent will operate',
        required: true,
        category: 'channels',
        options: [
          { value: 'web-chat', label: 'Web Chat' },
          { value: 'email', label: 'Email' },
          { value: 'sms', label: 'SMS' },
          { value: 'whatsapp', label: 'WhatsApp' },
          { value: 'slack', label: 'Slack' },
          { value: 'teams', label: 'Microsoft Teams' }
        ]
      },
      {
        id: 'capabilities',
        name: 'capabilities',
        type: 'multiselect',
        label: 'Agent Capabilities',
        description: 'What this agent can help customers with',
        required: true,
        category: 'capabilities',
        options: [
          { value: 'answer-faqs', label: 'Answer FAQs' },
          { value: 'create-tickets', label: 'Create Support Tickets' },
          { value: 'track-orders', label: 'Order Tracking' },
          { value: 'process-returns', label: 'Returns & Refunds' },
          { value: 'product-info', label: 'Product Information' },
          { value: 'account-help', label: 'Account Assistance' },
          { value: 'billing-support', label: 'Billing Support' },
          { value: 'technical-help', label: 'Technical Support' }
        ]
      },
      {
        id: 'escalation_enabled',
        name: 'escalation_enabled',
        type: 'boolean',
        label: 'Enable Escalation',
        description: 'Allow agent to escalate complex issues to human agents',
        required: false,
        category: 'advanced',
        defaultValue: true
      },
      {
        id: 'knowledge_base',
        name: 'knowledge_base',
        type: 'select',
        label: 'Knowledge Base',
        description: 'Knowledge source for the agent',
        required: false,
        category: 'advanced',
        options: [
          { value: 'general', label: 'General Knowledge' },
          { value: 'company-kb', label: 'Company Knowledge Base' },
          { value: 'product-docs', label: 'Product Documentation' },
          { value: 'custom', label: 'Custom Knowledge Base' }
        ]
      }
    ]
  },
  'sales-agent': {
    nodeType: 'sales-agent',
    displayName: 'Sales Agent',
    description: 'AI agent optimized for sales conversations and lead qualification',
    icon: Users,
    categories: ['basic', 'ai', 'sales', 'channels', 'advanced'],
    scenarios: ['Lead Qualification', 'Product Demos', 'Quote Generation', 'Follow-up Campaigns'],
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Agent Name',
        description: 'Display name for this sales agent',
        required: true,
        category: 'basic',
        defaultValue: 'Sales Agent'
      },
      {
        id: 'model',
        name: 'model',
        type: 'select',
        label: 'AI Model',
        required: true,
        category: 'ai',
        options: [
          { value: 'gpt-4o', label: 'GPT-4 Omni' },
          { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' }
        ]
      },
      {
        id: 'sales_approach',
        name: 'sales_approach',
        type: 'select',
        label: 'Sales Approach',
        description: 'Primary sales methodology',
        required: true,
        category: 'sales',
        options: [
          { value: 'consultative', label: 'Consultative Selling' },
          { value: 'solution', label: 'Solution Selling' },
          { value: 'challenger', label: 'Challenger Sale' },
          { value: 'relationship', label: 'Relationship Selling' }
        ]
      },
      {
        id: 'products',
        name: 'products',
        type: 'multiselect',
        label: 'Product Portfolio',
        description: 'Products this agent can sell',
        required: true,
        category: 'sales',
        options: [
          { value: 'software', label: 'Software Solutions' },
          { value: 'consulting', label: 'Consulting Services' },
          { value: 'training', label: 'Training Programs' },
          { value: 'support', label: 'Support Packages' }
        ]
      }
    ]
  },
  'voice-agent': {
    nodeType: 'voice-agent',
    displayName: 'Voice Agent',
    description: 'AI agent specialized in voice interactions and phone calls',
    icon: Phone,
    categories: ['basic', 'ai', 'voice', 'channels', 'advanced'],
    scenarios: ['Phone Support', 'Appointment Booking', 'Surveys', 'Sales Calls'],
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Agent Name',
        required: true,
        category: 'basic',
        defaultValue: 'Voice Agent'
      },
      {
        id: 'voice_provider',
        name: 'voice_provider',
        type: 'select',
        label: 'Voice Provider',
        required: true,
        category: 'voice',
        options: [
          { value: 'elevenlabs', label: 'ElevenLabs' },
          { value: 'openai-tts', label: 'OpenAI TTS' },
          { value: 'azure-speech', label: 'Azure Speech' }
        ]
      },
      {
        id: 'voice_id',
        name: 'voice_id',
        type: 'select',
        label: 'Voice Selection',
        required: true,
        category: 'voice',
        options: [
          { value: 'professional-f', label: 'Professional Female' },
          { value: 'professional-m', label: 'Professional Male' },
          { value: 'friendly-f', label: 'Friendly Female' },
          { value: 'friendly-m', label: 'Friendly Male' }
        ]
      },
      {
        id: 'speech_speed',
        name: 'speech_speed',
        type: 'slider',
        label: 'Speech Speed',
        required: false,
        category: 'voice',
        defaultValue: 1.0,
        min: 0.5,
        max: 2.0,
        step: 0.1
      },
      {
        id: 'interrupt_enabled',
        name: 'interrupt_enabled',
        type: 'boolean',
        label: 'Allow Interruptions',
        description: 'Allow callers to interrupt the agent',
        required: false,
        category: 'voice',
        defaultValue: true
      }
    ]
  },
  'data-processor': {
    nodeType: 'data-processor',
    displayName: 'Data Processor',
    description: 'Node for processing, validating, and transforming data',
    icon: Database,
    categories: ['basic', 'data', 'validation', 'output'],
    scenarios: ['Data Validation', 'Format Conversion', 'Data Enrichment', 'Quality Checks'],
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Processor Name',
        required: true,
        category: 'basic'
      },
      {
        id: 'input_format',
        name: 'input_format',
        type: 'select',
        label: 'Input Format',
        required: true,
        category: 'data',
        options: [
          { value: 'json', label: 'JSON' },
          { value: 'csv', label: 'CSV' },
          { value: 'xml', label: 'XML' },
          { value: 'text', label: 'Plain Text' }
        ]
      },
      {
        id: 'validation_rules',
        name: 'validation_rules',
        type: 'multiselect',
        label: 'Validation Rules',
        required: false,
        category: 'validation',
        options: [
          { value: 'email-format', label: 'Email Format' },
          { value: 'phone-format', label: 'Phone Format' },
          { value: 'required-fields', label: 'Required Fields' },
          { value: 'data-types', label: 'Data Types' },
          { value: 'custom-regex', label: 'Custom Regex' }
        ]
      }
    ]
  }
};

export const DynamicNodeConfigurator: React.FC<DynamicNodeConfiguratorProps> = ({
  node,
  onNodeUpdate,
  onClose
}) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  // Determine node schema based on node type
  const nodeSchema = useMemo(() => {
    if (!node) return null;
    
    const nodeType = String(node.data?.type_key || node.data?.nodeType || node.type || 'customer-support-agent');
    return NODE_SCHEMAS[nodeType as keyof typeof NODE_SCHEMAS] || NODE_SCHEMAS['customer-support-agent'];
  }, [node]);

  useEffect(() => {
    if (node && nodeSchema) {
      // Initialize config with existing data and defaults
      const initialConfig = { ...node.data };
      
      // Set defaults for missing fields
      nodeSchema.fields.forEach(field => {
        if (!(field.name in initialConfig) && field.defaultValue !== undefined) {
          initialConfig[field.name] = field.defaultValue;
        }
      });
      
      setConfig(initialConfig);
    }
  }, [node, nodeSchema]);

  if (!node || !nodeSchema) {
    return null;
  }

  const updateConfig = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onNodeUpdate(node.id, newConfig);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      const missingFields = nodeSchema.fields
        .filter(field => field.required && !config[field.name])
        .map(field => field.label);
      
      if (missingFields.length > 0) {
        showError(`Please fill required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Save to database if needed
      await onNodeUpdate(node.id, {
        ...config,
        last_saved_at: new Date().toISOString(),
        configured: true
      });
      
      showSuccess('Configuration saved successfully');
    } catch (error: any) {
      showError(error?.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: NodeField) => {
    const currentValue = config[field.name];
    
    switch (field.type) {
      case 'text':
      case 'password':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">{field.label}</Label>
            <Input
              type={field.type}
              value={currentValue || ''}
              onChange={(e) => updateConfig(field.name, e.target.value)}
              placeholder={field.description}
              className="text-sm"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">{field.label}</Label>
            <Textarea
              value={currentValue || ''}
              onChange={(e) => updateConfig(field.name, e.target.value)}
              placeholder={field.description}
              className="text-sm resize-none"
              rows={3}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
        
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">{field.label}</Label>
            <Select value={currentValue || ''} onValueChange={(value) => updateConfig(field.name, value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
        
      case 'multiselect':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">{field.label}</Label>
            <div className="grid grid-cols-2 gap-2">
              {field.options?.map((option) => {
                const isSelected = Array.isArray(currentValue) && currentValue.includes(option.value);
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Switch
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const current = Array.isArray(currentValue) ? currentValue : [];
                        if (checked) {
                          updateConfig(field.name, [...current, option.value]);
                        } else {
                          updateConfig(field.name, current.filter(v => v !== option.value));
                        }
                      }}
                    />
                    <Label className="text-xs">{option.label}</Label>
                  </div>
                );
              })}
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
        
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">{field.label}</Label>
            <Input
              type="number"
              value={currentValue || ''}
              onChange={(e) => updateConfig(field.name, parseInt(e.target.value))}
              min={field.min}
              max={field.max}
              className="text-sm"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
        
      case 'slider':
        return (
          <div key={field.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{field.label}</Label>
              <span className="text-sm text-muted-foreground">
                {currentValue !== undefined ? currentValue : field.defaultValue}
              </span>
            </div>
            <Slider
              value={[currentValue !== undefined ? currentValue : field.defaultValue || 0]}
              onValueChange={(value) => updateConfig(field.name, value[0])}
              max={field.max || 1}
              min={field.min || 0}
              step={field.step || 0.1}
              className="w-full"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
        
      case 'boolean':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{field.label}</Label>
              <Switch
                checked={currentValue !== undefined ? currentValue : field.defaultValue}
                onCheckedChange={(checked) => updateConfig(field.name, checked)}
              />
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  const IconComponent = nodeSchema.icon;
  const requiredFields = nodeSchema.fields.filter(f => f.required);
  const completedRequired = requiredFields.filter(f => config[f.name]).length;
  const completeness = requiredFields.length > 0 ? Math.round((completedRequired / requiredFields.length) * 100) : 100;

  return (
    <Card className="w-full h-full border-0 shadow-lg">
      <CardHeader className="border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <IconComponent className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">{nodeSchema.displayName}</CardTitle>
                <p className="text-sm text-muted-foreground">{nodeSchema.description}</p>
              </div>
            </div>
            <Badge variant={completeness === 100 ? "default" : "destructive"}>
              {completeness}% Complete
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving}>
              Save Configuration
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close configurator">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="sticky top-0 z-50 grid w-full grid-cols-5 h-auto p-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
            {nodeSchema.categories.map(category => {
              const categoryFields = nodeSchema.fields.filter(f => f.category === category);
              const requiredInCategory = categoryFields.filter(f => f.required);
              const completedInCategory = requiredInCategory.filter(f => config[f.name]);
              const hasIssues = requiredInCategory.length > 0 && completedInCategory.length < requiredInCategory.length;
              
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className={`relative ${hasIssues ? 'text-red-600' : ''}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  {hasIssues && (
                    <AlertCircle className="h-3 w-3 ml-1 text-red-500" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {nodeSchema.categories.map(category => (
            <TabsContent key={category} value={category} className="p-6 space-y-4">
              {nodeSchema.fields
                .filter(field => field.category === category)
                .map(renderField)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Export the schema registry for use by other components
export { NODE_SCHEMAS };