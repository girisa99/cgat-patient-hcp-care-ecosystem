import React, { useState } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Settings, ChevronRight } from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  type: 'form' | 'selection' | 'confirmation';
  fields: string[];
}

export const WizardNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [wizardConfig, setWizardConfig] = useState({
    name: data.name || 'Setup Wizard',
    type: data.type || 'onboarding',
    steps: data.steps || [
      { id: '1', title: 'Basic Information', type: 'form', fields: ['name', 'email'] },
      { id: '2', title: 'Preferences', type: 'selection', fields: ['theme', 'language'] },
      { id: '3', title: 'Confirmation', type: 'confirmation', fields: [] }
    ] as WizardStep[]
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const updateConfig = (updates: Partial<typeof wizardConfig>) => {
    setWizardConfig({ ...wizardConfig, ...updates });
  };

  const addStep = () => {
    const newStep: WizardStep = {
      id: Date.now().toString(),
      title: 'New Step',
      type: 'form',
      fields: []
    };
    updateConfig({ steps: [...wizardConfig.steps, newStep] });
  };

  const updateStep = (stepId: string, updates: Partial<WizardStep>) => {
    const updatedSteps = wizardConfig.steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );
    updateConfig({ steps: updatedSteps });
  };

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Wand2}
      title="Wizard Flow"
      className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {wizardConfig.steps.length} Steps
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            {isExpanded ? 'Close' : 'Config'}
          </Button>
        </div>

        {!isExpanded && (
          <div className="space-y-2">
            <div className="text-xs font-medium">{wizardConfig.name}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {wizardConfig.steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <span>{step.title}</span>
                  {index < wizardConfig.steps.length - 1 && (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Wizard Name</Label>
                <Input
                  value={wizardConfig.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={wizardConfig.type} onValueChange={(value) => updateConfig({ type: value })}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="configuration">Configuration</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                    <SelectItem value="survey">Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Steps</Label>
              {wizardConfig.steps.map((step, index) => (
                <div key={step.id} className="p-2 bg-white rounded border space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(step.id, { title: e.target.value })}
                      className="h-6 text-xs"
                    />
                  </div>
                  <Select value={step.type} onValueChange={(value: any) => updateStep(step.id, { type: value })}>
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form">Form</SelectItem>
                      <SelectItem value="selection">Selection</SelectItem>
                      <SelectItem value="confirmation">Confirmation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={addStep}
                className="w-full h-6 text-xs"
              >
                Add Step
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseWorkflowNode>
  );
};