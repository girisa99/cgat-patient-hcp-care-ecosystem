/**
 * Text Input Adapter
 * 
 * Handles plain text and prompt input processing.
 */

import { v4 as uuidv4 } from 'uuid';
import type { InputAdapter, RawInput, StandardizedInput, ProcessingOptions } from '../types';

export const textAdapter: InputAdapter = {
  type: 'text',
  supportedMimeTypes: ['text/plain', 'text/markdown', 'text/html'],

  canHandle(input: RawInput): boolean {
    return input.type === 'text' || typeof input.source === 'string';
  },

  validate(input: RawInput) {
    const errors: string[] = [];
    
    if (typeof input.source !== 'string') {
      errors.push('Text input must be a string');
    } else if (input.source.trim().length === 0) {
      errors.push('Text input cannot be empty');
    } else if (input.source.length > 100000) {
      errors.push('Text input exceeds maximum length (100,000 characters)');
    }
    
    return { valid: errors.length === 0, errors };
  },

  async process(input: RawInput, options?: ProcessingOptions): Promise<StandardizedInput> {
    const text = input.source as string;
    const startTime = new Date();
    
    // Basic text analysis
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const paragraphs = text.split(/\n\n+/).filter(Boolean);
    
    // Extract headings (markdown style)
    const headings = text.match(/^#{1,6}\s+.+$/gm)?.map(h => ({
      level: h.match(/^#+/)?.[0].length || 1,
      text: h.replace(/^#+\s+/, '')
    })) || [];
    
    // Extract lists
    const listMatches = text.match(/^[-*]\s+.+$/gm) || [];
    const lists = listMatches.length > 0 ? [listMatches.map(l => l.replace(/^[-*]\s+/, ''))] : [];
    
    // Detect language (simple heuristic)
    const languageCode = detectLanguage(text);
    
    // Analyze content type
    const contentType = analyzeContentType(text);
    
    // Extract keywords
    const keywords = extractKeywords(text);
    
    // Calculate reading time (avg 200 wpm)
    const readingTime = Math.ceil(wordCount / 200);
    
    // Determine complexity
    const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
    const complexity = avgWordsPerSentence > 25 ? 'complex' : 
                       avgWordsPerSentence > 15 ? 'moderate' : 'simple';

    const result: StandardizedInput = {
      id: uuidv4(),
      type: 'text',
      mode: options?.mode || 'auto',
      raw: {
        source: text,
        mimeType: 'text/plain'
      },
      content: {
        text,
        markdown: text,
        headings,
        lists
      },
      metadata: {
        fileSize: new Blob([text]).size,
        mimeType: 'text/plain'
      },
      analysis: options?.skipAnalysis ? undefined : {
        language: {
          code: languageCode,
          name: getLanguageName(languageCode),
          confidence: 0.85
        },
        contentType: {
          primary: contentType,
          confidence: 0.7
        },
        sentiment: 'neutral',
        tone: ['professional'],
        entities: [],
        topics: keywords.slice(0, 5),
        keywords,
        wordCount,
        readingTime,
        complexity: complexity as 'simple' | 'moderate' | 'complex'
      },
      compatibility: generateCompatibilityHints(text, contentType, keywords),
      processing: {
        status: 'complete',
        startedAt: startTime,
        completedAt: new Date(),
        duration: Date.now() - startTime.getTime()
      },
      createdAt: startTime,
      updatedAt: new Date()
    };

    return result;
  }
};

// Helper functions
function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  const cjkPattern = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
  const arabicPattern = /[\u0600-\u06ff]/;
  const cyrillicPattern = /[\u0400-\u04ff]/;
  
  if (cjkPattern.test(text)) {
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
    if (/[\uac00-\ud7af]/.test(text)) return 'ko';
    return 'zh';
  }
  if (arabicPattern.test(text)) return 'ar';
  if (cyrillicPattern.test(text)) return 'ru';
  
  return 'en';
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: 'English', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
    ar: 'Arabic', ru: 'Russian', es: 'Spanish', fr: 'French',
    de: 'German', pt: 'Portuguese', it: 'Italian', hi: 'Hindi'
  };
  return names[code] || 'Unknown';
}

