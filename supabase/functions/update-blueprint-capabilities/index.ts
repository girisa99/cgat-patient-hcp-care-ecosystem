import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Batch-updates video_blueprints default_settings to enable
 * avatar, 3D, animation, AR/VR, lipsync capabilities per category.
 * Also updates provider routing to use currently working providers.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: Record<string, number> = {};

    // ── AVATAR templates ──
    const { data: avatarTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "avatar")
      .eq("is_active", true);

    if (avatarTemplates?.length) {
      for (const t of avatarTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              avatarEnabled: true,
              lipsyncEnabled: true,
              avatarProvider: "azure-viseme",
              avatarFallback: "modelslab",
              ttsProvider: "azure-neural",
              videoProvider: "vertex-veo3",
              capabilities: ["avatar", "lipsync", "tts"],
            },
          })
          .eq("id", t.id);
      }
      results.avatar = avatarTemplates.length;
    }

    // ── 3D templates ──
    const { data: threeDTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "3d")
      .eq("is_active", true);

    if (threeDTemplates?.length) {
      for (const t of threeDTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              "3dEnabled": true,
              arvrEnabled: true,
              "3dProvider": "meshy",
              "3dFallback": "modelslab-3d",
              videoProvider: "vertex-veo3",
              capabilities: ["3d", "ar-vr", "text-to-3d", "image-to-3d"],
            },
          })
          .eq("id", t.id);
      }
      results["3d"] = threeDTemplates.length;
    }

    // ── ANIMATION templates ──
    const { data: animTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "animation")
      .eq("is_active", true);

    if (animTemplates?.length) {
      for (const t of animTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              animationEnabled: true,
              animationProvider: "modelslab",
              videoProvider: "vertex-veo3",
              videoFallback: "sora2",
              capabilities: ["animation", "motion-graphics", "text-to-video"],
            },
          })
          .eq("id", t.id);
      }
      results.animation = animTemplates.length;
    }

    // ── COMBINATION templates (multi-modal) ──
    const { data: comboTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "combination")
      .eq("is_active", true);

    if (comboTemplates?.length) {
      for (const t of comboTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              avatarEnabled: true,
              "3dEnabled": true,
              animationEnabled: true,
              lipsyncEnabled: true,
              arvrEnabled: true,
              avatarProvider: "azure-viseme",
              "3dProvider": "meshy",
              animationProvider: "modelslab",
              ttsProvider: "azure-neural",
              videoProvider: "vertex-veo3",
              capabilities: ["avatar", "3d", "animation", "lipsync", "tts", "ar-vr"],
            },
          })
          .eq("id", t.id);
      }
      results.combination = comboTemplates.length;
    }

    // ── INTERACTIVE templates ──
    const { data: interactiveTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "interactive")
      .eq("is_active", true);

    if (interactiveTemplates?.length) {
      for (const t of interactiveTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              arvrEnabled: true,
              animationEnabled: true,
              "3dEnabled": true,
              "3dProvider": "meshy",
              animationProvider: "modelslab",
              videoProvider: "vertex-veo3",
              capabilities: ["interactive", "ar-vr", "3d", "animation"],
            },
          })
          .eq("id", t.id);
      }
      results.interactive = interactiveTemplates.length;
    }

    // ── EFFECTS templates ──
    const { data: effectsTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "effects")
      .eq("is_active", true);

    if (effectsTemplates?.length) {
      for (const t of effectsTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              animationEnabled: true,
              animationProvider: "modelslab",
              videoProvider: "vertex-veo3",
              capabilities: ["effects", "animation", "video-to-video"],
            },
          })
          .eq("id", t.id);
      }
      results.effects = effectsTemplates.length;
    }

    // ── MARKETING templates (enable TTS + video) ──
    const { data: marketingTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "marketing")
      .eq("is_active", true);

    if (marketingTemplates?.length) {
      for (const t of marketingTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              videoEnabled: true,
              ttsEnabled: true,
              videoProvider: "vertex-veo3",
              videoFallback: "sora2",
              ttsProvider: "azure-neural",
              imageProvider: "gemini-3-pro",
              capabilities: ["text-to-video", "tts", "image-generation"],
            },
          })
          .eq("id", t.id);
      }
      results.marketing = marketingTemplates.length;
    }

    // ── EDUCATIONAL templates (avatar + TTS) ──
    const { data: eduTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "educational")
      .eq("is_active", true);

    if (eduTemplates?.length) {
      for (const t of eduTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              avatarEnabled: true,
              lipsyncEnabled: true,
              ttsEnabled: true,
              avatarProvider: "azure-viseme",
              ttsProvider: "azure-neural",
              videoProvider: "vertex-veo3",
              capabilities: ["avatar", "lipsync", "tts", "text-to-video"],
            },
          })
          .eq("id", t.id);
      }
      results.educational = eduTemplates.length;
    }

    // ── HEALTHCARE templates (avatar + compliance) ──
    const { data: healthTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "healthcare")
      .eq("is_active", true);

    if (healthTemplates?.length) {
      for (const t of healthTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              avatarEnabled: true,
              lipsyncEnabled: true,
              ttsEnabled: true,
              avatarProvider: "azure-viseme",
              ttsProvider: "azure-neural",
              videoProvider: "vertex-veo3",
              capabilities: ["avatar", "lipsync", "tts", "compliance"],
            },
          })
          .eq("id", t.id);
      }
      results.healthcare = healthTemplates.length;
    }

    // ── CORPORATE templates (presentation + avatar) ──
    const { data: corpTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "corporate")
      .eq("is_active", true);

    if (corpTemplates?.length) {
      for (const t of corpTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              avatarEnabled: true,
              ttsEnabled: true,
              avatarProvider: "azure-viseme",
              ttsProvider: "azure-neural",
              videoProvider: "vertex-veo3",
              capabilities: ["avatar", "tts", "presentation", "text-to-video"],
            },
          })
          .eq("id", t.id);
      }
      results.corporate = corpTemplates.length;
    }

    // ── PPT templates (slides + avatar narration) ──
    const { data: pptTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "ppt")
      .eq("is_active", true);

    if (pptTemplates?.length) {
      for (const t of pptTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              avatarEnabled: true,
              lipsyncEnabled: true,
              ttsEnabled: true,
              avatarProvider: "azure-viseme",
              ttsProvider: "azure-neural",
              capabilities: ["avatar", "lipsync", "tts", "slides", "presentation"],
            },
          })
          .eq("id", t.id);
      }
      results.ppt = pptTemplates.length;
    }

    // ── STORYTELLING templates (cinematic video) ──
    const { data: storyTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "storytelling")
      .eq("is_active", true);

    if (storyTemplates?.length) {
      for (const t of storyTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              animationEnabled: true,
              ttsEnabled: true,
              videoProvider: "vertex-veo3",
              videoFallback: "sora2",
              ttsProvider: "azure-neural",
              animationProvider: "modelslab",
              capabilities: ["animation", "tts", "cinematic", "text-to-video"],
            },
          })
          .eq("id", t.id);
      }
      results.storytelling = storyTemplates.length;
    }

    // ── IMAGE_TO_VIDEO templates ──
    const { data: i2vTemplates } = await supabase
      .from("video_blueprints")
      .select("id")
      .eq("category", "image_to_video")
      .eq("is_active", true);

    if (i2vTemplates?.length) {
      for (const t of i2vTemplates) {
        await supabase
          .from("video_blueprints")
          .update({
            default_settings: {
              videoEnabled: true,
              animationEnabled: true,
              videoProvider: "vertex-veo3",
              videoFallback: "modelslab",
              capabilities: ["image-to-video", "animation", "motion-control"],
            },
          })
          .eq("id", t.id);
      }
      results.image_to_video = i2vTemplates.length;
    }

    // ── PODCAST/WEBCAST templates (TTS + audio) ──
    const podcastCats = ["podcast", "webcast"];
    for (const cat of podcastCats) {
      const { data: templates } = await supabase
        .from("video_blueprints")
        .select("id")
        .eq("category", cat)
        .eq("is_active", true);

      if (templates?.length) {
        for (const t of templates) {
          await supabase
            .from("video_blueprints")
            .update({
              default_settings: {
                avatarEnabled: true,
                ttsEnabled: true,
                lipsyncEnabled: true,
                avatarProvider: "azure-viseme",
                ttsProvider: "azure-neural",
                capabilities: ["avatar", "tts", "lipsync", "audio"],
              },
            })
            .eq("id", t.id);
        }
        results[cat] = templates.length;
      }
    }

    // ── REMAINING categories (travel, seasonal, entertainment, etc.) - enable video + TTS ──
    const remainingCats = [
      "travel", "seasonal", "entertainment", "customer_journey", 
      "infographic", "oil_gas", "food_business", "announcement",
      "retail", "smb", "vision", "heritage", "fintech", "nursing", "homecare"
    ];

    for (const cat of remainingCats) {
      const { data: templates } = await supabase
        .from("video_blueprints")
        .select("id")
        .eq("category", cat)
        .eq("is_active", true);

      if (templates?.length) {
        for (const t of templates) {
          await supabase
            .from("video_blueprints")
            .update({
              default_settings: {
                videoEnabled: true,
                ttsEnabled: true,
                videoProvider: "vertex-veo3",
                videoFallback: "sora2",
                ttsProvider: "azure-neural",
                imageProvider: "gemini-3-pro",
                capabilities: ["text-to-video", "tts", "image-generation"],
              },
            })
            .eq("id", t.id);
        }
        results[cat] = templates.length;
      }
    }

    const totalUpdated = Object.values(results).reduce((a, b) => a + b, 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${totalUpdated} templates across ${Object.keys(results).length} categories`,
        details: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating blueprints:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error)?.message ?? 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
