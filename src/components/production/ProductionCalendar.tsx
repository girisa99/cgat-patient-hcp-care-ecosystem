/**
 * Production Calendar - Visual calendar with color-coded events
 * Shows scheduled recordings, meetings, and events with sync capabilities
 */

import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  MapPin,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShowWithParticipants, ShowType, EventCategory, SHOW_TYPES } from '@/types/shows';

// Color legend configuration for different show types
const SHOW_TYPE_COLORS: Record<ShowType, { bg: string; text: string; border: string; label: string }> = {
  // Media Productions
  podcast: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500', label: '🎙️ Podcast' },
  webcast: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500', label: '📺 Webcast' },
  interview: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500', label: '🎤 Interview' },
  panel: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500', label: '👥 Panel' },
  tutorial: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500', label: '📚 Tutorial' },
  broadcast: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500', label: '📡 Broadcast' },
  other: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500', label: '🎬 Other' },
  // Business Meetings
  discovery_call: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500', label: '📞 Discovery' },
  sales_meeting: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500', label: '💼 Sales' },
  project_kickoff: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500', label: '🚀 Kickoff' },
  status_update: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500', label: '📊 Status' },
  consultation: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500', label: '💬 Consult' },
  // Events
  workshop: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500', label: '🔧 Workshop' },
  webinar: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500', label: '🖥️ Webinar' },
  conference: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500', label: '🏛️ Conference' },
  training_session: { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500', label: '📖 Training' },
};

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

interface ProductionCalendarProps {
  shows: ShowWithParticipants[];
  onShowClick?: (show: ShowWithParticipants) => void;
  onAddToGoogle?: (show: ShowWithParticipants) => void;
  onAddToOutlook?: (show: ShowWithParticipants) => void;
}

export function ProductionCalendar({ 
  shows, 
  onShowClick,
  onAddToGoogle,
  onAddToOutlook 
}: ProductionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShow, setSelectedShow] = useState<ShowWithParticipants | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Get all days in the current month view (including padding days)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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
    return grouped;
  }, [shows]);

  // Get unique show types that are scheduled
  const activeShowTypes = useMemo(() => {
    const types = new Set<ShowType>();
    shows.forEach(show => {
      if (show.scheduled_date) types.add(show.show_type);
    });
    return Array.from(types);
  }, [shows]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleShowClick = (show: ShowWithParticipants) => {
    setSelectedShow(show);
    onShowClick?.(show);
  };

  const generateGoogleCalendarUrl = (show: ShowWithParticipants) => {
    if (!show.scheduled_date) return '#';
    const startDate = new Date(show.scheduled_date);
    const endDate = new Date(startDate.getTime() + (show.duration_minutes || 60) * 60 * 1000);
    const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(show.title)}&dates=${formatCalDate(startDate)}/${formatCalDate(endDate)}&details=${encodeURIComponent(show.description || '')}`;
  };

  const generateOutlookUrl = (show: ShowWithParticipants) => {
    if (!show.scheduled_date) return '#';
    const startDate = new Date(show.scheduled_date);
    const endDate = new Date(startDate.getTime() + (show.duration_minutes || 60) * 60 * 1000);
    
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(show.title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(show.description || '')}`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLegend(!showLegend)}
              className="text-xs"
            >
              {showLegend ? 'Hide' : 'Show'} Legend
            </Button>
          </div>
        </div>

        {/* Color Legend */}
        {showLegend && activeShowTypes.length > 0 && (
          <Card className="bg-card/50">
            <CardContent className="py-3">
              <div className="flex flex-wrap gap-2">
                {activeShowTypes.map(type => {
                  const colors = SHOW_TYPE_COLORS[type];
                  return (
                    <Badge 
                      key={type} 
                      variant="outline" 
                      className={cn('text-xs', colors.bg, colors.text, colors.border)}
                    >
                      {getShowTypeIcon(type)}
                      <span className="ml-1">{colors.label}</span>
                    </Badge>
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
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayShows = showsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={idx}
                    className={cn(
                      'min-h-[100px] border rounded-lg p-1 transition-colors',
                      isCurrentMonth ? 'bg-card' : 'bg-muted/30',
                      isCurrentDay && 'ring-2 ring-primary',
                      dayShows.length > 0 && 'hover:bg-accent/50 cursor-pointer'
                    )}
                  >
                    <div className={cn(
                      'text-xs font-medium mb-1',
                      isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                      isCurrentDay && 'text-primary font-bold'
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    <ScrollArea className="h-[70px]">
                      <div className="space-y-1">
                        {dayShows.slice(0, 3).map(show => {
                          const colors = SHOW_TYPE_COLORS[show.show_type];
                          return (
                            <Tooltip key={show.id}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleShowClick(show)}
                                  className={cn(
                                    'w-full text-left text-[10px] px-1 py-0.5 rounded truncate flex items-center gap-1 border-l-2',
                                    colors.bg,
                                    colors.text,
                                    colors.border
                                  )}
                                >
                                  {getShowTypeIcon(show.show_type)}
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
                        {dayShows.length > 3 && (
                          <div className="text-[10px] text-muted-foreground text-center">
                            +{dayShows.length - 3} more
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
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming shows scheduled
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Show Details Dialog */}
        <Dialog open={!!selectedShow} onOpenChange={() => setSelectedShow(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedShow && getShowTypeIcon(selectedShow.show_type)}
                {selectedShow?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedShow && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <Badge className={cn(
                      SHOW_TYPE_COLORS[selectedShow.show_type].bg,
                      SHOW_TYPE_COLORS[selectedShow.show_type].text
                    )}>
                      {SHOW_TYPE_COLORS[selectedShow.show_type].label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm">{selectedShow.duration_minutes || 60} minutes</p>
                  </div>
                </div>

                {selectedShow.scheduled_date && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Schedule
                    </p>
                    <p className="text-sm">
                      {format(new Date(selectedShow.scheduled_date), 'EEEE, MMMM d, yyyy')} at{' '}
                      {format(new Date(selectedShow.scheduled_date), 'h:mm a')}
                    </p>
                  </div>
                )}

                {selectedShow.description && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedShow.description}</p>
                  </div>
                )}

                {selectedShow.participants && selectedShow.participants.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Participants
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedShow.participants.map(p => (
                        <Badge key={p.id} variant="secondary" className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {p.name}
                          <span className="text-xs text-muted-foreground">({p.role})</span>
                        </Badge>
                      ))}
                    </div>
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
      </div>
    </TooltipProvider>
  );
}

export default ProductionCalendar;
