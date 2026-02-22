/**
 * Capability Discovery Engine
 *
 * User-facing layer that makes all 42 chains, 50+ formats, and 100+ atomic steps
 * browsable, explorable, and understandable. This is HOW the user discovers
 * what they can build and sees the possibilities at each step of the flow.
 *
 * UX Flow Integration:
 * - Step 1 (Input): Show what you can CREATE from this input type
 * - Step 2 (Intent): Show matching chains + example outputs
 * - Step 3 (Format): Show all possible output formats with previews
 * - Step 4 (Enrichment): Show what data feeds the AI (visible prompt)
 * - Step 5 (Script): Show edit/transcreate/enhance options inline
 * - Step 6 (Style): Show style combinations per slide/scene
 * - Step 7 (Review): Show full pipeline visualization + alternatives
 * - Step 8 (Produce): Show real-time progress + derivatives being generated
 *
 * @see src/services/pipelineOrchestrator.ts — chain definitions
 * @see src/services/createFlowOrchestrator.ts — CREATE flow session
 * @see src/hooks/useCreateFlow.ts — React hook for wizard
 */

import type {
  ContentFormat,
  ContentIntent,
  InputType,
  PipelineChain,
  PipelineStep,
} from './pipelineOrchestrator';
import {
  PIPELINE_CHAINS,
  getAllAtomicSteps,
  getChainsForFormat,
  getChainRecommendation,
  getAllOutputFormats,
  getChainStats,
} from './pipelineOrchestrator';

// ─── Discovery Categories ───────────────────────────────────────────────────

export type DiscoveryCategory =
  | 'video_creation'
  | 'podcast_audio'
  | 'meeting_intelligence'
  | 'website_digital'
  | 'training_education'
  | 'marketing_social'
  | 'repurpose_remix'
  | 'business_docs'
  | 'live_recording';

export interface CategoryDefinition {
  id: DiscoveryCategory;
  label: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  chainIds: string[];
  exampleOutputs: string[];
  inputTypes: InputType[];
  /** Who benefits most from this category */
  bestFor: string[];
}

export const DISCOVERY_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'video_creation',
    label: 'Video Creation',
    tagline: 'From idea to published video in minutes',
    description: 'Create short videos, long-form content, cinematic presentations, and platform-optimized clips from any input.',
    icon: 'video',
    color: '#EF4444',
    chainIds: ['business_to_campaign', 'brand_to_video', 'quick_promo', 'long_form_production', 'transcreation_video', 'economy_aware', 'multilingual_campaign', 'ab_testing_variants'],
    exampleOutputs: ['15s TikTok promo', '2min explainer video', '30s Instagram Reel', 'YouTube Shorts', 'LinkedIn video ad', 'Facebook video post', '4K cinematic brand story', 'A/B tested video variants'],
    inputTypes: ['text', 'url', 'google_places', 'pdf', 'pptx', 'image'],
    bestFor: ['Marketers', 'Small businesses', 'Content creators', 'Agencies', 'E-commerce'],
  },
  {
    id: 'podcast_audio',
    label: 'Podcast & Audio',
    tagline: 'Record, create, or upload → full podcast empire',
    description: 'Upload audio or create from scratch. Get full podcast episodes with intro/outro, show notes, video versions, social clips, and landing pages.',
    icon: 'mic',
    color: '#8B5CF6',
    chainIds: ['audio_to_podcast', 'podcast_to_video_chain', 'podcast_from_scratch', 'podcast_multichannel', 'record_to_everywhere', 'episodic_series'],
    exampleOutputs: ['Full podcast episode with intro/outro', 'Video podcast with avatar', 'Audiogram for social', 'Show notes + transcript', 'Episode landing page', 'RSS feed for Apple/Spotify', 'Best moment clips', 'Multi-language episodes'],
    inputTypes: ['audio', 'recording', 'text', 'url', 'google_places'],
    bestFor: ['Podcasters', 'Thought leaders', 'Educators', 'Brands', 'Interviewers'],
  },
  {
    id: 'meeting_intelligence',
    label: 'Meeting Intelligence',
    tagline: 'Meeting → MoM, tasks, diagrams, PoC screens — auto-distributed',
    description: 'Upload meeting recordings. Get speaker-labeled transcripts, Minutes of Meeting, task assignments, architecture diagrams, business flows, wireframes, and auto-distribute to participants.',
    icon: 'users',
    color: '#3B82F6',
    chainIds: ['meeting_intelligence', 'tech_meeting_to_arch', 'live_to_everything'],
    exampleOutputs: ['Minutes of Meeting (MoM)', 'Task board (Jira/Linear format)', 'Architecture diagrams', 'Business process flows', 'Quick PoC wireframes', 'Follow-up email to participants', 'Decision summary infographic', 'Searchable transcript'],
    inputTypes: ['audio', 'video', 'recording'],
    bestFor: ['Product managers', 'Engineering teams', 'Business analysts', 'Executives', 'Project leads'],
  },
  {
    id: 'website_digital',
    label: 'Website & Digital',
    tagline: 'Full websites, landing pages, and digital experiences',
    description: 'Generate complete websites with hero banners, scroll animations, cards, CTAs, infographics, and interactive demos. Export as HTML/React/CMS-ready.',
    icon: 'globe',
    color: '#10B981',
    chainIds: ['website_package', 'landing_page_quick', 'hero_banner_only', 'interactive_demo_package'],
    exampleOutputs: ['Full landing page with hero banner', 'Product page with pricing', 'Interactive product demo', 'Multi-page microsite', 'Animated hero banner', 'Scroll-triggered animations', 'Feature cards', 'CTA sections'],
    inputTypes: ['text', 'url', 'google_places', 'pdf', 'pptx'],
    bestFor: ['Startups', 'Product teams', 'Agencies', 'E-commerce', 'SaaS companies'],
  },
  {
    id: 'training_education',
    label: 'Training & Education',
    tagline: 'Courses, manuals, kids books — with Pixar-style animation',
    description: 'Create training manuals with chapter-by-chapter content, each slide with a different style (Pixar, cinematic, whiteboard). Generate quizzes, animated characters, and kids book illustrations.',
    icon: 'graduation-cap',
    color: '#F59E0B',
    chainIds: ['training_manual', 'course_series', 'kids_book_animator', 'recording_to_course', 'screen_to_tutorial'],
    exampleOutputs: ['Chapter-by-chapter training manual', 'Slide-by-slide with Pixar style', 'Interactive quizzes per chapter', 'Animated character instructor', 'Kids book with illustrations', 'Motion infographics', 'Animated customer journey', 'SCORM e-learning module'],
    inputTypes: ['text', 'pdf', 'pptx', 'audio', 'video', 'recording'],
    bestFor: ['Teachers', 'Corporate trainers', 'Schools', 'HR teams', 'Course creators', 'Parents'],
  },
  {
    id: 'marketing_social',
    label: 'Marketing & Social',
    tagline: 'One piece of content → every platform, every format',
    description: 'Transform any content into platform-optimized social posts, email campaigns, newsletters, carousels, and A/B tested variants. Schedule and publish everywhere.',
    icon: 'share',
    color: '#EC4899',
    chainIds: ['blog_to_multimedia', 'newsletter_to_social', 'video_to_everything', 'ab_testing_variants', 'franchise_multi_location'],
    exampleOutputs: ['TikTok + Reels + Shorts (all ratios)', 'Social carousel posts', 'Email campaign with A/B subjects', 'Blog post from any content', 'Newsletter + social combo', 'Franchise location variants', 'Hashtag + caption per platform', 'Scheduled multi-platform publish'],
    inputTypes: ['text', 'url', 'video', 'audio', 'image', 'google_places'],
    bestFor: ['Social media managers', 'Marketing teams', 'Agencies', 'Franchises', 'Influencers'],
  },
  {
    id: 'repurpose_remix',
    label: 'Repurpose & Remix',
    tagline: 'Existing content → new formats, new life',
    description: 'Upload existing videos to re-edit, add testimonials, stitch clips. Extract best moments, generate teasers, thumbnails, and platform-specific shorts.',
    icon: 'refresh',
    color: '#06B6D4',
    chainIds: ['video_remix', 'testimonial_compilation', 'long_to_shorts', 'ugc_curation', 'event_recap_empire'],
    exampleOutputs: ['Re-edited video with new B-roll', 'Testimonial compilation reel', 'Best moments compilation', 'Platform-specific shorts', 'Event recap video', 'UGC curated compilation', 'Teaser/trailer', 'Multiple thumbnail variants'],
    inputTypes: ['video', 'audio', 'image'],
    bestFor: ['Content teams', 'Event organizers', 'Brands with existing content', 'Community managers'],
  },
  {
    id: 'business_docs',
    label: 'Business Documents',
    tagline: 'Whitepapers, case studies, investor decks, battle cards',
    description: 'Generate professional documents with data visualization, customer journey maps, competitive analysis, and presentation-ready formats.',
    icon: 'file-text',
    color: '#6366F1',
    chainIds: ['whitepaper_package', 'investor_deck', 'competitor_battlecard', 'smart_presentation'],
    exampleOutputs: ['Whitepaper PDF with charts', 'Investor pitch deck', 'Competitor battlecard', 'Case study with journey map', 'Data-driven infographic', 'Presentation with speaker notes', 'Google Slides / PPTX export', 'Executive summary'],
    inputTypes: ['text', 'url', 'google_places', 'pdf', 'pptx', 'docx'],
    bestFor: ['Founders', 'Sales teams', 'Analysts', 'Consultants', 'Product marketers'],
  },
  {
    id: 'live_recording',
    label: 'Live & Webcast',
    tagline: 'Live sessions → polished replays, demos, and courses',
    description: 'Process live recordings and webcasts into on-demand replays with chapters, product demo highlights, tutorial series, and follow-up campaigns.',
    icon: 'radio',
    color: '#F97316',
    chainIds: ['webcast_product_demo', 'webinar_replay', 'live_to_everything', 'script_edit_regenerate'],
    exampleOutputs: ['Chaptered webinar replay', 'Product demo highlight reel', 'Feature-specific demo clips', 'On-demand course from live', 'Follow-up email campaign', 'Interactive demo page', 'Tutorial with chapters', 'Searchable indexed transcript'],
    inputTypes: ['video', 'audio', 'recording'],
    bestFor: ['Sales engineers', 'Product teams', 'Educators', 'Event hosts', 'Developer advocates'],
  },
];

