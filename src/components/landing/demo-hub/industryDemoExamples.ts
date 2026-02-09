/**
 * Industry-specific demo examples for pipeline demos.
 * Each industry gets curated prompts for Deck, Video, and Content generation.
 * Used by DeckDemoCard, VideoDemoCard, and ContentDemoCard.
 */

export interface IndustryPipelineExample {
  id: string;
  industryId: string;
  industryName: string;
  emoji: string;
  pipelines: {
    deck: DeckExample;
    video: VideoExample;
    content: ContentExample;
  };
}

export interface DeckExample {
  title: string;
  topic: string;
  slideCount: number;
  prompt: string;
  audience: string;
}

export interface VideoExample {
  title: string;
  script: string;
  duration: string;
  style: string;
}

export interface ContentExample {
  title: string;
  prompt: string;
  type: 'blog' | 'social' | 'email' | 'ad';
  tone: string;
}

export const INDUSTRY_PIPELINE_EXAMPLES: IndustryPipelineExample[] = [
  {
    id: 'healthcare',
    industryId: 'healthcare',
    industryName: 'Healthcare',
    emoji: '🏥',
    pipelines: {
      deck: {
        title: 'Patient Education Deck',
        topic: 'Managing Type 2 Diabetes: A Patient Guide',
        slideCount: 5,
        prompt: 'Create a 5-slide patient education presentation about managing Type 2 Diabetes. Include diet tips, exercise recommendations, medication adherence, and when to contact your doctor. Use simple, accessible language.',
        audience: 'Patients & Caregivers',
      },
      video: {
        title: 'HCP Training Video Script',
        script: 'Welcome to our clinical update on diabetes management protocols. Today we review the latest guidelines for HbA1c monitoring and personalized treatment pathways.',
        duration: '30s',
        style: 'professional-medical',
      },
      content: {
        title: 'Patient Newsletter',
        prompt: 'Write a compassionate patient newsletter about seasonal flu vaccination — importance, availability, and what to expect. Include a friendly call-to-action to book an appointment.',
        type: 'email',
        tone: 'empathetic',
      },
    },
  },
  {
    id: 'education',
    industryId: 'education',
    industryName: 'EdTech',
    emoji: '📚',
    pipelines: {
      deck: {
        title: 'AI Course Module',
        topic: 'Introduction to Machine Learning: From Data to Decisions',
        slideCount: 5,
        prompt: 'Create a 5-slide educational presentation introducing Machine Learning fundamentals. Cover: what is ML, types of ML (supervised, unsupervised), real-world applications, getting started, and key takeaways. Use engaging, student-friendly language.',
        audience: 'University Students',
      },
      video: {
        title: 'Lesson Introduction',
        script: 'Welcome students! In today\'s lesson, we explore how artificial intelligence is transforming education. From personalized learning paths to AI tutors, let\'s discover the future of learning together.',
        duration: '30s',
        style: 'educational',
      },
      content: {
        title: 'Course Launch Post',
        prompt: 'Write an engaging social media post announcing a new online course on "AI for Beginners". Highlight that it\'s available in 12 languages with AI-powered vernacular support.',
        type: 'social',
        tone: 'enthusiastic',
      },
    },
  },
  {
    id: 'finance',
    industryId: 'finance',
    industryName: 'Finance & Banking',
    emoji: '💰',
    pipelines: {
      deck: {
        title: 'Investor Pitch Deck',
        topic: 'Q4 2025 Investment Outlook & Portfolio Strategy',
        slideCount: 5,
        prompt: 'Create a 5-slide investor presentation covering: market overview, key trends (AI, green energy), portfolio allocation strategy, risk management approach, and performance projections. Use professional financial language with data-driven insights.',
        audience: 'Institutional Investors',
      },
      video: {
        title: 'Market Update Briefing',
        script: 'Good morning, investors. Our Q4 analysis reveals strong momentum in emerging markets, with AI-driven sectors outperforming expectations. Let\'s review the key opportunities and risk factors.',
        duration: '30s',
        style: 'corporate',
      },
      content: {
        title: 'Financial Advisory Blog',
        prompt: 'Write a professional blog post about 5 key financial planning tips for 2026, covering retirement planning, diversification, tax-efficient investing, emergency funds, and digital asset allocation.',
        type: 'blog',
        tone: 'authoritative',
      },
    },
  },
  {
    id: 'government',
    industryId: 'government',
    industryName: 'Government',
    emoji: '🏛️',
    pipelines: {
      deck: {
        title: 'Public Service Presentation',
        topic: 'Smart City Initiative: Digital Services for Citizens',
        slideCount: 5,
        prompt: 'Create a 5-slide government presentation about a Smart City initiative. Cover: vision and goals, digital services (e-governance portal, AI helpdesk), citizen benefits, implementation timeline, and how to participate. Use clear, inclusive language.',
        audience: 'Citizens & Stakeholders',
      },
      video: {
        title: 'PSA Video Script',
        script: 'Your government is going digital! Access all public services from your phone — from permit applications to healthcare appointments. Available in your language, accessible to everyone.',
        duration: '30s',
        style: 'public-service',
      },
      content: {
        title: 'Citizen Engagement Post',
        prompt: 'Write a public announcement about a new digital citizen portal offering 50+ government services online, emphasizing accessibility, multilingual support, and 24/7 availability.',
        type: 'social',
        tone: 'informative',
      },
    },
  },
  {
    id: 'tourism',
    industryId: 'tourism',
    industryName: 'Travel & Hospitality',
    emoji: '✈️',
    pipelines: {
      deck: {
        title: 'Destination Marketing Deck',
        topic: 'Discover Hidden Gems: Luxury Eco-Tourism Experiences',
        slideCount: 5,
        prompt: 'Create a 5-slide tourism marketing presentation showcasing luxury eco-tourism. Cover: unique destinations, sustainable luxury experiences, cultural immersion activities, exclusive packages, and booking information. Use vivid, aspirational language.',
        audience: 'Travel Agents & High-Net-Worth Travelers',
      },
      video: {
        title: 'Destination Promo Script',
        script: 'Escape to paradise. Crystal waters, ancient cultures, and world-class hospitality await. Experience luxury that respects nature and celebrates local traditions. Your journey begins here.',
        duration: '30s',
        style: 'cinematic',
      },
      content: {
        title: 'Travel Campaign Ad',
        prompt: 'Write a compelling ad copy for a luxury resort opening, highlighting personalized AI concierge services, multilingual staff, and culturally curated experiences across 3 regional themes.',
        type: 'ad',
        tone: 'aspirational',
      },
    },
  },
  {
    id: 'retail',
    industryId: 'retail',
    industryName: 'E-commerce & Retail',
    emoji: '🛍️',
    pipelines: {
      deck: {
        title: 'Product Launch Deck',
        topic: 'Summer Collection 2026: Global Launch Strategy',
        slideCount: 5,
        prompt: 'Create a 5-slide product launch presentation for a global fashion brand. Cover: collection overview, target demographics across regions, marketing channels, influencer strategy, and launch timeline with regional rollout. Use trendy, brand-forward language.',
        audience: 'Marketing Team & Retail Partners',
      },
      video: {
        title: 'Product Showcase Script',
        script: 'Introducing our Summer 2026 collection — designed for the global citizen. From Tokyo streetwear to Parisian elegance, every piece tells a story. Available in 40+ markets, speaking your style language.',
        duration: '30s',
        style: 'lifestyle',
      },
      content: {
        title: 'Product Launch Email',
        prompt: 'Write a product launch email for an AI-powered shopping assistant that provides personalized recommendations in the customer\'s native language across 20+ markets.',
        type: 'email',
        tone: 'exciting',
      },
    },
  },
  {
    id: 'manufacturing',
    industryId: 'manufacturing',
    industryName: 'Manufacturing',
    emoji: '🏭',
    pipelines: {
      deck: {
        title: 'Safety Training Deck',
        topic: 'Workplace Safety Protocol: Equipment Operation Guide',
        slideCount: 5,
        prompt: 'Create a 5-slide safety training presentation for factory workers. Cover: PPE requirements, equipment operation checklist, emergency procedures, reporting incidents, and safety quiz. Use simple, direct language suitable for multilingual workforce.',
        audience: 'Factory Floor Workers',
      },
      video: {
        title: 'Safety Video Script',
        script: 'Safety first! Before operating any equipment, complete your checklist. Wear your PPE, check the emergency stops, and report any issues immediately. Your safety is our priority — in every language you speak.',
        duration: '30s',
        style: 'instructional',
      },
      content: {
        title: 'SOP Update Notice',
        prompt: 'Write a clear, multilingual-ready standard operating procedure update notice about new quality control checkpoints in the assembly line, emphasizing worker safety and compliance.',
        type: 'email',
        tone: 'direct',
      },
    },
  },
  {
    id: 'realestate',
    industryId: 'realestate',
    industryName: 'Real Estate',
    emoji: '🏗️',
    pipelines: {
      deck: {
        title: 'Property Investment Deck',
        topic: 'Premium Waterfront Development: Investment Opportunity',
        slideCount: 5,
        prompt: 'Create a 5-slide real estate investment presentation for a premium waterfront development. Cover: project overview and location, unit types and pricing, ROI projections, amenities and lifestyle, and investment process. Use sophisticated, persuasive language.',
        audience: 'International Investors',
      },
      video: {
        title: 'Property Tour Script',
        script: 'Welcome to the future of waterfront living. Floor-to-ceiling views, world-class amenities, and a community designed for global citizens. Tour available in your language. Invest in excellence.',
        duration: '30s',
        style: 'luxury',
      },
      content: {
        title: 'Listing Description',
        prompt: 'Write a premium property listing for a smart-home penthouse in a major city, highlighting AI-integrated building management, multilingual concierge, and sustainable design features.',
        type: 'ad',
        tone: 'premium',
      },
    },
  },
];

/** Get pipeline examples for a specific industry */
export function getIndustryExample(industryId: string): IndustryPipelineExample | undefined {
  return INDUSTRY_PIPELINE_EXAMPLES.find(e => e.industryId === industryId);
}

/** Get all available industry IDs */
export function getAvailableIndustryIds(): string[] {
  return INDUSTRY_PIPELINE_EXAMPLES.map(e => e.industryId);
}
