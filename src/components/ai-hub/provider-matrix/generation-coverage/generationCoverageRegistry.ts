/**
 * Generation Coverage Registry - COMPREHENSIVE
 * 
 * Links existing constants to AI capabilities with bidirectional mapping.
 * Programmatically generates mappings from ALL constants (Industries, Frameworks, Visuals, Outputs).
 * This is the single source of truth for Context ↔ Capability relationships.
 */

import { FeatureCategory, ProviderId } from '../types';
import { 
  ContextToCapabilityMapping, 
  CapabilityToContextMapping,
  IndustryId,
  FrameworkId,
  VisualFeatureId,
  OutputFormatId,
  ModelType
} from './types';
import { 
  EXPANDED_VISUAL_FEATURES,
  type ExpandedVisualFeature 
} from '@/components/genie-studio/presentation-generator/constants/expandedVisualFeatures';
import { 
  EXPANDED_FRAMEWORK_CATEGORIES,
  type Framework,
  type FrameworkCategory 
} from '@/components/genie-studio/presentation-generator/constants/expandedFrameworks';
import { 
  EXPANDED_OUTPUT_CONFIGS,
  type ExpandedOutputConfig 
} from '@/components/genie-studio/presentation-generator/constants/expandedOutputTypes';

// ==========================================
// COMPREHENSIVE INDUSTRY DEFINITIONS (25+ Industries)
// ==========================================

interface IndustryDefinition {
  id: IndustryId;
  name: string;
  segment?: string;
  requiredCategories: FeatureCategory[];
  primaryProviders: ProviderId[];
  primaryModels: { type: ModelType; modelIds: string[]; tier: 1 | 2 | 3 }[];
  compatibleFrameworks: string[];
  compatibleOutputs: string[];
  scenarios: string[];
  useCases: string[];
}

