/**
 * Creative Content Scriptwriter — Structured 5-Part Script Generator
 *
 * Generates Hook → Problem → Transformation → Solution → CTA scripts
 * for GenieSuite self-marketing. Product-agnostic — works for any GenieSuite product.
 *
 * Uses fictitious business names (no real companies) and modulates voice
 * character tone (comedian = lighter, professor = authoritative, etc.)
 */

import type {
  MessagingArchetype,
  VoiceCharacter,
  IndustryVertical,
  ContentTone,
} from './autoPublishContentEngine';
import type { GenieProduct } from '@/types/publishing';

// ─── Types ──────────────────────────────────────────────────────────

export interface StructuredContentScript {
  hook: string;
  problem: string;
  transformation: string;
  solution: string;
  cta: string;
  fictitiousName: string;
  industry: IndustryVertical;
  productHighlight: GenieProduct;
  estimatedDurationSec: number;
}

export interface ScriptwriterBrief {
  archetype: MessagingArchetype;
  voiceCharacter: VoiceCharacter;
  industry: IndustryVertical;
  tone: ContentTone;
  productFocus: GenieProduct;
  fictitiousName: string;
  fictitiousType: string;
}

// ─── Fictitious Business Library (60 names, 20 industries) ──────────

export const FICTITIOUS_BUSINESSES: Record<string, Array<{ name: string; type: string }>> = {
  entertainment_media: [
    { name: 'DreamWave Studios', type: 'media production house' },
    { name: 'StarVault Entertainment', type: 'content streaming platform' },
    { name: 'CineBloom Productions', type: 'independent film studio' },
  ],
  healthcare_pharma: [
    { name: 'WellPath Clinic', type: 'multi-specialty clinic' },
    { name: 'MediSync Health', type: 'telehealth platform' },
    { name: 'CareFirst Medical Group', type: 'hospital network' },
  ],
  education_edtech: [
    { name: 'Bright Horizons Academy', type: 'K-12 school network' },
    { name: 'NeuroLearn Institute', type: 'online learning platform' },
    { name: 'CuriousMinds School', type: 'early childhood education center' },
  ],
  news_journalism: [
    { name: 'PulseWire News', type: 'digital newsroom' },
    { name: 'ClearView Dispatch', type: 'regional news network' },
    { name: 'FrontPage Digital', type: 'investigative journalism outlet' },
  ],
  weather_environment: [
    { name: 'SkyPulse Weather', type: 'weather broadcasting service' },
    { name: 'EcoWatch Global', type: 'environmental monitoring agency' },
    { name: 'StormTrail Analytics', type: 'climate data platform' },
  ],
  sports_fitness: [
    { name: 'PeakForm Athletics', type: 'fitness coaching platform' },
    { name: 'GameDay Central', type: 'sports media company' },
    { name: 'FlexZone Gym', type: 'gym franchise' },
  ],
  finance_fintech: [
    { name: 'ClearLedger Finance', type: 'fintech startup' },
    { name: 'TrustBridge Capital', type: 'investment advisory firm' },
    { name: 'PayStream Solutions', type: 'payment processing company' },
  ],
  retail_ecommerce: [
    { name: 'ShopNest Marketplace', type: 'e-commerce platform' },
    { name: 'CartBloom Retail', type: 'online retail brand' },
    { name: 'TrendVault Stores', type: 'fashion retail chain' },
  ],
  travel_hospitality: [
    { name: 'Wanderlust Journeys', type: 'travel booking platform' },
    { name: 'SunChaser Resorts', type: 'luxury resort chain' },
    { name: 'GlobeTrail Adventures', type: 'adventure travel company' },
  ],
  government_civic: [
    { name: 'CivicPulse Agency', type: 'municipal services platform' },
    { name: 'GovConnect Digital', type: 'e-government portal' },
    { name: 'PublicVoice Initiative', type: 'civic engagement organization' },
  ],
  nonprofit_ngo: [
    { name: 'HopeReach Foundation', type: 'global humanitarian NGO' },
    { name: 'GreenFuture Alliance', type: 'environmental nonprofit' },
    { name: 'LiteracyBridge International', type: 'education charity' },
  ],
  technology_saas: [
    { name: 'CloudForge Labs', type: 'SaaS development company' },
    { name: 'DataPulse AI', type: 'AI analytics platform' },
    { name: 'SwiftDeploy Systems', type: 'DevOps tooling startup' },
  ],
  pet_industry: [
    { name: 'PetJoy Adventures', type: 'pet supplies e-commerce' },
    { name: 'FurEver Friends Shelter', type: 'animal rescue organization' },
    { name: 'PawPrint Veterinary', type: 'veterinary clinic chain' },
  ],
  patient_access: [
    { name: 'AccessFirst Programs', type: 'patient access services provider' },
    { name: 'PathwayRx Services', type: 'medication access platform' },
    { name: 'CareGate Solutions', type: 'patient assistance coordinator' },
  ],
  patient_onboarding: [
    { name: 'WelcomeCare Health', type: 'patient onboarding platform' },
    { name: 'FirstStep Medical', type: 'new patient services provider' },
    { name: 'OnboardMD Systems', type: 'healthcare intake automation' },
  ],
  patient_reimbursement: [
    { name: 'ClaimPath Solutions', type: 'reimbursement management platform' },
    { name: 'ReimburseRx Systems', type: 'pharmacy benefits coordinator' },
    { name: 'ClearClaim Health', type: 'insurance claims processor' },
  ],
  vacation_tourism: [
    { name: 'DreamEscape Travel', type: 'vacation planning platform' },
    { name: 'IslandHop Holidays', type: 'tropical vacation provider' },
    { name: 'SerenityGetaways', type: 'wellness retreat company' },
  ],
  places_to_visit: [
    { name: 'HiddenGem Guides', type: 'travel discovery platform' },
    { name: 'WanderMap Local', type: 'local tourism board' },
    { name: 'ExploreMore Trails', type: 'outdoor adventure directory' },
  ],
  remote_underserved: [
    { name: 'ReachOut Connect', type: 'rural connectivity provider' },
    { name: 'BridgeAccess Network', type: 'underserved communities NGO' },
    { name: 'VillageVoice Media', type: 'community news platform' },
  ],
  general: [
    { name: 'NovaPoint Solutions', type: 'multi-industry consultancy' },
    { name: 'ZenithWorks Agency', type: 'creative agency' },
    { name: 'PrismView Digital', type: 'digital transformation firm' },
  ],
};

