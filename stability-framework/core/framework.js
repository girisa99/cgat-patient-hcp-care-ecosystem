/**
 * Framework Core - Main framework orchestration
 * Coordinates all stability framework components
 */

import { StabilityManager } from './stability-manager.js';
import { RoleManager } from '../features/role-manager.js';
import { FeatureFlags } from '../features/feature-flags.js';
import { SafeComponentManager } from '../components/safe-component-manager.js';
import { SafeRouter } from '../routing/safe-router.js';
import { SafeHookManager } from '../hooks/safe-hook-manager.js';

export class Framework {
  constructor(config = {}) {
    this.config = {
      autoStart: true,
      development: process.env.NODE_ENV === 'development',
      enableLogging: true,
      ...config
    };
    
    this.isInitialized = false;
    this.components = {
      stabilityManager: null,
      roleManager: null,
      featureFlags: null,
      componentManager: null,
      router: null,
      hookManager: null
    };
    
    this.eventBus = new EventTarget();
  }

  /**
   * Initialize the framework
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ Framework already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Stability Framework...');
      
      // Initialize core components
      await this.initializeComponents();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start monitoring if auto-start is enabled
      if (this.config.autoStart) {
        await this.start();
      }
      
      this.isInitialized = true;
      console.log('✅ Stability Framework initialized successfully');
      
      this.emit('framework:initialized');
    } catch (error) {
      console.error('❌ Framework initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize framework components
   */
  async initializeComponents() {
    console.log('📦 Initializing framework components...');
    
    // Initialize Stability Manager
    this.components.stabilityManager = new StabilityManager({
      autoFix: this.config.development,
      logLevel: this.config.enableLogging ? 'info' : 'error'
    });
    
    // Initialize Role Manager
    this.components.roleManager = new RoleManager();
    
    // Initialize Feature Flags
    this.components.featureFlags = new FeatureFlags();
    
    // Initialize Component Manager
    this.components.componentManager = new SafeComponentManager();
    
    // Initialize Router
    this.components.router = new SafeRouter();
    
    // Initialize Hook Manager
    this.components.hookManager = new SafeHookManager();
    
    console.log('✅ All components initialized');
  }

  /**
   * Set up inter-component event listeners
   */
  setupEventListeners() {
    // Stability events
    this.on('stability:issue-detected', (event) => {
      console.log('🔍 Stability issue detected:', event.detail);
    });
    
    this.on('stability:issue-fixed', (event) => {
      console.log('🔧 Stability issue fixed:', event.detail);
    });
    
    // Component events
    this.on('component:duplicate-detected', (event) => {
      console.log('🔍 Component duplicate detected:', event.detail);
    });
    
    // Route events
    this.on('route:conflict-detected', (event) => {
      console.log('🔍 Route conflict detected:', event.detail);
    });
  }

  /**
   * Start the framework
   */
  async start() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log('▶️ Starting Stability Framework...');
    
    try {
      // Start stability monitoring
      await this.components.stabilityManager.startMonitoring();
      
      // Start component monitoring
      await this.components.componentManager.startMonitoring();
      
      // Start route monitoring
      await this.components.router.startMonitoring();
      
      // Start hook monitoring
      await this.components.hookManager.startMonitoring();
      
      this.emit('framework:started');
      console.log('✅ Stability Framework started successfully');
    } catch (error) {
      console.error('❌ Framework start failed:', error);
      throw error;
    }
  }

  /**
   * Stop the framework
   */
  async stop() {
    console.log('⏹️ Stopping Stability Framework...');
    
    try {
      // Stop all monitoring
      if (this.components.stabilityManager) {
        this.components.stabilityManager.stopMonitoring();
      }
      
      if (this.components.componentManager) {
        this.components.componentManager.stopMonitoring();
      }
      
      if (this.components.router) {
        this.components.router.stopMonitoring();
      }
      
      if (this.components.hookManager) {
        this.components.hookManager.stopMonitoring();
      }
      
      this.emit('framework:stopped');
      console.log('✅ Stability Framework stopped successfully');
    } catch (error) {
      console.error('❌ Framework stop failed:', error);
      throw error;
    }
  }

  /**
   * Get framework status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      components: Object.keys(this.components).reduce((status, key) => {
        status[key] = this.components[key] ? 'initialized' : 'not_initialized';
        return status;
      }, {}),
      metrics: this.components.stabilityManager ? 
        this.components.stabilityManager.getMetrics() : null
    };
  }

  /**
   * Generate comprehensive framework report
   */
  async generateReport() {
    const report = {
      timestamp: new Date(),
      framework: {
        version: '1.0.0',
        status: this.getStatus()
      },
      stability: null,
      components: null,
      routing: null,
      hooks: null
    };
    
    // Get stability report
    if (this.components.stabilityManager) {
      report.stability = await this.components.stabilityManager.generateReport();
    }
    
    // Get component report
    if (this.components.componentManager) {
      report.components = await this.components.componentManager.generateReport();
    }
    
    // Get routing report
    if (this.components.router) {
      report.routing = await this.components.router.generateReport();
    }
    
    // Get hooks report
    if (this.components.hookManager) {
      report.hooks = await this.components.hookManager.generateReport();
    }
    
    return report;
  }

  /**
   * Access specific framework component
   */
  getComponent(name) {
    return this.components[name];
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.components.featureFlags ? 
      this.components.featureFlags.isEnabled(featureName) : false;
  }

  /**
   * Get user roles
   */
  getUserRoles(userId) {
    return this.components.roleManager ? 
      this.components.roleManager.getUserRoles(userId) : [];
  }

  /**
   * Emit framework event
   */
  emit(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    this.eventBus.dispatchEvent(event);
  }

  /**
   * Listen to framework event
   */
  on(eventName, handler) {
    this.eventBus.addEventListener(eventName, handler);
  }

  /**
   * Remove framework event listener
   */
  off(eventName, handler) {
    this.eventBus.removeEventListener(eventName, handler);
  }

  /**
   * Perform health check
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      components: {},
      issues: []
    };
    
    // Check each component
    for (const [name, component] of Object.entries(this.components)) {
      try {
        if (component && typeof component.healthCheck === 'function') {
          health.components[name] = await component.healthCheck();
        } else {
          health.components[name] = { status: component ? 'ok' : 'not_initialized' };
        }
      } catch (error) {
        health.components[name] = { status: 'error', error: error.message };
        health.issues.push(`${name}: ${error.message}`);
      }
    }
    
    // Determine overall status
    const hasErrors = Object.values(health.components).some(c => c.status === 'error');
    const hasWarnings = Object.values(health.components).some(c => c.status === 'warning');
    
    if (hasErrors) {
      health.status = 'unhealthy';
    } else if (hasWarnings) {
      health.status = 'degraded';
    }
    
    return health;
  }
}

export default Framework;