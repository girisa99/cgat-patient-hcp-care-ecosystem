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

// Helper to clean markdown from AI response
function cleanJsonResponse(content: string): string {
  let cleaned = content.trim();
  
  // Remove markdown code blocks (various formats)
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  
  // Find the first { or [ and last } or ]
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const start = firstBrace === -1 ? firstBracket : 
                firstBracket === -1 ? firstBrace : 
                Math.min(firstBrace, firstBracket);
  
  if (start > 0) {
    cleaned = cleaned.substring(start);
  }
  
  // Find last closing brace/bracket
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  const end = Math.max(lastBrace, lastBracket);
  
  if (end > 0 && end < cleaned.length - 1) {
    cleaned = cleaned.substring(0, end + 1);
  }
  
  return cleaned.trim();
}

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
      max_tokens: 4096,
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
      systemPrompt = `You are a professional script analyst. Analyze scripts and return ONLY valid JSON, no markdown.`;
      userPrompt = `Analyze this script and return a JSON object with this exact structure (no markdown, just JSON):
{"stats":{"wordCount":0,"sentenceCount":0,"avgWordsPerSentence":0,"estimatedDurationMinutes":0,"readabilityScore":"easy"},"recommendations":[{"type":"pacing","severity":"info","title":"Title","description":"Description"}]}

Provide 3-5 specific recommendations. Script:
${scriptContent.substring(0, 3000)}`;
    } else {
      // Enhancement mode - keep response concise
      systemPrompt = `You are a script editor. Enhance scripts for voiceover delivery. Return ONLY valid JSON, no markdown or code blocks.`;

      userPrompt = `Enhance this script for voiceover. Return ONLY this JSON structure (no markdown):
{"enhancedScript":"full enhanced text with ... for pauses","cleanScript":"same text without pause markers","changes":[{"type":"modification","original":"short excerpt","enhanced":"improved version","reason":"why"}],"summary":"2-3 sentence summary"}

Keep changes array to 5 most important changes max. Script:
${scriptContent.substring(0, 3000)}`;
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
      parsedContent = JSON.parse(cleanContent);
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
              summary: "Enhancement completed but response formatting failed. Script preserved."
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse AI response. Please try again.",
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
