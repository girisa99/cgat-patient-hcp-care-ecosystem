import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, ShieldCheck, CreditCard, FileText, Bot, 
  MessageSquare, Database, Building, Users, AlertTriangle,
  Clock, CheckCircle, Workflow
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  systems: string[];
  useCase: string;
  estimatedSetupTime: string;
  complexity: 'Low' | 'Medium' | 'High';
  role: string;
}

const agentTemplates: AgentTemplate[] = [
  {
    id: 'healthcare-compliance',
    name: 'Healthcare Compliance Monitor',
    description: 'Monitors FDA alerts, adverse events, and regulatory compliance across healthcare systems',
    category: 'Healthcare',
    icon: ShieldCheck,
    systems: ['OpenFDA', 'Veeva CRM', 'ICD-10', 'Adverse Events API', 'Email Notifications'],
    useCase: 'Automatically detect regulatory changes, monitor adverse events, and alert compliance teams',
    estimatedSetupTime: '15 minutes',
    complexity: 'Medium',
    role: 'Compliance Officer'
  },
  {
    id: 'prior-auth-assistant',
    name: 'Prior Authorization Assistant',
    description: 'Automates prior authorization workflows with insurance providers',
    category: 'Insurance',
    icon: CreditCard,
    systems: ['Insurance APIs', 'Benefit Verification', 'Epic/Cerner', 'PA Requirements DB'],
    useCase: 'Streamline prior authorization process, check benefits, and manage PA requirements',
    estimatedSetupTime: '20 minutes',
    complexity: 'High',
    role: 'Care Manager'
  },
  {
    id: 'patient-onboarding',
    name: 'Patient Onboarding Agent',
    description: 'Guides new patients through treatment center onboarding process',
    category: 'Onboarding',
    icon: Users,
    systems: ['Treatment Centers DB', 'SMS/Email', 'Salesforce', 'Document Management'],
    useCase: 'Automate patient intake, document collection, and initial assessments',
    estimatedSetupTime: '10 minutes',
    complexity: 'Low',
    role: 'Patient Coordinator'
  },
  {
    id: 'clinical-data-processor',
    name: 'Clinical Data Processor',
    description: 'Processes and validates clinical information using standard codes',
    category: 'Clinical',
    icon: Stethoscope,
    systems: ['ICD-10/11', 'HCPCS', 'NDC Database', 'PostgreSQL', 'Data Validation APIs'],
    useCase: 'Validate clinical codes, process medical records, and ensure data accuracy',
    estimatedSetupTime: '25 minutes',
    complexity: 'High',
    role: 'Clinical Data Manager'
  },
  {
    id: 'customer-support-ai',
    name: 'Intelligent Customer Support',
    description: 'AI-powered customer support with multi-channel communication',
    category: 'Support',
    icon: MessageSquare,
    systems: ['GPT-4', 'Slack', 'Email', 'ServiceNow', 'Knowledge Base'],
    useCase: 'Provide instant customer support across multiple channels with ticket routing',
    estimatedSetupTime: '12 minutes',
    complexity: 'Medium',
    role: 'Customer Support'
  },
  {
    id: 'adverse-event-monitor',
    name: 'Adverse Event Monitor',
    description: 'Monitors and reports adverse events and safety signals',
    category: 'Safety',
    icon: AlertTriangle,
    systems: ['AE Database', 'FDA AERS', 'Medical Literature APIs', 'Alert System'],
    useCase: 'Detect safety signals, monitor adverse events, and generate safety reports',
    estimatedSetupTime: '30 minutes',
    complexity: 'High',
    role: 'Safety Officer'
  },
  {
    id: 'dev-workflow-automation',
    name: 'Development Workflow Automation',
    description: 'Automates CI/CD pipelines and development workflows',
    category: 'Development',
    icon: Workflow,
    systems: ['GitHub', 'Jenkins', 'Jira', 'Slack', 'Code Quality Tools'],
    useCase: 'Automate code reviews, deployments, and project management workflows',
    estimatedSetupTime: '18 minutes',
    complexity: 'Medium',
    role: 'DevOps Engineer'
  },
  {
    id: 'product-info-manager',
    name: 'Product Information Manager',
    description: 'Manages product data including NDC, dosage, and packaging information',
    category: 'Product',
    icon: FileText,
    systems: ['NDC Database', 'Product Catalog', 'Labeling System', 'Regulatory DB'],
    useCase: 'Maintain accurate product information, dosage data, and regulatory compliance',
    estimatedSetupTime: '22 minutes',
    complexity: 'Medium',
    role: 'Product Manager'
  },
  {
    id: 'crm-integration-hub',
    name: 'CRM Integration Hub',
    description: 'Centralizes customer data across multiple CRM systems',
    category: 'CRM',
    icon: Building,
    systems: ['Salesforce', 'Veeva', 'MS Dynamics', 'Data Sync APIs', 'MongoDB'],
    useCase: 'Synchronize customer data across CRM platforms and maintain data consistency',
    estimatedSetupTime: '35 minutes',
    complexity: 'High',
    role: 'CRM Administrator'
  },
  {
    id: 'smart-scheduler',
    name: 'Smart Appointment Scheduler',
    description: 'AI-powered scheduling with availability optimization',
    category: 'Scheduling',
    icon: Clock,
    systems: ['Calendar APIs', 'SMS', 'Email', 'Provider Schedules', 'Patient Preferences'],
    useCase: 'Optimize appointment scheduling based on provider availability and patient needs',
    estimatedSetupTime: '16 minutes',
    complexity: 'Medium',
    role: 'Scheduler'
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance Agent',
    description: 'Monitors data quality and system performance',
    category: 'Quality',
    icon: CheckCircle,
    systems: ['Data Quality Tools', 'Monitoring APIs', 'Alert System', 'Reporting DB'],
    useCase: 'Ensure data quality, monitor system health, and generate quality reports',
    estimatedSetupTime: '20 minutes',
    complexity: 'Medium',
    role: 'Quality Analyst'
  },
  {
    id: 'ai-research-assistant',
    name: 'AI Research Assistant',
    description: 'Assists with research tasks using multiple AI models',
    category: 'Research',
    icon: Bot,
    systems: ['GPT-4', 'Claude AI', 'Perplexity', 'Research DBs', 'Literature APIs'],
    useCase: 'Support research activities with AI-powered analysis and literature review',
    estimatedSetupTime: '14 minutes',
    complexity: 'Low',
    role: 'Researcher'
  }
];

