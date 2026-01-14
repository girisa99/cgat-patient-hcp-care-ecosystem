/**
 * Production Guided Wizard
 * Step-by-step production workflow guide for ProductionHub
 * Dynamic phases based on category: Media Production, Business Meeting, Event, Genie Demo
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings,
  Users,
  FileText,
  Play,
  Video,
  Scissors,
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  Wand2,
  Podcast,
  Presentation,
  Briefcase,
  Calendar,
  Sparkles,
  Zap,
  Film,
  Brain,
  Music,
  Layers,
  Phone,
  Rocket,
  BarChart,
  MessageCircle,
  Wrench,
  Monitor,
  Building,
  BookOpen,
  Mail,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  CalendarPlus,
  Lightbulb,
  Megaphone,
  UserPlus,
  Radio,
  Package,
  Archive,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ShowType, EventCategory, ProductionStage, MeetingStage, EventStage, DemoStage } from '@/types/shows';
import { 
  EVENT_CATEGORIES, 
  getStagesForCategory, 
  getShowTypesForCategory,
  PRODUCTION_STAGES,
  MEETING_STAGES,
  EVENT_STAGES,
  DEMO_STAGES,
} from '@/types/shows';

// Icon mapping for dynamic stages
const STAGE_ICONS: Record<string, React.ElementType> = {
  // Production stages
  'outreach': Mail,
  'script': FileText,
  'rehearsal': Play,
  'recording': Video,
  'post_production': Scissors,
  'published': Upload,
  // Meeting stages
  'scheduled': CalendarPlus,
  'confirmed': CheckCircle,
  'agenda_prep': FileText,
  'in_progress': Play,
  'follow_up': MessageSquare,
  'completed': CheckCircle,
  'cancelled': XCircle,
  // Event stages
  'planning': Lightbulb,
  'promotion': Megaphone,
  'registration': UserPlus,
  'live': Radio,
  'wrap_up': Package,
  'archived': Archive,
  // Demo stages
  'demo_scheduled': Calendar,
  'demo_prep': Settings,
  'demo_live': Play,
  'demo_followup': MessageCircle,
  'demo_closed': CheckCircle,
};

// Type icons mapping
const TYPE_ICONS: Record<string, React.ElementType> = {
  // Media Productions
  'podcast': Podcast,
  'webcast': Monitor,
  'interview': Users,
  'panel': Users,
  'tutorial': Video,
  'broadcast': Radio,
  'other': Video,
  // Business Meetings
  'discovery_call': Phone,
  'sales_meeting': Briefcase,
  'project_kickoff': Rocket,
  'status_update': BarChart,
  'consultation': MessageCircle,
  // Events
  'workshop': Wrench,
  'webinar': Monitor,
  'conference': Building,
  'training_session': BookOpen,
  // Genie Studio Demos
  'genie_studio_full': Sparkles,
  'genie_spark_demo': Zap,
  'genie_arc_demo': Film,
  'genie_mind_demo': Brain,
  'genie_vibe_demo': Music,
  'genie_suite_overview': Layers,
};

// Category icons
const CATEGORY_ICONS: Record<EventCategory, React.ElementType> = {
  'media_production': Podcast,
  'business_meeting': Briefcase,
  'event': Calendar,
  'genie_demo': Sparkles,
};

interface WizardPhase {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  isComplete: boolean;
  stageId?: string;
}

interface ProductionGuidedWizardProps {
  onCreateShow: (data: { 
    title: string; 
    type: ShowType; 
    category: EventCategory;
    description?: string;
    startingStage?: string;
  }) => void;
  onInviteGuests: () => void;
  onLinkScript: () => void;
  onScheduleRehearsals: () => void;
  onStartRecording: () => void;
  onOpenScheduleDialog?: () => void;
  currentStage: string;
  hasShow: boolean;
  hasGuests: boolean;
  hasScript: boolean;
  className?: string;
}

export const ProductionGuidedWizard: React.FC<ProductionGuidedWizardProps> = ({
  onCreateShow,
  onInviteGuests,
  onLinkScript,
  onScheduleRehearsals,
  onStartRecording,
  onOpenScheduleDialog,
  currentStage,
  hasShow,
  hasGuests,
  hasScript,
  className,
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showTitle, setShowTitle] = useState('');
  const [showDescription, setShowDescription] = useState('');
  const [showType, setShowType] = useState<ShowType | null>(null);
  const [eventCategory, setEventCategory] = useState<EventCategory | null>(null);

  // Get dynamic types and stages based on selected category
  const availableTypes = useMemo(() => {
    if (!eventCategory) return [];
    return getShowTypesForCategory(eventCategory);
  }, [eventCategory]);

  const categoryStages = useMemo(() => {
    if (!eventCategory) return [];
    return getStagesForCategory(eventCategory);
  }, [eventCategory]);

  // Build phases dynamically based on category
  const phases = useMemo((): WizardPhase[] => {
    // Phase 1: Always Category Selection
    const basePhases: WizardPhase[] = [
      {
        id: 'category',
        title: 'Category',
        description: 'Select category',
        icon: Settings,
        isComplete: !!eventCategory,
      },
      {
        id: 'type',
        title: 'Type',
        description: 'Select type',
        icon: eventCategory ? CATEGORY_ICONS[eventCategory] : Settings,
        isComplete: !!showType,
      },
      {
        id: 'details',
        title: 'Details',
        description: 'Enter details',
        icon: FileText,
        isComplete: hasShow || (!!showTitle.trim() && !!showType),
      },
    ];

    // Add category-specific stage phases
    if (eventCategory && categoryStages.length > 0) {
      const stagePhases = categoryStages.map((stage, index) => ({
        id: stage.id,
        title: stage.label,
        description: stage.description,
        icon: STAGE_ICONS[stage.id] || Settings,
        isComplete: isStageComplete(stage.id, currentStage, categoryStages),
        stageId: stage.id,
      }));
      return [...basePhases, ...stagePhases];
    }

    return basePhases;
  }, [eventCategory, showType, showTitle, hasShow, currentStage, categoryStages]);

  // Check if a stage is complete based on current stage progression
  function isStageComplete(stageId: string, currentStageId: string, stages: typeof categoryStages): boolean {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    const currentIndex = stages.findIndex(s => s.id === currentStageId);
    return stageIndex < currentIndex;
  }

  const currentPhaseData = phases[currentPhase];
  const progress = ((currentPhase + 1) / phases.length) * 100;

  const handleCategorySelect = (category: EventCategory) => {
    setEventCategory(category);
    setShowType(null); // Reset type when category changes
    setCurrentPhase(1); // Move to type selection
  };

  const handleTypeSelect = (type: ShowType) => {
    setShowType(type);
    setCurrentPhase(2); // Move to details
  };

  const handleCreateShow = () => {
    if (!showTitle.trim() || !showType || !eventCategory) {
      toast.error('Please complete all required fields');
      return;
    }
    
    const startingStage = categoryStages[0]?.id;
    onCreateShow({ 
      title: showTitle, 
      type: showType, 
      category: eventCategory,
      description: showDescription,
      startingStage,
    });
    setCurrentPhase(3); // Move to first stage phase
    toast.success('Production created! Now follow the stage workflow.');
  };

  const goNext = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const goBack = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  // Render action for stage-based phases
  const renderStageAction = (stageId: string) => {
    switch (stageId) {
      // Media Production stages
      case 'outreach':
        return (
          <Button onClick={onInviteGuests} className="w-full">
            <Users className="h-4 w-4 mr-2" />
            Invite Participants
          </Button>
        );
      case 'script':
        return (
          <Button onClick={onLinkScript} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Link or Create Script
          </Button>
        );
      case 'rehearsal':
        return (
          <Button onClick={onScheduleRehearsals} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Rehearsal
          </Button>
        );
      case 'recording':
        return (
          <Button onClick={onStartRecording} className="w-full bg-gradient-to-r from-red-500 to-pink-500">
            <Video className="h-4 w-4 mr-2" />
            Open Recording Studio
          </Button>
        );
      case 'post_production':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Scissors className="h-4 w-4 mr-1" />
              Edit Clips
            </Button>
            <Button variant="outline" size="sm">
              <Wand2 className="h-4 w-4 mr-1" />
              AI Polish
            </Button>
          </div>
        );
      case 'published':
        return (
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
            <Upload className="h-4 w-4 mr-2" />
            Publish Content
          </Button>
        );
      
      // Meeting stages
      case 'scheduled':
        return (
          <Button onClick={onOpenScheduleDialog || onInviteGuests} className="w-full">
            <CalendarPlus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        );
      case 'confirmed':
        return (
          <Button onClick={onInviteGuests} className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Send Confirmations
          </Button>
        );
      case 'agenda_prep':
        return (
          <Button onClick={onLinkScript} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Prepare Agenda
          </Button>
        );
      case 'in_progress':
        return (
          <Button onClick={onStartRecording} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
            <Play className="h-4 w-4 mr-2" />
            Join Meeting
          </Button>
        );
      case 'follow_up':
        return (
          <Button variant="outline" className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Follow-up
          </Button>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500/10 text-green-600 w-full justify-center py-2">
            <Check className="h-4 w-4 mr-2" />
            Meeting Completed
          </Badge>
        );

      // Event stages
      case 'planning':
        return (
          <Button onClick={onLinkScript} className="w-full">
            <Lightbulb className="h-4 w-4 mr-2" />
            Create Event Plan
          </Button>
        );
      case 'promotion':
        return (
          <Button variant="outline" className="w-full">
            <Megaphone className="h-4 w-4 mr-2" />
            Launch Promotion
          </Button>
        );
      case 'registration':
        return (
          <Button onClick={onInviteGuests} className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Manage Registration
          </Button>
        );
      case 'live':
        return (
          <Button onClick={onStartRecording} className="w-full bg-gradient-to-r from-red-500 to-pink-500">
            <Radio className="h-4 w-4 mr-2" />
            Go Live
          </Button>
        );
      case 'wrap_up':
        return (
          <Button variant="outline" className="w-full">
            <Package className="h-4 w-4 mr-2" />
            Wrap Up Event
          </Button>
        );
      case 'archived':
        return (
          <Badge className="bg-green-500/10 text-green-600 w-full justify-center py-2">
            <Archive className="h-4 w-4 mr-2" />
            Event Archived
          </Badge>
        );

      // Demo stages
      case 'demo_scheduled':
        return (
          <Button onClick={onOpenScheduleDialog || onInviteGuests} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Demo
          </Button>
        );
      case 'demo_prep':
        return (
          <Button onClick={onLinkScript} className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Prepare Demo Environment
          </Button>
        );
      case 'demo_live':
        return (
          <Button onClick={onStartRecording} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
            <Sparkles className="h-4 w-4 mr-2" />
            Start Demo
          </Button>
        );
      case 'demo_followup':
        return (
          <Button variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Follow-up
          </Button>
        );
      case 'demo_closed':
        return (
          <Badge className="bg-green-500/10 text-green-600 w-full justify-center py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            Demo Completed
          </Badge>
        );

      default:
        return (
          <Button variant="outline" className="w-full" onClick={goNext}>
            Continue to Next Step
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        );
    }
  };

  return (
    <Card className={cn("border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="h-5 w-5 text-blue-500" />
            {eventCategory 
              ? `${EVENT_CATEGORIES.find(c => c.id === eventCategory)?.label} Workflow`
              : 'Production Workflow Guide'
            }
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
            Step {currentPhase + 1} of {phases.length}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="h-2 mt-3" />
        
        {/* Phase Indicators - Dynamic based on category */}
        <div className="flex justify-between mt-4 overflow-x-auto pb-2 gap-1">
          {phases.map((phase, index) => {
            const IconComponent = phase.icon;
            return (
              <button
                key={phase.id}
                onClick={() => setCurrentPhase(index)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all min-w-[40px] flex-shrink-0",
                  index === currentPhase ? "opacity-100" : "opacity-50 hover:opacity-75"
                )}
              >
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center transition-all",
                  phase.isComplete 
                    ? "bg-green-500 text-white" 
                    : index === currentPhase 
                      ? "bg-blue-500 text-white" 
                      : "bg-muted"
                )}>
                  {phase.isComplete ? <Check className="h-3 w-3" /> : <IconComponent className="h-3 w-3" />}
                </div>
                <span className="text-[9px] font-medium hidden lg:block truncate max-w-[60px]">{phase.title}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Phase Content */}
        <div className="min-h-[200px]">
          {/* Phase 1: Category Selection */}
          {currentPhase === 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Select Category</h3>
              <p className="text-sm text-muted-foreground">
                Choose the type of production to see the appropriate workflow.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {EVENT_CATEGORIES.map((cat) => {
                  const IconComponent = CATEGORY_ICONS[cat.id];
                  const isSelected = eventCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center",
                        isSelected 
                          ? "border-blue-500 bg-blue-500/10" 
                          : "border-muted hover:border-blue-500/50 hover:bg-muted/50"
                      )}
                    >
                      <IconComponent className={cn(
                        "h-8 w-8",
                        isSelected ? "text-blue-500" : "text-muted-foreground"
                      )} />
                      <span className="text-sm font-medium">{cat.label}</span>
                      <span className="text-[10px] text-muted-foreground">{cat.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Phase 2: Type Selection */}
          {currentPhase === 1 && eventCategory && (
            <div className="space-y-4">
              <h3 className="font-semibold">Select Type</h3>
              <p className="text-sm text-muted-foreground">
                Choose the specific type of {EVENT_CATEGORIES.find(c => c.id === eventCategory)?.label.toLowerCase()}.
              </p>
              
              <RadioGroup
                value={showType || ''}
                onValueChange={(v) => handleTypeSelect(v as ShowType)}
                className="grid grid-cols-2 gap-2"
              >
                {availableTypes.map((type) => {
                  const IconComponent = TYPE_ICONS[type.id] || Settings;
                  return (
                    <Label
                      key={type.id}
                      htmlFor={`type-${type.id}`}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                        showType === type.id 
                          ? "border-blue-500 bg-blue-500/10" 
                          : "border-muted hover:border-blue-500/50"
                      )}
                    >
                      <RadioGroupItem value={type.id} id={`type-${type.id}`} className="sr-only" />
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{type.label}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {/* Phase 3: Details */}
          {currentPhase === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Enter Details</h3>
              
              <div className="space-y-3">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={showTitle}
                    onChange={(e) => setShowTitle(e.target.value)}
                    placeholder={`Enter ${EVENT_CATEGORIES.find(c => c.id === eventCategory)?.label.toLowerCase()} title`}
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={showDescription}
                    onChange={(e) => setShowDescription(e.target.value)}
                    placeholder="Brief description (optional)"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{EVENT_CATEGORIES.find(c => c.id === eventCategory)?.label}</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="outline">{availableTypes.find(t => t.id === showType)?.label}</Badge>
                </div>
                
                <Button 
                  onClick={handleCreateShow}
                  disabled={!showTitle.trim() || !showType}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
                >
                  Create & Start Workflow
                </Button>
              </div>
            </div>
          )}

          {/* Dynamic Stage Phases (Phase 4+) */}
          {currentPhase >= 3 && currentPhaseData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = currentPhaseData.icon;
                  return <IconComponent className="h-5 w-5 text-blue-500" />;
                })()}
                <h3 className="font-semibold">{currentPhaseData.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPhaseData.description}
              </p>
              
              {currentPhaseData.stageId && renderStageAction(currentPhaseData.stageId)}
              
              {currentPhaseData.isComplete && (
                <Badge className="bg-green-500/10 text-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Stage completed
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={currentPhase === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={goNext}
            disabled={currentPhase === phases.length - 1 || (currentPhase === 0 && !eventCategory) || (currentPhase === 1 && !showType)}
          >
            {currentPhase < 2 ? 'Next' : 'Skip'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionGuidedWizard;
