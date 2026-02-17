/**
 * CONTENT REVIEW QUEUE
 * 
 * Multi-stage review workflow for content publishing:
 * 1. Content Review: Check quality, accuracy, brand compliance
 * 2. Regional Review: Verify regional targeting and localization
 * 3. Final Approval: Approve for publishing to target regions
 * 
 * Features:
 * - Status tracking (Draft → Pending Review → Regional Review → Approved → Published)
 * - Auto-publish option for trusted content
 * - IP region targeting based on content language
 * - Scheduling for future publication
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  FileCheck, Clock, Globe, Send, Eye, CheckCircle, XCircle,
  AlertTriangle, CalendarIcon, ChevronRight, Play, RefreshCw,
  User, Languages, Video, Layers, Edit, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

// Review status types
export type ReviewStatus = 
  | 'draft'
  | 'pending_content_review'
  | 'content_approved'
  | 'pending_regional_review'
  | 'regional_approved'
  | 'final_approved'
  | 'scheduled'
  | 'published'
  | 'rejected';

export interface ReviewItem {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'video' | 'dialects' | 'avatars' | '3d' | 'combinations';
  status: ReviewStatus;
  
  // Content details
  languages: string[];
  primaryLanguage: string;
  targetRegions: string[];
  duration: number;
  thumbnailUrl?: string;
  
  // Review tracking
  submittedAt?: Date;
  submittedBy?: string;
  contentReviewedAt?: Date;
  contentReviewedBy?: string;
  contentReviewNotes?: string;
  regionalReviewedAt?: Date;
  regionalReviewedBy?: string;
  regionalReviewNotes?: string;
  approvedAt?: Date;
  approvedBy?: string;
  
  // Scheduling
  scheduledPublishAt?: Date;
  publishedAt?: Date;
  publishedTo?: string[];
  
  // Auto-publish flag
  autoPublish?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Language to Region mapping for auto-routing
const LANGUAGE_REGION_MAP: Record<string, string[]> = {
  'en': ['US', 'UK', 'AU', 'CA'],
  'es': ['ES', 'MX', 'AR', 'CO'],
  'fr': ['FR', 'CA', 'BE', 'CH'],
  'de': ['DE', 'AT', 'CH'],
  'pt': ['BR', 'PT'],
  'ar-SA': ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
  'ar-EG': ['EG'],
  'ar-MA': ['MA', 'DZ', 'TN'],
  'hi-IN': ['IN'],
  'zh-CN': ['CN'],
  'zh-TW': ['TW', 'HK'],
  'ja-JP': ['JP'],
  'ko-KR': ['KR'],
  'id-ID': ['ID'],
  'th-TH': ['TH'],
  'vi-VN': ['VN'],
  'sw-KE': ['KE', 'TZ', 'UG'],
  'am-ET': ['ET'],
  'yo-NG': ['NG'],
  'zu-ZA': ['ZA'],
};

// Get target regions from content languages
export const getTargetRegionsFromLanguages = (languages: string[]): string[] => {
  const regions = new Set<string>();
  languages.forEach(lang => {
    const mapped = LANGUAGE_REGION_MAP[lang] || LANGUAGE_REGION_MAP[lang.split('-')[0]] || [];
    mapped.forEach(r => regions.add(r));
  });
  return Array.from(regions);
};

interface ContentReviewQueueProps {
  items: ReviewItem[];
  onItemsChange: (items: ReviewItem[]) => void;
  currentUserId?: string;
  currentUserName?: string;
  canApprove?: boolean;
  className?: string;
}

export const ContentReviewQueue: React.FC<ContentReviewQueueProps> = ({
  items,
  onItemsChange,
  currentUserId = 'admin',
  currentUserName = 'Admin',
  canApprove = true,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'scheduled' | 'published'>('pending');
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Filter items by status
  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return items.filter(i => 
          ['pending_content_review', 'pending_regional_review'].includes(i.status)
        );
      case 'approved':
        return items.filter(i => 
          ['content_approved', 'regional_approved', 'final_approved'].includes(i.status)
        );
      case 'scheduled':
        return items.filter(i => i.status === 'scheduled');
      case 'published':
        return items.filter(i => i.status === 'published');
      default:
        return items;
    }
  }, [items, activeTab]);

  // Status counts
  const statusCounts = useMemo(() => ({
    pending: items.filter(i => 
      ['pending_content_review', 'pending_regional_review'].includes(i.status)
    ).length,
    approved: items.filter(i => 
      ['content_approved', 'regional_approved', 'final_approved'].includes(i.status)
    ).length,
    scheduled: items.filter(i => i.status === 'scheduled').length,
    published: items.filter(i => i.status === 'published').length,
  }), [items]);

  // Update item status
  const updateItemStatus = (
    itemId: string, 
    newStatus: ReviewStatus, 
    notes?: string,
    additionalData?: Partial<ReviewItem>
  ) => {
    const now = new Date();
    onItemsChange(items.map(item => {
      if (item.id !== itemId) return item;
      
      const updated: ReviewItem = {
        ...item,
        status: newStatus,
        updatedAt: now,
        ...additionalData,
      };
      
      // Track review timestamps
      if (newStatus === 'content_approved' || newStatus === 'pending_regional_review') {
        updated.contentReviewedAt = now;
        updated.contentReviewedBy = currentUserName;
        updated.contentReviewNotes = notes;
      }
      if (newStatus === 'regional_approved' || newStatus === 'final_approved') {
        updated.regionalReviewedAt = now;
        updated.regionalReviewedBy = currentUserName;
        updated.regionalReviewNotes = notes;
      }
      if (newStatus === 'final_approved') {
        updated.approvedAt = now;
        updated.approvedBy = currentUserName;
      }
      if (newStatus === 'published') {
        updated.publishedAt = now;
        updated.publishedTo = item.targetRegions;
      }
      
      return updated;
    }));
  };

  // Submit for review
  const submitForReview = (itemId: string) => {
    updateItemStatus(itemId, 'pending_content_review', undefined, {
      submittedAt: new Date(),
      submittedBy: currentUserName,
    });
    toast.success('Submitted for content review');
  };

  // Approve content
  const approveContent = (itemId: string, notes: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    // If multiple languages, needs regional review
    if (item.languages.length > 1) {
      updateItemStatus(itemId, 'pending_regional_review', notes);
      toast.success('Content approved, moved to regional review');
    } else {
      updateItemStatus(itemId, 'final_approved', notes);
      toast.success('Content approved for publishing');
    }
    setReviewDialogOpen(false);
  };

  // Approve regional
  const approveRegional = (itemId: string, notes: string) => {
    updateItemStatus(itemId, 'final_approved', notes);
    toast.success('Regional review approved, ready to publish');
    setReviewDialogOpen(false);
  };

  // Reject
  const rejectItem = (itemId: string, notes: string) => {
    updateItemStatus(itemId, 'rejected', notes);
    toast.error('Content rejected');
    setReviewDialogOpen(false);
  };

  // Schedule publication
  const schedulePublication = (itemId: string, date: Date) => {
    updateItemStatus(itemId, 'scheduled', undefined, {
      scheduledPublishAt: date,
    });
    toast.success(`Scheduled for ${format(date, 'PPP')}`);
    setScheduleDialogOpen(false);
  };

  // Publish immediately
  const publishNow = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    // Calculate target regions from languages
    const targetRegions = getTargetRegionsFromLanguages(item.languages);
    
    updateItemStatus(itemId, 'published', undefined, {
      targetRegions,
      publishedAt: new Date(),
      publishedTo: targetRegions,
    });
    toast.success(`Published to ${targetRegions.length} regions`);
  };

  const getStatusBadge = (status: ReviewStatus) => {
    const config: Record<ReviewStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Draft', variant: 'secondary' },
      pending_content_review: { label: 'Content Review', variant: 'outline' },
      content_approved: { label: 'Content OK', variant: 'default' },
      pending_regional_review: { label: 'Regional Review', variant: 'outline' },
      regional_approved: { label: 'Regional OK', variant: 'default' },
      final_approved: { label: 'Approved', variant: 'default' },
      scheduled: { label: 'Scheduled', variant: 'secondary' },
      published: { label: 'Published', variant: 'default' },
      rejected: { label: 'Rejected', variant: 'destructive' },
    };
    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeIcon = (type: ReviewItem['projectType']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'dialects': return <Languages className="w-4 h-4" />;
      case 'avatars': return <User className="w-4 h-4" />;
      case '3d': return <Layers className="w-4 h-4" />;
      case 'combinations': return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            Content Review Queue
          </h2>
          <p className="text-sm text-muted-foreground">
            Multi-stage review workflow for content publishing
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
            {statusCounts.pending} Pending
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-600">
            {statusCounts.approved} Approved
          </Badge>
        </div>
      </div>

      {/* Workflow Progress */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Edit className="w-4 h-4 text-primary" />
              </div>
              <span>Draft</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-amber-600" />
              </div>
              <span>Content</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <span>Regional</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-purple-600" />
              </div>
              <span>Schedule</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span>Published</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="all">
            All ({items.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({statusCounts.approved})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({statusCounts.scheduled})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({statusCounts.published})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <ScrollArea className="h-[500px]">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mb-2" />
                <p>No items in this queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map(item => (
                  <Card key={item.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {getTypeIcon(item.projectType)}
                          </div>
                          <div>
                            <h4 className="font-medium">{item.projectName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(item.status)}
                              <Badge variant="outline" className="text-xs">
                                {item.languages.length} languages
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                              </Badge>
                            </div>
                            {item.targetRegions.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Targeting: {item.targetRegions.slice(0, 5).join(', ')}
                                {item.targetRegions.length > 5 && ` +${item.targetRegions.length - 5} more`}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Action buttons based on status */}
                          {item.status === 'draft' && (
                            <Button 
                              size="sm" 
                              onClick={() => submitForReview(item.id)}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Submit
                            </Button>
                          )}
                          
                          {item.status === 'pending_content_review' && canApprove && (
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedItem(item);
                                setReviewDialogOpen(true);
                              }}
                            >
                              <FileCheck className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          )}
                          
                          {item.status === 'pending_regional_review' && canApprove && (
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => {
                                setSelectedItem(item);
                                setReviewDialogOpen(true);
                              }}
                            >
                              <Globe className="w-3 h-3 mr-1" />
                              Regional Review
                            </Button>
                          )}
                          
                          {item.status === 'final_approved' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setScheduleDialogOpen(true);
                                }}
                              >
                                <CalendarIcon className="w-3 h-3 mr-1" />
                                Schedule
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => publishNow(item.id)}
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Publish Now
                              </Button>
                            </>
                          )}
                          
                          {item.status === 'scheduled' && (
                            <div className="text-xs text-muted-foreground">
                              {item.scheduledPublishAt && format(item.scheduledPublishAt, 'PPP')}
                            </div>
                          )}
                          
                          {item.status === 'published' && (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Live
                            </Badge>
                          )}
                          
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.status === 'pending_content_review' 
                ? 'Content Review' 
                : 'Regional Review'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.status === 'pending_content_review'
                ? 'Review content quality, accuracy, and brand compliance'
                : 'Verify regional targeting and localization quality'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {getTypeIcon(selectedItem.projectType)}
                <div>
                  <h4 className="font-medium">{selectedItem.projectName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.languages.length} languages • {selectedItem.targetRegions.length} regions
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Review Notes</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review comments..."
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button 
              variant="destructive" 
              onClick={() => selectedItem && rejectItem(selectedItem.id, reviewNotes)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button 
              variant="default"
              onClick={() => {
                if (!selectedItem) return;
                if (selectedItem.status === 'pending_content_review') {
                  approveContent(selectedItem.id, reviewNotes);
                } else {
                  approveRegional(selectedItem.id, reviewNotes);
                }
              }}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Publication</DialogTitle>
            <DialogDescription>
              Choose when to publish this content to target regions
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">Target Regions</h4>
                  <p className="text-sm text-muted-foreground">
                    {getTargetRegionsFromLanguages(selectedItem.languages).join(', ')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Publish Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {scheduleDate ? format(scheduleDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setScheduleDate(addDays(new Date(), 1))}
                >
                  Tomorrow
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setScheduleDate(addDays(new Date(), 7))}
                >
                  In 1 Week
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setScheduleDate(addDays(new Date(), 30))}
                >
                  In 1 Month
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              disabled={!scheduleDate}
              onClick={() => selectedItem && scheduleDate && schedulePublication(selectedItem.id, scheduleDate)}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentReviewQueue;
