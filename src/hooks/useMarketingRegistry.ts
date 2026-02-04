/**
 * useMarketingRegistry Hook
 * 
 * React hook for accessing and managing dynamic marketing registry data:
 * - Products, Audiences, Languages, Brand Assets
 * - CRUD operations with optimistic updates
 * - Real-time cache invalidation
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dynamicMarketingRegistryService,
  type MarketingProduct,
  type MarketingAudience,
  type MarketingLanguage,
  type MarketingBrandAsset,
} from '@/services/marketing/dynamicMarketingRegistryService';
import { toast } from 'sonner';

// ============================================================================
// QUERY KEYS
// ============================================================================

const QUERY_KEYS = {
  products: ['marketing', 'products'] as const,
  audiences: ['marketing', 'audiences'] as const,
  languages: ['marketing', 'languages'] as const,
  brandAssets: (productId?: string) => ['marketing', 'brandAssets', productId] as const,
};

// ============================================================================
// HOOK OPTIONS
// ============================================================================

interface UseMarketingRegistryOptions {
  /** Automatically fetch on mount */
  autoFetch?: boolean;
  /** Show toast notifications */
  showNotifications?: boolean;
  /** Only fetch system defaults */
  systemOnly?: boolean;
  /** Filter by industry (for audiences) */
  industry?: string;
  /** Specific product ID for brand assets */
  productId?: string;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useMarketingRegistry(options: UseMarketingRegistryOptions = {}) {
  const {
    autoFetch = true,
    showNotifications = true,
    systemOnly = false,
    industry,
    productId,
  } = options;

  const queryClient = useQueryClient();

  // ============================================================================
  // PRODUCTS QUERY
  // ============================================================================

  const productsQuery = useQuery({
    queryKey: [...QUERY_KEYS.products, { systemOnly }],
    queryFn: () => dynamicMarketingRegistryService.getProducts({ systemOnly }),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // ============================================================================
  // AUDIENCES QUERY
  // ============================================================================

  const audiencesQuery = useQuery({
    queryKey: [...QUERY_KEYS.audiences, { systemOnly, industry }],
    queryFn: () => dynamicMarketingRegistryService.getAudiences({ systemOnly, industry }),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000,
  });

  // ============================================================================
  // LANGUAGES QUERY
  // ============================================================================

  const languagesQuery = useQuery({
    queryKey: [...QUERY_KEYS.languages, { systemOnly }],
    queryFn: () => dynamicMarketingRegistryService.getLanguages({ systemOnly }),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000,
  });

  // ============================================================================
  // BRAND ASSETS QUERY
  // ============================================================================

  const brandAssetsQuery = useQuery({
    queryKey: QUERY_KEYS.brandAssets(productId),
    queryFn: () => dynamicMarketingRegistryService.getBrandAssets(productId),
    enabled: autoFetch && !!productId,
    staleTime: 2 * 60 * 1000,
  });

  // ============================================================================
  // PRODUCT MUTATIONS
  // ============================================================================

  const createProductMutation = useMutation({
    mutationFn: (product: Omit<MarketingProduct, 'id' | 'created_at' | 'updated_at'>) =>
      dynamicMarketingRegistryService.createProduct(product),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      if (showNotifications) {
        toast.success(`Product "${newProduct.name}" created`);
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error('Failed to create product');
      }
      console.error('[useMarketingRegistry] Create product error:', error);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MarketingProduct> }) =>
      dynamicMarketingRegistryService.updateProduct(id, updates),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      if (showNotifications) {
        toast.success(`Product "${updatedProduct.name}" updated`);
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error('Failed to update product');
      }
      console.error('[useMarketingRegistry] Update product error:', error);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => dynamicMarketingRegistryService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      if (showNotifications) {
        toast.success('Product deleted');
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error('Failed to delete product');
      }
      console.error('[useMarketingRegistry] Delete product error:', error);
    },
  });

  // ============================================================================
  // AUDIENCE MUTATIONS
  // ============================================================================

  const createAudienceMutation = useMutation({
    mutationFn: (audience: Omit<MarketingAudience, 'id' | 'created_at' | 'updated_at'>) =>
      dynamicMarketingRegistryService.createAudience(audience),
    onSuccess: (newAudience) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.audiences });
      if (showNotifications) {
        toast.success(`Audience "${newAudience.label}" created`);
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error('Failed to create audience');
      }
      console.error('[useMarketingRegistry] Create audience error:', error);
    },
  });

  const updateAudienceMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MarketingAudience> }) =>
      dynamicMarketingRegistryService.updateAudience(id, updates),
    onSuccess: (updatedAudience) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.audiences });
      if (showNotifications) {
        toast.success(`Audience "${updatedAudience.label}" updated`);
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error('Failed to update audience');
      }
      console.error('[useMarketingRegistry] Update audience error:', error);
    },
  });

  const deleteAudienceMutation = useMutation({
    mutationFn: (id: string) => dynamicMarketingRegistryService.deleteAudience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.audiences });
      if (showNotifications) {
        toast.success('Audience deleted');
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error('Failed to delete audience');
      }
      console.error('[useMarketingRegistry] Delete audience error:', error);
    },
  });

  // ============================================================================
  // LANGUAGE MUTATIONS
  // ============================================================================

  const createLanguageMutation = useMutation({
    mutationFn: (language: Omit<MarketingLanguage, 'id' | 'created_at' | 'updated_at'>) =>
      dynamicMarketingRegistryService.createLanguage(language),
    onSuccess: (newLanguage) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.languages });
      if (showNotifications) {
        toast.success(`Language "${newLanguage.language_name}" added`);
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error('Failed to add language');
      }
      console.error('[useMarketingRegistry] Create language error:', error);
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MarketingLanguage> }) =>
      dynamicMarketingRegistryService.updateLanguage(id, updates),
    onSuccess: (updatedLanguage) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.languages });
      if (showNotifications) {
        toast.success(`Language "${updatedLanguage.language_name}" updated`);
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error('Failed to update language');
      }
      console.error('[useMarketingRegistry] Update language error:', error);
    },
  });

  // ============================================================================
  // BRAND ASSET MUTATIONS
  // ============================================================================

  const createBrandAssetMutation = useMutation({
    mutationFn: (asset: Omit<MarketingBrandAsset, 'id' | 'created_at' | 'updated_at'>) =>
      dynamicMarketingRegistryService.createBrandAsset(asset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing', 'brandAssets'] });
      if (showNotifications) {
        toast.success('Brand asset uploaded');
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error('Failed to upload brand asset');
      }
      console.error('[useMarketingRegistry] Create brand asset error:', error);
    },
  });

  const deleteBrandAssetMutation = useMutation({
    mutationFn: (id: string) => dynamicMarketingRegistryService.deleteBrandAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing', 'brandAssets'] });
      if (showNotifications) {
        toast.success('Brand asset deleted');
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error('Failed to delete brand asset');
      }
      console.error('[useMarketingRegistry] Delete brand asset error:', error);
    },
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  const refreshAll = useCallback(() => {
    dynamicMarketingRegistryService.refreshCache();
    queryClient.invalidateQueries({ queryKey: ['marketing'] });
  }, [queryClient]);

  const getProductById = useCallback((id: string) => {
    return productsQuery.data?.find(p => p.id === id) || null;
  }, [productsQuery.data]);

  const getAudienceById = useCallback((id: string) => {
    return audiencesQuery.data?.find(a => a.id === id) || null;
  }, [audiencesQuery.data]);

  const getLanguageByCode = useCallback((code: string) => {
    return languagesQuery.data?.find(l => l.language_code === code) || null;
  }, [languagesQuery.data]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const systemProducts = useMemo(() => 
    productsQuery.data?.filter(p => p.is_system_default) || [],
    [productsQuery.data]
  );

  const userProducts = useMemo(() => 
    productsQuery.data?.filter(p => !p.is_system_default) || [],
    [productsQuery.data]
  );

  const systemAudiences = useMemo(() => 
    audiencesQuery.data?.filter(a => a.is_system_default) || [],
    [audiencesQuery.data]
  );

  const userAudiences = useMemo(() => 
    audiencesQuery.data?.filter(a => !a.is_system_default) || [],
    [audiencesQuery.data]
  );

  const industriesList = useMemo(() => {
    const industries = new Set<string>();
    audiencesQuery.data?.forEach(a => {
      if (a.industry) industries.add(a.industry);
    });
    return Array.from(industries).sort();
  }, [audiencesQuery.data]);

  const isLoading = productsQuery.isLoading || audiencesQuery.isLoading || languagesQuery.isLoading;
  const isError = productsQuery.isError || audiencesQuery.isError || languagesQuery.isError;

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    products: productsQuery.data || [],
    audiences: audiencesQuery.data || [],
    languages: languagesQuery.data || [],
    brandAssets: brandAssetsQuery.data || [],

    // Computed
    systemProducts,
    userProducts,
    systemAudiences,
    userAudiences,
    industriesList,

    // Loading states
    isLoading,
    isError,
    isLoadingProducts: productsQuery.isLoading,
    isLoadingAudiences: audiencesQuery.isLoading,
    isLoadingLanguages: languagesQuery.isLoading,
    isLoadingBrandAssets: brandAssetsQuery.isLoading,

    // Product actions
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    isCreatingProduct: createProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,

    // Audience actions
    createAudience: createAudienceMutation.mutateAsync,
    updateAudience: updateAudienceMutation.mutateAsync,
    deleteAudience: deleteAudienceMutation.mutateAsync,
    isCreatingAudience: createAudienceMutation.isPending,
    isUpdatingAudience: updateAudienceMutation.isPending,
    isDeletingAudience: deleteAudienceMutation.isPending,

    // Language actions
    createLanguage: createLanguageMutation.mutateAsync,
    updateLanguage: updateLanguageMutation.mutateAsync,
    isCreatingLanguage: createLanguageMutation.isPending,
    isUpdatingLanguage: updateLanguageMutation.isPending,

    // Brand asset actions
    createBrandAsset: createBrandAssetMutation.mutateAsync,
    deleteBrandAsset: deleteBrandAssetMutation.mutateAsync,
    isCreatingBrandAsset: createBrandAssetMutation.isPending,
    isDeletingBrandAsset: deleteBrandAssetMutation.isPending,

    // Helpers
    refreshAll,
    getProductById,
    getAudienceById,
    getLanguageByCode,

    // Refetch functions
    refetchProducts: productsQuery.refetch,
    refetchAudiences: audiencesQuery.refetch,
    refetchLanguages: languagesQuery.refetch,
    refetchBrandAssets: brandAssetsQuery.refetch,
  };
}

export default useMarketingRegistry;
