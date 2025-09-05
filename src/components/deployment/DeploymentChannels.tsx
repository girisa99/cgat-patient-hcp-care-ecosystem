import React from 'react';
import { 
  Globe, 
  Smartphone, 
  MessageSquare, 
  Phone, 
  Mail, 
  Monitor,
  Bot,
  Calendar,
  Car
} from 'lucide-react';

export interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'voice' | 'webchat' | 'email' | 'sms' | 'scheduling' | 'uber' | 'web' | 'mobile';
  icon: React.ReactNode;
  isActive: boolean;
  config?: Record<string, any>;
}

export const defaultChannels: Channel[] = [
  {
    id: 'webchat',
    name: 'Web Chat',
    description: 'Real-time chat widget for websites',
    type: 'webchat',
    icon: <MessageSquare className="h-4 w-4" />,
    isActive: true,
    config: {
      theme: 'default',
      position: 'bottom-right'
    }
  },
  {
    id: 'voice',
    name: 'Voice Call',
    description: 'Phone-based voice interactions',
    type: 'voice',
    icon: <Phone className="h-4 w-4" />,
    isActive: true,
    config: {
      provider: 'twilio',
      language: 'en-US'
    }
  },
  {
    id: 'email',
    name: 'Email Support',
    description: 'Email-based customer support',
    type: 'email',
    icon: <Mail className="h-4 w-4" />,
    isActive: true,
    config: {
      autoReply: true,
      signature: 'Healthcare Support Team'
    }
  },
  {
    id: 'sms',
    name: 'SMS/Text',
    description: 'SMS text message support',
    type: 'sms',
    icon: <Smartphone className="h-4 w-4" />,
    isActive: true,
    config: {
      provider: 'twilio',
      shortCode: '12345'
    }
  },
  {
    id: 'mobile',
    name: 'Mobile App',
    description: 'Native mobile application',
    type: 'mobile',
    icon: <Smartphone className="h-4 w-4" />,
    isActive: false,
    config: {
      platform: 'react-native',
      pushNotifications: true
    }
  },
  {
    id: 'web',
    name: 'Web Portal',
    description: 'Patient/provider web portal',
    type: 'web',
    icon: <Globe className="h-4 w-4" />,
    isActive: true,
    config: {
      sso: true,
      responsive: true
    }
  },
  {
    id: 'scheduling',
    name: 'Appointment Scheduling',
    description: 'Automated appointment booking',
    type: 'scheduling',
    icon: <Calendar className="h-4 w-4" />,
    isActive: true,
    config: {
      calendar: 'google',
      timeZone: 'America/New_York'
    }
  },
  {
    id: 'uber',
    name: 'Transportation',
    description: 'Uber Health integration for patient transport',
    type: 'uber',
    icon: <Car className="h-4 w-4" />,
    isActive: false,
    config: {
      service: 'uber-health',
      autoBooking: false
    }
  }
];

interface DeploymentChannelsProps {
  channels?: Channel[];
  onChannelToggle?: (channelId: string) => void;
  selectedChannels?: string[];
}

export const DeploymentChannels: React.FC<DeploymentChannelsProps> = ({
  channels = defaultChannels,
  onChannelToggle,
  selectedChannels = []
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {channels.map((channel) => (
        <div
          key={channel.id}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedChannels.includes(channel.id)
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onChannelToggle?.(channel.id)}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              {channel.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{channel.name}</h4>
              <p className="text-xs text-muted-foreground">{channel.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded ${
              channel.isActive 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {channel.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};