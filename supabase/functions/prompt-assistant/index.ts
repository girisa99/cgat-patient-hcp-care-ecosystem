/**
 * prompt-assistant — Universal AI prompt operations.
 *
 * Modes:
 *   - enhance:  Polish & improve the existing prompt (keep intent, add craft)
 *   - rewrite:  Apply a natural-language instruction to transform the prompt
 *   - suggest:  Return 3 alternative variations
 *   - localize: Adapt to a target region/language while preserving intent
 *
 * Targets (just changes the system-prompt framing):
 *   - script_line       — character dialogue
 *   - visual_prompt     — image/video generation prompt
 *   - transition_prompt — scene-to-scene transition description
 *   - generic           — fallback
 *
 * Uses the Lovable AI Gateway via tool-calling for structured output.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

type Mode = "enhance" | "rewrite" | "suggest" | "localize";
type Target = "script_line" | "visual_prompt" | "transition_prompt" | "generic";

interface RequestBody {
  text: string;
  mode: Mode;
  target?: Target;
  instruction?: string;        // for rewrite mode
  targetLanguage?: string;     // for localize mode (BCP-47, e.g. "es-MX")
  targetRegion?: string;       // for localize mode (free-form, e.g. "MENA")
  context?: {                  // optional surrounding info to inform the AI
    sceneTitle?: string;
    character?: string;
    style?: string;
    industry?: string;
    audience?: string;
  };
  model?: string;
}

const TARGET_FRAMING: Record<Target, string> = {
  script_line:
    "You are a senior screenwriter polishing a single dialogue line. Keep it short, in character, natural to speak aloud. Output ONLY the line, no quotes or stage directions unless they exist in the input.",
  visual_prompt:
    "You are a senior cinematographer / image-prompt engineer. Improve prompts for AI image and video generators. Be specific about subject, action, framing, lighting, mood, and style — but keep it under 80 words and avoid contradictions.",
  transition_prompt:
    "You are a film editor describing a scene-to-scene transition. Be concise (1–2 sentences). Specify motion, timing, and what bridges the two scenes.",
  generic:
    "You are a careful editor improving a piece of text while preserving its intent.",
};

function modeInstruction(body: RequestBody): string {
  switch (body.mode) {
    case "enhance":
      return "Improve craft, specificity, and flow. Do NOT change intent or scope. Return ONE improved version.";
    case "rewrite":
      return `Apply this instruction from the user: "${body.instruction || "rewrite to be more vivid"}". Return ONE rewritten version.`;
    case "suggest":
      return "Return EXACTLY 3 distinct alternatives, each taking a different creative angle.";
    case "localize": {
      const lang = body.targetLanguage || "en";
      const region = body.targetRegion ? ` (${body.targetRegion})` : "";
      return `Adapt the text for the language code "${lang}"${region}. Translate AND localize cultural references, idioms, and tone. Return ONE adapted version.`;
    }
  }
}

function buildContextBlock(ctx?: RequestBody["context"]): string {
  if (!ctx) return "";
  const parts: string[] = [];
  if (ctx.sceneTitle) parts.push(`Scene: ${ctx.sceneTitle}`);
  if (ctx.character) parts.push(`Speaking character: ${ctx.character}`);
  if (ctx.style) parts.push(`Visual style: ${ctx.style}`);
  if (ctx.industry) parts.push(`Industry: ${ctx.industry}`);
  if (ctx.audience) parts.push(`Audience: ${ctx.audience}`);
  return parts.length ? `\n\nContext:\n${parts.join("\n")}` : "";
}

function toolForMode(mode: Mode) {
  if (mode === "suggest") {
    return {
      type: "function" as const,
      function: {
        name: "return_alternatives",
        description: "Return three alternative versions of the input.",
        parameters: {
          type: "object",
          properties: {
            alternatives: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  angle: {
                    type: "string",
                    description: "One-line description of this variant's angle",
                  },
                },
                required: ["text", "angle"],
                additionalProperties: false,
              },
            },
          },
          required: ["alternatives"],
          additionalProperties: false,
        },
      },
    };
  }

  return {
    type: "function" as const,
    function: {
      name: "return_text",
      description: "Return the single improved/rewritten/localized text.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string" },
          notes: {
            type: "string",
            description: "One-line summary of what was changed (optional)",
          },
        },
        required: ["text"],
        additionalProperties: false,
      },
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (!body?.text || typeof body.text !== "string") {
      return new Response(
        JSON.stringify({ error: "Field 'text' is required (string)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const mode: Mode = body.mode;
    if (!["enhance", "rewrite", "suggest", "localize"].includes(mode)) {
      return new Response(
        JSON.stringify({ error: "Field 'mode' must be one of: enhance | rewrite | suggest | localize" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const target: Target = body.target || "generic";
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = TARGET_FRAMING[target];
    const userPrompt = [
      `Task: ${modeInstruction(body)}`,
      buildContextBlock(body.context),
      `\n\nInput text:\n"""\n${body.text}\n"""`,
    ].join("");

    const tool = toolForMode(mode);

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: body.model || DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: tool.function.name } },
      }),
    });

    // Surface gateway errors
    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please retry in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("[prompt-assistant] Gateway error", aiResp.status, errText);
      return new Response(
        JSON.stringify({ error: `AI gateway error: ${aiResp.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("[prompt-assistant] No tool_call in response", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "AI did not return a structured response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("[prompt-assistant] Failed to parse tool args", e);
      return new Response(
        JSON.stringify({ error: "AI returned malformed JSON" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ mode, target, ...parsed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[prompt-assistant] Unhandled error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
