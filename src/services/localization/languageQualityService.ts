/**
 * Language Quality Metrics Service
 * P4-LANG-10/11: Translation/TTS quality tracking per language
 * 
 * Tracks:
 * - Translation accuracy scores
 * - TTS naturalness ratings
 * - User feedback per language
 * - Quality trends over time
 */

import { type RegionalCode } from '@/config/genie-sitemap';

export interface LanguageQualityMetrics {
  languageCode: RegionalCode;
  translationAccuracy: number; // 0-100
  ttsNaturalness: number; // 0-100
  userSatisfaction: number; // 0-100
  sampleCount: number;
  lastUpdated: string;
  qualityTrend: 'improving' | 'stable' | 'declining';
  issues: QualityIssue[];
}

export interface QualityIssue {
  id: string;
  type: 'translation' | 'tts' | 'cultural' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedPipelines: string[];
  reportedAt: string;
  resolvedAt?: string;
}

export interface DialectQuality {
  dialectCode: string;
  dialectName: string;
  parentLanguage: RegionalCode;
  supportLevel: 'full' | 'partial' | 'experimental';
  accuracy: number;
  nativeReviewers: number;
}

export interface QualityFeedback {
  id: string;
  userId?: string;
  languageCode: RegionalCode;
  dialectCode?: string;
  pipelineId: string;
  contentType: 'translation' | 'tts' | 'transcreation';
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  originalContent?: string;
  generatedContent?: string;
  timestamp: string;
}

// 6-Zone routing quality baselines
const ZONE_QUALITY_BASELINES: Record<string, number> = {
  claude_zone: 95,      // West/EU - Claude
  alibaba_zone: 92,     // CJK - Alibaba/CosyVoice
  arabic_zone: 90,      // MENA - Azure Neural
  gemini_zone: 88,      // India/SEA - Gemini
  africa_zone: 82,      // Africa - Specialized
  fallback_zone: 75,    // DeepSeek/NLLB
};

// Language to zone mapping
const LANGUAGE_ZONE_MAP: Record<RegionalCode, string> = {
  en: 'claude_zone',
  fr: 'claude_zone',
  de: 'claude_zone',
  es: 'claude_zone',
  pt: 'claude_zone',
  zh: 'alibaba_zone',
  ja: 'alibaba_zone',
  ko: 'alibaba_zone',
  ar: 'arabic_zone',
  hi: 'gemini_zone',
  id: 'gemini_zone',
  vi: 'gemini_zone',
  ru: 'gemini_zone',
  tr: 'gemini_zone',
};

class LanguageQualityService {
  private metricsCache: Map<RegionalCode, LanguageQualityMetrics> = new Map();
  private feedbackQueue: QualityFeedback[] = [];
  private dialectMetrics: Map<string, DialectQuality> = new Map();

