
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
  created_at: string;
}

interface CreateApplicationData {
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
    queryFn: async (): Promise<DeveloperApplication[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('developer_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: CreateApplicationData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('developer_applications')
        .insert({
          user_id: user.id,
          company_name: applicationData.companyName,
          email: applicationData.email,
          description: applicationData.description,
          requested_modules: applicationData.requestedModules,
          status: 'pending'
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
        description: "Your API access application has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application.",
        variant: "destructive",
      });
    }
  });

  return {
    applications: applications || [],
    isLoading,
    error,
    createApplication: createApplicationMutation.mutate,
    isCreating: createApplicationMutation.isPending
  };
};
