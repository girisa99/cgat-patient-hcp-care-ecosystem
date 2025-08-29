import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedWorkflowCanvas } from '@/components/workflow-builder/EnhancedWorkflowCanvas';
import { Node, Edge } from '@xyflow/react';

const NodeConfigurationDemo: React.FC = () => {
  // Sample nodes to demonstrate the configuration system
  const initialNodes: Node[] = [
    {
      id: 'agent-1',
      type: 'agent',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Customer Support Agent', 
        type: 'agent',
        configuration: {
          model: 'gpt-4o',
          temperature: 0.7,
          systemPrompt: 'You are a helpful customer support agent.'
        }
      },
    },
    {
      id: 'api-1',
      type: 'api',
      position: { x: 400, y: 100 },
      data: { 
        label: 'CRM API', 
        type: 'api',
        configuration: {
          url: 'https://api.crm.com/v1/customers',
          method: 'POST',
          timeout: 30000
        }
      },
    },
    {
      id: 'database-1',
      type: 'database',
      position: { x: 700, y: 100 },
      data: { 
        label: 'User Database', 
        type: 'database',
        configuration: {
          host: 'db.example.com',
          port: 5432,
          database: 'users'
        }
      },
    },
    {
      id: 'workflow-1',
      type: 'default',
      position: { x: 250, y: 300 },
      data: { 
        label: 'Decision Logic', 
        type: 'workflow',
        configuration: {
          conditions: [],
          timeout: 60000
        }
      },
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: 'e1-2',
      source: 'agent-1',
      target: 'workflow-1',
      type: 'smoothstep',
    },
    {
      id: 'e2-3',
      source: 'workflow-1',
      target: 'api-1',
      type: 'smoothstep',
    },
    {
      id: 'e3-4',
      source: 'api-1',
      target: 'database-1',
      type: 'smoothstep',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Node Configuration System Demo</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Complete implementation of Phases 1-3: Right-click context menus, dynamic configuration forms, 
          and AI-powered chat interface for node configuration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Phase 1
              <Badge variant="default">Complete</Badge>
            </CardTitle>
            <CardDescription>Right-Click Context Menu</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Right-click any node to access context-sensitive configuration options, 
              duplication, and deletion features.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Phase 2
              <Badge variant="default">Complete</Badge>
            </CardTitle>
            <CardDescription>Dynamic Configuration Forms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Advanced forms with templates, real-time validation, and type-specific 
              configuration options for each node type.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 Phase 3
              <Badge variant="default">Complete</Badge>
            </CardTitle>
            <CardDescription>AI Chat Configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Natural language configuration using AI. Ask the assistant to modify 
              settings, explain options, or optimize configurations.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Demo Workflow</CardTitle>
          <CardDescription>
            Try the complete node configuration system below. Right-click any node to explore all features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] border rounded-lg overflow-hidden">
            <EnhancedWorkflowCanvas
              initialNodes={initialNodes}
              initialEdges={initialEdges}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>🖱️ How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline">1</Badge>
              <div>
                <p className="font-medium">Right-click any node</p>
                <p className="text-sm text-muted-foreground">
                  Access context menu with configuration options
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">2</Badge>
              <div>
                <p className="font-medium">Choose configuration method</p>
                <p className="text-sm text-muted-foreground">
                  Use forms with templates or AI chat interface
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline">3</Badge>
              <div>
                <p className="font-medium">Configure and save</p>
                <p className="text-sm text-muted-foreground">
                  Changes are applied in real-time with validation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚡ Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✓</Badge>
              <span className="text-sm">Type-specific configuration options</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✓</Badge>
              <span className="text-sm">Pre-built configuration templates</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✓</Badge>
              <span className="text-sm">Real-time validation and error handling</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✓</Badge>
              <span className="text-sm">AI-powered natural language configuration</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✓</Badge>
              <span className="text-sm">Node duplication and deletion</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✓</Badge>
              <span className="text-sm">Auto-save configuration changes</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NodeConfigurationDemo;