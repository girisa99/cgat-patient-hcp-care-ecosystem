/**
 * Queue Missing Thumbnails
 * 
 * Scans video_blueprints table and queues any templates with missing thumbnails
 * for async generation using the thumbnail_generation_queue
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Scanning for templates with missing thumbnails...');

    // Get all templates with missing thumbnails
    const { data: missingTemplates, error: fetchError } = await supabase
      .from('video_blueprints')
      .select('id, name, category, description, style_preset')
      .eq('is_active', true)
      .or('thumbnail_url.is.null,thumbnail_url.eq.');

    if (fetchError) throw fetchError;

    console.log(`📋 Found ${missingTemplates?.length || 0} templates with missing thumbnails`);

    if (!missingTemplates || missingTemplates.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No templates with missing thumbnails',
          queued: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check which are already in the queue
    const templateIds = missingTemplates.map(t => t.id);
    const { data: existingQueue } = await supabase
      .from('thumbnail_generation_queue')
      .select('blueprint_id')
      .in('blueprint_id', templateIds)
      .in('status', ['pending', 'processing']);

    const alreadyQueued = new Set((existingQueue || []).map(q => q.blueprint_id));
    const toQueue = missingTemplates.filter(t => !alreadyQueued.has(t.id));

    console.log(`📋 ${toQueue.length} templates need queueing (${alreadyQueued.size} already in queue)`);

    // Queue in batches of 50
    const BATCH_SIZE = 50;
    let queued = 0;

    for (let i = 0; i < toQueue.length; i += BATCH_SIZE) {
      const batch = toQueue.slice(i, i + BATCH_SIZE);
      
      const queueItems = batch.map(template => {
        // Build a detailed prompt based on template metadata
        const stylePreset = template.style_preset || {};
        const animationStyle = stylePreset.animation_style || '';
        
        const prompt = buildPrompt(template.name, template.category, template.description, animationStyle);
        
        return {
          blueprint_id: template.id,
          prompt,
          priority: getPriorityByCategory(template.category),
          region: 'global',
          provider: getProviderForCategory(template.category),
          status: 'pending',
          attempt_count: 0,
          max_attempts: 3,
        };
      });

      const { error: insertError } = await supabase
        .from('thumbnail_generation_queue')
        .insert(queueItems);

      if (insertError) {
        console.error(`❌ Batch ${i / BATCH_SIZE} insert error:`, insertError);
      } else {
        queued += batch.length;
        console.log(`✅ Queued batch ${i / BATCH_SIZE + 1}: ${batch.length} items`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Queued ${queued} templates for thumbnail generation`,
        queued,
        alreadyInQueue: alreadyQueued.size,
        total: missingTemplates.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildPrompt(name: string, category: string, description: string | null, animationStyle: string): string {
  const categoryPrompts: Record<string, string> = {
    'marketing': 'Professional marketing video thumbnail with vibrant colors, dynamic composition, and call-to-action energy',
    'corporate': 'Clean corporate presentation thumbnail with professional blue tones, business imagery, and executive feel',
    'healthcare': 'Medical themed thumbnail with healthcare imagery, clean whites and blues, trustworthy and professional',
    'educational': 'Educational content thumbnail with learning imagery, colorful and engaging, academic feel',
    'entertainment': 'Entertainment video thumbnail with vibrant colors, dramatic lighting, and engaging composition',
    'travel': 'Beautiful travel destination thumbnail with stunning landscape, vibrant colors, wanderlust appeal',
    'animation': 'Animated style thumbnail with stylized characters, colorful palette, and dynamic movement',
    '3d': 'High-quality 3D rendered thumbnail with modern lighting, sleek design, and depth',
    'avatar': 'AI avatar presenter thumbnail with professional human presenter, clean background, broadcast quality',
    'storytelling': 'Cinematic storytelling thumbnail with dramatic lighting, emotional depth, film quality',
    'interactive': 'Interactive video thumbnail with engaging elements, quiz or choice imagery, participation feel',
    'effects': 'Visual effects showcase thumbnail with dramatic VFX elements, particle effects, dynamic energy',
    'image_to_video': 'Photo-to-video transformation thumbnail showing animation from still image',
    'seasonal': 'Seasonal themed thumbnail with holiday or seasonal imagery, festive colors and mood',
    'smb': 'Small business thumbnail with local business imagery, friendly and approachable, professional quality',
    'oil_gas': 'Oil and gas industry thumbnail with industrial imagery, safety elements, professional engineering',
    'ppt': 'Presentation-style thumbnail with slide design elements, professional layout, business graphics',
    'announcement': 'Announcement video thumbnail with news-style design, important message feel, attention-grabbing',
  };

  const styleModifiers: Record<string, string> = {
    'pixar': 'Pixar-style 3D animation aesthetic, colorful, character-driven',
    'anime': 'Japanese anime style with expressive characters and dynamic lines',
    'crayon': 'Childlike crayon drawing style, playful and colorful',
    'hand_sketch': 'Hand-drawn pencil sketch style, artistic and creative',
    'microworld': 'Miniature world perspective, tilt-shift photography feel',
    'stop_motion': 'Stop-motion animation style, tactile and handmade',
    'paper_cutout': 'Paper cutout animation style, layered and crafty',
    'watercolor': 'Watercolor painting style, soft edges and flowing colors',
    'neon': 'Neon-lit cyberpunk style, vibrant glowing colors',
    'retro': 'Retro vintage style, nostalgic color grading',
    'vaporwave': 'Vaporwave aesthetic, pink and cyan, 80s nostalgia',
  };

  const basePrompt = categoryPrompts[category] || 'Professional video thumbnail with high quality visuals';
  const styleModifier = animationStyle && styleModifiers[animationStyle] ? `. ${styleModifiers[animationStyle]}` : '';
  
  return `${basePrompt}${styleModifier}. Theme: "${name}". ${description || ''}. Ultra high resolution, professional quality, 16:9 aspect ratio video thumbnail.`;
}

function getPriorityByCategory(category: string): number {
  const priorities: Record<string, number> = {
    'marketing': 1,
    'corporate': 2,
    'healthcare': 2,
    'educational': 3,
    'smb': 3,
    'oil_gas': 3,
    'ppt': 3,
    'travel': 4,
    'entertainment': 4,
    'animation': 5,
    '3d': 5,
    'avatar': 5,
  };
  return priorities[category] || 5;
}

function getProviderForCategory(category: string): string {
  // Rotate providers for load balancing
  const providers = ['openai_dalle', 'modelslab_flux', 'gemini'];
  const categoryHash = category.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return providers[categoryHash % providers.length];
}
