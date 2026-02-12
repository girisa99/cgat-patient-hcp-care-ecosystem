import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * ASK GENIE SUPPORT EDGE FUNCTION
 * 
 * AI-powered support assistant that:
 * 1. Answers questions using knowledge base
 * 2. Detects when escalation is needed
 * 3. Creates support sessions and logs conversations
 */

interface SupportRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  userTier?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// Knowledge base for common support topics
const GENIE_KNOWLEDGE_BASE = {
  products: {
    'genie-spark': 'Genie Spark handles multi-modal script generation from various input types (text, documents, voice, media).',
    'genie-mind': 'Genie Mind focuses on script editing, enhancement, TTS, and voice work including voice cloning.',
    'genie-vibe': 'Genie Vibe covers audio/video production including recording, trimming, stitching, and multi-track editing.',
    'genie-deck': 'Genie Deck generates AI presentations and slides with various templates and export options.',
    'genie-arc': 'Genie Arc manages project scheduling, Kanban boards, and team workflows.',
    'genie-cast': 'Genie Cast handles global distribution, 14-region localization, and marketing automation.',
  },
  tiers: {
    free: 'Free tier includes basic access to Genie Studio and Ask Genie support.',
    starter: 'Starter tier ($12/mo) includes access to Spark, Mind, and Deck products.',
    creator: 'Creator tier ($29/mo) adds Vibe for audio/video production.',
    pro: 'Pro tier ($59/mo) includes Analytics, advanced features, and 5 team seats.',
    business: 'Business tier ($149/mo) includes workspaces, team management, and 15 seats.',
    enterprise: 'Enterprise tier includes unlimited seats, whitelabel, and dedicated support.',
  },
  common_issues: [
    { keywords: ['login', 'sign in', 'password', 'access'], response: 'For login issues, try resetting your password via the auth page. If problems persist, check your email verification status.' },
    { keywords: ['billing', 'payment', 'charge', 'subscription'], response: 'For billing questions, visit your Subscription page. You can upgrade, downgrade, or manage payment methods there.' },
    { keywords: ['export', 'download', 'save'], response: 'Most products support multiple export formats. Check the export options in the product\'s toolbar or settings panel.' },
    { keywords: ['slow', 'loading', 'performance'], response: 'Performance issues may be related to browser cache or network. Try clearing cache, using a different browser, or checking your internet connection.' },
    { keywords: ['error', 'bug', 'crash', 'broken', 'not working'], response: 'I understand you\'re experiencing a technical issue. Could you provide more details about what you were trying to do when the error occurred?' },
  ],
};

// Detect if escalation is needed based on message content
function detectEscalationNeeded(message: string, conversationLength: number): { needed: boolean; reason?: string } {
  const lowerMessage = message.toLowerCase();
  
  // Urgent keywords that trigger escalation
  const urgentKeywords = ['urgent', 'emergency', 'critical', 'data loss', 'security', 'hacked', 'compromised', 'legal'];
  const frustrationKeywords = ['angry', 'frustrated', 'terrible', 'worst', 'hate', 'unacceptable', 'refund', 'cancel subscription'];
  const complexKeywords = ['api', 'integration', 'webhook', 'custom', 'enterprise', 'contract', 'bulk'];
  
  if (urgentKeywords.some(k => lowerMessage.includes(k))) {
    return { needed: true, reason: 'Urgent issue detected' };
  }
  
  if (frustrationKeywords.some(k => lowerMessage.includes(k))) {
    return { needed: true, reason: 'Customer frustration detected' };
  }
  
  if (complexKeywords.some(k => lowerMessage.includes(k))) {
    return { needed: true, reason: 'Complex technical inquiry' };
  }
  
  // After 5 exchanges, suggest escalation
  if (conversationLength >= 10) {
    return { needed: true, reason: 'Extended conversation - human review recommended' };
  }
  
  return { needed: false };
}

