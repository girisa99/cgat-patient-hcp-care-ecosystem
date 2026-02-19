/**
 * Upload Brand Logos to Storage
 * 
 * Fetches actual Genie product logos from the published app
 * and uploads them to the brand-assets bucket for video generation.
 * 
 * NO AI generation - uses the real uploaded logos.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map product IDs to actual logo file names (8 unique logos)
const LOGO_MAPPING: Record<string, { fileName: string; displayName: string }> = {
  'studio': { fileName: 'genie-studio-logo.png', displayName: 'Genie Suite' },
  'spark': { fileName: 'genie-spark-logo.png', displayName: 'Genie Spark' },
  'mind': { fileName: 'genie-mind-logo.png', displayName: 'Genie Mind' },
  'vibe': { fileName: 'genie-vibe-logo.png', displayName: 'Genie Vibe' },
  'deck': { fileName: 'genie-deck-logo.png', displayName: 'Genie Deck' },
  'arc': { fileName: 'genie-arc-logo.png', displayName: 'Genie Hub' },
  'ask-genie': { fileName: 'ask-genie-logo.png', displayName: 'Ask Genie' },
  'cast': { fileName: 'genie-cast-logo.png', displayName: 'Genie Cast' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appUrl, productIds } = await req.json();
    
    // Default to production app URL
    const baseUrl = appUrl || 'https://cgat-patient-hcp-care-ecosystem.lovable.app';
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const productsToUpload = productIds?.length 
      ? productIds.filter((id: string) => LOGO_MAPPING[id])
      : Object.keys(LOGO_MAPPING);

    const results: { productId: string; imageUrl: string; success: boolean; error?: string }[] = [];

    for (const productId of productsToUpload) {
      const mapping = LOGO_MAPPING[productId];
      if (!mapping) continue;

      console.log(`📦 Uploading logo for ${mapping.displayName}...`);
      
      try {
        // Fetch the logo from the published app
        const logoUrl = `${baseUrl}/brand-assets/${mapping.fileName}`;
        console.log(`   Fetching: ${logoUrl}`);
        
        const logoResponse = await fetch(logoUrl);
        
        if (!logoResponse.ok) {
          console.error(`   ❌ Failed to fetch ${mapping.fileName}: ${logoResponse.status}`);
          results.push({ 
            productId, 
            imageUrl: '', 
            success: false,
            error: `HTTP ${logoResponse.status}: Could not fetch ${logoUrl}`
          });
          continue;
        }

        const logoBuffer = await logoResponse.arrayBuffer();
        const logoData = new Uint8Array(logoBuffer);
        
        console.log(`   Downloaded ${logoData.length} bytes`);

        // Determine content type
        const contentType = logoResponse.headers.get('content-type') || 'image/png';
        const extension = contentType.includes('png') ? 'png' : 'jpg';

        // Upload to brand-assets bucket with standard naming
        const storagePath = `genie-${productId}-logo.${extension}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand-assets')
          .upload(storagePath, logoData, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error(`   ❌ Upload failed: ${uploadError.message}`);
          results.push({ 
            productId, 
            imageUrl: '', 
            success: false,
            error: uploadError.message
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('brand-assets')
          .getPublicUrl(storagePath);

        console.log(`   ✅ Uploaded: ${urlData?.publicUrl}`);
        results.push({ 
          productId, 
          imageUrl: urlData?.publicUrl || '', 
          success: true 
        });

      } catch (err) {
        console.error(`   ❌ Error processing ${productId}:`, err);
        results.push({ 
          productId, 
          imageUrl: '', 
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`\n📊 Upload Summary: ${successCount} succeeded, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        uploaded: successCount,
        failed: failedCount,
        results,
        message: failedCount > 0 
          ? `Some logos failed to upload. Check that files exist in ${baseUrl}/brand-assets/`
          : 'All logos uploaded successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Upload brand logos error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
