/**
 * Feature Flags - Manages feature toggles and gradual rollouts
 * Provides controlled feature deployment and A/B testing capabilities
 */

import { TypeValidator, FeatureFlagSchema, FrameworkError } from '../core/types.js';

export class FeatureFlags {
  constructor(config = {}) {
    this.config = {
      defaultEnabled: false,
      evaluationCacheTime: 60000, // 1 minute
      persistToStorage: true,
      storageKey: 'stability_framework_features',
      ...config
    };
    
    this.flags = new Map();
    this.evaluationCache = new Map();
    this.evaluationListeners = new Set();
    this.metrics = {
      evaluations: 0,
      cacheHits: 0,
      toggles: 0
    };
    
    this.initializeDefaultFlags();
    this.loadFromStorage();
  }

  /**
   * Initialize default feature flags for the healthcare system
   */
  initializeDefaultFlags() {
    const defaultFlags = [
      {
        name: 'enhanced_security',
        enabled: true,
        rolloutPercentage: 100,
        conditions: {
          roles: ['admin', 'superAdmin'],
          userTypes: ['internal']
        },
        metadata: {
          description: 'Enhanced security features and monitoring',
          owner: 'security-team',
          category: 'security'
        }
      },
      {
        name: 'advanced_analytics',
        enabled: false,
        rolloutPercentage: 25,
        conditions: {
          facilities: ['tier1', 'enterprise'],
          beta: true
        },
        metadata: {
          description: 'Advanced analytics and reporting features',
          owner: 'analytics-team',
          category: 'analytics'
        }
      },
      {
        name: 'new_onboarding_flow',
        enabled: true,
        rolloutPercentage: 100,
        conditions: {},
        metadata: {
          description: 'Improved onboarding experience',
          owner: 'onboarding-team',
          category: 'ux'
        }
      },
      {
        name: 'ai_recommendations',
        enabled: false,
        rolloutPercentage: 10,
        conditions: {
          roles: ['clinician', 'pharmacist'],
          experimentGroup: 'ai_pilot'
        },
        metadata: {
          description: 'AI-powered clinical recommendations',
          owner: 'ai-team',
          category: 'ai',
          experimental: true
        }
      },
      {
        name: 'mobile_app_features',
        enabled: true,
        rolloutPercentage: 100,
        conditions: {
          platform: ['mobile', 'tablet']
        },
        metadata: {
          description: 'Mobile-specific features and optimizations',
          owner: 'mobile-team',
          category: 'mobile'
        }
      },
      {
        name: 'real_time_notifications',
        enabled: true,
        rolloutPercentage: 80,
        conditions: {
          roles: ['clinician', 'nurse', 'pharmacist']
        },
        metadata: {
          description: 'Real-time push notifications for critical updates',
          owner: 'notification-team',
          category: 'communication'
        }
      },
      {
        name: 'duplicate_detection',
        enabled: true,
        rolloutPercentage: 100,
        conditions: {},
        metadata: {
          description: 'Automatic duplicate detection and prevention',
          owner: 'stability-team',
          category: 'stability'
        }
      },
      {
        name: 'performance_monitoring',
        enabled: true,
        rolloutPercentage: 100,
        conditions: {},
        metadata: {
          description: 'Enhanced performance monitoring and alerts',
          owner: 'devops-team',
          category: 'monitoring'
        }
      }
    ];

    defaultFlags.forEach(flag => this.addFlag(flag));
  }

  /**
   * Add a new feature flag
   */
  addFlag(flagData) {
    const validation = TypeValidator.validate(flagData, FeatureFlagSchema);
    if (!validation.valid) {
      throw new FrameworkError(
        `Invalid feature flag data: ${validation.errors.join(', ')}`,
        'INVALID_FLAG_DATA',
        'FeatureFlags'
      );
    }

    this.flags.set(flagData.name, {
      ...flagData,
      createdAt: new Date(),
      lastModified: new Date()
    });
    
    this.clearEvaluationCache();
    this.saveToStorage();
    
    console.log(`🚩 Feature flag added: ${flagData.name}`);
  }

