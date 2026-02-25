/**
 * AI IMAGE GENERATOR - Edge Function
 * 
 * Thin wrapper around shared image-providers module.
 * Supports style-intent routing, regional awareness, and multi-provider fallback.
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateImageWithRouting, type ImageGenOptions } from '../_shared/image-providers.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const {
      prompt, 
      provider,
      style_intent,
      region,
      model,
      size = '1024x1024',
      quality = 'high',
      output_format = 'png',
      negative_prompt,
      style,
      aspectRatio,
      ref_image_url,
    } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log(`🎨 [AI Image] Style: ${style_intent || 'default'}, Region: ${region || 'global'}, Provider: ${provider || 'auto'}`);

    const options: ImageGenOptions = { 
      model, size, quality, output_format, negative_prompt, style, 
      aspectRatio: aspectRatio || undefined,
      ref_image_url 
    };

    const result = await generateImageWithRouting(prompt, style_intent, provider, options);

    return new Response(JSON.stringify({ 
      imageUrl: result.imageUrl,
      mediaUrl: result.imageUrl,
      success: true,
      provider: result.provider,
      model: result.model,
      metadata: {
        prompt,
        size,
        quality,
        output_format,
        style_intent: style_intent || 'default',
        region: region || 'global',
        provider_chain: result.providerChain,
        timestamp: new Date().toISOString(),
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Image Generator Error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error instanceof Error ? error.message : 'Image generation failed'),
        details: String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
