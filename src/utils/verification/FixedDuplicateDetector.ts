
/**
 * Fixed Duplicate Detector
 * Consistent naming conventions applied throughout
 */

export interface DuplicateEntry {
  id: string;
  content: string;
  source: string;
  location: string;
  similarity: number;
}

export interface DuplicateGroup {
  entries: DuplicateEntry[];
  totalDuplicates: number;
  similarityScore: number;
}

export interface DuplicateDetectionResult {
  duplicateGroups: DuplicateGroup[];
  totalDuplicateCount: number;
  duplicatePercentage: number;
  recommendations: string[];
}

export class FixedDuplicateDetector {
  private readonly similarityThreshold: number = 0.8;
  private readonly minimumLength: number = 50;

  /**
   * Detect duplicates in code content
   */
  async detectDuplicates(codeContent: string[]): Promise<DuplicateDetectionResult> {
    const duplicateEntries = this.findDuplicateEntries(codeContent);
    const duplicateGroups = this.groupDuplicateEntries(duplicateEntries);
    const recommendations = this.generateRecommendations(duplicateGroups);

    return {
      duplicateGroups,
      totalDuplicateCount: duplicateEntries.length,
      duplicatePercentage: this.calculateDuplicatePercentage(duplicateEntries, codeContent),
      recommendations
    };
  }

  /**
   * Find duplicate entries using consistent naming
   */
  private findDuplicateEntries(codeContent: string[]): DuplicateEntry[] {
    const duplicateEntries: DuplicateEntry[] = [];
    
    for (let i = 0; i < codeContent.length; i++) {
      for (let j = i + 1; j < codeContent.length; j++) {
        const similarityScore = this.calculateSimilarityScore(codeContent[i], codeContent[j]);
        
        if (similarityScore >= this.similarityThreshold && 
            codeContent[i].length >= this.minimumLength) {
          
          duplicateEntries.push({
            id: `duplicate_${i}_${j}`,
            content: codeContent[i],
            source: `Content block ${i}`,
            location: `Position ${i}`,
            similarity: similarityScore
          });
        }
      }
    }

    return duplicateEntries;
  }

  /**
   * Group duplicate entries by similarity
   */
  private groupDuplicateEntries(duplicateEntries: DuplicateEntry[]): DuplicateGroup[] {
    const duplicateGroups: DuplicateGroup[] = [];
    const processedEntries = new Set<string>();

    duplicateEntries.forEach(entry => {
      if (!processedEntries.has(entry.id)) {
        const similarEntries = duplicateEntries.filter(otherEntry =>
          !processedEntries.has(otherEntry.id) &&
          this.calculateSimilarityScore(entry.content, otherEntry.content) >= this.similarityThreshold
        );

        if (similarEntries.length > 0) {
          duplicateGroups.push({
            entries: similarEntries,
            totalDuplicates: similarEntries.length,
            similarityScore: this.calculateAverageSimilarity(similarEntries)
          });

          similarEntries.forEach(similarEntry => {
            processedEntries.add(similarEntry.id);
          });
        }
      }
    });

    return duplicateGroups;
  }

  /**
   * Calculate similarity score between two strings
   */
  private calculateSimilarityScore(stringA: string, stringB: string): number {
    const longerString = stringA.length > stringB.length ? stringA : stringB;
    const shorterString = stringA.length > stringB.length ? stringB : stringA;
    
    if (longerString.length === 0) return 1.0;
    
    const editDistance = this.calculateEditDistance(longerString, shorterString);
    return (longerString.length - editDistance) / longerString.length;
  }

  /**
   * Calculate edit distance using consistent naming
   */
  private calculateEditDistance(stringA: string, stringB: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= stringB.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= stringA.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= stringB.length; i++) {
      for (let j = 1; j <= stringA.length; j++) {
        if (stringB.charAt(i - 1) === stringA.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[stringB.length][stringA.length];
  }

  /**
   * Calculate average similarity score
   */
  private calculateAverageSimilarity(duplicateEntries: DuplicateEntry[]): number {
    if (duplicateEntries.length === 0) return 0;
    
    const totalSimilarity = duplicateEntries.reduce((sum, entry) => sum + entry.similarity, 0);
    return totalSimilarity / duplicateEntries.length;
  }

  /**
   * Calculate duplicate percentage
   */
  private calculateDuplicatePercentage(duplicateEntries: DuplicateEntry[], codeContent: string[]): number {
    if (codeContent.length === 0) return 0;
    return (duplicateEntries.length / codeContent.length) * 100;
  }

  /**
   * Generate recommendations for duplicate removal
   */
  private generateRecommendations(duplicateGroups: DuplicateGroup[]): string[] {
    const recommendations: string[] = [];

    if (duplicateGroups.length > 0) {
      recommendations.push('Extract common code patterns into reusable utility functions');
      recommendations.push('Create shared components for repeated UI elements');
      recommendations.push('Use inheritance or composition to reduce code duplication');
      recommendations.push('Consider implementing a factory pattern for similar object creation');
    }

    return recommendations;
  }
}

export const fixedDuplicateDetector = new FixedDuplicateDetector();
