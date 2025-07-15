
/**
 * Duplicate Detector
 * Integration with stability framework for duplicate detection
 */

import { DuplicateAnalyzer } from '../../../stability-framework/core/duplicate-analyzer.js';

export interface DuplicateStats {
  totalDuplicates: number;
  components: number;
  services: number;
  types: number;
}

export class DuplicateDetector {
  private analyzer: DuplicateAnalyzer;

  constructor() {
    this.analyzer = new DuplicateAnalyzer();
  }

  getDuplicateStats(): DuplicateStats {
    console.log('🔍 Getting duplicate stats...');
    
    const stats = this.analyzer.getStats();
    
    return {
      totalDuplicates: stats.totalDuplicates,
      components: stats.components,
      services: stats.services,
      types: stats.types
    };
  }

  async analyzeComponent(name: string, metadata: any) {
    return await this.analyzer.analyzeComponent(name, metadata);
  }

  async analyzeService(name: string, metadata: any) {
    return await this.analyzer.analyzeService(name, metadata);
  }

  generateReport() {
    return this.analyzer.generateReport();
  }

  clear() {
    this.analyzer.clear();
  }
}
