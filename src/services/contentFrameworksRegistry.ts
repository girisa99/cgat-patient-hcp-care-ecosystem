/**
 * CONTENT FRAMEWORKS REGISTRY
 * Comprehensive framework categories for all content types:
 * 1. Business Presentation Frameworks
 * 2. Video Content Frameworks
 * 3. Training Content Frameworks
 * 4. Marketing Content Frameworks
 * 5. Regional Framework Preferences
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type FrameworkContentType = 'business' | 'video' | 'training' | 'marketing';

export interface ContentFramework {
  id: string;
  name: string;
  structure: string;
  structureSteps: string[];
  bestFor: string[];
  regionalPreference: string[];
  duration?: string;
  channel?: string;
  tier: 1 | 2 | 3;
}

export interface VideoFramework extends ContentFramework {
  duration: string;
  durationSeconds?: { min: number; max: number };
}

export interface TrainingFramework extends ContentFramework {
  learningStyle: string;
  regionalFit: string[];
}

export interface MarketingFramework extends ContentFramework {
  channel: string;
  channelTypes: string[];
}

export interface RegionalFrameworkPreference {
  region: string;
  regionCode: string;
  preferredFrameworks: string[];
  avoidFrameworks: string[];
  notes: string;
  communicationStyle: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS PRESENTATION FRAMEWORKS
// ═══════════════════════════════════════════════════════════════════════════════

export const BUSINESS_PRESENTATION_FRAMEWORKS: ContentFramework[] = [
  {
    id: 'problem-solution',
    name: 'Problem-Solution',
    structure: 'Problem → Impact → Solution → Benefits',
    structureSteps: ['Problem', 'Impact', 'Solution', 'Benefits'],
    bestFor: ['Sales', 'Pitches', 'Proposals'],
    regionalPreference: ['US', 'UK', 'DE'],
    tier: 1
  },
  {
    id: 'aida',
    name: 'AIDA',
    structure: 'Attention → Interest → Desire → Action',
    structureSteps: ['Attention', 'Interest', 'Desire', 'Action'],
    bestFor: ['Marketing', 'Ads', 'Landing pages'],
    regionalPreference: ['US', 'MX', 'BR'],
    tier: 1
  },
  {
    id: 'pyramid-principle',
    name: 'Pyramid Principle',
    structure: 'Conclusion first → Supporting points',
    structureSteps: ['Main Conclusion', 'Key Arguments', 'Supporting Data', 'Details'],
    bestFor: ['Consulting', 'Executive', 'Board presentations'],
    regionalPreference: ['US', 'UK', 'DE'],
    tier: 1
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    structure: 'Hook → Challenge → Journey → Resolution',
    structureSteps: ['Hook', 'Challenge', 'Journey', 'Resolution'],
    bestFor: ['Brand', 'Emotional', 'Culture'],
    regionalPreference: ['IN', 'MX', 'BR', 'NG'],
    tier: 1
  },
  {
    id: 'data-driven',
    name: 'Data-Driven',
    structure: 'Data → Analysis → Insights → Recommendations',
    structureSteps: ['Data Presentation', 'Analysis', 'Key Insights', 'Recommendations'],
    bestFor: ['Technical', 'Finance', 'Research'],
    regionalPreference: ['DE', 'JP', 'UK'],
    tier: 1
  },
  {
    id: 'before-after-bridge',
    name: 'Before-After-Bridge',
    structure: 'Current state → Desired state → How to get there',
    structureSteps: ['Current State (Before)', 'Desired State (After)', 'The Bridge (Solution)'],
    bestFor: ['Change management', 'Transformation', 'Proposals'],
    regionalPreference: ['ALL'],
    tier: 1
  },
  {
    id: 'scqa',
    name: 'SCQA',
    structure: 'Situation → Complication → Question → Answer',
    structureSteps: ['Situation', 'Complication', 'Question', 'Answer'],
    bestFor: ['Strategy', 'Consulting', 'Problem-solving'],
    regionalPreference: ['US', 'UK', 'JP'],
    tier: 1
  },
  {
    id: 'monroe-motivated-sequence',
    name: 'Monroe Motivated Sequence',
    structure: 'Attention → Need → Satisfaction → Visualization → Action',
    structureSteps: ['Attention', 'Need', 'Satisfaction', 'Visualization', 'Action'],
    bestFor: ['Persuasion', 'Speeches', 'Fundraising'],
    regionalPreference: ['US'],
    tier: 2
  },
  {
    id: 'comparison',
    name: 'Comparison',
    structure: 'Option A vs Option B vs Option C',
    structureSteps: ['Options Overview', 'Criteria Definition', 'Comparison Matrix', 'Recommendation'],
    bestFor: ['Decision-making', 'Product selection', 'Vendor analysis'],
    regionalPreference: ['DE', 'JP'],
    tier: 1
  },
  {
    id: 'journey-timeline',
    name: 'Journey/Timeline',
    structure: 'Past → Present → Future',
    structureSteps: ['Past (History)', 'Present (Current)', 'Future (Vision)'],
    bestFor: ['Company history', 'Roadmap', 'Strategy'],
    regionalPreference: ['ALL'],
    tier: 1
  },
  {
    id: 'what-so-what-now-what',
    name: 'What? So What? Now What?',
    structure: 'What happened → Why it matters → What to do',
    structureSteps: ['What?', 'So What?', 'Now What?'],
    bestFor: ['Status updates', 'Reports', 'Quick briefs'],
    regionalPreference: ['US', 'UK', 'AU'],
    tier: 2
  },
  {
    id: 'star',
    name: 'STAR Method',
    structure: 'Situation → Task → Action → Result',
    structureSteps: ['Situation', 'Task', 'Action', 'Result'],
    bestFor: ['Case studies', 'Success stories', 'Interviews'],
    regionalPreference: ['US', 'UK'],
    tier: 2
  },
  {
    id: 'pas',
    name: 'PAS (Problem-Agitate-Solve)',
    structure: 'Problem → Agitate → Solve',
    structureSteps: ['Problem', 'Agitate', 'Solve'],
    bestFor: ['Sales', 'Marketing', 'Copywriting'],
    regionalPreference: ['US', 'UK'],
    tier: 1
  },
  {
    id: 'features-advantages-benefits',
    name: 'FAB (Features-Advantages-Benefits)',
    structure: 'Features → Advantages → Benefits',
    structureSteps: ['Features', 'Advantages', 'Benefits'],
    bestFor: ['Product presentations', 'Sales demos'],
    regionalPreference: ['US', 'UK', 'DE'],
    tier: 2
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO CONTENT FRAMEWORKS
// ═══════════════════════════════════════════════════════════════════════════════

export const VIDEO_CONTENT_FRAMEWORKS: VideoFramework[] = [
  {
    id: 'hook-story-offer',
    name: 'Hook-Story-Offer',
    structure: 'Hook (3s) → Story (45s) → CTA (12s)',
    structureSteps: ['Hook (3s)', 'Story (45s)', 'CTA (12s)'],
    bestFor: ['Social media ads', 'TikTok', 'Reels'],
    regionalPreference: ['US', 'UK', 'BR'],
    duration: '60s',
    durationSeconds: { min: 45, max: 60 },
    tier: 1
  },
  {
    id: 'problem-agitate-solve-video',
    name: 'Problem-Agitate-Solve',
    structure: 'Problem (10s) → Agitate (20s) → Solve (25s) → CTA (5s)',
    structureSteps: ['Problem (10s)', 'Agitate (20s)', 'Solve (25s)', 'CTA (5s)'],
    bestFor: ['Product marketing', 'Solution videos'],
    regionalPreference: ['US', 'UK', 'DE'],
    duration: '60s',
    durationSeconds: { min: 45, max: 75 },
    tier: 1
  },
  {
    id: 'tutorial-how-to',
    name: 'Tutorial/How-To',
    structure: 'Intro (10%) → Steps (75%) → Summary (10%) → CTA (5%)',
    structureSteps: ['Introduction (10%)', 'Step-by-Step (75%)', 'Summary (10%)', 'CTA (5%)'],
    bestFor: ['Educational', 'Training', 'Documentation'],
    regionalPreference: ['ALL'],
    duration: '3-10 min',
    durationSeconds: { min: 180, max: 600 },
    tier: 1
  },
  {
    id: 'explainer',
    name: 'Explainer',
    structure: 'Problem (20%) → Solution (40%) → How it works (30%) → CTA (10%)',
    structureSteps: ['Problem (20%)', 'Solution (40%)', 'How It Works (30%)', 'CTA (10%)'],
    bestFor: ['SaaS', 'Product demos', 'App walkthroughs'],
    regionalPreference: ['US', 'UK', 'DE'],
    duration: '60-90s',
    durationSeconds: { min: 60, max: 120 },
    tier: 1
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    structure: 'Intro (10%) → Challenge (25%) → Solution (30%) → Results (25%) → CTA (10%)',
    structureSteps: ['Introduction (10%)', 'Challenge (25%)', 'Solution (30%)', 'Results (25%)', 'CTA (10%)'],
    bestFor: ['Case studies', 'Social proof', 'Trust building'],
    regionalPreference: ['ALL'],
    duration: '60-120s',
    durationSeconds: { min: 60, max: 180 },
    tier: 1
  },
  {
    id: 'listicle',
    name: 'Listicle',
    structure: 'Hook → Item 1 → Item 2 → ... → Item N → CTA',
    structureSteps: ['Hook', 'Item 1', 'Item 2', '...', 'Item N', 'CTA'],
    bestFor: ['YouTube', 'Educational', 'Top 10 lists'],
    regionalPreference: ['US', 'UK', 'IN'],
    duration: '2-5 min',
    durationSeconds: { min: 120, max: 300 },
    tier: 1
  },
  {
    id: 'day-in-life',
    name: 'Day-in-Life',
    structure: 'Morning → Work → Break → Results → Close',
    structureSteps: ['Morning Routine', 'Work Activities', 'Break/Behind Scenes', 'Results/Impact', 'Closing'],
    bestFor: ['Brand', 'Culture', 'Employer branding'],
    regionalPreference: ['US', 'UK', 'KR'],
    duration: '3-10 min',
    durationSeconds: { min: 180, max: 600 },
    tier: 2
  },
  {
    id: 'interview',
    name: 'Interview',
    structure: 'Intro → Q&A → Key takeaways → CTA',
    structureSteps: ['Introduction', 'Questions & Answers', 'Key Takeaways', 'CTA'],
    bestFor: ['Thought leadership', 'Expert content', 'Podcasts'],
    regionalPreference: ['US', 'UK', 'DE'],
    duration: '5-30 min',
    durationSeconds: { min: 300, max: 1800 },
    tier: 2
  },
  {
    id: 'before-after',
    name: 'Before-After',
    structure: 'Before state → Transformation → After state → CTA',
    structureSteps: ['Before State', 'Transformation Process', 'After State', 'CTA'],
    bestFor: ['Makeovers', 'Results showcase', 'Case studies'],
    regionalPreference: ['ALL'],
    duration: '30-90s',
    durationSeconds: { min: 30, max: 90 },
    tier: 1
  },
  {
    id: 'unboxing-review',
    name: 'Unboxing/Review',
    structure: 'Intro → First impressions → Deep dive → Verdict → CTA',
    structureSteps: ['Introduction', 'First Impressions', 'Deep Dive', 'Verdict', 'CTA'],
    bestFor: ['Product reviews', 'Influencer content', 'Tech'],
    regionalPreference: ['US', 'KR', 'JP'],
    duration: '5-15 min',
    durationSeconds: { min: 300, max: 900 },
    tier: 2
  },
  {
    id: 'vlog-style',
    name: 'Vlog Style',
    structure: 'Hook → Journey → Highlights → Reflection → CTA',
    structureSteps: ['Hook', 'Journey/Experience', 'Highlights', 'Reflection', 'CTA'],
    bestFor: ['Personal brand', 'Travel', 'Lifestyle'],
    regionalPreference: ['US', 'UK', 'BR', 'KR'],
    duration: '5-20 min',
    durationSeconds: { min: 300, max: 1200 },
    tier: 2
  },
  {
    id: 'announcement',
    name: 'Announcement',
    structure: 'Teaser → Reveal → Details → Impact → CTA',
    structureSteps: ['Teaser', 'Big Reveal', 'Key Details', 'Impact/Benefits', 'CTA'],
    bestFor: ['Product launches', 'News', 'Updates'],
    regionalPreference: ['ALL'],
    duration: '30-120s',
    durationSeconds: { min: 30, max: 120 },
    tier: 1
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// TRAINING CONTENT FRAMEWORKS
// ═══════════════════════════════════════════════════════════════════════════════

export const TRAINING_CONTENT_FRAMEWORKS: TrainingFramework[] = [
  {
    id: 'addie',
    name: 'ADDIE',
    structure: 'Analyze → Design → Develop → Implement → Evaluate',
    structureSteps: ['Analyze', 'Design', 'Develop', 'Implement', 'Evaluate'],
    bestFor: ['Comprehensive programs', 'Curriculum design', 'Enterprise training'],
    regionalPreference: ['US', 'UK', 'DE'],
    learningStyle: 'Structured, systematic',
    regionalFit: ['US', 'UK', 'Germany'],
    tier: 1
  },
  {
    id: 'sam-agile',
    name: 'SAM (Agile)',
    structure: 'Preparation → Iterative Design → Development',
    structureSteps: ['Preparation Phase', 'Iterative Design Cycle', 'Development Cycle'],
    bestFor: ['Rapid development', 'Agile teams', 'Quick iterations'],
    regionalPreference: ['US', 'UK'],
    learningStyle: 'Iterative, fast-paced',
    regionalFit: ['US', 'Tech companies'],
    tier: 1
  },
  {
    id: '4mat',
    name: '4MAT',
    structure: 'Why → What → How → What If',
    structureSteps: ['Why (Motivation)', 'What (Content)', 'How (Practice)', 'What If (Application)'],
    bestFor: ['Diverse learners', 'Multiple learning styles', 'Inclusive training'],
    regionalPreference: ['ALL'],
    learningStyle: 'Multi-modal, inclusive',
    regionalFit: ['All regions'],
    tier: 1
  },
  {
    id: 'gagnes-9-events',
    name: "Gagné's 9 Events",
    structure: '9-step instructional sequence',
    structureSteps: [
      '1. Gain Attention',
      '2. Inform Objectives',
      '3. Stimulate Recall',
      '4. Present Content',
      '5. Provide Guidance',
      '6. Elicit Performance',
      '7. Provide Feedback',
      '8. Assess Performance',
      '9. Enhance Retention'
    ],
    bestFor: ['Structured learning', 'Formal education', 'Certification programs'],
    regionalPreference: ['JP', 'DE'],
    learningStyle: 'Systematic, thorough',
    regionalFit: ['Japan', 'Germany - systematic'],
    tier: 2
  },
  {
    id: 'micro-learning',
    name: 'Micro-learning',
    structure: '3-5 min focused modules',
    structureSteps: ['Hook (10s)', 'Core Content (2-3 min)', 'Quick Practice', 'Takeaway'],
    bestFor: ['Mobile learners', 'Busy professionals', 'Just-in-time training'],
    regionalPreference: ['IN', 'NG', 'KE'],
    learningStyle: 'Bite-sized, mobile-first',
    regionalFit: ['India', 'Africa - mobile-first'],
    tier: 1
  },
  {
    id: 'scenario-based',
    name: 'Scenario-Based',
    structure: 'Situation → Decision → Consequence',
    structureSteps: ['Present Scenario', 'Decision Point', 'Show Consequences', 'Debrief'],
    bestFor: ['Soft skills', 'Compliance', 'Safety training'],
    regionalPreference: ['US', 'UK'],
    learningStyle: 'Experiential, practical',
    regionalFit: ['US', 'UK'],
    tier: 1
  },
  {
    id: 'flipped-learning',
    name: 'Flipped Learning',
    structure: 'Pre-work → Interactive session → Application',
    structureSteps: ['Pre-work (Self-study)', 'Interactive Session (Discussion)', 'Application (Practice)'],
    bestFor: ['Blended learning', 'Deep understanding', 'Active learning'],
    regionalPreference: ['US', 'UK', 'AU'],
    learningStyle: 'Self-directed, interactive',
    regionalFit: ['US', 'UK', 'Australia'],
    tier: 2
  },
  {
    id: 'chunking',
    name: 'Chunking',
    structure: 'Bite-sized modules with assessments',
    structureSteps: ['Chunk 1 + Quiz', 'Chunk 2 + Quiz', 'Chunk 3 + Quiz', 'Final Assessment'],
    bestFor: ['Complex topics', 'Certification prep', 'Long-form content'],
    regionalPreference: ['ALL'],
    learningStyle: 'Modular, progressive',
    regionalFit: ['All regions'],
    tier: 1
  },
  {
    id: 'action-learning',
    name: 'Action Learning',
    structure: 'Problem → Team discussion → Action → Reflection',
    structureSteps: ['Real Problem', 'Team Discussion', 'Take Action', 'Reflect & Learn'],
    bestFor: ['Leadership development', 'Problem-solving', 'Team building'],
    regionalPreference: ['US', 'UK', 'DE'],
    learningStyle: 'Collaborative, experiential',
    regionalFit: ['US', 'UK', 'Germany'],
    tier: 2
  },
  {
    id: 'spaced-repetition',
    name: 'Spaced Repetition',
    structure: 'Learn → Wait → Review → Wait longer → Review',
    structureSteps: ['Initial Learning', 'Day 1 Review', 'Week 1 Review', 'Month 1 Review'],
    bestFor: ['Memorization', 'Language learning', 'Certifications'],
    regionalPreference: ['ALL'],
    learningStyle: 'Scientific, retention-focused',
    regionalFit: ['All regions'],
    tier: 2
  },
  {
    id: 'discovery-learning',
    name: 'Discovery Learning',
    structure: 'Explore → Discover → Discuss → Apply',
    structureSteps: ['Exploration', 'Discovery', 'Discussion', 'Application'],
    bestFor: ['Creative thinking', 'Innovation training', 'R&D'],
    regionalPreference: ['US', 'UK'],
    learningStyle: 'Exploratory, self-directed',
    regionalFit: ['US', 'UK'],
    tier: 2
  },
  {
    id: 'peer-learning',
    name: 'Peer Learning',
    structure: 'Pair up → Share knowledge → Practice together → Feedback',
    structureSteps: ['Pairing', 'Knowledge Sharing', 'Joint Practice', 'Peer Feedback'],
    bestFor: ['Team skills', 'Mentoring', 'Knowledge transfer'],
    regionalPreference: ['IN', 'BR', 'MX'],
    learningStyle: 'Collaborative, social',
    regionalFit: ['India', 'LatAm - relationship cultures'],
    tier: 2
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// MARKETING CONTENT FRAMEWORKS
// ═══════════════════════════════════════════════════════════════════════════════

export const MARKETING_CONTENT_FRAMEWORKS: MarketingFramework[] = [
  {
    id: 'hero-hub-help',
    name: 'Hero-Hub-Help',
    structure: 'Hero (big campaigns) + Hub (regular) + Help (evergreen)',
    structureSteps: ['Hero Content (Flagship)', 'Hub Content (Regular)', 'Help Content (Evergreen)'],
    bestFor: ['Content strategy', 'Multi-channel', 'YouTube'],
    regionalPreference: ['US', 'UK'],
    channel: 'Multi-channel',
    channelTypes: ['YouTube', 'Website', 'Social'],
    tier: 1
  },
  {
    id: 'peso',
    name: 'PESO',
    structure: 'Paid + Earned + Shared + Owned media',
    structureSteps: ['Paid Media', 'Earned Media', 'Shared Media', 'Owned Media'],
    bestFor: ['Integrated marketing', 'PR strategy', 'Media planning'],
    regionalPreference: ['US', 'UK', 'DE', 'FR'],
    channel: 'Integrated marketing',
    channelTypes: ['All channels'],
    tier: 1
  },
  {
    id: 'storybrand',
    name: 'StoryBrand',
    structure: '7-part brand storytelling framework',
    structureSteps: [
      '1. Character (Customer)',
      '2. Problem',
      '3. Guide (Your Brand)',
      '4. Plan',
      '5. Call to Action',
      '6. Success',
      '7. Failure (Stakes)'
    ],
    bestFor: ['Brand messaging', 'Website copy', 'Marketing narratives'],
    regionalPreference: ['US'],
    channel: 'Brand messaging',
    channelTypes: ['Website', 'Marketing materials'],
    tier: 1
  },
  {
    id: 'jobs-to-be-done-marketing',
    name: 'Jobs-to-be-Done',
    structure: 'What job is customer hiring product for?',
    structureSteps: ['Identify Job', 'Current Solutions', 'Pain Points', 'Your Solution', 'Outcomes'],
    bestFor: ['Product marketing', 'Positioning', 'Feature prioritization'],
    regionalPreference: ['US', 'DE'],
    channel: 'Product marketing',
    channelTypes: ['Product pages', 'Sales materials'],
    tier: 1
  },
  {
    id: 'customer-journey',
    name: 'Customer Journey',
    structure: 'Awareness → Consideration → Decision → Retention',
    structureSteps: ['Awareness', 'Consideration', 'Decision', 'Retention', 'Advocacy'],
    bestFor: ['Full funnel', 'Customer experience', 'Lifecycle marketing'],
    regionalPreference: ['ALL'],
    channel: 'Full funnel',
    channelTypes: ['All touchpoints'],
    tier: 1
  },
  {
    id: 'pillar-cluster',
    name: 'Pillar-Cluster',
    structure: 'Pillar content + supporting clusters',
    structureSteps: ['Pillar Page (Comprehensive)', 'Cluster 1 (Subtopic)', 'Cluster 2', 'Cluster 3', 'Internal Links'],
    bestFor: ['SEO', 'Content marketing', 'Blog strategy'],
    regionalPreference: ['US', 'UK'],
    channel: 'SEO, content',
    channelTypes: ['Blog', 'Website'],
    tier: 1
  },
  {
    id: 'race',
    name: 'RACE',
    structure: 'Reach → Act → Convert → Engage',
    structureSteps: ['Reach (Awareness)', 'Act (Interaction)', 'Convert (Sale)', 'Engage (Loyalty)'],
    bestFor: ['Digital marketing', 'Campaign planning', 'Analytics'],
    regionalPreference: ['UK', 'DE', 'FR'],
    channel: 'Digital marketing',
    channelTypes: ['Digital channels'],
    tier: 1
  },
  {
    id: 'aida-marketing',
    name: 'AIDA (Marketing)',
    structure: 'Attention → Interest → Desire → Action',
    structureSteps: ['Grab Attention', 'Build Interest', 'Create Desire', 'Call to Action'],
    bestFor: ['Advertising', 'Email marketing', 'Landing pages'],
    regionalPreference: ['US', 'MX', 'BR'],
    channel: 'Advertising',
    channelTypes: ['Ads', 'Email', 'Landing pages'],
    tier: 1
  },
  {
    id: 'content-atomization',
    name: 'Content Atomization',
    structure: 'Big content → Smaller pieces → Multiple channels',
    structureSteps: ['Create Long-form', 'Extract Key Points', 'Create Social Snippets', 'Distribute'],
    bestFor: ['Content repurposing', 'Social media', 'Efficiency'],
    regionalPreference: ['US', 'UK'],
    channel: 'Multi-channel',
    channelTypes: ['Social', 'Blog', 'Email'],
    tier: 2
  },
  {
    id: 'tofu-mofu-bofu',
    name: 'TOFU-MOFU-BOFU',
    structure: 'Top of Funnel → Middle of Funnel → Bottom of Funnel',
    structureSteps: ['TOFU (Awareness content)', 'MOFU (Consideration content)', 'BOFU (Decision content)'],
    bestFor: ['Inbound marketing', 'Lead nurturing', 'Content mapping'],
    regionalPreference: ['US', 'UK'],
    channel: 'Inbound marketing',
    channelTypes: ['Blog', 'Email', 'Sales'],
    tier: 1
  },
  {
    id: 'soap-social',
    name: 'SOAP (Social)',
    structure: 'Story → Offer → Ask → Proof',
    structureSteps: ['Tell Story', 'Make Offer', 'Ask for Action', 'Show Proof'],
    bestFor: ['Social selling', 'LinkedIn', 'DMs'],
    regionalPreference: ['US', 'UK'],
    channel: 'Social selling',
    channelTypes: ['LinkedIn', 'Social media'],
    tier: 2
  },
  {
    id: 'see-think-do-care',
    name: 'See-Think-Do-Care',
    structure: 'See (Awareness) → Think (Consideration) → Do (Purchase) → Care (Loyalty)',
    structureSteps: ['See (Broadest audience)', 'Think (Considering purchase)', 'Do (Ready to buy)', 'Care (Existing customers)'],
    bestFor: ['Google marketing', 'Full funnel', 'Analytics'],
    regionalPreference: ['US', 'UK', 'DE'],
    channel: 'Full funnel',
    channelTypes: ['All channels'],
    tier: 2
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// REGIONAL FRAMEWORK PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════════

export const REGIONAL_FRAMEWORK_PREFERENCES: RegionalFrameworkPreference[] = [
  {
    region: 'United States',
    regionCode: 'US',
    preferredFrameworks: ['aida', 'problem-solution', 'storybrand', 'hook-story-offer'],
    avoidFrameworks: ['overly-formal', 'indirect-approaches'],
    notes: 'Action-oriented, direct CTA. Prefer clear value propositions.',
    communicationStyle: ['direct', 'action-oriented', 'confident', 'friendly']
  },
  {
    region: 'United Kingdom',
    regionCode: 'UK',
    preferredFrameworks: ['pyramid-principle', 'scqa', 'race', 'peso'],
    avoidFrameworks: ['aggressive-sales', 'hyperbolic-claims'],
    notes: 'Understated, evidence-based. Avoid overselling.',
    communicationStyle: ['understated', 'professional', 'evidence-based', 'polite']
  },
  {
    region: 'Germany',
    regionCode: 'DE',
    preferredFrameworks: ['data-driven', 'comparison', 'addie', 'pestle'],
    avoidFrameworks: ['emotional-appeals-only', 'vague-claims'],
    notes: 'Thorough, technical, precise. Data over emotion.',
    communicationStyle: ['thorough', 'technical', 'precise', 'formal']
  },
  {
    region: 'France',
    regionCode: 'FR',
    preferredFrameworks: ['storytelling', 'artistic-narratives', 'sophisticated-approaches'],
    avoidFrameworks: ['crude-direct-selling', 'aggressive-ctas'],
    notes: 'Elegant, intellectual. Appreciate sophistication.',
    communicationStyle: ['elegant', 'intellectual', 'refined', 'cultured']
  },
  {
    region: 'Japan',
    regionCode: 'JP',
    preferredFrameworks: ['gagnes-9-events', 'detailed-systematic', 'data-driven'],
    avoidFrameworks: ['aggressive-ctas', 'direct-criticism'],
    notes: 'Respectful, thorough, humble. Systematic approaches preferred.',
    communicationStyle: ['respectful', 'thorough', 'humble', 'systematic']
  },
  {
    region: 'Korea',
    regionCode: 'KR',
    preferredFrameworks: ['modern-trendy', 'visual-formats', 'k-style'],
    avoidFrameworks: ['old-fashioned-approaches', 'text-heavy'],
    notes: 'K-style, engaging, visual. Modern and dynamic.',
    communicationStyle: ['modern', 'trendy', 'visual', 'dynamic']
  },
  {
    region: 'China',
    regionCode: 'CN',
    preferredFrameworks: ['aspirational', 'success-stories', 'prosperity-focused'],
    avoidFrameworks: ['western-frameworks-directly', 'politically-sensitive'],
    notes: 'Localize messaging, prosperity themes. Build relationships.',
    communicationStyle: ['aspirational', 'prosperity-focused', 'relationship-oriented', 'respectful']
  },
  {
    region: 'India',
    regionCode: 'IN',
    preferredFrameworks: ['storytelling', 'emotional', 'family-values', 'micro-learning'],
    avoidFrameworks: ['cold-data-only', 'impersonal'],
    notes: 'Relatable, aspirational. Warm and respectful.',
    communicationStyle: ['warm', 'relatable', 'aspirational', 'respectful']
  },
  {
    region: 'MENA (Middle East)',
    regionCode: 'SA',
    preferredFrameworks: ['relationship-building', 'respectful', 'hospitality-focused'],
    avoidFrameworks: ['aggressive-western-sales', 'religiously-insensitive'],
    notes: 'Hospitality-oriented, trust-building. Respectful tone.',
    communicationStyle: ['hospitable', 'respectful', 'relationship-focused', 'formal']
  },
  {
    region: 'Latin America',
    regionCode: 'MX',
    preferredFrameworks: ['storytelling', 'warm-personal', 'aida', 'peer-learning'],
    avoidFrameworks: ['cold-impersonal', 'overly-formal'],
    notes: 'Relationship-focused, warm communication.',
    communicationStyle: ['warm', 'personal', 'relationship-focused', 'expressive']
  },
  {
    region: 'Africa',
    regionCode: 'NG',
    preferredFrameworks: ['practical', 'mobile-first', 'visual', 'micro-learning'],
    avoidFrameworks: ['complex-frameworks', 'text-heavy'],
    notes: 'Simple, clear, actionable. Mobile-first approach.',
    communicationStyle: ['practical', 'clear', 'actionable', 'mobile-first']
  },
  {
    region: 'Australia',
    regionCode: 'AU',
    preferredFrameworks: ['what-so-what-now-what', 'flipped-learning', 'casual-professional'],
    avoidFrameworks: ['overly-formal', 'pretentious'],
    notes: 'Casual but professional. No-nonsense approach.',
    communicationStyle: ['casual', 'direct', 'friendly', 'no-nonsense']
  },
  {
    region: 'Brazil',
    regionCode: 'BR',
    preferredFrameworks: ['storytelling', 'hook-story-offer', 'warm-engaging'],
    avoidFrameworks: ['cold-formal', 'impersonal'],
    notes: 'Warm, friendly, engaging. Personal connection matters.',
    communicationStyle: ['warm', 'friendly', 'engaging', 'personal']
  },
  {
    region: 'Southeast Asia',
    regionCode: 'SG',
    preferredFrameworks: ['practical', 'modern', 'mobile-first'],
    avoidFrameworks: ['culturally-insensitive', 'aggressive'],
    notes: 'Practical, respectful, multicultural awareness.',
    communicationStyle: ['practical', 'respectful', 'multicultural', 'modern']
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all frameworks by content type
 */
