/**
 * REGIONAL RESPONSE SERVICE
 * 
 * Handles language detection and response localization for Ask Genie.
 * Responds in the user's regional language for non-technical content,
 * switching to English only for technical/engineering content.
 */

import { REGIONAL_SYSTEM_PROMPTS } from './regionalContextPrompts';

export interface LanguageContext {
  detectedLanguage: string;
  languageCode: string;
  region: string;
  formalityLevel: 'formal' | 'semi-formal' | 'casual';
  isRTL: boolean;
}

export interface ResponseLocalization {
  shouldLocalizeResponse: boolean;
  targetLanguage: string;
  systemPromptAddition: string;
  technicalOverride: boolean;
  fallbackToEnglish: boolean;
}

// Technical content patterns that should remain in English
const TECHNICAL_PATTERNS = [
  // Code and API
  /\b(api|endpoint|function|error|exception|stack\s*trace|debug|bug|crash)\b/i,
  /\b(code|script|syntax|variable|parameter|method|class|object)\b/i,
  /\b(database|sql|query|migration|schema|table|column)\b/i,
  /\b(http|https|url|json|xml|rest|graphql)\b/i,
  
  // Infrastructure
  /\b(server|deploy|pipeline|container|docker|kubernetes|cloud)\b/i,
  /\b(edge\s*function|supabase|firebase|aws|azure|gcp)\b/i,
  
  // Error messages
  /\b(error\s*\d+|status\s*\d+|failed|timeout|refused|denied)\b/i,
  /\b(null|undefined|nan|infinity|overflow|underflow)\b/i,
  
  // Technical requests
  /\b(fix|patch|hotfix|pr|pull\s*request|commit|merge|branch)\b/i,
  /\b(console|log|trace|inspect|network\s*tab)\b/i
];

