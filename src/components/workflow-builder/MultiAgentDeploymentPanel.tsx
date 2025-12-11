/**
 * Multi-Agent Deployment Panel
 * Enables deploying the same agent or agent teams across multiple channels
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Bot,
  Users,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  Smartphone,
  Code,
  Webhook,
  Check,
  Loader2,
  Network,
  Zap
} from 'lucide-react';
import { useMultiAgentCanvasIntegration } from '@/hooks/useMultiAgentCanvasIntegration';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface MultiAgentDeploymentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  primaryAgentId?: string;
  agentName?: string;
}

interface Channel {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

const AVAILABLE_CHANNELS: Channel[] = [
  { id: 'web-chat', name: 'Web Chat', icon: <Globe className="h-4 w-4" />, description: 'Website chat widget', available: true },
  { id: 'voice-call', name: 'Voice Call', icon: <Phone className="h-4 w-4" />, description: 'Telephone IVR system', available: true },
  { id: 'email', name: 'Email', icon: <Mail className="h-4 w-4" />, description: 'Email automation', available: true },
  { id: 'sms', name: 'SMS', icon: <Smartphone className="h-4 w-4" />, description: 'Text messaging', available: true },
  { id: 'whatsapp', name: 'WhatsApp', icon: <MessageSquare className="h-4 w-4" />, description: 'WhatsApp Business', available: true },
  { id: 'api', name: 'REST API', icon: <Code className="h-4 w-4" />, description: 'API integration', available: true },
  { id: 'webhook', name: 'Webhook', icon: <Webhook className="h-4 w-4" />, description: 'Event-driven triggers', available: true },
  { id: 'slack', name: 'Slack', icon: <MessageSquare className="h-4 w-4" />, description: 'Slack integration', available: true },
];

export const MultiAgentDeploymentPanel: React.FC<MultiAgentDeploymentPanelProps> = ({
  isOpen,
  onClose,
  primaryAgentId,
  agentName
}) => {
  const { showSuccess, showError } = useMasterToast();
  const integration = useMultiAgentCanvasIntegration(primaryAgentId);
  
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['web-chat']);
  const [deploymentMode, setDeploymentMode] = useState<'single' | 'team'>('single');
  const [teamName, setTeamName] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(primaryAgentId ? [primaryAgentId] : []);
  const [orchestrationPattern, setOrchestrationPattern] = useState<'hierarchical' | 'peer-to-peer' | 'swarm' | 'pipeline'>('hierarchical');
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResults, setDeploymentResults] = useState<any[]>([]);

  // Load available agents
  useEffect(() => {
    const loadAgents = async () => {
      const { data } = await supabase
        .from('agents')
        .select('id, name, use_case, status')
        .in('status', ['active', 'deployed', 'draft']);
      
      setAvailableAgents(data || []);
    };
    
    if (isOpen) {
      loadAgents();
    }
  }, [isOpen]);

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId)
        ? prev.filter(c => c !== channelId)
        : [...prev, channelId]
    );
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(a => a !== agentId)
        : [...prev, agentId]
    );
  };

  const handleDeploy = async () => {
    if (selectedChannels.length === 0) {
      showError('No Channels', 'Please select at least one channel');
      return;
    }

    if (deploymentMode === 'team' && selectedAgents.length < 2) {
      showError('Team Required', 'Please select at least 2 agents for team deployment');
      return;
    }

    setIsDeploying(true);
    setDeploymentResults([]);

    try {
      if (deploymentMode === 'single' && primaryAgentId) {
        // Single agent, multiple channels
        const results = await integration.deployToMultipleChannels(primaryAgentId, selectedChannels);
        setDeploymentResults(results);
      } else if (deploymentMode === 'team') {
        // Multi-agent team deployment
        const result = await integration.deployMultiAgentTeam({
          agentIds: selectedAgents,
          channels: selectedChannels,
          orchestrationPattern,
          supervisorAgentId: selectedAgents[0],
          sharedTools: ['search', 'analyze', 'validate'],
          teamName: teamName || `Team ${Date.now()}`
        });
        
        setDeploymentResults(result.deployments);
      }

      showSuccess('Deployment Complete', 'Agents deployed successfully');
    } catch (error: any) {
      showError('Deployment Failed', error.message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Multi-Channel Deployment
          </DialogTitle>
          <DialogDescription>
            Deploy {agentName || 'agents'} across multiple channels simultaneously
          </DialogDescription>
        </DialogHeader>

        <Tabs value={deploymentMode} onValueChange={(v) => setDeploymentMode(v as any)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Single Agent
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agent Team
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="single" className="mt-0 space-y-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Selected Agent</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="font-medium">{agentName || 'Current Agent'}</span>
                    <Badge variant="secondary">Primary</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="mt-0 space-y-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Team Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Team Name</Label>
                    <Input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter team name..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Orchestration Pattern</Label>
                    <Select value={orchestrationPattern} onValueChange={(v: any) => setOrchestrationPattern(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hierarchical">Hierarchical (Supervisor → Workers)</SelectItem>
                        <SelectItem value="peer-to-peer">Peer-to-Peer (Equal collaboration)</SelectItem>
                        <SelectItem value="swarm">Swarm (Collective decisions)</SelectItem>
                        <SelectItem value="pipeline">Pipeline (Sequential processing)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Team Members</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {availableAgents.map((agent) => (
                        <div
                          key={agent.id}
                          className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${
                            selectedAgents.includes(agent.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => toggleAgent(agent.id)}
                        >
                          <Checkbox
                            checked={selectedAgents.includes(agent.id)}
                            onCheckedChange={() => toggleAgent(agent.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{agent.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {agent.use_case || 'General'}
                            </div>
                          </div>
                          {selectedAgents[0] === agent.id && (
                            <Badge variant="outline" className="text-xs">Supervisor</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      First selected agent becomes the supervisor
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Channel Selection - Common to both modes */}
            <Card className="mt-4">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Deployment Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_CHANNELS.map((channel) => (
                    <div
                      key={channel.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedChannels.includes(channel.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${!channel.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => channel.available && toggleChannel(channel.id)}
                    >
                      <Checkbox
                        checked={selectedChannels.includes(channel.id)}
                        onCheckedChange={() => channel.available && toggleChannel(channel.id)}
                        disabled={!channel.available}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        {channel.icon}
                        <div>
                          <div className="text-sm font-medium">{channel.name}</div>
                          <div className="text-xs text-muted-foreground">{channel.description}</div>
                        </div>
                      </div>
                      {selectedChannels.includes(channel.id) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deployment Results */}
            {deploymentResults.length > 0 && (
              <Card className="mt-4">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    Deployment Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {deploymentResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">
                          {result.channel || result.channelType}
                        </span>
                        <Badge variant={result.success ? 'default' : 'destructive'}>
                          {result.success ? 'Deployed' : 'Failed'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleDeploy} disabled={isDeploying}>
            {isDeploying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Deploy to {selectedChannels.length} Channel{selectedChannels.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
