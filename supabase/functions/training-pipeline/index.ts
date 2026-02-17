import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'capture': {
        // Capture training data
        const { training_type, data_url, metadata, label_studio_project_id } = params;
        const { data, error } = await supabase
          .from('training_data_captures')
          .insert({
            user_id: user.id,
            training_type,
            data_url,
            metadata: metadata || {},
            label_studio_project_id: label_studio_project_id || null,
            sync_status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ success: true, data });
      }

      case 'bulkCapture': {
        // Bulk capture multiple items
        const { items } = params;
        const rows = (items || []).map((item: any) => ({
          user_id: user.id,
          training_type: item.training_type,
          data_url: item.data_url,
          metadata: item.metadata || {},
          label_studio_project_id: item.label_studio_project_id || null,
          sync_status: 'pending',
        }));

        const { data, error } = await supabase
          .from('training_data_captures')
          .insert(rows)
          .select();

        if (error) throw error;
        return jsonResponse({ success: true, data, count: data?.length || 0 });
      }

      case 'syncToLabelStudio': {
        // Sync pending captures to Label Studio
        const { capture_ids, project_id } = params;
        const lsUrl = Deno.env.get('LABEL_STUDIO_URL');
        const lsToken = Deno.env.get('LABEL_STUDIO_API_KEY');

        // Get pending captures
        let query = supabase
          .from('training_data_captures')
          .select('*')
          .eq('user_id', user.id)
          .eq('sync_status', 'pending');

        if (capture_ids?.length) {
          query = query.in('id', capture_ids);
        }

        const { data: captures, error: fetchErr } = await query;
        if (fetchErr) throw fetchErr;
        if (!captures || captures.length === 0) {
          return jsonResponse({ success: true, synced: 0, message: 'No pending captures' });
        }

        // If Label Studio is configured, push data
        let synced = 0;
        if (lsUrl && lsToken) {
          const targetProject = project_id || captures[0].label_studio_project_id;
          if (!targetProject) {
            return jsonResponse({ success: false, error: 'No Label Studio project specified' });
          }

          const tasks = captures.map((c: any) => ({
            data: {
              [c.training_type === 'voice' ? 'audio' : c.training_type === 'video' ? 'video' : 'image']: c.data_url,
              metadata: c.metadata,
              capture_id: c.id,
            },
          }));

          const lsResponse = await fetch(`${lsUrl}/api/projects/${targetProject}/import`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${lsToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tasks),
          });

          if (lsResponse.ok) {
            const lsResult = await lsResponse.json();
            synced = Array.isArray(lsResult) ? lsResult.length : captures.length;

            // Update sync status
            const captureIds = captures.map((c: any) => c.id);
            await supabase
              .from('training_data_captures')
              .update({
                sync_status: 'synced',
                label_studio_project_id: targetProject,
              })
              .in('id', captureIds);
          } else {
            const errText = await lsResponse.text();
            // Mark as failed
            await supabase
              .from('training_data_captures')
              .update({ sync_status: 'failed', error_message: errText })
              .in('id', captures.map((c: any) => c.id));
            return jsonResponse({ success: false, error: `LS sync failed: ${errText}` });
          }
        } else {
          // No LS configured — mark as synced locally
          await supabase
            .from('training_data_captures')
            .update({ sync_status: 'synced' })
            .in('id', captures.map((c: any) => c.id));
          synced = captures.length;
        }

        return jsonResponse({ success: true, synced });
      }

      case 'getStats': {
        // Get training pipeline stats
        const { data: stats, error } = await supabase
          .from('training_data_captures')
          .select('training_type, sync_status')
          .eq('user_id', user.id);

        if (error) throw error;

        const summary = {
          total: stats?.length || 0,
          byType: {} as Record<string, number>,
          byStatus: {} as Record<string, number>,
        };

        stats?.forEach((s: any) => {
          summary.byType[s.training_type] = (summary.byType[s.training_type] || 0) + 1;
          summary.byStatus[s.sync_status] = (summary.byStatus[s.sync_status] || 0) + 1;
        });

        return jsonResponse({ success: true, data: summary });
      }

      case 'list': {
        // List captures with optional filters
        const { training_type, sync_status, limit = 50 } = params;
        let query = supabase
          .from('training_data_captures')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (training_type) query = query.eq('training_type', training_type);
        if (sync_status) query = query.eq('sync_status', sync_status);

        const { data, error } = await query;
        if (error) throw error;
        return jsonResponse({ success: true, data });
      }

      default:
        return jsonResponse({ success: false, error: `Unknown action: ${action}` }, 400);
    }
  } catch (err: any) {
    console.error('[Training Pipeline]', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json',
    },
  });
}
