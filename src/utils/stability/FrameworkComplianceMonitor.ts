/**
 * FRAMEWORK COMPLIANCE MONITOR
 * Real-time enforcement of stability framework rules
 * Integrated with existing stability framework components
 */
import { EventEmitter } from 'events';
import chokidar from 'chokidar';
import fs from 'fs/promises';
import path from 'path';

export class FrameworkComplianceMonitor extends EventEmitter {
  private config: any;
  private complianceStatus: Map<string, any>;
  private violations: any[];
  private warningThresholds: any;
  private isMonitoring: boolean;
  private realTimeAnalysis: boolean;
  private strictMode: boolean;
  private watchers: Map<string, any>;
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
    
    // File watchers
    this.watchers = new Map();
    
    // Governance rules
    this.governanceRules = new Map();
    this.setupGovernanceRules();
    
    console.log('🔍 Framework Compliance Monitor initialized');
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

    console.log('🚀 Starting real-time framework monitoring...');
    
    this.isMonitoring = true;
    
    // Start file watchers
    await this.setupFileWatchers();
    
    // Start compliance auditing
    await this.setupComplianceAuditing();
    
    console.log('✅ Framework monitoring active - all systems operational');
    
    this.emit('monitoring_started', {
      timestamp: new Date(),
      strictMode: this.strictMode,
      rules: Array.from(this.governanceRules.keys())
    });
  }

  async setupFileWatchers() {
    const watchPaths = [
      'src/**/*.{ts,tsx,js,jsx}',
      'src/**/*.{json,yaml,yml}',
      'scripts/**/*.js'
    ];

    for (const watchPath of watchPaths) {
      const watcher = chokidar.watch(watchPath, {
        ignored: /node_modules|\.git|dist|build/,
        persistent: true
      });

      watcher
        .on('add', (filePath) => this.handleFileChange('add', filePath))
        .on('change', (filePath) => this.handleFileChange('change', filePath))
        .on('unlink', (filePath) => this.handleFileChange('delete', filePath));

      this.watchers.set(watchPath, watcher);
    }

    console.log('👀 File watchers established');
  }

  async setupComplianceAuditing() {
    // Run compliance audit every 30 seconds
    setInterval(() => {
      this.runComplianceAudit();
    }, 30000);

    // Full audit every 5 minutes
    setInterval(() => {
      this.runFullAudit();
    }, 300000);

    console.log('📊 Compliance auditing scheduled');
  }

  async handleFileChange(event, filePath) {
    if (!this.isMonitoring) return;

    console.log(`📝 File ${event}: ${filePath}`);
    
    try {
      // Immediate compliance check
      const violations = await this.checkFileCompliance(filePath, event);
      
      if (violations.length > 0) {
        await this.handleViolations(violations, filePath);
      }
      
      // Update compliance status
      this.updateComplianceStatus(filePath, violations);
      
      // Emit monitoring event
      this.emit('file_analyzed', {
        filePath,
        event,
        violations: violations.length,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error(`❌ Error monitoring file ${filePath}:`, error);
    }
  }

  async checkFileCompliance(filePath, event) {
    const violations = [];
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileType = this.determineFileType(filePath);
      
      // Run all governance rules
      for (const [ruleName, rule] of this.governanceRules) {
        if (!rule.enforced) continue;
        
        try {
          const ruleViolations = await rule.validator(filePath, content, fileType, event);
          if (ruleViolations.length > 0) {
            violations.push(...ruleViolations.map(v => ({
              ...v,
              rule: ruleName,
              severity: rule.severity,
              filePath,
              timestamp: new Date()
            })));
          }
        } catch (error) {
          console.warn(`⚠️  Rule ${ruleName} validation failed:`, error.message);
        }
      }
      
    } catch (error) {
      // File might be deleted or binary
      if (event !== 'delete') {
        violations.push({
          rule: 'file_analysis_failed',
          severity: 'warning',
          message: `Could not analyze file: ${error.message}`,
          filePath,
          timestamp: new Date()
        });
      }
    }
    
    return violations;
  }

  // Governance Rule Validators
  async validateNoBreakingChanges(filePath, content, fileType, event) {
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

  async validateNoDuplicates(filePath, content, fileType, event) {
    const violations = [];
    
    if (event === 'add' && (fileType === 'component' || fileType === 'service')) {
      const name = this.extractNameFromPath(filePath);
      
      // Check for existing similar files
      const existingFiles = await this.findSimilarFiles(name, fileType);
      
      if (existingFiles.length > 0) {
        violations.push({
          message: `Potential duplicate ${fileType}: similar files exist: ${existingFiles.join(', ')}`,
          recommendation: `Consider extending existing ${fileType} instead of creating new one`,
          severity: 'error',
          blocking: this.strictMode
        });
      }
    }
    
    return violations;
  }

  async validateNamingConventions(filePath, content, fileType, event) {
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

  async validateFileComplexity(filePath, content, fileType, event) {
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

  async validateBackwardsCompatibility(filePath, content, fileType, event) {
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

  async handleViolations(violations, filePath) {
    console.log(`⚠️  Found ${violations.length} violation(s) in ${filePath}`);
    
    const blockingViolations = violations.filter(v => v.blocking);
    const nonBlockingViolations = violations.filter(v => !v.blocking);
    
    if (blockingViolations.length > 0) {
      console.error('🚫 BLOCKING VIOLATIONS DETECTED:');
      blockingViolations.forEach(violation => {
        console.error(`   ❌ ${violation.message}`);
        console.error(`      Recommendation: ${violation.recommendation}`);
      });
      
      // In strict mode, create detailed report
      if (this.strictMode) {
        this.emit('blocking_violation', {
          filePath,
          violations: blockingViolations,
          timestamp: new Date()
        });
        
        await this.handleBlockingViolation(filePath, blockingViolations);
      }
    }
    
    if (nonBlockingViolations.length > 0) {
      console.warn('⚠️  NON-BLOCKING VIOLATIONS:');
      nonBlockingViolations.forEach(violation => {
        console.warn(`   ⚠️  ${violation.message}`);
      });
    }
    
    // Store violations for reporting
    this.violations.push(...violations);
    
    // Emit violation event
    this.emit('violations_detected', {
      filePath,
      violations,
      blocking: blockingViolations.length > 0,
      timestamp: new Date()
    });
  }

  async handleBlockingViolation(filePath, violations) {
    // Generate compliance report
    const report = {
      filePath,
      violations,
      timestamp: new Date(),
      action: 'blocking_violation_detected',
      recommendations: violations.map(v => v.recommendation)
    };
    
    const reportPath = `compliance-violation-${Date.now()}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Violation report created: ${reportPath}`);
    
    // Notify about the violation
    this.notifyDevelopmentTeam(violations, filePath);
  }

  notifyDevelopmentTeam(violations, filePath) {
    console.log('📢 DEVELOPMENT TEAM NOTIFICATION:');
    console.log(`File: ${filePath}`);
    console.log('Framework compliance violations detected:');
    violations.forEach(v => console.log(`- ${v.message}`));
    console.log('Please review and fix before proceeding.');
  }

  // Helper methods
  determineFileType(filePath) {
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/services/')) return 'service';
    if (filePath.includes('/types/')) return 'type';
    if (filePath.includes('/hooks/')) return 'hook';
    if (filePath.includes('/utils/')) return 'utility';
    return 'unknown';
  }

  extractNameFromPath(filePath) {
    return path.basename(filePath, path.extname(filePath));
  }

  async findSimilarFiles(name, fileType) {
    // Simple similarity check - in production would use more sophisticated matching
    const searchDir = fileType === 'component' ? 'src/components' : 'src/services';
    
    try {
      const files = await fs.readdir(searchDir, { recursive: true });
      return files.filter(file => 
        file.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(file.toLowerCase().split('.')[0])
      );
    } catch {
      return [];
    }
  }

  extractHookExports(content) {
    const hookRegex = /export\s+(?:const|function)\s+(\w+)/g;
    const matches = [];
    let match;
    
    while ((match = hookRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  hasRemovedExports(content, filePath) {
    // Simple heuristic - in production would compare with previous version
    return content.includes('// TODO: Remove') || content.includes('// DEPRECATED');
  }

  hasChangedSignatures(content, filePath) {
    // Simple heuristic - in production would use AST comparison
    return content.includes('// SIGNATURE CHANGE') || content.includes('// BREAKING:');
  }

  hasMultipleResponsibilities(content) {
    // Heuristic: multiple useState hooks or large number of functions
    const useStateCount = (content.match(/useState/g) || []).length;
    const functionCount = (content.match(/const\s+\w+\s*=/g) || []).length;
    
    return useStateCount > 5 || functionCount > 10;
  }

  updateComplianceStatus(filePath, violations) {
    this.complianceStatus.set(filePath, {
      lastChecked: Date.now(),
      violations: violations.length,
      compliant: violations.filter(v => v.blocking).length === 0,
      lastViolations: violations
    });
  }

  async runComplianceAudit() {
    if (!this.isMonitoring) return;
    
    const auditResults = {
      timestamp: new Date(),
      filesScanned: 0,
      violationsFound: 0,
      complianceScore: 0
    };
    
    try {
      // Quick audit of recently changed files
      const recentFiles = this.getRecentlyChangedFiles();
      
      for (const filePath of recentFiles) {
        const violations = await this.checkFileCompliance(filePath, 'audit');
        auditResults.filesScanned++;
        auditResults.violationsFound += violations.length;
      }
      
      // Calculate compliance score
      const totalFiles = auditResults.filesScanned || 1;
      const violationFiles = new Set(this.violations.map(v => v.filePath)).size;
      auditResults.complianceScore = Math.round(((totalFiles - violationFiles) / totalFiles) * 100);
      
      // Emit audit results
      this.emit('compliance_audit', auditResults);
      
      // Log if compliance is below threshold
      if (auditResults.complianceScore < 95) {
        console.warn(`⚠️  Compliance score: ${auditResults.complianceScore}% (below 95% threshold)`);
      }
      
    } catch (error) {
      console.error('❌ Compliance audit failed:', error);
    }
  }

  async runFullAudit() {
    console.log('🔍 Running full compliance audit...');
    
    const startTime = Date.now();
    let filesScanned = 0;
    let totalViolations = 0;
    
    try {
      // Scan all source files
      const srcFiles = await this.getAllSourceFiles();
      
      for (const filePath of srcFiles) {
        const violations = await this.checkFileCompliance(filePath, 'full_audit');
        filesScanned++;
        totalViolations += violations.length;
      }
      
      const duration = Date.now() - startTime;
      const complianceScore = this.calculateOverallComplianceScore();
      
      console.log(`✅ Full audit complete:`);
      console.log(`   Files scanned: ${filesScanned}`);
      console.log(`   Violations found: ${totalViolations}`);
      console.log(`   Compliance score: ${complianceScore}%`);
      console.log(`   Duration: ${duration}ms`);
      
      this.emit('full_audit_complete', {
        filesScanned,
        totalViolations,
        complianceScore,
        duration,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('❌ Full audit failed:', error);
    }
  }

  async getAllSourceFiles() {
    const files = [];
    const srcDir = 'src';
    
    const scan = async (dir) => {
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          
          if (item.isDirectory()) {
            await scan(fullPath);
          } else if (/\.(ts|tsx|js|jsx)$/.test(item.name)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Directory might not exist or be inaccessible
      }
    };
    
    await scan(srcDir);
    return files;
  }

  getRecentlyChangedFiles() {
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    return Array.from(this.complianceStatus.keys()).filter(filePath => {
      const status = this.complianceStatus.get(filePath);
      return status && status.lastChecked > tenMinutesAgo;
    });
  }

  calculateOverallComplianceScore() {
    const totalFiles = this.complianceStatus.size || 1;
    const compliantFiles = Array.from(this.complianceStatus.values())
      .filter(status => status.compliant).length;
    
    return Math.round((compliantFiles / totalFiles) * 100);
  }

  generateComplianceReport() {
    return {
      timestamp: new Date(),
      monitoring: {
        active: this.isMonitoring,
        strictMode: this.strictMode,
        rulesEnforced: Array.from(this.governanceRules.entries())
          .filter(([name, rule]) => rule.enforced)
          .map(([name]) => name)
      },
      compliance: {
        score: this.calculateOverallComplianceScore(),
        filesMonitored: this.complianceStatus.size,
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
    
    const complianceScore = this.calculateOverallComplianceScore();
    if (complianceScore < 90) {
      recommendations.push('Compliance score below 90% - review and fix violations');
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
    
    // Close file watchers
    for (const [path, watcher] of this.watchers) {
      await watcher.close();
    }
    this.watchers.clear();
    
    console.log('✅ Framework monitoring stopped');
    
    this.emit('monitoring_stopped', {
      timestamp: new Date(),
      totalViolations: this.violations.length,
      complianceScore: this.calculateOverallComplianceScore()
    });
  }
}

export default FrameworkComplianceMonitor;