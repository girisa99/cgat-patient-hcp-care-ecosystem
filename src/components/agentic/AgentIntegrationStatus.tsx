import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { useAgentAPIAssignments } from '@/hooks/useAgentAPIAssignments';

interface AgentIntegrationStatusProps {
  sessionId: string;
  sessionData?: any;
}

export const AgentIntegrationStatus: React.FC<AgentIntegrationStatusProps> = ({ 
  sessionId, 
  sessionData 
}) => {
  const { apiAssignments, isLoading } = useAgentAPIAssignments(sessionId);

  const getCompletionProgress = () => {
    const sections = {
      basic_info: sessionData?.basic_info ? 1 : 0,
      canvas: sessionData?.canvas ? 1 : 0,
      actions: sessionData?.actions?.assigned_actions?.length > 0 ? 1 : 0,
      connectors: sessionData?.connectors?.assigned_connectors?.length > 0 || apiAssignments.length > 0 ? 1 : 0,
      knowledge: sessionData?.knowledge?.knowledge_bases?.length > 0 ? 1 : 0,
      rag: sessionData?.rag?.configurations ? 1 : 0
    };
    
    const completed = Object.values(sections).reduce((sum, val) => sum + val, 0);
    const total = Object.keys(sections).length;
    
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const { completed, total, percentage } = getCompletionProgress();

  const getStatusIcon = (hasData: boolean) => {
    if (hasData) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (hasData: boolean) => {
    if (hasData) return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Agent Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Completion</span>
            <span>{completed}/{total} sections</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {/* Section Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(!!sessionData?.basic_info)}
              <span className="text-sm">Basic Information</span>
            </div>
            {getStatusBadge(!!sessionData?.basic_info)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(!!sessionData?.canvas)}
              <span className="text-sm">Agent Canvas</span>
            </div>
            {getStatusBadge(!!sessionData?.canvas)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(sessionData?.actions?.assigned_actions?.length > 0)}
              <span className="text-sm">Actions ({sessionData?.actions?.assigned_actions?.length || 0})</span>
            </div>
            {getStatusBadge(sessionData?.actions?.assigned_actions?.length > 0)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(sessionData?.connectors?.assigned_connectors?.length > 0 || apiAssignments.length > 0)}
              <span className="text-sm">
                Connectors ({(sessionData?.connectors?.assigned_connectors?.length || 0) + apiAssignments.length})
              </span>
            </div>
            {getStatusBadge(sessionData?.connectors?.assigned_connectors?.length > 0 || apiAssignments.length > 0)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(sessionData?.knowledge?.knowledge_bases?.length > 0)}
              <span className="text-sm">Knowledge Base ({sessionData?.knowledge?.knowledge_bases?.length || 0})</span>
            </div>
            {getStatusBadge(sessionData?.knowledge?.knowledge_bases?.length > 0)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(!!sessionData?.rag?.configurations)}
              <span className="text-sm">RAG Configuration</span>
            </div>
            {getStatusBadge(!!sessionData?.rag?.configurations)}
          </div>
        </div>

        {/* API Assignments Status */}
        {apiAssignments.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-800">API Assignments Active</span>
            </div>
            <div className="text-xs text-blue-600">
              {apiAssignments.length} API service{apiAssignments.length !== 1 ? 's' : ''} assigned to tasks
            </div>
          </div>
        )}

        {/* Configuration Tracking */}
        {sessionData?.connectors?.configurations && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-800">Connector Settings Saved</span>
            </div>
            <div className="text-xs text-green-600">
              Auto-suggest: {sessionData.connectors.configurations.autoSuggestMode ? 'Enabled' : 'Disabled'}
              {sessionData.connectors.configurations.tokenThreshold && 
                ` | Threshold: ${(sessionData.connectors.configurations.tokenThreshold * 100).toFixed(0)}%`
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};