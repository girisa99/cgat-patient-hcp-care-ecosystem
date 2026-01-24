/**
 * REGIONAL CONTEXT PROMPTS FOR CONTENT GENERATION
 * Comprehensive prompt templates for 25+ regions across 4 categories:
 * 1. LLM System Prompts
 * 2. Image Generation Templates
 * 3. Video Script Tone Templates
 * 4. Avatar Script Style Guides
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT TEMPLATES BY REGION (LLM)
// ═══════════════════════════════════════════════════════════════════════════════

export interface RegionalSystemPrompt {
  region: string;
  regionCode: string;
  language: string;
  languageCode: string;
  systemPrompt: string;
  formalityLevel: 'formal' | 'semi-formal' | 'casual';
  culturalNotes: string[];
}

export const REGIONAL_SYSTEM_PROMPTS: Record<string, RegionalSystemPrompt> = {
  // ========== AMERICAS ==========
  'US': {
    region: 'United States',
    regionCode: 'US',
    language: 'American English',
    languageCode: 'en-US',
    systemPrompt: 'Generate content for a US business audience. Use direct, confident language. Action-oriented CTAs. Diverse, inclusive representation. American English spelling. Reference US business culture and practices.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Prefer direct communication', 'Value time efficiency', 'Use inclusive language', 'Action-oriented CTAs']
  },
  'UK': {
    region: 'United Kingdom',
    regionCode: 'UK',
    language: 'British English',
    languageCode: 'en-GB',
    systemPrompt: 'Generate content for a UK business audience. Use British English spelling and phrasing. Professional, understated tone. Avoid Americanisms. Reference UK business culture. Polite but clear CTAs.',
    formalityLevel: 'formal',
    culturalNotes: ['Understated professionalism', 'Avoid overselling', 'British spelling (colour, centre)', 'Polite phrasing']
  },
  'CA': {
    region: 'Canada',
    regionCode: 'CA',
    language: 'Canadian English/French',
    languageCode: 'en-CA',
    systemPrompt: 'Generate content for a Canadian business audience. Bilingual consideration (English/French). Canadian English spelling. Inclusive, multicultural approach. Reference Canadian business practices.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Bilingual awareness', 'Multicultural sensitivity', 'Polite and friendly', 'Environmental consciousness']
  },
  'MX': {
    region: 'Mexico/Latin America',
    regionCode: 'MX',
    language: 'Latin American Spanish',
    languageCode: 'es-MX',
    systemPrompt: 'Generate content for a Latin American business audience (Español latinoamericano). Use ustedes (not vosotros). Warm, relationship-focused language. Local expressions where appropriate.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Relationship-oriented', 'Warm, personal tone', 'Use ustedes for plural', 'Family and community values']
  },
  'BR': {
    region: 'Brazil',
    regionCode: 'BR',
    language: 'Brazilian Portuguese',
    languageCode: 'pt-BR',
    systemPrompt: 'Generate content for a Brazilian audience (Português brasileiro). Use você, not tu. Brazilian Portuguese vocabulary and expressions. Warm, friendly professional tone.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Warm and friendly', 'Use você (not tu)', 'Brazilian vocabulary (ônibus not autocarro)', 'Relationship-focused']
  },
  'AR': {
    region: 'Argentina',
    regionCode: 'AR',
    language: 'Rioplatense Spanish',
    languageCode: 'es-AR',
    systemPrompt: 'Generate content for an Argentine audience (Español rioplatense). Use vos instead of tú. Rioplatense expressions. Confident, expressive tone. Reference local business culture.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Use voseo (vos)', 'Expressive communication', 'European influence', 'Passionate tone']
  },

  // ========== EUROPE ==========
  'DE': {
    region: 'Germany',
    regionCode: 'DE',
    language: 'German',
    languageCode: 'de-DE',
    systemPrompt: 'Generate content for a German business audience (Deutsch). Use formal Sie register. Precise, technical language. Data-driven approach. Standard German (Hochdeutsch). Thorough, detailed explanations.',
    formalityLevel: 'formal',
    culturalNotes: ['Use formal Sie register', 'Precision and accuracy', 'Data-driven decisions', 'Thorough documentation']
  },
  'FR': {
    region: 'France',
    regionCode: 'FR',
    language: 'French',
    languageCode: 'fr-FR',
    systemPrompt: 'Generate content for a French business audience (Français). Use formal vous register. Elegant, refined language. Sophisticated tone. Reference French business culture. Use subjunctive where appropriate.',
    formalityLevel: 'formal',
    culturalNotes: ['Use formal vous', 'Elegant phrasing', 'Subjunctive mood when appropriate', 'Sophisticated vocabulary']
  },
  'ES': {
    region: 'Spain',
    regionCode: 'ES',
    language: 'Castilian Spanish',
    languageCode: 'es-ES',
    systemPrompt: 'Generate content for a Spanish audience (Español de España). Use formal usted for business. Castilian Spanish conventions. Vosotros for plural. Warm but professional tone.',
    formalityLevel: 'formal',
    culturalNotes: ['Use vosotros for plural', 'Castilian conventions', 'Distinguish from LatAm Spanish', 'Warm professionalism']
  },
  'IT': {
    region: 'Italy',
    regionCode: 'IT',
    language: 'Italian',
    languageCode: 'it-IT',
    systemPrompt: 'Generate content for an Italian business audience (Italiano). Use formal Lei register. Elegant, expressive language. Reference Italian design and quality traditions. Relationship-oriented.',
    formalityLevel: 'formal',
    culturalNotes: ['Use formal Lei', 'Design and quality focus', 'Expressive communication', 'Relationship importance']
  },
  'NL': {
    region: 'Netherlands',
    regionCode: 'NL',
    language: 'Dutch',
    languageCode: 'nl-NL',
    systemPrompt: 'Generate content for a Dutch business audience (Nederlands). Direct, pragmatic communication. Use u for formal, je for casual. International business friendly. Clear, no-nonsense approach.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Direct communication', 'Pragmatic approach', 'International orientation', 'Egalitarian culture']
  },
  'PL': {
    region: 'Poland',
    regionCode: 'PL',
    language: 'Polish',
    languageCode: 'pl-PL',
    systemPrompt: 'Generate content for a Polish business audience (Polski). Use formal Pan/Pani. Professional, respectful tone. Reference Polish business culture. Clear, structured communication.',
    formalityLevel: 'formal',
    culturalNotes: ['Use Pan/Pani honorifics', 'Formal business culture', 'Growing tech sector', 'Structured approach']
  },

  // ========== ASIA ==========
  'JP': {
    region: 'Japan',
    regionCode: 'JP',
    language: 'Japanese',
    languageCode: 'ja-JP',
    systemPrompt: 'Generate content for a Japanese business audience (日本語). Use ビジネス敬語 (business keigo) register. Formal, respectful language. Humble expressions. Avoid direct criticism. Reference Japanese business culture.',
    formalityLevel: 'formal',
    culturalNotes: ['Use business keigo (ビジネス敬語)', 'Humble expressions', 'Indirect communication', 'Hierarchical respect']
  },
  'KR': {
    region: 'Korea',
    regionCode: 'KR',
    language: 'Korean',
    languageCode: 'ko-KR',
    systemPrompt: 'Generate content for a Korean business audience (한국어). Use 존댓말 (formal speech level). Professional, respectful tone. Modern K-style appropriate for business. Use 만/억 for large numbers.',
    formalityLevel: 'formal',
    culturalNotes: ['Use 존댓말 (formal speech)', 'Hierarchical respect', 'Modern K-style', '만/억 number system']
  },
  'CN': {
    region: 'China',
    regionCode: 'CN',
    language: 'Simplified Chinese',
    languageCode: 'zh-CN',
    systemPrompt: 'Generate content for a Chinese business audience (简体中文). Use formal 您 where appropriate. Standard Mandarin (普通话). Prosperity and success oriented. Avoid politically sensitive topics.',
    formalityLevel: 'formal',
    culturalNotes: ['Use formal 您', 'Prosperity themes', 'Avoid sensitive topics', 'Relationship (关系) focus']
  },
  'TW': {
    region: 'Taiwan',
    regionCode: 'TW',
    language: 'Traditional Chinese',
    languageCode: 'zh-TW',
    systemPrompt: 'Generate content for a Taiwanese business audience (繁體中文). Use Traditional Chinese characters. Taiwan conventions and expressions. Formal, professional tone.',
    formalityLevel: 'formal',
    culturalNotes: ['Traditional characters', 'Taiwan-specific terms', 'Tech-savvy audience', 'Different from mainland']
  },
  'HK': {
    region: 'Hong Kong',
    regionCode: 'HK',
    language: 'Cantonese/Traditional Chinese',
    languageCode: 'zh-HK',
    systemPrompt: 'Generate content for a Hong Kong business audience (繁體中文/粵語). Traditional Chinese characters. Cantonese influence acceptable. International business friendly. Financial sector awareness.',
    formalityLevel: 'formal',
    culturalNotes: ['Traditional characters', 'Cantonese expressions', 'Financial hub', 'International orientation']
  },
  'TH': {
    region: 'Thailand',
    regionCode: 'TH',
    language: 'Thai',
    languageCode: 'th-TH',
    systemPrompt: 'Generate content for a Thai audience (ภาษาไทย). Use appropriate politeness particles (ครับ/ค่ะ). Respectful, Buddhist-appropriate tone. Avoid disrespecting monarchy.',
    formalityLevel: 'formal',
    culturalNotes: ['Politeness particles ครับ/ค่ะ', 'Respect for monarchy', 'Buddhist values', 'Harmony focus']
  },
  'VN': {
    region: 'Vietnam',
    regionCode: 'VN',
    language: 'Vietnamese',
    languageCode: 'vi-VN',
    systemPrompt: 'Generate content for a Vietnamese audience (Tiếng Việt). Use appropriate pronouns and honorifics. Respectful, professional tone.',
    formalityLevel: 'formal',
    culturalNotes: ['Complex pronoun system', 'Age-based honorifics', 'Growing economy', 'Tech adoption']
  },
  'ID': {
    region: 'Indonesia',
    regionCode: 'ID',
    language: 'Indonesian',
    languageCode: 'id-ID',
    systemPrompt: 'Generate content for an Indonesian audience (Bahasa Indonesia). Use formal "Anda" (not "kamu"). Professional, respectful tone. Clear, straightforward language.',
    formalityLevel: 'formal',
    culturalNotes: ['Use Anda (formal)', 'Muslim majority awareness', 'Diverse archipelago', 'Growing digital economy']
  },
  'MY': {
    region: 'Malaysia',
    regionCode: 'MY',
    language: 'Malay/English',
    languageCode: 'ms-MY',
    systemPrompt: 'Generate content for a Malaysian business audience. Bahasa Malaysia or English acceptable. Multicultural awareness (Malay, Chinese, Indian). Professional, respectful tone.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Multicultural society', 'Bilingual acceptable', 'Islamic considerations', 'Diverse ethnic groups']
  },
  'SG': {
    region: 'Singapore',
    regionCode: 'SG',
    language: 'Singapore English',
    languageCode: 'en-SG',
    systemPrompt: 'Generate content for a Singaporean business audience. Standard English with local context. Multicultural awareness. International business standards. Efficient, pragmatic approach.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Multicultural hub', 'Singlish awareness', 'Business efficiency', 'International standards']
  },
  'PH': {
    region: 'Philippines',
    regionCode: 'PH',
    language: 'Filipino/English',
    languageCode: 'en-PH',
    systemPrompt: 'Generate content for a Filipino business audience. English or Tagalog acceptable. Warm, friendly professional tone. Relationship-oriented. Reference local business context.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Bilingual (English/Tagalog)', 'Warm communication', 'Relationship focus', 'BPO sector awareness']
  },

  // ========== SOUTH ASIA ==========
  'IN_EN': {
    region: 'India (English)',
    regionCode: 'IN',
    language: 'Indian English',
    languageCode: 'en-IN',
    systemPrompt: 'Generate content for an Indian business audience in English. Indian English conventions acceptable. Warm, respectful tone. Reference Indian business context. Multiple honorifics if appropriate.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Indian English acceptable', 'Respectful tone', 'Diverse audience', 'Tech-savvy']
  },
  'IN_HI': {
    region: 'India (Hindi)',
    regionCode: 'IN',
    language: 'Hindi',
    languageCode: 'hi-IN',
    systemPrompt: 'Generate content for an Indian audience in Hindi (हिंदी). Use शुद्ध हिंदी (pure Hindi) for formal, Hinglish acceptable for casual. Warm, respectful tone.',
    formalityLevel: 'formal',
    culturalNotes: ['Pure Hindi for formal', 'Hinglish for casual', 'Respectful honorifics', 'Regional diversity']
  },
  'PK': {
    region: 'Pakistan',
    regionCode: 'PK',
    language: 'Urdu',
    languageCode: 'ur-PK',
    systemPrompt: 'Generate content for a Pakistani business audience (اردو). Formal Urdu with appropriate honorifics. Respectful, professional tone. Islamic cultural awareness.',
    formalityLevel: 'formal',
    culturalNotes: ['Formal Urdu', 'Islamic values', 'Respectful honorifics', 'Growing tech sector']
  },
  'BD': {
    region: 'Bangladesh',
    regionCode: 'BD',
    language: 'Bengali',
    languageCode: 'bn-BD',
    systemPrompt: 'Generate content for a Bangladeshi business audience (বাংলা). Use formal Bengali. Professional, respectful tone. Reference local business context.',
    formalityLevel: 'formal',
    culturalNotes: ['Formal Bengali', 'Textile industry awareness', 'Growing economy', 'Respectful tone']
  },

  // ========== MIDDLE EAST & AFRICA ==========
  'SA': {
    region: 'Saudi Arabia',
    regionCode: 'SA',
    language: 'Gulf Arabic',
    languageCode: 'ar-SA',
    systemPrompt: 'Generate content for a Saudi Arabian audience (العربية السعودية). Gulf Arabic dialect for casual, MSA for formal. Respectful, hospitable tone. Avoid religious insensitivity. Gender-appropriate addressing.',
    formalityLevel: 'formal',
    culturalNotes: ['Gulf Arabic/MSA', 'Islamic values', 'Hospitality focus', 'Gender considerations', 'Vision 2030 awareness']
  },
  'AE': {
    region: 'United Arab Emirates',
    regionCode: 'AE',
    language: 'Gulf Arabic',
    languageCode: 'ar-AE',
    systemPrompt: 'Generate content for a UAE audience (العربية الإماراتية). Gulf Arabic conventions. Modern, luxury-oriented. Respectful tone. International business friendly.',
    formalityLevel: 'formal',
    culturalNotes: ['Gulf Arabic', 'Luxury and innovation', 'Expat-friendly', 'International hub', 'Tourism focus']
  },
  'EG': {
    region: 'Egypt',
    regionCode: 'EG',
    language: 'Egyptian Arabic',
    languageCode: 'ar-EG',
    systemPrompt: 'Generate content for an Egyptian audience (العربية المصرية). Egyptian Arabic dialect acceptable. Warm, engaging tone. MSA for very formal content.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Egyptian dialect', 'Warm communication', 'Ancient heritage', 'Regional influence']
  },
  'IL': {
    region: 'Israel',
    regionCode: 'IL',
    language: 'Hebrew',
    languageCode: 'he-IL',
    systemPrompt: 'Generate content for an Israeli business audience (עברית). Modern Hebrew. Direct, informal tone acceptable. Tech startup culture. International outlook.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Modern Hebrew', 'Direct communication', 'Startup nation', 'Informal acceptable']
  },
  'TR': {
    region: 'Turkey',
    regionCode: 'TR',
    language: 'Turkish',
    languageCode: 'tr-TR',
    systemPrompt: 'Generate content for a Turkish business audience (Türkçe). Use appropriate formal register. Warm, hospitable tone. Reference Turkish business culture.',
    formalityLevel: 'formal',
    culturalNotes: ['Formal register', 'Hospitality', 'Bridge between East and West', 'Growing economy']
  },
  'NG': {
    region: 'Nigeria',
    regionCode: 'NG',
    language: 'Nigerian English',
    languageCode: 'en-NG',
    systemPrompt: 'Generate content for a Nigerian business audience. Nigerian English conventions. Confident, entrepreneurial tone. Reference local business context.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Nigerian English', 'Entrepreneurial spirit', 'Youth demographic', 'Tech hub (Lagos)']
  },
  'KE': {
    region: 'Kenya',
    regionCode: 'KE',
    language: 'Kenyan English/Swahili',
    languageCode: 'en-KE',
    systemPrompt: 'Generate content for a Kenyan business audience. East African English conventions. Option for Swahili (Kiswahili) integration. Clear, practical language.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['East African English', 'Swahili integration', 'Tech hub (Nairobi)', 'M-Pesa pioneer']
  },
  'ZA': {
    region: 'South Africa',
    regionCode: 'ZA',
    language: 'South African English',
    languageCode: 'en-ZA',
    systemPrompt: 'Generate content for a South African business audience. South African English conventions. Multicultural awareness. Reference local business context.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Multicultural', '11 official languages', 'Rainbow nation', 'African business hub']
  },
  'GH': {
    region: 'Ghana',
    regionCode: 'GH',
    language: 'Ghanaian English',
    languageCode: 'en-GH',
    systemPrompt: 'Generate content for a Ghanaian business audience. West African English conventions. Warm, respectful tone. Reference local business context.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Ghanaian English', 'Warm communication', 'Growing economy', 'Stable democracy']
  },

  // ========== OCEANIA ==========
  'AU': {
    region: 'Australia',
    regionCode: 'AU',
    language: 'Australian English',
    languageCode: 'en-AU',
    systemPrompt: 'Generate content for an Australian business audience. Australian English conventions. Casual but professional tone. Avoid excessive formality. Direct, no-nonsense approach.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['Australian English', 'Casual professionalism', 'Egalitarian culture', 'Direct communication']
  },
  'NZ': {
    region: 'New Zealand',
    regionCode: 'NZ',
    language: 'New Zealand English',
    languageCode: 'en-NZ',
    systemPrompt: 'Generate content for a New Zealand business audience. NZ English conventions. Friendly, approachable tone. Māori cultural awareness. Environmental consciousness.',
    formalityLevel: 'semi-formal',
    culturalNotes: ['NZ English', 'Māori awareness', 'Environmental focus', 'Friendly approach']
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE GENERATION PROMPT TEMPLATES BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export interface RegionalImagePrompt {
  region: string;
  regionCode: string;
  businessSceneTemplate: string;
  officeStyle: string;
  lighting: string;
  culturalElements: string[];
}

export const REGIONAL_IMAGE_PROMPTS: Record<string, RegionalImagePrompt> = {
  'US': {
    region: 'United States',
    regionCode: 'US',
    businessSceneTemplate: '[SUBJECT], professional diverse team, modern American office, natural lighting, corporate photography, 8k, realistic',
    officeStyle: 'Modern open-plan office with glass walls and tech-forward design',
    lighting: 'Natural daylight, warm professional lighting',
    culturalElements: ['Diverse team representation', 'Contemporary furniture', 'Tech devices', 'Casual professional attire']
  },
  'UK': {
    region: 'United Kingdom',
    regionCode: 'UK',
    businessSceneTemplate: '[SUBJECT], British professional setting, elegant traditional-modern office, soft natural light, sophisticated photography',
    officeStyle: 'Elegant blend of traditional and modern, wood accents, refined aesthetics',
    lighting: 'Soft natural light, understated elegance',
    culturalElements: ['Traditional-modern blend', 'Quality furnishings', 'Understated elegance', 'Professional attire']
  },
  'DE': {
    region: 'Germany',
    regionCode: 'DE',
    businessSceneTemplate: '[SUBJECT], precise German business environment, clean minimal office, technical quality, professional photography',
    officeStyle: 'Clean, minimal, highly organized workspace with precision engineering aesthetic',
    lighting: 'Clean, even lighting with technical precision',
    culturalElements: ['Minimal design', 'Precision engineering', 'Organized space', 'Functional furniture']
  },
  'FR': {
    region: 'France',
    regionCode: 'FR',
    businessSceneTemplate: '[SUBJECT], elegant French business setting, refined Parisian office, artistic natural light, sophisticated photography',
    officeStyle: 'Elegant Parisian aesthetic with artistic touches and refined design',
    lighting: 'Soft, artistic natural light',
    culturalElements: ['Elegant design', 'Artistic touches', 'Refined aesthetics', 'Fashion-conscious']
  },
  'JP': {
    region: 'Japan',
    regionCode: 'JP',
    businessSceneTemplate: '[SUBJECT], Japanese business setting, minimal zen-influenced office, respectful formal attire, clean natural lighting',
    officeStyle: 'Zen-influenced minimalism with clean lines and natural materials',
    lighting: 'Clean natural lighting, subtle and refined',
    culturalElements: ['Zen minimalism', 'Natural materials', 'Formal attire', 'Orderly arrangement']
  },
  'KR': {
    region: 'Korea',
    regionCode: 'KR',
    businessSceneTemplate: '[SUBJECT], modern Korean office, K-style aesthetic, high-tech environment, bright professional lighting',
    officeStyle: 'Modern K-style with high-tech elements and contemporary design',
    lighting: 'Bright, professional, modern lighting',
    culturalElements: ['K-style aesthetic', 'High-tech environment', 'Modern design', 'Youth-oriented']
  },
  'CN': {
    region: 'China',
    regionCode: 'CN',
    businessSceneTemplate: '[SUBJECT], prosperous Chinese business setting, modern office with auspicious elements, warm golden lighting',
    officeStyle: 'Modern prosperity with auspicious design elements and success symbols',
    lighting: 'Warm golden lighting, prosperous atmosphere',
    culturalElements: ['Prosperity symbols', 'Red and gold accents', 'Modern architecture', 'Success orientation']
  },
  'IN': {
    region: 'India',
    regionCode: 'IN',
    businessSceneTemplate: '[SUBJECT], modern Indian tech office, diverse team, vibrant but professional, warm natural lighting',
    officeStyle: 'Modern tech hub with vibrant colors and diverse team representation',
    lighting: 'Warm natural lighting, vibrant atmosphere',
    culturalElements: ['Tech hub aesthetic', 'Diverse representation', 'Vibrant colors', 'Modern infrastructure']
  },
  'AE': {
    region: 'UAE/MENA',
    regionCode: 'AE',
    businessSceneTemplate: '[SUBJECT], luxury Middle Eastern business setting, elegant office with geometric patterns, warm professional lighting',
    officeStyle: 'Luxury modern office with Islamic geometric patterns and opulent design',
    lighting: 'Warm professional lighting, luxury atmosphere',
    culturalElements: ['Islamic geometric patterns', 'Luxury finishes', 'Modern Arabic design', 'Gold accents']
  },
  'SA': {
    region: 'Saudi Arabia',
    regionCode: 'SA',
    businessSceneTemplate: '[SUBJECT], prestigious Saudi business environment, modern Islamic architecture, professional formal attire, warm lighting',
    officeStyle: 'Modern Islamic architecture with Vision 2030 inspiration',
    lighting: 'Warm, prestigious lighting',
    culturalElements: ['Islamic architecture', 'Vision 2030 modernity', 'Traditional elements', 'Professional formality']
  },
  'BR': {
    region: 'Brazil',
    regionCode: 'BR',
    businessSceneTemplate: '[SUBJECT], vibrant Brazilian business setting, diverse team, modern office with tropical elements, bright warm lighting',
    officeStyle: 'Modern office with tropical influences and vibrant energy',
    lighting: 'Bright warm lighting, energetic atmosphere',
    culturalElements: ['Tropical elements', 'Diverse team', 'Vibrant colors', 'Warm atmosphere']
  },
  'NG': {
    region: 'Nigeria/Africa',
    regionCode: 'NG',
    businessSceneTemplate: '[SUBJECT], modern African business setting, confident professional team, contemporary office, bright natural lighting',
    officeStyle: 'Contemporary African business aesthetic with modern infrastructure',
    lighting: 'Bright natural lighting, confident atmosphere',
    culturalElements: ['African patterns', 'Modern infrastructure', 'Confident team', 'Entrepreneurial spirit']
  },
  'AU': {
    region: 'Australia',
    regionCode: 'AU',
    businessSceneTemplate: '[SUBJECT], relaxed Australian business setting, modern sustainable office, natural daylight, casual professional atmosphere',
    officeStyle: 'Modern sustainable design with natural elements and casual professionalism',
    lighting: 'Natural daylight, outdoor connection',
    culturalElements: ['Sustainable design', 'Natural elements', 'Casual professionalism', 'Outdoor connection']
  },
  'SG': {
    region: 'Singapore',
    regionCode: 'SG',
    businessSceneTemplate: '[SUBJECT], sleek Singapore business hub, multicultural team, high-tech modern office, pristine professional lighting',
    officeStyle: 'High-tech modern office with multicultural team and pristine design',
    lighting: 'Pristine professional lighting, modern atmosphere',
    culturalElements: ['Multicultural team', 'High-tech design', 'Pristine environment', 'International standards']
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO SCRIPT TONE TEMPLATES BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export interface RegionalVideoTone {
  region: string;
  regionCode: string;
  language: string;
  openingStyle: string;
  ctaStyle: string;
  closingStyle: string;
  paceDescription: string;
  toneKeywords: string[];
}

export const REGIONAL_VIDEO_TONES: Record<string, RegionalVideoTone> = {
  'US': {
    region: 'United States',
    regionCode: 'US',
    language: 'en-US',
    openingStyle: 'Hey there! Ready to [benefit]? Let me show you how...',
    ctaStyle: 'Click the link below and get started today!',
    closingStyle: 'Thanks for watching! Don\'t forget to like and subscribe!',
    paceDescription: 'Energetic, confident, friendly',
    toneKeywords: ['energetic', 'confident', 'friendly', 'action-oriented', 'direct']
  },
  'UK': {
    region: 'United Kingdom',
    regionCode: 'UK',
    language: 'en-GB',
    openingStyle: 'Good day. We\'d like to introduce you to [topic]...',
    ctaStyle: 'Do visit our website to learn more.',
    closingStyle: 'Thank you for joining us. Goodbye.',
    paceDescription: 'Measured, professional, warm',
    toneKeywords: ['measured', 'professional', 'warm', 'understated', 'polite']
  },
  'DE': {
    region: 'Germany',
    regionCode: 'DE',
    language: 'de-DE',
    openingStyle: 'Willkommen. Heute präsentieren wir Ihnen [topic]...',
    ctaStyle: 'Besuchen Sie unsere Website für weitere Informationen.',
    closingStyle: 'Vielen Dank für Ihre Aufmerksamkeit.',
    paceDescription: 'Clear, precise, professional',
    toneKeywords: ['clear', 'precise', 'professional', 'thorough', 'formal']
  },
  'FR': {
    region: 'France',
    regionCode: 'FR',
    language: 'fr-FR',
    openingStyle: 'Bonjour et bienvenue. Aujourd\'hui, nous vous présentons [topic]...',
    ctaStyle: 'Visitez notre site web pour en savoir plus.',
    closingStyle: 'Merci de votre attention. À bientôt.',
    paceDescription: 'Elegant, refined, sophisticated',
    toneKeywords: ['elegant', 'refined', 'sophisticated', 'articulate', 'cultured']
  },
  'JP': {
    region: 'Japan',
    regionCode: 'JP',
    language: 'ja-JP',
    openingStyle: 'いつもお世話になっております。本日は[topic]についてご紹介いたします...',
    ctaStyle: '詳細はウェブサイトをご覧ください。',
    closingStyle: 'ご視聴ありがとうございました。',
    paceDescription: 'Polite, measured, respectful',
    toneKeywords: ['polite', 'measured', 'respectful', 'humble', 'formal']
  },
  'KR': {
    region: 'Korea',
    regionCode: 'KR',
    language: 'ko-KR',
    openingStyle: '안녕하세요. 오늘 [topic]에 대해 소개해 드리겠습니다...',
    ctaStyle: '자세한 내용은 웹사이트를 방문해 주세요.',
    closingStyle: '시청해 주셔서 감사합니다.',
    paceDescription: 'Professional, warm, modern',
    toneKeywords: ['professional', 'warm', 'modern', 'dynamic', 'respectful']
  },
  'CN': {
    region: 'China',
    regionCode: 'CN',
    language: 'zh-CN',
    openingStyle: '大家好！今天我们来介绍[topic]...',
    ctaStyle: '欢迎访问我们的网站了解更多信息。',
    closingStyle: '感谢您的观看，再见。',
    paceDescription: 'Clear, confident, friendly',
    toneKeywords: ['clear', 'confident', 'friendly', 'prosperous', 'welcoming']
  },
  'TW': {
    region: 'Taiwan',
    regionCode: 'TW',
    language: 'zh-TW',
    openingStyle: '大家好！今天我們來介紹[topic]...',
    ctaStyle: '歡迎訪問我們的網站了解更多。',
    closingStyle: '感謝您的收看，再見。',
    paceDescription: 'Warm, professional, friendly',
    toneKeywords: ['warm', 'professional', 'friendly', 'approachable', 'clear']
  },
  'IN': {
    region: 'India',
    regionCode: 'IN',
    language: 'en-IN',
    openingStyle: 'Namaste! Today we bring you [topic]...',
    ctaStyle: 'Visit our website or call us to know more.',
    closingStyle: 'Thank you. We hope this was helpful.',
    paceDescription: 'Warm, clear, engaging',
    toneKeywords: ['warm', 'clear', 'engaging', 'respectful', 'helpful']
  },
  'SA': {
    region: 'Saudi Arabia/MENA',
    regionCode: 'SA',
    language: 'ar-SA',
    openingStyle: 'أهلاً وسهلاً. يسعدنا أن نقدم لكم [topic]...',
    ctaStyle: 'للمزيد من المعلومات، تفضلوا بزيارة موقعنا.',
    closingStyle: 'شكراً لمتابعتكم.',
    paceDescription: 'Warm, respectful, measured',
    toneKeywords: ['warm', 'respectful', 'measured', 'hospitable', 'formal']
  },
  'AE': {
    region: 'UAE',
    regionCode: 'AE',
    language: 'ar-AE',
    openingStyle: 'أهلاً. نرحب بكم لاكتشاف [topic]...',
    ctaStyle: 'تفضلوا بزيارة موقعنا الإلكتروني.',
    closingStyle: 'شكراً لكم.',
    paceDescription: 'Modern, welcoming, professional',
    toneKeywords: ['modern', 'welcoming', 'professional', 'luxury', 'international']
  },
  'BR': {
    region: 'Brazil',
    regionCode: 'BR',
    language: 'pt-BR',
    openingStyle: 'Olá! Hoje vamos falar sobre [topic]...',
    ctaStyle: 'Acesse nosso site para saber mais!',
    closingStyle: 'Obrigado por assistir. Até a próxima!',
    paceDescription: 'Warm, friendly, engaging',
    toneKeywords: ['warm', 'friendly', 'engaging', 'enthusiastic', 'personable']
  },
  'MX': {
    region: 'Mexico/LatAm',
    regionCode: 'MX',
    language: 'es-MX',
    openingStyle: '¡Hola! Hoy les presentamos [topic]...',
    ctaStyle: 'Visita nuestro sitio web para más información.',
    closingStyle: '¡Gracias por vernos! Hasta pronto.',
    paceDescription: 'Warm, friendly, relationship-focused',
    toneKeywords: ['warm', 'friendly', 'relationship-focused', 'expressive', 'welcoming']
  },
  'NG': {
    region: 'Nigeria',
    regionCode: 'NG',
    language: 'en-NG',
    openingStyle: 'Hello and welcome! Today we\'re exploring [topic]...',
    ctaStyle: 'Visit our website or send us a message to learn more.',
    closingStyle: 'Thank you for watching. God bless!',
    paceDescription: 'Confident, warm, engaging',
    toneKeywords: ['confident', 'warm', 'engaging', 'entrepreneurial', 'dynamic']
  },
  'KE': {
    region: 'Kenya',
    regionCode: 'KE',
    language: 'en-KE',
    openingStyle: 'Habari! Welcome to [topic]...',
    ctaStyle: 'Visit our website or reach out to us.',
    closingStyle: 'Asante sana. Thank you for watching!',
    paceDescription: 'Friendly, clear, practical',
    toneKeywords: ['friendly', 'clear', 'practical', 'innovative', 'welcoming']
  },
  'TH': {
    region: 'Thailand',
    regionCode: 'TH',
    language: 'th-TH',
    openingStyle: 'สวัสดีครับ/ค่ะ วันนี้เราจะพูดถึง[topic]...',
    ctaStyle: 'เยี่ยมชมเว็บไซต์ของเราเพื่อข้อมูลเพิ่มเติม',
    closingStyle: 'ขอบคุณครับ/ค่ะ',
    paceDescription: 'Polite, respectful, warm',
    toneKeywords: ['polite', 'respectful', 'warm', 'gentle', 'harmonious']
  },
  'VN': {
    region: 'Vietnam',
    regionCode: 'VN',
    language: 'vi-VN',
    openingStyle: 'Xin chào! Hôm nay chúng tôi giới thiệu [topic]...',
    ctaStyle: 'Truy cập website của chúng tôi để biết thêm.',
    closingStyle: 'Cảm ơn bạn đã xem.',
    paceDescription: 'Respectful, professional, clear',
    toneKeywords: ['respectful', 'professional', 'clear', 'dynamic', 'growing']
  },
  'ID': {
    region: 'Indonesia',
    regionCode: 'ID',
    language: 'id-ID',
    openingStyle: 'Selamat datang! Hari ini kami akan membahas [topic]...',
    ctaStyle: 'Kunjungi website kami untuk informasi lebih lanjut.',
    closingStyle: 'Terima kasih telah menonton.',
    paceDescription: 'Professional, respectful, clear',
    toneKeywords: ['professional', 'respectful', 'clear', 'friendly', 'formal']
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// AVATAR SCRIPT STYLE GUIDE BY REGION
// ═══════════════════════════════════════════════════════════════════════════════

export interface RegionalAvatarStyle {
  region: string;
  regionCode: string;
  language: string;
  greeting: string;
  signOff: string;
  paceDelivery: string;
  gestureStyle: string;
  formalityLevel: 'formal' | 'semi-formal' | 'casual';
  eyeContactLevel: 'direct' | 'moderate' | 'minimal';
  expressionStyle: string;
}

export const REGIONAL_AVATAR_STYLES: Record<string, RegionalAvatarStyle> = {
  'US': {
    region: 'United States',
    regionCode: 'US',
    language: 'en-US',
    greeting: 'Hi, I\'m [Name]. Great to have you here!',
    signOff: 'Thanks for watching. See you next time!',
    paceDelivery: 'Energetic, confident, friendly',
    gestureStyle: 'Open, expressive hand gestures',
    formalityLevel: 'semi-formal',
    eyeContactLevel: 'direct',
    expressionStyle: 'Warm smile, engaged expression, animated'
  },
  'UK': {
    region: 'United Kingdom',
    regionCode: 'UK',
    language: 'en-GB',
    greeting: 'Hello, I\'m [Name]. Welcome.',
    signOff: 'Thank you for joining us. Goodbye.',
    paceDelivery: 'Measured, professional, warm',
    gestureStyle: 'Subtle, controlled gestures',
    formalityLevel: 'formal',
    eyeContactLevel: 'moderate',
    expressionStyle: 'Pleasant, understated warmth'
  },
  'DE': {
    region: 'Germany',
    regionCode: 'DE',
    language: 'de-DE',
    greeting: 'Guten Tag, mein Name ist [Name].',
    signOff: 'Vielen Dank für Ihre Aufmerksamkeit.',
    paceDelivery: 'Clear, precise, professional',
    gestureStyle: 'Minimal, purposeful gestures',
    formalityLevel: 'formal',
    eyeContactLevel: 'direct',
    expressionStyle: 'Serious, competent, focused'
  },
  'FR': {
    region: 'France',
    regionCode: 'FR',
    language: 'fr-FR',
    greeting: 'Bonjour, je suis [Name]. Bienvenue.',
    signOff: 'Merci de votre attention. Au revoir.',
    paceDelivery: 'Elegant, articulate, refined',
    gestureStyle: 'Expressive but refined gestures',
    formalityLevel: 'formal',
    eyeContactLevel: 'moderate',
    expressionStyle: 'Sophisticated, cultured'
  },
  'JP': {
    region: 'Japan',
    regionCode: 'JP',
    language: 'ja-JP',
    greeting: 'はじめまして、[Name]と申します。',
    signOff: 'ご視聴ありがとうございました。',
    paceDelivery: 'Polite, measured, respectful',
    gestureStyle: 'Minimal gestures, occasional bow',
    formalityLevel: 'formal',
    eyeContactLevel: 'minimal',
    expressionStyle: 'Respectful, attentive, subtle smile'
  },
  'KR': {
    region: 'Korea',
    regionCode: 'KR',
    language: 'ko-KR',
    greeting: '안녕하세요, [Name]입니다.',
    signOff: '시청해 주셔서 감사합니다.',
    paceDelivery: 'Professional, warm, modern',
    gestureStyle: 'Modern K-style, controlled',
    formalityLevel: 'formal',
    eyeContactLevel: 'moderate',
    expressionStyle: 'Professional warmth, K-style aesthetic'
  },
  'CN': {
    region: 'China',
    regionCode: 'CN',
    language: 'zh-CN',
    greeting: '大家好，我是[Name]。',
    signOff: '感谢您的观看，再见。',
    paceDelivery: 'Clear, confident, friendly',
    gestureStyle: 'Moderate, welcoming gestures',
    formalityLevel: 'formal',
    eyeContactLevel: 'direct',
    expressionStyle: 'Confident, welcoming smile'
  },
  'IN': {
    region: 'India',
    regionCode: 'IN',
    language: 'en-IN',
    greeting: 'Namaste, I\'m [Name]. Welcome!',
    signOff: 'Thank you. We hope this was helpful.',
    paceDelivery: 'Warm, clear, engaging',
    gestureStyle: 'Expressive, welcoming (namaste)',
    formalityLevel: 'semi-formal',
    eyeContactLevel: 'direct',
    expressionStyle: 'Warm, helpful, engaging'
  },
  'SA': {
    region: 'Saudi Arabia/MENA',
    regionCode: 'SA',
    language: 'ar-SA',
    greeting: 'أهلاً، أنا [Name]. أهلاً بكم.',
    signOff: 'شكراً لمتابعتكم.',
    paceDelivery: 'Warm, respectful, measured',
    gestureStyle: 'Right hand gestures, respectful',
    formalityLevel: 'formal',
    eyeContactLevel: 'moderate',
    expressionStyle: 'Hospitable, dignified, respectful'
  },
  'AE': {
    region: 'UAE',
    regionCode: 'AE',
    language: 'ar-AE',
    greeting: 'أهلاً، أنا [Name]. مرحباً بكم.',
    signOff: 'شكراً لكم.',
    paceDelivery: 'Modern, welcoming, professional',
    gestureStyle: 'Modern Arabic gestures',
    formalityLevel: 'formal',
    eyeContactLevel: 'moderate',
    expressionStyle: 'Modern, welcoming, professional'
  },
  'BR': {
    region: 'Brazil',
    regionCode: 'BR',
    language: 'pt-BR',
    greeting: 'Oi, eu sou [Name]. Bem-vindos!',
    signOff: 'Obrigado por assistir. Até a próxima!',
    paceDelivery: 'Warm, friendly, engaging',
    gestureStyle: 'Expressive, warm gestures',
    formalityLevel: 'semi-formal',
    eyeContactLevel: 'direct',
    expressionStyle: 'Warm, friendly, enthusiastic'
  },
  'MX': {
    region: 'Mexico/LatAm',
    regionCode: 'MX',
    language: 'es-MX',
    greeting: '¡Hola! Soy [Name]. ¡Bienvenidos!',
    signOff: '¡Gracias por vernos! Hasta pronto.',
    paceDelivery: 'Warm, expressive, friendly',
    gestureStyle: 'Expressive hand gestures',
    formalityLevel: 'semi-formal',
    eyeContactLevel: 'direct',
    expressionStyle: 'Warm, friendly, personable'
  },
  'NG': {
    region: 'Nigeria',
    regionCode: 'NG',
    language: 'en-NG',
    greeting: 'Hello, I\'m [Name]. Welcome!',
    signOff: 'Thank you for watching. God bless!',
    paceDelivery: 'Confident, warm, engaging',
    gestureStyle: 'Confident, open gestures',
    formalityLevel: 'semi-formal',
    eyeContactLevel: 'direct',
    expressionStyle: 'Confident, warm, engaging'
  },
  'AU': {
    region: 'Australia',
    regionCode: 'AU',
    language: 'en-AU',
    greeting: 'G\'day, I\'m [Name]. Welcome!',
    signOff: 'Thanks for watching. Cheers!',
    paceDelivery: 'Relaxed, friendly, casual',
    gestureStyle: 'Relaxed, casual gestures',
    formalityLevel: 'casual',
    eyeContactLevel: 'direct',
    expressionStyle: 'Friendly, relaxed, approachable'
  },
  'TH': {
    region: 'Thailand',
    regionCode: 'TH',
    language: 'th-TH',
    greeting: 'สวัสดีครับ/ค่ะ ผม/ดิฉัน[Name]',
    signOff: 'ขอบคุณครับ/ค่ะ',
    paceDelivery: 'Polite, gentle, respectful',
    gestureStyle: 'Wai greeting, gentle gestures',
    formalityLevel: 'formal',
    eyeContactLevel: 'minimal',
    expressionStyle: 'Gentle smile, respectful'
  },
  'VN': {
    region: 'Vietnam',
    regionCode: 'VN',
    language: 'vi-VN',
    greeting: 'Xin chào, tôi là [Name].',
    signOff: 'Cảm ơn bạn đã xem.',
    paceDelivery: 'Respectful, professional, clear',
    gestureStyle: 'Respectful, moderate gestures',
    formalityLevel: 'formal',
    eyeContactLevel: 'moderate',
    expressionStyle: 'Professional, respectful'
  },
  'ID': {
    region: 'Indonesia',
    regionCode: 'ID',
    language: 'id-ID',
    greeting: 'Halo, saya [Name]. Selamat datang!',
    signOff: 'Terima kasih telah menonton.',
    paceDelivery: 'Professional, respectful, clear',
    gestureStyle: 'Respectful, moderate gestures',
    formalityLevel: 'formal',
    eyeContactLevel: 'moderate',
    expressionStyle: 'Friendly, professional'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get system prompt for a specific region
 */
