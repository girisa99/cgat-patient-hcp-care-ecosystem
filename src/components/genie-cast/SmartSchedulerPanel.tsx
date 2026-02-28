/**
 * SMART SCHEDULER PANEL
 * Calendar-based content scheduling with smart suggestions + manual override
 * Persists to scheduled_posts table (DB-backed, survives page refresh)
 * Integrated with landing_page_videos for completed content
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  CheckCircle,
  Plus,
  Loader2,
  Trash2,
} from 'lucide-react';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ScheduledItem {
  id: string;
  videoId: string;
  videoTitle: string;
  scheduledDate: Date;
  scheduledTime: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
  suggestedBy: 'ai' | 'manual';
}

// Platform configuration — unified via useSocialPlatforms hook
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';
import type { ProductionArtifacts } from '@/hooks/useGenieCastSession';

// ──────────────────────────────────────────────────────────────────────────────
// SESSION PROPS — connects PRODUCE → PUBLISH scheduling
// ──────────────────────────────────────────────────────────────────────────────

export interface SmartSchedulerSessionProps {
  /** Primary platform from castSession (pre-selects in scheduler) */
  primaryPlatform?: string;
  /** Multi-select target platforms from castSession */
  targetPlatformIds?: string[];
  /** Title of current session's content */
  sessionTitle?: string;
  /** Production artifacts from castSession */
  productionArtifacts?: ProductionArtifacts | null;
  /** Selected region for timezone-aware scheduling */
  selectedRegion?: string;
}

