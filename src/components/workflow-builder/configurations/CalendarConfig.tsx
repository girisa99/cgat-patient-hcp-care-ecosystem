import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Users, Bell, Globe } from 'lucide-react';

const calendarConfigSchema = z.object({
  // Provider Settings
  provider: z.enum(['google', 'outlook', 'caldav', 'ical']).default('google'),
  
  // Google Calendar
  google_client_id: z.string().optional(),
  google_client_secret: z.string().optional(),
  google_calendar_id: z.string().optional(),
  
  // Outlook Calendar
  outlook_client_id: z.string().optional(),
  outlook_client_secret: z.string().optional(),
  outlook_tenant_id: z.string().optional(),
  
  // CalDAV
  caldav_url: z.string().url().optional(),
  caldav_username: z.string().optional(),
  caldav_password: z.string().optional(),
  
  // General Settings
  default_duration: z.number().min(15).max(480).default(60), // minutes
  default_timezone: z.string().default('UTC'),
  buffer_time: z.number().min(0).max(120).default(15), // minutes
  
  // Event Settings
  auto_accept: z.boolean().default(false),
  send_notifications: z.boolean().default(true),
  allow_conflicts: z.boolean().default(false),
  max_attendees: z.number().min(1).max(100).default(10),
  
  // Scheduling Rules
  business_hours_start: z.string().default('09:00'),
  business_hours_end: z.string().default('17:00'),
  working_days: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5]), // 0=Sunday
  
  // Advanced Settings
  sync_frequency: z.number().min(1).max(60).default(15), // minutes
  look_ahead_days: z.number().min(1).max(365).default(30),
  retry_attempts: z.number().min(0).max(5).default(3),
});

interface CalendarConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const CalendarConfig: React.FC<CalendarConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form: parentForm
}) => {
  const form = useForm({
    resolver: zodResolver(calendarConfigSchema),
    defaultValues: {
      provider: configuration?.provider || 'google',
      google_client_id: configuration?.google_client_id || '',
      google_client_secret: configuration?.google_client_secret || '',
      google_calendar_id: configuration?.google_calendar_id || '',
      outlook_client_id: configuration?.outlook_client_id || '',
      outlook_client_secret: configuration?.outlook_client_secret || '',
      outlook_tenant_id: configuration?.outlook_tenant_id || '',
      caldav_url: configuration?.caldav_url || '',
      caldav_username: configuration?.caldav_username || '',
      caldav_password: configuration?.caldav_password || '',
      default_duration: configuration?.default_duration || 60,
      default_timezone: configuration?.default_timezone || 'UTC',
      buffer_time: configuration?.buffer_time || 15,
      auto_accept: configuration?.auto_accept || false,
      send_notifications: configuration?.send_notifications || true,
      allow_conflicts: configuration?.allow_conflicts || false,
      max_attendees: configuration?.max_attendees || 10,
      business_hours_start: configuration?.business_hours_start || '09:00',
      business_hours_end: configuration?.business_hours_end || '17:00',
      working_days: configuration?.working_days || [1, 2, 3, 4, 5],
      sync_frequency: configuration?.sync_frequency || 15,
      look_ahead_days: configuration?.look_ahead_days || 30,
      retry_attempts: configuration?.retry_attempts || 3,
    },
  });

  const provider = form.watch('provider');

  const onSubmit = (data: z.infer<typeof calendarConfigSchema>) => {
    onChange(data);
  };

  // Watch form changes and update parent
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onChange(value);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'Pacific/Auckland'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Provider
          </CardTitle>
          <CardDescription>
            Choose your calendar service and configure authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="google">Google Calendar</SelectItem>
                        <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                        <SelectItem value="caldav">CalDAV</SelectItem>
                        <SelectItem value="ical">iCal URL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {provider === 'google' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">Google Calendar Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="google_client_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input placeholder="your-client-id.googleusercontent.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="google_client_secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="google_calendar_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calendar ID</FormLabel>
                        <FormControl>
                          <Input placeholder="primary or calendar-id@group.calendar.google.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Use "primary" for the main calendar or specific calendar ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {provider === 'outlook' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">Microsoft Outlook Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="outlook_client_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application ID</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678-1234-1234-1234-123456789012" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="outlook_client_secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="outlook_tenant_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenant ID</FormLabel>
                        <FormControl>
                          <Input placeholder="12345678-1234-1234-1234-123456789012" {...field} />
                        </FormControl>
                        <FormDescription>
                          Use "common" for multi-tenant or specific tenant ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {provider === 'caldav' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">CalDAV Configuration</h4>
                  <FormField
                    control={form.control}
                    name="caldav_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CalDAV URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://caldav.icloud.com/" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="caldav_username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="caldav_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduling Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="default_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Duration (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="15" 
                          max="480"
                          step="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buffer_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buffer Time (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="120"
                          step="5"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="business_hours_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Hours Start</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="business_hours_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Hours End</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="working_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Working Days</FormLabel>
                    <FormDescription>
                      Select the days when scheduling is allowed
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {weekDays.map((day) => (
                        <Badge
                          key={day.value}
                          variant={field.value.includes(day.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newValue = field.value.includes(day.value)
                              ? field.value.filter(d => d !== day.value)
                              : [...field.value, day.value];
                            field.onChange(newValue);
                          }}
                        >
                          {day.label}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="max_attendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attendees</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sync_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sync Frequency (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="60"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Auto Accept Invitations</FormLabel>
                    <FormDescription>
                      Automatically accept meeting invitations
                    </FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="auto_accept"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Send Notifications</FormLabel>
                    <FormDescription>
                      Send email notifications for events
                    </FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="send_notifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Allow Conflicts</FormLabel>
                    <FormDescription>
                      Allow overlapping events to be scheduled
                    </FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="allow_conflicts"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};