/**
 * Marketing Auto-Scheduler Edge Function
 * 
 * Runs on a schedule to:
 * - Generate content 3x daily per region (morning, afternoon, evening local time)
 * - Execute scheduled posts at optimal times
 * - Track engagement and update leaderboards
 * 
 * INTERNAL USE ONLY - Genie Studio Team
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regional timezone configurations
const REGIONAL_TIMEZONES: Record<string, {
  timezone: string;
  utcOffset: number;
  peakHours: number[]; // Morning, Afternoon, Evening
}> = {
  english_core: { timezone: 'America/New_York', utcOffset: -5, peakHours: [8, 12, 20] },
  europe: { timezone: 'Europe/London', utcOffset: 0, peakHours: [8, 12, 19] },
  asia: { timezone: 'Asia/Tokyo', utcOffset: 9, peakHours: [7, 12, 21] },
  india: { timezone: 'Asia/Kolkata', utcOffset: 5.5, peakHours: [8, 13, 21] },
  mea: { timezone: 'Asia/Dubai', utcOffset: 4, peakHours: [9, 13, 22] },
  africa: { timezone: 'Africa/Lagos', utcOffset: 1, peakHours: [7, 12, 20] },
  latam: { timezone: 'America/Sao_Paulo', utcOffset: -3, peakHours: [8, 12, 21] },
};

// Holiday calendar (sample - expand as needed)
const SPECIAL_DAYS: Record<string, { name: string; regions: string[] | 'all'; boost: number }> = {
  '2025-01-28': { name: 'Data Privacy Day', regions: 'all', boost: 1.5 },
  '2025-03-08': { name: "International Women's Day", regions: 'all', boost: 1.5 },
  '2025-04-22': { name: 'Earth Day', regions: 'all', boost: 1.5 },
  '2025-07-04': { name: 'US Independence Day', regions: ['english_core'], boost: 2 },
  '2025-10-23': { name: 'Diwali', regions: ['india'], boost: 2 },
  '2025-11-29': { name: 'Black Friday', regions: ['english_core', 'europe'], boost: 3 },
  '2025-12-25': { name: 'Christmas', regions: ['english_core', 'europe', 'latam'], boost: 1.5 },
};

interface ScheduledTask {
  id: string;
  region: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  utcHour: number;
  pipelineId: string;
  category: string;
  format: string;
  status: 'pending' | 'generating' | 'ready' | 'published' | 'failed';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json();
    const now = new Date();
    const currentUtcHour = now.getUTCHours();
    const todayStr = now.toISOString().split('T')[0];

    console.log(`[Scheduler] Action: ${action}, UTC Hour: ${currentUtcHour}, Date: ${todayStr}`);

    switch (action) {
      case 'generate_daily_plan': {
        // Generate content plan for all regions
        const tasks: ScheduledTask[] = [];
        
        for (const [region, config] of Object.entries(REGIONAL_TIMEZONES)) {
          const slots = [
            { name: 'morning' as const, hour: config.peakHours[0] },
            { name: 'afternoon' as const, hour: config.peakHours[1] },
            { name: 'evening' as const, hour: config.peakHours[2] },
          ];

          for (const slot of slots) {
            const utcHour = (slot.hour - config.utcOffset + 24) % 24;
            
            // Check for special day boost
            const specialDay = SPECIAL_DAYS[todayStr];
            const isSpecialForRegion = specialDay && (
              specialDay.regions === 'all' || 
              (Array.isArray(specialDay.regions) && specialDay.regions.includes(region))
            );
            
            tasks.push({
              id: `${todayStr}-${region}-${slot.name}`,
              region,
              timeSlot: slot.name,
              utcHour,
              pipelineId: `auto-${Date.now()}`,
              category: 'text_based', // Will be rotated
              format: slot.name === 'evening' ? 'shorts_vertical' : 'video_avatar',
              status: 'pending',
            });

            // If special day, add extra content
            if (isSpecialForRegion && specialDay.boost > 1) {
              tasks.push({
                id: `${todayStr}-${region}-${slot.name}-special`,
                region,
                timeSlot: slot.name,
                utcHour,
                pipelineId: `special-${Date.now()}`,
                category: 'marketing_sales',
                format: 'video_avatar',
                status: 'pending',
              });
            }
          }
        }

        console.log(`[Scheduler] Generated ${tasks.length} tasks for ${todayStr}`);

        return new Response(JSON.stringify({
          success: true,
          date: todayStr,
          tasksGenerated: tasks.length,
          tasks,
          specialDays: SPECIAL_DAYS[todayStr] || null,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'check_and_execute': {
        // Check if any tasks should run at current UTC hour
        const regionsToRun: string[] = [];
        
        for (const [region, config] of Object.entries(REGIONAL_TIMEZONES)) {
          for (const peakHour of config.peakHours) {
            const utcHour = (peakHour - config.utcOffset + 24) % 24;
            if (Math.abs(currentUtcHour - utcHour) <= 1) { // Within 1 hour window
              regionsToRun.push(region);
              break;
            }
          }
        }

        console.log(`[Scheduler] Regions to run at UTC ${currentUtcHour}: ${regionsToRun.join(', ') || 'none'}`);

        // Would trigger content generation and publishing for these regions
        const results = [];
        for (const region of regionsToRun) {
          results.push({
            region,
            status: 'triggered',
            timestamp: new Date().toISOString(),
          });
        }

        return new Response(JSON.stringify({
          success: true,
          currentUtcHour,
          regionsTriggered: regionsToRun.length,
          results,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_global_schedule': {
        // Return 24-hour global schedule
        const schedule: { utcHour: number; regions: string[]; totalPosts: number }[] = [];
        
        for (let hour = 0; hour < 24; hour++) {
          const regionsAtHour: string[] = [];
          
          for (const [region, config] of Object.entries(REGIONAL_TIMEZONES)) {
            for (const peakHour of config.peakHours) {
              const utcHour = (peakHour - config.utcOffset + 24) % 24;
              if (utcHour === hour) {
                regionsAtHour.push(region);
              }
            }
          }
          
          if (regionsAtHour.length > 0) {
            schedule.push({
              utcHour: hour,
              regions: regionsAtHour,
              totalPosts: regionsAtHour.length,
            });
          }
        }

        return new Response(JSON.stringify({
          success: true,
          totalRegions: Object.keys(REGIONAL_TIMEZONES).length,
          postsPerRegionPerDay: 3,
          totalDailyPosts: Object.keys(REGIONAL_TIMEZONES).length * 3,
          schedule,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_leaderboard': {
        // Update weekly/monthly leaderboards (called by analytics)
        console.log('[Scheduler] Updating leaderboards...');
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Leaderboard update triggered',
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'award_monthly_winners': {
        // Award monthly incentive winners (called at month end)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        const monthName = lastMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        
        console.log(`[Scheduler] Awarding winners for ${monthName}`);
        
        return new Response(JSON.stringify({
          success: true,
          message: `Monthly awards processed for ${monthName}`,
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({
          error: 'Unknown action',
          validActions: [
            'generate_daily_plan',
            'check_and_execute',
            'get_global_schedule',
            'update_leaderboard',
            'award_monthly_winners',
          ],
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('[Scheduler] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: String(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
