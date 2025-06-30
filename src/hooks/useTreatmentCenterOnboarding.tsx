
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

export const useTreatmentCenterOnboarding = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's onboarding applications
  const { data: onboardingApplications, isLoading, error } = useQuery({
    queryKey: ['onboarding-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .select(`
          *,
          onboarding_addresses (*),
          onboarding_contacts (*),
          onboarding_principal_owners (*),
          onboarding_controlling_entities (*),
          onboarding_references (*),
          onboarding_additional_licenses (*),
          onboarding_document_uploads (*),
          onboarding_workflow_notes (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching onboarding applications:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Create new onboarding application
  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: Partial<TreatmentCenterOnboarding>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .insert({
          user_id: user.id,
          legal_name: applicationData.company_info?.legal_name || '',
          dba_name: applicationData.company_info?.dba_name,
          website: applicationData.company_info?.website,
          federal_tax_id: applicationData.company_info?.federal_tax_id || '',
          same_as_legal_address: applicationData.company_info?.same_as_legal_address || false,
          selected_distributors: applicationData.selected_distributors || [],
          business_types: applicationData.business_info?.business_type || [],
          years_in_business: applicationData.business_info?.years_in_business,
          ownership_type: applicationData.business_info?.ownership_type,
          state_org_charter_id: applicationData.business_info?.state_org_charter_id,
          number_of_employees: applicationData.business_info?.number_of_employees,
          estimated_monthly_purchases: applicationData.business_info?.estimated_monthly_purchases,
          initial_order_amount: applicationData.business_info?.initial_order_amount,
          current_step: 'company_info'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-applications'] });
      toast({
        title: "Success",
        description: "Onboarding application created successfully!",
      });
      return data;
    },
    onError: (error: any) => {
      console.error('Error creating onboarding application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create onboarding application",
        variant: "destructive",
      });
    },
  });

  // Update existing onboarding application
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<any> }) => {
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-applications'] });
      toast({
        title: "Success",
        description: "Application updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    },
  });

  // Submit application for review
  const submitApplicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          current_step: 'review'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-applications'] });
      toast({
        title: "Success",
        description: "Application submitted for review!",
      });
    },
    onError: (error: any) => {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  // Add address to application
  const addAddressMutation = useMutation({
    mutationFn: async ({ onboarding_id, address_type, address }: {
      onboarding_id: string;
      address_type: string;
      address: any;
    }) => {
      const { data, error } = await supabase
        .from('onboarding_addresses')
        .insert({
          onboarding_id,
          address_type,
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country || 'USA'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-applications'] });
    },
  });

  // Add contact to application
  const addContactMutation = useMutation({
    mutationFn: async ({ onboarding_id, contact_type, contact }: {
      onboarding_id: string;
      contact_type: string;
      contact: any;
    }) => {
      const { data, error } = await supabase
        .from('onboarding_contacts')
        .insert({
          onboarding_id,
          contact_type,
          name: contact.name,
          title: contact.title,
          phone: contact.phone,
          fax: contact.fax,
          email: contact.email
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-applications'] });
    },
  });

  return {
    onboardingApplications,
    isLoading,
    error,
    createApplication: createApplicationMutation.mutate,
    updateApplication: updateApplicationMutation.mutate,
    submitApplication: submitApplicationMutation.mutate,
    addAddress: addAddressMutation.mutate,
    addContact: addContactMutation.mutate,
    isCreating: createApplicationMutation.isPending,
    isUpdating: updateApplicationMutation.isPending,
    isSubmitting: submitApplicationMutation.isPending,
  };
};
