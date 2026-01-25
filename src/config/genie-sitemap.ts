/**
 * GENIE STUDIO SITEMAP CONFIGURATION
 * Journey-Centric Architecture with Regional Support
 * 
 * Visual Style: AI Avatar Presenters + 3D Immersive + Interactive Demos + Video-First
 * Localization: Hybrid IP + Manual Selector (14 regional bundles)
 * Dogfood Integration: Daily Showcases + Product Demos + Testimonial Avatars
 */

export type GeniePageType = 
  | 'landing' 
  | 'explore' 
  | 'product' 
  | 'pricing' 
  | 'auth' 
  | 'support' 
  | 'admin' 
  | 'dashboard'
  | 'legal';

export type GenieProductSlug = 
  | 'mind' 
  | 'spark' 
  | 'vibe' 
  | 'deck' 
  | 'arc' 
  | 'hub'
  | 'studio';

export type RegionalCode = 
  | 'en' | 'ar' | 'zh' | 'hi' | 'es' | 'fr' 
  | 'de' | 'ja' | 'ko' | 'pt' | 'ru' | 'tr' | 'id' | 'vi';

export interface SitemapNode {
  path: string;
  name: string;
  type: GeniePageType;
  isPublic: boolean;
  requiresAuth: boolean;
  internalOnly: boolean;
  seoTitle: string;
  seoDescription: string;
  dogfoodFeatures?: string[];
  regionalPaths?: boolean;
  children?: SitemapNode[];
}

/**
 * COMPLETE SITEMAP STRUCTURE
 * Journey Flow: Landing → Explore → Product → Pricing → Auth → Dashboard
 */
