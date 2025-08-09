import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMasterToast } from "./useMasterToast";

export interface LSProject {
  id: number;
  title?: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  [key: string]: any;
}

export interface LSTask {
  id: number;
  project?: number;
  data?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface LSAnnotation {
  id: number;
  task?: number;
  result?: any[];
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export function useLabelStudio() {
  const [loading, setLoading] = useState(false);
  const { showError } = useMasterToast();

  const invoke = useCallback(async (action: string, payload?: Record<string, any>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("label-studio-connector", {
        body: { action, ...(payload || {}) },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Unknown Label Studio error");
      return data.data;
    } catch (err: any) {
      console.error("Label Studio invoke error", err);
      showError(err?.message || "Label Studio request failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const listProjects = useCallback(async (page = 1, pageSize = 25): Promise<LSProject[]> => {
    return invoke("listProjects", { page, pageSize });
  }, [invoke]);

  const getProject = useCallback(async (projectId: number | string): Promise<LSProject> => {
    return invoke("getProject", { projectId });
  }, [invoke]);

  const listProjectTasks = useCallback(async (projectId: number | string, page = 1, pageSize = 25): Promise<LSTask[]> => {
    return invoke("listProjectTasks", { projectId, page, pageSize });
  }, [invoke]);

  const listTaskAnnotations = useCallback(async (taskId: number | string): Promise<LSAnnotation[]> => {
    return invoke("listTaskAnnotations", { taskId });
  }, [invoke]);

  const exportProject = useCallback(async (projectId: number | string): Promise<any> => {
    return invoke("exportProject", { projectId });
  }, [invoke]);

  return {
    loading,
    listProjects,
    getProject,
    listProjectTasks,
    listTaskAnnotations,
    exportProject,
  };
}
