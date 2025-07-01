
/**
 * Module Registry Analyzer
 * Analyzes module registry for consistency and issues
 */

import { moduleRegistry } from '@/utils/moduleRegistry';

export interface ModuleAnalysisResult {
  totalModules: number;
  duplicateModules: string[];
  orphanedComponents: string[];
  inconsistentNaming: string[];
  healthScore: number;
  recommendations: string[];
}

export class ModuleAnalyzer {
  /**
   * Analyze module registry for issues
   */
  static analyzeModuleRegistry(): ModuleAnalysisResult {
    console.log('📦 Analyzing module registry...');

    const allModules = moduleRegistry.getAll();
    const totalModules = allModules.length;
    
    const duplicateModules = this.findDuplicateModules(allModules);
    const orphanedComponents = this.findOrphanedComponents(allModules);
    const inconsistentNaming = this.findNamingInconsistencies(allModules);
    
    const healthScore = this.calculateHealthScore(
      duplicateModules.length,
      orphanedComponents.length,
      inconsistentNaming.length
    );
    
    const recommendations = this.generateRecommendations(
      duplicateModules,
      orphanedComponents,
      inconsistentNaming
    );

    return {
      totalModules,
      duplicateModules,
      orphanedComponents,
      inconsistentNaming,
      healthScore,
      recommendations
    };
  }

  /**
   * Find duplicate modules
   */
  private static findDuplicateModules(modules: any[]): string[] {
    const seen = new Set();
    const duplicates: string[] = [];

    modules.forEach(module => {
      if (seen.has(module.moduleName)) {
        duplicates.push(module.moduleName);
      } else {
        seen.add(module.moduleName);
      }
    });

    return duplicates;
  }

  /**
   * Find orphaned components
   */
  private static findOrphanedComponents(modules: any[]): string[] {
    // Simulate orphaned component detection
    return [];
  }

  /**
   * Find naming inconsistencies
   */
  private static findNamingInconsistencies(modules: any[]): string[] {
    const inconsistencies: string[] = [];

    modules.forEach(module => {
      // Check for naming convention violations
      if (!module.moduleName.match(/^[A-Z][a-zA-Z0-9]*$/)) {
        inconsistencies.push(`${module.moduleName}: Invalid naming convention`);
      }
    });

    return inconsistencies;
  }

  /**
   * Calculate module registry health score
   */
  private static calculateHealthScore(
    duplicates: number,
    orphaned: number,
    naming: number
  ): number {
    let score = 100;
    
    score -= duplicates * 20; // Duplicates are serious
    score -= orphaned * 10;   // Orphaned components are medium
    score -= naming * 5;      // Naming issues are minor

    return Math.max(0, score);
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(
    duplicates: string[],
    orphaned: string[],
    naming: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (duplicates.length > 0) {
      recommendations.push('Remove or consolidate duplicate modules');
    }

    if (orphaned.length > 0) {
      recommendations.push('Clean up orphaned components');
    }

    if (naming.length > 0) {
      recommendations.push('Fix naming convention violations');
    }

    recommendations.push('Implement automated module validation');
    recommendations.push('Regular module registry maintenance');

    return recommendations;
  }
}
