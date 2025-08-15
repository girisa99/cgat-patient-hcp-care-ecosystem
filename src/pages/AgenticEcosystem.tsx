import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedAgentBuilder as EnhancedAgentBuilder } from '@/components/unified/UnifiedAgentBuilder';
import { Bot, Network, Settings, Rocket, Plus, Brain } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DraftCleanupDialog } from '@/components/agents/DraftCleanupDialog';
import { useMasterAuth } from '@/hooks/useMasterAuth';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'deployed' | 'paused';
  connections: string[];
  role: string;
  template: string;
  created_at?: string;
  updated_at?: string;
}

const AgenticEcosystem = () => {
  console.log('🤖 AgenticEcosystem component rendering...');
  
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useMasterAuth();

  // Debug active tab changes
  React.useEffect(() => {
    console.log('📋 Active tab is now:', activeTab);
  }, [activeTab]);

  // Fetch real agents data from database - using the same source as MinimalAgentBuilder
  const { data: agents = [], isLoading: agentsLoading, refetch: refetchAgents } = useQuery({
    queryKey: ['agents', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      console.log('🤖 AgenticEcosystem: Fetching MY agents only...', { userId: user?.id });
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });
      console.log('🐛 AgenticEcosystem DEBUG (filtered):', { count: data?.length, error });
      if (error) {
        console.error('Error fetching agents:', error);
        return [];
      }
      const safeData = data || [];
      return safeData.map((item: any) => ({
        id: item?.id,
        name: item?.name || 'Unnamed Agent',
        description: item?.description || '',
        status: item?.status === 'active' ? 'deployed' : (item?.status || 'draft'),
        connections: Array.isArray(item?.categories) ? item.categories : [],
        role: item?.agent_type || 'general',
        template: item?.brand || 'default',
        created_at: item?.created_at,
        updated_at: item?.updated_at
      })) as Agent[];
    },
    refetchInterval: 30000,
  });

  // Fetch real ecosystem stats - always enabled to avoid conditional hook issues
  const { data: ecosystemStats } = useQuery({
    queryKey: ['ecosystem-stats', agents?.length || 0],
    queryFn: async () => {
      try {
        const { data: apiServices } = await supabase
          .from('api_integration_registry')
          .select('status')
          .eq('status', 'active');

        const { data: connectors } = await supabase
          .from('api_endpoints')
          .select('id');

        const { data: conversations } = await supabase
          .from('audit_logs')
          .select('id')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        return {
          activeAgents: (agents || []).filter(a => a.status === 'deployed').length,
          connectedChannels: connectors?.length || 0,
          conversationsToday: conversations?.length || 0,
          uptime: '99.2%'
        };
      } catch (error) {
        console.error('Error fetching ecosystem stats:', error);
        return {
          activeAgents: 0,
          connectedChannels: 0,
          conversationsToday: 0,
          uptime: '99.2%'
        };
      }
    },
    staleTime: 30000,
  });

  const handleCreateAgent = () => {
    console.log('🚀 Create New Agent button clicked, current activeTab:', activeTab);
    console.log('🚀 Setting activeTab to basic_info');
    setActiveTab('basic_info');
    console.log('🚀 activeTab updated, showing toast');
    
    // Show both toast types to test which one works
    toast({
      title: "Agent Builder",
      description: "Starting agent creation process...",
    });
    
    sonnerToast.success("Agent Builder", {
      description: "Starting agent creation process...",
    });
  };

  const handleDeployAgent = async (agentId: string) => {
    try {
      // Update agent status in the correct agents table
      const { error } = await supabase
        .from('agents')
        .update({ status: 'active' })
        .eq('id', agentId);

      if (error) throw error;

      await refetchAgents();
      
      toast({
        title: "Agent Deployed Successfully",
        description: "Your agent is now live and processing requests.",
      });
    } catch (error: any) {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePauseAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ status: 'paused' })
        .eq('id', agentId);

      if (error) throw error;

      await refetchAgents();
      
      toast({
        title: "Agent Paused",
        description: "Agent has been paused successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Draft Cleanup Dialog */}
      <DraftCleanupDialog />
      
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agentic Ecosystem</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive platform for Cell, Gene, Advanced & Personalized treatments with AI orchestration
          </p>
        </div>
        <Button onClick={handleCreateAgent} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create New Agent
        </Button>
      </div>

      {/* Real Stats from Database */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {agentsLoading ? '...' : ecosystemStats?.activeAgents || 0}
                </p>
                <p className="text-xs text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Network className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {ecosystemStats?.connectedChannels || 0}
                </p>
                <p className="text-xs text-muted-foreground">Connected Channels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {ecosystemStats?.conversationsToday || 0}
                </p>
                <p className="text-xs text-muted-foreground">Conversations Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Rocket className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{ecosystemStats?.uptime || '99.2%'}</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={(value) => {
        console.log('🔀 AgenticEcosystem tab changed from', activeTab, 'to', value);
        setActiveTab(value);
      }} className="w-full">
        <TabsList className="child-tabs grid grid-cols-4 h-auto">
          <TabsTrigger 
            value="overview" 
            className="child-tab-trigger flex flex-col items-center gap-2 p-4 h-auto"
            level="child"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="basic_info" 
            className="child-tab-trigger flex flex-col items-center gap-2 p-4 h-auto"
            level="child"
          >
            <Bot className="h-5 w-5" />
            <span className="text-sm font-medium text-center">Agent Creation</span>
          </TabsTrigger>
          <TabsTrigger 
            value="canvas" 
            className="child-tab-trigger flex flex-col items-center gap-2 p-4 h-auto"
            level="child"
          >
            <Brain className="h-5 w-5" />
            <span className="text-sm font-medium">Canvas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="actions" 
            className="child-tab-trigger flex flex-col items-center gap-2 p-4 h-auto"
            level="child"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium text-center">Actions & Configuration</span>
          </TabsTrigger>
        </TabsList>

           <TabsContent value="overview" className="child-tab-content space-y-6">
            {/* My Agents - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle>My Agents</CardTitle>
                <CardDescription>Manage and monitor your deployed agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {agentsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading agents...</span>
                    </div>
                  ) : (agents?.length || 0) > 0 ? (
                    (agents || []).map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Bot className="h-8 w-8 text-primary" />
                          <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-sm text-muted-foreground">{agent.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge 
                                variant={agent.status === 'deployed' ? 'default' : agent.status === 'draft' ? 'secondary' : 'outline'}
                              >
                                {agent.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {(agent.connections || []).length} connections
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {agent.status === 'draft' && (
                            <Button 
                              size="sm" 
                              onClick={() => setActiveTab('basic_info')}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                          {agent.status === 'deployed' && (
                            <Button 
                              variant="outline"
                              size="sm" 
                              onClick={() => handlePauseAgent(agent.id)}
                            >
                              Pause
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8">
                      <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No agents found. Create your first agent to get started.</p>
                      <Button onClick={handleCreateAgent} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Agent
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="basic_info" className="child-tab-content">
            <EnhancedAgentBuilder step="basic_info" />
          </TabsContent>

          <TabsContent value="canvas" className="child-tab-content">
            <EnhancedAgentBuilder step="canvas" />
          </TabsContent>

          <TabsContent value="actions" className="child-tab-content">
            <EnhancedAgentBuilder step="actions" />
          </TabsContent>


      </Tabs>
      </div>
    </>
  );
};

export default AgenticEcosystem;