// ─── What You Get — Output Previews ─────────────────────────────────────────

export interface OutputPreview {
  format: ContentFormat;
  label: string;
  description: string;
  icon: string;
  /** Sample dimensions / specs */
  specs: string;
  /** Platforms where this output works */
  platforms: string[];
  /** File types the user receives */
  deliverables: string[];
  /** Which chains produce this output */
  producedBy: string[];
}

export const OUTPUT_PREVIEWS: Record<string, OutputPreview> = {
  short_video: {
    format: 'short_video',
    label: 'Short Video',
    description: '15-60 second social clips optimized per platform',
    icon: 'play-circle',
    specs: '9:16 (TikTok), 1:1 (IG), 16:9 (YouTube), 4:5 (FB)',
    platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'Facebook', 'LinkedIn'],
    deliverables: ['MP4 video', 'SRT captions', 'Thumbnail PNG', 'Social caption'],
    producedBy: ['business_to_campaign', 'quick_promo', 'brand_to_video', 'video_remix', 'long_to_shorts'],
  },
  long_video: {
    format: 'long_video',
    label: 'Long-Form Video',
    description: '2-10 minute explainers, tutorials, or brand stories',
    icon: 'film',
    specs: '16:9 (1080p or 4K), chaptered',
    platforms: ['YouTube', 'Vimeo', 'Website embed', 'LMS'],
    deliverables: ['MP4 video', 'SRT captions', 'Chapter markers', 'Thumbnail', 'Blog transcript'],
    producedBy: ['long_form_production', 'business_to_campaign', 'transcreation_video'],
  },
  podcast_episode: {
    format: 'podcast_episode',
    label: 'Podcast Episode',
    description: 'Full episode with branded intro/outro, music, and show notes',
    icon: 'headphones',
    specs: 'MP3/WAV, 128-320kbps, mono/stereo',
    platforms: ['Apple Podcasts', 'Spotify', 'Google Podcasts', 'RSS', 'Website'],
    deliverables: ['MP3 audio', 'Show notes', 'Transcript', 'RSS entry', 'Audiogram', 'Episode art'],
    producedBy: ['audio_to_podcast', 'podcast_from_scratch', 'podcast_multichannel'],
  },
  video_from_podcast: {
    format: 'video_from_podcast',
    label: 'Video from Podcast',
    description: 'Podcast audio converted to video with avatar, visuals, and B-roll',
    icon: 'monitor',
    specs: '16:9 or 9:16, with speaker avatars',
    platforms: ['YouTube', 'LinkedIn', 'Website', 'Social media'],
    deliverables: ['MP4 video', 'Social clips', 'Thumbnails', 'Captions'],
    producedBy: ['podcast_to_video_chain', 'podcast_from_scratch'],
  },
  meeting_recap: {
    format: 'meeting_recap',
    label: 'Meeting Intelligence Package',
    description: 'Complete meeting summary with MoM, tasks, diagrams, and follow-up',
    icon: 'clipboard',
    specs: 'PDF + JSON + email',
    platforms: ['Email', 'Slack', 'Jira', 'Linear', 'Trello', 'Notion'],
    deliverables: ['Minutes of Meeting PDF', 'Task board export', 'Speaker transcript', 'Decision summary', 'Follow-up email'],
    producedBy: ['meeting_intelligence', 'live_to_everything'],
  },
  architecture_diagram: {
    format: 'architecture_diagram',
    label: 'Architecture Diagram',
    description: 'System design, data flow, sequence diagrams from technical discussions',
    icon: 'git-branch',
    specs: 'SVG + PNG + Mermaid/PlantUML source',
    platforms: ['Confluence', 'Notion', 'GitHub', 'Documentation'],
    deliverables: ['SVG diagrams', 'Mermaid source', 'Design document', 'Presentation slides'],
    producedBy: ['tech_meeting_to_arch', 'meeting_intelligence'],
  },
  meeting_poc: {
    format: 'meeting_poc',
    label: 'Quick PoC / Wireframes',
    description: 'Quick wireframes and sample screens from meeting decisions',
    icon: 'layout',
    specs: 'PNG mockups + Figma-compatible JSON',
    platforms: ['Email to host', 'Figma', 'Slack', 'Presentation'],
    deliverables: ['Screen mockups', 'Wireframes', 'User flow diagram', 'Requirements doc'],
    producedBy: ['meeting_intelligence', 'tech_meeting_to_arch'],
  },
  training_manual: {
    format: 'training_manual',
    label: 'Training Manual',
    description: 'Full manual with chapters, Pixar/cinematic slides, quizzes, and assessments',
    icon: 'book-open',
    specs: 'PDF + interactive web + SCORM',
    platforms: ['LMS', 'Website', 'Print', 'Download'],
    deliverables: ['PDF manual', 'Interactive web version', 'Quiz bank', 'Video per chapter', 'Progress tracking'],
    producedBy: ['training_manual', 'course_series', 'recording_to_course'],
  },
  kids_book: {
    format: 'kids_book',
    label: 'Kids Book',
    description: 'Illustrated kids book with Pixar-style animation and narration',
    icon: 'star',
    specs: 'PDF + animated video + interactive',
    platforms: ['Print', 'Tablet', 'Web', 'YouTube Kids'],
    deliverables: ['Illustrated PDF', 'Animated video', 'Read-along audio', 'Interactive pages'],
    producedBy: ['kids_book_animator'],
  },
  website_package: {
    format: 'website_package',
    label: 'Website Package',
    description: 'Full website with hero, sections, cards, scroll animations, and CTAs',
    icon: 'globe',
    specs: 'HTML/CSS/JS or React components',
    platforms: ['Vercel', 'Netlify', 'WordPress', 'Webflow', 'Custom CMS'],
    deliverables: ['HTML/CSS/JS bundle', 'React components', 'Hero banner assets', 'SEO metadata', 'Analytics setup'],
    producedBy: ['website_package', 'landing_page_quick'],
  },
  landing_page: {
    format: 'landing_page',
    label: 'Landing Page',
    description: 'Single landing page with hero, features, testimonials, and CTA',
    icon: 'monitor',
    specs: 'Responsive HTML or React',
    platforms: ['Any hosting', 'CMS', 'Webflow', 'Framer'],
    deliverables: ['HTML page', 'Hero banner', 'Section components', 'CTA buttons', 'OG tags'],
    producedBy: ['landing_page_quick', 'website_package', 'podcast_from_scratch'],
  },
  webcast_replay: {
    format: 'webcast_replay',
    label: 'Webcast Replay',
    description: 'Polished on-demand replay with chapters, demo highlights, and clips',
    icon: 'tv',
    specs: '16:9, chaptered, with transcript overlay',
    platforms: ['Website', 'YouTube', 'LMS', 'Salesforce'],
    deliverables: ['Chaptered video', 'Demo highlight clips', 'Searchable transcript', 'Follow-up email'],
    producedBy: ['webcast_product_demo', 'webinar_replay'],
  },
  business_flow: {
    format: 'business_flow',
    label: 'Business Flow Diagram',
    description: 'Swimlane, BPMN, decision trees from business discussions',
    icon: 'git-merge',
    specs: 'SVG + PNG + BPMN XML',
    platforms: ['Confluence', 'Notion', 'PowerPoint', 'Documentation'],
    deliverables: ['Flow diagrams', 'Process documentation', 'Decision matrix', 'Stakeholder map'],
    producedBy: ['meeting_intelligence'],
  },
};

