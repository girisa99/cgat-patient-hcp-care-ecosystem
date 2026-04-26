import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if blueprints already exist
    const { data: existing } = await supabase
      .from("video_blueprints")
      .select("id")
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Blueprints already seeded", count: existing.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Define blueprints with their scenes
    const blueprints = [
      {
        name: "Product Demo",
        description: "Showcase product features with clear value propositions",
        category: "marketing",
        estimated_duration_seconds: 90,
        target_platform: ["youtube", "linkedin", "website"],
        industry_tags: ["saas", "tech", "b2b"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "clean", color_scheme: "brand", avatar_style: "professional" },
        scenes: [
          { scene_key: "hook", title: "Hook", scene_type: "intro", duration_seconds: 10, script_template: "Struggling with {{pain_point}}? There's a better way.", is_optional: false },
          { scene_key: "intro", title: "Introduction", scene_type: "intro", duration_seconds: 15, script_template: "Meet {{product_name}} - {{tagline}}", is_optional: false },
          { scene_key: "feature_1", title: "Key Feature 1", scene_type: "feature", duration_seconds: 20, script_template: "{{feature_1_name}} helps you {{feature_1_benefit}}", is_optional: false },
          { scene_key: "feature_2", title: "Key Feature 2", scene_type: "feature", duration_seconds: 20, script_template: "{{feature_2_name}} enables {{feature_2_benefit}}", is_optional: true },
          { scene_key: "demo", title: "Live Demo", scene_type: "demo", duration_seconds: 20, script_template: "Let me show you how it works...", is_optional: false },
          { scene_key: "cta", title: "Call to Action", scene_type: "cta", duration_seconds: 5, script_template: "Start your free trial today at {{website}}", is_optional: false }
        ]
      },
      {
        name: "Social Ad",
        description: "Short-form attention-grabbing content for social platforms",
        category: "marketing",
        estimated_duration_seconds: 30,
        target_platform: ["tiktok", "instagram", "youtube_shorts"],
        industry_tags: ["b2c", "viral", "engagement"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "dynamic", color_scheme: "vibrant", avatar_style: "casual" },
        scenes: [
          { scene_key: "hook", title: "Attention Hook", scene_type: "intro", duration_seconds: 3, script_template: "{{shocking_statement}}", is_optional: false },
          { scene_key: "problem", title: "Problem", scene_type: "content", duration_seconds: 7, script_template: "{{pain_point_description}}", is_optional: false },
          { scene_key: "solution", title: "Solution Reveal", scene_type: "content", duration_seconds: 10, script_template: "{{product_name}} changes everything", is_optional: false },
          { scene_key: "proof", title: "Social Proof", scene_type: "testimonial", duration_seconds: 5, script_template: "{{testimonial_snippet}}", is_optional: true },
          { scene_key: "cta", title: "CTA", scene_type: "cta", duration_seconds: 5, script_template: "Link in bio 👆", is_optional: false }
        ]
      },
      {
        name: "Feature Spotlight",
        description: "Deep dive into a single feature or capability",
        category: "marketing",
        estimated_duration_seconds: 60,
        target_platform: ["youtube", "website", "email"],
        industry_tags: ["tech", "feature_launch"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "focused", color_scheme: "brand", avatar_style: "expert" },
        scenes: [
          { scene_key: "intro", title: "Feature Introduction", scene_type: "intro", duration_seconds: 10, script_template: "Introducing {{feature_name}}", is_optional: false },
          { scene_key: "problem", title: "Problem Context", scene_type: "content", duration_seconds: 15, script_template: "Before {{feature_name}}, you had to {{old_way}}", is_optional: false },
          { scene_key: "solution", title: "How It Works", scene_type: "demo", duration_seconds: 25, script_template: "Now, simply {{new_way}}", is_optional: false },
          { scene_key: "cta", title: "Try It Now", scene_type: "cta", duration_seconds: 10, script_template: "Available now in {{product_name}}", is_optional: false }
        ]
      },
      {
        name: "Comparison",
        description: "Before/After or Us vs Competitors content",
        category: "marketing",
        estimated_duration_seconds: 45,
        target_platform: ["youtube", "linkedin", "website"],
        industry_tags: ["competitive", "decision_stage"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "split_screen", color_scheme: "contrast", avatar_style: "confident" },
        scenes: [
          { scene_key: "before", title: "The Old Way", scene_type: "content", duration_seconds: 15, script_template: "Traditional {{category}} requires {{pain_point}}", is_optional: false },
          { scene_key: "after", title: "The New Way", scene_type: "content", duration_seconds: 15, script_template: "With {{product_name}}, you get {{benefit}}", is_optional: false },
          { scene_key: "comparison", title: "Side by Side", scene_type: "content", duration_seconds: 10, script_template: "The difference is clear", is_optional: false },
          { scene_key: "cta", title: "Choose Better", scene_type: "cta", duration_seconds: 5, script_template: "Switch to {{product_name}} today", is_optional: false }
        ]
      },
      {
        name: "Testimonial",
        description: "Customer success stories and social proof",
        category: "marketing",
        estimated_duration_seconds: 60,
        target_platform: ["youtube", "linkedin", "website"],
        industry_tags: ["social_proof", "trust"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "authentic", color_scheme: "warm", avatar_style: "relatable" },
        scenes: [
          { scene_key: "intro", title: "Customer Introduction", scene_type: "intro", duration_seconds: 10, script_template: "Meet {{customer_name}} from {{company}}", is_optional: false },
          { scene_key: "challenge", title: "Their Challenge", scene_type: "content", duration_seconds: 15, script_template: "Before {{product_name}}, {{challenge}}", is_optional: false },
          { scene_key: "solution", title: "Finding the Solution", scene_type: "content", duration_seconds: 15, script_template: "Then we discovered {{product_name}}", is_optional: false },
          { scene_key: "results", title: "The Results", scene_type: "content", duration_seconds: 15, script_template: "Now, {{results}}", is_optional: false },
          { scene_key: "cta", title: "Join Them", scene_type: "cta", duration_seconds: 5, script_template: "Be our next success story", is_optional: false }
        ]
      },
      {
        name: "Tutorial",
        description: "Step-by-step instructional content",
        category: "educational",
        estimated_duration_seconds: 180,
        target_platform: ["youtube", "website", "lms"],
        industry_tags: ["how_to", "onboarding", "support"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "instructional", color_scheme: "brand", avatar_style: "teacher" },
        scenes: [
          { scene_key: "intro", title: "What You'll Learn", scene_type: "intro", duration_seconds: 15, script_template: "In this tutorial, you'll learn how to {{goal}}", is_optional: false },
          { scene_key: "step_1", title: "Step 1", scene_type: "content", duration_seconds: 30, script_template: "First, {{step_1_action}}", is_optional: false },
          { scene_key: "step_2", title: "Step 2", scene_type: "content", duration_seconds: 30, script_template: "Next, {{step_2_action}}", is_optional: false },
          { scene_key: "step_3", title: "Step 3", scene_type: "content", duration_seconds: 30, script_template: "Then, {{step_3_action}}", is_optional: false },
          { scene_key: "step_4", title: "Step 4", scene_type: "content", duration_seconds: 30, script_template: "After that, {{step_4_action}}", is_optional: true },
          { scene_key: "step_5", title: "Step 5", scene_type: "content", duration_seconds: 30, script_template: "Finally, {{step_5_action}}", is_optional: true },
          { scene_key: "summary", title: "Recap", scene_type: "outro", duration_seconds: 15, script_template: "Let's recap what we learned", is_optional: false }
        ]
      },
      {
        name: "Explainer",
        description: "Conceptual explanation of complex topics",
        category: "educational",
        estimated_duration_seconds: 120,
        target_platform: ["youtube", "website"],
        industry_tags: ["awareness", "education"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "animated", color_scheme: "friendly", avatar_style: "approachable" },
        scenes: [
          { scene_key: "hook", title: "Question Hook", scene_type: "intro", duration_seconds: 10, script_template: "Ever wondered {{question}}?", is_optional: false },
          { scene_key: "context", title: "Context", scene_type: "content", duration_seconds: 25, script_template: "{{topic}} is {{definition}}", is_optional: false },
          { scene_key: "breakdown", title: "Breaking It Down", scene_type: "content", duration_seconds: 40, script_template: "Here's how it works...", is_optional: false },
          { scene_key: "examples", title: "Real Examples", scene_type: "content", duration_seconds: 30, script_template: "For example, {{example}}", is_optional: false },
          { scene_key: "takeaway", title: "Key Takeaway", scene_type: "outro", duration_seconds: 15, script_template: "The key takeaway is {{takeaway}}", is_optional: false }
        ]
      },
      {
        name: "Brand Story",
        description: "Origin story or company narrative",
        category: "storytelling",
        estimated_duration_seconds: 150,
        target_platform: ["youtube", "website", "linkedin"],
        industry_tags: ["branding", "culture"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "cinematic", color_scheme: "brand", avatar_style: "founder" },
        scenes: [
          { scene_key: "hook", title: "Opening", scene_type: "intro", duration_seconds: 15, script_template: "Every great story starts with a problem", is_optional: false },
          { scene_key: "origin", title: "The Beginning", scene_type: "content", duration_seconds: 30, script_template: "In {{year}}, {{founder}} noticed {{observation}}", is_optional: false },
          { scene_key: "challenge", title: "The Challenge", scene_type: "content", duration_seconds: 30, script_template: "The challenge was {{challenge}}", is_optional: false },
          { scene_key: "solution", title: "The Solution", scene_type: "content", duration_seconds: 30, script_template: "That's when {{solution}} was born", is_optional: false },
          { scene_key: "mission", title: "Our Mission", scene_type: "content", duration_seconds: 30, script_template: "Today, we're on a mission to {{mission}}", is_optional: false },
          { scene_key: "cta", title: "Join Us", scene_type: "cta", duration_seconds: 15, script_template: "Join us on this journey", is_optional: false }
        ]
      },
      {
        name: "Case Study",
        description: "Customer journey and success story",
        category: "storytelling",
        estimated_duration_seconds: 180,
        target_platform: ["youtube", "linkedin", "sales"],
        industry_tags: ["enterprise", "proof_points"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "documentary", color_scheme: "professional", avatar_style: "expert" },
        scenes: [
          { scene_key: "intro", title: "Client Introduction", scene_type: "intro", duration_seconds: 20, script_template: "{{company}} is a leading {{industry}} company", is_optional: false },
          { scene_key: "challenge", title: "The Challenge", scene_type: "content", duration_seconds: 30, script_template: "They were facing {{challenge}}", is_optional: false },
          { scene_key: "solution", title: "The Solution", scene_type: "content", duration_seconds: 40, script_template: "We implemented {{solution}}", is_optional: false },
          { scene_key: "implementation", title: "Implementation", scene_type: "content", duration_seconds: 30, script_template: "The process involved {{process}}", is_optional: true },
          { scene_key: "results", title: "The Results", scene_type: "content", duration_seconds: 40, script_template: "The results: {{results}}", is_optional: false },
          { scene_key: "cta", title: "Your Turn", scene_type: "cta", duration_seconds: 20, script_template: "Ready to achieve similar results?", is_optional: false }
        ]
      },
      {
        name: "Product Launch",
        description: "New product or major update announcement",
        category: "announcement",
        estimated_duration_seconds: 60,
        target_platform: ["youtube", "twitter", "linkedin", "email"],
        industry_tags: ["launch", "news"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "exciting", color_scheme: "vibrant", avatar_style: "enthusiastic" },
        scenes: [
          { scene_key: "teaser", title: "Teaser", scene_type: "intro", duration_seconds: 10, script_template: "Something big is here...", is_optional: false },
          { scene_key: "reveal", title: "The Reveal", scene_type: "content", duration_seconds: 15, script_template: "Introducing {{product_name}}", is_optional: false },
          { scene_key: "highlights", title: "Key Highlights", scene_type: "content", duration_seconds: 20, script_template: "{{key_features}}", is_optional: false },
          { scene_key: "availability", title: "Availability", scene_type: "content", duration_seconds: 10, script_template: "Available {{availability}}", is_optional: false },
          { scene_key: "cta", title: "Get Started", scene_type: "cta", duration_seconds: 5, script_template: "Get yours at {{website}}", is_optional: false }
        ]
      },
      {
        name: "Webinar Promo",
        description: "Event promotion and registration driver",
        category: "announcement",
        estimated_duration_seconds: 45,
        target_platform: ["youtube", "linkedin", "email"],
        industry_tags: ["event", "webinar"],
        is_system_default: true,
        is_public: true,
        style_preset: { visual_style: "professional", color_scheme: "brand", avatar_style: "host" },
        scenes: [
          { scene_key: "hook", title: "Value Hook", scene_type: "intro", duration_seconds: 10, script_template: "Want to learn {{topic}}?", is_optional: false },
          { scene_key: "details", title: "Event Details", scene_type: "content", duration_seconds: 15, script_template: "Join us on {{date}} for {{event_name}}", is_optional: false },
          { scene_key: "speakers", title: "Meet the Speakers", scene_type: "content", duration_seconds: 10, script_template: "Featuring {{speakers}}", is_optional: true },
          { scene_key: "cta", title: "Register Now", scene_type: "cta", duration_seconds: 10, script_template: "Register free at {{registration_link}}", is_optional: false }
        ]
      }
    ];

    // Insert blueprints and their scenes
    const results = [];
    for (const bp of blueprints) {
      const { scenes, ...blueprintData } = bp;
      
      // Insert blueprint
      const { data: insertedBp, error: bpError } = await supabase
        .from("video_blueprints")
        .insert(blueprintData)
        .select()
        .single();

      if (bpError) {
        console.error(`Error inserting blueprint ${bp.name}:`, bpError);
        continue;
      }

      // Insert scenes for this blueprint
      const scenesWithBlueprintId = scenes.map((scene, index) => ({
        ...scene,
        blueprint_id: insertedBp.id,
        order_index: index
      }));

      const { error: scenesError } = await supabase
        .from("blueprint_scenes")
        .insert(scenesWithBlueprintId);

      if (scenesError) {
        console.error(`Error inserting scenes for ${bp.name}:`, scenesError);
      }

      results.push({ name: bp.name, id: insertedBp.id, scenes: scenes.length });
    }

    return new Response(
      JSON.stringify({ success: true, blueprints: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error seeding blueprints:", error);
    return new Response(
      JSON.stringify({ error: (error as Error)?.message ?? 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
