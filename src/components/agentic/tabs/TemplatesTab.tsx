import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Sparkles, Download, Upload, Star, 
  Clock, Users, Target, Workflow 
} from 'lucide-react';
import { ActionTemplateManager } from '@/components/agentic/ActionTemplateManager';
import { AgentAction } from '@/components/agentic/AgentActionsManager';

interface TemplatesTabProps {
  sessionId: string;
  agentType?: string;
  agentPurpose?: string;
  onTemplateApply: (template: any) => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  sessionId,
  agentType,
  agentPurpose,
  onTemplateApply
}) => {
  const [selectedCategory, setSelectedCategory] = useState('healthcare');

  // Mock template categories for demonstration
  const templateCategories = [
    {
      id: 'healthcare',
      name: 'Healthcare Workflows',
      description: 'Templates for clinical operations, patient management, and compliance',
      count: 12,
      icon: <Target className="h-4 w-4" />
    },
    {
      id: 'business',
      name: 'Business Automation',
      description: 'General business process automation and workflow templates',
      count: 8,
      icon: <Workflow className="h-4 w-4" />
    },
    {
      id: 'custom',
      name: 'Custom Templates',
      description: 'User-created and organization-specific templates',
      count: 3,
      icon: <Star className="h-4 w-4" />
    }
  ];

  const workflowTemplates = [
    {
      id: 'patient-intake',
      name: 'Patient Intake Workflow',
      description: 'Complete patient registration and intake process with verification steps',
      category: 'healthcare',
      estimatedTime: '15-20 minutes',
      complexity: 'Medium',
      actions: 5,
      popularity: 95
    },
    {
      id: 'clinical-review',
      name: 'Clinical Review Process',
      description: 'Multi-step clinical review with compliance checks and approval workflows',
      category: 'healthcare',
      estimatedTime: '30-45 minutes',
      complexity: 'High',
      actions: 8,
      popularity: 87
    },
    {
      id: 'data-processing',
      name: 'Automated Data Processing',
      description: 'ETL pipeline for processing and validating incoming data streams',
      category: 'business',
      estimatedTime: '5-10 minutes',
      complexity: 'Low',
      actions: 3,
      popularity: 73
    }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Templates & Workflows
          </h3>
          <p className="text-sm text-muted-foreground">
            Browse, customize, and apply pre-built action templates and workflow patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Template
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Templates
          </Button>
        </div>
      </div>

      {/* Template Management */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Templates</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Builder</TabsTrigger>
          <TabsTrigger value="custom">Custom Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6 space-y-6">
          {/* Template Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templateCategories.map((category) => (
              <Card 
                key={category.id} 
                className={`cursor-pointer transition-all ${
                  selectedCategory === category.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {category.icon}
                    <h4 className="font-medium">{category.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  <Badge variant="secondary">{category.count} templates</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workflow Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Available Workflow Templates</CardTitle>
              <CardDescription>
                Pre-built workflows that can be applied to your agent configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {workflowTemplates
                  .filter(template => selectedCategory === 'all' || template.category === selectedCategory)
                  .map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium mb-1">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`${getComplexityColor(template.complexity)} text-white border-0`}
                          >
                            {template.complexity}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {template.estimatedTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {template.actions} actions
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {template.popularity}% popularity
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Preview template functionality
                              console.log('Preview template:', template.id);
                            }}
                          >
                            Preview
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              // Apply template to current agent
                              onTemplateApply(template);
                            }}
                          >
                            Apply Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Builder</CardTitle>
              <CardDescription>
                Create custom workflows by combining actions and templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Visual workflow builder coming soon</p>
                <p className="text-sm">Drag and drop actions to create custom workflows</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Action Template Manager</CardTitle>
              <CardDescription>
                Create and manage custom action templates for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActionTemplateManager
                agentType={agentType}
                agentPurpose={agentPurpose}
                onTemplateSelect={(template) => {
                  onTemplateApply(template);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};