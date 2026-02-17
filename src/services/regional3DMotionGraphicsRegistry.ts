/**
 * Regional 3D & Motion Graphics Registry
 * 
 * Comprehensive registry for 3D style preferences, motion graphics styles,
 * tool recommendations, and motion template categories by region.
 * 
 * Used across: Genie Deck (3D slides), Vibe (video effects), Arc (publishing)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type AnimationSpeed = 'slow' | 'medium' | 'medium-fast' | 'fast' | 'rhythmic';
export type LearningCurve = 'low' | 'low-medium' | 'medium' | 'high';
export type EasingStyle = 'linear' | 'ease-in-out' | 'smooth' | 'gentle' | 'bouncy' | 'energetic' | 'precise' | 'musical';

export interface Regional3DStylePreference {
  regionCode: string;
  regionName: string;
  variant?: string;
  aesthetic: string;
  materials: string[];
  lightingStyle: string;
  examples: string;
  colorPalette?: string[];
}

export interface RegionalMotionGraphicsStyle {
  regionCode: string;
  animationStyle: string[];
  speedEasing: {
    speed: AnimationSpeed;
    easing: EasingStyle;
  };
  transitions: string[];
  commonMotifs: string[];
}

export interface ToolRecommendation {
  tool: string;
  bestFor: string;
  cost: string;
  learningCurve: LearningCurve;
  apiAutomation: string;
  webCompatible: boolean;
}

export interface MotionTemplateCategory {
  category: string;
  description: string;
  useCase: string[];
  regionalConsideration: string;
  supportsRTL: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3D STYLE PREFERENCES BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export const REGIONAL_3D_STYLE_PREFERENCES: Record<string, Regional3DStylePreference> = {
  'US_CORPORATE': {
    regionCode: 'US',
    regionName: 'United States',
    variant: 'Corporate',
    aesthetic: 'Clean, professional, tech-forward',
    materials: ['Glass', 'Metal', 'Matte plastic'],
    lightingStyle: 'Studio, soft shadows',
    examples: 'Apple-style product renders',
    colorPalette: ['#FFFFFF', '#000000', '#0071E3', '#F5F5F7'],
  },
  'US_STARTUP': {
    regionCode: 'US',
    regionName: 'United States',
    variant: 'Startup',
    aesthetic: 'Playful, bold, colorful',
    materials: ['Glossy', 'Vibrant materials'],
    lightingStyle: 'Bright, colorful',
    examples: 'Figma, Slack style illustrations',
    colorPalette: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
  },
  'UK': {
    regionCode: 'UK',
    regionName: 'United Kingdom',
    aesthetic: 'Refined, understated, classic',
    materials: ['Leather', 'Wood', 'Brass'],
    lightingStyle: 'Warm, natural',
    examples: 'Premium, heritage feel',
    colorPalette: ['#8B4513', '#2F4F4F', '#DAA520', '#F5F5DC'],
  },
  'DE': {
    regionCode: 'DE',
    regionName: 'Germany',
    aesthetic: 'Precise, industrial, minimal',
    materials: ['Brushed metal', 'Concrete'],
    lightingStyle: 'Even, technical',
    examples: 'Engineering precision',
    colorPalette: ['#808080', '#C0C0C0', '#FFFFFF', '#000000'],
  },
  'JP': {
    regionCode: 'JP',
    regionName: 'Japan',
    aesthetic: 'Minimal, clean, nature-inspired',
    materials: ['Wood', 'Ceramic', 'Soft materials'],
    lightingStyle: 'Natural, soft',
    examples: 'Muji aesthetic',
    colorPalette: ['#F5F5F5', '#8B7355', '#98D8C8', '#FDFEFE'],
  },
  'KR': {
    regionCode: 'KR',
    regionName: 'South Korea',
    aesthetic: 'Modern, K-style, high-gloss',
    materials: ['Glass', 'Chrome', 'Neon'],
    lightingStyle: 'Dramatic, modern',
    examples: 'Samsung/LG style',
    colorPalette: ['#000000', '#FFFFFF', '#00D4FF', '#FF00FF'],
  },
  'CN': {
    regionCode: 'CN',
    regionName: 'China',
    aesthetic: 'Luxurious, gold accents, vibrant',
    materials: ['Gold', 'Red lacquer', 'Jade'],
    lightingStyle: 'Warm, rich',
    examples: 'Prosperity, auspicious',
    colorPalette: ['#FFD700', '#FF0000', '#00A86B', '#000000'],
  },
  'IN': {
    regionCode: 'IN',
    regionName: 'India',
    aesthetic: 'Colorful, ornate, decorative',
    materials: ['Brass', 'Silk textures', 'Gems'],
    lightingStyle: 'Warm, festive',
    examples: 'Diwali-inspired',
    colorPalette: ['#FF6B35', '#FFD93D', '#6BCB77', '#4D96FF'],
  },
  'SA': {
    regionCode: 'SA',
    regionName: 'Saudi Arabia',
    aesthetic: 'Geometric, Islamic patterns, luxury',
    materials: ['Gold', 'Marble', 'Intricate patterns'],
    lightingStyle: 'Warm, golden',
    examples: 'Arabesque, geometric',
    colorPalette: ['#006633', '#FFD700', '#FFFFFF', '#000000'],
  },
  'AE': {
    regionCode: 'AE',
    regionName: 'United Arab Emirates',
    aesthetic: 'Geometric, Islamic patterns, luxury',
    materials: ['Gold', 'Marble', 'Intricate patterns'],
    lightingStyle: 'Warm, golden',
    examples: 'Arabesque, geometric, Dubai modern',
    colorPalette: ['#FFD700', '#FFFFFF', '#000000', '#C8102E'],
  },
  'BR': {
    regionCode: 'BR',
    regionName: 'Brazil',
    aesthetic: 'Vibrant, warm, expressive',
    materials: ['Colorful', 'Organic shapes'],
    lightingStyle: 'Warm, tropical',
    examples: 'Festival-inspired',
    colorPalette: ['#009B3A', '#FEDF00', '#002776', '#FFFFFF'],
  },
  'MX': {
    regionCode: 'MX',
    regionName: 'Mexico',
    aesthetic: 'Vibrant, warm, cultural',
    materials: ['Colorful', 'Organic shapes', 'Terracotta'],
    lightingStyle: 'Warm, golden',
    examples: 'Day of the Dead inspired, folk art',
    colorPalette: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C'],
  },
  'NG': {
    regionCode: 'NG',
    regionName: 'Nigeria',
    aesthetic: 'Bold patterns, earthy, authentic',
    materials: ['Wood', 'Fabric patterns', 'Earth'],
    lightingStyle: 'Natural, warm',
    examples: 'Ankara, Kente patterns',
    colorPalette: ['#008751', '#FFFFFF', '#E4A11B', '#000000'],
  },
  'KE': {
    regionCode: 'KE',
    regionName: 'Kenya',
    aesthetic: 'Bold patterns, natural, authentic',
    materials: ['Wood', 'Earth tones', 'Beadwork'],
    lightingStyle: 'Natural, warm',
    examples: 'Maasai-inspired, natural landscapes',
    colorPalette: ['#BA0C2F', '#006B3F', '#FFFFFF', '#000000'],
  },
  'ZA': {
    regionCode: 'ZA',
    regionName: 'South Africa',
    aesthetic: 'Diverse, modern, heritage blend',
    materials: ['Beadwork', 'Natural materials', 'Modern metals'],
    lightingStyle: 'Natural, warm',
    examples: 'Rainbow nation diversity',
    colorPalette: ['#007A4D', '#FFB612', '#DE3831', '#002395'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOTION GRAPHICS STYLES BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export const REGIONAL_MOTION_GRAPHICS_STYLES: Record<string, RegionalMotionGraphicsStyle> = {
  'US': {
    regionCode: 'US',
    animationStyle: ['Smooth', 'Professional', 'Dynamic'],
    speedEasing: { speed: 'medium', easing: 'ease-in-out' },
    transitions: ['Fade', 'Slide', 'Zoom'],
    commonMotifs: ['Geometric shapes', 'Tech elements'],
  },
  'UK': {
    regionCode: 'UK',
    animationStyle: ['Elegant', 'Measured', 'Refined'],
    speedEasing: { speed: 'slow', easing: 'smooth' },
    transitions: ['Fade', 'Dissolve'],
    commonMotifs: ['Classic', 'Understated elements'],
  },
  'DE': {
    regionCode: 'DE',
    animationStyle: ['Precise', 'Functional', 'Clean'],
    speedEasing: { speed: 'medium', easing: 'linear' },
    transitions: ['Cut', 'Simple wipe'],
    commonMotifs: ['Lines', 'Grids', 'Data visualization'],
  },
  'JP': {
    regionCode: 'JP',
    animationStyle: ['Subtle', 'Delicate', 'Minimal'],
    speedEasing: { speed: 'slow', easing: 'gentle' },
    transitions: ['Fade', 'Gentle slide'],
    commonMotifs: ['Nature', 'Seasons', 'Zen elements'],
  },
  'KR': {
    regionCode: 'KR',
    animationStyle: ['Dynamic', 'Trendy', 'K-style'],
    speedEasing: { speed: 'fast', easing: 'bouncy' },
    transitions: ['Zoom', 'Dynamic transitions'],
    commonMotifs: ['Neon', 'Modern', 'Pop elements'],
  },
  'CN': {
    regionCode: 'CN',
    animationStyle: ['Dynamic', 'Celebratory', 'Bold'],
    speedEasing: { speed: 'fast', easing: 'energetic' },
    transitions: ['Zoom', 'Particles'],
    commonMotifs: ['Fireworks', 'Prosperity symbols'],
  },
  'IN': {
    regionCode: 'IN',
    animationStyle: ['Colorful', 'Festive', 'Energetic'],
    speedEasing: { speed: 'medium-fast', easing: 'bouncy' },
    transitions: ['Wipe', 'Reveal'],
    commonMotifs: ['Rangoli', 'Diyas', 'Colorful elements'],
  },
  'SA': {
    regionCode: 'SA',
    animationStyle: ['Elegant', 'Geometric', 'Flowing'],
    speedEasing: { speed: 'medium', easing: 'smooth' },
    transitions: ['Reveal', 'Geometric transitions'],
    commonMotifs: ['Islamic geometry', 'Calligraphy'],
  },
  'AE': {
    regionCode: 'AE',
    animationStyle: ['Elegant', 'Modern', 'Luxury'],
    speedEasing: { speed: 'medium', easing: 'smooth' },
    transitions: ['Reveal', 'Geometric transitions'],
    commonMotifs: ['Islamic geometry', 'Dubai skyline'],
  },
  'BR': {
    regionCode: 'BR',
    animationStyle: ['Warm', 'Rhythmic', 'Expressive'],
    speedEasing: { speed: 'rhythmic', easing: 'musical' },
    transitions: ['Slide', 'Reveal'],
    commonMotifs: ['Colors', 'Celebration', 'Carnival'],
  },
  'MX': {
    regionCode: 'MX',
    animationStyle: ['Warm', 'Vibrant', 'Cultural'],
    speedEasing: { speed: 'medium', easing: 'bouncy' },
    transitions: ['Slide', 'Reveal'],
    commonMotifs: ['Folk art', 'Colors', 'Cultural symbols'],
  },
  'NG': {
    regionCode: 'NG',
    animationStyle: ['Bold', 'Rhythmic', 'Energetic'],
    speedEasing: { speed: 'rhythmic', easing: 'energetic' },
    transitions: ['Slide', 'Bold transitions'],
    commonMotifs: ['Patterns', 'Bold shapes', 'Ankara'],
  },
  'KE': {
    regionCode: 'KE',
    animationStyle: ['Natural', 'Rhythmic', 'Authentic'],
    speedEasing: { speed: 'medium', easing: 'smooth' },
    transitions: ['Slide', 'Natural transitions'],
    commonMotifs: ['Nature', 'Wildlife', 'Patterns'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3D TOOL RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const TOOL_RECOMMENDATIONS: ToolRecommendation[] = [
  {
    tool: 'Spline',
    bestFor: 'Web-ready 3D, interactive',
    cost: 'Free-$36/mo',
    learningCurve: 'low',
    apiAutomation: 'Embed, React support',
    webCompatible: true,
  },
  {
    tool: 'Blender',
    bestFor: 'Full 3D, rendering',
    cost: 'Free',
    learningCurve: 'high',
    apiAutomation: 'Python scripting',
    webCompatible: false,
  },
  {
    tool: 'Three.js',
    bestFor: 'Web 3D scenes',
    cost: 'Free',
    learningCurve: 'medium',
    apiAutomation: 'JavaScript native',
    webCompatible: true,
  },
  {
    tool: 'Lottie/After Effects',
    bestFor: '2D/2.5D animation',
    cost: '$55/mo',
    learningCurve: 'medium',
    apiAutomation: 'JSON export, web-ready',
    webCompatible: true,
  },
  {
    tool: 'Rive',
    bestFor: 'Interactive animations',
    cost: 'Free-$42/mo',
    learningCurve: 'low-medium',
    apiAutomation: 'Flutter, web, native',
    webCompatible: true,
  },
  {
    tool: 'Cinema 4D',
    bestFor: 'Motion graphics, MoGraph',
    cost: '$94/mo',
    learningCurve: 'high',
    apiAutomation: 'Python scripting',
    webCompatible: false,
  },
  {
    tool: 'Cavalry',
    bestFor: '2D motion, procedural',
    cost: '$45/mo',
    learningCurve: 'medium',
    apiAutomation: 'JavaScript API',
    webCompatible: false,
  },
  {
    tool: 'ModelsLab',
    bestFor: 'AI-generated 3D, textures',
    cost: 'API-based',
    learningCurve: 'low',
    apiAutomation: 'REST API, full automation',
    webCompatible: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MOTION TEMPLATE CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

export const MOTION_TEMPLATE_CATEGORIES: MotionTemplateCategory[] = [
  {
    category: 'Logo Reveal',
    description: 'Animated logo entrance',
    useCase: ['Video intros', 'Presentations'],
    regionalConsideration: 'Match brand + regional style',
    supportsRTL: true,
  },
  {
    category: 'Lower Third',
    description: 'Name/title overlay',
    useCase: ['Videos', 'Webinars'],
    regionalConsideration: 'RTL for Arabic, formal for Japan',
    supportsRTL: true,
  },
  {
    category: 'Transitions',
    description: 'Scene-to-scene movement',
    useCase: ['Video editing'],
    regionalConsideration: 'Subtle for UK/JP, dynamic for US/KR',
    supportsRTL: false,
  },
  {
    category: 'Data Animation',
    description: 'Charts, numbers, stats',
    useCase: ['Reports', 'Presentations'],
    regionalConsideration: 'Dense for DE/JP, simplified for US',
    supportsRTL: true,
  },
  {
    category: 'Icon Animation',
    description: 'Animated icons/symbols',
    useCase: ['Apps', 'Presentations'],
    regionalConsideration: 'Culturally appropriate icons',
    supportsRTL: false,
  },
  {
    category: 'Text Kinetics',
    description: 'Animated typography',
    useCase: ['Social media', 'Ads'],
    regionalConsideration: 'Script direction (RTL/LTR)',
    supportsRTL: true,
  },
  {
    category: 'Background Loop',
    description: 'Seamless animated background',
    useCase: ['Presentations', 'Streams'],
    regionalConsideration: 'Regional color palette',
    supportsRTL: false,
  },
  {
    category: 'Call-to-Action',
    description: 'Animated CTA button',
    useCase: ['Videos', 'Web'],
    regionalConsideration: 'Action words per language',
    supportsRTL: true,
  },
  {
    category: 'Particle Effects',
    description: 'Animated particle systems',
    useCase: ['Celebrations', 'Emphasis'],
    regionalConsideration: 'Festive for IN/CN, subtle for JP/UK',
    supportsRTL: false,
  },
  {
    category: 'Infographic',
    description: 'Animated data visualization',
    useCase: ['Reports', 'Social'],
    regionalConsideration: 'Data density varies by region',
    supportsRTL: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get 3D style preferences for a region
 */
