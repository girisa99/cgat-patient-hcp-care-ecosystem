/**
 * Safe Hook Manager - Manages React hooks with safety checks
 * Prevents infinite loops, validates dependencies, and ensures hook rules compliance
 */

export class SafeHookManager {
  constructor(config = {}) {
    this.config = {
      trackDependencies: true,
      detectInfiniteLoops: true,
      validateRules: true,
      maxExecutions: 100,
      executionWindow: 1000, // 1 second
      ...config
    };
    
    this.hooks = new Map();
    this.executions = new Map();
    this.dependencies = new Map();
    this.violations = new Map();
    this.isMonitoring = false;
    
    this.initializeHookTracking();
  }

  /**
   * Initialize hook tracking system
   */
  initializeHookTracking() {
    // This would need to be integrated with React's hook system
    // For now, we'll create a monitoring system that can be used
    console.log('🎣 Initializing hook tracking system...');
  }

  /**
   * Start hook monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('👁️ Hook monitoring started');
    
    // Set up periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldExecutions();
    }, 30000);
  }

  /**
   * Stop hook monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    console.log('⏹️ Hook monitoring stopped');
  }

  /**
   * Register a custom hook
   */
  registerHook(hookName, hookConfig = {}) {
    const hook = {
      name: hookName,
      registeredAt: new Date(),
      executions: 0,
      lastExecution: null,
      dependencies: hookConfig.dependencies || [],
      rules: hookConfig.rules || [],
      maxExecutions: hookConfig.maxExecutions || this.config.maxExecutions,
      ...hookConfig
    };

    this.hooks.set(hookName, hook);
    this.executions.set(hookName, []);
    
    console.log(`🎣 Hook registered: ${hookName}`);
  }

  /**
   * Track hook execution
   */
  trackExecution(hookName, context = {}) {
    if (!this.isMonitoring) return;

    const now = Date.now();
    const execution = {
      timestamp: now,
      context,
      dependencies: context.dependencies || [],
      componentName: context.componentName,
      renderCount: context.renderCount || 1
    };

    // Get or create execution history
    if (!this.executions.has(hookName)) {
      this.executions.set(hookName, []);
    }

    const executions = this.executions.get(hookName);
    executions.push(execution);

    // Update hook info
    const hook = this.hooks.get(hookName);
    if (hook) {
      hook.executions++;
      hook.lastExecution = now;
    }

    // Check for violations
    this.checkViolations(hookName, execution, executions);

    return execution;
  }

  /**
   * Check for hook rule violations
   */
  checkViolations(hookName, execution, executions) {
    const violations = [];

    // Check for infinite loop detection
    if (this.config.detectInfiniteLoops) {
      const infiniteLoopViolation = this.detectInfiniteLoop(hookName, executions);
      if (infiniteLoopViolation) {
        violations.push(infiniteLoopViolation);
      }
    }

    // Check dependency violations
    if (this.config.trackDependencies) {
      const depViolation = this.checkDependencyViolations(hookName, execution);
      if (depViolation) {
        violations.push(depViolation);
      }
    }

    // Check React hook rules
    if (this.config.validateRules) {
      const ruleViolations = this.validateHookRules(hookName, execution);
      violations.push(...ruleViolations);
    }

    // Store violations
    if (violations.length > 0) {
      this.recordViolations(hookName, violations);
    }
  }

  /**
   * Detect infinite loop patterns
   */
  detectInfiniteLoop(hookName, executions) {
    const recentExecutions = executions.filter(exec => 
      Date.now() - exec.timestamp < this.config.executionWindow
    );

    if (recentExecutions.length > this.config.maxExecutions) {
      return {
        type: 'infinite_loop',
        severity: 'critical',
        message: `Hook ${hookName} executed ${recentExecutions.length} times in ${this.config.executionWindow}ms`,
        executions: recentExecutions.length,
        timeWindow: this.config.executionWindow
      };
    }

    return null;
  }

