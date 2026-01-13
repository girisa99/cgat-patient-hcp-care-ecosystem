import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CollaborationRequest {
  action: 'invite_member' | 'remove_member' | 'update_role' | 'get_members' | 'create_team' | 'assign_content' | 'get_activity' | 'share_content';
  workspace_id?: string;
  user_id?: string;
  email?: string;
  role?: 'viewer' | 'editor' | 'admin' | 'owner';
  team_name?: string;
  content_id?: string;
  content_type?: string;
  assignees?: string[];
  permissions?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    let currentUserId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      currentUserId = user?.id || null;
    }

    const { action, workspace_id, user_id, email, role, team_name, content_id, content_type, assignees, permissions } = await req.json() as CollaborationRequest;

    console.log(`👥 Workspace Collaboration: ${action}`, { workspace_id, user_id, email });

    switch (action) {
      case 'invite_member': {
        if (!workspace_id || !email || !role) {
          throw new Error('workspace_id, email, and role are required');
        }

        // Check if user exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .eq('email', email)
          .single();

        const inviteId = crypto.randomUUID();
        const inviteToken = crypto.randomUUID();

        // Create invitation
        const { data: invite, error } = await supabase
          .from('workspace_invitations')
          .insert({
            id: inviteId,
            workspace_id,
            email,
            role,
            invited_by: currentUserId,
            token: inviteToken,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          })
          .select()
          .single();

        if (error) throw error;

        // If user exists, add them directly
        if (existingUser) {
          await supabase.from('workspace_members').insert({
            workspace_id,
            user_id: existingUser.id,
            role,
            invited_by: currentUserId,
            joined_at: new Date().toISOString()
          });

          return new Response(JSON.stringify({
            success: true,
            status: 'added',
            member: {
              id: existingUser.id,
              email: existingUser.email,
              name: `${existingUser.first_name || ''} ${existingUser.last_name || ''}`.trim(),
              role
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          status: 'invited',
          invite_id: inviteId,
          invite_link: `${supabaseUrl}/accept-invite?token=${inviteToken}`,
          expires_at: invite.expires_at
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'remove_member': {
        if (!workspace_id || !user_id) {
          throw new Error('workspace_id and user_id are required');
        }

        const { error } = await supabase
          .from('workspace_members')
          .delete()
          .eq('workspace_id', workspace_id)
          .eq('user_id', user_id);

        if (error) throw error;

        // Log activity
        await logActivity(supabase, workspace_id, currentUserId, 'member_removed', { removed_user_id: user_id });

        return new Response(JSON.stringify({
          success: true,
          message: 'Member removed from workspace'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'update_role': {
        if (!workspace_id || !user_id || !role) {
          throw new Error('workspace_id, user_id, and role are required');
        }

        const { data, error } = await supabase
          .from('workspace_members')
          .update({ role, updated_at: new Date().toISOString() })
          .eq('workspace_id', workspace_id)
          .eq('user_id', user_id)
          .select()
          .single();

        if (error) throw error;

        await logActivity(supabase, workspace_id, currentUserId, 'role_updated', { user_id, new_role: role });

        return new Response(JSON.stringify({
          success: true,
          member: data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_members': {
        if (!workspace_id) {
          throw new Error('workspace_id is required');
        }

        const { data: members, error } = await supabase
          .from('workspace_members')
          .select(`
            *,
            profiles:user_id (
              id, email, first_name, last_name, avatar_url
            )
          `)
          .eq('workspace_id', workspace_id);

        if (error) throw error;

        const { data: pendingInvites } = await supabase
          .from('workspace_invitations')
          .select('*')
          .eq('workspace_id', workspace_id)
          .eq('status', 'pending');

        return new Response(JSON.stringify({
          success: true,
          members: members?.map(m => ({
            id: m.user_id,
            email: m.profiles?.email,
            name: `${m.profiles?.first_name || ''} ${m.profiles?.last_name || ''}`.trim() || m.profiles?.email,
            avatar_url: m.profiles?.avatar_url,
            role: m.role,
            joined_at: m.joined_at
          })) || [],
          pending_invites: pendingInvites || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'create_team': {
        if (!workspace_id || !team_name) {
          throw new Error('workspace_id and team_name are required');
        }

        const teamId = crypto.randomUUID();
        const { data, error } = await supabase
          .from('workspace_teams')
          .insert({
            id: teamId,
            workspace_id,
            name: team_name,
            created_by: currentUserId,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          team: data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'assign_content': {
        if (!content_id || !assignees || assignees.length === 0) {
          throw new Error('content_id and assignees are required');
        }

        const assignments = assignees.map(assigneeId => ({
          content_id,
          content_type: content_type || 'general',
          user_id: assigneeId,
          assigned_by: currentUserId,
          assigned_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('content_assignments')
          .upsert(assignments, { onConflict: 'content_id,user_id' });

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          assignments: assignments.length,
          message: `Content assigned to ${assignees.length} user(s)`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'share_content': {
        if (!content_id || !user_id) {
          throw new Error('content_id and user_id are required');
        }

        const { data, error } = await supabase
          .from('content_shares')
          .insert({
            content_id,
            content_type: content_type || 'general',
            shared_with: user_id,
            shared_by: currentUserId,
            permissions: permissions || ['view'],
            shared_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          share: data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_activity': {
        if (!workspace_id) {
          throw new Error('workspace_id is required');
        }

        const { data, error } = await supabase
          .from('workspace_activity')
          .select(`
            *,
            profiles:user_id (first_name, last_name, avatar_url)
          `)
          .eq('workspace_id', workspace_id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          activity: data || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Workspace Collaboration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function logActivity(supabase: any, workspaceId: string, userId: string | null, activityType: string, details: Record<string, unknown>): Promise<void> {
  await supabase.from('workspace_activity').insert({
    workspace_id: workspaceId,
    user_id: userId,
    activity_type: activityType,
    details,
    created_at: new Date().toISOString()
  });
}
