import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Phone,
  MessageCircle,
  Mail,
  Instagram,
  Mic,
  Globe,
  MoreVertical,
  Users,
  Activity
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeploymentChannel } from './DeploymentChannels';

interface ChannelManagerProps {
  channels: DeploymentChannel[];
  onChannelsChange: (channels: DeploymentChannel[]) => void;
}

export const ChannelManager: React.FC<ChannelManagerProps> = ({
  channels,
  onChannelsChange
}) => {
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  type ChannelType = 'voice' | 'webchat' | 'email' | 'sms' | 'scheduling' | 'uber' | 'web' | 'mobile';
  
  const [newChannel, setNewChannel] = useState<{
    name: string;
    type: ChannelType;
    description: string;
    maxAgents: number;
  }>({
    name: '',
    type: 'voice',
    description: '',
    maxAgents: 5
  });

  const channelTypes = [
    { value: 'voice', label: 'Voice Call', icon: <Phone className="h-4 w-4" /> },
    { value: 'webchat', label: 'Web Chat', icon: <MessageCircle className="h-4 w-4" /> },
    { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'sms', label: 'SMS/Messaging', icon: <MessageCircle className="h-4 w-4" /> },
    { value: 'mobile', label: 'Mobile App', icon: <Mic className="h-4 w-4" /> },
    { value: 'scheduling', label: 'Scheduling', icon: <Instagram className="h-4 w-4" /> },
    { value: 'web', label: 'Website', icon: <Globe className="h-4 w-4" /> },
    { value: 'uber', label: 'Transportation', icon: <Globe className="h-4 w-4" /> }
  ];

  const generateChannelId = (name: string, type: string) => {
    return `${type}-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  };

  const getChannelIcon = (type: string) => {
    const channelType = channelTypes.find(ct => ct.value === type);
    return channelType?.icon || <MessageCircle className="h-4 w-4" />;
  };

  const getChannelColor = (type: string) => {
    const colors = {
      'voice': 'blue',
      'webchat': 'green',
      'email': 'purple',
      'sms': 'orange',
      'mobile': 'pink',
      'scheduling': 'red',
      'web': 'gray',
      'uber': 'yellow'
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  const handleAddChannel = () => {
    if (!newChannel.name.trim()) {
      toast({
        title: "Error",
        description: "Channel name is required",
        variant: "destructive"
      });
      return;
    }

    const channelId = generateChannelId(newChannel.name, newChannel.type);
    const channel: DeploymentChannel = {
      id: channelId,
      name: newChannel.name,
      description: newChannel.description,
      type: newChannel.type,
      icon: getChannelIcon(newChannel.type),
      color: getChannelColor(newChannel.type),
      isActive: true,
      assignedAgents: [],
      maxAgents: newChannel.maxAgents,
      features: getDefaultFeatures(newChannel.type)
    };

    onChannelsChange([...channels, channel]);
    setIsAddChannelOpen(false);
    setNewChannel({ name: '', type: 'voice', description: '', maxAgents: 5 });

    toast({
      title: "Channel Added",
      description: `${newChannel.name} channel has been created successfully`
    });
  };

  const getDefaultFeatures = (type: string): string[] => {
    const featureMap = {
      'voice': ['Real-time Audio', 'Call Recording', 'Hold/Transfer'],
      'webchat': ['Live Chat', 'File Sharing', 'Chat History'],
      'email': ['Auto-Reply', 'Threading', 'Attachments'],
      'sms': ['Quick Replies', 'Rich Media', 'Status Updates'],
      'mobile': ['Push Notifications', 'Offline Support', 'Biometric Auth'],
      'scheduling': ['Calendar Integration', 'Automated Booking', 'Reminders'],
      'web': ['Widget Chat', 'Page Context', 'Form Integration'],
      'uber': ['Real-time Tracking', 'Automated Booking', 'Health Integration']
    };
    return featureMap[type as keyof typeof featureMap] || ['Basic Features'];
  };

  const handleRemoveChannel = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;

    if (channel.assignedAgents.length > 0) {
      if (!confirm(`${channel.name} has ${channel.assignedAgents.length} assigned agents. Are you sure you want to remove it?`)) {
        return;
      }
    }

    onChannelsChange(channels.filter(c => c.id !== channelId));
    
    toast({
      title: "Channel Removed",
      description: `${channel.name} has been removed`
    });
  };

  const handleToggleChannelStatus = (channelId: string) => {
    onChannelsChange(channels.map(channel => 
      channel.id === channelId 
        ? { ...channel, isActive: !channel.isActive }
        : channel
    ));

    const channel = channels.find(c => c.id === channelId);
    toast({
      title: `Channel ${channel?.isActive ? 'Deactivated' : 'Activated'}`,
      description: `${channel?.name} is now ${channel?.isActive ? 'inactive' : 'active'}`
    });
  };

  const handleRemoveAgentFromChannel = (channelId: string, agentId: string) => {
    onChannelsChange(channels.map(channel => 
      channel.id === channelId 
        ? { ...channel, assignedAgents: channel.assignedAgents.filter(id => id !== agentId) }
        : channel
    ));

    const channel = channels.find(c => c.id === channelId);
    toast({
      title: "Agent Removed",
      description: `Agent removed from ${channel?.name} channel`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Channel Management</h3>
          <p className="text-sm text-muted-foreground">
            Add, configure, and manage deployment channels
          </p>
        </div>
        <Dialog open={isAddChannelOpen} onOpenChange={setIsAddChannelOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Channel Name</label>
                <Input
                  placeholder="Enter channel name..."
                  value={newChannel.name}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Channel Type</label>
                <Select value={newChannel.type} onValueChange={(value: ChannelType) => setNewChannel(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Describe the channel..."
                  value={newChannel.description}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Agents</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={newChannel.maxAgents}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, maxAgents: parseInt(e.target.value) || 5 }))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAddChannelOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddChannel}>
                  Add Channel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <Card key={channel.id} className={`${!channel.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-${channel.color}-100 text-${channel.color}-600`}>
                    {channel.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{channel.name}</CardTitle>
                    <Badge variant={channel.isActive ? "default" : "secondary"} className="text-xs">
                      {channel.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggleChannelStatus(channel.id)}>
                      <Activity className="h-4 w-4 mr-2" />
                      {channel.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRemoveChannel(channel.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {channel.description && (
                  <p className="text-sm text-muted-foreground">
                    {channel.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{channel.assignedAgents.length}</span>
                    {channel.maxAgents && (
                      <span className="text-muted-foreground">/ {channel.maxAgents}</span>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    {channel.assignedAgents.length === 0 ? 'No agents' : 
                     channel.assignedAgents.length === 1 ? '1 agent' : 
                     `${channel.assignedAgents.length} agents`}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {channel.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {channel.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{channel.features.length - 3} more
                    </Badge>
                  )}
                </div>

                {channel.assignedAgents.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Assigned Agents:</p>
                    {channel.assignedAgents.slice(0, 2).map((agentId) => (
                      <div key={agentId} className="flex items-center justify-between text-xs">
                        <span>Agent {agentId.slice(0, 8)}...</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveAgentFromChannel(channel.id, agentId)}
                          className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {channel.assignedAgents.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{channel.assignedAgents.length - 2} more agents
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {channels.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No channels configured</h3>
            <p className="text-muted-foreground mb-4">
              Add your first communication channel to start deploying agents
            </p>
            <Button onClick={() => setIsAddChannelOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Channel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};