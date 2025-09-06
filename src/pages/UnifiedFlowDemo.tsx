import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealTimeVisualBuilder } from '@/components/integration/RealTimeVisualBuilder';
import { FlowAnalyticsDashboard } from '@/components/analytics/FlowAnalyticsDashboard';
import { AIIntegrationManager } from '@/components/ai/AIIntegrationManager';
import { EnhancedVisualBuilder } from '@/components/builders/EnhancedVisualBuilder';
import { useUnifiedFlow } from '@/hooks/useUnifiedFlow';
import { 
  Workflow, Activity, Brain, BarChart3, 
  Zap, Users, Grid, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export const UnifiedFlowDemo: React.FC = () => {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [userId] = useState(() => 'demo-user-' + Math.random().toString(36).substr(2, 9));
  
  const { state, actions, metrics, insights, isConnected } = useUnifiedFlow(sessionId, userId);

  const handleAIPrompt = async (prompt: string) => {
    try {
      await actions.processAIPrompt(prompt);
      actions.trackAnalytics({
        category: 'flow',
        action: 'ai_prompt_submitted',
        label: 'demo_interaction',
        metadata: { promptLength: prompt.length }
      });
    } catch (error) {
      console.error('Error processing AI prompt:', error);
    }
  };

  const handleTemplateUpdate = async (templateId: string, changes: any) => {
    try {
      await actions.updateTemplate(templateId, changes);
      actions.trackAnalytics({
        category: 'flow',
        action: 'template_updated',
        label: 'demo_interaction',
        metadata: { templateId, changeCount: Object.keys(changes).length }
      });
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleModelChange = (model: string) => {
    actions.trackAnalytics({
      category: 'ai',
      action: 'model_changed',
      label: model,
      metadata: { sessionId }
    });
  };

  const handleSettingsUpdate = (settings: any) => {
    actions.trackAnalytics({
      category: 'ai',
      action: 'settings_updated',
      label: 'configuration',
      metadata: settings
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2">
          <Workflow className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Unified Flow Integration</h1>
          {isConnected && <Badge className="animate-pulse">Live</Badge>}
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the cohesive integration where AI prompts trigger template updates, 
          visual builder changes broadcast real-time events, and analytics track the entire flow.
        </p>
      </motion.div>

      {/* Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Total Events</span>
          </div>
          <div className="text-2xl font-bold">{metrics.totalEvents}</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Prompts</span>
          </div>
          <div className="text-2xl font-bold">{metrics.aiPrompts}</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Grid className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">Templates</span>
          </div>
          <div className="text-2xl font-bold">{metrics.templateUpdates}</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Visual Changes</span>
          </div>
          <div className="text-2xl font-bold">{metrics.visualChanges}</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Completion</span>
          </div>
          <div className="text-2xl font-bold">{metrics.flowCompletionRate}%</div>
        </Card>
      </motion.div>

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Flow Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      insight.severity === 'error' ? 'border-red-500 bg-red-50' :
                      insight.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="font-medium capitalize">{insight.type}</div>
                    <div className="text-sm text-muted-foreground">{insight.message}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="integrated-builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrated-builder" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Real-Time Builder
            </TabsTrigger>
            <TabsTrigger value="ai-integration" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Integration
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="enhanced-builder" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              Enhanced Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrated-builder">
            <RealTimeVisualBuilder
              sessionId={sessionId}
              userId={userId}
              onAIPrompt={handleAIPrompt}
              onTemplateUpdate={handleTemplateUpdate}
            />
          </TabsContent>

          <TabsContent value="ai-integration">
            <AIIntegrationManager
              onModelChange={handleModelChange}
              onSettingsUpdate={handleSettingsUpdate}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <FlowAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="enhanced-builder">
            <EnhancedVisualBuilder
              sessionId={sessionId}
              onSave={(data) => {
                actions.trackAnalytics({
                  category: 'visual',
                  action: 'workflow_saved',
                  label: 'enhanced_builder',
                  metadata: { nodeCount: data?.nodes?.length || 0 }
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 right-4 flex items-center gap-2 bg-card border rounded-lg px-3 py-2 shadow-lg"
      >
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {state.isProcessing && (
          <>
            <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-xs">Processing...</span>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default UnifiedFlowDemo;