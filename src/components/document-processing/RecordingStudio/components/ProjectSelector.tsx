/**
 * Project Selector Component - Select or create media projects for cost tracking
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { FolderOpen, Plus, DollarSign, Loader2 } from 'lucide-react';
import type { MediaProject } from '../hooks/useMediaProject';

interface ProjectSelectorProps {
  projects: MediaProject[];
  currentProject: MediaProject | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, description?: string) => Promise<MediaProject | null>;
  isLoading: boolean;
  totalSessionCost: number;
}

export function ProjectSelector({
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  isLoading,
  totalSessionCost,
}: ProjectSelectorProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    setIsCreating(true);
    const project = await onCreateProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
    setIsCreating(false);
    
    if (project) {
      setIsCreateOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
    }
  };

  const formatCost = (cost: number) => {
    if (cost < 0.01) return '<$0.01';
    return `$${cost.toFixed(2)}`;
  };

  return (
    <div className="bg-card rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-medium">Project</Label>
        </div>
        
        {/* Session Cost Display */}
        {currentProject && (
          <Badge variant="outline" className="gap-1 text-xs">
            <DollarSign className="w-3 h-3" />
            Session: {formatCost(totalSessionCost)}
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        <Select
          value={currentProject?.id || ''}
          onValueChange={onSelectProject}
          disabled={isLoading}
        >
          <SelectTrigger className="flex-1 h-8 text-xs">
            <SelectValue placeholder="Select project...">
              {currentProject ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{currentProject.name}</span>
                  {currentProject.total_estimated_cost > 0 && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">
                      {formatCost(currentProject.total_estimated_cost)}
                    </Badge>
                  )}
                </div>
              ) : (
                'Select project...'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center justify-between gap-3 w-full">
                  <span className="truncate">{project.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1">
                      {project.status}
                    </Badge>
                    {project.total_estimated_cost > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatCost(project.total_estimated_cost)}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No projects yet
              </div>
            )}
          </SelectContent>
        </Select>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 px-2 shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="e.g., Q1 Podcast Series"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">Description (optional)</Label>
                <Input
                  id="project-description"
                  placeholder="Brief description..."
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
              >
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Stats */}
      {currentProject && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold">{currentProject.total_recordings}</div>
            <div className="text-[10px] text-muted-foreground">Recordings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{currentProject.total_tts_generations}</div>
            <div className="text-[10px] text-muted-foreground">TTS</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{formatCost(currentProject.total_estimated_cost)}</div>
            <div className="text-[10px] text-muted-foreground">Total Cost</div>
          </div>
        </div>
      )}
    </div>
  );
}
