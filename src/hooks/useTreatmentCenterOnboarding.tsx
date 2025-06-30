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

      // Convert GPO memberships to string array for database storage
      const gpoMembershipsAsStrings = (applicationData.gpo_memberships || applicationData.gpo_memberships_detailed)?.map(
        membership => typeof membership === 'string' ? membership : membership.gpo_name
      ) || [];

      // Ensure selected_distributors is properly typed for database
      const selectedDistributors = (applicationData.selected_distributors || []).map(dist => {
        // Map string values to enum values if needed
        if (typeof dist === 'string') {
          const validDistributors = ['amerisource_bergen', 'cardinal_health', 'mckesson'];
          return validDistributors.includes(dist) ? dist : 'amerisource_bergen';
        }
        return dist;
      });

      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .insert({
          legal_name: applicationData.company_info?.legal_name || '',
          dba_name: applicationData.company_info?.dba_name,
          website: applicationData.company_info?.website,
          federal_tax_id: applicationData.company_info?.federal_tax_id || '',
          same_as_legal_address: applicationData.company_info?.same_as_legal_address || false,
          selected_distributors: selectedDistributors,
          business_types: applicationData.business_info?.business_type || [],
          years_in_business: applicationData.business_info?.years_in_business,
          ownership_type: applicationData.business_info?.ownership_type,
          state_org_charter_id: applicationData.business_info?.state_org_charter_id,
          number_of_employees: applicationData.business_info?.number_of_employees,
          estimated_monthly_purchases: applicationData.business_info?.estimated_monthly_purchases,
          initial_order_amount: applicationData.business_info?.initial_order_amount,
          gpo_memberships: gpoMembershipsAsStrings,
          current_step: 'company_info'
        })
        .select()
        .single();

      if (error) throw error;

      // Handle related data insertions
      const onboardingId = data.id;

      // Insert platform users
      if (applicationData.platform_users?.length) {
        const platformUsersData = applicationData.platform_users.map(user => ({
          onboarding_id: onboardingId,
          user_type: user.user_type || 'standard',
          first_name: user.first_name || user.name.split(' ')[0] || '',
          last_name: user.last_name || user.name.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: user.phone || '',
          department: user.department || '',
          access_level: user.access_level || 'basic',
          can_place_orders: user.can_place_orders || false,
          can_manage_users: user.can_manage_users || false,
          can_view_reports: user.can_view_reports || false,
          notification_preferences: user.notification_preferences || {}
        }));

        const { error: usersError } = await supabase
          .from('onboarding_platform_users')
          .insert(platformUsersData);

        if (usersError) throw usersError;
      }

      // Insert 340B programs
      if (applicationData.program_340b?.length) {
        const program340bData = applicationData.program_340b.map(program => ({
          onboarding_id: onboardingId,
          program_type: program.program_type || 'hospital',
          registration_number: program.registration_number || '',
          parent_entity_name: program.parent_entity_name || '',
          contract_pharmacy_locations: program.contract_pharmacy_locations || [],
          eligible_drug_categories: program.eligible_drug_categories || [],
          compliance_contact_name: program.compliance_contact_name || '',
          compliance_contact_email: program.compliance_contact_email || '',
          compliance_contact_phone: program.compliance_contact_phone || '',
          audit_requirements: program.audit_requirements || {}
        }));

        const { error: programsError } = await supabase
          .from('onboarding_340b_programs')
          .insert(program340bData);

        if (programsError) throw programsError;
      }

      // Insert GPO memberships
      if (applicationData.gpo_memberships_detailed?.length || applicationData.gpo_memberships?.length) {
        const gpoMemberships = applicationData.gpo_memberships_detailed || applicationData.gpo_memberships || [];
        const gpoData = gpoMemberships.map(membership => ({
          onboarding_id: onboardingId,
          gpo_name: typeof membership === 'string' ? membership : membership.gpo_name,
          membership_number: typeof membership === 'string' ? '' : membership.membership_number || '',
          contract_effective_date: typeof membership === 'string' ? null : membership.contract_effective_date || null,
          contract_expiration_date: typeof membership === 'string' ? null : membership.contract_expiration_date || null,
          primary_contact_name: typeof membership === 'string' ? '' : membership.primary_contact_name || '',
          primary_contact_email: typeof membership === 'string' ? '' : membership.primary_contact_email || '',
          primary_contact_phone: typeof membership === 'string' ? '' : membership.primary_contact_phone || '',
          covered_categories: typeof membership === 'string' ? [] : membership.covered_categories || [],
          tier_level: typeof membership === 'string' ? '' : membership.tier_level || '',
          rebate_information: typeof membership === 'string' ? {} : membership.rebate_information || {}
        }));

        const { error: gpoError } = await supabase
          .from('onboarding_gpo_memberships')
          .insert(gpoData);

        if (gpoError) throw gpoError;
      }

      // Insert enhanced payment terms
      if (applicationData.enhanced_payment_terms) {
        const { error: paymentError } = await supabase
          .from('onboarding_payment_terms')
          .insert({
            onboarding_id: onboardingId,
            preferred_terms: applicationData.enhanced_payment_terms.preferred_terms,
            credit_limit_requested: applicationData.enhanced_payment_terms.credit_limit_requested,
            payment_method: 'standard',
            early_payment_discount_interest: applicationData.enhanced_payment_terms.early_payment_discount,
            consolidation_preferences: applicationData.enhanced_payment_terms.consolidation_preferences || {},
            billing_frequency: applicationData.enhanced_payment_terms.billing_frequency
          });

        if (paymentError) throw paymentError;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-applications'] });
      toast({
        title: "Success",
        description: "Comprehensive onboarding application created successfully!",
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