export function get3DStyleForRegion(
  regionCode: string,
  variant?: 'corporate' | 'startup'
): Regional3DStylePreference {
  if (variant) {
    const variantKey = `${regionCode}_${variant.toUpperCase()}`;
    if (REGIONAL_3D_STYLE_PREFERENCES[variantKey]) {
      return REGIONAL_3D_STYLE_PREFERENCES[variantKey];
    }
  }
  return REGIONAL_3D_STYLE_PREFERENCES[regionCode] || REGIONAL_3D_STYLE_PREFERENCES['US_CORPORATE'];
}

/**
 * Get motion graphics style for a region
 */
export function getMotionGraphicsStyleForRegion(regionCode: string): RegionalMotionGraphicsStyle {
  return REGIONAL_MOTION_GRAPHICS_STYLES[regionCode] || REGIONAL_MOTION_GRAPHICS_STYLES['US'];
}

/**
 * Get recommended tools for a use case
 */
export function getRecommendedToolsForUseCase(
  useCase: 'web-interactive' | 'video-production' | 'quick-animation' | 'full-3d'
): ToolRecommendation[] {
  switch (useCase) {
    case 'web-interactive':
      return TOOL_RECOMMENDATIONS.filter(t => t.webCompatible && t.learningCurve !== 'high');
    case 'video-production':
      return TOOL_RECOMMENDATIONS.filter(t => 
        ['Cinema 4D', 'Blender', 'Lottie/After Effects'].includes(t.tool)
      );
    case 'quick-animation':
      return TOOL_RECOMMENDATIONS.filter(t => t.learningCurve === 'low' || t.learningCurve === 'low-medium');
    case 'full-3d':
      return TOOL_RECOMMENDATIONS.filter(t => ['Blender', 'Cinema 4D', 'Spline'].includes(t.tool));
    default:
      return TOOL_RECOMMENDATIONS;
  }
}

