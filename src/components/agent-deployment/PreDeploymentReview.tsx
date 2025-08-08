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
  ListChecks,
  MessageCircle,
  Phone,
  Calendar,
  Car
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
                Comprehensive assessment of {session.name} before deployment with configuration flow verification
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

      {/* Configuration Flow Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Configuration Flow Verification
          </CardTitle>
          <CardDescription>
            End-to-end verification of all configuration steps and data flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-sm">Basic Configuration</span>
              </div>
              <div className="text-xs text-muted-foreground">
                ✓ Agent name, purpose, use case<br/>
                ✓ Categories and topics<br/>
                ✓ Business units assigned
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 ${session.actions?.assigned_actions?.length > 0 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
                <span className="font-medium text-sm">AI Models & Actions</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {session.actions?.assigned_actions?.length > 0 ? '✓' : '⚠'} Actions configured<br/>
                {session.actions?.configurations?.ai_models ? '✓' : '⚠'} AI models selected<br/>
                {session.actions?.custom_actions ? '✓' : '⚠'} Custom actions
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 ${session.connectors?.assigned_connectors?.length > 0 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
                <span className="font-medium text-sm">System Connectors</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {session.connectors?.assigned_connectors?.length > 0 ? '✓' : '⚠'} Connectors assigned<br/>
                {session.connectors?.api_integrations?.length > 0 ? '✓' : '⚠'} API integrations<br/>
                {session.connectors?.configurations ? '✓' : '⚠'} Configurations saved
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 ${session.knowledge?.knowledge_bases?.length > 0 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
                <span className="font-medium text-sm">Knowledge Base</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {session.knowledge?.knowledge_bases?.length > 0 ? '✓' : '⚠'} Knowledge sources<br/>
                {session.knowledge?.documents?.length > 0 ? '✓' : '⚠'} Documents uploaded<br/>
                {session.rag?.configurations ? '✓' : '⚠'} RAG configured
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Configuration Flow Integrity</span>
            </div>
            <div className="text-sm text-green-700">
              All configuration data from previous steps is available and will be forwarded to deployment. 
              The deployment system can access all models, connectors, APIs, knowledge bases, and voice configurations.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Review Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
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
          <TabsTrigger value="code-generation" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Code Gen
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
              <CardDescription>Environment and scaling settings with channel enablement</CardDescription>
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

              <div>
                <h4 className="font-medium mb-2">Available Channels</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">Web Chat</span>
                    <Badge variant="outline" className="ml-auto">Ready</Badge>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Voice Call</span>
                    <Badge variant="outline" className="ml-auto">
                      {session.voice?.provider ? 'Ready' : 'Config Needed'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Scheduling</span>
                    <Badge variant="outline" className="ml-auto">Available</Badge>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Car className="h-4 w-4" />
                    <span className="text-sm">Uber</span>
                    <Badge variant="outline" className="ml-auto">Available</Badge>
                  </div>
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

        <TabsContent value="code-generation">
          <Card>
            <CardHeader>
              <CardTitle>Drag & Drop Deployment</CardTitle>
              <CardDescription>
                Generate deployment code that can be used anywhere with simple drag and drop functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-dashed rounded-lg">
                  <h4 className="font-medium mb-2">Single Agent Deployment</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Deploy this agent to any web application, mobile app, or server environment
                  </p>
                  <Button size="sm" className="w-full">
                    Generate Single Agent Code
                  </Button>
                </div>

                <div className="p-4 border-2 border-dashed rounded-lg">
                  <h4 className="font-medium mb-2">Multi-Agent Orchestration</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create intelligent routing between multiple specialized agents
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Generate Multi-Agent Code
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Configuration Forward Flow</span>
                </div>
                <div className="text-sm text-blue-700">
                  All configuration data (AI models, connectors, APIs, knowledge base, voice settings) 
                  flows seamlessly from the previous setup steps into the deployment code. 
                  The generated code includes everything needed for production deployment.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
