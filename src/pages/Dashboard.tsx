import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgenticWorkflowBuilder } from '@/components/agentic/AgenticWorkflowBuilder';
import { MultiModalTreatmentHub } from '@/components/agentic/MultiModalTreatmentHub';
import { AgentConnectionStudio } from '@/components/agentic/AgentConnectionStudio';
import { 
  Activity, 
  Bot, 
  Building, 
  Link2, 
  Zap,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Healthcare Agentic API Ecosystem</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive platform for Cell, Gene, Advanced & Personalized treatments with AI orchestration
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Link2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Connected Channels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">247</p>
                <p className="text-xs text-muted-foreground">Conversations Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">99.2%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs defaultValue="connection-studio" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection-studio">
            <Link2 className="h-4 w-4 mr-2" />
            Connection Studio
          </TabsTrigger>
          <TabsTrigger value="workflow-builder">
            <Bot className="h-4 w-4 mr-2" />
            Workflow Builder
          </TabsTrigger>
          <TabsTrigger value="treatment-hub">
            <Activity className="h-4 w-4 mr-2" />
            Treatment Hub
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection-studio" className="space-y-4">
          <AgentConnectionStudio />
        </TabsContent>

        <TabsContent value="workflow-builder" className="space-y-4">
          <AgenticWorkflowBuilder />
        </TabsContent>

        <TabsContent value="treatment-hub" className="space-y-4">
          <MultiModalTreatmentHub />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Platform Analytics & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Agent Performance</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cell Therapy Agent:</span>
                        <span className="text-green-600">98.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gene Therapy Agent:</span>
                        <span className="text-green-600">97.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Personalized Med:</span>
                        <span className="text-green-600">99.1%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Channel Usage</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>WhatsApp:</span>
                        <span>45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SMS:</span>
                        <span>30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Voice:</span>
                        <span>15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alexa:</span>
                        <span>10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Token Usage</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Today:</span>
                        <span>125K tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span>This Week:</span>
                        <span>750K tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Limit:</span>
                        <span>2M tokens</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;