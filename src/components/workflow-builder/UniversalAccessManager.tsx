import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, FileText, Settings2, Puzzle, Zap, Brain, Link, Package, X, 
  ChevronRight, Plus, Edit, Trash2, ArrowRight, Lightbulb, Target,
  Activity, Workflow, GitBranch, CheckCircle
} from 'lucide-react';
import { AssetLibraryManager } from './AssetLibraryManager';
import { DataLibrarySelector } from './DataLibrarySelector';
import { VariableEditor } from './VariableEditor';
import { AutoSuggestConnector } from './AutoSuggestConnector';
import { SecurityAccessManager } from './SecurityAccessManager';
import { AgentConfigurationManager } from './AgentConfigurationManager';
import { useToast } from '@/hooks/use-toast';

interface UniversalAccessManagerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode?: any;
  nodes?: any[];
  edges?: any[];
  workflowContext?: {
    type: 'visual' | 'manual';
    stage: 'use-case' | 'journey' | 'wizard' | 'canvas';
    useCaseData?: any;
    capturedRequirements?: any;
    journeyStages?: any[];
  };
  onAssetSelect?: (assets: any[]) => void;
  onDataLibrarySelect?: (libraries: any[]) => void;
  onVariablesChange?: (variables: any[]) => void;
  onConnectorAction?: (action: string, data: any) => void;
  onSuggestionAccepted?: (suggestion: any) => void;
  onNextStepSuggestion?: (nextSteps: any[]) => void;
}

export const UniversalAccessManager: React.FC<UniversalAccessManagerProps> = ({
  isOpen,
  onClose,
  selectedNode,
  nodes = [],
  edges = [],
  workflowContext,
  onAssetSelect,
  onDataLibrarySelect,
  onVariablesChange,
  onConnectorAction,
  onSuggestionAccepted,
  onNextStepSuggestion
}) => {
  const [activeTab, setActiveTab] = useState('assets');
  const { toast } = useToast();

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 top-16 z-40 w-96 h-[calc(100vh-5rem)]">
      <Card className="h-full shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Universal Access Manager
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-[calc(100%-4rem)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 pb-2">
              <TabsList className="grid w-full grid-cols-5 text-xs">
                <TabsTrigger value="assets" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="agents" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  Agents
                </TabsTrigger>
                <TabsTrigger value="data" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="security" className="text-xs">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="suggest" className="text-xs">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  AI
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0">
              <TabsContent value="assets" className="h-full m-0">
                <ScrollArea className="h-full px-4">
                  <AssetLibraryManager
                    onAssetSelect={onAssetSelect}
                    selectedAssets={[]}
                    mode="select"
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="agents" className="h-full m-0">
                <ScrollArea className="h-full px-4">
                  <AgentConfigurationManager onConfigSelect={(config) => {
                    onConnectorAction?.('agent-config-selected', config);
                    toast({ title: `${config.name} configuration loaded` });
                  }} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="data" className="h-full m-0">
                <ScrollArea className="h-full px-4">
                  <DataLibrarySelector
                    onLibrariesSelect={onDataLibrarySelect}
                    selectedLibraries={[]}
                    mode="select"
                  />
                  <div className="mt-4">
                    <VariableEditor
                      variables={[]}
                      onVariablesChange={onVariablesChange}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="security" className="h-full m-0">
                <ScrollArea className="h-full px-4">
                  <SecurityAccessManager onPermissionChange={(permission) => {
                    onConnectorAction?.('permission-changed', permission);
                  }} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="suggest" className="h-full m-0">
                <ScrollArea className="h-full px-4">
                  <AutoSuggestConnector
                    selectedNode={selectedNode}
                    onSuggestionAccepted={onSuggestionAccepted || (() => {})}
                    capturedRequirements={workflowContext?.capturedRequirements || {
                      connectors: ['OpenAI', 'Supabase', 'Salesforce'],
                      actions: ['Process', 'Analyze', 'Route'],
                      steps: ['Intake', 'Assessment', 'Action'],
                      integrations: ['CRM', 'Database', 'API']
                    }}
                  />
                  {workflowContext && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-medium mb-2">Workflow Context</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Type: {workflowContext.type}</div>
                        <div>Stage: {workflowContext.stage}</div>
                        <div>Nodes: {nodes.length}</div>
                        <div>Edges: {edges.length}</div>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};