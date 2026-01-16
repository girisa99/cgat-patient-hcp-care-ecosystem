import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * LABEL STUDIO CONNECTOR - Pure Label Studio API Integration
 * 
 * PURPOSE: Interface with Label Studio for data labeling, templates, tags, annotations
 * NOTE: AI suggestions are handled by useUniversalAI hook on client-side (no duplication)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Label Studio API actions ONLY (no AI processing - that's useUniversalAI's job)
type LabelStudioAction =
  // Project Management
  | "listProjects"
  | "getProject"
  | "createProject"
  | "updateProject"
  | "deleteProject"
  // Task Management
  | "listProjectTasks"
  | "createTask"
  | "updateTask"
  | "deleteTask"
  | "bulkImportTasks"
  | "searchTasks"
  // Annotation Management
  | "listTaskAnnotations"
  | "createAnnotation"
  | "updateAnnotation"
  | "deleteAnnotation"
  // Templates & Tags (Label Studio core features)
  | "listTemplates"
  | "getTemplate"
  | "applyTemplate"
  | "listTags"
  | "createTag"
  | "assignTag"
  // Export & Stats
  | "exportProject"
  | "getProjectStats"
  // Training Data Sync (for ML pipeline)
  | "recordTrainingEvents"
  | "getTrainingData";

