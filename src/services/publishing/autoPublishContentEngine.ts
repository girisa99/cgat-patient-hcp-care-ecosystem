/**
 * Auto-Publish Content Engine — Self-Generating Creative Content Marketing
 *
 * AskGenie becomes a self-generating creative engine that:
 * - Generates diverse promotional/educational content showcasing GenieSuite
 * - Uses universal enrichment for industry-specific, region-aware content
 * - Produces across ALL content formats: short clips, voice tips, image cards, etc.
 * - Employs varied messaging archetypes (not repetitive)
 * - 2-day cadence: English generation → transcreation to 16 regions × 62 subregions
 * - Internal review/approval gate before external publish
 *
 * Segment-based: travel, vacations, healthcare, patient access, pet industry,
 * education, entertainment, weather, remote news — with humor, empathy,
 * emotional tones, journey maps, infographics, statistics, seasonal templates.
 */

import type {
  SocialPlatformId,
  ContentFormatId,
  GenieProduct,
  PublishingOperationResult,
} from '@/types/publishing';

// ─── Messaging Archetypes (cross-industry, cross-format) ───────────────────

export type MessagingArchetype =
  | 'product_showcase'       // "Did you know GenieCast can..."
  | 'tip_of_the_day'         // Quick productivity tip
  | 'how_it_works'           // Step-by-step demo walkthrough
  | 'before_after'           // Transformation story
  | 'industry_spotlight'     // Segment-specific use case
  | 'behind_the_scenes'      // How AI generates content internally
  | 'user_story'             // Simulated success narrative
  | 'comparison'             // GenieSuite vs traditional workflow
  | 'breaking_news_style'    // News-format clip for weather/remote/underserved
  | 'entertainment_promo'    // Fun, engaging, meme-aware content
  | 'thought_leadership'     // Industry insights, trends, expert positioning
  | 'quick_demo'             // 15-30 second feature demo
  | 'seasonal_contextual'    // Holiday/event/vacation-aware content
  | 'faq_explainer'          // Common questions answered creatively
  | 'regional_showcase'      // Region-specific value proposition
  | 'journey_map'            // Patient/customer/traveler journey visualization
  | 'infographic_stat'       // Data-driven visual with statistics
  | 'emotional_narrative'    // Empathy-driven, emotional storytelling
  | 'humor_sketch'           // Light, humorous, meme-style content
  | 'mini_documentary';      // 30-60 sec documentary-style clip

// ─── Voice / Character Profiles ────────────────────────────────────────────

export type VoiceCharacter =
  | 'genie_narrator'         // Warm, knowledgeable AI guide
  | 'studio_host'            // Energetic, podcast-style presenter
  | 'professor'              // Educational, authoritative
  | 'creative_director'      // Artistic, visionary
  | 'news_anchor'            // Professional, factual
  | 'friendly_coach'         // Motivational, supportive
  | 'tech_enthusiast'        // Excited about features
  | 'storyteller'            // Narrative, emotional
  | 'comedian'               // Witty, light-hearted, meme-aware
  | 'empathetic_guide'       // Warm, caring, patient-centric
  | 'travel_host'            // Adventurous, inviting, explorer
  | 'data_analyst';          // Stats-driven, factual, visual

// ─── Industry Verticals / Segments ────────────────────────────────────────

export type IndustryVertical =
  | 'entertainment_media'
  | 'healthcare_pharma'
  | 'education_edtech'
  | 'news_journalism'
  | 'weather_environment'
  | 'sports_fitness'
  | 'finance_fintech'
  | 'retail_ecommerce'
  | 'travel_hospitality'
  | 'government_civic'
  | 'nonprofit_ngo'
  | 'technology_saas'
  | 'pet_industry'
  | 'patient_access'
  | 'patient_onboarding'
  | 'patient_reimbursement'
  | 'vacation_tourism'
  | 'places_to_visit'
  | 'remote_underserved'
  | 'general';