// ─── Input-to-Possibilities Matrix ──────────────────────────────────────────

export interface InputPossibility {
  inputType: InputType;
  label: string;
  description: string;
  icon: string;
  /** Categories available from this input */
  availableCategories: DiscoveryCategory[];
  /** Direct chain recommendations */
  topChains: string[];
  /** Example user prompts */
  examplePrompts: string[];
}

export const INPUT_POSSIBILITIES: InputPossibility[] = [
  {
    inputType: 'text',
    label: 'Text / Topic / Script',
    description: 'Type a topic, paste a script, or describe what you want',
    icon: 'type',
    availableCategories: ['video_creation', 'podcast_audio', 'website_digital', 'training_education', 'marketing_social', 'business_docs'],
    topChains: ['podcast_from_scratch', 'business_to_campaign', 'website_package', 'training_manual', 'blog_to_multimedia'],
    examplePrompts: ['Create a podcast about AI in healthcare', 'Make a training manual for onboarding', 'Build a landing page for my SaaS product'],
  },
  {
    inputType: 'audio',
    label: 'Upload Audio',
    description: 'Upload podcast recording, meeting audio, interview, or voice memo',
    icon: 'upload',
    availableCategories: ['podcast_audio', 'meeting_intelligence', 'repurpose_remix', 'training_education', 'marketing_social'],
    topChains: ['audio_to_podcast', 'meeting_intelligence', 'live_to_everything', 'recording_to_course'],
    examplePrompts: ['Turn this recording into a full podcast episode', 'Extract MoM and tasks from this meeting', 'Create a course from this lecture recording'],
  },
  {
    inputType: 'video',
    label: 'Upload Video',
    description: 'Upload existing video, meeting recording, webcast, or screen recording',
    icon: 'video',
    availableCategories: ['repurpose_remix', 'meeting_intelligence', 'live_recording', 'podcast_audio', 'marketing_social', 'training_education'],
    topChains: ['video_remix', 'meeting_intelligence', 'webcast_product_demo', 'long_to_shorts', 'video_to_everything'],
    examplePrompts: ['Re-edit this video with new testimonials', 'Extract architecture diagrams from this tech meeting', 'Create shorts from this long video'],
  },
  {
    inputType: 'recording',
    label: 'Record Live',
    description: 'Record directly — mic for podcast, camera for video, screen for tutorial',
    icon: 'circle',
    availableCategories: ['podcast_audio', 'meeting_intelligence', 'live_recording', 'training_education', 'repurpose_remix'],
    topChains: ['live_to_everything', 'audio_to_podcast', 'recording_to_course', 'screen_to_tutorial'],
    examplePrompts: ['Record a podcast episode', 'Record this meeting for MoM', 'Record a screen tutorial'],
  },
  {
    inputType: 'google_places',
    label: 'Business Name + Location',
    description: 'Just type your business name — we pull live data from Google',
    icon: 'map-pin',
    availableCategories: ['video_creation', 'website_digital', 'marketing_social', 'business_docs'],
    topChains: ['brand_to_video', 'website_package', 'franchise_multi_location', 'competitor_battlecard'],
    examplePrompts: ['Create a promo video for my restaurant', 'Build a website for my dental clinic', 'Make a competitor comparison for my coffee shop'],
  },
  {
    inputType: 'url',
    label: 'Website URL',
    description: 'Paste any URL — we crawl and extract content',
    icon: 'link',
    availableCategories: ['video_creation', 'website_digital', 'marketing_social', 'business_docs'],
    topChains: ['brand_to_video', 'blog_to_multimedia', 'website_package'],
    examplePrompts: ['Turn this blog post into a video + social campaign', 'Rebuild this website with better design', 'Create a presentation from this article'],
  },
  {
    inputType: 'pdf',
    label: 'Upload PDF',
    description: 'Upload documents — we extract text, tables, and structure',
    icon: 'file',
    availableCategories: ['video_creation', 'training_education', 'business_docs', 'marketing_social'],
    topChains: ['training_manual', 'smart_presentation', 'blog_to_multimedia', 'whitepaper_package'],
    examplePrompts: ['Turn this PDF into a training course', 'Create a presentation from this whitepaper', 'Make a video summary of this report'],
  },
  {
    inputType: 'pptx',
    label: 'Upload PowerPoint',
    description: 'Upload PPTX/Google Slides — we enhance or convert to video',
    icon: 'presentation',
    availableCategories: ['video_creation', 'training_education', 'business_docs'],
    topChains: ['smart_presentation', 'training_manual', 'brand_to_video'],
    examplePrompts: ['Turn these slides into a cinematic video', 'Add Pixar-style animation to each slide', 'Create a narrated training from this deck'],
  },
  {
    inputType: 'image',
    label: 'Upload Image',
    description: 'Upload images — OCR extract text, generate video from visual content',
    icon: 'image',
    availableCategories: ['video_creation', 'marketing_social', 'repurpose_remix'],
    topChains: ['brand_to_video', 'blog_to_multimedia'],
    examplePrompts: ['Create a video from these product photos', 'Turn this infographic into an animated video', 'Generate social posts from this image'],
  },
];

