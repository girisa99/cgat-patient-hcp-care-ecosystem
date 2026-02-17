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

  // === INPUT TABS ===
  'input.describe': {
    id: 'input.describe',
    title: 'Describe Your Topic',
    description: 'Type a description or prompt for your presentation. Be specific about your topic, audience, and key points you want to cover.',
    category: 'wizard',
    tips: [
      'Include your main objective and target audience',
      'Mention 3-5 key points to cover',
      'Specify the desired tone (formal, casual, persuasive)'
    ],
  },
  'input.paste': {
    id: 'input.paste',
    title: 'Paste Content',
    description: 'Paste existing text content - articles, reports, notes, or any written material. The AI will extract key points and structure them into slides.',
    category: 'wizard',
    tips: [
      'Works great with meeting notes or reports',
      'Longer content (500+ words) yields better results',
      'Include headers/sections for better structure'
    ],
  },
  'input.upload': {
    id: 'input.upload',
    title: 'Upload Document',
    description: 'Upload PDF, Word, PowerPoint, or text files. The AI extracts content while preserving structure, headings, and key formatting.',
    category: 'wizard',
    tips: [
      'Supported: PDF, DOCX, PPTX, TXT, MD',
      'Max file size: 10MB',
      'Preserve your document structure for better slides'
    ],
  },
  'input.image': {
    id: 'input.image',
    title: 'Upload Image',
    description: 'Upload a chart, diagram, infographic, or visual. AI uses vision models to extract data and create presentation content from the image.',
    category: 'wizard',
    tips: [
      'Great for converting charts into editable slides',
      'Works with whiteboard photos and sketches',
      'Supported: JPG, PNG, WEBP, GIF'
    ],
  },
  'input.url': {
    id: 'input.url',
    title: 'Enter URL',
    description: 'Provide a webpage URL to scrape content. The AI extracts text, key points, and relevant information to build your presentation.',
    category: 'wizard',
    tips: [
      'Works with articles, blog posts, and web pages',
      'Best for content-rich pages (not login-protected)',
      'Images from the page may be included'
    ],
  },

  // === LANGUAGE SETTINGS ===
  'input.inputLanguage': {
    id: 'input.inputLanguage',
    title: 'Input Language',
    description: 'The language you are typing or pasting content in. This helps the AI understand and process your input correctly.',
    category: 'languages',
    tips: [
      'Auto-detection available for most languages',
      '42+ languages supported',
      'Affects translation provider selection'
    ],
  },
  'input.outputLanguage': {
    id: 'input.outputLanguage',
    title: 'Output Language',
    description: 'The primary language for your generated presentation. Content will be created or translated to this language.',
    category: 'languages',
    tips: [
      'Can differ from input language',
      'Native-quality output with specialized AI',
      'Add more languages in Step 4'
    ],
  },
  'input.autoTranslate': {
    id: 'input.autoTranslate',
    title: 'Auto-Translate',
    description: 'Automatically translate your input content to the output language during generation. Uses AI-powered translation for natural results.',
    category: 'languages',
    tips: [
      'Best translation provider auto-selected',
      'DeepL for European, Qwen for Asian languages',
      'Review translations in preview before finalizing'
    ],
  },

  // === CONFIGURATION OPTIONS ===
  'config.industry': {
    id: 'config.industry',
    title: 'Industry Category',
    description: 'Select your industry to optimize AI recommendations for terminology, design patterns, and content structure specific to your domain.',
    category: 'wizard',
    tips: [
      'Affects visual style and terminology',
      'Healthcare includes HIPAA-compliant templates',
      'Tech/SaaS optimized for product demos'
    ],
  },
  'config.segment': {
    id: 'config.segment',
    title: 'Audience Segment',
    description: 'Define your target audience to adjust content complexity, tone, and focus areas. Helps AI tailor the message appropriately.',
    category: 'wizard',
    tips: [
      'Executive = High-level, strategic focus',
      'Technical = Detailed, specification-focused',
      'General = Accessible, broad appeal'
    ],
  },
  'config.contentType': {
    id: 'config.contentType',
    title: 'Content Types',
    description: 'Select the types of content to include in your presentation. Multiple selections create a richer, more comprehensive deck.',
    category: 'wizard',
    tips: [
      'Pitch Deck = Investor-focused structure',
      'Training = Educational with exercises',
      'Report = Data-heavy with analysis'
    ],
  },
  'config.aiMode': {
    id: 'config.aiMode',
    title: 'AI Mode Selection',
    description: 'Choose between AI Auto (intelligent model selection) or Custom (manual control). Auto mode analyzes your content to pick optimal models.',
    category: 'models',
    tips: [
      'AI Auto is recommended for most users',
      'Custom mode for specific model requirements',
      'Models can be changed per-step'
    ],
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

  // === TEMPLATE & BRANDING ===
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
    tips: [
      'Data Tables: Organize complex information',
      'Charts: Visualize metrics and trends',
      'Infographics: Engaging visual summaries'
    ],
  },
  'template.logo': {
    id: 'template.logo',
    title: 'Logo Upload',
    description: 'Upload your company logo. AI extracts colors and applies them to create a cohesive brand identity across all slides.',
    category: 'templates',
    tips: [
      'PNG with transparency works best',
      'Colors auto-extracted for theme',
      'Logo placed on title and footer slides'
    ],
  },
  'template.colors': {
    id: 'template.colors',
    title: 'Brand Colors',
    description: 'Define primary, secondary, and accent colors for your presentation. These colors are applied consistently across all slides.',
    category: 'templates',
    tips: [
      'Primary: Headings and key elements',
      'Secondary: Backgrounds and sections',
      'Accent: Highlights and CTAs'
    ],
  },

  // === OUTPUT SETTINGS ===
  'output.type': {
    id: 'output.type',
    title: 'Output Type',
    description: 'Choose the format for your presentation: 2D static, animated, 3D, video, or interactive. Each has different credit costs.',
    category: 'output',
    tips: [
      '2D Static: 1x credits, fastest',
      '3D/Video: 3-4x credits, premium',
      'Interactive: 2x credits, engaging'
    ],
  },
  'output.slideCount': {
    id: 'output.slideCount',
    title: 'Slide Count',
    description: 'Target number of slides to generate. AI will structure content to fit this count while maintaining quality.',
    category: 'output',
    tips: [
      'Minimum: 5 slides',
      'Optimal: 10-20 for most presentations',
      'Maximum: 50 slides'
    ],
  },
  'output.chapters': {
    id: 'output.chapters',
    title: 'Chapters',
    description: 'Organize slides into logical chapters/sections. Helps viewers navigate and understand the presentation structure.',
    category: 'output',
    tips: [
      'Auto-detected from content structure',
      'Manual override available',
      'Generates chapter divider slides'
    ],
  },
  'output.voiceover': {
    id: 'output.voiceover',
    title: 'Voiceover',
    description: 'Add AI-generated voice narration to your slides. Speaker notes are converted to natural-sounding speech.',
    category: 'output',
    tips: [
      'Multiple voice styles available',
      'Adds ~30% to generation time',
      'Limited to 3 languages for quality'
    ],
  },
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

  // === AGENTS & LANGUAGES ===
  'agents.agentic': {
    id: 'agents.agentic',
    title: 'Agentic Architecture',
    description: 'Enable AI agent orchestration for parallel processing. Multiple specialized agents work together for faster, higher-quality generation.',
    category: 'generation',
    tips: [
      'Orchestrator coordinates all agents',
      'Content, Visual, Voice agents work in parallel',
      'Faster generation with better results'
    ],
  },
  'agents.orchestrator': {
    id: 'agents.orchestrator',
    title: 'Orchestrator Agent',
    description: 'The master coordinator that manages all other agents. Analyzes your input and delegates tasks to specialized agents.',
    category: 'generation',
  },
  'agents.content': {
    id: 'agents.content',
    title: 'Content Agent',
    description: 'Specialized in generating text content, titles, bullet points, and speaker notes with industry-specific terminology.',
    category: 'generation',
  },
  'agents.visual': {
    id: 'agents.visual',
    title: 'Visual Agent',
    description: 'Creates images, backgrounds, icons, and visual elements. Matches your brand colors and presentation style.',
    category: 'generation',
  },
  'agents.voice': {
    id: 'agents.voice',
    title: 'Voice Agent',
    description: 'Generates natural voiceover narration from speaker notes. Supports multiple languages and voice styles.',
    category: 'generation',
  },
  'agents.translation': {
    id: 'agents.translation',
    title: 'Translation Agent',
    description: 'Handles multi-language generation with context-aware translation. Preserves meaning and cultural nuances.',
    category: 'generation',
  },
  'languages.multiSelect': {
    id: 'languages.multiSelect',
    title: 'Multi-Language Output',
    description: 'Generate presentation versions in multiple languages simultaneously. Each language version is optimized for native speakers.',
    category: 'languages',
    tips: [
      'Up to 10 languages per generation',
      'Each language adds ~15% to credits',
      'Voiceover limited to 3 languages'
    ],
  },
  'languages.voiceLimit': {
    id: 'languages.voiceLimit',
    title: 'Voiceover Language Limit',
    description: 'Voiceover generation is limited to 3 languages to maintain quality and manage generation time.',
    category: 'languages',
    tips: [
      'Select your top 3 priority languages',
      'Other languages get text only',
      'Can add voiceover later'
    ],
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
  'generation.confidence': {
    id: 'generation.confidence',
    title: 'Confidence Score',
    description: 'AI confidence in the generated content quality. Higher scores indicate better expected results based on input quality and model selection.',
    category: 'generation',
    tips: [
      '90%+: Excellent - High-quality output expected',
      '70-89%: Good - Minor adjustments may be needed',
      '<70%: Fair - Review and enhance recommended'
    ],
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
  'review.feedback': {
    id: 'review.feedback',
    title: 'Provide Feedback',
    description: 'Rate the generation quality with thumbs up/down. Your feedback trains the AI to improve future results.',
    category: 'review',
    tips: [
      'Feedback improves AI over time',
      'Detailed comments help more',
      'Integrated with Label Studio RLHF'
    ],
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

  // === ASK GENIE ===
  'askgenie.chat': {
    id: 'askgenie.chat',
    title: 'Ask Genie Chat',
    description: 'Your AI assistant for Genie Deck. Ask questions about features, get help with your presentation, or request guidance on any step.',
    category: 'navigation',
    tips: [
      'Ask about any feature or workflow',
      'Get design and content suggestions',
      'Voice input available (tap mic)'
    ],
  },
  'askgenie.voice': {
    id: 'askgenie.voice',
    title: 'Voice Input',
    description: 'Speak to Ask Genie using your microphone. Supports 42+ languages with automatic detection.',
    category: 'navigation',
    tips: [
      'Tap mic to start speaking',
      'Speaks back in your language',
      'Great for hands-free interaction'
    ],
    keyboardShortcut: 'Ctrl+M',
  },
  'askgenie.workflows': {
    id: 'askgenie.workflows',
    title: 'Visual Workflows',
    description: 'See step-by-step visual diagrams for common tasks. Ask Genie can show you exactly how to accomplish your goal.',
    category: 'navigation',
    tips: [
      'Say "show me the flow" for diagrams',
      'Interactive - click steps to navigate',
      'Available for all major features'
    ],
  },
  'askgenie.language': {
    id: 'askgenie.language',
    title: 'Language Selection',
    description: 'Choose your preferred language for Ask Genie. The assistant will respond in your selected language.',
    category: 'navigation',
    tips: [
      '42+ languages supported',
      'Auto-detects from your location',
      'Voice in/out in selected language'
    ],
  },

  // === NAVIGATION ===
  'nav.step': {
    id: 'nav.step',
    title: 'Wizard Step',
    description: 'Navigate between wizard steps. Click any completed step to review or modify your selections.',
    category: 'navigation',
    tips: [
      'Completed steps show checkmarks',
      'Click to jump back and edit',
      'Changes update downstream settings'
    ],
  },
  'nav.next': {
    id: 'nav.next',
    title: 'Next Step',
    description: 'Proceed to the next step of the wizard. Ensure required fields are completed before advancing.',
    category: 'navigation',
    keyboardShortcut: 'Ctrl+→',
  },
  'nav.back': {
    id: 'nav.back',
    title: 'Previous Step',
    description: 'Return to the previous step to review or modify your selections.',
    category: 'navigation',
    keyboardShortcut: 'Ctrl+←',
  },
  'nav.preview': {
    id: 'nav.preview',
    title: 'Live Preview',
    description: 'Real-time preview of your presentation as you configure settings. Updates automatically as you make changes.',
    category: 'navigation',
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