// ─── Content Tone ─────────────────────────────────────────────────────────

export type ContentTone =
  | 'professional' | 'casual' | 'humorous' | 'empathetic'
  | 'inspirational' | 'urgent' | 'educational' | 'emotional'
  | 'adventurous' | 'data_driven' | 'storytelling';

// ─── Content Template Styles ──────────────────────────────────────────────

export type TemplateStyle =
  | 'short_clip_15s'         // 15-second micro-clip
  | 'short_clip_30s'         // 30-second clip
  | 'mini_doc_60s'           // 60-second mini-documentary
  | 'voice_tip'              // Audio-only tip
  | 'image_card'             // Single image card
  | 'carousel_slides'        // Multi-slide carousel
  | 'audiogram'              // Waveform + text overlay
  | 'social_card'            // Text + branded graphic
  | 'infographic'            // Data-driven visual
  | 'journey_map_visual'     // Step-by-step journey map
  | 'stat_highlight'         // Big number + context
  | 'meme_style'             // Humor / meme format
  | 'text_post';             // Long-form text

// ─── Content Plan ──────────────────────────────────────────────────────────

export interface AutoPublishContentPlan {
  planId: string;
  generationDate: string;
  cadenceDays: number;
  targetArchetypes: MessagingArchetype[];
  targetFormats: ContentFormatId[];
  targetTemplates: TemplateStyle[];
  voiceCharacters: VoiceCharacter[];
  industryVerticals: IndustryVertical[];
  tones: ContentTone[];
  enrichmentProfile: Record<string, string>;
  sourceProductFocus: GenieProduct[];
  specializations: string[];
}

// ─── Generated Content Item ───────────────────────────────────────────────

export interface AutoPublishContentItem {
  itemId: string;
  planId: string;
  archetype: MessagingArchetype;
  voiceCharacter: VoiceCharacter;
  industry: IndustryVertical;
  format: ContentFormatId;
  template: TemplateStyle;
  tone: ContentTone;
  // English source
  titleEN: string;
  bodyEN: string;
  ctaEN: string;
  hashtags: string[];
  // Transcreations (region → localized content)
  transcreations: Record<string, {
    title: string;
    body: string;
    cta: string;
    hashtags: string[];
    language: string;
    isRTL: boolean;
  }>;
  // Agentic pipeline extensions (optional — set by AgenticContentOrchestrator)
  structuredScript?: {
    hook: string;
    problem: string;
    transformation: string;
    solution: string;
    cta: string;
    fictitiousName: string;
    industry: string;
    productHighlight: string;
    estimatedDurationSec: number;
  };
  visualStyle?: {
    family: string;
    cinematography: string;
  };
  qualityScore?: number;
  voiceoverDirection?: {
    provider: string;
    voiceId: string;
    voiceGender: 'male' | 'female' | 'neutral';
    language: string;
    totalDurationSec: number;
    sectionCount: number;
    ssmlEnabled: boolean;
  };
  audioMixDirection?: {
    musicGenre: string;
    musicBpm: number;
    trackCount: number;
    sfxCount: number;
    ducking: boolean;
    totalDurationSec: number;
    exportFormat: string;
  };
  // Phase D: Production plan summary (set by AgenticContentOrchestrator → PublishCoordinator)
  productionPlan?: {
    blueprintId: string;
    sceneCount: number;
    chunkingStrategy: string;
    resolvedFormat: string;
    totalTargetDurationSec: number;
    hasProductionScript: boolean;
  };
  // Approval workflow
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'scheduled';
  reviewNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  // Publish targets
  publishTargets: SocialPlatformId[];
  publishResults?: PublishingOperationResult[];
}

// ─── Specialization Library ────────────────────────────────────────────────

