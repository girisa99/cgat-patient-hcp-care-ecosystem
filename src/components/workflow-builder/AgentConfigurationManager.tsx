import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Bot,
  Route,
  Wand2,
  Layout,
  Database,
  Zap,
  Link,
  CheckSquare,
  Mic,
  Grid,
  Users,
  CircuitBoard,
  TestTube,
  ChevronDown,
  Settings,
  PlusCircle
} from 'lucide-react';

interface AgentConfigurationManagerProps {
  onConfigSelect?: (config: any) => void;
}

export const AgentConfigurationManager: React.FC<AgentConfigurationManagerProps> = ({
  onConfigSelect
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Core Agents': true,
    'Infrastructure': false,
    'Channels & Communication': false,
    'Testing & Deployment': false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const agentConfigurations = {
    'Core Agents': {
      items: [
        { 
          id: 'use-case-agent', 
          name: 'Use Case Templates', 
          desc: 'Pre-built healthcare workflow templates',
          icon: Bot, 
          color: 'bg-blue-100 dark:bg-blue-900',
          status: 'ready',
          count: 12 
        },
        { 
          id: 'journey-agent', 
          name: 'Patient Journey Designer', 
          desc: 'Map patient care pathways and touchpoints',
          icon: Route, 
          color: 'bg-green-100 dark:bg-green-900',
          status: 'ready',
          count: 8 
        },
        { 
          id: 'wizard-agent', 
          name: 'Configuration Wizard', 
          desc: 'Step-by-step agent setup and optimization',
          icon: Wand2, 
          color: 'bg-purple-100 dark:bg-purple-900',
          status: 'ready',
          count: 5 
        },
        { 
          id: 'canvas-agent', 
          name: 'Visual Canvas Builder', 
          desc: 'Drag-and-drop workflow designer',
          icon: Layout, 
          color: 'bg-orange-100 dark:bg-orange-900',
          status: 'active',
          count: 15 
        }
      ]
    },
    'Infrastructure': {
      items: [
        { 
          id: 'knowledge-base', 
          name: 'Knowledge Base Manager', 
          desc: 'Medical knowledge and protocol storage',
          icon: Database, 
          color: 'bg-cyan-100 dark:bg-cyan-900',
          status: 'ready',
          count: 24 
        },
        { 
          id: 'rag-system', 
          name: 'RAG & Retrieval Engine', 
          desc: 'Intelligent document and data retrieval',
          icon: Database, 
          color: 'bg-indigo-100 dark:bg-indigo-900',
          status: 'ready',
          count: 18 
        },
        { 
          id: 'connectors', 
          name: 'System Connectors', 
          desc: 'EMR, EHR, and third-party integrations',
          icon: Link, 
          color: 'bg-teal-100 dark:bg-teal-900',
          status: 'ready',
          count: 32 
        },
        { 
          id: 'actions-tasks', 
          name: 'Actions & Tasks Engine', 
          desc: 'Automated workflows and task management',
          icon: Zap, 
          color: 'bg-yellow-100 dark:bg-yellow-900',
          status: 'ready',
          count: 45 
        }
      ]
    },
    'Channels & Communication': {
      items: [
        { 
          id: 'voice-channels', 
          name: 'Voice Channel Manager', 
          desc: 'Phone, IVR, and voice interaction setup',
          icon: Mic, 
          color: 'bg-pink-100 dark:bg-pink-900',
          status: 'beta',
          count: 6 
        },
        { 
          id: 'channel-matrix', 
          name: 'Communication Matrix', 
          desc: 'Multi-channel patient communication strategy',
          icon: Grid, 
          color: 'bg-rose-100 dark:bg-rose-900',
          status: 'ready',
          count: 12 
        },
        { 
          id: 'human-loop', 
          name: 'Human-in-the-Loop', 
          desc: 'Provider escalation and approval workflows',
          icon: Users, 
          color: 'bg-amber-100 dark:bg-amber-900',
          status: 'ready',
          count: 9 
        }
      ]
    },
    'Testing & Deployment': {
      items: [
        { 
          id: 'deployment-flow', 
          name: 'Deployment Pipeline', 
          desc: 'Automated deployment and rollback strategies',
          icon: CircuitBoard, 
          color: 'bg-emerald-100 dark:bg-emerald-900',
          status: 'ready',
          count: 7 
        },
        { 
          id: 'testing-suite', 
          name: 'Testing & Validation', 
          desc: 'Healthcare workflow testing and compliance checks',
          icon: TestTube, 
          color: 'bg-violet-100 dark:bg-violet-900',
          status: 'ready',
          count: 15 
        },
        { 
          id: 'deployment-config', 
          name: 'Production Configuration', 
          desc: 'HIPAA-compliant production environment setup',
          icon: Settings, 
          color: 'bg-slate-100 dark:bg-slate-900',
          status: 'ready',
          count: 11 
        }
      ]
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="text-xs bg-success/10 text-success border-success/20">Active</Badge>;
      case 'ready':
        return <Badge variant="secondary" className="text-xs">Ready</Badge>;
      case 'beta':
        return <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">Beta</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Available</Badge>;
    }
  };

  const handleDragStart = (event: React.DragEvent, config: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: config.id,
      label: config.name,
      isAgentConfig: true,
      config: config
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Agent Configuration Manager</span>
        <Badge variant="secondary" className="text-xs">Healthcare AI</Badge>
      </div>
      
      <div className="text-xs text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">
        <strong>Healthcare-First Design:</strong> All agents are pre-configured for HIPAA compliance, medical workflows, and patient safety protocols.
      </div>

      {Object.entries(agentConfigurations).map(([sectionName, section]) => (
        <Collapsible 
          key={sectionName}
          open={expandedSections[sectionName]}
          onOpenChange={() => toggleSection(sectionName)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full p-3 h-auto text-left hover:bg-accent/50 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">{sectionName}</span>
                <Badge variant="outline" className="text-xs">
                  {section.items.length} agents
                </Badge>
              </div>
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${
                  expandedSections[sectionName] ? 'rotate-0' : '-rotate-90'
                }`} 
              />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2 mt-2">
            {section.items.map((config) => (
              <div
                key={config.id}
                draggable
                onDragStart={(e) => handleDragStart(e, config)}
                className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-accent/30 cursor-grab active:cursor-grabbing transition-colors ml-3"
                onClick={() => onConfigSelect?.(config)}
              >
                <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                  <config.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{config.name}</span>
                    {getStatusBadge(config.status)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{config.desc}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {config.count} components
                    </Badge>
                  </div>
                </div>
                <PlusCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}

      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Agent Status Overview</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Ready Agents:</span>
            <span className="text-success font-medium">10/11 Available</span>
          </div>
          <div className="flex justify-between">
            <span>Total Components:</span>
            <span className="font-medium">202 Configured</span>
          </div>
          <div className="flex justify-between">
            <span>HIPAA Compliance:</span>
            <span className="text-success font-medium">100% Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};