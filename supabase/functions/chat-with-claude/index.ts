/**
 * CHAT WITH CLAUDE — Claude LLM Edge Function
 * 
 * ROUTING: Claude Zone (Western/EU/LATAM) per master-provider-routing-registry
 * MODEL: Claude Sonnet 4 (primary), Claude 3.5 Haiku (fallback)
 * 
 * SECURITY: Rate-limited per IP, input-validated, public endpoint
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ============================================
// RATE LIMITING — In-memory per IP
// ============================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests/min per IP (LLM is expensive)
const MAX_MESSAGE_LENGTH = 5000; // Max chars per message
const MAX_MESSAGES = 20; // Max conversation history

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || req.headers.get('x-real-ip')
    || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetIn: entry.resetAt - now };
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

// Input sanitization
function sanitizeMessage(content: string): string {
  return content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .slice(0, MAX_MESSAGE_LENGTH);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);

  // Rate limit check
  const rateCheck = checkRateLimit(clientIP);
  if (!rateCheck.allowed) {
    console.warn(`[chat-with-claude] Rate limited IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait and try again.', retryAfter: Math.ceil(rateCheck.resetIn / 1000) }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
    );
  }

  try {
    const { messages, model = 'claude-sonnet-4-20250514', max_tokens = 4000 } = await req.json();

    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: `Maximum ${MAX_MESSAGES} messages allowed`, success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and cap max_tokens
    const cappedMaxTokens = Math.min(Math.max(100, max_tokens), 8000);

    // Sanitize all messages
    const sanitizedMessages = messages.map((msg: any) => ({
      role: ['user', 'assistant', 'system'].includes(msg.role) ? msg.role : 'user',
      content: typeof msg.content === 'string' ? sanitizeMessage(msg.content) : '',
    })).filter((msg: any) => msg.content.length > 0);
    
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    console.log(`[chat-with-claude] Request from ${clientIP} - model: ${model}, msgs: ${sanitizedMessages.length}, maxTokens: ${cappedMaxTokens}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: cappedMaxTokens,
        messages: sanitizedMessages.filter((msg: any) => msg.role !== 'system'),
        system: sanitizedMessages.find((msg: any) => msg.role === 'system')?.content || 'You are a helpful AI assistant.',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[chat-with-claude] API error:', response.status, errorData);
      throw new Error(`Claude API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('[chat-with-claude] Response received successfully');

    return new Response(JSON.stringify({
      success: true,
      content: data.content[0]?.text || '',
      usage: data.usage,
      provider: 'claude',
      routing: 'Claude Zone — Western/EU/LATAM primary LLM'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[chat-with-claude] Error:', error);
    return new Response(JSON.stringify({ 
      error: (error instanceof Error ? error.message : 'Failed to process Claude request'),
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
