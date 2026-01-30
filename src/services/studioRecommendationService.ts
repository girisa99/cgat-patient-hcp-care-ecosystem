/**
 * STUDIO RECOMMENDATION SERVICE
 * 
 * Proactive AI-powered recommendations for:
 * - Templates based on user prompt/topic
 * - Visual formats based on content type and industry
 * - Explains WHY each suggestion is relevant
 * 
 * Integrates with Label Studio for learning from user choices
 */

import { supabase } from '@/integrations/supabase/client';

export interface RecommendationMatch {
  id: string;
  label: string;
  category: string;
  score: number; // 0-100 confidence
  reason: string; // Human-readable explanation
  tags: string[];
}

export interface AIRecommendation {
  templates: RecommendationMatch[];
  visualFormats: RecommendationMatch[];
  overview: string;
  promptAnalysis: {
    detectedIndustry: string;
    detectedRegion: string;
    contentType: string;
    suggestedTone: string;
    keywords: string[];
  };
}

// Keyword → Template mappings for fast local matching
const TEMPLATE_KEYWORDS: Record<string, string[]> = {
  // Government & Vision
  'saudi_vision_2030': ['saudi', 'vision 2030', 'kingdom', 'neom', 'giga project', 'mbs', 'crown prince'],
  'uae_digital': ['uae', 'dubai', 'emirates', 'abu dhabi', 'smart dubai', 'expo'],
  'india_digital': ['india', 'digital india', 'modi', 'narendra', 'bharatnet'],
  'india_upi': ['upi', 'gpay', 'phonepe', 'paytm', 'rupay', 'digital payment india'],
  'india_startup': ['startup india', 'unicorn', 'bangalore', 'bengaluru', 'hyderabad tech'],
  'india_smart_city': ['smart city india', 'pune smart', 'bhopal smart', 'indore'],
  'pakistan_digital': ['pakistan', 'digital pakistan', 'lahore', 'karachi tech'],
  'bangladesh_digital': ['bangladesh', 'dhaka', 'bkash', 'nagad'],
  
  // Industry
  'healthcare_digital': ['health', 'hospital', 'medical', 'patient', 'doctor', 'telemedicine', 'diagnostic'],
  'pharma_product': ['pharma', 'drug', 'medicine', 'treatment', 'clinical trial', 'fda'],
  'banking_digital': ['bank', 'fintech', 'neobank', 'digital bank', 'mobile banking'],
  'saas_demo': ['saas', 'software', 'app demo', 'product demo', 'platform demo'],
  'ai_showcase': ['ai', 'machine learning', 'ml', 'artificial intelligence', 'neural', 'deep learning'],
  'education_course': ['course', 'training', 'learn', 'education', 'tutorial', 'e-learning'],
  
  // Tourism
  'mena_tourism': ['tourism mena', 'visit saudi', 'explore uae', 'jordan travel'],
  'india_tourism': ['incredible india', 'taj mahal', 'goa', 'kerala', 'rajasthan'],
  'africa_tourism': ['safari', 'serengeti', 'cape town', 'victoria falls', 'masai mara'],
  
  // Tech Regions
  'nigeria_tech': ['nigeria', 'lagos tech', 'nigerian startup', 'paystack', 'flutterwave'],
  'kenya_silicon': ['kenya', 'nairobi', 'silicon savannah', 'mpesa', 'safaricom'],
  'singapore_smart': ['singapore', 'smart nation', 'govtech sg'],
  'japan_society5': ['japan', 'society 5.0', 'tokyo', 'monozukuri'],
  'korea_digital': ['korea', 'korean', 'seoul', 'k-startup', 'samsung'],
};