export const SPECIALIZATION_LIBRARY: string[] = [
  'AI-powered content creation across 85+ languages',
  'Produce broadcast-quality video with GPU rendering pipeline',
  'Transcreate once, publish to 16 regions x 62 subregions',
  '4 AI zones ensuring fastest provider per region',
  'Full podcast production: script -> record -> edit -> publish',
  'Smart scheduling with timezone-aware optimal posting',
  'Scene intelligence: auto-chapters, auto-scenes from any script',
  'Medical content compliance with region-specific guidelines',
  'Weather & breaking news clips for underserved regions',
  'Education content localized with cultural tone adaptation',
  'Patient onboarding journeys with empathetic, accessible content',
  'Travel & vacation promo clips with seasonal templates',
  'Pet industry showcase — breed guides, wellness tips, adoption stories',
  'Healthcare reimbursement explainers with step-by-step journey maps',
  'Patient access programs visualized as infographic workflows',
  'Data-driven content with statistics, charts, and highlights',
  'Humorous micro-clips for social engagement and shareability',
  'Emotional storytelling: patient success stories, rescue narratives',
  'Holiday season promotional templates with festive themes',
  'Remote and underserved region news delivery in local languages',
  'Cross-industry format library: 12+ formats, 13+ templates',
  'Places-to-visit guides with regional cultural context',
  'Vacation countdown clips with destination highlights',
  'Sports fitness micro-demos with motivational coaching voice',
  'Financial literacy explainers with data visualization',
  'Nonprofit impact stories with empathy-driven narratives',
  'Government civic engagement clips for multilingual audiences',
  'Retail product launches with before/after transformation',
  'Technology SaaS demos with quick-start walkthroughs',
  'Journey maps: patient journey, customer journey, traveler journey',
  'Infographic statistics: engagement rates, reach projections, ROI',
  'Meme-style clips for Gen Z + millennial audience engagement',
  'Mini-documentary format: 60-second deep-dive on any topic',
  'Voice tip clips: audio-first content for podcast and radio',
  'Carousel posts: multi-slide educational content for LinkedIn/Instagram',
];

// ─── Segment Message Library ──────────────────────────────────────────────

