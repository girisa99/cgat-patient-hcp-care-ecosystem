import React, { useState } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowUp, ArrowDown, X, MapPin } from 'lucide-react';

interface JourneyStage {
  id: string;
  title: string;
  description: string;
  duration: number;
  tasks: string[];
}

export const JourneyStagesNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [stages, setStages] = useState<JourneyStage[]>(data.stages || [
    { id: '1', title: 'Discovery', description: 'Initial customer contact', duration: 30, tasks: ['Gather requirements'] }
  ]);
  const [isExpanded, setIsExpanded] = useState(false);

  const addStage = () => {
    const newStage: JourneyStage = {
      id: Date.now().toString(),
      title: 'New Stage',
      description: '',
      duration: 15,
      tasks: []
    };
    setStages([...stages, newStage]);
  };

  const updateStage = (id: string, updates: Partial<JourneyStage>) => {
    setStages(stages.map(stage => stage.id === id ? { ...stage, ...updates } : stage));
  };

  const deleteStage = (id: string) => {
    setStages(stages.filter(stage => stage.id !== id));
  };

  const moveStage = (id: string, direction: 'up' | 'down') => {
    const index = stages.findIndex(stage => stage.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < stages.length - 1)) {
      const newStages = [...stages];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
      setStages(newStages);
    }
  };

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={MapPin}
      title="Journey Stages"
      className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {stages.length} Stage{stages.length !== 1 ? 's' : ''}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>

        {!isExpanded && (
          <div className="text-xs text-muted-foreground">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-2 py-1">
                <div className="w-4 h-4 bg-purple-500 text-white rounded-full flex items-center justify-center text-[10px]">
                  {index + 1}
                </div>
                <span className="truncate">{stage.title}</span>
              </div>
            ))}
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stages.map((stage, index) => (
              <div key={stage.id} className="p-2 bg-white rounded border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <Input
                      value={stage.title}
                      onChange={(e) => updateStage(stage.id, { title: e.target.value })}
                      className="h-6 text-xs font-medium"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveStage(stage.id, 'up')}
                      disabled={index === 0}
                      className="h-5 w-5 p-0"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveStage(stage.id, 'down')}
                      disabled={index === stages.length - 1}
                      className="h-5 w-5 p-0"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteStage(stage.id)}
                      className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={stage.description}
                  onChange={(e) => updateStage(stage.id, { description: e.target.value })}
                  placeholder="Stage description..."
                  className="min-h-[40px] text-xs"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Duration (min)</Label>
                    <Input
                      type="number"
                      value={stage.duration}
                      onChange={(e) => updateStage(stage.id, { duration: parseInt(e.target.value) || 0 })}
                      className="h-6 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={addStage}
              className="w-full h-8 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Stage
            </Button>
          </div>
        )}
      </div>
    </BaseWorkflowNode>
  );
};