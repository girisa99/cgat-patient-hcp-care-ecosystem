/**
 * Production Hub - Vertical Swimlane Kanban production pipeline management
 * Supports Media Productions, Business Meetings, and Events
 * Includes meeting booking, invite sending, and calendar sync
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useShows } from '@/hooks/useShows';
import { useProjects } from '@/hooks/useProjects';
import { useGenieScripts } from '@/components/genie-studio/useGenieScripts';
import { VerticalKanban } from '@/components/production/VerticalKanban';
import { ProductionCalendar } from '@/components/production/ProductionCalendar';
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
    guests: [] as { name: string; email: string }[],
    linked_script_id: '',
    linked_music_id: '',
    event_category: 'media_production' as EventCategory,
    meeting_url: '',
    topics: '',
  });
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Invite dialog state
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'host' | 'co-host' | 'guest' | 'panelist'>('guest');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const showsByStage = getShowsByStage(activeCategory);
  
  // Get stage requirements based on starting stage
  const stageRequirements = getStageRequirements(newShow.starting_stage);
  
  const handleAddGuest = () => {
    if (!newGuestName.trim()) return;
    setNewShow(prev => ({
      ...prev,
      guests: [...prev.guests, { name: newGuestName.trim(), email: newGuestEmail.trim() }]
    }));
    setNewGuestName('');
    setNewGuestEmail('');
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
        guests: [],
        linked_script_id: '',
        linked_music_id: '',
        event_category: 'media_production',
        meeting_url: '',
        topics: '',
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
  const handleSendInvite = async (show: ShowWithParticipants, email: string, role: 'host' | 'co-host' | 'guest' | 'panelist') => {
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
        },
      });

      if (error) throw error;

      toast.success(`Invite sent to ${email}!`);
      setIsInviteDialogOpen(false);
      setInviteEmail('');
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

        {/* Create Show Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New {EVENT_CATEGORIES.find(c => c.id === newEventCategory)?.label || 'Production'}</DialogTitle>
              <DialogDescription>
                Set up your {getShowTypesForCategory(newEventCategory).find(t => t.id === newShow.show_type)?.label || 'production'}. Fields adapt based on starting stage.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-4">
                {/* Event Category Selection */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {EVENT_CATEGORIES.map((cat) => {
                      const isSelected = newEventCategory === cat.id;
                      const Icon = cat.id === 'media_production' ? Podcast : cat.id === 'business_meeting' ? Briefcase : Calendar;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setNewEventCategory(cat.id);
                            const types = getShowTypesForCategory(cat.id);
                            const stages = getStagesForCategory(cat.id);
                            setNewShow(prev => ({
                              ...prev,
                              show_type: types[0]?.id as ShowType,
                              starting_stage: stages[0]?.id as ProductionStage,
                              event_category: cat.id,
                            }));
                          }}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                            isSelected 
                              ? "border-primary bg-primary/10" 
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                          <span className={cn("text-xs font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>
                            {cat.label.replace(' Production', '').replace(' Meeting', 's')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter production title..."
                    value={newShow.title}
                    onChange={(e) => setNewShow(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                        {getShowTypesForCategory(newEventCategory).map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="starting_stage">Starting Stage</Label>
                    <Select
                      value={newShow.starting_stage}
                      onValueChange={(value: ProductionStage) => setNewShow(prev => ({ ...prev, starting_stage: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {getStagesForCategory(newEventCategory).map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                              {stage.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Scheduled Date</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newShow.scheduled_date}
                    onChange={(e) => setNewShow(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_url" className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Meeting/Join URL
                  </Label>
                  <Input
                    id="meeting_url"
                    type="url"
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    value={newShow.meeting_url}
                    onChange={(e) => setNewShow(prev => ({ ...prev, meeting_url: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add a Zoom, Google Meet, or Teams link for participants
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topics">Topics / Agenda</Label>
                  <Input
                    id="topics"
                    placeholder="Key topics to discuss..."
                    value={newShow.topics}
                    onChange={(e) => setNewShow(prev => ({ ...prev, topics: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description..."
                    value={newShow.description}
                    onChange={(e) => setNewShow(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                {/* Dynamic Fields Based on Stage */}
                {(stageRequirements.showHost || stageRequirements.showGuests) && (
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Participants
                    </h4>
                    
                    {stageRequirements.showHost && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="host_name" className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            Host Name
                          </Label>
                          <Input
                            id="host_name"
                            placeholder="Enter host name..."
                            value={newShow.host_name}
                            onChange={(e) => setNewShow(prev => ({ ...prev, host_name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="host_email" className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            Host Email
                          </Label>
                          <Input
                            id="host_email"
                            type="email"
                            placeholder="host@example.com"
                            value={newShow.host_email}
                            onChange={(e) => setNewShow(prev => ({ ...prev, host_email: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}

                    {stageRequirements.showGuests && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <UserPlus className="h-3 w-3" />
                          Guests
                        </Label>
                        
                        {newShow.guests.length > 0 && (
                          <div className="space-y-1">
                            {newShow.guests.map((guest, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                                <span>{guest.name} {guest.email && `(${guest.email})`}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => handleRemoveGuest(idx)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="Guest name"
                            value={newGuestName}
                            onChange={(e) => setNewGuestName(e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Email (optional)"
                            value={newGuestEmail}
                            onChange={(e) => setNewGuestEmail(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={handleAddGuest}
                            disabled={!newGuestName.trim()}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Script & Music Linking */}
                {(stageRequirements.showScript || stageRequirements.showMusic) && (
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Link Assets
                    </h4>
                    
                    {stageRequirements.showScript && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          Script
                        </Label>
                        <Select
                          value={newShow.linked_script_id || '__none__'}
                          onValueChange={(value) => setNewShow(prev => ({ ...prev, linked_script_id: value === '__none__' ? '' : value }))}
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
                        <p className="text-xs text-muted-foreground">
                          Link an existing script or create one later
                        </p>
                      </div>
                    )}

                    {stageRequirements.showMusic && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Music className="h-3 w-3" />
                          Background Music
                        </Label>
                        <Select
                          value={newShow.linked_music_id || '__none__'}
                          onValueChange={(value) => setNewShow(prev => ({ ...prev, linked_music_id: value === '__none__' ? '' : value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select music (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            <SelectItem value="ambient-1">Ambient Background</SelectItem>
                            <SelectItem value="upbeat-1">Upbeat Intro</SelectItem>
                            <SelectItem value="corporate-1">Corporate Theme</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="border-t pt-4">
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

        {/* Send Invite Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Send Invite
              </DialogTitle>
              <DialogDescription>
                Send an invite email with meeting details and script attachments
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite_email">Email Address</Label>
                <Input
                  id="invite_email"
                  type="email"
                  placeholder="participant@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
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
                onClick={() => selectedShow && handleSendInvite(selectedShow, inviteEmail, inviteRole)}
                disabled={isSendingInvite || !inviteEmail.trim()}
              >
                {isSendingInvite && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
