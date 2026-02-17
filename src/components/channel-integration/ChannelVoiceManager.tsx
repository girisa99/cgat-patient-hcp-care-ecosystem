import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Volume2, 
  FileText, 
  Send, 
  Download,
  Upload,
  Phone,
  Monitor,
  Bot
} from 'lucide-react';
import { UniversalVoiceInterface } from '@/components/voice/UniversalVoiceInterface';
import { toast } from 'sonner';

interface ChannelVoiceManagerProps {
  onChannelData?: (channel: string, data: any) => void;
}

export const ChannelVoiceManager: React.FC<ChannelVoiceManagerProps> = ({
  onChannelData
}) => {
  const [activeChannel, setActiveChannel] = useState<'online' | 'pdf' | 'fax' | 'voice'>('online');
  const [channelData, setChannelData] = useState<Record<string, any>>({});

  const channels = [
    {
      id: 'online',
      name: 'Online Forms',
      icon: <Monitor className="h-5 w-5" />,
      description: 'Web-based forms with voice assistance',
      agentTypes: ['conversational', 'structured', 'traditional_form'],
      features: ['Voice guidance', 'Auto-fill', 'Real-time validation']
    },
    {
      id: 'voice',
      name: 'Voice Only',
      icon: <Phone className="h-5 w-5" />,
      description: 'Pure voice interaction for accessibility',
      agentTypes: ['conversational'],
      features: ['Hands-free operation', 'Natural conversation', 'Voice commands']
    },
    {
      id: 'pdf',
      name: 'PDF Processing',
      icon: <FileText className="h-5 w-5" />,
      description: 'Document processing with voice navigation',
      agentTypes: ['pdf', 'conversational'],
      features: ['Voice reading', 'Form filling', 'Navigation commands']
    },
    {
      id: 'fax',
      name: 'Fax Integration',
      icon: <Send className="h-5 w-5" />,
      description: 'Fax processing with voice feedback',
      agentTypes: ['fax'],
      features: ['OCR voice readout', 'Voice dictation', 'Status announcements']
    }
  ];

  const handleChannelDataCapture = (channel: string, data: any) => {
    setChannelData(prev => ({
      ...prev,
      [channel]: { ...prev[channel], ...data }
    }));

    if (onChannelData) {
      onChannelData(channel, data);
    }

    toast.success(`Data captured for ${channel} channel`);
  };

  const downloadChannelData = () => {
    const exportData = {
      channels: channelData,
      activeChannel,
      timestamp: new Date().toISOString(),
      summary: {
        totalChannels: Object.keys(channelData).length,
        activeChannelData: channelData[activeChannel] || {}
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `channel_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Channel data downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Channel Voice Manager</h2>
          <p className="text-muted-foreground">
            Manage voice interactions across all channels and agent types
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            {Object.keys(channelData).length} Active Channels
          </Badge>
          <Button variant="outline" onClick={downloadChannelData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {channels.map((channel) => (
          <Card 
            key={channel.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeChannel === channel.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveChannel(channel.id as any)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {channel.icon}
                <CardTitle className="text-sm">{channel.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-2">{channel.description}</p>
              <div className="space-y-1">
                {channel.features.slice(0, 2).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              {channelData[channel.id] && (
                <Badge variant="outline" className="mt-2 text-xs">
                  Data Available
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {channels.find(c => c.id === activeChannel)?.icon}
            {channels.find(c => c.id === activeChannel)?.name} Voice Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="interface">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="interface">Voice Interface</TabsTrigger>
              <TabsTrigger value="data">Captured Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="interface" className="space-y-4">
              <div className="space-y-4">
                {channels.find(c => c.id === activeChannel)?.agentTypes.map((agentType) => (
                  <Card key={agentType}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">{agentType} Agent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UniversalVoiceInterface
                        agentType={agentType as any}
                        channelType={activeChannel}
                        onDataCapture={(data) => handleChannelDataCapture(`${activeChannel}_${agentType}`, data)}
                        onStatusChange={(status) => {
                          console.log(`${activeChannel}_${agentType} status:`, status);
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4">
              <div className="space-y-4">
                {Object.entries(channelData).filter(([key]) => key.startsWith(activeChannel)).map(([key, data]) => (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {key.replace(`${activeChannel}_`, '').replace('_', ' ')} Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
                
                {Object.keys(channelData).filter(key => key.startsWith(activeChannel)).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No data captured for this channel yet. Try using the voice interface above.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};