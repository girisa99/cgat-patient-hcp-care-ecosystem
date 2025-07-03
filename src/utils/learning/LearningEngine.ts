/**
 * Learning Engine for MasterDevelopmentOrchestrator
 * Captures failures, learns patterns, and improves decision-making over time
 */

import { errorManager } from '@/utils/error/ErrorManager';

export interface LearningRecord {
  id: string;
  timestamp: Date;
  context: string;
  failureType: string;
  originalDecision: any;
  failureReason: string;
  correctionApplied: any;
  success: boolean;
  confidence: number;
  metadata: Record<string, any>;
}

export interface LearningPattern {
  patternId: string;
  contextPattern: string;
  failureTypePattern: string;
  occurrenceCount: number;
  successRate: number;
  recommendedCorrection: any;
  confidence: number;
  lastUpdated: Date;
}

export interface LearningInsight {
  type: 'pattern' | 'anomaly' | 'improvement';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  autoApplicable: boolean;
  recommendation: string;
}

class LearningEngine {
  private static instance: LearningEngine;
  private learningRecords: LearningRecord[] = [];
  private learningPatterns: LearningPattern[] = [];
  private maxRecords = 10000;
  private confidenceThreshold = 0.7;

  private constructor() {
    this.loadLearningData();
  }

  static getInstance(): LearningEngine {
    if (!LearningEngine.instance) {
      LearningEngine.instance = new LearningEngine();
    }
    return LearningEngine.instance;
  }

  /**
   * Capture a failure for learning
   */
  captureFailure(
    context: string,
    failureType: string,
    originalDecision: any,
    failureReason: string,
    metadata: Record<string, any> = {}
  ): string {
    const record: LearningRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      context,
      failureType,
      originalDecision,
      failureReason,
      correctionApplied: null,
      success: false,
      confidence: 0,
      metadata
    };

    this.learningRecords.push(record);
    this.pruneRecords();
    this.saveLearningData();

    console.log('🧠 Learning: Captured failure', record);
    
    // Analyze patterns in real-time
    this.analyzePatterns();
    
