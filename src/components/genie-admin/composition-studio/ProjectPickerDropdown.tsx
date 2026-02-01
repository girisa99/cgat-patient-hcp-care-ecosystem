/**
 * ProjectPickerDropdown - Consolidated project selection UI
 * Shows all saved drafts with creation dates, chapter counts, and landing page assignment status
 */

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Layers,
  Plus,
  Calendar,
  Film,
  Globe,
  ExternalLink,
  ChevronDown,
  Trash2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

export interface StoredProjectInfo {
  id: string;
  projectName: string;
  chapters?: { id: string; title?: string }[];
  primaryLanguage?: string;
  additionalLanguages?: string[];
  savedAt: string;
  createdAt: string;
  // Landing page assignment tracking
  landingPageSection?: string;
  isPublished?: boolean;
}

interface ProjectPickerDropdownProps {
  projects: StoredProjectInfo[];
  currentProjectId: string | null;
  currentProjectName: string;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onDeleteProject?: (projectId: string) => void;
  className?: string;
}

// Section names for display
const LANDING_SECTIONS: Record<string, string> = {
  hero: 'Hero Showcase',
  dialect_demo: 'Dialect Demo',
  industry: 'Industry Showcases',
  use_cases: 'Use Cases',
  product_demo: 'Product Demo',
  tutorial: 'Tutorial',
  testimonials: 'Testimonials',
  global_stories: 'Global Stories',
};

export function ProjectPickerDropdown({
  projects,
  currentProjectId,
  currentProjectName,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  className,
}: ProjectPickerDropdownProps) {
  // Sort projects by savedAt (most recent first)
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
  }, [projects]);

  // Separate published vs draft projects
  const { publishedProjects, draftProjects } = useMemo(() => {
    const published: StoredProjectInfo[] = [];
    const drafts: StoredProjectInfo[] = [];
    
    for (const project of sortedProjects) {
      if (project.landingPageSection || project.isPublished) {
        published.push(project);
      } else {
        drafts.push(project);
      }
    }
    
    return { publishedProjects: published, draftProjects: drafts };
  }, [sortedProjects]);

  const currentProject = projects.find(p => p.id === currentProjectId);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-10 px-3 gap-2 justify-between min-w-[200px] max-w-[280px]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-4 h-4 shrink-0 text-primary" />
              <span className="truncate font-medium">
                {currentProjectName || 'Select Project'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {projects.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  {projects.length}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="start" 
          className="w-[320px] bg-popover z-[9999]"
          sideOffset={4}
        >
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              Your Projects
            </span>
            <Badge variant="outline" className="text-[10px]">
              {projects.length} total
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <ScrollArea className="max-h-[350px]">
            {/* Published to Landing Page */}
            {publishedProjects.length > 0 && (
              <>
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Published to Landing Page
                  </p>
                </div>
                {publishedProjects.map((project) => (
                  <ProjectMenuItem
                    key={project.id}
                    project={project}
                    isSelected={project.id === currentProjectId}
                    onSelect={() => onSelectProject(project.id)}
                    onDelete={onDeleteProject}
                  />
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            
            {/* Draft Projects */}
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Drafts ({draftProjects.length})
              </p>
            </div>
            
            {draftProjects.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No saved drafts yet
              </div>
            ) : (
              draftProjects.map((project) => (
                <ProjectMenuItem
                  key={project.id}
                  project={project}
                  isSelected={project.id === currentProjectId}
                  onSelect={() => onSelectProject(project.id)}
                  onDelete={onDeleteProject}
                />
              ))
            )}
          </ScrollArea>
          
          <DropdownMenuSeparator />
          
          {/* New Project Action */}
          <DropdownMenuItem 
            onClick={onNewProject}
            className="gap-2 cursor-pointer text-primary font-medium"
          >
            <Plus className="w-4 h-4" />
            Start New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Quick new project button */}
      <Button 
        variant="outline" 
        size="icon"
        onClick={onNewProject}
        title="Start new project"
        className="shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Individual project menu item
function ProjectMenuItem({
  project,
  isSelected,
  onSelect,
  onDelete,
}: {
  project: StoredProjectInfo;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: (id: string) => void;
}) {
  const chapterCount = project.chapters?.length || 0;
  const languageCount = 1 + (project.additionalLanguages?.length || 0);
  
  return (
    <DropdownMenuItem
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-1 py-2.5 px-2 cursor-pointer",
        isSelected && "bg-primary/10 border-l-2 border-primary"
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span className={cn(
          "font-medium truncate max-w-[200px]",
          isSelected && "text-primary"
        )}>
          {project.projectName || 'Untitled Project'}
        </span>
        {isSelected && (
          <Badge variant="secondary" className="text-[10px] shrink-0">
            Current
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
        <span className="flex items-center gap-1">
          <Film className="w-3 h-3" />
          {chapterCount} chapter{chapterCount !== 1 ? 's' : ''}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3" />
          {languageCount} lang{languageCount !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
        </span>
        <span>
          Updated {formatDistanceToNow(new Date(project.savedAt), { addSuffix: true })}
        </span>
      </div>
      
      {/* Landing page assignment */}
      {project.landingPageSection && (
        <Badge variant="outline" className="text-[10px] mt-1 bg-green-500/10 text-green-600 border-green-500/30">
          <ExternalLink className="w-3 h-3 mr-1" />
          {LANDING_SECTIONS[project.landingPageSection] || project.landingPageSection}
        </Badge>
      )}
    </DropdownMenuItem>
  );
}

export default ProjectPickerDropdown;