export const GENIE_SITEMAP: SitemapNode[] = [
  // ============================================
  // PUBLIC MARKETING PAGES
  // ============================================
  {
    path: '/',
    name: 'Landing',
    type: 'landing',
    isPublic: true,
    requiresAuth: false,
    internalOnly: false,
    seoTitle: 'Genie AI Suite - Transform Ideas into Multi-Modal Content',
    seoDescription: 'Create stunning presentations, videos, avatars, and more with AI. 119+ pipelines, 70+ languages, enterprise-ready.',
    dogfoodFeatures: ['daily_showcase', 'avatar_presenter', '3d_hero', 'video_testimonials'],
    regionalPaths: true,
  },
  {
    path: '/explore',
    name: 'Interactive Journey',
    type: 'explore',
    isPublic: true,
    requiresAuth: false,
    internalOnly: false,
    seoTitle: 'Explore Genie AI - Find Your Perfect Creative Workflow',
    seoDescription: 'Discover which Genie tools are right for you. Try 3 free generations and get personalized recommendations.',
    dogfoodFeatures: ['interactive_demo', 'use_case_selector', 'mini_generation'],
    regionalPaths: true,
    children: [
      {
        path: '/explore/use-case',
        name: 'Use Case Selector',
        type: 'explore',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'What Do You Want to Create? | Genie AI',
        seoDescription: 'Select your use case: presentations, videos, training content, marketing, or more.',
        regionalPaths: true,
      },
      {
        path: '/explore/demo',
        name: 'Interactive Demo',
        type: 'explore',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'Try Genie AI Free | Interactive Demo',
        seoDescription: 'Experience AI content generation with 3 free demo generations.',
        dogfoodFeatures: ['limited_generation', 'preview_output'],
        regionalPaths: true,
      },
      {
        path: '/explore/recommendation',
        name: 'Product Recommendation',
        type: 'explore',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'Your Personalized Genie Recommendation',
        seoDescription: 'Based on your needs, here are the best Genie tools for you.',
        regionalPaths: true,
      },
    ],
  },

  // ============================================
  // PRODUCT DEEP DIVES
  // ============================================
  {
    path: '/products',
    name: 'Products',
    type: 'product',
    isPublic: true,
    requiresAuth: false,
    internalOnly: false,
    seoTitle: 'Genie AI Products - Complete Creative Suite',
    seoDescription: 'Explore our full suite: Mind, Spark, Vibe, Deck, Arc, and Studio Hub.',
    regionalPaths: true,
    children: [
      {
        path: '/products/mind',
        name: 'Genie Mind',
        type: 'product',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'Genie Mind - AI Knowledge Base & RAG System',
        seoDescription: 'Build intelligent knowledge bases with semantic search and AI-powered Q&A.',
        dogfoodFeatures: ['product_demo_video', 'feature_showcase'],
        regionalPaths: true,
      },
      {
        path: '/products/spark',
        name: 'Genie Spark',
        type: 'product',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'Genie Spark - AI Script & Content Generation',
        seoDescription: 'Generate scripts, outlines, and structured content with AI assistance.',
        dogfoodFeatures: ['product_demo_video', 'feature_showcase'],
        regionalPaths: true,
      },
      {
        path: '/products/vibe',
        name: 'Genie Vibe',
        type: 'product',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'Genie Vibe - AI Recording Studio',
        seoDescription: 'Record, transcribe, and transform audio/video with AI enhancement.',
        dogfoodFeatures: ['product_demo_video', 'feature_showcase'],
        regionalPaths: true,
      },
      {
        path: '/products/deck',
        name: 'Genie Deck',
        type: 'product',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'Genie Deck - AI Presentation Builder',
        seoDescription: 'Create stunning presentations with AI-generated slides, visuals, and animations.',
        dogfoodFeatures: ['product_demo_video', 'feature_showcase'],
        regionalPaths: true,
      },
      {
        path: '/products/arc',
        name: 'Genie Arc',
        type: 'product',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'Genie Arc - AI Production Hub',
        seoDescription: 'Orchestrate complex multi-modal content production workflows.',
        dogfoodFeatures: ['product_demo_video', 'feature_showcase'],
        regionalPaths: true,
      },
      {
        path: '/products/studio',
        name: 'Genie Studio',
        type: 'product',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'Genie Studio - Complete AI Creative Suite',
        seoDescription: 'The full Genie experience: all tools, unlimited possibilities.',
        dogfoodFeatures: ['product_demo_video', 'feature_showcase', 'pipeline_showcase'],
        regionalPaths: true,
      },
    ],
  },

  // ============================================
  // PRICING & CONVERSION
  // ============================================
  {
    path: '/pricing',
    name: 'Pricing',
    type: 'pricing',
    isPublic: true,
    requiresAuth: false,
    internalOnly: false,
    seoTitle: 'Genie AI Pricing - Plans for Creators to Enterprises',
    seoDescription: 'Choose from Free, Creator, Pro, Business, or Enterprise plans. Start creating today.',
    regionalPaths: true,
  },

  // ============================================
  // AUTHENTICATION
  // ============================================
  {
    path: '/auth',
    name: 'Sign In / Sign Up',
    type: 'auth',
    isPublic: true,
    requiresAuth: false,
    internalOnly: false,
    seoTitle: 'Sign In to Genie AI',
    seoDescription: 'Access your Genie AI dashboard. Sign in with Google or email.',
    regionalPaths: false,
  },

  // ============================================
  // SUPPORT & HELP
  // ============================================
  {
    path: '/support',
    name: 'Support Center',
    type: 'support',
    isPublic: true,
    requiresAuth: false,
    internalOnly: false,
    seoTitle: 'Genie AI Support - Help Center',
    seoDescription: 'Get help with Genie AI. AI chat support, knowledge base, and ticket submission.',
    regionalPaths: true,
    children: [
      {
        path: '/support/knowledge-base',
        name: 'Knowledge Base',
        type: 'support',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'Genie AI Knowledge Base',
        seoDescription: 'Browse guides, tutorials, and FAQs.',
        regionalPaths: true,
      },
      {
        path: '/support/community',
        name: 'Community',
        type: 'support',
        isPublic: true,
        requiresAuth: false,
        internalOnly: false,
        seoTitle: 'Genie AI Community',
        seoDescription: 'Connect with other Genie users.',
        regionalPaths: true,
      },
    ],
  },

  // ============================================
  // LEGAL PAGES
  // ============================================
  {
    path: '/privacy',
    name: 'Privacy Policy',
    type: 'legal',
    isPublic: true,
    requiresAuth: false,
    internalOnly: false,
    seoTitle: 'Privacy Policy | Genie AI',
    seoDescription: 'Read our privacy policy and data handling practices.',
    regionalPaths: true,
  },
  {
    path: '/terms',
    name: 'Terms of Service',
    type: 'legal',
    isPublic: true,
    requiresAuth: false,
    internalOnly: false,
    seoTitle: 'Terms of Service | Genie AI',
    seoDescription: 'Read our terms of service and usage policies.',
    regionalPaths: true,
  },

  // ============================================
  // AUTHENTICATED DASHBOARD
  // ============================================
  {
    path: '/dashboard',
    name: 'Dashboard',
    type: 'dashboard',
    isPublic: false,
    requiresAuth: true,
    internalOnly: false,
    seoTitle: 'Genie AI Dashboard',
    seoDescription: 'Your Genie AI workspace.',
    regionalPaths: false,
  },

  // ============================================
  // INTERNAL ADMIN
  // ============================================
  {
    path: '/internal',
    name: 'Internal Admin',
    type: 'admin',
    isPublic: false,
    requiresAuth: true,
    internalOnly: true,
    seoTitle: 'Genie Internal Admin',
    seoDescription: 'Internal team management.',
    regionalPaths: false,
    children: [
      {
        path: '/internal/users',
        name: 'User Management',
        type: 'admin',
        isPublic: false,
        requiresAuth: true,
        internalOnly: true,
        seoTitle: 'Internal User Management',
        seoDescription: 'Manage internal team members.',
        regionalPaths: false,
      },
      {
        path: '/internal/dogfooding',
        name: 'Dogfooding Dashboard',
        type: 'admin',
        isPublic: false,
        requiresAuth: true,
        internalOnly: true,
        seoTitle: 'Dogfooding Dashboard',
        seoDescription: 'Review and approve marketing content.',
        regionalPaths: false,
      },
    ],
  },
];

