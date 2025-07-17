import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, Database, MessageSquare, Globe, Settings, 
  Stethoscope, ShieldCheck, CreditCard, FileText,
  Building, Workflow, GitBranch, Server, Phone, Key,
  Cloud, Lock, Users, Network, Brain, Cpu
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ComponentType {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<any>;
  description: string;
  configurable: boolean;
}

interface AuthMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface AgentFormData {
  name: string;
  brand: string;
  purpose: string;
  useCase: string;
  agentType: 'single' | 'multi';
  selectedModels: string[];
  selectedSystems: string[];
  selectedAuth: string[];
  selectedAPIs: string[];
  selectedEndpoints: string[];
  category: string;
}

// AI Models
const aiModels = [
  { id: 'gpt-4o', name: 'GPT-4o', category: 'OpenAI', icon: Brain, description: 'Latest OpenAI model with vision', configurable: true },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', category: 'OpenAI', icon: Brain, description: 'Fast GPT-4 variant', configurable: true },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', category: 'Anthropic', icon: Brain, description: 'Most capable Claude model', configurable: true },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', category: 'Anthropic', icon: Brain, description: 'Balanced Claude model', configurable: true },
  { id: 'gemini-pro', name: 'Gemini Pro', category: 'Google', icon: Brain, description: 'Google advanced AI model', configurable: true },
  { id: 'gemini-ultra', name: 'Gemini Ultra', category: 'Google', icon: Brain, description: 'Google most capable model', configurable: true },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', category: 'DeepSeek', icon: Cpu, description: 'Code-specialized model', configurable: true },
  { id: 'perplexity-online', name: 'Perplexity Online', category: 'Perplexity', icon: Globe, description: 'Real-time web search AI', configurable: true },
];

