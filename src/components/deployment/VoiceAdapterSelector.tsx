import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Phone, 
  Settings, 
  Check, 
  Plus,
  Zap,
  Activity,
  Shield,
  Globe
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAgentDeployments } from '@/hooks/useAgentDeployments';

interface VoiceAdapter {
  id: string;
  name: string;
  provider: string;
  type: 'five9' | 'genesys' | 'avaya' | 'twilio' | 'vonage' | 'voxiplant';
  status: 'active' | 'inactive' | 'connecting' | 'error';
  capabilities: string[];
  region?: string;
  priority?: number;
}

interface VoiceAdapterSelectorProps {
  channelId: string;
  agentId?: string;
  selectedAdapters: string[];
  onAdaptersChange: (adapters: string[]) => void;
}

export const VoiceAdapterSelector: React.FC<VoiceAdapterSelectorProps> = ({
  channelId,
  agentId,
  selectedAdapters,
  onAdaptersChange
}) => {
  const { voiceProviders } = useAgentDeployments();
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [testingAdapter, setTestingAdapter] = useState<string | null>(null);

  // Mock voice adapters based on voice providers
  const voiceAdapters: VoiceAdapter[] = voiceProviders.map(provider => ({
    id: provider.id,
    name: provider.name,
    provider: provider.name,
    type: provider.provider_type,
    status: provider.is_active ? 'active' : 'inactive',
    capabilities: provider.capabilities?.features || ['Voice Calls', 'Recording'],
    region: provider.configuration?.region,
    priority: 1
  }));

  // Additional mock adapters for demonstration
  const additionalAdapters: VoiceAdapter[] = [
    {
      id: 'adapter-1',
      name: 'Primary Five9 Connection',
      provider: 'Five9',
      type: 'five9',
      status: 'active',
      capabilities: ['Inbound Calls', 'Outbound Calls', 'Call Recording', 'Screen Pop'],
      region: 'US-East',
      priority: 1
    },
    {
      id: 'adapter-2',
      name: 'Genesys Cloud Integration',
      provider: 'Genesys',
      type: 'genesys',
      status: 'active',
      capabilities: ['Omnichannel', 'Workforce Management', 'Analytics', 'AI Features'],
      region: 'US-West',
      priority: 2
    },
    {
      id: 'adapter-3',
      name: 'Twilio Flex Setup',
      provider: 'Twilio',
      type: 'twilio',
      status: 'connecting',
      capabilities: ['Programmable Voice', 'SMS', 'Video', 'WebRTC'],
      region: 'Global',
      priority: 3
    },
    {
      id: 'adapter-4',
      name: 'Avaya OneCloud',
      provider: 'Avaya',
      type: 'avaya',
      status: 'inactive',
      capabilities: ['Unified Communications', 'Contact Center', 'Collaboration'],
      region: 'EU-Central',
      priority: 4
    }
  ];

  const allAdapters = [...voiceAdapters, ...additionalAdapters];

  const handleAdapterToggle = (adapterId: string, checked: boolean) => {
    if (checked) {
      onAdaptersChange([...selectedAdapters, adapterId]);
    } else {
      onAdaptersChange(selectedAdapters.filter(id => id !== adapterId));
    }
  };

  const handleTestAdapter = async (adapterId: string) => {
    setTestingAdapter(adapterId);
    
    // Simulate testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTestingAdapter(null);
    toast({
      title: "Adapter Test Complete",
      description: "Connection test successful",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Check className="h-3 w-3" />;
      case 'inactive': return <Activity className="h-3 w-3" />;
      case 'connecting': return <Zap className="h-3 w-3" />;
      case 'error': return <Shield className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
    }
  };

  const getProviderIcon = (type: string) => {
    // You can replace these with actual provider logos
    return <Phone className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Voice Adapters</h4>
          <p className="text-sm text-muted-foreground">
            Select adapters to connect this agent to voice channels
          </p>
        </div>
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Voice Adapter Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Configure priority order and failover settings for selected adapters.
              </div>
              
              {selectedAdapters.map((adapterId, index) => {
                const adapter = allAdapters.find(a => a.id === adapterId);
                if (!adapter) return null;
                
                return (
                  <Card key={adapterId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <div className="flex items-center gap-2">
                            {getProviderIcon(adapter.type)}
                            <span className="font-medium">{adapter.name}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Select defaultValue="primary">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="backup">Backup</SelectItem>
                              <SelectItem value="load-balance">Load Balance</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                  Close
                </Button>
                <Button>
                  Save Configuration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {allAdapters.map((adapter) => {
          const isSelected = selectedAdapters.includes(adapter.id);
          const isTesting = testingAdapter === adapter.id;
          
          return (
            <Card key={adapter.id} className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleAdapterToggle(adapter.id, checked as boolean)}
                  />
                  
                  <div className="flex items-center gap-2">
                    {getProviderIcon(adapter.type)}
                    <div>
                      <div className="font-medium">{adapter.name}</div>
                      <div className="text-sm text-muted-foreground">{adapter.provider}</div>
                    </div>
                  </div>
                  
                  <div className="flex-1" />
                  
                  <div className="flex items-center gap-2">
                    {adapter.region && (
                      <Badge variant="outline" className="text-xs">
                        {adapter.region}
                      </Badge>
                    )}
                    
                    <Badge className={`${getStatusColor(adapter.status)} text-xs gap-1`}>
                      {getStatusIcon(adapter.status)}
                      {adapter.status}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestAdapter(adapter.id)}
                      disabled={isTesting}
                      className="gap-1"
                    >
                      {isTesting ? (
                        <>
                          <Activity className="h-3 w-3 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3" />
                          Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {adapter.capabilities.map((capability, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedAdapters.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {selectedAdapters.length} adapter{selectedAdapters.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Agent will use these adapters for voice channel connections with automatic failover.
            </p>
          </CardContent>
        </Card>
      )}

      {allAdapters.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Phone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No voice adapters available. Configure voice providers first.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};