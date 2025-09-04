import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Workflow, Bot, Settings, Play, Eye, Share2, 
  FileText, Lightbulb, Network, Target
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Helmet } from 'react-helmet-async';
import UnifiedWorkflowExperience from '@/components/unified-workflow/UnifiedWorkflowExperience';
import NodeTypeSelector from '@/components/unified-workflow/NodeTypeSelector';
import { ConsolidatedNodeVerification } from '@/components/ConsolidatedNodeVerification';

interface WorkflowStudioProps {
  embedded?: boolean;
}

const UnifiedWorkflowStudio: React.FC<WorkflowStudioProps> = ({ embedded = false }) => {
  const [activeTab, setActiveTab] = useState('experience');

  const tabs = [
    {
      id: 'experience',
      label: 'Workflow Experience',
      icon: Target,
      description: 'Complete guided workflow creation experience'
    },
    {
      id: 'nodes',
      label: 'Node Library', 
      icon: Network,
      description: 'Explore and understand all available node types'
    },
    {
      id: 'verification',
      label: 'System Status',
      icon: Settings,
      description: 'Verify consolidated node configuration system'
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: FileText,
      description: 'Learn about workflow concepts and best practices'
    }
  ];

  const renderDocumentation = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Understanding the Workflow System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Core Concepts</h3>
              
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 text-blue-900">
                    <Workflow className="h-4 w-4" />
                    Workflows vs Agents
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Workflows</strong> are the visual process flows you create. 
                    <strong>Agents</strong> are AI entities deployed through agent nodes within workflows.
                    Each agent node can deploy one or more specialized AI agents.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 text-green-900">
                    <Bot className="h-4 w-4" />
                    Single vs Multi-Agent
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Single agents</strong> handle specific, focused tasks independently.
                    <strong>Multi-agent systems</strong> coordinate multiple specialized agents for complex scenarios.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 text-purple-900">
                    <Network className="h-4 w-4" />
                    Node Connections
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Connections between nodes define the workflow execution path. 
                    Conditional connections route based on data, outcomes, or business rules.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">User Experience Flow</h3>
              
              <div className="space-y-2">
                {[
                  { step: 1, title: 'Choose Approach', desc: 'AI prompt, visual builder, or template' },
                  { step: 2, title: 'Design Workflow', desc: 'Drag & drop nodes, make connections' },
                  { step: 3, title: 'Configure Nodes', desc: 'Set up agents, actions, and integrations' },
                  { step: 4, title: 'Test & Validate', desc: 'Run simulations and verify functionality' },
                  { step: 5, title: 'Deploy Agents', desc: 'Activate workflow with live agents' }
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Badge variant="default" className="min-w-[24px] h-6 flex items-center justify-center text-xs">
                      {step}
                    </Badge>
                    <div>
                      <div className="font-medium text-sm">{title}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">AI Assistance Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Prompt-Based Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Describe your workflow in natural language. AI analyzes your requirements and generates 
                    appropriate nodes, connections, and initial configurations.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Smart Node Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    As you build visually, AI suggests optimal node types, connections, and configurations 
                    based on workflow patterns and healthcare best practices.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contextual Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AI assists with node configuration by providing context-aware options, validation, 
                    and optimization suggestions for each specific use case.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Unified Workflow Studio</h1>
          <p className="text-muted-foreground mt-1">
            Complete workflow creation experience - from concept to deployment
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview Mode
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="experience" className="mt-0">
            <UnifiedWorkflowExperience />
          </TabsContent>

          <TabsContent value="nodes" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Node Type Library</CardTitle>
                <p className="text-muted-foreground">
                  Explore all available node types and understand their capabilities
                </p>
              </CardHeader>
              <CardContent>
                <NodeTypeSelector 
                  onNodeSelect={(nodeType) => {
                    console.log('Selected node type:', nodeType);
                    // Handle node selection - could switch to design mode
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="mt-0">
            <ConsolidatedNodeVerification />
          </TabsContent>

          <TabsContent value="documentation" className="mt-0">
            {renderDocumentation()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <>
      <Helmet>
        <title>Unified Workflow Studio - Healthcare AI Platform</title>
        <meta name="description" content="Complete workflow creation experience for healthcare AI agents - from concept to deployment" />
        <meta name="keywords" content="AI workflow, healthcare automation, agent deployment, workflow builder" />
      </Helmet>
      
      <AppLayout>
        {content}
      </AppLayout>
    </>
  );
};

export default UnifiedWorkflowStudio;