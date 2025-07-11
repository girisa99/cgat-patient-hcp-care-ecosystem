
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { AuditRequest, AuditLogResponse } from './types.ts';
import { verifyAuthentication, checkSuperAdminPermission } from './auth.ts';
import { buildAuditLogQuery, executeAuditLogQuery } from './query-builder.ts';
import { fetchUserProfiles, enrichAuditLogsWithUserData } from './user-data.ts';
import { calculateAuditLogStatistics } from './statistics.ts';
import { validateDataArchitectureCompliance } from '../_shared/user-data-utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate data architecture compliance
    validateDataArchitectureCompliance('audit-logs/main');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const { user, error: authError } = await verifyAuthentication(req);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check if user has permission to view audit logs
    const hasPermission = await checkSuperAdminPermission(supabase, user.id);
    if (!hasPermission) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions to access audit logs' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { action, filters }: AuditRequest = await req.json();

    // Build and execute audit log query
    const query = buildAuditLogQuery(supabase, filters);
    const result = await executeAuditLogQuery(query, action, filters);

    if (result.error) {
      console.error('❌ [AUDIT-LOGS] Database error:', result.error);
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('📊 [AUDIT-LOGS] Audit logs fetched:', result.data?.length || 0);

    // Get unique user IDs from audit logs (excluding null values)
    const userIds = [...new Set(result.data?.map(log => log.user_id).filter(Boolean))];
    
    // Fetch user profiles using standardized utilities
    const userProfiles = await fetchUserProfiles(supabase, userIds);
    
    // Enrich audit logs with user data
    const enrichedData = enrichAuditLogsWithUserData(result.data || [], userProfiles);
    
    console.log('🔄 [AUDIT-LOGS] Enriched data prepared with standardized user info');

    // Calculate statistics
    const statistics = await calculateAuditLogStatistics(supabase);

    console.log('📈 [AUDIT-LOGS] Statistics calculated using standardized pattern:', {
      ...statistics,
      filtered: enrichedData?.length || 0
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: enrichedData,
      metadata: {
        ...statistics,
        filtered_count: enrichedData?.length || 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ [AUDIT-LOGS] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
