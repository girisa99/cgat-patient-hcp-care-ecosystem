import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentActionsManager } from '@/components/agentic/AgentActionsManager';
import { AgentAssignmentOverview } from '@/components/agentic/AgentAssignmentOverview';
import { Target, Info } from 'lucide-react';
import { AgentAction } from '@/components/agentic/AgentActionsManager';

interface ActionsTabProps {
  sessionId: string;
  actions: AgentAction[];
  onActionsChange: (actions: AgentAction[]) => void;
  agentType?: string;
  agentPurpose?: string;
}

export const ActionsTab: React.FC<ActionsTabProps> = ({
  sessionId,
  actions,
  onActionsChange,
  agentType,
  agentPurpose
}) => {
  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5" />
            Actions & Tasks
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure agent actions, assign AI models, and manage task workflows
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          {actions.length} Actions Configured
        </Badge>
      </div>

      {/* Actions Configuration */}
      <AgentActionsManager
        onActionsChange={onActionsChange}
        initialActions={actions}
        agentType={agentType}
        agentPurpose={agentPurpose}
      />

      {/* Assignment Overview */}
      {actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assignment Overview</CardTitle>
            <CardDescription>
              View and manage connector, API, AI model, and MCP assignments for all actions and tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentAssignmentOverview
              sessionId={sessionId}
              actions={actions}
              onAssignmentChange={() => {
                // Refresh could be triggered here if needed
                console.log('Assignments changed');
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};