interface AgentTemplatesProps {
  onSelectTemplate?: (templateId: string) => void;
  selectedTemplateId?: string | null;
}

export const AgentTemplates: React.FC<AgentTemplatesProps> = ({ 
  onSelectTemplate, 
  selectedTemplateId 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);

  const categories = ['All', 'Healthcare', 'Insurance', 'Onboarding', 'Clinical', 'Support', 'Safety', 'Development', 'Product', 'CRM', 'Scheduling', 'Quality', 'Research'];

  const filteredTemplates = selectedCategory === 'All' 
    ? agentTemplates 
    : agentTemplates.filter(template => template.category === selectedCategory);

  const handleUseTemplate = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate?.(template.id);
    toast({
      title: "Template Selected",
      description: `Starting configuration for ${template.name}. Pre-configured systems will be automatically connected.`,
    });
  };

  const handleDeployTemplate = () => {
    if (!selectedTemplate) return;
    
    toast({
      title: "Agent Deployed Successfully!",
      description: `${selectedTemplate.name} is now live with ${selectedTemplate.systems.length} pre-configured integrations.`,
    });
    setSelectedTemplate(null);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Agent Templates</h2>
        <p className="text-muted-foreground">Pre-configured agent templates for common use cases</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const IconComponent = template.icon;
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge className={getComplexityColor(template.complexity)}>
                          {template.complexity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Use Case</h4>
                  <p className="text-sm">{template.useCase}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Target Role</h4>
                  <Badge variant="secondary">{template.role}</Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Integrated Systems ({template.systems.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {template.systems.slice(0, 3).map((system, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {system}
                      </Badge>
                    ))}
                    {template.systems.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.systems.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Setup: {template.estimatedSetupTime}
                  </div>
                  <Button 
                    onClick={() => handleUseTemplate(template)}
                    className="gap-2"
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Configuration Modal */}
      {selectedTemplate && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <selectedTemplate.icon className="h-6 w-6" />
              Configure {selectedTemplate.name}
            </CardTitle>
            <CardDescription>
              Review and customize the template configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Pre-configured Systems</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedTemplate.systems.map((system, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{system}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleDeployTemplate} className="flex-1">
                Deploy Agent
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
                className="flex-1"
              >
                Customize Further
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};