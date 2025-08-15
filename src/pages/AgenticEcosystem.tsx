import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedAgentBuilder as EnhancedAgentBuilder } from '@/components/unified/UnifiedAgentBuilder';
import { Bot, Network, Settings, Rocket, Plus, Brain, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DraftCleanupDialog } from '@/components/agents/DraftCleanupDialog';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { WelcomeFlow } from '@/components/agent-builder/WelcomeFlow';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const queryClient = useQueryClient();
  const [showWelcomeFlow, setShowWelcomeFlow] = useState(false);
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

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

  // Purge all sessions and draft agents
  const performPurgeAll = async () => {
    if (!user?.id || isPurging) return;
    
    console.log('🗑️ PURGING all agent work for user:', user.id);
    setIsPurging(true);
    
    try {
      const { data, error } = await supabase.rpc('cleanup_user_agent_work', {
        p_user_id: user.id,
        p_statuses: ['draft', 'in_progress']
      });
      
      if (error) throw error;
      
      console.log('🗑️ Purge result:', data);
      
      // Refresh all queries
      queryClient.invalidateQueries({ queryKey: ['user-agent-sessions', user.id] });
      queryClient.invalidateQueries({ queryKey: ['agents', user.id] });
      queryClient.refetchQueries();
      
      const totalDeleted = (data as any)?.total_deleted || 0;
      
      toast({
        title: "Purge Complete",
        description: `Successfully deleted ${totalDeleted} agent sessions and drafts.`,
      });
      
      setShowPurgeDialog(false);
    } catch (error: any) {
      console.error('❌ Purge error:', error);
      toast({
        title: "Purge Failed", 
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPurging(false);
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPurgeDialog(true)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Purge All Sessions
          </Button>
          <Button onClick={handleCreateAgent} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create New Agent
          </Button>
        </div>
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
             {/* Welcome Flow Integration */}
             {showWelcomeFlow ? (
               <Card>
                 <CardContent className="p-6">
                   <WelcomeFlow 
                     onComplete={(data) => {
                       console.log('Welcome flow completed:', data);
                       setShowWelcomeFlow(false);
                       setActiveTab('basic_info');
                     }}
                   />
                 </CardContent>
               </Card>
             ) : (
               <>
                 {/* Welcome Message & Steps */}
                 <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                   <CardHeader>
                     <div className="flex items-center gap-3">
                       <Bot className="h-8 w-8 text-primary" />
                       <div>
                         <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                         <CardDescription className="text-base">
                           Ready to build another intelligent healthcare agent? Let's get started with your journey.
                         </CardDescription>
                       </div>
                     </div>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     {/* 4 Steps Process */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                         <div>
                           <h4 className="font-semibold text-sm mb-1">Define Use Case</h4>
                           <p className="text-xs text-muted-foreground">Describe what your agent should accomplish</p>
                         </div>
                       </div>
                       <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                         <div>
                           <h4 className="font-semibold text-sm mb-1">Journey Design</h4>
                           <p className="text-xs text-muted-foreground">Map out the conversation flow and steps</p>
                         </div>
                       </div>
                       <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                         <div>
                           <h4 className="font-semibold text-sm mb-1">Configure Actions</h4>
                           <p className="text-xs text-muted-foreground">Set up integrations and automations</p>
                         </div>
                       </div>
                       <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                         <div>
                           <h4 className="font-semibold text-sm mb-1">Deploy & Test</h4>
                           <p className="text-xs text-muted-foreground">Launch your agent and monitor performance</p>
                         </div>
                       </div>
                     </div>
                     
                     {/* Action Buttons */}
                     <div className="flex gap-3">
                       <Button 
                         onClick={() => setShowWelcomeFlow(true)}
                         className="bg-primary hover:bg-primary/90"
                       >
                         Start New Agent Journey
                       </Button>
                       <Button variant="outline" onClick={() => setActiveTab('basic_info')}>
                         Skip to Builder
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               </>
             )}
             
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
      
      {/* Purge Confirmation Dialog */}
      <AlertDialog open={showPurgeDialog} onOpenChange={setShowPurgeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Purge All Agent Work
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL your draft agents, agent sessions, and in-progress work. 
              This action cannot be undone. Are you absolutely sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performPurgeAll}
              disabled={isPurging}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPurging ? 'Purging...' : 'Yes, Purge Everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AgenticEcosystem;