interface VideoItem {
  id: string;
  title: string;
  generation_status: string;
  video_url?: string;
  thumbnail_url?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// DB row → ScheduledItem mapper
// ──────────────────────────────────────────────────────────────────────────────

interface ScheduledPostRow {
  id: string;
  content_id: string | null;
  platform: string;
  scheduled_time: string;
  timezone: string | null;
  status: string | null;
  content_data: Record<string, unknown>;
  media_urls: string[] | null;
  hashtags: string[] | null;
}

function rowToItem(row: ScheduledPostRow): ScheduledItem {
  const data = row.content_data || {};
  const scheduledDate = new Date(row.scheduled_time);
  return {
    id: row.id,
    videoId: (data.video_id as string) || row.content_id || '',
    videoTitle: (data.video_title as string) || 'Untitled',
    scheduledDate,
    scheduledTime: format(scheduledDate, 'HH:mm'),
    platforms: (data.platforms as string[]) || [row.platform],
    status: (row.status as ScheduledItem['status']) || 'scheduled',
    suggestedBy: (data.suggested_by as 'ai' | 'manual') || 'manual',
  };
}

export const SmartSchedulerPanel: React.FC<SmartSchedulerSessionProps> = ({
  primaryPlatform,
  targetPlatformIds,
  sessionTitle,
  productionArtifacts,
  selectedRegion,
} = {}) => {
  const { schedulerPlatforms: PLATFORMS, getOptimalTimes } = useSocialPlatforms();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedVideoForSchedule, setSelectedVideoForSchedule] = useState<VideoItem | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    targetPlatformIds?.length ? targetPlatformIds : primaryPlatform ? [primaryPlatform] : ['youtube']
  );
  const [selectedTime, setSelectedTime] = useState('12:00');
  const queryClient = useQueryClient();

  // Session-derived video (from PRODUCE phase)
  const sessionVideo: VideoItem | null = (sessionTitle && productionArtifacts?.assembledVideoUrl) ? {
    id: 'session-current',
    title: sessionTitle,
    generation_status: 'completed',
    video_url: productionArtifacts.assembledVideoUrl,
    thumbnail_url: productionArtifacts.thumbnailUrls?.[0],
  } : null;

  // Fetch completed videos from DB
  const { data: dbVideos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['scheduler-available-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('id, title, generation_status, video_url, thumbnail_url')
        .eq('generation_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as VideoItem[];
    },
  });

  // Merge session video with DB videos
  const availableVideos = sessionVideo
    ? [sessionVideo, ...dbVideos.filter(v => v.video_url !== sessionVideo.video_url)]
    : dbVideos;

  // ── DB-backed scheduled items ───────────────────────────────────────────────

  const { data: scheduledItems = [], isLoading: scheduledLoading } = useQuery({
    queryKey: ['scheduled-posts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('id, content_id, platform, scheduled_time, timezone, status, content_data, media_urls, hashtags')
        .eq('user_id', user.id)
        .in('status', ['draft', 'scheduled', 'publishing', 'published'])
        .order('scheduled_time', { ascending: true })
        .limit(100);
      if (error) throw error;
      return (data || []).map((row: ScheduledPostRow) => rowToItem(row));
    },
  });

  // INSERT mutation
  const insertMutation = useMutation({
    mutationFn: async (item: { videoId: string; videoTitle: string; videoUrl?: string; platforms: string[]; scheduledDate: Date; scheduledTime: string; suggestedBy: 'ai' | 'manual' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const [hours, minutes] = item.scheduledTime.split(':').map(Number);
      const scheduledAt = new Date(item.scheduledDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      // Insert one row per platform (DB schema has single platform per row)
      const rows = item.platforms.map(platform => ({
        user_id: user.id,
        content_id: item.videoId !== 'session-current' ? item.videoId : null,
        platform,
        scheduled_time: scheduledAt.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'scheduled' as const,
        content_data: {
          video_id: item.videoId,
          video_title: item.videoTitle,
          video_url: item.videoUrl || null,
          platforms: item.platforms,
          suggested_by: item.suggestedBy,
          region: selectedRegion || null,
        },
        media_urls: item.videoUrl ? [item.videoUrl] : [],
      }));

      const { error } = await supabase.from('scheduled_posts').insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
    },
  });

  // DELETE mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
      toast.success('Schedule cancelled');
    },
  });

  // Get items for selected date
  const itemsForDate = useMemo(() => {
    return scheduledItems.filter(item => isSameDay(item.scheduledDate, selectedDate));
  }, [scheduledItems, selectedDate]);

  // Generate AI suggestions for a video
  const generateAISuggestions = (video: VideoItem): ScheduledItem[] => {
    const suggestions: ScheduledItem[] = [];
    const now = new Date();

    // Suggest optimal times for different platforms
    PLATFORMS.slice(0, 3).forEach((platform, idx) => {
      const optimalTime = getOptimalTimes(platform.id)[0] || '12:00';
      suggestions.push({
        id: `suggestion-${video.id}-${platform.id}`,
        videoId: video.id,
        videoTitle: video.title,
        scheduledDate: addDays(now, idx + 1),
        scheduledTime: optimalTime,
        platforms: [platform.id],
        status: 'scheduled',
        suggestedBy: 'ai',
      });
    });

    return suggestions;
  };

  // Handle scheduling a video
  const handleScheduleVideo = async () => {
    if (!selectedVideoForSchedule) return;

    try {
      await insertMutation.mutateAsync({
        videoId: selectedVideoForSchedule.id,
        videoTitle: selectedVideoForSchedule.title,
        videoUrl: selectedVideoForSchedule.video_url,
        platforms: selectedPlatforms,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        suggestedBy: 'manual',
      });
      setIsScheduleDialogOpen(false);
      setSelectedVideoForSchedule(null);
      toast.success('Video scheduled successfully!');
    } catch {
      toast.error('Failed to schedule — try again');
    }
  };

  // Accept AI suggestion (persists to DB)
  const handleAcceptSuggestion = async (suggestion: ScheduledItem) => {
    const video = availableVideos.find(v => v.id === suggestion.videoId);
    try {
      await insertMutation.mutateAsync({
        videoId: suggestion.videoId,
        videoTitle: suggestion.videoTitle,
        videoUrl: video?.video_url,
        platforms: suggestion.platforms,
        scheduledDate: suggestion.scheduledDate,
        scheduledTime: suggestion.scheduledTime,
        suggestedBy: 'ai',
      });
      toast.success('AI suggestion accepted!');
    } catch {
      toast.error('Failed to save suggestion');
    }
  };

  // Get dates with scheduled items for calendar highlighting
  const datesWithItems = useMemo(() => {
    return scheduledItems.map(item => item.scheduledDate);
  }, [scheduledItems]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Smart Content Scheduler
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                AI-powered scheduling with optimal posting times
                {sessionVideo && (
                  <Badge variant="outline" className="text-xs text-primary border-primary/40 ml-2">
                    Session Linked
                  </Badge>
                )}
                {scheduledLoading && <Loader2 className="w-3 h-3 animate-spin ml-2" />}
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsScheduleDialogOpen(true)}
              disabled={availableVideos.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Content
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasItems: datesWithItems,
              }}
              modifiersStyles={{
                hasItems: { fontWeight: 'bold', backgroundColor: 'hsl(var(--primary) / 0.1)' },
              }}
            />

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="text-xl font-bold">{scheduledItems.length}</div>
                <div className="text-xs text-muted-foreground">Scheduled</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="text-xl font-bold">{availableVideos.length}</div>
                <div className="text-xs text-muted-foreground">Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule for selected date */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {itemsForDate.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No content scheduled for this date</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsScheduleDialogOpen(true)}
                    disabled={availableVideos.length === 0}
                  >
                    Schedule Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {itemsForDate.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        item.suggestedBy === 'ai'
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.scheduledTime}
                            </Badge>
                            {item.suggestedBy === 'ai' && (
                              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Suggested
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs capitalize">
                              {item.status}
                            </Badge>
                          </div>
                          <h4 className="font-medium mt-2">{item.videoTitle}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            {item.platforms.map((platformId) => {
                              const platform = PLATFORMS.find(p => p.id === platformId);
                              if (!platform) return null;
                              const Icon = platform.icon;
                              return (
                                <Badge
                                  key={platformId}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  <Icon className="w-3 h-3 mr-1" />
                                  {platform.name}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status === 'scheduled' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteMutation.mutate(item.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {item.status === 'published' && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Published
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions Section */}
      {availableVideos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Powered Suggestions
            </CardTitle>
            <CardDescription>
              Optimal posting times based on platform algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableVideos.slice(0, 3).map((video) => {
                const suggestions = generateAISuggestions(video);
                return (
                  <Card key={video.id} className="border-dashed">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm truncate">{video.title}</h4>
                      <div className="mt-3 space-y-2">
                        {suggestions.slice(0, 2).map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-muted-foreground">
                              {format(suggestion.scheduledDate, 'MMM d')} @ {suggestion.scheduledTime}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={() => handleAcceptSuggestion(suggestion)}
                              disabled={insertMutation.isPending}
                            >
                              {insertMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Accept'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Content</DialogTitle>
            <DialogDescription>
              Choose a video, platforms, and time to schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Video Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Video</label>
              <Select
                value={selectedVideoForSchedule?.id || ''}
                onValueChange={(id) => {
                  const video = availableVideos.find(v => v.id === id);
                  setSelectedVideoForSchedule(video || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a video..." />
                </SelectTrigger>
                <SelectContent>
                  {availableVideos.map((video) => (
                    <SelectItem key={video.id} value={video.id}>
                      {video.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <Button
                      key={platform.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedPlatforms(prev =>
                          isSelected
                            ? prev.filter(p => p !== platform.id)
                            : [...prev, platform.id]
                        );
                      }}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {platform.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['06:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleVideo}
              disabled={!selectedVideoForSchedule || selectedPlatforms.length === 0 || insertMutation.isPending}
            >
              {insertMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