    return record.id;
  }

  /**
   * Record a successful correction
   */
  recordCorrection(
    recordId: string,
    correctionApplied: any,
    success: boolean,
    confidence: number = 0.8
  ): void {
    const record = this.learningRecords.find(r => r.id === recordId);
    if (record) {
      record.correctionApplied = correctionApplied;
      record.success = success;
      record.confidence = confidence;
      
      console.log('🧠 Learning: Recorded correction', { recordId, success, confidence });
      
      // Update patterns based on new data
      this.updatePatterns(record);
      this.saveLearningData();
    }
  }

  /**
   * Get recommended correction for a context
   */
  getRecommendedCorrection(context: string, failureType: string): any {
    const relevantPatterns = this.learningPatterns.filter(pattern => 
      this.contextMatches(context, pattern.contextPattern) &&
      this.failureTypeMatches(failureType, pattern.failureTypePattern) &&
      pattern.confidence >= this.confidenceThreshold
    );

    if (relevantPatterns.length === 0) {
      console.log('🧠 Learning: No patterns found for', { context, failureType });
      return null;
    }

    // Sort by confidence and success rate
    const bestPattern = relevantPatterns.sort((a, b) => 
      (b.confidence * b.successRate) - (a.confidence * a.successRate)
    )[0];

    console.log('🧠 Learning: Recommending correction from pattern', bestPattern);
    return bestPattern.recommendedCorrection;
  }

  /**
   * Analyze patterns in failures and corrections
   */
  private analyzePatterns(): void {
    const contextGroups = this.groupByContext();
    
    for (const [contextPattern, records] of Object.entries(contextGroups)) {
      const failureTypeGroups = this.groupByFailureType(records);
      
      for (const [failureTypePattern, typeRecords] of Object.entries(failureTypeGroups)) {
        this.updateOrCreatePattern(contextPattern, failureTypePattern, typeRecords);
      }
    }
  }

  /**
   * Update or create learning patterns
   */
  private updateOrCreatePattern(
    contextPattern: string, 
    failureTypePattern: string, 
    records: LearningRecord[]
  ): void {
    let pattern = this.learningPatterns.find(p => 
      p.contextPattern === contextPattern && 
      p.failureTypePattern === failureTypePattern
    );

    const successfulRecords = records.filter(r => r.success && r.correctionApplied);
    const successRate = successfulRecords.length / records.length;

    if (!pattern) {
      pattern = {
        patternId: this.generateId(),
        contextPattern,
        failureTypePattern,
        occurrenceCount: records.length,
        successRate,
        recommendedCorrection: this.extractBestCorrection(successfulRecords),
        confidence: this.calculateConfidence(records),
        lastUpdated: new Date()
      };
      this.learningPatterns.push(pattern);
    } else {
      pattern.occurrenceCount = records.length;
      pattern.successRate = successRate;
      pattern.recommendedCorrection = this.extractBestCorrection(successfulRecords);
      pattern.confidence = this.calculateConfidence(records);
      pattern.lastUpdated = new Date();
    }

    console.log('🧠 Learning: Updated pattern', pattern);
  }

  /**
   * Update patterns based on new correction data
   */
  private updatePatterns(record: LearningRecord): void {
    this.analyzePatterns();
  }

  /**
   * Generate learning insights
   */
  generateInsights(): LearningInsight[] {
    const insights: LearningInsight[] = [];

    // Pattern-based insights
    const highConfidencePatterns = this.learningPatterns.filter(p => p.confidence >= 0.8);
    if (highConfidencePatterns.length > 0) {
      insights.push({
        type: 'pattern',
        description: `Identified ${highConfidencePatterns.length} high-confidence correction patterns`,
        impact: 'high',
        actionable: true,
        autoApplicable: true,
        recommendation: 'Auto-apply corrections for high-confidence patterns'
      });
    }

    // Failure trend insights
    const recentFailures = this.learningRecords.filter(r => 
      Date.now() - r.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    
    if (recentFailures.length > 10) {
      insights.push({
        type: 'anomaly',
        description: `High failure rate: ${recentFailures.length} failures in last 24 hours`,
        impact: 'critical',
        actionable: true,
        autoApplicable: false,
        recommendation: 'Review system configuration and recent changes'
      });
    }

    // Improvement opportunities
    const lowSuccessPatterns = this.learningPatterns.filter(p => p.successRate < 0.5);
    if (lowSuccessPatterns.length > 0) {
      insights.push({
        type: 'improvement',
        description: `${lowSuccessPatterns.length} patterns have low success rates`,
        impact: 'medium',
        actionable: true,
        autoApplicable: false,
        recommendation: 'Review and update correction strategies for these patterns'
      });
    }

    return insights;
  }

  /**
   * Get learning statistics
   */
  getStatistics() {
    const totalRecords = this.learningRecords.length;
    const successfulCorrections = this.learningRecords.filter(r => r.success).length;
    const patternsWithHighConfidence = this.learningPatterns.filter(p => p.confidence >= 0.8).length;
    
    return {
      totalLearningRecords: totalRecords,
      successfulCorrections,
      successRate: totalRecords > 0 ? successfulCorrections / totalRecords : 0,
      identifiedPatterns: this.learningPatterns.length,
      highConfidencePatterns: patternsWithHighConfidence,
      averageConfidence: this.learningPatterns.reduce((sum, p) => sum + p.confidence, 0) / this.learningPatterns.length || 0
    };
  }

  /**
   * Auto-apply high-confidence corrections
   */
  shouldAutoApplyCorrection(context: string, failureType: string): boolean {
    const recommendation = this.getRecommendedCorrection(context, failureType);
    if (!recommendation) return false;

    const pattern = this.learningPatterns.find(p => 
      this.contextMatches(context, p.contextPattern) &&
      this.failureTypeMatches(failureType, p.failureTypePattern)
    );

    return pattern && pattern.confidence >= 0.9 && pattern.successRate >= 0.8;
  }

  // Helper methods
  private groupByContext(): Record<string, LearningRecord[]> {
    const groups: Record<string, LearningRecord[]> = {};
    
    for (const record of this.learningRecords) {
      const pattern = this.extractContextPattern(record.context);
      if (!groups[pattern]) groups[pattern] = [];
      groups[pattern].push(record);
    }
    
    return groups;
  }

  private groupByFailureType(records: LearningRecord[]): Record<string, LearningRecord[]> {
    const groups: Record<string, LearningRecord[]> = {};
    
    for (const record of records) {
      const pattern = this.extractFailureTypePattern(record.failureType);
      if (!groups[pattern]) groups[pattern] = [];
      groups[pattern].push(record);
    }
    
    return groups;
  }

  private extractContextPattern(context: string): string {
    // Simple pattern extraction - can be enhanced with ML
    return context.split('.')[0] || context;
  }

  private extractFailureTypePattern(failureType: string): string {
    // Simple pattern extraction - can be enhanced with ML
    return failureType.toLowerCase().replace(/[0-9]/g, '');
  }

  private contextMatches(context: string, pattern: string): boolean {
    return this.extractContextPattern(context) === pattern;
  }

  private failureTypeMatches(failureType: string, pattern: string): boolean {
    return this.extractFailureTypePattern(failureType) === pattern;
  }

  private extractBestCorrection(successfulRecords: LearningRecord[]): any {
    if (successfulRecords.length === 0) return null;
    
    // Find the most common successful correction
    const corrections = successfulRecords.map(r => r.correctionApplied);
    return corrections[0]; // Simplified - can use mode calculation
  }

  private calculateConfidence(records: LearningRecord[]): number {
    if (records.length < 3) return 0.3; // Low confidence for small samples
    
    const successfulRecords = records.filter(r => r.success);
    const baseConfidence = successfulRecords.length / records.length;
    
    // Boost confidence with more data points
    const dataBoost = Math.min(records.length / 10, 1) * 0.2;
    
    return Math.min(baseConfidence + dataBoost, 1);
  }

  private pruneRecords(): void {
    if (this.learningRecords.length > this.maxRecords) {
      this.learningRecords = this.learningRecords
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.maxRecords);
    }
  }

  private generateId(): string {
    return `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveLearningData(): void {
    try {
      localStorage.setItem('learning_records', JSON.stringify(this.learningRecords));
      localStorage.setItem('learning_patterns', JSON.stringify(this.learningPatterns));
    } catch (error) {
      console.error('Failed to save learning data:', error);
    }
  }

  private loadLearningData(): void {
    try {
      const records = localStorage.getItem('learning_records');
      const patterns = localStorage.getItem('learning_patterns');
      
      if (records) {
        this.learningRecords = JSON.parse(records).map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }));
      }
      
      if (patterns) {
        this.learningPatterns = JSON.parse(patterns).map((p: any) => ({
          ...p,
          lastUpdated: new Date(p.lastUpdated)
        }));
      }
    } catch (error) {
      console.error('Failed to load learning data:', error);
    }
  }
}

export const learningEngine = LearningEngine.getInstance();