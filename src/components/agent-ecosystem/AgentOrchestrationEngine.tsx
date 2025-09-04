import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Workflow, 
  Activity, 
  Play, 
  Pause, 
  Square,
  GitBranch,
  Zap,
  Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AgentCommunication {
  id: string;
  from_agent_id: string;
  to_agent_id?: string;
  message_type: 'request' | 'response' | 'notification' | 'event' | 'handoff';
  message_payload: any;
  conversation_id?: string;
  workflow_execution_id?: string;
  status: 'sent' | 'delivered' | 'processed' | 'failed';
  created_at: string;
  processed_at?: string;
  metadata: any;
}

interface WorkflowExecution {
  id: string;
  workflow_instance_id?: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  started_at: string;
  completed_at?: string;
  triggered_by?: string;
  input_data?: any;
  output_data?: any;
  error_details?: any;
  execution_trace?: any;
  performance_metrics?: any;
  created_at: string;
}

interface AgentOrchestrationEngineProps {
  workflowExecutionId?: string;
}

export const AgentOrchestrationEngine: React.FC<AgentOrchestrationEngineProps> = ({ 
  workflowExecutionId 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [messageType, setMessageType] = useState<AgentCommunication['message_type']>('request');
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch agent communications
  const { data: communications = [], isLoading: commsLoading } = useQuery({
    queryKey: ['agent-communications', workflowExecutionId],
    queryFn: async () => {
      console.log('🔗 Fetching agent communications...');
      
      let query = supabase
        .from('agent_communications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (workflowExecutionId) {
        query = query.eq('workflow_execution_id', workflowExecutionId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as AgentCommunication[];
    },
    refetchInterval: 5000 // Refresh every 5 seconds for real-time feel
  });

  // Fetch workflow executions
  const { data: executions = [], isLoading: executionsLoading } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: async () => {
      console.log('⚡ Fetching workflow executions...');
      
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as WorkflowExecution[];
    }
  });

  // Fetch available agents
  const { data: agents = [] } = useQuery({
    queryKey: ['agents-for-orchestration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, status')
        .eq('status', 'deployed');
      
      if (error) throw error;
      return data;
    }
  });

  // Send agent communication
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      fromAgentId,
      toAgentId,
      messageType,
      messageContent,
      workflowExecutionId
    }: {
      fromAgentId: string;
      toAgentId?: string;
      messageType: AgentCommunication['message_type'];
      messageContent: string;
      workflowExecutionId?: string;
    }) => {
      console.log('📤 Sending agent message:', { fromAgentId, toAgentId, messageType });

      const { data, error } = await supabase
        .from('agent_communications')
        .insert({
          from_agent_id: fromAgentId,
          to_agent_id: toAgentId,
          message_type: messageType,
          message_payload: {
            content: messageContent,
            timestamp: new Date().toISOString(),
            priority: 'normal'
          },
          workflow_execution_id: workflowExecutionId,
          conversation_id: `conv_${Date.now()}`,
          status: 'sent',
          metadata: {
            manual_send: true,
            user_initiated: true
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate message processing
      setTimeout(async () => {
        await supabase
          .from('agent_communications')
          .update({ 
            status: 'processed', 
            processed_at: new Date().toISOString() 
          })
          .eq('id', data.id);
        
        queryClient.invalidateQueries({ queryKey: ['agent-communications'] });
      }, 2000);

      return data;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['agent-communications'] });
      showSuccess('Message Sent', 'Agent communication sent successfully');
    },
    onError: (error: any) => {
      showError('Send Failed', error.message || 'Failed to send agent message');
    }
  });

  // Start workflow execution
  const startWorkflowMutation = useMutation({
    mutationFn: async (workflowConfig: any) => {
      console.log('🚀 Starting workflow execution:', workflowConfig);

      const { data, error } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_instance_id: workflowConfig.workflowId || `workflow_${Date.now()}`,
          status: 'running',
          input_data: workflowConfig,
          execution_trace: {
            started_by: 'orchestration_engine',
            start_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      showSuccess('Workflow Started', 'New workflow execution initiated');
    },
    onError: (error: any) => {
      showError('Start Failed', error.message || 'Failed to start workflow');
    }
  });

  // Control workflow execution
  const controlWorkflowMutation = useMutation({
    mutationFn: async ({
      executionId,
      action
    }: {
      executionId: string;
      action: 'pause' | 'resume' | 'stop';
    }) => {
      console.log('🎮 Controlling workflow:', { executionId, action });

      const newStatus = action === 'pause' ? 'paused' : 
                       action === 'stop' ? 'completed' : 'running';

      const { data, error } = await supabase
        .from('workflow_executions')
        .update({
          status: newStatus,
          completed_at: action === 'stop' ? new Date().toISOString() : null,
          execution_trace: {
            last_action: action,
            action_timestamp: new Date().toISOString()
          }
        })
        .eq('id', executionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      showSuccess('Workflow Updated', `Workflow ${action} successful`);
    },
    onError: (error: any) => {
      showError('Control Failed', error.message || 'Failed to control workflow');
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedAgentId) {
      showError('Invalid Input', 'Please select an agent and enter a message');
      return;
    }

    sendMessageMutation.mutate({
      fromAgentId: selectedAgentId,
      toAgentId: undefined, // Broadcast message
      messageType: messageType,
      messageContent: newMessage,
      workflowExecutionId: workflowExecutionId
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'paused':
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Agent Communication Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Agent Communication Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Send Message Form */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Select Agent...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="request">Request</option>
                <option value="notification">Notification</option>
                <option value="event">Event</option>
                <option value="handoff">Handoff</option>
              </select>
            </div>
            
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter message content..."
              rows={3}
            />
            
            <Button 
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>

          {/* Communications Log */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Recent Communications</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {communications.map((comm) => (
                <div key={comm.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{comm.message_type}</Badge>
                      <Badge className={getStatusColor(comm.status)}>
                        {comm.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(comm.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-sm">
                    {comm.message_payload?.content || 'No content'}
                  </div>
                </div>
              ))}
              {communications.length === 0 && !commsLoading && (
                <div className="text-center text-muted-foreground py-4">
                  No communications yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Execution Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Orchestration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Start Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={() => startWorkflowMutation.mutate({
                workflowId: `workflow_${Date.now()}`,
                startNodeId: 'start'
              })}
              disabled={startWorkflowMutation.isPending}
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Start New
            </Button>
          </div>

          {/* Active Executions */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Active Executions</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {executions.map((execution) => (
                <div key={execution.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(execution.status)}>
                        {execution.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {execution.status === 'running' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => controlWorkflowMutation.mutate({
                              executionId: execution.id,
                              action: 'pause'
                            })}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => controlWorkflowMutation.mutate({
                              executionId: execution.id,
                              action: 'stop'
                            })}
                          >
                            <Square className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {execution.status === 'paused' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => controlWorkflowMutation.mutate({
                            executionId: execution.id,
                            action: 'resume'
                          })}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Started: {new Date(execution.started_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {executions.length === 0 && !executionsLoading && (
                <div className="text-center text-muted-foreground py-4">
                  No active executions
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};