import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Provider configurations - Using Universal AI pattern (direct API keys)
const PROVIDERS = {
  gemini: {
    name: "Google Gemini",
    model: "gemini-2.0-flash",
    getApiKey: () => Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY"),
  },
  openai: {
    name: "OpenAI GPT",
    model: "gpt-4o-mini",
    getApiKey: () => Deno.env.get("OPENAI_API_KEY"),
  },
  claude: {
    name: "Anthropic Claude",
    model: "claude-3-5-haiku-20241022",
    getApiKey: () => Deno.env.get("ANTHROPIC_API_KEY") || Deno.env.get("CLAUDE_API_KEY"),
  },
};

type ProviderKey = keyof typeof PROVIDERS;

// Helper to clean markdown from AI response and extract valid JSON
function cleanJsonResponse(content: string): string {
  let cleaned = content.trim();
  
  // Remove ALL markdown code block markers - handle multiple and nested
  cleaned = cleaned.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*/g, '');
  
  // Remove any leading/trailing whitespace after code block removal
  cleaned = cleaned.trim();
  
  // Find the first { (we expect an object, not an array for our responses)
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace > 0) {
    cleaned = cleaned.substring(firstBrace);
  }
  
  // Find the matching closing brace by counting braces
  let braceCount = 0;
  let endIndex = -1;
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }
  }
  
  if (endIndex > 0) {
    cleaned = cleaned.substring(0, endIndex + 1);
  }
  
  return cleaned.trim();
}

// Helper to try to repair incomplete JSON
function tryRepairJson(content: string): any {
  // Try direct parse first
  try {
    return JSON.parse(content);
  } catch (e) {
    // Continue to repair attempts
  }
  
  let repaired = content;
  
  // Count open and close braces/brackets
  let openBraces = (repaired.match(/{/g) || []).length;
  let closeBraces = (repaired.match(/}/g) || []).length;
  let openBrackets = (repaired.match(/\[/g) || []).length;
  let closeBrackets = (repaired.match(/]/g) || []).length;
  
  // Add missing closing brackets/braces
  while (closeBrackets < openBrackets) {
    repaired += ']';
    closeBrackets++;
  }
  while (closeBraces < openBraces) {
    repaired += '}';
    closeBraces++;
  }
  
  // Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,\s*}/g, '}');
  repaired = repaired.replace(/,\s*]/g, ']');
  
  // Try to fix unclosed strings at the end
  const lastQuote = repaired.lastIndexOf('"');
  const lastBrace = repaired.lastIndexOf('}');
  if (lastQuote > lastBrace) {
    // There's an unclosed string, try to close it
    repaired = repaired.substring(0, lastQuote + 1) + '"}';
    // Re-add closing braces as needed
    openBraces = (repaired.match(/{/g) || []).length;
    closeBraces = (repaired.match(/}/g) || []).length;
    while (closeBraces < openBraces) {
      repaired += '}';
      closeBraces++;
    }
  }
  
  return JSON.parse(repaired);
}

// Call OpenAI API directly
async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
) {
  console.log(`Calling OpenAI API with model: ${model}`);
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 16384,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenAI API error (${response.status}):`, errorText);
    throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

// Call Gemini API directly (Universal AI pattern)
async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
) {
  console.log(`Calling Gemini API with model: ${model}`);
  
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API error (${response.status}):`, errorText);
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

