import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Filter, Plus, Users, MessageCircle, Bot, 
  AlertTriangle, Calendar, Database, Phone, Mail, 
  Settings, Code, Zap, Brain, Shield
} from 'lucide-react';

interface NodeTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  icon: React.ComponentType<any>;
  complexity: 'simple' | 'medium' | 'complex';
  tags: string[];
  defaultData: any;
  requiredConnectors?: string[];
  aiModel?: string;
}

const nodeTemplates: NodeTemplate[] = [
  // Customer Templates
  {
    id: 'patient-intake',
    name: 'Patient Intake',
    type: 'customer',
    category: 'Healthcare',
    description: 'Initial patient contact and information gathering',
    icon: Users,
    complexity: 'medium',
    tags: ['healthcare', 'intake', 'patient'],
    defaultData: {
      label: 'Patient Intake',
      description: 'Collect patient information and medical history',
      persona: 'Healthcare Seeker',
      variables: [
        { id: 'patient_name', name: 'Patient Name', type: 'string', required: true, description: 'Full patient name' },
        { id: 'dob', name: 'Date of Birth', type: 'string', required: true, description: 'Patient date of birth' },
        { id: 'insurance_id', name: 'Insurance ID', type: 'string', required: false, description: 'Insurance identification number' }
      ],
      dataStorage: {
        enabled: true,
        storageType: 'database',
        retentionDays: 2555, // 7 years for medical records
        maxRecords: 10000,
        fields: ['patient_name', 'dob', 'contact_info', 'insurance_info']
      }
    }
  },
  {
    id: 'customer-inquiry',
    name: 'Customer Inquiry',
    type: 'customer',
    category: 'General',
    description: 'Initial customer contact and inquiry handling',
    icon: MessageCircle,
    complexity: 'simple',
    tags: ['inquiry', 'customer', 'support'],
    defaultData: {
      label: 'Customer Inquiry',
      description: 'Handle initial customer questions and requests',
      persona: 'Support Seeker',
      variables: [
        { id: 'inquiry_type', name: 'Inquiry Type', type: 'string', required: true, description: 'Type of customer inquiry' },
        { id: 'priority', name: 'Priority Level', type: 'string', required: false, description: 'Inquiry priority (low, medium, high)' }
      ]
    }
  },

  // Interaction Templates
  {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    type: 'touchpoint',
    category: 'Healthcare',
    description: 'Schedule appointments with availability checking',
    icon: Calendar,
    complexity: 'medium',
    tags: ['appointment', 'scheduling', 'calendar'],
    defaultData: {
      label: 'Appointment Booking',
      description: 'Schedule patient appointments with automated availability checking',
      channel: 'chat',
      automationLevel: 85,
      variables: [
        { id: 'preferred_date', name: 'Preferred Date', type: 'string', required: true, description: 'Patient preferred appointment date' },
        { id: 'appointment_type', name: 'Appointment Type', type: 'string', required: true, description: 'Type of appointment needed' }
      ],
      apis: [
        {
          id: 'calendar_api',
          name: 'Calendar API',
          url: 'https://api.calendar.com/availability',
          method: 'GET',
          auth: { type: 'api_key', key: 'X-API-Key', value: '' },
          enabled: true
        }
      ]
    },
    requiredConnectors: ['Calendar API', 'SMS/Email']
  },
  {
    id: 'chat-support',
    name: 'Live Chat Support',
    type: 'touchpoint',
    category: 'Support',
    description: 'Real-time chat support with escalation',
    icon: MessageCircle,
    complexity: 'medium',
    tags: ['chat', 'support', 'realtime'],
    defaultData: {
      label: 'Live Chat Support',
      description: 'Provide real-time chat support with human escalation',
      channel: 'chat',
      automationLevel: 70,
      variables: [
        { id: 'chat_session', name: 'Chat Session ID', type: 'string', required: true, description: 'Unique chat session identifier' },
        { id: 'escalation_trigger', name: 'Escalation Trigger', type: 'boolean', required: false, description: 'Whether to escalate to human agent' }
      ]
    }
  },

  // AI Agent Templates
  {
    id: 'diagnostic-assistant',
    name: 'Diagnostic Assistant',
    type: 'agent',
    category: 'Healthcare',
    description: 'AI-powered diagnostic screening and triage',
    icon: Bot,
    complexity: 'complex',
    tags: ['ai', 'diagnostic', 'medical', 'triage'],
    defaultData: {
      label: 'Diagnostic Assistant',
      description: 'AI agent that performs initial diagnostic screening and patient triage',
      capabilities: ['Symptom Analysis', 'Triage', 'Medical History Review', 'Risk Assessment'],
      aiModel: 'gpt-4o',
      variables: [
        { id: 'symptoms', name: 'Patient Symptoms', type: 'array', required: true, description: 'List of reported symptoms' },
        { id: 'medical_history', name: 'Medical History', type: 'object', required: false, description: 'Patient medical history' },
        { id: 'risk_score', name: 'Risk Score', type: 'number', required: false, description: 'Calculated patient risk score' }
      ],
      apis: [
        {
          id: 'medical_db',
          name: 'Medical Database',
          url: 'https://api.medical.com/diagnose',
          method: 'POST',
          auth: { type: 'bearer', key: 'Authorization', value: '' },
          enabled: true
        }
      ]
    },
    requiredConnectors: ['Medical Database', 'OpenAI'],
    aiModel: 'gpt-4o'
  },
  {
    id: 'customer-service-bot',
    name: 'Customer Service Bot',
    type: 'agent',
    category: 'Support',
    description: 'General purpose customer service AI agent',
    icon: Bot,
    complexity: 'medium',
    tags: ['ai', 'customer-service', 'support'],
    defaultData: {
      label: 'Customer Service Bot',
      description: 'AI agent for handling common customer service inquiries',
      capabilities: ['FAQ', 'Order Status', 'Account Help', 'General Support'],
      aiModel: 'gpt-4o-mini',
      variables: [
        { id: 'customer_id', name: 'Customer ID', type: 'string', required: false, description: 'Customer identification' },
        { id: 'inquiry_category', name: 'Inquiry Category', type: 'string', required: true, description: 'Category of customer inquiry' }
      ]
    },
    aiModel: 'gpt-4o-mini'
  },

  // Decision Templates
  {
    id: 'urgency-triage',
    name: 'Medical Urgency Triage',
    type: 'decision',
    category: 'Healthcare',
    description: 'Assess medical urgency and route accordingly',
    icon: AlertTriangle,
    complexity: 'complex',
    tags: ['medical', 'triage', 'urgency', 'routing'],
    defaultData: {
      label: 'Medical Urgency Triage',
      description: 'Assess patient condition urgency and route to appropriate care level',
      conditions: ['Emergency', 'Urgent', 'Standard', 'Routine'],
      variables: [
        { id: 'symptoms_severity', name: 'Symptom Severity', type: 'number', required: true, description: 'Severity score (1-10)' },
        { id: 'vital_signs', name: 'Vital Signs', type: 'object', required: false, description: 'Patient vital signs data' }
      ]
    }
  },
  {
    id: 'escalation-decision',
    name: 'Support Escalation',
    type: 'decision',
    category: 'Support',
    description: 'Determine if inquiry needs human escalation',
    icon: AlertTriangle,
    complexity: 'simple',
    tags: ['escalation', 'support', 'routing'],
    defaultData: {
      label: 'Support Escalation',
      description: 'Determine if customer inquiry requires human agent intervention',
      conditions: ['Escalate', 'Continue AI', 'Transfer Department'],
      variables: [
        { id: 'complexity_score', name: 'Complexity Score', type: 'number', required: true, description: 'Inquiry complexity (1-5)' },
        { id: 'customer_satisfaction', name: 'Customer Satisfaction', type: 'number', required: false, description: 'Current satisfaction level' }
      ]
    }
  },

  // Process Templates
  {
    id: 'insurance-verification',
    name: 'Insurance Verification',
    type: 'process',
    category: 'Healthcare',
    description: 'Verify patient insurance coverage and benefits',
    icon: Shield,
    complexity: 'complex',
    tags: ['insurance', 'verification', 'benefits'],
    defaultData: {
      label: 'Insurance Verification',
      description: 'Verify patient insurance coverage, benefits, and co-pay requirements',
      variables: [
        { id: 'insurance_provider', name: 'Insurance Provider', type: 'string', required: true, description: 'Insurance company name' },
        { id: 'policy_number', name: 'Policy Number', type: 'string', required: true, description: 'Insurance policy number' },
        { id: 'coverage_details', name: 'Coverage Details', type: 'object', required: false, description: 'Detailed coverage information' }
      ],
      apis: [
        {
          id: 'insurance_api',
          name: 'Insurance Verification API',
          url: 'https://api.insurance.com/verify',
          method: 'POST',
          auth: { type: 'api_key', key: 'X-API-Key', value: '' },
          enabled: true
        }
      ],
      dataStorage: {
        enabled: true,
        storageType: 'database',
        retentionDays: 365,
        maxRecords: 50000,
        fields: ['policy_number', 'coverage_status', 'verification_date']
      }
    },
    requiredConnectors: ['Insurance API']
  },
  {
    id: 'data-processing',
    name: 'Data Processing',
    type: 'process',
    category: 'General',
    description: 'Process and transform data between systems',
    icon: Database,
    complexity: 'medium',
    tags: ['data', 'processing', 'transformation'],
    defaultData: {
      label: 'Data Processing',
      description: 'Process, validate, and transform data between different systems',
      variables: [
        { id: 'input_data', name: 'Input Data', type: 'object', required: true, description: 'Data to be processed' },
        { id: 'transformation_rules', name: 'Transformation Rules', type: 'array', required: false, description: 'Data transformation rules' }
      ]
    }
  }
];