// System Components
const systemComponents: ComponentType[] = [
  // CRM Systems
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', icon: Building, description: 'Customer relationship management', configurable: true },
  { id: 'veeva', name: 'Veeva CRM', category: 'CRM', icon: Stethoscope, description: 'Life sciences CRM', configurable: true },
  { id: 'dynamics', name: 'MS Dynamics', category: 'CRM', icon: Building, description: 'Microsoft CRM platform', configurable: true },
  { id: 'sap', name: 'SAP', category: 'ERP', icon: Building, description: 'Enterprise resource planning', configurable: true },
  { id: 'zoho', name: 'Zoho CRM', category: 'CRM', icon: Building, description: 'Cloud-based CRM', configurable: true },

  // Databases
  { id: 'mongodb', name: 'MongoDB', category: 'Database', icon: Database, description: 'NoSQL database', configurable: true },
  { id: 'sqlserver', name: 'SQL Server', category: 'Database', icon: Database, description: 'Microsoft database', configurable: true },
  { id: 'oracle', name: 'Oracle DB', category: 'Database', icon: Database, description: 'Enterprise database', configurable: true },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', icon: Database, description: 'Open source database', configurable: true },
  { id: 'supabase', name: 'Supabase', category: 'Database', icon: Database, description: 'Open source Firebase alternative', configurable: true },

  // Communication Channels
  { id: 'email', name: 'Email', category: 'Channel', icon: MessageSquare, description: 'Email integration', configurable: true },
  { id: 'sms', name: 'SMS', category: 'Channel', icon: Phone, description: 'Text messaging', configurable: true },
  { id: 'slack', name: 'Slack', category: 'Channel', icon: MessageSquare, description: 'Team communication', configurable: true },
  { id: 'teams', name: 'MS Teams', category: 'Channel', icon: MessageSquare, description: 'Microsoft Teams', configurable: true },
  { id: 'whatsapp', name: 'WhatsApp', category: 'Channel', icon: MessageSquare, description: 'WhatsApp Business', configurable: true },

  // Healthcare APIs
  { id: 'openfda', name: 'OpenFDA', category: 'Healthcare API', icon: ShieldCheck, description: 'FDA data access', configurable: true },
  { id: 'cms', name: 'CMS API', category: 'Healthcare API', icon: FileText, description: 'Medicare data', configurable: true },
  { id: 'npi', name: 'NPI Registry', category: 'Healthcare API', icon: Stethoscope, description: 'Provider data', configurable: true },
  { id: 'epic', name: 'Epic FHIR', category: 'EHR', icon: Stethoscope, description: 'Epic healthcare records', configurable: true },
  { id: 'cerner', name: 'Cerner FHIR', category: 'EHR', icon: Stethoscope, description: 'Cerner healthcare records', configurable: true },

  // Clinical Systems
  { id: 'icd10', name: 'ICD-10', category: 'Clinical', icon: FileText, description: 'Diagnostic codes', configurable: true },
  { id: 'icd11', name: 'ICD-11', category: 'Clinical', icon: FileText, description: 'Latest diagnostic codes', configurable: true },
  { id: 'hcpcs', name: 'HCPCS', category: 'Clinical', icon: FileText, description: 'Procedure codes', configurable: true },
  { id: 'snomed', name: 'SNOMED CT', category: 'Clinical', icon: FileText, description: 'Clinical terminology', configurable: true },

  // CI/CD & Development
  { id: 'jenkins', name: 'Jenkins', category: 'CI/CD', icon: GitBranch, description: 'Automation server', configurable: true },
  { id: 'github', name: 'GitHub', category: 'CI/CD', icon: GitBranch, description: 'Version control', configurable: true },
  { id: 'azure-devops', name: 'Azure DevOps', category: 'CI/CD', icon: GitBranch, description: 'Microsoft DevOps platform', configurable: true },
  { id: 'gitlab', name: 'GitLab', category: 'CI/CD', icon: GitBranch, description: 'DevOps platform', configurable: true },

  // Ticketing & Requirements
  { id: 'servicenow', name: 'ServiceNow', category: 'Ticketing', icon: Settings, description: 'IT service management', configurable: true },
  { id: 'jira', name: 'Jira', category: 'Requirements', icon: Workflow, description: 'Project management', configurable: true },
  { id: 'zendesk', name: 'Zendesk', category: 'Ticketing', icon: Settings, description: 'Customer support', configurable: true },
  { id: 'freshdesk', name: 'Freshdesk', category: 'Ticketing', icon: Settings, description: 'Help desk software', configurable: true },

  // Insurance & Authorization
  { id: 'benefit-verify', name: 'Benefit Verification', category: 'Insurance', icon: CreditCard, description: 'Insurance benefits', configurable: true },
  { id: 'prior-auth', name: 'Prior Authorization', category: 'Insurance', icon: ShieldCheck, description: 'PA processing', configurable: true },
  { id: 'eligibility', name: 'Eligibility Check', category: 'Insurance', icon: ShieldCheck, description: 'Patient eligibility', configurable: true },
  { id: 'claims', name: 'Claims Processing', category: 'Insurance', icon: CreditCard, description: 'Insurance claims', configurable: true },
];

// Authentication Methods
const authMethods: AuthMethod[] = [
  { id: 'okta', name: 'Okta', description: 'Enterprise identity management', icon: Key },
  { id: 'azure-ad-b2c', name: 'Azure AD B2C', description: 'Consumer identity management', icon: Cloud },
  { id: 'azure-ad-b2b', name: 'Azure AD B2B', description: 'Business partner access', icon: Users },
  { id: 'google-iam', name: 'Google IAM', description: 'Google identity and access management', icon: Lock },
  { id: 'auth0', name: 'Auth0', description: 'Universal identity platform', icon: Key },
  { id: 'cognito', name: 'AWS Cognito', description: 'Amazon user authentication', icon: Cloud },
  { id: 'firebase-auth', name: 'Firebase Auth', description: 'Google Firebase authentication', icon: Lock },
  { id: 'saml', name: 'SAML SSO', description: 'Security Assertion Markup Language', icon: ShieldCheck },
  { id: 'oauth2', name: 'OAuth 2.0', description: 'Open authorization framework', icon: Key },
  { id: 'ldap', name: 'LDAP/AD', description: 'Lightweight Directory Access Protocol', icon: Users },
];

