
/**
 * Service Class Scanner
 * Detects and catalogs services, classes, and methods throughout the codebase
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ServiceInfo {
  name: string;
  filePath: string;
  type: 'service' | 'class' | 'utility';
  methods: string[];
  exports: string[];
  dependencies: string[];
  isReusable: boolean;
  complexity: 'low' | 'medium' | 'high';
  lastModified: Date;
}

export interface MethodInfo {
  name: string;
  className?: string;
  serviceName?: string;
  filePath: string;
  parameters: string[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  complexity: number;
}

export interface ClassInfo {
  name: string;
  filePath: string;
  methods: string[];
  properties: string[];
  extends?: string;
  implements: string[];
  isExported: boolean;
  isAbstract: boolean;
}

export class ServiceClassScanner {
  private static srcDirectory = 'src';

  /**
   * Scan all services, classes, and methods in the codebase
   */
  static async scanAllServicesAndClasses(): Promise<{
    services: ServiceInfo[];
    classes: ClassInfo[];
    methods: MethodInfo[];
    utilities: ServiceInfo[];
  }> {
    console.log('🔍 Scanning all services, classes, and methods...');

    const services: ServiceInfo[] = [];
    const classes: ClassInfo[] = [];
    const methods: MethodInfo[] = [];
    const utilities: ServiceInfo[] = [];

    try {
      await this.scanDirectory(this.srcDirectory, services, classes, methods, utilities);

      console.log(`✅ Service/Class scan completed:
        - Services: ${services.length}
        - Classes: ${classes.length}
        - Methods: ${methods.length}
        - Utilities: ${utilities.length}`);

      return { services, classes, methods, utilities };

    } catch (error) {
      console.error('❌ Service/Class scan failed:', error);
      return { services: [], classes: [], methods: [], utilities: [] };
    }
  }

  /**
   * Recursively scan directory for services and classes
   */
  private static async scanDirectory(
    dirPath: string,
    services: ServiceInfo[],
    classes: ClassInfo[],
    methods: MethodInfo[],
    utilities: ServiceInfo[]
  ): Promise<void> {
    if (!fs.existsSync(dirPath)) return;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await this.scanDirectory(fullPath, services, classes, methods, utilities);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        await this.analyzeFile(fullPath, services, classes, methods, utilities);
      }
    }
  }

  /**
   * Analyze individual TypeScript file
   */
  private static async analyzeFile(
    filePath: string,
    services: ServiceInfo[],
    classes: ClassInfo[],
    methods: MethodInfo[],
    utilities: ServiceInfo[]
  ): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      
      // Detect services
      const detectedServices = this.detectServices(content, filePath, stats.mtime);
      services.push(...detectedServices);

      // Detect classes
      const detectedClasses = this.detectClasses(content, filePath);
      classes.push(...detectedClasses);

      // Detect methods
      const detectedMethods = this.detectMethods(content, filePath);
      methods.push(...detectedMethods);

      // Detect utilities
      const detectedUtilities = this.detectUtilities(content, filePath, stats.mtime);
      utilities.push(...detectedUtilities);

    } catch (error) {
      console.warn(`⚠️ Failed to analyze file ${filePath}:`, error);
    }
  }

  /**
   * Detect services in file content
   */
  private static detectServices(content: string, filePath: string, lastModified: Date): ServiceInfo[] {
    const services: ServiceInfo[] = [];

    // Service patterns
    const servicePatterns = [
      /class\s+(\w+Service)\s*{/g,
      /export\s+class\s+(\w+Manager)\s*{/g,
      /export\s+class\s+(\w+Handler)\s*{/g,
      /export\s+class\s+(\w+Controller)\s*{/g,
      /export\s+class\s+(\w+Orchestrator)\s*{/g,
      /export\s+class\s+(\w+Coordinator)\s*{/g
    ];

    servicePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const serviceName = match[1];
        
        services.push({
          name: serviceName,
          filePath,
          type: 'service',
          methods: this.extractMethodNames(content, serviceName),
          exports: this.extractExports(content),
          dependencies: this.extractImports(content),
          isReusable: this.assessReusability(content, serviceName),
          complexity: this.assessComplexity(content),
          lastModified
        });
      }
    });

    return services;
  }

  /**
   * Detect classes in file content
   */
  private static detectClasses(content: string, filePath: string): ClassInfo[] {
    const classes: ClassInfo[] = [];
    
    // Class pattern
    const classPattern = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*{/g;
    
    let match;
    while ((match = classPattern.exec(content)) !== null) {
      const className = match[1];
      const extendsClass = match[2];
      const implementsInterfaces = match[3] ? match[3].split(',').map(s => s.trim()) : [];
      
      classes.push({
        name: className,
        filePath,
        methods: this.extractMethodNames(content, className),
        properties: this.extractProperties(content, className),
        extends: extendsClass,
        implements: implementsInterfaces,
        isExported: content.includes(`export class ${className}`) || content.includes(`export { ${className}`),
        isAbstract: content.includes(`abstract class ${className}`)
      });
    }

    return classes;
  }

  /**
   * Detect methods in file content
   */
  private static detectMethods(content: string, filePath: string): MethodInfo[] {
    const methods: MethodInfo[] = [];
    
    // Method patterns
    const methodPatterns = [
      /(?:static\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{/g,
      /const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
      /export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
    ];

    methodPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const methodName = match[1];
        
        // Skip constructors and common non-methods
        if (['constructor', 'render', 'if', 'for', 'while', 'switch'].includes(methodName)) {
          continue;
        }

        methods.push({
          name: methodName,
          filePath,
          parameters: this.extractParameters(content, methodName),
          isAsync: content.includes(`async ${methodName}`) || content.includes(`async (\w+)?\s*${methodName}`),
          isExported: content.includes(`export`) && content.includes(methodName),
          complexity: this.calculateMethodComplexity(content, methodName)
        });
      }
    });

    return methods;
  }

  /**
   * Detect utility functions and classes
   */
  private static detectUtilities(content: string, filePath: string, lastModified: Date): ServiceInfo[] {
    const utilities: ServiceInfo[] = [];

    // Utility patterns
    if (filePath.includes('/utils/') || filePath.includes('/helpers/') || filePath.includes('/lib/')) {
      const fileName = path.basename(filePath, path.extname(filePath));
      
      utilities.push({
        name: fileName,
        filePath,
        type: 'utility',
        methods: this.extractFunctionNames(content),
        exports: this.extractExports(content),
        dependencies: this.extractImports(content),
        isReusable: true, // Utilities are generally reusable
        complexity: this.assessComplexity(content),
        lastModified
      });
    }

    return utilities;
  }

  /**
   * Extract method names from class content
   */
  private static extractMethodNames(content: string, className: string): string[] {
    const methods: string[] = [];
    const classRegex = new RegExp(`class\\s+${className}\\s*(?:extends\\s+\\w+)?\\s*{([^}]+)}`, 'g');
    const match = classRegex.exec(content);
    
    if (match && match[1]) {
      const classBody = match[1];
      const methodRegex = /(?:static\s+)?(?:async\s+)?(\w+)\s*\(/g;
      let methodMatch;
      
      while ((methodMatch = methodRegex.exec(classBody)) !== null) {
        const methodName = methodMatch[1];
        if (methodName !== 'constructor') {
          methods.push(methodName);
        }
      }
    }
    
    return methods;
  }

  /**
   * Extract function names from content
   */
  private static extractFunctionNames(content: string): string[] {
    const functions: string[] = [];
    const patterns = [
      /export\s+function\s+(\w+)/g,
      /export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\(/g,
      /function\s+(\w+)/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        functions.push(match[1]);
      }
    });

    return [...new Set(functions)]; // Remove duplicates
  }

  /**
   * Extract properties from class
   */
  private static extractProperties(content: string, className: string): string[] {
    const properties: string[] = [];
    const classRegex = new RegExp(`class\\s+${className}\\s*(?:extends\\s+\\w+)?\\s*{([^}]+)}`, 'g');
    const match = classRegex.exec(content);
    
    if (match && match[1]) {
      const classBody = match[1];
      const propertyRegex = /(?:private\s+|public\s+|protected\s+)?(\w+)\s*:/g;
      let propMatch;
      
      while ((propMatch = propertyRegex.exec(classBody)) !== null) {
        properties.push(propMatch[1]);
      }
    }
    
    return properties;
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
   * Extract export statements
   */
  private static extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex = /export\s+(?:class|function|const|let|var)\s+(\w+)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  /**
   * Extract method parameters
   */
  private static extractParameters(content: string, methodName: string): string[] {
    const paramRegex = new RegExp(`${methodName}\\s*\\(([^)]*)\\)`, 'g');
    const match = paramRegex.exec(content);
    
    if (match && match[1]) {
      return match[1].split(',').map(p => p.trim().split(':')[0].trim()).filter(p => p);
    }
    
    return [];
  }

  /**
   * Assess reusability of a service/class
   */
  private static assessReusability(content: string, name: string): boolean {
    // Check for generic patterns that indicate reusability
    const reusabilityIndicators = [
      'interface',
      'generic',
      'template',
      'abstract',
      'extends',
      'implements'
    ];

    return reusabilityIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * Assess complexity of code
   */
  private static assessComplexity(content: string): 'low' | 'medium' | 'high' {
    const lines = content.split('\n').length;
    const cyclomaticComplexity = (content.match(/if|for|while|switch|catch/g) || []).length;
    
    if (lines > 200 || cyclomaticComplexity > 10) {
      return 'high';
    } else if (lines > 100 || cyclomaticComplexity > 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Calculate method complexity
   */
  private static calculateMethodComplexity(content: string, methodName: string): number {
    const methodRegex = new RegExp(`${methodName}\\s*\\([^)]*\\)\\s*(?::\\s*[^{]+)?\\s*{([^}]+)}`, 'g');
    const match = methodRegex.exec(content);
    
    if (match && match[1]) {
      const methodBody = match[1];
      return (methodBody.match(/if|for|while|switch|catch|\?|&&|\|\|/g) || []).length + 1;
    }
    
    return 1;
  }

  /**
   * Find duplicate services/classes across the codebase
   */
  static async findDuplicateServices(): Promise<{
    duplicateServices: { name: string; locations: string[] }[];
    duplicateClasses: { name: string; locations: string[] }[];
    duplicateMethods: { name: string; locations: string[] }[];
  }> {
    const { services, classes, methods } = await this.scanAllServicesAndClasses();

    // Find duplicate services
    const serviceGroups = services.reduce((acc, service) => {
      if (!acc[service.name]) acc[service.name] = [];
      acc[service.name].push(service.filePath);
      return acc;
    }, {} as Record<string, string[]>);

    const duplicateServices = Object.entries(serviceGroups)
      .filter(([, locations]) => locations.length > 1)
      .map(([name, locations]) => ({ name, locations }));

    // Find duplicate classes
    const classGroups = classes.reduce((acc, cls) => {
      if (!acc[cls.name]) acc[cls.name] = [];
      acc[cls.name].push(cls.filePath);
      return acc;
    }, {} as Record<string, string[]>);

    const duplicateClasses = Object.entries(classGroups)
      .filter(([, locations]) => locations.length > 1)
      .map(([name, locations]) => ({ name, locations }));

    // Find duplicate methods (same name, different files)
    const methodGroups = methods.reduce((acc, method) => {
      if (!acc[method.name]) acc[method.name] = [];
      acc[method.name].push(method.filePath);
      return acc;
    }, {} as Record<string, string[]>);

    const duplicateMethods = Object.entries(methodGroups)
      .filter(([, locations]) => new Set(locations).size > 1) // Different files
      .map(([name, locations]) => ({ name, locations: [...new Set(locations)] }));

    return { duplicateServices, duplicateClasses, duplicateMethods };
  }
}
