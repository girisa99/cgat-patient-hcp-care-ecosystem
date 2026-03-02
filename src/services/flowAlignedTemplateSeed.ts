/**
 * Flow-Aligned Template Seed Service
 *
 * Seeds 9 minimal starter templates that align with the CREATE flow pipeline:
 * Category → Format → Configure → Templates → PRODUCE
 *
 * Each template uses enrichment-compatible placeholders instead of legacy
 * messaging variables ({{hook}}, {{cta}}), so they integrate directly with
 * the enrichment assembly and scene prompt generation.
 *
 * Run via admin panel or browser console: migrateToFlowAligned()
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Constants ─────────────────────────────────────────────────────────────────

const EP04_BLUEPRINT_ID = 'cafcd78a-7957-4021-ba8f-c20daba331b2';
const FLOW_ALIGNED_TAG = 'flow_aligned_starter';

// ─── Template + Scene Definitions ──────────────────────────────────────────────

interface StarterScene {
  scene_key: string;
  title: string;
  description: string;
  scene_type: string;
  script_template: string;
  script_variables: string[];
  duration_seconds: number;
}

interface StarterTemplate {
  name: string;
  description: string;
  category: string;
  style_intent: string;
  estimated_duration_seconds: number;
  scenes: StarterScene[];
}

/**
 * 9 flow-aligned starter templates.
 *
 * category values match cast_content_categories.name exactly:
 *   healthcare, retail, education, technology, travel, celebrations, entertainment
 *   + finance, corporate (DB-seeded expanded categories)
 */