// Keyword → Visual format mappings
const VISUAL_KEYWORDS: Record<string, string[]> = {
  // Storytelling
  'story_panchatantra': ['moral', 'fable', 'animal story', 'lesson', 'wisdom', 'ancient india', 'panchatantra'],
  'story_ramayana': ['epic', 'hero journey', 'dharma', 'strategy', 'ramayana', 'mahabharata', 'mythological'],
  'story_sufi': ['sufi', 'spiritual', 'rumi', 'mystic', 'persian', 'philosophy'],
  'story_african_folklore': ['african tale', 'anansi', 'folklore africa', 'oral tradition'],
  
  // Character Animation
  'char_mascot_guide': ['mascot', 'character guide', 'brand character', 'cartoon host'],
  'char_wise_elder': ['elder', 'mentor', 'grandfather', 'grandmother', 'sage', 'wisdom character'],
  'char_cartoon_teacher': ['teacher character', 'professor', 'tutor cartoon', 'explainer character'],
  
  // Transformation
  'transform_city_growth': ['city transformation', 'urban growth', 'before after city', 'smart city growth'],
  'transform_digital_adoption': ['digital transformation', 'going digital', 'modernization'],
  'transform_sustainability': ['green transformation', 'sustainability journey', 'carbon neutral'],
  
  // Professional
  'avatar_realistic': ['avatar', 'presenter', 'spokesperson', 'talking head', 'ai presenter'],
  'avatar_ppt_narrator': ['ppt', 'powerpoint', 'slides presenter', 'deck narrator'],
  '3d_product': ['3d product', 'product 360', 'product visualization', 'product showcase'],
  'motion_kinetic': ['kinetic text', 'typography animation', 'text motion'],
  'motion_infographic': ['infographic', 'data viz', 'chart animation', 'stats animation'],
  
  // Regional Art
  'art_madhubani': ['madhubani', 'bihar art', 'mithila'],
  'art_warli': ['warli', 'tribal art india', 'maharashtra art'],
  'art_truck_pakistan': ['truck art', 'pakistani art', 'phool patti'],
  'art_kente': ['kente', 'ghana', 'ashanti', 'african textile'],
  'art_batik': ['batik', 'indonesian art', 'java art', 'wax resist'],
  'art_wayang': ['wayang', 'shadow puppet', 'javanese', 'balinese puppet'],
};

// Tone analysis keywords
const TONE_KEYWORDS: Record<string, string[]> = {
  'professional': ['corporate', 'business', 'enterprise', 'b2b', 'executive'],
  'educational': ['learn', 'teach', 'explain', 'course', 'tutorial', 'training'],
  'inspirational': ['vision', 'dream', 'future', 'transformation', 'change', 'inspire'],
  'storytelling': ['story', 'tale', 'journey', 'narrative', 'once upon'],
  'playful': ['fun', 'kids', 'children', 'animated', 'cartoon', 'colorful'],
  'cultural': ['heritage', 'tradition', 'cultural', 'folklore', 'ancient', 'mythological'],
};

class StudioRecommendationService {
  private static instance: StudioRecommendationService;

  static getInstance(): StudioRecommendationService {
    if (!StudioRecommendationService.instance) {
      StudioRecommendationService.instance = new StudioRecommendationService();
    }
    return StudioRecommendationService.instance;
  }

  /**
   * Analyze prompt and return AI-powered recommendations
   * Uses Gemini for deep analysis, falls back to local keyword matching
   */
  async analyzePrompt(
    prompt: string,
    availableTemplates: Array<{ id: string; label: string; category: string }>,
    availableVisuals: Array<{ id: string; label: string; category: string }>
  ): Promise<AIRecommendation> {
    const lowerPrompt = prompt.toLowerCase();
    
    // Step 1: Local keyword matching for speed
    const localTemplates = this.matchKeywords(lowerPrompt, TEMPLATE_KEYWORDS, availableTemplates);
    const localVisuals = this.matchKeywords(lowerPrompt, VISUAL_KEYWORDS, availableVisuals);
    const detectedTone = this.detectTone(lowerPrompt);
    
    // Step 2: If prompt is substantial, enhance with AI
    if (prompt.length > 30) {
      try {
        const aiEnhanced = await this.getAIRecommendations(prompt, localTemplates, localVisuals);
        if (aiEnhanced) {
          return aiEnhanced;
        }
      } catch (error) {
        console.debug('[StudioRecommendation] AI enhancement failed, using local:', error);
      }
    }
    
    // Return local analysis
    return {
      templates: localTemplates.slice(0, 5),
      visualFormats: localVisuals.slice(0, 8),
      overview: this.generateLocalOverview(localTemplates, localVisuals, detectedTone),
      promptAnalysis: {
        detectedIndustry: localTemplates[0]?.category || 'General',
        detectedRegion: this.detectRegion(lowerPrompt),
        contentType: this.detectContentType(lowerPrompt),
        suggestedTone: detectedTone,
        keywords: this.extractKeywords(lowerPrompt),
      },
    };
  }

