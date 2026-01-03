import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Provider configurations
const PROVIDERS = {
  gemini: {
    name: "Google Gemini",
    endpoint: "https://ai.gateway.lovable.dev/v1/chat/completions",
    model: "google/gemini-2.5-flash",
    getApiKey: () => Deno.env.get("LOVABLE_API_KEY"),
  },
  openai: {
    name: "OpenAI GPT",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    getApiKey: () => Deno.env.get("OPENAI_API_KEY"),
  },
  claude: {
    name: "Anthropic Claude",
    endpoint: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-20250514",
    getApiKey: () => Deno.env.get("ANTHROPIC_API_KEY") || Deno.env.get("CLAUDE_API_KEY"),
  },
};

type ProviderKey = keyof typeof PROVIDERS;

async function callGeminiOrOpenAI(
  endpoint: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
) {
  const response = await fetch(endpoint, {
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
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

async function callClaude(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
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
    const { scriptContent, mode, provider = "gemini" } = await req.json();
    
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
      systemPrompt = `You are a professional script analyst for video content. Analyze the given script and provide detailed, actionable recommendations.`;
      userPrompt = `Analyze this video script and provide recommendations in the following JSON format:
{
  "stats": {
    "wordCount": number,
    "sentenceCount": number,
    "avgWordsPerSentence": number,
    "estimatedDurationMinutes": number,
    "readabilityScore": "easy" | "moderate" | "difficult"
  },
  "recommendations": [
    {
      "type": "pacing" | "clarity" | "engagement" | "length" | "readability",
      "severity": "info" | "warning" | "suggestion",
      "title": "Brief title",
      "description": "Detailed actionable recommendation",
      "originalText": "text from script if applicable",
      "suggestedText": "improved version if applicable"
    }
  ]
}

Script to analyze:
${scriptContent}`;
    } else {
      // Enhancement mode
      systemPrompt = `You are a professional script editor for video voiceovers. Your job is to enhance scripts for better delivery while preserving the original meaning and voice. Focus on:
- Improving flow and pacing for spoken delivery
- Fixing awkward phrasing
- Adding natural pauses where needed (use "..." for pauses)
- Removing filler words and redundancy
- Making sentences more conversational
- Improving clarity without changing the core message

IMPORTANT: Return your response in the exact JSON format specified.`;

      userPrompt = `Enhance this video script for better voiceover delivery. Return a JSON response with:
{
  "enhancedScript": "The full enhanced script text",
  "cleanScript": "Script optimized for TTS (no pause markers, clean punctuation)",
  "changes": [
    {
      "type": "modification" | "addition" | "removal" | "formatting",
      "original": "original text",
      "enhanced": "enhanced text",
      "reason": "brief explanation of why this change improves the script"
    }
  ],
  "summary": "Brief summary of key improvements made"
}

Original script:
${scriptContent}`;
    }

    let content: string | undefined;

    try {
      if (providerKey === "claude") {
        content = await callClaude(apiKey, providerConfig.model, systemPrompt, userPrompt);
      } else {
        content = await callGeminiOrOpenAI(
          providerConfig.endpoint,
          apiKey,
          providerConfig.model,
          systemPrompt,
          userPrompt
        );
      }
    } catch (apiError) {
      console.error(`${providerConfig.name} API error:`, apiError);
      
      // Check for rate limits
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
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse AI response",
          rawContent: content 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