interface NodeTemplateLibraryProps {
  onAddTemplate: (template: NodeTemplate, position: { x: number; y: number }) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NodeTemplateLibrary: React.FC<NodeTemplateLibraryProps> = ({
  onAddTemplate,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  const categories = ['all', ...Array.from(new Set(nodeTemplates.map(t => t.category)))];
  const complexities = ['all', 'simple', 'medium', 'complex'];

  const filteredTemplates = nodeTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity;
    
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const handleAddTemplate = (template: NodeTemplate) => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100
    };
    onAddTemplate(template, position);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'complex': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-[90vw] max-w-6xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Node Template Library
              <Badge variant="secondary">{filteredTemplates.length} Templates</Badge>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </CardTitle>
          
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            
            <select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {complexities.map(comp => (
                <option key={comp} value={comp}>
                  {comp === 'all' ? 'All Levels' : comp}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs defaultValue="grid" className="h-full flex flex-col">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                  {filteredTemplates.map(template => {
                    const IconComponent = template.icon;
                    return (
                      <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-md">
                                <IconComponent className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm">{template.name}</h3>
                                <p className="text-xs text-muted-foreground">{template.category}</p>
                              </div>
                            </div>
                            <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>
                              {template.complexity}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {template.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          {template.requiredConnectors && (
                            <div className="mb-3">
                              <p className="text-xs font-medium mb-1">Required:</p>
                              <div className="flex flex-wrap gap-1">
                                {template.requiredConnectors.slice(0, 2).map(connector => (
                                  <Badge key={connector} variant="secondary" className="text-xs">
                                    {connector}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <Button
                            size="sm"
                            onClick={() => handleAddTemplate(template)}
                            className="w-full"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Workflow
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="list" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-2 p-2">
                  {filteredTemplates.map(template => {
                    const IconComponent = template.icon;
                    return (
                      <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 bg-primary/10 rounded-md">
                                <IconComponent className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-sm">{template.name}</h3>
                                  <Badge variant="outline" className="text-xs">{template.category}</Badge>
                                  <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>
                                    {template.complexity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{template.description}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddTemplate(template)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};