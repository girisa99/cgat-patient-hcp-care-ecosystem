import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  action: 'translate' | 'detect' | 'languages';
  provider: 'google' | 'deepl' | 'microsoft' | 'amazon' | 'ai';
  text?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  formality?: 'formal' | 'informal' | 'neutral';
  glossary?: Record<string, string>;
  category?: string;
  context?: string;
}

interface TranslationResponse {
  translatedText?: string;
  detectedLanguage?: string;
  confidence?: number;
  alternatives?: string[];
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: TranslationRequest = await req.json();
    console.log('[TranslationService] Request:', {
      action: request.action,
      provider: request.provider,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      textLength: request.text?.length,
    });

    let response: TranslationResponse;

    switch (request.action) {
      case 'translate':
        response = await handleTranslation(request);
        break;
      case 'detect':
        response = await handleLanguageDetection(request);
        break;
      case 'languages':
        response = { translatedText: JSON.stringify(getSupportedLanguages(request.provider)) };
        break;
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[TranslationService] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleTranslation(request: TranslationRequest): Promise<TranslationResponse> {
  const { provider, text, sourceLanguage, targetLanguage, formality, glossary, category, context } = request;

  if (!text || !targetLanguage) {
    throw new Error('Missing required fields: text and targetLanguage');
  }

  switch (provider) {
    case 'google':
      return translateWithGoogle(text, sourceLanguage || 'auto', targetLanguage, glossary);
    case 'deepl':
      return translateWithDeepL(text, sourceLanguage || 'auto', targetLanguage, formality);
    case 'microsoft':
      return translateWithMicrosoft(text, sourceLanguage || 'auto', targetLanguage, category);
    case 'amazon':
      return translateWithAmazon(text, sourceLanguage || 'auto', targetLanguage, formality);
    case 'ai':
    default:
      return translateWithAI(text, sourceLanguage || 'en', targetLanguage, context, formality);
  }
}

async function translateWithGoogle(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  glossary?: Record<string, string>
): Promise<TranslationResponse> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
  
  if (!apiKey) {
    console.log('[TranslationService] Google API key not found, falling back to AI translation');
    return translateWithAI(text, sourceLanguage, targetLanguage);
  }

  try {
    // Apply glossary pre-processing
    let processedText = text;
    if (glossary) {
      for (const [term, translation] of Object.entries(glossary)) {
        processedText = processedText.replace(new RegExp(term, 'gi'), `{{${term}}}`);
      }
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: processedText,
        source: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        target: targetLanguage,
        format: 'text',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[TranslationService] Google API error:', error);
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const data = await response.json();
    let translatedText = data.data?.translations?.[0]?.translatedText || '';
    const detectedLanguage = data.data?.translations?.[0]?.detectedSourceLanguage;

    // Apply glossary post-processing
    if (glossary) {
      for (const [term, translation] of Object.entries(glossary)) {
        translatedText = translatedText.replace(new RegExp(`\\{\\{${term}\\}\\}`, 'gi'), translation);
      }
    }

    return {
      translatedText,
      detectedLanguage,
      confidence: 0.85,
    };
  } catch (error) {
    console.error('[TranslationService] Google translation error:', error);
    return translateWithAI(text, sourceLanguage, targetLanguage);
  }
}

async function translateWithDeepL(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  formality?: 'formal' | 'informal' | 'neutral'
): Promise<TranslationResponse> {
  const apiKey = Deno.env.get('DEEPL_API_KEY');
  
  if (!apiKey) {
    console.log('[TranslationService] DeepL API key not found, falling back to AI translation');
    return translateWithAI(text, sourceLanguage, targetLanguage, undefined, formality);
  }

  try {
    // Determine if using free or pro API
    const baseUrl = apiKey.endsWith(':fx') 
      ? 'https://api-free.deepl.com/v2/translate'
      : 'https://api.deepl.com/v2/translate';

    // Map language codes to DeepL format
    const deeplSourceLang = sourceLanguage === 'auto' ? undefined : sourceLanguage.toUpperCase();
    const deeplTargetLang = mapToDeepLLanguage(targetLanguage);
    const deeplFormality = formality === 'neutral' ? undefined : formality;

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: deeplSourceLang,
        target_lang: deeplTargetLang,
        formality: deeplFormality,
        preserve_formatting: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[TranslationService] DeepL API error:', error);
      throw new Error(`DeepL API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      translatedText: data.translations?.[0]?.text || '',
      detectedLanguage: data.translations?.[0]?.detected_source_language?.toLowerCase(),
      confidence: 0.94,
    };
  } catch (error) {
    console.error('[TranslationService] DeepL translation error:', error);
    return translateWithAI(text, sourceLanguage, targetLanguage, undefined, formality);
  }
}

function mapToDeepLLanguage(code: string): string {
  // DeepL uses specific codes for some languages
  const mapping: Record<string, string> = {
    'en': 'EN-US',
    'pt': 'PT-PT',
    'zh': 'ZH',
  };
  return mapping[code.toLowerCase()] || code.toUpperCase();
}

async function translateWithMicrosoft(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  category?: string
): Promise<TranslationResponse> {
  // Check for Azure/Microsoft Translator API key with multiple fallbacks
  const apiKey = Deno.env.get('MICROSOFT_TRANSLATE_API_KEY') || 
                 Deno.env.get('MICROSOFT_TRANSLATOR_KEY') || 
                 Deno.env.get('AZURE_TRANSLATOR_KEY');
  const region = Deno.env.get('MICROSOFT_TRANSLATE_REGION') || 
                 Deno.env.get('MICROSOFT_TRANSLATOR_REGION') || 
                 'global';
  
  if (!apiKey) {
    console.log('[TranslationService] Microsoft/Azure Translator API key not found, falling back to AI translation');
    return translateWithAI(text, sourceLanguage, targetLanguage);
  }
  
  console.log('[TranslationService] Using Microsoft/Azure Translator with region:', region);

  try {
    const endpoint = 'https://api.cognitive.microsofttranslator.com/translate';
    const params = new URLSearchParams({
      'api-version': '3.0',
      'to': targetLanguage,
    });
    
    if (sourceLanguage !== 'auto') {
      params.append('from', sourceLanguage);
    }
    if (category) {
      params.append('category', category);
    }

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text }]),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[TranslationService] Microsoft Translator API error:', error);
      throw new Error(`Microsoft Translator API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      translatedText: data[0]?.translations?.[0]?.text || '',
      detectedLanguage: data[0]?.detectedLanguage?.language,
      confidence: data[0]?.detectedLanguage?.score || 0.86,
    };
  } catch (error) {
    console.error('[TranslationService] Microsoft translation error:', error);
    return translateWithAI(text, sourceLanguage, targetLanguage);
  }
}

async function translateWithAmazon(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  formality?: 'formal' | 'informal' | 'neutral'
): Promise<TranslationResponse> {
  // Amazon Translate requires AWS SDK which is complex in Deno
  // Fallback to AI translation for now
  console.log('[TranslationService] Amazon Translate not implemented, using AI translation');
  return translateWithAI(text, sourceLanguage, targetLanguage, undefined, formality);
}

async function translateWithAI(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  context?: string,
  formality?: 'formal' | 'informal' | 'neutral'
): Promise<TranslationResponse> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  const languageNames: Record<string, string> = {
    en: 'English', de: 'German', fr: 'French', es: 'Spanish',
    it: 'Italian', pt: 'Portuguese', nl: 'Dutch', pl: 'Polish',
    ru: 'Russian', ja: 'Japanese', zh: 'Chinese', ko: 'Korean',
    ar: 'Arabic', hi: 'Hindi', tr: 'Turkish', vi: 'Vietnamese',
    th: 'Thai', id: 'Indonesian', ms: 'Malay', sv: 'Swedish',
    da: 'Danish', no: 'Norwegian', fi: 'Finnish', el: 'Greek',
    cs: 'Czech', hu: 'Hungarian', ro: 'Romanian', uk: 'Ukrainian',
    he: 'Hebrew', fa: 'Persian', bn: 'Bengali', ta: 'Tamil',
    te: 'Telugu', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi',
  };

  const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
  const targetLangName = languageNames[targetLanguage] || targetLanguage;
  
  const systemPrompt = `You are an expert professional translator. Translate the following text from ${sourceLangName} to ${targetLangName}.

${formality ? `Use a ${formality} tone and register.` : ''}
${context ? `Context for translation: ${context}` : ''}

CRITICAL INSTRUCTIONS:
1. Provide ONLY the translated text, nothing else
2. Preserve the original formatting, punctuation, and structure
3. Maintain technical terms, proper nouns, and brand names appropriately
4. Ensure natural, fluent translation that reads like native ${targetLangName}
5. Do NOT include explanations, notes, or the original text`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: Math.max(1000, text.length * 2),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[TranslationService] AI translation error:', error);
      throw new Error(`AI translation failed: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content || '';

    return {
      translatedText: translatedText.trim(),
      confidence: 0.88,
    };
  } catch (error) {
    console.error('[TranslationService] AI translation error:', error);
    throw error;
  }
}

async function handleLanguageDetection(request: TranslationRequest): Promise<TranslationResponse> {
  const { text } = request;
  
  if (!text) {
    throw new Error('Missing required field: text');
  }

  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a language detection expert. Analyze the text and return ONLY a JSON object with the detected language code (ISO 639-1) and confidence score between 0 and 1. Example: {"language": "en", "confidence": 0.95, "alternatives": [{"language": "de", "confidence": 0.03}]}',
          },
          { role: 'user', content: text.slice(0, 500) },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Language detection failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        detectedLanguage: parsed.language,
        confidence: parsed.confidence,
        alternatives: parsed.alternatives,
      };
    }

    return {
      detectedLanguage: 'en',
      confidence: 0.5,
    };
  } catch (error) {
    console.error('[TranslationService] Language detection error:', error);
    return {
      detectedLanguage: 'en',
      confidence: 0.5,
    };
  }
}

function getSupportedLanguages(provider: string): string[] {
  // Return supported language codes based on provider
  const commonLanguages = [
    'en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru',
    'ja', 'zh', 'ko', 'ar', 'hi', 'tr', 'vi', 'th', 'id',
  ];
  
  switch (provider) {
    case 'deepl':
      return ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'zh', 'ko', 'cs', 'da', 'el', 'et', 'fi', 'hu', 'id', 'lt', 'lv', 'nb', 'ro', 'sk', 'sl', 'sv', 'tr', 'uk'];
    case 'google':
      return [...commonLanguages, 'af', 'sq', 'am', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'ny', 'co', 'hr', 'cs', 'da', 'eo', 'et', 'tl', 'fi', 'fy', 'gl', 'ka', 'el', 'gu', 'ht', 'ha', 'haw', 'he', 'hmn', 'hu', 'is', 'ig', 'ga', 'jw', 'kn', 'kk', 'km', 'rw', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'or', 'ps', 'fa', 'pa', 'ro', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'su', 'sw', 'sv', 'tg', 'ta', 'tt', 'te', 'uk', 'ur', 'ug', 'uz', 'cy', 'xh', 'yi', 'yo', 'zu'];
    default:
      return commonLanguages;
  }
}
