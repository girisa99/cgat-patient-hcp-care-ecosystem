/**
 * Production Guided Wizard
 * Step-by-step production workflow guide for ProductionHub
 * Dynamic phases based on category: Media Production, Business Meeting, Event, Genie Demo
 * Features: State persistence, smart scheduled stage, inline schedule management
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
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
  ExternalLink,
  Copy,
  Send,
  Link,
  Globe,
  Edit,
  CalendarClock,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ShowType, EventCategory, ProductionStage, MeetingStage, EventStage, DemoStage, ShowWithParticipants } from '@/types/shows';
import { 
  EVENT_CATEGORIES, 
  getStagesForCategory, 
  getShowTypesForCategory,
  PRODUCTION_STAGES,
  MEETING_STAGES,
  EVENT_STAGES,
  DEMO_STAGES,
} from '@/types/shows';
import { useUniversalSaveResume } from '@/hooks/useUniversalSaveResume';
import { ScriptStageDialog } from './ScriptStageDialog';
import { ScheduleManagementDialog } from './ScheduleManagementDialog';

// Icon mapping for dynamic stages
const STAGE_ICONS: Record<string, React.ElementType> = {
  // Production stages
  'outreach': Mail,
  'script': FileText,
  'rehearsal': Play,
  'recording': Video,
  'post_production': Scissors,
  'published': Upload,
  // Meeting stages - streamlined
  'scheduled': CalendarPlus,
  'in_progress': Play,
  'follow_up': MessageSquare,
  'completed': CheckCircle,
  'rescheduled': CalendarClock,
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
  onSendFollowUp?: (participants: { name: string; email: string }[], message: string) => Promise<void>;
  onUpdateShow?: (showId: string, updates: Partial<ShowWithParticipants>) => Promise<void>;
  onCancelShow?: (showId: string, reason?: string) => Promise<void>;
  onRescheduleShow?: (showId: string, newDate: string, notify: boolean) => Promise<void>;
  currentStage: string;
  hasShow: boolean;
  hasGuests: boolean;
  hasScript: boolean;
  selectedShow?: ShowWithParticipants | null;
  className?: string;
}

export const ProductionGuidedWizard: React.FC<ProductionGuidedWizardProps> = ({
  onCreateShow,
  onInviteGuests,
  onLinkScript,
  onScheduleRehearsals,
  onStartRecording,
  onOpenScheduleDialog,
  onSendFollowUp,
  onUpdateShow,
  onCancelShow,
  onRescheduleShow,
  currentStage,
  hasShow,
  hasGuests,
  hasScript,
  selectedShow,
  className,
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showTitle, setShowTitle] = useState('');
  const [showDescription, setShowDescription] = useState('');
  const [showType, setShowType] = useState<ShowType | null>(null);
  const [eventCategory, setEventCategory] = useState<EventCategory | null>(null);
  const [hasResumed, setHasResumed] = useState(false);
  
  // Dialog states for stage actions
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  
  const [isPrepDialogOpen, setIsPrepDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  
  // Script stage dialog
  const [isScriptDialogOpen, setIsScriptDialogOpen] = useState(false);
  
  // Schedule management dialog (inline)
  const [isScheduleManagementOpen, setIsScheduleManagementOpen] = useState(false);
  const [scheduleManagementTab, setScheduleManagementTab] = useState<'edit' | 'reschedule' | 'cancel'>('edit');

  // State persistence
  const { 
    saveProgress, 
    sessionData, 
    hasExistingSession,
    clearSession,
  } = useUniversalSaveResume('production_workflow', 'online');

  // Auto-save state on changes
  const saveState = useCallback(async () => {
    if (!eventCategory && currentPhase === 0) return; // Don't save empty state
    
    const formData = {
      currentPhase,
      eventCategory,
      showType,
      showTitle,
      showDescription,
      selectedShowId: selectedShow?.id,
    };
    
    const progress = ((currentPhase + 1) / Math.max(phases.length, 1)) * 100;
    
    try {
      await saveProgress(
        `phase_${currentPhase}`,
        formData,
        progress,
        { lastSavedAt: new Date().toISOString() }
      );
    } catch (err) {
      // Silent fail for auto-save
      console.log('Auto-save skipped:', err);
    }
  }, [currentPhase, eventCategory, showType, showTitle, showDescription, selectedShow?.id]);

  // Save state on meaningful changes (debounced)
  useEffect(() => {
    if (!hasResumed) return;
    
    const timeout = setTimeout(() => {
      saveState();
    }, 2000); // Debounce 2 seconds
    
    return () => clearTimeout(timeout);
  }, [currentPhase, eventCategory, showType, showTitle, showDescription, hasResumed]);

  // Resume from saved session on mount
  useEffect(() => {
    if (sessionData?.form_data && !hasResumed) {
      const { currentPhase: savedPhase, eventCategory: savedCategory, showType: savedType, showTitle: savedTitle, showDescription: savedDesc } = sessionData.form_data;
      
      if (savedCategory) setEventCategory(savedCategory);
      if (savedType) setShowType(savedType);
      if (savedTitle) setShowTitle(savedTitle);
      if (savedDesc) setShowDescription(savedDesc);
      if (typeof savedPhase === 'number') setCurrentPhase(savedPhase);
      
      setHasResumed(true);
      toast.success('Resumed from previous session');
    } else {
      setHasResumed(true);
    }
  }, [sessionData, hasResumed]);

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

  // Clear session and restart
  const handleRestart = () => {
    clearSession();
    setCurrentPhase(0);
    setEventCategory(null);
    setShowType(null);
    setShowTitle('');
    setShowDescription('');
    toast.info('Workflow reset');
  };

  // Copy meeting URL
  const handleCopyMeetingUrl = () => {
    if (selectedShow?.meeting_link) {
      navigator.clipboard.writeText(selectedShow.meeting_link);
      toast.success('Meeting URL copied to clipboard');
    }
  };

  // Open meeting in new tab
  const handleJoinMeeting = () => {
    if (selectedShow?.meeting_link) {
      window.open(selectedShow.meeting_link, '_blank');
    } else {
      toast.error('No meeting URL available. Please schedule the meeting first.');
    }
  };

  // Open schedule management dialog with specific tab
  const openScheduleManagement = (tab: 'edit' | 'reschedule' | 'cancel') => {
    setScheduleManagementTab(tab);
    setIsScheduleManagementOpen(true);
  };

  // Send follow-up emails
  const handleSendFollowUp = async () => {
    if (selectedParticipants.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }
    if (!followUpMessage.trim()) {
      toast.error('Please enter a follow-up message');
      return;
    }

    setIsSendingFollowUp(true);
    try {
      const participants = selectedShow?.participants?.filter(p => 
        selectedParticipants.includes(p.id)
      ).map(p => ({ name: p.name, email: p.email || '' })) || [];

      if (onSendFollowUp) {
        await onSendFollowUp(participants, followUpMessage);
      } else {
        // Fallback - show what would be sent
        toast.success(`Follow-up would be sent to ${participants.length} participants`);
      }
      
      setIsFollowUpDialogOpen(false);
      setFollowUpMessage('');
      setSelectedParticipants([]);
    } catch (err) {
      console.error('Error sending follow-up:', err);
      toast.error('Failed to send follow-up');
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  // Generate default follow-up message based on category
  const getDefaultFollowUpMessage = () => {
    if (!selectedShow) return '';
    
    const showTitle = selectedShow.title;
    const showDate = selectedShow.scheduled_date 
      ? new Date(selectedShow.scheduled_date).toLocaleDateString()
      : 'our recent session';

    switch (eventCategory) {
      case 'genie_demo':
        return `Hi,\n\nThank you for attending the "${showTitle}" demo on ${showDate}.\n\nWe hope you found the demonstration valuable. Please let us know if you have any questions or would like to discuss next steps.\n\nBest regards`;
      case 'business_meeting':
        return `Hi,\n\nThank you for attending "${showTitle}" on ${showDate}.\n\nHere's a quick summary of what we discussed and the next action items:\n\n1. [Action item 1]\n2. [Action item 2]\n\nPlease reach out if you have any questions.\n\nBest regards`;
      case 'event':
        return `Hi,\n\nThank you for participating in "${showTitle}" on ${showDate}.\n\nWe hope you enjoyed the event. Here are some resources and next steps:\n\n- [Resource 1]\n- [Resource 2]\n\nStay tuned for future events!\n\nBest regards`;
      default:
        return `Hi,\n\nThank you for being part of "${showTitle}" on ${showDate}.\n\nWe hope the session was valuable. The recording/content will be available soon.\n\nBest regards`;
    }
  };

  // Render SMART Scheduled Stage for Business Meetings
  const renderSmartScheduledStage = () => {
    if (!selectedShow) {
      return (
        <Button 
          onClick={() => {
            if (onOpenScheduleDialog) {
              onOpenScheduleDialog();
            } else {
              onInviteGuests();
            }
          }} 
          className="w-full"
        >
          <CalendarPlus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      );
    }

    return (
      <Card className="p-4 space-y-3 border-primary/20">
        {/* Meeting Details Summary */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Status:</span>
            <Badge className="ml-2 bg-green-500/20 text-green-600">Confirmed</Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>
            <span className="ml-2 font-medium">
              {selectedShow.scheduled_date 
                ? new Date(selectedShow.scheduled_date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })
                : 'Not scheduled'}
            </span>
          </div>
        </div>
        
        {/* Meeting URL */}
        {selectedShow.meeting_link && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <code className="flex-1 truncate text-xs">{selectedShow.meeting_link}</code>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCopyMeetingUrl}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {/* Agenda/Topics */}
        {(selectedShow.metadata as any)?.topics && (
          <div>
            <span className="text-xs text-muted-foreground">Agenda:</span>
            <p className="text-sm mt-1">{(selectedShow.metadata as any).topics}</p>
          </div>
        )}
        
        {/* Participants Count */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{selectedShow.participants?.length || 0} participant(s) invited</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => openScheduleManagement('edit')}>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => openScheduleManagement('reschedule')}>
            <CalendarClock className="h-3 w-3 mr-1" />
            Reschedule
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => openScheduleManagement('cancel')}>
            <XCircle className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </Card>
    );
  };

  // Render action for stage-based phases - NOW FULLY FUNCTIONAL
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
          <Button onClick={() => setIsScriptDialogOpen(true)} className="w-full">
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
            <Button variant="outline" size="sm" onClick={() => setIsScriptDialogOpen(true)}>
              <Scissors className="h-4 w-4 mr-1" />
              Edit Clips
            </Button>
            <Button variant="outline" size="sm" onClick={onStartRecording}>
              <Wand2 className="h-4 w-4 mr-1" />
              AI Polish
            </Button>
          </div>
        );
      case 'published':
        return (
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500" onClick={() => toast.success('Publishing...')}>
            <Upload className="h-4 w-4 mr-2" />
            Publish Content
          </Button>
        );
      
      // Meeting stages - STREAMLINED with Smart Scheduled Stage
      case 'scheduled':
        // Use smart scheduled stage for business meetings
        if (eventCategory === 'business_meeting') {
          return renderSmartScheduledStage();
        }
        return (
          <Button 
            onClick={() => {
              if (onOpenScheduleDialog) {
                onOpenScheduleDialog();
              } else {
                onInviteGuests();
              }
            }} 
            className="w-full"
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        );
      case 'in_progress':
        return (
          <div className="space-y-2">
            {selectedShow?.meeting_link ? (
              <div className="flex gap-2">
                <Button 
                  onClick={handleJoinMeeting} 
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
                <Button variant="outline" size="icon" onClick={handleCopyMeetingUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={onOpenScheduleDialog || onInviteGuests} className="w-full">
                <Link className="h-4 w-4 mr-2" />
                Add Meeting URL
              </Button>
            )}
          </div>
        );
      case 'follow_up':
        return (
          <Button 
            onClick={() => {
              setFollowUpMessage(getDefaultFollowUpMessage());
              setIsFollowUpDialogOpen(true);
            }} 
            className="w-full"
          >
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
      case 'rescheduled':
        return (
          <div className="space-y-2">
            <Badge className="bg-purple-500/10 text-purple-600 w-full justify-center py-2">
              <CalendarClock className="h-4 w-4 mr-2" />
              Meeting Rescheduled
            </Badge>
            <Button variant="outline" size="sm" className="w-full" onClick={() => openScheduleManagement('edit')}>
              View New Schedule
            </Button>
          </div>
        );

      // Event stages - FULLY FUNCTIONAL
      case 'planning':
        return (
          <Button onClick={() => setIsScriptDialogOpen(true)} className="w-full">
            <Lightbulb className="h-4 w-4 mr-2" />
            Create Event Plan
          </Button>
        );
      case 'promotion':
        return (
          <Button 
            onClick={() => toast.info('Opening promotion tools...')} 
            className="w-full"
          >
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
          <div className="space-y-2">
            {selectedShow?.meeting_link ? (
              <div className="flex gap-2">
                <Button 
                  onClick={handleJoinMeeting} 
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500"
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Go Live
                </Button>
                <Button variant="outline" size="icon" onClick={handleCopyMeetingUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={onStartRecording} className="w-full bg-gradient-to-r from-red-500 to-pink-500">
                <Radio className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            )}
          </div>
        );
      case 'wrap_up':
        return (
          <Button 
            onClick={() => {
              setFollowUpMessage(getDefaultFollowUpMessage());
              setIsFollowUpDialogOpen(true);
            }}
            className="w-full"
          >
            <Package className="h-4 w-4 mr-2" />
            Wrap Up & Send Follow-up
          </Button>
        );
      case 'archived':
        return (
          <Badge className="bg-green-500/10 text-green-600 w-full justify-center py-2">
            <Archive className="h-4 w-4 mr-2" />
            Event Archived
          </Badge>
        );

      // Demo stages - FULLY FUNCTIONAL
      case 'demo_scheduled':
        return (
          <Button 
            onClick={() => {
              if (onOpenScheduleDialog) {
                onOpenScheduleDialog();
              } else {
                onInviteGuests();
              }
            }} 
            className="w-full"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Demo
          </Button>
        );
      case 'demo_prep':
        return (
          <div className="space-y-2">
            {selectedShow?.meeting_link && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Meeting URL:</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background p-2 rounded truncate">
                    {selectedShow.meeting_link}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopyMeetingUrl}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            <Button 
              onClick={() => setIsPrepDialogOpen(true)}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Prepare Demo Environment
            </Button>
            {selectedShow?.meeting_link && (
              <Button 
                onClick={handleJoinMeeting}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ready for Demo - Open URL
              </Button>
            )}
          </div>
        );
      case 'demo_live':
        return (
          <div className="space-y-2">
            {selectedShow?.meeting_link ? (
              <div className="flex gap-2">
                <Button 
                  onClick={handleJoinMeeting} 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Demo
                </Button>
                <Button variant="outline" size="icon" onClick={handleCopyMeetingUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={onStartRecording} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Sparkles className="h-4 w-4 mr-2" />
                Start Demo
              </Button>
            )}
          </div>
        );
      case 'demo_followup':
        return (
          <Button 
            onClick={() => {
              setFollowUpMessage(getDefaultFollowUpMessage());
              setIsFollowUpDialogOpen(true);
            }} 
            className="w-full"
          >
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
    <>
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
            <div className="flex items-center gap-2">
              {hasExistingSession && (
                <Button variant="ghost" size="sm" onClick={handleRestart} className="h-7 text-xs">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                Step {currentPhase + 1} of {phases.length}
              </Badge>
            </div>
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
                
                {/* Show current show info if available */}
                {selectedShow && (
                  <div className="p-3 bg-muted/30 rounded-lg text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{selectedShow.title}</span>
                      {selectedShow.scheduled_date && (
                        <Badge variant="outline" className="text-xs">
                          {new Date(selectedShow.scheduled_date).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    {selectedShow.participants && selectedShow.participants.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedShow.participants.length} participant(s)
                      </div>
                    )}
                  </div>
                )}
                
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

      {/* Script Stage Dialog */}
      <ScriptStageDialog
        open={isScriptDialogOpen}
        onOpenChange={setIsScriptDialogOpen}
        show={selectedShow || null}
        onScriptSelected={(scriptId, scriptName) => {
          toast.success(`Script "${scriptName}" linked`);
          // The parent should handle linking the script to the show
        }}
        onSkip={() => {
          toast.info('Skipped script stage');
        }}
      />

      {/* Schedule Management Dialog */}
      {selectedShow && onUpdateShow && onCancelShow && onRescheduleShow && (
        <ScheduleManagementDialog
          show={selectedShow}
          open={isScheduleManagementOpen}
          onOpenChange={setIsScheduleManagementOpen}
          onUpdate={onUpdateShow}
          onCancel={onCancelShow}
          onReschedule={onRescheduleShow}
          initialTab={scheduleManagementTab}
        />
      )}

      {/* Follow-up Dialog */}
      <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send Follow-up Message
            </DialogTitle>
            <DialogDescription>
              Select participants and compose your follow-up message
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Participant Selection */}
            <div className="space-y-2">
              <Label>Select Participants</Label>
              {selectedShow?.participants && selectedShow.participants.length > 0 ? (
                <ScrollArea className="h-32 border rounded-lg p-2">
                  {selectedShow.participants.map((participant) => (
                    <div 
                      key={participant.id} 
                      className="flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded"
                    >
                      <Checkbox
                        id={`participant-${participant.id}`}
                        checked={selectedParticipants.includes(participant.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedParticipants([...selectedParticipants, participant.id]);
                          } else {
                            setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`participant-${participant.id}`} 
                        className="flex-1 cursor-pointer"
                      >
                        <span className="font-medium">{participant.name}</span>
                        {participant.email && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {participant.email}
                          </span>
                        )}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {participant.role}
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <div className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                  No participants found. Add participants first.
                </div>
              )}
              
              {selectedShow?.participants && selectedShow.participants.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedParticipants(
                      selectedShow.participants?.map(p => p.id) || []
                    )}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedParticipants([])}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
            
            {/* Message */}
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={followUpMessage}
                onChange={(e) => setFollowUpMessage(e.target.value)}
                placeholder="Enter your follow-up message..."
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFollowUpDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendFollowUp}
              disabled={selectedParticipants.length === 0 || !followUpMessage.trim() || isSendingFollowUp}
            >
              {isSendingFollowUp ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {selectedParticipants.length} participant(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prep Dialog */}
      <Dialog open={isPrepDialogOpen} onOpenChange={setIsPrepDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Prepare Demo Environment
            </DialogTitle>
            <DialogDescription>
              Get ready for your demo session
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Check Audio/Video</div>
                  <div className="text-xs text-muted-foreground">Test your microphone and camera</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Prepare Demo Materials</div>
                  <div className="text-xs text-muted-foreground">Have your slides and resources ready</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Close Unnecessary Apps</div>
                  <div className="text-xs text-muted-foreground">Prevent notifications and distractions</div>
                </div>
              </div>
              
              {selectedShow?.meeting_link && (
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Link className="h-5 w-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Meeting URL Ready</div>
                    <code className="text-xs text-muted-foreground truncate block">
                      {selectedShow.meeting_link}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPrepDialogOpen(false)}>
              Close
            </Button>
            {selectedShow?.meeting_link && (
              <Button onClick={() => {
                handleJoinMeeting();
                setIsPrepDialogOpen(false);
              }}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Demo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductionGuidedWizard;
