
/**
 * Duplicate Detector
 * Integration with stability framework for duplicate detection
 */

// Removed broken import - stability framework is internal

export interface DuplicateStats {
  totalDuplicates: number;
  components: number;
  services: number;
  types: number;
}

export class DuplicateDetector {
  private duplicates: Map<string, number> = new Map();

  constructor() {
    // Internal duplicate tracking
  }

  getDuplicateStats(): DuplicateStats {
    console.log('🔍 Enhanced duplicate analysis for framework compliance...');
    
    // Enhanced analysis with categorization
    let componentDuplicates = 0;
    let serviceDuplicates = 0;
    let typeDuplicates = 0;

    this.duplicates.forEach((count, name) => {
      if (count > 1) {
        if (name.includes('Component') || name.includes('component')) {
          componentDuplicates++;
        } else if (name.includes('Service') || name.includes('service')) {
          serviceDuplicates++;
        } else if (name.includes('Type') || name.includes('type') || name.includes('Interface')) {
          typeDuplicates++;
        }
      }
    });
    
    return {
      totalDuplicates: this.duplicates.size,
      components: componentDuplicates,
      services: serviceDuplicates,
      types: typeDuplicates
    };
  }

  async analyzeComponent(name: string, metadata: any) {
    this.duplicates.set(name, (this.duplicates.get(name) || 0) + 1);
    return { name, duplicateCount: this.duplicates.get(name) };
  }

  async analyzeService(name: string, metadata: any) {
    this.duplicates.set(name, (this.duplicates.get(name) || 0) + 1);
    return { name, duplicateCount: this.duplicates.get(name) };
  }

  generateReport() {
    return Array.from(this.duplicates.entries()).map(([name, count]) => ({
      name,
      duplicateCount: count,
      severity: count > 1 ? 'warning' : 'info'
    }));
  }

  clear() {
    this.duplicates.clear();
  }
}
