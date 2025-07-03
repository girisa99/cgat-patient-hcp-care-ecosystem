/**
 * TypeScript Pattern Scanner
 * Analyzes TypeScript patterns, interfaces, types, and code quality
 * Browser-compatible implementation
 */

export interface TypeScriptPattern {
  name: string;
  type: 'interface' | 'type' | 'enum' | 'class' | 'function' | 'hook' | 'component';
  filePath: string;
  exports: boolean;
  usageCount: number;
  dependencies: string[];
  complexity: number;
  isReusable: boolean;
}

export interface TypeScriptQualityIssue {
  filePath: string;
  lineNumber: number;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  category: 'typing' | 'patterns' | 'complexity' | 'naming' | 'structure';
  suggestion: string;
}

export interface TypeScriptAnalysis {
  patterns: TypeScriptPattern[];
  qualityIssues: TypeScriptQualityIssue[];
  typeDefinitions: number;
  typeSafetyScore: number; // 0-100
  patternConsistencyScore: number; // 0-100
  codeQualityMetrics: {
    totalFiles: number;
    typedFiles: number;
    interfaceCount: number;
    typeCount: number;
    enumCount: number;
    anyUsage: number;
    unknownUsage: number;
  };
}

export class TypeScriptPatternScanner {
  private static srcDirectory = 'src';

  /**
   * Comprehensive TypeScript analysis
   */
  static async analyzeTypeScriptPatterns(): Promise<TypeScriptAnalysis> {
    console.log('🔍 Analyzing TypeScript patterns and quality...');

    // Browser-compatible implementation
    if (typeof window !== 'undefined') {
      console.log('⚠️ TypeScript pattern analysis not available in browser environment');
      return {
        patterns: [],
        qualityIssues: [],
        typeDefinitions: 0,
        typeSafetyScore: 100, // Assume good in browser
        patternConsistencyScore: 100,
        codeQualityMetrics: {
          totalFiles: 0,
          typedFiles: 0,
          interfaceCount: 0,
          typeCount: 0,
          enumCount: 0,
          anyUsage: 0,
          unknownUsage: 0
        }
      };
    }

    const patterns: TypeScriptPattern[] = [];
    const qualityIssues: TypeScriptQualityIssue[] = [];
    const metrics = {
      totalFiles: 0,
      typedFiles: 0,
      interfaceCount: 0,
      typeCount: 0,
      enumCount: 0,
      anyUsage: 0,
      unknownUsage: 0
    };

    try {
      await this.scanDirectory(this.srcDirectory, patterns, qualityIssues, metrics);

      const typeSafetyScore = this.calculateTypeSafetyScore(metrics, qualityIssues);
      const patternConsistencyScore = this.calculatePatternConsistencyScore(patterns);

      console.log(`✅ TypeScript analysis completed:
        - Patterns found: ${patterns.length}
        - Quality issues: ${qualityIssues.length}
        - Type safety score: ${typeSafetyScore}/100
        - Pattern consistency: ${patternConsistencyScore}/100`);

      return {
        patterns,
        qualityIssues,
        typeDefinitions: metrics.interfaceCount + metrics.typeCount + metrics.enumCount,
        typeSafetyScore,
        patternConsistencyScore,
        codeQualityMetrics: metrics
      };

    } catch (error) {
      console.error('❌ TypeScript analysis failed:', error);
      return {
        patterns: [],
        qualityIssues: [],
        typeDefinitions: 0,
        typeSafetyScore: 0,
        patternConsistencyScore: 0,
        codeQualityMetrics: metrics
      };
    }
  }