export function getFrameworksByContentType(contentType: FrameworkContentType): ContentFramework[] {
  switch (contentType) {
    case 'business':
      return BUSINESS_PRESENTATION_FRAMEWORKS;
    case 'video':
      return VIDEO_CONTENT_FRAMEWORKS;
    case 'training':
      return TRAINING_CONTENT_FRAMEWORKS;
    case 'marketing':
      return MARKETING_CONTENT_FRAMEWORKS;
    default:
      return BUSINESS_PRESENTATION_FRAMEWORKS;
  }
}

/**
 * Get frameworks suitable for a specific region
 */
export function getFrameworksForRegion(regionCode: string): {
  business: ContentFramework[];
  video: VideoFramework[];
  training: TrainingFramework[];
  marketing: MarketingFramework[];
} {
  const matchesRegion = (framework: ContentFramework) => 
    framework.regionalPreference.includes('ALL') || 
    framework.regionalPreference.includes(regionCode);

  return {
    business: BUSINESS_PRESENTATION_FRAMEWORKS.filter(matchesRegion),
    video: VIDEO_CONTENT_FRAMEWORKS.filter(matchesRegion),
    training: TRAINING_CONTENT_FRAMEWORKS.filter(matchesRegion),
    marketing: MARKETING_CONTENT_FRAMEWORKS.filter(matchesRegion)
  };
}

