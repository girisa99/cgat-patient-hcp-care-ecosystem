import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDroppable } from '@dnd-kit/core';
import { 
  MessageSquare, 
  Phone, 
  Globe, 
  Mail, 
  Mic, 
  Instagram,
  MessageCircle,
  Bot,
  Plus,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DeploymentChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
  assignedAgents: string[];
  maxAgents?: number;
  features: string[];
}

interface DeploymentChannelsProps {
  channels: DeploymentChannel[];
  onAddChannel?: () => void;
  onConfigureChannel?: (channelId: string) => void;
}

const DroppableChannel: React.FC<{
  channel: DeploymentChannel;
  onConfigure?: () => void;
}> = ({ channel, onConfigure }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: channel.id,
  });

  const isAtCapacity = channel.maxAgents && channel.assignedAgents.length >= channel.maxAgents;

  return (
    <Card 
      ref={setNodeRef}
      className={`relative transition-all duration-200 ${
        isOver ? 'ring-2 ring-primary bg-primary/5' : ''
      } ${isAtCapacity ? 'opacity-70' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${channel.color}-100 text-${channel.color}-600`}>
              {channel.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{channel.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={channel.isActive ? "default" : "secondary"}>
                  {channel.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {channel.maxAgents && (
                  <Badge variant="outline" className="text-xs">
                    {channel.assignedAgents.length}/{channel.maxAgents}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigure}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{channel.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Features */}
        <div>
          <p className="text-sm font-medium mb-2">Features</p>
          <div className="flex flex-wrap gap-1">
            {channel.features.map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Assigned Agents Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Assigned Agents</span>
          <span className="font-medium">{channel.assignedAgents.length}</span>
        </div>

        {/* Drop Zone Indicator */}
        <div className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-all
          ${isOver 
            ? 'border-primary bg-primary/5 text-primary' 
            : 'border-muted-foreground/20 text-muted-foreground'
          }
          ${isAtCapacity ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <Bot className="h-6 w-6 mx-auto mb-2" />
          <p className="text-sm">
            {isAtCapacity 
              ? 'Channel at capacity' 
              : isOver 
                ? 'Drop agent here' 
                : 'Drag agents here'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const DeploymentChannels: React.FC<DeploymentChannelsProps> = ({
  channels,
  onAddChannel,
  onConfigureChannel
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deployment Channels</h3>
          <p className="text-sm text-muted-foreground">
            Drag agents to channels to configure their deployment
          </p>
        </div>
        {onAddChannel && (
          <Button variant="outline" onClick={onAddChannel} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Channel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <div key={channel.id} className="group">
            <DroppableChannel
              channel={channel}
              onConfigure={() => onConfigureChannel?.(channel.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Default channels configuration
export const defaultChannels: DeploymentChannel[] = [
  {
    id: 'voice-call',
    name: 'Voice Call',
    description: 'Deploy agents for voice interactions and phone calls',
    icon: <Phone className="h-5 w-5" />,
    color: 'blue',
    isActive: true,
    assignedAgents: [],
    maxAgents: 5,
    features: ['Real-time Voice', 'Call Routing', 'Voice Recognition', 'Call Recording']
  },
  {
    id: 'web-chat',
    name: 'Web Chat',
    description: 'Website chat widgets and web-based messaging',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'green',
    isActive: true,
    assignedAgents: [],
    features: ['Live Chat', 'File Sharing', 'Typing Indicators', 'Chat History']
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Email automation and response handling',
    icon: <Mail className="h-5 w-5" />,
    color: 'purple',
    isActive: true,
    assignedAgents: [],
    features: ['Auto-Response', 'Email Templates', 'Attachment Support', 'Threading']
  },
  {
    id: 'voice-assistant',
    name: 'Voice Assistant',
    description: 'Integration with voice assistants and smart speakers',
    icon: <Mic className="h-5 w-5" />,
    color: 'orange',
    isActive: false,
    assignedAgents: [],
    features: ['Wake Words', 'Multi-turn Conversations', 'Smart Home Integration']
  },
  {
    id: 'messaging',
    name: 'Messaging',
    description: 'SMS, WhatsApp, and other messaging platforms',
    icon: <MessageCircle className="h-5 w-5" />,
    color: 'cyan',
    isActive: true,
    assignedAgents: [],
    features: ['SMS', 'WhatsApp', 'Rich Media', 'Group Messaging']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Instagram DMs and social media interactions',
    icon: <Instagram className="h-5 w-5" />,
    color: 'pink',
    isActive: false,
    assignedAgents: [],
    features: ['Direct Messages', 'Story Replies', 'Comment Management', 'Media Sharing']
  }
];