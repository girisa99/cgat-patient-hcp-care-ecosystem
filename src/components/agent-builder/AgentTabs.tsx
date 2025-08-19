import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
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
        { id: 'canvas-designer', label: 'Canvas Designer', icon: Workflow, description: 'Visual drag-and-drop workflow builder with guided setup, journey stages, and customization' },
        { id: 'models-templates', label: 'Models & Templates', icon: Bot, description: 'AI models and workflow templates for different use cases and industries' },
        { id: 'connectors-api', label: 'Connectors & APIs', icon: Network, description: 'External system integrations and API connections for data exchange' },
        { id: 'system-config', label: 'System Configuration', icon: Cog, description: 'Core system settings, security parameters, and performance configurations' },
        { id: 'treatment-centers', label: 'Treatment Centers', icon: Building2, description: 'Healthcare facility configurations and provider network management' },
        { id: 'flow-testing', label: 'Flow Testing', icon: TestTube, description: 'Test your workflow in real-time with simulation and debugging tools' },
        { id: 'voice-config', label: 'Voice Configuration', icon: Mic, description: 'Voice channels, speech recognition, and audio processing settings' },
        { id: 'live-agent-transfer', label: 'Live Agent Transfer', icon: Phone, description: 'Human handoff configurations and escalation workflows' },
        { id: 'channel-matrix', label: 'Enhanced Channel Matrix', icon: Grid3x3, description: 'Multi-channel deployment matrix and cross-platform management' },
        { id: 'deployment-ready', label: 'Deployment Ready', icon: CheckCircle, description: 'Pre-deployment validation, security checks, and readiness assessment' },
        { id: 'deployment-flow', label: 'Deployment Flow', icon: GitBranch, description: 'Complete deployment pipeline with staging, testing, and production rollout' }
      ];
    } else {
      return [
        { id: 'agent-config', label: 'Agent Configuration', icon: Settings, description: 'Basic agent settings, behavior parameters, and core configuration options' },
        { id: 'models-templates', label: 'Models & Templates', icon: Bot, description: 'AI models selection, prompt templates, and pre-built configuration templates' },
        { id: 'actions-tasks', label: 'Actions & Tasks', icon: Zap, description: 'Define automated actions, task workflows, and agent capabilities' },
        { id: 'connectors-api', label: 'Connectors & APIs', icon: Network, description: 'External system integrations, API connections, and data source management' },
        { id: 'knowledge-base', label: 'Knowledge Base', icon: Database, description: 'Upload documents, manage data sources, and configure RAG systems' },
        { id: 'system-config', label: 'System Configuration', icon: Cog, description: 'Advanced system settings, security parameters, and performance tuning' },
        { id: 'treatment-centers', label: 'Treatment Centers', icon: Building2, description: 'Healthcare facility management and provider network configuration' },
        { id: 'voice-config', label: 'Voice Configuration', icon: Mic, description: 'Voice channels, speech recognition settings, and audio processing' },
        { id: 'live-agent-transfer', label: 'Live Agent Transfer', icon: Phone, description: 'Human agent handoff settings and escalation workflows' },
        { id: 'channel-matrix', label: 'Enhanced Channel Matrix', icon: Grid3x3, description: 'Multi-channel deployment configuration and platform management' },
        { id: 'deployment-ready', label: 'Deployment Ready', icon: CheckCircle, description: 'Deployment readiness validation and final configuration checks' },
        { id: 'deployment-flow', label: 'Deployment Flow', icon: GitBranch, description: 'End-to-end deployment process and environment management' }
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
        <TooltipProvider delayDuration={100}>
          <div className="w-full overflow-x-auto scrollbar-hide pb-1">
            <TabsList className="flex items-center h-auto p-1 gap-1 w-fit" style={{ minWidth: 'max-content' }}>
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={tab.id}
                        className="flex flex-col items-center gap-1 py-3 px-3 data-[state=active]:bg-background min-w-fit h-auto whitespace-nowrap flex-shrink-0"
                        aria-label={tab.label}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8} className="max-w-[280px] z-50 bg-popover text-popover-foreground border shadow-md">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{tab.label}</div>
                        <div className="text-xs opacity-90 leading-relaxed">{tab.description}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TabsList>
          </div>
        </TooltipProvider>

        {children}
      </Tabs>
    </div>
  );
};

export default AgentTabs;