// ─── Hook Templates (per archetype) ────────────────────────────────

const HOOK_TEMPLATES: Partial<Record<MessagingArchetype, string[]>> = {
  product_showcase: [
    'What if {industry} could launch in minutes, not months?',
    '{name} discovered something that changed everything.',
    'This is what {industry} looks like with AI.',
    'Warning: this demo might make you rethink your entire workflow.',
    'Watch {name} go from idea to published in 47 seconds.',
  ],
  before_after: [
    'What if {industry} could do in minutes what takes weeks?',
    'Before GenieSuite: chaos. After: cinema.',
    '{name} was drowning in manual work. Then they found this.',
    'The transformation is real. Watch.',
    'Same team. Same budget. Completely different results.',
  ],
  tip_of_the_day: [
    'Quick tip that saves {industry} teams 10+ hours a week.',
    'Here\'s something most {industry} professionals don\'t know.',
    'Your {industry} hack of the day — courtesy of AI.',
    'Stop doing this manually. There\'s a better way.',
    '60 seconds to change how you create content forever.',
  ],
  how_it_works: [
    'Ever wonder how AI creates broadcast-quality content?',
    '3 steps. 85 languages. Zero headaches.',
    'Behind the magic: how {name} produces content at scale.',
    'It starts with a single prompt. Here\'s what happens next.',
    'The simplest workflow in {industry}. Let us show you.',
  ],
  industry_spotlight: [
    'Why {industry} leaders are switching to AI-first content.',
    '{industry} is being transformed. Here\'s the proof.',
    'The future of {industry} arrived early.',
    'How {name} became a {industry} content powerhouse.',
    'Every {industry} professional needs to see this.',
  ],
  humor_sketch: [
    'POV: You\'re still creating {industry} content manually in 2026.',
    'Nobody: ... {name}: "We use AI now." Everyone: 👀',
    'When your {industry} competitor discovers GenieSuite...',
    'Me explaining AI content to my boss at {name} (gone right).',
    'Day 1 vs Day 100 at {name} after discovering GenieSuite.',
  ],
  emotional_narrative: [
    'This story started with one simple wish.',
    '{name} believed every voice deserves to be heard.',
    'Some stories change how you see {industry} forever.',
    'What happens when {industry} puts people first?',
    'A journey that started with "what if?"',
  ],
  journey_map: [
    'Step 1 of the most rewarding {industry} journey you\'ll take.',
    'From first click to global impact — this is the path.',
    '{name}\'s journey will inspire your own.',
    'Every great transformation starts with a single step.',
    'Map your {industry} transformation — here\'s how.',
  ],
  infographic_stat: [
    'The numbers don\'t lie. {industry} is changing.',
    '85+ languages. 62 subregions. 1 platform.',
    '{name} saw these numbers and made the switch immediately.',
    'Data point: {industry} teams save 73% time with AI content.',
    'By the numbers: what GenieSuite delivers for {industry}.',
  ],
  mini_documentary: [
    'In 60 seconds, discover how {industry} is being revolutionized.',
    'A story about {name} and the future of content.',
    'Short documentary: the rise of AI in {industry}.',
    'Inside {name}: a glimpse at the content revolution.',
    'This is the documentary {industry} professionals need to see.',
  ],
};

