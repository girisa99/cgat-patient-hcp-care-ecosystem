import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Database, Globe, Workflow } from 'lucide-react';

interface ConfigurationTemplatesProps {
  nodeType: string;
  configAction: string;
  onApplyTemplate: (template: any) => void;
}

export const ConfigurationTemplates: React.FC<ConfigurationTemplatesProps> = ({
  nodeType,
  configAction,
  onApplyTemplate,
}) => {
  const getTemplates = () => {
    switch (`${nodeType}-${configAction}`) {
      case 'agent-ai-model':
        return [
          {
            id: 'creative-writing',
            name: 'Creative Writing',
            description: 'High creativity for content generation',
            icon: Bot,
            category: 'Creative',
            config: {
              model: 'gpt-4o',
              temperature: 1.2,
              maxTokens: 2000,
              topP: 0.9,
              frequencyPenalty: 0.5,
              presencePenalty: 0.3,
            },
          },
          {
            id: 'analytical',
            name: 'Analytical Assistant',
            description: 'Precise and factual responses',
            icon: Bot,
            category: 'Analysis',
            config: {
              model: 'gpt-4o',
              temperature: 0.2,
              maxTokens: 1500,
              topP: 0.1,
              frequencyPenalty: 0,
              presencePenalty: 0,
            },
          },
          {
            id: 'conversational',
            name: 'Conversational AI',
            description: 'Balanced for natural conversations',
            icon: Bot,
            category: 'General',
            config: {
              model: 'gpt-4o-mini',
              temperature: 0.7,
              maxTokens: 1000,
              topP: 0.8,
              frequencyPenalty: 0.2,
              presencePenalty: 0.1,
            },
          },
        ];

      case 'agent-prompt':
        return [
          {
            id: 'customer-support',
            name: 'Customer Support Agent',
            description: 'Helpful and professional customer service',
            icon: Bot,
            category: 'Support',
            config: {
              systemPrompt: 'You are a helpful customer support agent. Be professional, empathetic, and solution-focused. Always ask clarifying questions when needed.',
              userPromptTemplate: 'Customer inquiry: {user_input}\n\nPlease provide a helpful response.',
              responseFormat: 'text',
              maxLength: 500,
            },
          },
          {
            id: 'code-reviewer',
            name: 'Code Review Assistant',
            description: 'Technical code analysis and suggestions',
            icon: Bot,
            category: 'Development',
            config: {
              systemPrompt: 'You are an expert code reviewer. Analyze code for best practices, potential issues, and suggest improvements. Be constructive and educational.',
              userPromptTemplate: 'Please review this code:\n\n{user_input}\n\nProvide feedback on:\n1. Code quality\n2. Best practices\n3. Potential improvements',
              responseFormat: 'structured',
              maxLength: 1000,
            },
          },
          {
            id: 'data-analyst',
            name: 'Data Analysis Assistant',
            description: 'Data interpretation and insights',
            icon: Bot,
            category: 'Analytics',
            config: {
              systemPrompt: 'You are a data analysis expert. Help interpret data, identify patterns, and provide actionable insights. Always be precise and data-driven.',
              userPromptTemplate: 'Data to analyze: {user_input}\n\nPlease provide:\n1. Key insights\n2. Patterns observed\n3. Recommendations',
              responseFormat: 'json',
              maxLength: 800,
            },
          },
        ];

      case 'api-endpoint':
        return [
          {
            id: 'rest-api',
            name: 'Standard REST API',
            description: 'Common REST API configuration',
            icon: Globe,
            category: 'REST',
            config: {
              url: 'https://api.example.com/v1/endpoint',
              method: 'GET',
              timeout: 30000,
              retries: 3,
            },
          },
          {
            id: 'webhook',
            name: 'Webhook Endpoint',
            description: 'Webhook POST configuration',
            icon: Globe,
            category: 'Webhook',
            config: {
              url: 'https://your-app.com/webhooks/endpoint',
              method: 'POST',
              timeout: 10000,
              retries: 1,
            },
          },
          {
            id: 'graphql',
            name: 'GraphQL Endpoint',
            description: 'GraphQL API configuration',
            icon: Globe,
            category: 'GraphQL',
            config: {
              url: 'https://api.example.com/graphql',
              method: 'POST',
              timeout: 45000,
              retries: 2,
            },
          },
        ];

      case 'database-connection':
        return [
          {
            id: 'postgres-prod',
            name: 'PostgreSQL Production',
            description: 'Production database configuration',
            icon: Database,
            category: 'Production',
            config: {
              host: 'prod-db.example.com',
              port: 5432,
              database: 'production_db',
              ssl: true,
              poolSize: 20,
            },
          },
          {
            id: 'postgres-dev',
            name: 'PostgreSQL Development',
            description: 'Development database configuration',
            icon: Database,
            category: 'Development',
            config: {
              host: 'localhost',
              port: 5432,
              database: 'dev_db',
              ssl: false,
              poolSize: 5,
            },
          },
        ];

      default:
        return [
          {
            id: 'basic-config',
            name: 'Basic Configuration',
            description: 'Standard default settings',
            icon: Workflow,
            category: 'General',
            config: {
              name: 'Default Configuration',
              description: 'Basic configuration template',
              enabled: true,
            },
          },
        ];
    }
  };

  const templates = getTemplates();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <IconComponent className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => onApplyTemplate(template.config)}
                  className="w-full"
                  variant="outline"
                >
                  Apply Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};