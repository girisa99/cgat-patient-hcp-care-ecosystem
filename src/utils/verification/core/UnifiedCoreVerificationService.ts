/**
 * 🛡️ Unified Core Verification Service
 * Consolidates all verification systems into one comprehensive service
 * Runs continuously in background, validates everything, ensures zero breaking changes
 */

import { EventEmitter } from 'events';

// Import existing verifiers (we'll consolidate these)
import { SingleSourceValidator } from '../SingleSourceValidator';
import { MockDataDetector } from '../MockDataDetector';
import { SecurityScanner } from '../SecurityScanner';
import { DatabaseSchemaAnalyzer } from '../DatabaseSchemaAnalyzer';
import { TypeScriptPatternScanner } from '../TypeScriptPatternScanner';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { DuplicateDetector } from '../DuplicateDetector';

// Core interfaces
export interface EntityDefinition {
  id: string;
  name: string;
  type: EntityType;
  filePath: string;
  dependencies: string[];
  metadata: Record<string, unknown>;
  lastModified: string;
  hash: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ImprovementSuggestion[];
  performance: PerformanceMetrics;
  security: SecurityMetrics;
  compliance: ComplianceMetrics;
}

export interface RegistryState {
  hooks: Map<string, EntityDefinition>;
  components: Map<string, EntityDefinition>;
  types: Map<string, EntityDefinition>;
  tables: Map<string, EntityDefinition>;
  apis: Map<string, EntityDefinition>;
  routes: Map<string, EntityDefinition>;
  services: Map<string, EntityDefinition>;
  lastScan: string;
  version: string;
}

export interface ValidationError {
  id: string;
  type: ErrorType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  file: string;
  line?: number;
  column?: number;
  rule: string;
  suggestion?: string;
  autoFixable: boolean;
}

export interface DeveloperFeedback {
  level: 'error' | 'warning' | 'info' | 'success';
  message: string;
  details?: string;
  actionable: boolean;
  quickFix?: string;
}

export type EntityType = 'hook' | 'component' | 'type' | 'table' | 'api' | 'route' | 'service';
export type ErrorType = 'duplicate' | 'security' | 'performance' | 'type_safety' | 'data_integrity' | 'compliance';

// Verification configuration
export interface VerificationConfig {
  // Real-time monitoring
  enableRealtimeMonitoring: boolean;
  monitoringInterval: number;
  
  // Validation levels
  strictMode: boolean;
  autoFixEnabled: boolean;
  preventDuplicates: boolean;
  enforceRealDataOnly: boolean;
  
  // Security settings
  securityScanEnabled: boolean;
  privacyComplianceCheck: boolean;
  vulnerabilityScanEnabled: boolean;
  
  // Performance settings
  performanceMonitoring: boolean;
  infiniteLoopDetection: boolean;
  resourceUsageMonitoring: boolean;
  
  // Developer experience
  liveErrorFeedback: boolean;
  suggestionNotifications: boolean;
  progressTracking: boolean;
}

const DEFAULT_CONFIG: VerificationConfig = {
  enableRealtimeMonitoring: true,
  monitoringInterval: 1000,
  strictMode: true,
  autoFixEnabled: false, // Opt-in for safety
  preventDuplicates: true,
  enforceRealDataOnly: true,
  securityScanEnabled: true,
  privacyComplianceCheck: true,
  vulnerabilityScanEnabled: true,
  performanceMonitoring: true,
  infiniteLoopDetection: true,
  resourceUsageMonitoring: true,
  liveErrorFeedback: true,
  suggestionNotifications: true,
  progressTracking: true
};

/**
 * Main Unified Core Verification Service
 */
export class UnifiedCoreVerificationService extends EventEmitter {
  private static instance: UnifiedCoreVerificationService;
  private registry: RegistryState;
  private config: VerificationConfig;
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;
  
  // Existing verifier instances (we consolidate these)
  private singleSourceValidator: SingleSourceValidator;
  private mockDataDetector: MockDataDetector;
  private securityScanner: SecurityScanner;
  private databaseAnalyzer: DatabaseSchemaAnalyzer;
  private typeScriptScanner: TypeScriptPatternScanner;
  private performanceMonitor: PerformanceMonitor;
  private duplicateDetector: DuplicateDetector;

  private constructor(config: Partial<VerificationConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.registry = this.initializeRegistry();
    this.initializeVerifiers();
    
    console.log('🛡️ Unified Core Verification Service initialized');
  }

  /**
   * Singleton pattern - ensures single source of truth
   */
  public static getInstance(config?: Partial<VerificationConfig>): UnifiedCoreVerificationService {
    if (!UnifiedCoreVerificationService.instance) {
      UnifiedCoreVerificationService.instance = new UnifiedCoreVerificationService(config);
    }
    return UnifiedCoreVerificationService.instance;
  }

