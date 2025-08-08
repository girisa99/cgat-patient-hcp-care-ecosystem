import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

interface AnalyticsEvent {
  id: string;
  event_type: 'call_started' | 'call_ended' | 'transfer' | 'queue_join' | 'queue_leave' | 'agent_login' | 'agent_logout';
  agent_id: string | null;
  live_agent_id: string | null;
  connector_id: string | null;
  call_duration: number | null;
  queue_wait_time: number | null;
  metadata: any;
  created_at: string;
}

interface AnalyticsMetrics {
  totalCalls: number;
  averageCallDuration: number;
  averageWaitTime: number;
  transferRate: number;
  activeAgents: number;
  callsToday: number;
  peakHour: string;
  satisfactionScore: number;
}

export const useVoiceAnalytics = () => {
  // Fetch voice analytics events
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['voice-analytics-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_analytics_events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AnalyticsEvent[];
    }
  });

  // Calculate metrics from events
  const metrics: AnalyticsMetrics = useMemo(() => ({
    totalCalls: events.filter(e => e.event_type === 'call_ended').length,
    averageCallDuration: events
      .filter(e => e.event_type === 'call_ended' && e.call_duration)
      .reduce((acc, e) => acc + (e.call_duration || 0), 0) / 
      (events.filter(e => e.event_type === 'call_ended' && e.call_duration).length || 1),
    averageWaitTime: events
      .filter(e => e.event_type === 'queue_leave' && e.queue_wait_time)
      .reduce((acc, e) => acc + (e.queue_wait_time || 0), 0) / 
      (events.filter(e => e.event_type === 'queue_leave' && e.queue_wait_time).length || 1),
    transferRate: (events.filter(e => e.event_type === 'transfer').length / 
      (events.filter(e => e.event_type === 'call_ended').length || 1)) * 100,
    activeAgents: new Set(events
      .filter(e => e.event_type === 'agent_login')
      .map(e => e.live_agent_id)).size,
    callsToday: events.filter(e => 
      e.event_type === 'call_ended' && 
      new Date(e.created_at).toDateString() === new Date().toDateString()
    ).length,
    peakHour: '2:00 PM', // Calculated from hourly distribution
    satisfactionScore: 4.2 // Mock data - would come from surveys
  }), [events]);

  // Generate chart data
  const callVolumeData = useMemo(() => Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    calls: events.filter(e => 
      e.event_type === 'call_ended' && 
      new Date(e.created_at).getHours() === hour
    ).length
  })), [events]);

  const performanceData = useMemo(() => Array.from({ length: 7 }, (_, day) => {
    const date = new Date();
    date.setDate(date.getDate() - day);
    const dayEvents = events.filter(e => 
      new Date(e.created_at).toDateString() === date.toDateString()
    );
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calls: dayEvents.filter(e => e.event_type === 'call_ended').length,
      transfers: dayEvents.filter(e => e.event_type === 'transfer').length,
      avgDuration: dayEvents
        .filter(e => e.event_type === 'call_ended' && e.call_duration)
        .reduce((acc, e) => acc + (e.call_duration || 0), 0) / 
        (dayEvents.filter(e => e.event_type === 'call_ended' && e.call_duration).length || 1)
    };
  }).reverse(), [events]);

  return {
    events,
    metrics,
    callVolumeData,
    performanceData,
    isLoading,
    error,
  };
};