// ─── Problem Library (per industry) ─────────────────────────────────

const PROBLEM_LIBRARY: Partial<Record<IndustryVertical, string[]>> = {
  education_edtech: [
    '{name} spent 20+ hours per week creating multilingual materials instead of teaching.',
    'Students across 5 campuses received the same English-only content, missing cultural context.',
    'The content team at {name} couldn\'t keep up with demand for localized learning materials.',
    'Teachers at {name} were burning out trying to create engaging video content alongside lesson plans.',
    'Parents in non-English regions couldn\'t access {name}\'s educational updates and resources.',
  ],
  healthcare_pharma: [
    '{name} struggled to produce patient education materials in regional languages quickly enough.',
    'Compliance reviews added weeks to every content release at {name}.',
    'Patients left {name} confused — the materials were only available in 2 languages.',
    '{name}\'s clinical teams needed visual content but had zero production bandwidth.',
    'Drug launch communications at {name} took 3 months to reach all 16 target regions.',
  ],
  pet_industry: [
    '{name} had adoption stories that could save lives — but couldn\'t produce content fast enough.',
    'Pet parents wanted breed-specific wellness tips in their language. {name} could only offer English.',
    '{name} lost social engagement because their content looked generic compared to competitors.',
    'Seasonal pet campaigns at {name} were always late — manual production took too long.',
    'Veterinary education content from {name} wasn\'t reaching rural communities.',
  ],
  travel_hospitality: [
    '{name} had stunning destinations but couldn\'t showcase them in enough languages.',
    'Seasonal booking windows slipped because {name}\'s marketing content wasn\'t ready in time.',
    'Travelers from 16 different regions all saw the same cookie-cutter marketing from {name}.',
    '{name}\'s competitors were publishing daily while they managed one post per week.',
    'Cultural nuances were lost in translation — {name}\'s content felt tone-deaf in local markets.',
  ],
  patient_access: [
    'Eligible patients didn\'t know about {name}\'s assistance programs — awareness was near zero.',
    '{name} had life-saving programs that couldn\'t reach non-English-speaking populations.',
    'The enrollment process at {name} was so complex that 60% of patients dropped off halfway.',
    '{name}\'s team manually created access guides for each region — an impossible workload.',
    'Patients called {name} confused about eligibility. The website content was in English only.',
  ],
  entertainment_media: [
    '{name} was producing one trailer per month while competitors launched daily teasers.',
    'Audiences across regions couldn\'t connect with {name}\'s content — it wasn\'t localized.',
    '{name}\'s creative team was brilliant but bottlenecked by manual editing and formatting.',
    'Multi-format publishing was a nightmare — {name} reformatted every video manually.',
    'Social media engagement at {name} was dropping because content felt repetitive.',
  ],
  finance_fintech: [
    '{name}\'s financial literacy content only reached English-speaking audiences.',
    'Market updates from {name} were always a day late — manual production was too slow.',
    'Clients wanted visual explainers but {name} could only produce text-heavy PDFs.',
    '{name}\'s compliance team vetoed creative content because review cycles took weeks.',
    'Investment guides from {name} weren\'t culturally adapted for emerging market audiences.',
  ],
  technology_saas: [
    '{name}\'s product demos took a week to produce — competitors shipped daily.',
    'Onboarding content from {name} was only in English, limiting global expansion.',
    '{name}\'s feature updates reached 10% of users because content production was manual.',
    'The marketing team at {name} was 3 people trying to cover 12 content formats.',
    'Developer documentation videos from {name} were outdated before they were published.',
  ],
  nonprofit_ngo: [
    '{name}\'s impact stories weren\'t reaching donors because production took months.',
    'Communities {name} served spoke 15+ languages — but all content was in English.',
    'Volunteer recruitment at {name} suffered because campaigns looked unprofessional.',
    '{name}\'s annual report needed to reach 30 countries but was only produced in 2 languages.',
    'Grant applications at {name} lacked compelling visual narratives.',
  ],
  sports_fitness: [
    '{name}\'s workout content only worked for English-speaking markets.',
    'Athletes featured on {name} wanted their stories told in their native languages.',
    '{name}\'s daily fitness tips were stuck in text format — video was too expensive.',
    'Game highlights from {name} took 24 hours to produce — fans had moved on by then.',
    '{name}\'s coaches needed visual training aids but had no production resources.',
  ],
};

