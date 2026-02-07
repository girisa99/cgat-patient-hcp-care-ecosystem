/**
 * Hook for managing product asset inventory
 * Tracks screenshots per product/screen with duplicate prevention and gap detection
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GENIE_PRODUCTS, PRODUCT_SCREENS } from '@/components/genie-admin/MultiScreenshotGallery';

export interface AssetInventoryItem {
  id: string;
  product_id: string;
  screen_key: string;
  screen_name: string;
  storage_path: string | null;
  public_url: string | null;
  capture_method: string;
  file_hash: string | null;
  captured_at: string;
  is_outdated: boolean;
  replaced_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCoverage {
  productId: string;
  productName: string;
  productColor: string;
  totalScreens: number;
  capturedScreens: number;
  outdatedScreens: number;
  missingScreens: string[];
  capturedItems: AssetInventoryItem[];
  coveragePercent: number;
}

// Simple hash for duplicate detection (based on file size + name pattern)
async function computeFileHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const useProductAssetInventory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all inventory items
  const inventoryQuery = useQuery({
    queryKey: ['product-asset-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_asset_inventory')
        .select('*')
        .order('captured_at', { ascending: false });

      if (error) throw error;
      return data as AssetInventoryItem[];
    },
    staleTime: 30 * 1000,
  });

  // Fetch marketing products for mapping
  const productsQuery = useQuery({
    queryKey: ['marketing-products-for-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_products')
        .select('id, name, category')
        .eq('is_system_default', true)
        .order('sort_order');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Map product names to marketing_products IDs
  const productNameToId = (productsQuery.data || []).reduce((acc, p) => {
    const shortName = p.name.replace('Genie ', '').toLowerCase();
    acc[shortName] = p.id;
    // Also map exact names
    if (p.name === 'Ask Genie') acc['ask-genie'] = p.id;
    return acc;
  }, {} as Record<string, string>);

  // Compute coverage for all products
  const computeCoverage = (): ProductCoverage[] => {
    const items = inventoryQuery.data || [];

    return GENIE_PRODUCTS.map(product => {
      const screens = PRODUCT_SCREENS[product.id] || [];
      const productUuid = productNameToId[product.id];
      
      const productItems = items.filter(i => 
        i.product_id === productUuid && !i.is_outdated
      );

      const capturedKeys = new Set(productItems.map(i => i.screen_key));
      const missingScreens = screens
        .filter(s => !capturedKeys.has(s.id))
        .map(s => s.name);

      const outdatedItems = items.filter(i => 
        i.product_id === productUuid && i.is_outdated
      );

      return {
        productId: product.id,
        productName: product.name,
        productColor: product.color,
        totalScreens: screens.length,
        capturedScreens: productItems.length,
        outdatedScreens: outdatedItems.length,
        missingScreens,
        capturedItems: productItems,
        coveragePercent: screens.length > 0 
          ? Math.round((productItems.length / screens.length) * 100) 
          : 0,
      };
    });
  };

  // Register/update a screenshot with duplicate prevention
  const registerAssetMutation = useMutation({
    mutationFn: async ({
      productId,
      screenKey,
      screenName,
      storagePath,
      publicUrl,
      captureMethod,
      fileBlob,
    }: {
      productId: string;
      screenKey: string;
      screenName: string;
      storagePath: string;
      publicUrl: string;
      captureMethod: string;
      fileBlob?: Blob;
    }) => {
      const productUuid = productNameToId[productId];
      if (!productUuid) {
        throw new Error(`Unknown product: ${productId}`);
      }

      // Compute hash if blob is provided
      let fileHash: string | null = null;
      if (fileBlob) {
        fileHash = await computeFileHash(fileBlob);
      }

      // Check for existing entry with same product + screen (UNIQUE constraint handles upsert)
      const { data: existing } = await supabase
        .from('product_asset_inventory')
        .select('id, file_hash, storage_path')
        .eq('product_id', productUuid)
        .eq('screen_key', screenKey)
        .maybeSingle();

      // If same hash exists, skip (exact duplicate)
      if (existing && fileHash && existing.file_hash === fileHash) {
        console.log(`⏭️ Skipping duplicate: ${screenKey} (identical hash)`);
        return { action: 'skipped', reason: 'identical' };
      }

      // If different content exists, mark old as outdated and delete old storage file
      if (existing && existing.storage_path) {
        // Delete old file from storage
        await supabase.storage
          .from('product-screenshots')
          .remove([existing.storage_path]);
        console.log(`🗑️ Removed old file: ${existing.storage_path}`);
      }

      // Upsert the inventory record
      const { data, error } = await supabase
        .from('product_asset_inventory')
        .upsert({
          product_id: productUuid,
          screen_key: screenKey,
          screen_name: screenName,
          storage_path: storagePath,
          public_url: publicUrl,
          capture_method: captureMethod,
          file_hash: fileHash,
          captured_at: new Date().toISOString(),
          is_outdated: false,
          replaced_by: null,
        }, {
          onConflict: 'product_id,screen_key',
        })
        .select()
        .single();

      if (error) throw error;
      return { action: existing ? 'replaced' : 'created', data };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['product-asset-inventory'] });
      if (result.action === 'skipped') {
        console.log('Duplicate asset skipped');
      }
    },
    onError: (error: any) => {
      console.error('Asset registration failed:', error);
    },
  });

  // Mark assets as outdated for a product
  const markOutdatedMutation = useMutation({
    mutationFn: async (productId: string) => {
      const productUuid = productNameToId[productId];
      if (!productUuid) throw new Error(`Unknown product: ${productId}`);

      const { error } = await supabase
        .from('product_asset_inventory')
        .update({ is_outdated: true })
        .eq('product_id', productUuid);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-asset-inventory'] });
      toast({
        title: 'Assets Marked Outdated',
        description: 'Screenshots will be flagged for re-capture',
      });
    },
  });

  return {
    inventory: inventoryQuery.data || [],
    coverage: computeCoverage(),
    isLoading: inventoryQuery.isLoading || productsQuery.isLoading,
    productNameToId,
    registerAsset: registerAssetMutation.mutateAsync,
    isRegistering: registerAssetMutation.isPending,
    markOutdated: markOutdatedMutation.mutate,
    refetch: inventoryQuery.refetch,
  };
};
