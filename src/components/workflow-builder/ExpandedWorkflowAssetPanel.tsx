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
import { NodePalette } from './NodePalette';
import { PromptBasedModelSelector } from './PromptBasedModelSelector';
import { WorkflowTypeSelector, DATA_TYPES, OPERATION_TYPES, CONDITION_OPERATIONS } from './WorkflowTypeSelector';
import { UniversalAccessManager } from './UniversalAccessManager';
import { AgentConfigurationManager } from './AgentConfigurationManager';

interface ExpandedWorkflowAssetPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}


export const ExpandedWorkflowAssetPanel: React.FC<ExpandedWorkflowAssetPanelProps> = ({
  isCollapsed,
  onToggle
}) => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

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
    <div className="w-72 lg:w-80 h-full bg-background border-r border-border">
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

        <CardContent className="p-0 h-[calc(100%-56px)]">
          <Tabs defaultValue="agents" className="h-full">
            <TabsList className="flex w-full gap-1 rounded-none h-10 p-1 overflow-x-auto whitespace-nowrap no-scrollbar bg-muted/30">
              <TabsTrigger value="agents" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Bot className="h-3 w-3 mr-1" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="models" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Database className="h-3 w-3 mr-1" />
                AI Models
              </TabsTrigger>
              <TabsTrigger value="access" className="text-xs px-3 h-7 min-w-fit font-medium">
                <Shield className="h-3 w-3 mr-1" />
                Access
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="mt-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <div className="text-xs text-muted-foreground mb-3 p-2 bg-muted/30 rounded-lg">
                    <strong>Note:</strong> Workflow nodes have been moved to the Node Palette on the right for better organization.
                  </div>
                  <AgentConfigurationManager onConfigSelect={() => {}} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="models" className="mt-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <div className="text-xs text-muted-foreground mb-3 p-2 bg-muted/30 rounded-lg">
                    <strong>AI Models:</strong> Select and configure AI models for your workflow
                  </div>
                  <PromptBasedModelSelector
                    onModelSelect={handleModelSelect}
                    selectedModels={selectedModels}
                  />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="access" className="mt-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <div className="text-xs text-muted-foreground mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <strong>Under Development:</strong> Universal Access Manager is currently UI-only. Backend integration and full functionality coming soon.
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