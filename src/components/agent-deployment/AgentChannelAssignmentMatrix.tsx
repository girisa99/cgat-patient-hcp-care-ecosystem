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
  CheckCircle,
  Edit,
  Power,
  PowerOff,
  Trash2
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
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showEditChannel, setShowEditChannel] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [channelList, setChannelList] = useState(channels);
  const [newChannel, setNewChannel] = useState({
    id: '',
    name: '',
    type: 'voice-call' as const,
    isActive: true
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

  // Channel management functions
  const handleAddChannel = async () => {
    const channelToAdd = {
      id: newChannel.id,
      name: newChannel.name,
      type: newChannel.type
    };

    setChannelList(prev => [...prev, channelToAdd]);
    setShowAddChannel(false);
    setNewChannel({
      id: '',
      name: '',
      type: 'voice-call' as const,
      isActive: true
    });

    toast({
      title: "Channel Added",
      description: `${newChannel.name} channel has been added successfully.`,
    });
  };

  const handleEditChannel = (channel: any) => {
    setEditingChannel(channel);
    setShowEditChannel(true);
  };

  const handleUpdateChannel = async () => {
    if (!editingChannel) return;

    setChannelList(prev => prev.map(channel => 
      channel.id === editingChannel.id ? editingChannel : channel
    ));

    setShowEditChannel(false);
    setEditingChannel(null);

    toast({
      title: "Channel Updated",
      description: "Channel has been updated successfully.",
    });
  };

  const handleDeactivateChannel = async (channelId: string) => {
    // In a real app, you would mark channel as inactive in database
    toast({
      title: "Channel Deactivated",
      description: "Channel has been deactivated successfully.",
    });
  };

  // Filter out draft agents - only show deployment-ready agents
  const deploymentReadyAgents = agents?.filter(agent => 
    agent.status !== 'draft' && agent.status !== 'in_progress'
  ) || [];

  if (agentsLoading || deploymentsLoading) {
    return <div className="flex justify-center p-8">Loading assignment matrix...</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Agent-Channel Assignment Matrix</span>
          <Button onClick={() => setShowAddChannel(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Channel
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click cells to deploy agents to channels or manage existing deployments
        </p>
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            📋 <strong>Deployment Ready Agents Only:</strong> Only agents with status 'ready_to_deploy' or 'deployed' are shown. 
            Draft agents must be completed and marked as ready before appearing here.
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Agent</TableHead>
                {channelList.map((channel) => {
                  const Icon = channelIcons[channel.type];
                  return (
                    <TableHead key={channel.id} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Icon className="h-4 w-4" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditChannel(channel)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-xs">{channel.name}</span>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {deploymentReadyAgents.length > 0 ? (
                deploymentReadyAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{agent.name}</span>
                        <Badge variant="outline" className="text-xs w-fit">
                          {agent.status}
                        </Badge>
                      </div>
                    </TableCell>
                    {channelList.map((channel) => {
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
                ))
              ) : (
                 <TableRow>
                   <TableCell colSpan={channelList.length + 1} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8" />
                      <p className="text-sm">No deployment-ready agents available</p>
                      <p className="text-xs">Complete agent configuration and mark them as ready to see them here</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
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

      {/* Add Channel Dialog */}
      <Dialog open={showAddChannel} onOpenChange={setShowAddChannel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Channel</DialogTitle>
            <DialogDescription>
              Create a new communication channel for agent deployment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channel-id">Channel ID</Label>
              <Input
                id="channel-id"
                value={newChannel.id}
                onChange={(e) => setNewChannel(prev => ({ ...prev, id: e.target.value }))}
                placeholder="Enter channel ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={newChannel.name}
                onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter channel name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channel-type">Channel Type</Label>
              <Select 
                value={newChannel.type} 
                onValueChange={(value: any) => setNewChannel(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voice-call">Voice Call</SelectItem>
                  <SelectItem value="web-chat">Web Chat</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="messaging">Messaging</SelectItem>
                  <SelectItem value="voice-assistant">Voice Assistant</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddChannel(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddChannel}>
              Add Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Channel Dialog */}
      <Dialog open={showEditChannel} onOpenChange={setShowEditChannel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
            <DialogDescription>
              Update channel configuration and settings.
            </DialogDescription>
          </DialogHeader>
          
          {editingChannel && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-channel-name">Channel Name</Label>
                <Input
                  id="edit-channel-name"
                  value={editingChannel.name}
                  onChange={(e) => setEditingChannel(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter channel name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-channel-type">Channel Type</Label>
                <Select 
                  value={editingChannel.type} 
                  onValueChange={(value: any) => setEditingChannel(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voice-call">Voice Call</SelectItem>
                    <SelectItem value="web-chat">Web Chat</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="messaging">Messaging</SelectItem>
                    <SelectItem value="voice-assistant">Voice Assistant</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleDeactivateChannel(editingChannel.id)}
                >
                  <PowerOff className="h-4 w-4 mr-2" />
                  Deactivate Channel
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditChannel(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateChannel}>
              Update Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};