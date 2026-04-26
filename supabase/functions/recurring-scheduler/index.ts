import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecurringScheduleRequest {
  action: 'create' | 'update' | 'delete' | 'list' | 'generate_instances';
  scheduleId?: string;
  config?: {
    name: string;
    description?: string;
    entityType: 'show' | 'session' | 'publication' | 'task';
    entityId?: string;
    recurrence: {
      type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
      interval?: number;
      daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
      dayOfMonth?: number;
      time: string; // HH:MM format
      timezone: string;
      startDate: string;
      endDate?: string;
      exceptions?: string[]; // Dates to skip
    };
    templateData?: Record<string, unknown>;
    notifications?: {
      beforeMinutes: number[];
      channels: ('email' | 'push' | 'sms')[];
    };
  };
  dateRange?: {
    start: string;
    end: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: RecurringScheduleRequest = await req.json();

    console.log(`📅 Recurring Scheduler Request:`, {
      action: request.action,
      scheduleId: request.scheduleId,
      entityType: request.config?.entityType
    });

    let result;

    switch (request.action) {
      case 'create':
        result = await createSchedule(supabase, request.config!);
        break;

      case 'update':
        result = await updateSchedule(supabase, request.scheduleId!, request.config!);
        break;

      case 'delete':
        result = await deleteSchedule(supabase, request.scheduleId!);
        break;

      case 'list':
        result = await listSchedules(supabase, request.config?.entityType);
        break;

      case 'generate_instances':
        result = await generateInstances(request.scheduleId!, request.config!, request.dateRange!);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Recurring scheduler error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createSchedule(supabase: any, config: RecurringScheduleRequest['config']): Promise<{
  scheduleId: string;
  nextOccurrence: string;
  status: string;
}> {
  if (!config) throw new Error('Config is required');

  const scheduleId = `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const nextOccurrence = calculateNextOccurrence(config.recurrence);

  // Store schedule in database
  const { error } = await supabase
    .from('recurring_schedules')
    .insert({
      id: scheduleId,
      name: config.name,
      description: config.description,
      entity_type: config.entityType,
      entity_id: config.entityId,
      recurrence_config: config.recurrence,
      template_data: config.templateData,
      notification_config: config.notifications,
      next_occurrence: nextOccurrence,
      status: 'active',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.warn('Schedule storage warning:', error.message);
    // Continue even if table doesn't exist - return computed values
  }

  return {
    scheduleId,
    nextOccurrence,
    status: 'active'
  };
}

async function updateSchedule(supabase: any, scheduleId: string, config: RecurringScheduleRequest['config']): Promise<{
  scheduleId: string;
  updated: boolean;
  nextOccurrence: string;
}> {
  if (!config) throw new Error('Config is required');

  const nextOccurrence = calculateNextOccurrence(config.recurrence);

  const { error } = await supabase
    .from('recurring_schedules')
    .update({
      name: config.name,
      description: config.description,
      recurrence_config: config.recurrence,
      template_data: config.templateData,
      notification_config: config.notifications,
      next_occurrence: nextOccurrence,
      updated_at: new Date().toISOString()
    })
    .eq('id', scheduleId);

  return {
    scheduleId,
    updated: !error,
    nextOccurrence
  };
}

async function deleteSchedule(supabase: any, scheduleId: string): Promise<{
  deleted: boolean;
  scheduleId: string;
}> {
  const { error } = await supabase
    .from('recurring_schedules')
    .update({ status: 'deleted', deleted_at: new Date().toISOString() })
    .eq('id', scheduleId);

  return {
    deleted: !error,
    scheduleId
  };
}

async function listSchedules(supabase: any, entityType?: string): Promise<{
  schedules: Array<{
    id: string;
    name: string;
    entityType: string;
    nextOccurrence: string;
    status: string;
  }>;
  total: number;
}> {
  let query = supabase
    .from('recurring_schedules')
    .select('*')
    .neq('status', 'deleted');

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }

  const { data, error } = await query;

  if (error) {
    return { schedules: [], total: 0 };
  }

  return {
    schedules: (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      entityType: s.entity_type,
      nextOccurrence: s.next_occurrence,
      status: s.status
    })),
    total: data?.length || 0
  };
}

async function generateInstances(
  scheduleId: string, 
  config: RecurringScheduleRequest['config'],
  dateRange: { start: string; end: string }
): Promise<{
  instances: Array<{
    date: string;
    dayOfWeek: string;
    time: string;
    isException: boolean;
  }>;
  total: number;
}> {
  if (!config?.recurrence) throw new Error('Recurrence config is required');

  const instances: Array<{
    date: string;
    dayOfWeek: string;
    time: string;
    isException: boolean;
  }> = [];

  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const exceptions = new Set(config.recurrence.exceptions || []);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    let shouldInclude = false;

    switch (config.recurrence.type) {
      case 'daily':
        shouldInclude = true;
        break;

      case 'weekly':
        if (config.recurrence.daysOfWeek?.includes(currentDate.getDay())) {
          shouldInclude = true;
        }
        break;

      case 'biweekly':
        const weeksDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weeksDiff % 2 === 0 && config.recurrence.daysOfWeek?.includes(currentDate.getDay())) {
          shouldInclude = true;
        }
        break;

      case 'monthly':
        if (currentDate.getDate() === config.recurrence.dayOfMonth) {
          shouldInclude = true;
        }
        break;

      case 'custom':
        // Custom logic based on interval
        const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        if (daysDiff % (config.recurrence.interval || 1) === 0) {
          shouldInclude = true;
        }
        break;
    }

    if (shouldInclude) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isException = exceptions.has(dateStr);

      instances.push({
        date: dateStr,
        dayOfWeek: daysOfWeek[currentDate.getDay()],
        time: config.recurrence.time,
        isException
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    instances,
    total: instances.length
  };
}

function calculateNextOccurrence(recurrence: NonNullable<RecurringScheduleRequest['config']>['recurrence']): string {
  if (!recurrence) return new Date().toISOString();

  const now = new Date();
  const [hours, minutes] = recurrence.time.split(':').map(Number);
  
  let nextDate = new Date(recurrence.startDate);
  nextDate.setHours(hours, minutes, 0, 0);

  // If start date is in the past, find next occurrence
  while (nextDate <= now) {
    switch (recurrence.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;

      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;

      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;

      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;

      case 'custom':
        nextDate.setDate(nextDate.getDate() + (recurrence.interval || 1));
        break;
    }
  }

  // Skip exceptions
  const exceptions = new Set(recurrence.exceptions || []);
  while (exceptions.has(nextDate.toISOString().split('T')[0])) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate.toISOString();
}
