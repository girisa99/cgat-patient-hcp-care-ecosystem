
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiDetails {
  id: string;
  name: string;
  external_name?: string;
  external_description?: string;
  status: string;
  visibility: string;
  pricing_model: string;
  category?: string;
  tags: string[];
  documentation_url?: string;
  support_url?: string;
  marketplace_config?: {
    enabled: boolean;
  };
  published_at?: string;
}

interface PublishSettings {
  externalName: string;
  externalDescription: string;
  visibility: string;
  pricingModel: string;
  category: string;
  tags: string[];
  documentationUrl: string;
  supportUrl: string;
  marketplaceEnabled: boolean;
}

export const useApiPublish = (apiId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch API details
  const { data: apiDetails, isLoading } = useQuery({
    queryKey: ['external-api', apiId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_api_registry')
        .select('*')
        .eq('id', apiId)
        .single();

      if (error) {
        console.error('Error fetching API details:', error);
        throw error;
      }

      return data as ApiDetails;
    },
    enabled: !!apiId,
  });

  // Update publish settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: PublishSettings) => {
      const { error } = await supabase
        .from('external_api_registry')
        .update({
          external_name: settings.externalName,
          external_description: settings.externalDescription,
          visibility: settings.visibility,
          pricing_model: settings.pricingModel,
          category: settings.category,
          tags: settings.tags,
          documentation_url: settings.documentationUrl,
          support_url: settings.supportUrl,
          marketplace_config: {
            enabled: settings.marketplaceEnabled
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', apiId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-api', apiId] });
      toast({
        title: "Settings Updated",
        description: "API publish settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update API settings",
        variant: "destructive",
      });
    }
  });

  // Publish API
  const publishMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('external_api_registry')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          published_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', apiId);

      if (error) throw error;

      // Create marketplace listing if marketplace is enabled
      if (apiDetails?.marketplace_config?.enabled) {
        const { error: listingError } = await supabase
          .from('marketplace_listings')
          .insert({
            external_api_id: apiId,
            title: apiDetails.external_name || apiDetails.name,
            short_description: apiDetails.external_description || '',
            category: apiDetails.category || 'utilities',
            listing_status: 'pending'
          });

        if (listingError) {
          console.error('Error creating marketplace listing:', listingError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-api', apiId] });
      toast({
        title: "API Published",
        description: "Your API has been published successfully and is now available to consumers.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Publish Failed",
        description: error.message || "Failed to publish API",
        variant: "destructive",
      });
    }
  });

  // Unpublish API
  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('external_api_registry')
        .update({
          status: 'draft',
          published_at: null,
          published_by: null
        })
        .eq('id', apiId);

      if (error) throw error;

      // Remove marketplace listing
      await supabase
        .from('marketplace_listings')
        .delete()
        .eq('external_api_id', apiId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-api', apiId] });
      toast({
        title: "API Unpublished",
        description: "Your API has been unpublished and is no longer available to consumers.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unpublish Failed",
        description: error.message || "Failed to unpublish API",
        variant: "destructive",
      });
    }
  });

  return {
    apiDetails,
    isLoading,
    publishApi: publishMutation.mutate,
    unpublishApi: unpublishMutation.mutate,
    updatePublishSettings: updateSettingsMutation.mutate,
    isPublishing: publishMutation.isPending || unpublishMutation.isPending || updateSettingsMutation.isPending
  };
};
