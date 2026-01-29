/**
 * APPOINTMENT SCHEDULER
 * Merged from Genie Arc into Production Hub
 * Manages appointments, meetings, and scheduling flow
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarCheck, Clock, Users, Video, 
  Plus, Search, Filter, ChevronRight,
  Phone, MapPin, Mail, CalendarDays
} from 'lucide-react';
import { useShows } from '@/hooks/useShows';
import { format, addDays, startOfWeek, endOfWeek, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  title: string;
  type: 'meeting' | 'call' | 'demo' | 'recording';
  date: Date;
  duration: number; // minutes
  attendees: string[];
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const DURATION_OPTIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

const MEETING_TYPES = [
  { value: 'meeting', label: 'Team Meeting', icon: Users },
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'demo', label: 'Demo/Presentation', icon: Video },
  { value: 'recording', label: 'Recording Session', icon: Video },
];

export const AppointmentScheduler: React.FC = () => {
  const [activeView, setActiveView] = useState<'upcoming' | 'today' | 'week'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const { shows, isLoading, createShow } = useShows();
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting',
    time: '09:00',
    duration: '60',
    attendees: '',
    location: '',
    notes: '',
  });

  // Transform shows to appointments format
  const appointments: Appointment[] = shows
    ?.filter(show => show.event_category === 'business_meeting' || show.event_category === 'event')
    .map(show => ({
      id: show.id,
      title: show.title,
      type: show.event_category === 'business_meeting' ? 'meeting' : 'demo',
      date: new Date(show.scheduled_date || show.created_at),
      duration: show.duration_minutes || 60,
      attendees: show.participants?.map(p => p.name) || [],
      status: show.meeting_stage === 'completed' || show.event_stage === 'archived' 
        ? 'completed' 
        : show.meeting_stage === 'cancelled' || show.event_stage === 'cancelled'
          ? 'cancelled'
          : show.meeting_stage === 'confirmed' 
            ? 'confirmed' 
            : 'scheduled',
      location: show.location || undefined,
      notes: show.description || undefined,
    })) || [];

  // Filter appointments based on view
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.title.toLowerCase().includes(searchQuery.toLowerCase());
    const now = new Date();
    
    switch (activeView) {
      case 'today':
        return matchesSearch && isToday(apt.date);
      case 'week':
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        return matchesSearch && apt.date >= weekStart && apt.date <= weekEnd;
      default:
        return matchesSearch && apt.date >= now;
    }
  });

  const getTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'demo': return <Video className="w-4 h-4" />;
      case 'recording': return <Video className="w-4 h-4" />;
      default: return <CalendarCheck className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const handleOpenDialog = () => {
    setSelectedDate(new Date());
    setFormData({
      title: '',
      type: 'meeting',
      time: '09:00',
      duration: '60',
      attendees: '',
      location: '',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleCreateAppointment = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the appointment');
      return;
    }
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    // Create scheduled date with time
    const [hours, minutes] = formData.time.split(':').map(Number);
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hours, minutes, 0, 0);

    try {
      // Build description with location and duration info
      const descriptionParts: string[] = [];
      if (formData.notes) descriptionParts.push(formData.notes);
      if (formData.location) descriptionParts.push(`📍 Location: ${formData.location}`);
      descriptionParts.push(`⏱️ Duration: ${formData.duration} minutes`);

      await createShow({
        title: formData.title,
        description: descriptionParts.join('\n\n') || undefined,
        show_type: formData.type === 'call' ? 'discovery_call' : formData.type === 'demo' ? 'genie_studio_full' : 'sales_meeting',
        event_category: 'business_meeting',
        scheduled_date: scheduledDate.toISOString(),
      });
      
      toast.success('Appointment scheduled successfully!');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create appointment');
      console.error('Error creating appointment:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            Appointments & Schedule
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage meetings, demos, and production schedules
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenDialog}>
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.filter(a => isToday(a.date)).length}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/50 rounded-lg">
                <Clock className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.filter(a => isTomorrow(a.date)).length}</p>
                <p className="text-xs text-muted-foreground">Tomorrow</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/50 rounded-lg">
                <Users className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.filter(a => a.type === 'meeting').length}</p>
                <p className="text-xs text-muted-foreground">Meetings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Video className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.filter(a => a.type === 'demo').length}</p>
                <p className="text-xs text-muted-foreground">Demos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search appointments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading appointments...
            </CardContent>
          </Card>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No appointments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Schedule your first appointment'}
              </p>
              <Button variant="outline" className="gap-2" onClick={handleOpenDialog}>
                <Plus className="w-4 h-4" />
                Add Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getTypeIcon(appointment.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{appointment.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(appointment.date, 'MMM d, h:mm a')}
                        </span>
                        <span>{appointment.duration} min</span>
                        {appointment.attendees.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {appointment.attendees.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg z-[9999]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Schedule New Appointment
            </DialogTitle>
            <DialogDescription>
              Create a new meeting, call, or demo session.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Weekly Team Sync"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={formData.time} onValueChange={(v) => setFormData({ ...formData, time: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] z-[10000]">
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[10000]">
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location / Meeting Link</Label>
              <Input
                id="location"
                placeholder="e.g., Zoom link or room name"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAppointment}>
              <Plus className="h-4 w-4 mr-1" />
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentScheduler;
