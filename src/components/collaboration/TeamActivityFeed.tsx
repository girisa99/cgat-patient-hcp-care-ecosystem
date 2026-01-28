/**
 * TEAM ACTIVITY FEED UI (P4-COLLAB-09)
 * 
 * Displays timeline of recent team activities and changes.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  CheckCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Globe,
  MessageSquare,
  UserPlus,
  GitBranch,
  Sparkles,
  AlertTriangle,
  Settings,
  Download,
  Clock,
  X,
  Check,
  Upload,
  RefreshCw
} from 'lucide-react';
import { activityFeedService, ActivityEvent, ActivityType, ActivityStats } from '@/services/collaboration/activityFeedService';
import { formatDistanceToNow, format } from 'date-fns';

interface TeamActivityFeedProps {
  workspaceId?: string;
  limit?: number;
  showStats?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  Plus: <Plus className="h-3 w-3" />,
  Edit2: <Edit2 className="h-3 w-3" />,
  Trash2: <Trash2 className="h-3 w-3" />,
  Globe: <Globe className="h-3 w-3" />,
  MessageSquare: <MessageSquare className="h-3 w-3" />,
  CheckCircle: <CheckCircle className="h-3 w-3" />,
  UserPlus: <UserPlus className="h-3 w-3" />,
  UserMinus: <UserPlus className="h-3 w-3" />,
  GitBranch: <GitBranch className="h-3 w-3" />,
  RotateCcw: <RefreshCw className="h-3 w-3" />,
  Clock: <Clock className="h-3 w-3" />,
  Check: <Check className="h-3 w-3" />,
  X: <X className="h-3 w-3" />,
  Upload: <Upload className="h-3 w-3" />,
  Sparkles: <Sparkles className="h-3 w-3" />,
  AlertTriangle: <AlertTriangle className="h-3 w-3" />,
  Settings: <Settings className="h-3 w-3" />,
  Download: <Download className="h-3 w-3" />,
  Activity: <Activity className="h-3 w-3" />,
};

const colorMap: Record<string, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  gray: 'bg-gray-500',
};

export const TeamActivityFeed: React.FC<TeamActivityFeedProps> = ({
  workspaceId,
  limit = 50,
  showStats = true,
}) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Seed demo data on first load
    if (activities.length === 0) {
      activityFeedService.seedDemoActivities();
    }
    
    const unsubscribe = activityFeedService.subscribe((newActivities) => {
      setActivities(newActivities);
      setIsLoading(false);
    });

    loadStats();
    return unsubscribe;
  }, []);

  const loadStats = async () => {
    const activityStats = await activityFeedService.getActivityStats(workspaceId);
    setStats(activityStats);
  };

  const handleMarkAllRead = async () => {
    await activityFeedService.markAllAsRead();
    loadStats();
  };

  const handleMarkAsRead = async (id: string) => {
    await activityFeedService.markAsRead(id);
  };

  const filteredActivities = filter === 'unread' 
    ? activities.filter(a => !a.is_read)
    : activities;

  const unreadCount = activities.filter(a => !a.is_read).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Team Activity
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="feed" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed">Activity Feed</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-3">
            {/* Filter */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
            </div>

            {/* Activity List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {isLoading && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Loading activities...
                  </p>
                )}
                
                {!isLoading && filteredActivities.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No activities to show.
                  </p>
                )}

                {filteredActivities.slice(0, limit).map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onMarkRead={() => handleMarkAsRead(activity.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats">
            {stats && <ActivityStatsPanel stats={stats} />}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  activity: ActivityEvent;
  onMarkRead: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onMarkRead }) => {
  const meta = activityFeedService.getActivityMeta(activity.type);
  
  return (
    <div 
      className={`flex gap-3 p-2 rounded-lg transition-colors ${
        activity.is_read ? 'opacity-75' : 'bg-muted/50'
      }`}
      onClick={!activity.is_read ? onMarkRead : undefined}
      role={!activity.is_read ? 'button' : undefined}
    >
      {/* Icon */}
      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white ${colorMap[meta.color] || 'bg-gray-500'}`}>
        {iconMap[meta.icon] || <Activity className="h-3 w-3" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[10px]">
              {activity.actor_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{activity.actor_name}</span>
          <Badge variant="outline" className="text-xs">
            {meta.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {activity.description}
        </p>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </span>
      </div>

      {/* Unread indicator */}
      {!activity.is_read && (
        <div className="h-2 w-2 rounded-full bg-primary" />
      )}
    </div>
  );
};

interface ActivityStatsPanelProps {
  stats: ActivityStats;
}

const ActivityStatsPanel: React.FC<ActivityStatsPanelProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-3">
          <p className="text-2xl font-bold">{stats.totalToday}</p>
          <p className="text-xs text-muted-foreground">Activities Today</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold">{format(new Date().setHours(stats.peakHour), 'ha')}</p>
          <p className="text-xs text-muted-foreground">Peak Activity Hour</p>
        </Card>
      </div>

      {/* Top Contributors */}
      <div>
        <h4 className="text-sm font-medium mb-2">Top Contributors</h4>
        <div className="space-y-2">
          {stats.byActor.slice(0, 5).map((actor, index) => (
            <div key={actor.actorId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {actor.actorName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{actor.actorName}</span>
              </div>
              <Badge variant="secondary">{actor.count}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div>
        <h4 className="text-sm font-medium mb-2">Activity Breakdown</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(stats.byType).slice(0, 6).map(([type, count]) => {
            const meta = activityFeedService.getActivityMeta(type as ActivityType);
            return (
              <div key={type} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-xs">{meta.label}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamActivityFeed;