// ─── Step-by-Step UX Flow Guide ─────────────────────────────────────────────

export interface FlowStep {
  step: number;
  id: string;
  label: string;
  description: string;
  /** What the user SEES at this step */
  userSees: string[];
  /** What the user DOES at this step */
  userDoes: string[];
  /** What happens behind the scenes */
  behindScenes: string[];
  /** Controls available at this step */
  controls: string[];
}

export const CREATE_FLOW_STEPS: FlowStep[] = [
  {
    step: 1,
    id: 'input',
    label: 'Start — What do you have?',
    description: 'User picks their starting point: type text, upload file, record live, or enter business name',
    userSees: [
      'Input type picker: Text, Audio, Video, Record, Business Name, URL, PDF, PPTX, Image',
      'For each input type: what you can create from it (category cards)',
      'Example prompts and recent projects',
      'Quick-start templates by industry',
    ],
    userDoes: [
      'Select input type',
      'Provide content (type, upload, or record)',
      'Optionally enter business name for auto-enrichment',
    ],
    behindScenes: [
      'Google Places enrichment triggered if business name provided',
      'Document extraction if file uploaded',
      'Audio transcription if audio/video uploaded',
      'Input type determines available chains and categories',
    ],
    controls: ['Input type selector', 'File upload / text area / record button', 'Business name + location field'],
  },
  {
    step: 2,
    id: 'intent',
    label: 'Purpose — What do you want to create?',
    description: 'User picks their intent. System shows matching categories with example outputs.',
    userSees: [
      '9 category cards (Video, Podcast, Meeting, Website, Training, Marketing, Remix, Docs, Live)',
      'Each card shows: what you get, example outputs, platforms supported',
      'AI recommendation highlighted based on input type',
      'Chain comparison: side-by-side what each chain produces',
      '"See all possibilities" expandable gallery',
    ],
    userDoes: [
      'Browse categories, see example outputs',
      'Select a category or specific chain',
      'Can switch between recommended and alternatives',
    ],
    behindScenes: [
      'selectChain() intent×format matrix runs',
      'getChainRecommendation() returns best + alternatives',
      'Output format preview thumbnails loaded',
    ],
    controls: ['Category cards', 'Chain selector', 'Output preview gallery', 'Alternative chains toggle'],
  },
  {
    step: 3,
    id: 'format',
    label: 'Output — What formats do you want?',
    description: 'User sees all output formats the selected chain produces and can toggle additional formats.',
    userSees: [
      'Primary output format (e.g., Full Podcast Episode)',
      'Included derivatives: audiogram, blog post, social clips, landing page',
      'Optional add-ons: video version, transcreation, email campaign',
      'Format specs: dimensions, file types, platform compatibility',
      'Estimated credits and duration per format',
    ],
    userDoes: [
      'Confirm primary format',
      'Toggle optional derivative formats on/off',
      'Select target platforms (TikTok, YouTube, Instagram, etc.)',
    ],
    behindScenes: [
      'Pipeline steps filtered based on selected formats',
      'Credit cost calculated',
      'Duration estimated',
    ],
    controls: ['Format checkboxes', 'Platform selector', 'Credit estimator', 'Duration preview'],
  },
  {
    step: 4,
    id: 'enrichment',
    label: 'Enrichment — What feeds the AI?',
    description: 'User sees exactly what data enriches their content. Toggle individual enrichment fields.',
    userSees: [
      'Enrichment sources visible: Google Places, Brand Intelligence, Economy, Competitive, Regional',
      'Per-field toggle: "Use this data?" for each enrichment field',
      'Live prompt preview: exactly what the AI will receive',
      'Enrichment score (0-100): how much data is feeding the AI',
      'Data freshness indicators',
    ],
    userDoes: [
      'Review enrichment data (reviews, hours, competitors)',
      'Toggle individual fields on/off',
      'See live prompt preview update in real-time',
      'Add manual context or override AI suggestions',
    ],
    behindScenes: [
      'Google Places data fetched and parsed',
      'Brand profile generated',
      'Economy archetype matched',
      'Competitive analysis run',
      'Prompt assembled from all visible fields',
    ],
    controls: ['Enrichment field toggles', 'Prompt preview panel', 'Manual override text area', 'Enrichment score'],
  },
  {
    step: 5,
    id: 'script',
    label: 'Script — Review, edit, transcreate',
    description: 'AI-generated script with inline editing at every field and statement level.',
    userSees: [
      'Full generated script with sections',
      'Per-statement inline controls: accept, reject, update, enhance, analyze, transcreate, simplify, expand, shorten',
      'Language I/O panel: Input (1) → Output (max 5) with default English',
      'Transcreation preview: cultural adaptation per region',
      'Undo/redo per field (50 levels)',
      'Session auto-save indicator',
    ],
    userDoes: [
      'Read through script section by section',
      'Inline edit any statement: accept/reject/enhance/transcreate',
      'Set output languages (max 5)',
      'Toggle transcreation vs literal translation per language',
      'Manual edits anywhere — type directly',
      'Rewind to any previous version of any field',
    ],
    behindScenes: [
      'Script generated from enriched prompt',
      'Transcreation engine adapts per region',
      'Statement-level diff tracking',
      'Auto-save every 2 seconds to localStorage',
      'Session checkpoint for resume',
    ],
    controls: ['Inline edit toolbar per statement', 'Language I/O panel', 'Transcreation toggle', 'Undo/redo', 'Version history'],
  },
  {
    step: 6,
    id: 'style',
    label: 'Style — How should it look and sound?',
    description: 'Choose visual style, voice, music, and per-scene customization.',
    userSees: [
      'Style picker: Pixar 3D, Cinematic, Whiteboard, Infographic, Anime, Watercolor, etc.',
      'Per-slide/scene style override (different style per slide)',
      'Voice picker with preview (regional accents, emotion)',
      'Music mood selector with preview',
      'Scene-by-scene timeline with thumbnail previews',
      'Avatar/character options',
    ],
    userDoes: [
      'Pick global style (applies to all scenes)',
      'Override style per individual slide/scene',
      'Preview voice options, select preferred voice',
      'Select background music mood',
      'Customize avatar appearance and wardrobe',
    ],
    behindScenes: [
      'Style configurations mapped to rendering engine',
      'Regional voice routing (4-zone provider selection)',
      'Music generation triggered',
      'Avatar wardrobe adapted to region',
    ],
    controls: ['Style gallery', 'Per-scene style override', 'Voice preview + selector', 'Music preview', 'Avatar customizer'],
  },
  {
    step: 7,
    id: 'review',
    label: 'Review — See the full pipeline before producing',
    description: 'Complete pipeline visualization showing every step, estimated time, credits, and alternatives.',
    userSees: [
      'Full pipeline flow diagram: every step visualized',
      'Step-by-step breakdown with time + credits per step',
      'Total estimated time and credit cost',
      'Alternative chains: "You could also try..."',
      'All output deliverables listed',
      'Session summary: input → intent → format → enrichment → script → style',
    ],
    userDoes: [
      'Review complete pipeline',
      'Toggle optional steps on/off',
      'Switch to alternative chain if desired',
      'Confirm and start production',
    ],
    behindScenes: [
      'buildOrchestrationPlan() generates final plan',
      'Steps filtered by tier and user choices',
      'Credit pre-authorization',
      'Session checkpoint saved',
    ],
    controls: ['Pipeline flow diagram', 'Step toggles', 'Alternative chain switcher', 'Confirm + produce button'],
  },
  {
    step: 8,
    id: 'produce',
    label: 'Produce — Watch it come to life',
    description: 'Real-time production progress with live previews, pause/resume, and derivative tracking.',
    userSees: [
      'Step-by-step progress: current step highlighted with live status',
      'Live preview: intermediate outputs shown as they generate',
      'Derivative tracker: all outputs being generated in parallel',
      'Estimated time remaining per step',
      'Checkpoint indicator: "safe to close, you can resume anytime"',
      'Quality score updating in real-time',
    ],
    userDoes: [
      'Watch production progress',
      'Pause/resume at any point (no restart needed)',
      'Preview intermediate outputs as they arrive',
      'Download individual outputs as they complete',
      'Share/publish outputs directly from here',
    ],
    behindScenes: [
      'Pipeline steps executing via edge functions',
      'Checkpoints saved after each step completion',
      'Parallel processing for independent steps (TTS + video)',
      'Quality checks running continuously',
      'Platform adaptation happening in background',
    ],
    controls: ['Progress tracker', 'Pause/resume button', 'Preview panel', 'Download per output', 'Publish buttons'],
  },
];

