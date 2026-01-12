/**
 * Schedule Management Dialog
 * Provides reschedule, cancel, and edit functionality for shows
 */

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  Edit, 
  XCircle, 
  CalendarClock,
  Globe,
  AlertTriangle,
  Mail,
  MessageSquare,
  Users,
  Loader2,
  Check
} from 'lucide-react';
import { format, addDays, addHours, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ShowWithParticipants } from '@/types/shows';
import { COMMON_TIMEZONES, formatDateWithTimezone, getLocalTimezone } from '@/utils/timezoneUtils';
import { MeetingUrlGenerator } from './MeetingUrlGenerator';

interface ScheduleManagementDialogProps {
  show: ShowWithParticipants | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (showId: string, updates: Partial<ShowWithParticipants>) => Promise<void>;
  onCancel: (showId: string, reason?: string) => Promise<void>;
  onReschedule: (showId: string, newDate: string, notifyParticipants: boolean) => Promise<void>;
}

export function ScheduleManagementDialog({
  show,
  open,
  onOpenChange,
  onUpdate,
  onCancel,
  onReschedule,
}: ScheduleManagementDialogProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'reschedule' | 'cancel'>('edit');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMeetingUrl, setEditMeetingUrl] = useState('');
  const [editTopics, setEditTopics] = useState('');
  
  // Reschedule state
  const [newScheduledDate, setNewScheduledDate] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState(getLocalTimezone());
  const [notifyOnReschedule, setNotifyOnReschedule] = useState(true);
  
  // Cancel state
  const [cancelReason, setCancelReason] = useState('');
  const [notifyOnCancel, setNotifyOnCancel] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Initialize state when show changes
  useEffect(() => {
    if (show) {
      setEditTitle(show.title);
      setEditDescription(show.description || '');
      setEditMeetingUrl(show.meeting_link || '');
      setEditTopics((show.metadata as any)?.topics || '');
      setNewScheduledDate(show.scheduled_date || '');
      setConfirmCancel(false);
      setCancelReason('');
    }
  }, [show]);

  const handleEdit = async () => {
    if (!show) return;
    setIsProcessing(true);
    try {
      await onUpdate(show.id, {
        title: editTitle,
        description: editDescription,
        meeting_link: editMeetingUrl,
        metadata: {
          ...(show.metadata as object),
          topics: editTopics,
        },
      });
      toast.success('Show updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update show');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReschedule = async () => {
    if (!show || !newScheduledDate) return;
    setIsProcessing(true);
    try {
      await onReschedule(show.id, newScheduledDate, notifyOnReschedule);
      toast.success(notifyOnReschedule 
        ? 'Show rescheduled and participants notified' 
        : 'Show rescheduled'
      );
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to reschedule show');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!show || !confirmCancel) return;
    setIsProcessing(true);
    try {
      await onCancel(show.id, cancelReason);
      toast.success(notifyOnCancel 
        ? 'Show cancelled and participants notified' 
        : 'Show cancelled'
      );
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to cancel show');
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick reschedule options
  const quickRescheduleOptions = [
    { label: 'Tomorrow, same time', getValue: () => addDays(new Date(show?.scheduled_date || new Date()), 1) },
    { label: '+1 hour', getValue: () => addHours(new Date(show?.scheduled_date || new Date()), 1) },
    { label: '+2 hours', getValue: () => addHours(new Date(show?.scheduled_date || new Date()), 2) },
    { label: 'Next week, same time', getValue: () => addDays(new Date(show?.scheduled_date || new Date()), 7) },
  ];

  if (!show) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Manage Schedule: {show.title}
          </DialogTitle>
          <DialogDescription>
            Edit details, reschedule, or cancel this event
          </DialogDescription>
        </DialogHeader>

        {/* Current Schedule Info */}
        <Card className="p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{show.title}</p>
              {show.scheduled_date && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatDateWithTimezone(show.scheduled_date, selectedTimezone, { 
                    includeDate: true, 
                    includeTimezone: true 
                  })}
                </p>
              )}
            </div>
            <Badge variant="outline" className="capitalize">{show.show_type}</Badge>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit" className="flex items-center gap-1">
              <Edit className="h-3 w-3" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="reschedule" className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              Reschedule
            </TabsTrigger>
            <TabsTrigger value="cancel" className="flex items-center gap-1 text-destructive data-[state=active]:text-destructive">
              <XCircle className="h-3 w-3" />
              Cancel
            </TabsTrigger>
          </TabsList>

          {/* Edit Tab */}
          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit_title">Title</Label>
              <Input
                id="edit_title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_topics">Topics / Agenda</Label>
              <Input
                id="edit_topics"
                value={editTopics}
                onChange={(e) => setEditTopics(e.target.value)}
                placeholder="Key topics to discuss..."
              />
            </div>

            <MeetingUrlGenerator
              showId={show.id}
              currentUrl={editMeetingUrl}
              onUrlChange={(url) => setEditMeetingUrl(url)}
              compact
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={isProcessing || !editTitle.trim()}>
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Reschedule Tab */}
          <TabsContent value="reschedule" className="space-y-4 mt-4">
            {/* Timezone Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                Timezone
              </Label>
              <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label} ({tz.abbr})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Reschedule Options */}
            <div className="space-y-2">
              <Label>Quick Options</Label>
              <div className="flex flex-wrap gap-2">
                {quickRescheduleOptions.map((opt, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = opt.getValue();
                      setNewScheduledDate(newDate.toISOString().slice(0, 16));
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="new_date">New Date & Time</Label>
              <Input
                id="new_date"
                type="datetime-local"
                value={newScheduledDate.slice(0, 16)}
                onChange={(e) => setNewScheduledDate(e.target.value)}
              />
              {newScheduledDate && (
                <p className="text-xs text-muted-foreground">
                  New time: {formatDateWithTimezone(newScheduledDate, selectedTimezone, { 
                    includeDate: true, 
                    includeTimezone: true 
                  })}
                </p>
              )}
            </div>

            {/* Multi-timezone preview */}
            {newScheduledDate && (
              <Card className="p-3 space-y-2">
                <Label className="text-xs text-muted-foreground">Time in other zones:</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']
                    .filter(tz => tz !== selectedTimezone)
                    .slice(0, 4)
                    .map(tz => {
                      const tzInfo = COMMON_TIMEZONES.find(t => t.value === tz);
                      return (
                        <div key={tz} className="flex justify-between">
                          <span className="text-muted-foreground">{tzInfo?.abbr || tz}:</span>
                          <span>{formatDateWithTimezone(newScheduledDate, tz)}</span>
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}

            {/* Notification Options */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Notify Participants</p>
                  <p className="text-xs text-muted-foreground">
                    Send reschedule email to {show.participants?.length || 0} participant(s)
                  </p>
                </div>
              </div>
              <Switch checked={notifyOnReschedule} onCheckedChange={setNotifyOnReschedule} />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleReschedule} disabled={isProcessing || !newScheduledDate}>
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CalendarClock className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Cancel Tab */}
          <TabsContent value="cancel" className="space-y-4 mt-4">
            <Card className="p-4 border-destructive/50 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Cancel this event?</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This action cannot be undone. All scheduled reminders will be stopped.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="cancel_reason">Cancellation Reason (optional)</Label>
              <Textarea
                id="cancel_reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let participants know why..."
                rows={2}
              />
            </div>

            {/* Notification Options */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Notify Participants</p>
                  <p className="text-xs text-muted-foreground">
                    Send cancellation email to {show.participants?.length || 0} participant(s)
                  </p>
                </div>
              </div>
              <Switch checked={notifyOnCancel} onCheckedChange={setNotifyOnCancel} />
            </div>

            {/* Confirm checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="confirm_cancel"
                checked={confirmCancel}
                onChange={(e) => setConfirmCancel(e.target.checked)}
                className="rounded border-destructive"
              />
              <Label htmlFor="confirm_cancel" className="text-sm text-destructive cursor-pointer">
                I understand this will cancel the event for all participants
              </Label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Keep Event
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancel} 
                disabled={isProcessing || !confirmCancel}
              >
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Event
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleManagementDialog;