const ALL_INDUSTRIES: IndustryDefinition[] = [
  // Healthcare & Life Sciences
  { id: 'healthcare', name: 'Healthcare', segment: 'General', requiredCategories: ['INPUT', 'SCRIPT', 'VOICE'], primaryProviders: ['openai', 'claude', 'elevenlabs'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'claude-3.5'], tier: 3 }], compatibleFrameworks: ['patient-journey', 'value-based-care', 'hipaa-compliance'], compatibleOutputs: ['pdf-export', 'pptx-export', 'video-full'], scenarios: ['Patient education', 'Clinical training', 'Care pathway'], useCases: ['Hospital presentations', 'HCP training', 'Patient onboarding'] },
  { id: 'pharma', name: 'Pharmaceutical', segment: 'Pharma', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE'], primaryProviders: ['openai', 'claude', 'stability'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'claude-3.5'], tier: 3 }], compatibleFrameworks: ['regulatory', 'patient-journey'], compatibleOutputs: ['pdf-export', 'pptx-export', 'print-ready'], scenarios: ['Drug launch', 'Clinical trials', 'Regulatory submission'], useCases: ['MLR reviews', 'KOL presentations', 'Formulary submissions'] },
  { id: 'biotech', name: 'Biotechnology', segment: 'Biotech', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', '3D'], primaryProviders: ['openai', 'claude', 'modelslab'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'gemini-2.5-pro'], tier: 3 }, { type: '3d', modelIds: ['rodin-gen1'], tier: 3 }], compatibleFrameworks: ['regulatory', 'patient-journey'], compatibleOutputs: ['pdf-export', '3d-static', 'interactive'], scenarios: ['Research presentations', 'Investor pitches', 'Scientific publications'], useCases: ['Lab presentations', 'Grant proposals', 'Conference posters'] },
  { id: 'medical-devices', name: 'Medical Devices', segment: 'MedTech', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', '3D', 'VIDEO'], primaryProviders: ['openai', 'modelslab', 'runway'], primaryModels: [{ type: '3d', modelIds: ['meshy-ai', 'triposr'], tier: 2 }], compatibleFrameworks: ['regulatory', 'patient-journey'], compatibleOutputs: ['3d-static', '3d-animated', 'video-full', 'ar-overlay'], scenarios: ['Device demos', 'Surgical training', 'Product launches'], useCases: ['Trade shows', 'Surgeon education', 'Patient guides'] },
  
  // Finance & Insurance
  { id: 'finance', name: 'Finance & Banking', segment: 'Financial Services', requiredCategories: ['INPUT', 'SCRIPT'], primaryProviders: ['openai', 'claude', 'azure'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'claude-3.5'], tier: 3 }], compatibleFrameworks: ['risk-assessment', 'regulatory', 'competitive-analysis'], compatibleOutputs: ['pdf-export', 'pptx-export', 'print-ready'], scenarios: ['Investor relations', 'Board reporting', 'Risk analysis'], useCases: ['Annual reports', 'Quarterly earnings', 'Client proposals'] },
  { id: 'fintech', name: 'FinTech', segment: 'FinTech', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'INTERACTIVE'], primaryProviders: ['openai', 'modelslab'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'deepseek'], tier: 2 }], compatibleFrameworks: ['saas-metrics', 'product-led', 'pirate-metrics'], compatibleOutputs: ['interactive', 'web-embed', 'video-short'], scenarios: ['Product demos', 'API documentation', 'Investor decks'], useCases: ['Pitch decks', 'Onboarding flows', 'Integration guides'] },
  { id: 'insurance', name: 'Insurance', segment: 'Insurance', requiredCategories: ['INPUT', 'SCRIPT'], primaryProviders: ['openai', 'claude', 'azure'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'claude-3.5'], tier: 3 }], compatibleFrameworks: ['risk-assessment', 'regulatory', 'customer-lifecycle'], compatibleOutputs: ['pdf-export', 'pptx-export', 'interactive'], scenarios: ['Policy explanations', 'Claims processing', 'Agent training'], useCases: ['Customer education', 'Underwriting guides', 'Risk reports'] },
  { id: 'banking', name: 'Retail Banking', segment: 'Banking', requiredCategories: ['INPUT', 'SCRIPT', 'VOICE'], primaryProviders: ['openai', 'azure', 'elevenlabs'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'azure-gpt-4'], tier: 3 }], compatibleFrameworks: ['customer-lifecycle', 'regulatory'], compatibleOutputs: ['pdf-export', 'video-short', 'interactive'], scenarios: ['Product education', 'Compliance training', 'Branch materials'], useCases: ['Customer onboarding', 'Teller training', 'Digital banking guides'] },
  
  // Technology & Software
  { id: 'technology', name: 'Technology & SaaS', segment: 'Tech', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO'], primaryProviders: ['openai', 'gemini', 'modelslab', 'runway'], primaryModels: [{ type: 'text', modelIds: ['deepseek', 'gemini-2.5-pro'], tier: 2 }, { type: 'video', modelIds: ['runway-gen3', 'pika-labs'], tier: 2 }], compatibleFrameworks: ['saas-metrics', 'product-led', 'pirate-metrics', 'okr'], compatibleOutputs: ['video-short', 'interactive', 'web-embed', '2d-animated'], scenarios: ['Product launches', 'Feature demos', 'API docs', 'Developer onboarding'], useCases: ['SaaS pitches', 'Product tours', 'Technical docs', 'Tutorials'] },
  { id: 'saas', name: 'SaaS', segment: 'Software', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO', 'INTERACTIVE'], primaryProviders: ['openai', 'modelslab', 'runway'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'deepseek'], tier: 2 }], compatibleFrameworks: ['saas-metrics', 'product-led', 'pirate-metrics'], compatibleOutputs: ['interactive', 'video-short', 'web-embed'], scenarios: ['Onboarding', 'Feature releases', 'Customer success'], useCases: ['In-app guides', 'Release notes', 'Help center videos'] },
  { id: 'ai-ml', name: 'AI & Machine Learning', segment: 'AI', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO', '3D'], primaryProviders: ['openai', 'claude', 'gemini', 'huggingface'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'claude-3.5', 'gemini-2.5-pro'], tier: 3 }], compatibleFrameworks: ['design-thinking', 'lean-startup'], compatibleOutputs: ['interactive', 'video-full', '3d-animated'], scenarios: ['AI demos', 'Model explanations', 'Research presentations'], useCases: ['Conference talks', 'Investor pitches', 'Technical papers'] },
  { id: 'cybersecurity', name: 'Cybersecurity', segment: 'Security', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE'], primaryProviders: ['openai', 'azure'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'azure-gpt-4'], tier: 3 }], compatibleFrameworks: ['risk-assessment', 'regulatory', 'soc2'], compatibleOutputs: ['pdf-export', 'pptx-export', 'interactive'], scenarios: ['Threat briefings', 'Compliance audits', 'Security training'], useCases: ['Executive briefings', 'SOC reports', 'Employee training'] },
  
  // Professional Services
  { id: 'consulting', name: 'Consulting', segment: 'Professional Services', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'TRANSLATION'], primaryProviders: ['openai', 'claude', 'deepl'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'claude-3.5'], tier: 3 }], compatibleFrameworks: ['swot', 'porter-five', 'pestle', 'mece', 'pyramid', 'balanced-scorecard'], compatibleOutputs: ['pdf-export', 'pptx-export', 'print-ready'], scenarios: ['Strategy presentations', 'Client deliverables', 'Workshop facilitation'], useCases: ['Strategic plans', 'Due diligence', 'Market analysis', 'Transformation roadmaps'] },
  { id: 'legal', name: 'Legal', segment: 'Legal', requiredCategories: ['INPUT', 'SCRIPT'], primaryProviders: ['openai', 'claude'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'claude-3.5'], tier: 3 }], compatibleFrameworks: ['regulatory', 'risk-assessment'], compatibleOutputs: ['pdf-export', 'pptx-export'], scenarios: ['Case presentations', 'Contract summaries', 'Compliance training'], useCases: ['Client briefings', 'Legal memos', 'Training materials'] },
  { id: 'professional-services', name: 'Professional Services', segment: 'Services', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE'], primaryProviders: ['openai', 'claude', 'stability'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'claude-3.5'], tier: 3 }], compatibleFrameworks: ['swot', 'competitive-analysis', 'customer-lifecycle'], compatibleOutputs: ['pdf-export', 'pptx-export', 'video-short'], scenarios: ['Client proposals', 'Case studies', 'Thought leadership'], useCases: ['Pitch decks', 'Capability decks', 'Testimonial videos'] },
  
  // Manufacturing & Industrial
  { id: 'manufacturing', name: 'Manufacturing', segment: 'Industrial', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', '3D'], primaryProviders: ['openai', 'modelslab'], primaryModels: [{ type: '3d', modelIds: ['meshy-ai', 'modelslab-3d'], tier: 2 }], compatibleFrameworks: ['lean-manufacturing', 'six-sigma', 'industry-4', 'kaizen'], compatibleOutputs: ['pdf-export', '3d-static', 'video-full', 'ar-overlay'], scenarios: ['Process documentation', 'Safety training', 'Product visualization'], useCases: ['SOPs', 'Assembly guides', 'Trade show demos'] },
  { id: 'automotive', name: 'Automotive', segment: 'Automotive', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', '3D', 'VIDEO', 'AR_VR'], primaryProviders: ['openai', 'modelslab', 'runway'], primaryModels: [{ type: '3d', modelIds: ['rodin-gen1', 'luma-genie'], tier: 3 }], compatibleFrameworks: ['lean-manufacturing', 'six-sigma'], compatibleOutputs: ['3d-animated', 'vr-experience', 'ar-overlay', 'video-full'], scenarios: ['Vehicle configurators', 'Dealer training', 'Customer experience'], useCases: ['Showroom displays', 'Virtual test drives', 'Parts catalogs'] },
  { id: 'aerospace', name: 'Aerospace & Defense', segment: 'Aerospace', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', '3D', 'VIDEO'], primaryProviders: ['openai', 'azure', 'modelslab'], primaryModels: [{ type: '3d', modelIds: ['rodin-gen1', 'csm-3d'], tier: 3 }], compatibleFrameworks: ['regulatory', 'six-sigma'], compatibleOutputs: ['3d-static', '3d-animated', 'vr-experience', 'pdf-export'], scenarios: ['Flight simulations', 'Maintenance training', 'Defense briefings'], useCases: ['Pilot training', 'Technical manuals', 'Mission briefings'] },
  { id: 'energy', name: 'Energy & Utilities', segment: 'Energy', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', '3D'], primaryProviders: ['openai', 'modelslab'], primaryModels: [{ type: '3d', modelIds: ['meshy-ai'], tier: 2 }], compatibleFrameworks: ['eu-sustainability', 'regulatory'], compatibleOutputs: ['pdf-export', '3d-static', 'interactive'], scenarios: ['Safety protocols', 'Infrastructure planning', 'Sustainability reports'], useCases: ['Field guides', 'Investor presentations', 'Community meetings'] },
  
  // Retail & Consumer
  { id: 'retail', name: 'Retail', segment: 'Retail', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO', 'INTERACTIVE'], primaryProviders: ['openai', 'modelslab', 'runway'], primaryModels: [{ type: 'image', modelIds: ['flux-pro', 'dall-e-3'], tier: 2 }], compatibleFrameworks: ['omnichannel', 'customer-lifecycle', 'retail-analytics'], compatibleOutputs: ['social-media', 'video-short', 'interactive', 'ar-overlay'], scenarios: ['Product launches', 'Seasonal campaigns', 'Store displays'], useCases: ['Ad creatives', 'Digital signage', 'AR try-on'] },
  { id: 'ecommerce', name: 'E-commerce', segment: 'E-commerce', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO', 'INTERACTIVE'], primaryProviders: ['openai', 'modelslab', 'elevenlabs'], primaryModels: [{ type: 'image', modelIds: ['flux-pro', 'modelslab-flux'], tier: 2 }], compatibleFrameworks: ['omnichannel', 'pirate-metrics', 'customer-lifecycle'], compatibleOutputs: ['social-media', 'video-short', 'interactive', 'web-embed'], scenarios: ['Product photography', 'Video ads', 'Personalization'], useCases: ['Catalog images', 'TikTok ads', 'Email campaigns'] },
  { id: 'consumer-goods', name: 'Consumer Goods', segment: 'CPG', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO'], primaryProviders: ['openai', 'modelslab', 'runway'], primaryModels: [{ type: 'image', modelIds: ['flux-pro', 'midjourney-v6'], tier: 3 }], compatibleFrameworks: ['customer-lifecycle', 'omnichannel'], compatibleOutputs: ['social-media', 'video-short', 'print-ready'], scenarios: ['Brand campaigns', 'Package design', 'Trade shows'], useCases: ['Print ads', 'Social content', 'Packaging mockups'] },
  { id: 'food-beverage', name: 'Food & Beverage', segment: 'F&B', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO'], primaryProviders: ['openai', 'modelslab'], primaryModels: [{ type: 'image', modelIds: ['flux-pro', 'dall-e-3'], tier: 2 }], compatibleFrameworks: ['customer-lifecycle', 'omnichannel'], compatibleOutputs: ['social-media', 'video-short', 'print-ready', 'ar-overlay'], scenarios: ['Menu design', 'Recipe content', 'Brand campaigns'], useCases: ['Food photography', 'Social media', 'Menu boards'] },
  
  // Education & Research
  { id: 'education', name: 'Education', segment: 'Education', requiredCategories: ['INPUT', 'SCRIPT', 'VOICE', 'IMAGE', 'VIDEO', 'INTERACTIVE'], primaryProviders: ['openai', 'elevenlabs', 'modelslab'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'gemini-2.5-pro'], tier: 2 }, { type: 'voice', modelIds: ['elevenlabs'], tier: 2 }], compatibleFrameworks: ['design-thinking', 'scrum'], compatibleOutputs: ['video-full', 'interactive', 'pptx-export'], scenarios: ['Course creation', 'Student engagement', 'Assessment'], useCases: ['E-learning modules', 'Interactive lessons', 'Educational videos'] },
  { id: 'edtech', name: 'EdTech', segment: 'EdTech', requiredCategories: ['INPUT', 'SCRIPT', 'VOICE', 'IMAGE', 'VIDEO', 'INTERACTIVE'], primaryProviders: ['openai', 'elevenlabs', 'modelslab', 'runway'], primaryModels: [{ type: 'text', modelIds: ['gpt-5'], tier: 3 }, { type: 'video', modelIds: ['runway-gen3'], tier: 3 }], compatibleFrameworks: ['design-thinking', 'product-led', 'pirate-metrics'], compatibleOutputs: ['interactive', 'video-full', 'web-embed'], scenarios: ['Platform demos', 'User onboarding', 'Content creation'], useCases: ['Product tours', 'Tutorial videos', 'Help documentation'] },
  { id: 'training', name: 'Corporate Training', segment: 'L&D', requiredCategories: ['INPUT', 'SCRIPT', 'VOICE', 'VIDEO', 'INTERACTIVE'], primaryProviders: ['openai', 'elevenlabs', 'runway'], primaryModels: [{ type: 'voice', modelIds: ['elevenlabs', 'azure-neural'], tier: 2 }], compatibleFrameworks: ['design-thinking', 'okr'], compatibleOutputs: ['video-full', 'interactive', 'vr-experience'], scenarios: ['Employee onboarding', 'Skills training', 'Compliance'], useCases: ['Training videos', 'Interactive modules', 'VR simulations'] },
  { id: 'research', name: 'Research & Academia', segment: 'Research', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', '3D'], primaryProviders: ['openai', 'claude', 'modelslab'], primaryModels: [{ type: 'text', modelIds: ['gpt-5', 'claude-3.5'], tier: 3 }], compatibleFrameworks: ['design-thinking'], compatibleOutputs: ['pdf-export', 'pptx-export', '3d-static', 'interactive'], scenarios: ['Conference presentations', 'Grant proposals', 'Data visualization'], useCases: ['Research papers', 'Poster presentations', 'Lab reports'] },
  
  // Media & Entertainment
  { id: 'media', name: 'Media', segment: 'Media', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO', 'VOICE', 'AUDIO'], primaryProviders: ['openai', 'runway', 'elevenlabs', 'modelslab'], primaryModels: [{ type: 'video', modelIds: ['openai-sora', 'runway-gen3', 'luma-dream-machine'], tier: 3 }], compatibleFrameworks: ['design-thinking'], compatibleOutputs: ['video-full', 'social-media', '2d-animated'], scenarios: ['Content production', 'News graphics', 'Documentary'], useCases: ['Video content', 'Podcasts', 'Social media'] },
  { id: 'entertainment', name: 'Entertainment', segment: 'Entertainment', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO', 'VOICE', '3D', 'VFX', 'AR_VR'], primaryProviders: ['openai', 'runway', 'elevenlabs', 'modelslab'], primaryModels: [{ type: 'video', modelIds: ['openai-sora', 'runway-gen3'], tier: 3 }, { type: '3d', modelIds: ['rodin-gen1', 'luma-genie'], tier: 3 }], compatibleFrameworks: ['design-thinking'], compatibleOutputs: ['video-full', '3d-animated', 'vr-experience', 'mixed-reality'], scenarios: ['Film production', 'Game assets', 'VFX'], useCases: ['Movie trailers', 'Game cinematics', 'VR experiences'] },
  { id: 'gaming', name: 'Gaming', segment: 'Gaming', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', '3D', 'VIDEO', 'AUDIO', 'AR_VR'], primaryProviders: ['openai', 'modelslab'], primaryModels: [{ type: '3d', modelIds: ['rodin-gen1', 'csm-3d', 'meshy-ai'], tier: 3 }], compatibleFrameworks: ['design-thinking', 'scrum', 'kanban'], compatibleOutputs: ['3d-animated', 'vr-experience', 'interactive'], scenarios: ['Asset creation', 'Trailer production', 'UI design'], useCases: ['Character models', 'Environment art', 'Promotional videos'] },
  { id: 'sports', name: 'Sports', segment: 'Sports', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO'], primaryProviders: ['openai', 'runway', 'modelslab'], primaryModels: [{ type: 'video', modelIds: ['runway-gen3', 'pika-labs'], tier: 2 }], compatibleFrameworks: ['customer-lifecycle'], compatibleOutputs: ['video-short', 'social-media', 'interactive'], scenarios: ['Game highlights', 'Player profiles', 'Fan engagement'], useCases: ['Social clips', 'Broadcast graphics', 'Stadium displays'] },
  { id: 'marketing', name: 'Marketing & Advertising', segment: 'Marketing', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO', 'VOICE'], primaryProviders: ['openai', 'modelslab', 'runway', 'elevenlabs'], primaryModels: [{ type: 'image', modelIds: ['flux-pro', 'midjourney-v6', 'dall-e-3'], tier: 3 }, { type: 'video', modelIds: ['runway-gen3', 'pika-labs'], tier: 2 }], compatibleFrameworks: ['pirate-metrics', 'customer-lifecycle', 'competitive-analysis'], compatibleOutputs: ['video-short', 'social-media', '2d-animated', 'interactive'], scenarios: ['Campaign creation', 'A/B testing', 'Brand refresh'], useCases: ['Ad creatives', 'Social content', 'Landing pages'] },
  
  // Public Sector & Other
  { id: 'government', name: 'Government', segment: 'Public Sector', requiredCategories: ['INPUT', 'SCRIPT'], primaryProviders: ['openai', 'azure'], primaryModels: [{ type: 'text', modelIds: ['azure-gpt-4'], tier: 3 }], compatibleFrameworks: ['regulatory', 'balanced-scorecard'], compatibleOutputs: ['pdf-export', 'pptx-export', 'video-full'], scenarios: ['Policy communication', 'Public information', 'Training'], useCases: ['Town halls', 'Public notices', 'Employee training'] },
  { id: 'nonprofit', name: 'Nonprofit', segment: 'Nonprofit', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO'], primaryProviders: ['openai', 'modelslab'], primaryModels: [{ type: 'text', modelIds: ['gpt-5'], tier: 2 }], compatibleFrameworks: ['balanced-scorecard', 'design-thinking'], compatibleOutputs: ['video-short', 'social-media', 'pdf-export'], scenarios: ['Fundraising', 'Awareness campaigns', 'Impact reports'], useCases: ['Donor presentations', 'Social campaigns', 'Annual reports'] },
  { id: 'real-estate', name: 'Real Estate', segment: 'Real Estate', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', '3D', 'VIDEO', 'AR_VR'], primaryProviders: ['openai', 'modelslab'], primaryModels: [{ type: '3d', modelIds: ['rodin-gen1', 'meshy-ai'], tier: 3 }], compatibleFrameworks: ['customer-lifecycle'], compatibleOutputs: ['3d-static', '3d-animated', 'vr-experience', 'video-full'], scenarios: ['Property tours', 'Development visualization', 'Marketing'], useCases: ['Virtual tours', 'Architectural renders', 'Listing videos'] },
  { id: 'hospitality', name: 'Hospitality', segment: 'Hospitality', requiredCategories: ['INPUT', 'SCRIPT', 'IMAGE', 'VIDEO', 'TRANSLATION'], primaryProviders: ['openai', 'modelslab', 'deepl'], primaryModels: [{ type: 'image', modelIds: ['flux-pro', 'dall-e-3'], tier: 2 }], compatibleFrameworks: ['customer-lifecycle', 'omnichannel'], compatibleOutputs: ['video-short', 'social-media', 'interactive', 'ar-overlay'], scenarios: ['Property marketing', 'Guest experience', 'Staff training'], useCases: ['Virtual tours', 'Booking widgets', 'Concierge AI'] },
];

// ==========================================
// GENERATE INDUSTRY → CAPABILITY MAPPINGS
// ==========================================

function generateIndustryMapping(industry: IndustryDefinition): ContextToCapabilityMapping {
  const requiredFeatures: ContextToCapabilityMapping['requiredFeatures'] = [];
  
  // Map categories to specific features
  if (industry.requiredCategories.includes('INPUT')) {
    requiredFeatures.push({ featureId: 'text_prompt', category: 'INPUT', priority: 'critical' });
    requiredFeatures.push({ featureId: 'document_upload', category: 'INPUT', priority: 'recommended' });
  }
  if (industry.requiredCategories.includes('SCRIPT')) {
    requiredFeatures.push({ featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' });
    requiredFeatures.push({ featureId: 'brand_voice', category: 'SCRIPT', priority: 'optional' });
  }
  if (industry.requiredCategories.includes('IMAGE')) {
    requiredFeatures.push({ featureId: 'ai_image_gen', category: 'IMAGE', priority: 'critical' });
  }
  if (industry.requiredCategories.includes('VIDEO')) {
    requiredFeatures.push({ featureId: 'video_generation', category: 'VIDEO', priority: 'recommended' });
  }
  if (industry.requiredCategories.includes('VOICE')) {
    requiredFeatures.push({ featureId: 'tts', category: 'VOICE', priority: 'recommended' });
  }
  if (industry.requiredCategories.includes('3D')) {
    requiredFeatures.push({ featureId: 'mesh_3d_gen', category: '3D', priority: 'recommended' });
  }
  if (industry.requiredCategories.includes('TRANSLATION')) {
    requiredFeatures.push({ featureId: 'multi_language', category: 'TRANSLATION', priority: 'optional' });
  }
  if (industry.requiredCategories.includes('INTERACTIVE')) {
    requiredFeatures.push({ featureId: 'interactive_elements', category: 'INTERACTIVE', priority: 'optional' });
  }
  if (industry.requiredCategories.includes('AR_VR')) {
    requiredFeatures.push({ featureId: 'ar_vr_export', category: 'AR_VR', priority: 'optional' });
  }
  
  // Build provider recommendations
  const recommendedProviders: ContextToCapabilityMapping['recommendedProviders'] = {};
  
  const textProviders = industry.primaryProviders.filter(p => ['openai', 'claude', 'gemini', 'deepseek', 'azure', 'alibaba'].includes(p));
  const imageProviders = industry.primaryProviders.filter(p => ['modelslab', 'stability', 'replicate'].includes(p));
  const videoProviders = industry.primaryProviders.filter(p => ['runway', 'modelslab', 'pika'].includes(p));
  const voiceProviders = industry.primaryProviders.filter(p => ['elevenlabs', 'azure'].includes(p));
  const transProviders = industry.primaryProviders.filter(p => ['deepl', 'azure'].includes(p));
  
  if (textProviders.length > 0) recommendedProviders.text = [{ providers: textProviders, reason: `${industry.name} content expertise` }];
  if (imageProviders.length > 0 || industry.requiredCategories.includes('IMAGE')) recommendedProviders.image = [{ providers: imageProviders.length > 0 ? imageProviders : ['modelslab', 'stability'], reason: `${industry.name} visual quality` }];
  if (videoProviders.length > 0 || industry.requiredCategories.includes('VIDEO')) recommendedProviders.video = [{ providers: videoProviders.length > 0 ? videoProviders : ['modelslab', 'runway'], reason: `${industry.name} video production` }];
  if (voiceProviders.length > 0 || industry.requiredCategories.includes('VOICE')) recommendedProviders.voice = [{ providers: voiceProviders.length > 0 ? voiceProviders : ['elevenlabs'], reason: 'Professional narration' }];
  if (transProviders.length > 0 || industry.requiredCategories.includes('TRANSLATION')) recommendedProviders.translation = [{ providers: transProviders.length > 0 ? transProviders : ['deepl'], reason: 'Multi-language support' }];
  
  return {
    contextType: 'industry',
    contextId: industry.id,
    contextName: industry.name,
    requiredFeatures,
    recommendedProviders,
    recommendedModels: industry.primaryModels.map(m => ({
      type: m.type,
      modelIds: m.modelIds,
      reason: `${industry.name} optimized`,
      tier: m.tier
    })),
    compatibleWith: {
      frameworks: industry.compatibleFrameworks as FrameworkId[],
      outputs: industry.compatibleOutputs as OutputFormatId[]
    },
    constraints: [],
    scenarios: industry.scenarios,
    useCases: industry.useCases
  };
}

export const INDUSTRY_CAPABILITY_MAPPINGS: ContextToCapabilityMapping[] = ALL_INDUSTRIES.map(generateIndustryMapping);

// ==========================================
// GENERATE FRAMEWORK → CAPABILITY MAPPINGS
// ==========================================

function generateFrameworkMapping(framework: Framework, category: FrameworkCategory): ContextToCapabilityMapping {
  const isStrategy = category.type === 'consulting' || category.type === 'methodology';
  const isIndustry = category.type === 'industry';
  const isRegional = category.type === 'regional';
  
  const requiredFeatures: ContextToCapabilityMapping['requiredFeatures'] = [
    { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
    { featureId: 'ai_image_gen', category: 'IMAGE', priority: isStrategy ? 'critical' : 'recommended' }
  ];
  
  if (isIndustry) {
    if (category.id === 'healthcare') {
      requiredFeatures.push({ featureId: 'tts', category: 'VOICE', priority: 'recommended' });
    }
  }
  
  if (isRegional) {
    requiredFeatures.push({ featureId: 'multi_language', category: 'TRANSLATION', priority: 'critical' });
  }
  
  // Expanded provider coverage based on framework type and region
  const textProviders: ProviderId[] = isStrategy 
    ? ['openai', 'claude', 'gemini'] 
    : isRegional 
      ? ['openai', 'deepseek', 'alibaba'] 
      : ['openai', 'gemini', 'deepseek'];
  
  const translationProviders: ProviderId[] = ['deepl', 'google', 'alibaba'];
  
  return {
    contextType: 'framework',
    contextId: framework.id,
    contextName: framework.name,
    requiredFeatures,
    recommendedProviders: {
      text: [{ providers: textProviders, reason: `${framework.name} analysis` }],
      image: [{ providers: ['modelslab', 'stability', 'openai'], reason: 'Framework diagrams' }],
      translation: isRegional ? [{ providers: translationProviders, reason: 'Regional localization' }] : undefined
    },
    recommendedModels: [
      { type: 'text', modelIds: ['gpt-4o', 'claude-3.5-sonnet', 'gemini-2.0-flash'], reason: `${framework.name} depth`, tier: framework.tier as 1 | 2 | 3 },
      { type: 'image', modelIds: ['flux-pro', 'dall-e-3', 'modelslab-flux'], reason: 'Diagram quality', tier: 2 },
      ...(isRegional ? [{ type: 'translation' as ModelType, modelIds: ['deepl-pro', 'google-translate', 'alibaba-translate'], reason: 'Localization', tier: 1 as const }] : [])
    ],
    compatibleWith: {
      industries: isIndustry ? [category.id as IndustryId] : ['consulting', 'finance', 'technology'] as IndustryId[],
      visuals: ['charts', 'diagrams', 'infographics'] as VisualFeatureId[],
      outputs: ['pdf-export', 'pptx-export', 'interactive'] as OutputFormatId[]
    },
    constraints: [],
    scenarios: [framework.description, `${category.name} analysis`, `${framework.name} strategic planning`],
    useCases: [`${framework.name} presentations`, `${category.name} deliverables`, `Executive briefings`]
  };
}

export const FRAMEWORK_CAPABILITY_MAPPINGS: ContextToCapabilityMapping[] = EXPANDED_FRAMEWORK_CATEGORIES.flatMap(
  category => category.frameworks.map(framework => generateFrameworkMapping(framework, category))
);

// ==========================================
// GENERATE VISUAL → CAPABILITY MAPPINGS
// ==========================================

function generateVisualMapping(visual: ExpandedVisualFeature): ContextToCapabilityMapping {
  const is3D = visual.category === '3d-ar';
  const isInteractive = visual.category === 'interactive';
  const isMedia = visual.category === 'media';
  const isData = visual.category === 'data';
  const isLayout = visual.category === 'layout';
  
  const requiredFeatures: ContextToCapabilityMapping['requiredFeatures'] = [];
  const constraints: ContextToCapabilityMapping['constraints'] = [];
  
  if (isData) {
    requiredFeatures.push({ featureId: 'ai_image_gen', category: 'IMAGE', priority: 'critical' });
    requiredFeatures.push({ featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'recommended' });
  }
  if (is3D) {
    requiredFeatures.push({ featureId: 'mesh_3d_gen', category: '3D', priority: 'critical' });
    requiredFeatures.push({ featureId: '3d_animation', category: '3D', priority: 'recommended' });
    constraints.push({ contextType: 'output', contextId: 'pdf-export', severity: 'warning', reason: '3D rendered as static in PDF' });
  }
  if (isMedia && visual.id === 'video-clips') {
    requiredFeatures.push({ featureId: 'video_generation', category: 'VIDEO', priority: 'critical' });
    constraints.push({ contextType: 'output', contextId: 'pdf-export', severity: 'incompatible', reason: 'PDF cannot contain video' });
  }
  if (isMedia && visual.id === 'animations') {
    requiredFeatures.push({ featureId: 'motion_graphics', category: 'ANIMATION', priority: 'critical' });
  }
  if (isMedia && visual.id === 'audio') {
    requiredFeatures.push({ featureId: 'tts', category: 'VOICE', priority: 'critical' });
    requiredFeatures.push({ featureId: 'background_music', category: 'AUDIO', priority: 'recommended' });
  }
  if (isInteractive) {
    requiredFeatures.push({ featureId: 'interactive_elements', category: 'INTERACTIVE', priority: 'critical' });
    constraints.push({ contextType: 'output', contextId: 'pdf-export', severity: 'warning', reason: 'Interactive elements not in PDF' });
  }
  if (isLayout) {
    requiredFeatures.push({ featureId: 'ai_image_gen', category: 'IMAGE', priority: 'recommended' });
  }
  
  // Default to image gen if no specific requirements
  if (requiredFeatures.length === 0) {
    requiredFeatures.push({ featureId: 'ai_image_gen', category: 'IMAGE', priority: 'recommended' });
  }
  
  // Build compatible outputs based on visual type
  let compatibleOutputs: OutputFormatId[] = ['pptx-export', '2d-static', 'pdf-export'];
  if (is3D) compatibleOutputs = ['3d-static', '3d-animated', 'vr-experience', 'ar-overlay', 'mixed-reality'];
  if (isMedia && (visual.id === 'video-clips' || visual.id === 'animations')) compatibleOutputs = ['video-short', 'video-full', 'social-media', '2d-animated'];
  if (isInteractive) compatibleOutputs = ['interactive', 'web-embed'];
  
  return {
    contextType: 'visual',
    contextId: visual.id,
    contextName: visual.name,
    requiredFeatures,
    recommendedProviders: {
      image: [{ providers: ['modelslab', 'stability', 'openai', 'replicate'], reason: visual.description }],
      ...(is3D && { mesh3d: [{ providers: ['modelslab', 'replicate', 'huggingface'], reason: '3D generation' }] }),
      ...(isMedia && visual.id.includes('video') && { video: [{ providers: ['modelslab', 'runway', 'alibaba'], reason: 'Video generation' }] }),
      ...(isMedia && visual.id === 'audio' && { voice: [{ providers: ['elevenlabs', 'openai', 'google', 'alibaba'], reason: 'Audio generation' }] })
    },
    recommendedModels: [
      { type: 'image', modelIds: ['flux-pro', 'dall-e-3', 'modelslab-flux', 'stable-diffusion-xl'], reason: visual.description, tier: visual.tier },
      ...(is3D ? [{ type: '3d' as ModelType, modelIds: ['meshy-ai', 'rodin-gen1', 'triposr', 'luma-genie'], reason: '3D models', tier: visual.tier }] : []),
      ...(isMedia && visual.id.includes('video') ? [{ type: 'video' as ModelType, modelIds: ['runway-gen3', 'openai-sora', 'pika-labs', 'luma-dream-machine'], reason: 'Video gen', tier: visual.tier }] : []),
      ...(isMedia && visual.id === 'audio' ? [{ type: 'voice' as ModelType, modelIds: ['elevenlabs', 'azure-neural', 'openai-tts', 'alibaba-cosyvoice'], reason: 'Audio gen', tier: visual.tier }] : [])
    ],
    compatibleWith: {
      outputs: compatibleOutputs
    },
    constraints,
    scenarios: visual.subOptions.slice(0, 4).map(s => s.name),
    useCases: [`${visual.name} creation`, `${visual.category} design`, `${visual.name} editing`]
  };
}

export const VISUAL_CAPABILITY_MAPPINGS: ContextToCapabilityMapping[] = EXPANDED_VISUAL_FEATURES.map(generateVisualMapping);

// ==========================================
// GENERATE OUTPUT → CAPABILITY MAPPINGS
// ==========================================

function generateOutputMapping(output: ExpandedOutputConfig): ContextToCapabilityMapping {
  const requiredFeatures: ContextToCapabilityMapping['requiredFeatures'] = [
    { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
    { featureId: 'ai_image_gen', category: 'IMAGE', priority: 'critical' }
  ];
  
  if (output.requiresVideo) {
    requiredFeatures.push({ featureId: 'video_generation', category: 'VIDEO', priority: 'critical' });
    requiredFeatures.push({ featureId: 'video_editing', category: 'VIDEO', priority: 'recommended' });
  }
  if (output.requiresVoice) {
    requiredFeatures.push({ featureId: 'tts', category: 'VOICE', priority: 'critical' });
    requiredFeatures.push({ featureId: 'background_music', category: 'AUDIO', priority: 'recommended' });
  }
  if (output.requires3D) {
    requiredFeatures.push({ featureId: 'mesh_3d_gen', category: '3D', priority: 'critical' });
    requiredFeatures.push({ featureId: '3d_animation', category: '3D', priority: 'recommended' });
  }
  
  // Add export-specific features
  if (output.category === 'document') {
    requiredFeatures.push({ featureId: 'pdf_export', category: 'EXPORT', priority: 'critical' });
  }
  if (output.category === 'interactive' || output.category === 'immersive') {
    requiredFeatures.push({ featureId: 'interactive_elements', category: 'INTERACTIVE', priority: 'critical' });
  }
  
  const constraints: ContextToCapabilityMapping['constraints'] = [];
  
  // Add constraints for incompatible visual features
  if (output.category === 'document' || output.id === 'pdf-export') {
    constraints.push({ contextType: 'visual', contextId: 'video-clips', severity: 'incompatible', reason: 'PDF cannot contain video' });
    constraints.push({ contextType: 'visual', contextId: 'realtime', severity: 'incompatible', reason: 'PDF cannot contain realtime features' });
    constraints.push({ contextType: 'visual', contextId: 'clickable', severity: 'warning', reason: 'Limited interactivity in PDF' });
  }
  if (output.category === 'video') {
    constraints.push({ contextType: 'visual', contextId: 'data-filters', severity: 'incompatible', reason: 'Interactive filters not in video' });
    constraints.push({ contextType: 'visual', contextId: 'forms', severity: 'incompatible', reason: 'Forms not in video' });
  }
  
  // Enhanced provider mapping with full coverage
  const imageProviders: ProviderId[] = ['modelslab', 'openai', 'stability', 'replicate'];
  const videoProviders: ProviderId[] = ['modelslab', 'runway', 'alibaba'];
  const voiceProviders: ProviderId[] = ['elevenlabs', 'openai', 'google', 'alibaba'];
  const mesh3dProviders: ProviderId[] = ['modelslab', 'replicate', 'huggingface'];
  
  return {
    contextType: 'output',
    contextId: output.id,
    contextName: output.name,
    requiredFeatures,
    recommendedProviders: {
      image: [{ providers: imageProviders.slice(0, 3), reason: output.description }],
      text: [{ providers: ['openai', 'claude', 'gemini'] as ProviderId[], reason: 'Script generation' }],
      ...(output.requiresVideo && { video: [{ providers: videoProviders, reason: 'Video generation' }] }),
      ...(output.requiresVoice && { voice: [{ providers: voiceProviders, reason: 'Voice narration' }] }),
      ...(output.requires3D && { mesh3d: [{ providers: mesh3dProviders, reason: '3D models' }] })
    },
    recommendedModels: [
      { type: 'text', modelIds: ['gpt-4o', 'claude-3.5-sonnet', 'gemini-2.0-flash'], reason: 'Script quality', tier: output.tier },
      { type: 'image', modelIds: ['flux-pro', 'dall-e-3', 'modelslab-flux', 'stable-diffusion-xl'], reason: output.description, tier: output.tier },
      ...(output.requiresVideo ? [{ type: 'video' as ModelType, modelIds: ['runway-gen3', 'openai-sora', 'pika-labs', 'alibaba-wan'], reason: 'Video quality', tier: output.tier }] : []),
      ...(output.requiresVoice ? [{ type: 'voice' as ModelType, modelIds: ['elevenlabs', 'openai-tts', 'azure-neural', 'alibaba-cosyvoice'], reason: 'Voice quality', tier: output.tier }] : []),
      ...(output.requires3D ? [{ type: '3d' as ModelType, modelIds: ['meshy-ai', 'rodin-gen1', 'triposr', 'luma-genie'], reason: '3D quality', tier: output.tier }] : [])
    ],
    compatibleWith: {
      visuals: output.category === 'video' 
        ? ['video-clips', 'animations', 'images'] as VisualFeatureId[]
        : output.category === '3d' || output.category === 'immersive'
          ? ['3d-objects', '3d-scenes', '3d-animations', 'ar-elements'] as VisualFeatureId[]
          : ['charts', 'diagrams', 'infographics', 'images', 'quote-blocks'] as VisualFeatureId[]
    },
    constraints,
    scenarios: [...output.capabilities.slice(0, 3), `${output.name} production`],
    useCases: [...output.exportFormats.map(f => `${f.toUpperCase()} export`), `${output.category} publishing`]
  };
}

export const OUTPUT_CAPABILITY_MAPPINGS: ContextToCapabilityMapping[] = EXPANDED_OUTPUT_CONFIGS.map(generateOutputMapping);

// ==========================================
// COMPREHENSIVE FEATURE → CONTEXT MAPPINGS
// ==========================================

const ALL_FEATURE_IDS = [
  // INPUT
  { id: 'text_prompt', name: 'Text Prompt', category: 'INPUT' as FeatureCategory },
  { id: 'document_upload', name: 'Document Upload', category: 'INPUT' as FeatureCategory },
  { id: 'image_upload', name: 'Image Upload', category: 'INPUT' as FeatureCategory },
  { id: 'video_upload', name: 'Video Upload', category: 'INPUT' as FeatureCategory },
  { id: 'audio_upload', name: 'Audio Upload', category: 'INPUT' as FeatureCategory },
  { id: 'url_import', name: 'URL Import', category: 'INPUT' as FeatureCategory },
  { id: 'screen_recording', name: 'Screen Recording', category: 'INPUT' as FeatureCategory },
  
  // SCRIPT
  { id: 'ai_script_gen', name: 'AI Script Generation', category: 'SCRIPT' as FeatureCategory },
  { id: 'brand_voice', name: 'Brand Voice', category: 'SCRIPT' as FeatureCategory },
  { id: 'tone_control', name: 'Tone Control', category: 'SCRIPT' as FeatureCategory },
  { id: 'script_to_slides', name: 'Script to Slides', category: 'SCRIPT' as FeatureCategory },
  { id: 'outline_generation', name: 'Outline Generation', category: 'SCRIPT' as FeatureCategory },
  
  // VOICE
  { id: 'tts', name: 'Text-to-Speech', category: 'VOICE' as FeatureCategory },
  { id: 'voice_cloning', name: 'Voice Cloning', category: 'VOICE' as FeatureCategory },
  { id: 'multi_language_voice', name: 'Multi-Language Voice', category: 'VOICE' as FeatureCategory },
  { id: 'voice_styles', name: 'Voice Styles', category: 'VOICE' as FeatureCategory },
  
  // AUDIO
  { id: 'background_music', name: 'Background Music', category: 'AUDIO' as FeatureCategory },
  { id: 'sound_effects', name: 'Sound Effects', category: 'AUDIO' as FeatureCategory },
  { id: 'audio_mixing', name: 'Audio Mixing', category: 'AUDIO' as FeatureCategory },
  
  // IMAGE
  { id: 'ai_image_gen', name: 'AI Image Generation', category: 'IMAGE' as FeatureCategory },
  { id: 'image_editing', name: 'Image Editing', category: 'IMAGE' as FeatureCategory },
  { id: 'style_transfer', name: 'Style Transfer', category: 'IMAGE' as FeatureCategory },
  { id: 'background_removal', name: 'Background Removal', category: 'IMAGE' as FeatureCategory },
  
  // VIDEO
  { id: 'video_generation', name: 'AI Video Generation', category: 'VIDEO' as FeatureCategory },
  { id: 'avatar_generation', name: 'Avatar Generation', category: 'VIDEO' as FeatureCategory },
  { id: 'lip_sync', name: 'Lip Sync', category: 'VIDEO' as FeatureCategory },
  { id: 'video_editing', name: 'Video Editing', category: 'VIDEO' as FeatureCategory },
  
  // ANIMATION
  { id: 'motion_graphics', name: 'Motion Graphics', category: 'ANIMATION' as FeatureCategory },
  { id: 'transitions', name: 'Transitions', category: 'ANIMATION' as FeatureCategory },
  { id: 'lottie_support', name: 'Lottie Support', category: 'ANIMATION' as FeatureCategory },
  
  // 3D
  { id: 'mesh_3d_gen', name: '3D Mesh Generation', category: '3D' as FeatureCategory },
  { id: '3d_animation', name: '3D Animation', category: '3D' as FeatureCategory },
  { id: '3d_scene_composition', name: '3D Scene Composition', category: '3D' as FeatureCategory },
  
  // AR_VR
  { id: 'ar_vr_export', name: 'AR/VR Export', category: 'AR_VR' as FeatureCategory },
  { id: 'spatial_audio', name: 'Spatial Audio', category: 'AR_VR' as FeatureCategory },
  
  // VFX
  { id: 'particle_effects', name: 'Particle Effects', category: 'VFX' as FeatureCategory },
  { id: 'compositing', name: 'Compositing', category: 'VFX' as FeatureCategory },
  
  // INTERACTIVE
  { id: 'interactive_elements', name: 'Interactive Elements', category: 'INTERACTIVE' as FeatureCategory },
  { id: 'forms_inputs', name: 'Forms & Inputs', category: 'INTERACTIVE' as FeatureCategory },
  { id: 'quizzes', name: 'Quizzes', category: 'INTERACTIVE' as FeatureCategory },
  
  // TRANSLATION
  { id: 'multi_language', name: 'Multi-Language', category: 'TRANSLATION' as FeatureCategory },
  { id: 'subtitle_gen', name: 'Subtitle Generation', category: 'TRANSLATION' as FeatureCategory },
  
  // EXPORT
  { id: 'pdf_export', name: 'PDF Export', category: 'EXPORT' as FeatureCategory },
  { id: 'pptx_export', name: 'PPTX Export', category: 'EXPORT' as FeatureCategory },
  { id: 'video_export', name: 'Video Export', category: 'EXPORT' as FeatureCategory },
  { id: 'web_embed', name: 'Web Embed', category: 'EXPORT' as FeatureCategory },
];

function generateFeatureContextMapping(featureDef: { id: string; name: string; category: FeatureCategory }): CapabilityToContextMapping {
  // Find which industries use this feature
  const usedByIndustries = INDUSTRY_CAPABILITY_MAPPINGS
    .filter(m => m.requiredFeatures.some(f => f.featureId === featureDef.id))
    .map(m => ({ id: m.contextId as IndustryId, priority: m.requiredFeatures.find(f => f.featureId === featureDef.id)?.priority === 'critical' ? 'primary' as const : 'secondary' as const }));
  
  // Find which frameworks use this feature
  const usedByFrameworks = FRAMEWORK_CAPABILITY_MAPPINGS
    .filter(m => m.requiredFeatures.some(f => f.featureId === featureDef.id))
    .slice(0, 10) // Limit for performance
    .map(m => ({ id: m.contextId as FrameworkId, priority: 'primary' as const }));
  
  // Find which visuals use this feature  
  const usedByVisuals = VISUAL_CAPABILITY_MAPPINGS
    .filter(m => m.requiredFeatures.some(f => f.featureId === featureDef.id))
    .map(m => ({ id: m.contextId as VisualFeatureId, priority: 'primary' as const }));
  
  // Find which outputs use this feature
  const usedByOutputs = OUTPUT_CAPABILITY_MAPPINGS
    .filter(m => m.requiredFeatures.some(f => f.featureId === featureDef.id))
    .map(m => ({ id: m.contextId as OutputFormatId, priority: 'primary' as const }));
  
  // Define dependencies
  const dependsOn: CapabilityToContextMapping['dependsOn'] = [];
  const enablesFeatures: CapabilityToContextMapping['enablesFeatures'] = [];
  
  // Define common dependencies
  if (featureDef.id === 'tts') {
    dependsOn.push({ featureId: 'ai_script_gen', category: 'SCRIPT' });
    enablesFeatures.push({ featureId: 'voice_cloning', category: 'VOICE' });
    enablesFeatures.push({ featureId: 'multi_language_voice', category: 'VOICE' });
  }
  if (featureDef.id === 'video_generation') {
    dependsOn.push({ featureId: 'ai_image_gen', category: 'IMAGE' });
    enablesFeatures.push({ featureId: 'avatar_generation', category: 'VIDEO' });
  }
  if (featureDef.id === 'mesh_3d_gen') {
    dependsOn.push({ featureId: 'ai_image_gen', category: 'IMAGE' });
    enablesFeatures.push({ featureId: '3d_animation', category: '3D' });
    enablesFeatures.push({ featureId: 'ar_vr_export', category: 'AR_VR' });
  }
  if (featureDef.id === 'ai_script_gen') {
    dependsOn.push({ featureId: 'text_prompt', category: 'INPUT' });
    enablesFeatures.push({ featureId: 'tts', category: 'VOICE' });
    enablesFeatures.push({ featureId: 'multi_language', category: 'TRANSLATION' });
  }
  if (featureDef.id === 'voice_cloning') {
    dependsOn.push({ featureId: 'tts', category: 'VOICE' });
  }
  if (featureDef.id === 'avatar_generation') {
    dependsOn.push({ featureId: 'video_generation', category: 'VIDEO' });
    dependsOn.push({ featureId: 'tts', category: 'VOICE' });
  }
  
  return {
    featureId: featureDef.id,
    featureName: featureDef.name,
    category: featureDef.category,
    usedByIndustries,
    usedByFrameworks,
    usedByTemplates: [], // Will be expanded when templates are added
    usedByVisuals,
    usedByOutputs,
    dependsOn,
    enablesFeatures
  };
}

export const FEATURE_CONTEXT_MAPPINGS: CapabilityToContextMapping[] = ALL_FEATURE_IDS.map(generateFeatureContextMapping);

// ==========================================
// AGGREGATED REGISTRY
// ==========================================

export const GENERATION_COVERAGE_REGISTRY = {
  industries: INDUSTRY_CAPABILITY_MAPPINGS,
  frameworks: FRAMEWORK_CAPABILITY_MAPPINGS,
  visuals: VISUAL_CAPABILITY_MAPPINGS,
  outputs: OUTPUT_CAPABILITY_MAPPINGS,
  features: FEATURE_CONTEXT_MAPPINGS,
  
  getMappingsByType(type: 'industry' | 'framework' | 'template' | 'visual' | 'output') {
    switch (type) {
      case 'industry': return this.industries;
      case 'framework': return this.frameworks;
      case 'visual': return this.visuals;
      case 'output': return this.outputs;
      default: return [];
    }
  },
  
  getFeatureMapping(featureId: string) {
    return this.features.find(f => f.featureId === featureId);
  },
  
  getContextsUsingFeature(featureId: string) {
    return [...this.industries, ...this.frameworks, ...this.visuals, ...this.outputs]
      .filter(m => m.requiredFeatures.some(f => f.featureId === featureId));
  },
  
  validateCombination(industries: string[], frameworks: string[], visuals: string[], outputs: string[]) {
    const warnings: { context: string; reason: string; severity: string }[] = [];
    
    for (const visualId of visuals) {
      const visualMapping = this.visuals.find(v => v.contextId === visualId);
      if (!visualMapping) continue;
      
      for (const outputId of outputs) {
        const constraint = visualMapping.constraints.find(c => c.contextType === 'output' && c.contextId === outputId);
        if (constraint) {
          warnings.push({ context: `${visualId} + ${outputId}`, reason: constraint.reason, severity: constraint.severity });
        }
      }
    }
    
    return { isValid: warnings.filter(w => w.severity === 'incompatible').length === 0, warnings };
  }
};

// ==========================================
// DYNAMIC STATS FUNCTION
// ==========================================

export function getGenerationCoverageStats(categoryFilter?: string) {
  const allScenarios = new Set<string>();
  const allUseCases = new Set<string>();
  const allProviders = new Set<string>();
  const allModels = new Set<string>();
  
  const forwardMappings = [...INDUSTRY_CAPABILITY_MAPPINGS, ...FRAMEWORK_CAPABILITY_MAPPINGS, ...VISUAL_CAPABILITY_MAPPINGS, ...OUTPUT_CAPABILITY_MAPPINGS];
  
  forwardMappings.forEach(mapping => {
    mapping.scenarios.forEach(s => allScenarios.add(s));
    mapping.useCases.forEach(u => allUseCases.add(u));
    Object.values(mapping.recommendedProviders).forEach(providerList => {
      if (providerList) providerList.forEach(p => p.providers.forEach(provider => allProviders.add(provider)));
    });
    mapping.recommendedModels.forEach(m => m.modelIds.forEach(model => allModels.add(model)));
  });
  
  const categoryFeatures = categoryFilter && categoryFilter !== 'all'
    ? FEATURE_CONTEXT_MAPPINGS.filter(f => f.category === categoryFilter)
    : FEATURE_CONTEXT_MAPPINGS;
  
  const crossDependencies = categoryFeatures.reduce((sum, f) => sum + f.dependsOn.length + f.enablesFeatures.length, 0);
  
  return {
    industries: INDUSTRY_CAPABILITY_MAPPINGS.length,
    frameworks: FRAMEWORK_CAPABILITY_MAPPINGS.length,
    visuals: VISUAL_CAPABILITY_MAPPINGS.length,
    outputs: OUTPUT_CAPABILITY_MAPPINGS.length,
    features: categoryFeatures.length,
    totalMappings: forwardMappings.length,
    scenarios: allScenarios.size,
    useCases: allUseCases.size,
    providers: allProviders.size,
    models: allModels.size,
    crossDependencies,
    // Sub-option counts
    visualSubOptions: EXPANDED_VISUAL_FEATURES.reduce((sum, v) => sum + v.subOptions.length, 0),
    frameworkCategories: EXPANDED_FRAMEWORK_CATEGORIES.length
  };
}

export default GENERATION_COVERAGE_REGISTRY;
