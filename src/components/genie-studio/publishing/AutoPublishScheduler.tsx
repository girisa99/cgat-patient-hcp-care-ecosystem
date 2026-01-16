/**
 * Auto-Publish Scheduling Component
 * Lives in Genie Arc (Production Hub) - handles scheduled publishing across platforms
 * Integrates with n8n for external platform publishing automation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  Youtube,
  Linkedin,
  Globe,
  Play,
  Pause,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Zap,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Platform configurations
const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { id: 'tiktok', name: 'TikTok', icon: Play, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'website', name: 'Website', icon: Globe, color: 'text-green-500', bgColor: 'bg-green-500/10' },
];

const SCHEDULE_PRESETS = [
  { id: 'immediate', label: 'Publish Immediately', delay: 0 },
  { id: '1hour', label: 'In 1 Hour', delay: 3600000 },
  { id: '3hours', label: 'In 3 Hours', delay: 10800000 },
  { id: 'tomorrow_9am', label: 'Tomorrow 9 AM', delay: null },
  { id: 'next_week', label: 'Next Monday 9 AM', delay: null },
  { id: 'custom', label: 'Custom Date/Time', delay: null },
];

interface ScheduledPublish {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: 'episode' | 'video' | 'podcast' | 'short';
  platforms: string[];
  scheduledFor: Date;
  status: 'pending' | 'publishing' | 'published' | 'failed';
  n8nWorkflowId?: string;
  createdAt: Date;
}

interface AutoPublishSchedulerProps {
  showId?: string;
  onScheduleCreated?: (schedule: ScheduledPublish) => void;
}

export const AutoPublishScheduler: React.FC<AutoPublishSchedulerProps> = ({
  showId,
  onScheduleCreated
}) => {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Schedule form state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [schedulePreset, setSchedulePreset] = useState('immediate');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [autoOptimize, setAutoOptimize] = useState(true);
  
  // Mock scheduled items (in production, fetch from DB)
  const [scheduledItems] = useState<ScheduledPublish[]>([
    {
      id: '1',
      contentId: 'ep-001',
      contentTitle: 'Episode 1: Getting Started with AI',
      contentType: 'episode',
      platforms: ['youtube', 'linkedin'],
      scheduledFor: new Date(Date.now() + 86400000),
      status: 'pending',
      createdAt: new Date()
    },
    {
      id: '2',
      contentId: 'short-001',
      contentTitle: 'AI Tips in 60 Seconds',
      contentType: 'short',
      platforms: ['tiktok', 'youtube'],
      scheduledFor: new Date(Date.now() + 172800000),
      status: 'pending',
      createdAt: new Date()
    }
  ]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleCreateSchedule = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }

    setIsLoading(true);
    
    try {
      // In production, this would:
      // 1. Create schedule record in DB
      // 2. Trigger n8n workflow for automation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Publishing schedule created');
      setIsCreateDialogOpen(false);
      setSelectedPlatforms([]);
      setSchedulePreset('immediate');
    } catch (error) {
      toast.error('Failed to create schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: ScheduledPublish['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500/30"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case 'publishing':
        return <Badge variant="outline" className="text-blue-500 border-blue-500/30"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Publishing</Badge>;
      case 'published':
        return <Badge variant="outline" className="text-green-500 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Published</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-500 border-red-500/30"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Auto-Publish Scheduling
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule content to publish automatically across platforms via n8n
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Platform Connection Status */}
      <Card className="border-indigo-500/20 bg-indigo-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium">n8n Workflow Integration</h4>
                <p className="text-xs text-muted-foreground">Connected • 4 publishing workflows active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {PLATFORMS.map(platform => {
                const Icon = platform.icon;
                return (
                  <div 
                    key={platform.id}
                    className={cn("h-8 w-8 rounded-lg flex items-center justify-center", platform.bgColor)}
                    title={platform.name}
                  >
                    <Icon className={cn("h-4 w-4", platform.color)} />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scheduled" className="gap-2">
            <Clock className="h-4 w-4" />
            Scheduled ({scheduledItems.filter(i => i.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Published
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="mt-4">
          <div className="space-y-3">
            {scheduledItems.filter(i => i.status === 'pending' || i.status === 'publishing').map(item => (
              <Card key={item.id} className="hover:border-indigo-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                        <Play className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.contentTitle}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {item.scheduledFor.toLocaleDateString()} at {item.scheduledFor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <div className="flex items-center gap-1">
                            {item.platforms.map(platformId => {
                              const platform = PLATFORMS.find(p => p.id === platformId);
                              if (!platform) return null;
                              const Icon = platform.icon;
                              return <Icon key={platformId} className={cn("h-3 w-3", platform.color)} />;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {scheduledItems.filter(i => i.status === 'pending' || i.status === 'publishing').length === 0 && (
              <Card className="border-dashed border-2 border-muted-foreground/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Scheduled Publishes</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Schedule your content to publish automatically
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Schedule
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Published Tab */}
        <TabsContent value="published" className="mt-4">
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="font-semibold mb-2">Published Content</h3>
              <p className="text-sm text-muted-foreground">
                View history of automatically published content
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Publishing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Platforms */}
              <div>
                <Label className="mb-2 block">Default Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(platform => {
                    const Icon = platform.icon;
                    return (
                      <Button
                        key={platform.id}
                        variant="outline"
                        size="sm"
                        className={cn("gap-2", platform.bgColor)}
                      >
                        <Icon className={cn("h-4 w-4", platform.color)} />
                        {platform.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Auto-optimization */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Optimize for Each Platform</Label>
                  <p className="text-xs text-muted-foreground">Automatically adjust format, captions, and metadata</p>
                </div>
                <Switch defaultChecked />
              </div>

              {/* Notification Settings */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Publish Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified when content is published</p>
                </div>
                <Switch defaultChecked />
              </div>

              {/* Retry on Failure */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Retry on Failure</Label>
                  <p className="text-xs text-muted-foreground">Retry failed publishes up to 3 times</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Schedule Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Schedule Publishing
            </DialogTitle>
            <DialogDescription>
              Configure when and where to publish your content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Platform Selection */}
            <div>
              <Label className="mb-3 block">Select Platforms</Label>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(platform => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                        isSelected 
                          ? "border-indigo-500 bg-indigo-500/10" 
                          : "border-border hover:border-indigo-500/50"
                      )}
                    >
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", platform.bgColor)}>
                        <Icon className={cn("h-5 w-5", platform.color)} />
                      </div>
                      <span className="font-medium">{platform.name}</span>
                      {isSelected && <CheckCircle className="h-4 w-4 text-indigo-500 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Schedule Time */}
            <div>
              <Label className="mb-3 block">When to Publish</Label>
              <Select value={schedulePreset} onValueChange={setSchedulePreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_PRESETS.map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {schedulePreset === 'custom' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input 
                      type="date" 
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Time</Label>
                    <Input 
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Options */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-optimize content</Label>
                <p className="text-xs text-muted-foreground">Adjust format for each platform</p>
              </div>
              <Switch checked={autoOptimize} onCheckedChange={setAutoOptimize} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSchedule}
              disabled={isLoading || selectedPlatforms.length === 0}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Schedule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutoPublishScheduler;
