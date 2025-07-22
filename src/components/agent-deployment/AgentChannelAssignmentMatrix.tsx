import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  MessageCircle, 
  Mic, 
  Instagram,
  Plus,
  Settings,
  Play,
  Pause,
  Square,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAgentDeployments } from '@/hooks/useAgentDeployments';
import { useAgentSession } from '@/hooks/useAgentSession';
import { AgentChannelDeployment } from '@/types/agent-deployment';
import { toast } from '@/hooks/use-toast';

interface AgentChannelAssignmentMatrixProps {
  className?: string;
}

const channelIcons = {
  'voice-call': Phone,
  'web-chat': MessageSquare,
  'email': Mail,
  'messaging': MessageCircle,
  'voice-assistant': Mic,
  'instagram': Instagram,
};

const channels = [
  { id: 'voice-call', name: 'Voice Call', type: 'voice-call' as const },
  { id: 'web-chat', name: 'Web Chat', type: 'web-chat' as const },
  { id: 'email', name: 'Email', type: 'email' as const },
  { id: 'messaging', name: 'Messaging', type: 'messaging' as const },
  { id: 'voice-assistant', name: 'Voice Assistant', type: 'voice-assistant' as const },
  { id: 'instagram', name: 'Instagram', type: 'instagram' as const },
];

export const AgentChannelAssignmentMatrix: React.FC<AgentChannelAssignmentMatrixProps> = ({ 
  className 
}) => {
  const { userSessions: agents, isLoading: agentsLoading } = useAgentSession();
  const { 
    deployments, 
    loading: deploymentsLoading, 
    deployAgentToChannel, 
    updateDeploymentStatus,
    removeDeployment 
  } = useAgentDeployments();

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [deployDialog, setDeployDialog] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState({
    priority: 1,
    maxSessions: '',
    autoScaling: false,
  });

  // Get deployment for agent-channel combination
  const getDeployment = (agentId: string, channelId: string) => {
    return deployments.find(d => 
      d.agent_id === agentId && 
      d.channel_id === channelId
    );
  };

  // Get status icon
  const getStatusIcon = (status: AgentChannelDeployment['deployment_status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Play className="h-4 w-4 text-yellow-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Get status color
  const getStatusColor = (status: AgentChannelDeployment['deployment_status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'paused':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'stopped':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  // Handle cell click
  const handleCellClick = (agentId: string, channelId: string) => {
    const deployment = getDeployment(agentId, channelId);
    
    if (deployment) {
      // If deployed, show management options
      setSelectedAgent(agentId);
      setSelectedChannel(channelId);
    } else {
      // If not deployed, open deploy dialog
      setSelectedAgent(agentId);
      setSelectedChannel(channelId);
      setDeployDialog(true);
    }
  };

  // Handle deployment
  const handleDeploy = async () => {
    if (!selectedAgent || !selectedChannel) return;

    try {
      const channel = channels.find(c => c.id === selectedChannel);
      if (!channel) return;

      const config = {
        priority: deploymentConfig.priority,
        auto_scaling: deploymentConfig.autoScaling,
        ...(deploymentConfig.maxSessions && {
          max_concurrent_sessions: parseInt(deploymentConfig.maxSessions)
        }),
      };

      await deployAgentToChannel(
        selectedAgent,
        selectedChannel,
        channel.type,
        config
      );

      setDeployDialog(false);
      resetForm();
    } catch (err) {
      console.error('Deployment error:', err);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedAgent(null);
    setSelectedChannel(null);
    setDeploymentConfig({
      priority: 1,
      maxSessions: '',
      autoScaling: false,
    });
  };

  if (agentsLoading || deploymentsLoading) {
    return <div className="flex justify-center p-8">Loading assignment matrix...</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Agent-Channel Assignment Matrix</CardTitle>
        <p className="text-sm text-muted-foreground">
          Click cells to deploy agents to channels or manage existing deployments
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Agent</TableHead>
                {channels.map((channel) => {
                  const Icon = channelIcons[channel.type];
                  return (
                    <TableHead key={channel.id} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{channel.name}</span>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents?.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span>{agent.name}</span>
                      <Badge variant="outline" className="text-xs w-fit">
                        {agent.status}
                      </Badge>
                    </div>
                  </TableCell>
                  {channels.map((channel) => {
                    const deployment = getDeployment(agent.id, channel.id);
                    return (
                      <TableCell 
                        key={`${agent.id}-${channel.id}`}
                        className="text-center p-2"
                      >
                        <Button
                          variant={deployment ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full h-16 flex flex-col gap-1 relative"
                          onClick={() => handleCellClick(agent.id, channel.id)}
                        >
                          {deployment ? (
                            <>
                              {/* Status indicator dot */}
                              <div 
                                className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getStatusColor(deployment.deployment_status)}`} 
                              />
                              
                              {/* Status icon */}
                              {getStatusIcon(deployment.deployment_status)}
                              
                              {/* Deployment info */}
                              <div className="text-xs">
                                <div>Priority {deployment.priority}</div>
                                {deployment.performance_metrics?.active_sessions !== undefined && (
                                  <div className="text-muted-foreground">
                                    {deployment.performance_metrics.active_sessions} sessions
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Deploy</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Paused</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Failed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span>Stopped</span>
          </div>
        </div>
      </CardContent>

      {/* Deploy Dialog */}
      <Dialog open={deployDialog} onOpenChange={setDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy Agent to Channel</DialogTitle>
            <DialogDescription>
              Configure deployment settings for the agent-channel assignment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={deploymentConfig.priority.toString()} 
                onValueChange={(value) => setDeploymentConfig(prev => ({
                  ...prev, 
                  priority: parseInt(value)
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High (1)</SelectItem>
                  <SelectItem value="2">Medium (2)</SelectItem>
                  <SelectItem value="3">Low (3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-sessions">Max Concurrent Sessions (Optional)</Label>
              <Input
                id="max-sessions"
                type="number"
                placeholder="No limit"
                value={deploymentConfig.maxSessions}
                onChange={(e) => setDeploymentConfig(prev => ({
                  ...prev, 
                  maxSessions: e.target.value
                }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeployDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeploy}>
              Deploy Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};