/**
 * Get motion templates that support RTL
 */
export function getRTLCompatibleTemplates(): MotionTemplateCategory[] {
  return MOTION_TEMPLATE_CATEGORIES.filter(t => t.supportsRTL);
}

/**
 * Get templates for a specific use case
 */
export function getTemplatesForUseCase(useCase: string): MotionTemplateCategory[] {
  return MOTION_TEMPLATE_CATEGORIES.filter(t => 
    t.useCase.some(u => u.toLowerCase().includes(useCase.toLowerCase()))
  );
}

/**
 * Build complete 3D & motion config for a region
 */
export function build3DMotionConfigForRegion(
  regionCode: string,
  variant?: 'corporate' | 'startup'
): {
  style3D: Regional3DStylePreference;
  motionStyle: RegionalMotionGraphicsStyle;
  recommendedTools: ToolRecommendation[];
  supportsRTL: boolean;
} {
  const style3D = get3DStyleForRegion(regionCode, variant);
  const motionStyle = getMotionGraphicsStyleForRegion(regionCode);
  
  // RTL regions
  const rtlRegions = ['SA', 'AE', 'EG', 'IL'];
  
  return {
    style3D,
    motionStyle,
    recommendedTools: TOOL_RECOMMENDATIONS.filter(t => t.webCompatible),
    supportsRTL: rtlRegions.includes(regionCode),
  };
}

