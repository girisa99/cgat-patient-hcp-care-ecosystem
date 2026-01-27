/**
 * CONTENT SCHEDULER DASHBOARD
 * 
 * Admin interface for managing scheduled posts across:
 * - 14 regions with timezone-aware scheduling
 * - 6 platforms (YouTube, LinkedIn, TikTok, Instagram, Twitter, Blog)
 * - Daily content rotation and automation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, Clock, Globe, RefreshCw, 
  CheckCircle, AlertCircle, Loader2, Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Regional configurations
const REGIONS = [
  { id: 'us_east', name: 'US East', tz: 'America/New_York', flag: '🇺🇸' },
  { id: 'us_west', name: 'US West', tz: 'America/Los_Angeles', flag: '🇺🇸' },
  { id: 'uk', name: 'UK', tz: 'Europe/London', flag: '🇬🇧' },
  { id: 'eu_central', name: 'EU Central', tz: 'Europe/Berlin', flag: '🇪🇺' },
  { id: 'india', name: 'India', tz: 'Asia/Kolkata', flag: '🇮🇳' },
  { id: 'sea', name: 'Southeast Asia', tz: 'Asia/Singapore', flag: '🇸🇬' },
  { id: 'china', name: 'China', tz: 'Asia/Shanghai', flag: '🇨🇳' },
  { id: 'japan', name: 'Japan', tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { id: 'korea', name: 'Korea', tz: 'Asia/Seoul', flag: '🇰🇷' },
  { id: 'australia', name: 'Australia', tz: 'Australia/Sydney', flag: '🇦🇺' },
  { id: 'mena', name: 'MENA', tz: 'Asia/Dubai', flag: '🇦🇪' },
  { id: 'latam', name: 'LatAm', tz: 'America/Sao_Paulo', flag: '🇧🇷' },
  { id: 'africa', name: 'Africa', tz: 'Africa/Lagos', flag: '🇳🇬' },
];

// Platforms
const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', color: 'bg-red-500' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-foreground' },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
  { id: 'twitter', name: 'Twitter', color: 'bg-sky-500' },
  { id: 'blog', name: 'Blog', color: 'bg-emerald-500' },
];

interface SchedulerStatus {
  total: number;
  pending: number;
  processing: number;
  published: number;
  failed: number;
  regions: string[];
}

interface ScheduledPostDB {
  id: string;
  platform: string;
  scheduled_time: string;
  status: string;
  timezone: string | null;
  content_data: any;
  pipeline_id: string | null;
}

export const ContentSchedulerDashboard: React.FC = () => {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [posts, setPosts] = useState<ScheduledPostDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    fetchPosts();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('marketing-daily-scheduler', {
        body: { action: 'status' },
      });
      if (error) throw error;
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('id, platform, scheduled_time, status, timezone, content_data, pipeline_id')
        .gte('scheduled_time', `${today}T00:00:00Z`)
        .order('scheduled_time', { ascending: true })
        .limit(100);

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('marketing-daily-scheduler', {
        body: { action: 'schedule' },
      });
      if (error) throw error;
      
      toast.success(`Scheduled ${data.postsScheduled} posts across ${data.regions?.length || 0} regions`);
      await fetchStatus();
      await fetchPosts();
    } catch (err) {
      console.error('Failed to generate schedule:', err);
      toast.error('Failed to generate schedule');
    } finally {
      setIsRunning(false);
    }
  };

  const handlePublishPending = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('marketing-daily-scheduler', {
        body: { action: 'publish' },
      });
      if (error) throw error;
      
      toast.success(`Published ${data.published} posts`);
      await fetchStatus();
      await fetchPosts();
    } catch (err) {
      console.error('Failed to publish:', err);
      toast.error('Failed to publish posts');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = (postStatus: string) => {
    switch (postStatus) {
      case 'published':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  // Extract region from timezone for filtering
  const getRegionFromTimezone = (tz: string | null) => {
    if (!tz) return 'unknown';
    const region = REGIONS.find(r => r.tz === tz);
    return region?.id || 'unknown';
  };

  const filteredPosts = selectedRegion 
    ? posts.filter(p => getRegionFromTimezone(p.timezone) === selectedRegion)
    : posts;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{status?.total || posts.length}</p>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{status?.pending || posts.filter(p => p.status === 'pending').length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{status?.processing || posts.filter(p => p.status === 'processing').length}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-500">{status?.published || posts.filter(p => p.status === 'published').length}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-destructive">{status?.failed || posts.filter(p => p.status === 'failed').length}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleGenerateSchedule} disabled={isRunning}>
          {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
          Generate Today's Schedule
        </Button>
        <Button variant="outline" onClick={handlePublishPending} disabled={isRunning}>
          <Send className="w-4 h-4 mr-2" />
          Publish Pending
        </Button>
        <Button variant="ghost" onClick={() => { fetchStatus(); fetchPosts(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Region Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedRegion === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedRegion(null)}
        >
          All Regions
        </Button>
        {REGIONS.map(region => (
          <Button
            key={region.id}
            variant={selectedRegion === region.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRegion(region.id)}
          >
            {region.flag} {region.name}
          </Button>
        ))}
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scheduled Posts
          </CardTitle>
          <CardDescription>
            {filteredPosts.length} posts {selectedRegion ? `for ${REGIONS.find(r => r.id === selectedRegion)?.name}` : 'across all regions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p>No scheduled posts for today</p>
              <Button variant="link" onClick={handleGenerateSchedule}>
                Generate schedule
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredPosts.map(post => {
                  const regionId = getRegionFromTimezone(post.timezone);
                  const region = REGIONS.find(r => r.id === regionId);
                  const platform = PLATFORMS.find(p => p.id === post.platform);
                  const contentTitle = post.content_data?.title || post.pipeline_id || 'Untitled';
                  
                  return (
                    <div 
                      key={post.id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/30"
                    >
                      <div className={`w-2 h-10 rounded-full ${platform?.color || 'bg-muted'}`} />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{contentTitle}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{region?.flag || '🌍'} {region?.name || 'Global'}</span>
                          <span>•</span>
                          <span>{platform?.name || post.platform}</span>
                          <span>•</span>
                          <span>{format(new Date(post.scheduled_time), 'HH:mm')}</span>
                        </div>
                      </div>
                      
                      {getStatusBadge(post.status)}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSchedulerDashboard;
