/**
 * CREDIT APPLICATIONS HOOK
 * Manages credit application data and operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CreditApplication {
  id: string;
  applicant_user_id: string;
  business_type: string;
  requested_credit_limit?: number;
  payment_terms_requested?: string;
  primary_contact_name: string;
  primary_contact_email?: string;
  application_status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending_documents';
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  credit_check_authorized: boolean;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

export const useCreditApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's credit applications
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['credit-applications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('credit_applications')
        .select('*')
        .eq('applicant_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CreditApplication[];
    }
  });

  // Create credit application mutation
  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: Partial<CreditApplication>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('credit_applications')
        .insert({
          ...applicationData,
          applicant_user_id: user.id,
          business_type: applicationData.business_type || 'other',
          primary_contact_name: applicationData.primary_contact_name || 'Unknown'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-applications'] });
      toast({
        title: "Success",
        description: "Credit application created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create credit application",
        variant: "destructive"
      });
    }
  });

  // Update credit application mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, ...applicationData }: Partial<CreditApplication> & { id: string }) => {
      const { data, error } = await supabase
        .from('credit_applications')
        .update(applicationData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-applications'] });
      toast({
        title: "Success",
        description: "Credit application updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update credit application",
        variant: "destructive"
      });
    }
  });

  // Submit credit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('credit_applications')
        .update({
          application_status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-applications'] });
      toast({
        title: "Success",
        description: "Credit application submitted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit credit application",
        variant: "destructive"
      });
    }
  });

  return {
    applications,
    isLoading,
    error,
    createApplication: createApplicationMutation.mutate,
    updateApplication: updateApplicationMutation.mutate,
    submitApplication: submitApplicationMutation.mutate,
    isCreating: createApplicationMutation.isPending,
    isUpdating: updateApplicationMutation.isPending,
    isSubmitting: submitApplicationMutation.isPending
  };
};