export function getRegionalSystemPrompt(regionCode: string): string {
  const prompt = REGIONAL_SYSTEM_PROMPTS[regionCode] || REGIONAL_SYSTEM_PROMPTS['US'];
  return prompt.systemPrompt;
}

/**
 * Get image generation prompt for a specific region
 */
export function getRegionalImagePrompt(regionCode: string, subject: string): string {
  const template = REGIONAL_IMAGE_PROMPTS[regionCode] || REGIONAL_IMAGE_PROMPTS['US'];
  return template.businessSceneTemplate.replace('[SUBJECT]', subject);
}

/**
 * Get video script tone for a specific region
 */
export function getRegionalVideoTone(regionCode: string): RegionalVideoTone {
  return REGIONAL_VIDEO_TONES[regionCode] || REGIONAL_VIDEO_TONES['US'];
}

/**
 * Get avatar style for a specific region
 */
export function getRegionalAvatarStyle(regionCode: string): RegionalAvatarStyle {
  return REGIONAL_AVATAR_STYLES[regionCode] || REGIONAL_AVATAR_STYLES['US'];
}

/**
 * Build enhanced prompt with regional context
 */
export function buildRegionalEnhancedPrompt(
  originalPrompt: string,
  regionCode: string,
  contentType: 'text' | 'image' | 'video' | 'avatar'
): string {
  let enhancement = '';
  
  switch (contentType) {
    case 'text':
      enhancement = getRegionalSystemPrompt(regionCode);
      break;
    case 'image':
      const imagePrompt = REGIONAL_IMAGE_PROMPTS[regionCode] || REGIONAL_IMAGE_PROMPTS['US'];
      enhancement = `Style: ${imagePrompt.officeStyle}. Lighting: ${imagePrompt.lighting}. Cultural elements: ${imagePrompt.culturalElements.join(', ')}.`;
      break;
    case 'video':
      const videoTone = getRegionalVideoTone(regionCode);
      enhancement = `Tone: ${videoTone.paceDescription}. Keywords: ${videoTone.toneKeywords.join(', ')}.`;
      break;
    case 'avatar':
      const avatarStyle = getRegionalAvatarStyle(regionCode);
      enhancement = `Pace: ${avatarStyle.paceDelivery}. Gestures: ${avatarStyle.gestureStyle}. Expression: ${avatarStyle.expressionStyle}.`;
      break;
  }
  
  return `[REGIONAL CONTEXT: ${regionCode}]\n${enhancement}\n\n${originalPrompt}`;
}