// Find relevant knowledge base response
function findKnowledgeResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Check products
  for (const [product, info] of Object.entries(GENIE_KNOWLEDGE_BASE.products)) {
    if (lowerMessage.includes(product) || lowerMessage.includes(product.replace('genie-', ''))) {
      return info;
    }
  }
  
  // Check tiers
  for (const [tier, info] of Object.entries(GENIE_KNOWLEDGE_BASE.tiers)) {
    if (lowerMessage.includes(tier) || lowerMessage.includes('pricing') || lowerMessage.includes('plan')) {
      return info;
    }
  }
  
  // Check common issues
  for (const issue of GENIE_KNOWLEDGE_BASE.common_issues) {
    if (issue.keywords.some(k => lowerMessage.includes(k))) {
      return issue.response;
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userTier, conversationHistory = [] }: SupportRequest = await req.json();
    
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============================================
    // JWT AUTHENTICATION — Validate user identity
    // ============================================
    const authHeader = req.headers.get('Authorization');
    let authenticatedUserId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await authClient.auth.getUser(token);
      authenticatedUserId = user?.id || null;
    }

    // Require authentication for persistent sessions (database writes)
    if (sessionId && !authenticatedUserId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required for persistent sessions' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[AskGenieSupport] Processing message | Session: ${sessionId || 'new'} | User: ${authenticatedUserId || 'anonymous'}`);

    // Initialize Supabase service client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check escalation
    const escalationCheck = detectEscalationNeeded(message, conversationHistory.length);
    
    // Try knowledge base first
    const knowledgeResponse = findKnowledgeResponse(message);
    
    let aiResponse: string;
    let responseSource: 'knowledge_base' | 'ai' = 'knowledge_base';
    
    if (knowledgeResponse && !escalationCheck.needed) {
      aiResponse = knowledgeResponse;
    } else {
      // Use Lovable AI Gateway for complex questions
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      
      if (!lovableApiKey) {
        console.error('[AskGenieSupport] LOVABLE_API_KEY not configured');
        aiResponse = "I apologize, but I'm having trouble processing your request right now. Please try again later or submit a support ticket.";
      } else {
        try {
          const systemPrompt = `You are Ask Genie, the AI support assistant for Genie Studio - a creative content production platform.

Your knowledge includes:
- 7 products: Genie Spark (script generation), Mind (editing/TTS), Vibe (A/V production), Deck (presentations), Arc (project management), Cast (distribution), and Ask Genie (support)
- 6 subscription tiers: Free, Starter ($12), Creator ($29), Pro ($59), Business ($149), Enterprise
- 206 AI pipelines across 21 categories

Guidelines:
1. Be helpful, concise, and professional
2. If you don't know something specific, acknowledge it and offer to escalate
3. For billing/account issues, direct users to their Subscription page
4. For technical issues, ask clarifying questions before suggesting solutions
5. Always end with asking if there's anything else you can help with

Current user tier: ${userTier || 'unknown'}`;

          const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: message }
          ];

          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-3-flash-preview',
              messages,
              temperature: 0.7,
              max_tokens: 1000,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[AskGenieSupport] AI Gateway error: ${response.status} - ${errorText}`);
            throw new Error(`AI Gateway error: ${response.status}`);
          }

          const data = await response.json();
          aiResponse = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
          responseSource = 'ai';
        } catch (aiError) {
          console.error('[AskGenieSupport] AI call failed:', aiError);
          aiResponse = knowledgeResponse || "I'm having trouble connecting to my AI systems. Let me help you submit a ticket to our support team instead.";
        }
      }
    }

    // Add escalation suggestion if needed
    if (escalationCheck.needed) {
      aiResponse += `\n\n---\n**I recommend connecting you with a human support agent** for this matter (${escalationCheck.reason}). Would you like me to create a support ticket?`;
    }

    // Log the conversation to database (if session exists)
    if (sessionId) {
      try {
        await supabase.from('genie_support_messages').insert({
          session_id: sessionId,
          sender_type: 'user',
          content: message,
        });
        
        await supabase.from('genie_support_messages').insert({
          session_id: sessionId,
          sender_type: 'ai',
          content: aiResponse,
          ai_model_used: responseSource === 'ai' ? 'gemini-3-flash-preview' : null,
          confidence_score: responseSource === 'knowledge_base' ? 0.95 : 0.85,
        });
      } catch (logError) {
        console.error('[AskGenieSupport] Failed to log messages:', logError);
      }
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      sessionId,
      escalationNeeded: escalationCheck.needed,
      escalationReason: escalationCheck.reason,
      responseSource,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[AskGenieSupport] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      response: "I apologize, but something went wrong. Please try again or submit a support ticket.",
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
