
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

    // Get all unique user IDs from audit logs (excluding null values)
    const userIds = [...new Set(result.data?.map(log => log.user_id).filter(Boolean))];
    console.log('👥 User IDs found in audit logs:', userIds);
    
    let userProfiles = [];
    
    if (userIds.length > 0) {
      try {
        // First get all auth users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('❌ Error fetching auth users:', authError);
        } else {
          console.log('✅ Total auth users available:', authUsers.users.length);
          
          // Get profile data for all users
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email');
          
          if (profilesError) {
            console.error('❌ Error fetching profiles:', profilesError);
          } else {
            console.log('📝 Total profiles available:', profilesData?.length || 0);
          }
          
          // Create user profiles map for all users (not just those in audit logs)
          userProfiles = authUsers.users.map(authUser => {
            const profile = profilesData?.find(p => p.id === authUser.id);
            return {
              id: authUser.id,
              first_name: profile?.first_name || authUser.user_metadata?.firstName || authUser.user_metadata?.first_name || null,
              last_name: profile?.last_name || authUser.user_metadata?.lastName || authUser.user_metadata?.last_name || null,
              email: profile?.email || authUser.email
            };
          });
          
          console.log('✅ User profiles prepared for all users:', userProfiles.length);
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
        userProfiles = [];
      }
    }

    // Merge the data with user profiles
    const enrichedData = result.data?.map(log => {
      const userProfile = userProfiles.find(profile => profile && profile.id === log.user_id);
      
      return {
        ...log,
        profiles: userProfile || null
      };
    });

    console.log('🔄 Enriched data prepared with user info');

    // Calculate statistics
    const { count: totalCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { count: todayCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    // Calculate active users - users who have been active in the last 7 days
    // This includes both users who performed actions AND users who had actions performed on them
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get users who performed actions
    const { data: activeUserActions } = await supabase
      .from('audit_logs')
      .select('user_id')
      .gte('created_at', sevenDaysAgo.toISOString())
      .not('user_id', 'is', null);

    // Get users who had actions performed on them (from profiles table changes)
    const { data: profileChanges } = await supabase
      .from('audit_logs')
      .select('record_id')
      .eq('table_name', 'profiles')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get users from user_roles changes (both user_id field and record_id for role assignments)
    const { data: userRoleChanges } = await supabase
      .from('audit_logs')
      .select('new_values, old_values')
      .eq('table_name', 'user_roles')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Combine all user IDs
    const allActiveUserIds = new Set();
    
    // Add users who performed actions
    activeUserActions?.forEach(log => {
      if (log.user_id) allActiveUserIds.add(log.user_id);
    });
    
    // Add users who had profile changes
    profileChanges?.forEach(log => {
      if (log.record_id) allActiveUserIds.add(log.record_id);
    });
    
    // Add users from role changes
    userRoleChanges?.forEach(log => {
      if (log.new_values?.user_id) allActiveUserIds.add(log.new_values.user_id);
      if (log.old_values?.user_id) allActiveUserIds.add(log.old_values.user_id);
    });

    const uniqueActiveUsers = allActiveUserIds.size;

    console.log('📈 Statistics calculated:', {
      total: totalCount || 0,
      today: todayCount || 0,
      activeUsers: uniqueActiveUsers,
      filtered: enrichedData?.length || 0,
      activeUserIds: Array.from(allActiveUserIds)
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: enrichedData,
      metadata: {
        total_logs: totalCount || 0,
        today_logs: todayCount || 0,
        active_users: uniqueActiveUsers,
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