  /**
   * Check dependency violations (like useEffect dependency array)
   */
  checkDependencyViolations(hookName, execution) {
    if (!execution.dependencies) return null;

    // Check for missing dependencies (simplified)
    const hook = this.hooks.get(hookName);
    if (hook && hook.expectedDependencies) {
      const missing = hook.expectedDependencies.filter(dep => 
        !execution.dependencies.includes(dep)
      );

      if (missing.length > 0) {
        return {
          type: 'missing_dependencies',
          severity: 'medium',
          message: `Hook ${hookName} is missing dependencies: ${missing.join(', ')}`,
          missing
        };
      }
    }

    // Check for unstable dependencies
    const unstable = execution.dependencies.filter(dep => 
      typeof dep === 'object' || typeof dep === 'function'
    );

    if (unstable.length > 0) {
      return {
        type: 'unstable_dependencies',
        severity: 'low',
        message: `Hook ${hookName} has potentially unstable dependencies`,
        unstableDeps: unstable.length
      };
    }

    return null;
  }

  /**
   * Validate React hook rules
   */
  validateHookRules(hookName, execution) {
    const violations = [];

    // Rule 1: Only call hooks at the top level
    if (execution.context.isConditional) {
      violations.push({
        type: 'conditional_hook',
        severity: 'high',
        message: `Hook ${hookName} called conditionally`,
        rule: 'hooks_top_level'
      });
    }

    // Rule 2: Only call hooks from React functions
    if (execution.context.isInRegularFunction) {
      violations.push({
        type: 'hook_in_regular_function',
        severity: 'high',
        message: `Hook ${hookName} called from regular function`,
        rule: 'hooks_react_functions_only'
      });
    }

    // Rule 3: Hooks should be called in the same order
    if (execution.context.orderChanged) {
      violations.push({
        type: 'hook_order_changed',
        severity: 'critical',
        message: `Hook ${hookName} order changed between renders`,
        rule: 'hooks_same_order'
      });
    }

    return violations;
  }

  /**
   * Record violations for a hook
   */
  recordViolations(hookName, violations) {
    if (!this.violations.has(hookName)) {
      this.violations.set(hookName, []);
    }

    const hookViolations = this.violations.get(hookName);
    violations.forEach(violation => {
      hookViolations.push({
        ...violation,
        timestamp: new Date(),
        hookName
      });
    });

    // Log critical violations immediately
    const critical = violations.filter(v => v.severity === 'critical');
    if (critical.length > 0) {
      console.error(`🚨 Critical hook violations in ${hookName}:`, critical);
    }
  }

  /**
   * Create a safe hook wrapper
   */
  createSafeHook(hookName, originalHook, config = {}) {
    return (...args) => {
      const context = {
        componentName: this.getCurrentComponentName(),
        renderCount: this.getCurrentRenderCount(),
        dependencies: args[1], // For useEffect-like hooks
        isConditional: this.isConditionalCall(),
        isInRegularFunction: this.isInRegularFunction()
      };

      // Track execution
      this.trackExecution(hookName, context);

      try {
        // Call original hook
        return originalHook(...args);
      } catch (error) {
        console.error(`❌ Hook error in ${hookName}:`, error);
        
        // Record error violation
        this.recordViolations(hookName, [{
          type: 'hook_error',
          severity: 'high',
          message: `Hook ${hookName} threw an error: ${error.message}`,
          error: error.message
        }]);

        throw error;
      }
    };
  }

  /**
   * Get current component name (would need React integration)
   */
  getCurrentComponentName() {
    // This would need to be implemented with React DevTools integration
    return 'Unknown';
  }

  /**
   * Get current render count (would need React integration)
   */
  getCurrentRenderCount() {
    // This would need to be implemented with React integration
    return 1;
  }

  /**
   * Check if hook is called conditionally
   */
  isConditionalCall() {
    // This would need static analysis or React integration
    return false;
  }

  /**
   * Check if hook is called from regular function
   */
  isInRegularFunction() {
    // This would need static analysis or React integration
    return false;
  }

  /**
   * Cleanup old execution records
   */
  cleanupOldExecutions() {
    const cutoff = Date.now() - (this.config.executionWindow * 10);

    for (const [hookName, executions] of this.executions) {
      const filtered = executions.filter(exec => exec.timestamp > cutoff);
      this.executions.set(hookName, filtered);
    }

    // Cleanup old violations
    for (const [hookName, violations] of this.violations) {
      const filtered = violations.filter(v => 
        Date.now() - v.timestamp.getTime() < 300000 // Keep for 5 minutes
      );
      this.violations.set(hookName, filtered);
    }
  }

