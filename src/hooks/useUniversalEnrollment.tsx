/**
 * UNIVERSAL ENROLLMENT HOOK
 * Centralized hook for managing all enrollment module operations
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface EnrollmentTemplate {
  id: string;
  name: string;
  module_type: ModuleType;
  template_data: any;
  form_schema: any;
  validation_rules: any;
  workflow_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EnrollmentInstance {
  id: string;
  template_id: string | null;
  module_type: ModuleType;
  enrollment_data: any;
  submission_method: string;
  status: string;
  progress: number;
  current_step: string;
  assigned_to: string | null;
  submitted_by: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateInstanceData {
  template_id: string | null;
  module_type: ModuleType;
  enrollment_data: any;
  submission_method: string;
  status: string;
  progress: number;
  current_step: string;
  assigned_to?: string | null;
  submitted_by?: string | null;
  submitted_at?: string | null;
}

export const useUniversalEnrollment = () => {
  const [templates, setTemplates] = useState<EnrollmentTemplate[]>([]);
  const [instances, setInstances] = useState<EnrollmentInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();

  // Template Operations
  const fetchTemplates = useCallback(async (moduleType?: ModuleType) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('profiles').select('*');
      
      if (moduleType) {
        query = query.eq('module_type', moduleType);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to fetch templates');
      showError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const createTemplate = useCallback(async (templateData: Omit<EnrollmentTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .insert([templateData as any])
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [...prev, data]);
      showSuccess('Template created successfully');
      return data;
    } catch (err) {
      console.error('Error creating template:', err);
      setError('Failed to create template');
      showError('Failed to create template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<EnrollmentTemplate>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('enrollment_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => prev.map(template => 
        template.id === id ? data : template
      ));
      showSuccess('Template updated successfully');
      return data;
    } catch (err) {
      console.error('Error updating template:', err);
      setError('Failed to update template');
      showError('Failed to update template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('enrollment_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
      showSuccess('Template deleted successfully');
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
      showError('Failed to delete template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  // Instance Operations
  const fetchInstances = useCallback(async (moduleType?: ModuleType) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('enrollment_instances').select('*');
      
      if (moduleType) {
        query = query.eq('module_type', moduleType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setInstances(data || []);
    } catch (err) {
      console.error('Error fetching instances:', err);
      setError('Failed to fetch enrollment instances');
      showError('Failed to fetch enrollment instances');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const getInstance = useCallback(async (id: string): Promise<EnrollmentInstance | null> => {
    try {
      const { data, error } = await supabase
        .from('enrollment_instances')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error fetching instance:', err);
      return null;
    }
  }, []);

  const createInstance = useCallback(async (instanceData: CreateInstanceData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('enrollment_instances')
        .insert([instanceData])
        .select()
        .single();

      if (error) throw error;

      setInstances(prev => [data, ...prev]);
      showSuccess('Enrollment instance created successfully');
      return data;
    } catch (err) {
      console.error('Error creating instance:', err);
      setError('Failed to create enrollment instance');
      showError('Failed to create enrollment instance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  const updateInstance = useCallback(async (id: string, updates: Partial<EnrollmentInstance>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('enrollment_instances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setInstances(prev => prev.map(instance => 
        instance.id === id ? data : instance
      ));
      showSuccess('Enrollment instance updated successfully');
      return data;
    } catch (err) {
      console.error('Error updating instance:', err);
      setError('Failed to update enrollment instance');
      showError('Failed to update enrollment instance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  const deleteInstance = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('enrollment_instances')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInstances(prev => prev.filter(instance => instance.id !== id));
      showSuccess('Enrollment instance deleted successfully');
    } catch (err) {
      console.error('Error deleting instance:', err);
      setError('Failed to delete enrollment instance');
      showError('Failed to delete enrollment instance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  // Statistics
  const getInstanceStats = useCallback((moduleType?: ModuleType) => {
    const filteredInstances = moduleType 
      ? instances.filter(instance => instance.module_type === moduleType)
      : instances;

    return {
      total: filteredInstances.length,
      draft: filteredInstances.filter(i => i.status === 'draft').length,
      in_progress: filteredInstances.filter(i => i.status === 'in_progress').length,
      review_needed: filteredInstances.filter(i => i.status === 'review_needed').length,
      completed: filteredInstances.filter(i => i.status === 'completed').length,
      rejected: filteredInstances.filter(i => i.status === 'rejected').length
    };
  }, [instances]);

  return {
    // State
    templates,
    instances,
    loading,
    error,

    // Template operations
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Instance operations
    fetchInstances,
    getInstance,
    createInstance,
    updateInstance,
    deleteInstance,

    // Utils
    getInstanceStats
  };
};