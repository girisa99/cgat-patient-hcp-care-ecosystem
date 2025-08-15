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
  Zap
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
        { id: 'flow-testing', label: 'Flow Testing', icon: TestTube, description: 'Test your workflow in real-time' },
        { id: 'deployment', label: 'Deployment', icon: Rocket, description: 'Deploy your agent to channels' }
      ];
    } else {
      return [
        { id: 'agent-config', label: 'Agent Configuration', icon: Settings, description: 'Basic agent settings and behavior' },
        { id: 'actions-connectors', label: 'Actions & Connectors', icon: Zap, description: 'Define actions and external integrations' },
        { id: 'knowledge-base', label: 'Knowledge Base', icon: Database, description: 'Upload documents and data sources' },
        { id: 'voice-channels', label: 'Voice Channels', icon: Mic, description: 'Configure voice and audio capabilities' },
        { id: 'deployment', label: 'Deployment', icon: Rocket, description: 'Deploy your agent to channels' }
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-auto p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-background"
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-xs font-medium">{tab.label}</span>
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