  /**
   * Get AI-powered recommendations using Gemini
   */
  private async getAIRecommendations(
    prompt: string,
    localTemplates: RecommendationMatch[],
    localVisuals: RecommendationMatch[]
  ): Promise<AIRecommendation | null> {
    const systemPrompt = `You are a content production advisor. Analyze the user's content brief and recommend:
1. Best templates (from the provided list)
2. Best visual formats (from the provided list)
3. WHY each recommendation fits

Return ONLY valid JSON with this structure:
{
  "overview": "2-3 sentence summary of your recommendations",
  "templates": [{"id": "template_id", "reason": "why this template fits", "score": 85}],
  "visualFormats": [{"id": "visual_id", "reason": "why this visual style fits", "score": 80}],
  "promptAnalysis": {
    "detectedIndustry": "industry name",
    "detectedRegion": "region/country",
    "contentType": "explainer/pitch/training/story",
    "suggestedTone": "professional/educational/inspirational/playful",
    "keywords": ["key1", "key2"]
  }
}`;

    const userPrompt = `User's content brief: "${prompt}"

Available templates (pick up to 5):
${localTemplates.map(t => `- ${t.id}: ${t.label} (${t.category})`).join('\n')}

Available visual formats (pick up to 8):
${localVisuals.map(v => `- ${v.id}: ${v.label} (${v.category})`).join('\n')}

Analyze and recommend the best matches with explanations.`;

    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          prompt: userPrompt,
          systemPrompt,
          action: 'generate',
        }
      });

      if (error || !data?.content) return null;

      const content = data.content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(content);

      // Merge AI results with local data
      return {
        overview: parsed.overview || 'AI-powered recommendations based on your content brief.',
        templates: (parsed.templates || []).map((t: any) => ({
          id: t.id,
          label: localTemplates.find(lt => lt.id === t.id)?.label || t.id,
          category: localTemplates.find(lt => lt.id === t.id)?.category || 'Recommended',
          score: t.score || 75,
          reason: t.reason || 'AI-recommended match',
          tags: [],
        })),
        visualFormats: (parsed.visualFormats || []).map((v: any) => ({
          id: v.id,
          label: localVisuals.find(lv => lv.id === v.id)?.label || v.id,
          category: localVisuals.find(lv => lv.id === v.id)?.category || 'Recommended',
          score: v.score || 70,
          reason: v.reason || 'AI-recommended visual style',
          tags: [],
        })),
        promptAnalysis: parsed.promptAnalysis || {
          detectedIndustry: 'General',
          detectedRegion: 'Global',
          contentType: 'explainer',
          suggestedTone: 'professional',
          keywords: [],
        },
      };
    } catch (error) {
      console.debug('[StudioRecommendation] AI parse error:', error);
      return null;
    }
  }

  /**
   * Match keywords against available options
   */
  private matchKeywords(
    prompt: string,
    keywordMap: Record<string, string[]>,
    available: Array<{ id: string; label: string; category: string }>
  ): RecommendationMatch[] {
    const matches: RecommendationMatch[] = [];

    for (const item of available) {
      const keywords = keywordMap[item.id] || [];
      let matchScore = 0;
      const matchedKeywords: string[] = [];

      for (const keyword of keywords) {
        if (prompt.includes(keyword)) {
          matchScore += 20;
          matchedKeywords.push(keyword);
        }
      }

      // Also check label words
      const labelWords = item.label.toLowerCase().split(/\s+/);
      for (const word of labelWords) {
        if (word.length > 3 && prompt.includes(word)) {
          matchScore += 10;
          matchedKeywords.push(word);
        }
      }

      if (matchScore > 0) {
        matches.push({
          id: item.id,
          label: item.label,
          category: item.category,
          score: Math.min(100, matchScore),
          reason: matchedKeywords.length > 0 
            ? `Matches: ${matchedKeywords.slice(0, 3).join(', ')}`
            : `Related to ${item.category}`,
          tags: matchedKeywords,
        });
      }
    }

    // Sort by score descending
    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Detect tone from prompt
   */
  private detectTone(prompt: string): string {
    for (const [tone, keywords] of Object.entries(TONE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (prompt.includes(keyword)) {
          return tone;
        }
      }
    }
    return 'professional';
  }

  /**
   * Detect region from prompt
   */
  private detectRegion(prompt: string): string {
    const regionKeywords: Record<string, string[]> = {
      'Middle East': ['saudi', 'uae', 'dubai', 'qatar', 'oman', 'bahrain', 'kuwait', 'gcc'],
      'India': ['india', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai'],
      'Pakistan': ['pakistan', 'lahore', 'karachi', 'islamabad'],
      'Bangladesh': ['bangladesh', 'dhaka', 'chittagong'],
      'Africa': ['africa', 'nigeria', 'kenya', 'south africa', 'ethiopia', 'ghana'],
      'Southeast Asia': ['indonesia', 'malaysia', 'thailand', 'vietnam', 'singapore', 'philippines'],
      'East Asia': ['china', 'japan', 'korea', 'taiwan'],
      'Europe': ['europe', 'uk', 'germany', 'france', 'spain', 'italy'],
      'Americas': ['usa', 'america', 'canada', 'brazil', 'mexico', 'latin'],
    };

    for (const [region, keywords] of Object.entries(regionKeywords)) {
      for (const keyword of keywords) {
        if (prompt.includes(keyword)) {
          return region;
        }
      }
    }
    return 'Global';
  }

  /**
   * Detect content type from prompt
   */
  private detectContentType(prompt: string): string {
    if (prompt.includes('pitch') || prompt.includes('investor') || prompt.includes('funding')) return 'pitch';
    if (prompt.includes('train') || prompt.includes('course') || prompt.includes('learn')) return 'training';
    if (prompt.includes('story') || prompt.includes('tale') || prompt.includes('journey')) return 'storytelling';
    if (prompt.includes('demo') || prompt.includes('showcase') || prompt.includes('product')) return 'demo';
    if (prompt.includes('marketing') || prompt.includes('promo') || prompt.includes('campaign')) return 'marketing';
    return 'explainer';
  }

  /**
   * Extract key terms from prompt
   */
  private extractKeywords(prompt: string): string[] {
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'];
    
    const words = prompt.split(/\s+/).filter(w => 
      w.length > 3 && !stopWords.includes(w)
    );
    
    return [...new Set(words)].slice(0, 10);
  }

  /**
   * Generate overview from local analysis
   */
  private generateLocalOverview(
    templates: RecommendationMatch[],
    visuals: RecommendationMatch[],
    tone: string
  ): string {
    if (templates.length === 0 && visuals.length === 0) {
      return 'Enter your content topic or brief to get AI-powered recommendations for templates and visual styles.';
    }

    const topTemplate = templates[0];
    const topVisual = visuals[0];

    let overview = '';
    
    if (topTemplate) {
      overview += `Detected ${topTemplate.category} focus. `;
    }
    
    if (topVisual) {
      overview += `${topVisual.category} visual style would work well. `;
    }
    
    overview += `Suggested tone: ${tone}.`;
    
    return overview;
  }
}

export const studioRecommendationService = StudioRecommendationService.getInstance();

// Hook for React components
export function useStudioRecommendations() {
  return {
    analyzePrompt: (
      prompt: string,
      templates: Array<{ id: string; label: string; category: string }>,
      visuals: Array<{ id: string; label: string; category: string }>
    ) => studioRecommendationService.analyzePrompt(prompt, templates, visuals),
  };
}
