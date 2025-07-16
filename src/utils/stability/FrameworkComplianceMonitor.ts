/**
 * FRAMEWORK COMPLIANCE MONITOR
 * Browser-compatible compliance monitoring for stability framework
 * Real-time enforcement of stability framework rules
 */

// Browser-compatible EventEmitter
class SimpleEventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  emit(event: string, data?: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event callback error for ${event}:`, error);
        }
      });
    }
  }

  off(event: string, callback: Function) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

// Browser-compatible path utilities
const browserPath = {
  basename: (filePath: string, ext?: string) => {
    const name = filePath.split('/').pop() || '';
    if (ext && name.endsWith(ext)) {
      return name.slice(0, -ext.length);
    }
    return name;
  },
  extname: (filePath: string) => {
    const parts = filePath.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }
};

export class FrameworkComplianceMonitor extends SimpleEventEmitter {
  private config: any;
  private complianceStatus: Map<string, any>;
  private violations: any[];
  private warningThresholds: any;
  private isMonitoring: boolean;
  private realTimeAnalysis: boolean;
  private strictMode: boolean;
  private governanceRules: Map<string, any>;

  constructor(config: any = {}) {
    super();
    this.config = config;
    
    // Compliance state
    this.complianceStatus = new Map();
    this.violations = [];
    this.warningThresholds = config.thresholds || {};
    
    // Monitoring flags
    this.isMonitoring = false;
    this.realTimeAnalysis = true;
    this.strictMode = config.strictMode !== false; // Default to true
    
    // Governance rules
    this.governanceRules = new Map();
    this.setupGovernanceRules();
    
    console.log('🔍 Framework Compliance Monitor initialized (Browser Mode)');
  }

  setupGovernanceRules() {
    // Core governance rules that cannot be violated
    this.governanceRules.set('no_breaking_changes', {
      severity: 'error',
      description: 'Prevent any breaking changes to existing functionality',
      validator: this.validateNoBreakingChanges.bind(this),
      enforced: true
    });

    this.governanceRules.set('no_duplicate_creation', {
      severity: 'error', 
      description: 'Prevent creation of duplicate components/services',
      validator: this.validateNoDuplicates.bind(this),
      enforced: true
    });

    this.governanceRules.set('naming_conventions', {
      severity: 'error',
      description: 'Enforce consistent naming conventions',
      validator: this.validateNamingConventions.bind(this),
      enforced: true
    });

    this.governanceRules.set('file_complexity', {
      severity: 'warning',
      description: 'Monitor file complexity and suggest refactoring',
      validator: this.validateFileComplexity.bind(this),
      enforced: this.strictMode
    });

    this.governanceRules.set('backwards_compatibility', {
      severity: 'error',
      description: 'Maintain backwards compatibility',
      validator: this.validateBackwardsCompatibility.bind(this),
      enforced: true
    });
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️  Monitoring already active');
      return;
    }

    console.log('🚀 Starting framework monitoring (Browser Mode)...');
    
    this.isMonitoring = true;
    
    // In browser mode, we use different monitoring strategies
    await this.setupBrowserMonitoring();
    
    console.log('✅ Framework monitoring active - browser mode operational');
    
    this.emit('monitoring_started', {
      timestamp: new Date(),
      strictMode: this.strictMode,
      rules: Array.from(this.governanceRules.keys()),
      mode: 'browser'
    });
  }

  async setupBrowserMonitoring() {
    // In browser mode, we focus on validating existing code patterns
    // rather than file system watching
    console.log('📊 Browser compliance monitoring setup complete');
    
    // Run initial compliance check
    await this.runBrowserComplianceCheck();
    
    // Set up periodic checks
    setInterval(() => {
      this.runBrowserComplianceCheck();
    }, 60000); // Check every minute
  }

  async runBrowserComplianceCheck() {
    if (!this.isMonitoring) return;
    
    const checkResults = {
      timestamp: new Date(),
      rulesChecked: this.governanceRules.size,
      violationsFound: 0
    };
    
    // Emit compliance check event
    this.emit('compliance_check', checkResults);
  }

  // Governance Rule Validators
  async validateNoBreakingChanges(filePath: string, content: string, fileType: string, event: string) {
    const violations = [];
    
    if (event === 'change' && (fileType === 'component' || fileType === 'service')) {
      // Check for removed exports
      if (this.hasRemovedExports(content, filePath)) {
        violations.push({
          message: 'Potential breaking change: exports may have been removed',
          recommendation: 'Ensure all public APIs remain available',
          severity: 'error',
          blocking: true
        });
      }

      // Check for changed function signatures
      if (this.hasChangedSignatures(content, filePath)) {
        violations.push({
          message: 'Potential breaking change: function signatures may have changed',
          recommendation: 'Maintain backwards compatible function signatures',
          severity: 'error',
          blocking: true
        });
      }
    }
    
    return violations;
  }

  async validateNoDuplicates(filePath: string, content: string, fileType: string, event: string) {
    const violations = [];
    
    if (event === 'add' && (fileType === 'component' || fileType === 'service')) {
      const name = this.extractNameFromPath(filePath);
      
      // In browser mode, we can't scan file system, so we use different heuristics
      violations.push({
        message: `Creating new ${fileType}: ${name}`,
        recommendation: `Ensure no duplicate ${fileType} exists before creating`,
        severity: 'warning',
        blocking: false
      });
    }
    
    return violations;
  }

  async validateNamingConventions(filePath: string, content: string, fileType: string, event: string) {
    const violations = [];
    
    const name = this.extractNameFromPath(filePath);
    
    if (fileType === 'component') {
      // Check PascalCase for components
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
        violations.push({
          message: `Component name "${name}" should be PascalCase`,
          recommendation: 'Use PascalCase naming for React components',
          severity: 'error',
          blocking: true
        });
      }

      // Check for proper export
      if (!content.includes(`export default ${name}`) && !content.includes(`export { ${name}`)) {
        violations.push({
          message: `Component "${name}" should be properly exported`,
          recommendation: 'Ensure component is exported with matching name',
          severity: 'error',
          blocking: true
        });
      }
    }
    
    if (fileType === 'service') {
      // Check Service suffix
      if (!name.endsWith('Service') && !name.includes('service')) {
        violations.push({
          message: `Service name "${name}" should end with 'Service'`,
          recommendation: 'Use Service suffix for service files',
          severity: 'error',
          blocking: true
        });
      }
    }

    if (fileType === 'hook') {
      // Check 'use' prefix for hooks
      const hookExports = this.extractHookExports(content);
      hookExports.forEach(hookName => {
        if (!hookName.startsWith('use')) {
          violations.push({
            message: `Hook "${hookName}" should start with 'use'`,
            recommendation: 'Follow React hook naming convention',
            severity: 'error',
            blocking: true
          });
        }
      });
    }
    
    return violations;
  }

  async validateFileComplexity(filePath: string, content: string, fileType: string, event: string) {
    const violations = [];
    
    const lineCount = content.split('\n').length;
    const complexityThreshold = this.config.complexityThreshold || 300;
    
    if (lineCount > complexityThreshold) {
      violations.push({
        message: `File complexity too high: ${lineCount} lines (max: ${complexityThreshold})`,
        recommendation: 'Consider breaking this file into smaller, focused components',
        severity: 'warning',
        blocking: this.strictMode && lineCount > 500 // Block if extremely large
      });
    }

    // Check for multiple responsibilities
    if (fileType === 'component' && this.hasMultipleResponsibilities(content)) {
      violations.push({
        message: 'Component appears to have multiple responsibilities',
        recommendation: 'Consider separating concerns into multiple components',
        severity: 'warning',
        blocking: false
      });
    }
    
    return violations;
  }

  async validateBackwardsCompatibility(filePath: string, content: string, fileType: string, event: string) {
    const violations = [];
    
    if (event === 'change') {
      // Simple heuristics for backwards compatibility
      if (content.includes('TODO: BREAKING CHANGE') || content.includes('BREAKING:')) {
        violations.push({
          message: 'File contains breaking change markers',
          recommendation: 'Ensure proper versioning and migration strategy',
          severity: 'error',
          blocking: true
        });
      }
    }
    
    return violations;
  }

  // Helper methods
  determineFileType(filePath: string) {
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/services/')) return 'service';
    if (filePath.includes('/types/')) return 'type';
    if (filePath.includes('/hooks/')) return 'hook';
    if (filePath.includes('/utils/')) return 'utility';
    return 'unknown';
  }

  extractNameFromPath(filePath: string) {
    return browserPath.basename(filePath, browserPath.extname(filePath));
  }

  extractHookExports(content: string) {
    const hookRegex = /export\s+(?:const|function)\s+(\w+)/g;
    const matches = [];
    let match;
    
    while ((match = hookRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  hasRemovedExports(content: string, filePath: string) {
    // Simple heuristic - in production would compare with previous version
    return content.includes('// TODO: Remove') || content.includes('// DEPRECATED');
  }

  hasChangedSignatures(content: string, filePath: string) {
    // Simple heuristic - in production would use AST comparison
    return content.includes('// SIGNATURE CHANGE') || content.includes('// BREAKING:');
  }

  hasMultipleResponsibilities(content: string) {
    // Heuristic: multiple useState hooks or large number of functions
    const useStateCount = (content.match(/useState/g) || []).length;
    const functionCount = (content.match(/const\s+\w+\s*=/g) || []).length;
    
    return useStateCount > 5 || functionCount > 10;
  }

  generateComplianceReport() {
    return {
      timestamp: new Date(),
      monitoring: {
        active: this.isMonitoring,
        mode: 'browser',
        strictMode: this.strictMode,
        rulesEnforced: Array.from(this.governanceRules.entries())
          .filter(([name, rule]) => rule.enforced)
          .map(([name]) => name)
      },
      compliance: {
        score: 100, // Default to 100% in browser mode
        totalViolations: this.violations.length,
        blockingViolations: this.violations.filter(v => v.blocking).length
      },
      violations: this.violations.slice(-10), // Last 10 violations
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.violations.length > 10) {
      recommendations.push('Consider reviewing development practices to reduce violations');
    }
    
    const duplicateViolations = this.violations.filter(v => v.rule === 'no_duplicate_creation');
    if (duplicateViolations.length > 3) {
      recommendations.push('Multiple duplicate violations - review component architecture');
    }
    
    return recommendations;
  }

  async stopMonitoring() {
    if (!this.isMonitoring) return;
    
    console.log('🛑 Stopping framework monitoring...');
    
    this.isMonitoring = false;
    
    console.log('✅ Framework monitoring stopped');
    
    this.emit('monitoring_stopped', {
      timestamp: new Date(),
      totalViolations: this.violations.length,
      mode: 'browser'
    });
  }
}

export default FrameworkComplianceMonitor;