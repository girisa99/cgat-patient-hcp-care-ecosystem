/**
 * Production Calendar - Enhanced visual calendar with scheduling capabilities
 * Features: Day click to schedule, week/month views, full legend, time slots
 * Uses UnifiedScheduleShowDialog for comprehensive scheduling
 */

import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  isToday,
  addWeeks,
  subWeeks,
  isWeekend,
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Video, 
  Podcast, 
  Radio, 
  Users, 
  Briefcase,
  Monitor,
  Phone,
  Mic,
  ExternalLink,
  Clock,
  User,
  Plus,
  CalendarDays,
  CalendarRange,
  Layers,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShowWithParticipants, ShowType, EventCategory } from '@/types/shows';
import { UnifiedScheduleShowDialog, type ScheduleShowData } from './UnifiedScheduleShowDialog';
import { useShows } from '@/hooks/useShows';
import { toast } from 'sonner';

// Color legend configuration for different show types - grouped by category
const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  media_production: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Media', icon: <Podcast className="h-3 w-3" /> },
  business_meeting: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Meetings', icon: <Briefcase className="h-3 w-3" /> },
  event: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Events', icon: <CalendarDays className="h-3 w-3" /> },
  genie_demo: { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400', label: 'Demos', icon: <Sparkles className="h-3 w-3" /> },
};

