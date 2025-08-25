import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, Palette, Bot, Database, Link, Settings, 
  PlusCircle, Layers, Network, ChevronLeft, Shield
} from 'lucide-react';
import { EnhancedNodePalette } from './EnhancedNodePalette';
import { PromptBasedModelSelector } from './PromptBasedModelSelector';
import { UniversalAccessManager } from './UniversalAccessManager';
import { AgentConfigurationManager } from './AgentConfigurationManager';
import { SequentialFlowGuide } from './SequentialFlowGuide';

interface ExpandedWorkflowAssetPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}


export const ExpandedWorkflowAssetPanel: React.FC<ExpandedWorkflowAssetPanelProps> = ({
  isCollapsed,
  onToggle
}) => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('nodes');

  const handleModelSelect = (model: any) => {
    setSelectedModels(prev => 
      prev.includes(model.id) 
        ? prev.filter(id => id !== model.id)
        : [...prev, model.id]
    );
  };


  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-background border-r border-border flex flex-col items-center py-3 gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 hover:bg-accent"
          onClick={onToggle}
        >
          <Palette className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2 opacity-60">
          <Bot className="h-3 w-3 text-muted-foreground" />
          <Database className="h-3 w-3 text-muted-foreground" />
          <Link className="h-3 w-3 text-muted-foreground" />
          <Shield className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 xl:w-[26rem] h-full bg-background border-r border-border">
      <Card className="h-full rounded-none border-0">
        <CardHeader className="px-3 py-2 border-b">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="truncate">Workflow Assets</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-accent"
              onClick={onToggle}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 h-[calc(100%-56px)] flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col min-h-0">
            <TabsList className="flex w-full gap-1 rounded-none h-10 p-1 overflow-x-auto whitespace-nowrap bg-muted/30">
              <TabsTrigger value="nodes" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Palette className="h-3 w-3 mr-1" />
                Node Palette
              </TabsTrigger>
              <TabsTrigger value="guide" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Layers className="h-3 w-3 mr-1" />
                Workflow Guide
              </TabsTrigger>
              <TabsTrigger value="agents" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Bot className="h-3 w-3 mr-1" />
                Agents Setup
              </TabsTrigger>
              <TabsTrigger value="models" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Database className="h-3 w-3 mr-1" />
                AI Models
              </TabsTrigger>
              <TabsTrigger value="access" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Shield className="h-3 w-3 mr-1" />
                Access Control
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nodes" className="mt-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <div className="text-xs text-primary/80 mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <strong>Enhanced Node Library:</strong> Drag and drop nodes from categories below to build your workflow. Each node is database-backed with detailed capabilities and configurations.
                  </div>
                  <EnhancedNodePalette heightClass="h-full" />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="guide" className="mt-0 flex-1 min-h-0">
              <SequentialFlowGuide 
                onStepSelect={(step) => {
                  if (step === 0) setActiveTab('nodes');
                  else if (step === 1) setActiveTab('agents');
                  else if (step === 2) setActiveTab('models');
                  else if (step === 3) setActiveTab('access');
                  else setActiveTab('guide');
                }}
              />
            </TabsContent>

            <TabsContent value="agents" className="mt-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <div className="text-xs text-primary/80 mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <strong>Phase 1:</strong> Configure your AI agents for different workflow tasks. These agents will be available as building blocks in the Node Palette.
                  </div>
                  <AgentConfigurationManager onConfigSelect={() => {}} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="models" className="mt-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <div className="text-xs text-primary/80 mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <strong>Phase 1:</strong> Select and configure AI models that your agents will use. These models power the intelligence in your workflow nodes.
                  </div>
                  <PromptBasedModelSelector
                    onModelSelect={handleModelSelect}
                    selectedModels={selectedModels}
                  />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="access" className="mt-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <div className="text-xs text-primary/80 mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <strong>Phase 1:</strong> Configure security, permissions, and access control. These settings will be applied to your workflow nodes automatically.
                  </div>
                  <UniversalAccessManager />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};