// Regional greetings for personalized responses
const REGIONAL_GREETINGS: Record<string, { greeting: string; signoff: string }> = {
  'ja-JP': { greeting: 'こんにちは！', signoff: 'よろしくお願いします 🙏' },
  'ko-KR': { greeting: '안녕하세요!', signoff: '감사합니다 🙏' },
  'zh-CN': { greeting: '你好！', signoff: '谢谢！🙏' },
  'zh-TW': { greeting: '您好！', signoff: '謝謝！🙏' },
  'ar-SA': { greeting: 'مرحبا!', signoff: 'شكرا لك 🙏' },
  'ar-EG': { greeting: 'أهلاً وسهلاً!', signoff: 'شكرا جزيلا 🙏' },
  'hi-IN': { greeting: 'नमस्ते!', signoff: 'धन्यवाद 🙏' },
  'ta-IN': { greeting: 'வணக்கம்!', signoff: 'நன்றி 🙏' },
  'te-IN': { greeting: 'నమస్కారం!', signoff: 'ధన్యవాదాలు 🙏' },
  'bn-IN': { greeting: 'নমস্কার!', signoff: 'ধন্যবাদ 🙏' },
  'mr-IN': { greeting: 'नमस्कार!', signoff: 'धन्यवाद 🙏' },
  'gu-IN': { greeting: 'નમસ્તે!', signoff: 'આભાર 🙏' },
  'pa-IN': { greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ!', signoff: 'ਧੰਨਵਾਦ 🙏' },
  'ml-IN': { greeting: 'നമസ്കാരം!', signoff: 'നന്ദി 🙏' },
  'kn-IN': { greeting: 'ನಮಸ್ಕಾರ!', signoff: 'ಧನ್ಯವಾದ 🙏' },
  'de-DE': { greeting: 'Hallo!', signoff: 'Vielen Dank! 🙏' },
  'fr-FR': { greeting: 'Bonjour!', signoff: 'Merci beaucoup! 🙏' },
  'es-ES': { greeting: '¡Hola!', signoff: '¡Muchas gracias! 🙏' },
  'es-MX': { greeting: '¡Hola!', signoff: '¡Muchas gracias! 🙏' },
  'pt-BR': { greeting: 'Olá!', signoff: 'Muito obrigado! 🙏' },
  'it-IT': { greeting: 'Ciao!', signoff: 'Grazie mille! 🙏' },
  'nl-NL': { greeting: 'Hallo!', signoff: 'Bedankt! 🙏' },
  'pl-PL': { greeting: 'Cześć!', signoff: 'Dziękuję! 🙏' },
  'ru-RU': { greeting: 'Привет!', signoff: 'Спасибо! 🙏' },
  'tr-TR': { greeting: 'Merhaba!', signoff: 'Teşekkürler! 🙏' },
  'th-TH': { greeting: 'สวัสดี!', signoff: 'ขอบคุณ 🙏' },
  'vi-VN': { greeting: 'Xin chào!', signoff: 'Cảm ơn! 🙏' },
  'id-ID': { greeting: 'Halo!', signoff: 'Terima kasih! 🙏' },
  'ms-MY': { greeting: 'Hai!', signoff: 'Terima kasih! 🙏' },
  'tl-PH': { greeting: 'Kumusta!', signoff: 'Salamat! 🙏' },
  'en-US': { greeting: 'Hi there!', signoff: 'Happy to help! 💜' },
  'en-GB': { greeting: 'Hello!', signoff: 'Cheers! 💜' },
  'en-AU': { greeting: 'G\'day!', signoff: 'Cheers! 💜' }
};

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

class RegionalResponseService {
  
  /**
   * Detect if content is technical (should remain in English)
   */
  isTechnicalContent(content: string): boolean {
    return TECHNICAL_PATTERNS.some(pattern => pattern.test(content));
  }
  
  /**
   * Get language context from language code
   */
  getLanguageContext(languageCode: string): LanguageContext {
    const baseLang = languageCode.split('-')[0];
    const regionCode = languageCode.split('-')[1]?.toUpperCase() || '';
    
    // Find matching regional prompt
    const regionalPrompt = REGIONAL_SYSTEM_PROMPTS[regionCode] || 
                           Object.values(REGIONAL_SYSTEM_PROMPTS).find(p => p.languageCode === languageCode);
    
    return {
      detectedLanguage: regionalPrompt?.language || languageCode,
      languageCode: languageCode,
      region: regionalPrompt?.region || 'Global',
      formalityLevel: regionalPrompt?.formalityLevel || 'semi-formal',
      isRTL: RTL_LANGUAGES.includes(baseLang)
    };
  }
  
  /**
   * Determine if and how to localize response
   */
  getResponseLocalization(
    userLanguage: string, 
    messageContent: string,
    isEngineeringIssue: boolean = false
  ): ResponseLocalization {
    const isTechnical = this.isTechnicalContent(messageContent) || isEngineeringIssue;
    const baseLang = userLanguage.split('-')[0];
    const isEnglish = baseLang === 'en';
    
    // Technical content stays in English
    if (isTechnical) {
      return {
        shouldLocalizeResponse: false,
        targetLanguage: 'en-US',
        systemPromptAddition: 'Respond in English as this is technical content. Be precise and use standard technical terminology.',
        technicalOverride: true,
        fallbackToEnglish: true
      };
    }
    
    // Non-technical: respond in user's language
    const languageContext = this.getLanguageContext(userLanguage);
    const regionalPrompt = REGIONAL_SYSTEM_PROMPTS[userLanguage.split('-')[1]?.toUpperCase() || ''];
    
    return {
      shouldLocalizeResponse: !isEnglish,
      targetLanguage: userLanguage,
      systemPromptAddition: regionalPrompt?.systemPrompt || 
        `Respond in ${languageContext.detectedLanguage}. Use a ${languageContext.formalityLevel} tone. Be warm and helpful.`,
      technicalOverride: false,
      fallbackToEnglish: false
    };
  }
  
  /**
   * Get regional greeting for language
   */
  getRegionalGreeting(languageCode: string): { greeting: string; signoff: string } {
    return REGIONAL_GREETINGS[languageCode] || 
           REGIONAL_GREETINGS[`${languageCode.split('-')[0]}-${languageCode.split('-')[0].toUpperCase()}`] ||
           REGIONAL_GREETINGS['en-US'];
  }
  
  /**
   * Build localized system prompt for AI
   */
  buildLocalizedSystemPrompt(
    basePrompt: string,
    userLanguage: string,
    messageContent: string,
    isEngineeringIssue: boolean = false
  ): string {
    const localization = this.getResponseLocalization(userLanguage, messageContent, isEngineeringIssue);
    const greeting = this.getRegionalGreeting(userLanguage);
    
    const languageInstructions = localization.technicalOverride
      ? `
LANGUAGE INSTRUCTION:
This message contains technical content. Respond in English only.
Use precise technical terminology. Be clear and concise.
`
      : `
LANGUAGE INSTRUCTION:
- Respond in ${localization.targetLanguage} (${this.getLanguageContext(userLanguage).detectedLanguage})
- Start with a warm greeting in the user's language
- Use ${this.getLanguageContext(userLanguage).formalityLevel} tone
- Only switch to English for code snippets, API names, or technical terms that have no good translation
- Cultural note: ${REGIONAL_SYSTEM_PROMPTS[userLanguage.split('-')[1]?.toUpperCase()]?.culturalNotes?.join(', ') || 'Be respectful and warm'}
- Suggested greeting: "${greeting.greeting}"
- Suggested signoff: "${greeting.signoff}"
`;
    
    return `${basePrompt}\n\n${languageInstructions}`;
  }
  
  /**
   * Detect user's preferred language from multiple signals
   */
  detectUserLanguage(): string {
    // Priority: 1) Stored preference, 2) Browser language, 3) Default
    const storedLang = localStorage.getItem('genie_preferred_language');
    if (storedLang) return storedLang;
    
    const browserLang = navigator.language;
    return browserLang || 'en-US';
  }
  
  /**
   * Save user's language preference
   */
  saveLanguagePreference(languageCode: string): void {
    localStorage.setItem('genie_preferred_language', languageCode);
  }
  
  /**
   * Get supported languages list
   */
  getSupportedLanguages(): Array<{ code: string; name: string; region: string }> {
    return Object.entries(REGIONAL_SYSTEM_PROMPTS).map(([code, prompt]) => ({
      code: prompt.languageCode,
      name: prompt.language,
      region: prompt.region
    }));
  }
}

export const regionalResponseService = new RegionalResponseService();
