/**
 * AI Learning Dashboard - Demo Mode Welcome Page
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuickDemo } from '@/hooks/useQuickDemo';
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  PlayCircle,
  BookOpen,
  Settings,
  BarChart3,
  Lightbulb,
  Rocket
} from 'lucide-react';

export const AiLearningDashboard: React.FC = () => {
  const {
    isDemoMode,
    currentLevel,
    learningProgress,
    aiLearningPath,
    getAiData,
    simulateAiInteraction,
    enableDemoMode,
    isLoadingMockData
  } = useQuickDemo();

  const aiModels = getAiData('aiModels');
  const aiWorkflows = getAiData('aiWorkflows');
  const learningModules = getAiData('learningModules');

  if (!isDemoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <Card className="max-w-4xl w-full border-2 border-blue-200 shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-12 h-12" />
              <div>
                <CardTitle className="text-3xl font-bold">Healthcare AI Learning Platform</CardTitle>
                <p className="text-blue-100 mt-2">Explore, Learn, and Experiment with AI in Healthcare</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">🎯 What You'll Learn</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span>AI Model Integration in Healthcare</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span>Building AI Agents for Patient Care</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>AI-Powered Clinical Analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-orange-600" />
                    <span>Workflow Automation with AI</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">🚀 Choose Your Path</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => enableDemoMode('beginner')}
                    className="w-full justify-start bg-green-600 hover:bg-green-700"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Beginner - New to Healthcare AI
                  </Button>
                  <Button 
                    onClick={() => enableDemoMode('intermediate')}
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Intermediate - Some AI Experience
                  </Button>
                  <Button 
                    onClick={() => enableDemoMode('advanced')}
                    className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Advanced - AI Implementation Expert
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-gray-800">💡 Demo Features</h4>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>✅ Realistic healthcare data</div>
                <div>✅ Live AI model testing</div>
                <div>✅ Interactive workflows</div>
                <div>✅ Performance analytics</div>
                <div>✅ Safe experimentation</div>
                <div>✅ No real data affected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Brain className="w-12 h-12" />
              <div>
                <CardTitle className="text-2xl">🤖 AI Learning Mode Active</CardTitle>
                <p className="text-blue-100">Level: {currentLevel} | Progress: {learningProgress}%</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2 bg-white/20 text-white">
                {currentLevel.toUpperCase()}
              </Badge>
              <Progress value={learningProgress} className="w-48 bg-white/20" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Learning Path */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your AI Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            {aiLearningPath.map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  index < Math.floor(aiLearningPath.length * learningProgress / 100) 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <p className="text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Models Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {aiModels.map((model: any, index: number) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                {model.name}
              </CardTitle>
              <Badge variant="outline">{model.type}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accuracy</span>
                  <Badge variant="secondary">{model.accuracy}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium">{model.responseTime}ms</span>
                </div>
                <p className="text-xs text-gray-500">{model.description}</p>
                <div className="flex flex-wrap gap-1">
                  {model.capabilities.map((cap: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Workflows in Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {aiWorkflows.map((workflow: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">{workflow.name}</h4>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span>Processing Time:</span>
                    <span className="font-medium">{workflow.avgProcessingTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Accuracy:</span>
                    <Badge variant="secondary">{workflow.accuracyRate}</Badge>
                  </div>
                </div>
                <Button size="sm" className="w-full" variant="outline">
                  <PlayCircle className="w-4 h-4 mr-1" />
                  Test Workflow
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Interactive Learning Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningModules.map((module: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{module.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>⏱️ {module.duration}</span>
                    <Badge variant={module.difficulty === 'beginner' ? 'default' : module.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                      {module.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button>
                  Start Learning
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};