const SHOW_TYPE_COLORS: Record<ShowType, { bg: string; text: string; border: string; label: string; category: EventCategory }> = {
  // Media Productions
  podcast: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500', label: '🎙️ Podcast', category: 'media_production' },
  webcast: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500', label: '📺 Webcast', category: 'media_production' },
  interview: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500', label: '🎤 Interview', category: 'media_production' },
  panel: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500', label: '👥 Panel', category: 'media_production' },
  tutorial: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500', label: '📚 Tutorial', category: 'media_production' },
  broadcast: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500', label: '📡 Broadcast', category: 'media_production' },
  other: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500', label: '🎬 Other', category: 'media_production' },
  // Business Meetings
  discovery_call: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500', label: '📞 Discovery', category: 'business_meeting' },
  sales_meeting: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500', label: '💼 Sales', category: 'business_meeting' },
  project_kickoff: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500', label: '🚀 Kickoff', category: 'business_meeting' },
  status_update: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500', label: '📊 Status', category: 'business_meeting' },
  consultation: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500', label: '💬 Consult', category: 'business_meeting' },
  // Events
  workshop: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500', label: '🔧 Workshop', category: 'event' },
  webinar: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500', label: '🖥️ Webinar', category: 'event' },
  conference: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500', label: '🏛️ Conference', category: 'event' },
  training_session: { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500', label: '📖 Training', category: 'event' },
  // Genie Studio Demos
  genie_studio_full: { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400', border: 'border-fuchsia-500', label: '✨ Full Studio', category: 'genie_demo' },
  genie_spark_demo: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500', label: '⚡ Spark Demo', category: 'genie_demo' },
  genie_arc_demo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500', label: '🎬 Arc Demo', category: 'genie_demo' },
  genie_mind_demo: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500', label: '🧠 Mind Demo', category: 'genie_demo' },
  genie_vibe_demo: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500', label: '🎵 Vibe Demo', category: 'genie_demo' },
  genie_suite_overview: { bg: 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20', text: 'text-fuchsia-400', border: 'border-fuchsia-500', label: '🌟 Suite Overview', category: 'genie_demo' },
};

// Note: Time slot and duration options now handled by UnifiedScheduleShowDialog

const getShowTypeIcon = (type: ShowType) => {
  switch (type) {
    case 'podcast': return <Podcast className="h-3 w-3" />;
    case 'webcast': case 'webinar': return <Monitor className="h-3 w-3" />;
    case 'broadcast': return <Radio className="h-3 w-3" />;
    case 'interview': case 'panel': return <Mic className="h-3 w-3" />;
    case 'discovery_call': return <Phone className="h-3 w-3" />;
    case 'sales_meeting': case 'project_kickoff': return <Briefcase className="h-3 w-3" />;
    case 'workshop': case 'training_session': case 'tutorial': return <Users className="h-3 w-3" />;
    case 'conference': return <Users className="h-3 w-3" />;
    default: return <Video className="h-3 w-3" />;
  }
};

// Check if a day is a holiday (simplified - can be expanded)
const isHoliday = (date: Date): string | null => {
  const month = date.getMonth();
  const day = date.getDate();
  
  // US Holidays (simplified)
  if (month === 0 && day === 1) return "New Year's Day";
  if (month === 6 && day === 4) return "Independence Day";
  if (month === 11 && day === 25) return "Christmas Day";
  if (month === 11 && day === 31) return "New Year's Eve";
  
  return null;
};

interface ProductionCalendarProps {
  shows: ShowWithParticipants[];
  onShowClick?: (show: ShowWithParticipants) => void;
  onScheduleNew?: (date: Date, time: string) => void;
  onAddToGoogle?: (show: ShowWithParticipants) => void;
  onAddToOutlook?: (show: ShowWithParticipants) => void;
}

export function ProductionCalendar({ 
  shows, 
  onShowClick,
  onScheduleNew,
  onAddToGoogle,
  onAddToOutlook 
}: ProductionCalendarProps) {
  const { createShow } = useShows();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedShow, setSelectedShow] = useState<ShowWithParticipants | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Handler for UnifiedScheduleShowDialog
  const handleScheduleShow = async (data: ScheduleShowData) => {
    try {
      // Build guest_info array from guests
      const guestInfo = data.guests
        .filter(guest => guest.name)
        .map(guest => ({
          name: guest.name,
          email: guest.email,
          role: guest.role || 'guest'
        }));

      await createShow({
        title: data.title,
        description: data.description,
        show_type: data.show_type,
        event_category: data.event_category,
        scheduled_date: data.scheduled_date,
        starting_stage: data.starting_stage as any,
        host_name: data.host.name,
        host_email: data.host.email,
        guest_info: guestInfo,
        linked_script_id: data.linked_script_id,
        linked_music_id: data.linked_music_id,
      });

      toast.success('Meeting scheduled successfully!');
      setIsScheduleDialogOpen(false);
      onScheduleNew?.(new Date(data.scheduled_date), format(new Date(data.scheduled_date), 'HH:mm'));
    } catch (error) {
      console.error('Error scheduling show:', error);
      toast.error('Failed to schedule meeting');
    }
  };

  // Get calendar days based on view mode
  const calendarDays = useMemo(() => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }
  }, [currentDate, viewMode]);

  // Group shows by date
  const showsByDate = useMemo(() => {
    const grouped: Record<string, ShowWithParticipants[]> = {};
    shows.forEach(show => {
      if (show.scheduled_date) {
        const dateKey = format(new Date(show.scheduled_date), 'yyyy-MM-dd');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(show);
      }
    });
    // Sort shows within each day by time
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => 
        new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime()
      );
    });
    return grouped;
  }, [shows]);

  // Get shows for selected day with time details
  const selectedDayShows = useMemo(() => {
    if (!selectedDay) return [];
    const dateKey = format(selectedDay, 'yyyy-MM-dd');
    return showsByDate[dateKey] || [];
  }, [selectedDay, showsByDate]);

  // Note: Busy slots now handled by UnifiedScheduleShowDialog

  // Group show types by category for legend
  const legendByCategory = useMemo(() => {
    const activeTypes = new Set<ShowType>();
    shows.forEach(show => {
      if (show.scheduled_date) activeTypes.add(show.show_type);
    });
    
    const categories: Record<EventCategory, ShowType[]> = {
      media_production: [],
      business_meeting: [],
      event: [],
      genie_demo: [],
    };
    
    activeTypes.forEach(type => {
      const category = SHOW_TYPE_COLORS[type].category;
      categories[category].push(type);
    });
    
    return categories;
  }, [shows]);

  const handlePrevPeriod = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (day: Date) => {
    console.log('📅 Day clicked:', day, 'Opening schedule dialog');
    setSelectedDay(day);
    setIsScheduleDialogOpen(true);
  };

  const handleShowClick = (show: ShowWithParticipants, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedShow(show);
    onShowClick?.(show);
  };

  // Old handleScheduleSubmit removed - now using UnifiedScheduleShowDialog

  // Generate rich calendar event details with meeting URL, topics, host, etc.
  const buildRichCalendarDescription = (show: ShowWithParticipants): string => {
    const lines: string[] = [];
    
    // Meeting URL prominently
    if (show.meeting_link) {
      lines.push('🎬 JOIN MEETING:');
      lines.push(show.meeting_link);
      lines.push('');
    }
    
    // Description
    if (show.description) {
      lines.push(show.description);
      lines.push('');
    }
    
    // Topics/Agenda
    if (show.agenda) {
      lines.push('📋 TOPICS:');
      lines.push(show.agenda);
      lines.push('');
    }
    
    // Get host from participants
    const participants = show.participants || [];
    const host = participants.find(p => p.role === 'host');
    if (host) {
      lines.push(`🎙️ Host: ${host.name}`);
    }
    
    // Get guests
    const guests = participants.filter(p => p.role !== 'host');
    if (guests.length > 0) {
      lines.push(`👥 Guests: ${guests.map(g => g.name).join(', ')}`);
    }
    
    // Script info (from metadata)
    const metadata = (show.metadata || {}) as Record<string, any>;
    if (metadata.script_content || metadata.linked_script_id) {
      lines.push('📝 Script attached');
    }
    
    // Branding
    lines.push('');
    lines.push('─────────────────────');
    lines.push('📺 Powered by Genie Studio');
    lines.push('🌐 genieaiexperimentationhub.tech');
    
    return lines.join('\n');
  };

  const generateGoogleCalendarUrl = (show: ShowWithParticipants) => {
    if (!show.scheduled_date) return '#';
    const startDate = new Date(show.scheduled_date);
    const endDate = new Date(startDate.getTime() + (show.duration_minutes || 60) * 60 * 1000);
    const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const richDescription = buildRichCalendarDescription(show);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: show.title,
      dates: `${formatCalDate(startDate)}/${formatCalDate(endDate)}`,
      details: richDescription,
      location: show.meeting_link || show.location || '',
    });
    
    // Add attendees if available
    const participants = show.participants || [];
    const attendeeEmails = participants.filter(p => p.email).map(p => p.email as string);
    if (attendeeEmails.length > 0) {
      params.set('add', attendeeEmails.join(','));
    }
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateOutlookUrl = (show: ShowWithParticipants) => {
    if (!show.scheduled_date) return '#';
    const startDate = new Date(show.scheduled_date);
    const endDate = new Date(startDate.getTime() + (show.duration_minutes || 60) * 60 * 1000);
    const richDescription = buildRichCalendarDescription(show);
    
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: show.title,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: richDescription,
      location: show.meeting_link || show.location || '',
    });
    
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };
  
  const generateYahooUrl = (show: ShowWithParticipants) => {
    if (!show.scheduled_date) return '#';
    const startDate = new Date(show.scheduled_date);
    const duration = show.duration_minutes || 60;
    const hours = Math.floor(duration / 60).toString().padStart(2, '0');
    const minutes = (duration % 60).toString().padStart(2, '0');
    const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const richDescription = buildRichCalendarDescription(show);
    
    const params = new URLSearchParams({
      v: '60',
      title: show.title,
      st: formatCalDate(startDate),
      dur: `${hours}${minutes}`,
      desc: richDescription,
      in_loc: show.meeting_link || show.location || '',
    });
    
    return `https://calendar.yahoo.com/?${params.toString()}`;
  };
  
  // Generate and download ICS file
  const downloadIcsFile = (show: ShowWithParticipants) => {
    if (!show.scheduled_date) return;
    
    const startDate = new Date(show.scheduled_date);
    const endDate = new Date(startDate.getTime() + (show.duration_minutes || 60) * 60 * 1000);
    const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const richDescription = buildRichCalendarDescription(show);
    
    const escapeIcs = (text: string): string => {
      return text
        .replace(/\\/g, '\\\\')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')
        .replace(/\n/g, '\\n');
    };
    
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Genie Studio//genieaiexperimentationhub.tech//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Genie Studio',
      'BEGIN:VEVENT',
      `UID:${show.id}@genie-studio`,
      `DTSTAMP:${formatCalDate(new Date())}`,
      `DTSTART:${formatCalDate(startDate)}`,
      `DTEND:${formatCalDate(endDate)}`,
      `SUMMARY:${escapeIcs(show.title)}`,
      `DESCRIPTION:${escapeIcs(richDescription)}`,
    ];
    
    if (show.meeting_link) {
      lines.push(`LOCATION:${escapeIcs(show.meeting_link)}`);
      lines.push(`URL:${escapeIcs(show.meeting_link)}`);
    } else if (show.location) {
      lines.push(`LOCATION:${escapeIcs(show.location)}`);
    }
    
    // Add attendees
    const participants = show.participants || [];
    participants.forEach(p => {
      if (p.email) {
        lines.push(`ATTENDEE;CN=${escapeIcs(p.name)};RSVP=TRUE:mailto:${escapeIcs(p.email)}`);
      }
    });
    
    // Add reminders
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Genie Studio - Session in 30 minutes',
      'TRIGGER:-PT30M',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Genie Studio - Session in 15 minutes',
      'TRIGGER:-PT15M',
      'END:VALARM'
    );
    
    lines.push('END:VEVENT', 'END:VCALENDAR');
    
    const content = lines.join('\r\n');
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${show.title.replace(/[^a-z0-9]/gi, '_')}_genie_studio.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Note: isSlotAvailable moved to UnifiedScheduleShowDialog

  return (
    <>
    <TooltipProvider>
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">
              {viewMode === 'week' 
                ? `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM yyyy')
              }
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* New Meeting Button */}
            <Button 
              onClick={() => {
                setSelectedDay(new Date());
                setIsScheduleDialogOpen(true);
              }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Meeting
            </Button>
            
            {/* View Toggle */}
            <div className="flex border rounded-lg p-0.5 bg-muted/50">
              <Button 
                variant={viewMode === 'month' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('month')}
                className="h-7 px-2"
              >
                <CalendarRange className="h-3 w-3 mr-1" />
                Month
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('week')}
                className="h-7 px-2"
              >
                <CalendarDays className="h-3 w-3 mr-1" />
                Week
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevPeriod}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextPeriod}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLegend(!showLegend)}
              className="text-xs"
            >
              <Layers className="h-3 w-3 mr-1" />
              {showLegend ? 'Hide' : 'Show'} Legend
            </Button>
          </div>
        </div>

        {/* Color Legend - Grouped by Category */}
        {showLegend && (
          <Card className="bg-card/50 border-dashed">
            <CardContent className="py-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['media_production', 'business_meeting', 'event'] as EventCategory[]).map(category => {
                  const catColors = CATEGORY_COLORS[category];
                  const types = legendByCategory[category];
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={cn('text-xs', catColors.bg, catColors.text)}>
                          {catColors.icon}
                          <span className="ml-1">{catColors.label}</span>
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 pl-2">
                        {types.length > 0 ? types.map(type => {
                          const colors = SHOW_TYPE_COLORS[type];
                          return (
                            <Badge 
                              key={type} 
                              variant="outline" 
                              className={cn('text-[10px] py-0', colors.bg, colors.text, colors.border)}
                            >
                              {colors.label}
                            </Badge>
                          );
                        }) : (
                          <span className="text-xs text-muted-foreground">No scheduled items</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div 
                  key={day} 
                  className={cn(
                    "text-center text-xs font-medium py-2",
                    (idx === 0 || idx === 6) ? 'text-muted-foreground/50' : 'text-muted-foreground'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayShows = showsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                const weekend = isWeekend(day);
                const holiday = isHoliday(day);
                const minHeight = viewMode === 'week' ? 'min-h-[180px]' : 'min-h-[100px]';

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      minHeight,
                      'border rounded-lg p-1 transition-colors cursor-pointer hover:bg-accent/30',
                      isCurrentMonth ? 'bg-card' : 'bg-muted/30',
                      isCurrentDay && 'ring-2 ring-primary ring-offset-1',
                      weekend && 'bg-muted/20',
                      holiday && 'bg-red-500/5'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        'text-xs font-medium',
                        isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                        isCurrentDay && 'bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full',
                        weekend && !isCurrentDay && 'text-muted-foreground/70'
                      )}>
                        {format(day, 'd')}
                      </span>
                      {holiday && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Sun className="h-3 w-3 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent>{holiday}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    
                    <ScrollArea className={viewMode === 'week' ? 'h-[150px]' : 'h-[70px]'}>
                      <div className="space-y-1">
                        {dayShows.slice(0, viewMode === 'week' ? 10 : 3).map(show => {
                          const colors = SHOW_TYPE_COLORS[show.show_type];
                          const showTime = format(new Date(show.scheduled_date!), 'h:mm a');
                          return (
                            <Tooltip key={show.id}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => handleShowClick(show, e)}
                                  className={cn(
                                    'w-full text-left text-[10px] px-1 py-0.5 rounded truncate flex items-center gap-1 border-l-2',
                                    colors.bg,
                                    colors.text,
                                    colors.border,
                                    'hover:opacity-80'
                                  )}
                                >
                                  <span className="font-medium">{showTime.replace(':00', '')}</span>
                                  <span className="truncate">{show.title}</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold">{show.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(show.scheduled_date!), 'h:mm a')} • {show.duration_minutes || 60}min
                                  </p>
                                  {show.participants && show.participants.length > 0 && (
                                    <p className="text-xs">
                                      {show.participants.map(p => p.name).join(', ')}
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                        {dayShows.length > (viewMode === 'week' ? 10 : 3) && (
                          <div className="text-[10px] text-muted-foreground text-center">
                            +{dayShows.length - (viewMode === 'week' ? 10 : 3)} more
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Shows List */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Shows
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {shows
                  .filter(s => s.scheduled_date && new Date(s.scheduled_date) >= new Date())
                  .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())
                  .slice(0, 10)
                  .map(show => {
                    const colors = SHOW_TYPE_COLORS[show.show_type];
                    const scheduledDate = new Date(show.scheduled_date!);
                    return (
                      <div
                        key={show.id}
                        onClick={() => handleShowClick(show)}
                        className={cn(
                          'flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors',
                          colors.border,
                          'border-l-4'
                        )}
                      >
                        <div className={cn('p-2 rounded-full', colors.bg)}>
                          {getShowTypeIcon(show.show_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{show.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(scheduledDate, 'MMM d, yyyy')} at {format(scheduledDate, 'h:mm a')}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn('text-xs', colors.text)}>
                          {SHOW_TYPE_COLORS[show.show_type].label.split(' ')[0]}
                        </Badge>
                      </div>
                    );
                  })}
                {shows.filter(s => s.scheduled_date && new Date(s.scheduled_date) >= new Date()).length === 0 && (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No upcoming shows scheduled
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setSelectedDay(new Date());
                        setIsScheduleDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Schedule New
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>

    {/* Unified Schedule Dialog - Uses comprehensive scheduling form */}
    <UnifiedScheduleShowDialog
      open={isScheduleDialogOpen}
      onOpenChange={setIsScheduleDialogOpen}
      onSchedule={handleScheduleShow}
      initialData={selectedDay ? {
        scheduled_date: selectedDay.toISOString(),
      } : undefined}
      mode="create"
      variant="production-hub"
    />

    {/* Show Details Dialog - OUTSIDE TooltipProvider for proper portal rendering */}
    <Dialog open={!!selectedShow} onOpenChange={() => setSelectedShow(null)} modal={true}>
      <DialogContent className="max-w-lg" style={{ zIndex: 99999 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedShow && getShowTypeIcon(selectedShow.show_type)}
            {selectedShow?.title}
          </DialogTitle>
          <DialogDescription>
            {selectedShow?.description || 'No description available'}
          </DialogDescription>
        </DialogHeader>
        
        {selectedShow && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">
                  {format(new Date(selectedShow.scheduled_date!), 'EEEE, MMM d, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <p className="font-medium">
                  {format(new Date(selectedShow.scheduled_date!), 'h:mm a')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <p className="font-medium">{selectedShow.duration_minutes || 60} minutes</p>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium">
                  {SHOW_TYPE_COLORS[selectedShow.show_type]?.label || selectedShow.show_type}
                </p>
              </div>
            </div>
            
            {selectedShow.participants && selectedShow.participants.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Participants:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedShow.participants.map((p, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <User className="h-3 w-3 mr-1" />
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedShow.meeting_link && (
              <div>
                <span className="text-sm text-muted-foreground">Meeting Link:</span>
                <a 
                  href={selectedShow.meeting_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-primary hover:underline text-sm mt-1"
                >
                  {selectedShow.meeting_link}
                </a>
              </div>
            )}

            {/* Calendar Sync Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(generateGoogleCalendarUrl(selectedShow), '_blank')}
                className="flex-1"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Add to Google
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(generateOutlookUrl(selectedShow), '_blank')}
                className="flex-1"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Add to Outlook
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

export default ProductionCalendar;
