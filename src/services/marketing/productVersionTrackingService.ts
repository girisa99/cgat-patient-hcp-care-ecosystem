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
    features: [
      { id: 'ppt_generator', name: 'Presentation Generator', screens: ['deck-wizard', 'deck-editor'] },
      { id: 'slide_templates', name: 'Smart Templates', screens: ['deck-templates'] },
      { id: 'export_options', name: 'Multi-Format Export', screens: ['deck-export'] },
    ],
  },
  arc: {
    id: 'arc',
    name: 'Genie Arc',
    tagline: 'Your Production Journey With Infinite Possibilities',
    category: 'MANAGE',
    features: [
      { id: 'project_management', name: 'Project Dashboard', screens: ['arc-dashboard'] },
      { id: 'version_control', name: 'Version Control', screens: ['arc-versions'] },
      { id: 'collaboration', name: 'Team Collaboration', screens: ['arc-collab'] },
    ],
  },
  cast: {
    id: 'cast',
    name: 'Genie Cast',
    tagline: 'Make It. Show It. Scale It.',
    category: 'PUBLISH',
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
    features: [
      { id: 'chat_interface', name: 'AI Chat Interface', screens: ['ask-chat'] },
      { id: 'knowledge_base', name: 'Knowledge Base', screens: ['ask-kb'] },
      { id: 'guided_help', name: 'Guided Assistance', screens: ['ask-guide'] },
    ],
  },
  studio: {
    id: 'studio',
    name: 'Genie Studio',
    tagline: 'The Complete Creation Suite',
    category: 'HUB',
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