// ─── Chain Gallery Cards ────────────────────────────────────────────────────

export interface ChainGalleryCard {
  chainId: string;
  label: string;
  tagline: string;
  category: DiscoveryCategory;
  /** What the user starts with */
  inputExample: string;
  /** What the user gets (3-5 key outputs) */
  outputHighlights: string[];
  /** Number of AI pipelines chained */
  pipelineCount: number;
  /** Visual badge */
  badge?: 'popular' | 'new' | 'pro' | 'enterprise' | 'free';
  /** Use case examples */
  useCases: string[];
}

export const CHAIN_GALLERY: ChainGalleryCard[] = [
  // Video Creation
  { chainId: 'quick_promo', label: 'Quick Promo Video', tagline: 'Business name → published video in 2 min', category: 'video_creation', inputExample: 'Type: "Joe\'s Pizza, Brooklyn"', outputHighlights: ['30s promo video', 'Auto-captions', 'Social-ready'], pipelineCount: 6, badge: 'free', useCases: ['Small business owner', 'Quick social post', 'First-time user'] },
  { chainId: 'brand_to_video', label: 'Brand Intelligence Video', tagline: 'Google Places data → A/B tested campaign', category: 'video_creation', inputExample: 'Business name + location', outputHighlights: ['Brand-aware video', 'Competitor-informed', 'Viral score', 'Multi-thumbnail'], pipelineCount: 11, badge: 'popular', useCases: ['Marketing team', 'Agency', 'Brand campaign'] },
  { chainId: 'business_to_campaign', label: 'Global Campaign', tagline: 'One business → campaign across 76 regions', category: 'video_creation', inputExample: 'Business name + target regions', outputHighlights: ['Transcreated videos', 'Regional avatars', 'Cultural adaptation', 'Multi-language'], pipelineCount: 15, badge: 'pro', useCases: ['Global brand', 'Multi-market launch', 'Franchise'] },
  { chainId: 'long_form_production', label: 'Long-Form Production', tagline: 'Script → chunked parallel production → teasers + shorts', category: 'video_creation', inputExample: 'Long script or topic', outputHighlights: ['Long video (chaptered)', 'Teaser trailer', 'Best moments', 'Platform shorts', 'Multiple thumbnails'], pipelineCount: 17, badge: 'pro', useCases: ['Documentary', 'Course video', 'Product deep-dive'] },
  { chainId: 'multilingual_campaign', label: 'Multilingual Campaign', tagline: 'One script → N languages simultaneously', category: 'video_creation', inputExample: 'Script + target languages', outputHighlights: ['N language versions', 'Cultural adaptation per region', 'Avatar wardrobe per culture', 'Lip-sync per language'], pipelineCount: 15, badge: 'pro', useCases: ['Global launch', 'Multi-market campaign'] },

  // Podcast & Audio
  { chainId: 'audio_to_podcast', label: 'Audio → Full Podcast', tagline: 'Upload recording → polished episode with everything', category: 'podcast_audio', inputExample: 'Upload MP3/WAV recording', outputHighlights: ['Full episode + intro/outro', 'Show notes + transcript', 'Audiogram for social', 'Blog post', 'RSS feed'], pipelineCount: 18, badge: 'popular', useCases: ['Podcaster', 'Interview host', 'Thought leader'] },
  { chainId: 'podcast_to_video_chain', label: 'Podcast → Video', tagline: 'Audio podcast → video with avatar + visuals', category: 'podcast_audio', inputExample: 'Podcast audio file', outputHighlights: ['Video podcast', 'Speaking avatar', 'Social clips', 'Episode landing page'], pipelineCount: 19, badge: 'pro', useCases: ['YouTube podcaster', 'Video-first creator'] },
  { chainId: 'podcast_from_scratch', label: 'Create Podcast from Topic', tagline: 'Just type a topic → full episode + video + website', category: 'podcast_audio', inputExample: 'Type: "AI in Healthcare trends 2026"', outputHighlights: ['AI-narrated episode', 'Video version', 'Landing page', 'Show notes', 'Social clips', 'RSS feed'], pipelineCount: 26, badge: 'new', useCases: ['Content creator', 'Brand podcast', 'Educator'] },
  { chainId: 'podcast_multichannel', label: 'Podcast Empire', tagline: 'One recording → podcast + video + blog + translated', category: 'podcast_audio', inputExample: 'Recording + target languages', outputHighlights: ['Podcast + video', 'Blog from transcript', 'Multi-language dub', 'Social clips', 'Audiogram'], pipelineCount: 14, badge: 'pro', useCases: ['Multi-format creator', 'Global podcast'] },
  { chainId: 'record_to_everywhere', label: 'Record → Everywhere', tagline: 'One recording → every format, every platform', category: 'podcast_audio', inputExample: 'Record directly in app', outputHighlights: ['Podcast', 'Video', 'Blog', 'Social clips', 'Audiogram'], pipelineCount: 12, useCases: ['Quick content creation', 'Repurpose interview'] },
  { chainId: 'episodic_series', label: 'Episodic Series', tagline: 'Content → branded episodic series with teasers', category: 'podcast_audio', inputExample: 'Topic or content library', outputHighlights: ['Episode series', 'Consistent branding', 'Next-episode teasers', 'Series RSS', 'Theme music'], pipelineCount: 16, badge: 'pro', useCases: ['Series creator', 'Course producer'] },

  // Meeting Intelligence
  { chainId: 'meeting_intelligence', label: 'Meeting Intelligence', tagline: 'Recording → MoM + tasks + diagrams + PoC → distributed', category: 'meeting_intelligence', inputExample: 'Upload meeting recording', outputHighlights: ['Minutes of Meeting', 'Task board (Jira format)', 'Architecture diagrams', 'PoC wireframes', 'Follow-up email'], pipelineCount: 16, badge: 'new', useCases: ['Product manager', 'Engineering lead', 'Business analyst'] },
  { chainId: 'tech_meeting_to_arch', label: 'Tech Meeting → Architecture', tagline: 'Technical discussion → system design docs + diagrams', category: 'meeting_intelligence', inputExample: 'Upload technical meeting recording', outputHighlights: ['System architecture diagrams', 'Data flow diagrams', 'Technical design doc', 'PoC screens', 'Architecture presentation'], pipelineCount: 15, badge: 'pro', useCases: ['Software architect', 'CTO', 'Tech lead'] },
  { chainId: 'live_to_everything', label: 'Live → Everything', tagline: 'Live recording → podcast + video + MoM + blog + social', category: 'meeting_intelligence', inputExample: 'Live recording (any format)', outputHighlights: ['Podcast episode', 'Video version', 'Meeting recap', 'Blog post', 'Social clips', 'Edit/rewind/resume'], pipelineCount: 21, badge: 'pro', useCases: ['All-in-one processor', 'Event recording'] },

  // Website & Digital
  { chainId: 'website_package', label: 'Full Website Package', tagline: 'Business data → complete website with animations', category: 'website_digital', inputExample: 'Business name or content', outputHighlights: ['Hero banner', 'Feature sections', 'Scroll animations', 'Cards + CTAs', 'Infographic', 'SEO-ready'], pipelineCount: 15, badge: 'pro', useCases: ['Startup launch', 'Product page', 'Agency client'] },
  { chainId: 'landing_page_quick', label: 'Quick Landing Page', tagline: 'Content → single landing page in minutes', category: 'website_digital', inputExample: 'Product description or URL', outputHighlights: ['Hero + sections + CTA', 'Mobile responsive', 'SEO metadata'], pipelineCount: 8, badge: 'popular', useCases: ['Product launch', 'Event page', 'Lead capture'] },
  { chainId: 'interactive_demo_package', label: 'Interactive Demo', tagline: 'Product → interactive demo + product page + hero video', category: 'website_digital', inputExample: 'Product data or screenshots', outputHighlights: ['Clickable demo', 'Product page', 'Hero video', 'Feature cards'], pipelineCount: 11, badge: 'pro', useCases: ['SaaS demo', 'Product showcase'] },

  // Training & Education
  { chainId: 'training_manual', label: 'Training Manual', tagline: 'Content → chapters + Pixar slides + quizzes + video', category: 'training_education', inputExample: 'Training content or topic', outputHighlights: ['Chapter-by-chapter manual', 'Pixar/cinematic slides', 'Animated characters', 'Quizzes per chapter', 'Motion infographics'], pipelineCount: 13, badge: 'new', useCases: ['Corporate training', 'Onboarding', 'Compliance'] },
  { chainId: 'kids_book_animator', label: 'Kids Book Animator', tagline: 'Story → illustrated book with Pixar animation + narration', category: 'training_education', inputExample: 'Children\'s story text', outputHighlights: ['Colorful illustrations', 'Pixar-style animation', 'Child-friendly narration', 'Read-along captions'], pipelineCount: 13, badge: 'new', useCases: ['Parents', 'Teachers', 'Children\'s authors'] },
  { chainId: 'course_series', label: 'Course Series', tagline: 'Curriculum → multi-episode course + assessments', category: 'training_education', inputExample: 'Course outline or content', outputHighlights: ['Episode series', 'Animated diagrams', 'Per-module quizzes', 'Companion manual', 'LMS-ready'], pipelineCount: 13, badge: 'pro', useCases: ['Online educator', 'University', 'Training company'] },
  { chainId: 'recording_to_course', label: 'Recording → Course', tagline: 'Raw recording → chaptered course with quizzes', category: 'training_education', inputExample: 'Lecture or workshop recording', outputHighlights: ['Auto-chaptered', 'Slides per chapter', 'Animated characters', 'Quizzes', 'Training manual PDF'], pipelineCount: 12, useCases: ['Professor', 'Workshop instructor'] },
  { chainId: 'screen_to_tutorial', label: 'Screen → Tutorial', tagline: 'Screen recording → polished tutorial with steps', category: 'training_education', inputExample: 'Screen recording', outputHighlights: ['Chaptered tutorial', 'Clean narration', 'Steps infographic', 'Quick tip clips'], pipelineCount: 13, useCases: ['Developer advocate', 'Product trainer'] },

  // Marketing & Social
  { chainId: 'blog_to_multimedia', label: 'Blog → Multimedia', tagline: 'Blog post → video + podcast + social + email', category: 'marketing_social', inputExample: 'Blog post URL or text', outputHighlights: ['Video version', 'Podcast version', 'Social carousel', 'Infographic', 'Email newsletter'], pipelineCount: 15, badge: 'popular', useCases: ['Content marketer', 'Blog repurposing'] },
  { chainId: 'newsletter_to_social', label: 'Newsletter → Social', tagline: 'Newsletter → social videos + carousel + email campaign', category: 'marketing_social', inputExample: 'Newsletter content', outputHighlights: ['Social videos', 'Carousel posts', 'Audiogram', 'Email campaign', 'Scheduled publish'], pipelineCount: 13, useCases: ['Email marketer', 'Social media manager'] },
  { chainId: 'video_to_everything', label: 'Video → Everything', tagline: 'One video → shorts + teasers + blog + landing page', category: 'marketing_social', inputExample: 'Any video file', outputHighlights: ['Shorts for every platform', 'Teaser trailer', 'Blog post', 'Landing page', 'Infographic', 'Audiogram'], pipelineCount: 19, badge: 'enterprise', useCases: ['Content empire builder'] },
  { chainId: 'franchise_multi_location', label: 'Franchise Multi-Location', tagline: 'Template → N locations with local Google Places data', category: 'marketing_social', inputExample: 'Brand template + locations', outputHighlights: ['Per-location video', 'Local landing pages', 'Local SEO', 'Regional adaptation'], pipelineCount: 14, badge: 'enterprise', useCases: ['Franchise owner', 'Multi-location brand'] },

  // Repurpose & Remix
  { chainId: 'video_remix', label: 'Video Remix', tagline: 'Existing video → re-edit + testimonials + B-roll', category: 'repurpose_remix', inputExample: 'Upload existing video', outputHighlights: ['Re-edited video', 'Added testimonials', 'B-roll injected', 'Platform clips', 'Teaser'], pipelineCount: 12, badge: 'popular', useCases: ['Content refresh', 'Version 2.0'] },
  { chainId: 'testimonial_compilation', label: 'Testimonial Compilation', tagline: 'Reviews/videos → compelling testimonial reel', category: 'repurpose_remix', inputExample: 'Customer reviews or video clips', outputHighlights: ['Testimonial video', 'Highlight reel', 'Social clips'], pipelineCount: 9, useCases: ['Marketing team', 'Sales enablement'] },
  { chainId: 'long_to_shorts', label: 'Long → Shorts', tagline: 'Long video → AI-extracted best moments for social', category: 'repurpose_remix', inputExample: 'Long video file', outputHighlights: ['Best moment clips', 'Viral score per clip', 'Captions', 'Thumbnails'], pipelineCount: 8, badge: 'popular', useCases: ['YouTuber', 'Content repurposer'] },
  { chainId: 'ugc_curation', label: 'UGC Curation', tagline: 'User clips → branded compilation', category: 'repurpose_remix', inputExample: 'Multiple user-generated clips', outputHighlights: ['Curated compilation', 'Branded intro/outro', 'Best moments', 'Watermarked'], pipelineCount: 13, useCases: ['Community manager', 'Brand ambassador program'] },
  { chainId: 'event_recap_empire', label: 'Event Recap', tagline: 'Event video → recap + highlights + social + blog', category: 'repurpose_remix', inputExample: 'Event recording', outputHighlights: ['Recap video', 'Highlight reel', 'Social clips', 'Thank-you email', 'Stats infographic'], pipelineCount: 16, useCases: ['Event organizer', 'Conference team'] },

  // Business Documents
  { chainId: 'investor_deck', label: 'Investor Deck', tagline: 'Business data → pitch deck + video demo', category: 'business_docs', inputExample: 'Business name or pitch content', outputHighlights: ['Pitch deck', 'Demo video', 'Speaker notes', 'Google Slides export'], pipelineCount: 8, badge: 'popular', useCases: ['Founder', 'Fundraising'] },
  { chainId: 'whitepaper_package', label: 'Whitepaper Package', tagline: 'Research → whitepaper + infographic + journey map', category: 'business_docs', inputExample: 'Research data or topic', outputHighlights: ['Whitepaper PDF', 'Data infographic', 'Customer journey', 'Presentation'], pipelineCount: 9, badge: 'pro', useCases: ['Analyst', 'Content marketer'] },
  { chainId: 'competitor_battlecard', label: 'Competitor Battlecard', tagline: 'Google Places → competitor comparison video', category: 'business_docs', inputExample: 'Business name + competitors', outputHighlights: ['Comparison video', 'Battlecard', 'Presentation', 'Transcreated versions'], pipelineCount: 10, useCases: ['Sales team', 'Product marketer'] },

  // Live & Webcast
  { chainId: 'webcast_product_demo', label: 'Product Demo Webcast', tagline: 'Demo recording → replay + clips + landing page + follow-up', category: 'live_recording', inputExample: 'Product demo recording', outputHighlights: ['Chaptered replay', 'Feature clips', 'Landing page', 'Interactive demo', 'Follow-up email'], pipelineCount: 19, badge: 'new', useCases: ['Sales engineer', 'Product team'] },
  { chainId: 'webinar_replay', label: 'Webinar Replay', tagline: 'Webinar → on-demand + chapters + blog + quiz', category: 'live_recording', inputExample: 'Webinar recording', outputHighlights: ['Chaptered replay', 'Searchable transcript', 'Blog post', 'Quiz', 'Social clips'], pipelineCount: 14, useCases: ['Educator', 'Marketing team'] },
];