/**
 * Get regional framework preference
 */
export function getRegionalPreference(regionCode: string): RegionalFrameworkPreference | undefined {
  return REGIONAL_FRAMEWORK_PREFERENCES.find(p => p.regionCode === regionCode);
}

/**
 * Get recommended frameworks for region and content type
 */
export function getRecommendedFrameworks(
  regionCode: string,
  contentType: FrameworkContentType,
  limit: number = 5
): ContentFramework[] {
  const preference = getRegionalPreference(regionCode);
  const allFrameworks = getFrameworksByContentType(contentType);
  
  if (!preference) {
    return allFrameworks.slice(0, limit);
  }
  
  // Score frameworks based on regional preference
  const scored = allFrameworks.map(f => {
    let score = f.tier === 1 ? 3 : f.tier === 2 ? 2 : 1;
    
    if (f.regionalPreference.includes(regionCode) || f.regionalPreference.includes('ALL')) {
      score += 2;
    }
    
    if (preference.preferredFrameworks.includes(f.id)) {
      score += 5;
    }
    
    return { framework: f, score };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.framework);
}

/**
 * Get framework by ID across all types
 */
export function getFrameworkById(id: string): ContentFramework | undefined {
  return [
    ...BUSINESS_PRESENTATION_FRAMEWORKS,
    ...VIDEO_CONTENT_FRAMEWORKS,
    ...TRAINING_CONTENT_FRAMEWORKS,
    ...MARKETING_CONTENT_FRAMEWORKS
  ].find(f => f.id === id);
}

/**
 * Get all frameworks count
 */
export function getFrameworksStats(): {
  total: number;
  business: number;
  video: number;
  training: number;
  marketing: number;
  regions: number;
} {
  return {
    total: BUSINESS_PRESENTATION_FRAMEWORKS.length + 
           VIDEO_CONTENT_FRAMEWORKS.length + 
           TRAINING_CONTENT_FRAMEWORKS.length + 
           MARKETING_CONTENT_FRAMEWORKS.length,
    business: BUSINESS_PRESENTATION_FRAMEWORKS.length,
    video: VIDEO_CONTENT_FRAMEWORKS.length,
    training: TRAINING_CONTENT_FRAMEWORKS.length,
    marketing: MARKETING_CONTENT_FRAMEWORKS.length,
    regions: REGIONAL_FRAMEWORK_PREFERENCES.length
  };
}

/**
 * Search frameworks by keyword
 */
export function searchFrameworks(keyword: string): ContentFramework[] {
  const lower = keyword.toLowerCase();
  const allFrameworks = [
    ...BUSINESS_PRESENTATION_FRAMEWORKS,
    ...VIDEO_CONTENT_FRAMEWORKS,
    ...TRAINING_CONTENT_FRAMEWORKS,
    ...MARKETING_CONTENT_FRAMEWORKS
  ];
  
  return allFrameworks.filter(f => 
    f.name.toLowerCase().includes(lower) ||
    f.structure.toLowerCase().includes(lower) ||
    f.bestFor.some(b => b.toLowerCase().includes(lower))
  );
}

// Export main registry object
export const ContentFrameworksRegistry = {
  business: BUSINESS_PRESENTATION_FRAMEWORKS,
  video: VIDEO_CONTENT_FRAMEWORKS,
  training: TRAINING_CONTENT_FRAMEWORKS,
  marketing: MARKETING_CONTENT_FRAMEWORKS,
  regionalPreferences: REGIONAL_FRAMEWORK_PREFERENCES,
  getByContentType: getFrameworksByContentType,
  getForRegion: getFrameworksForRegion,
  getRegionalPreference,
  getRecommended: getRecommendedFrameworks,
  getById: getFrameworkById,
  getStats: getFrameworksStats,
  search: searchFrameworks
};

export default ContentFrameworksRegistry;
