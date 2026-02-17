/**
 * Expanded Visual Features with All Categories
 * Includes 3D/AR Elements, Interactive Elements, Media Elements
 */

import { LucideIcon } from 'lucide-react';

export interface VisualFeatureSubOption {
  id: string;
  name: string;
  description?: string;
  tier?: 1 | 2 | 3;
}

export interface ExpandedVisualFeature {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react
  description: string;
  category: 'data' | 'structure' | 'media' | '3d-ar' | 'interactive' | 'layout';
  tier: 1 | 2 | 3;
  subOptions: VisualFeatureSubOption[];
}

export const EXPANDED_VISUAL_FEATURES: ExpandedVisualFeature[] = [
  // ==========================================
  // DATA VISUALIZATION (Tier 1-2)
  // ==========================================
  {
    id: 'infographics',
    name: 'Infographics',
    icon: 'BarChart3',
    description: 'Data visualizations and info graphics',
    category: 'data',
    tier: 1,
    subOptions: [
      { id: 'comparison', name: 'Comparison Charts', tier: 1 },
      { id: 'process-flow', name: 'Process Flow', tier: 1 },
      { id: 'statistics', name: 'Statistics Display', tier: 1 },
      { id: 'icon-grid', name: 'Icon Grid', tier: 1 },
      { id: 'funnel', name: 'Funnel Chart', tier: 2 },
      { id: 'sankey', name: 'Sankey Diagram', tier: 2 },
      { id: 'treemap', name: 'Treemap', tier: 2 }
    ]
  },
  {
    id: 'charts',
    name: 'Charts & Graphs',
    icon: 'PieChart',
    description: 'Various chart types for data',
    category: 'data',
    tier: 1,
    subOptions: [
      { id: 'bar-chart', name: 'Bar Chart', tier: 1 },
      { id: 'line-chart', name: 'Line Chart', tier: 1 },
      { id: 'pie-chart', name: 'Pie Chart', tier: 1 },
      { id: 'donut-chart', name: 'Donut Chart', tier: 1 },
      { id: 'area-chart', name: 'Area Chart', tier: 1 },
      { id: 'scatter-plot', name: 'Scatter Plot', tier: 2 },
      { id: 'radar-chart', name: 'Radar Chart', tier: 2 },
      { id: 'bubble-chart', name: 'Bubble Chart', tier: 2 },
      { id: 'waterfall', name: 'Waterfall Chart', tier: 2 },
      { id: 'candlestick', name: 'Candlestick Chart', tier: 3 }
    ]
  },
  {
    id: 'data-tables',
    name: 'Data Tables',
    icon: 'Table2',
    description: 'Structured data presentations',
    category: 'data',
    tier: 1,
    subOptions: [
      { id: 'comparison-table', name: 'Comparison Table', tier: 1 },
      { id: 'pricing-table', name: 'Pricing Table', tier: 1 },
      { id: 'feature-matrix', name: 'Feature Matrix', tier: 1 },
      { id: 'data-grid', name: 'Data Grid', tier: 1 },
      { id: 'sortable-table', name: 'Sortable Table', tier: 2 },
      { id: 'pivot-table', name: 'Pivot Table', tier: 3 }
    ]
  },

  // ==========================================
  // STRUCTURAL ELEMENTS (Tier 1-2)
  // ==========================================
  {
    id: 'journey-maps',
    name: 'Journey Maps',
    icon: 'Map',
    description: 'User journey and experience maps',
    category: 'structure',
    tier: 1,
    subOptions: [
      { id: 'customer-journey', name: 'Customer Journey', tier: 1 },
      { id: 'user-flow', name: 'User Flow', tier: 1 },
      { id: 'roadmap', name: 'Product Roadmap', tier: 1 },
      { id: 'milestone', name: 'Milestone Map', tier: 1 },
      { id: 'service-blueprint', name: 'Service Blueprint', tier: 2 },
      { id: 'experience-map', name: 'Experience Map', tier: 2 }
    ]
  },
  {
    id: 'timelines',
    name: 'Timelines',
    icon: 'Clock',
    description: 'Chronological presentations',
    category: 'structure',
    tier: 1,
    subOptions: [
      { id: 'horizontal', name: 'Horizontal Timeline', tier: 1 },
      { id: 'vertical', name: 'Vertical Timeline', tier: 1 },
      { id: 'milestone-timeline', name: 'Milestone Timeline', tier: 1 },
      { id: 'gantt', name: 'Gantt Chart', tier: 2 },
      { id: 'swimlane', name: 'Swimlane Timeline', tier: 2 },
      { id: 'interactive-timeline', name: 'Interactive Timeline', tier: 3 }
    ]
  },
  {
    id: 'diagrams',
    name: 'Diagrams',
    icon: 'Network',
    description: 'Structural and flow diagrams',
    category: 'structure',
    tier: 1,
    subOptions: [
      { id: 'flowchart', name: 'Flowchart', tier: 1 },
      { id: 'org-chart', name: 'Org Chart', tier: 1 },
      { id: 'mind-map', name: 'Mind Map', tier: 1 },
      { id: 'venn', name: 'Venn Diagram', tier: 1 },
      { id: 'hierarchy', name: 'Hierarchy', tier: 1 },
      { id: 'network-diagram', name: 'Network Diagram', tier: 2 },
      { id: 'uml', name: 'UML Diagrams', tier: 2 },
      { id: 'er-diagram', name: 'ER Diagram', tier: 2 },
      { id: 'architecture', name: 'Architecture Diagram', tier: 2 }
    ]
  },
  {
    id: 'quote-blocks',
    name: 'Quote & Callouts',
    icon: 'Quote',
    description: 'Testimonials and callouts',
    category: 'structure',
    tier: 1,
    subOptions: [
      { id: 'testimonial', name: 'Testimonial', tier: 1 },
      { id: 'pull-quote', name: 'Pull Quote', tier: 1 },
      { id: 'callout', name: 'Callout Box', tier: 1 },
      { id: 'highlight', name: 'Highlight Block', tier: 1 },
      { id: 'stat-callout', name: 'Statistic Callout', tier: 1 },
      { id: 'alert', name: 'Alert Box', tier: 1 }
    ]
  },
  {
    id: 'icon-sets',
    name: 'Icons & Symbols',
    icon: 'Shapes',
    description: 'Icon-based visual elements',
    category: 'structure',
    tier: 1,
    subOptions: [
      { id: 'feature-icons', name: 'Feature Icons', tier: 1 },
      { id: 'step-icons', name: 'Step Icons', tier: 1 },
      { id: 'category-icons', name: 'Category Icons', tier: 1 },
      { id: 'status-icons', name: 'Status Icons', tier: 1 },
      { id: 'animated-icons', name: 'Animated Icons', tier: 2 },
      { id: 'custom-icons', name: 'Custom AI Icons', tier: 2 }
    ]
  },

  // ==========================================
  // MEDIA ELEMENTS (Tier 2-3)
  // ==========================================
  {
    id: 'images',
    name: 'AI Images',
    icon: 'ImagePlus',
    description: 'AI-generated images and photos',
    category: 'media',
    tier: 1,
    subOptions: [
      { id: 'hero-image', name: 'Hero Image', tier: 1 },
      { id: 'background', name: 'Background Image', tier: 1 },
      { id: 'illustration', name: 'Illustration', tier: 1 },
      { id: 'product-shot', name: 'Product Shot', tier: 2 },
      { id: 'team-photo', name: 'Team Photo', tier: 2 },
      { id: 'lifestyle', name: 'Lifestyle Photo', tier: 2 },
      { id: 'abstract-art', name: 'Abstract Art', tier: 2 },
      { id: 'photorealistic', name: 'Photorealistic Scene', tier: 3 }
    ]
  },
  {
    id: 'video-clips',
    name: 'Video Clips',
    icon: 'Video',
    description: 'AI-generated video content',
    category: 'media',
    tier: 2,
    subOptions: [
      { id: 'intro-video', name: 'Intro Animation', tier: 2 },
      { id: 'outro-video', name: 'Outro Animation', tier: 2 },
      { id: 'transition', name: 'Transitions', tier: 2 },
      { id: 'background-video', name: 'Background Video', tier: 2 },
      { id: 'explainer', name: 'Explainer Clip', tier: 3 },
      { id: 'product-demo', name: 'Product Demo', tier: 3 },
      { id: 'cinematic', name: 'Cinematic Scene', tier: 3 }
    ]
  },
  {
    id: 'audio',
    name: 'Audio & Voice',
    icon: 'AudioLines',
    description: 'Audio elements and voiceovers',
    category: 'media',
    tier: 2,
    subOptions: [
      { id: 'voiceover', name: 'AI Voiceover', tier: 2 },
      { id: 'background-music', name: 'Background Music', tier: 2 },
      { id: 'sound-effects', name: 'Sound Effects', tier: 2 },
      { id: 'voice-clone', name: 'Voice Cloning', tier: 3 },
      { id: 'multi-voice', name: 'Multi-Voice Narration', tier: 3 },
      { id: 'spatial-audio', name: 'Spatial Audio', tier: 3 }
    ]
  },
  {
    id: 'animations',
    name: 'Animations',
    icon: 'Sparkles',
    description: 'Motion graphics and animations',
    category: 'media',
    tier: 2,
    subOptions: [
      { id: 'entry-animation', name: 'Entry Animations', tier: 2 },
      { id: 'hover-effects', name: 'Hover Effects', tier: 2 },
      { id: 'scroll-animations', name: 'Scroll Animations', tier: 2 },
      { id: 'lottie', name: 'Lottie Animations', tier: 2 },
      { id: 'particle-effects', name: 'Particle Effects', tier: 3 },
      { id: 'morphing', name: 'Morphing Animations', tier: 3 },
      { id: 'kinetic-typography', name: 'Kinetic Typography', tier: 3 }
    ]
  },

  // ==========================================
  // 3D & AR ELEMENTS (Tier 2-3)
  // ==========================================
  {
    id: '3d-objects',
    name: '3D Objects',
    icon: 'Box',
    description: '3D models and objects',
    category: '3d-ar',
    tier: 2,
    subOptions: [
      { id: '3d-product', name: '3D Product Model', tier: 2 },
      { id: '3d-icon', name: '3D Icons', tier: 2 },
      { id: '3d-logo', name: '3D Logo', tier: 2 },
      { id: '3d-character', name: '3D Character', tier: 3 },
      { id: '3d-environment', name: '3D Environment', tier: 3 },
      { id: '3d-data-viz', name: '3D Data Visualization', tier: 3 }
    ]
  },
  {
    id: '3d-scenes',
    name: '3D Scenes',
    icon: 'Orbit',
    description: 'Full 3D scene compositions',
    category: '3d-ar',
    tier: 3,
    subOptions: [
      { id: 'product-showcase', name: 'Product Showcase', tier: 3 },
      { id: 'virtual-room', name: 'Virtual Room', tier: 3 },
      { id: 'outdoor-scene', name: 'Outdoor Scene', tier: 3 },
      { id: 'abstract-scene', name: 'Abstract Scene', tier: 3 },
      { id: 'architectural', name: 'Architectural Visualization', tier: 3 }
    ]
  },
  {
    id: '3d-animations',
    name: '3D Animations',
    icon: 'Clapperboard',
    description: 'Animated 3D content',
    category: '3d-ar',
    tier: 3,
    subOptions: [
      { id: 'camera-orbit', name: 'Camera Orbit', tier: 2 },
      { id: 'camera-flythrough', name: 'Camera Flythrough', tier: 3 },
      { id: 'object-animation', name: 'Object Animation', tier: 3 },
      { id: 'physics-sim', name: 'Physics Simulation', tier: 3 },
      { id: 'character-animation', name: 'Character Animation', tier: 3 }
    ]
  },
  {
    id: 'ar-elements',
    name: 'AR Elements',
    icon: 'Smartphone',
    description: 'Augmented reality overlays',
    category: '3d-ar',
    tier: 3,
    subOptions: [
      { id: 'ar-product', name: 'AR Product View', tier: 3 },
      { id: 'ar-marker', name: 'AR Marker Trigger', tier: 3 },
      { id: 'ar-face-filter', name: 'AR Face Filter', tier: 3 },
      { id: 'ar-world-anchor', name: 'AR World Anchor', tier: 3 },
      { id: 'ar-portal', name: 'AR Portal', tier: 3 }
    ]
  },

  // ==========================================
  // INTERACTIVE ELEMENTS (Tier 2-3)
  // ==========================================
  {
    id: 'clickable',
    name: 'Clickable Elements',
    icon: 'MousePointerClick',
    description: 'Interactive click/tap elements',
    category: 'interactive',
    tier: 2,
    subOptions: [
      { id: 'buttons', name: 'Interactive Buttons', tier: 2 },
      { id: 'hotspots', name: 'Image Hotspots', tier: 2 },
      { id: 'tabs', name: 'Tab Navigation', tier: 2 },
      { id: 'accordion', name: 'Accordions', tier: 2 },
      { id: 'modal-triggers', name: 'Modal Triggers', tier: 2 },
      { id: 'reveal-cards', name: 'Reveal Cards', tier: 2 }
    ]
  },
  {
    id: 'forms',
    name: 'Forms & Inputs',
    icon: 'FormInput',
    description: 'User input and forms',
    category: 'interactive',
    tier: 2,
    subOptions: [
      { id: 'contact-form', name: 'Contact Form', tier: 2 },
      { id: 'survey', name: 'Survey Form', tier: 2 },
      { id: 'calculator', name: 'Calculator Widget', tier: 2 },
      { id: 'configurator', name: 'Product Configurator', tier: 3 },
      { id: 'booking', name: 'Booking Widget', tier: 3 }
    ]
  },
  {
    id: 'quizzes',
    name: 'Quizzes & Games',
    icon: 'HelpCircle',
    description: 'Interactive quizzes and gamification',
    category: 'interactive',
    tier: 2,
    subOptions: [
      { id: 'quiz', name: 'Knowledge Quiz', tier: 2 },
      { id: 'poll', name: 'Live Poll', tier: 2 },
      { id: 'assessment', name: 'Assessment', tier: 2 },
      { id: 'spin-wheel', name: 'Spin Wheel', tier: 2 },
      { id: 'memory-game', name: 'Memory Game', tier: 3 },
      { id: 'trivia', name: 'Trivia Game', tier: 3 }
    ]
  },
  {
    id: 'data-filters',
    name: 'Data Exploration',
    icon: 'Filter',
    description: 'Interactive data filtering and exploration',
    category: 'interactive',
    tier: 3,
    subOptions: [
      { id: 'filter-controls', name: 'Filter Controls', tier: 2 },
      { id: 'search', name: 'Search Widget', tier: 2 },
      { id: 'zoom-pan', name: 'Zoom & Pan', tier: 2 },
      { id: 'timeline-scrub', name: 'Timeline Scrubber', tier: 3 },
      { id: 'data-drill', name: 'Data Drill-down', tier: 3 },
      { id: 'comparison-slider', name: 'Before/After Slider', tier: 3 }
    ]
  },
  {
    id: 'realtime',
    name: 'Real-time Features',
    icon: 'Activity',
    description: 'Live data and real-time updates',
    category: 'interactive',
    tier: 3,
    subOptions: [
      { id: 'live-counter', name: 'Live Counter', tier: 2 },
      { id: 'live-feed', name: 'Live Feed', tier: 3 },
      { id: 'chat-widget', name: 'Chat Widget', tier: 3 },
      { id: 'collaboration', name: 'Collaborative Editing', tier: 3 },
      { id: 'ai-assistant', name: 'AI Assistant Widget', tier: 3 }
    ]
  },

  // ==========================================
  // LAYOUT ELEMENTS (Tier 1-2)
  // ==========================================
  {
    id: 'grids',
    name: 'Grid Layouts',
    icon: 'LayoutGrid',
    description: 'Grid-based layout systems',
    category: 'layout',
    tier: 1,
    subOptions: [
      { id: 'card-grid', name: 'Card Grid', tier: 1 },
      { id: 'masonry', name: 'Masonry Layout', tier: 1 },
      { id: 'bento', name: 'Bento Grid', tier: 2 },
      { id: 'asymmetric', name: 'Asymmetric Grid', tier: 2 }
    ]
  },
  {
    id: 'sections',
    name: 'Section Layouts',
    icon: 'LayoutTemplate',
    description: 'Page section templates',
    category: 'layout',
    tier: 1,
    subOptions: [
      { id: 'hero', name: 'Hero Section', tier: 1 },
      { id: 'features', name: 'Features Section', tier: 1 },
      { id: 'testimonials', name: 'Testimonials Section', tier: 1 },
      { id: 'cta', name: 'CTA Section', tier: 1 },
      { id: 'pricing', name: 'Pricing Section', tier: 1 },
      { id: 'faq', name: 'FAQ Section', tier: 1 },
      { id: 'comparison', name: 'Comparison Section', tier: 2 }
    ]
  }
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getVisualFeaturesByCategory(category: ExpandedVisualFeature['category']): ExpandedVisualFeature[] {
  return EXPANDED_VISUAL_FEATURES.filter(f => f.category === category);
}

export function getVisualFeaturesByTier(tier: 1 | 2 | 3): ExpandedVisualFeature[] {
  return EXPANDED_VISUAL_FEATURES.filter(f => f.tier <= tier);
}

export function getVisualFeatureById(id: string): ExpandedVisualFeature | undefined {
  return EXPANDED_VISUAL_FEATURES.find(f => f.id === id);
}

// Category labels for display
export const VISUAL_FEATURE_CATEGORIES = {
  data: { name: 'Data Visualization', icon: 'BarChart3' },
  structure: { name: 'Structural Elements', icon: 'LayoutList' },
  media: { name: 'Media Elements', icon: 'Image' },
  '3d-ar': { name: '3D & AR Elements', icon: 'Box' },
  interactive: { name: 'Interactive Elements', icon: 'MousePointerClick' },
  layout: { name: 'Layout Elements', icon: 'LayoutGrid' }
};

// Feature counts for stats
export const VISUAL_FEATURE_STATS = {
  totalFeatures: EXPANDED_VISUAL_FEATURES.length,
  totalSubOptions: EXPANDED_VISUAL_FEATURES.reduce((acc, f) => acc + f.subOptions.length, 0),
  byCategory: Object.fromEntries(
    Object.keys(VISUAL_FEATURE_CATEGORIES).map(cat => [
      cat,
      EXPANDED_VISUAL_FEATURES.filter(f => f.category === cat).length
    ])
  )
};
