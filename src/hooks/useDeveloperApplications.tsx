
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeveloperApplication {
  id: string;
  company_name: string;
  email: string;
  description: string;
  requested_modules: string[];
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

interface ApplicationFormData {
  companyName: string;
  email: string;
  description: string;
  requestedModules: string[];
}

export const useDeveloperApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: applications,
    isLoading,
    error
  } = useQuery({
    queryKey: ['developer-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developer_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DeveloperApplication[];
    }
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (formData: ApplicationFormData) => {
      const { data, error } = await supabase
        .from('developer_applications')
        .insert({
          company_name: formData.companyName,
          email: formData.email,
          description: formData.description,
          requested_modules: formData.requestedModules
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-applications'] });
      toast({
        title: "Application Submitted",
        description: "Your API access request has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('developer_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-applications'] });
      toast({
        title: "Application Updated",
        description: "Application status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    applications: applications || [],
    isLoading,
    error,
    createApplication: createApplicationMutation.mutate,
    isCreating: createApplicationMutation.isPending,
    updateApplication: updateApplicationMutation.mutate,
    isUpdating: updateApplicationMutation.isPending
  };
};
