/**
 * CastProjectDropdown — Project selector + creator for Genie Cast
 * Shows existing projects, lets user create new ones with content type.
 */
import React, { useState } from 'react';
import { Plus, FolderOpen, Video, Mic, GraduationCap, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { CastProjectWithRelations } from '@/types/castProjects';

export const CONTENT_TYPES = [
  { value: 'video', label: 'Video', icon: Video, color: 'text-blue-600' },
  { value: 'podcast', label: 'Podcast', icon: Mic, color: 'text-purple-600' },
  { value: 'educational', label: 'Educational', icon: GraduationCap, color: 'text-green-600' },
  { value: 'ugc', label: 'UGC', icon: Users, color: 'text-orange-600' },
] as const;

interface CastProjectDropdownProps {
  projects: CastProjectWithRelations[];
  isLoading: boolean;
  selectedProjectId: string | null;
  onProjectSelect: (project: CastProjectWithRelations) => void;
  onNewProject: (title: string, contentType: string) => void;
  onContentTypeChange?: (contentType: string) => void;
}

export const CastProjectDropdown: React.FC<CastProjectDropdownProps> = ({
  projects,
  isLoading,
  selectedProjectId,
  onProjectSelect,
  onNewProject,
  onContentTypeChange,
}) => {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContentType, setNewContentType] = useState('video');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onNewProject(newTitle.trim(), newContentType);
    onContentTypeChange?.(newContentType);
    setShowNewDialog(false);
    setNewTitle('');
    setNewContentType('video');
  };

  const handleSelect = (projectId: string) => {
    if (projectId === '__new__') {
      setShowNewDialog(true);
      return;
    }
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onProjectSelect(project);
      onContentTypeChange?.((project as any).content_type || 'video');
    }
  };

  const getContentTypeIcon = (ct: string) => {
    const found = CONTENT_TYPES.find(c => c.value === ct);
    return found ? <found.icon className={`w-3.5 h-3.5 ${found.color}`} /> : <Video className="w-3.5 h-3.5" />;
  };

  return (
    <>
      <Select value={selectedProjectId || ''} onValueChange={handleSelect}>
        <SelectTrigger className="w-[220px] h-8 text-xs gap-1.5 bg-background border">
          <FolderOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <SelectValue placeholder={isLoading ? 'Loading...' : 'Select project'} />
        </SelectTrigger>
        <SelectContent className="z-50 bg-popover border shadow-lg">
          {projects.map(p => (
            <SelectItem key={p.id} value={p.id} className="text-xs">
              <div className="flex items-center gap-2">
                {getContentTypeIcon((p as any).content_type || 'video')}
                <span className="truncate max-w-[150px]">{p.title}</span>
                <Badge variant="outline" className="text-[9px] ml-auto">{p.status}</Badge>
              </div>
            </SelectItem>
          ))}
          <SelectItem value="__new__" className="text-xs text-primary font-medium">
            <div className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />
              New Project
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Cast Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Name</Label>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Product Launch — Q1 Campaign"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Content Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CONTENT_TYPES.map(ct => (
                  <Button
                    key={ct.value}
                    variant={newContentType === ct.value ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2 justify-start"
                    onClick={() => setNewContentType(ct.value)}
                  >
                    <ct.icon className="w-4 h-4" />
                    {ct.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newTitle.trim()}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
