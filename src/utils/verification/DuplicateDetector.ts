/**
 * Duplicate Detection and Prevention Utility
 * 
 * This utility scans the component registry for duplicate components and hooks
 * to maintain the canonical source of truth pattern.
 * 
 * Browser-compatible version that works with the component registry.
 */

import { ComponentRegistryScanner } from './ComponentRegistryScanner';
import type { ComponentInventory } from './ComponentRegistryScanner';

interface ComponentInfo {
  name: string;
  location: string;
  exports: string[];
  isPrimary: boolean;
  type: 'component' | 'hook' | 'utility';
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

  /**
   * Scan for duplicate components and hooks using component registry
   */
  async scanForDuplicates(): Promise<DuplicateAnalysis[]> {
    try {
      // Use the component registry scanner instead of filesystem access
      const componentInventory = await ComponentRegistryScanner.scanAllComponents();
      const allComponents = this.convertInventoryToComponentInfo(componentInventory);
      return this.analyzeDuplicates(allComponents);
    } catch (error) {
      console.warn('Error scanning for duplicates:', error);
      return [];
    }
  }

  /**
   * Convert component inventory to our internal format
   */
  private convertInventoryToComponentInfo(inventory: ComponentInventory): ComponentInfo[] {
    const components: ComponentInfo[] = [];

    // Add components
    inventory.components.forEach(comp => {
      components.push({
        name: comp.name,
        location: comp.location,
        exports: [comp.name], // Simplified - assuming component name is the main export
        isPrimary: this.isPrimaryComponent(comp.name, comp.location),
        type: 'component'
      });
    });

    // Add hooks
    inventory.hooks.forEach(hook => {
      components.push({
        name: hook.name,
        location: hook.location,
        exports: [hook.name],
        isPrimary: this.isPrimaryComponent(hook.name, hook.location),
        type: 'hook'
      });
    });

    // Add utilities
    inventory.utilities.forEach(util => {
      components.push({
        name: util.name,
        location: util.location,
        exports: [util.name],
        isPrimary: this.isPrimaryComponent(util.name, util.location),
        type: 'utility'
      });
    });

    return components;
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
      primarySource: primaryComponent?.location || 'Not found',
      duplicates: duplicates.map(d => d.location),
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

  /**
   * Get summary statistics about duplicates
   */
  async getDuplicateStats(): Promise<{
    totalDuplicates: number;
    highRiskDuplicates: number;
    mediumRiskDuplicates: number;
    lowRiskDuplicates: number;
  }> {
    const analyses = await this.scanForDuplicates();
    
    return {
      totalDuplicates: analyses.length,
      highRiskDuplicates: analyses.filter(a => a.riskLevel === 'high').length,
      mediumRiskDuplicates: analyses.filter(a => a.riskLevel === 'medium').length,
      lowRiskDuplicates: analyses.filter(a => a.riskLevel === 'low').length,
    };
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
