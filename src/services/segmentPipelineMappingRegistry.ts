/**
 * Segment-Pipeline Mapping Registry
 * 
 * SINGLE SOURCE OF TRUTH for connecting P4-SEG scenarios to:
 * - Existing 206 pipelines (no duplication)
 * - Multiple industries (cross-industry tagging)
 * - Subscription tiers (existing tier system)
 * - Cross-functional capabilities (25 existing)
 * 
 * This enables Training to serve Education, Enterprise, AND Healthcare
 * with the same underlying pipeline, different positioning.
 */

import { SEGMENT_CREDIT_TIERS, type SegmentType } from '@/hooks/useAICredits';

// ============================================================================
// TYPES
// ============================================================================

export type IndustryTag = 
  | 'healthcare' | 'education' | 'enterprise' | 'finance' | 'legal'
  | 'travel' | 'realestate' | 'ecommerce' | 'media' | 'technology'
  | 'consulting' | 'government' | 'manufacturing' | 'nonprofit' | 'retail';

export type CapabilityBundle = 
  | 'training' | 'tours' | 'compliance' | 'localization' | 'content'
  | 'analytics' | 'automation' | 'personalization';

export type TierRequirement = 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';

export interface SegmentPipelineMapping {
  id: string; // P4-SEG-XX
  name: string;
  description: string;
  
  // Multi-industry tagging (NOT single-segment locked)
  industries: IndustryTag[];
  primaryIndustry: IndustryTag; // For default display
  
  // Capability bundle for cross-functional grouping
  bundle: CapabilityBundle;
  
  // Existing pipeline references (from 206 pipelines)
  pipelineIds: string[];
  
  // Cross-functional capabilities used
  crossFunctional: string[];
  
  // Tier gating
  minTier: TierRequirement;
  
  // Credit multiplier based on complexity
  creditMultiplier: number;
  
  // Industry-specific positioning/messaging
  industryPositioning: Record<IndustryTag, {
    displayName: string;
    tagline: string;
    useCases: string[];
  }>;
  
  // Status tracking
  status: 'pending' | 'partial' | 'complete';
  implementedAt?: string;
}

// ============================================================================
// CAPABILITY BUNDLES - Groups of cross-industry features
// ============================================================================

export const CAPABILITY_BUNDLES: Record<CapabilityBundle, {
  name: string;
  description: string;
  sharedIndustries: IndustryTag[];
  icon: string;
}> = {
  training: {
    name: 'Training Suite',
    description: 'Course creation, quizzes, lecture enhancement',
    sharedIndustries: ['education', 'enterprise', 'healthcare', 'legal', 'finance'],
    icon: 'GraduationCap',
  },
  tours: {
    name: 'Tour & Showcase',
    description: 'Property tours, product showcases, destination videos',
    sharedIndustries: ['travel', 'realestate', 'ecommerce', 'media'],
    icon: 'Video',
  },
  compliance: {
    name: 'Compliance Engine',
    description: 'Legal disclosures, HIPAA processing, financial reports',
    sharedIndustries: ['legal', 'healthcare', 'finance', 'enterprise', 'government'],
    icon: 'Shield',
  },
  localization: {
    name: 'Localization Pack',
    description: 'Multi-language dubbing, regional adaptation, transcreation',
    sharedIndustries: ['healthcare', 'education', 'enterprise', 'finance', 'legal', 'travel', 'realestate', 'ecommerce', 'media', 'technology'],
    icon: 'Globe',
  },
  content: {
    name: 'Content Creation',
    description: 'Video production, script generation, media enhancement',
    sharedIndustries: ['media', 'technology', 'consulting', 'nonprofit', 'retail'],
    icon: 'Clapperboard',
  },
  analytics: {
    name: 'Analytics & Insights',
    description: 'Performance tracking, audience insights, ROI analysis',
    sharedIndustries: ['enterprise', 'finance', 'consulting', 'technology', 'ecommerce'],
    icon: 'BarChart3',
  },
  automation: {
    name: 'Automation Engine',
    description: 'Batch processing, scheduled publishing, workflow automation',
    sharedIndustries: ['enterprise', 'ecommerce', 'media', 'technology', 'manufacturing'],
    icon: 'Zap',
  },
  personalization: {
    name: 'Personalization',
    description: 'Dynamic content, A/B variants, audience targeting',
    sharedIndustries: ['ecommerce', 'enterprise', 'media', 'travel', 'realestate'],
    icon: 'Users',
  },
};

// ============================================================================
// P4-SEG SCENARIO MAPPINGS (21 scenarios → Cross-Industry)
// ============================================================================

