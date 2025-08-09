import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLabelStudio, type LSProject } from "@/hooks/useLabelStudio";

export interface LSBinding {
  projectId?: number;
  projectTitle?: string;
  selectedTaskCount?: number;
  appliesTo: {
    prompts: boolean;
    visual: boolean;
    templates: boolean;
  };
}

interface Props {
  value?: LSBinding;
  onBind: (binding: LSBinding) => void;
}

const LSBindingPanel: React.FC<Props> = ({ value, onBind }) => {
  const { loading, listProjects, listProjectTasks } = useLabelStudio();
  const [projects, setProjects] = useState<LSProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(value?.projectId);
  const [taskCount, setTaskCount] = useState<number>(value?.selectedTaskCount || 0);
  const [appliesTo, setAppliesTo] = useState(value?.appliesTo || { prompts: true, visual: false, templates: false });
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    // Auto-load projects on mount for quick UX
    (async () => {
      try {
        const data = await listProjects(1, 50);
        setProjects(Array.isArray(data) ? data : []);
      } catch {}
    })();
  }, [listProjects]);

  // Load tasks count when project changes
  useEffect(() => {
    (async () => {
      if (!selectedProjectId) return;
      try {
        setLoadingTasks(true);
        const tasks = await listProjectTasks(selectedProjectId, 1, 1); // fetch page 1 to get total via length fallback
        const count = Array.isArray(tasks) ? tasks.length : 0; // Label Studio REST may not return total; keep simple
        setTaskCount(count);
      } catch {
        setTaskCount(0);
      } finally {
        setLoadingTasks(false);
      }
    })();
  }, [selectedProjectId, listProjectTasks]);

  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Label Studio Dataset</span>
          {value?.projectId ? <Badge variant="secondary">Linked</Badge> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Project</Label>
          <div className="flex items-center gap-2">
            <Select value={selectedProjectId?.toString()} onValueChange={(v) => setSelectedProjectId(Number(v))}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder={projects.length ? "Select a project" : (loading ? "Loading projects..." : "No projects found")}/>
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.title || `Project ${p.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={async () => {
              const data = await listProjects(1, 50);
              setProjects(Array.isArray(data) ? data : []);
            }} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          {selectedProject && (
            <p className="text-sm text-muted-foreground">
              {loadingTasks ? "Loading tasks..." : `${taskCount} tasks detected`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Prompts</p>
              <p className="text-xs text-muted-foreground">Feed examples into prompt builder</p>
            </div>
            <Switch checked={appliesTo.prompts} onCheckedChange={(v) => setAppliesTo(a => ({ ...a, prompts: v }))} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Visual (Canvas)</p>
              <p className="text-xs text-muted-foreground">Seed nodes/labels on canvas</p>
            </div>
            <Switch checked={appliesTo.visual} onCheckedChange={(v) => setAppliesTo(a => ({ ...a, visual: v }))} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Templates</p>
              <p className="text-xs text-muted-foreground">Pre-fill mapping in templates</p>
            </div>
            <Switch checked={appliesTo.templates} onCheckedChange={(v) => setAppliesTo(a => ({ ...a, templates: v }))} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              if (!selectedProjectId) return;
              onBind({
                projectId: selectedProjectId,
                projectTitle: selectedProject?.title,
                selectedTaskCount: taskCount,
                appliesTo,
              });
            }}
            disabled={!selectedProjectId}
          >
            Attach Dataset
          </Button>
          {value?.projectId && (
            <Button variant="outline" onClick={() => onBind({ appliesTo: { prompts: false, visual: false, templates: false } })}>
              Detach
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LSBindingPanel;
