/**
 * SCHEDULED CONTENT MANAGER
 * 
 * View, edit, and manage scheduled content:
 * - View all scheduled items
 * - Edit/update content that wasn't satisfactory
 * - Reschedule or cancel
 * - View generated content before final publish
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Calendar as CalendarIcon, Clock, Edit, Trash2, Play, Pause, 
  RefreshCw, Check, X, Eye, Globe, Video, AlertCircle, MoreVertical,
  Youtube, Linkedin, Facebook, Instagram, Music2, Twitter, Send
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ScheduledItem {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'draft' | 'ready' | 'scheduled' | 'publishing' | 'published' | 'failed';
  scheduledAt?: Date;
  destinations: string[];
  languages: string[];
  thumbnailUrl?: string;
  videoUrl?: string;
  chapters: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  landing_page: <Globe className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  tiktok: <Music2 className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: <Edit className="w-3 h-3" /> },
  ready: { label: 'Ready for Review', color: 'bg-amber-500/10 text-amber-600', icon: <Eye className="w-3 h-3" /> },
  scheduled: { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-600', icon: <Clock className="w-3 h-3" /> },
  publishing: { label: 'Publishing', color: 'bg-primary/10 text-primary', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
  published: { label: 'Published', color: 'bg-emerald-500/10 text-emerald-600', icon: <Check className="w-3 h-3" /> },
  failed: { label: 'Failed', color: 'bg-destructive/10 text-destructive', icon: <AlertCircle className="w-3 h-3" /> },
};

interface ScheduledContentManagerProps {
  className?: string;
  onEditProject?: (projectId: string) => void;
  generatedProjects?: Array<{
    id: string;
    name: string;
    description?: string;
    status: string;
    languages: string[];
    destinations: string[];
    totalChapters: number;
    totalDuration: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export const ScheduledContentManager: React.FC<ScheduledContentManagerProps> = ({
  className,
  onEditProject,
  generatedProjects = [],
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'scheduled' | 'published'>('pending');
  const [items, setItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ScheduledItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newScheduleDate, setNewScheduleDate] = useState<Date | undefined>();

  // Load scheduled items from localStorage and generated projects
  useEffect(() => {
    loadItems();
  }, [generatedProjects]);

  const loadItems = async () => {
    setLoading(true);
    try {
      // Load from localStorage
      const STORAGE_KEY = 'genie_generated_content';
      const stored = localStorage.getItem(STORAGE_KEY);
      let storedItems: ScheduledItem[] = [];
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          storedItems = parsed.map((p: any) => ({
            id: p.id,
            projectId: p.id,
            name: p.name,
            description: p.description,
            status: mapStatus(p.status),
            scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : undefined,
            destinations: p.destinations || ['landing_page'],
            languages: p.languages || ['en'],
            chapters: p.totalChapters || p.items?.length || 0,
            duration: p.totalDuration || 0,
            thumbnailUrl: p.items?.[0]?.previewUrl,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
        } catch (e) {
          console.error('[ScheduledContent] Failed to parse stored items:', e);
        }
      }
      
      // Merge with passed generatedProjects
      const projectItems: ScheduledItem[] = generatedProjects.map(p => ({
        id: p.id,
        projectId: p.id,
        name: p.name,
        description: p.description,
        status: mapStatus(p.status) as ScheduledItem['status'],
        destinations: p.destinations || ['landing_page'],
        languages: p.languages || ['en'],
        chapters: p.totalChapters,
        duration: p.totalDuration,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      
      // Combine and deduplicate
      const allItems = [...storedItems, ...projectItems];
      const uniqueItems = allItems.reduce((acc, item) => {
        if (!acc.find(i => i.id === item.id)) {
          acc.push(item);
        }
        return acc;
      }, [] as ScheduledItem[]);
      
      // If no items, show helpful empty state (no mock data)
      setItems(uniqueItems);
      
      console.log(`[ScheduledContent] Loaded ${uniqueItems.length} items`);
    } catch (error) {
      console.error('Failed to load scheduled items:', error);
      toast.error('Failed to load scheduled content');
    } finally {
      setLoading(false);
    }
  };
  
  const mapStatus = (status: string): ScheduledItem['status'] => {
    switch (status) {
      case 'generating': return 'draft';
      case 'ready': return 'ready';
      case 'scheduled': return 'scheduled';
      case 'publishing': return 'publishing';
      case 'published': return 'published';
      case 'failed': return 'failed';
      default: return 'draft';
    }
  };

  const getFilteredItems = () => {
    switch (activeTab) {
      case 'pending':
        return items.filter(i => ['draft', 'ready'].includes(i.status));
      case 'scheduled':
        return items.filter(i => ['scheduled', 'publishing'].includes(i.status));
      case 'published':
        return items.filter(i => ['published', 'failed'].includes(i.status));
      default:
        return items;
    }
  };

  const handleApprove = async (item: ScheduledItem) => {
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: 'scheduled' as const, scheduledAt: new Date() } : i
    ));
    toast.success(`"${item.name}" approved and scheduled for immediate publishing`);
  };

  const handleRegenerate = async (item: ScheduledItem) => {
    toast.info(`Regenerating "${item.name}"...`);
    // This would trigger the regeneration workflow
    if (onEditProject) {
      onEditProject(item.projectId);
    }
  };

  const handleReschedule = async () => {
    if (!selectedItem || !newScheduleDate) return;
    
    setItems(prev => prev.map(i => 
      i.id === selectedItem.id 
        ? { ...i, scheduledAt: newScheduleDate, status: 'scheduled' as const } 
        : i
    ));
    toast.success(`"${selectedItem.name}" rescheduled to ${format(newScheduleDate, 'PPP')}`);
    setRescheduleOpen(false);
    setSelectedItem(null);
    setNewScheduleDate(undefined);
  };

  const handleCancel = async (item: ScheduledItem) => {
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: 'draft' as const, scheduledAt: undefined } : i
    ));
    toast.success(`"${item.name}" cancelled and moved to drafts`);
  };

  const handleDelete = async (item: ScheduledItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    toast.success(`"${item.name}" deleted`);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Content</h3>
          <p className="text-sm text-muted-foreground">
            Manage, review, and update your scheduled content
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadItems} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="pending" className="gap-2">
            <Eye className="w-4 h-4" />
            Pending Review
            <Badge variant="secondary" className="ml-1">
              {items.filter(i => ['draft', 'ready'].includes(i.status)).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Clock className="w-4 h-4" />
            Scheduled
            <Badge variant="secondary" className="ml-1">
              {items.filter(i => ['scheduled', 'publishing'].includes(i.status)).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2">
            <Check className="w-4 h-4" />
            Published
            <Badge variant="secondary" className="ml-1">
              {items.filter(i => ['published', 'failed'].includes(i.status)).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {getFilteredItems().length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No {activeTab} content found</p>
                </div>
              ) : (
                getFilteredItems().map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className="w-24 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Video className="w-6 h-6 text-muted-foreground" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium truncate">{item.name}</h4>
                              {item.description && (
                                <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                              )}
                            </div>
                            <Badge className={cn("flex-shrink-0 gap-1", STATUS_CONFIG[item.status].color)}>
                              {STATUS_CONFIG[item.status].icon}
                              {STATUS_CONFIG[item.status].label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{item.chapters} chapters</span>
                            <span>{Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}</span>
                            <span>{item.languages.length} languages</span>
                            {item.scheduledAt && (
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {format(item.scheduledAt, 'PPP')}
                              </span>
                            )}
                          </div>

                          {/* Destinations */}
                          <div className="flex items-center gap-2 mt-2">
                            {item.destinations.map((dest) => (
                              <Badge key={dest} variant="outline" className="gap-1 text-xs py-0">
                                {PLATFORM_ICONS[dest]}
                                <span className="capitalize">{dest.replace('_', ' ')}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {/* Preview Button */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item);
                              setPreviewOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>

                          {/* Status-specific actions */}
                          {item.status === 'ready' && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(item)}
                                className="flex-1"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRegenerate(item)}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {item.status === 'scheduled' && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setNewScheduleDate(item.scheduledAt);
                                  setRescheduleOpen(true);
                                }}
                              >
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                Reschedule
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleCancel(item)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {item.status === 'draft' && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => onEditProject?.(item.projectId)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {item.status === 'failed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRegenerate(item)}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>{selectedItem?.description}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Video Preview</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generated content will be shown here
                </p>
              </div>
            </div>

            {/* Language Tabs */}
            {selectedItem && selectedItem.languages.length > 1 && (
              <div className="flex gap-2">
                {selectedItem.languages.map((lang) => (
                  <Badge key={lang} variant="outline" className="cursor-pointer hover:bg-accent">
                    {lang.toUpperCase()}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{selectedItem?.chapters} chapters</span>
              <span>{selectedItem && Math.floor(selectedItem.duration / 60)}:{selectedItem && (selectedItem.duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            {selectedItem?.status === 'ready' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPreviewOpen(false);
                    handleRegenerate(selectedItem);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button 
                  onClick={() => {
                    handleApprove(selectedItem);
                    setPreviewOpen(false);
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve & Publish
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Content</DialogTitle>
            <DialogDescription>
              Choose a new date and time for "{selectedItem?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Schedule Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {newScheduleDate ? format(newScheduleDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newScheduleDate}
                    onSelect={setNewScheduleDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={!newScheduleDate}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledContentManager;
