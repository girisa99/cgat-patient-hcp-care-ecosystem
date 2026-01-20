/**
 * Universal Smart Tooltip Context
 * Context-aware tooltip system for the entire Genie Deck application
 * Provides explanations for every task, function, and flow
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

// Tooltip definition for each feature/function
export interface TooltipDefinition {
  id: string;
  title: string;
  description: string;
  category: 'wizard' | 'generation' | 'output' | 'credits' | 'models' | 'languages' | 'templates' | 'review' | 'export' | 'navigation';
  learnMoreUrl?: string;
  keyboardShortcut?: string;
  relatedFeatures?: string[];
  tips?: string[];
}

// Comprehensive tooltip definitions for Genie Deck
export const GENIE_DECK_TOOLTIPS: Record<string, TooltipDefinition> = {
  // === WIZARD STEPS ===
  'wizard.step0': {
    id: 'wizard.step0',
    title: 'Content Input',
    description: 'Enter your presentation topic, upload documents, or provide a URL. The AI analyzes your input to understand the context and generate relevant content.',
    category: 'wizard',
    tips: [
      'Be specific about your topic for better results',
      'Upload PDFs or documents for richer context',
      'URLs are scraped for relevant content'
    ],
  },
  'wizard.step1': {
    id: 'wizard.step1',
    title: 'Configuration',
    description: 'Select your industry, audience segment, and content types. This helps the AI tailor the presentation style, terminology, and visual approach to your specific domain.',
    category: 'wizard',
    tips: [
      'AI Auto mode selects optimal settings based on your input',
      'Industry selection affects terminology and visuals',
      'Segment determines the complexity level'
    ],
  },
  'wizard.step2': {
    id: 'wizard.step2',
    title: 'Template & Branding',
    description: 'Choose consulting frameworks, visual features, and branding elements. Frameworks provide structured methodologies while branding ensures consistency with your identity.',
    category: 'wizard',
    tips: [
      'Select multiple frameworks for comprehensive analysis',
      'Upload your logo for automatic color extraction',
      'Visual features add infographics, charts, and journey maps'
    ],
  },
  'wizard.step3': {
    id: 'wizard.step3',
    title: 'Output Type',
    description: 'Define the media format, slide count, and structure. Output type significantly affects credit consumption - 3D and video formats use more resources.',
    category: 'wizard',
    tips: [
      '2D Static is most cost-effective (1x credits)',
      '3D and Video use 3-4x more credits',
      'Chapters organize content into logical sections'
    ],
  },
  'wizard.step4': {
    id: 'wizard.step4',
    title: 'Languages & Agents',
    description: 'Configure target languages and AI agent architecture. Multi-language generation creates parallel versions with native-quality translations and voiceovers.',
    category: 'wizard',
    tips: [
      'Voiceover limited to first 3 languages for quality',
      'Agentic architecture enables parallel processing',
      'Each language adds ~15% to credit usage'
    ],
  },
  'wizard.step5': {
    id: 'wizard.step5',
    title: 'Pre-Generation Confirmation',
    description: 'Review all settings and estimated costs before generating. This panel shows confidence scores, credit breakdown, and optimization suggestions.',
    category: 'wizard',
    tips: [
      'Check the confidence range for accuracy expectations',
      'Apply optimization suggestions to reduce costs',
      'Ensure sufficient credit balance before generating'
    ],
  },

  // === GENERATION ===
  'generation.start': {
    id: 'generation.start',
    title: 'Start Generation',
    description: 'Initiates the AI-powered presentation generation. Credits are deducted incrementally as each slide is processed.',
    category: 'generation',
    tips: [
      'Generation can take 1-5 minutes depending on complexity',
      'Progress is shown in real-time',
      'You can cancel mid-generation (partial credits used)'
    ],
  },
  'generation.progress': {
    id: 'generation.progress',
    title: 'Generation Progress',
    description: 'Tracks the creation of each slide, chapter, and element. Shows real-time status including text, visuals, and voiceover generation.',
    category: 'generation',
  },

  // === CREDITS & TOKENS ===
  'credits.balance': {
    id: 'credits.balance',
    title: 'Credit Balance',
    description: 'Your available credits for AI generation. Credits are consumed based on output type, slide count, languages, and additional features.',
    category: 'credits',
    tips: [
      'Monthly subscription credits refresh each billing cycle',
      'Purchased credits never expire',
      'View transaction history for detailed usage'
    ],
  },
  'credits.estimate': {
    id: 'credits.estimate',
    title: 'Credit Estimate',
    description: 'Estimated credits needed for this generation. Includes a confidence range because actual usage varies based on AI response complexity.',
    category: 'credits',
    tips: [
      'High confidence (85%+): 2D content, predictable output',
      'Medium confidence (70%): 3D/Interactive content',
      'Low confidence (60%): Video content, highly variable'
    ],
  },
  'credits.actual': {
    id: 'credits.actual',
    title: 'Actual Usage',
    description: 'Real credits consumed after generation completes. Compare with estimates to understand usage patterns for future planning.',
    category: 'credits',
  },
  'credits.breakdown': {
    id: 'credits.breakdown',
    title: 'Usage Breakdown',
    description: 'Detailed itemization of credit usage by category: text generation, visuals, voice, translation, and special features.',
    category: 'credits',
  },
  'credits.optimization': {
    id: 'credits.optimization',
    title: 'Optimization Suggestions',
    description: 'AI-powered recommendations to reduce credit usage. Apply suggestions to lower costs while maintaining quality.',
    category: 'credits',
  },

  // === AI MODELS ===
  'models.text': {
    id: 'models.text',
    title: 'Text Model',
    description: 'AI model for generating slide content, titles, and speaker notes. Higher-tier models offer better quality but cost more.',
    category: 'models',
    tips: [
      'Tier 1: Fast, cost-effective (Gemini, GPT-3.5)',
      'Tier 2: Balanced (Claude, GPT-4)',
      'Tier 3: Premium quality (GPT-5, Claude Pro)'
    ],
  },
  'models.image': {
    id: 'models.image',
    title: 'Image Model',
    description: 'AI model for generating slide visuals, backgrounds, and graphics. Different models excel at different styles.',
    category: 'models',
    tips: [
      'ModelsLab: Best for 2D/3D mixed content',
      'Flux: High-quality photorealistic images',
      'DALL-E: Creative and artistic styles'
    ],
  },
  'models.voice': {
    id: 'models.voice',
    title: 'Voice Model',
    description: 'AI model for generating voiceover narration. Premium models offer more natural speech and voice cloning.',
    category: 'models',
    tips: [
      'ElevenLabs: Most natural, supports cloning',
      'Azure: Wide language support',
      'Google: Cost-effective with good quality'
    ],
  },
  'models.translation': {
    id: 'models.translation',
    title: 'Translation Model',
    description: 'AI model for translating content to target languages. Some models specialize in specific language pairs.',
    category: 'models',
    tips: [
      'DeepL: Best for European languages',
      'Alibaba Qwen: Best for CJK languages',
      'Google: Widest language support'
    ],
  },

  // === OUTPUT TYPES ===
  'output.2d-static': {
    id: 'output.2d-static',
    title: '2D Static',
    description: 'Standard presentation slides with static images. Most cost-effective option (1x credits) suitable for most use cases.',
    category: 'output',
  },
  'output.2d-animated': {
    id: 'output.2d-animated',
    title: '2D Animated',
    description: 'Slides with animated transitions and motion graphics. Adds visual interest at 1.5x credit cost.',
    category: 'output',
  },
  'output.3d-scene': {
    id: 'output.3d-scene',
    title: '3D Scene',
    description: 'Three-dimensional rendered scenes for each slide. Creates immersive visuals at 3x credit cost.',
    category: 'output',
  },
  'output.3d-animated': {
    id: 'output.3d-animated',
    title: '3D Animated',
    description: 'Animated 3D scenes with movement and effects. Premium visual experience at 3.5x credit cost.',
    category: 'output',
  },
  'output.video-intro': {
    id: 'output.video-intro',
    title: 'Video Intro',
    description: 'Generated video introduction sequence. Creates engaging openings at 2.5x credit cost.',
    category: 'output',
  },
  'output.video-full': {
    id: 'output.video-full',
    title: 'Full Video',
    description: 'Complete video production with all slides. Most resource-intensive at 4x credit cost.',
    category: 'output',
  },
  'output.interactive': {
    id: 'output.interactive',
    title: 'Interactive',
    description: 'Slides with clickable elements and interactivity. Engages audiences at 2x credit cost.',
    category: 'output',
  },

  // === TEMPLATES & FRAMEWORKS ===
  'template.framework': {
    id: 'template.framework',
    title: 'Consulting Framework',
    description: 'Pre-built strategic methodologies from top consulting firms. Frameworks provide structured analysis approaches.',
    category: 'templates',
    tips: [
      'McKinsey: 7S, Pyramid Principle, MECE',
      'BCG: Growth-Share Matrix, Experience Curve',
      'Bain: NPS, Decision Trees'
    ],
  },
  'template.branding': {
    id: 'template.branding',
    title: 'Branding',
    description: 'Custom logo, colors, and visual identity. Upload your logo for automatic color palette extraction.',
    category: 'templates',
  },
  'template.visualFeatures': {
    id: 'template.visualFeatures',
    title: 'Visual Features',
    description: 'Additional visual elements like charts, tables, infographics, and journey maps integrated into slides.',
    category: 'templates',
  },

  // === REVIEW & REFINEMENT ===
  'review.accept': {
    id: 'review.accept',
    title: 'Accept',
    description: 'Approve the generated content as-is. Accepted elements are marked complete.',
    category: 'review',
  },
  'review.enhance': {
    id: 'review.enhance',
    title: 'Enhance',
    description: 'Request AI improvement of the content. Uses additional credits for refinement.',
    category: 'review',
  },
  'review.regenerate': {
    id: 'review.regenerate',
    title: 'Regenerate',
    description: 'Completely regenerate the content with new AI output. Consumes credits equal to original generation.',
    category: 'review',
  },
  'review.autoFix': {
    id: 'review.autoFix',
    title: 'Auto-Fix',
    description: 'Automatically fix detected issues like text overflow, layout problems, or quality warnings.',
    category: 'review',
  },

  // === EXPORT ===
  'export.pptx': {
    id: 'export.pptx',
    title: 'Export to PowerPoint',
    description: 'Download as editable .pptx file compatible with Microsoft PowerPoint and Google Slides.',
    category: 'export',
  },
  'export.pdf': {
    id: 'export.pdf',
    title: 'Export to PDF',
    description: 'Download as high-quality PDF document suitable for printing and sharing.',
    category: 'export',
  },
  'export.video': {
    id: 'export.video',
    title: 'Export Video',
    description: 'Download as MP4 video with transitions and voiceover. Available for video output types.',
    category: 'export',
  },
};

interface TooltipContextValue {
  getTooltip: (id: string) => TooltipDefinition | undefined;
  getAllTooltips: () => TooltipDefinition[];
  getTooltipsByCategory: (category: TooltipDefinition['category']) => TooltipDefinition[];
  isTooltipEnabled: boolean;
  setTooltipEnabled: (enabled: boolean) => void;
}

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined);

export function GenieTooltipProvider({ children }: { children: React.ReactNode }) {
  const [isTooltipEnabled, setTooltipEnabled] = useState(true);

  const getTooltip = useCallback((id: string): TooltipDefinition | undefined => {
    return GENIE_DECK_TOOLTIPS[id];
  }, []);

  const getAllTooltips = useCallback((): TooltipDefinition[] => {
    return Object.values(GENIE_DECK_TOOLTIPS);
  }, []);

  const getTooltipsByCategory = useCallback((category: TooltipDefinition['category']): TooltipDefinition[] => {
    return Object.values(GENIE_DECK_TOOLTIPS).filter(t => t.category === category);
  }, []);

  return (
    <TooltipContext.Provider value={{
      getTooltip,
      getAllTooltips,
      getTooltipsByCategory,
      isTooltipEnabled,
      setTooltipEnabled,
    }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useGenieTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useGenieTooltip must be used within a GenieTooltipProvider');
  }
  return context;
}

export default GenieTooltipProvider;
