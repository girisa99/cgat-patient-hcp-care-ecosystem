import React, { useState } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Plus, X, Play } from 'lucide-react';

interface Action {
  id: string;
  name: string;
  type: 'api_call' | 'email' | 'sms' | 'webhook' | 'database' | 'notification';
  trigger: 'manual' | 'automatic' | 'conditional';
  config: Record<string, any>;
}

export const ActionsNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [actions, setActions] = useState<Action[]>(data.actions || [
    { 
      id: '1', 
      name: 'Send Welcome Email', 
      type: 'email', 
      trigger: 'automatic',
      config: { template: 'welcome', recipient: '{{user.email}}' }
    }
  ]);
  const [isExpanded, setIsExpanded] = useState(false);

  const addAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      name: 'New Action',
      type: 'api_call',
      trigger: 'manual',
      config: {}
    };
    setActions([...actions, newAction]);
  };

  const updateAction = (id: string, updates: Partial<Action>) => {
    setActions(actions.map(action => action.id === id ? { ...action, ...updates } : action));
  };

  const deleteAction = (id: string) => {
    setActions(actions.filter(action => action.id !== id));
  };

  const getActionColor = (type: Action['type']) => {
    const colors = {
      api_call: 'bg-blue-100 text-blue-800',
      email: 'bg-green-100 text-green-800',
      sms: 'bg-yellow-100 text-yellow-800',
      webhook: 'bg-purple-100 text-purple-800',
      database: 'bg-orange-100 text-orange-800',
      notification: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Zap}
      title="Actions"
      className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {actions.length} Action{actions.length !== 1 ? 's' : ''}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? 'Collapse' : 'Configure'}
          </Button>
        </div>

        {!isExpanded && (
          <div className="space-y-1">
            {actions.map((action) => (
              <div key={action.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Play className="h-3 w-3 text-orange-500 flex-shrink-0" />
                  <span className="text-xs truncate">{action.name}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] px-1 ${getActionColor(action.type)}`}>
                  {action.type.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {actions.map((action) => (
              <div key={action.id} className="p-2 bg-white rounded border space-y-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={action.name}
                    onChange={(e) => updateAction(action.id, { name: e.target.value })}
                    className="h-6 text-xs flex-1 mr-2"
                    placeholder="Action name"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteAction(action.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select value={action.type} onValueChange={(value: any) => updateAction(action.id, { type: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api_call">API Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Trigger</Label>
                    <Select value={action.trigger} onValueChange={(value: any) => updateAction(action.id, { trigger: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="conditional">Conditional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Configuration</Label>
                  <Textarea
                    value={JSON.stringify(action.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        updateAction(action.id, { config });
                      } catch {
                        // Invalid JSON, don't update
                      }
                    }}
                    className="min-h-[60px] text-xs font-mono"
                    placeholder="Action configuration JSON"
                  />
                </div>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={addAction}
              className="w-full h-8 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Action
            </Button>
          </div>
        )}
      </div>
    </BaseWorkflowNode>
  );
};