// Call Claude API directly
async function callClaude(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
) {
  console.log(`Calling Claude API with model: ${model}`);
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 16384,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Claude API error (${response.status}):`, errorText);
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scriptContent, mode, provider = "gemini", focus = "balanced", customInstructions } = await req.json();
    
    console.log(`Enhancement request - mode: ${mode}, provider: ${provider}, focus: ${focus}, customInstructions: ${customInstructions ? 'provided' : 'none'}`);
    
    if (!scriptContent) {
      return new Response(
        JSON.stringify({ error: "Script content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and get provider config
    const providerKey = provider as ProviderKey;
    const providerConfig = PROVIDERS[providerKey];
    
    if (!providerConfig) {
      return new Response(
        JSON.stringify({ error: `Invalid provider: ${provider}. Use 'gemini', 'openai', or 'claude'` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = providerConfig.getApiKey();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `${providerConfig.name} API key not configured` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "analyze") {
      systemPrompt = `You are an expert script analyst and engagement coach for video and audio voiceover content. You analyze scripts for professional voice recording, focusing on engagement, conversational tone, and delivery. Return ONLY valid JSON, no markdown.`;
      
      userPrompt = `Analyze this script thoroughly for voiceover recording with focus on ENGAGEMENT and CONVERSATIONAL STYLE. Return a JSON object:

{
  "stats": {
    "wordCount": number,
    "sentenceCount": number,
    "avgWordsPerSentence": number,
    "estimatedDurationMinutes": number,
    "readabilityScore": "easy" | "moderate" | "difficult",
    "sectionsCount": number,
    "hasPauseMarkers": boolean,
    "engagementLevel": "low" | "medium" | "high",
    "conversationalTone": "formal" | "neutral" | "conversational"
  },
  "recommendations": [
    {
      "type": "engagement" | "conversational" | "pacing" | "clarity" | "hook" | "cta" | "pause" | "break" | "section" | "readability",
      "severity": "warning" | "suggestion" | "info",
      "title": "Short descriptive title",
      "description": "Detailed explanation of why this matters for audience connection",
      "originalText": "The exact text that needs attention",
      "suggestedText": "The improved conversational/engaging version",
      "location": "Beginning | Middle | End | Section name"
    }
  ],
  "pauseOpportunities": [
    {
      "afterText": "exact phrase where pause should be added",
      "reason": "why a pause here improves delivery"
    }
  ],
  "sectionBreaks": [
    {
      "beforeText": "text that should start a new section",
      "sectionTitle": "suggested section title"
    }
  ],
  "engagementAnalysis": {
    "openingHook": { "present": boolean, "quality": "weak" | "moderate" | "strong", "suggestion": "how to improve" },
    "audienceConnection": { "score": 1-10, "uses_you": boolean, "uses_questions": boolean, "suggestions": ["improvements"] },
    "callToAction": { "present": boolean, "clarity": "weak" | "moderate" | "strong", "suggestion": "how to improve" },
    "emotionalResonance": { "score": 1-10, "powerWords": number, "suggestions": ["improvements"] }
  },
  "overallAssessment": {
    "strengths": ["list of what works well"],
    "weaknesses": ["list of areas needing improvement"],
    "voiceoverReadiness": "ready" | "needs_minor_edits" | "needs_significant_work",
    "engagementScore": number (1-10),
    "topPriority": "What to fix first for maximum impact"
  }
}

Provide 8-12 specific, actionable recommendations. Focus on:
1. ENGAGEMENT: Opening hook strength, audience questions, power words
2. CONVERSATIONAL TONE: "You" usage, informal language, personal touches  
3. PACING: Pause opportunities, section breaks, rhythm
4. STRUCTURE: Clear transitions, compelling CTA, memorable close
5. CLARITY: Long sentences, technical jargon, readability

Script to analyze:
${scriptContent.substring(0, 6000)}`;
    } else {
      // Enhancement mode - comprehensive rewrite with optional focus customization
      
      // Build focus-specific instructions based on user selection
      const focusInstructions: Record<string, string> = {
        balanced: `Focus on general improvements across all areas: engagement, clarity, pacing, and conversational tone.`,
        engagement: `PRIORITIZE ENGAGEMENT ABOVE ALL:
- Create powerful hooks at the start and throughout
- Add rhetorical questions every 2-3 paragraphs
- Include power words (imagine, discover, transform, unlock, secret)
- Build anticipation and curiosity
- Add surprise elements and emotional peaks`,
        clarity: `PRIORITIZE CLARITY AND SIMPLICITY:
- Break down complex sentences into shorter, clearer ones
- Replace jargon with simple everyday language
- Use concrete examples instead of abstract concepts
- Ensure each paragraph has ONE clear point
- Add transition phrases between ideas`,
        pacing: `PRIORITIZE PACING AND RHYTHM:
- Add strategic pauses (...) after key points
- Vary sentence length (short-medium-long pattern)
- Add section breaks (---) for breathing room
- Create natural speech rhythm
- Include emphasis markers for key words`,
        conversational: `PRIORITIZE CONVERSATIONAL, PERSONAL TONE:
- Use "I" instead of "we" for personal sharing
- Add casual phrases (here's the thing, honestly, you know what)
- Include personal anecdotes and examples
- Make it sound like talking to a friend
- Remove formal/corporate language`,
        humor: `PRIORITIZE HUMOR AND PERSONALITY:
- Add light wit and clever observations
- Include unexpected analogies and comparisons
- Add self-deprecating humor where appropriate
- Make the audience smile or chuckle
- Keep it tasteful and professional
- Add personality quirks and memorable phrases`
      };
      
      const selectedFocus = focusInstructions[focus] || focusInstructions.balanced;
      
      // Add custom instructions if provided
      const customInstructionSection = customInstructions 
        ? `\n\n🎯 USER'S CUSTOM INSTRUCTIONS (HIGH PRIORITY - FOLLOW THESE):\n${customInstructions}\n`
        : '';
      
      systemPrompt = `You are an expert script editor and storytelling coach specializing in voiceover content for video and audio. You enhance scripts to be:
- More ENGAGING and conversational (like talking to a friend)
- Natural with proper pacing (pause markers: ..., section breaks: ---)
- Emotionally resonant with the audience
- Clear and easy to follow
Return ONLY valid JSON, no markdown or code blocks.`;

      userPrompt = `Enhance this script for professional voiceover recording.

🎯 ENHANCEMENT FOCUS: ${focus.toUpperCase()}
${selectedFocus}
${customInstructionSection}

ENHANCEMENT REQUIREMENTS:

📢 ENGAGEMENT & CONVERSATIONAL STYLE:
1. Convert formal/stiff language to warm, conversational tone
2. Add rhetorical questions to engage the audience
3. Use "you" and personal pronouns as appropriate
4. Add power words for emotion (imagine, discover, transform, unlock)
5. Create curiosity hooks at section starts
6. Add personal touches and relatable examples
7. Use active voice instead of passive

⏸️ PACING & DELIVERY:
8. Add pause markers (...) after important points, before reveals, for emphasis
9. Add section breaks (---) between major topics
10. Break long sentences into shorter, speakable chunks
11. Add emphasis markers for key terms

🎯 STRUCTURE:
12. Strong opening hook that grabs attention in first 5 seconds
13. Clear transitions between ideas
14. Compelling call-to-action at the end
15. End with memorable closing statement

Return this JSON structure:

{
  "enhancedScript": "The complete enhanced script with all improvements, pause markers (...), section breaks (---), and conversational style",
  "cleanScript": "Same script but without pause markers and breaks (for TTS)",
  "changes": [
    {
      "type": "engagement" | "conversational" | "pause" | "break" | "hook" | "transition" | "cta" | "pacing",
      "original": "The exact original text (10-50 words)",
      "enhanced": "The enhanced version",
      "reason": "Why this change improves engagement or delivery",
      "position": "start" | "middle" | "end"
    }
  ],
  "markers": {
    "pausesAdded": number,
    "sectionBreaksAdded": number,
    "sentencesRewritten": number,
    "engagementHooksAdded": number,
    "conversationalChanges": number
  },
  "engagementScore": {
    "before": number (1-10),
    "after": number (1-10),
    "improvements": ["list of key engagement improvements made"]
  },
  "summary": "2-3 sentence summary of key improvements including focus: ${focus} and any custom instructions applied"
}

Include 10-15 specific changes showing before/after. Apply the focus (${focus}) and any custom instructions as highest priority.

IMPORTANT: Return the COMPLETE enhanced script. Do not truncate or summarize. Include every section from start to finish.

Script to enhance:
${scriptContent}`;
    }

    let content: string | undefined;

    try {
      if (providerKey === "claude") {
        content = await callClaude(apiKey, providerConfig.model, systemPrompt, userPrompt);
      } else if (providerKey === "gemini") {
        content = await callGemini(apiKey, providerConfig.model, systemPrompt, userPrompt);
      } else if (providerKey === "openai") {
        content = await callOpenAI(apiKey, providerConfig.model, systemPrompt, userPrompt);
      } else {
        throw new Error(`Unsupported provider: ${providerKey}`);
      }
    } catch (apiError) {
      console.error(`${providerConfig.name} API error:`, apiError);
      
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      if (errorMessage.includes("429")) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (errorMessage.includes("402")) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `${providerConfig.name} enhancement failed: ${errorMessage}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from AI
    let parsedContent;
    try {
      const cleanContent = cleanJsonResponse(content);
      console.log("Cleaned content length:", cleanContent.length);
      
      // First try direct parse
      try {
        parsedContent = JSON.parse(cleanContent);
      } catch (directError) {
        // If direct parse fails, try repair
        console.log("Direct parse failed, attempting repair...");
        parsedContent = tryRepairJson(cleanContent);
        console.log("JSON repair successful");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response. Raw length:", content.length);
      console.error("First 500 chars:", content.substring(0, 500));
      console.error("Last 500 chars:", content.substring(content.length - 500));
      
      // Try to provide a fallback response for enhancement mode
      if (mode !== "analyze") {
        return new Response(
          JSON.stringify({ 
            success: true,
            mode,
            provider: providerKey,
            providerName: providerConfig.name,
            data: {
              enhancedScript: scriptContent,
              cleanScript: scriptContent,
              changes: [],
              markers: { pausesAdded: 0, sectionBreaksAdded: 0, sentencesRewritten: 0, engagementHooksAdded: 0, conversationalChanges: 0 },
              summary: "Enhancement completed but response formatting failed. Script preserved."
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // For analyze mode, return a minimal fallback
      return new Response(
        JSON.stringify({ 
          success: true,
          mode,
          provider: providerKey,
          providerName: providerConfig.name,
          data: {
            stats: {
              wordCount: scriptContent.split(/\s+/).filter(w => w).length,
              sentenceCount: scriptContent.split(/[.!?]+/).filter(s => s.trim()).length,
              readabilityScore: "moderate"
            },
            recommendations: [],
            overallAssessment: {
              strengths: ["Script received"],
              weaknesses: ["AI analysis response could not be parsed"],
              voiceoverReadiness: "needs_minor_edits"
            }
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        mode,
        provider: providerKey,
        providerName: providerConfig.name,
        data: parsedContent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("enhance-script error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