export const SEGMENT_MESSAGES: Record<IndustryVertical, string[]> = {
  entertainment_media: [
    'Create studio-quality trailers in minutes, not weeks',
    'Multi-format export: YouTube, TikTok, Instagram in one click',
    'AI-powered scene composition with dramatic pacing',
  ],
  healthcare_pharma: [
    'HIPAA-aware content workflows for patient education',
    'Multilingual medical explainers with region-specific compliance',
    'Drug launch campaigns transcreated to 62 subregions instantly',
  ],
  education_edtech: [
    'Turn any lesson into an engaging micro-learning clip',
    'Cultural tone adaptation ensures content resonates locally',
    'Accessibility-first: captions, audio descriptions, RTL support',
  ],
  news_journalism: [
    'Breaking news clips ready in under 5 minutes',
    'Multi-language news delivery for underserved communities',
    'Fact-first, editorial-standard content templates',
  ],
  weather_environment: [
    'Automated weather report generation with regional data',
    'Climate awareness clips for communities worldwide',
    'Emergency alert content in local languages',
  ],
  sports_fitness: [
    'Workout demos with motivational coaching voice',
    'Game highlight reels with AI-powered scene detection',
    'Athlete spotlight stories with emotional narrative',
  ],
  finance_fintech: [
    'Financial literacy explainers with data visualization',
    'Market update clips with stat highlights',
    'Investment journey maps for beginner audiences',
  ],
  retail_ecommerce: [
    'Product launch campaigns with before/after transformation',
    'Seasonal promo clips with festive templates',
    'Unboxing and review content in multiple formats',
  ],
  travel_hospitality: [
    'Destination highlight reels with immersive storytelling',
    'Hotel and resort showcases with virtual tour clips',
    'Travel itinerary carousels with cultural tips',
  ],
  government_civic: [
    'Civic engagement clips in 85+ languages',
    'Public service announcements with accessible design',
    'Policy explainer infographics for diverse audiences',
  ],
  nonprofit_ngo: [
    'Impact stories with empathy-driven narratives',
    'Donation campaign clips with emotional storytelling',
    'Volunteer journey maps showing community transformation',
  ],
  technology_saas: [
    'Product demo walkthroughs in under 30 seconds',
    'Feature comparison infographics for decision-makers',
    'Quick-start tutorials with step-by-step animations',
  ],
  pet_industry: [
    'Breed spotlight guides with fun, engaging tone',
    'Pet wellness tips as animated micro-clips',
    'Rescue and adoption success stories with emotional narrative',
  ],
  patient_access: [
    'Patient access program explainers with step-by-step flows',
    'Copay assistance journey maps with empathetic tone',
    'Enrollment guides transcreated for regional healthcare systems',
  ],
  patient_onboarding: [
    'New patient welcome videos with warm, empathetic narration',
    'Treatment pathway journey maps with clear milestones',
    'FAQ explainers for common patient questions',
  ],
  patient_reimbursement: [
    'Reimbursement process infographics with step-by-step flows',
    'Insurance claim journey maps with status tracking visuals',
    'Cost transparency explainers with data-driven stats',
  ],
  vacation_tourism: [
    'Top destinations carousel with seasonal recommendations',
    'Holiday countdown clips with festive excitement',
    'Budget travel tips as quick social cards',
  ],
  places_to_visit: [
    'Hidden gem guides for each of 62 subregions',
    'Cultural experience clips with local language narration',
    'Must-visit places ranked with user engagement stats',
  ],
  remote_underserved: [
    'News and information clips for offline-first communities',
    'Educational content in low-resource languages',
    'Health and safety alerts with maximum accessibility',
  ],
  general: [
    'AI-powered content for any industry, any audience',
    'One platform, all formats, all regions',
    'From idea to published content in minutes',
  ],
};

// ─── Engine Functions ─────────────────────────────────────────────────────

let _idCounter = 0;