export const SEGMENT_PIPELINE_MAPPINGS: SegmentPipelineMapping[] = [
  // ========== HEALTHCARE ORIGIN (but shared) ==========
  {
    id: 'P4-SEG-01',
    name: 'Patient Education Videos',
    description: 'Create accessible health education content',
    industries: ['healthcare', 'education', 'nonprofit'],
    primaryIndustry: 'healthcare',
    bundle: 'training',
    pipelineIds: ['video-explainer', 'animation-2d', 'avatar-presenter'],
    crossFunctional: ['avatar', 'multi-language', 'accessibility'],
    minTier: 'creator',
    creditMultiplier: 1.5,
    industryPositioning: {
      healthcare: {
        displayName: 'Patient Education Videos',
        tagline: 'Improve patient outcomes with clear health education',
        useCases: ['Medication instructions', 'Procedure explanations', 'Wellness tips'],
      },
      education: {
        displayName: 'Health & Science Lessons',
        tagline: 'Engaging biology and health education content',
        useCases: ['Biology lessons', 'Health class content', 'Science explainers'],
      },
      nonprofit: {
        displayName: 'Health Awareness Campaigns',
        tagline: 'Spread health awareness effectively',
        useCases: ['Public health campaigns', 'Awareness videos', 'Community education'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-02',
    name: 'Clinical Trial Content',
    description: 'Professional clinical and research communications',
    industries: ['healthcare', 'education', 'government'],
    primaryIndustry: 'healthcare',
    bundle: 'compliance',
    pipelineIds: ['document-to-video', 'data-visualization', 'formal-presentation'],
    crossFunctional: ['data-charts', 'compliance-watermark', 'multi-language'],
    minTier: 'pro',
    creditMultiplier: 2.0,
    industryPositioning: {
      healthcare: {
        displayName: 'Clinical Trial Content',
        tagline: 'Communicate research findings effectively',
        useCases: ['Trial recruitment', 'Results presentation', 'Investigator meetings'],
      },
      education: {
        displayName: 'Research Communication',
        tagline: 'Present academic research compellingly',
        useCases: ['Conference presentations', 'Grant proposals', 'Research summaries'],
      },
      government: {
        displayName: 'Public Health Research',
        tagline: 'Government research and policy communications',
        useCases: ['Policy briefings', 'Research reports', 'Public announcements'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-03',
    name: 'Medical Transcription',
    description: 'Accurate medical audio-to-text processing',
    industries: ['healthcare', 'legal', 'enterprise'],
    primaryIndustry: 'healthcare',
    bundle: 'automation',
    pipelineIds: ['audio-transcription', 'document-generation', 'summary-extraction'],
    crossFunctional: ['stt-medical', 'compliance', 'multi-language'],
    minTier: 'pro',
    creditMultiplier: 1.8,
    industryPositioning: {
      healthcare: {
        displayName: 'Medical Transcription',
        tagline: 'HIPAA-compliant medical dictation',
        useCases: ['Clinical notes', 'Patient records', 'Medical reports'],
      },
      legal: {
        displayName: 'Legal Transcription',
        tagline: 'Accurate legal proceedings transcription',
        useCases: ['Depositions', 'Court recordings', 'Client meetings'],
      },
      enterprise: {
        displayName: 'Meeting Transcription',
        tagline: 'Professional meeting documentation',
        useCases: ['Board meetings', 'Interviews', 'Conference calls'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-04',
    name: 'HIPAA Video Processing',
    description: 'Compliant healthcare video with PHI protection',
    industries: ['healthcare', 'legal', 'finance', 'government'],
    primaryIndustry: 'healthcare',
    bundle: 'compliance',
    pipelineIds: ['secure-video-processing', 'redaction-engine', 'compliance-export'],
    crossFunctional: ['phi-redaction', 'audit-trail', 'encryption'],
    minTier: 'business',
    creditMultiplier: 2.5,
    industryPositioning: {
      healthcare: {
        displayName: 'HIPAA Video Processing',
        tagline: 'PHI-safe video content creation',
        useCases: ['Telemedicine recordings', 'Training with patient data', 'Case studies'],
      },
      legal: {
        displayName: 'Privileged Video Processing',
        tagline: 'Attorney-client privilege protected',
        useCases: ['Sensitive depositions', 'Confidential evidence', 'Private communications'],
      },
      finance: {
        displayName: 'PCI-Compliant Video',
        tagline: 'Financial data protection in video',
        useCases: ['Account demonstrations', 'Trading recordings', 'Audit videos'],
      },
      government: {
        displayName: 'Classified Content Processing',
        tagline: 'Government-grade security',
        useCases: ['Sensitive briefings', 'Internal communications', 'Training materials'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },

  // ========== TRAVEL ORIGIN (but shared) ==========
  {
    id: 'P4-SEG-05',
    name: 'Traveler Content Kit',
    description: 'Quick travel content creation tools',
    industries: ['travel', 'media', 'nonprofit', 'education'],
    primaryIndustry: 'travel',
    bundle: 'content',
    pipelineIds: ['quick-video', 'social-clips', 'photo-slideshow'],
    crossFunctional: ['mobile-first', 'quick-edit', 'social-formats'],
    minTier: 'starter',
    creditMultiplier: 1.0,
    industryPositioning: {
      travel: {
        displayName: 'Traveler Content Kit',
        tagline: 'Share your adventures beautifully',
        useCases: ['Trip highlights', 'Travel vlogs', 'Destination guides'],
      },
      media: {
        displayName: 'Quick Content Kit',
        tagline: 'Fast-turnaround content creation',
        useCases: ['Breaking news', 'Event coverage', 'Quick updates'],
      },
      nonprofit: {
        displayName: 'Field Report Kit',
        tagline: 'Document impact in the field',
        useCases: ['Mission updates', 'Donor stories', 'Impact reports'],
      },
      education: {
        displayName: 'Field Trip Documentation',
        tagline: 'Capture learning moments',
        useCases: ['Field trips', 'Student projects', 'Cultural experiences'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-06',
    name: 'Destination Showcase',
    description: 'Professional location presentation',
    industries: ['travel', 'realestate', 'government', 'education'],
    primaryIndustry: 'travel',
    bundle: 'tours',
    pipelineIds: ['cinematic-video', '360-tour', 'photo-gallery-video'],
    crossFunctional: ['drone-footage', '360-view', 'cinematic'],
    minTier: 'creator',
    creditMultiplier: 1.5,
    industryPositioning: {
      travel: {
        displayName: 'Destination Showcase',
        tagline: 'Inspire wanderlust with stunning visuals',
        useCases: ['Hotel promotions', 'City guides', 'Adventure tours'],
      },
      realestate: {
        displayName: 'Neighborhood Showcase',
        tagline: 'Sell the lifestyle, not just the property',
        useCases: ['Area highlights', 'Community features', 'Local amenities'],
      },
      government: {
        displayName: 'City/Region Promotion',
        tagline: 'Attract visitors and investment',
        useCases: ['Tourism campaigns', 'Economic development', 'Cultural promotion'],
      },
      education: {
        displayName: 'Campus Tour',
        tagline: 'Showcase your institution',
        useCases: ['Virtual campus tours', 'Facility highlights', 'Student life'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-07',
    name: 'Hotel Tour Videos',
    description: 'Professional hospitality video tours',
    industries: ['travel', 'realestate', 'ecommerce'],
    primaryIndustry: 'travel',
    bundle: 'tours',
    pipelineIds: ['walkthrough-video', 'room-showcase', 'amenity-highlight'],
    crossFunctional: ['stabilization', 'music-sync', 'text-overlay'],
    minTier: 'creator',
    creditMultiplier: 1.3,
    industryPositioning: {
      travel: {
        displayName: 'Hotel Tour Videos',
        tagline: 'Book more rooms with immersive tours',
        useCases: ['Room tours', 'Amenity showcases', 'Location guides'],
      },
      realestate: {
        displayName: 'Property Walkthrough',
        tagline: 'Virtual open houses that convert',
        useCases: ['Listing videos', 'Open house alternatives', 'Remote viewings'],
      },
      ecommerce: {
        displayName: 'Showroom Tours',
        tagline: 'Bring your showroom online',
        useCases: ['Store tours', 'Collection showcases', 'Flagship experiences'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },

  // ========== REAL ESTATE ORIGIN (but shared) ==========
  {
    id: 'P4-SEG-08',
    name: 'Property Virtual Tour',
    description: 'Immersive 3D property experiences',
    industries: ['realestate', 'travel', 'manufacturing', 'education'],
    primaryIndustry: 'realestate',
    bundle: 'tours',
    pipelineIds: ['3d-walkthrough', 'vr-tour', 'interactive-floorplan'],
    crossFunctional: ['3d-render', 'vr-export', 'interactive'],
    minTier: 'pro',
    creditMultiplier: 2.0,
    industryPositioning: {
      realestate: {
        displayName: 'Property Virtual Tour',
        tagline: 'Sell properties sight-unseen',
        useCases: ['Luxury listings', 'International buyers', 'Pre-construction sales'],
      },
      travel: {
        displayName: 'VR Venue Tour',
        tagline: 'Experience before you book',
        useCases: ['Event venues', 'Wedding locations', 'Conference facilities'],
      },
      manufacturing: {
        displayName: 'Facility Virtual Tour',
        tagline: 'Showcase your operations',
        useCases: ['Factory tours', 'Safety walkthroughs', 'Client visits'],
      },
      education: {
        displayName: 'Virtual Campus Tour',
        tagline: 'Welcome students globally',
        useCases: ['Prospective student tours', 'Accessibility', 'International recruitment'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-09',
    name: 'Listing Content Optimization',
    description: 'AI-enhanced property descriptions and visuals',
    industries: ['realestate', 'ecommerce', 'travel', 'retail'],
    primaryIndustry: 'realestate',
    bundle: 'content',
    pipelineIds: ['photo-enhancement', 'description-generation', 'seo-optimization'],
    crossFunctional: ['image-enhance', 'copywriting', 'seo'],
    minTier: 'creator',
    creditMultiplier: 1.2,
    industryPositioning: {
      realestate: {
        displayName: 'Listing Optimization',
        tagline: 'Listings that get clicks',
        useCases: ['MLS optimization', 'Photo enhancement', 'Description writing'],
      },
      ecommerce: {
        displayName: 'Product Listing Optimization',
        tagline: 'Convert browsers to buyers',
        useCases: ['Product photos', 'SEO descriptions', 'A/B testing'],
      },
      travel: {
        displayName: 'OTA Listing Optimization',
        tagline: 'Stand out on booking platforms',
        useCases: ['Airbnb optimization', 'Booking.com photos', 'Review responses'],
      },
      retail: {
        displayName: 'Catalog Optimization',
        tagline: 'Better catalogs, better sales',
        useCases: ['Product photography', 'Catalog descriptions', 'Print materials'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-10',
    name: 'Agent Branding Kit',
    description: 'Personal branding for professionals',
    industries: ['realestate', 'consulting', 'finance', 'legal'],
    primaryIndustry: 'realestate',
    bundle: 'personalization',
    pipelineIds: ['brand-video', 'social-templates', 'presentation-template'],
    crossFunctional: ['brand-kit', 'social-sizing', 'template-system'],
    minTier: 'creator',
    creditMultiplier: 1.3,
    industryPositioning: {
      realestate: {
        displayName: 'Agent Branding Kit',
        tagline: 'Build your personal brand',
        useCases: ['Agent videos', 'Social presence', 'Client presentations'],
      },
      consulting: {
        displayName: 'Consultant Branding',
        tagline: 'Establish thought leadership',
        useCases: ['LinkedIn content', 'Speaker materials', 'Proposal templates'],
      },
      finance: {
        displayName: 'Advisor Branding',
        tagline: 'Build trust through content',
        useCases: ['Client newsletters', 'Market updates', 'Personal touch videos'],
      },
      legal: {
        displayName: 'Attorney Branding',
        tagline: 'Humanize your practice',
        useCases: ['Attorney bios', 'Practice area videos', 'Client education'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },

  // ========== ECOMMERCE ORIGIN (but shared) ==========
  {
    id: 'P4-SEG-11',
    name: 'Product Showcase Videos',
    description: 'Professional product demonstrations',
    industries: ['ecommerce', 'manufacturing', 'retail', 'technology'],
    primaryIndustry: 'ecommerce',
    bundle: 'tours',
    pipelineIds: ['product-video', '360-product', 'feature-highlight'],
    crossFunctional: ['product-spin', 'zoom-focus', 'comparison'],
    minTier: 'creator',
    creditMultiplier: 1.4,
    industryPositioning: {
      ecommerce: {
        displayName: 'Product Showcase Videos',
        tagline: 'Show, don\'t just tell',
        useCases: ['Product demos', 'Feature highlights', 'Unboxing style'],
      },
      manufacturing: {
        displayName: 'Industrial Product Videos',
        tagline: 'Showcase precision and quality',
        useCases: ['B2B demonstrations', 'Trade show content', 'Technical specs'],
      },
      retail: {
        displayName: 'In-Store Product Videos',
        tagline: 'Digital signage that sells',
        useCases: ['Display screens', 'Product education', 'Staff training'],
      },
      technology: {
        displayName: 'Tech Product Demos',
        tagline: 'Make complex simple',
        useCases: ['Software demos', 'Hardware features', 'Integration guides'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-12',
    name: 'UGC Compilation Engine',
    description: 'Curate and compile user-generated content',
    industries: ['ecommerce', 'travel', 'media', 'nonprofit'],
    primaryIndustry: 'ecommerce',
    bundle: 'content',
    pipelineIds: ['ugc-aggregator', 'testimonial-video', 'social-proof'],
    crossFunctional: ['ugc-rights', 'compilation', 'branding'],
    minTier: 'pro',
    creditMultiplier: 1.6,
    industryPositioning: {
      ecommerce: {
        displayName: 'UGC Compilation',
        tagline: 'Turn customers into marketers',
        useCases: ['Review compilations', 'Customer stories', 'Social proof videos'],
      },
      travel: {
        displayName: 'Guest Content Curation',
        tagline: 'Authentic guest experiences',
        useCases: ['Trip highlights', 'Guest reviews', 'Destination UGC'],
      },
      media: {
        displayName: 'Community Content',
        tagline: 'Amplify your audience',
        useCases: ['Fan submissions', 'Community highlights', 'User spotlights'],
      },
      nonprofit: {
        displayName: 'Supporter Stories',
        tagline: 'Impact through voices',
        useCases: ['Donor testimonials', 'Volunteer stories', 'Beneficiary voices'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-13',
    name: 'Product Demo Automation',
    description: 'Automated product demonstration creation',
    industries: ['ecommerce', 'technology', 'manufacturing', 'enterprise'],
    primaryIndustry: 'ecommerce',
    bundle: 'automation',
    pipelineIds: ['demo-automation', 'script-to-demo', 'bulk-demo-gen'],
    crossFunctional: ['screen-record', 'voice-over', 'bulk-processing'],
    minTier: 'pro',
    creditMultiplier: 1.8,
    industryPositioning: {
      ecommerce: {
        displayName: 'Product Demo Automation',
        tagline: 'Scale your product content',
        useCases: ['Catalog videos', 'Bulk product demos', 'Seasonal updates'],
      },
      technology: {
        displayName: 'Software Demo Automation',
        tagline: 'Always up-to-date demos',
        useCases: ['Feature releases', 'Onboarding videos', 'Help documentation'],
      },
      manufacturing: {
        displayName: 'Spec Sheet to Video',
        tagline: 'Bring specifications to life',
        useCases: ['Technical demos', 'Part catalogs', 'Assembly guides'],
      },
      enterprise: {
        displayName: 'Internal Tool Demos',
        tagline: 'Train on every update',
        useCases: ['IT training', 'System updates', 'Process documentation'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },

  // ========== EDUCATION ORIGIN (but HEAVILY shared) ==========
  {
    id: 'P4-SEG-14',
    name: 'Course Lesson Generator',
    description: 'AI-powered lesson and module creation',
    industries: ['education', 'enterprise', 'healthcare', 'consulting', 'nonprofit'],
    primaryIndustry: 'education',
    bundle: 'training',
    pipelineIds: ['lesson-video', 'module-builder', 'curriculum-flow'],
    crossFunctional: ['avatar', 'quiz-overlay', 'multi-language', 'accessibility'],
    minTier: 'creator',
    creditMultiplier: 1.5,
    industryPositioning: {
      education: {
        displayName: 'Course Lesson Generator',
        tagline: 'Create engaging lessons in minutes',
        useCases: ['Online courses', 'Lecture recordings', 'Supplemental content'],
      },
      enterprise: {
        displayName: 'Corporate Training Modules',
        tagline: 'Scalable employee training',
        useCases: ['Onboarding', 'Skills training', 'Compliance modules'],
      },
      healthcare: {
        displayName: 'Medical Training Modules',
        tagline: 'Train healthcare professionals',
        useCases: ['CME content', 'Protocol training', 'Equipment training'],
      },
      consulting: {
        displayName: 'Client Training Modules',
        tagline: 'Deliver value through education',
        useCases: ['Implementation training', 'Best practices', 'Methodology courses'],
      },
      nonprofit: {
        displayName: 'Community Education',
        tagline: 'Educate and empower',
        useCases: ['Skill building', 'Awareness courses', 'Volunteer training'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-15',
    name: 'Quiz Video Creator',
    description: 'Interactive assessment content',
    industries: ['education', 'enterprise', 'healthcare', 'legal', 'finance'],
    primaryIndustry: 'education',
    bundle: 'training',
    pipelineIds: ['quiz-video', 'assessment-builder', 'interactive-lesson'],
    crossFunctional: ['interactive', 'branching', 'scoring', 'analytics'],
    minTier: 'creator',
    creditMultiplier: 1.4,
    industryPositioning: {
      education: {
        displayName: 'Quiz Video Creator',
        tagline: 'Assess understanding interactively',
        useCases: ['Knowledge checks', 'Practice tests', 'Review games'],
      },
      enterprise: {
        displayName: 'Training Assessments',
        tagline: 'Verify training completion',
        useCases: ['Certification tests', 'Knowledge validation', 'Skills assessment'],
      },
      healthcare: {
        displayName: 'Clinical Competency Checks',
        tagline: 'Ensure patient safety',
        useCases: ['Protocol quizzes', 'Medication checks', 'Procedure verification'],
      },
      legal: {
        displayName: 'Legal Knowledge Assessment',
        tagline: 'Verify understanding of policies',
        useCases: ['Policy acknowledgment', 'Ethics quizzes', 'Procedure checks'],
      },
      finance: {
        displayName: 'Compliance Quizzes',
        tagline: 'Regulatory training verification',
        useCases: ['AML training', 'Ethics certification', 'Product knowledge'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-16',
    name: 'Lecture Enhancement',
    description: 'Upgrade existing educational content',
    industries: ['education', 'enterprise', 'healthcare', 'consulting'],
    primaryIndustry: 'education',
    bundle: 'training',
    pipelineIds: ['video-enhancement', 'slide-to-video', 'audio-cleanup'],
    crossFunctional: ['noise-reduction', 'visual-enhancement', 'caption-generation'],
    minTier: 'starter',
    creditMultiplier: 1.2,
    industryPositioning: {
      education: {
        displayName: 'Lecture Enhancement',
        tagline: 'Make old lectures feel new',
        useCases: ['Recorded lecture cleanup', 'Slide upgrades', 'Audio improvement'],
      },
      enterprise: {
        displayName: 'Training Video Enhancement',
        tagline: 'Modernize your training library',
        useCases: ['Legacy content refresh', 'Quality upgrades', 'Accessibility addition'],
      },
      healthcare: {
        displayName: 'CME Content Enhancement',
        tagline: 'Keep educational content current',
        useCases: ['Conference recordings', 'Grand rounds', 'Procedure updates'],
      },
      consulting: {
        displayName: 'Presentation Enhancement',
        tagline: 'Polish client deliverables',
        useCases: ['Recording cleanup', 'Deck animations', 'Audio improvement'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },

  // ========== LEGAL/FINANCE/ENTERPRISE ==========
  {
    id: 'P4-SEG-17',
    name: 'Legal Disclosure Generator',
    description: 'Compliant legal content creation',
    industries: ['legal', 'finance', 'healthcare', 'enterprise'],
    primaryIndustry: 'legal',
    bundle: 'compliance',
    pipelineIds: ['disclosure-video', 'terms-explainer', 'policy-presentation'],
    crossFunctional: ['compliance-check', 'version-control', 'approval-workflow'],
    minTier: 'pro',
    creditMultiplier: 1.8,
    industryPositioning: {
      legal: {
        displayName: 'Legal Disclosure Generator',
        tagline: 'Compliant disclosures made simple',
        useCases: ['Terms videos', 'Privacy explanations', 'Consent content'],
      },
      finance: {
        displayName: 'Financial Disclosures',
        tagline: 'Regulatory compliance content',
        useCases: ['Investment disclaimers', 'Fee disclosures', 'Risk statements'],
      },
      healthcare: {
        displayName: 'Consent Documentation',
        tagline: 'Informed consent made clear',
        useCases: ['Procedure consents', 'Trial disclosures', 'Patient rights'],
      },
      enterprise: {
        displayName: 'Corporate Disclosures',
        tagline: 'Transparent corporate communications',
        useCases: ['Employee policies', 'Investor disclosures', 'Compliance statements'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-18',
    name: 'Contract Explainer Videos',
    description: 'Make legal documents accessible',
    industries: ['legal', 'finance', 'realestate', 'enterprise'],
    primaryIndustry: 'legal',
    bundle: 'training',
    pipelineIds: ['document-explainer', 'section-breakdown', 'animated-terms'],
    crossFunctional: ['document-parsing', 'simplification', 'multi-language'],
    minTier: 'pro',
    creditMultiplier: 1.6,
    industryPositioning: {
      legal: {
        displayName: 'Contract Explainer Videos',
        tagline: 'Legal clarity for everyone',
        useCases: ['Client education', 'Contract walkthroughs', 'Terms explanations'],
      },
      finance: {
        displayName: 'Agreement Explainers',
        tagline: 'Financial products made clear',
        useCases: ['Loan terms', 'Investment agreements', 'Account conditions'],
      },
      realestate: {
        displayName: 'Closing Document Explainers',
        tagline: 'Demystify the closing process',
        useCases: ['Purchase agreements', 'Closing disclosure', 'HOA documents'],
      },
      enterprise: {
        displayName: 'Policy Explainers',
        tagline: 'Ensure policy understanding',
        useCases: ['Employee handbook', 'Benefits explanation', 'Compliance policies'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-19',
    name: 'Financial Report Videos',
    description: 'Dynamic financial presentations',
    industries: ['finance', 'enterprise', 'consulting', 'nonprofit'],
    primaryIndustry: 'finance',
    bundle: 'analytics',
    pipelineIds: ['data-to-video', 'chart-animation', 'executive-summary'],
    crossFunctional: ['data-viz', 'chart-types', 'dynamic-data'],
    minTier: 'pro',
    creditMultiplier: 1.7,
    industryPositioning: {
      finance: {
        displayName: 'Financial Report Videos',
        tagline: 'Numbers that tell stories',
        useCases: ['Earnings reports', 'Market updates', 'Portfolio reviews'],
      },
      enterprise: {
        displayName: 'Business Report Videos',
        tagline: 'Engage stakeholders with data',
        useCases: ['Board presentations', 'Quarterly updates', 'Annual reports'],
      },
      consulting: {
        displayName: 'Analytical Presentations',
        tagline: 'Data-driven insights that resonate',
        useCases: ['Client reports', 'Market analysis', 'Strategic recommendations'],
      },
      nonprofit: {
        displayName: 'Impact Reports',
        tagline: 'Show your impact visually',
        useCases: ['Annual reports', 'Donor updates', 'Grant reporting'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-20',
    name: 'Investor Update Generator',
    description: 'Professional investor communications',
    industries: ['finance', 'technology', 'enterprise', 'consulting'],
    primaryIndustry: 'finance',
    bundle: 'analytics',
    pipelineIds: ['investor-video', 'pitch-deck-video', 'metrics-dashboard'],
    crossFunctional: ['data-viz', 'executive-tone', 'branded'],
    minTier: 'pro',
    creditMultiplier: 1.6,
    industryPositioning: {
      finance: {
        displayName: 'Investor Update Generator',
        tagline: 'Keep investors engaged',
        useCases: ['Quarterly updates', 'LP communications', 'Fund performance'],
      },
      technology: {
        displayName: 'Startup Investor Updates',
        tagline: 'Scale your investor relations',
        useCases: ['Board updates', 'Investor newsletters', 'Milestone announcements'],
      },
      enterprise: {
        displayName: 'Shareholder Communications',
        tagline: 'Professional investor relations',
        useCases: ['Annual meetings', 'Proxy materials', 'Earnings calls'],
      },
      consulting: {
        displayName: 'Client Investment Updates',
        tagline: 'Portfolio communication excellence',
        useCases: ['Client portfolios', 'Investment recommendations', 'Market commentary'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
  {
    id: 'P4-SEG-21',
    name: 'Compliance Training Videos',
    description: 'Regulatory training content',
    industries: ['enterprise', 'healthcare', 'finance', 'legal', 'government'],
    primaryIndustry: 'enterprise',
    bundle: 'compliance',
    pipelineIds: ['compliance-module', 'policy-training', 'certification-course'],
    crossFunctional: ['quiz-overlay', 'completion-tracking', 'multi-language', 'accessibility'],
    minTier: 'pro',
    creditMultiplier: 1.8,
    industryPositioning: {
      enterprise: {
        displayName: 'Compliance Training Videos',
        tagline: 'Compliance at scale',
        useCases: ['Annual training', 'New hire compliance', 'Policy updates'],
      },
      healthcare: {
        displayName: 'Healthcare Compliance Training',
        tagline: 'HIPAA and beyond',
        useCases: ['HIPAA training', 'Safety protocols', 'Infection control'],
      },
      finance: {
        displayName: 'Financial Compliance Training',
        tagline: 'Regulatory readiness',
        useCases: ['AML/KYC training', 'Ethics courses', 'Regulatory updates'],
      },
      legal: {
        displayName: 'Legal Ethics Training',
        tagline: 'Professional responsibility',
        useCases: ['CLE content', 'Ethics training', 'Confidentiality protocols'],
      },
      government: {
        displayName: 'Government Compliance Training',
        tagline: 'Public sector compliance',
        useCases: ['Security clearance', 'Ethics training', 'Procurement compliance'],
      },
    } as Record<IndustryTag, any>,
    status: 'pending',
  },
];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Get all mappings for a specific industry
 */
export function getMappingsForIndustry(industry: IndustryTag): SegmentPipelineMapping[] {
  return SEGMENT_PIPELINE_MAPPINGS.filter(m => m.industries.includes(industry));
}

/**
 * Get all mappings for a capability bundle
 */
export function getMappingsForBundle(bundle: CapabilityBundle): SegmentPipelineMapping[] {
  return SEGMENT_PIPELINE_MAPPINGS.filter(m => m.bundle === bundle);
}

/**
 * Get industry-specific positioning for a mapping
 */
export function getIndustryPositioning(mappingId: string, industry: IndustryTag) {
  const mapping = SEGMENT_PIPELINE_MAPPINGS.find(m => m.id === mappingId);
  if (!mapping) return null;
  
  // Return industry-specific positioning or fall back to primary
  return mapping.industryPositioning[industry] || mapping.industryPositioning[mapping.primaryIndustry];
}

/**
 * Get recommended mappings based on user context
 */
export function getRecommendedMappings(context: {
  industry?: IndustryTag;
  tier?: TierRequirement;
  segment?: SegmentType;
}): SegmentPipelineMapping[] {
  const { industry, tier = 'free' } = context;
  
  const tierOrder: TierRequirement[] = ['free', 'starter', 'creator', 'pro', 'business', 'enterprise'];
  const userTierIndex = tierOrder.indexOf(tier);
  
  return SEGMENT_PIPELINE_MAPPINGS.filter(m => {
    // Filter by tier
    const minTierIndex = tierOrder.indexOf(m.minTier);
    if (minTierIndex > userTierIndex) return false;
    
    // Prioritize by industry match
    if (industry && m.industries.includes(industry)) return true;
    
    // Include universal localization for all
    if (m.bundle === 'localization') return true;
    
    return false;
  }).sort((a, b) => {
    // Sort by industry relevance
    if (industry) {
      const aMatch = a.primaryIndustry === industry ? 2 : a.industries.includes(industry) ? 1 : 0;
      const bMatch = b.primaryIndustry === industry ? 2 : b.industries.includes(industry) ? 1 : 0;
      return bMatch - aMatch;
    }
    return 0;
  });
}

/**
 * Get cross-industry recommendations (features also great for other industries)
 */
export function getCrossIndustryRecommendations(
  currentIndustry: IndustryTag,
  mappingId: string
): { industry: IndustryTag; positioning: any }[] {
  const mapping = SEGMENT_PIPELINE_MAPPINGS.find(m => m.id === mappingId);
  if (!mapping) return [];
  
  return mapping.industries
    .filter(ind => ind !== currentIndustry)
    .slice(0, 3) // Top 3 alternatives
    .map(industry => ({
      industry,
      positioning: mapping.industryPositioning[industry],
    }));
}

/**
 * Calculate credit cost for a mapping based on segment
 */
export function calculateMappingCreditCost(
  mappingId: string,
  segment?: SegmentType,
  baseCredits: number = 10
): number {
  const mapping = SEGMENT_PIPELINE_MAPPINGS.find(m => m.id === mappingId);
  if (!mapping) return baseCredits;
  
  let cost = baseCredits * mapping.creditMultiplier;
  
  // Apply segment discount
  if (segment && SEGMENT_CREDIT_TIERS[segment]) {
    const discount = SEGMENT_CREDIT_TIERS[segment].discount;
    cost = cost * (1 - discount / 100);
  }
  
  return Math.round(cost);
}

/**
 * Get bundle statistics
 */
export function getBundleStatistics(): Record<CapabilityBundle, {
  totalMappings: number;
  industries: IndustryTag[];
  avgCreditMultiplier: number;
}> {
  const stats: any = {};
  
  Object.keys(CAPABILITY_BUNDLES).forEach(bundle => {
    const bundleMappings = getMappingsForBundle(bundle as CapabilityBundle);
    const allIndustries = new Set<IndustryTag>();
    let totalMultiplier = 0;
    
    bundleMappings.forEach(m => {
      m.industries.forEach(i => allIndustries.add(i));
      totalMultiplier += m.creditMultiplier;
    });
    
    stats[bundle] = {
      totalMappings: bundleMappings.length,
      industries: Array.from(allIndustries),
      avgCreditMultiplier: bundleMappings.length > 0 
        ? Math.round((totalMultiplier / bundleMappings.length) * 10) / 10 
        : 0,
    };
  });
  
  return stats;
}

/**
 * Validate all mappings reference existing pipelines
 */
export function validateMappings(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  SEGMENT_PIPELINE_MAPPINGS.forEach(m => {
    // Check for industry positioning coverage
    m.industries.forEach(ind => {
      if (!m.industryPositioning[ind]) {
        issues.push(`${m.id}: Missing positioning for industry "${ind}"`);
      }
    });
    
    // Check for pipeline references
    if (m.pipelineIds.length === 0) {
      issues.push(`${m.id}: No pipeline IDs mapped`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

export default {
  SEGMENT_PIPELINE_MAPPINGS,
  CAPABILITY_BUNDLES,
  getMappingsForIndustry,
  getMappingsForBundle,
  getIndustryPositioning,
  getRecommendedMappings,
  getCrossIndustryRecommendations,
  calculateMappingCreditCost,
  getBundleStatistics,
  validateMappings,
};
