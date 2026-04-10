import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScriptSegment {
  id: string;
  startIndex: number;
  endIndex: number;
  text: string;
  type: 'intro' | 'main' | 'demo' | 'transition' | 'closing';
  suggestedPauseAfter: boolean;
  pauseReason?: string;
  estimatedDuration: number; // in seconds
  engagementTips: string[];
  toneMarkers: ('emphasize' | 'slower' | 'faster' | 'pause' | 'question' | 'excitement')[];
  improvementSuggestions?: string;
}

interface ScriptAnalysis {
  segments: ScriptSegment[];
  overallScore: number;
  totalDuration: number;
  pausePoints: { position: number; reason: string; suggestedDuration: number }[];
  engagementRecommendations: string[];
  toneGuide: string;
  conversationalTips: string[];
}

// Get the best available API key (Universal AI pattern)
function getUniversalAIConfig(): { apiKey: string; provider: 'gemini' | 'openai' | 'claude'; model: string } | null {
  // Try Gemini first (preferred for script analysis)
  const geminiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (geminiKey) {
    return { apiKey: geminiKey, provider: 'gemini', model: 'gemini-2.5-flash-preview-05-20' };
  }
  
  // Try OpenAI
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (openaiKey) {
    return { apiKey: openaiKey, provider: 'openai', model: 'gpt-4o-mini' };
  }
  
  // Try Claude
  const claudeKey = Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('CLAUDE_API_KEY');
  if (claudeKey) {
    return { apiKey: claudeKey, provider: 'claude', model: 'claude-haiku-4-5' };
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { script, context = 'general' } = await req.json();

    if (!script || typeof script !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Script text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiConfig = getUniversalAIConfig();
    if (!aiConfig) {
      // Fall back to rule-based analysis
      console.log("No AI API key configured, using rule-based analysis");
      const analysis = performRuleBasedAnalysis(script);
      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Using ${aiConfig.provider} (${aiConfig.model}) for script analysis`);

    // Use AI for enhanced analysis
    const systemPrompt = `You are an expert script coach and presentation specialist. Analyze the given script and provide detailed feedback to make it more engaging for video recording with TTS (text-to-speech).

Your analysis should:
1. Break the script into logical segments (intro, main points, demos/walkthroughs, transitions, closing)
2. Identify natural pause points where the presenter can:
   - Take a breath
   - Demonstrate something on screen
   - Let information sink in
   - Transition to a new topic
3. Suggest engagement improvements:
   - Where to add emphasis
   - Where to slow down for important points
   - Where to speed up for energy
   - Where to add questions for engagement
4. Rate the overall conversational quality
5. Provide tone guidance for TTS delivery

Return your analysis as a JSON object with this exact structure:
{
  "segments": [
    {
      "id": "seg_1",
      "startIndex": 0,
      "endIndex": 150,
      "text": "First segment text...",
      "type": "intro|main|demo|transition|closing",
      "suggestedPauseAfter": true,
      "pauseReason": "Good place for visual demonstration",
      "estimatedDuration": 15,
      "engagementTips": ["Emphasize 'key feature'", "Slow down here"],
      "toneMarkers": ["emphasize", "slower"],
      "improvementSuggestions": "Consider adding a question here"
    }
  ],
  "overallScore": 75,
  "totalDuration": 180,
  "pausePoints": [
    {"position": 150, "reason": "Demo opportunity", "suggestedDuration": 30}
  ],
  "engagementRecommendations": ["Add more rhetorical questions", "Include a hook in the intro"],
  "toneGuide": "Conversational and enthusiastic, with moments of emphasis",
  "conversationalTips": ["Use 'you' and 'we' more", "Add transition phrases"]
}`;

    let response;
    const userMessage = `Context: ${context}\n\nScript to analyze:\n\n${script}`;
    
    if (aiConfig.provider === 'gemini') {
      const fullPrompt = `${systemPrompt}\n\n${userMessage}`;
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model}:generateContent?key=${aiConfig.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        }
      );
      
      if (!response.ok) {
        console.error("Gemini API failed, falling back to rule-based:", response.status);
        const analysis = performRuleBasedAnalysis(script);
        return new Response(
          JSON.stringify(analysis),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const data = await response.json();
      var content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (aiConfig.provider === 'openai') {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
        }),
      });
      
      if (!response.ok) {
        console.error("OpenAI API failed, falling back to rule-based:", response.status);
        const analysis = performRuleBasedAnalysis(script);
        return new Response(
          JSON.stringify(analysis),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const data = await response.json();
      var content = data.choices?.[0]?.message?.content;
    } else {
      // Claude
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": aiConfig.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: aiConfig.model,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        }),
      });
      
      if (!response.ok) {
        console.error("Claude API failed, falling back to rule-based:", response.status);
        const analysis = performRuleBasedAnalysis(script);
        return new Response(
          JSON.stringify(analysis),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const data = await response.json();
      var content = data.content?.[0]?.text;
    }

    if (!content) {
      const analysis = performRuleBasedAnalysis(script);
      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response (handle markdown code blocks)
    let analysisResult: ScriptAnalysis;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1]?.trim() || content.trim();
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response, using rule-based:", parseError);
      analysisResult = performRuleBasedAnalysis(script);
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-script:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Rule-based fallback analysis
function performRuleBasedAnalysis(script: string): ScriptAnalysis {
  const sentences = script.split(/(?<=[.!?])\s+/).filter(s => s.trim());
  const wordsPerMinute = 150; // Average speaking rate
  const totalWords = script.split(/\s+/).length;
  const totalDuration = Math.ceil((totalWords / wordsPerMinute) * 60);

  const segments: ScriptSegment[] = [];
  const pausePoints: { position: number; reason: string; suggestedDuration: number }[] = [];
  
  let currentIndex = 0;
  let segmentId = 1;
  let sentenceBuffer: string[] = [];
  let bufferStartIndex = 0;

  // Keywords that suggest good pause points
  const pauseKeywords = ['next', 'now', 'let me show', 'here you can see', 'as you can see', 'moving on', 'first', 'second', 'finally', 'in conclusion', 'to summarize'];
  const demoKeywords = ['click', 'select', 'navigate', 'open', 'enter', 'type', 'drag', 'scroll'];
  const questionKeywords = ['?', 'how', 'what', 'why', 'when', 'where', 'would you', 'have you'];

  sentences.forEach((sentence, idx) => {
    const sentenceStart = script.indexOf(sentence, currentIndex);
    const sentenceEnd = sentenceStart + sentence.length;
    
    sentenceBuffer.push(sentence);
    
    // Check if this is a natural break point
    const isBreakPoint = 
      pauseKeywords.some(kw => sentence.toLowerCase().includes(kw)) ||
      sentenceBuffer.length >= 4 ||
      idx === sentences.length - 1;

    if (isBreakPoint && sentenceBuffer.length > 0) {
      const segmentText = sentenceBuffer.join(' ');
      const segmentWords = segmentText.split(/\s+/).length;
      const duration = Math.ceil((segmentWords / wordsPerMinute) * 60);
      
      // Determine segment type
      let type: ScriptSegment['type'] = 'main';
      if (idx < 2) type = 'intro';
      else if (idx >= sentences.length - 2) type = 'closing';
      else if (demoKeywords.some(kw => segmentText.toLowerCase().includes(kw))) type = 'demo';
      else if (pauseKeywords.some(kw => segmentText.toLowerCase().includes(kw))) type = 'transition';

      // Determine tone markers
      const toneMarkers: ScriptSegment['toneMarkers'] = [];
      if (sentence.includes('!')) toneMarkers.push('excitement');
      if (questionKeywords.some(kw => segmentText.toLowerCase().includes(kw))) toneMarkers.push('question');
      if (type === 'intro' || type === 'closing') toneMarkers.push('slower');
      if (segmentText.length > 200) toneMarkers.push('pause');

      // Generate engagement tips
      const engagementTips: string[] = [];
      if (!segmentText.includes('you')) engagementTips.push("Consider adding 'you' to make it more personal");
      if (type === 'demo') engagementTips.push("Pause here to demonstrate on screen");
      if (segmentText.length > 300) engagementTips.push("This section is long - consider breaking it up");

      const segment: ScriptSegment = {
        id: `seg_${segmentId}`,
        startIndex: bufferStartIndex,
        endIndex: sentenceEnd,
        text: segmentText,
        type,
        suggestedPauseAfter: type === 'demo' || type === 'transition' || idx === sentences.length - 1,
        pauseReason: type === 'demo' ? 'Demonstrate on screen' : type === 'transition' ? 'Let information sink in' : undefined,
        estimatedDuration: duration,
        engagementTips,
        toneMarkers,
      };

      segments.push(segment);

      // Add pause point if suggested
      if (segment.suggestedPauseAfter) {
        pausePoints.push({
          position: sentenceEnd,
          reason: segment.pauseReason || 'Natural break point',
          suggestedDuration: type === 'demo' ? 30 : 5,
        });
      }

      sentenceBuffer = [];
      bufferStartIndex = sentenceEnd;
      segmentId++;
    }

    currentIndex = sentenceEnd;
  });

  // Overall engagement recommendations
  const engagementRecommendations: string[] = [];
  const hasQuestions = script.includes('?');
  const hasYou = script.toLowerCase().includes('you');
  const hasWe = script.toLowerCase().includes('we');

  if (!hasQuestions) engagementRecommendations.push("Add rhetorical questions to engage viewers");
  if (!hasYou) engagementRecommendations.push("Use 'you' to speak directly to the viewer");
  if (!hasWe) engagementRecommendations.push("Use 'we' to create a collaborative feeling");
  if (sentences.length < 5) engagementRecommendations.push("Consider expanding the script with more details");
  if (totalDuration > 300) engagementRecommendations.push("Script is long (5+ min) - consider adding section breaks");

  // Calculate overall score
  let score = 50;
  if (hasQuestions) score += 10;
  if (hasYou) score += 10;
  if (hasWe) score += 5;
  if (segments.some(s => s.type === 'demo')) score += 10;
  if (sentences.length >= 5 && sentences.length <= 30) score += 10;
  if (engagementRecommendations.length === 0) score += 5;

  return {
    segments,
    overallScore: Math.min(100, score),
    totalDuration,
    pausePoints,
    engagementRecommendations,
    toneGuide: score > 70 ? "Good conversational flow - deliver naturally with enthusiasm" : "Consider making the tone more conversational and adding personal touches",
    conversationalTips: [
      "Speak as if talking to a friend",
      "Vary your pace - slow for important points, faster for familiar concepts",
      "Use pauses for emphasis and to let points sink in",
    ],
  };
}
