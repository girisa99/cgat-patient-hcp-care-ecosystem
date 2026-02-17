/**
 * URL Input Adapter
 * 
 * Handles URL/web content import using the crawl-relevant-content edge function.
 */

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import type { InputAdapter, RawInput, StandardizedInput, ProcessingOptions } from '../types';

export const urlAdapter: InputAdapter = {
  type: 'url',
  supportedMimeTypes: [],

  canHandle(input: RawInput): boolean {
    if (input.type === 'url') return true;
    if (typeof input.source === 'string') {
      return isValidUrl(input.source);
    }
    return false;
  },

  validate(input: RawInput) {
    const errors: string[] = [];
    
    if (typeof input.source !== 'string') {
      errors.push('URL input must be a string');
    } else if (!isValidUrl(input.source)) {
      errors.push('Invalid URL format');
    }
    
    return { valid: errors.length === 0, errors };
  },

  async process(input: RawInput, options?: ProcessingOptions): Promise<StandardizedInput> {
    const url = input.source as string;
    const startTime = new Date();
    
    options?.onProgress?.(20, 'Fetching URL...');
    
    // Call crawl edge function
    const { data, error } = await supabase.functions.invoke('crawl-relevant-content', {
      body: {
        url,
        options: {
          extractImages: options?.extractImages ?? true,
          maxDepth: 1
        }
      }
    });
    
    if (error) {
      throw new Error(`URL crawl failed: ${error.message}`);
    }
    
    options?.onProgress?.(60, 'Analyzing content...');
    
    const extractedText = data?.content || data?.text || '';
    const markdown = data?.markdown || extractedText;
    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    
    // Parse domain for industry hints
    const domain = new URL(url).hostname;
    const compatibility = generateUrlCompatibility(extractedText, domain, data?.title);
    
    options?.onProgress?.(100, 'Complete');
    
    return {
      id: uuidv4(),
      type: 'url',
      mode: options?.mode || 'auto',
      raw: {
        source: url,
        mimeType: 'text/html'
      },
      content: {
        text: extractedText,
        markdown,
        images: data?.images?.map((img: string) => ({ url: img })) || [],
        headings: data?.headings || []
      },
      metadata: {
        fileSize: new Blob([extractedText]).size,
        mimeType: 'text/html',
        url,
        domain,
        title: data?.title,
        description: data?.description,
        ogImage: data?.ogImage
      },
      analysis: options?.skipAnalysis ? undefined : {
        language: { code: data?.language || 'en', name: 'English', confidence: 0.9 },
        contentType: { primary: inferContentType(url, extractedText), confidence: 0.8 },
        sentiment: 'neutral',
        tone: ['informative'],
        entities: data?.entities || [],
        topics: data?.topics || [],
        keywords: data?.keywords || extractKeywords(extractedText),
        wordCount,
        readingTime: Math.ceil(wordCount / 200),
        complexity: wordCount > 3000 ? 'complex' : wordCount > 1000 ? 'moderate' : 'simple'
      },
      compatibility,
      processing: {
        status: 'complete',
        startedAt: startTime,
        completedAt: new Date(),
        duration: Date.now() - startTime.getTime(),
        provider: 'crawl-relevant-content'
      },
      createdAt: startTime,
      updatedAt: new Date()
    };
  }
};

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function inferContentType(url: string, text: string): string {
  const lowerUrl = url.toLowerCase();
  const lowerText = text.toLowerCase();
  
  if (lowerUrl.includes('blog') || lowerUrl.includes('article')) return 'blog';
  if (lowerUrl.includes('docs') || lowerUrl.includes('documentation')) return 'documentation';
  if (lowerUrl.includes('product') || lowerUrl.includes('pricing')) return 'product';
  if (lowerUrl.includes('news') || lowerUrl.includes('press')) return 'news';
  
  if (/\b(tutorial|how to|guide|learn)\b/.test(lowerText)) return 'educational';
  if (/\b(api|sdk|code|developer)\b/.test(lowerText)) return 'technical';
  
  return 'web-content';
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4);
  
  const frequency: Record<string, number> = {};
  const stopWords = new Set(['about', 'above', 'after', 'again', 'against', 'being', 'below',
    'between', 'could', 'during', 'every', 'first', 'from', 'have', 'into', 'just', 'other',
    'should', 'their', 'there', 'these', 'thing', 'those', 'through', 'under', 'using',
    'where', 'which', 'while', 'would', 'your', 'https', 'http', 'www']);
  
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

function generateUrlCompatibility(text: string, domain: string, title?: string) {
  const lowerText = text.toLowerCase();
  const lowerDomain = domain.toLowerCase();
  
  const industries: StandardizedInput['compatibility']['industries'] = [];
  const frameworks: StandardizedInput['compatibility']['frameworks'] = [];
  const visualFeatures: StandardizedInput['compatibility']['visualFeatures'] = [];
  const outputFormats: StandardizedInput['compatibility']['outputFormats'] = [];
  
  // Industry detection from domain
  if (lowerDomain.includes('health') || lowerDomain.includes('med')) {
    industries.push({ id: 'healthcare', name: 'Healthcare', confidence: 0.85, reason: 'Healthcare domain' });
  }
  if (lowerDomain.includes('tech') || lowerDomain.includes('software')) {
    industries.push({ id: 'technology', name: 'Technology', confidence: 0.85, reason: 'Tech domain' });
  }
  if (lowerDomain.includes('finance') || lowerDomain.includes('bank')) {
    industries.push({ id: 'finance', name: 'Finance', confidence: 0.85, reason: 'Finance domain' });
  }
  
  // Content-based detection
  if (/\b(saas|api|cloud|platform)\b/.test(lowerText)) {
    industries.push({ id: 'saas', name: 'SaaS', confidence: 0.8, reason: 'SaaS terminology' });
  }
  
  // Visual suggestions
  if (/\b(chart|graph|data|metric)\b/.test(lowerText)) {
    visualFeatures.push({ id: 'charts', name: 'Charts', confidence: 0.85, reason: 'Data content' });
  }
  if (/\b(screenshot|image|visual)\b/.test(lowerText)) {
    visualFeatures.push({ id: 'images', name: 'Images', confidence: 0.8, reason: 'Visual references' });
  }
  
  // Output formats
  outputFormats.push({ id: 'pptx-export', name: 'PowerPoint', confidence: 0.9, reason: 'Standard format' });
  outputFormats.push({ id: 'pdf-export', name: 'PDF', confidence: 0.85, reason: 'Document format' });
  
  if (title?.toLowerCase().includes('product') || title?.toLowerCase().includes('demo')) {
    outputFormats.push({ id: 'video-short', name: 'Short Video', confidence: 0.75, reason: 'Product content' });
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

export default urlAdapter;
