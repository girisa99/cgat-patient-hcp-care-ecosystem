import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for web calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvokeBody {
  action:
    | "listProjects"
    | "getProject"
    | "listProjectTasks"
    | "listTaskAnnotations"
    | "exportProject"
    | "createAnnotation"
    | "updateTask"
    | "bulkImportTasks"
    | "getProjectStats"
    | "searchTasks";
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
    const LS_API_KEY = Deno.env.get("LABEL_STUDIO_API_KEY");

    if (!LS_API_URL || !LS_API_KEY) {
      console.error("[LabelStudio] Missing LABEL_STUDIO_API_URL or LABEL_STUDIO_API_KEY");
      return new Response(
        JSON.stringify({
          error:
            "Label Studio secrets not configured. Please set LABEL_STUDIO_API_URL and LABEL_STUDIO_API_KEY in Supabase Function secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as InvokeBody;
    const { action, projectId, taskId } = body;
    const page = Math.max(1, body.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, body.pageSize ?? 25));

    const baseUrl = LS_API_URL.replace(/\/$/, "");

    async function lsFetch(path: string, init?: RequestInit) {
      const url = `${baseUrl}${path}`;
      const res = await fetch(url, {
        ...init,
        headers: {
          Authorization: `Token ${LS_API_KEY}`,
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
