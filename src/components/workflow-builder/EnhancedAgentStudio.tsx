import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bot, Settings, MessageSquare, Zap, 
  FileText, Database, Users, Play,
  BarChart3, Shield, Wrench
} from 'lucide-react';
import { AgentActionCreator } from './AgentActionCreator';
import { TopicManager } from './TopicManager';
import { FlowRecordCreator } from './FlowRecordCreator';
import { FlowiseStyleWorkflow } from './FlowiseStyleWorkflow';
import { FlowiseThemeProvider } from './FlowiseTheme';

interface AgentStudioProps {
  initialAgent?: any;
}

export const EnhancedAgentStudio: React.FC<AgentStudioProps> = ({ initialAgent }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showActionCreator, setShowActionCreator] = useState(false);
  const [showFlowCreator, setShowFlowCreator] = useState(false);

  const agentStats = {
    totalActions: 33,
    activeActions: 28,
    topics: 5,
    conversations: 1247,
    successRate: 94.2
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Agent Builder</h1>
                <p className="text-sm text-muted-foreground">Case Manager Agent</p>
              </div>
            </div>
            <Badge variant="secondary">SETUP &gt; AGENT STUDIO</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Activate
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b bg-background px-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="flows">Flows</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full m-0">
              <div className="p-6 space-y-6 h-full overflow-y-auto">
                {/* Enhanced Features Banner */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Enhanced Workflow Builder</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Comprehensive node library • AI questionnaire • CRUD operations • FlowiseAI-style interface
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Agent Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                          <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{agentStats.totalActions}</p>
                          <p className="text-sm text-muted-foreground">Total Actions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                          <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{agentStats.topics}</p>
                          <p className="text-sm text-muted-foreground">Active Topics</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                          <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{agentStats.conversations.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Conversations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                          <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{agentStats.successRate}%</p>
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Quick Actions & Wizards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Dialog open={showActionCreator} onOpenChange={setShowActionCreator}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                          <Zap className="h-6 w-6" />
                          <span>Create New Action</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Agent Action</DialogTitle>
                        </DialogHeader>
                        <AgentActionCreator 
                          onSave={() => setShowActionCreator(false)}
                          onCancel={() => setShowActionCreator(false)}
                        />
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab('topics')}>
                      <MessageSquare className="h-6 w-6" />
                      <span>Manage Topics</span>
                    </Button>

                    <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab('actions')}>
                      <Bot className="h-6 w-6" />
                      <span>Visual Builder</span>
                    </Button>

                    <Dialog open={showFlowCreator} onOpenChange={setShowFlowCreator}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                          <Database className="h-6 w-6" />
                          <span>Flow Designer</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Flow Record</DialogTitle>
                        </DialogHeader>
                        <FlowRecordCreator 
                          onSave={() => setShowFlowCreator(false)}
                          onCancel={() => setShowFlowCreator(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="p-2 rounded bg-blue-100 dark:bg-blue-900">
                          <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Create Experience Session Booking</p>
                          <p className="text-sm text-muted-foreground">Custom Flow • Nov 24, 2024</p>
                        </div>
                        <Badge variant="secondary">Custom</Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="p-2 rounded bg-green-100 dark:bg-green-900">
                          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Case Management Topic Updated</p>
                          <p className="text-sm text-muted-foreground">5 instructions modified</p>
                        </div>
                        <Badge variant="outline">Updated</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="h-full m-0">
              <FlowiseThemeProvider>
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b bg-background">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Visual Workflow Builder</h2>
                        <p className="text-sm text-muted-foreground">
                          Build intelligent agent workflows with comprehensive node library, AI recommendations, and full CRUD operations
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog open={showActionCreator} onOpenChange={setShowActionCreator}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Zap className="h-4 w-4 mr-2" />
                              New Action
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Create Agent Action</DialogTitle>
                            </DialogHeader>
                            <AgentActionCreator 
                              onSave={() => setShowActionCreator(false)}
                              onCancel={() => setShowActionCreator(false)}
                            />
                          </DialogContent>
                        </Dialog>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          Enhanced Canvas
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative">
                    <FlowiseStyleWorkflow />
                  </div>
                </div>
              </FlowiseThemeProvider>
            </TabsContent>

            <TabsContent value="topics" className="h-full m-0">
              <TopicManager />
            </TabsContent>

            <TabsContent value="flows" className="h-full m-0">
              <FlowiseThemeProvider>
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b bg-background">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Advanced Flow Designer</h2>
                        <p className="text-sm text-muted-foreground">
                          Create sophisticated agent flows with LLMs, VLMs, MCP servers, channels, and deployment-ready configurations
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog open={showFlowCreator} onOpenChange={setShowFlowCreator}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Database className="h-4 w-4 mr-2" />
                              New Flow
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Create Flow Record</DialogTitle>
                            </DialogHeader>
                            <FlowRecordCreator 
                              onSave={() => setShowFlowCreator(false)}
                              onCancel={() => setShowFlowCreator(false)}
                            />
                          </DialogContent>
                        </Dialog>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          FlowiseAI Style
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative">
                    <FlowiseStyleWorkflow />
                  </div>
                </div>
              </FlowiseThemeProvider>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};