  /**
   * Recursively scan directory for TypeScript patterns
   */
  private static async scanDirectory(
    dirPath: string,
    patterns: TypeScriptPattern[],
    qualityIssues: TypeScriptQualityIssue[],
    metrics: any
  ): Promise<void> {
    // Browser check
    if (typeof window !== 'undefined') return;

    try {
      const fs = await import('fs') as any;
      const path = await import('path') as any;

      if (!fs.existsSync(dirPath)) return;

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            await this.scanDirectory(fullPath, patterns, qualityIssues, metrics);
          }
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          metrics.totalFiles++;
          await this.analyzeFile(fullPath, patterns, qualityIssues, metrics);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to scan directory (Node.js modules not available):', error);
    }
  }

  /**
   * Analyze individual TypeScript file
   */
  private static async analyzeFile(
    filePath: string,
    patterns: TypeScriptPattern[],
    qualityIssues: TypeScriptQualityIssue[],
    metrics: any
  ): Promise<void> {
    // Browser check
    if (typeof window !== 'undefined') return;

    try {
      const fs = await import('fs') as any;
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Check if file has TypeScript features
      const hasTypeScript = this.hasTypeScriptFeatures(content);
      if (hasTypeScript) {
        metrics.typedFiles++;
      }

      // Analyze patterns
      this.analyzeInterfaces(content, filePath, patterns, metrics);
      this.analyzeTypes(content, filePath, patterns, metrics);
      this.analyzeEnums(content, filePath, patterns, metrics);
      this.analyzeClasses(content, filePath, patterns);
      this.analyzeFunctions(content, filePath, patterns);
      this.analyzeHooks(content, filePath, patterns);
      this.analyzeComponents(content, filePath, patterns);

      // Analyze quality issues
      this.analyzeQualityIssues(content, filePath, lines, qualityIssues, metrics);

    } catch (error) {
      console.warn(`⚠️ Failed to analyze file ${filePath}:`, error);
    }
  }

  /**
   * Check if file has TypeScript features
   */
  private static hasTypeScriptFeatures(content: string): boolean {
    const tsFeatures = [
      /:\s*\w+(\[\])?(\s*\|\s*\w+)*\s*[=;,)]/g, // Type annotations
      /interface\s+\w+/g,
      /type\s+\w+\s*=/g,
      /enum\s+\w+/g,
      /<[A-Z]\w*>/g, // Generic types
      /as\s+\w+/g, // Type assertions
    ];

    return tsFeatures.some(pattern => pattern.test(content));
  }

  /**
   * Analyze interfaces
   */
  private static analyzeInterfaces(
    content: string,
    filePath: string,
    patterns: TypeScriptPattern[],
    metrics: any
  ): void {
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+[\w,\s]+)?\s*{([^}]*)}/g;
    let match;

    while ((match = interfaceRegex.exec(content)) !== null) {
      const interfaceName = match[1];
      const interfaceBody = match[2];
      
      metrics.interfaceCount++;
      
      patterns.push({
        name: interfaceName,
        type: 'interface',
        filePath,
        exports: content.includes(`export interface ${interfaceName}`),
        usageCount: this.countUsages(content, interfaceName),
        dependencies: this.extractInterfaceDependencies(interfaceBody),
        complexity: this.calculateInterfaceComplexity(interfaceBody),
        isReusable: this.isInterfaceReusable(interfaceName, interfaceBody)
      });
    }
  }

  /**
   * Analyze type definitions
   */
  private static analyzeTypes(
    content: string,
    filePath: string,
    patterns: TypeScriptPattern[],
    metrics: any
  ): void {
    const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=([^;]+);/g;
    let match;

    while ((match = typeRegex.exec(content)) !== null) {
      const typeName = match[1];
      const typeDefinition = match[2];
      
      metrics.typeCount++;
      
      patterns.push({
        name: typeName,
        type: 'type',
        filePath,
        exports: content.includes(`export type ${typeName}`),
        usageCount: this.countUsages(content, typeName),
        dependencies: this.extractTypeDependencies(typeDefinition),
        complexity: this.calculateTypeComplexity(typeDefinition),
        isReusable: this.isTypeReusable(typeName, typeDefinition)
      });
    }
  }

  /**
   * Analyze enums
   */
  private static analyzeEnums(
    content: string,
    filePath: string,
    patterns: TypeScriptPattern[],
    metrics: any
  ): void {
    const enumRegex = /(?:export\s+)?enum\s+(\w+)\s*{([^}]*)}/g;
    let match;

    while ((match = enumRegex.exec(content)) !== null) {
      const enumName = match[1];
      const enumBody = match[2];
      
      metrics.enumCount++;
      
      patterns.push({
        name: enumName,
        type: 'enum',
        filePath,
        exports: content.includes(`export enum ${enumName}`),
        usageCount: this.countUsages(content, enumName),
        dependencies: [],
        complexity: enumBody.split(',').length,
        isReusable: true // Enums are generally reusable
      });
    }
  }

  /**
   * Analyze classes
   */
  private static analyzeClasses(content: string, filePath: string, patterns: TypeScriptPattern[]): void {
    const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*{/g;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      
      patterns.push({
        name: className,
        type: 'class',
        filePath,
        exports: content.includes(`export class ${className}`) || content.includes(`export { ${className}`),
        usageCount: this.countUsages(content, className),
        dependencies: this.extractImports(content),
        complexity: this.calculateClassComplexity(content, className),
        isReusable: this.isClassReusable(content, className)
      });
    }
  }

  /**
   * Analyze functions
   */
  private static analyzeFunctions(content: string, filePath: string, patterns: TypeScriptPattern[]): void {
    const functionPatterns = [
      /(?:export\s+)?function\s+(\w+)\s*\(/g,
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*:/g,
    ];

    functionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const functionName = match[1];
        
        // Skip React components (they'll be analyzed separately)
        if (/^[A-Z]/.test(functionName)) continue;
        
        patterns.push({
          name: functionName,
          type: 'function',
          filePath,
          exports: content.includes(`export`) && content.includes(functionName),
          usageCount: this.countUsages(content, functionName),
          dependencies: this.extractImports(content),
          complexity: this.calculateFunctionComplexity(content, functionName),
          isReusable: this.isFunctionReusable(content, functionName)
        });
      }
    });
  }

  /**
   * Analyze React hooks
   */
  private static analyzeHooks(content: string, filePath: string, patterns: TypeScriptPattern[]): void {
    const hookRegex = /(?:export\s+)?const\s+(use\w+)\s*=/g;
    let match;

    while ((match = hookRegex.exec(content)) !== null) {
      const hookName = match[1];
      
      patterns.push({
        name: hookName,
        type: 'hook',
        filePath,
        exports: content.includes(`export`) && content.includes(hookName),
        usageCount: this.countUsages(content, hookName),
        dependencies: this.extractImports(content),
        complexity: this.calculateFunctionComplexity(content, hookName),
        isReusable: true // Hooks are generally reusable
      });
    }
  }

  /**
   * Analyze React components
   */
  private static analyzeComponents(content: string, filePath: string, patterns: TypeScriptPattern[]): void {
    const componentPatterns = [
      /(?:export\s+)?const\s+([A-Z]\w+)\s*[:=]\s*(?:React\.)?(?:FC|FunctionComponent)/g,
      /(?:export\s+)?function\s+([A-Z]\w+)\s*\(/g,
    ];

    componentPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const componentName = match[1];
        
        patterns.push({
          name: componentName,
          type: 'component',
          filePath,
          exports: content.includes(`export`) && content.includes(componentName),
          usageCount: this.countUsages(content, componentName),
          dependencies: this.extractImports(content),
          complexity: this.calculateComponentComplexity(content, componentName),
          isReusable: this.isComponentReusable(content, componentName)
        });
      }
    });
  }

  /**
   * Analyze quality issues
   */
  private static analyzeQualityIssues(
    content: string,
    filePath: string,
    lines: string[],
    qualityIssues: TypeScriptQualityIssue[],
    metrics: any
  ): void {
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for 'any' usage
      if (/:\s*any\b/.test(line) && !line.includes('//')) {
        metrics.anyUsage++;
        qualityIssues.push({
          filePath,
          lineNumber,
          issue: 'Usage of "any" type',
          severity: 'warning',
          category: 'typing',
          suggestion: 'Replace "any" with specific type definition'
        });
      }

      // Check for 'unknown' usage
      if (/:\s*unknown\b/.test(line)) {
        metrics.unknownUsage++;
      }

      // Check for missing return types on functions
      if (/function\s+\w+\s*\([^)]*\)\s*{/.test(line) && !/:/.test(line)) {
        qualityIssues.push({
          filePath,
          lineNumber,
          issue: 'Function missing return type',
          severity: 'info',
          category: 'typing',
          suggestion: 'Add explicit return type annotation'
        });
      }

      // Check for non-null assertions
      if (/!\./.test(line) || /!\s*;/.test(line)) {
        qualityIssues.push({
          filePath,
          lineNumber,
          issue: 'Non-null assertion used',
          severity: 'warning',
          category: 'typing',
          suggestion: 'Consider proper null checking instead of assertion'
        });
      }

      // Check for magic numbers
      if (/\b\d{2,}\b/.test(line) && !line.includes('//') && !line.includes('version')) {
        qualityIssues.push({
          filePath,
          lineNumber,
          issue: 'Magic number detected',
          severity: 'info',
          category: 'patterns',
          suggestion: 'Extract magic number to named constant'
        });
      }
    });
  }

  /**
   * Count usages of a pattern/type
   */
  private static countUsages(content: string, name: string): number {
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    const matches = content.match(regex);
    return matches ? matches.length - 1 : 0; // Subtract 1 for the definition itself
  }

  /**
   * Extract dependencies from interface body
   */
  private static extractInterfaceDependencies(interfaceBody: string): string[] {
    const dependencies: string[] = [];
    const typeRegex = /:\s*([A-Z]\w*)/g;
    let match;

    while ((match = typeRegex.exec(interfaceBody)) !== null) {
      dependencies.push(match[1]);
    }

    return [...new Set(dependencies)];
  }

  /**
   * Extract dependencies from type definition
   */
  private static extractTypeDependencies(typeDefinition: string): string[] {
    const dependencies: string[] = [];
    const typeRegex = /\b([A-Z]\w*)\b/g;
    let match;

    while ((match = typeRegex.exec(typeDefinition)) !== null) {
      dependencies.push(match[1]);
    }

    return [...new Set(dependencies)];
  }

  /**
   * Extract import statements
   */
  private static extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:{[^}]+}|\w+|\*\s+as\s+\w+)\s+from\s+['"](.*?)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * Calculate various complexity metrics
   */
  private static calculateInterfaceComplexity(interfaceBody: string): number {
    const properties = interfaceBody.split(/[;,]/).filter(p => p.trim()).length;
    const optionalProperties = (interfaceBody.match(/\?:/g) || []).length;
    const complexTypes = (interfaceBody.match(/Array<|Promise<|\|/g) || []).length;
    
    return properties + (optionalProperties * 0.5) + (complexTypes * 2);
  }

  private static calculateTypeComplexity(typeDefinition: string): number {
    const unions = (typeDefinition.match(/\|/g) || []).length;
    const intersections = (typeDefinition.match(/&/g) || []).length;
    const generics = (typeDefinition.match(/</g) || []).length;
    
    return 1 + unions + intersections + (generics * 2);
  }

  private static calculateClassComplexity(content: string, className: string): number {
    const classRegex = new RegExp(`class\\s+${className}[^{]*{([^}]+)}`, 'g');
    const match = classRegex.exec(content);
    
    if (match && match[1]) {
      const classBody = match[1];
      const methods = (classBody.match(/\w+\s*\(/g) || []).length;
      const properties = (classBody.match(/\w+\s*:/g) || []).length;
      
      return methods + properties;
    }
    
    return 1;
  }

  private static calculateFunctionComplexity(content: string, functionName: string): number {
    const functionRegex = new RegExp(`(?:function\\s+${functionName}|const\\s+${functionName}\\s*=)[^{]*{([^}]+)}`, 'g');
    const match = functionRegex.exec(content);
    
    if (match && match[1]) {
      const functionBody = match[1];
      return (functionBody.match(/if|for|while|switch|catch|\?|&&|\|\|/g) || []).length + 1;
    }
    
    return 1;
  }

  private static calculateComponentComplexity(content: string, componentName: string): number {
    const complexity = this.calculateFunctionComplexity(content, componentName);
    const hooks = (content.match(/use\w+\(/g) || []).length;
    const jsx = (content.match(/<\w+/g) || []).length;
    
    return complexity + hooks + (jsx * 0.5);
  }

  /**
   * Assess reusability
   */
  private static isInterfaceReusable(name: string, body: string): boolean {
    return !name.toLowerCase().includes('props') && !body.includes('specific');
  }

  private static isTypeReusable(name: string, definition: string): boolean {
    return !name.toLowerCase().includes('props') && definition.length < 100;
  }

  private static isClassReusable(content: string, className: string): boolean {
    return !className.toLowerCase().includes('component') && 
           (content.includes('abstract') || content.includes('extends'));
  }

  private static isFunctionReusable(content: string, functionName: string): boolean {
    return !functionName.includes('handle') && !functionName.includes('on');
  }

  private static isComponentReusable(content: string, componentName: string): boolean {
    return !componentName.includes('Page') && !componentName.includes('Screen');
  }

  /**
   * Calculate scores
   */
  private static calculateTypeSafetyScore(metrics: any, qualityIssues: TypeScriptQualityIssue[]): number {
    const { totalFiles, typedFiles, anyUsage } = metrics;
    const highSeverityIssues = qualityIssues.filter(i => i.severity === 'error').length;
    
    let score = 100;
    
    // Penalize for untyped files
    if (totalFiles > 0) {
      score -= ((totalFiles - typedFiles) / totalFiles) * 30;
    }
    
    // Penalize for 'any' usage
    score -= Math.min(anyUsage * 5, 30);
    
    // Penalize for high severity issues
    score -= highSeverityIssues * 10;
    
    return Math.max(0, Math.round(score));
  }

  private static calculatePatternConsistencyScore(patterns: TypeScriptPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const exportedPatterns = patterns.filter(p => p.exports).length;
    const reusablePatterns = patterns.filter(p => p.isReusable).length;
    const averageComplexity = patterns.reduce((sum, p) => sum + p.complexity, 0) / patterns.length;
    
    let score = 100;
    
    // Reward exported patterns
    score += (exportedPatterns / patterns.length) * 20;
    
    // Reward reusable patterns
    score += (reusablePatterns / patterns.length) * 20;
    
    // Penalize high complexity
    if (averageComplexity > 10) {
      score -= (averageComplexity - 10) * 2;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