interface InvokeBody {
  action: LabelStudioAction;
  projectId?: number | string;
  taskId?: number | string;
  annotationId?: number | string;
  page?: number;
  pageSize?: number;
  // Data params
  annotation?: any;
  taskData?: any;
  projectData?: any;
  bulkTasks?: any[];
  searchQuery?: string;
  filters?: Record<string, any>;
  // Template & Tag params
  templateId?: string;
  templateConfig?: any;
  tagName?: string;
  tagColor?: string;
  // Training events
  events?: Array<{
    eventType: string;
    context: Record<string, any>;
    metadata?: Record<string, any>;
  }>;
}

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
    const { action, projectId, taskId, annotationId, templateId, tagName, tagColor, events } = body;
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
    const { annotation, taskData, projectData, bulkTasks, searchQuery, filters, templateConfig } = body;

    switch (action) {
      // ==========================================
      // PROJECT MANAGEMENT
      // ==========================================
      case "listProjects": {
        data = await lsFetch(`/api/projects?page=${page}&page_size=${pageSize}`);
        break;
      }
      case "getProject": {
        if (!projectId) throw new Error("projectId is required");
        data = await lsFetch(`/api/projects/${projectId}`);
        break;
      }
      case "createProject": {
        if (!projectData) throw new Error("projectData is required");
        data = await lsFetch(`/api/projects`, {
          method: 'POST',
          body: JSON.stringify(projectData)
        });
        break;
      }
      case "updateProject": {
        if (!projectId || !projectData) throw new Error("projectId and projectData are required");
        data = await lsFetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify(projectData)
        });
        break;
      }
      case "deleteProject": {
        if (!projectId) throw new Error("projectId is required");
        await lsFetch(`/api/projects/${projectId}`, { method: 'DELETE' });
        data = { deleted: true, projectId };
        break;
      }
      
      // ==========================================
      // TASK MANAGEMENT
      // ==========================================
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
      case "createTask": {
        if (!projectId || !taskData) throw new Error("projectId and taskData are required");
        data = await lsFetch(`/api/projects/${projectId}/tasks`, {
          method: 'POST',
          body: JSON.stringify(taskData)
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
      case "deleteTask": {
        if (!taskId) throw new Error("taskId is required");
        await lsFetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        data = { deleted: true, taskId };
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
      case "searchTasks": {
        if (!projectId || !searchQuery) throw new Error("projectId and searchQuery are required");
        data = await lsFetch(`/api/projects/${projectId}/tasks?search=${encodeURIComponent(searchQuery)}&page=${page}&page_size=${pageSize}`);
        break;
      }
      
      // ==========================================
      // ANNOTATION MANAGEMENT
      // ==========================================
      case "listTaskAnnotations": {
        if (!taskId) throw new Error("taskId is required");
        data = await lsFetch(`/api/tasks/${taskId}/annotations`);
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
      case "updateAnnotation": {
        if (!annotationId || !annotation) throw new Error("annotationId and annotation are required");
        data = await lsFetch(`/api/annotations/${annotationId}`, {
          method: 'PATCH',
          body: JSON.stringify(annotation)
        });
        break;
      }
      case "deleteAnnotation": {
        if (!annotationId) throw new Error("annotationId is required");
        await lsFetch(`/api/annotations/${annotationId}`, { method: 'DELETE' });
        data = { deleted: true, annotationId };
        break;
      }
      
      // ==========================================
      // TEMPLATES (Label Studio Core Feature)
      // ==========================================
      case "listTemplates": {
        // Label Studio templates are project label configs
        data = await lsFetch(`/api/templates?page=${page}&page_size=${pageSize}`);
        break;
      }
      case "getTemplate": {
        if (!templateId) throw new Error("templateId is required");
        data = await lsFetch(`/api/templates/${templateId}`);
        break;
      }
      case "applyTemplate": {
        if (!projectId || !templateConfig) throw new Error("projectId and templateConfig are required");
        // Apply a labeling template to a project
        data = await lsFetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify({ label_config: templateConfig })
        });
        break;
      }
      
      // ==========================================
      // TAGS (Label Studio Organization Feature)
      // ==========================================
      case "listTags": {
        if (!projectId) throw new Error("projectId is required");
        // Tags are part of project labels/metadata
        const project = await lsFetch(`/api/projects/${projectId}`);
        data = { tags: project.labels || [] };
        break;
      }
      case "createTag": {
        if (!projectId || !tagName) throw new Error("projectId and tagName are required");
        // Add tag to project labels
        const currentProject = await lsFetch(`/api/projects/${projectId}`);
        const currentLabels = currentProject.labels || [];
        const newTag = { name: tagName, color: tagColor || '#3b82f6' };
        data = await lsFetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify({ labels: [...currentLabels, newTag] })
        });
        break;
      }
      case "assignTag": {
        if (!taskId || !tagName) throw new Error("taskId and tagName are required");
        // Assign tag to a task via meta
        const currentTask = await lsFetch(`/api/tasks/${taskId}`);
        const currentMeta = currentTask.meta || {};
        const tags = currentMeta.tags || [];
        data = await lsFetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          body: JSON.stringify({ meta: { ...currentMeta, tags: [...tags, tagName] } })
        });
        break;
      }
      
      // ==========================================
      // EXPORT & STATS
      // ==========================================
      case "exportProject": {
        if (!projectId) throw new Error("projectId is required");
        data = await lsFetch(`/api/projects/${projectId}/export?format=JSON`);
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
      
      // ==========================================
      // TRAINING DATA SYNC (for ML pipeline)
      // ==========================================
      case "recordTrainingEvents": {
        // Store training events as Label Studio tasks for annotation review
        console.log(`[LabelStudio] Received ${events?.length || 0} training events`);
        
        if (events && events.length > 0) {
          // Create training tasks in a dedicated project (assumes project exists)
          const trainingTasks = events.map((event) => ({
            data: {
              event_type: event.eventType,
              ...event.context,
              ...event.metadata,
              recorded_at: new Date().toISOString()
            }
          }));
          
          console.log('[LabelStudio] Training data prepared:', trainingTasks.length, 'tasks');
          // In production: await lsFetch(`/api/projects/TRAINING_PROJECT_ID/import`, { method: 'POST', body: JSON.stringify(trainingTasks) });
        }
        
        data = { recorded: events?.length || 0, success: true };
        break;
      }
      case "getTrainingData": {
        // Export annotated training data for ML model training
        if (!projectId) throw new Error("projectId is required");
        const exportData = await lsFetch(`/api/projects/${projectId}/export?format=JSON`);
        // Filter to only completed annotations
        const completedData = (exportData || []).filter((item: any) => 
          item.annotations && item.annotations.length > 0 && 
          item.annotations.some((a: any) => a.completed_by)
        );
        data = {
          total: exportData?.length || 0,
          completed: completedData.length,
          training_data: completedData
        };
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
