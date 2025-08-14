import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Steps, Step } from '@/components/ui/steps';
import { useJourneyStages, JourneyStage } from '@/hooks/useJourneyStages';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

interface JourneyEditorProps {
  templateId: string;
  onApplied?: (stages: JourneyStage[]) => void;
}

export const JourneyEditor: React.FC<JourneyEditorProps> = ({ templateId, onApplied }) => {
  const { stages, isLoading, createStage, updateStage, deleteStage, reorderStages, refetch } = useJourneyStages(templateId);

  const handleAdd = async () => {
    await createStage({ title: 'New Stage' });
    await refetch();
  };

  const handleUpdate = async (id: string, updates: Partial<JourneyStage>) => {
    await updateStage({ id, updates });
  };

  const handleDelete = async (id: string) => {
    await deleteStage(id);
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
                  <Input defaultValue={s.title} onBlur={(e) => s.id && handleUpdate(s.id, { title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Owner Role</label>
                  <Input defaultValue={s.owner_role || ''} onBlur={(e) => s.id && handleUpdate(s.id, { owner_role: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea defaultValue={s.description || ''} onBlur={(e) => s.id && handleUpdate(s.id, { description: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Expected Duration (min)</label>
                  <Input type="number" defaultValue={s.expected_duration_minutes || ''} onBlur={(e) => s.id && handleUpdate(s.id, { expected_duration_minutes: Number(e.target.value || 0) })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Entry Criteria (comma-separated)</label>
                  <Input defaultValue={(s.entry_criteria || []).join(', ')} onBlur={(e) => s.id && handleUpdate(s.id, { entry_criteria: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tasks Checklist (one per line)</label>
                <Textarea defaultValue={(s.tasks_checklist || []).join('\n')} onBlur={(e) => s.id && handleUpdate(s.id, { tasks_checklist: e.target.value.split('\n').map(v => v.trim()).filter(Boolean) })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Outputs / Success Criteria (one per line)</label>
                <Textarea defaultValue={(s.outputs_success_criteria || []).join('\n')} onBlur={(e) => s.id && handleUpdate(s.id, { outputs_success_criteria: e.target.value.split('\n').map(v => v.trim()).filter(Boolean) })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Risks (comma-separated)</label>
                  <Input defaultValue={(s.risks || []).join(', ')} onBlur={(e) => s.id && handleUpdate(s.id, { risks: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Dependencies (comma-separated)</label>
                  <Input defaultValue={(s.dependencies || []).join(', ')} onBlur={(e) => s.id && handleUpdate(s.id, { dependencies: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Validation Checkpoints (one per line)</label>
                <Textarea defaultValue={(s.validation_checkpoints || []).join('\n')} onBlur={(e) => s.id && handleUpdate(s.id, { validation_checkpoints: e.target.value.split('\n').map(v => v.trim()).filter(Boolean) })} />
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
