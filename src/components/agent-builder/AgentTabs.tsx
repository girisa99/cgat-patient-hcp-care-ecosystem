import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Workflow, 
  Settings, 
  Database, 
  Mic, 
  Rocket,
  TestTube,
  Brain,
  Zap,
  Bot,
  Network,
  Cog,
  Building2,
  FileText,
  Phone,
  Users,
  Grid3x3,
  CheckCircle,
  GitBranch,
  Puzzle,
  Code
} from 'lucide-react';

export type AgentMode = 'visual' | 'manual';

interface AgentTabsProps {
  mode: AgentMode;
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

export const AgentTabs: React.FC<AgentTabsProps> = ({
  mode,
  activeTab,
  onTabChange,
  children
}) => {
  const getTabsForMode = (mode: AgentMode) => {
    if (mode === 'visual') {
      return [
        { id: 'canvas-designer', label: 'Canvas Designer', icon: Workflow, description: 'Visual drag-and-drop workflow builder' },
        { id: 'models-templates', label: 'Models & Templates', icon: Bot, description: 'AI models and workflow templates' },
        { id: 'actions-tasks', label: 'Actions & Tasks', icon: Zap, description: 'Define automated actions and tasks' },
        { id: 'connectors-api', label: 'Connectors & APIs', icon: Network, description: 'External system integrations' },
        { id: 'system-config', label: 'System Configuration', icon: Cog, description: 'Core system settings and parameters' },
        { id: 'treatment-centers', label: 'Treatment Centers', icon: Building2, description: 'Healthcare facility configurations' },
        { id: 'flow-testing', label: 'Flow Testing', icon: TestTube, description: 'Test your workflow in real-time' },
        { id: 'voice-config', label: 'Voice Configuration', icon: Mic, description: 'Voice and speech settings' },
        { id: 'live-agent-transfer', label: 'Live Agent Transfer', icon: Phone, description: 'Human handoff configurations' },
        { id: 'channel-matrix', label: 'Enhanced Channel Matrix', icon: Grid3x3, description: 'Multi-channel deployment matrix' },
        { id: 'deployment-ready', label: 'Deployment Ready', icon: CheckCircle, description: 'Pre-deployment validation and checks' },
        { id: 'deployment-flow', label: 'Deployment Flow', icon: GitBranch, description: 'Complete deployment pipeline' }
      ];
    } else {
      return [
        { id: 'agent-config', label: 'Agent Configuration', icon: Settings, description: 'Basic agent settings and behavior' },
        { id: 'models-templates', label: 'Models & Templates', icon: Bot, description: 'AI models and configuration templates' },
        { id: 'actions-tasks', label: 'Actions & Tasks', icon: Zap, description: 'Define automated actions and task workflows' },
        { id: 'connectors-api', label: 'Connectors & APIs', icon: Network, description: 'External system integrations and APIs' },
        { id: 'knowledge-base', label: 'Knowledge Base', icon: Database, description: 'Upload documents and data sources' },
        { id: 'system-config', label: 'System Configuration', icon: Cog, description: 'Advanced system settings and parameters' },
        { id: 'treatment-centers', label: 'Treatment Centers', icon: Building2, description: 'Healthcare facility management' },
        { id: 'voice-config', label: 'Voice Configuration', icon: Mic, description: 'Voice channels and speech settings' },
        { id: 'live-agent-transfer', label: 'Live Agent Transfer', icon: Phone, description: 'Human agent handoff settings' },
        { id: 'channel-matrix', label: 'Enhanced Channel Matrix', icon: Grid3x3, description: 'Multi-channel deployment configuration' },
        { id: 'deployment-ready', label: 'Deployment Ready', icon: CheckCircle, description: 'Deployment readiness validation' },
        { id: 'deployment-flow', label: 'Deployment Flow', icon: GitBranch, description: 'End-to-end deployment process' }
      ];
    }
  };

  const tabs = getTabsForMode(mode);

  return (
    <div className="space-y-4">
      {/* Mode indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {mode === 'visual' ? (
              <Workflow className="w-5 h-5 text-primary" />
            ) : (
              <Settings className="w-5 h-5 text-primary" />
            )}
            <h2 className="text-xl font-semibold">
              {mode === 'visual' ? 'Visual Workflow Builder' : 'Manual Configuration'}
            </h2>
          </div>
          <Badge variant="outline">
            {mode === 'visual' ? 'Visual Mode' : 'Manual Mode'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 h-auto p-1 gap-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 py-2 px-1 data-[state=active]:bg-background min-w-0"
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs font-medium text-center leading-tight truncate max-w-full">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {children}
      </Tabs>
    </div>
  );
};

export default AgentTabs;