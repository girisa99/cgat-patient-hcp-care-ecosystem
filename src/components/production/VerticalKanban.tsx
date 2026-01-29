/**
 * Vertical Swimlane Kanban for Production Hub
 * Each stage is a horizontal row with cards flowing left-to-right
 * Supports Media Productions, Business Meetings, and Events
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Users,
  Video,
  MoreHorizontal,
  GripVertical,
  Mail,
  FileText,
  Play,
  Film,
  Globe,
  Podcast,
  Tv,
  GraduationCap,
  Radio,
  Phone,
  Briefcase,
  Rocket,
  BarChart,
  MessageCircle,
  Wrench,
  Monitor,
  Building,
  BookOpen,
  CalendarPlus,
  CheckCircle,
  CheckCircle2,
  MessageSquare,
  XCircle,
  Lightbulb,
  Megaphone,
  UserPlus,
  Package,
  Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import type { ShowWithParticipants, ProductionStage, MeetingStage, EventStage, EventCategory } from '@/types/shows';
import { PRODUCTION_STAGES, MEETING_STAGES, EVENT_STAGES, SHOW_TYPES, getStagesForCategory, getCurrentStage } from '@/types/shows';

// Stage icons mapping
const STAGE_ICONS: Record<string, React.ElementType> = {
  Mail, FileText, Play, Video, Film, Globe,
  CalendarPlus, CheckCircle, CheckCircle2, MessageSquare, XCircle,
  Lightbulb, Megaphone, UserPlus, Radio, Package, Archive,
};

// Show type icons mapping
const SHOW_TYPE_ICONS: Record<string, React.ElementType> = {
  Podcast, Tv, Users, GraduationCap, Video, Radio,
  Phone, Briefcase, Rocket, BarChart, MessageCircle,
  Wrench, Monitor, Building, BookOpen,
};

interface VerticalKanbanProps {
  showsByStage: Record<string, ShowWithParticipants[]>;
  onSelectShow: (show: ShowWithParticipants) => void;
  onOpenRecordingStudio: (show: ShowWithParticipants) => void;
  onUpdateStage: (showId: string, newStage: ProductionStage | MeetingStage | EventStage) => Promise<void>;
  isLoading?: boolean;
  eventCategory?: EventCategory;
}

// Draggable Show Card
function DraggableCard({
  show,
  stageId,
  onSelect,
  onOpenRecordingStudio,
  eventCategory = 'media_production',
}: {
  show: ShowWithParticipants;
  stageId: string;
  onSelect: (show: ShowWithParticipants) => void;
  onOpenRecordingStudio: (show: ShowWithParticipants) => void;
  eventCategory?: EventCategory;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: show.id,
    data: { show, fromStage: stageId },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined;

  const typeConfig = SHOW_TYPES.find((t) => t.id === show.show_type);
  const ShowTypeIcon = SHOW_TYPE_ICONS[typeConfig?.icon || 'Video'] || Video;
  const confirmedCount = show.participants?.filter((p) => p.status === 'confirmed').length || 0;
  const totalCount = show.participants?.length || 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'w-48 sm:w-64 flex-shrink-0 cursor-grab hover:shadow-md transition-all touch-manipulation',
        isDragging && 'opacity-50 shadow-lg scale-105'
      )}
    >
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-start justify-between mb-1.5 sm:mb-2">
          <div
            className="flex items-center gap-1 cursor-grab active:cursor-grabbing"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/50" />
            <ShowTypeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-[10px] sm:text-xs capitalize truncate max-w-[80px] sm:max-w-none">
              {show.show_type?.replace('_', ' ')}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 sm:h-6 sm:w-6"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(show);
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>

        <h4
          className="font-medium text-xs sm:text-sm mb-1 line-clamp-2 cursor-pointer hover:text-primary"
          onClick={() => onSelect(show)}
        >
          {show.title}
        </h4>

        {show.description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-1.5 sm:mb-2">
            {show.description}
          </p>
        )}

        <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>
              {confirmedCount}/{totalCount}
            </span>
          </div>
          {show.scheduled_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span>{format(new Date(show.scheduled_date), 'MMM d')}</span>
            </div>
          )}
        </div>

        {/* Show Record button for recording stage in media, or action button for meetings */}
        {(stageId === 'recording' || stageId === 'in_progress' || stageId === 'live') && (
          <Button
            size="sm"
            className="w-full mt-1.5 sm:mt-2 h-7 sm:h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRecordingStudio(show);
            }}
          >
            <Video className="h-3 w-3 mr-1" />
            {stageId === 'recording' ? 'Record' : stageId === 'in_progress' ? 'Join' : 'Go Live'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Droppable Stage Row
function DroppableStageRow({
  stage,
  shows,
  isOver,
  isExpanded,
  onToggle,
  onSelectShow,
  onOpenRecordingStudio,
}: {
  stage: (typeof PRODUCTION_STAGES)[0];
  shows: ShowWithParticipants[];
  isOver: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectShow: (show: ShowWithParticipants) => void;
  onOpenRecordingStudio: (show: ShowWithParticipants) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  const StageIcon = STAGE_ICONS[stage.icon] || Mail;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div
        ref={setNodeRef}
        className={cn(
          'border rounded-lg transition-colors',
          isOver && 'ring-2 ring-primary/50 bg-primary/5'
        )}
      >
        {/* Stage Header - Mobile optimized */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 cursor-pointer hover:bg-muted/50 rounded-t-lg">
            <div className={cn('p-1.5 sm:p-2 rounded-lg shrink-0', stage.color)}>
              <StageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base truncate">{stage.label}</h3>
                <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                  {shows.length}
                </Badge>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">{stage.description}</p>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            )}
          </div>
        </CollapsibleTrigger>

        {/* Productions Row - Mobile optimized */}
        <CollapsibleContent>
          <div className="border-t">
            {shows.length === 0 ? (
              <div className="p-4 sm:p-6 text-center text-muted-foreground text-xs sm:text-sm border-2 border-dashed rounded-b-lg m-1.5 sm:m-2">
                Drag productions here
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="flex gap-2 sm:gap-3 p-2 sm:p-3">
                  {shows.map((show) => (
                    <DraggableCard
                      key={show.id}
                      show={show}
                      stageId={stage.id}
                      onSelect={onSelectShow}
                      onOpenRecordingStudio={onOpenRecordingStudio}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function VerticalKanban({
  showsByStage,
  onSelectShow,
  onOpenRecordingStudio,
  onUpdateStage,
  eventCategory = 'media_production',
}: VerticalKanbanProps) {
  // Get stages based on category
  const stages = getStagesForCategory(eventCategory);
  
  const [expandedStages, setExpandedStages] = React.useState<Set<string>>(
    new Set(stages.map((s) => s.id))
  );
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  };

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
    const targetStage = over.id as string;
    const activeData = active.data.current as { show: ShowWithParticipants; fromStage: string };

    if (activeData.fromStage !== targetStage) {
      await onUpdateStage(showId, targetStage as any);
    }
  };

  // Find active show for overlay
  const activeShow = activeId
    ? Object.values(showsByStage)
        .flat()
        .find((s) => s.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        {stages.map((stage) => (
          <DroppableStageRow
            key={stage.id}
            stage={stage as any}
            shows={showsByStage[stage.id] || []}
            isOver={overId === stage.id}
            isExpanded={expandedStages.has(stage.id)}
            onToggle={() => toggleStage(stage.id)}
            onSelectShow={onSelectShow}
            onOpenRecordingStudio={onOpenRecordingStudio}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeShow && (
          <Card className="w-64 shadow-2xl rotate-2 opacity-95">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {activeShow.show_type?.replace('_', ' ')}
                </Badge>
              </div>
              <h4 className="font-medium text-sm">{activeShow.title}</h4>
            </CardContent>
          </Card>
        )}
      </DragOverlay>
    </DndContext>
  );
}