// ─── Query Functions ────────────────────────────────────────────────────────

/** Get all categories available for a given input type */
export function getCategoriesForInput(inputType: InputType): CategoryDefinition[] {
  const possibility = INPUT_POSSIBILITIES.find(p => p.inputType === inputType);
  if (!possibility) return DISCOVERY_CATEGORIES;
  return DISCOVERY_CATEGORIES.filter(c => possibility.availableCategories.includes(c.id));
}

/** Get gallery cards for a category */
export function getGalleryForCategory(category: DiscoveryCategory): ChainGalleryCard[] {
  return CHAIN_GALLERY.filter(c => c.category === category);
}

/** Get gallery cards available for a tier */
export function getGalleryForTier(tier: string): ChainGalleryCard[] {
  const tierOrder = ['free', 'starter', 'creator', 'pro', 'business', 'enterprise'];
  const userTierIndex = tierOrder.indexOf(tier);
  return CHAIN_GALLERY.filter(card => {
    const chain = PIPELINE_CHAINS[card.chainId];
    if (!chain) return false;
    const chainTierIndex = tierOrder.indexOf(chain.minTier);
    return chainTierIndex <= userTierIndex;
  });
}

/** Get output previews for a chain */
export function getOutputPreviewsForChain(chainId: string): OutputPreview[] {
  const chain = PIPELINE_CHAINS[chainId];
  if (!chain) return [];
  return chain.outputFormats
    .map(f => OUTPUT_PREVIEWS[f])
    .filter((p): p is OutputPreview => !!p);
}

