import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentActionsManager } from '@/components/agentic/AgentActionsManager';
import { AgentAssignmentOverview } from '@/components/agentic/AgentAssignmentOverview';
import { SystemConnectors } from '@/components/agentic/SystemConnectors';
import { EnhancedConnectorSystem } from '@/components/agentic/enhanced-connector/EnhancedConnectorSystem';
import { KnowledgeBaseManager } from '@/components/agentic/KnowledgeBaseManager';
import { RAGComplianceWorkflow } from '@/components/rag/RAGComplianceWorkflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Info, Plug, Zap, Settings, BookOpen, Database, Brain } from 'lucide-react';
import { AgentAction } from '@/components/agentic/AgentActionsManager';

interface ConsolidatedActionsTabProps {
  sessionId: string;
  actions: AgentAction[];
  onActionsChange: (actions: AgentAction[]) => void;
  agentType?: string;
  agentPurpose?: string;
  agentId?: string;
}

export const ConsolidatedActionsTab: React.FC<ConsolidatedActionsTabProps> = ({
  sessionId,
  actions,
  onActionsChange,
  agentType,
  agentPurpose,
  agentId
}) => {
  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5" />
            Actions & Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete agent configuration: actions, system connectors, knowledge base, and assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            {actions.length} Actions Configured
          </Badge>
        </div>
      </div>

      {/* Unified Configuration Component */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent Configuration</CardTitle>
            <CardDescription>
              Configure actions, connectors, and knowledge base in one unified workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentActionsManager
              onActionsChange={onActionsChange}
              initialActions={actions}
              agentType={agentType}
              agentPurpose={agentPurpose}
              agentId={agentId || sessionId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};