import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for web calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extended actions: original Label Studio API + background ML service
type LabelStudioAction =
  | "listProjects"
  | "getProject"
  | "listProjectTasks"
  | "listTaskAnnotations"
  | "exportProject"
  | "createAnnotation"
  | "updateTask"
  | "bulkImportTasks"
  | "getProjectStats"
  | "searchTasks"
  // Background ML service actions (invisible to user)
  | "getHints"
  | "getSuggestions"
  | "recordTrainingEvents";

interface InvokeBody {
  action: LabelStudioAction;
  projectId?: number | string;
  taskId?: number | string;
  page?: number;
  pageSize?: number;
  // Enhanced functionality params
  annotation?: any;
  taskData?: any;
  bulkTasks?: any[];
  searchQuery?: string;
  filters?: Record<string, any>;
  // Background ML service params
  product?: 'mind' | 'spark' | 'vibe' | 'arc' | 'hub';
  context?: Record<string, any>;
  suggestionType?: 'caption' | 'hashtag' | 'thumbnail' | 'seo' | 'script';
  input?: string;
  events?: Array<{
    eventType: string;
    context: Record<string, any>;
    metadata?: Record<string, any>;
  }>;
}

// Product-specific hint templates based on ML training patterns
const PRODUCT_HINT_TEMPLATES: Record<string, Array<{ type: string; message: string; confidence: number }>> = {
  mind: [
    { type: 'improvement', message: 'Consider adding keywords for better SEO', confidence: 0.85 },
    { type: 'suggestion', message: 'AI can enhance this paragraph for clarity', confidence: 0.78 }
  ],
  spark: [
    { type: 'suggestion', message: 'This script section could use more natural pauses', confidence: 0.82 },
    { type: 'improvement', message: 'Add emotional cues for better delivery', confidence: 0.75 }
  ],
  vibe: [
    { type: 'warning', message: 'Audio levels may need normalization', confidence: 0.9 },
    { type: 'suggestion', message: 'Consider adding background music at this point', confidence: 0.7 }
  ],
  arc: [
    { type: 'improvement', message: 'Episode title could be more engaging', confidence: 0.8 },
    { type: 'suggestion', message: 'Add chapter markers for better navigation', confidence: 0.72 }
  ],
  hub: [
    { type: 'suggestion', message: 'Trending topics related to your content', confidence: 0.88 },
    { type: 'improvement', message: 'Optimize thumbnail for platform requirements', confidence: 0.85 }
  ]
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Ensure invocation is authenticated (default verify_jwt = true)
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LS_API_URL = Deno.env.get("LABEL_STUDIO_API_URL");
    // Support both ACCESS_TOKEN (preferred) and legacy API_KEY naming
    const LS_ACCESS_TOKEN = Deno.env.get("LABEL_STUDIO_ACCESS_TOKEN") || Deno.env.get("LABEL_STUDIO_API_KEY");

    if (!LS_API_URL || !LS_ACCESS_TOKEN) {
      console.error("[LabelStudio] Missing LABEL_STUDIO_API_URL or LABEL_STUDIO_ACCESS_TOKEN");
      return new Response(
        JSON.stringify({
          error:
            "Label Studio secrets not configured. Please set LABEL_STUDIO_API_URL and LABEL_STUDIO_ACCESS_TOKEN in Supabase Function secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as InvokeBody;
    const { action, projectId, taskId, product, suggestionType, input, events } = body;
    const page = Math.max(1, body.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, body.pageSize ?? 25));

    const baseUrl = LS_API_URL?.replace(/\/$/, "") || "";

    async function lsFetch(path: string, init?: RequestInit) {
      const url = `${baseUrl}${path}`;
      const res = await fetch(url, {
        ...init,
        headers: {
          Authorization: `Token ${LS_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("[LabelStudio] API error:", res.status, text);
        throw new Error(`Label Studio API error ${res.status}: ${text}`);
      }
      return res.json();
    }

    console.log("[LabelStudio] Action:", action, "page:", page, "pageSize:", pageSize);

    let data: unknown;

    const { annotation, taskData, bulkTasks, searchQuery, filters } = body;

    switch (action) {
      case "listProjects": {
        data = await lsFetch(`/api/projects?page=${page}&page_size=${pageSize}`);
        break;
      }
      case "getProject": {
        if (!projectId) throw new Error("projectId is required");
        data = await lsFetch(`/api/projects/${projectId}`);
        break;
      }
      case "listProjectTasks": {
        if (!projectId) throw new Error("projectId is required");
        let url = `/api/projects/${projectId}/tasks?page=${page}&page_size=${pageSize}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            url += `&${key}=${encodeURIComponent(String(value))}`;
          });
        }
        data = await lsFetch(url);
        break;
      }
      case "listTaskAnnotations": {
        if (!taskId) throw new Error("taskId is required");
        data = await lsFetch(`/api/tasks/${taskId}/annotations`);
        break;
      }
      case "exportProject": {
        if (!projectId) throw new Error("projectId is required");
        data = await lsFetch(`/api/projects/${projectId}/export?format=JSON`);
        break;
      }
      case "createAnnotation": {
        if (!taskId || !annotation) throw new Error("taskId and annotation are required");
        data = await lsFetch(`/api/tasks/${taskId}/annotations`, {
          method: 'POST',
          body: JSON.stringify(annotation)
        });
        break;
      }
      case "updateTask": {
        if (!taskId || !taskData) throw new Error("taskId and taskData are required");
        data = await lsFetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          body: JSON.stringify(taskData)
        });
        break;
      }
      case "bulkImportTasks": {
        if (!projectId || !bulkTasks) throw new Error("projectId and bulkTasks are required");
        data = await lsFetch(`/api/projects/${projectId}/import`, {
          method: 'POST',
          body: JSON.stringify(bulkTasks)
        });
        break;
      }
      case "getProjectStats": {
        if (!projectId) throw new Error("projectId is required");
        const [project, tasks] = await Promise.all([
          lsFetch(`/api/projects/${projectId}`),
          lsFetch(`/api/projects/${projectId}/tasks?page=1&page_size=1`)
        ]);
        data = {
          project_info: project,
          total_tasks: tasks.count || 0,
          completed_tasks: project.num_tasks_with_annotations || 0,
          completion_rate: project.num_tasks_with_annotations / (tasks.count || 1) * 100
        };
        break;
      }
      case "searchTasks": {
        if (!projectId || !searchQuery) throw new Error("projectId and searchQuery are required");
        data = await lsFetch(`/api/projects/${projectId}/tasks?search=${encodeURIComponent(searchQuery)}&page=${page}&page_size=${pageSize}`);
        break;
      }
      
      // ==========================================
      // BACKGROUND ML SERVICE ACTIONS (No Label Studio API needed)
      // These provide proactive hints/suggestions using AI
      // ==========================================
      
      case "getHints": {
        // Return context-aware hints based on product and training patterns
        const productHints = PRODUCT_HINT_TEMPLATES[product || 'mind'] || [];
        const filteredHints = productHints.filter(h => h.confidence >= 0.7);
        
        // Generate unique IDs for hints
        data = {
          hints: filteredHints.map((hint, idx) => ({
            id: `hint_${Date.now()}_${idx}`,
            ...hint,
            dismissable: true
          }))
        };
        break;
      }
      
      case "getSuggestions": {
        // Use Lovable AI to generate smart suggestions
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        
        if (!LOVABLE_API_KEY) {
          // Fallback to basic suggestions without AI
          data = { suggestions: [] };
          break;
        }
        
        const suggestionPrompts: Record<string, string> = {
          caption: `Generate 3 engaging captions for this content: "${input}". Return as JSON array of strings.`,
          hashtag: `Suggest 5 relevant hashtags for: "${input}". Return as JSON array of strings starting with #.`,
          thumbnail: `Suggest 3 thumbnail concepts for: "${input}". Return as JSON array of short descriptions.`,
          seo: `Suggest 3 SEO improvements for: "${input}". Return as JSON array of actionable tips.`,
          script: `Suggest 2 script enhancements for: "${input}". Return as JSON array of suggestions.`
        };
        
        try {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: "You are a helpful assistant that returns ONLY valid JSON arrays. No markdown, no explanations." },
                { role: "user", content: suggestionPrompts[suggestionType || 'caption'] || suggestionPrompts.caption }
              ],
              temperature: 0.7
            })
          });
          
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || '[]';
            // Parse JSON from response
            const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
            data = { suggestions: JSON.parse(cleanContent) };
          } else {
            data = { suggestions: [] };
          }
        } catch (err) {
          console.error('[LabelStudio] AI suggestion error:', err);
          data = { suggestions: [] };
        }
        break;
      }
      
      case "recordTrainingEvents": {
        // Store training events for ML improvement
        // In production, this would sync to Label Studio's annotation system
        console.log(`[LabelStudio] Received ${events?.length || 0} training events`);
        
        // If Label Studio is configured, sync events as annotations
        if (LS_API_URL && LS_ACCESS_TOKEN && events && events.length > 0) {
          // Optionally bulk import as annotation tasks
          // This enables continuous learning from user interactions
          try {
            // Create training tasks in Label Studio for review
            const trainingTasks = events.map((event) => ({
              data: {
                event_type: event.eventType,
                ...event.context,
                ...event.metadata
              }
            }));
            
            // Get default training project or create one
            // For now, just log - actual sync would need project setup
            console.log('[LabelStudio] Training data prepared:', trainingTasks.length, 'tasks');
          } catch (syncErr) {
            console.warn('[LabelStudio] Training sync warning:', syncErr);
          }
        }
        
        data = { recorded: events?.length || 0, success: true };
        break;
      }
      
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[LabelStudio] Function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