/**
 * Get animation preset for a region
 */
export function getAnimationPresetForRegion(regionCode: string): {
  duration: number;
  easing: string;
  delay: number;
} {
  const motion = getMotionGraphicsStyleForRegion(regionCode);
  
  const durationMap: Record<AnimationSpeed, number> = {
    'slow': 1.2,
    'medium': 0.8,
    'medium-fast': 0.6,
    'fast': 0.4,
    'rhythmic': 0.7,
  };
  
  const easingMap: Record<EasingStyle, string> = {
    'linear': 'linear',
    'ease-in-out': 'ease-in-out',
    'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'gentle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    'bouncy': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    'energetic': 'cubic-bezier(0.76, 0, 0.24, 1)',
    'precise': 'cubic-bezier(0.4, 0, 0.6, 1)',
    'musical': 'cubic-bezier(0.22, 1, 0.36, 1)',
  };
  
  return {
    duration: durationMap[motion.speedEasing.speed],
    easing: easingMap[motion.speedEasing.easing],
    delay: motion.speedEasing.speed === 'slow' ? 0.1 : 0,
  };
}

/**
 * Get all supported 3D regions
 */
export function getSupported3DRegions(): string[] {
  return [...new Set([
    ...Object.keys(REGIONAL_3D_STYLE_PREFERENCES).map(k => k.split('_')[0]),
    ...Object.keys(REGIONAL_MOTION_GRAPHICS_STYLES),
  ])];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export const Regional3DMotionGraphicsRegistry = {
  stylePreferences3D: REGIONAL_3D_STYLE_PREFERENCES,
  motionGraphicsStyles: REGIONAL_MOTION_GRAPHICS_STYLES,
  toolRecommendations: TOOL_RECOMMENDATIONS,
  motionTemplateCategories: MOTION_TEMPLATE_CATEGORIES,
  get3DStyleForRegion,
  getMotionGraphicsStyleForRegion,
  getRecommendedToolsForUseCase,
  getRTLCompatibleTemplates,
  getTemplatesForUseCase,
  buildConfigForRegion: build3DMotionConfigForRegion,
  getAnimationPresetForRegion,
  getSupportedRegions: getSupported3DRegions,
};

export default Regional3DMotionGraphicsRegistry;