  /**
   * Remove a feature flag
   */
  removeFlag(flagName) {
    if (!this.flags.has(flagName)) {
      throw new FrameworkError(
        `Feature flag not found: ${flagName}`,
        'FLAG_NOT_FOUND',
        'FeatureFlags'
      );
    }

    this.flags.delete(flagName);
    this.clearEvaluationCache();
    this.saveToStorage();
    
    console.log(`🗑️ Feature flag removed: ${flagName}`);
  }

  /**
   * Update feature flag
   */
  updateFlag(flagName, updates) {
    if (!this.flags.has(flagName)) {
      throw new FrameworkError(
        `Feature flag not found: ${flagName}`,
        'FLAG_NOT_FOUND',
        'FeatureFlags'
      );
    }

    const flag = this.flags.get(flagName);
    const updatedFlag = {
      ...flag,
      ...updates,
      lastModified: new Date()
    };

    // Validate updated flag
    const validation = TypeValidator.validate(updatedFlag, FeatureFlagSchema);
    if (!validation.valid) {
      throw new FrameworkError(
        `Invalid feature flag update: ${validation.errors.join(', ')}`,
        'INVALID_FLAG_UPDATE',
        'FeatureFlags'
      );
    }

    this.flags.set(flagName, updatedFlag);
    this.clearEvaluationCache();
    this.saveToStorage();
    this.metrics.toggles++;
    
    console.log(`🔄 Feature flag updated: ${flagName}`);
  }

  /**
   * Check if feature is enabled for context
   */
  isEnabled(flagName, context = {}) {
    const cacheKey = `${flagName}:${JSON.stringify(context)}`;
    
    // Check cache first
    if (this.evaluationCache.has(cacheKey)) {
      const cached = this.evaluationCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.evaluationCacheTime) {
        this.metrics.cacheHits++;
        return cached.value;
      }
    }

    this.metrics.evaluations++;
    const result = this.evaluateFlag(flagName, context);
    
    // Cache result
    this.evaluationCache.set(cacheKey, {
      value: result,
      timestamp: Date.now()
    });

    // Notify listeners
    this.notifyEvaluationListeners(flagName, context, result);

