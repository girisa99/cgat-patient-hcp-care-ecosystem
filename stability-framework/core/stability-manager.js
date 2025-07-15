/**
 * Stability Manager - Core framework orchestrator
 */

import { DuplicateAnalyzer } from './duplicate-analyzer.js';
import { EventEmitter } from 'events';

export class StabilityManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      enableMonitoring: true,
      enableEnforcement: true,
      enableAnalytics: true,
      monitoringInterval: 30000,
      ...config
    };
    
    this.isInitialized = false;
    this.duplicateAnalyzer = new DuplicateAnalyzer(this.config.duplicateAnalysis);
    this.violations = new Map();
    this.metrics = new Map();
    this.watchers = new Map();
    
    this.initializeCore();
  }

  async initializeCore() {
    console.log('🔧 Initializing Stability Manager...');
    
    try {
      if (this.config.enableMonitoring) {
        await this.initializeMonitoring();
      }
      
      if (this.config.enableEnforcement) {
        await this.initializeEnforcement();
      }
      
      if (this.config.enableAnalytics) {
        await this.initializeAnalytics();
      }
      
      this.isInitialized = true;
      this.emit('initialized');
      console.log('✅ Stability Manager initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Stability Manager:', error);
      this.emit('error', error);
    }
  }

  async initializeMonitoring() {
    console.log('📊 Starting framework monitoring...');
    
    if (this.config.monitoringInterval > 0) {
      this.monitoringTimer = setInterval(() => {
        this.performPeriodicCheck();
      }, this.config.monitoringInterval);
    }
  }

  async initializeEnforcement() {
    console.log('🛡️ Setting up framework enforcement...');
    this.registerValidationRules();
  }

  async initializeAnalytics() {
    console.log('📈 Initializing framework analytics...');
    this.metrics.set('violations', 0);
    this.metrics.set('warnings', 0);
    this.metrics.set('suggestions', 0);
    this.metrics.set('lastScan', new Date());
  }

  async performPeriodicCheck() {
    try {
      const results = await this.runComprehensiveCheck();
      this.updateMetrics(results);
      this.emit('checkCompleted', results);
      
      if (results.violations.length > 0) {
        this.emit('violationsDetected', results.violations);
      }
    } catch (error) {
      console.error('❌ Periodic check failed:', error);
      this.emit('error', error);
    }
  }

  async runComprehensiveCheck() {
    const results = {
      violations: [],
      warnings: [],
      suggestions: [],
      metrics: {},
      timestamp: new Date()
    };

    const duplicates = await this.duplicateAnalyzer.analyze();
    if (duplicates.length > 0) {
      results.violations.push(...duplicates.map(d => ({
        type: 'duplicate',
        severity: 'high',
        message: d.message,
        files: d.files
      })));
    }

    return results;
  }

  registerValidationRules() {
    this.validationRules = new Map([
      ['naming', this.validateNaming.bind(this)],
      ['complexity', this.validateComplexity.bind(this)],
      ['duplicates', this.validateDuplicates.bind(this)],
      ['updateFirst', this.validateUpdateFirst.bind(this)]
    ]);
  }

  validateNaming(file) {
    return { valid: true, issues: [] };
  }

  validateComplexity(file) {
    return { valid: true, issues: [] };
  }

  validateDuplicates(file) {
    return { valid: true, issues: [] };
  }

  validateUpdateFirst(file) {
    return { valid: true, issues: [] };
  }

  updateMetrics(results) {
    this.metrics.set('violations', results.violations.length);
    this.metrics.set('warnings', results.warnings.length);
    this.metrics.set('suggestions', results.suggestions.length);
    this.metrics.set('lastScan', results.timestamp);
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      monitoring: !!this.monitoringTimer,
      violations: this.violations.size,
      metrics: Object.fromEntries(this.metrics)
    };
  }

  shutdown() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    
    this.watchers.forEach(watcher => {
      if (watcher.close) watcher.close();
    });
    this.watchers.clear();
    
    this.isInitialized = false;
    this.emit('shutdown');
    console.log('🔧 Stability Manager shutdown complete');
  }
}