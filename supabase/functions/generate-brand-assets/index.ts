/**
 * Generate Brand Assets using Lovable AI Image Generation
 * Creates professional product screenshots for Genie Cast videos
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Product branding for each chapter
const PRODUCTS = [
  { id: 'opening', name: 'Genie Studio', color: '#9333EA', tagline: 'Mind to Media', description: 'AI-powered creative suite with 7 products' },
  { id: 'spark', name: 'Genie Spark', color: '#F97316', tagline: 'Ignite Ideas', description: 'Transform ideas into professional scripts' },
  { id: 'mind', name: 'Genie Mind', color: '#3B82F6', tagline: 'Enhance Scripts', description: 'AI script enhancement and translation' },
  { id: 'vibe', name: 'Genie Vibe', color: '#22C55E', tagline: 'Record & Edit', description: 'Complete recording studio with teleprompter' },
  { id: 'deck', name: 'Genie Deck', color: '#EAB308', tagline: 'Create Presentations', description: 'AI-designed slides and templates' },
  { id: 'arc', name: 'Genie Arc', color: '#EC4899', tagline: 'Manage Production', description: 'Kanban, calendar, and scheduling' },
  { id: 'ask-genie', name: 'Ask Genie', color: '#06B6D4', tagline: 'AI Assistant', description: 'Personal AI guide for the platform' },
  { id: 'cast', name: 'Genie Cast', color: '#EF4444', tagline: 'Distribute Content', description: 'Multi-platform publishing and analytics' },
  { id: 'closing', name: 'Genie Studio', color: '#9333EA', tagline: 'Start Creating', description: 'Your wish is our command' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, generateAll } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const productsToGenerate = generateAll 
      ? PRODUCTS 
      : PRODUCTS.filter(p => p.id === productId);

    const results: { productId: string; imageUrl: string; success: boolean }[] = [];

    for (const product of productsToGenerate) {
      console.log(`🎨 Generating image for ${product.name}...`);
      
      // Create a professional product showcase prompt
      const prompt = `Create a modern, professional software product screenshot for "${product.name}".

Style: Clean tech UI mockup, dark theme with ${product.color} accent color
Content: Show a sleek dashboard or interface for "${product.tagline}" - ${product.description}
Composition: 16:9 aspect ratio, centered product interface with subtle gradient background
Elements: Include the product name "${product.name}" as a logo in the corner
Quality: High resolution, professional marketing material, modern SaaS aesthetic
No text except the product name. Photorealistic UI mockup style.`;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image',
            messages: [{ role: 'user', content: prompt }],
            modalities: ['image', 'text'],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Image generation failed for ${product.id}: ${errorText}`);
          results.push({ productId: product.id, imageUrl: '', success: false });
          continue;
        }

        const data = await response.json();
        const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageData) {
          console.error(`No image returned for ${product.id}`);
          results.push({ productId: product.id, imageUrl: '', success: false });
          continue;
        }

        // Extract base64 data (remove data URI prefix if present)
        let base64Data = imageData;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }

        // Upload to brand-assets bucket
        const filePath = `genie-${product.id}-demo.jpg`;
        const binaryStr = atob(base64Data);
        const imageBuffer = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          imageBuffer[i] = binaryStr.charCodeAt(i);
        }

        const { error: uploadError } = await supabase.storage
          .from('brand-assets')
          .upload(filePath, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload failed for ${product.id}: ${uploadError.message}`);
          results.push({ productId: product.id, imageUrl: '', success: false });
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('brand-assets')
          .getPublicUrl(filePath);

        console.log(`✅ Uploaded ${product.name}: ${urlData?.publicUrl}`);
        results.push({ 
          productId: product.id, 
          imageUrl: urlData?.publicUrl || '', 
          success: true 
        });

      } catch (genError) {
        console.error(`Error generating ${product.id}:`, genError);
        results.push({ productId: product.id, imageUrl: '', success: false });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Brand asset generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