  /**
   * Get hook statistics
   */
  getHookStatistics() {
    const stats = {
      totalHooks: this.hooks.size,
      totalExecutions: 0,
      totalViolations: 0,
      violationsByType: {},
      executionsByHook: {}
    };

    // Calculate execution stats
    for (const [hookName, executions] of this.executions) {
      stats.totalExecutions += executions.length;
      stats.executionsByHook[hookName] = executions.length;
    }

    // Calculate violation stats
    for (const violations of this.violations.values()) {
      stats.totalViolations += violations.length;
      
      violations.forEach(violation => {
        stats.violationsByType[violation.type] = 
          (stats.violationsByType[violation.type] || 0) + 1;
      });
    }

    return stats;
  }

  /**
   * Get violations for a specific hook
   */
  getHookViolations(hookName) {
    return this.violations.get(hookName) || [];
  }

  /**
   * Get all violations
   */
  getAllViolations() {
    const allViolations = [];
    for (const violations of this.violations.values()) {
      allViolations.push(...violations);
    }
    return allViolations.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get hook execution history
   */
  getExecutionHistory(hookName, limit = 100) {
    const executions = this.executions.get(hookName) || [];
    return executions.slice(-limit);
  }

  /**
   * Analyze hook performance
   */
  analyzeHookPerformance(hookName) {
    const executions = this.executions.get(hookName) || [];
    if (executions.length === 0) {
      return { error: 'No execution data available' };
    }

    const recentExecutions = executions.filter(exec => 
      Date.now() - exec.timestamp < 60000 // Last minute
    );

    return {
      totalExecutions: executions.length,
      recentExecutions: recentExecutions.length,
      executionsPerMinute: recentExecutions.length,
      averageRenderCount: this.calculateAverageRenderCount(executions),
      potentialIssues: this.identifyPerformanceIssues(hookName, executions)
    };
  }

  /**
   * Calculate average render count
   */
  calculateAverageRenderCount(executions) {
    if (executions.length === 0) return 0;
    
    const totalRenderCount = executions.reduce((sum, exec) => 
      sum + (exec.renderCount || 1), 0
    );
    
    return totalRenderCount / executions.length;
  }

  /**
   * Identify performance issues
   */
  identifyPerformanceIssues(hookName, executions) {
    const issues = [];

    // High execution frequency
    const recentExecutions = executions.filter(exec => 
      Date.now() - exec.timestamp < 1000
    );
    
    if (recentExecutions.length > 20) {
      issues.push({
        type: 'high_frequency',
        severity: 'medium',
        message: `Hook ${hookName} executed ${recentExecutions.length} times in 1 second`
      });
    }

    // High render count
    const avgRenderCount = this.calculateAverageRenderCount(executions);
    if (avgRenderCount > 5) {
      issues.push({
        type: 'high_render_count',
        severity: 'low',
        message: `Hook ${hookName} has high average render count: ${avgRenderCount.toFixed(2)}`
      });
    }

    return issues;
  }

  /**
   * Generate hook report
   */
  async generateReport() {
    return {
      timestamp: new Date(),
      summary: {
        totalHooks: this.hooks.size,
        monitoring: this.isMonitoring,
        ...this.getHookStatistics()
      },
      hooks: Array.from(this.hooks.values()).map(hook => ({
        name: hook.name,
        executions: hook.executions,
        lastExecution: hook.lastExecution,
        violations: this.getHookViolations(hook.name).length,
        performance: this.analyzeHookPerformance(hook.name)
      })),
      violations: this.getAllViolations().slice(0, 50), // Last 50 violations
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate recommendations based on violations
   */
  generateRecommendations() {
    const recommendations = [];
    const stats = this.getHookStatistics();

    if (stats.violationsByType.infinite_loop > 0) {
      recommendations.push('Review hooks with infinite loops - check dependency arrays');
    }

    if (stats.violationsByType.missing_dependencies > 0) {
      recommendations.push('Add missing dependencies to useEffect dependency arrays');
    }

    if (stats.violationsByType.conditional_hook > 0) {
      recommendations.push('Move hooks to the top level of components - avoid conditional calls');
    }

    if (stats.totalViolations > 100) {
      recommendations.push('High number of hook violations detected - consider code review');
    }

    return recommendations;
  }

  /**
   * Health check for hook manager
   */
  async healthCheck() {
    const stats = this.getHookStatistics();
    const criticalViolations = this.getAllViolations()
      .filter(v => v.severity === 'critical').length;
    
    return {
      status: criticalViolations > 0 ? 'error' : 'ok',
      hooks: this.hooks.size,
      executions: stats.totalExecutions,
      violations: stats.totalViolations,
      criticalViolations,
      monitoring: this.isMonitoring
    };
  }
}

export default SafeHookManager;