/**
 * GPO MEMBERSHIPS HOOK
 * Manages GPO membership data and operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GPOMembership {
  id?: string;
  onboarding_id: string;
  gpo_name: string;
  membership_number?: string;
  contract_effective_date?: string;
  contract_expiration_date?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  covered_categories?: string[];
  tier_level?: string;
  rebate_information?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useGPOMemberships = (onboardingId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch GPO memberships for an onboarding record
  const { data: memberships = [], isLoading, error } = useQuery({
    queryKey: ['gpo-memberships', onboardingId],
    queryFn: async () => {
      if (!onboardingId) return [];

      const { data, error } = await supabase
        .from('onboarding_gpo_memberships')
        .select('*')
        .eq('onboarding_id', onboardingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GPOMembership[];
    },
    enabled: !!onboardingId
  });

  // Create GPO membership mutation
  const createMembershipMutation = useMutation({
    mutationFn: async (membershipData: Omit<GPOMembership, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('onboarding_gpo_memberships')
        .insert(membershipData)
        .select()
        .maybeSingle();

      if (error || !data) throw (error || new Error('Failed to create GPO membership'));

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gpo-memberships', onboardingId] });
      toast({
        title: "Success",
        description: "GPO membership added successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add GPO membership",
        variant: "destructive"
      });
    }
  });

  // Update GPO membership mutation
  const updateMembershipMutation = useMutation({
    mutationFn: async ({ id, ...membershipData }: Partial<GPOMembership> & { id: string }) => {
      const { data, error } = await supabase
        .from('onboarding_gpo_memberships')
        .update(membershipData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error || !data) throw (error || new Error('Failed to update GPO membership'));

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gpo-memberships', onboardingId] });
      toast({
        title: "Success",
        description: "GPO membership updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update GPO membership",
        variant: "destructive"
      });
    }
  });

  // Delete GPO membership mutation
  const deleteMembershipMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('onboarding_gpo_memberships')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gpo-memberships', onboardingId] });
      toast({
        title: "Success",
        description: "GPO membership removed successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove GPO membership",
        variant: "destructive"
      });
    }
  });

  return {
    memberships,
    isLoading,
    error,
    createMembership: createMembershipMutation.mutate,
    updateMembership: updateMembershipMutation.mutate,
    deleteMembership: deleteMembershipMutation.mutate,
    isCreating: createMembershipMutation.isPending,
    isUpdating: updateMembershipMutation.isPending,
    isDeleting: deleteMembershipMutation.isPending
  };
};