    return result;
  }

  /**
   * Internal flag evaluation logic
   */
  evaluateFlag(flagName, context) {
    const flag = this.flags.get(flagName);
    
    // Flag not found - return default
    if (!flag) {
      console.warn(`⚠️ Feature flag not found: ${flagName}, using default`);
      return this.config.defaultEnabled;
    }

    // Flag is disabled
    if (!flag.enabled) {
      return false;
    }

    // Check rollout percentage
    if (!this.isInRollout(flagName, context, flag.rolloutPercentage)) {
      return false;
    }

    // Check conditions
    if (!this.evaluateConditions(flag.conditions, context)) {
      return false;
    }

    return true;
  }

  /**
   * Check if context is within rollout percentage
   */
  isInRollout(flagName, context, rolloutPercentage) {
    if (rolloutPercentage >= 100) return true;
    if (rolloutPercentage <= 0) return false;

    // Use consistent hashing based on flag name and user ID
    const userId = context.userId || context.user?.id || 'anonymous';
    const hash = this.generateHash(`${flagName}:${userId}`);
    const percentage = (hash % 100) + 1;
    
    return percentage <= rolloutPercentage;
  }

  /**
   * Evaluate flag conditions
   */
  evaluateConditions(conditions, context) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    // Check role conditions
    if (conditions.roles && context.roles) {
      const hasRole = conditions.roles.some(role => 
        context.roles.includes(role)
      );
      if (!hasRole) return false;
    }

    // Check user type conditions
    if (conditions.userTypes && context.userType) {
      if (!conditions.userTypes.includes(context.userType)) {
        return false;
      }
    }

    // Check facility conditions
    if (conditions.facilities && context.facilityType) {
      if (!conditions.facilities.includes(context.facilityType)) {
        return false;
      }
    }

    // Check platform conditions
    if (conditions.platform && context.platform) {
      if (!conditions.platform.includes(context.platform)) {
        return false;
      }
    }

    // Check beta access
    if (conditions.beta && !context.betaAccess) {
      return false;
    }

    // Check experiment group
    if (conditions.experimentGroup && context.experimentGroup !== conditions.experimentGroup) {
      return false;
    }

    // Check custom conditions
    if (conditions.custom && typeof conditions.custom === 'function') {
      if (!conditions.custom(context)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate consistent hash for rollout
   */
  generateHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get all feature flags
   */
  getAllFlags() {
    return Array.from(this.flags.values());
  }

  /**
   * Get feature flag by name
   */
  getFlag(flagName) {
    return this.flags.get(flagName);
  }

  /**
   * Get flags by category
   */
  getFlagsByCategory(category) {
    return this.getAllFlags().filter(flag => 
      flag.metadata?.category === category
    );
  }

  /**
   * Get enabled flags for context
   */
  getEnabledFlags(context = {}) {
    return this.getAllFlags()
      .filter(flag => this.isEnabled(flag.name, context))
      .map(flag => flag.name);
  }

  /**
   * Toggle feature flag
   */
  toggle(flagName) {
    const flag = this.getFlag(flagName);
    if (!flag) {
      throw new FrameworkError(
        `Feature flag not found: ${flagName}`,
        'FLAG_NOT_FOUND',
        'FeatureFlags'
      );
    }

    this.updateFlag(flagName, { enabled: !flag.enabled });
  }

  /**
   * Enable feature flag
   */
  enable(flagName) {
    this.updateFlag(flagName, { enabled: true });
  }

  /**
   * Disable feature flag
   */
  disable(flagName) {
    this.updateFlag(flagName, { enabled: false });
  }

  /**
   * Set rollout percentage
   */
  setRollout(flagName, percentage) {
    if (percentage < 0 || percentage > 100) {
      throw new FrameworkError(
        'Rollout percentage must be between 0 and 100',
        'INVALID_ROLLOUT_PERCENTAGE',
        'FeatureFlags'
      );
    }

    this.updateFlag(flagName, { rolloutPercentage: percentage });
  }

  /**
   * Add evaluation listener
   */
  onEvaluation(listener) {
    this.evaluationListeners.add(listener);
  }

  /**
   * Remove evaluation listener
   */
  offEvaluation(listener) {
    this.evaluationListeners.delete(listener);
  }

  /**
   * Notify evaluation listeners
   */
  notifyEvaluationListeners(flagName, context, result) {
    for (const listener of this.evaluationListeners) {
      try {
        listener({ flagName, context, result, timestamp: new Date() });
      } catch (error) {
        console.error('Feature flag evaluation listener error:', error);
      }
    }
  }

  /**
   * Clear evaluation cache
   */
  clearEvaluationCache() {
    this.evaluationCache.clear();
  }

  /**
   * Get evaluation metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.evaluationCache.size,
      flagCount: this.flags.size,
      listenerCount: this.evaluationListeners.size
    };
  }

  /**
   * Save flags to storage
   */
  saveToStorage() {
    if (!this.config.persistToStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const data = {
        flags: Array.from(this.flags.values()),
        timestamp: new Date()
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save feature flags to storage:', error);
    }
  }

  /**
   * Load flags from storage
   */
  loadFromStorage() {
    if (!this.config.persistToStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.flags && Array.isArray(data.flags)) {
          data.flags.forEach(flag => {
            // Only load if not already exists (don't override defaults)
            if (!this.flags.has(flag.name)) {
              this.flags.set(flag.name, flag);
            }
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load feature flags from storage:', error);
    }
  }

  /**
   * Export configuration
   */
  exportConfiguration() {
    return {
      flags: Array.from(this.flags.values()),
      config: this.config,
      metrics: this.getMetrics(),
      timestamp: new Date()
    };
  }

  /**
   * Import configuration
   */
  importConfiguration(data) {
    this.flags.clear();
    
    if (data.flags && Array.isArray(data.flags)) {
      data.flags.forEach(flag => this.addFlag(flag));
    }
    
    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
    
    this.clearEvaluationCache();
    console.log('📥 Feature flags configuration imported successfully');
  }
}

export default FeatureFlags;