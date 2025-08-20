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
import { SmartConnectorManager } from './SmartConnectorManager';
import { ContextualGuidance } from './ContextualGuidance';
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
  const [activeTab, setActiveTab] = useState('guidance');
  const [contextualSuggestions, setContextualSuggestions] = useState<any[]>([]);
  const [nextSteps, setNextSteps] = useState<any[]>([]);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [relevantLibraries, setRelevantLibraries] = useState<any[]>([]);
  const { toast } = useToast();

  // Generate contextual suggestions based on current workflow state
  useEffect(() => {
    if (isOpen) {
      generateContextualSuggestions();
      generateNextSteps();
      filterRelevantResources();
    }
  }, [isOpen, selectedNode, nodes, edges, workflowContext]);

  const generateContextualSuggestions = () => {
    const suggestions = [];
    
    // Analyze current workflow state
    if (workflowContext?.stage === 'use-case') {
      suggestions.push({
        type: 'guidance',
        title: 'Define Your Use Case',
        description: 'Start by clearly defining the problem you want to solve',
        action: 'Open Use Case Designer',
        priority: 'high'
      });
    }

    if (workflowContext?.stage === 'journey' && workflowContext?.useCaseData) {
      suggestions.push({
        type: 'assets',
        title: 'Healthcare AI Models Available',
        description: 'Based on your use case, these AI models are recommended',
        assets: ['GPT-4 Medical', 'Clinical Decision Support', 'FHIR Processor'],
        priority: 'high'
      });
    }

    if (selectedNode) {
      // Node-specific suggestions
      const nodeType = selectedNode.type || selectedNode.data?.type;
      switch (nodeType) {
        case 'customer':
        case 'touchpoint':
          suggestions.push({
            type: 'connector',
            title: 'Connect to CRM',
            description: 'Link customer touchpoints to your CRM system',
            connectors: ['Salesforce', 'HubSpot', 'Dynamics'],
            priority: 'medium'
          });
          break;
        case 'decision':
          suggestions.push({
            type: 'variables',
            title: 'Define Decision Variables',
            description: 'Create variables to store decision criteria',
            suggestedVariables: ['decision_score', 'routing_criteria', 'outcome'],
            priority: 'high'
          });
          break;
        case 'agent':
          suggestions.push({
            type: 'ai_model',
            title: 'Enhanced AI Capabilities',
            description: 'Upgrade to specialized healthcare AI models',
            models: ['GPT-4 Turbo', 'Claude-3 Sonnet', 'Healthcare Specialist'],
            priority: 'medium'
          });
          break;
      }
    }

    // Workflow completeness suggestions
    if (nodes.length > 0) {
      const hasDecisionNodes = nodes.some(n => n.type === 'decision');
      const hasAgentNodes = nodes.some(n => n.type === 'agent');
      const hasConnectors = nodes.some(n => n.data?.connectors?.length > 0);

      if (!hasDecisionNodes && nodes.length > 2) {
        suggestions.push({
          type: 'workflow',
          title: 'Add Decision Logic',
          description: 'Your workflow could benefit from decision nodes for routing',
          action: 'Add Decision Node',
          priority: 'medium'
        });
      }

      if (!hasAgentNodes) {
        suggestions.push({
          type: 'workflow',
          title: 'Add AI Agent',
          description: 'Automate tasks with intelligent AI agents',
          action: 'Add Agent Node',
          priority: 'medium'
        });
      }

      if (!hasConnectors) {
        suggestions.push({
          type: 'integration',
          title: 'Connect External Systems',
          description: 'Integrate with your existing systems and data sources',
          action: 'Browse Connectors',
          priority: 'low'
        });
      }
    }

    setContextualSuggestions(suggestions);
  };

  const generateNextSteps = () => {
    const steps = [];
    
    const workflowStage = workflowContext?.stage || 'use-case';
    const workflowType = workflowContext?.type || 'visual';

    // Stage-based next steps
    switch (workflowStage) {
      case 'use-case':
        steps.push(
          { id: 1, title: 'Complete Use Case Definition', status: 'current', description: 'Define problem, users, and expected outcomes' },
          { id: 2, title: 'Design Customer Journey', status: 'next', description: 'Map out the customer interaction flow' },
          { id: 3, title: 'Configure Workflow', status: 'upcoming', description: 'Set up nodes, connections, and logic' },
          { id: 4, title: 'Test & Deploy', status: 'upcoming', description: 'Validate and deploy your workflow' }
        );
        break;
      case 'journey':
        steps.push(
          { id: 1, title: 'Use Case Defined', status: 'completed', description: 'Problem and requirements identified' },
          { id: 2, title: 'Map Journey Stages', status: 'current', description: 'Define each step of the customer journey' },
          { id: 3, title: 'Add Workflow Logic', status: 'next', description: 'Configure nodes and decision points' },
          { id: 4, title: 'Connect Systems', status: 'upcoming', description: 'Integrate with external systems' }
        );
        break;
      case 'wizard':
        steps.push(
          { id: 1, title: 'Journey Mapped', status: 'completed', description: 'Customer journey stages defined' },
          { id: 2, title: 'Configure Nodes', status: 'current', description: 'Set up workflow nodes and connections' },
          { id: 3, title: 'Add Intelligence', status: 'next', description: 'Configure AI models and decision logic' },
          { id: 4, title: 'Test Workflow', status: 'upcoming', description: 'Validate end-to-end functionality' }
        );
        break;
      case 'canvas':
        steps.push(
          { id: 1, title: 'Workflow Designed', status: 'completed', description: 'Basic workflow structure created' },
          { id: 2, title: 'Optimize Performance', status: 'current', description: 'Fine-tune nodes and connections' },
          { id: 3, title: 'Add Monitoring', status: 'next', description: 'Set up analytics and monitoring' },
          { id: 4, title: 'Deploy to Production', status: 'upcoming', description: 'Launch your workflow' }
        );
        break;
    }

    // Node-specific next steps
    if (selectedNode) {
      const nodeSpecificSteps = [];
      const nodeType = selectedNode.type || selectedNode.data?.type;
      
      switch (nodeType) {
        case 'customer':
          nodeSpecificSteps.push(
            { id: 'n1', title: 'Add Customer Data', status: 'next', description: 'Configure customer data fields and validation' },
            { id: 'n2', title: 'Connect CRM', status: 'upcoming', description: 'Link to customer relationship management system' }
          );
          break;
        case 'decision':
          nodeSpecificSteps.push(
            { id: 'n1', title: 'Define Decision Criteria', status: 'next', description: 'Set up rules and conditions for routing' },
            { id: 'n2', title: 'Add Output Paths', status: 'upcoming', description: 'Create branches for different outcomes' }
          );
          break;
        case 'agent':
          nodeSpecificSteps.push(
            { id: 'n1', title: 'Configure AI Model', status: 'next', description: 'Select and configure the AI model' },
            { id: 'n2', title: 'Add Training Data', status: 'upcoming', description: 'Provide domain-specific training data' }
          );
          break;
      }
      
      if (nodeSpecificSteps.length > 0) {
        steps.push(...nodeSpecificSteps);
      }
    }

    setNextSteps(steps);
    onNextStepSuggestion?.(steps);
  };

  const filterRelevantResources = () => {
    // Filter assets based on context
    let relevantAssets = [];
    let relevantDataLibraries = [];

    const domain = workflowContext?.useCaseData?.domain || 'healthcare';
    const nodeType = selectedNode?.type || selectedNode?.data?.type;

    // Domain-specific assets
    if (domain === 'healthcare') {
      relevantAssets = [
        { id: 'gpt4-medical', name: 'GPT-4 Medical Specialist', type: 'ai_model', relevance: 95 },
        { id: 'fhir-connector', name: 'FHIR API Connector', type: 'connector', relevance: 90 },
        { id: 'clinical-kb', name: 'Clinical Knowledge Base', type: 'library', relevance: 85 }
      ];
      
      relevantDataLibraries = [
        { id: 'healthcare-kb', name: 'Healthcare Knowledge Base', type: 'knowledge_base', relevance: 95 },
        { id: 'patient-records', name: 'Patient Records Database', type: 'data_source', relevance: 90 },
        { id: 'drug-interactions', name: 'Drug Interaction Database', type: 'data_source', relevance: 85 }
      ];
    }

    // Node-specific filtering
    if (nodeType) {
      relevantAssets = relevantAssets.filter(asset => {
        switch (nodeType) {
          case 'agent':
            return asset.type === 'ai_model' || asset.type === 'library';
          case 'decision':
            return asset.type === 'connector' || asset.type === 'api';
          case 'touchpoint':
            return asset.type === 'connector' || asset.type === 'integration';
          default:
            return true;
        }
      });
    }

    setAvailableAssets(relevantAssets);
    setRelevantLibraries(relevantDataLibraries);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Generate context-specific content when tab changes
    if (value === 'guidance') {
      generateContextualSuggestions();
      generateNextSteps();
    }
  };

  const handleSuggestionAction = (suggestion: any) => {
    switch (suggestion.type) {
      case 'assets':
        setActiveTab('assets');
        break;
      case 'connector':
        setActiveTab('connectors');
        break;
      case 'variables':
        setActiveTab('variables');
        break;
      case 'ai_model':
        setActiveTab('assets');
        break;
      case 'workflow':
        onSuggestionAccepted?.(suggestion);
        break;
      case 'integration':
        setActiveTab('connectors');
        break;
    }
    
    toast({
      title: "Suggestion Applied",
      description: `Navigated to ${suggestion.title} section`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 top-16 z-40 w-96 h-[calc(100vh-5rem)]">
      <Card className="h-full shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Universal Workflow Manager
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{workflowContext?.type || 'visual'}</Badge>
            <Badge variant="secondary">{workflowContext?.stage || 'canvas'}</Badge>
            {selectedNode && (
              <Badge variant="default" className="text-xs">
                {selectedNode.data?.label || selectedNode.id}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-[calc(100%-5rem)]">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
            <div className="px-4 pb-2">
              <TabsList className="grid w-full grid-cols-6 text-xs">
                <TabsTrigger value="guidance" className="text-xs">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Guide
                </TabsTrigger>
                <TabsTrigger value="assets" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="data" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="variables" className="text-xs">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Variables
                </TabsTrigger>
                <TabsTrigger value="connectors" className="text-xs">
                  <Link className="h-3 w-3 mr-1" />
                  Connect
                </TabsTrigger>
                <TabsTrigger value="suggest" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  AI
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0">
              <TabsContent value="guidance" className="h-full m-0">
                <ScrollArea className="h-full px-4">
                  <ContextualGuidance
                    workflowContext={workflowContext}
                    selectedNode={selectedNode}
                    suggestions={contextualSuggestions}
                    nextSteps={nextSteps}
                    onSuggestionAction={handleSuggestionAction}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="assets" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">Smart Asset Library</span>
                    <Badge variant="secondary" className="text-xs">
                      {availableAssets.length} Relevant
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    AI-filtered assets based on your workflow context and selected node.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <AssetLibraryManager
                    onAssetSelect={onAssetSelect}
                    selectedAssets={[]}
                    mode="select"
                    contextFilter={{
                      domain: workflowContext?.useCaseData?.domain,
                      nodeType: selectedNode?.type,
                      relevantAssets: availableAssets
                    }}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="data" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="font-medium">Contextual Data Libraries</span>
                    <Badge variant="secondary" className="text-xs">
                      {relevantLibraries.length} Suggested
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Data sources and knowledge bases filtered for your specific use case.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <DataLibrarySelector
                    onLibrariesSelect={onDataLibrarySelect}
                    selectedLibraries={[]}
                    mode="select"
                    contextFilter={{
                      domain: workflowContext?.useCaseData?.domain,
                      relevantLibraries: relevantLibraries
                    }}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="variables" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">Workflow Variables</span>
                    <Badge variant="secondary" className="text-xs">Full CRUD</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create, edit, and manage variables with intelligent suggestions.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <VariableEditor
                    variables={[]}
                    onVariablesChange={onVariablesChange}
                    mode="edit"
                    contextSuggestions={contextualSuggestions.filter(s => s.type === 'variables')}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="connectors" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Link className="h-4 w-4 text-primary" />
                    <span className="font-medium">Smart Connectors</span>
                    <Badge variant="secondary" className="text-xs">Universal</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Intelligent connector management with full CRUD operations.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <SmartConnectorManager
                    onConnectorAction={onConnectorAction}
                    workflowContext={workflowContext}
                    selectedNode={selectedNode}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="suggest" className="h-full m-0">
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="font-medium">AI Auto-Suggest</span>
                    <Badge variant="secondary" className="text-xs">Context-Aware</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Intelligent suggestions based on your workflow context and industry best practices.
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-5rem)] px-4">
                  <AutoSuggestConnector
                    selectedNode={selectedNode}
                    onSuggestionAccepted={onSuggestionAccepted}
                    capturedRequirements={workflowContext?.capturedRequirements}
                    workflowContext={workflowContext}
                    contextualSuggestions={contextualSuggestions}
                  />
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};