/**
 * UnifiedScheduleShowDialog - Shared component for scheduling shows
 * Used in both Arc (GenieStudio) and Production Hub with consistent features
 * Includes: Category, Type, Stage, Participants, Meeting URL, Reminders, Timezone
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Plus,
  Users,
  FileText,
  Video,
  Loader2,
  Trash2,
  Podcast,
  Calendar,
  Briefcase,
  Mail,
  ExternalLink,
  Linkedin,
  Phone,
  Bell,
  MessageSquare,
  Globe,
  User,
  UserPlus,
  Link,
  Music,
  Tv,
  Radio,
  GraduationCap,
  Wrench,
  Monitor,
  Building,
  BookOpen,
  Rocket,
  BarChart,
  MessageCircle,
  Play,
  PenTool,
  Check,
  Send,
} from 'lucide-react';
import {
  PRODUCTION_STAGES,
  MEETING_STAGES,
  EVENT_STAGES,
  SHOW_TYPES,
  EVENT_CATEGORIES,
  getStagesForCategory,
  getShowTypesForCategory,
  type ShowType,
  type EventCategory,
  type ProductionStage,
  type MeetingStage,
  type EventStage,
} from '@/types/shows';
import { COMMON_TIMEZONES, getLocalTimezone } from '@/utils/timezoneUtils';
import { MeetingPlatform } from '@/utils/meetingUrlGenerator';

// Props interface
export interface UnifiedScheduleShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (data: ScheduleShowData) => Promise<void>;
  initialData?: Partial<ScheduleShowData>;
  mode?: 'create' | 'edit';
  showSteps?: boolean; // For Arc style with 3 steps
  availableScripts?: { id: string; name: string; content?: string }[];
  variant?: 'arc' | 'production-hub'; // Which UI variant to use
}

// Data interface for the scheduled show
export interface ScheduleShowData {
  title: string;
  description: string;
  event_category: EventCategory;
  show_type: ShowType;
  starting_stage: ProductionStage | MeetingStage | EventStage;
  scheduled_date: string;
  timezone: string;
  meeting_url: string;
  meeting_platform: MeetingPlatform;
  topics: string;
  host: {
    name: string;
    email: string;
    phone?: string;
    linkedin_url?: string;
  };
  guests: {
    name: string;
    email: string;
    phone?: string;
    linkedin_url?: string;
    role: 'guest' | 'panelist' | 'co-host' | 'speaker';
  }[];
  linked_script_id?: string;
  linked_music_id?: string;
  enable_email_reminders: boolean;
  enable_sms_reminders: boolean;
  script_content?: string;
  attach_script_to_invite?: boolean;
}

// Icon map for show types
const SHOW_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  podcast: Podcast,
  webcast: Tv,
  interview: Users,
  panel: Users,
  tutorial: GraduationCap,
  broadcast: Radio,
  other: Video,
  discovery_call: Phone,
  sales_meeting: Briefcase,
  project_kickoff: Rocket,
  status_update: BarChart,
  consultation: MessageCircle,
  workshop: Wrench,
  webinar: Monitor,
  conference: Building,
  training_session: BookOpen,
};

// Color map for categories/types
const CATEGORY_COLORS: Record<string, string> = {
  media_production: 'from-purple-500 to-indigo-500',
  business_meeting: 'from-blue-500 to-cyan-500',
  event: 'from-orange-500 to-red-500',
};

const TYPE_COLORS: Record<string, string> = {
  podcast: 'from-purple-500 to-indigo-500',
  webcast: 'from-blue-500 to-cyan-500',
  interview: 'from-green-500 to-emerald-500',
  panel: 'from-yellow-500 to-orange-500',
  tutorial: 'from-pink-500 to-rose-500',
  broadcast: 'from-red-500 to-pink-500',
  discovery_call: 'from-blue-500 to-cyan-500',
  sales_meeting: 'from-green-500 to-emerald-500',
  project_kickoff: 'from-purple-500 to-indigo-500',
  status_update: 'from-yellow-500 to-orange-500',
  consultation: 'from-pink-500 to-rose-500',
  workshop: 'from-blue-500 to-cyan-500',
  webinar: 'from-purple-500 to-indigo-500',
  conference: 'from-green-500 to-emerald-500',
  training_session: 'from-orange-500 to-red-500',
};

// Stage icon map for production stages
const STAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  script_review: FileText,
  script: FileText,
  outreach: Mail,
  edit: PenTool,
  rehearsal: Play,
  final_review: Check,
  recording: Video,
  post_production: Video,
  published: Globe,
  scheduled: Calendar,
  confirmed: Check,
  agenda_prep: FileText,
  in_progress: Play,
  follow_up: MessageSquare,
  completed: Check,
  cancelled: Trash2,
  planning: FileText,
  promotion: Radio,
  registration: UserPlus,
  live: Radio,
  wrap_up: Check,
  archived: FileText,
};

// Default data factory
const createDefaultData = (): ScheduleShowData => ({
  title: '',
  description: '',
  event_category: 'media_production',
  show_type: 'podcast',
  starting_stage: 'outreach',
  scheduled_date: '',
  timezone: getLocalTimezone(),
  meeting_url: '',
  meeting_platform: 'auto',
  topics: '',
  host: {
    name: '',
    email: '',
    phone: '',
    linkedin_url: '',
  },
  guests: [],
  linked_script_id: '',
  linked_music_id: '',
  enable_email_reminders: true,
  enable_sms_reminders: false,
  script_content: '',
  attach_script_to_invite: false,
});

export function UnifiedScheduleShowDialog({
  open,
  onOpenChange,
  onSchedule,
  initialData,
  mode = 'create',
  showSteps = false,
  availableScripts = [],
  variant = 'production-hub',
}: UnifiedScheduleShowDialogProps) {
  // Form state
  const [formData, setFormData] = useState<ScheduleShowData>(createDefaultData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'content' | 'participants'>('details');
  
  // Guest form state
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    role: 'guest' as const,
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData(initialData ? { ...createDefaultData(), ...initialData } : createDefaultData());
      setCurrentStep('details');
    }
  }, [open, initialData]);

  // Update form data helper
  const updateFormData = <K extends keyof ScheduleShowData>(key: K, value: ScheduleShowData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Update host data helper
  const updateHost = <K extends keyof ScheduleShowData['host']>(key: K, value: string) => {
    setFormData(prev => ({
      ...prev,
      host: { ...prev.host, [key]: value },
    }));
  };

  // Handle category change
  const handleCategoryChange = (category: EventCategory) => {
    const types = getShowTypesForCategory(category);
    const stages = getStagesForCategory(category);
    setFormData(prev => ({
      ...prev,
      event_category: category,
      show_type: types[0]?.id as ShowType,
      starting_stage: stages[0]?.id as ProductionStage,
    }));
  };

  // Add guest
  const handleAddGuest = () => {
    if (!newGuest.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, { ...newGuest }],
    }));
    setNewGuest({ name: '', email: '', phone: '', linkedin_url: '', role: 'guest' });
  };

  // Remove guest
  const handleRemoveGuest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index),
    }));
  };

  // Handle meeting URL generation
  const handleMeetingUrlChange = (url: string, platform: MeetingPlatform) => {
    setFormData(prev => ({
      ...prev,
      meeting_url: url,
      meeting_platform: platform,
    }));
  };

  // Handle direct URL input change
  const handleDirectUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      meeting_url: e.target.value,
      meeting_platform: 'custom',
    }));
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Auto-generate meeting URL if platform is 'auto' and no URL provided
      let finalUrl = formData.meeting_url;
      if (!finalUrl && formData.meeting_platform === 'auto') {
        // Generate a simple meeting code without requiring showId
        const meetingCode = crypto.randomUUID().split('-').slice(0, 3).join('-');
        finalUrl = `${window.location.origin}/meeting/${meetingCode}`;
      }
      
      await onSchedule({
        ...formData,
        meeting_url: finalUrl,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get stage requirements based on starting stage
  const getStageRequirements = (stage: string) => {
    switch (stage) {
      case 'outreach':
        return { showHost: true, showGuests: true, showScript: false, showMusic: false };
      case 'script':
        return { showHost: true, showGuests: true, showScript: true, showMusic: false };
      case 'rehearsal':
        return { showHost: true, showGuests: true, showScript: true, showMusic: true };
      case 'recording':
        return { showHost: true, showGuests: true, showScript: true, showMusic: true };
      default:
        return { showHost: true, showGuests: true, showScript: false, showMusic: false };
    }
  };

  const stageRequirements = getStageRequirements(formData.starting_stage);
  const currentStages = getStagesForCategory(formData.event_category);
  const currentShowTypes = getShowTypesForCategory(formData.event_category);

  // Determine if we need guests (for podcast, interview, panel types)
  const showGuestsSection = ['podcast', 'interview', 'panel', 'webinar', 'conference'].includes(formData.show_type);

  // Render step indicator for Arc variant
  const renderStepIndicator = () => {
    if (!showSteps) return null;
    
    const steps = ['details', 'content', 'participants'];
    return (
      <div className="flex items-center gap-2 py-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                currentStep === step
                  ? "bg-primary text-primary-foreground"
                  : (currentStep === 'content' && i === 0) || (currentStep === 'participants' && i <= 1)
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  (currentStep === 'content' && i === 0) || currentStep === 'participants'
                    ? "bg-green-500"
                    : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render category selection
  const renderCategorySelection = () => (
    <div className="space-y-2">
      <Label>Category</Label>
      <div className="grid grid-cols-3 gap-2">
        {EVENT_CATEGORIES.map((cat) => {
          const isSelected = formData.event_category === cat.id;
          const Icon = cat.id === 'media_production' ? Podcast : cat.id === 'business_meeting' ? Briefcase : Calendar;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                CATEGORY_COLORS[cat.id]
              )}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className={cn("text-xs font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>
                {cat.label.replace(' Production', '').replace(' Meeting', 's')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Render type selection
  const renderTypeSelection = () => (
    <div className="space-y-2">
      <Label>Type</Label>
      <div className="grid grid-cols-3 gap-2">
        {currentShowTypes.map((type) => {
          const isSelected = formData.show_type === type.id;
          const Icon = SHOW_TYPE_ICONS[type.id] || Video;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => updateFormData('show_type', type.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                TYPE_COLORS[type.id] || 'from-gray-500 to-gray-600'
              )}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className={cn("text-xs font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>
                {type.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Render stage selection (for media productions)
  const renderStageSelection = () => {
    if (formData.event_category !== 'media_production') return null;
    
    return (
      <div className="space-y-2">
        <Label>Production Stage</Label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { value: 'outreach', label: 'Outreach', color: 'from-blue-500 to-cyan-500' },
            { value: 'script', label: 'Script', color: 'from-purple-500 to-indigo-500' },
            { value: 'rehearsal', label: 'Rehearsal', color: 'from-yellow-500 to-orange-500' },
            { value: 'recording', label: 'Recording', color: 'from-red-500 to-pink-500' },
            { value: 'post_production', label: 'Post', color: 'from-green-500 to-emerald-500' },
          ].map((stage) => {
            const isSelected = formData.starting_stage === stage.value;
            const Icon = STAGE_ICONS[stage.value] || FileText;
            return (
              <button
                key={stage.value}
                type="button"
                onClick={() => updateFormData('starting_stage', stage.value as ProductionStage)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-md bg-gradient-to-br flex items-center justify-center",
                  stage.color
                )}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <span className={cn(
                  "text-[10px] font-medium leading-tight text-center",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}>
                  {stage.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render host/organizer fields
  const renderHostFields = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <User className="h-4 w-4" />
        {formData.event_category === 'business_meeting' ? 'Organizer' : 'Host'} Details
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="host_name" className="text-xs">Name *</Label>
          <Input
            id="host_name"
            placeholder="Enter name..."
            value={formData.host.name}
            onChange={(e) => updateHost('name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="host_email" className="text-xs">Email *</Label>
          <Input
            id="host_email"
            type="email"
            placeholder="host@example.com"
            value={formData.host.email}
            onChange={(e) => updateHost('email', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="host_phone" className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            Phone (for SMS)
          </Label>
          <Input
            id="host_phone"
            type="tel"
            placeholder="+1234567890"
            value={formData.host.phone || ''}
            onChange={(e) => updateHost('phone', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="host_linkedin" className="text-xs text-muted-foreground flex items-center gap-1">
            <Linkedin className="h-3 w-3" />
            LinkedIn URL
          </Label>
          <Input
            id="host_linkedin"
            type="url"
            placeholder="https://linkedin.com/in/..."
            value={formData.host.linkedin_url || ''}
            onChange={(e) => updateHost('linkedin_url', e.target.value)}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        You will be automatically added as host and receive an invite.
      </p>
    </div>
  );

  // Render guests section
  const renderGuestsSection = () => {
    if (!showGuestsSection) return null;
    
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Guests / Panelists
        </h4>
        
        {formData.guests.length > 0 && (
          <div className="space-y-1.5">
            {formData.guests.map((guest, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {guest.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{guest.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[guest.email, guest.phone, guest.linkedin_url && 'LinkedIn'].filter(Boolean).join(' • ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-xs">{guest.role}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveGuest(idx)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add guest form */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Guest name *"
            value={newGuest.name}
            onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Email"
            type="email"
            value={newGuest.email}
            onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Phone (for SMS)"
            value={newGuest.phone}
            onChange={(e) => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
          />
          <Input
            placeholder="LinkedIn URL"
            value={newGuest.linkedin_url}
            onChange={(e) => setNewGuest(prev => ({ ...prev, linkedin_url: e.target.value }))}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={newGuest.role}
            onValueChange={(v: any) => setNewGuest(prev => ({ ...prev, role: v }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="guest">Guest</SelectItem>
              <SelectItem value="co-host">Co-Host</SelectItem>
              <SelectItem value="panelist">Panelist</SelectItem>
              <SelectItem value="speaker">Speaker</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleAddGuest}
            disabled={!newGuest.name.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Guest
          </Button>
        </div>
      </div>
    );
  };

  // Render reminder settings
  const renderReminderSettings = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Bell className="h-4 w-4" />
        Reminder Settings
      </h4>
      <p className="text-xs text-muted-foreground">
        Participants will receive reminders before the session starts.
      </p>
      
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium">Email Reminders</p>
            <p className="text-xs text-muted-foreground">24h, 1h, 30m, 15m before</p>
          </div>
        </div>
        <Button
          variant={formData.enable_email_reminders ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFormData('enable_email_reminders', !formData.enable_email_reminders)}
        >
          {formData.enable_email_reminders ? 'Enabled' : 'Disabled'}
        </Button>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium">SMS Reminders (Twilio)</p>
            <p className="text-xs text-muted-foreground">30m, 15m before (requires phone)</p>
          </div>
        </div>
        <Button
          variant={formData.enable_sms_reminders ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFormData('enable_sms_reminders', !formData.enable_sms_reminders)}
        >
          {formData.enable_sms_reminders ? 'Enabled' : 'Disabled'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit' : 'Create New'} {EVENT_CATEGORIES.find(c => c.id === formData.event_category)?.label || 'Production'}
          </DialogTitle>
          <DialogDescription>
            Set up your {currentShowTypes.find(t => t.id === formData.show_type)?.label || 'production'}. Fields adapt based on starting stage.
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-4">
            {/* Category Selection */}
            {renderCategorySelection()}

            {/* Type Selection */}
            {renderTypeSelection()}

            {/* Stage Selection */}
            {renderStageSelection()}

            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter production title..."
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
              />
            </div>

            {/* Date/Time with Timezone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Scheduled Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => updateFormData('scheduled_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Timezone
                </Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(v) => updateFormData('timezone', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Meeting URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ExternalLink className="h-3 w-3" />
                Meeting/Join URL
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  value={formData.meeting_url}
                  onChange={handleDirectUrlChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const meetingCode = crypto.randomUUID().split('-').slice(0, 3).join('-');
                    const url = `${window.location.origin}/meeting/${meetingCode}`;
                    setFormData(prev => ({ ...prev, meeting_url: url, meeting_platform: 'auto' }));
                  }}
                  title="Auto-generate URL"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add a Zoom, Google Meet, or Teams link, or click the button to auto-generate
              </p>
            </div>

            {/* Topics */}
            <div className="space-y-2">
              <Label htmlFor="topics">Topics / Agenda</Label>
              <Input
                id="topics"
                placeholder="Key topics to discuss..."
                value={formData.topics}
                onChange={(e) => updateFormData('topics', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={2}
              />
            </div>

            {/* Host/Organizer Fields */}
            <div className="border-t pt-4">
              {renderHostFields()}
            </div>

            {/* Guests Section */}
            {showGuestsSection && (
              <div className="border-t pt-4">
                {renderGuestsSection()}
              </div>
            )}

            {/* Script Linking (for media productions) */}
            {stageRequirements.showScript && availableScripts.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Link Assets
                </h4>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Script
                  </Label>
                  <Select
                    value={formData.linked_script_id || '__none__'}
                    onValueChange={(value) => updateFormData('linked_script_id', value === '__none__' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a script (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {availableScripts.map((script) => (
                        <SelectItem key={script.id} value={script.id}>
                          {script.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Reminder Settings */}
            <div className="border-t pt-4">
              {renderReminderSettings()}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title.trim() || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'edit' ? 'Update' : 'Create'} Production
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UnifiedScheduleShowDialog;
