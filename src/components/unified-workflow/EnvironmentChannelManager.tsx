import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  Smartphone, 
  MessageSquare, 
  Phone, 
  Mail, 
  Monitor,
  Settings,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import { DeploymentChannels, defaultChannels } from '@/components/deployment/DeploymentChannels';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useMasterToast } from '@/hooks/useMasterToast';

interface EnvironmentChannelManagerProps {
  onDeploy: (config: any) => void;
  agentId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EnvironmentChannelManager: React.FC<EnvironmentChannelManagerProps> = ({
  onDeploy,
  agentId,
  isOpen,
  onClose
}) => {
  const { showSuccess, showError } = useMasterToast();
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [deploymentProgress, setDeploymentProgress] = useState<Record<string, 'idle' | 'deploying' | 'success' | 'error'>>({});

  // Fetch environments from database
  const { data: environments = [], isLoading: loadingEnvs } = useQuery({
    queryKey: ['deployment-environments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deployment_environments')
        .select('*')
        .eq('status', 'active')
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleDeploy = async () => {
    if (!selectedEnvironment || selectedChannels.length === 0) {
      showError('Please select an environment and at least one channel');
      return;
    }

    const deploymentConfig = {
      environment: selectedEnvironment,
      channels: selectedChannels,
      agentId,
      timestamp: new Date().toISOString()
    };

    try {
      // Simulate deployment progress
      const newProgress: Record<string, 'idle' | 'deploying' | 'success' | 'error'> = {};
      selectedChannels.forEach(channelId => {
        newProgress[channelId] = 'deploying';
      });
      setDeploymentProgress(newProgress);

      // Simulate async deployment
      for (const channelId of selectedChannels) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        setDeploymentProgress(prev => ({
          ...prev,
          [channelId]: Math.random() > 0.1 ? 'success' : 'error'
        }));
      }

      onDeploy(deploymentConfig);
      showSuccess('Deployment completed successfully');
    } catch (error) {
      showError('Deployment failed');
      console.error('Deployment error:', error);
    }
  };

  const getProgressIcon = (status: 'idle' | 'deploying' | 'success' | 'error') => {
    switch (status) {
      case 'deploying':
        return <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <div className="h-4 w-4 bg-red-600 rounded-full" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Deploy to Channels</h2>
              <p className="text-muted-foreground">Choose environment and channels for deployment</p>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="deploy">Deploy</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Environment Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingEnvs ? (
                    <div className="animate-pulse h-10 bg-muted rounded" />
                  ) : (
                    <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select deployment environment" />
                      </SelectTrigger>
                      <SelectContent>
                        {environments.map((env) => (
                          <SelectItem key={env.id} value={env.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{env.name}</span>
                              {env.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="channels" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {defaultChannels.map((channel) => (
                      <Card 
                        key={channel.id} 
                        className={`cursor-pointer transition-all ${
                          selectedChannels.includes(channel.id) 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleChannelToggle(channel.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              {channel.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{channel.name}</div>
                              <div className="text-sm text-muted-foreground">{channel.description}</div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={channel.isActive ? "default" : "secondary"} className="text-xs">
                                  {channel.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {deploymentProgress[channel.id] && (
                                  <div className="flex items-center gap-1">
                                    {getProgressIcon(deploymentProgress[channel.id])}
                                    <span className="text-xs capitalize">{deploymentProgress[channel.id]}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deploy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Environment</h4>
                    {selectedEnvironment ? (
                      <Badge variant="outline">
                        {environments.find(e => e.id === selectedEnvironment)?.name || 'Unknown'}
                      </Badge>
                    ) : (
                      <p className="text-muted-foreground text-sm">No environment selected</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Selected Channels ({selectedChannels.length})</h4>
                    {selectedChannels.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedChannels.map(channelId => {
                          const channel = defaultChannels.find(c => c.id === channelId);
                          return channel ? (
                            <Badge key={channelId} variant="secondary" className="flex items-center gap-1">
                              {channel.icon}
                              {channel.name}
                              {deploymentProgress[channelId] && getProgressIcon(deploymentProgress[channelId])}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No channels selected</p>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleDeploy}
                      disabled={!selectedEnvironment || selectedChannels.length === 0}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Deploy Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};