function analyzeContentType(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (/\b(revenue|profit|roi|market share|forecast|budget)\b/.test(lowerText)) return 'financial';
  if (/\b(patient|clinical|treatment|diagnosis|healthcare)\b/.test(lowerText)) return 'healthcare';
  if (/\b(api|code|function|algorithm|database|software)\b/.test(lowerText)) return 'technical';
  if (/\b(campaign|brand|audience|engagement|conversion)\b/.test(lowerText)) return 'marketing';
  if (/\b(learn|course|training|education|student)\b/.test(lowerText)) return 'educational';
  if (/\b(strategy|growth|competitive|market|opportunity)\b/.test(lowerText)) return 'business';
  
  return 'general';
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4);
  
  const frequency: Record<string, number> = {};
  const stopWords = new Set(['about', 'above', 'after', 'again', 'against', 'being', 'below', 
    'between', 'could', 'during', 'every', 'first', 'from', 'have', 'into', 'just', 'other',
    'should', 'their', 'there', 'these', 'thing', 'those', 'through', 'under', 'using',
    'very', 'where', 'which', 'while', 'would', 'your']);
  
  words.forEach(word => {
    if (!stopWords.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function generateCompatibilityHints(text: string, contentType: string, keywords: string[]) {
  const lowerText = text.toLowerCase();
  
  // Industry suggestions based on content
  const industries: StandardizedInput['compatibility']['industries'] = [];
  
  if (/\b(patient|clinical|hospital|medical|pharma)\b/.test(lowerText)) {
    industries.push({ id: 'healthcare', name: 'Healthcare', confidence: 0.9, reason: 'Medical terminology detected' });
  }
  if (/\b(saas|software|api|cloud|platform)\b/.test(lowerText)) {
    industries.push({ id: 'technology', name: 'Technology', confidence: 0.85, reason: 'Tech keywords found' });
  }
  if (/\b(revenue|investment|portfolio|finance|banking)\b/.test(lowerText)) {
    industries.push({ id: 'finance', name: 'Finance', confidence: 0.85, reason: 'Financial terms detected' });
  }
  
  // Framework suggestions
  const frameworks: StandardizedInput['compatibility']['frameworks'] = [];
  
  if (/\b(strength|weakness|opportunity|threat)\b/.test(lowerText)) {
    frameworks.push({ id: 'swot', name: 'SWOT Analysis', confidence: 0.95, reason: 'SWOT keywords detected' });
  }
  if (/\b(competitor|market share|rivalry)\b/.test(lowerText)) {
    frameworks.push({ id: 'porter-five', name: "Porter's Five Forces", confidence: 0.8, reason: 'Competitive analysis content' });
  }
  if (/\b(pitch|investor|funding|startup)\b/.test(lowerText)) {
    frameworks.push({ id: 'lean-startup', name: 'Lean Startup', confidence: 0.85, reason: 'Startup/pitch content detected' });
  }
  
  // Visual feature suggestions
  const visualFeatures: StandardizedInput['compatibility']['visualFeatures'] = [];
  
  if (/\b(data|chart|graph|metric|percentage)\b/.test(lowerText)) {
    visualFeatures.push({ id: 'charts', name: 'Charts & Graphs', confidence: 0.9, reason: 'Data-driven content' });
  }
  if (/\b(timeline|roadmap|phase|milestone)\b/.test(lowerText)) {
    visualFeatures.push({ id: 'timelines', name: 'Timelines', confidence: 0.85, reason: 'Timeline references found' });
  }
  if (/\b(journey|process|flow|step)\b/.test(lowerText)) {
    visualFeatures.push({ id: 'journey-maps', name: 'Journey Maps', confidence: 0.8, reason: 'Process/journey content' });
  }
  
  // Output format suggestions
  const outputFormats: StandardizedInput['compatibility']['outputFormats'] = [];
  
  outputFormats.push({ id: 'pptx-export', name: 'PowerPoint', confidence: 0.9, reason: 'Standard presentation format' });
  outputFormats.push({ id: 'pdf-export', name: 'PDF', confidence: 0.85, reason: 'Universal document format' });
  
  if (/\b(demo|video|animation)\b/.test(lowerText)) {
    outputFormats.push({ id: 'video-short', name: 'Short Video', confidence: 0.75, reason: 'Video-related content' });
  }
  
  return {
    industries,
    frameworks,
    visualFeatures,
    outputFormats,
    templates: [],
    warnings: []
  };
}

export default textAdapter;
