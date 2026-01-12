/**
 * Production Hub - Vertical Swimlane Kanban production pipeline management
 * Supports Media Productions, Business Meetings, and Events
 * Includes meeting booking, invite sending, calendar sync, reschedule/cancel
 */

import React, { useState } from 'react';
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

  // Generate calendar URL
  const generateCalendarUrl = (show: ShowWithParticipants, type: 'google' | 'outlook') => {
    const startDate = new Date(show.scheduled_date || new Date());
    const endDate = new Date(startDate.getTime() + (show.duration_minutes || 60) * 60 * 1000);
    
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace('.000', '');
    
    if (type === 'google') {
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(show.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(show.description || '')}&location=${encodeURIComponent(show.meeting_link || '')}`;
    } else {
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(show.title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(show.description || '')}&location=${encodeURIComponent(show.meeting_link || '')}`;
    }
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
              <TabsList className="grid w-full max-w-md grid-cols-3">
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
              </TabsList>
            </div>
            
            <TabsContent value={activeCategory} className="flex-1 p-4 mt-0">
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
                    if (activeCategory === 'media_production') {
                      await updateStage(showId, newStage as ProductionStage);
                    } else if (activeCategory === 'business_meeting') {
                      await updateMeetingStage(showId, newStage as MeetingStage);
                    } else {
                      await updateEventStage(showId, newStage as EventStage);
                    }
                  }}
                  eventCategory={activeCategory}
                />
              ) : (
                <ProductionCalendar
                  shows={shows.filter(s => s.event_category === activeCategory)}
                  onShowClick={setSelectedShow}
                  onScheduleNew={(date, time) => {
                    // Pre-fill the date and time in the new show form
                    const dateStr = date.toISOString().split('T')[0];
                    const dateTimeStr = `${dateStr}T${time}`;
                    setNewShow(prev => ({ ...prev, scheduled_date: dateTimeStr }));
                    setIsCreateDialogOpen(true);
                  }}
                />
              )}
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
            // Create show in database
            await createShow({
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
                    topics: data.topics,
                    script: linkedScript?.content?.substring(0, 500),
                    joinUrl: data.meeting_url,
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
                    message: `🎙️ You're hosting "${data.title}" on ${data.scheduled_date ? new Date(data.scheduled_date).toLocaleString() : 'TBD'}. ${data.meeting_url ? `Join: ${data.meeting_url}` : ''}`,
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
                      topics: data.topics,
                      script: data.attach_script_to_invite && linkedScript?.content?.substring(0, 500),
                      joinUrl: data.meeting_url,
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
                      message: `🎙️ You're invited to "${data.title}" on ${data.scheduled_date ? new Date(data.scheduled_date).toLocaleString() : 'TBD'}. ${data.meeting_url ? `Join: ${data.meeting_url}` : ''}`,
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

        {/* Show Detail Panel */}
        <Dialog open={!!selectedShow} onOpenChange={(open) => !open && setSelectedShow(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedShow && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-muted-foreground" />
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

                  {/* Participants */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Participants</Label>
                      <Button variant="outline" size="sm" onClick={() => setIsInviteDialogOpen(true)}>
                        <Send className="h-3 w-3 mr-1" />
                        Send Invite
                      </Button>
                    </div>
                    {selectedShow.participants && selectedShow.participants.length > 0 ? (
                      <div className="space-y-2">
                        {selectedShow.participants.map((participant) => (
                          <div 
                            key={participant.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm">
                                  {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{participant.name}</p>
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
                                  {participant.role.replace('_', ' ')}
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
                                className="capitalize"
                              >
                                {participant.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No participants added yet</p>
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

                  {/* Calendar Integration */}
                  {selectedShow.scheduled_date && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Add to Calendar</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generateCalendarUrl(selectedShow, 'google'), '_blank')}
                        >
                          <CalendarPlus className="h-4 w-4 mr-1" />
                          Google Calendar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generateCalendarUrl(selectedShow, 'outlook'), '_blank')}
                        >
                          <CalendarPlus className="h-4 w-4 mr-1" />
                          Outlook
                        </Button>
                      </div>
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

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <div className="flex gap-2 flex-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        openScheduleManagement(selectedShow);
                        setSelectedShow(null);
                      }}
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
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Cancel
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
