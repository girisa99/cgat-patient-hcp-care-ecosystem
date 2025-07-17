import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Database, MessageSquare, Globe, Settings, 
  Stethoscope, ShieldCheck, CreditCard, FileText,
  Building, Workflow, GitBranch, Server, Phone
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ComponentType {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<any>;
  description: string;
  configurable: boolean;
}

const systemComponents: ComponentType[] = [
  // Language Models
  { id: 'gpt-4', name: 'GPT-4', category: 'LLM', icon: Bot, description: 'Advanced language model', configurable: true },
  { id: 'claude-ai', name: 'Claude AI', category: 'Gen AI', icon: Bot, description: 'Anthropic AI assistant', configurable: true },
  { id: 'gemini', name: 'Gemini', category: 'Gen AI', icon: Bot, description: 'Google AI model', configurable: true },
  { id: 'deepseek', name: 'DeepSeek', category: 'Gen AI', icon: Bot, description: 'Advanced reasoning model', configurable: true },
  { id: 'perplexity', name: 'Perplexity', category: 'Gen AI', icon: Globe, description: 'AI-powered search', configurable: true },

  // CRM Systems
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', icon: Building, description: 'Customer relationship management', configurable: true },
  { id: 'veeva', name: 'Veeva CRM', category: 'CRM', icon: Stethoscope, description: 'Life sciences CRM', configurable: true },
  { id: 'dynamics', name: 'MS Dynamics', category: 'CRM', icon: Building, description: 'Microsoft CRM platform', configurable: true },
  { id: 'sap', name: 'SAP', category: 'CRM', icon: Building, description: 'Enterprise resource planning', configurable: true },
  { id: 'zoho', name: 'Zoho CRM', category: 'CRM', icon: Building, description: 'Cloud-based CRM', configurable: true },

  // Databases
  { id: 'mongodb', name: 'MongoDB', category: 'Database', icon: Database, description: 'NoSQL database', configurable: true },
  { id: 'sqlserver', name: 'SQL Server', category: 'Database', icon: Database, description: 'Microsoft database', configurable: true },
  { id: 'oracle', name: 'Oracle DB', category: 'Database', icon: Database, description: 'Enterprise database', configurable: true },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', icon: Database, description: 'Open source database', configurable: true },

  // Communication Channels
  { id: 'email', name: 'Email', category: 'Channel', icon: MessageSquare, description: 'Email integration', configurable: true },
  { id: 'sms', name: 'SMS', category: 'Channel', icon: Phone, description: 'Text messaging', configurable: true },
  { id: 'slack', name: 'Slack', category: 'Channel', icon: MessageSquare, description: 'Team communication', configurable: true },
  { id: 'teams', name: 'MS Teams', category: 'Channel', icon: MessageSquare, description: 'Microsoft Teams', configurable: true },

  // Healthcare APIs
  { id: 'openfda', name: 'OpenFDA', category: 'API', icon: ShieldCheck, description: 'FDA data access', configurable: true },
  { id: 'cms', name: 'CMS API', category: 'API', icon: FileText, description: 'Medicare data', configurable: true },
  { id: 'npi', name: 'NPI Registry', category: 'API', icon: Stethoscope, description: 'Provider data', configurable: true },

  // Clinical Systems
  { id: 'icd10', name: 'ICD-10', category: 'Clinical', icon: FileText, description: 'Diagnostic codes', configurable: true },
  { id: 'icd11', name: 'ICD-11', category: 'Clinical', icon: FileText, description: 'Latest diagnostic codes', configurable: true },
  { id: 'hcpcs', name: 'HCPCS', category: 'Clinical', icon: FileText, description: 'Procedure codes', configurable: true },

  // CI/CD & Development
  { id: 'jenkins', name: 'Jenkins', category: 'CI/CD', icon: GitBranch, description: 'Automation server', configurable: true },
  { id: 'github', name: 'GitHub', category: 'CI/CD', icon: GitBranch, description: 'Version control', configurable: true },

  // Ticketing & Requirements
  { id: 'servicenow', name: 'ServiceNow', category: 'Ticketing', icon: Settings, description: 'IT service management', configurable: true },
  { id: 'jira', name: 'Jira', category: 'Requirements', icon: Workflow, description: 'Project management', configurable: true },

  // Insurance & Authorization
  { id: 'benefit-verify', name: 'Benefit Verification', category: 'Insurance', icon: CreditCard, description: 'Insurance benefits', configurable: true },
  { id: 'prior-auth', name: 'Prior Authorization', category: 'Insurance', icon: ShieldCheck, description: 'PA processing', configurable: true },
];