export const FLOW_ALIGNED_STARTERS: StarterTemplate[] = [
  // ── 1. Healthcare Explainer ──────────────────────────────────────────────
  {
    name: 'Healthcare Explainer',
    description: 'Clear, clinical explainer for medical products, procedures, or health initiatives. 5 scenes covering hook, problem, solution, evidence, and call to action.',
    category: 'healthcare',
    style_intent: 'clinical',
    estimated_duration_seconds: 120,
    scenes: [
      {
        scene_key: 'healthcare_hook',
        title: 'Hook — Patient Story',
        description: 'Open with a relatable patient scenario that establishes the health challenge',
        scene_type: 'hook',
        script_template: 'Open with a compelling patient scenario related to {{enrichment_prompt}}. Establish the health challenge faced by {{target_audience}} in a way that is empathetic and clinically accurate.',
        script_variables: ['enrichment_prompt', 'target_audience'],
        duration_seconds: 20,
      },
      {
        scene_key: 'healthcare_problem',
        title: 'The Problem',
        description: 'Define the medical or health problem clearly',
        scene_type: 'body',
        script_template: 'Clearly define the medical problem or unmet need. Use data-backed statements relevant to {{target_audience}}. Set up why current solutions fall short. Visual style: {{visual_style}}.',
        script_variables: ['target_audience', 'visual_style'],
        duration_seconds: 25,
      },
      {
        scene_key: 'healthcare_solution',
        title: 'The Solution',
        description: 'Present the product, procedure, or initiative as the answer',
        scene_type: 'body',
        script_template: 'Introduce {{brand_name}} as the solution. Explain the mechanism of action or approach in accessible language. Highlight what makes this different. Key message: {{key_message}}.',
        script_variables: ['brand_name', 'key_message'],
        duration_seconds: 30,
      },
      {
        scene_key: 'healthcare_evidence',
        title: 'Evidence & Outcomes',
        description: 'Show clinical evidence, outcomes, or patient testimonials',
        scene_type: 'body',
        script_template: 'Present supporting evidence — clinical results, patient outcomes, or expert endorsements for {{brand_name}}. Use visual data representations. Style: {{visual_style}}.',
        script_variables: ['brand_name', 'visual_style'],
        duration_seconds: 25,
      },
      {
        scene_key: 'healthcare_cta',
        title: 'Call to Action',
        description: 'Clear next step for the audience',
        scene_type: 'cta',
        script_template: 'Close with a clear call to action for {{target_audience}}. Reinforce {{key_message}} and provide a specific next step — consult, visit, learn more.',
        script_variables: ['target_audience', 'key_message'],
        duration_seconds: 20,
      },
    ],
  },

  // ── 2. Product Launch Campaign ───────────────────────────────────────────
  {
    name: 'Product Launch Campaign',
    description: 'High-energy product launch video for retail and e-commerce. 4 scenes: teaser, reveal, features, and purchase CTA.',
    category: 'retail',
    style_intent: 'product-hero',
    estimated_duration_seconds: 60,
    scenes: [
      {
        scene_key: 'launch_teaser',
        title: 'Teaser — Build Anticipation',
        description: 'Quick cuts or mystery shots to build excitement',
        scene_type: 'hook',
        script_template: 'Create anticipation for {{brand_name}}. Use dynamic visuals and a bold question or statement tied to {{enrichment_prompt}}. Target audience: {{target_audience}}.',
        script_variables: ['brand_name', 'enrichment_prompt', 'target_audience'],
        duration_seconds: 12,
      },
      {
        scene_key: 'launch_reveal',
        title: 'The Big Reveal',
        description: 'Dramatic product reveal moment',
        scene_type: 'body',
        script_template: 'Reveal {{brand_name}} with a dramatic visual moment. Show the product in its best light. Key message: {{key_message}}. Style: {{visual_style}}.',
        script_variables: ['brand_name', 'key_message', 'visual_style'],
        duration_seconds: 15,
      },
      {
        scene_key: 'launch_features',
        title: 'Key Features',
        description: 'Highlight 2-3 standout features or benefits',
        scene_type: 'body',
        script_template: 'Showcase 2-3 standout features of {{brand_name}}. Each feature should connect to a benefit for {{target_audience}}. Keep it punchy and visual. Style: {{visual_style}}.',
        script_variables: ['brand_name', 'target_audience', 'visual_style'],
        duration_seconds: 20,
      },
      {
        scene_key: 'launch_cta',
        title: 'Purchase CTA',
        description: 'Drive to purchase or pre-order',
        scene_type: 'cta',
        script_template: 'Strong call to action — buy now, pre-order, or shop. Reinforce {{key_message}}. Include urgency element for {{target_audience}}.',
        script_variables: ['key_message', 'target_audience'],
        duration_seconds: 13,
      },
    ],
  },

  // ── 3. Educational Course Module ─────────────────────────────────────────
  {
    name: 'Educational Course Module',
    description: 'Structured learning module for courses, tutorials, or training. 6 scenes: intro, objectives, concept, example, practice, summary.',
    category: 'education',
    style_intent: 'educational',
    estimated_duration_seconds: 180,
    scenes: [
      {
        scene_key: 'edu_intro',
        title: 'Module Introduction',
        description: 'Welcome and set context for the lesson',
        scene_type: 'hook',
        script_template: 'Welcome {{target_audience}} to this module on {{enrichment_prompt}}. Set expectations for what they will learn and why it matters.',
        script_variables: ['target_audience', 'enrichment_prompt'],
        duration_seconds: 25,
      },
      {
        scene_key: 'edu_objectives',
        title: 'Learning Objectives',
        description: 'State 2-3 clear learning outcomes',
        scene_type: 'body',
        script_template: 'Present 2-3 clear learning objectives for this module. Each objective should be measurable and relevant to {{target_audience}}. Topic: {{enrichment_prompt}}.',
        script_variables: ['target_audience', 'enrichment_prompt'],
        duration_seconds: 20,
      },
      {
        scene_key: 'edu_concept',
        title: 'Core Concept',
        description: 'Explain the main concept with visuals',
        scene_type: 'body',
        script_template: 'Explain the core concept related to {{enrichment_prompt}}. Use diagrams, animations, or visual metaphors in {{visual_style}} style. Break down complexity for {{target_audience}}.',
        script_variables: ['enrichment_prompt', 'visual_style', 'target_audience'],
        duration_seconds: 45,
      },
      {
        scene_key: 'edu_example',
        title: 'Worked Example',
        description: 'Walk through a real-world example',
        scene_type: 'body',
        script_template: 'Walk through a practical example demonstrating the concept. Show step-by-step application relevant to {{target_audience}}. Connect to {{key_message}}.',
        script_variables: ['target_audience', 'key_message'],
        duration_seconds: 40,
      },
      {
        scene_key: 'edu_practice',
        title: 'Practice / Reflection',
        description: 'Prompt the learner to apply or reflect',
        scene_type: 'body',
        script_template: 'Prompt {{target_audience}} to apply what they learned. Pose a reflection question or practice scenario. Style: {{visual_style}}.',
        script_variables: ['target_audience', 'visual_style'],
        duration_seconds: 25,
      },
      {
        scene_key: 'edu_summary',
        title: 'Module Summary',
        description: 'Recap key takeaways and next steps',
        scene_type: 'cta',
        script_template: 'Summarize the key takeaways from this module. Reinforce {{key_message}}. Preview what comes next and encourage {{target_audience}} to continue.',
        script_variables: ['key_message', 'target_audience'],
        duration_seconds: 25,
      },
    ],
  },

  // ── 4. SaaS Product Demo ─────────────────────────────────────────────────
  {
    name: 'SaaS Product Demo',
    description: 'Modern product demo for software and technology. 5 scenes: problem, demo, features, social proof, and trial CTA.',
    category: 'technology',
    style_intent: 'tech-modern',
    estimated_duration_seconds: 90,
    scenes: [
      {
        scene_key: 'saas_problem',
        title: 'Pain Point',
        description: 'Identify the workflow pain the audience faces',
        scene_type: 'hook',
        script_template: 'Highlight the key pain point that {{target_audience}} faces daily. Make it relatable and urgent. Context: {{enrichment_prompt}}.',
        script_variables: ['target_audience', 'enrichment_prompt'],
        duration_seconds: 15,
      },
      {
        scene_key: 'saas_demo',
        title: 'Product Walkthrough',
        description: 'Show the product solving the problem in real-time',
        scene_type: 'body',
        script_template: 'Demonstrate how {{brand_name}} solves the problem. Show the UI/UX in action. Walk through the core workflow. Style: {{visual_style}}.',
        script_variables: ['brand_name', 'visual_style'],
        duration_seconds: 25,
      },
      {
        scene_key: 'saas_features',
        title: 'Key Differentiators',
        description: 'Highlight 3 features that set the product apart',
        scene_type: 'body',
        script_template: 'Showcase 3 differentiating features of {{brand_name}}. For each, show the benefit to {{target_audience}}. Key message: {{key_message}}.',
        script_variables: ['brand_name', 'target_audience', 'key_message'],
        duration_seconds: 25,
      },
      {
        scene_key: 'saas_proof',
        title: 'Social Proof',
        description: 'Customer testimonials, stats, or logos',
        scene_type: 'body',
        script_template: 'Present social proof — customer quotes, usage stats, or partner logos for {{brand_name}}. Build trust with {{target_audience}}. Visual style: {{visual_style}}.',
        script_variables: ['brand_name', 'target_audience', 'visual_style'],
        duration_seconds: 15,
      },
      {
        scene_key: 'saas_cta',
        title: 'Free Trial CTA',
        description: 'Drive to sign up or start a trial',
        scene_type: 'cta',
        script_template: 'Close with a clear trial or demo CTA for {{brand_name}}. Reinforce {{key_message}}. Make the next step frictionless for {{target_audience}}.',
        script_variables: ['brand_name', 'key_message', 'target_audience'],
        duration_seconds: 10,
      },
    ],
  },

  // ── 5. Financial Services Overview ───────────────────────────────────────
  {
    name: 'Financial Services Overview',
    description: 'Professional overview for banking, insurance, or fintech. 5 scenes: challenge, approach, services, trust, and consultation CTA.',
    category: 'finance',
    style_intent: 'corporate',
    estimated_duration_seconds: 90,
    scenes: [
      {
        scene_key: 'fin_challenge',
        title: 'Financial Challenge',
        description: 'Frame the financial challenge or opportunity',
        scene_type: 'hook',
        script_template: 'Frame a key financial challenge or opportunity facing {{target_audience}}. Context: {{enrichment_prompt}}. Use data to establish urgency.',
        script_variables: ['target_audience', 'enrichment_prompt'],
        duration_seconds: 18,
      },
      {
        scene_key: 'fin_approach',
        title: 'Our Approach',
        description: 'Present the firm\'s philosophy and methodology',
        scene_type: 'body',
        script_template: 'Present {{brand_name}}\'s approach to solving this challenge. Emphasize methodology, expertise, and track record. Style: {{visual_style}}.',
        script_variables: ['brand_name', 'visual_style'],
        duration_seconds: 20,
      },
      {
        scene_key: 'fin_services',
        title: 'Service Portfolio',
        description: 'Overview of relevant services or products',
        scene_type: 'body',
        script_template: 'Highlight the key services or financial products from {{brand_name}} relevant to {{target_audience}}. Show how each addresses their needs. Key message: {{key_message}}.',
        script_variables: ['brand_name', 'target_audience', 'key_message'],
        duration_seconds: 22,
      },
      {
        scene_key: 'fin_trust',
        title: 'Trust & Compliance',
        description: 'Regulatory compliance, certifications, and trust signals',
        scene_type: 'body',
        script_template: 'Establish trust through regulatory compliance, certifications, and client success stories. Reassure {{target_audience}} about security and reliability of {{brand_name}}.',
        script_variables: ['target_audience', 'brand_name'],
        duration_seconds: 18,
      },
      {
        scene_key: 'fin_cta',
        title: 'Consultation CTA',
        description: 'Drive to consultation or account opening',
        scene_type: 'cta',
        script_template: 'Invite {{target_audience}} to schedule a consultation or learn more about {{brand_name}}. Reinforce {{key_message}} and provide clear next steps.',
        script_variables: ['target_audience', 'brand_name', 'key_message'],
        duration_seconds: 12,
      },
    ],
  },

  // ── 6. Destination Showcase ──────────────────────────────────────────────
  {
    name: 'Destination Showcase',
    description: 'Cinematic travel destination or tourism showcase. 4 scenes: aerial reveal, experiences, culture, and booking CTA.',
    category: 'travel',
    style_intent: 'cinematic',
    estimated_duration_seconds: 60,
    scenes: [
      {
        scene_key: 'dest_reveal',
        title: 'Aerial Reveal',
        description: 'Sweeping cinematic reveal of the destination',
        scene_type: 'hook',
        script_template: 'Open with a breathtaking aerial or wide-angle reveal. Set the mood for {{enrichment_prompt}}. Capture the essence of the destination for {{target_audience}}. Style: {{visual_style}}.',
        script_variables: ['enrichment_prompt', 'target_audience', 'visual_style'],
        duration_seconds: 15,
      },
      {
        scene_key: 'dest_experiences',
        title: 'Experiences & Activities',
        description: 'Showcase what visitors can do and see',
        scene_type: 'body',
        script_template: 'Showcase the top experiences, activities, and attractions. Make {{target_audience}} feel the excitement. Tied to: {{enrichment_prompt}}.',
        script_variables: ['target_audience', 'enrichment_prompt'],
        duration_seconds: 18,
      },
      {
        scene_key: 'dest_culture',
        title: 'Culture & Cuisine',
        description: 'Highlight local culture, food, and people',
        scene_type: 'body',
        script_template: 'Immerse viewers in local culture, cuisine, and hospitality. Present through {{brand_name}} brand lens. Visual style: {{visual_style}}.',
        script_variables: ['brand_name', 'visual_style'],
        duration_seconds: 15,
      },
      {
        scene_key: 'dest_cta',
        title: 'Book Now CTA',
        description: 'Drive to booking or trip planning',
        scene_type: 'cta',
        script_template: 'Inspire {{target_audience}} to book their trip. Use {{key_message}} as the final hook. Create urgency with seasonal or limited offers.',
        script_variables: ['target_audience', 'key_message'],
        duration_seconds: 12,
      },
    ],
  },

  // ── 7. Celebration Event Video ───────────────────────────────────────────
  {
    name: 'Celebration Event Video',
    description: 'Festive video for weddings, cultural events, holidays, or milestones. 5 scenes: opening, story, highlights, tributes, and closing.',
    category: 'celebrations',
    style_intent: 'festive',
    estimated_duration_seconds: 90,
    scenes: [
      {
        scene_key: 'celeb_opening',
        title: 'Grand Opening',
        description: 'Set the festive tone with music and visuals',
        scene_type: 'hook',
        script_template: 'Open with a festive, celebratory tone. Set the mood for {{enrichment_prompt}}. Welcome {{target_audience}} to the celebration. Style: {{visual_style}}.',
        script_variables: ['enrichment_prompt', 'target_audience', 'visual_style'],
        duration_seconds: 15,
      },
      {
        scene_key: 'celeb_story',
        title: 'The Story',
        description: 'Share the backstory or journey leading to this celebration',
        scene_type: 'body',
        script_template: 'Tell the story behind the celebration. Share the journey, milestones, or traditions that brought everyone together. Context: {{enrichment_prompt}}.',
        script_variables: ['enrichment_prompt'],
        duration_seconds: 20,
      },
      {
        scene_key: 'celeb_highlights',
        title: 'Highlights Montage',
        description: 'Best moments, photos, and video clips',
        scene_type: 'body',
        script_template: 'Montage of the best moments — key events, reactions, and joyful highlights. Style: {{visual_style}}. Match the energy to {{target_audience}}.',
        script_variables: ['visual_style', 'target_audience'],
        duration_seconds: 25,
      },
      {
        scene_key: 'celeb_tributes',
        title: 'Tributes & Messages',
        description: 'Personal messages, dedications, or acknowledgments',
        scene_type: 'body',
        script_template: 'Feature heartfelt tributes, messages, or acknowledgments. Key message: {{key_message}}. Make it personal and emotionally resonant.',
        script_variables: ['key_message'],
        duration_seconds: 18,
      },
      {
        scene_key: 'celeb_closing',
        title: 'Closing Celebration',
        description: 'End on a high note with a memorable close',
        scene_type: 'cta',
        script_template: 'Close with a high-energy or emotional ending. Thank {{target_audience}}. Reinforce {{key_message}} and leave a lasting impression.',
        script_variables: ['target_audience', 'key_message'],
        duration_seconds: 12,
      },
    ],
  },

  // ── 8. Entertainment Promo ───────────────────────────────────────────────
  {
    name: 'Entertainment Promo',
    description: 'Cinematic promo for shows, music, events, or media content. 4 scenes: cold open, sizzle reel, talent/lineup, and ticket CTA.',
    category: 'entertainment',
    style_intent: 'cinematic',
    estimated_duration_seconds: 45,
    scenes: [
      {
        scene_key: 'ent_cold_open',
        title: 'Cold Open',
        description: 'Dramatic opening that grabs attention instantly',
        scene_type: 'hook',
        script_template: 'Hit hard with a dramatic cold open. Grab {{target_audience}} attention in the first 3 seconds. Tease: {{enrichment_prompt}}. Style: {{visual_style}}.',
        script_variables: ['target_audience', 'enrichment_prompt', 'visual_style'],
        duration_seconds: 8,
      },
      {
        scene_key: 'ent_sizzle',
        title: 'Sizzle Reel',
        description: 'Fast-paced highlight montage',
        scene_type: 'body',
        script_template: 'Fast-paced sizzle reel with the best moments, clips, and visuals. Build excitement for {{enrichment_prompt}}. Style: {{visual_style}}.',
        script_variables: ['enrichment_prompt', 'visual_style'],
        duration_seconds: 15,
      },
      {
        scene_key: 'ent_talent',
        title: 'Talent / Lineup',
        description: 'Showcase performers, cast, or featured content',
        scene_type: 'body',
        script_template: 'Spotlight the talent, lineup, or featured content. Build star power. Key message: {{key_message}}. Presented by {{brand_name}}.',
        script_variables: ['key_message', 'brand_name'],
        duration_seconds: 12,
      },
      {
        scene_key: 'ent_cta',
        title: 'Tickets / Stream CTA',
        description: 'Drive to tickets, streaming, or premiere',
        scene_type: 'cta',
        script_template: 'Drive urgency — get tickets, stream now, or tune in. {{key_message}} for {{target_audience}}. Make the CTA unmissable.',
        script_variables: ['key_message', 'target_audience'],
        duration_seconds: 10,
      },
    ],
  },

  // ── 9. Corporate Communications ──────────────────────────────────────────
  {
    name: 'Corporate Communications',
    description: 'Professional corporate video for internal comms, investor updates, or brand films. 5 scenes: opening, vision, achievements, team, and forward look.',
    category: 'corporate',
    style_intent: 'corporate',
    estimated_duration_seconds: 120,
    scenes: [
      {
        scene_key: 'corp_opening',
        title: 'Opening Statement',
        description: 'Executive or brand opening message',
        scene_type: 'hook',
        script_template: 'Open with a strong corporate message from {{brand_name}}. Establish credibility and context for {{enrichment_prompt}}. Address {{target_audience}} directly.',
        script_variables: ['brand_name', 'enrichment_prompt', 'target_audience'],
        duration_seconds: 20,
      },
      {
        scene_key: 'corp_vision',
        title: 'Vision & Mission',
        description: 'Communicate company vision and strategic direction',
        scene_type: 'body',
        script_template: 'Articulate {{brand_name}}\'s vision and mission. Connect strategy to {{key_message}}. Make it inspiring for {{target_audience}}. Style: {{visual_style}}.',
        script_variables: ['brand_name', 'key_message', 'target_audience', 'visual_style'],
        duration_seconds: 25,
      },
      {
        scene_key: 'corp_achievements',
        title: 'Key Achievements',
        description: 'Highlight milestones, results, and growth',
        scene_type: 'body',
        script_template: 'Showcase key achievements, milestones, and growth metrics for {{brand_name}}. Use infographics and data visualization. Style: {{visual_style}}.',
        script_variables: ['brand_name', 'visual_style'],
        duration_seconds: 30,
      },
      {
        scene_key: 'corp_team',
        title: 'People & Culture',
        description: 'Spotlight team, culture, and values',
        scene_type: 'body',
        script_template: 'Highlight the people behind {{brand_name}}. Showcase culture, diversity, and team spirit. Make it authentic and relatable for {{target_audience}}.',
        script_variables: ['brand_name', 'target_audience'],
        duration_seconds: 25,
      },
      {
        scene_key: 'corp_forward',
        title: 'Looking Forward',
        description: 'Future outlook and call to engagement',
        scene_type: 'cta',
        script_template: 'Close with a forward-looking message from {{brand_name}}. Reinforce {{key_message}}. Invite {{target_audience}} to be part of the journey ahead.',
        script_variables: ['brand_name', 'key_message', 'target_audience'],
        duration_seconds: 20,
      },
    ],
  },
];

