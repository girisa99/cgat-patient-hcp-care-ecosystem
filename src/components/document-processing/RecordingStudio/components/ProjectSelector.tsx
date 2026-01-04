/**
 * Project Selector Component - Select or create media projects for cost tracking
 * Now unified with Production Hub shows
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { FolderOpen, Plus, Loader2, Link2 } from 'lucide-react';
import type { MediaProject } from '../hooks/useMediaProject';
import type { ProductionContextForStudio } from '../types';

interface ProjectSelectorProps {
  projects: MediaProject[];
  currentProject: MediaProject | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, description?: string) => Promise<MediaProject | null>;
  isLoading: boolean;
  totalSessionCost: number;
  isLinkedToProduction?: boolean;
  productionContext?: ProductionContextForStudio;
}

export function ProjectSelector({
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  isLoading,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  totalSessionCost: _totalSessionCost, // Kept for interface compatibility but not displayed
  isLinkedToProduction = false,
  productionContext,
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

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <FolderOpen className="w-4 h-4 text-muted-foreground" />
        {isLinkedToProduction && productionContext ? (
          <span className="text-sm font-medium truncate max-w-[200px]">
            {productionContext.showTitle}
          </span>
        ) : currentProject ? (
          <span className="text-sm font-medium truncate max-w-[200px]">
            {currentProject.name}
          </span>
        ) : (
          <Select
            value={currentProject?.id || ''}
            onValueChange={onSelectProject}
            disabled={isLoading}
          >
            <SelectTrigger className="h-7 text-xs min-w-[150px]">
              <SelectValue placeholder="Select project..." />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] bg-popover z-50">
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <span className="truncate">{project.name}</span>
                </SelectItem>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No projects yet
                </div>
              )}
            </SelectContent>
          </Select>
        )}
        {isLinkedToProduction && (
          <Badge variant="secondary" className="gap-1 text-[10px] h-5">
            <Link2 className="w-3 h-3" />
            Linked
          </Badge>
        )}
      </div>

      {/* Create new project dialog - only show when not linked */}
      {!isLinkedToProduction && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0">
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
      )}
    </div>
  );
}
