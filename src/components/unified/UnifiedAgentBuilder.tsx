import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Workflow, 
  Settings, 
  Zap, 
  Brain, 
  Database, 
  Mic, 
  Rocket,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useUnifiedAgentBuilder } from '@/hooks/useUnifiedAgentBuilder';

export const UnifiedAgentBuilder: React.FC = () => {
  const {
    state,
    setState,
    loading,
    error,
    selectUseCase,
    updateUserMode,
    progressToStage,
    syncCanvasToJourney,
    navigateToComponent,
    saveAgent,
    USE_CASE_TEMPLATES
  } = useUnifiedAgentBuilder();

  const [activeTab, setActiveTab] = useState('overview');

  // Smart mode selector
  const renderModeSelector = () => (
    <div className="flex gap-2 mb-6">
      <Button 
        variant={state.user_mode === 'guided' ? 'default' : 'outline'}
        onClick={() => updateUserMode('guided')}
        className="flex items-center gap-2"
      >
        <ArrowRight className="h-4 w-4" />
        Guided Journey
      </Button>
      <Button 
        variant={state.user_mode === 'visual' ? 'default' : 'outline'}
        onClick={() => updateUserMode('visual')}
        className="flex items-center gap-2"
      >
        <Workflow className="h-4 w-4" />
        Visual Canvas
      </Button>
      <Button 
        variant={state.user_mode === 'expert' ? 'default' : 'outline'}
        onClick={() => updateUserMode('expert')}
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Expert Mode
      </Button>
      <Button 
        variant={state.user_mode === 'hybrid' ? 'default' : 'outline'}
        onClick={() => updateUserMode('hybrid')}
        className="flex items-center gap-2"
      >
        <Brain className="h-4 w-4" />
        Smart Hybrid
      </Button>
    </div>
  );

  // Use Case Selection with Templates
  const renderUseCaseSelector = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Choose Your Use Case
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {USE_CASE_TEMPLATES.map((useCase) => (
            <Card 
              key={useCase.id}
              className={`cursor-pointer transition-colors ${
                state.use_case.id === useCase.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
              }`}
              onClick={() => selectUseCase(useCase)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{useCase.name}</h4>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{useCase.category}</Badge>
                    <Badge variant="secondary">{useCase.complexity}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {useCase.recommended_journey.length} stages • {useCase.required_components.length} components
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Smart Suggestions Panel
  const renderSuggestions = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Suggestions
          </div>
          <Badge variant="outline">{state.suggestions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {state.suggestions.slice(0, 3).map((suggestion) => (
            <div key={suggestion.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}>
                    {suggestion.priority}
                  </Badge>
                  <h5 className="font-medium">{suggestion.title}</h5>
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              </div>
              <Button size="sm" onClick={suggestion.action}>
                Apply
              </Button>
            </div>
          ))}
          {state.suggestions.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              All looking good! No suggestions at the moment.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Progress Overview
  const renderProgress = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Agent Completion
          </div>
          <Badge variant="outline">{state.completion_score}%</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={state.completion_score} className="mb-4" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {state.completed_stages.length}
            </div>
            <div className="text-sm text-muted-foreground">Stages Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {state.canvas.nodes.length}
            </div>
            <div className="text-sm text-muted-foreground">Workflow Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {state.actions.assigned_actions.length}
            </div>
            <div className="text-sm text-muted-foreground">Actions Configured</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {state.validation_results.filter(v => v.status === 'error').length}
            </div>
            <div className="text-sm text-muted-foreground">Issues to Fix</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Unified Component Tabs - Simplified version for now
  const renderComponentTabs = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="canvas" className="flex items-center gap-1">
          <Workflow className="h-4 w-4" />
          Canvas
        </TabsTrigger>
        <TabsTrigger value="actions" className="flex items-center gap-1">
          <Zap className="h-4 w-4" />
          Actions
        </TabsTrigger>
        <TabsTrigger value="knowledge" className="flex items-center gap-1">
          <Database className="h-4 w-4" />
          Knowledge
        </TabsTrigger>
        <TabsTrigger value="voice" className="flex items-center gap-1">
          <Mic className="h-4 w-4" />
          Voice
        </TabsTrigger>
        <TabsTrigger value="deploy" className="flex items-center gap-1">
          <Rocket className="h-4 w-4" />
          Deploy
        </TabsTrigger>
        <TabsTrigger value="overview" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          Overview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {renderUseCaseSelector()}
        {renderProgress()}
        {renderSuggestions()}
      </TabsContent>

      <TabsContent value="canvas" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Visual Workflow Canvas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 bg-muted/20 rounded-lg text-center">
              <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Canvas Integration</h3>
              <p className="text-muted-foreground mb-4">
                The visual canvas will be integrated with existing EnhancedAgentCanvas component
              </p>
              <Button onClick={() => syncCanvasToJourney([], [])}>
                Initialize Canvas
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="actions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Actions & Tasks Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 bg-muted/20 rounded-lg text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Actions Integration</h3>
              <p className="text-muted-foreground mb-4">
                Actions will be managed through the unified state system
              </p>
              <p className="text-sm text-muted-foreground">
                Currently configured: {state.actions.assigned_actions.length} actions
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="knowledge" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Knowledge Base & RAG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 bg-muted/20 rounded-lg text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Knowledge Integration</h3>
              <p className="text-muted-foreground mb-4">
                Knowledge sources will be unified with existing EnhancedKnowledgeBase
              </p>
              <p className="text-sm text-muted-foreground">
                Currently configured: {state.knowledge.sources.length} sources
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="voice" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice & Channel Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 bg-muted/20 rounded-lg text-center">
              <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Voice Integration</h3>
              <p className="text-muted-foreground mb-4">
                Voice and channel settings will integrate with existing AgentChannelAssignmentMatrix
              </p>
              <p className="text-sm text-muted-foreground">
                Currently configured: {state.voice_channels.voice_configs.length} voice configs
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="deploy" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Deployment Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 bg-muted/20 rounded-lg text-center">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Deployment Integration</h3>
              <p className="text-muted-foreground mb-4">
                Deployment will integrate with existing DeploymentManagementInterface
              </p>
              <p className="text-sm text-muted-foreground">
                Environment: {state.deployment.environment} • {state.deployment.ai_models.length} models
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Unified Agent Builder</h1>
            <p className="text-muted-foreground">
              {state.name || 'Untitled Agent'} • {state.use_case.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ 
                ...prev, 
                show_suggestions: !prev.show_suggestions 
              }))}
            >
              {state.show_suggestions ? 'Hide' : 'Show'} Suggestions
            </Button>
            <Button onClick={saveAgent} disabled={loading}>
              {loading ? 'Saving...' : 'Save Agent'}
            </Button>
          </div>
        </div>
      </div>

      {renderModeSelector()}

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {renderComponentTabs()}
    </div>
  );
};

export default UnifiedAgentBuilder;