  constructor() {
    this.initializeBaselines();
    this.loadPersistedMetrics();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeBaselines(): void {
    const languages: RegionalCode[] = ['en', 'ar', 'zh', 'hi', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'ru', 'tr', 'id', 'vi'];
    
    languages.forEach(code => {
      const zone = LANGUAGE_ZONE_MAP[code];
      const baseline = ZONE_QUALITY_BASELINES[zone] || 75;
      
      this.metricsCache.set(code, {
        languageCode: code,
        translationAccuracy: baseline,
        ttsNaturalness: baseline - 5, // TTS slightly lower
        userSatisfaction: baseline - 3,
        sampleCount: 0,
        lastUpdated: new Date().toISOString(),
        qualityTrend: 'stable',
        issues: [],
      });
    });

    // Initialize dialect metrics
    this.initializeDialects();
  }

  private initializeDialects(): void {
    // Arabic dialects
    const arabicDialects = [
      { code: 'ar-SA', name: 'Saudi Gulf', accuracy: 92 },
      { code: 'ar-EG', name: 'Egyptian', accuracy: 90 },
      { code: 'ar-AE', name: 'Emirati', accuracy: 88 },
      { code: 'ar-MA', name: 'Moroccan', accuracy: 82 },
      { code: 'ar-LB', name: 'Levantine', accuracy: 85 },
      { code: 'ar-IQ', name: 'Iraqi', accuracy: 80 },
      { code: 'ar-SD', name: 'Sudanese', accuracy: 75 },
    ];

    arabicDialects.forEach(d => {
      this.dialectMetrics.set(d.code, {
        dialectCode: d.code,
        dialectName: d.name,
        parentLanguage: 'ar',
        supportLevel: d.accuracy >= 85 ? 'full' : d.accuracy >= 75 ? 'partial' : 'experimental',
        accuracy: d.accuracy,
        nativeReviewers: Math.floor(d.accuracy / 10),
      });
    });

    // Indian languages
    const indianDialects = [
      { code: 'hi-IN', name: 'Hindi', accuracy: 90 },
      { code: 'bn-IN', name: 'Bengali', accuracy: 85 },
      { code: 'ta-IN', name: 'Tamil', accuracy: 83 },
      { code: 'te-IN', name: 'Telugu', accuracy: 82 },
      { code: 'mr-IN', name: 'Marathi', accuracy: 80 },
      { code: 'gu-IN', name: 'Gujarati', accuracy: 78 },
      { code: 'kn-IN', name: 'Kannada', accuracy: 77 },
      { code: 'ml-IN', name: 'Malayalam', accuracy: 76 },
      { code: 'pa-IN', name: 'Punjabi', accuracy: 79 },
    ];

    indianDialects.forEach(d => {
      this.dialectMetrics.set(d.code, {
        dialectCode: d.code,
        dialectName: d.name,
        parentLanguage: 'hi',
        supportLevel: d.accuracy >= 85 ? 'full' : d.accuracy >= 75 ? 'partial' : 'experimental',
        accuracy: d.accuracy,
        nativeReviewers: Math.floor(d.accuracy / 15),
      });
    });

    // African languages
    const africanDialects = [
      { code: 'sw-KE', name: 'Swahili', accuracy: 78 },
      { code: 'am-ET', name: 'Amharic', accuracy: 72 },
      { code: 'ha-NG', name: 'Hausa', accuracy: 70 },
      { code: 'yo-NG', name: 'Yoruba', accuracy: 68 },
      { code: 'ig-NG', name: 'Igbo', accuracy: 65 },
      { code: 'zu-ZA', name: 'Zulu', accuracy: 73 },
      { code: 'xh-ZA', name: 'Xhosa', accuracy: 71 },
      { code: 'af-ZA', name: 'Afrikaans', accuracy: 88 },
    ];

    africanDialects.forEach(d => {
      this.dialectMetrics.set(d.code, {
        dialectCode: d.code,
        dialectName: d.name,
        parentLanguage: 'en', // Using English as parent for routing
        supportLevel: d.accuracy >= 75 ? 'partial' : 'experimental',
        accuracy: d.accuracy,
        nativeReviewers: Math.floor(d.accuracy / 20),
      });
    });
  }

  private loadPersistedMetrics(): void {
    try {
      const stored = localStorage.getItem('language_quality_metrics');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([code, metrics]) => {
          this.metricsCache.set(code as RegionalCode, metrics as LanguageQualityMetrics);
        });
      }
    } catch (e) {
      console.warn('[LanguageQuality] Failed to load persisted metrics:', e);
    }
  }

  private persistMetrics(): void {
    try {
      const data = Object.fromEntries(this.metricsCache);
      localStorage.setItem('language_quality_metrics', JSON.stringify(data));
    } catch (e) {
      console.warn('[LanguageQuality] Failed to persist metrics:', e);
    }
  }

  // ============================================================================
  // QUALITY METRICS
  // ============================================================================

  getQualityMetrics(languageCode: RegionalCode): LanguageQualityMetrics | null {
    return this.metricsCache.get(languageCode) || null;
  }

  getAllMetrics(): LanguageQualityMetrics[] {
    return Array.from(this.metricsCache.values());
  }

  getDialectMetrics(dialectCode: string): DialectQuality | null {
    return this.dialectMetrics.get(dialectCode) || null;
  }

  getAllDialects(parentLanguage?: RegionalCode): DialectQuality[] {
    const all = Array.from(this.dialectMetrics.values());
    return parentLanguage ? all.filter(d => d.parentLanguage === parentLanguage) : all;
  }

  getQualitySummary(): {
    averageAccuracy: number;
    averageNaturalness: number;
    averageSatisfaction: number;
    languagesAboveThreshold: number;
    criticalIssues: number;
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    const metrics = this.getAllMetrics();
    if (metrics.length === 0) {
      return {
        averageAccuracy: 0,
        averageNaturalness: 0,
        averageSatisfaction: 0,
        languagesAboveThreshold: 0,
        criticalIssues: 0,
        overallHealth: 'poor',
      };
    }

    const avgAccuracy = metrics.reduce((sum, m) => sum + m.translationAccuracy, 0) / metrics.length;
    const avgNaturalness = metrics.reduce((sum, m) => sum + m.ttsNaturalness, 0) / metrics.length;
    const avgSatisfaction = metrics.reduce((sum, m) => sum + m.userSatisfaction, 0) / metrics.length;
    const aboveThreshold = metrics.filter(m => m.translationAccuracy >= 80).length;
    const criticalIssues = metrics.reduce((sum, m) => 
      sum + m.issues.filter(i => i.severity === 'critical' && !i.resolvedAt).length, 0
    );

    const overallScore = (avgAccuracy + avgNaturalness + avgSatisfaction) / 3;
    const overallHealth = overallScore >= 90 ? 'excellent' : 
                          overallScore >= 80 ? 'good' : 
                          overallScore >= 70 ? 'fair' : 'poor';

    return {
      averageAccuracy: Math.round(avgAccuracy * 10) / 10,
      averageNaturalness: Math.round(avgNaturalness * 10) / 10,
      averageSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      languagesAboveThreshold: aboveThreshold,
      criticalIssues,
      overallHealth,
    };
  }

  // ============================================================================
  // FEEDBACK COLLECTION
  // ============================================================================

  submitFeedback(feedback: Omit<QualityFeedback, 'id' | 'timestamp'>): void {
    const fullFeedback: QualityFeedback = {
      ...feedback,
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };

    this.feedbackQueue.push(fullFeedback);

    // Update metrics based on feedback
    this.updateMetricsFromFeedback(fullFeedback);

    // Persist feedback
    this.persistFeedback();

    console.info(`[LanguageQuality] Feedback submitted for ${feedback.languageCode}:`, feedback.rating);
  }

  private updateMetricsFromFeedback(feedback: QualityFeedback): void {
    const metrics = this.metricsCache.get(feedback.languageCode);
    if (!metrics) return;

    const weight = 0.1; // New feedback contributes 10% to rolling average
    const normalizedRating = (feedback.rating / 5) * 100;

    switch (feedback.contentType) {
      case 'translation':
        metrics.translationAccuracy = metrics.translationAccuracy * (1 - weight) + normalizedRating * weight;
        break;
      case 'tts':
        metrics.ttsNaturalness = metrics.ttsNaturalness * (1 - weight) + normalizedRating * weight;
        break;
      case 'transcreation':
        // Affects both
        metrics.translationAccuracy = metrics.translationAccuracy * (1 - weight) + normalizedRating * weight;
        metrics.userSatisfaction = metrics.userSatisfaction * (1 - weight) + normalizedRating * weight;
        break;
    }

    metrics.sampleCount++;
    metrics.lastUpdated = new Date().toISOString();

    // Update trend
    if (metrics.sampleCount > 10) {
      const recentAvg = this.feedbackQueue
        .filter(f => f.languageCode === feedback.languageCode)
        .slice(-10)
        .reduce((sum, f) => sum + f.rating, 0) / 10;

      const historicalAvg = (metrics.translationAccuracy + metrics.ttsNaturalness + metrics.userSatisfaction) / 3 / 20;

      metrics.qualityTrend = recentAvg > historicalAvg + 0.3 ? 'improving' :
                            recentAvg < historicalAvg - 0.3 ? 'declining' : 'stable';
    }

    this.persistMetrics();
  }

  private persistFeedback(): void {
    try {
      // Keep last 1000 feedback items
      const recent = this.feedbackQueue.slice(-1000);
      localStorage.setItem('language_quality_feedback', JSON.stringify(recent));
    } catch (e) {
      console.warn('[LanguageQuality] Failed to persist feedback:', e);
    }
  }

  getFeedbackStats(languageCode?: RegionalCode): {
    totalFeedback: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    byContentType: Record<string, number>;
  } {
    const filtered = languageCode 
      ? this.feedbackQueue.filter(f => f.languageCode === languageCode)
      : this.feedbackQueue;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const byContentType: Record<string, number> = { translation: 0, tts: 0, transcreation: 0 };

    filtered.forEach(f => {
      ratingDistribution[f.rating]++;
      byContentType[f.contentType]++;
    });

    const avgRating = filtered.length > 0 
      ? filtered.reduce((sum, f) => sum + f.rating, 0) / filtered.length
      : 0;

    return {
      totalFeedback: filtered.length,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingDistribution,
      byContentType,
    };
  }

  // ============================================================================
  // ISSUE TRACKING
  // ============================================================================

  reportIssue(
    languageCode: RegionalCode,
    issue: Omit<QualityIssue, 'id' | 'reportedAt'>
  ): string {
    const metrics = this.metricsCache.get(languageCode);
    if (!metrics) return '';

    const fullIssue: QualityIssue = {
      ...issue,
      id: `issue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      reportedAt: new Date().toISOString(),
    };

    metrics.issues.push(fullIssue);
    this.persistMetrics();

    console.warn(`[LanguageQuality] Issue reported for ${languageCode}:`, issue.description);
    return fullIssue.id;
  }

  resolveIssue(languageCode: RegionalCode, issueId: string): boolean {
    const metrics = this.metricsCache.get(languageCode);
    if (!metrics) return false;

    const issue = metrics.issues.find(i => i.id === issueId);
    if (!issue) return false;

    issue.resolvedAt = new Date().toISOString();
    this.persistMetrics();
    return true;
  }

  getActiveIssues(severityFilter?: QualityIssue['severity']): QualityIssue[] {
    const allIssues = this.getAllMetrics().flatMap(m => m.issues);
    return allIssues.filter(i => 
      !i.resolvedAt && 
      (!severityFilter || i.severity === severityFilter)
    );
  }
}

// Singleton
export const languageQualityService = new LanguageQualityService();
