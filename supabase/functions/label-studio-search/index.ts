// Label Studio Search Edge Function - v2.0.0 (force redeploy)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LABEL_STUDIO_API_URL = Deno.env.get('LABEL_STUDIO_API_URL');
    const LABEL_STUDIO_ACCESS_TOKEN = Deno.env.get('LABEL_STUDIO_ACCESS_TOKEN');

    if (!LABEL_STUDIO_API_URL || !LABEL_STUDIO_ACCESS_TOKEN) {
      console.error('❌ Missing Label Studio configuration');
      return new Response(
        JSON.stringify({ 
          error: 'Label Studio not configured',
          details: {
            hasUrl: !!LABEL_STUDIO_API_URL,
            hasToken: !!LABEL_STUDIO_ACCESS_TOKEN
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, projectId, action = 'search' } = await req.json();

    // Clean up the API URL (remove trailing slash if present)
    const baseUrl = LABEL_STUDIO_API_URL.replace(/\/$/, '');
    
    // Debug: check token format (first 10 chars only for security)
    const tokenPreview = LABEL_STUDIO_ACCESS_TOKEN.substring(0, 10);
    const tokenLength = LABEL_STUDIO_ACCESS_TOKEN.length;
    console.log(`🔍 Label Studio ${action} request:`, { 
      query, 
      projectId, 
      baseUrl,
      tokenPreview: tokenPreview + '...',
      tokenLength,
      startsWithToken: LABEL_STUDIO_ACCESS_TOKEN.toLowerCase().startsWith('token'),
      startsWithBearer: LABEL_STUDIO_ACCESS_TOKEN.toLowerCase().startsWith('bearer')
    });

    // Test connection / health check
    if (action === 'health' || action === 'test') {
      try {
        // Try multiple auth formats - HumanSignal docs show different formats
        // Format 1: Raw token (as shown in user's working curl)
        // Format 2: Token prefix (as shown in Label Studio docs)
        // Format 3: Bearer prefix (for JWT tokens)
        const authFormats = [
          LABEL_STUDIO_ACCESS_TOKEN, // Raw token (user's working example)
          `Token ${LABEL_STUDIO_ACCESS_TOKEN}`,
          `Bearer ${LABEL_STUDIO_ACCESS_TOKEN}`
        ];
        
        let healthResponse: Response | null = null;
        let usedFormat = '';
        
        for (const authValue of authFormats) {
          console.log('🔐 Trying auth format:', authValue.substring(0, 20) + '...');
          const resp = await fetch(`${baseUrl}/api/projects`, {
            method: 'GET',
            headers: {
              'Authorization': authValue,
              'Content-Type': 'application/json',
            },
          });
          
          if (resp.ok) {
            healthResponse = resp;
            usedFormat = authValue.substring(0, 10);
            console.log('✅ Auth format worked:', usedFormat + '...');
            break;
          } else if (resp.status !== 401) {
            // If we get a non-auth error, use this response
            healthResponse = resp;
            usedFormat = authValue.substring(0, 10);
            break;
          }
        }
        
        if (!healthResponse) {
          // All formats failed, use last attempt's response for error
          healthResponse = await fetch(`${baseUrl}/api/projects`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${LABEL_STUDIO_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          });
        }

        if (!healthResponse.ok) {
          const errorText = await healthResponse.text();
          console.error('❌ Label Studio health check failed:', healthResponse.status, errorText);
          return new Response(
            JSON.stringify({ 
              connected: false,
              status: healthResponse.status,
              error: `Connection failed: ${healthResponse.statusText}`,
              details: errorText
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const projects = await healthResponse.json();
        console.log('✅ Label Studio connected successfully, projects:', projects?.results?.length || projects?.length || 0);
        
        return new Response(
          JSON.stringify({ 
            connected: true,
            status: 200,
            projectCount: projects?.results?.length || projects?.length || 0,
            projects: (projects?.results || projects || []).slice(0, 10).map((p: any) => ({
              id: p.id,
              title: p.title,
              task_count: p.task_number || p.num_tasks_with_annotations || 0
            })),
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fetchError) {
        console.error('❌ Label Studio connection error:', fetchError);
        return new Response(
          JSON.stringify({ 
            connected: false,
            error: fetchError instanceof Error ? fetchError.message : 'Connection failed',
            timestamp: new Date().toISOString()
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // List projects
    // Build auth header based on token type
    const authHeader = LABEL_STUDIO_ACCESS_TOKEN.startsWith('eyJ') 
      ? `Bearer ${LABEL_STUDIO_ACCESS_TOKEN}`
      : `Token ${LABEL_STUDIO_ACCESS_TOKEN}`;

    if (action === 'list-projects') {
      const response = await fetch(`${baseUrl}/api/projects`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list projects: ${response.statusText}`);
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ 
          projects: data?.results || data || [],
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search annotations in a specific project
    if (action === 'search' && projectId) {
      const response = await fetch(`${baseUrl}/api/projects/${projectId}/tasks?page_size=100`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      const data = await response.json();
      const tasks = data?.results || data || [];
      
      // Filter tasks that match the query
      const matchingAnnotations = tasks
        .filter((task: any) => {
          const taskText = JSON.stringify(task.data || {}).toLowerCase();
          const annotationText = JSON.stringify(task.annotations || []).toLowerCase();
          const searchTerms = (query || '').toLowerCase().split(' ');
          return searchTerms.some((term: string) => 
            taskText.includes(term) || annotationText.includes(term)
          );
        })
        .flatMap((task: any) => 
          (task.annotations || []).map((ann: any) => ({
            taskId: task.id,
            annotationId: ann.id,
            result: ann.result,
            createdAt: ann.created_at,
            data: task.data
          }))
        );

      console.log(`📊 Found ${matchingAnnotations.length} matching annotations for query: "${query}"`);

      return new Response(
        JSON.stringify({ 
          annotations: matchingAnnotations,
          query,
          projectId,
          totalTasks: tasks.length,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get training data for ML backend
    if (action === 'get-training-data' && projectId) {
      const response = await fetch(`${baseUrl}/api/projects/${projectId}/export?exportType=JSON`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export training data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📦 Exported ${data?.length || 0} annotated tasks for training`);

      return new Response(
        JSON.stringify({ 
          trainingData: data || [],
          projectId,
          count: data?.length || 0,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default: return error for unknown action
    return new Response(
      JSON.stringify({ 
        error: 'Invalid action or missing required parameters',
        supportedActions: ['health', 'test', 'list-projects', 'search', 'get-training-data'],
        timestamp: new Date().toISOString()
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Label Studio error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
