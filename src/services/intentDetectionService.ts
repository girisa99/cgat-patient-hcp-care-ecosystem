/**
 * INTENT DETECTION SERVICE
 * Analyzes user messages to determine optimal response format
 */

export interface ResponseIntent {
  format: 'text' | 'table' | 'html' | 'image' | 'video' | 'mixed';
  confidence: number;
  mediaType?: 'medical' | 'biotech' | 'educational' | 'clinical';
  structuredData?: boolean;
  visualElements?: boolean;
}

class IntentDetectionService {
  /**
   * Analyze user message to determine optimal response format
   */
  analyzeIntent(message: string): ResponseIntent {
    const lowerMessage = message.toLowerCase();
    
    // Keywords for different formats
    const tableKeywords = ['compare', 'comparison', 'table', 'list', 'versus', 'vs', 'differences', 'similarities', 'options', 'features'];
    const imageKeywords = ['show', 'diagram', 'illustration', 'picture', 'visual', 'image', 'anatomy', 'structure'];
    const videoKeywords = ['video', 'animation', 'process', 'procedure', 'workflow', 'step by step', 'demonstration'];
    const htmlKeywords = ['format', 'styled', 'rich', 'interactive', 'detailed'];
    
    // Medical/biotech context
    const medicalKeywords = ['cell', 'therapy', 'treatment', 'clinical', 'patient', 'disease', 'medicine', 'drug'];
    const biotechKeywords = ['biotech', 'laboratory', 'research', 'gene', 'protein', 'dna', 'molecular'];
    
    let scores = {
      text: 1, // Default baseline
      table: 0,
      html: 0,
      image: 0,
      video: 0,
      mixed: 0
    };
    
    // Score based on keywords
    tableKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) scores.table += 2;
    });
    
    imageKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) scores.image += 2;
    });
    
    videoKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) scores.video += 3;
    });
    
    htmlKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) scores.html += 1.5;
    });
    
    // Question patterns that suggest tables
    if (/what are the|which|compare|difference between/i.test(message)) {
      scores.table += 3;
    }
    
    // Visual request patterns
    if (/show me|visualize|illustrate|diagram of/i.test(message)) {
      scores.image += 4;
      scores.mixed += 2;
    }
    
    // Process or procedure requests
    if (/how to|process|procedure|step.*step|workflow/i.test(message)) {
      scores.video += 3;
      scores.mixed += 2;
    }
    
    // Multiple format indicators
    if (scores.table > 1 && scores.image > 1) scores.mixed += 3;
    if (scores.image > 1 && scores.video > 1) scores.mixed += 2;
    
    // Determine best format
    const maxScore = Math.max(...Object.values(scores));
    const bestFormat = Object.keys(scores).find(key => scores[key] === maxScore) as keyof typeof scores;
    
    // Determine media type
    let mediaType: ResponseIntent['mediaType'] | undefined;
    if (medicalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      mediaType = 'medical';
    } else if (biotechKeywords.some(keyword => lowerMessage.includes(keyword))) {
      mediaType = 'biotech';
    } else if (lowerMessage.includes('learn') || lowerMessage.includes('education')) {
      mediaType = 'educational';
    } else if (lowerMessage.includes('clinical') || lowerMessage.includes('patient')) {
      mediaType = 'clinical';
    }
    
    return {
      format: bestFormat,
      confidence: Math.min(maxScore / 5, 1), // Normalize to 0-1
      mediaType,
      structuredData: scores.table > 2 || scores.html > 2,
      visualElements: scores.image > 1 || scores.video > 1 || scores.mixed > 1
    };
  }
  
  /**
   * Get enhanced prompt based on intent
   */
  getEnhancedPrompt(originalPrompt: string, intent: ResponseIntent): string {
    let enhancement = '';
    
    switch (intent.format) {
      case 'table':
        enhancement = 'Please provide a comprehensive comparison table with clear headers and organized data. ';
        break;
      case 'html':
        enhancement = 'Please format your response with proper HTML structure, headings, and styling for better readability. ';
        break;
      case 'image':
        enhancement = 'Include relevant medical/scientific illustrations or diagrams to support your explanation. ';
        break;
      case 'video':
        enhancement = 'Provide step-by-step process information that would benefit from video demonstration. ';
        break;
      case 'mixed':
        enhancement = 'Provide a comprehensive response combining text, tables, and visual elements as appropriate. ';
        break;
    }
    
    if (intent.mediaType) {
      switch (intent.mediaType) {
        case 'medical':
          enhancement += 'Focus on clinical accuracy and medical best practices. ';
          break;
        case 'biotech':
          enhancement += 'Include technical and scientific details relevant to biotechnology applications. ';
          break;
        case 'educational':
          enhancement += 'Structure the response for learning purposes with clear explanations. ';
          break;
        case 'clinical':
          enhancement += 'Emphasize clinical applications and patient care considerations. ';
          break;
      }
    }
    
    enhancement += 'Always include appropriate medical disclaimers and emphasize consulting healthcare professionals.';
    
    return `${enhancement}\n\nOriginal question: ${originalPrompt}`;
  }
}

export const intentDetectionService = new IntentDetectionService();
export default intentDetectionService;