// ─── Transformation Templates (per archetype) ──────────────────────

const TRANSFORMATION_TEMPLATES: Partial<Record<MessagingArchetype, string[]>> = {
  product_showcase: [
    'With GenieSuite, {name} went from weeks of production to minutes of creation. What used to require a full team now happens with a single prompt.',
    '{name} now produces cinematic, broadcast-quality content across all formats — automatically adapted for every region and language.',
  ],
  before_after: [
    'The before: endless manual work, cookie-cutter output, exhausted teams. The after: {name} creates stunning, localized content in minutes — across 85+ languages.',
    'Before GenieSuite, {name} chose between quality and speed. Now they have both — with AI handling production while humans focus on creativity.',
  ],
  humor_sketch: [
    'Plot twist: {name} discovered they could replace their entire content bottleneck with one AI-powered workflow. The team went from stressed to impressed.',
    'Spoiler alert: {name}\'s content calendar went from "perpetually behind" to "three months ahead" in a single afternoon.',
  ],
  emotional_narrative: [
    'For {name}, it wasn\'t just about content — it was about reaching every community, in every language, with messages that truly resonate.',
    'When {name} saw their content reaching families in their native language for the first time, the impact was immediate and profound.',
  ],
  journey_map: [
    'Step by step, {name} transformed their workflow: idea → AI enhancement → cinematic production → regional transcreation → multi-platform publish. All automated.',
    '{name}\'s journey from overwhelmed to empowered happened in stages — each one unlocking capabilities they didn\'t know were possible.',
  ],
  infographic_stat: [
    '{name} tracked the difference: 73% less production time, 16x regional reach, 4x social engagement, and zero quality compromise.',
    'The numbers tell the story: {name} went from 1 language to 85+, from 1 format to 12, and from weekly to daily publishing.',
  ],
  industry_spotlight: [
    'Across the {industry} landscape, organizations like {name} are proving that AI-powered content isn\'t the future — it\'s the present.',
    '{name} became a case study in how {industry} can scale content globally without scaling headcount.',
  ],
  mini_documentary: [
    'What we discovered at {name} was remarkable: a small team producing content that rivals studios 10x their size.',
    'The story of {name} is the story of every {industry} organization ready to embrace the next generation of content creation.',
  ],
};

// ─── Solution Library (per GenieSuite product) ──────────────────────

