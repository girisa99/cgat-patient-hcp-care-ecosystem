import React, { useState } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus, X } from 'lucide-react';

export const UseCaseNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState({
    title: data.title || 'New Use Case',
    description: data.description || '',
    objectives: data.objectives || [''],
    stakeholders: data.stakeholders || [''],
    success_criteria: data.success_criteria || ['']
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig({ ...config, ...updates });
  };

  const addListItem = (field: 'objectives' | 'stakeholders' | 'success_criteria') => {
    updateConfig({ [field]: [...config[field], ''] });
  };

  const updateListItem = (field: 'objectives' | 'stakeholders' | 'success_criteria', index: number, value: string) => {
    const updated = [...config[field]];
    updated[index] = value;
    updateConfig({ [field]: updated });
  };

  const removeListItem = (field: 'objectives' | 'stakeholders' | 'success_criteria', index: number) => {
    const updated = config[field].filter((_, i) => i !== index);
    updateConfig({ [field]: updated });
  };

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Lightbulb}
      title="Use Case Definition"
      className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            Use Case
          </Badge>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const detail = { nodeId: id, action: 'ai_enhance', data: config };
                window.dispatchEvent(new CustomEvent('node-action', { detail }));
              }}
              className="h-6 px-2 text-xs"
              title="AI Enhance"
            >
              AI
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const detail = { nodeId: id, action: 'execute', data: config };
                window.dispatchEvent(new CustomEvent('node-action', { detail }));
              }}
              className="h-6 px-2 text-xs"
              title="Execute Actions"
            >
              Actions
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2 text-xs"
            >
              {isExpanded ? 'Collapse' : 'Configure'}
            </Button>
          </div>
        </div>

        {!isExpanded && (
          <div className="space-y-1">
            <div className="text-sm font-medium truncate">{config.title}</div>
            <div className="text-xs text-muted-foreground truncate">{config.description}</div>
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-xs">Title</Label>
              <Input
                value={config.title}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="h-7 text-xs"
                placeholder="Enter use case title"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                className="min-h-[60px] text-xs"
                placeholder="Describe the use case..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Objectives</Label>
              {config.objectives.map((objective, index) => (
                <div key={index} className="flex gap-1">
                  <Input
                    value={objective}
                    onChange={(e) => updateListItem('objectives', index, e.target.value)}
                    className="h-6 text-xs"
                    placeholder="Enter objective"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeListItem('objectives', index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => addListItem('objectives')}
                className="h-6 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Objective
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseWorkflowNode>
  );
};