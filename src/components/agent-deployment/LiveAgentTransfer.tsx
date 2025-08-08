import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Phone, 
  MessageCircle, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import { useApiServiceConfigurations } from '@/hooks/useApiServiceConfigurations';
import { useToast } from '@/hooks/use-toast';

interface TransferRule {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  transferType: 'human' | 'escalation' | 'department';
  isActive: boolean;
}

const LiveAgentTransfer = () => {
  const { toast } = useToast();
  const { 
    apiServiceConfigurations, 
    createApiServiceConfiguration, 
    updateApiServiceConfiguration,
    isLoading 
  } = useApiServiceConfigurations();

  const [transferConfig, setTransferConfig] = useState({
    enableAutoTransfer: true,
    maxHandoffTime: 30,
    escalationPath: 'supervisor',
    transferMessage: 'Transferring you to a human agent who can better assist you...',
    workingHours: {
      enabled: true,
      start: '09:00',
      end: '17:00',
      timezone: 'UTC'
    }
  });

  const [transferRules, setTransferRules] = useState<TransferRule[]>([
    {
      id: '1',
      name: 'Complex Medical Query',
      trigger: 'sentiment_analysis',
      conditions: ['confidence < 0.7', 'medical_keywords_detected'],
      transferType: 'human',
      isActive: true
    },
    {
      id: '2', 
      name: 'Frustrated Customer',
      trigger: 'sentiment_negative',
      conditions: ['sentiment_score < -0.5', 'repeat_queries > 3'],
      transferType: 'escalation',
      isActive: true
    }
  ]);

  const [newRule, setNewRule] = useState({
    name: '',
    trigger: '',
    conditions: '',
    transferType: 'human' as const,
  });

  const handleSaveConfiguration = async () => {
    try {
      const config = {
        service_name: 'Live Agent Transfer',
        service_type: 'transfer_service',
        configuration: transferConfig,
        is_active: true
      };

      await createApiServiceConfiguration(config);
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const handleTestTransfer = () => {
    toast({
      title: "Transfer Test Initiated",
      description: "Testing live agent transfer workflow with current configuration.",
    });
  };

  const handleAddRule = () => {
    if (!newRule.name || !newRule.trigger) {
      toast({
        title: "Missing Information",
        description: "Please fill in rule name and trigger.",
        variant: "destructive",
      });
      return;
    }

    const rule: TransferRule = {
      id: Date.now().toString(),
      name: newRule.name,
      trigger: newRule.trigger,
      conditions: newRule.conditions.split(',').map(c => c.trim()),
      transferType: newRule.transferType,
      isActive: true
    };

    setTransferRules([...transferRules, rule]);
    setNewRule({ name: '', trigger: '', conditions: '', transferType: 'human' });
    
    toast({
      title: "Transfer Rule Added",
      description: `Successfully added transfer rule: ${rule.name}`,
    });
  };

  const toggleRule = (ruleId: string) => {
    setTransferRules(rules => 
      rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Configuration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Live Agent Transfer Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Transfer Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically transfer to human agents when conditions are met
                  </p>
                </div>
                <Switch
                  checked={transferConfig.enableAutoTransfer}
                  onCheckedChange={(checked) =>
                    setTransferConfig(prev => ({ ...prev, enableAutoTransfer: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handoff-time">Max Handoff Time (seconds)</Label>
                <Input
                  id="handoff-time"
                  type="number"
                  value={transferConfig.maxHandoffTime}
                  onChange={(e) =>
                    setTransferConfig(prev => ({ 
                      ...prev, 
                      maxHandoffTime: parseInt(e.target.value) 
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalation-path">Escalation Path</Label>
                <Select 
                  value={transferConfig.escalationPath}
                  onValueChange={(value) =>
                    setTransferConfig(prev => ({ ...prev, escalationPath: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="department_lead">Department Lead</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-message">Transfer Message</Label>
                <Textarea
                  id="transfer-message"
                  value={transferConfig.transferMessage}
                  onChange={(e) =>
                    setTransferConfig(prev => ({ ...prev, transferMessage: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Working Hours</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enable working hours</span>
                    <Switch
                      checked={transferConfig.workingHours.enabled}
                      onCheckedChange={(checked) =>
                        setTransferConfig(prev => ({
                          ...prev,
                          workingHours: { ...prev.workingHours, enabled: checked }
                        }))
                      }
                    />
                  </div>
                  {transferConfig.workingHours.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={transferConfig.workingHours.start}
                        onChange={(e) =>
                          setTransferConfig(prev => ({
                            ...prev,
                            workingHours: { ...prev.workingHours, start: e.target.value }
                          }))
                        }
                      />
                      <Input
                        type="time"
                        value={transferConfig.workingHours.end}
                        onChange={(e) =>
                          setTransferConfig(prev => ({
                            ...prev,
                            workingHours: { ...prev.workingHours, end: e.target.value }
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Transfer Rules
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Define conditions that trigger automatic transfer to human agents
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Rules */}
          <div className="space-y-3">
            {transferRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Trigger: {rule.trigger} | Type: {rule.transferType}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {rule.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
              </div>
            ))}
          </div>

          {/* Add New Rule */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Add New Transfer Rule</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Complex Medical Query"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-trigger">Trigger</Label>
                  <Select 
                    value={newRule.trigger}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, trigger: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sentiment_analysis">Sentiment Analysis</SelectItem>
                      <SelectItem value="confidence_threshold">Confidence Threshold</SelectItem>
                      <SelectItem value="keyword_detection">Keyword Detection</SelectItem>
                      <SelectItem value="repeat_queries">Repeat Queries</SelectItem>
                      <SelectItem value="user_request">User Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-conditions">Conditions (comma separated)</Label>
                  <Input
                    id="rule-conditions"
                    value={newRule.conditions}
                    onChange={(e) => setNewRule(prev => ({ ...prev, conditions: e.target.value }))}
                    placeholder="e.g., confidence < 0.7, medical_keywords"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-type">Transfer Type</Label>
                  <Select 
                    value={newRule.transferType}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, transferType: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="human">Human Agent</SelectItem>
                      <SelectItem value="escalation">Escalation</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button onClick={handleAddRule} className="mt-4">
              Add Transfer Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSaveConfiguration} className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Save Configuration
        </Button>
        <Button variant="outline" onClick={handleTestTransfer}>
          <Phone className="h-4 w-4 mr-2" />
          Test Transfer Flow
        </Button>
      </div>
    </div>
  );
};

export default LiveAgentTransfer;