const SOLUTION_LIBRARY: Record<GenieProduct, string[]> = {
  cast: [
    'GenieCast\'s full production pipeline — from script to cinematic video in minutes. AI-powered scene intelligence, GPU rendering, and multi-format export.',
    'With GenieCast, {name} produces broadcast-quality content across 85+ languages, 12 formats, and 16 regions — all from a single prompt.',
    'GenieCast\'s agentic pipeline: 6 AI agents collaborate to write, design, review, transcreate, and publish — without human bottlenecks.',
  ],
  spark: [
    'GenieSpark transforms raw ideas into polished, production-ready concepts. AI enrichment adds industry context, regional relevance, and creative direction.',
    'With GenieSpark, {name}\'s brainstorming sessions became launchpads. Every idea gets AI-enhanced with market data, trends, and creative frameworks.',
  ],
  mind: [
    'GenieMind organizes knowledge into actionable insights. From research to strategy, AI-powered analysis turns data into decisions.',
    'With GenieMind, {name} stopped drowning in information and started surfacing the insights that matter — in any language.',
  ],
  deck: [
    'GenieDeck turns content into stunning presentations, pitch decks, and slide shows — automatically formatted for any audience.',
    'With GenieDeck, {name} went from blank slides to board-ready presentations in under 5 minutes, with regional customization built in.',
  ],
  vibe: [
    'GenieVibe captures brand essence and translates it into consistent visual identity across every piece of content.',
    'With GenieVibe, {name}\'s brand stayed consistent across 62 subregions — every color, font, and tone perfectly aligned.',
  ],
  hub: [
    'GenieHub centralizes content operations — production, review, approval, and publishing in one unified dashboard.',
    'With GenieHub, {name}\'s team went from scattered tools to a single command center for all content operations across all regions.',
  ],
};

// ─── CTA Templates ──────────────────────────────────────────────────

const CTA_TEMPLATES: string[] = [
  'See GenieSuite transform your {industry} content — try it free.',
  'Ready to create like {name}? Start your GenieSuite journey today.',
  'Watch {productLabel} in action — 30 seconds that change everything.',
  'Your {industry} content deserves better. Discover GenieSuite now.',
  'Join thousands of {industry} teams creating with AI. Start free.',
  'From {name}\'s story to yours — get started with GenieSuite.',
  'Create cinematic content in 85+ languages. Try {productLabel} today.',
  'The future of {industry} content is here. Experience it yourself.',
  'See how {productLabel} powers {name}\'s content engine. Watch now.',
  'Don\'t just create content — create impact. Start with GenieSuite.',
  'One platform. Every format. Every language. Get started free.',
  'Transform your {industry} workflow in under 5 minutes. Try now.',
  'Like what {name} achieved? Your turn. GenieSuite awaits.',
  'See the full {productLabel} pipeline in action — request a demo.',
  'Content that connects. Languages that resonate. Start today.',
];

// ─── Voice Modulation ───────────────────────────────────────────────

const VOICE_MODULATION: Record<VoiceCharacter, {
  tonePrefix: string;
  humorLevel: 'none' | 'light' | 'moderate' | 'heavy';
  formality: 'formal' | 'conversational' | 'casual';
  emotionWeight: 'low' | 'medium' | 'high';
}> = {
  genie_narrator: { tonePrefix: '', humorLevel: 'light', formality: 'conversational', emotionWeight: 'medium' },
  studio_host: { tonePrefix: 'And here\'s the exciting part — ', humorLevel: 'moderate', formality: 'conversational', emotionWeight: 'medium' },
  professor: { tonePrefix: 'Research shows that ', humorLevel: 'none', formality: 'formal', emotionWeight: 'low' },
  creative_director: { tonePrefix: 'Imagine this: ', humorLevel: 'light', formality: 'conversational', emotionWeight: 'high' },
  news_anchor: { tonePrefix: 'Reports confirm that ', humorLevel: 'none', formality: 'formal', emotionWeight: 'low' },
  friendly_coach: { tonePrefix: 'Here\'s what I tell my teams — ', humorLevel: 'light', formality: 'conversational', emotionWeight: 'medium' },
  tech_enthusiast: { tonePrefix: 'This is incredible — ', humorLevel: 'light', formality: 'casual', emotionWeight: 'medium' },
  storyteller: { tonePrefix: 'Picture this: ', humorLevel: 'light', formality: 'conversational', emotionWeight: 'high' },
  comedian: { tonePrefix: 'Okay, real talk — ', humorLevel: 'heavy', formality: 'casual', emotionWeight: 'medium' },
  empathetic_guide: { tonePrefix: 'We understand, and ', humorLevel: 'none', formality: 'conversational', emotionWeight: 'high' },
  travel_host: { tonePrefix: 'Get ready for this — ', humorLevel: 'moderate', formality: 'casual', emotionWeight: 'medium' },
  data_analyst: { tonePrefix: 'The data reveals that ', humorLevel: 'none', formality: 'formal', emotionWeight: 'low' },
};

