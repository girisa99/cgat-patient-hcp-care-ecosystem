
/**
 * Duplicate Detection and Prevention Utility
 * 
 * This utility scans the codebase for duplicate components and hooks
 * to maintain the canonical source of truth pattern.
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface ComponentInfo {
  name: string;
  path: string;
  exports: string[];
  isPrimary: boolean;
  lastModified: Date;
}

interface DuplicateAnalysis {
  component: string;
  primarySource: string;
  duplicates: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class DuplicateDetector {
  private primaryComponents = new Map<string, string>([
    ['UsersList', 'src/components/users/UsersList.tsx'],
    ['UserActions', 'src/components/users/UserActions.tsx'],
    ['ConsistentUsersLayout', 'src/components/users/ConsistentUsersLayout.tsx'],
    ['useUsers', 'src/hooks/useUsers.tsx'],
    ['usePatients', 'src/hooks/usePatients.tsx'],
    ['useConsistentUsers', 'src/hooks/useConsistentUsers.tsx'],
    ['SimplifiedValidator', 'src/utils/verification/SimplifiedValidator.ts']
  ]);

  private sourceDirectories = [
    'src/components',
    'src/hooks',
    'src/utils',
    'src/pages'
  ];

  /**
   * Scan for duplicate components and hooks
   */
  async scanForDuplicates(): Promise<DuplicateAnalysis[]> {
    const allComponents = await this.scanAllComponents();
    return this.analyzeDuplicates(allComponents);
  }

  /**
   * Scan all component and hook files
   */
  private async scanAllComponents(): Promise<ComponentInfo[]> {
    const components: ComponentInfo[] = [];

    for (const dir of this.sourceDirectories) {
      try {
        const files = await this.scanDirectory(dir);
        components.push(...files);
      } catch (error) {
        console.warn(`Could not scan directory ${dir}:`, error);
      }
    }

    return components;
  }

  /**
   * Recursively scan a directory for components
   */
  private async scanDirectory(dirPath: string): Promise<ComponentInfo[]> {
    const components: ComponentInfo[] = [];
    
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          const subComponents = await this.scanDirectory(fullPath);
          components.push(...subComponents);
        } else if (this.isReactFile(entry.name)) {
          const component = await this.analyzeFile(fullPath);
          if (component) {
            components.push(component);
          }
        }
      }
    } catch (error) {
      console.warn(`Error scanning directory ${dirPath}:`, error);
    }
    
    return components;
  }

  /**
   * Check if file is a React component or hook
   */
  private isReactFile(filename: string): boolean {
    return (
      (filename.endsWith('.tsx') || filename.endsWith('.ts')) &&
      !filename.endsWith('.test.tsx') &&
      !filename.endsWith('.test.ts') &&
      !filename.endsWith('.d.ts')
    );
  }

  /**
   * Analyze a single file for component/hook information
   */
  private async analyzeFile(filePath: string): Promise<ComponentInfo | null> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const exports = this.extractExports(content);
      
      if (exports.length === 0) return null;

      const componentName = exports[0]; // Primary export
      const isPrimary = this.isPrimaryComponent(componentName, filePath);
      
      return {
        name: componentName,
        path: filePath,
        exports,
        isPrimary,
        lastModified: new Date()
      };
    } catch (error) {
      console.warn(`Error analyzing file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract exported component/hook names from file content
   */
  private extractExports(content: string): string[] {
    const exports: string[] = [];
    
    // Match default exports
    const defaultExportMatch = content.match(/export\s+default\s+(\w+)/);
    if (defaultExportMatch) {
      exports.push(defaultExportMatch[1]);
    }

    // Match named exports
    const namedExportMatches = content.matchAll(/export\s+(?:const|function|class)\s+(\w+)/g);
    for (const match of namedExportMatches) {
      exports.push(match[1]);
    }

    // Match export { ... } statements
    const exportStatements = content.matchAll(/export\s*{\s*([^}]+)\s*}/g);
    for (const match of exportStatements) {
      const exportList = match[1].split(',').map(item => item.trim().split(' as ')[0]);
      exports.push(...exportList);
    }

    return exports.filter(name => name && name.length > 0);
  }

  /**
   * Check if component is marked as primary
   */
  private isPrimaryComponent(componentName: string, filePath: string): boolean {
    const primaryPath = this.primaryComponents.get(componentName);
    return primaryPath === filePath;
  }

  /**
   * Analyze components for duplicates
   */
  private analyzeDuplicates(components: ComponentInfo[]): DuplicateAnalysis[] {
    const componentGroups = new Map<string, ComponentInfo[]>();
    
    // Group components by name
    for (const component of components) {
      for (const exportName of component.exports) {
        if (!componentGroups.has(exportName)) {
          componentGroups.set(exportName, []);
        }
        componentGroups.get(exportName)!.push(component);
      }
    }

    const analyses: DuplicateAnalysis[] = [];

    // Analyze each group for duplicates
    for (const [name, group] of componentGroups) {
      if (group.length > 1) {
        const analysis = this.createDuplicateAnalysis(name, group);
        if (analysis) {
          analyses.push(analysis);
        }
      }
    }

    return analyses;
  }

  /**
   * Create duplicate analysis for a component group
   */
  private createDuplicateAnalysis(componentName: string, components: ComponentInfo[]): DuplicateAnalysis | null {
    const primaryComponent = components.find(c => c.isPrimary);
    const duplicates = components.filter(c => !c.isPrimary);

    if (duplicates.length === 0) return null;

    const riskLevel = this.assessRiskLevel(componentName, duplicates.length);
    const recommendations = this.generateRecommendations(componentName, duplicates);

    return {
      component: componentName,
      primarySource: primaryComponent?.path || 'Not found',
      duplicates: duplicates.map(d => d.path),
      riskLevel,
      recommendations
    };
  }

  /**
   * Assess risk level of duplication
   */
  private assessRiskLevel(componentName: string, duplicateCount: number): 'low' | 'medium' | 'high' {
    if (this.primaryComponents.has(componentName)) {
      return duplicateCount > 2 ? 'high' : 'medium';
    }
    return duplicateCount > 3 ? 'medium' : 'low';
  }

  /**
   * Generate recommendations for handling duplicates
   */
  private generateRecommendations(componentName: string, duplicates: ComponentInfo[]): string[] {
    const recommendations: string[] = [];

    if (this.primaryComponents.has(componentName)) {
      recommendations.push(`Use primary component: ${this.primaryComponents.get(componentName)}`);
      recommendations.push('Remove duplicate implementations');
      recommendations.push('Update imports to use primary component');
    } else {
      recommendations.push('Designate one implementation as primary');
      recommendations.push('Add documentation header to primary component');
      recommendations.push('Consolidate functionality into primary component');
    }

    if (duplicates.length > 2) {
      recommendations.push('Consider refactoring to reduce complexity');
    }

    return recommendations;
  }

  /**
   * Generate duplicate detection report
   */
  generateReport(analyses: DuplicateAnalysis[]): string {
    if (analyses.length === 0) {
      return '✅ No duplicates detected. All components follow canonical source pattern.';
    }

    let report = '🔍 DUPLICATE DETECTION REPORT\n';
    report += '=' .repeat(50) + '\n\n';

    for (const analysis of analyses) {
      report += `📦 Component: ${analysis.component}\n`;
      report += `🎯 Primary Source: ${analysis.primarySource}\n`;
      report += `⚠️  Risk Level: ${analysis.riskLevel.toUpperCase()}\n`;
      report += `📁 Duplicates Found:\n`;
      
      for (const duplicate of analysis.duplicates) {
        report += `   - ${duplicate}\n`;
      }
      
      report += `💡 Recommendations:\n`;
      for (const rec of analysis.recommendations) {
        report += `   • ${rec}\n`;
      }
      
      report += '\n' + '-'.repeat(30) + '\n\n';
    }

    return report;
  }
}

/**
 * Utility function to run duplicate detection
 */
export const detectDuplicates = async (): Promise<string> => {
  const detector = new DuplicateDetector();
  const analyses = await detector.scanForDuplicates();
  return detector.generateReport(analyses);
};
