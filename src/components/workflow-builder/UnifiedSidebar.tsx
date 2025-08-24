import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Workflow, Bot, Database, Settings, Rocket, 
  TestTube, Palette, Play, Code, Zap, Eye,
  Layers, Brain, Link
} from 'lucide-react';

// Tab Components
import { NodePalette } from './NodePalette';
import { AITestingAssistant } from './AITestingAssistant';
import { TestingConsolePanel } from './TestingConsolePanel';
import { CodeEditorPanel } from './CodeEditorPanel';

interface UnifiedSidebarProps {
  nodes: any[];
  edges: any[];
  selectedNode?: any;
  sessionId?: string;
  testInput: any;
  onWorkflowUpdate?: (nodes: any[], edges: any[]) => void;
  showTestConsole: boolean;
  showCodeEditor: boolean;
  setShowTestConsole: (show: boolean) => void;
  setShowCodeEditor: (show: boolean) => void;
}

interface TabItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'workflow' | 'ai' | 'data' | 'testing' | 'deployment';
}

const tabItems: TabItem[] = [
  // Workflow Group
  { id: 'nodes', title: 'Workflow Nodes', icon: Workflow, group: 'workflow' },
  { id: 'layers', title: 'Canvas Layers', icon: Layers, group: 'workflow' },
  
  // AI Group  
  { id: 'ai-agents', title: 'AI Agents', icon: Bot, group: 'ai' },
  { id: 'ai-intelligence', title: 'AI Intelligence', icon: Brain, group: 'ai' },
  { id: 'ai-assistant', title: 'AI Assistant', icon: Zap, group: 'ai' },
  
  // Data Group
  { id: 'data-connectors', title: 'Data & Connectors', icon: Database, group: 'data' },
  { id: 'integrations', title: 'Integrations', icon: Link, group: 'data' },
  
  // Testing Group
  { id: 'testing', title: 'Testing Console', icon: TestTube, group: 'testing' },
  { id: 'classic-test', title: 'Classic Test', icon: Play, group: 'testing' },
  { id: 'code-editor', title: 'Code Editor', icon: Code, group: 'testing' },
  { id: 'execute', title: 'Execute Flow', icon: Zap, group: 'testing' },
  { id: 'insights', title: 'Insights', icon: Eye, group: 'testing' },
  { id: 'ui-preview', title: 'UI Preview', icon: Palette, group: 'testing' },
  
  // Deployment Group
  { id: 'configuration', title: 'Configuration', icon: Settings, group: 'deployment' },
  { id: 'deployment', title: 'Deployment', icon: Rocket, group: 'deployment' },
];

const groupLabels = {
  workflow: 'Workflow Design',
  ai: 'AI & Intelligence', 
  data: 'Data & Connections',
  testing: 'Testing & Debug',
  deployment: 'Config & Deploy'
};

export const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
  nodes,
  edges,
  selectedNode,
  sessionId,
  testInput,
  onWorkflowUpdate,
  showTestConsole,
  showCodeEditor,
  setShowTestConsole,
  setShowCodeEditor
}) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [activeTab, setActiveTab] = useState('nodes');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    workflow: true,
    ai: false,
    data: false,
    testing: false,
    deployment: false
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    
    // Handle special tabs that control external state
    switch (tabId) {
      case 'testing':
        setShowTestConsole(true);
        break;
      case 'code-editor':
        setShowCodeEditor(true);
        break;
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'nodes':
        return <NodePalette heightClass="h-full" />;
        
      case 'ai-assistant':
        return (
          <AITestingAssistant
            nodes={nodes}
            edges={edges}
            testInput={testInput}
            onWorkflowUpdate={onWorkflowUpdate}
            isVisible={true}
          />
        );
        
      case 'testing':
      case 'classic-test':
        return (
          <TestingConsolePanel
            isVisible={true}
            onToggle={() => setShowTestConsole(!showTestConsole)}
            sessionId={sessionId}
            selectedNode={selectedNode}
            workflowNodes={nodes}
            workflowEdges={edges}
            heightClass="h-full"
          />
        );
        
        case 'code-editor':
          return (
            <CodeEditorPanel
              isVisible={true}
              onToggle={() => setShowCodeEditor(!showCodeEditor)}
              sessionId={sessionId}
            />
          );
        
      case 'ai-agents':
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-4">AI Agents</h3>
            <p className="text-sm text-muted-foreground">
              Manage and configure AI agents for your workflow.
            </p>
          </div>
        );
        
      case 'ai-intelligence':
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-4">AI Intelligence</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI capabilities and model management.
            </p>
          </div>
        );
        
      case 'data-connectors':
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-4">Data & Connectors</h3>
            <p className="text-sm text-muted-foreground">
              Connect to external data sources and APIs.
            </p>
          </div>
        );
        
      case 'configuration':
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-4">Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Workflow settings and environment configuration.
            </p>
          </div>
        );
        
      case 'deployment':
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-4">Deployment</h3>
            <p className="text-sm text-muted-foreground">
              Deploy your workflow to production environments.
            </p>
          </div>
        );
        
      default:
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-4">{tabItems.find(t => t.id === activeTab)?.title}</h3>
            <p className="text-sm text-muted-foreground">
              Content for {activeTab} tab coming soon...
            </p>
          </div>
        );
    }
  };

  const groupedTabs = tabItems.reduce((acc, tab) => {
    if (!acc[tab.group]) acc[tab.group] = [];
    acc[tab.group].push(tab);
    return acc;
  }, {} as Record<string, TabItem[]>);

  return (
    <Sidebar className={collapsed ? "w-14" : "w-80"}>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="flex flex-col h-full">
        {/* Navigation Menu */}
        <div className="flex-shrink-0 border-b">
          {Object.entries(groupedTabs).map(([group, tabs]) => (
            <SidebarGroup 
              key={group}
              open={expandedGroups[group]}
              onOpenChange={() => toggleGroup(group)}
            >
              <SidebarGroupLabel className="cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1">
                {!collapsed && groupLabels[group as keyof typeof groupLabels]}
              </SidebarGroupLabel>
              
              <SidebarGroupContent>
                <SidebarMenu>
                  {tabs.map((tab) => (
                    <SidebarMenuItem key={tab.id}>
                      <SidebarMenuButton 
                        onClick={() => handleTabClick(tab.id)}
                        className={activeTab === tab.id ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                      >
                        <tab.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{tab.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {getTabContent()}
          </ScrollArea>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};