// ─── Duration Estimation ────────────────────────────────────────────

const FORMAT_DURATION_SEC: Record<string, number> = {
  short_clip_15s: 15,
  short_clip_30s: 30,
  mini_doc_60s: 60,
  voice_tip: 30,
  image_card: 10,
  carousel_slides: 45,
  audiogram: 30,
  social_card: 10,
  infographic: 15,
  journey_map_visual: 45,
  stat_highlight: 15,
  meme_style: 10,
  text_post: 20,
};

// ─── Product Label Helper ───────────────────────────────────────────

const PRODUCT_LABELS: Record<GenieProduct, string> = {
  cast: 'GenieCast',
  spark: 'GenieSpark',
  mind: 'GenieMind',
  deck: 'GenieDeck',
  vibe: 'GenieVibe',
  hub: 'GenieHub',
};

// ─── Main Script Generation ─────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

export function generateStructuredScript(brief: ScriptwriterBrief): StructuredContentScript {
  const industryLabel = brief.industry.replace(/_/g, ' ');
  const productLabel = PRODUCT_LABELS[brief.productFocus];
  const voiceMod = VOICE_MODULATION[brief.voiceCharacter];

  const vars: Record<string, string> = {
    name: brief.fictitiousName,
    industry: industryLabel,
    productLabel,
  };

  // 1. Hook
  const hookTemplates = HOOK_TEMPLATES[brief.archetype] || HOOK_TEMPLATES.product_showcase!;
  let hook = fillTemplate(pickRandom(hookTemplates), vars);
  if (voiceMod.humorLevel === 'heavy' && brief.tone === 'humorous') {
    hook = hook.replace(/\.$/, '') + ' (spoiler: it\'s not magic... okay, it\'s a little magic).';
  }

  // 2. Problem
  const problemTemplates = PROBLEM_LIBRARY[brief.industry] || PROBLEM_LIBRARY.education_edtech!;
  let problem = fillTemplate(pickRandom(problemTemplates), vars);
  problem = voiceMod.tonePrefix + problem;

  // 3. Transformation
  const transTemplates = TRANSFORMATION_TEMPLATES[brief.archetype] || TRANSFORMATION_TEMPLATES.product_showcase!;
  const transformation = fillTemplate(pickRandom(transTemplates), vars);

  // 4. Solution
  const solutionTemplates = SOLUTION_LIBRARY[brief.productFocus];
  const solution = fillTemplate(pickRandom(solutionTemplates), vars);

  // 5. CTA
  const cta = fillTemplate(pickRandom(CTA_TEMPLATES), vars);

  // Duration
  const estimatedDurationSec = FORMAT_DURATION_SEC[brief.archetype] || 30;

  return {
    hook,
    problem,
    transformation,
    solution,
    cta,
    fictitiousName: brief.fictitiousName,
    industry: brief.industry,
    productHighlight: brief.productFocus,
    estimatedDurationSec,
  };
}

/**
 * Pick a random fictitious business for the given industry.
 */
export function pickFictitiousBusiness(industry: IndustryVertical): { name: string; type: string } {
  const businesses = FICTITIOUS_BUSINESSES[industry] || FICTITIOUS_BUSINESSES.general;
  return pickRandom(businesses);
}

/**
 * Get all fictitious businesses (for display/preview).
 */
export function getAllFictitiousBusinesses(): Record<string, Array<{ name: string; type: string }>> {
  return { ...FICTITIOUS_BUSINESSES };
}

/**
 * Get voice modulation profile for a character.
 */
export function getVoiceModulation(character: VoiceCharacter) {
  return VOICE_MODULATION[character];
}