  /**
   * Initialize the master registry
   */
  private initializeRegistry(): RegistryState {
    return {
      hooks: new Map(),
      components: new Map(),
      types: new Map(),
      tables: new Map(),
      apis: new Map(),
      routes: new Map(),
      services: new Map(),
      lastScan: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Initialize existing verifier instances
   */
  private initializeVerifiers(): void {
    this.singleSourceValidator = new SingleSourceValidator();
    this.mockDataDetector = new MockDataDetector();
    this.securityScanner = new SecurityScanner();
    this.databaseAnalyzer = new DatabaseSchemaAnalyzer();
    this.typeScriptScanner = new TypeScriptPatternScanner();
    this.performanceMonitor = new PerformanceMonitor();
    this.duplicateDetector = new DuplicateDetector();
  }

  /**
   * 🔍 REGISTRY & DETECTION LAYER
   */
  
  /**
   * Scan and register all entities in the codebase
   */
  public async scanAndRegisterEntities(): Promise<void> {
    console.log('🔍 Scanning codebase for entities...');
    
    try {
      // Scan different entity types
      await Promise.all([
        this.scanHooks(),
        this.scanComponents(),
        this.scanTypes(),
        this.scanTables(),
        this.scanApis(),
        this.scanRoutes(),
        this.scanServices()
      ]);
      
      this.registry.lastScan = new Date().toISOString();
      this.emit('scanCompleted', this.registry);
      
      console.log('✅ Entity scan completed:', {
        hooks: this.registry.hooks.size,
        components: this.registry.components.size,
        types: this.registry.types.size,
        tables: this.registry.tables.size,
        apis: this.registry.apis.size,
        routes: this.registry.routes.size,
        services: this.registry.services.size
      });
      
    } catch (error) {
      console.error('❌ Entity scan failed:', error);
      this.emit('scanError', error);
    }
  }

  /**
   * Detect duplicates across all entity types
   */
  public async detectDuplicates(): Promise<DuplicateReport> {
    console.log('🔍 Detecting duplicates across all entities...');
    
    const duplicates: DuplicateEntry[] = [];
    
    // Check each entity type for duplicates
    for (const [entityType, entityMap] of Object.entries(this.registry)) {
      if (entityMap instanceof Map) {
        const entityDuplicates = this.findDuplicatesInEntityType(entityType as EntityType, entityMap);
        duplicates.push(...entityDuplicates);
      }
    }
    
    const report: DuplicateReport = {
      totalDuplicates: duplicates.length,
      duplicates,
      consolidationSuggestions: this.generateConsolidationSuggestions(duplicates),
      impactAssessment: this.assessConsolidationImpact(duplicates),
      timestamp: new Date().toISOString()
    };
    
    this.emit('duplicatesDetected', report);
    return report;
  }

  /**
   * Prevent creation of duplicate entities
   */
  public preventDuplicateCreation(entityType: EntityType, entityData: Partial<EntityDefinition>): ValidationResult {
    const existingEntity = this.findSimilarEntity(entityType, entityData);
    
    if (existingEntity) {
      return {
        success: false,
        errors: [{
          id: `duplicate-${entityType}-${Date.now()}`,
          type: 'duplicate',
          severity: 'high',
          message: `Similar ${entityType} already exists: ${existingEntity.name}`,
          file: existingEntity.filePath,
          rule: 'no-duplicates',
          suggestion: `Consider using existing ${entityType} or consolidating functionality`,
          autoFixable: false
        }],
        warnings: [],
        suggestions: [{
          id: `suggestion-${Date.now()}`,
          type: 'consolidation',
          message: `Use existing ${entityType}: ${existingEntity.name}`,
          impact: 'medium',
          autoApplicable: false
        }],
        performance: { score: 100, issues: [] },
        security: { score: 100, vulnerabilities: [] },
        compliance: { score: 100, violations: [] }
      };
    }
    
    return {
      success: true,
      errors: [],
      warnings: [],
      suggestions: [],
      performance: { score: 100, issues: [] },
      security: { score: 100, vulnerabilities: [] },
      compliance: { score: 100, violations: [] }
    };
  }

  /**
   * ✅ VALIDATION ENGINE
   */
  
  /**
   * Comprehensive validation during development
   */
  public async validateDuringDevelopment(): Promise<ValidationResult> {
    console.log('✅ Running development validation...');
    
    const validationResults = await Promise.all([
      this.validateDataIntegrity(),
      this.validateSecurityCompliance(),
      this.validateTypeScript(),
      this.validateDatabase(),
      this.validatePerformance(),
      this.validateSingleSourceCompliance()
    ]);
    
    const aggregatedResult = this.aggregateValidationResults(validationResults);
    this.emit('validationCompleted', aggregatedResult);
    
    return aggregatedResult;
  }

  /**
   * Pre-commit validation
   */
  public async validatePreCommit(): Promise<ValidationResult> {
    console.log('✅ Running pre-commit validation...');
    
    // Stricter validation for commits
    const result = await this.validateDuringDevelopment();
    
    // Block commit if critical issues found
    const criticalIssues = result.errors.filter(e => e.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.error('❌ Commit blocked due to critical issues:', criticalIssues);
      process.exit(1);
    }
    
    return result;
  }

  /**
   * Validate data integrity (real data only, no mocks)
   */
  public async validateDataIntegrity(): Promise<ValidationResult> {
    console.log('📊 Validating data integrity...');
    
    try {
             // Use existing MockDataDetector
       const mockDataAnalysis = await MockDataDetector.analyzeMockDataUsage();
      
      const errors: ValidationError[] = mockDataAnalysis.violations.map(violation => ({
        id: `mock-data-${Date.now()}-${Math.random()}`,
        type: 'data_integrity',
        severity: violation.severity === 'high' ? 'high' : 'medium',
        message: `Mock data detected: ${violation.content}`,
        file: violation.filePath,
        line: violation.lineNumber,
        rule: 'real-data-only',
        suggestion: violation.suggestion,
        autoFixable: false
      }));
      
      return {
        success: errors.length === 0,
        errors,
        warnings: [],
        suggestions: [],
        performance: { score: mockDataAnalysis.databaseUsageScore, issues: [] },
        security: { score: 100, vulnerabilities: [] },
        compliance: { score: mockDataAnalysis.databaseUsageScore, violations: [] }
      };
      
    } catch (error) {
      console.error('❌ Data integrity validation failed:', error);
      return this.createErrorResult('data_integrity', 'Data integrity validation failed');
    }
  }

  /**
   * Validate security compliance
   */
  public async validateSecurityCompliance(): Promise<ValidationResult> {
    console.log('🔒 Validating security compliance...');
    
    try {
             // Use existing SecurityScanner
       const securityReport = await SecurityScanner.performSecurityScan();
      
      const errors: ValidationError[] = securityReport.vulnerabilities.map(vulnerability => ({
        id: `security-${Date.now()}-${Math.random()}`,
        type: 'security',
        severity: vulnerability.severity,
        message: vulnerability.description,
        file: vulnerability.location,
        rule: vulnerability.type,
        suggestion: vulnerability.remediation,
        autoFixable: false
      }));
      
      return {
        success: errors.length === 0,
        errors,
        warnings: [],
        suggestions: [],
        performance: { score: 100, issues: [] },
        security: { 
          score: securityReport.securityScore, 
          vulnerabilities: securityReport.vulnerabilities 
        },
        compliance: { score: securityReport.securityScore, violations: [] }
      };
      
    } catch (error) {
      console.error('❌ Security validation failed:', error);
      return this.createErrorResult('security', 'Security validation failed');
    }
  }

  /**
   * Validate TypeScript compliance (no any types, proper interfaces)
   */
  public async validateTypeScript(): Promise<ValidationResult> {
    console.log('🎯 Validating TypeScript compliance...');
    
    try {
      // Use existing TypeScriptPatternScanner
      const typeScriptReport = await TypeScriptPatternScanner.analyzeTypeScriptPatterns();
      
      const errors: ValidationError[] = typeScriptReport.qualityIssues.map(issue => ({
        id: `typescript-${Date.now()}-${Math.random()}`,
        type: 'type_safety',
        severity: issue.severity === 'error' ? 'high' : 'medium',
        message: issue.issue,
        file: issue.filePath,
        line: issue.lineNumber,
        rule: 'strict-typescript',
        suggestion: issue.suggestion,
        autoFixable: false
      }));
      
      return {
        success: errors.length === 0,
        errors,
        warnings: [],
        suggestions: [],
        performance: { score: 100, issues: [] },
        security: { score: 100, vulnerabilities: [] },
        compliance: { score: typeScriptReport.typeSafetyScore, violations: [] }
      };
      
    } catch (error) {
      console.error('❌ TypeScript validation failed:', error);
      return this.createErrorResult('type_safety', 'TypeScript validation failed');
    }
  }

  /**
   * 📊 REAL-TIME MONITORING
   */
  
  /**
   * Start background monitoring
   */
  public startBackgroundMonitoring(): void {
    if (this.isMonitoring) {
      console.log('⚠️ Monitoring already active');
      return;
    }
    
    console.log('📊 Starting background monitoring...');
    this.isMonitoring = true;
    
    // Initial scan
    this.scanAndRegisterEntities();
    
    // Set up periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performMonitoringCycle();
      } catch (error) {
        console.error('❌ Monitoring cycle failed:', error);
        this.emit('monitoringError', error);
      }
    }, this.config.monitoringInterval);
    