/**
 * Get all supported regions
 */
export function getSupportedRegions(): string[] {
  return Object.keys(REGIONAL_SYSTEM_PROMPTS);
}

/**
 * Get region display info
 */
export function getRegionDisplayInfo(regionCode: string): { name: string; language: string; flag: string } {
  const FLAGS: Record<string, string> = {
    'US': '🇺🇸', 'UK': '🇬🇧', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷', 'AR': '🇦🇷',
    'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱', 'PL': '🇵🇱',
    'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳', 'TW': '🇹🇼', 'HK': '🇭🇰', 'TH': '🇹🇭',
    'VN': '🇻🇳', 'ID': '🇮🇩', 'MY': '🇲🇾', 'SG': '🇸🇬', 'PH': '🇵🇭',
    'IN_EN': '🇮🇳', 'IN_HI': '🇮🇳', 'PK': '🇵🇰', 'BD': '🇧🇩',
    'SA': '🇸🇦', 'AE': '🇦🇪', 'EG': '🇪🇬', 'IL': '🇮🇱', 'TR': '🇹🇷',
    'NG': '🇳🇬', 'KE': '🇰🇪', 'ZA': '🇿🇦', 'GH': '🇬🇭',
    'AU': '🇦🇺', 'NZ': '🇳🇿'
  };
  
  const prompt = REGIONAL_SYSTEM_PROMPTS[regionCode];
  if (prompt) {
    return {
      name: prompt.region,
      language: prompt.language,
      flag: FLAGS[regionCode] || '🌍'
    };
  }
  
  return { name: 'Unknown', language: 'English', flag: '🌍' };
}

// Export all for use across the ecosystem
export const RegionalContextPrompts = {
  systemPrompts: REGIONAL_SYSTEM_PROMPTS,
  imagePrompts: REGIONAL_IMAGE_PROMPTS,
  videoTones: REGIONAL_VIDEO_TONES,
  avatarStyles: REGIONAL_AVATAR_STYLES,
  getSystemPrompt: getRegionalSystemPrompt,
  getImagePrompt: getRegionalImagePrompt,
  getVideoTone: getRegionalVideoTone,
  getAvatarStyle: getRegionalAvatarStyle,
  buildEnhancedPrompt: buildRegionalEnhancedPrompt,
  getSupportedRegions,
  getRegionDisplayInfo
};

export default RegionalContextPrompts;