// API Types
const apiTypes = [
  { id: 'internal', name: 'Internal APIs', description: 'Private organizational APIs', icon: Server },
  { id: 'external', name: 'External APIs', description: 'Third-party service APIs', icon: Globe },
  { id: 'published', name: 'Published APIs', description: 'Public marketplace APIs', icon: Network },
];

// Agent Categories
const agentCategories = [
  { id: 'clinical', name: 'Clinical', description: 'Clinical care and medical workflows' },
  { id: 'patient-services', name: 'Patient Services', description: 'Patient engagement and support' },
  { id: 'market-access', name: 'Market Access', description: 'Market access and reimbursement' },
  { id: 'credentialing', name: 'Provider & Treatment Center Credentialing', description: 'Credentialing and licensing' },
  { id: 'it-ticketing', name: 'IT Ticketing', description: 'IT support and ticket management' },
  { id: 'cicd-pipeline', name: 'CI/CD Pipeline', description: 'Development and deployment automation' },
  { id: 'insurance', name: 'Insurance', description: 'Insurance and benefits management' },
  { id: 'documentation', name: 'Documentation', description: 'Document management and compliance' },
];

export const AgentCanvas = () => {
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    brand: '',
    purpose: '',
    useCase: '',
    agentType: 'single',
    selectedModels: [],
    selectedSystems: [],
    selectedAuth: [],
    selectedAPIs: [],
    selectedEndpoints: [],
    category: '',
  });

  const [currentSection, setCurrentSection] = useState('basic');
  const [currentCategory, setCurrentCategory] = useState('All');

  const categories = ['All', 'CRM', 'ERP', 'Database', 'Channel', 'Healthcare API', 'EHR', 'Clinical', 'CI/CD', 'Ticketing', 'Requirements', 'Insurance'];

  const handleInputChange = (field: keyof AgentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: keyof AgentFormData, value: string) => {
    setFormData(prev => {
      const currentValue = prev[field];
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [field]: currentValue.includes(value)
            ? currentValue.filter(item => item !== value)
            : [...currentValue, value]
        };
      }
      return prev;
    });
  };

  const handleSystemSelect = useCallback((system: ComponentType) => {
    const isSelected = formData.selectedSystems.includes(system.id);
    setFormData(prev => ({
      ...prev,
      selectedSystems: isSelected
        ? prev.selectedSystems.filter(id => id !== system.id)
        : [...prev.selectedSystems, system.id]
    }));
  }, [formData.selectedSystems]);

  const handleAutoCreate = () => {
    if (!formData.useCase.trim()) {
      toast({
        title: "Use Case Required",
        description: "Please provide a use case to auto-create your agent.",
        variant: "destructive"
      });
      return;
    }

    const useCase = formData.useCase.toLowerCase();
    const suggestedModels: string[] = [];
    const suggestedSystems: string[] = [];
    const suggestedAuth: string[] = [];
    const suggestedAPIs: string[] = [];
    let suggestedCategory = '';

    // AI Model suggestions
    if (useCase.includes('advanced') || useCase.includes('complex')) {
      suggestedModels.push('gpt-4o', 'claude-3-opus');
    } else if (useCase.includes('chat') || useCase.includes('conversation')) {
      suggestedModels.push('gpt-4-turbo', 'claude-3-sonnet');
    } else if (useCase.includes('search') || useCase.includes('research')) {
      suggestedModels.push('perplexity-online', 'gemini-pro');
    } else {
      suggestedModels.push('gpt-4-turbo');
    }

    // System suggestions based on use case
    if (useCase.includes('healthcare') || useCase.includes('medical') || useCase.includes('patient')) {
      suggestedSystems.push('veeva', 'epic', 'icd10', 'openfda');
      suggestedAuth.push('okta', 'saml');
      suggestedAPIs.push('external', 'internal');
      suggestedCategory = 'clinical';
    } else if (useCase.includes('insurance') || useCase.includes('authorization') || useCase.includes('benefits')) {
      suggestedSystems.push('benefit-verify', 'prior-auth', 'eligibility', 'claims');
      suggestedAuth.push('azure-ad-b2c', 'oauth2');
      suggestedAPIs.push('external', 'published');
      suggestedCategory = 'insurance';
    } else if (useCase.includes('customer') || useCase.includes('sales') || useCase.includes('crm')) {
      suggestedSystems.push('salesforce', 'dynamics', 'email');
      suggestedAuth.push('azure-ad-b2b', 'oauth2');
      suggestedAPIs.push('internal', 'external');
      suggestedCategory = 'patient-services';
    } else if (useCase.includes('ticketing') || useCase.includes('support') || useCase.includes('it')) {
      suggestedSystems.push('servicenow', 'jira', 'zendesk', 'slack');
      suggestedAuth.push('ldap', 'saml');
      suggestedAPIs.push('internal', 'external');
      suggestedCategory = 'it-ticketing';
    } else if (useCase.includes('pipeline') || useCase.includes('deployment') || useCase.includes('ci/cd')) {
      suggestedSystems.push('jenkins', 'github', 'azure-devops');
      suggestedAuth.push('github', 'azure-ad-b2b');
      suggestedAPIs.push('internal', 'external');
      suggestedCategory = 'cicd-pipeline';
    } else if (useCase.includes('document') || useCase.includes('compliance') || useCase.includes('regulatory')) {
      suggestedSystems.push('sharepoint', 'cms', 'openfda');
      suggestedAuth.push('azure-ad-b2c', 'saml');
      suggestedAPIs.push('internal', 'published');
      suggestedCategory = 'documentation';
    } else if (useCase.includes('credential') || useCase.includes('licensing') || useCase.includes('provider')) {
      suggestedSystems.push('npi', 'cms', 'veeva');
      suggestedAuth.push('okta', 'saml');
      suggestedAPIs.push('external', 'published');
      suggestedCategory = 'credentialing';
    } else if (useCase.includes('market') || useCase.includes('access') || useCase.includes('reimbursement')) {
      suggestedSystems.push('cms', 'prior-auth', 'benefit-verify');
      suggestedAuth.push('azure-ad-b2c', 'oauth2');
      suggestedAPIs.push('external', 'published');
      suggestedCategory = 'market-access';
    }

    // Communication channels
    if (useCase.includes('notify') || useCase.includes('alert') || useCase.includes('message')) {
      suggestedSystems.push('email', 'sms');
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      name: `${suggestedCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Agent`,
      purpose: formData.useCase,
      selectedModels: suggestedModels,
      selectedSystems: suggestedSystems,
      selectedAuth: suggestedAuth,
      selectedAPIs: suggestedAPIs,
      category: suggestedCategory,
      agentType: suggestedSystems.length > 3 ? 'multi' : 'single'
    }));

    toast({
      title: "Agent Auto-Created!",
      description: `Configured ${suggestedSystems.length} systems and ${suggestedModels.length} models based on your use case.`,
    });
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.purpose || formData.selectedModels.length === 0) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in agent name, purpose, and select at least one model.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('api_integration_registry')
        .insert({
          name: formData.name,
          description: formData.purpose,
          category: 'agent',
          type: formData.agentType,
          purpose: formData.purpose,
          direction: 'bidirectional',
          rate_limits: {
            models: formData.selectedModels,
            systems: formData.selectedSystems,
            auth: formData.selectedAuth,
            apis: formData.selectedAPIs,
            endpoints: formData.selectedEndpoints
          },
          contact_info: {
            brand: formData.brand,
            useCase: formData.useCase,
            category: formData.category
          }
        });

      if (error) throw error;

      toast({
        title: "Agent Template Saved!",
        description: `${formData.name} has been saved as a reusable template.`,
      });

      // Reset form
      setFormData({
        name: '',
        brand: '',
        purpose: '',
        useCase: '',
        agentType: 'single',
        selectedModels: [],
        selectedSystems: [],
        selectedAuth: [],
        selectedAPIs: [],
        selectedEndpoints: [],
        category: '',
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredComponents = currentCategory === 'All' 
    ? systemComponents 
    : systemComponents.filter(c => c.category === currentCategory);

  const sections = [
    { id: 'basic', name: 'Basic Info', icon: FileText },
    { id: 'models', name: 'AI Models', icon: Brain },
    { id: 'systems', name: 'Systems', icon: Server },
    { id: 'auth', name: 'Authentication', icon: Key },
    { id: 'apis', name: 'APIs', icon: Globe },
    { id: 'review', name: 'Review & Deploy', icon: Bot },
  ];

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={currentSection === section.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentSection(section.id)}
                  className="gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {section.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      {currentSection === 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Agent Information</CardTitle>
            <CardDescription>Define the core properties of your agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name *</Label>
                <Input
                  id="agentName"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Healthcare Compliance Agent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentBrand">Brand/Organization</Label>
                <Input
                  id="agentBrand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="e.g., Healthcare Corp"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agentPurpose">Purpose *</Label>
              <Textarea
                id="agentPurpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="Describe the main purpose and goals of this agent"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCase">Use Case Prompt (Auto-Configure)</Label>
              <Textarea
                id="useCase"
                value={formData.useCase}
                onChange={(e) => handleInputChange('useCase', e.target.value)}
                placeholder="Describe your specific use case (e.g., 'Monitor FDA alerts and notify care managers about drug safety updates')"
                rows={3}
              />
              <Button onClick={handleAutoCreate} variant="outline" className="w-full">
                Auto-Configure Agent from Use Case
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agent Type</Label>
                <Select value={formData.agentType} onValueChange={(value: 'single' | 'multi') => handleInputChange('agentType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Agent (One System Focus)</SelectItem>
                    <SelectItem value="multi">Multi-Agent (Multiple Systems)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {agentCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Models Selection */}
      {currentSection === 'models' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Models Selection</CardTitle>
            <CardDescription>Choose the AI models that will power your agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiModels.map((model) => {
                const isSelected = formData.selectedModels.includes(model.id);
                const IconComponent = model.icon;
                
                return (
                  <Card 
                    key={model.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleMultiSelect('selectedModels', model.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-6 w-6 text-primary mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{model.name}</h4>
                            <Checkbox checked={isSelected} disabled />
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {model.category}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {model.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {formData.selectedModels.length > 0 && (
              <div className="mt-4">
                <Label>Selected Models ({formData.selectedModels.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selectedModels.map((modelId) => {
                    const model = aiModels.find(m => m.id === modelId);
                    return (
                      <Badge key={modelId} variant="default" className="gap-1">
                        {model?.name}
                        <button
                          onClick={() => handleMultiSelect('selectedModels', modelId)}
                          className="ml-1 hover:bg-primary-foreground rounded-full"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Systems Selection */}
      {currentSection === 'systems' && (
        <Card>
          <CardHeader>
            <CardTitle>System Components</CardTitle>
            <CardDescription>Select the systems and services your agent will integrate with</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={currentCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Systems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredComponents.map((component) => {
                const isSelected = formData.selectedSystems.includes(component.id);
                const IconComponent = component.icon;
                
                return (
                  <Card 
                    key={component.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleSystemSelect(component)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-6 w-6 text-primary mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{component.name}</h4>
                            <Checkbox checked={isSelected} disabled />
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {component.category}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {component.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {formData.selectedSystems.length > 0 && (
              <div className="mt-6">
                <Label>Selected Systems ({formData.selectedSystems.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selectedSystems.map((systemId) => {
                    const system = systemComponents.find(s => s.id === systemId);
                    return (
                      <Badge key={systemId} variant="default" className="gap-1">
                        {system?.name}
                        <button
                          onClick={() => handleSystemSelect(system!)}
                          className="ml-1 hover:bg-primary-foreground rounded-full"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Authentication Methods */}
      {currentSection === 'auth' && (
        <Card>
          <CardHeader>
            <CardTitle>Authentication Methods</CardTitle>
            <CardDescription>Select authentication methods for secure access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {authMethods.map((auth) => {
                const isSelected = formData.selectedAuth.includes(auth.id);
                const IconComponent = auth.icon;
                
                return (
                  <Card 
                    key={auth.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleMultiSelect('selectedAuth', auth.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-6 w-6 text-primary mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{auth.name}</h4>
                            <Checkbox checked={isSelected} disabled />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {auth.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {formData.selectedAuth.length > 0 && (
              <div className="mt-4">
                <Label>Selected Authentication Methods ({formData.selectedAuth.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selectedAuth.map((authId) => {
                    const auth = authMethods.find(a => a.id === authId);
                    return (
                      <Badge key={authId} variant="default" className="gap-1">
                        {auth?.name}
                        <button
                          onClick={() => handleMultiSelect('selectedAuth', authId)}
                          className="ml-1 hover:bg-primary-foreground rounded-full"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Types */}
      {currentSection === 'apis' && (
        <Card>
          <CardHeader>
            <CardTitle>API Integration</CardTitle>
            <CardDescription>Choose how your agent will consume APIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {apiTypes.map((api) => {
                const isSelected = formData.selectedAPIs.includes(api.id);
                const IconComponent = api.icon;
                
                return (
                  <Card 
                    key={api.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleMultiSelect('selectedAPIs', api.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <IconComponent className="h-12 w-12 text-primary mx-auto mb-3" />
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <h4 className="font-medium">{api.name}</h4>
                        <Checkbox checked={isSelected} disabled />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {api.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {formData.selectedAPIs.length > 0 && (
              <div className="mt-4">
                <Label>Selected API Types ({formData.selectedAPIs.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selectedAPIs.map((apiId) => {
                    const api = apiTypes.find(a => a.id === apiId);
                    return (
                      <Badge key={apiId} variant="default" className="gap-1">
                        {api?.name}
                        <button
                          onClick={() => handleMultiSelect('selectedAPIs', apiId)}
                          className="ml-1 hover:bg-primary-foreground rounded-full"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review and Deploy */}
      {currentSection === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Deploy Agent</CardTitle>
            <CardDescription>Review your agent configuration and deploy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Agent Details</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {formData.name || 'Not set'}</div>
                  <div><strong>Brand:</strong> {formData.brand || 'Not set'}</div>
                  <div><strong>Type:</strong> {formData.agentType}</div>
                  <div><strong>Category:</strong> {agentCategories.find(c => c.id === formData.category)?.name || 'Not set'}</div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Configuration Summary</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>AI Models:</strong> {formData.selectedModels.length}</div>
                  <div><strong>Systems:</strong> {formData.selectedSystems.length}</div>
                  <div><strong>Authentication:</strong> {formData.selectedAuth.length}</div>
                  <div><strong>API Types:</strong> {formData.selectedAPIs.length}</div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-3">Purpose & Use Case</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {formData.purpose || 'No purpose defined'}
              </p>
              {formData.useCase && (
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded mt-2">
                  <strong>Use Case:</strong> {formData.useCase}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSaveTemplate} className="gap-2 flex-1">
                <Bot className="h-4 w-4" />
                Save as Template
              </Button>
              <Button onClick={handleSaveTemplate} variant="outline" className="gap-2 flex-1">
                <Settings className="h-4 w-4" />
                Save & Configure Later
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};