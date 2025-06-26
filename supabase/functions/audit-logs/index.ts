
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditRequest {
  action: 'get_logs' | 'get_user_activity' | 'get_table_changes' | 'export_logs';
  filters?: {
    user_id?: string;
    table_name?: string;
    action_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check if user has permission to view audit logs
    const { data: hasPermission } = await supabase.rpc('has_role', {
      user_id: user.id,
      role_name: 'superAdmin'
    });

    if (!hasPermission) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions to access audit logs' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { action, filters }: AuditRequest = await req.json();

    // First get audit logs
    let query = supabase
      .from('audit_logs')
      .select('*');

    // Apply filters
    if (filters) {
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      if (filters.action_type) {
        query = query.eq('action', filters.action_type);
      }
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
    }

    let result;
    switch (action) {
      case 'get_logs':
        result = await query
          .order('created_at', { ascending: false })
          .limit(filters?.limit || 100);
        break;

      case 'get_user_activity':
        if (!filters?.user_id) {
          return new Response(JSON.stringify({ error: 'User ID is required for user activity' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        result = await query
          .eq('user_id', filters.user_id)
          .order('created_at', { ascending: false })
          .limit(filters?.limit || 50);
        break;

      case 'get_table_changes':
        if (!filters?.table_name) {
          return new Response(JSON.stringify({ error: 'Table name is required for table changes' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        result = await query
          .eq('table_name', filters.table_name)
          .order('created_at', { ascending: false })
          .limit(filters?.limit || 100);
        break;

      case 'export_logs':
        result = await query
          .order('created_at', { ascending: false })
          .limit(filters?.limit || 1000);
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('📊 Audit logs fetched:', result.data?.length || 0);

    // Now get user data from auth.users table using admin API directly
    const userIds = [...new Set(result.data?.map(log => log.user_id).filter(Boolean))];
    let userProfiles = [];
    
    if (userIds.length > 0) {
      console.log('👥 Fetching user data for IDs:', userIds);
      
      try {
        // Use the admin API to get user data directly from auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('❌ Error fetching auth users:', authError);
        } else {
          console.log('✅ Auth users fetched:', authUsers.users.length);
          
          // Filter users to only those we need and get their profiles
          const relevantUsers = authUsers.users.filter(user => userIds.includes(user.id));
          console.log('🔍 Relevant users found:', relevantUsers.length);
          
          // Get additional profile data if available
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .in('id', userIds);
          
          console.log('📝 Profiles found:', profilesData?.length || 0);
          
          userProfiles = relevantUsers.map(authUser => {
            const profile = profilesData?.find(p => p.id === authUser.id);
            return {
              id: authUser.id,
              first_name: profile?.first_name || authUser.user_metadata?.firstName || authUser.user_metadata?.first_name || null,
              last_name: profile?.last_name || authUser.user_metadata?.lastName || authUser.user_metadata?.last_name || null,
              email: profile?.email || authUser.email
            };
          });
          
          console.log('✅ User profiles prepared:', userProfiles.length);
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
        userProfiles = [];
      }
    }

    // Merge the data
    const enrichedData = result.data?.map(log => ({
      ...log,
      profiles: userProfiles.find(profile => profile.id === log.user_id) || null
    }));

    console.log('🔄 Enriched data prepared with user info');

    // Get summary statistics
    const { data: totalCount } = await supabase
      .from('audit_logs')
      .select('id', { count: 'exact' });

    const { data: todayCount } = await supabase
      .from('audit_logs')
      .select('id', { count: 'exact' })
      .gte('created_at', new Date().toISOString().split('T')[0]);

    return new Response(JSON.stringify({ 
      success: true, 
      data: enrichedData,
      metadata: {
        total_logs: totalCount?.length || 0,
        today_logs: todayCount?.length || 0,
        filtered_count: enrichedData?.length || 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in audit-logs:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
