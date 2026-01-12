/**
 * UnifiedScheduleShowDialog - Shared component for scheduling shows
 * Used in both Arc (GenieStudio) and Production Hub with consistent features
 * Includes: Category, Type, Stage, Participants, Meeting URL, Reminders, Timezone,
 * AI Title Suggestions, Script Upload/Selection, Multi-Provider AI Support
 */

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  Sparkles,
  Wand2,
  Upload,
  Zap,
  Copy,
  Download,
} from 'lucide-react';
import {
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
import {
  generateGoogleCalendarUrl,
  generateOutlookUrl,
  generateYahooCalendarUrl,
  downloadIcsFile,
  getGenieMeetingDisplayUrl,
  type CalendarEvent,
} from '@/utils/calendarUtils';

// Meeting platform types
export type MeetingPlatform = 'auto' | 'google_meet' | 'zoom' | 'teams' | 'custom';

// AI Provider types
type AIProvider = 'gemini' | 'openai' | 'anthropic';
type AIModel = string;

// Meeting platform configurations
const MEETING_PLATFORMS = [
  { id: 'auto' as MeetingPlatform, label: 'Auto-Generate (Genie)', icon: '🌐', description: 'Generate a Genie Studio meeting URL' },
  { id: 'google_meet' as MeetingPlatform, label: 'Google Meet', icon: '📹', description: 'Add Google Meet code' },
  { id: 'zoom' as MeetingPlatform, label: 'Zoom', icon: '🎥', description: 'Add Zoom meeting ID' },
  { id: 'teams' as MeetingPlatform, label: 'Microsoft Teams', icon: '👥', description: 'Paste Teams URL' },
  { id: 'custom' as MeetingPlatform, label: 'Custom URL', icon: '🔗', description: 'Enter any URL' },
];

// Props interface
export interface UnifiedScheduleShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (data: ScheduleShowData) => Promise<void>;
  initialData?: Partial<ScheduleShowData>;
  mode?: 'create' | 'edit';
  showSteps?: boolean;
  availableScripts?: { id: string; name: string; content?: string }[];
  variant?: 'arc' | 'production-hub';
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
  suggested_title?: string;
  suggested_intro?: string;
  ai_provider?: AIProvider;
  ai_model?: AIModel;
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

// Generate meeting URL - uses genieaiexperimentationhub.tech for external sharing
// but will route to /meeting/:code which connects to Genie Vibe
const generateGenieMeetingUrl = (): string => {
  const meetingCode = crypto.randomUUID().split('-').slice(0, 3).join('-');
  // Production domain for external sharing; locally routes to /meeting/:code → Genie Vibe
  return `https://genieaiexperimentationhub.tech/meeting/${meetingCode}`;
};

// Format platform-specific URLs
const formatMeetingUrl = (platform: MeetingPlatform, customInput?: string): string => {
  switch (platform) {
    case 'auto':
      return generateGenieMeetingUrl();
    case 'google_meet':
      if (customInput) {
        const cleanCode = customInput.replace(/[^a-z0-9-]/gi, '');
        return `https://meet.google.com/${cleanCode}`;
      }
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&add=video`;
    case 'zoom':
      if (customInput) {
        const cleanId = customInput.replace(/\D/g, '');
        return `https://zoom.us/j/${cleanId}`;
      }
      return 'https://zoom.us/start/webmeeting';
    case 'teams':
      return customInput || 'https://teams.microsoft.com/l/meetup-join/';
    case 'custom':
      return customInput || '';
    default:
      return generateGenieMeetingUrl();
  }
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
  host: { name: '', email: '', phone: '', linkedin_url: '' },
  guests: [],
  linked_script_id: '',
  linked_music_id: '',
  enable_email_reminders: true,
  enable_sms_reminders: false,
  script_content: '',
  attach_script_to_invite: true,
  suggested_title: '',
  suggested_intro: '',
  ai_provider: 'gemini',
  ai_model: 'google/gemini-3-flash-preview',
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
  
  // AI generation state
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
  const [aiModel, setAiModel] = useState<AIModel>('google/gemini-3-flash-preview');
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [suggestedIntro, setSuggestedIntro] = useState('');
  
  // Meeting URL state
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>('auto');
  const [platformInput, setPlatformInput] = useState('');
  const [urlCopied, setUrlCopied] = useState(false);
  
  // Script state
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [scriptContent, setScriptContent] = useState('');
  const [attachScriptToInvite, setAttachScriptToInvite] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      const defaultData = createDefaultData();
      setFormData(initialData ? { ...defaultData, ...initialData } : defaultData);
      setCurrentStep('details');
      setSuggestedTitle('');
      setSuggestedIntro('');
      setScriptContent('');
      setSelectedScriptId(null);
      setMeetingPlatform('auto');
      setPlatformInput('');
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

  // Generate AI suggestions for title and intro
  const handleGenerateSuggestions = async () => {
    if (!formData.topics.trim() && !scriptContent.trim()) {
      toast.error('Please add topics or script content first');
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      const prompt = `You are helping create a ${formData.show_type} show.
Topics: ${formData.topics || 'Not specified'}
Script/Content: ${scriptContent ? scriptContent.substring(0, 1000) : 'Not provided'}
Show Type: ${formData.show_type}
Category: ${formData.event_category}

Generate:
1. A catchy, engaging title (max 60 characters)
2. A brief introduction paragraph for the host to use (2-3 sentences)

Respond in JSON format: {"title": "...", "intro": "..."}`;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          provider: aiProvider,
          model: aiModel,
          extractJson: true,
        },
      });

      if (error) throw error;

      const response = data?.response || data?.content || '';
      try {
        // Try to parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setSuggestedTitle(parsed.title || '');
          setSuggestedIntro(parsed.intro || '');
          toast.success('AI suggestions generated!');
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        // Fallback: use response as intro
        setSuggestedIntro(response);
        toast.success('AI suggestion generated!');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate suggestions. Please try again.');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // Handle script selection
  const handleScriptSelect = (scriptId: string) => {
    setSelectedScriptId(scriptId);
    const script = availableScripts.find(s => s.id === scriptId);
    if (script?.content) {
      setScriptContent(script.content);
      updateFormData('linked_script_id', scriptId);
    }
  };

  // Handle script file upload
  const handleScriptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setScriptContent(text);
      setSelectedScriptId(null);
      updateFormData('script_content', text);
      toast.success(`Script "${file.name}" loaded!`);
    } catch (error) {
      toast.error('Failed to read script file');
    }
  };

  // Generate meeting URL
  const handleGenerateMeetingUrl = () => {
    const url = formatMeetingUrl(meetingPlatform, platformInput);
    updateFormData('meeting_url', url);
    updateFormData('meeting_platform', meetingPlatform);
    toast.success('Meeting URL generated!');
  };

  // Copy meeting URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(formData.meeting_url);
    setUrlCopied(true);
    toast.success('URL copied!');
    setTimeout(() => setUrlCopied(false), 2000);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsSubmitting(true);
    try {
      // Auto-generate meeting URL if not set and platform is auto
      let finalUrl = formData.meeting_url;
      if (!finalUrl && meetingPlatform === 'auto') {
        finalUrl = generateGenieMeetingUrl();
      }

      await onSchedule({
        ...formData,
        meeting_url: finalUrl,
        meeting_platform: meetingPlatform,
        script_content: scriptContent,
        attach_script_to_invite: attachScriptToInvite,
        suggested_title: suggestedTitle,
        suggested_intro: suggestedIntro,
        ai_provider: aiProvider,
        ai_model: aiModel,
      });
      
      toast.success('Production scheduled successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Schedule error:', error);
      toast.error('Failed to schedule production');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get stage requirements based on starting stage
  const getStageRequirements = (stage: string) => {
    switch (stage) {
      case 'outreach':
        return { showHost: true, showGuests: true, showScript: false };
      case 'script':
        return { showHost: true, showGuests: true, showScript: true };
      case 'rehearsal':
      case 'recording':
        return { showHost: true, showGuests: true, showScript: true };
      default:
        return { showHost: true, showGuests: true, showScript: false };
    }
  };

  const stageRequirements = getStageRequirements(formData.starting_stage);
  const currentShowTypes = getShowTypesForCategory(formData.event_category);
  const showGuestsSection = ['podcast', 'interview', 'panel', 'webinar', 'conference'].includes(formData.show_type);

  // Render step indicator
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
                <div className={cn("h-6 w-6 rounded-md bg-gradient-to-br flex items-center justify-center", stage.color)}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <span className={cn("text-[10px] font-medium leading-tight text-center", isSelected ? "text-primary" : "text-muted-foreground")}>
                  {stage.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Build calendar event object
  const buildCalendarEvent = (): CalendarEvent | null => {
    if (!formData.scheduled_date || !formData.title) return null;
    
    const startTime = new Date(formData.scheduled_date);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    return {
      title: formData.title,
      description: formData.description,
      startTime,
      endTime,
      meetingUrl: formData.meeting_url,
      topics: formData.topics,
      hostName: formData.host.name,
      guestNames: formData.guests.map(g => g.name),
      organizer: formData.host.email,
      attendees: formData.guests.map(g => g.email).filter(Boolean),
    };
  };

  // Handle add to calendar
  const handleAddToCalendar = (type: 'google' | 'outlook' | 'yahoo' | 'ics') => {
    const event = buildCalendarEvent();
    if (!event) {
      toast.error('Please set a title and date first');
      return;
    }
    
    switch (type) {
      case 'google':
        window.open(generateGoogleCalendarUrl(event), '_blank');
        break;
      case 'outlook':
        window.open(generateOutlookUrl(event), '_blank');
        break;
      case 'yahoo':
        window.open(generateYahooCalendarUrl(event), '_blank');
        break;
      case 'ics':
        downloadIcsFile(event, `${formData.title.replace(/[^a-z0-9]/gi, '_')}_genie_studio.ics`);
        toast.success('Calendar file downloaded!');
        break;
    }
  };

  // Render meeting URL section
  const renderMeetingUrlSection = () => (
    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
      <Label className="flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        Meeting / Join URL
      </Label>
      
      {/* Platform Selection */}
      <div className="flex flex-wrap gap-1.5">
        {MEETING_PLATFORMS.map((p) => (
          <Badge
            key={p.id}
            variant={meetingPlatform === p.id ? 'default' : 'outline'}
            className="cursor-pointer text-xs py-1 px-2"
            onClick={() => {
              setMeetingPlatform(p.id);
              setPlatformInput('');
            }}
          >
            <span className="mr-1">{p.icon}</span>
            {p.label.split(' ')[0]}
          </Badge>
        ))}
      </div>

      {/* Platform-specific inputs */}
      {meetingPlatform === 'google_meet' && (
        <Input
          placeholder="Enter Google Meet code (abc-defg-hij)"
          value={platformInput}
          onChange={(e) => setPlatformInput(e.target.value)}
        />
      )}
      {meetingPlatform === 'zoom' && (
        <Input
          placeholder="Enter Zoom Meeting ID (123 456 7890)"
          value={platformInput}
          onChange={(e) => setPlatformInput(e.target.value)}
        />
      )}
      {(meetingPlatform === 'teams' || meetingPlatform === 'custom') && (
        <Input
          placeholder="Paste the full meeting URL"
          value={platformInput}
          onChange={(e) => setPlatformInput(e.target.value)}
        />
      )}

      {/* Generate / Apply button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerateMeetingUrl}
          className="flex-1"
        >
          <Zap className="h-4 w-4 mr-1" />
          {meetingPlatform === 'auto' ? 'Generate URL' : 'Apply URL'}
        </Button>
      </div>

      {/* Generated URL display with branding */}
      {formData.meeting_url && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-background rounded border">
            <Globe className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-medium text-primary">
                {formData.meeting_url.includes('genieaiexperimentationhub.tech') ? '🎬 Genie Studio Meeting' : 'Meeting URL'}
              </span>
              <span className="text-sm font-mono truncate">{formData.meeting_url}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyUrl}>
              {urlCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(formData.meeting_url, '_blank')}>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Add to Calendar buttons */}
          {formData.scheduled_date && formData.title && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Add to Calendar (includes meeting URL & details)
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddToCalendar('google')}
                  className="text-xs"
                >
                  📅 Google Calendar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddToCalendar('outlook')}
                  className="text-xs"
                >
                  📧 Outlook
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddToCalendar('yahoo')}
                  className="text-xs"
                >
                  🗓️ Yahoo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddToCalendar('ics')}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  .ics (Apple/Other)
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        🕐 URL activates 30 min before. Participants receive email & SMS reminders via Resend & Twilio.
      </p>
    </div>
  );

  // Render AI suggestions section
  const renderAISuggestionsSection = () => (
    <div className="space-y-3 border rounded-lg p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-purple-500" />
          AI-Suggested Title & Introduction
        </Label>
      </div>

      {/* AI Provider Selection */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[140px]">
          <Label className="text-xs text-muted-foreground mb-1 block">AI Provider</Label>
          <Select
            value={aiProvider}
            onValueChange={(v: AIProvider) => {
              setAiProvider(v);
              if (v === 'gemini') setAiModel('google/gemini-3-flash-preview');
              else if (v === 'openai') setAiModel('openai/gpt-5-mini');
              else if (v === 'anthropic') setAiModel('anthropic/claude-3-haiku');
            }}
          >
            <SelectTrigger className="h-9 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">🌟 Google Gemini</SelectItem>
              <SelectItem value="openai">🤖 OpenAI</SelectItem>
              <SelectItem value="anthropic">🧠 Anthropic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <Label className="text-xs text-muted-foreground mb-1 block">Model</Label>
          <Select value={aiModel} onValueChange={setAiModel}>
            <SelectTrigger className="h-9 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aiProvider === 'gemini' && (
                <>
                  <SelectItem value="google/gemini-3-flash-preview">Gemini 3 Flash (Fast)</SelectItem>
                  <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro (Best)</SelectItem>
                </>
              )}
              {aiProvider === 'openai' && (
                <>
                  <SelectItem value="openai/gpt-5-mini">GPT-5 Mini (Fast)</SelectItem>
                  <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                </>
              )}
              {aiProvider === 'anthropic' && (
                <>
                  <SelectItem value="anthropic/claude-3-haiku">Claude 3 Haiku (Fast)</SelectItem>
                  <SelectItem value="anthropic/claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSuggestions}
            disabled={isGeneratingSuggestions || (!formData.topics.trim() && !scriptContent.trim())}
            className="h-9"
          >
            {isGeneratingSuggestions ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions display */}
      {suggestedTitle && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Suggested Title</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={suggestedTitle}
                onChange={(e) => setSuggestedTitle(e.target.value)}
                className="bg-background"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFormData('title', suggestedTitle)}
              >
                Use
              </Button>
            </div>
          </div>
          {suggestedIntro && (
            <div>
              <Label className="text-xs text-muted-foreground">Suggested Introduction</Label>
              <Textarea
                value={suggestedIntro}
                onChange={(e) => setSuggestedIntro(e.target.value)}
                className="mt-1 text-sm bg-background"
                rows={3}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render script section
  const renderScriptSection = () => (
    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
      <Label className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Select or Upload Script
      </Label>
      <div className="flex gap-2">
        <Select
          value={selectedScriptId || ''}
          onValueChange={handleScriptSelect}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a saved script..." />
          </SelectTrigger>
          <SelectContent>
            {availableScripts.length === 0 ? (
              <SelectItem value="_none" disabled>No saved scripts</SelectItem>
            ) : (
              availableScripts.map(script => (
                <SelectItem key={script.id} value={script.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {script.name}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.doc,.docx"
            onChange={handleScriptUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="outline" className="pointer-events-none">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
      
      {(selectedScriptId || scriptContent) && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <Check className="h-3 w-3" />
          Script loaded - title and description will auto-populate
        </p>
      )}

      <div className="space-y-2">
        <Label className="text-sm">Script / Outline Content</Label>
        <Textarea
          value={scriptContent}
          onChange={(e) => {
            setScriptContent(e.target.value);
            setSelectedScriptId(null);
          }}
          placeholder="Paste your script or outline here, or select/upload above..."
          className="min-h-[100px] font-mono text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="attach-script"
          checked={attachScriptToInvite}
          onChange={(e) => setAttachScriptToInvite(e.target.checked)}
          className="rounded border-border"
        />
        <Label htmlFor="attach-script" className="text-sm cursor-pointer">
          Include script preview in participant invites
        </Label>
      </div>
    </div>
  );

  // Render host fields
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
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveGuest(idx)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Guest name *" value={newGuest.name} onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))} />
          <Input placeholder="Email" type="email" value={newGuest.email} onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Phone (for SMS)" value={newGuest.phone} onChange={(e) => setNewGuest(prev => ({ ...prev, phone: e.target.value }))} />
          <Input placeholder="LinkedIn URL" value={newGuest.linkedin_url} onChange={(e) => setNewGuest(prev => ({ ...prev, linkedin_url: e.target.value }))} />
        </div>
        <div className="flex gap-2">
          <Select value={newGuest.role} onValueChange={(v: any) => setNewGuest(prev => ({ ...prev, role: v }))}>
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
          <Button variant="outline" className="flex-1" onClick={handleAddGuest} disabled={!newGuest.name.trim()}>
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit' : 'Create New'} {EVENT_CATEGORIES.find(c => c.id === formData.event_category)?.label || 'Production'}
          </DialogTitle>
          <DialogDescription>
            Set up your {currentShowTypes.find(t => t.id === formData.show_type)?.label || 'production'}. Fields adapt based on starting stage.
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-4 py-4">
            {renderCategorySelection()}
            {renderTypeSelection()}
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
                <Label htmlFor="date">Scheduled Date & Time</Label>
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
                <Select value={formData.timezone} onValueChange={(v) => updateFormData('timezone', v)}>
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

            {/* Meeting URL Section */}
            {renderMeetingUrlSection()}

            {/* Topics */}
            <div className="space-y-2">
              <Label htmlFor="topics">Topics / Agenda</Label>
              <Input
                id="topics"
                placeholder="Key topics to discuss (comma-separated)..."
                value={formData.topics}
                onChange={(e) => updateFormData('topics', e.target.value)}
              />
            </div>

            {/* Script Section */}
            {renderScriptSection()}

            {/* AI Suggestions Section */}
            {renderAISuggestionsSection()}

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
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.title.trim() || isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'edit' ? 'Update' : 'Create'} Production
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UnifiedScheduleShowDialog;