/** Get the complete flow steps with chain-specific context */
export function getFlowStepsForChain(chainId: string): FlowStep[] {
  return CREATE_FLOW_STEPS;
}

/** Search capabilities by keyword */
export function searchCapabilities(query: string): {
  categories: CategoryDefinition[];
  chains: ChainGalleryCard[];
  outputs: OutputPreview[];
} {
  const q = query.toLowerCase();
  return {
    categories: DISCOVERY_CATEGORIES.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q) ||
      c.bestFor.some(b => b.toLowerCase().includes(q)),
    ),
    chains: CHAIN_GALLERY.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q) ||
      c.useCases.some(u => u.toLowerCase().includes(q)) ||
      c.outputHighlights.some(o => o.toLowerCase().includes(q)),
    ),
    outputs: Object.values(OUTPUT_PREVIEWS).filter(o =>
      o.label.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.platforms.some(p => p.toLowerCase().includes(q)),
    ),
  };
}

/** Get "what can I build from this?" summary for an input type */
export function getInputSummary(inputType: InputType): {
  input: InputPossibility;
  categories: CategoryDefinition[];
  totalChains: number;
  totalOutputFormats: number;
  examplePrompts: string[];
} {
  const input = INPUT_POSSIBILITIES.find(p => p.inputType === inputType);
  if (!input) {
    return {
      input: INPUT_POSSIBILITIES[0],
      categories: [],
      totalChains: 0,
      totalOutputFormats: 0,
      examplePrompts: [],
    };
  }
  const categories = getCategoriesForInput(inputType);
  const chainIds = new Set<string>();
  categories.forEach(c => c.chainIds.forEach(id => chainIds.add(id)));
  const formats = new Set<string>();
  chainIds.forEach(id => {
    const chain = PIPELINE_CHAINS[id];
    if (chain) chain.outputFormats.forEach(f => formats.add(f));
  });
  return {
    input,
    categories,
    totalChains: chainIds.size,
    totalOutputFormats: formats.size,
    examplePrompts: input.examplePrompts,
  };
}

/** Get complete stats for the entire engine */
export function getEngineStats(): {
  totalChains: number;
  totalAtomicSteps: number;
  totalOutputFormats: number;
  totalCategories: number;
  chainsByCategory: Record<string, number>;
} {
  const steps = getAllAtomicSteps();
  const formats = getAllOutputFormats();
  const chainsByCategory: Record<string, number> = {};
  DISCOVERY_CATEGORIES.forEach(c => {
    chainsByCategory[c.id] = c.chainIds.length;
  });
  return {
    totalChains: Object.keys(PIPELINE_CHAINS).length,
    totalAtomicSteps: steps.length,
    totalOutputFormats: formats.length,
    totalCategories: DISCOVERY_CATEGORIES.length,
    chainsByCategory,
  };
}
