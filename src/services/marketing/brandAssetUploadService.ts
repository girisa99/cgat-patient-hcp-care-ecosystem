/**
 * Brand Asset Upload Service
 * 
 * Uploads product logos from the app to Supabase storage
 * for use by the Genie Cast video assembler.
 */

import { supabase } from '@/integrations/supabase/client';

// Import all logos
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';
import genieStudioBanner from '@/assets/logos/genie-studio-combined.png';
import genieArcLogo from '@/assets/logos/genie-arc-combined.png';
import askGenieLogo from '@/assets/logos/ask-genie-combined.png';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';
import genieCastLogo from '@/assets/logos/genie-cast-logo.png';

// Map product IDs to logo imports (8 unique logos)
const LOGO_ASSETS: Record<string, { logo: string; displayName: string }> = {
  'studio': { logo: genieStudioBanner, displayName: 'Genie Studio' },
  'spark': { logo: genieSparkLogo, displayName: 'Genie Spark' },
  'mind': { logo: genieMindLogo, displayName: 'Genie Mind' },
  'vibe': { logo: genieVibeLogo, displayName: 'Genie Vibe' },
  'deck': { logo: genieDeckLogo, displayName: 'Genie Deck' },
  'arc': { logo: genieArcLogo, displayName: 'Genie Arc' },
  'ask-genie': { logo: askGenieLogo, displayName: 'Ask Genie' },
  'cast': { logo: genieCastLogo, displayName: 'Genie Cast' },
};

export interface UploadResult {
  productId: string;
  displayName: string;
  imageUrl: string;
  success: boolean;
  error?: string;
}

/**
 * Upload all brand logos to Supabase storage
 */
export async function uploadBrandLogosToStorage(): Promise<{
  success: boolean;
  uploaded: number;
  failed: number;
  results: UploadResult[];
}> {
  const results: UploadResult[] = [];

  for (const [productId, asset] of Object.entries(LOGO_ASSETS)) {
    try {
      console.log(`📦 Uploading logo for ${asset.displayName}...`);
      
      // Fetch the logo from the bundled asset
      const response = await fetch(asset.logo);
      if (!response.ok) {
        throw new Error(`Failed to fetch logo: ${response.status}`);
      }
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Determine file extension from content type
      const contentType = blob.type || 'image/png';
      const extension = contentType.includes('png') ? 'png' : 
                        contentType.includes('jpg') || contentType.includes('jpeg') ? 'jpg' : 'png';
      
      // Upload to brand-assets bucket
      const storagePath = `genie-${productId}-logo.${extension}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(storagePath, uint8Array, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error(`   ❌ Upload failed for ${productId}: ${uploadError.message}`);
        results.push({
          productId,
          displayName: asset.displayName,
          imageUrl: '',
          success: false,
          error: uploadError.message,
        });
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(storagePath);

      console.log(`   ✅ Uploaded ${asset.displayName}: ${urlData?.publicUrl}`);
      results.push({
        productId,
        displayName: asset.displayName,
        imageUrl: urlData?.publicUrl || '',
        success: true,
      });

    } catch (err) {
      console.error(`   ❌ Error processing ${productId}:`, err);
      results.push({
        productId,
        displayName: asset.displayName,
        imageUrl: '',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  console.log(`\n📊 Upload Summary: ${successCount} succeeded, ${failedCount} failed`);

  return {
    success: successCount > 0,
    uploaded: successCount,
    failed: failedCount,
    results,
  };
}

/**
 * Check if brand logos exist in storage
 */
export async function checkBrandLogosInStorage(): Promise<{
  productId: string;
  displayName: string;
  exists: boolean;
  url?: string;
}[]> {
  const results: { productId: string; displayName: string; exists: boolean; url?: string }[] = [];

  for (const [productId, asset] of Object.entries(LOGO_ASSETS)) {
    
    const storagePath = `genie-${productId}-logo.png`;
    
    const { data } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(storagePath);

    // Try to verify the file exists by making a HEAD request
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      results.push({
        productId,
        displayName: asset.displayName,
        exists: response.ok,
        url: response.ok ? data.publicUrl : undefined,
      });
    } catch {
      results.push({
        productId,
        displayName: asset.displayName,
        exists: false,
      });
    }
  }

  return results;
}

/**
 * Get logo URL for a product from storage
 */
export function getProductLogoUrl(productId: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ithspbabhmdntioslfqe.supabase.co';
  return `${supabaseUrl}/storage/v1/object/public/brand-assets/genie-${productId}-logo.png`;
}
