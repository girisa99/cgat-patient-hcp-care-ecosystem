import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentSession } from '@/types/agent-session';
import { AgentConfigurationSummary } from './AgentConfigurationSummary';
import { AIModelConfiguration } from './AIModelConfiguration';
import { SystemConnectorsSummary } from './SystemConnectorsSummary';
import { TaskExecutionPlan } from './TaskExecutionPlan';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Bot,
  Brain,
  Zap,
  ListChecks
} from 'lucide-react';

interface PreDeploymentReviewProps {
  session: AgentSession;
}

export const PreDeploymentReview: React.FC<PreDeploymentReviewProps> = ({ session }) => {
  // Calculate readiness score
  const calculateReadinessScore = () => {
    let score = 0;
    let total = 0;
    
    // Basic info completeness (25%)
    total += 25;
    if (session.basic_info?.name && session.basic_info?.purpose && session.basic_info?.use_case) {
      score += 25;
    } else if (session.basic_info?.name) {
      score += 15;
    }
    
    // Canvas configuration (20%)
    total += 20;
    if (session.canvas?.workflow_steps?.length || session.canvas?.name) {
      score += 20;
    }
    
    // Actions configuration (20%)
    total += 20;
    if (session.actions?.assigned_actions?.length || session.actions?.custom_actions?.length) {
      score += 20;
    }
    
    // Connectors configuration (15%)
    total += 15;
    if (session.connectors?.assigned_connectors?.length || session.connectors?.api_integrations?.length) {
      score += 15;
    }
    
    // Knowledge base (10%)
    total += 10;
    if (session.knowledge?.knowledge_bases?.length || session.knowledge?.documents?.length) {
      score += 10;
    }
    
    // RAG configuration (10%)
    total += 10;
    if (session.rag?.configurations || session.rag?.recommendations?.length) {
      score += 10;
    }
    
    return Math.round((score / total) * 100);
  };

  const readinessScore = calculateReadinessScore();
  
  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadinessIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Readiness Score */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6" />
                Pre-Deployment Review
              </CardTitle>
              <CardDescription>
                Comprehensive assessment of {session.name} before deployment
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                {getReadinessIcon(readinessScore)}
                <span className={`text-2xl font-bold ${getReadinessColor(readinessScore)}`}>
                  {readinessScore}%
                </span>
              </div>
              <Badge variant={readinessScore >= 80 ? "default" : readinessScore >= 60 ? "secondary" : "destructive"}>
                {readinessScore >= 80 ? 'Ready to Deploy' : readinessScore >= 60 ? 'Needs Review' : 'Incomplete'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Review Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-models" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="connectors" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Connectors
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Deployment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AgentConfigurationSummary session={session} />
        </TabsContent>

        <TabsContent value="ai-models">
          <AIModelConfiguration session={session} />
        </TabsContent>

        <TabsContent value="connectors">
          <SystemConnectorsSummary session={session} />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskExecutionPlan session={session} />
        </TabsContent>

        <TabsContent value="deployment">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Configuration</CardTitle>
              <CardDescription>Environment and scaling settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Environment</h4>
                  <Badge variant="outline">
                    {session.deployment?.environment || 'Production'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Agent Type</h4>
                  <Badge variant="outline">
                    {session.basic_info?.agent_type || 'Single Agent'}
                  </Badge>
                </div>
              </div>
              
              {session.deployment?.scaling_config && (
                <div>
                  <h4 className="font-medium mb-2">Scaling Configuration</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <pre className="text-sm">
                      {JSON.stringify(session.deployment.scaling_config, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};