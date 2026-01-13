/**
 * Production Hub - Vertical Swimlane Kanban production pipeline management
 * Supports Media Productions, Business Meetings, and Events
 * Includes meeting booking, invite sending, calendar sync, reschedule/cancel
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  ArrowLeft, 
  Users, 
  FileText, 
  Video, 
  Loader2,
  Trash2,
  ChevronRight,
  Music,
  User,
  UserPlus,
  Link,
  FolderOpen,
  Podcast,
  Calendar,
  Briefcase,
  CalendarDays,
  Send,
  Mail,
  ExternalLink,
  Copy,
  Download,
  CalendarPlus,
  Linkedin,
  Phone,
  Bell,
  MessageSquare,
  Globe,
  Edit,
  CalendarClock,
  XCircle,
  Zap,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useShows } from '@/hooks/useShows';
import { useProjects } from '@/hooks/useProjects';
import { useGenieScripts } from '@/components/genie-studio/useGenieScripts';
import { VerticalKanban } from '@/components/production/VerticalKanban';
import { ProductionCalendar } from '@/components/production/ProductionCalendar';
import { ScheduleManagementDialog } from '@/components/production/ScheduleManagementDialog';
import { UnifiedScheduleShowDialog, type ScheduleShowData } from '@/components/production/UnifiedScheduleShowDialog';
import { WebinarHighlightExtractor, BRollIntegrator, DistributionAgentPanel } from '@/components/shared';
import { ProductionGuidedWizard } from '@/components/production/ProductionGuidedWizard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  PRODUCTION_STAGES,
  MEETING_STAGES,
  EVENT_STAGES,
  SHOW_TYPES, 
  EVENT_CATEGORIES,
  getStagesForCategory,
  getShowTypesForCategory,
  type ShowWithParticipants, 
  type ProductionStage,
  type MeetingStage,
  type EventStage,
  type ShowType,
  type EventCategory
} from '@/types/shows';
import { COMMON_TIMEZONES, formatDateWithTimezone, getLocalTimezone } from '@/utils/timezoneUtils';
import { generateAutoMeetingUrl, MeetingPlatform, MEETING_PLATFORMS } from '@/utils/meetingUrlGenerator';

// Helper to get stage-specific required fields
const getStageRequirements = (stage: ProductionStage) => {
  switch (stage) {
    case 'outreach':
      return { showHost: true, showGuests: true, showScript: false, showMusic: false };
    case 'script':
      return { showHost: true, showGuests: true, showScript: true, showMusic: false };
    case 'rehearsal':
      return { showHost: true, showGuests: true, showScript: true, showMusic: true };
    case 'recording':
      return { showHost: true, showGuests: true, showScript: true, showMusic: true };
    case 'post_production':
      return { showHost: false, showGuests: false, showScript: true, showMusic: true };
    case 'published':
      return { showHost: false, showGuests: false, showScript: false, showMusic: false };
    default:
      return { showHost: true, showGuests: true, showScript: false, showMusic: false };
  }
};

export default function ProductionHub() {
  const navigate = useNavigate();
  const { 
    shows, 
    isLoading, 
    createShow, 
    updateStage,
    updateMeetingStage,
    updateEventStage,
    deleteShow,
    getShowsByStage 
  } = useShows();
  
  // Projects for hierarchy
  const { projects, createProject } = useProjects();
  
  // Get scripts for linking
  const { scripts: availableScripts } = useGenieScripts();

  // Category state for tabs
  const [activeCategory, setActiveCategory] = useState<EventCategory>('media_production');
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedShow, setSelectedShow] = useState<ShowWithParticipants | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<EventCategory>('media_production');
  const [newShow, setNewShow] = useState({
    title: '',
    description: '',
    show_type: 'podcast' as ShowType,
    scheduled_date: '',
    starting_stage: 'outreach' as ProductionStage,
    host_name: '',
    host_email: '',
    host_phone: '',
    host_linkedin: '',
    guests: [] as { name: string; email: string; phone?: string; linkedin?: string }[],
    linked_script_id: '',
    linked_music_id: '',
    event_category: 'media_production' as EventCategory,
    meeting_url: '',
    topics: '',
    // Reminder settings
    enable_email_reminders: true,
    enable_sms_reminders: false,
  });
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestLinkedin, setNewGuestLinkedin] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Invite dialog state
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteLinkedin, setInviteLinkedin] = useState('');
  const [inviteRole, setInviteRole] = useState<'host' | 'co-host' | 'guest' | 'panelist'>('guest');
  const [sendSmsReminder, setSendSmsReminder] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  
  // Schedule management dialog state
  const [isScheduleManagementOpen, setIsScheduleManagementOpen] = useState(false);
  const [scheduleManagementShow, setScheduleManagementShow] = useState<ShowWithParticipants | null>(null);
  
  // Selected timezone for display
  const [displayTimezone, setDisplayTimezone] = useState(getLocalTimezone());
  
  // Meeting URL platform state
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>('auto');

  const showsByStage = getShowsByStage(activeCategory);
  
  // Get stage requirements based on starting stage
  const stageRequirements = getStageRequirements(newShow.starting_stage);
  
  const handleAddGuest = () => {
    if (!newGuestName.trim()) return;
    setNewShow(prev => ({
      ...prev,
      guests: [...prev.guests, { 
        name: newGuestName.trim(), 
        email: newGuestEmail.trim(),
        phone: newGuestPhone.trim() || undefined,
        linkedin: newGuestLinkedin.trim() || undefined,
      }]
    }));
    setNewGuestName('');
    setNewGuestEmail('');
    setNewGuestPhone('');
    setNewGuestLinkedin('');
  };
  
  const handleRemoveGuest = (index: number) => {
    setNewShow(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index)
    }));
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
        host_name: newShow.host_name || undefined,
        guest_info: newShow.guests.length > 0 ? newShow.guests : undefined,
        linked_script_id: newShow.linked_script_id || undefined,
        linked_music_id: newShow.linked_music_id || undefined,
      });
      setIsCreateDialogOpen(false);
      setNewShow({ 
        title: '', 
        description: '', 
        show_type: 'podcast', 
        scheduled_date: '',
        starting_stage: 'outreach',
        host_name: '',
        host_email: '',
        host_phone: '',
        host_linkedin: '',
        guests: [],
        linked_script_id: '',
        linked_music_id: '',
        event_category: 'media_production',
        meeting_url: '',
        topics: '',
        enable_email_reminders: true,
        enable_sms_reminders: false,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject({ name: newProjectName });
    setNewProjectName('');
    setIsCreateProjectOpen(false);
  };

  const handleOpenRecordingStudio = (show: ShowWithParticipants) => {
    navigate(`/genie-studio?showId=${show.id}`);
  };

  // Send invite handler
  const handleSendInvite = async (
    show: ShowWithParticipants, 
    email: string, 
    role: 'host' | 'co-host' | 'guest' | 'panelist',
    phone?: string,
    linkedin?: string,
    sendSms?: boolean
  ) => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSendingInvite(true);
    try {
      // Get linked script from assets if available
      const linkedScriptAsset = show.assets?.find(a => a.asset_type === 'script');
      const linkedScript = linkedScriptAsset 
        ? availableScripts.find(s => s.name === linkedScriptAsset.name) 
        : null;

      // Get host name from participants or metadata
      const hostParticipant = show.participants?.find(p => p.role === 'host');
      const hostName = hostParticipant?.name || (show.metadata as any)?.host_name || 'Host';

      // Send email invite
      const { data, error } = await supabase.functions.invoke('send-show-invite', {
        body: {
          to: email,
          participantName: email.split('@')[0],
          role,
          showType: show.show_type,
          showTitle: show.title,
          showDescription: show.description,
          scheduledDate: show.scheduled_date,
          hostName,
          topics: (show.metadata as any)?.topics || '',
          script: linkedScript?.content?.substring(0, 500),
          scriptAttachmentUrl: linkedScriptAsset?.file_url,
          scriptFilename: linkedScriptAsset?.name,
          joinUrl: show.meeting_link,
          durationMinutes: show.duration_minutes || 60,
          linkedinUrl: linkedin,
        },
      });

      if (error) throw error;

      // Send SMS if phone provided and SMS enabled
      if (sendSms && phone) {
        try {
          await supabase.functions.invoke('twilio-notifications', {
            body: {
              type: 'sms',
              to: phone,
              message: `🎙️ You're invited to "${show.title}" as ${role}. Date: ${show.scheduled_date ? new Date(show.scheduled_date).toLocaleString() : 'TBD'}. Join: ${show.meeting_link || 'Link coming soon'}`,
            },
          });
          toast.success(`Invite sent to ${email} + SMS to ${phone}!`);
        } catch (smsError) {
          console.error('SMS send failed:', smsError);
          toast.success(`Email invite sent to ${email}. SMS failed.`);
        }
      } else {
        toast.success(`Invite sent to ${email}!`);
      }

      setIsInviteDialogOpen(false);
      setInviteEmail('');
      setInvitePhone('');
      setInviteLinkedin('');
      setSendSmsReminder(false);
    } catch (err) {
      console.error('Error sending invite:', err);
      toast.error('Failed to send invite');
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Copy meeting URL to clipboard
  const handleCopyMeetingUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Meeting URL copied to clipboard');
  };
  
  // Reschedule show handler
  const handleReschedule = async (showId: string, newDate: string, notifyParticipants: boolean) => {
    try {
      const { error } = await supabase
        .from('shows')
        .update({ scheduled_date: newDate })
        .eq('id', showId);
      
      if (error) throw error;
      
      // Send notification emails if requested
      if (notifyParticipants) {
        const show = shows.find(s => s.id === showId);
        if (show?.participants) {
          for (const participant of show.participants) {
            if (participant.email) {
              await supabase.functions.invoke('send-show-invite', {
                body: {
                  to: participant.email,
                  participantName: participant.name,
                  role: participant.role,
                  showType: show.show_type,
                  showTitle: show.title,
                  scheduledDate: newDate,
                  isReschedule: true,
                  joinUrl: show.meeting_link,
                },
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Reschedule error:', err);
      throw err;
    }
  };
  
  // Cancel show handler
  const handleCancelShow = async (showId: string, reason?: string) => {
    try {
      const show = shows.find(s => s.id === showId);
      
      // Notify participants before deleting
      if (show?.participants) {
        for (const participant of show.participants) {
          if (participant.email) {
            await supabase.functions.invoke('send-show-invite', {
              body: {
                to: participant.email,
                participantName: participant.name,
                showTitle: show.title,
                showType: show.show_type,
                isCancellation: true,
                cancellationReason: reason,
              },
            });
          }
        }
      }
      
      // Delete the show
      await deleteShow(showId);
    } catch (err) {
      console.error('Cancel error:', err);
      throw err;
    }
  };
  
  // Update show handler
  const handleUpdateShow = async (showId: string, updates: Partial<ShowWithParticipants>) => {
    try {
      const { error } = await supabase
        .from('shows')
        .update(updates)
        .eq('id', showId);
      
      if (error) throw error;
    } catch (err) {
      console.error('Update error:', err);
      throw err;
    }
  };
  
  // Open schedule management dialog
  const openScheduleManagement = (show: ShowWithParticipants) => {
    setScheduleManagementShow(show);
    setIsScheduleManagementOpen(true);
  };

  // Generate calendar URL with full details
  const generateCalendarUrl = (show: ShowWithParticipants, type: 'google' | 'outlook' | 'yahoo') => {
    const startDate = new Date(show.scheduled_date || new Date());
    const endDate = new Date(startDate.getTime() + (show.duration_minutes || 60) * 60 * 1000);
    
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Build rich description with meeting URL, topics, host info
    const participants = show.participants || [];
    const host = participants.find(p => p.role === 'host');
    const guests = participants.filter(p => p.role !== 'host');
    
    const lines: string[] = [];
    if (show.meeting_link) {
      lines.push('🎬 JOIN MEETING:');
      lines.push(show.meeting_link);
      lines.push('');
    }
    if (show.description) {
      lines.push(show.description);
      lines.push('');
    }
    const metadata = (show.metadata || {}) as Record<string, any>;
    if (metadata.topics) {
      lines.push('📋 TOPICS:');
      lines.push(metadata.topics);
      lines.push('');
    }
    if (host) {
      lines.push(`🎙️ Host: ${host.name}`);
    }
    if (guests.length > 0) {
      lines.push(`👥 Guests: ${guests.map(g => g.name).join(', ')}`);
    }
    lines.push('');
    lines.push('─────────────────────');
    lines.push('✨ Powered by Genie Studio');
    
    const richDescription = lines.join('\n');
    
    if (type === 'google') {
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `🎬 ${show.title} - Genie Studio`,
        dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
        details: richDescription,
        location: show.meeting_link || '',
      });
      if (participants.filter(p => p.email).length > 0) {
        params.set('add', participants.filter(p => p.email).map(p => p.email as string).join(','));
      }
      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    } else if (type === 'yahoo') {
      const duration = show.duration_minutes || 60;
      const hours = Math.floor(duration / 60).toString().padStart(2, '0');
      const minutes = (duration % 60).toString().padStart(2, '0');
      const params = new URLSearchParams({
        v: '60',
        title: `🎬 ${show.title} - Genie Studio`,
        st: formatDate(startDate),
        dur: `${hours}${minutes}`,
        desc: richDescription,
        in_loc: show.meeting_link || '',
      });
      return `https://calendar.yahoo.com/?${params.toString()}`;
    } else {
      const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: `🎬 ${show.title} - Genie Studio`,
        startdt: startDate.toISOString(),
        enddt: endDate.toISOString(),
        body: richDescription,
        location: show.meeting_link || '',
      });
      return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
    }
  };

  // Download ICS file for calendar
  const downloadCalendarIcs = (show: ShowWithParticipants) => {
    const startDate = new Date(show.scheduled_date || new Date());
    const endDate = new Date(startDate.getTime() + (show.duration_minutes || 60) * 60 * 1000);
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const participants = show.participants || [];
    const host = participants.find(p => p.role === 'host');
    const guests = participants.filter(p => p.role !== 'host');
    const metadata = (show.metadata || {}) as Record<string, any>;
    
    let description = '';
    if (show.meeting_link) description += `JOIN MEETING:\\n${show.meeting_link}\\n\\n`;
    if (show.description) description += `${show.description}\\n\\n`;
    if (metadata.topics) description += `TOPICS:\\n${metadata.topics}\\n\\n`;
    if (host) description += `Host: ${host.name}\\n`;
    if (guests.length > 0) description += `Guests: ${guests.map(g => g.name).join(', ')}\\n`;
    description += '\\n------------------------\\nPowered by Genie Studio';
    
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Genie Studio//AI-Powered Production Platform//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Genie Studio',
      'BEGIN:VEVENT',
      `UID:${show.id}@genie-studio`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${show.title.replace(/,/g, '\\,').replace(/;/g, '\\;')} - Genie Studio`,
      `DESCRIPTION:${description}`,
      show.meeting_link ? `LOCATION:${show.meeting_link.replace(/,/g, '\\,').replace(/;/g, '\\;')}` : '',
      show.meeting_link ? `URL:${show.meeting_link}` : '',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Genie Studio - Session in 30 minutes',
      'TRIGGER:-PT30M',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Genie Studio - Session in 15 minutes',
      'TRIGGER:-PT15M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    
    const blob = new Blob([lines], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${show.title.replace(/[^a-z0-9]/gi, '_')}_genie_studio.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Calendar file downloaded!');
  };

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
                Manage productions, meetings, and events
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Project Selector */}
            <Select 
              value={selectedProject || '__all__'} 
              onValueChange={(val) => setSelectedProject(val === '__all__' ? null : val)}
            >
              <SelectTrigger className="w-[200px]">
                <FolderOpen className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
                <div className="border-t mt-1 pt-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setIsCreateProjectOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Production
            </Button>
            {/* View Toggle */}
            <div className="flex border rounded-lg p-1 bg-muted/50">
              <Button 
                variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="h-8"
              >
                Pipeline
              </Button>
              <Button 
                variant={viewMode === 'calendar' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="h-8"
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                Calendar
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs & Kanban Board */}
        <div className="flex-1 overflow-auto">
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as EventCategory)} className="h-full flex flex-col">
            <div className="px-4 pt-4 border-b bg-muted/30">
              <TabsList className="grid w-full max-w-3xl grid-cols-6">
                <TabsTrigger value="guide" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Guide
                </TabsTrigger>
                <TabsTrigger value="media_production" className="flex items-center gap-2">
                  <Podcast className="h-4 w-4" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="business_meeting" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Meetings
                </TabsTrigger>
                <TabsTrigger value="event" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="highlights" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Highlights
                </TabsTrigger>
                <TabsTrigger value="distribution" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Distribute
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Guided Wizard Tab */}
            <TabsContent value="guide" className="flex-1 p-4 mt-0">
              <ProductionGuidedWizard
                onCreateShow={(data) => {
                  setNewShow(prev => ({ 
                    ...prev, 
                    title: data.title, 
                    show_type: data.type,
                    event_category: data.category 
                  }));
                  setIsCreateDialogOpen(true);
                }}
                onInviteGuests={() => {
                  if (selectedShow) setIsInviteDialogOpen(true);
                }}
                onLinkScript={() => navigate('/genie-spark')}
                onScheduleRehearsals={() => {
                  if (selectedShow) setIsScheduleManagementOpen(true);
                }}
                onStartRecording={() => navigate('/genie-vibe')}
                currentStage={(selectedShow as any)?.stage || (selectedShow as any)?.production_stage || 'outreach'}
                hasShow={shows.length > 0}
                hasGuests={selectedShow?.participants?.length ? selectedShow.participants.length > 0 : false}
                hasScript={selectedShow?.assets?.some(a => a.asset_type === 'script') || false}
              />
            </TabsContent>
            
            {/* Media/Meetings/Events Content */}
            <TabsContent value="media_production" className="flex-1 p-4 mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : viewMode === 'kanban' ? (
                <VerticalKanban
                  showsByStage={showsByStage}
                  onSelectShow={setSelectedShow}
                  onOpenRecordingStudio={handleOpenRecordingStudio}
                  onUpdateStage={async (showId, newStage) => {
                    await updateStage(showId, newStage as ProductionStage);
                  }}
                  eventCategory="media_production"
                />
              ) : (
                <ProductionCalendar
                  shows={shows.filter(s => s.event_category === 'media_production')}
                  onShowClick={setSelectedShow}
                  onScheduleNew={(date, time) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const dateTimeStr = `${dateStr}T${time}`;
                    setNewShow(prev => ({ ...prev, scheduled_date: dateTimeStr }));
                    setIsCreateDialogOpen(true);
                  }}
                />
              )}
            </TabsContent>
            
            <TabsContent value="business_meeting" className="flex-1 p-4 mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : viewMode === 'kanban' ? (
                <VerticalKanban
                  showsByStage={showsByStage}
                  onSelectShow={setSelectedShow}
                  onOpenRecordingStudio={handleOpenRecordingStudio}
                  onUpdateStage={async (showId, newStage) => {
                    await updateMeetingStage(showId, newStage as MeetingStage);
                  }}
                  eventCategory="business_meeting"
                />
              ) : (
                <ProductionCalendar
                  shows={shows.filter(s => s.event_category === 'business_meeting')}
                  onShowClick={setSelectedShow}
                  onScheduleNew={(date, time) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const dateTimeStr = `${dateStr}T${time}`;
                    setNewShow(prev => ({ ...prev, scheduled_date: dateTimeStr }));
                    setIsCreateDialogOpen(true);
                  }}
                />
              )}
            </TabsContent>
            
            <TabsContent value="event" className="flex-1 p-4 mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : viewMode === 'kanban' ? (
                <VerticalKanban
                  showsByStage={showsByStage}
                  onSelectShow={setSelectedShow}
                  onOpenRecordingStudio={handleOpenRecordingStudio}
                  onUpdateStage={async (showId, newStage) => {
                    await updateEventStage(showId, newStage as EventStage);
                  }}
                  eventCategory="event"
                />
              ) : (
                <ProductionCalendar
                  shows={shows.filter(s => s.event_category === 'event')}
                  onShowClick={setSelectedShow}
                  onScheduleNew={(date, time) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const dateTimeStr = `${dateStr}T${time}`;
                    setNewShow(prev => ({ ...prev, scheduled_date: dateTimeStr }));
                    setIsCreateDialogOpen(true);
                  }}
                />
              )}
            </TabsContent>
            
            {/* Highlights Tab - Webinar Highlight Extractor */}
            <TabsContent value="highlights" className="flex-1 p-4 mt-0">
              <WebinarHighlightExtractor
                onExtractComplete={(highlights) => {
                  toast.success(`Extracted ${highlights.length} highlights!`);
                }}
              />
            </TabsContent>
            
            {/* Distribution Tab */}
            <TabsContent value="distribution" className="flex-1 p-4 mt-0">
              <DistributionAgentPanel
                onDistributionComplete={(results) => {
                  const successCount = results.filter(r => r.status === 'success').length;
                  toast.success(`Published to ${successCount} platforms!`);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Project Dialog */}
        <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Projects group related productions together
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="e.g., Q1 Marketing Campaign"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateProjectOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Show Dialog - Using Unified Component */}
        <UnifiedScheduleShowDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSchedule={async (data: ScheduleShowData) => {
            // Create show in database - this auto-generates the meeting_link
            const newShow = await createShow({
              title: data.title,
              description: data.description || undefined,
              show_type: data.show_type,
              scheduled_date: data.scheduled_date || undefined,
              starting_stage: data.starting_stage as ProductionStage,
              host_name: data.host.name || undefined,
              guest_info: data.guests.length > 0 ? data.guests.map(g => ({
                name: g.name,
                email: g.email,
                phone: g.phone,
                linkedin: g.linkedin_url,
              })) : undefined,
              linked_script_id: data.linked_script_id || undefined,
              linked_music_id: data.linked_music_id || undefined,
            });
            
            // Use the auto-generated meeting link from the new show
            const meetingUrl = newShow?.meeting_link || data.meeting_url;
            
            // Send invites to host if email provided
            if (data.host.email && data.enable_email_reminders) {
              try {
                const linkedScript = data.linked_script_id 
                  ? availableScripts.find(s => s.id === data.linked_script_id) 
                  : null;
                
                await supabase.functions.invoke('send-show-invite', {
                  body: {
                    to: data.host.email,
                    participantName: data.host.name || 'Host',
                    role: 'host',
                    showType: data.show_type,
                    showTitle: data.title,
                    showDescription: data.description,
                    scheduledDate: data.scheduled_date,
                    hostName: data.host.name || 'Host',
                    hostEmail: data.host.email,
                    senderName: data.host.name || 'Host',
                    senderEmail: data.host.email,
                    category: 'media_production',
                    stage: 'scheduled',
                    topics: data.topics,
                    script: linkedScript?.content?.substring(0, 500),
                    joinUrl: meetingUrl,
                    durationMinutes: 60,
                  },
                });
                console.log('[ProductionHub] Host invite sent to:', data.host.email);
              } catch (err) {
                console.error('[ProductionHub] Failed to send host invite:', err);
              }
            }
            
            // Send SMS to host if phone provided
            if (data.host.phone && data.enable_sms_reminders) {
              try {
                await supabase.functions.invoke('twilio-notifications', {
                  body: {
                    type: 'sms',
                    to: data.host.phone,
                    message: `🎙️ You're hosting "${data.title}" on ${data.scheduled_date ? new Date(data.scheduled_date).toLocaleString() : 'TBD'}. ${meetingUrl ? `Join: ${meetingUrl}` : ''}`,
                  },
                });
                console.log('[ProductionHub] Host SMS sent to:', data.host.phone);
              } catch (err) {
                console.error('[ProductionHub] Failed to send host SMS:', err);
              }
            }
            
            // Send invites to all guests
            for (const guest of data.guests) {
              if (guest.email && data.enable_email_reminders) {
                try {
                  const linkedScript = data.linked_script_id 
                    ? availableScripts.find(s => s.id === data.linked_script_id) 
                    : null;
                  
                  await supabase.functions.invoke('send-show-invite', {
                    body: {
                      to: guest.email,
                      participantName: guest.name,
                      role: 'guest',
                      showType: data.show_type,
                      showTitle: data.title,
                      showDescription: data.description,
                      scheduledDate: data.scheduled_date,
                      hostName: data.host.name || 'Host',
                      hostEmail: data.host.email,
                      senderName: data.host.name || 'Host',
                      senderEmail: data.host.email,
                      category: 'media_production',
                      stage: 'scheduled',
                      topics: data.topics,
                      script: data.attach_script_to_invite && linkedScript?.content?.substring(0, 500),
                      joinUrl: meetingUrl,
                      durationMinutes: 60,
                    },
                  });
                  console.log('[ProductionHub] Guest invite sent to:', guest.email);
                } catch (err) {
                  console.error('[ProductionHub] Failed to send guest invite:', err);
                }
              }
              
              // Send SMS to guest if phone provided
              if (guest.phone && data.enable_sms_reminders) {
                try {
                  await supabase.functions.invoke('twilio-notifications', {
                    body: {
                      type: 'sms',
                      to: guest.phone,
                      message: `🎙️ You're invited to "${data.title}" on ${data.scheduled_date ? new Date(data.scheduled_date).toLocaleString() : 'TBD'}. ${meetingUrl ? `Join: ${meetingUrl}` : ''}`,
                    },
                  });
                } catch (err) {
                  console.error('[ProductionHub] Failed to send guest SMS:', err);
                }
              }
            }
            
            toast.success('Production created and invites sent!');
          }}
          availableScripts={availableScripts.map(s => ({ id: s.id, name: s.name, content: s.content || '' }))}
          initialData={{
            scheduled_date: newShow.scheduled_date,
            event_category: activeCategory,
          }}
        />

        {/* Show Detail Panel - Genie Studio Branded */}
        <Dialog open={!!selectedShow} onOpenChange={(open) => !open && setSelectedShow(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
            {selectedShow && (
              <>
                <DialogHeader className="pb-4 border-b border-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                        {selectedShow.title}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="capitalize bg-gradient-to-r from-primary/20 to-pink-500/20 border-primary/30 text-primary">
                          {selectedShow.show_type?.replace('_', ' ')}
                        </Badge>
                        {selectedShow.scheduled_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(selectedShow.scheduled_date), 'MMM d, yyyy h:mm a')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Powered by</p>
                      <p className="text-sm font-semibold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                        ✨ Genie Studio
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Stage Progress */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Production Stage</Label>
                    <div className="flex items-center gap-1 flex-wrap">
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

                  {/* Participants - Genie Studio Branded */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Participants</span>
                        {selectedShow.participants && selectedShow.participants.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedShow.participants.length}
                          </Badge>
                        )}
                      </Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsInviteDialogOpen(true)}
                        className="bg-gradient-to-r from-primary/10 to-pink-500/10 border-primary/30 hover:bg-primary/20"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send Invite
                      </Button>
                    </div>
                    {selectedShow.participants && selectedShow.participants.length > 0 ? (
                      <div className="space-y-2">
                        {selectedShow.participants.map((participant) => (
                          <div 
                            key={participant.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border transition-colors",
                              participant.role === 'host' 
                                ? "bg-gradient-to-r from-primary/10 to-pink-500/10 border-primary/30" 
                                : "bg-background/50 border-border/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className={cn(
                                "h-10 w-10",
                                participant.role === 'host' && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                              )}>
                                <AvatarFallback className={cn(
                                  "text-sm",
                                  participant.role === 'host' && "bg-gradient-to-br from-primary to-pink-500 text-white"
                                )}>
                                  {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{participant.name}</p>
                                  {participant.role === 'host' && (
                                    <Badge className="text-xs bg-gradient-to-r from-primary to-pink-500 text-white border-0">
                                      Host
                                    </Badge>
                                  )}
                                  {participant.linkedin_url && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 text-[#0A66C2]"
                                      onClick={() => window.open(participant.linkedin_url!, '_blank')}
                                    >
                                      <Linkedin className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {participant.role !== 'host' && participant.role.replace('_', ' ')}
                                  {participant.email && ` • ${participant.email}`}
                                </p>
                                {participant.phone && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {participant.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={participant.status === 'confirmed' ? 'default' : 'secondary'}
                                className={cn(
                                  "capitalize",
                                  participant.status === 'confirmed' && "bg-green-500/20 text-green-500 border-green-500/30"
                                )}
                              >
                                {participant.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 px-4 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                        <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">No participants added yet</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsInviteDialogOpen(true)}
                          className="bg-gradient-to-r from-primary/10 to-pink-500/10"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Add Participants
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Meeting URL & Calendar */}
                  {selectedShow.meeting_link && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Meeting Link</Label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm truncate flex-1">{selectedShow.meeting_link}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => handleCopyMeetingUrl(selectedShow.meeting_link!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => window.open(selectedShow.meeting_link!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Calendar Integration - Genie Studio Branded */}
                  {selectedShow.scheduled_date && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-pink-500/10 border border-primary/20">
                      <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                        <CalendarPlus className="h-4 w-4 text-primary" />
                        <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent font-semibold">
                          Add to Calendar
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">(includes meeting link & details)</span>
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generateCalendarUrl(selectedShow, 'google'), '_blank')}
                          className="bg-background/80 border-primary/30 hover:bg-primary/10"
                        >
                          📅 Google Calendar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generateCalendarUrl(selectedShow, 'outlook'), '_blank')}
                          className="bg-background/80 border-blue-500/30 hover:bg-blue-500/10"
                        >
                          📧 Outlook
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generateCalendarUrl(selectedShow, 'yahoo'), '_blank')}
                          className="bg-background/80 border-violet-500/30 hover:bg-violet-500/10"
                        >
                          🗓️ Yahoo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadCalendarIcs(selectedShow)}
                          className="bg-background/80 border-pink-500/30 hover:bg-pink-500/10"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          .ics
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        ✨ Calendar invite includes meeting URL, topics & host details
                      </p>
                    </div>
                  )}

                  {/* Assets */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Assets & Attachments</Label>
                    {selectedShow.assets && selectedShow.assets.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedShow.assets.map((asset) => (
                          <div 
                            key={asset.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate flex-1">{asset.name}</span>
                            {asset.file_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0"
                                onClick={() => window.open(asset.file_url!, '_blank')}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No assets linked yet</p>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t border-primary/10">
                  <div className="flex gap-2 flex-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        openScheduleManagement(selectedShow);
                        setSelectedShow(null);
                      }}
                      className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-blue-500/30 hover:bg-blue-500/20"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit / Reschedule
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        deleteShow(selectedShow.id);
                        setSelectedShow(null);
                      }}
                      className="bg-gradient-to-r from-red-500/80 to-red-600/80"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {selectedShow.current_stage === 'recording' && (
                      <Button 
                        onClick={() => handleOpenRecordingStudio(selectedShow)}
                        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Recording Studio
                      </Button>
                    )}
                    {selectedShow.current_stage !== 'published' && (
                      <Button 
                        onClick={async () => {
                          const stageIndex = PRODUCTION_STAGES.findIndex(s => s.id === selectedShow.current_stage);
                          if (stageIndex < PRODUCTION_STAGES.length - 1) {
                            await updateStage(selectedShow.id, PRODUCTION_STAGES[stageIndex + 1].id);
                          }
                          setSelectedShow(null);
                        }}
                        className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                      >
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

        {/* Send Invite Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Send Invite
              </DialogTitle>
              <DialogDescription>
                Send an invite email with meeting details, script attachments, and optional SMS
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite_email">Email Address *</Label>
                <Input
                  id="invite_email"
                  type="email"
                  placeholder="participant@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="invite_phone" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone (SMS)
                  </Label>
                  <Input
                    id="invite_phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="host">Host</SelectItem>
                      <SelectItem value="co-host">Co-Host</SelectItem>
                      <SelectItem value="guest">Guest Speaker</SelectItem>
                      <SelectItem value="panelist">Panelist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* LinkedIn URL - show for podcast/interview/panel */}
              {selectedShow && ['podcast', 'interview', 'panel'].includes(selectedShow.show_type) && (
                <div className="space-y-2">
                  <Label htmlFor="invite_linkedin" className="flex items-center gap-1">
                    <Linkedin className="h-3 w-3 text-[#0A66C2]" />
                    LinkedIn Profile URL
                  </Label>
                  <Input
                    id="invite_linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={inviteLinkedin}
                    onChange={(e) => setInviteLinkedin(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for introductions when publishing the {selectedShow.show_type}
                  </p>
                </div>
              )}

              {/* SMS Reminder toggle */}
              {invitePhone && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Send SMS Invite Now</p>
                      <p className="text-xs text-muted-foreground">Also send reminders 30m & 15m before</p>
                    </div>
                  </div>
                  <Button 
                    variant={sendSmsReminder ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSendSmsReminder(!sendSmsReminder)}
                  >
                    {sendSmsReminder ? 'Yes' : 'No'}
                  </Button>
                </div>
              )}

              {selectedShow && (
                <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedShow.title}</span>
                  </div>
                  {selectedShow.scheduled_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(selectedShow.scheduled_date).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedShow.meeting_link && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate">{selectedShow.meeting_link}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => selectedShow && handleSendInvite(
                  selectedShow, 
                  inviteEmail, 
                  inviteRole,
                  invitePhone || undefined,
                  inviteLinkedin || undefined,
                  sendSmsReminder
                )}
                disabled={isSendingInvite || !inviteEmail.trim()}
              >
                {isSendingInvite && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Mail className="h-4 w-4 mr-2" />
                Send Invite {sendSmsReminder && '+ SMS'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Management Dialog */}
        <ScheduleManagementDialog
          show={scheduleManagementShow}
          open={isScheduleManagementOpen}
          onOpenChange={setIsScheduleManagementOpen}
          onUpdate={handleUpdateShow}
          onCancel={handleCancelShow}
          onReschedule={handleReschedule}
        />
      </div>
    </AppLayout>
  );
}
