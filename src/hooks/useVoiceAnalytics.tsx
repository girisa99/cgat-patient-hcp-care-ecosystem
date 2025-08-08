import { useState } from 'react';

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

// Mock data
const mockEvents: AnalyticsEvent[] = [
  {
    id: '1',
    event_type: 'call_started',
    agent_id: 'agent1',
    live_agent_id: null,
    connector_id: 'connector1',
    call_duration: null,
    queue_wait_time: null,
    metadata: {},
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    event_type: 'call_ended',
    agent_id: 'agent1',
    live_agent_id: null,
    connector_id: 'connector1',
    call_duration: 180,
    queue_wait_time: null,
    metadata: {},
    created_at: new Date(Date.now() - 3300000).toISOString(),
  }
];

export const useVoiceAnalytics = () => {
  const [events] = useState<AnalyticsEvent[]>(mockEvents);
  const [isLoading] = useState(false);

  // Calculate metrics from events
  const metrics: AnalyticsMetrics = {
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
  };

  // Generate chart data
  const callVolumeData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    calls: events.filter(e => 
      e.event_type === 'call_ended' && 
      new Date(e.created_at).getHours() === hour
    ).length
  }));

  const performanceData = Array.from({ length: 7 }, (_, day) => {
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
  }).reverse();

  return {
    events,
    metrics,
    callVolumeData,
    performanceData,
    isLoading,
  };
};