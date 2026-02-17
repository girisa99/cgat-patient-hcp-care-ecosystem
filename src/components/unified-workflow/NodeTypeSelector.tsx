import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, Square, Bot, Users, GitBranch, Zap, MessageSquare, 
  Database, FileText, Globe, Phone, Shield
} from 'lucide-react';

interface NodeType {
  id: string;
  category: 'control' | 'agent' | 'action' | 'integration' | 'utility';
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isRequired?: boolean;
  maxInstances?: number;
  configurable: boolean;
  examples: string[];
}

interface NodeTypeSelectorProps {
  onNodeSelect: (nodeType: NodeType) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const NodeTypeSelector: React.FC<NodeTypeSelectorProps> = ({
  onNodeSelect,
  selectedCategory = 'all',
  onCategoryChange
}) => {
  
  const nodeTypes: NodeType[] = [
    // Control Flow Nodes
    {
      id: 'start',
      category: 'control',
      name: 'Start Node',
      description: 'Entry point for workflow execution. Every workflow must have exactly one start node.',
      icon: Play,
      color: '#10b981',
      isRequired: true,
      maxInstances: 1,
      configurable: true,
      examples: ['User input trigger', 'API webhook trigger', 'Scheduled trigger']
    },
    {
      id: 'end',
      category: 'control',
      name: 'End Node', 
      description: 'Exit point for workflow completion. Defines successful workflow termination.',
      icon: Square,
      color: '#ef4444',
      isRequired: true,
      maxInstances: 1,
      configurable: true,
      examples: ['Success completion', 'Error termination', 'Timeout exit']
    },
    {
      id: 'condition',
      category: 'control',
      name: 'Condition Node',
      description: 'Decision point that routes workflow based on conditional logic and data evaluation.',
      icon: GitBranch,
      color: '#f59e0b',
      configurable: true,
      examples: ['Patient risk assessment', 'Data validation check', 'User permission check']
    },

    // Agent Nodes
    {
      id: 'single-agent',
      category: 'agent',
      name: 'Single Agent',
      description: 'Individual AI agent with specialized capabilities, knowledge base, and specific role.',
      icon: Bot,
      color: '#3b82f6',
      configurable: true,
      examples: ['Patient intake agent', 'Diagnosis assistant', 'Appointment scheduler']
    },
    {
      id: 'multi-agent',
      category: 'agent',
      name: 'Multi-Agent System',
      description: 'Orchestrated team of specialized agents that collaborate on complex tasks.',
      icon: Users,
      color: '#8b5cf6',
      configurable: true,
      examples: ['Treatment planning team', 'Care coordination team', 'Emergency response team']
    },

    // Action Nodes
    {
      id: 'action',
      category: 'action',
      name: 'Automated Action',
      description: 'Execute automated tasks like API calls, data processing, or system operations.',
      icon: Zap,
      color: '#06b6d4',
      configurable: true,
      examples: ['Send email notification', 'Update patient record', 'Generate report']
    },
    {
      id: 'human-input',
      category: 'action',
      name: 'Human Interaction',
      description: 'Points where human input, review, or approval is required in the workflow.',
      icon: MessageSquare,
      color: '#84cc16',
      configurable: true,
      examples: ['Physician approval', 'Patient consent', 'Quality review']
    },

    // Integration Nodes
    {
      id: 'api-integration',
      category: 'integration',
      name: 'API Integration',
      description: 'Connect to external systems, databases, or third-party services.',
      icon: Globe,
      color: '#ec4899',
      configurable: true,
      examples: ['EHR integration', 'Lab results API', 'Insurance verification']
    },
    {
      id: 'database',
      category: 'integration',
      name: 'Database Operation',
      description: 'Query, update, or manage data in connected databases and storage systems.',
      icon: Database,
      color: '#6366f1',
      configurable: true,
      examples: ['Patient lookup', 'Update treatment plan', 'Store assessment']
    },

    // Utility Nodes
    {
      id: 'document',
      category: 'utility',
      name: 'Document Handler',
      description: 'Process, generate, or manage documents and file operations.',
      icon: FileText,
      color: '#059669',
      configurable: true,
      examples: ['Generate care plan', 'Parse lab report', 'Create discharge summary']
    },
    {
      id: 'communication',
      category: 'utility',
      name: 'Communication',
      description: 'Handle various communication channels like SMS, email, or voice calls.',
      icon: Phone,
      color: '#dc2626',
      configurable: true,
      examples: ['Send appointment reminder', 'Emergency alert', 'Follow-up call']
    },
    {
      id: 'security',
      category: 'utility',
      name: 'Security Check',
      description: 'Implement security validations, compliance checks, and access controls.',
      icon: Shield,
      color: '#7c2d12',
      configurable: true,
      examples: ['HIPAA compliance check', 'User authentication', 'Data encryption']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Nodes', count: nodeTypes.length },
    { id: 'control', name: 'Control Flow', count: nodeTypes.filter(n => n.category === 'control').length },
    { id: 'agent', name: 'AI Agents', count: nodeTypes.filter(n => n.category === 'agent').length },
    { id: 'action', name: 'Actions', count: nodeTypes.filter(n => n.category === 'action').length },
    { id: 'integration', name: 'Integrations', count: nodeTypes.filter(n => n.category === 'integration').length },
    { id: 'utility', name: 'Utilities', count: nodeTypes.filter(n => n.category === 'utility').length }
  ];

  const filteredNodes = selectedCategory === 'all' 
    ? nodeTypes 
    : nodeTypes.filter(node => node.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Node Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => onCategoryChange?.(category.id)}
                className="flex items-center gap-2"
              >
                {category.name}
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Node Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <Card 
              key={nodeType.id} 
              className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
              style={{ borderLeftColor: nodeType.color }}
              onClick={() => onNodeSelect(nodeType)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    {nodeType.name}
                  </div>
                  <div className="flex gap-1">
                    {nodeType.isRequired && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                    {nodeType.maxInstances === 1 && (
                      <Badge variant="secondary" className="text-xs">Single</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  {nodeType.description}
                </p>
                
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Examples:
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {nodeType.examples.slice(0, 2).map((example, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                    {nodeType.examples.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{nodeType.examples.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNodeSelect(nodeType);
                  }}
                >
                  Add to Workflow
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Helper Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Quick Guidelines:</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Start with <strong>Start</strong> and <strong>End</strong> nodes (required)</li>
                <li>• Add <strong>Agent</strong> nodes for AI-powered tasks</li>
                <li>• Use <strong>Condition</strong> nodes for decision points</li>
                <li>• Connect nodes to define workflow flow</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Node Relationships:</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• <strong>Agents</strong> are deployed through Agent nodes</li>
                <li>• <strong>Single agents</strong> handle specific tasks</li>
                <li>• <strong>Multi-agents</strong> coordinate complex workflows</li>
                <li>• <strong>Actions</strong> execute automated operations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NodeTypeSelector;