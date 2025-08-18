import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Steps, Step } from '@/components/ui/steps';
import { useJourneyStages, JourneyStage } from '@/hooks/useJourneyStages';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { AISuggestionsPanel } from '@/components/journey/AISuggestionsPanel';
import type { JourneyStep as AIStep } from '@/hooks/useJourneyAISuggestions';

interface JourneyEditorProps {
  templateId: string;
  useCase?: string;
  onApplied?: (stages: JourneyStage[]) => void;
}

export const JourneyEditor: React.FC<JourneyEditorProps> = ({ templateId, useCase, onApplied }) => {
  const { stages, isLoading, createStage, updateStage, deleteStage, reorderStages, refetch } = useJourneyStages(templateId);

  // Local drafts to prevent input resets while typing; save on blur
  const [drafts, setDrafts] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev } as Record<string, any>;
      (stages || []).forEach((s, idx) => {
        const idKey = s.id || `idx-${idx}`;
        if (!next[idKey]) {
          next[idKey] = {
            title: s.title || '',
            owner_role: s.owner_role || '',
            description: s.description || '',
            expected_duration_minutes: s.expected_duration_minutes != null ? String(s.expected_duration_minutes) : '',
            entry_criteria_text: (s.entry_criteria || []).join(', '),
            tasks_checklist_text: (s.tasks_checklist || []).join('\n'),
            outputs_success_criteria_text: (s.outputs_success_criteria || []).join('\n'),
            risks_text: (s.risks || []).join(', '),
            dependencies_text: (s.dependencies || []).join(', '),
            validation_checkpoints_text: (s.validation_checkpoints || []).join('\n'),
          };
        }
      });
      return next;
    });
  }, [stages]);

  const updateDraft = (idKey: string, field: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [idKey]: { ...(prev[idKey] || {}), [field]: value } }));
  };

  const saveDraft = async (idKey: string, s: JourneyStage) => {
    const d = drafts[idKey];
    if (!s.id || !d) return;
    const updates: Partial<JourneyStage> = {
      title: d.title,
      owner_role: d.owner_role || null,
      description: d.description || null,
      expected_duration_minutes: d.expected_duration_minutes ? Number(d.expected_duration_minutes) : null,
      entry_criteria: (d.entry_criteria_text || '').split(',').map((v: string) => v.trim()).filter(Boolean),
      tasks_checklist: (d.tasks_checklist_text || '').split('\n').map((v: string) => v.trim()).filter(Boolean),
      outputs_success_criteria: (d.outputs_success_criteria_text || '').split('\n').map((v: string) => v.trim()).filter(Boolean),
      risks: (d.risks_text || '').split(',').map((v: string) => v.trim()).filter(Boolean),
      dependencies: (d.dependencies_text || '').split(',').map((v: string) => v.trim()).filter(Boolean),
      validation_checkpoints: (d.validation_checkpoints_text || '').split('\n').map((v: string) => v.trim()).filter(Boolean),
    };
    await handleUpdate(s.id, updates);
  };

  const handleAdd = async () => {
    await createStage({ title: 'New Stage' });
    await refetch();
  };

  const handleUpdate = async (id: string, updates: Partial<JourneyStage>) => {
    await updateStage({ id, updates });
  };

  const handleDelete = async (id: string) => {
    await deleteStage(id);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await refetch();
  };
  const handleReorder = async (from: number, to: number) => {
    if (to < 0 || to >= stages.length) return;
    await reorderStages({ fromIndex: from, toIndex: to });
    await refetch();
  };

  const applyAndClose = async () => {
    await refetch();
    onApplied?.(stages);
  };

  // Map an AI suggestion to a journey stage and insert it
  const addAIStep = async (step: AIStep, position?: number) => {
    await createStage({
      title: step.title,
      description: step.description || null,
      owner_role: (step.stakeholders && step.stakeholders[0]) || null,
      entry_criteria: step.requirements || [],
      tasks_checklist: step.actions || [],
      expected_duration_minutes: step.estimatedDuration || null,
      outputs_success_criteria: [],
      risks: step.riskLevel ? [step.riskLevel] : [],
      dependencies: step.dependencies || [],
      validation_checkpoints: [],
      order_index: position ?? stages.length,
    });
    await refetch();
  };

  const addAllAISteps = async (steps: AIStep[]) => {
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      await createStage({
        title: s.title,
        description: s.description || null,
        owner_role: (s.stakeholders && s.stakeholders[0]) || null,
        entry_criteria: s.requirements || [],
        tasks_checklist: s.actions || [],
        expected_duration_minutes: s.estimatedDuration || null,
        outputs_success_criteria: [],
        risks: s.riskLevel ? [s.riskLevel] : [],
        dependencies: s.dependencies || [],
        validation_checkpoints: [],
        order_index: stages.length + i,
      });
    }
    await refetch();
  };
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-base font-medium">Journey Stages</h4>
        <p className="text-sm text-muted-foreground">Define the sequential steps for this template</p>
      </div>

      <div className="w-full overflow-x-auto">
        <Steps className="min-w-max px-2">
          {stages.map((s, idx) => (
            <Step key={s.id || idx} title={`${idx + 1}. ${s.title || 'Stage'}`} description={s.description || ' '} />
          ))}
        </Steps>
      </div>

      {/* AI Suggestions Panel */}
      {useCase && (
        <AISuggestionsPanel
          useCase={useCase}
          onAddStep={addAIStep}
          onAddAllSteps={addAllAISteps}
          currentStepsCount={stages.length}
        />
      )}

      <div className="space-y-3 max-h-[50vh] overflow-auto pr-1">
        {isLoading && <div className="text-sm text-muted-foreground">Loading stages…</div>}
        {!isLoading && stages.length === 0 && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">No stages yet. Add your first stage.</CardContent>
          </Card>
        )}
        {stages.map((s, idx) => (
          <Card key={s.id || idx}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Stage {idx + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleReorder(idx, idx - 1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => handleReorder(idx, idx + 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  {s.id && (
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(s.id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input
                    value={drafts[s.id || String(idx)]?.title ?? (s.title || '')}
                    onChange={(e) => updateDraft(s.id || String(idx), 'title', e.target.value)}
                    onBlur={() => saveDraft(s.id || String(idx), s)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Owner Role</label>
                  <Input
                    value={drafts[s.id || String(idx)]?.owner_role ?? (s.owner_role || '')}
                    onChange={(e) => updateDraft(s.id || String(idx), 'owner_role', e.target.value)}
                    onBlur={() => saveDraft(s.id || String(idx), s)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea
                  value={drafts[s.id || String(idx)]?.description ?? (s.description || '')}
                  onChange={(e) => updateDraft(s.id || String(idx), 'description', e.target.value)}
                  onBlur={() => saveDraft(s.id || String(idx), s)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Expected Duration (min)</label>
                  <Input
                    type="number"
                    value={drafts[s.id || String(idx)]?.expected_duration_minutes ?? (s.expected_duration_minutes != null ? String(s.expected_duration_minutes) : '')}
                    onChange={(e) => updateDraft(s.id || String(idx), 'expected_duration_minutes', e.target.value)}
                    onBlur={() => saveDraft(s.id || String(idx), s)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Entry Criteria (comma-separated)</label>
                  <Input
                    value={drafts[s.id || String(idx)]?.entry_criteria_text ?? (s.entry_criteria || []).join(', ')}
                    onChange={(e) => updateDraft(s.id || String(idx), 'entry_criteria_text', e.target.value)}
                    onBlur={() => saveDraft(s.id || String(idx), s)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tasks Checklist (one per line)</label>
                <Textarea
                  value={drafts[s.id || String(idx)]?.tasks_checklist_text ?? (s.tasks_checklist || []).join('\n')}
                  onChange={(e) => updateDraft(s.id || String(idx), 'tasks_checklist_text', e.target.value)}
                  onBlur={() => saveDraft(s.id || String(idx), s)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Outputs / Success Criteria (one per line)</label>
                <Textarea
                  value={drafts[s.id || String(idx)]?.outputs_success_criteria_text ?? (s.outputs_success_criteria || []).join('\n')}
                  onChange={(e) => updateDraft(s.id || String(idx), 'outputs_success_criteria_text', e.target.value)}
                  onBlur={() => saveDraft(s.id || String(idx), s)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Risks (comma-separated)</label>
                  <Input
                    value={drafts[s.id || String(idx)]?.risks_text ?? (s.risks || []).join(', ')}
                    onChange={(e) => updateDraft(s.id || String(idx), 'risks_text', e.target.value)}
                    onBlur={() => saveDraft(s.id || String(idx), s)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Dependencies (comma-separated)</label>
                  <Input
                    value={drafts[s.id || String(idx)]?.dependencies_text ?? (s.dependencies || []).join(', ')}
                    onChange={(e) => updateDraft(s.id || String(idx), 'dependencies_text', e.target.value)}
                    onBlur={() => saveDraft(s.id || String(idx), s)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Validation Checkpoints (one per line)</label>
                <Textarea
                  value={drafts[s.id || String(idx)]?.validation_checkpoints_text ?? (s.validation_checkpoints || []).join('\n')}
                  onChange={(e) => updateDraft(s.id || String(idx), 'validation_checkpoints_text', e.target.value)}
                  onBlur={() => saveDraft(s.id || String(idx), s)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" className="gap-2" onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Add Stage
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => refetch()}>Refresh</Button>
          <Button onClick={applyAndClose}>Apply</Button>
        </div>
      </div>
    </div>
  );
};

export default JourneyEditor;