function nextId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++_idCounter}`;
}

export function generateContentPlan(
  options?: Partial<AutoPublishContentPlan>,
): AutoPublishContentPlan {
  const allArchetypes: MessagingArchetype[] = [
    'product_showcase', 'tip_of_the_day', 'how_it_works', 'before_after',
    'industry_spotlight', 'behind_the_scenes', 'user_story', 'comparison',
    'breaking_news_style', 'entertainment_promo', 'thought_leadership',
    'quick_demo', 'seasonal_contextual', 'faq_explainer', 'regional_showcase',
    'journey_map', 'infographic_stat', 'emotional_narrative', 'humor_sketch',
    'mini_documentary',
  ];

  const allVoices: VoiceCharacter[] = [
    'genie_narrator', 'studio_host', 'professor', 'creative_director',
    'news_anchor', 'friendly_coach', 'tech_enthusiast', 'storyteller',
    'comedian', 'empathetic_guide', 'travel_host', 'data_analyst',
  ];

  const allIndustries: IndustryVertical[] = [
    'entertainment_media', 'healthcare_pharma', 'education_edtech',
    'news_journalism', 'weather_environment', 'sports_fitness',
    'finance_fintech', 'retail_ecommerce', 'travel_hospitality',
    'government_civic', 'nonprofit_ngo', 'technology_saas',
    'pet_industry', 'patient_access', 'patient_onboarding',
    'patient_reimbursement', 'vacation_tourism', 'places_to_visit',
    'remote_underserved', 'general',
  ];

  const allFormats: ContentFormatId[] = [
    'short_video', 'long_video', 'thumbnail', 'highlight_reel',
    'teaser_clip', 'carousel', 'story', 'audio_podcast',
    'audiogram', 'social_card', 'text_post',
  ];

  const allTemplates: TemplateStyle[] = [
    'short_clip_15s', 'short_clip_30s', 'mini_doc_60s', 'voice_tip',
    'image_card', 'carousel_slides', 'audiogram', 'social_card',
    'infographic', 'journey_map_visual', 'stat_highlight', 'meme_style',
    'text_post',
  ];

  const allTones: ContentTone[] = [
    'professional', 'casual', 'humorous', 'empathetic',
    'inspirational', 'urgent', 'educational', 'emotional',
    'adventurous', 'data_driven', 'storytelling',
  ];

  // Pick a diverse subset for this cycle
  const pick = <T>(arr: T[], n: number): T[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  };

  return {
    planId: nextId('plan'),
    generationDate: new Date().toISOString(),
    cadenceDays: options?.cadenceDays ?? 2,
    targetArchetypes: options?.targetArchetypes ?? pick(allArchetypes, 6),
    targetFormats: options?.targetFormats ?? pick(allFormats, 5),
    targetTemplates: options?.targetTemplates ?? pick(allTemplates, 5),
    voiceCharacters: options?.voiceCharacters ?? pick(allVoices, 4),
    industryVerticals: options?.industryVerticals ?? pick(allIndustries, 5),
    tones: options?.tones ?? pick(allTones, 4),
    enrichmentProfile: options?.enrichmentProfile ?? {},
    sourceProductFocus: options?.sourceProductFocus ?? pick(['cast', 'spark', 'mind', 'deck', 'vibe', 'hub'] as GenieProduct[], 3),
    specializations: options?.specializations ?? pick(SPECIALIZATION_LIBRARY, 5),
  };
}

export function generateContentBatch(plan: AutoPublishContentPlan): AutoPublishContentItem[] {
  const items: AutoPublishContentItem[] = [];

  for (const archetype of plan.targetArchetypes) {
    const voice = plan.voiceCharacters[Math.floor(Math.random() * plan.voiceCharacters.length)];
    const industry = plan.industryVerticals[Math.floor(Math.random() * plan.industryVerticals.length)];
    const format = plan.targetFormats[Math.floor(Math.random() * plan.targetFormats.length)];
    const template = plan.targetTemplates[Math.floor(Math.random() * plan.targetTemplates.length)];
    const tone = plan.tones[Math.floor(Math.random() * plan.tones.length)];
    const spec = plan.specializations[Math.floor(Math.random() * plan.specializations.length)];
    const segMsgs = SEGMENT_MESSAGES[industry] || SEGMENT_MESSAGES.general;
    const segMsg = segMsgs[Math.floor(Math.random() * segMsgs.length)];

    const { title, body, cta } = buildContent(archetype, voice, industry, tone, spec, segMsg);

    items.push({
      itemId: nextId('item'),
      planId: plan.planId,
      archetype,
      voiceCharacter: voice,
      industry,
      format,
      template,
      tone,
      titleEN: title,
      bodyEN: body,
      ctaEN: cta,
      hashtags: buildHashtags(industry, archetype),
      transcreations: {},
      status: 'draft',
      publishTargets: [],
    });
  }

  return items;
}

function buildContent(
  archetype: MessagingArchetype,
  voice: VoiceCharacter,
  industry: IndustryVertical,
  tone: ContentTone,
  specialization: string,
  segmentMsg: string,
): { title: string; body: string; cta: string } {
  const industryLabel = industry.replace(/_/g, ' ');
  const voiceLabel = voice.replace(/_/g, ' ');

  const templates: Record<MessagingArchetype, { title: string; body: string; cta: string }> = {
    product_showcase: {
      title: `Discover GenieSuite for ${industryLabel}`,
      body: `${segmentMsg}. Powered by ${specialization}. Your ${voiceLabel} walks you through the magic.`,
      cta: 'See it in action',
    },
    tip_of_the_day: {
      title: `Pro Tip: ${industryLabel} Edition`,
      body: `Quick tip from your ${voiceLabel}: ${segmentMsg}. ${specialization} makes it effortless.`,
      cta: 'Try this today',
    },
    how_it_works: {
      title: `How GenieSuite Works for ${industryLabel}`,
      body: `Step by step: ${segmentMsg}. Under the hood: ${specialization}.`,
      cta: 'Start creating',
    },
    before_after: {
      title: `${industryLabel}: Before & After GenieSuite`,
      body: `Before: hours of manual work. After: ${segmentMsg}. The difference? ${specialization}.`,
      cta: 'Transform your workflow',
    },
    industry_spotlight: {
      title: `Spotlight: ${industryLabel}`,
      body: `How leading ${industryLabel} teams use GenieSuite: ${segmentMsg}. Built with ${specialization}.`,
      cta: 'Explore your industry',
    },
    behind_the_scenes: {
      title: 'Behind the AI: How GenieSuite Creates',
      body: `Your ${voiceLabel} reveals: ${specialization}. Result? ${segmentMsg}.`,
      cta: 'Peek behind the curtain',
    },
    user_story: {
      title: `Success Story: ${industryLabel}`,
      body: `A ${industryLabel} team achieved incredible results: ${segmentMsg}. Their secret? ${specialization}.`,
      cta: 'Read their story',
    },
    comparison: {
      title: `GenieSuite vs. Traditional ${industryLabel} Workflows`,
      body: `Traditional: weeks. GenieSuite: minutes. ${segmentMsg}. ${specialization} powers the difference.`,
      cta: 'Compare now',
    },
    breaking_news_style: {
      title: `BREAKING: New Capabilities for ${industryLabel}`,
      body: `This just in: ${segmentMsg}. ${specialization} now available for all teams.`,
      cta: 'Get the details',
    },
    entertainment_promo: {
      title: `Create Like a Pro: ${industryLabel}`,
      body: `Your ${voiceLabel} presents: ${segmentMsg}. Fun, fast, and powered by ${specialization}.`,
      cta: 'Join the fun',
    },
    thought_leadership: {
      title: `The Future of ${industryLabel}`,
      body: `Industry insight: ${segmentMsg}. Leading with ${specialization}. The ${voiceLabel} perspective.`,
      cta: 'Stay ahead',
    },
    quick_demo: {
      title: `30-Second Demo: ${industryLabel}`,
      body: `Watch ${segmentMsg} happen in real time. ${specialization} in action.`,
      cta: 'Watch the demo',
    },
    seasonal_contextual: {
      title: `This Season: ${industryLabel} Essentials`,
      body: `Seasonal content made easy: ${segmentMsg}. Perfect timing with ${specialization}.`,
      cta: 'Create seasonal content',
    },
    faq_explainer: {
      title: `FAQ: ${industryLabel} on GenieSuite`,
      body: `Common question answered: ${segmentMsg}. Made possible by ${specialization}.`,
      cta: 'Got questions? We answer',
    },
    regional_showcase: {
      title: `GenieSuite in Your Region: ${industryLabel}`,
      body: `Localized for your region: ${segmentMsg}. ${specialization} ensures cultural relevance.`,
      cta: 'See your region',
    },
    journey_map: {
      title: `Your ${industryLabel} Journey with GenieSuite`,
      body: `Step 1: Start. Step 2: Create. Step 3: Publish. Along the way: ${segmentMsg}. Guided by ${specialization}.`,
      cta: 'Map your journey',
    },
    infographic_stat: {
      title: `By the Numbers: ${industryLabel}`,
      body: `The data speaks: ${segmentMsg}. 85+ languages. 16 regions. 62 subregions. ${specialization}.`,
      cta: 'See the stats',
    },
    emotional_narrative: {
      title: `A Story from ${industryLabel}`,
      body: `${segmentMsg}. Every voice deserves to be heard. ${specialization} makes it possible.`,
      cta: 'Feel the impact',
    },
    humor_sketch: {
      title: `LOL: ${industryLabel} Problems, Solved`,
      body: `We get it. ${segmentMsg}. But seriously, ${specialization} fixes this. Your ${voiceLabel} approves.`,
      cta: 'Laugh and learn',
    },
    mini_documentary: {
      title: `60 Seconds: The ${industryLabel} Revolution`,
      body: `A mini-documentary: ${segmentMsg}. Narrated by your ${voiceLabel}. Powered by ${specialization}.`,
      cta: 'Watch the story',
    },
  };

  return templates[archetype] || templates.product_showcase;
}

function buildHashtags(industry: IndustryVertical, archetype: MessagingArchetype): string[] {
  const base = ['#GenieSuite', '#AIContent', '#ContentCreation'];
  const industryTags: Record<string, string[]> = {
    healthcare_pharma: ['#HealthTech', '#PatientCare', '#DigitalHealth'],
    education_edtech: ['#EdTech', '#eLearning', '#Education'],
    travel_hospitality: ['#Travel', '#Wanderlust', '#Tourism'],
    pet_industry: ['#PetCare', '#PetLovers', '#Animals'],
    patient_access: ['#PatientAccess', '#Healthcare', '#AccessPrograms'],
    patient_onboarding: ['#PatientJourney', '#Onboarding', '#Healthcare'],
    patient_reimbursement: ['#HealthInsurance', '#Reimbursement', '#PatientFinance'],
    vacation_tourism: ['#Vacation', '#HolidaySeason', '#TravelGuide'],
    places_to_visit: ['#MustVisit', '#HiddenGems', '#Explore'],
    entertainment_media: ['#Media', '#Entertainment', '#Creative'],
    news_journalism: ['#BreakingNews', '#Journalism', '#News'],
    sports_fitness: ['#Fitness', '#Sports', '#Workout'],
    finance_fintech: ['#FinTech', '#Finance', '#MoneyTips'],
    remote_underserved: ['#DigitalInclusion', '#Accessibility', '#CommunityNews'],
  };

  const archetypeTags: Record<string, string[]> = {
    humor_sketch: ['#Funny', '#Meme', '#LOL'],
    emotional_narrative: ['#Inspiration', '#Impact', '#Empathy'],
    journey_map: ['#JourneyMap', '#Workflow', '#StepByStep'],
    infographic_stat: ['#Infographic', '#DataDriven', '#Stats'],
    seasonal_contextual: ['#Seasonal', '#Holiday', '#Trending'],
  };

  return [
    ...base,
    ...(industryTags[industry] || []),
    ...(archetypeTags[archetype] || []),
  ];
}

export function getSpecializationMessages(): string[] {
  return [...SPECIALIZATION_LIBRARY];
}

export function getIndustryMessages(vertical: IndustryVertical): string[] {
  return SEGMENT_MESSAGES[vertical] || SEGMENT_MESSAGES.general;
}

export function rotateArchetypes(previousBatch: AutoPublishContentItem[]): MessagingArchetype[] {
  const allArchetypes: MessagingArchetype[] = [
    'product_showcase', 'tip_of_the_day', 'how_it_works', 'before_after',
    'industry_spotlight', 'behind_the_scenes', 'user_story', 'comparison',
    'breaking_news_style', 'entertainment_promo', 'thought_leadership',
    'quick_demo', 'seasonal_contextual', 'faq_explainer', 'regional_showcase',
    'journey_map', 'infographic_stat', 'emotional_narrative', 'humor_sketch',
    'mini_documentary',
  ];

  const usedInLast = new Set(previousBatch.map(i => i.archetype));
  // Prefer archetypes not used in the previous batch
  const unused = allArchetypes.filter(a => !usedInLast.has(a));
  const shuffled = unused.length >= 6
    ? unused.sort(() => Math.random() - 0.5).slice(0, 6)
    : [...unused, ...allArchetypes.filter(a => usedInLast.has(a))].slice(0, 6);

  return shuffled;
}