// ─── Migration Function ────────────────────────────────────────────────────────

/**
 * Full migration: soft-delete all legacy/industry templates, seed 9 flow-aligned starters.
 *
 * Steps:
 * 1. Protect EP04 blueprint (podcast production — never touch)
 * 2. Soft-delete ALL other active blueprints (is_active = false)
 * 3. Check for existing flow-aligned starters (idempotent — skip if already seeded)
 * 4. Insert 9 new templates + their scenes
 *
 * Idempotent: safe to run multiple times.
 */
export async function migrateToFlowAligned(): Promise<{
  softDeleted: number;
  inserted: number;
  skipped: number;
  errors: string[];
  ep04Protected: boolean;
}> {
  const errors: string[] = [];

  // ── Step 1: Soft-delete ALL active blueprints except EP04 and existing flow-aligned starters ──
  console.log('[FlowAlignedMigration] Step 1: Soft-deleting non-EP04, non-flow-aligned blueprints...');

  const { data: activeBlueprints, error: fetchError } = await supabase
    .from('video_blueprints')
    .select('id, name, industry_tags')
    .eq('is_active', true);

  if (fetchError) {
    errors.push(`Fetch active blueprints: ${fetchError.message}`);
    return { softDeleted: 0, inserted: 0, skipped: 0, errors, ep04Protected: false };
  }

  // Soft-delete everything except EP04 and already-seeded flow_aligned_starters
  const toSoftDelete = (activeBlueprints || []).filter((bp: any) => {
    if (bp.id === EP04_BLUEPRINT_ID) return false;
    const tags: string[] = bp.industry_tags || [];
    if (tags.includes(FLOW_ALIGNED_TAG)) return false;
    return true;
  });

  let softDeleted = 0;
  if (toSoftDelete.length > 0) {
    const ids = toSoftDelete.map((bp: any) => bp.id);
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      const { error: delError } = await supabase
        .from('video_blueprints')
        .update({ is_active: false })
        .in('id', chunk);

      if (delError) {
        errors.push(`Soft-delete batch ${i}: ${delError.message}`);
      } else {
        softDeleted += chunk.length;
      }
    }
  }

  // Verify EP04 is still active
  const { data: ep04Check } = await supabase
    .from('video_blueprints')
    .select('id, is_active')
    .eq('id', EP04_BLUEPRINT_ID)
    .single();

  const ep04Protected = ep04Check?.is_active === true;
  console.log(`[FlowAlignedMigration] Soft-deleted ${softDeleted} blueprints, EP04 protected: ${ep04Protected}`);

  // ── Step 2: Check for existing flow-aligned starters (idempotency) ──
  const { data: existingStarters } = await supabase
    .from('video_blueprints')
    .select('name')
    .contains('industry_tags', [FLOW_ALIGNED_TAG])
    .eq('is_active', true);

  const existingNames = new Set((existingStarters || []).map((s: any) => s.name));

  // ── Step 3: Insert new flow-aligned templates + scenes ──
  let inserted = 0;
  let skipped = 0;

  for (const starter of FLOW_ALIGNED_STARTERS) {
    try {
      // Skip if already seeded
      if (existingNames.has(starter.name)) {
        skipped++;
        continue;
      }

      // Insert blueprint
      const { data: blueprint, error: bpError } = await supabase
        .from('video_blueprints')
        .insert({
          name: starter.name,
          description: starter.description,
          category: starter.category,
          estimated_duration_seconds: starter.estimated_duration_seconds,
          target_platform: ['youtube', 'social', 'web'],
          industry_tags: [FLOW_ALIGNED_TAG, starter.category],
          default_settings: {
            source: 'flow_aligned_seed',
            style_intent: starter.style_intent,
          },
          style_preset: {},
          is_system_default: true,
          is_active: true,
          is_public: true,
          usage_count: 0,
          style_intent: starter.style_intent,
          target_regions: ['global'],
          tone_modifier: starter.style_intent === 'festive' ? 'celebratory' : 'professional',
          aesthetic_keywords: [starter.style_intent, starter.category],
        })
        .select('id')
        .single();

      if (bpError) {
        errors.push(`${starter.name}: ${bpError.message}`);
        continue;
      }

      // Insert scenes
      if (blueprint?.id && starter.scenes.length > 0) {
        const scenes = starter.scenes.map((scene, idx) => ({
          blueprint_id: blueprint.id,
          scene_key: scene.scene_key,
          title: scene.title,
          description: scene.description,
          order_index: idx,
          scene_type: scene.scene_type,
          script_template: scene.script_template,
          script_variables: scene.script_variables,
          duration_seconds: scene.duration_seconds,
          min_duration_seconds: Math.max(5, scene.duration_seconds - 10),
          max_duration_seconds: scene.duration_seconds + 15,
          visual_config: {},
          audio_config: {},
          transition_config: { type: 'crossfade', duration: 0.5 },
          is_optional: false,
          is_repeatable: false,
        }));

        const { error: scenesError } = await supabase
          .from('blueprint_scenes')
          .insert(scenes);

        if (scenesError) {
          errors.push(`${starter.name} scenes: ${scenesError.message}`);
          continue;
        }
      }

      inserted++;
    } catch (err: any) {
      errors.push(`${starter.name}: ${err.message}`);
    }
  }

  console.log(`[FlowAlignedMigration] Done: ${inserted} inserted, ${skipped} skipped, ${errors.length} errors`);
  return { softDeleted, inserted, skipped, errors, ep04Protected };
}