/**
 * REGIONAL PATH GENERATOR
 * Creates localized paths for SEO (e.g., /ar/products/deck)
 */
export const SUPPORTED_REGIONS: { code: RegionalCode; name: string; rtl: boolean }[] = [
  { code: 'en', name: 'English', rtl: false },
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'zh', name: '中文', rtl: false },
  { code: 'hi', name: 'हिन्दी', rtl: false },
  { code: 'es', name: 'Español', rtl: false },
  { code: 'fr', name: 'Français', rtl: false },
  { code: 'de', name: 'Deutsch', rtl: false },
  { code: 'ja', name: '日本語', rtl: false },
  { code: 'ko', name: '한국어', rtl: false },
  { code: 'pt', name: 'Português', rtl: false },
  { code: 'tr', name: 'Türkçe', rtl: false },
  { code: 'id', name: 'Bahasa Indonesia', rtl: false },
  { code: 'vi', name: 'Tiếng Việt', rtl: false },
];

/**
 * Get flat list of all routes for router configuration
 */
export const getAllRoutes = (): SitemapNode[] => {
  const routes: SitemapNode[] = [];
  
  const traverse = (nodes: SitemapNode[]) => {
    for (const node of nodes) {
      routes.push(node);
      if (node.children) {
        traverse(node.children);
      }
    }
  };
  
  traverse(GENIE_SITEMAP);
  return routes;
};

/**
 * Get public routes only (for unauthenticated users)
 */
export const getPublicRoutes = (): SitemapNode[] => {
  return getAllRoutes().filter(r => r.isPublic);
};

/**
 * Get product pages only
 */
export const getProductRoutes = (): SitemapNode[] => {
  return getAllRoutes().filter(r => r.type === 'product' && r.path.startsWith('/products/'));
};

/**
 * Navigation structure for header/footer
 */
export const MAIN_NAVIGATION = [
  { label: 'Explore', path: '/explore', highlight: true },
  { label: 'Products', path: '/products', children: getProductRoutes() },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Support', path: '/support' },
];

export const FOOTER_NAVIGATION = {
  products: getProductRoutes(),
  company: [
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Careers', path: '/careers' },
  ],
  resources: [
    { label: 'Documentation', path: '/docs' },
    { label: 'API Reference', path: '/api' },
    { label: 'Community', path: '/support/community' },
  ],
  legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
  ],
};
