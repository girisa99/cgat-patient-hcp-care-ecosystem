/**
 * Product Version Tracking Service
 * 
 * Tracks product changes using git-based detection + version comparison.
 * Alerts Genie Cast when products need video regeneration.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface ProductVersion {
  productId: string;
  version: string;
  versionNumber: number;
  previousVersion?: string;
  changeType: 'major' | 'minor' | 'patch';
  changedFeatures: ChangedFeature[];
  changelog: string;
  screenshotsOutdated: boolean;
  videoOutdated: boolean;
  detectedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface ChangedFeature {
  featureId: string;
  featureName: string;
  changeType: 'added' | 'modified' | 'removed' | 'ui_update';
  description: string;
  affectedScreens: string[];
  messagingNeedsUpdate: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ProductChangeAlert {
  id: string;
  productId: string;
  productName: string;
  alertType: 'screenshot_outdated' | 'video_outdated' | 'messaging_outdated' | 'new_feature';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  actionRequired: string;
  detectedAt: Date;
  resolvedAt?: Date;
  autoResolved: boolean;
}

export interface VersionHistory {
  productId: string;
  versions: ProductVersion[];
  currentVersion: string;
  lastScreenshotCapture: Date | null;
  lastVideoGeneration: Date | null;
  pendingChanges: number;
}

// ============================================================================
// PRODUCT DEFINITIONS
// ============================================================================

export const GENIE_PRODUCTS = {
  spark: {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Ignite your Ideas',
    category: 'CREATE',
    description: 'AI-powered ideation engine that transforms vague concepts into actionable content strategies. Uses multi-model brainstorming to generate ideas, outlines, and content starters across formats — blogs, videos, social, presentations.',
    valueProposition: 'Go from blank page to brilliant content plan in under 60 seconds using AI that thinks creatively across formats.',
    positioning: 'The only ideation tool that combines multi-modal AI brainstorming with instant content scaffolding for every channel.',
    painPoints: ['Creative block and blank-page paralysis', 'Hours wasted on manual brainstorming sessions', 'Disconnected ideation across content formats', 'Ideas that never translate to actionable plans'],
    keyBenefits: ['Generate 50+ content ideas in seconds', 'AI brainstorming canvas with visual mind-mapping', 'Instant content starters for any format', 'Cross-format idea expansion (blog → video → social)'],
    useCases: ['Marketing teams needing weekly content calendars', 'Solo creators overcoming creative block', 'Agencies brainstorming campaigns for multiple clients'],
    competitiveEdge: 'Unlike ChatGPT or Jasper that generate text-only ideas, Spark generates multi-format content blueprints with visual brainstorming and direct handoff to production tools.',
    features: [
      { id: 'idea_generation', name: 'AI Idea Generation', screens: ['spark-main', 'spark-ideas'] },
      { id: 'brainstorm', name: 'Brainstorming Canvas', screens: ['spark-canvas'] },
      { id: 'content_starter', name: 'Content Starter', screens: ['spark-templates'] },
    ],
  },
  mind: {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'AI That Understands',
    category: 'CREATE',
    description: 'Intelligent script writing and content enhancement engine. Analyzes context, audience, and intent to produce scripts, training materials, and structured content that resonates with specific demographics and regions.',
    valueProposition: 'Write scripts and training content that sound human, resonate locally, and convert — powered by AI that understands your audience.',
    positioning: 'The only AI writing tool with built-in audience intelligence, regional dialect awareness, and multi-format script generation.',
    painPoints: ['Scripts that sound robotic and generic', 'Content that misses cultural nuances', 'Manual rewriting for different audiences', 'No way to validate content resonance before publishing'],
    keyBenefits: ['Context-aware script generation', 'Regional dialect and cultural adaptation', 'Audience-specific tone calibration', 'Built-in training module builder with quizzes'],
    useCases: ['L&D teams building training programs', 'Marketing teams writing region-specific copy', 'Content teams producing multi-audience scripts'],
    competitiveEdge: 'While Writesonic or Copy.ai generate generic text, Mind understands audience psychology, regional dialects, and content structure to produce scripts that actually convert.',
    features: [
      { id: 'training_modules', name: 'Training Module Builder', screens: ['mind-builder', 'mind-preview'] },
      { id: 'quiz_generator', name: 'AI Quiz Generator', screens: ['mind-quiz'] },
      { id: 'learning_paths', name: 'Learning Paths', screens: ['mind-paths'] },
    ],
  },
  vibe: {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    category: 'PRODUCE',
    description: 'End-to-end video production pipeline that transforms scripts into professional videos with AI-generated visuals, voiceovers, animations, and effects. Supports 200+ production pipelines including avatar, 3D, and AR/VR.',
    valueProposition: 'Turn any script into a broadcast-quality video in minutes — no camera, no crew, no editing skills required.',
    positioning: 'The only AI video platform with 200+ production pipelines, multi-modal generation (avatar, 3D, motion graphics), and automatic regional localization.',
    painPoints: ['Video production costs $5K-$50K per minute professionally', 'Weeks-long production timelines', 'Need for specialized video editing skills', 'Impossible to scale video across languages and regions'],
    keyBenefits: ['Script-to-video in under 10 minutes', '200+ AI production pipelines', 'Multi-language voiceover and subtitles', 'Avatar, 3D, and AR/VR capabilities built-in'],
    useCases: ['Product demo videos for SaaS companies', 'Training videos for enterprises', 'Social media video campaigns at scale', 'Multi-language marketing for global brands'],
    competitiveEdge: 'Synthesia does avatars, Runway does effects, Pictory does clips — Vibe does ALL of them in one unified pipeline with regional intelligence.',
    features: [
      { id: 'script_editor', name: 'Script Editor', screens: ['vibe-script'] },
      { id: 'storyboard', name: 'AI Storyboard', screens: ['vibe-storyboard'] },
      { id: 'video_generation', name: 'Video Generation', screens: ['vibe-generate', 'vibe-preview'] },
    ],
  },
  deck: {
    id: 'deck',
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    category: 'CREATE',
    description: 'AI presentation generator that creates compelling slide decks from prompts, documents, or data. Produces investor decks, sales presentations, training materials, and marketing collateral with professional design and storytelling.',
    valueProposition: 'Create presentation decks that tell compelling stories and close deals — from a single prompt or document upload.',
    positioning: 'The only AI presentation tool that combines narrative storytelling AI with professional design automation and multi-format export.',
    painPoints: ['Hours spent on slide design instead of content', 'Presentations that bore audiences', 'Inconsistent branding across decks', 'No time to create compelling data visualizations'],
    keyBenefits: ['Prompt-to-presentation in 2 minutes', 'AI storytelling with narrative arc optimization', 'Smart data visualization generation', 'Brand-consistent templates with one-click theming'],
    useCases: ['Sales teams creating pitch decks', 'Executives preparing board presentations', 'Trainers building course materials', 'Marketers creating campaign proposals'],
    competitiveEdge: 'While Beautiful.ai and Tome focus on design, Deck focuses on persuasive storytelling — AI that structures your narrative for maximum impact.',
    features: [
      { id: 'ppt_generator', name: 'Presentation Generator', screens: ['deck-wizard', 'deck-editor'] },
      { id: 'slide_templates', name: 'Smart Templates', screens: ['deck-templates'] },
      { id: 'export_options', name: 'Multi-Format Export', screens: ['deck-export'] },
    ],
  },
  arc: {
    id: 'arc',
    name: 'Genie Hub',
    tagline: 'Your Creative Command Center',
    category: 'MANAGE',
    description: 'Centralized project management and creative operations hub. Provides unified dashboards, version control, team collaboration, asset libraries, and workflow orchestration across all Genie Suite products.',
    valueProposition: 'One command center to manage every creative project, asset, and team member across all your AI content tools.',
    positioning: 'The creative operations hub that unifies AI content creation, team collaboration, and asset management in one workspace.',
    painPoints: ['Creative projects scattered across 10+ tools', 'No version control for creative assets', 'Team collaboration bottlenecks in content approval', 'Asset libraries with no organization or search'],
    keyBenefits: ['Unified dashboard across all Genie products', 'Git-like version control for creative assets', 'Real-time team collaboration and approvals', 'Smart asset library with AI-powered search'],
    useCases: ['Creative directors managing multi-project pipelines', 'Marketing ops teams coordinating campaigns', 'Agencies managing client deliverables'],
    competitiveEdge: 'Monday.com manages tasks, Frame.io manages video review — Hub manages the entire AI-powered creative workflow from ideation to publishing.',
    features: [
      { id: 'project_management', name: 'Project Dashboard', screens: ['hub-dashboard'] },
      { id: 'version_control', name: 'Version Control', screens: ['hub-versions'] },
      { id: 'collaboration', name: 'Team Collaboration', screens: ['hub-collab'] },
    ],
  },
  cast: {
    id: 'cast',
    name: 'Genie Cast',
    tagline: 'Make It. Show It. Scale It.',
    category: 'PUBLISH',
    description: 'Full-stack content production and distribution platform. Handles video production studio, multi-language publishing, regional transcreation, scheduling, A/B testing, and performance analytics — from creation to global distribution.',
    valueProposition: 'Create once, publish everywhere — AI handles localization, optimization, and distribution across 50+ channels and 14+ languages.',
    positioning: 'The only content production platform that combines creation, transcreation, multi-channel distribution, and performance optimization in one pipeline.',
    painPoints: ['Content that works in one market fails in others', 'Manual translation destroys brand voice', 'Publishing across platforms is fragmented', 'No way to measure content ROI across regions'],
    keyBenefits: ['One-click multi-language transcreation (not translation)', 'Automated multi-channel distribution', 'A/B testing with AI optimization', 'Real-time performance analytics across regions'],
    useCases: ['Global marketing teams launching multi-region campaigns', 'Content teams scaling production without growing headcount', 'Brands expanding into new markets with localized content'],
    competitiveEdge: 'Buffer schedules posts, Lokalise translates text — Cast does full creative production, cultural transcreation, and intelligent distribution as one unified workflow.',
    features: [
      { id: 'video_production', name: 'Video Production Studio', screens: ['cast-studio'] },
      { id: 'multi_language', name: 'Multi-Language Publishing', screens: ['cast-languages'] },
      { id: 'analytics', name: 'Performance Analytics', screens: ['cast-analytics'] },
    ],
  },
  ask_genie: {
    id: 'ask_genie',
    name: 'Ask Genie',
    tagline: 'Your Wish is My Command',
    category: 'SUPPORT',
    description: 'Conversational AI assistant with deep knowledge of the entire Genie Suite ecosystem. Provides guided help, product recommendations, workflow suggestions, and real-time creative coaching through natural language interaction.',
    valueProposition: 'Get instant expert help on any Genie product — from how-to guidance to creative coaching — without leaving your workflow.',
    positioning: 'An AI creative coach that knows every feature of every Genie product and can guide you to the perfect workflow for any content goal.',
    painPoints: ['Steep learning curves with new tools', 'No context-aware help when stuck', 'Support tickets that take days to resolve', 'Missing workflow best practices and shortcuts'],
    keyBenefits: ['Instant context-aware help', 'Cross-product workflow recommendations', 'Creative coaching and best practices', 'Direct action execution from chat'],
    useCases: ['New users onboarding to the Genie Suite', 'Power users discovering advanced features', 'Teams needing workflow optimization'],
    competitiveEdge: 'Unlike generic chatbots, Ask Genie has deep knowledge of all 8 products and can not just answer questions but execute actions across the suite.',
    features: [
      { id: 'chat_interface', name: 'AI Chat Interface', screens: ['ask-chat'] },
      { id: 'knowledge_base', name: 'Knowledge Base', screens: ['ask-kb'] },
      { id: 'guided_help', name: 'Guided Assistance', screens: ['ask-guide'] },
    ],
  },
  studio: {
    id: 'studio',
    name: 'Genie Suite',
    tagline: 'Mind to Media',
    category: 'HUB',
    description: 'The umbrella AI content creation platform that unifies all 8 Genie products into one seamless experience. From ideation (Spark) through production (Vibe, Cast) to distribution and analytics — the complete Mind to Media pipeline.',
    valueProposition: 'The only AI platform that takes you from initial idea to published, localized, multi-format content — all in one workspace.',
    positioning: 'The world\'s first complete AI content creation ecosystem — 8 specialized products, 200+ pipelines, 30+ AI providers, unified in one platform.',
    painPoints: ['Content creation requires 10+ disconnected tools', 'No single platform handles ideation through distribution', 'AI tools are siloed and don\'t share context', 'Scaling content production requires growing teams'],
    keyBenefits: ['Complete Mind to Media pipeline', '8 specialized AI products in one platform', '200+ multi-modal AI pipelines', '30+ enterprise AI provider integrations'],
    useCases: ['Enterprise content operations at scale', 'Agencies managing multi-client content', 'Brands building content engines with lean teams'],
    competitiveEdge: 'No competitor offers the full pipeline — from Spark (ideation) through Mind (scripting), Vibe (production), Deck (presentations), to Cast (distribution) — all sharing context and intelligence.',
    features: [
      { id: 'wizard', name: 'Generation Wizard', screens: ['studio-wizard'] },
      { id: 'editor', name: 'Rich Media Editor', screens: ['studio-editor'] },
      { id: 'pipeline', name: 'Pipeline Manager', screens: ['studio-pipelines'] },
    ],
  },
} as const;

export type GenieProductId = keyof typeof GENIE_PRODUCTS;

// ============================================================================
// VERSION TRACKING SERVICE
// ============================================================================

class ProductVersionTrackingService {
  private static instance: ProductVersionTrackingService;
  private versionHistory: Map<string, VersionHistory> = new Map();
  private activeAlerts: Map<string, ProductChangeAlert[]> = new Map();
  private listeners: ((alert: ProductChangeAlert) => void)[] = [];

  static getInstance(): ProductVersionTrackingService {
    if (!this.instance) {
      this.instance = new ProductVersionTrackingService();
      this.instance.initialize();
    }
    return this.instance;
  }

  private initialize(): void {
    // Initialize version history for all products
    Object.keys(GENIE_PRODUCTS).forEach(productId => {
      this.versionHistory.set(productId, {
        productId,
        versions: [],
        currentVersion: '1.0.0',
        lastScreenshotCapture: null,
        lastVideoGeneration: null,
        pendingChanges: 0,
      });
      this.activeAlerts.set(productId, []);
    });

    console.log('[VersionTracking] Initialized for', Object.keys(GENIE_PRODUCTS).length, 'products');
  }

  /**
   * Subscribe to change alerts
   */
  onChangeAlert(callback: (alert: ProductChangeAlert) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Register a product change (called when features are updated)
   */
  registerProductChange(
    productId: GenieProductId,
    changedFeatures: Omit<ChangedFeature, 'priority'>[],
    changeDescription: string
  ): ProductVersion {
    const history = this.versionHistory.get(productId);
    if (!history) throw new Error(`Unknown product: ${productId}`);

    const product = GENIE_PRODUCTS[productId];
    const previousVersion = history.currentVersion;
    
    // Calculate new version based on change type
    const hasMajorChange = changedFeatures.some(f => 
      f.changeType === 'added' || f.changeType === 'removed'
    );
    const hasModifiedChange = changedFeatures.some(f => 
      f.changeType === 'modified'
    );

    const changeType: 'major' | 'minor' | 'patch' = 
      hasMajorChange ? 'major' : 
      hasModifiedChange ? 'minor' : 
      'patch';

    const [major, minor, patch] = previousVersion.split('.').map(Number);
    const newVersion = changeType === 'major' 
      ? `${major + 1}.0.0`
      : changeType === 'minor'
      ? `${major}.${minor + 1}.0`
      : `${major}.${minor}.${patch + 1}`;

    // Create version record
    const version: ProductVersion = {
      productId,
      version: newVersion,
      versionNumber: major * 10000 + minor * 100 + patch + 1,
      previousVersion,
      changeType,
      changedFeatures: changedFeatures.map(f => ({
        ...f,
        priority: f.changeType === 'added' ? 'critical' : 
                  f.changeType === 'modified' ? 'high' : 
                  f.changeType === 'ui_update' ? 'medium' : 'low',
      })),
      changelog: changeDescription,
      screenshotsOutdated: true,
      videoOutdated: true,
      detectedAt: new Date(),
    };

    // Update history
    history.versions.push(version);
    history.currentVersion = newVersion;
    history.pendingChanges++;

    // Create alerts
    this.createChangeAlerts(productId, product.name, version);

    console.log(`[VersionTracking] ${product.name} updated to v${newVersion}`);
    return version;
  }

  /**
   * Create alerts for product changes
   */
  private createChangeAlerts(
    productId: string,
    productName: string,
    version: ProductVersion
  ): void {
    const alerts = this.activeAlerts.get(productId) || [];
    
    // Screenshot outdated alert
    if (version.screenshotsOutdated) {
      const screenshotAlert: ProductChangeAlert = {
        id: `alert_${productId}_screenshot_${Date.now()}`,
        productId,
        productName,
        alertType: 'screenshot_outdated',
        severity: version.changeType === 'major' ? 'critical' : 'warning',
        message: `${productName} has ${version.changedFeatures.length} feature changes requiring new screenshots`,
        actionRequired: 'Run auto-capture for affected screens',
        detectedAt: new Date(),
        autoResolved: false,
      };
      alerts.push(screenshotAlert);
      this.notifyListeners(screenshotAlert);
    }

    // Video outdated alert
    if (version.videoOutdated) {
      const videoAlert: ProductChangeAlert = {
        id: `alert_${productId}_video_${Date.now()}`,
        productId,
        productName,
        alertType: 'video_outdated',
        severity: 'warning',
        message: `${productName} marketing video needs regeneration`,
        actionRequired: 'Generate new video with updated screenshots and messaging',
        detectedAt: new Date(),
        autoResolved: false,
      };
      alerts.push(videoAlert);
      this.notifyListeners(videoAlert);
    }

    // New feature alerts
    const newFeatures = version.changedFeatures.filter(f => f.changeType === 'added');
    newFeatures.forEach(feature => {
      const featureAlert: ProductChangeAlert = {
        id: `alert_${productId}_feature_${feature.featureId}_${Date.now()}`,
        productId,
        productName,
        alertType: 'new_feature',
        severity: 'info',
        message: `New feature added: ${feature.featureName}`,
        actionRequired: 'Generate feature-specific video and messaging',
        detectedAt: new Date(),
        autoResolved: false,
      };
      alerts.push(featureAlert);
      this.notifyListeners(featureAlert);
    });

    // Messaging update alerts
    const messagingNeeds = version.changedFeatures.filter(f => f.messagingNeedsUpdate);
    if (messagingNeeds.length > 0) {
      const messagingAlert: ProductChangeAlert = {
        id: `alert_${productId}_messaging_${Date.now()}`,
        productId,
        productName,
        alertType: 'messaging_outdated',
        severity: 'warning',
        message: `${messagingNeeds.length} features need updated hooks/CTAs`,
        actionRequired: 'Review and regenerate AI messaging',
        detectedAt: new Date(),
        autoResolved: false,
      };
      alerts.push(messagingAlert);
      this.notifyListeners(messagingAlert);
    }

    this.activeAlerts.set(productId, alerts);
  }

  private notifyListeners(alert: ProductChangeAlert): void {
    this.listeners.forEach(listener => {
      try {
        listener(alert);
      } catch (e) {
        console.error('[VersionTracking] Listener error:', e);
      }
    });
  }

  /**
   * Mark screenshots as captured
   */
  markScreenshotsCaptured(productId: string): void {
    const history = this.versionHistory.get(productId);
    if (!history) return;

    history.lastScreenshotCapture = new Date();
    
    // Resolve screenshot alerts
    const alerts = this.activeAlerts.get(productId) || [];
    alerts.forEach(alert => {
      if (alert.alertType === 'screenshot_outdated' && !alert.resolvedAt) {
        alert.resolvedAt = new Date();
        alert.autoResolved = true;
      }
    });

    // Mark current version screenshots as up-to-date
    const currentVersion = history.versions[history.versions.length - 1];
    if (currentVersion) {
      currentVersion.screenshotsOutdated = false;
    }

    console.log(`[VersionTracking] Screenshots captured for ${productId}`);
  }

  /**
   * Mark video as generated
   */
  markVideoGenerated(productId: string): void {
    const history = this.versionHistory.get(productId);
    if (!history) return;

    history.lastVideoGeneration = new Date();
    history.pendingChanges = 0;
    
    // Resolve video alerts
    const alerts = this.activeAlerts.get(productId) || [];
    alerts.forEach(alert => {
      if (alert.alertType === 'video_outdated' && !alert.resolvedAt) {
        alert.resolvedAt = new Date();
        alert.autoResolved = true;
      }
    });

    // Mark current version video as up-to-date
    const currentVersion = history.versions[history.versions.length - 1];
    if (currentVersion) {
      currentVersion.videoOutdated = false;
    }

    console.log(`[VersionTracking] Video generated for ${productId}`);
  }

  /**
   * Resolve an alert manually
   */
  resolveAlert(alertId: string, productId: string): void {
    const alerts = this.activeAlerts.get(productId) || [];
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      alert.autoResolved = false;
    }
  }

  /**
   * Get all active alerts
   */
  getAllActiveAlerts(): ProductChangeAlert[] {
    const allAlerts: ProductChangeAlert[] = [];
    this.activeAlerts.forEach(alerts => {
      allAlerts.push(...alerts.filter(a => !a.resolvedAt));
    });
    return allAlerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Get alerts for specific product
   */
  getProductAlerts(productId: string): ProductChangeAlert[] {
    return (this.activeAlerts.get(productId) || []).filter(a => !a.resolvedAt);
  }

  /**
   * Get version history for a product
   */
  getVersionHistory(productId: string): VersionHistory | null {
    return this.versionHistory.get(productId) || null;
  }

  /**
   * Get products needing attention
   */
  getProductsNeedingAttention(): { productId: string; productName: string; alertCount: number; severity: string }[] {
    const results: { productId: string; productName: string; alertCount: number; severity: string }[] = [];
    
    this.activeAlerts.forEach((alerts, productId) => {
      const unresolved = alerts.filter(a => !a.resolvedAt);
      if (unresolved.length > 0) {
        const product = GENIE_PRODUCTS[productId as GenieProductId];
        const maxSeverity = unresolved.some(a => a.severity === 'critical') ? 'critical' :
                           unresolved.some(a => a.severity === 'warning') ? 'warning' : 'info';
        results.push({
          productId,
          productName: product?.name || productId,
          alertCount: unresolved.length,
          severity: maxSeverity,
        });
      }
    });

    return results.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
    });
  }

  /**
   * Get summary stats
   */
  getSummary(): {
    totalProducts: number;
    productsNeedingUpdate: number;
    totalActiveAlerts: number;
    criticalAlerts: number;
  } {
    const allAlerts = this.getAllActiveAlerts();
    const productsNeedingUpdate = new Set(allAlerts.map(a => a.productId)).size;

    return {
      totalProducts: Object.keys(GENIE_PRODUCTS).length,
      productsNeedingUpdate,
      totalActiveAlerts: allAlerts.length,
      criticalAlerts: allAlerts.filter(a => a.severity === 'critical').length,
    };
  }
}

export const productVersionTrackingService = ProductVersionTrackingService.getInstance();
