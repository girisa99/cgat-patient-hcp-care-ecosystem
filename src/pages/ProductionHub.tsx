/**
 * Production Hub - Kanban-style production pipeline management
 */

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  ArrowLeft, 
  Calendar, 
  Users, 
  FileText, 
  Video, 
  Film, 
  Globe,
  Mail,
  Play,
  Podcast,
  Tv,
  GraduationCap,
  MoreHorizontal,
  ChevronRight,
  Loader2,
  Trash2,
  Settings,
  ExternalLink,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useShows } from '@/hooks/useShows';
import { 
  PRODUCTION_STAGES, 
  SHOW_TYPES, 
  PARTICIPANT_ROLES,
  type ShowWithParticipants, 
  type ProductionStage,
  type ShowType
} from '@/types/shows';
import { format } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

const STAGE_ICONS: Record<string, React.ElementType> = {
  Mail: Mail,
  FileText: FileText,
  Play: Play,
  Video: Video,
  Film: Film,
  Globe: Globe,
};

const SHOW_TYPE_ICONS: Record<string, React.ElementType> = {
  Podcast: Podcast,
  Tv: Tv,
  Users: Users,
  GraduationCap: GraduationCap,
  Video: Video,
};

// Draggable Show Card component
function DraggableShowCard({ 
  show, 
  getShowTypeIcon, 
  onSelect,
  onOpenRecordingStudio,
  stageId
}: { 
  show: ShowWithParticipants; 
  getShowTypeIcon: (type: ShowType) => React.ElementType;
  onSelect: (show: ShowWithParticipants) => void;
  onOpenRecordingStudio: (show: ShowWithParticipants) => void;
  stageId: ProductionStage;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: show.id,
    data: { show, fromStage: stageId },
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : undefined;

  const ShowTypeIcon = getShowTypeIcon(show.show_type);
  const confirmedCount = show.participants?.filter(p => p.status === 'confirmed').length || 0;
  const totalCount = show.participants?.length || 0;

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab hover:shadow-md transition-shadow",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div 
            className="flex items-center gap-1 cursor-grab active:cursor-grabbing"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            <ShowTypeIcon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs capitalize">
              {show.show_type}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(show);
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
        
        <h4 
          className="font-medium text-sm mb-1 line-clamp-2 cursor-pointer hover:text-primary"
          onClick={() => onSelect(show)}
        >
          {show.title}
        </h4>
        
        {show.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {show.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{confirmedCount}/{totalCount}</span>
          </div>
          {show.scheduled_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(show.scheduled_date), 'MMM d')}</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {stageId === 'recording' && (
          <Button 
            size="sm" 
            className="w-full mt-2"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRecordingStudio(show);
            }}
          >
            <Video className="h-3 w-3 mr-1" />
            Open Recording Studio
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Droppable Stage Column component
function DroppableStageColumn({ 
  stage, 
  children,
  isOver 
}: { 
  stage: typeof PRODUCTION_STAGES[0]; 
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  const StageIcon = STAGE_ICONS[stage.icon] || Mail;

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "w-80 flex-shrink-0 bg-muted/30 rounded-lg flex flex-col transition-colors",
        isOver && "bg-primary/10 ring-2 ring-primary/50"
      )}
    >
      {/* Stage Header */}
      <div className="p-3 border-b bg-card/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded", stage.color)}>
            <StageIcon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{stage.label}</h3>
            <p className="text-xs text-muted-foreground">{stage.description}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ProductionHub() {
  const navigate = useNavigate();
  const { 
    shows, 
    isLoading, 
    createShow, 
    updateStage, 
    deleteShow,
    addParticipant,
    getShowsByStage 
  } = useShows();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<ShowWithParticipants | null>(null);
  const [newShow, setNewShow] = useState({
    title: '',
    description: '',
    show_type: 'podcast' as ShowType,
    scheduled_date: '',
    starting_stage: 'outreach' as ProductionStage,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const showsByStage = getShowsByStage();

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: any) => {
    setOverId(event.over?.id || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const showId = active.id as string;
    const targetStage = over.id as ProductionStage;
    const activeData = active.data.current as { show: ShowWithParticipants; fromStage: ProductionStage };

    // Only update if dropped on a different stage
    if (activeData.fromStage !== targetStage) {
      await updateStage(showId, targetStage);
    }
  };

  const handleCreateShow = async () => {
    if (!newShow.title.trim()) return;
    
    setIsCreating(true);
    try {
      await createShow({
        title: newShow.title,
        description: newShow.description || undefined,
        show_type: newShow.show_type,
        scheduled_date: newShow.scheduled_date || undefined,
        starting_stage: newShow.starting_stage,
      });
      setIsCreateDialogOpen(false);
      setNewShow({ 
        title: '', 
        description: '', 
        show_type: 'podcast', 
        scheduled_date: '',
        starting_stage: 'outreach',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenRecordingStudio = (show: ShowWithParticipants) => {
    navigate(`/genie-studio?showId=${show.id}`);
  };

  const getShowTypeIcon = (showType: ShowType) => {
    const typeConfig = SHOW_TYPES.find(t => t.id === showType);
    const IconComponent = SHOW_TYPE_ICONS[typeConfig?.icon || 'Video'] || Video;
    return IconComponent;
  };

  const activeShow = activeId ? shows.find(s => s.id === activeId) : null;

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/genie-studio')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Production Hub</h1>
              <p className="text-sm text-muted-foreground">
                Manage your podcast, webcast, and broadcast productions
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Production
          </Button>
        </div>

        {/* Kanban Board with Drag and Drop */}
        <div className="flex-1 overflow-x-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 h-full min-w-max">
                {PRODUCTION_STAGES.map((stage) => {
                  const stageShows = showsByStage[stage.id] || [];
                  const isOverThisStage = overId === stage.id;
                  
                  return (
                    <DroppableStageColumn 
                      key={stage.id} 
                      stage={stage}
                      isOver={isOverThisStage}
                    >
                      <ScrollArea className="flex-1 p-2">
                        <div className="space-y-2 min-h-[200px]">
                          <Badge variant="secondary" className="text-xs mb-2">
                            {stageShows.length} production{stageShows.length !== 1 ? 's' : ''}
                          </Badge>
                          
                          {stageShows.map((show) => (
                            <DraggableShowCard
                              key={show.id}
                              show={show}
                              getShowTypeIcon={getShowTypeIcon}
                              onSelect={setSelectedShow}
                              onOpenRecordingStudio={handleOpenRecordingStudio}
                              stageId={stage.id}
                            />
                          ))}

                          {stageShows.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                              Drag productions here
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </DroppableStageColumn>
                  );
                })}
              </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeShow && (
                  <Card className="w-72 shadow-2xl rotate-3 opacity-90">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {(() => {
                          const Icon = getShowTypeIcon(activeShow.show_type);
                          return <Icon className="h-4 w-4 text-muted-foreground" />;
                        })()}
                        <Badge variant="outline" className="text-xs capitalize">
                          {activeShow.show_type}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm">{activeShow.title}</h4>
                    </CardContent>
                  </Card>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Create Show Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Production</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter production title..."
                  value={newShow.title}
                  onChange={(e) => setNewShow(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newShow.show_type}
                  onValueChange={(value: ShowType) => setNewShow(prev => ({ ...prev, show_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHOW_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description..."
                  value={newShow.description}
                  onChange={(e) => setNewShow(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Scheduled Date (optional)</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={newShow.scheduled_date}
                  onChange={(e) => setNewShow(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starting_stage">Starting Stage</Label>
                <Select
                  value={newShow.starting_stage}
                  onValueChange={(value: ProductionStage) => setNewShow(prev => ({ ...prev, starting_stage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select starting stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTION_STAGES.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                          {stage.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose where this production starts in the pipeline
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateShow} disabled={!newShow.title.trim() || isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Production
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Show Detail Panel */}
        <Dialog open={!!selectedShow} onOpenChange={(open) => !open && setSelectedShow(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedShow && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const ShowTypeIcon = getShowTypeIcon(selectedShow.show_type);
                      return <ShowTypeIcon className="h-5 w-5 text-muted-foreground" />;
                    })()}
                    <div>
                      <DialogTitle>{selectedShow.title}</DialogTitle>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {selectedShow.show_type}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Stage Progress */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Production Stage</Label>
                    <div className="flex items-center gap-1">
                      {PRODUCTION_STAGES.map((stage, index) => {
                        const isActive = stage.id === selectedShow.current_stage;
                        const stageIndex = PRODUCTION_STAGES.findIndex(s => s.id === selectedShow.current_stage);
                        const isPast = index < stageIndex;
                        
                        return (
                          <React.Fragment key={stage.id}>
                            <div 
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                isActive && stage.color + " text-white",
                                isPast && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                !isActive && !isPast && "bg-muted text-muted-foreground"
                              )}
                            >
                              {stage.label}
                            </div>
                            {index < PRODUCTION_STAGES.length - 1 && (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedShow.description && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Description</Label>
                      <p className="text-sm text-muted-foreground">{selectedShow.description}</p>
                    </div>
                  )}

                  {/* Participants */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Participants</Label>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    {selectedShow.participants && selectedShow.participants.length > 0 ? (
                      <div className="space-y-2">
                        {selectedShow.participants.map((participant) => (
                          <div 
                            key={participant.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{participant.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {participant.role.replace('_', ' ')}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={participant.status === 'confirmed' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {participant.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No participants added yet</p>
                    )}
                  </div>

                  {/* Assets */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Assets</Label>
                    {selectedShow.assets && selectedShow.assets.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedShow.assets.map((asset) => (
                          <div 
                            key={asset.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">{asset.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No assets linked yet</p>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <div className="flex gap-2 flex-1">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        deleteShow(selectedShow.id);
                        setSelectedShow(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {selectedShow.current_stage === 'recording' && (
                      <Button onClick={() => handleOpenRecordingStudio(selectedShow)}>
                        <Video className="h-4 w-4 mr-1" />
                        Recording Studio
                      </Button>
                    )}
                    {selectedShow.current_stage !== 'published' && (
                      <Button onClick={async () => {
                        const stageIndex = PRODUCTION_STAGES.findIndex(s => s.id === selectedShow.current_stage);
                        if (stageIndex < PRODUCTION_STAGES.length - 1) {
                          await updateStage(selectedShow.id, PRODUCTION_STAGES[stageIndex + 1].id);
                        }
                        setSelectedShow(null);
                      }}>
                        Move to Next Stage
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
