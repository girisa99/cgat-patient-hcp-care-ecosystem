import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlideData {
  id: string;
  title?: string;
  content?: { bullets?: string[]; paragraph?: string };
  image?: string;
  speakerNotes?: string;
}

interface QualityMetrics {
  overall: number;
  contentAccuracy: number;
  visualRelevance: number;
  languageQuality: number;
  coherenceScore: number;
  engagementScore: number;
  model: string;
  suggestedModel?: string;
  improvements: string[];
  strengths: string[];
  assessedAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, slide, slides, context, metadata, content, contentType, imageUrl, slideTitle, slideContent } = await req.json();

    console.log(`[AI-Quality-Assessment] Action: ${action}`);

    switch (action) {
      case 'assess_slide':
        return handleSlideAssessment(slide, context);
      case 'assess_presentation':
        return handlePresentationAssessment(slides, metadata);
      case 'quick_check':
        return handleQuickCheck(content, contentType);
      case 'assess_image_relevance':
        return handleImageRelevance(imageUrl, slideTitle, slideContent);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('[AI-Quality-Assessment] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleSlideAssessment(
  slide: SlideData, 
  context?: { presentationTopic?: string; targetAudience?: string; previousSlide?: string; nextSlide?: string }
): Promise<Response> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Build comprehensive prompt for AI assessment
  const slideContent = buildSlideContentString(slide);
  const contextInfo = context ? `
Context:
- Presentation topic: ${context.presentationTopic || 'Not specified'}
- Target audience: ${context.targetAudience || 'General'}
- Previous slide: ${context.previousSlide || 'None'}
- Next slide: ${context.nextSlide || 'None'}` : '';

  const prompt = `You are an expert presentation quality assessor. Analyze the following slide content and provide a detailed quality assessment.

${slideContent}
${contextInfo}

Evaluate the slide on these criteria (score 0-100 for each):
1. **Content Accuracy**: Is the content relevant, accurate, and well-structured?
2. **Visual Relevance**: Does the described visual content align with the slide topic? ${slide.image ? 'Image is present.' : 'No image present.'}
3. **Language Quality**: Grammar, clarity, readability, and professional tone
4. **Coherence Score**: Logical flow, clear transitions, consistent messaging
5. **Engagement Score**: Audience appeal, memorable points, call-to-action potential

Respond in this exact JSON format:
{
  "overall": <0-100>,
  "contentAccuracy": <0-100>,
  "visualRelevance": <0-100>,
  "languageQuality": <0-100>,
  "coherenceScore": <0-100>,
  "engagementScore": <0-100>,
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", ...],
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "analysis": "<brief overall analysis paragraph>"
}`;

  const response = await callGeminiAI(apiKey, prompt);
  const parsed = parseAIResponse(response);

  const result = {
    slideId: slide.id,
    metrics: {
      ...parsed,
      model: 'google/gemini-3-flash-preview',
      suggestedModel: parsed.overall < 70 ? 'google/gemini-2.5-pro' : undefined,
      assessedAt: new Date().toISOString()
    },
    rawAnalysis: parsed.analysis
  };

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handlePresentationAssessment(
  slides: SlideData[],
  metadata?: { presentationTopic?: string; targetAudience?: string; language?: string }
): Promise<Response> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Build presentation summary
  const slideSummaries = slides.map((slide, i) => 
    `Slide ${i + 1}: ${slide.title || 'Untitled'}\n${buildSlideContentString(slide)}`
  ).join('\n\n');

  const prompt = `You are an expert presentation quality assessor. Analyze the following presentation and provide a comprehensive quality report.

PRESENTATION METADATA:
- Topic: ${metadata?.presentationTopic || 'Not specified'}
- Target Audience: ${metadata?.targetAudience || 'General'}
- Language: ${metadata?.language || 'English'}
- Total Slides: ${slides.length}

SLIDES:
${slideSummaries}

Evaluate the ENTIRE presentation and each slide. Respond in this exact JSON format:
{
  "overallScore": <0-100>,
  "slideScores": [
    {
      "slideIndex": 0,
      "overall": <0-100>,
      "contentAccuracy": <0-100>,
      "visualRelevance": <0-100>,
      "languageQuality": <0-100>,
      "coherenceScore": <0-100>,
      "engagementScore": <0-100>,
      "improvements": ["..."],
      "strengths": ["..."]
    }
  ],
  "averages": {
    "content": <0-100>,
    "visual": <0-100>,
    "language": <0-100>,
    "coherence": <0-100>,
    "engagement": <0-100>
  },
  "topIssues": ["<issue 1>", "<issue 2>", ...],
  "topStrengths": ["<strength 1>", "<strength 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}`;

  const response = await callGeminiAI(apiKey, prompt);
  const parsed = parseAIResponse(response);

  // Map slide scores to include slide IDs
  const slideScores = (parsed.slideScores || []).map((score: any, index: number) => ({
    slideId: slides[index]?.id || `slide-${index}`,
    metrics: {
      overall: score.overall || 70,
      contentAccuracy: score.contentAccuracy || 70,
      visualRelevance: score.visualRelevance || 70,
      languageQuality: score.languageQuality || 70,
      coherenceScore: score.coherenceScore || 70,
      engagementScore: score.engagementScore || 70,
      model: 'google/gemini-3-flash-preview',
      improvements: score.improvements || [],
      strengths: score.strengths || [],
      assessedAt: new Date().toISOString()
    }
  }));

  const result = {
    presentationId: `pres-${Date.now()}`,
    overallScore: parsed.overallScore || 70,
    slideScores,
    averages: parsed.averages || { content: 70, visual: 70, language: 70, coherence: 70, engagement: 70 },
    topIssues: parsed.topIssues || [],
    topStrengths: parsed.topStrengths || [],
    recommendations: parsed.recommendations || [],
    assessedAt: new Date().toISOString()
  };

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleQuickCheck(
  content: string,
  contentType: 'title' | 'bullet' | 'paragraph' | 'speaker_notes'
): Promise<Response> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const typeGuidelines: Record<string, string> = {
    title: 'concise, attention-grabbing, clear main topic (ideal: 5-10 words)',
    bullet: 'clear, actionable, not too verbose (ideal: 8-15 words)',
    paragraph: 'well-structured, coherent, appropriate depth',
    speaker_notes: 'helpful delivery guidance, key points, timing notes'
  };

  const prompt = `Quickly assess this ${contentType} for presentation quality.
Guidelines for ${contentType}: ${typeGuidelines[contentType] || 'clear and professional'}

Content: "${content}"

Respond in JSON format:
{
  "score": <0-100>,
  "feedback": "<brief 1-2 sentence feedback>"
}`;

  const response = await callGeminiAI(apiKey, prompt, true);
  const parsed = parseAIResponse(response);

  return new Response(JSON.stringify({
    score: parsed.score || 70,
    feedback: parsed.feedback || 'Content quality is acceptable'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleImageRelevance(
  imageUrl: string,
  slideTitle: string,
  slideContent: string
): Promise<Response> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Note: For actual image analysis, we'd use a vision model
  // This implementation uses text analysis of the image URL/context
  const prompt = `Assess how relevant an image would be for this slide content.

Slide Title: "${slideTitle}"
Slide Content: "${slideContent}"
Image Reference: ${imageUrl ? 'Image is present' : 'No image'}

Based on the slide content, provide:
1. A relevance score (0-100) - how well a professional image would support this content
2. Analysis of what the image should convey
3. Suggestions for image selection

Respond in JSON format:
{
  "score": <0-100>,
  "analysis": "<brief analysis>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}`;

  const response = await callGeminiAI(apiKey, prompt, true);
  const parsed = parseAIResponse(response);

  return new Response(JSON.stringify({
    score: parsed.score || 70,
    analysis: parsed.analysis || 'Unable to fully analyze image relevance',
    suggestions: parsed.suggestions || ['Consider using a relevant professional image']
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildSlideContentString(slide: SlideData): string {
  const parts: string[] = [];
  
  if (slide.title) {
    parts.push(`Title: ${slide.title}`);
  }
  
  if (slide.content?.bullets?.length) {
    parts.push(`Bullet Points:\n${slide.content.bullets.map(b => `  • ${b}`).join('\n')}`);
  }
  
  if (slide.content?.paragraph) {
    parts.push(`Content: ${slide.content.paragraph}`);
  }
  
  if (slide.speakerNotes) {
    parts.push(`Speaker Notes: ${slide.speakerNotes}`);
  }
  
  if (slide.image) {
    parts.push(`[Has Image]`);
  }
  
  return parts.join('\n');
}

async function callGeminiAI(apiKey: string, prompt: string, quick = false): Promise<string> {
  const model = quick ? 'gemini-2.0-flash-lite' : 'gemini-2.0-flash';
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        { 
          parts: [{ 
            text: `You are an expert presentation quality assessor. Always respond with valid JSON only, no markdown.\n\n${prompt}` 
          }] 
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: quick ? 500 : 2000
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini AI error:', response.status, errorText);
    throw new Error(`AI assessment failed: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function parseAIResponse(response: string): any {
  try {
    // Try to parse JSON directly
    const cleanResponse = response.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(cleanResponse);
  } catch (e) {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        console.error('Failed to parse extracted JSON:', jsonMatch[0]);
      }
    }
    
    console.error('Failed to parse AI response:', response);
    // Return default values
    return {
      overall: 70,
      contentAccuracy: 70,
      visualRelevance: 70,
      languageQuality: 70,
      coherenceScore: 70,
      engagementScore: 70,
      improvements: ['Unable to analyze - using default assessment'],
      strengths: [],
      score: 70,
      feedback: 'Default assessment applied'
    };
  }
}