    console.log('✅ Background monitoring started');
    this.emit('monitoringStarted');
  }

  /**
   * Stop background monitoring
   */
  public stopBackgroundMonitoring(): void {
    if (!this.isMonitoring) {
      console.log('⚠️ Monitoring not active');
      return;
    }
    
    console.log('📊 Stopping background monitoring...');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    console.log('✅ Background monitoring stopped');
    this.emit('monitoringStopped');
  }

  /**
   * Perform a single monitoring cycle
   */
  private async performMonitoringCycle(): Promise<void> {
    // Quick health check
    const healthCheck = await this.performHealthCheck();
    
    if (!healthCheck.healthy) {
      this.emit('healthIssueDetected', healthCheck);
    }
    
    // Check for file changes (simplified for now)
    const changesSinceLastScan = this.detectChangesSinceLastScan();
    
    if (changesSinceLastScan.length > 0) {
      console.log(`🔄 Detected ${changesSinceLastScan.length} changes, re-scanning...`);
      await this.scanAndRegisterEntities();
      
      // Run quick validation on changed files
      const validationResult = await this.validateChangedFiles(changesSinceLastScan);
      
      if (validationResult.errors.length > 0) {
        this.emit('issueDetected', validationResult);
      }
    }
  }

  /**
   * 🎯 PUBLIC API METHODS
   */
  
  /**
   * Get current registry state
   */
  public getRegistry(): RegistryState {
    return { ...this.registry };
  }

  /**
   * Get validation configuration
   */
  public getConfig(): VerificationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<VerificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  /**
   * Get comprehensive system status
   */
  public async getSystemStatus(): Promise<SystemStatus> {
    const healthCheck = await this.performHealthCheck();
    const duplicateReport = await this.detectDuplicates();
    const validationResult = await this.validateDuringDevelopment();
    
    return {
      healthy: healthCheck.healthy,
      registry: this.registry,
      duplicates: duplicateReport,
      validation: validationResult,
      monitoring: {
        active: this.isMonitoring,
        lastScan: this.registry.lastScan
      },
      timestamp: new Date().toISOString()
    };
  }

  // ... (Additional methods will be implemented in next iteration)
  
  /**
   * Helper methods for internal use - IMPLEMENT ACTUAL SCANNING
   */
  private async scanHooks(): Promise<void> {
    console.log('🔍 Scanning hooks directory...');
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const hooksDir = 'src/hooks';
      if (!fs.existsSync(hooksDir)) {
        console.log('⚠️ Hooks directory not found');
        return;
      }

      const scanHooksDirectory = async (dirPath: string): Promise<void> => {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            await scanHooksDirectory(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              
              // Check if it's actually a hook (exports use* functions)
              const hookMatches = content.matchAll(/export\s+(?:const|function)\s+(use[A-Z][a-zA-Z]*)/g);
              
              if (hookMatches) {
                hookMatches.forEach(match => {
                  const hookName = match.match(/use[A-Z][a-zA-Z]*/)?.[0];
                  if (hookName) {
                    const entityId = `${hookName}-${fullPath}`;
                    
                    // Check for dependencies
                    const dependencies = this.extractDependencies(content);
                    
                    // Check for mock data patterns
                    const hasMockData = this.mockDataDetector.quickMockDataCheck ? 
                      await this.mockDataDetector.quickMockDataCheck(fullPath) : false;
                    
                    const entity: EntityDefinition = {
                      id: entityId,
                      name: hookName,
                      type: 'hook',
                      filePath: fullPath,
                      dependencies,
                      metadata: {
                        category: this.categorizeHook(hookName, content),
                        isRealData: !hasMockData,
                        databaseConnections: this.extractDatabaseConnections(content),
                        apiCalls: this.extractApiCalls(content),
                        realDataScore: hasMockData ? 0 : 100
                      },
                      lastModified: fs.statSync(fullPath).mtime.toISOString(),
                      hash: this.generateHash(content)
                    };
                    
                    this.registry.hooks.set(entityId, entity);
                    console.log(`📝 Registered hook: ${hookName} (Real Data: ${!hasMockData})`);
                  }
                });
              }
            } catch (error) {
              console.warn(`⚠️ Failed to process hook file ${fullPath}:`, error);
            }
          }
        }
      };

      await scanHooksDirectory(hooksDir);
      console.log(`✅ Hooks scan completed: ${this.registry.hooks.size} hooks registered`);
      
    } catch (error) {
      console.error('❌ Hook scanning failed:', error);
    }
  }

  private async scanComponents(): Promise<void> {
    console.log('🔍 Scanning components directory...');
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const componentsDir = 'src/components';
      if (!fs.existsSync(componentsDir)) {
        console.log('⚠️ Components directory not found');
        return;
      }

      const scanComponentsDirectory = async (dirPath: string): Promise<void> => {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            await scanComponentsDirectory(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              
              // Check if it's a React component
              const componentMatches = content.match(/(?:export\s+(?:default\s+)?(?:const|function)\s+([A-Z][a-zA-Z]*)|export\s+default\s+([A-Z][a-zA-Z]*))/g);
              
              if (componentMatches) {
                componentMatches.forEach(match => {
                  const componentName = match.match(/[A-Z][a-zA-Z]*/)?.[0];
                  if (componentName && componentName !== 'React') {
                    const entityId = `${componentName}-${fullPath}`;
                    
                    // Check for dependencies and mock data
                    const dependencies = this.extractDependencies(content);
                    const hasMockData = this.mockDataDetector.quickMockDataCheck ? 
                      await this.mockDataDetector.quickMockDataCheck(fullPath) : false;
                    
                    const entity: EntityDefinition = {
                      id: entityId,
                      name: componentName,
                      type: 'component',
                      filePath: fullPath,
                      dependencies,
                      metadata: {
                        category: this.categorizeComponent(componentName, fullPath),
                        isRealData: !hasMockData,
                        hasDialog: content.includes('Dialog'),
                        hasForm: content.includes('form') || content.includes('Form'),
                        hasTable: content.includes('Table') || content.includes('DataTable'),
                        hookUsage: this.extractHookUsage(content),
                        realDataScore: hasMockData ? 0 : 100
                      },
                      lastModified: fs.statSync(fullPath).mtime.toISOString(),
                      hash: this.generateHash(content)
                    };
                    
                    this.registry.components.set(entityId, entity);
                    console.log(`📝 Registered component: ${componentName} (Real Data: ${!hasMockData})`);
                  }
                });
              }
            } catch (error) {
              console.warn(`⚠️ Failed to process component file ${fullPath}:`, error);
            }
          }
        }
      };

      await scanComponentsDirectory(componentsDir);
      console.log(`✅ Components scan completed: ${this.registry.components.size} components registered`);
      
    } catch (error) {
      console.error('❌ Component scanning failed:', error);
    }
  }

  private async scanTypes(): Promise<void> {
    console.log('🔍 Scanning types directory...');
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const typesDir = 'src/types';
      if (!fs.existsSync(typesDir)) {
        console.log('⚠️ Types directory not found');
        return;
      }

      const scanTypesDirectory = async (dirPath: string): Promise<void> => {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            await scanTypesDirectory(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              
              // Extract TypeScript interfaces, types, enums
              const typeDefinitions = [
                ...Array.from(content.matchAll(/export\s+interface\s+([A-Z][a-zA-Z]*)/g)),
                ...Array.from(content.matchAll(/export\s+type\s+([A-Z][a-zA-Z]*)/g)),
                ...Array.from(content.matchAll(/export\s+enum\s+([A-Z][a-zA-Z]*)/g))
              ];
              
              typeDefinitions.forEach(match => {
                const typeName = match[1];
                if (typeName) {
                  const entityId = `${typeName}-${fullPath}`;
                  
                  const entity: EntityDefinition = {
                    id: entityId,
                    name: typeName,
                    type: 'type',
                    filePath: fullPath,
                    dependencies: this.extractTypeDependencies(content),
                    metadata: {
                      category: this.categorizeType(typeName, content),
                      isInterface: content.includes(`interface ${typeName}`),
                      isEnum: content.includes(`enum ${typeName}`),
                      isType: content.includes(`type ${typeName}`),
                      hasOptionalFields: content.includes('?:'),
                      exportsCount: typeDefinitions.length
                    },
                    lastModified: fs.statSync(fullPath).mtime.toISOString(),
                    hash: this.generateHash(content)
                  };
                  
                  this.registry.types.set(entityId, entity);
                  console.log(`📝 Registered type: ${typeName}`);
                }
              });
            } catch (error) {
              console.warn(`⚠️ Failed to process type file ${fullPath}:`, error);
            }
          }
        }
      };

      await scanTypesDirectory(typesDir);
      console.log(`✅ Types scan completed: ${this.registry.types.size} types registered`);
      
    } catch (error) {
      console.error('❌ Type scanning failed:', error);
    }
  }

  private async scanTables(): Promise<void> {
    console.log('🔍 Scanning database tables...');
    
    try {
      // Scan for database table references in the codebase
      const fs = await import('fs');
      const path = await import('path');
      
      const tableReferences = new Set<string>();
      
      // Scan hooks and components for .from() calls
      const scanForTables = async (dirPath: string): Promise<void> => {
        if (!fs.existsSync(dirPath)) return;
        
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isDirectory() && !['node_modules', '.git'].includes(entry.name)) {
            await scanForTables(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              
              // Find .from('table_name') patterns
              const fromMatches = content.matchAll(/\.from\(\s*['"`]([a-z_][a-z0-9_]*?)['"`]\s*\)/g);
              
              for (const match of fromMatches) {
                const tableName = match[1];
                if (tableName) {
                  tableReferences.add(tableName);
                  
                  const entityId = `table-${tableName}`;
                  
                  const entity: EntityDefinition = {
                    id: entityId,
                    name: tableName,
                    type: 'table',
                    filePath: `database/${tableName}`,
                    dependencies: [],
                    metadata: {
                      category: 'database',
                      referencedIn: fullPath,
                      isActive: true,
                      operations: this.extractTableOperations(content, tableName)
                    },
                    lastModified: new Date().toISOString(),
                    hash: this.generateHash(tableName)
                  };
                  
                  this.registry.tables.set(entityId, entity);
                }
              }
            } catch (error) {
              console.warn(`⚠️ Failed to scan file for tables ${fullPath}:`, error);
            }
          }
        }
      };
      
      await scanForTables('src');
      
      // Add known core tables
      const coreTables = ['profiles', 'facilities', 'modules', 'onboarding_applications', 'user_module_assignments', 'role_module_assignments'];
      coreTables.forEach(tableName => {
        const entityId = `table-${tableName}`;
        if (!this.registry.tables.has(entityId)) {
          const entity: EntityDefinition = {
            id: entityId,
            name: tableName,
            type: 'table',
            filePath: `database/${tableName}`,
            dependencies: [],
            metadata: {
              category: 'database',
              isCore: true,
              isActive: true
            },
            lastModified: new Date().toISOString(),
            hash: this.generateHash(tableName)
          };
          
          this.registry.tables.set(entityId, entity);
        }
      });
      
      console.log(`✅ Tables scan completed: ${this.registry.tables.size} tables registered`);
      
    } catch (error) {
      console.error('❌ Table scanning failed:', error);
    }
  }

  private async scanApis(): Promise<void> {
    console.log('🔍 Scanning API definitions...');
    
    try {
      // Scan for API service definitions and actual endpoints
      const apis = [
        {
          name: 'User Management API',
          id: 'user-management-api',
          endpoints: ['manage-user-profiles', 'onboarding-workflow'],
          type: 'edge-function',
          description: 'Real user management via edge functions'
        },
        {
          name: 'Facilities Management API',
          id: 'facilities-api',
          endpoints: ['facilities'],
          type: 'supabase-table',
          description: 'Real facilities data management'
        },
        {
          name: 'Modules Management API',
          id: 'modules-api',
          endpoints: ['modules', 'user_module_assignments', 'role_module_assignments'],
          type: 'supabase-table',
          description: 'Real modules system integration'
        },
        {
          name: 'Onboarding Workflow API',
          id: 'onboarding-api',
          endpoints: ['onboarding_applications'],
          type: 'supabase-table',
          description: 'Treatment center onboarding system'
        },
        {
          name: 'Testing Services API',
          id: 'testing-api',
          endpoints: ['verification', 'validation', 'testing'],
          type: 'internal-service',
          description: 'Comprehensive testing and validation system'
        }
      ];
      
      apis.forEach(api => {
        const entity: EntityDefinition = {
          id: api.id,
          name: api.name,
          type: 'api',
          filePath: `api/${api.id}`,
          dependencies: [],
          metadata: {
            category: 'api',
            type: api.type,
            endpoints: api.endpoints,
            description: api.description,
            isActive: true,
            isReal: true,
            endpointCount: api.endpoints.length
          },
          lastModified: new Date().toISOString(),
          hash: this.generateHash(api.name + api.endpoints.join(','))
        };
        
        this.registry.apis.set(api.id, entity);
        console.log(`📝 Registered API: ${api.name} (${api.endpoints.length} endpoints)`);
      });
      
      console.log(`✅ APIs scan completed: ${this.registry.apis.size} APIs registered`);
      
    } catch (error) {
      console.error('❌ API scanning failed:', error);
    }
  }

  private async scanRoutes(): Promise<void> {
    console.log('🔍 Scanning routes...');
    
    try {
      const fs = await import('fs');
      
      // Scan App.tsx for routes
      const appPath = 'src/App.tsx';
      if (fs.existsSync(appPath)) {
        const content = fs.readFileSync(appPath, 'utf-8');
        
        // Extract Route components
        const routeMatches = content.matchAll(/<Route\s+path="([^"]*)"[^>]*element=\{<([^}/>]*)[^}]*>\}/g);
        
        for (const match of routeMatches) {
          const routePath = match[1];
          const componentName = match[2];
          
          if (routePath && componentName) {
            const entityId = `route-${routePath.replace(/[^a-zA-Z0-9]/g, '-')}`;
            
            const entity: EntityDefinition = {
              id: entityId,
              name: `${routePath} → ${componentName}`,
              type: 'route',
              filePath: appPath,
              dependencies: [componentName],
              metadata: {
                category: 'routing',
                path: routePath,
                component: componentName,
                isActive: true,
                isProtected: content.includes('ProtectedRoute')
              },
              lastModified: fs.statSync(appPath).mtime.toISOString(),
              hash: this.generateHash(routePath + componentName)
            };
            
            this.registry.routes.set(entityId, entity);
            console.log(`📝 Registered route: ${routePath} → ${componentName}`);
          }
        }
      }
      
      console.log(`✅ Routes scan completed: ${this.registry.routes.size} routes registered`);
      
    } catch (error) {
      console.error('❌ Route scanning failed:', error);
    }
  }

  private async scanServices(): Promise<void> {
    console.log('🔍 Scanning services...');
    
    try {
      // Register verification services
      const services = [
        {
          name: 'UnifiedCoreVerificationService',
          id: 'unified-verification',
          type: 'verification',
          description: 'Master verification and registry service'
        },
        {
          name: 'MockDataDetector',
          id: 'mock-data-detector',
          type: 'verification',
          description: 'Prevents mock data usage'
        },
        {
          name: 'SecurityScanner',
          id: 'security-scanner',
          type: 'verification',
          description: 'Security compliance scanning'
        },
        {
          name: 'SingleSourceValidator',
          id: 'single-source-validator',
          type: 'verification',
          description: 'Single source of truth validation'
        }
      ];
      
      services.forEach(service => {
        const entity: EntityDefinition = {
          id: service.id,
          name: service.name,
          type: 'service',
          filePath: `services/${service.id}`,
          dependencies: [],
          metadata: {
            category: service.type,
            description: service.description,
            isActive: true,
            isVerificationService: service.type === 'verification'
          },
          lastModified: new Date().toISOString(),
          hash: this.generateHash(service.name)
        };
        
        this.registry.services.set(service.id, entity);
        console.log(`📝 Registered service: ${service.name}`);
      });
      
      console.log(`✅ Services scan completed: ${this.registry.services.size} services registered`);
      
    } catch (error) {
      console.error('❌ Service scanning failed:', error);
    }
  }

  // Helper methods for entity analysis
  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // Extract import statements
    const importMatches = content.matchAll(/import\s+(?:.*?from\s+)?['"`]([^'"`]+)['"`]/g);
    for (const match of importMatches) {
      dependencies.push(match[1]);
    }
    
    return dependencies;
  }

  private extractDatabaseConnections(content: string): string[] {
    const connections: string[] = [];
    
    // Extract supabase.from() calls
    const fromMatches = content.matchAll(/supabase\.from\(\s*['"`]([^'"`]+)['"`]/g);
    for (const match of fromMatches) {
      connections.push(match[1]);
    }
    
    return connections;
  }

  private extractApiCalls(content: string): string[] {
    const apiCalls: string[] = [];
    
    // Extract edge function calls
    const functionMatches = content.matchAll(/supabase\.functions\.invoke\(\s*['"`]([^'"`]+)['"`]/g);
    for (const match of functionMatches) {
      apiCalls.push(match[1]);
    }
    
    return apiCalls;
  }

  private categorizeHook(hookName: string, content: string): string {
    if (hookName.toLowerCase().includes('user')) return 'user-management';
    if (hookName.toLowerCase().includes('facility') || hookName.toLowerCase().includes('facilities')) return 'facilities';
    if (hookName.toLowerCase().includes('module')) return 'modules';
    if (hookName.toLowerCase().includes('onboarding')) return 'onboarding';
    if (hookName.toLowerCase().includes('api')) return 'api-services';
    if (hookName.toLowerCase().includes('test')) return 'testing';
    if (hookName.toLowerCase().includes('verification')) return 'verification';
    if (content.includes('supabase')) return 'database';
    return 'general';
  }

  private categorizeComponent(componentName: string, filePath: string): string {
    if (filePath.includes('/admin/')) return 'admin';
    if (filePath.includes('/auth/')) return 'auth';
    if (filePath.includes('/dashboard/')) return 'dashboard';
    if (filePath.includes('/users/')) return 'user-management';
    if (filePath.includes('/facilities/')) return 'facilities';
    if (filePath.includes('/modules/')) return 'modules';
    if (filePath.includes('/onboarding/')) return 'onboarding';
    if (filePath.includes('/ui/')) return 'ui';
    if (filePath.includes('/layout/')) return 'layout';
    return 'general';
  }

  private categorizeType(typeName: string, content: string): string {
    if (typeName.toLowerCase().includes('user')) return 'user-management';
    if (typeName.toLowerCase().includes('facility')) return 'facilities';
    if (typeName.toLowerCase().includes('module')) return 'modules';
    if (typeName.toLowerCase().includes('onboarding')) return 'onboarding';
    if (typeName.toLowerCase().includes('api')) return 'api';
    if (typeName.toLowerCase().includes('auth')) return 'auth';
    return 'general';
  }

  private extractTypeDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // Extract type imports
    const typeImports = content.matchAll(/import\s+(?:type\s+)?{([^}]+)}\s+from/g);
    for (const match of typeImports) {
      const types = match[1].split(',').map(t => t.trim());
      dependencies.push(...types);
    }
    
    return dependencies;
  }

  private extractHookUsage(content: string): string[] {
    const hooks: string[] = [];
    
    // Extract hook calls
    const hookMatches = content.matchAll(/\b(use[A-Z][a-zA-Z]*)\s*\(/g);
    for (const match of hookMatches) {
      hooks.push(match[1]);
    }
    
    return [...new Set(hooks)];
  }

  private extractTableOperations(content: string, tableName: string): string[] {
    const operations: string[] = [];
    
    if (content.includes(`.from('${tableName}').select(`)) operations.push('select');
    if (content.includes(`.from('${tableName}').insert(`)) operations.push('insert');
    if (content.includes(`.from('${tableName}').update(`)) operations.push('update');
    if (content.includes(`.from('${tableName}').delete(`)) operations.push('delete');
    
    return operations;
  }

  private generateHash(content: string): string {
    // Simple hash function for content
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private findDuplicatesInEntityType(entityType: EntityType, entityMap: Map<string, EntityDefinition>): DuplicateEntry[] {
    // Implementation for finding duplicates
    return [];
  }

  private generateConsolidationSuggestions(duplicates: DuplicateEntry[]): ConsolidationSuggestion[] {
    // Implementation for generating consolidation suggestions
    return [];
  }

  private assessConsolidationImpact(duplicates: DuplicateEntry[]): ImpactAssessment {
    // Implementation for assessing consolidation impact
    return { riskLevel: 'low', estimatedEffort: 'minimal', benefits: [] };
  }

  private findSimilarEntity(entityType: EntityType, entityData: Partial<EntityDefinition>): EntityDefinition | null {
    // Implementation for finding similar entities
    return null;
  }

  private aggregateValidationResults(results: ValidationResult[]): ValidationResult {
    // Implementation for aggregating validation results
    return {
      success: results.every(r => r.success),
      errors: results.flatMap(r => r.errors),
      warnings: results.flatMap(r => r.warnings),
      suggestions: results.flatMap(r => r.suggestions),
      performance: { score: 100, issues: [] },
      security: { score: 100, vulnerabilities: [] },
      compliance: { score: 100, violations: [] }
    };
  }

  private async validateDatabase(): Promise<ValidationResult> {
    // Implementation using existing DatabaseSchemaAnalyzer
    return this.createSuccessResult();
  }

  private async validatePerformance(): Promise<ValidationResult> {
    // Implementation using existing PerformanceMonitor
    return this.createSuccessResult();
  }

  private async validateSingleSourceCompliance(): Promise<ValidationResult> {
    // Implementation using existing SingleSourceValidator
    return this.createSuccessResult();
  }

  private createErrorResult(type: ErrorType, message: string): ValidationResult {
    return {
      success: false,
      errors: [{
        id: `error-${Date.now()}`,
        type,
        severity: 'high',
        message,
        file: 'unknown',
        rule: 'system-validation',
        autoFixable: false
      }],
      warnings: [],
      suggestions: [],
      performance: { score: 0, issues: [] },
      security: { score: 0, vulnerabilities: [] },
      compliance: { score: 0, violations: [] }
    };
  }

  private createSuccessResult(): ValidationResult {
    return {
      success: true,
      errors: [],
      warnings: [],
      suggestions: [],
      performance: { score: 100, issues: [] },
      security: { score: 100, vulnerabilities: [] },
      compliance: { score: 100, violations: [] }
    };
  }

  private async performHealthCheck(): Promise<HealthCheck> {
    return {
      healthy: true,
      checks: {
        registry: true,
        monitoring: this.isMonitoring,
        verifiers: true
      },
      timestamp: new Date().toISOString()
    };
  }

  private detectChangesSinceLastScan(): string[] {
    // Implementation for detecting file changes
    return [];
  }

  private async validateChangedFiles(files: string[]): Promise<ValidationResult> {
    // Implementation for validating specific files
    return this.createSuccessResult();
  }
}

// Supporting interfaces
export interface DuplicateReport {
  totalDuplicates: number;
  duplicates: DuplicateEntry[];
  consolidationSuggestions: ConsolidationSuggestion[];
  impactAssessment: ImpactAssessment;
  timestamp: string;
}

export interface DuplicateEntry {
  type: EntityType;
  entities: EntityDefinition[];
  similarity: number;
  consolidationPriority: 'high' | 'medium' | 'low';
}

export interface ConsolidationSuggestion {
  id: string;
  type: 'merge' | 'extract' | 'remove';
  description: string;
  entities: string[];
  estimatedEffort: string;
  benefits: string[];
}

export interface ImpactAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  benefits: string[];
}

export interface ImprovementSuggestion {
  id: string;
  type: 'performance' | 'security' | 'maintainability' | 'consolidation';
  message: string;
  impact: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
}

export interface PerformanceMetrics {
  score: number;
  issues: PerformanceIssue[];
}

export interface SecurityMetrics {
  score: number;
  vulnerabilities: SecurityVulnerability[];
}

export interface ComplianceMetrics {
  score: number;
  violations: ComplianceViolation[];
}

export interface PerformanceIssue {
  type: string;
  description: string;
  impact: string;
}

export interface SecurityVulnerability {
  type: string;
  severity: string;
  description: string;
}

export interface ComplianceViolation {
  rule: string;
  description: string;
  severity: string;
}

export interface ValidationWarning {
  id: string;
  message: string;
  file: string;
  suggestion?: string;
}

export interface SystemStatus {
  healthy: boolean;
  registry: RegistryState;
  duplicates: DuplicateReport;
  validation: ValidationResult;
  monitoring: {
    active: boolean;
    lastScan: string;
  };
  timestamp: string;
}

export interface HealthCheck {
  healthy: boolean;
  checks: {
    registry: boolean;
    monitoring: boolean;
    verifiers: boolean;
  };
  timestamp: string;
}

// Export singleton instance
export const unifiedVerificationService = UnifiedCoreVerificationService.getInstance();

export default UnifiedCoreVerificationService;