export const AgentCanvas = () => {
  const [selectedComponents, setSelectedComponents] = useState<ComponentType[]>([]);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [currentCategory, setCurrentCategory] = useState('All');

  const categories = ['All', 'LLM', 'Gen AI', 'CRM', 'Database', 'Channel', 'API', 'Clinical', 'CI/CD', 'Ticketing', 'Requirements', 'Insurance'];

  const handleComponentSelect = useCallback((component: ComponentType) => {
    setSelectedComponents(prev => {
      const exists = prev.find(c => c.id === component.id);
      if (exists) {
        return prev.filter(c => c.id !== component.id);
      }
      return [...prev, component];
    });
  }, []);

  const handleAutoCreate = () => {
    if (!agentPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please provide a use case prompt to auto-create your agent.",
        variant: "destructive"
      });
      return;
    }

    // Auto-suggest components based on prompt keywords
    const prompt = agentPrompt.toLowerCase();
    const suggestedComponents: ComponentType[] = [];

    // AI/LLM selection
    if (prompt.includes('ai') || prompt.includes('intelligent') || prompt.includes('chat')) {
      suggestedComponents.push(systemComponents.find(c => c.id === 'gpt-4')!);
    }

    // Healthcare specific
    if (prompt.includes('healthcare') || prompt.includes('medical') || prompt.includes('patient')) {
      suggestedComponents.push(
        systemComponents.find(c => c.id === 'veeva')!,
        systemComponents.find(c => c.id === 'icd10')!,
        systemComponents.find(c => c.id === 'openfda')!
      );
    }

    // Insurance/Authorization
    if (prompt.includes('insurance') || prompt.includes('authorization') || prompt.includes('prior auth')) {
      suggestedComponents.push(
        systemComponents.find(c => c.id === 'benefit-verify')!,
        systemComponents.find(c => c.id === 'prior-auth')!
      );
    }

    // Communication
    if (prompt.includes('notify') || prompt.includes('alert') || prompt.includes('message')) {
      suggestedComponents.push(systemComponents.find(c => c.id === 'email')!);
    }

    // CRM
    if (prompt.includes('customer') || prompt.includes('sales') || prompt.includes('contact')) {
      suggestedComponents.push(systemComponents.find(c => c.id === 'salesforce')!);
    }

    setSelectedComponents(suggestedComponents.filter(Boolean));
    setAgentName(`Agent for ${agentPrompt.split(' ').slice(0, 3).join(' ')}`);
    setAgentDescription(`Auto-generated agent based on: ${agentPrompt}`);

    toast({
      title: "Agent Auto-Created!",
      description: `Selected ${suggestedComponents.length} components based on your prompt.`,
    });
  };

  const handleDeploy = () => {
    if (!agentName || selectedComponents.length === 0) {
      toast({
        title: "Configuration Required",
        description: "Please provide agent name and select at least one component.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Agent Deployed Successfully!",
      description: `${agentName} is now live with ${selectedComponents.length} integrations.`,
    });
  };

  const filteredComponents = currentCategory === 'All' 
    ? systemComponents 
    : systemComponents.filter(c => c.category === currentCategory);

  return (
    <div className="space-y-6">
      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>Design your intelligent agent with drag-and-drop functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent Name</Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentDescription">Description</Label>
              <Input
                id="agentDescription"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Brief description of agent purpose"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agentPrompt">Use Case Prompt (Auto-Create)</Label>
            <Textarea
              id="agentPrompt"
              value={agentPrompt}
              onChange={(e) => setAgentPrompt(e.target.value)}
              placeholder="Describe your use case (e.g., 'Create a healthcare compliance agent that monitors FDA alerts and sends notifications to care managers')"
              rows={3}
            />
            <Button onClick={handleAutoCreate} variant="outline" className="w-full">
              Auto-Create Agent from Prompt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Component Selection */}
      <Card>
        <CardHeader>
          <CardTitle>System Components</CardTitle>
          <CardDescription>Select and configure system integrations for your agent</CardDescription>
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

          {/* Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {filteredComponents.map((component) => {
              const isSelected = selectedComponents.some(c => c.id === component.id);
              const IconComponent = component.icon;
              
              return (
                <Card 
                  key={component.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleComponentSelect(component)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-6 w-6 text-primary mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{component.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {component.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {component.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Components */}
          {selectedComponents.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Selected Components ({selectedComponents.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedComponents.map((component) => (
                  <Badge key={component.id} variant="default" className="gap-1">
                    {component.name}
                    <button
                      onClick={() => handleComponentSelect(component)}
                      className="ml-1 hover:bg-primary-foreground rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Deploy Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleDeploy} className="gap-2">
              <Bot className="h-4 w-4" />
              Deploy Agent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};