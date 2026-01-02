import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scriptContent, mode } = await req.json();
    
    if (!scriptContent) {
      return new Response(
        JSON.stringify({ error: "Script content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI enhancement failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

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
