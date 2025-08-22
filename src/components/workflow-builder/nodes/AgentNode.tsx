import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Users, ChevronDown, ChevronRight, Settings2, Zap, MessageCircle,
  Save, Play, Pause, Bot, Phone, Mail, Calendar
} from 'lucide-react';

interface AgentNodeProps {
  id: string;
  data: any;
  selected: boolean;
}

export const AgentNode: React.FC<AgentNodeProps> = ({ id, data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [config, setConfig] = useState({
    agentType: data.agentType || 'customer-support',
    name: data.name || 'Customer Support Agent',
    description: data.description || '',
    capabilities: data.capabilities || [],
    channels: data.channels || [],
    workingHours: data.workingHours || '9-5',
    escalationRules: data.escalationRules || [],
    knowledgeBase: data.knowledgeBase || '',
    active: data.active !== false,
  });

  const agentTypes = [
    { value: 'customer-support', label: 'Customer Support', icon: MessageCircle },
    { value: 'sales', label: 'Sales Agent', icon: Users },
    { value: 'technical', label: 'Technical Support', icon: Settings2 },
    { value: 'billing', label: 'Billing Agent', icon: Calendar },
    { value: 'general', label: 'General Assistant', icon: Bot },
  ];

  const availableCapabilities = [
    'Answer FAQs', 'Create Tickets', 'Schedule Appointments', 'Process Refunds',
    'Product Recommendations', 'Order Tracking', 'Account Management', 'Live Chat'
  ];

  const availableChannels = [
    'Web Chat', 'Email', 'SMS', 'Phone', 'Slack', 'Teams', 'WhatsApp', 'Telegram'
  ];

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const selectedAgentType = agentTypes.find(t => t.value === config.agentType);
  const IconComponent = selectedAgentType?.icon || Bot;

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="custom-handle" />
      
      <Card className={`min-w-[280px] ${selected ? 'ring-2 ring-primary' : ''} ${isExpanded ? 'w-[420px]' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded flex items-center justify-center">
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{config.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedAgentType?.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant={config.active ? "default" : "secondary"} className="text-xs">
                {config.active ? 'Online' : 'Offline'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Compact View */}
          {!isExpanded && (
            <div className="space-y-2">
              <div className="text-xs bg-muted/50 rounded p-2">
                <div className="flex justify-between">
                  <span>Capabilities:</span>
                  <span>{config.capabilities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Channels:</span>
                  <span>{config.channels.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hours:</span>
                  <span>{config.workingHours}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Configure
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Test Chat
                </Button>
              </div>
            </div>
          )}

          {/* Expanded Configuration */}
          {isExpanded && (
            <div className="space-y-4">
              {/* Agent Type & Basic Info */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Agent Type</Label>
                  <Select value={config.agentType} onValueChange={(value) => updateConfig({ agentType: value })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agentTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-3 w-3" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Agent Name</Label>
                  <Input
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    className="h-8 text-xs"
                    placeholder="Enter agent name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Description</Label>
                  <Textarea
                    value={config.description}
                    onChange={(e) => updateConfig({ description: e.target.value })}
                    placeholder="Describe what this agent does..."
                    className="text-xs resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              {/* Capabilities */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-8 text-xs">
                    <span className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      Capabilities ({config.capabilities.length})
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <Select onValueChange={(value) => {
                    if (!config.capabilities.includes(value)) {
                      updateConfig({ capabilities: [...config.capabilities, value] });
                    }
                  }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Add capability" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCapabilities.map((capability) => (
                        <SelectItem key={capability} value={capability}>
                          {capability}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1">
                    {config.capabilities.map((capability: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Communication Channels */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-8 text-xs">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-3 w-3" />
                      Channels ({config.channels.length})
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <Select onValueChange={(value) => {
                    if (!config.channels.includes(value)) {
                      updateConfig({ channels: [...config.channels, value] });
                    }
                  }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Add channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChannels.map((channel) => (
                        <SelectItem key={channel} value={channel}>
                          <div className="flex items-center gap-2">
                            {channel === 'Phone' && <Phone className="h-3 w-3" />}
                            {channel === 'Email' && <Mail className="h-3 w-3" />}
                            {channel === 'Web Chat' && <MessageCircle className="h-3 w-3" />}
                            {channel}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1">
                    {config.channels.map((channel: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Working Hours & Escalation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Working Hours</Label>
                  <Select value={config.workingHours} onValueChange={(value) => updateConfig({ workingHours: value })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24/7">24/7</SelectItem>
                      <SelectItem value="9-5">9 AM - 5 PM</SelectItem>
                      <SelectItem value="8-6">8 AM - 6 PM</SelectItem>
                      <SelectItem value="business">Business Hours</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Knowledge Base</Label>
                  <Select value={config.knowledgeBase} onValueChange={(value) => updateConfig({ knowledgeBase: value })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select KB" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Knowledge</SelectItem>
                      <SelectItem value="technical">Technical Docs</SelectItem>
                      <SelectItem value="product">Product Info</SelectItem>
                      <SelectItem value="custom">Custom KB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.active}
                    onCheckedChange={(checked) => updateConfig({ active: checked })}
                  />
                  <Label className="text-xs">Agent Active</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    Deploy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} className="custom-handle" />
    </div>
  );
};