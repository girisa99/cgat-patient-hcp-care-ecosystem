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
  Layers, Brain, Link, Users, AlertTriangle, 
  Grid, MousePointer, Hand, Trash2, Plus, Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConnectionMode, BackgroundVariant } from '@xyflow/react';

// Tab Components
import { NodePalette } from './NodePalette';
import { EnhancedNodePalette } from './EnhancedNodePalette';
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
  // New props for canvas controls
  onAddNode?: (type: string) => void;
  onLayoutChange?: (layout: string) => void;
  onSnapToGrid?: (snap: boolean) => void;
  onBackgroundChange?: (variant: string) => void;
  onConnectionModeChange?: (mode: string) => void;
  onDragModeChange?: (mode: string) => void;
  onShowMiniMap?: (show: boolean) => void;
  onClearAll?: () => void;
  // Current states
  selectedLayout?: string;
  snapToGrid?: boolean;
  backgroundVariant?: string;
  connectionMode?: string;
  dragMode?: string;
  showMiniMap?: boolean;
}

interface TabItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'workflow' | 'ai' | 'data' | 'testing' | 'deployment';
}

const tabItems: TabItem[] = [
  // Workflow Group - Canvas Controls
  { id: 'layout', title: 'Layout', icon: Layers, group: 'workflow' },
  { id: 'nodes', title: 'Nodes', icon: Workflow, group: 'workflow' },
  { id: 'edges', title: 'Edges', icon: Link, group: 'workflow' },
  { id: 'settings', title: 'Settings', icon: Settings, group: 'workflow' },
  
  // AI Group  
  { id: 'ai-agents', title: 'AI Agents', icon: Bot, group: 'ai' },
  { id: 'ai-test', title: 'AI Test', icon: Brain, group: 'ai' },
  { id: 'ai-assistant', title: 'AI Assistant', icon: Zap, group: 'ai' },
  
  // Data Group
  { id: 'data-connectors', title: 'Data & Connectors', icon: Database, group: 'data' },
  { id: 'integrations', title: 'Integrations', icon: Link, group: 'data' },
  
  // Testing Group
  { id: 'classic-test', title: 'Classic Test', icon: TestTube, group: 'testing' },
  { id: 'code-editor', title: 'Code', icon: Code, group: 'testing' },
  { id: 'execute', title: 'Execute', icon: Zap, group: 'testing' },
  { id: 'insights', title: 'Insights', icon: Eye, group: 'testing' },
  { id: 'ui-preview', title: 'UI', icon: Palette, group: 'testing' },
  
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
  setShowCodeEditor,
  onAddNode,
  onLayoutChange,
  onSnapToGrid,
  onBackgroundChange,
  onConnectionModeChange,
  onDragModeChange,
  onShowMiniMap,
  onClearAll,
  selectedLayout = 'manual',
  snapToGrid = false,
  backgroundVariant = 'dots',
  connectionMode = 'strict',
  dragMode = 'select',
  showMiniMap = true
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
      case 'insights':
        window.dispatchEvent(new Event('workflow:toggleInsights'));
        break;
    }
  };
  const getTabContent = () => {
    switch (activeTab) {
      case 'layout':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold mb-4">Layout Controls</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Auto Layout</label>
                <Select value={selectedLayout} onValueChange={onLayoutChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Layout Algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="dagre">Dagre (Top-Bottom)</SelectItem>
                    <SelectItem value="elk">ELK (Advanced)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Background</label>
                <Select value={backgroundVariant} onValueChange={onBackgroundChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Background" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dots">Dots</SelectItem>
                    <SelectItem value="lines">Lines</SelectItem>
                    <SelectItem value="cross">Cross</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                size="sm"
                variant={snapToGrid ? "default" : "outline"}
                onClick={() => onSnapToGrid?.(!snapToGrid)}
                className="w-full"
              >
                <Grid className="h-4 w-4 mr-2" />
                Snap to Grid
              </Button>
            </div>
          </div>
        );
        
      case 'nodes':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold mb-4">Enhanced Node Library</h3>
            <div className="space-y-2">
              <Button size="sm" onClick={() => onAddNode?.('customer')} className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Customer
              </Button>
              <Button size="sm" onClick={() => onAddNode?.('decision')} className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Decision
              </Button>
              <Button size="sm" onClick={() => onAddNode?.('agent')} className="w-full justify-start">
                <Bot className="h-4 w-4 mr-2" />
                Agent
              </Button>
              <Button size="sm" onClick={() => onAddNode?.('database')} className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Database
              </Button>
              <Button size="sm" onClick={() => onAddNode?.('group')} className="w-full justify-start">
                <Layers className="h-4 w-4 mr-2" />
                Group
              </Button>
            </div>
            
            <div className="mt-6">
              <EnhancedNodePalette heightClass="h-96" />
            </div>
          </div>
        );
        
      case 'edges':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold mb-4">Edge Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Connection Mode</label>
                <Select value={connectionMode} onValueChange={onConnectionModeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Connection Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict</SelectItem>
                    <SelectItem value="loose">Loose</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                size="sm"
                variant={dragMode === 'pan' ? "default" : "outline"}
                onClick={() => onDragModeChange?.(dragMode === 'select' ? 'pan' : 'select')}
                className="w-full"
              >
                {dragMode === 'select' ? <MousePointer className="h-4 w-4 mr-2" /> : <Hand className="h-4 w-4 mr-2" />}
                {dragMode === 'select' ? 'Select Mode' : 'Pan Mode'}
              </Button>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold mb-4">Canvas Settings</h3>
            
            <div className="space-y-2">
              <Button
                size="sm"
                variant={showMiniMap ? "default" : "outline"}
                onClick={() => onShowMiniMap?.(!showMiniMap)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Mini Map
              </Button>
              
              <Button size="sm" variant="destructive" onClick={onClearAll} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        );
        
      case 'ai-test':
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
        
      case 'execute':
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-4">Execute Flow</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Run and test your workflow in real-time.
            </p>
            <Button className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Start Execution
            </Button>
          </div>
        );
        
      case 'insights':
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-4">Analytics & Insights</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Workflow Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted p-2 rounded">
                    <div className="font-medium">{nodes.length}</div>
                    <div className="text-muted-foreground">Nodes</div>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <div className="font-medium">{edges.length}</div>
                    <div className="text-muted-foreground">Connections</div>
                  </div>
                </div>
              </div>
              {selectedNode && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Selected Node</h4>
                  <div className="text-xs space-y-1">
                    <div><strong>ID:</strong> {selectedNode.id}</div>
                    <div><strong>Type:</strong> {selectedNode.type || 'default'}</div>
                    <div><strong>Label:</strong> {String(selectedNode.data?.label || 'No label')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'ui-preview':
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-4">UI Preview</h3>
            <p className="text-sm text-muted-foreground">
              Preview how your workflow will appear to end users.
            </p>
          </div>
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
            <SidebarGroup key={group}>
              <SidebarGroupLabel 
                className="cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1"
                onClick={() => toggleGroup(group)}
              >
                {!collapsed && groupLabels[group as keyof typeof groupLabels]}
              </SidebarGroupLabel>
              
              {(expandedGroups[group] || collapsed) && (
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
              )}
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