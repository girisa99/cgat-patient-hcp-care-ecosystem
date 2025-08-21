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
import { SecurityAccessManager } from './SecurityAccessManager';
import { AgentConfigurationManager } from './AgentConfigurationManager';

interface ExpandedWorkflowAssetPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Workflow Node Categories for the palette
const WORKFLOW_NODE_CATEGORIES = {
  'Core Nodes': [
    { id: 'start', label: 'Start', desc: 'Starting point of workflow', icon: '🏁', color: 'bg-green-100' },
    { id: 'condition', label: 'Condition', desc: 'If-else logic branching', icon: '❓', color: 'bg-yellow-100' },
    { id: 'agent', label: 'Agent', desc: 'AI agent with multi-step reasoning', icon: '🤖', color: 'bg-blue-100' },
    { id: 'llm', label: 'LLM', desc: 'Large language model processing', icon: '🧠', color: 'bg-purple-100' },
    { id: 'human_input', label: 'Human Input', desc: 'Request human approval/input', icon: '👤', color: 'bg-orange-100' },
  ],
  'Flow Control': [
    { id: 'conditional_agent', label: 'Conditional Agent', desc: 'Dynamic condition evaluation', icon: '🔀', color: 'bg-cyan-100' },
    { id: 'iteration', label: 'Iteration', desc: 'Loop through N iterations', icon: '🔄', color: 'bg-indigo-100' },
    { id: 'loop', label: 'Loop', desc: 'Loop back to previous node', icon: '↩️', color: 'bg-pink-100' },
    { id: 'execute_flow', label: 'Execute Flow', desc: 'Run another workflow', icon: '⚡', color: 'bg-emerald-100' },
  ],
  'Communication': [
    { id: 'direct_reply', label: 'Direct Reply', desc: 'Send message to user', icon: '💬', color: 'bg-blue-100' },
    { id: 'http', label: 'HTTP Request', desc: 'Make API calls', icon: '🌐', color: 'bg-gray-100' },
    { id: 'tools', label: 'Tools', desc: 'External tool integration', icon: '🛠️', color: 'bg-amber-100' },
  ],
  'Data & Storage': [
    { id: 'retriever', label: 'Retriever', desc: 'Vector database search', icon: '🔍', color: 'bg-green-100' },
    { id: 'custom_function', label: 'Custom Function', desc: 'Execute custom code', icon: '⚙️', color: 'bg-red-100' },
    { id: 'stick_note', label: 'Stick Note', desc: 'Add documentation', icon: '📝', color: 'bg-yellow-100' },
  ],
};

export const ExpandedWorkflowAssetPanel: React.FC<ExpandedWorkflowAssetPanelProps> = ({
  isCollapsed,
  onToggle
}) => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [expandedNodeCategories, setExpandedNodeCategories] = useState<Record<string, boolean>>({
    'Core Nodes': true,
    'Flow Control': true
  });

  const handleModelSelect = (model: any) => {
    setSelectedModels(prev => 
      prev.includes(model.id) 
        ? prev.filter(id => id !== model.id)
        : [...prev, model.id]
    );
  };

  const toggleNodeCategory = (category: string) => {
    setExpandedNodeCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      label: label,
      isNewNode: true
    }));
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
          <Tabs defaultValue="nodes" className="h-full">
            <TabsList className="grid w-full grid-cols-4 rounded-none h-9">
              <TabsTrigger value="nodes" className="text-xs px-1">Nodes</TabsTrigger>
              <TabsTrigger value="agents" className="text-xs px-1">Agents</TabsTrigger>
              <TabsTrigger value="models" className="text-xs px-1">AI</TabsTrigger>
              <TabsTrigger value="access" className="text-xs px-1">Access</TabsTrigger>
            </TabsList>

            <TabsContent value="nodes" className="mt-0 h-[calc(100%-36px)]">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-3">
                  <div className="text-xs text-muted-foreground mb-3 p-2 bg-muted/30 rounded-lg">
                    <strong>Drag & Drop:</strong> Add nodes to your workflow canvas
                  </div>
                  
                  {Object.entries(WORKFLOW_NODE_CATEGORIES).map(([category, nodes]) => (
                    <Collapsible 
                      key={category}
                      open={expandedNodeCategories[category]}
                      onOpenChange={() => toggleNodeCategory(category)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center justify-between w-full p-2 h-auto text-left hover:bg-accent/50 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronDown 
                              className={`h-3 w-3 transition-transform ${
                                expandedNodeCategories[category] ? 'rotate-0' : '-rotate-90'
                              }`} 
                            />
                            <span className="font-medium text-xs">{category}</span>
                            <Badge variant="secondary" className="text-xs h-4">
                              {nodes.length}
                            </Badge>
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="space-y-1 mt-2">
                        {nodes.map((node) => (
                          <div
                            key={node.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, node.id, node.label)}
                            className="flex items-center gap-2 p-2 ml-3 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-accent/30 cursor-grab active:cursor-grabbing transition-colors"
                          >
                            <div className={`w-6 h-6 rounded-md ${node.color} flex items-center justify-center text-xs`}>
                              {node.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs truncate">{node.label}</div>
                              <div className="text-xs text-muted-foreground truncate">{node.desc}</div>
                            </div>
                            <PlusCircle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="agents" className="mt-0 h-[calc(100%-36px)]">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <AgentConfigurationManager onConfigSelect={() => {}} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="models" className="mt-0 h-[calc(100%-36px)]">
              <div className="p-3">
                <div className="text-xs text-muted-foreground mb-3 p-2 bg-muted/30 rounded-lg">
                  <strong>AI Models:</strong> Select and configure AI models for your workflow
                </div>
                <PromptBasedModelSelector
                  onModelSelect={handleModelSelect}
                  selectedModels={selectedModels}
                />
              </div>
            </TabsContent>

            <TabsContent value="access" className="mt-0 h-[calc(100%-36px)]">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <SecurityAccessManager />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};