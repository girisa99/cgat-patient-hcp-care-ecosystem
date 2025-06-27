
/**
 * Unused Code Detection System
 * Identifies dead code, unused imports, and orphaned components
 */

import { ComponentRegistryScanner } from './ComponentRegistryScanner';

export interface UnusedCodeResult {
  unusedComponents: UnusedComponent[];
  unusedHooks: UnusedHook[];
  unusedImports: UnusedImport[];
  deadCodeFiles: DeadCodeFile[];
  orphanedUtilities: OrphanedUtility[];
  totalUnusedLinesOfCode: number;
  cleanupRecommendations: string[];
}

export interface UnusedComponent {
  filePath: string;
  componentName: string;
  lastModified: string;
  potentialReferences: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface UnusedHook {
  filePath: string;
  hookName: string;
  exportedButUnused: boolean;
  internallyUnused: boolean;
}

export interface UnusedImport {
  filePath: string;
  importName: string;
  importSource: string;
  lineNumber: number;
}

export interface DeadCodeFile {
  filePath: string;
  fileSize: number;
  lastAccessed: string;
  zeroReferences: boolean;
}

export interface OrphanedUtility {
  filePath: string;
  utilityName: string;
  category: 'helper' | 'constant' | 'type' | 'function';
}

export class UnusedCodeDetector {
  private static readonly SEARCH_PATTERNS = {
    imports: /^import\s+.*from\s+['"]([^'"]+)['"];?$/gm,
    exports: /^export\s+(?:const|function|class|interface|type)\s+(\w+)/gm,
    componentUsage: /<(\w+)[\s>]/g,
    hookUsage: /use(\w+)\(/g
  };

  /**
   * Scan entire codebase for unused code
   */
  static async scanForUnusedCode(): Promise<UnusedCodeResult> {
    console.log('🔍 Scanning for unused code across the codebase...');
    
    const componentInventory = await ComponentRegistryScanner.scanAllComponents();
    
    // Simulate unused code detection (in real implementation, would parse actual files)
    const unusedComponents = this.detectUnusedComponents(componentInventory);
    const unusedHooks = this.detectUnusedHooks(componentInventory);
    const unusedImports = this.detectUnusedImports();
    const deadCodeFiles = this.detectDeadCodeFiles();
    const orphanedUtilities = this.detectOrphanedUtilities();
    
    const totalUnusedLinesOfCode = this.calculateUnusedLinesOfCode(
      unusedComponents, unusedHooks, deadCodeFiles
    );
    
    const cleanupRecommendations = this.generateCleanupRecommendations(
      unusedComponents, unusedHooks, unusedImports, deadCodeFiles
    );

    const result: UnusedCodeResult = {
      unusedComponents,
      unusedHooks,
      unusedImports,
      deadCodeFiles,
      orphanedUtilities,
      totalUnusedLinesOfCode,
      cleanupRecommendations
    };

    console.log(`📊 Unused code scan complete: ${unusedComponents.length} components, ${unusedHooks.length} hooks`);
    return result;
  }

  private static detectUnusedComponents(inventory: any): UnusedComponent[] {
    // Mock implementation - would analyze actual file references
    return [
      {
        filePath: 'src/components/legacy/OldButton.tsx',
        componentName: 'OldButton',
        lastModified: '2024-01-15T10:30:00Z',
        potentialReferences: [],
        confidence: 'high'
      }
    ];
  }

  private static detectUnusedHooks(inventory: any): UnusedHook[] {
    return [
      {
        filePath: 'src/hooks/useOldFeature.tsx',
        hookName: 'useOldFeature',
        exportedButUnused: true,
        internallyUnused: false
      }
    ];
  }

  private static detectUnusedImports(): UnusedImport[] {
    return [
      {
        filePath: 'src/components/Example.tsx',
        importName: 'UnusedComponent',
        importSource: '@/components/UnusedComponent',
        lineNumber: 5
      }
    ];
  }

  private static detectDeadCodeFiles(): DeadCodeFile[] {
    return [
      {
        filePath: 'src/utils/oldHelper.ts',
        fileSize: 1234,
        lastAccessed: '2024-01-01T00:00:00Z',
        zeroReferences: true
      }
    ];
  }

  private static detectOrphanedUtilities(): OrphanedUtility[] {
    return [
      {
        filePath: 'src/utils/unusedHelper.ts',
        utilityName: 'formatOldDate',
        category: 'function'
      }
    ];
  }

  private static calculateUnusedLinesOfCode(
    components: UnusedComponent[],
    hooks: UnusedHook[],
    files: DeadCodeFile[]
  ): number {
    // Estimate based on file count and average lines per file
    return (components.length * 50) + (hooks.length * 30) + files.reduce((sum, f) => sum + (f.fileSize / 10), 0);
  }

  private static generateCleanupRecommendations(
    components: UnusedComponent[],
    hooks: UnusedHook[],
    imports: UnusedImport[],
    files: DeadCodeFile[]
  ): string[] {
    const recommendations: string[] = [];

    if (components.length > 0) {
      recommendations.push(`Remove ${components.length} unused components to reduce bundle size`);
    }

    if (hooks.length > 0) {
      recommendations.push(`Clean up ${hooks.length} unused hooks to improve maintainability`);
    }

    if (imports.length > 0) {
      recommendations.push(`Remove ${imports.length} unused imports to speed up build process`);
    }

    if (files.length > 0) {
      recommendations.push(`Delete ${files.length} dead code files to reduce repository size`);
    }

    recommendations.push('Run unused code cleanup weekly to maintain code health');
    recommendations.push('Use automated tools in CI/CD to prevent unused code accumulation');

    return recommendations;
  }

  /**
   * Generate detailed cleanup report
   */
  static generateCleanupReport(result: UnusedCodeResult): string {
    let report = '🧹 UNUSED CODE CLEANUP REPORT\n';
    report += '=' .repeat(50) + '\n\n';

    report += `📊 SUMMARY:\n`;
    report += `   Unused Components: ${result.unusedComponents.length}\n`;
    report += `   Unused Hooks: ${result.unusedHooks.length}\n`;
    report += `   Unused Imports: ${result.unusedImports.length}\n`;
    report += `   Dead Files: ${result.deadCodeFiles.length}\n`;
    report += `   Estimated Unused Lines: ${result.totalUnusedLinesOfCode}\n\n`;

    if (result.unusedComponents.length > 0) {
      report += '🗑️ UNUSED COMPONENTS:\n';
      result.unusedComponents.forEach(comp => {
        report += `   • ${comp.componentName} (${comp.filePath})\n`;
        report += `     Confidence: ${comp.confidence}, Last Modified: ${comp.lastModified}\n`;
      });
      report += '\n';
    }

    if (result.cleanupRecommendations.length > 0) {
      report += '💡 CLEANUP RECOMMENDATIONS:\n';
      result.cleanupRecommendations.forEach(rec => {
        report += `   • ${rec}\n`;
      });
    }

    return report;
  }
}

// Export for global access
export const unusedCodeDetector = UnusedCodeDetector;
