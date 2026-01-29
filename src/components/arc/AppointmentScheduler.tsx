/**
 * APPOINTMENT SCHEDULER
 * Merged from Genie Arc into Production Hub
 * Uses UnifiedScheduleShowDialog for comprehensive scheduling
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CalendarCheck, Clock, Users, Video, 
  Plus, Search, ChevronRight,
  Phone
} from 'lucide-react';
import { useShows } from '@/hooks/useShows';
import { format, isToday, isTomorrow, startOfWeek, endOfWeek } from 'date-fns';
import { toast } from 'sonner';
import { UnifiedScheduleShowDialog, type ScheduleShowData } from '@/components/production/UnifiedScheduleShowDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Appointment {
  id: string;
  title: string;
  type: 'meeting' | 'call' | 'demo' | 'recording';
  date: Date;
  duration: number;
  attendees: string[];
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
}

export const AppointmentScheduler: React.FC = () => {
  const [activeView, setActiveView] = useState<'upcoming' | 'today' | 'week'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const { shows, isLoading, createShow } = useShows();
  
  // Dialog state for UnifiedScheduleShowDialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    setIsDialogOpen(true);
  };

  // Handler for UnifiedScheduleShowDialog
  const handleScheduleAppointment = async (data: ScheduleShowData) => {
    try {
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
      });

      toast.success('Appointment scheduled successfully!');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  return (
    <>
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
    </div>

    {/* Unified Schedule Dialog - Uses comprehensive scheduling form */}
    <UnifiedScheduleShowDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      onSchedule={handleScheduleAppointment}
      mode="create"
      variant="arc"
    />
    </>
  );
};

export default AppointmentScheduler;
