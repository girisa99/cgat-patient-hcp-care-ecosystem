import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, ArrowUp, Phone, Eye, Plus, Trash2 } from 'lucide-react';

interface HumanLoopConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const HumanLoopConfig: React.FC<HumanLoopConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderHumanHandoff = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Human Handoff Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="handoffTrigger"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handoff Trigger *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select handoff trigger" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="manual">👆 Manual Request</SelectItem>
                  <SelectItem value="confidence">📉 Low Confidence Score</SelectItem>
                  <SelectItem value="error">❌ Error Occurred</SelectItem>
                  <SelectItem value="escalation">⬆️ Escalation Required</SelectItem>
                  <SelectItem value="timeout">⏰ Response Timeout</SelectItem>
                  <SelectItem value="keyword">🔍 Keyword Detected</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="handoffQueue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handoff Queue *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select queue" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">👥 General Support</SelectItem>
                  <SelectItem value="technical">🔧 Technical Support</SelectItem>
                  <SelectItem value="sales">💰 Sales Team</SelectItem>
                  <SelectItem value="escalation">⚠️ Escalation Team</SelectItem>
                  <SelectItem value="specialist">🎯 Specialist</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.handoffTrigger === 'confidence' && (
          <FormField
            control={form.control}
            name="confidenceThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confidence Threshold</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="1" placeholder="0.7" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {configuration.handoffTrigger === 'keyword' && (
          <FormField
            control={form.control}
            name="triggerKeywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trigger Keywords</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="human, agent, speak to someone, complaint"
                    rows={2}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="handoffMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handoff Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="I'm connecting you with a human agent who can better assist you."
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="preserveContext"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Preserve Context</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notifyAgent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Notify Agent</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableFeedback"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Feedback</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderAgentTransfer = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-green-500" />
          Agent Transfer Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="transferType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transfer Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transfer type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="warm">🤝 Warm Transfer</SelectItem>
                  <SelectItem value="cold">❄️ Cold Transfer</SelectItem>
                  <SelectItem value="escalation">⬆️ Escalation Transfer</SelectItem>
                  <SelectItem value="skill-based">🎯 Skill-Based Routing</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetAgent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Agent/Queue</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="available">✅ Next Available Agent</SelectItem>
                  <SelectItem value="specific">👤 Specific Agent</SelectItem>
                  <SelectItem value="skill-match">🎯 Skill Match</SelectItem>
                  <SelectItem value="round-robin">🔄 Round Robin</SelectItem>
                  <SelectItem value="least-busy">⚡ Least Busy</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.targetAgent === 'specific' && (
          <FormField
            control={form.control}
            name="specificAgentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent ID/Email</FormLabel>
                <FormControl>
                  <Input placeholder="agent@company.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {configuration.targetAgent === 'skill-match' && (
          <FormField
            control={form.control}
            name="requiredSkills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="technical-support, billing, spanish-language"
                    rows={2}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="transferReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transfer Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Customer requested human assistance for complex billing issue"
                  rows={2}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxWaitTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Wait Time (seconds)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="300" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transfer Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'normal'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="normal">🟡 Normal</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="includeTranscript"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Include Chat Transcript</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableSummary"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Generate Summary</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderApprovalWorkflow = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-purple-500" />
          Approval Workflow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="approvalType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approval Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select approval type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="single">👤 Single Approver</SelectItem>
                  <SelectItem value="multiple">👥 Multiple Approvers</SelectItem>
                  <SelectItem value="unanimous">🤝 Unanimous Approval</SelectItem>
                  <SelectItem value="majority">📊 Majority Approval</SelectItem>
                  <SelectItem value="hierarchical">📈 Hierarchical Approval</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="approvalRequest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approval Request *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please approve the customer's refund request for $150.00..."
                  rows={4}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Approvers Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Approvers</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const approvers = configuration.approvers || [];
                onChange({ 
                  ...configuration, 
                  approvers: [...approvers, { id: '', role: 'approver', required: true }] 
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Approver
            </Button>
          </div>
          
          {(configuration.approvers || []).map((approver: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={approver.id || ''}
                  onChange={(e) => {
                    const approvers = [...(configuration.approvers || [])];
                    approvers[index] = { ...approvers[index], id: e.target.value };
                    onChange({ ...configuration, approvers });
                  }}
                  placeholder="Approver ID/Email"
                />
                <Select
                  value={approver.role || 'approver'}
                  onValueChange={(value) => {
                    const approvers = [...(configuration.approvers || [])];
                    approvers[index] = { ...approvers[index], role: value };
                    onChange({ ...configuration, approvers });
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approver">Approver</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                  </SelectContent>
                </Select>
                <Switch
                  checked={approver.required !== false}
                  onCheckedChange={(checked) => {
                    const approvers = [...(configuration.approvers || [])];
                    approvers[index] = { ...approvers[index], required: checked };
                    onChange({ ...configuration, approvers });
                  }}
                />
                <span className="text-sm">Required</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const approvers = [...(configuration.approvers || [])];
                    approvers.splice(index, 1);
                    onChange({ ...configuration, approvers });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="timeoutHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timeout (hours)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="48" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reminderInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder Interval (hours)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="12" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="allowDelegation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Allow Delegation</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireComments"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Require Comments</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Email Notifications</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderEscalationTrigger = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUp className="h-5 w-5 text-red-500" />
          Escalation Trigger Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="escalationCondition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escalation Condition *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select escalation condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="time-based">⏰ Time-Based</SelectItem>
                  <SelectItem value="interaction-count">🔢 Interaction Count</SelectItem>
                  <SelectItem value="customer-request">👤 Customer Request</SelectItem>
                  <SelectItem value="agent-decision">👨‍💼 Agent Decision</SelectItem>
                  <SelectItem value="sentiment">😔 Negative Sentiment</SelectItem>
                  <SelectItem value="keyword">🔍 Keyword Trigger</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.escalationCondition === 'time-based' && (
          <FormField
            control={form.control}
            name="timeThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Threshold (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {configuration.escalationCondition === 'interaction-count' && (
          <FormField
            control={form.control}
            name="interactionThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interaction Threshold</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {configuration.escalationCondition === 'sentiment' && (
          <FormField
            control={form.control}
            name="sentimentThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sentiment Threshold</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="1" placeholder="0.3" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="escalationTarget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escalation Target *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select escalation target" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="supervisor">👔 Supervisor</SelectItem>
                  <SelectItem value="manager">👨‍💼 Manager</SelectItem>
                  <SelectItem value="specialist">🎯 Specialist</SelectItem>
                  <SelectItem value="senior-agent">⭐ Senior Agent</SelectItem>
                  <SelectItem value="escalation-team">🚨 Escalation Team</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="escalationMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escalation Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Let me connect you with a specialist who can better assist you."
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="notifyCustomer"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Notify Customer</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="urgentFlag"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Mark as Urgent</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderSupervisionMode = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-amber-500" />
          Supervision Mode Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="supervisionLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supervision Level *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervision level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monitoring">👀 Monitoring Only</SelectItem>
                  <SelectItem value="review">📋 Review Mode</SelectItem>
                  <SelectItem value="approval">✅ Approval Required</SelectItem>
                  <SelectItem value="collaborative">🤝 Collaborative Mode</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supervisor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supervisor</FormLabel>
              <FormControl>
                <Input placeholder="supervisor@company.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="realTimeAlerts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Real-time Alerts</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recordSessions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Record Sessions</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'human_handoff':
      return renderHumanHandoff();
    case 'agent_transfer':
      return renderAgentTransfer();
    case 'approval_workflow':
      return renderApprovalWorkflow();
    case 'escalation_trigger':
      return renderEscalationTrigger();
    case 'supervision_mode':
      return renderSupervisionMode();
    default:
      return renderHumanHandoff(); // Default fallback
  }
};