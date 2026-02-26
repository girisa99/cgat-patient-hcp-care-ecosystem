/**
 * useAskGenieSupport — Support-specific state for Ask Genie
 *
 * Extracted from AskGenie.tsx to keep support logic isolated.
 * Manages: session creation, escalation detection, escalation-to-human,
 * conversation clearing, and support context injection.
 *
 * Only active when product === 'support'. Returns no-ops otherwise.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenieStudioAuth } from './useGenieStudioAuth';
import { toast } from 'sonner';

// ── Escalation keyword detection ────────────────────────────────────────────

const ESCALATION_KEYWORDS = /\b(human|agent|person|escalate|talk to someone|real person|manager|supervisor|complaint|refund|billing dispute|security breach|data loss|legal)\b/i;

// ── Support Knowledge Base (ported from ask-genie-support edge function) ───

const SUPPORT_KNOWLEDGE_BASE = `
PRODUCT KNOWLEDGE BASE (7 core products — use to answer ALL product questions):

1. Genie Spark — AI content creation engine
   Scripts, images, brainstorming, multi-format pipelines, content repurposing
   Route: /genie-spark

2. Genie Mind — AI intelligence hub
   Script editing & enhancement, TTS voice config, voice cloning, AI model comparison, translation
   Route: /genie-mind

3. Genie Vibe — Recording & production studio
   Video/audio recording, TTS voice generation, mixing, podcast, lip-sync, dubbing, avatar
   Route: /genie-vibe

4. Genie Deck — AI presentation generator
   Text/doc/URL to slides, multi-language parallel generation, PPTX export, brand customization
   Route: /genie-deck

5. Genie Cast — End-to-end video production pipeline
   CREATE (scenes, styles, prompts, regions) → PRODUCE (AI generation, GPU rendering, assembly) → PUBLISH (multi-platform distribution, scheduling, analytics)
   Supports: 16 regions, 62 subregions, 85+ languages, 19+ AI providers, 4 AI zones
   Route: /genie-cast

6. Genie Hub — Central management dashboard (formerly "Arc" / "Admin")
   15+ modules: Kanban task board, production calendar, content scheduler, content library, composition studio, team management, workspace management, whitelabel branding, production analytics, enterprise analytics, error analytics, team collaboration, AI intelligence, command center, product setup
   NOTE: "Genie Arc" and "Genie Admin" are LEGACY names → now "Genie Hub"
   Route: /genie-hub

7. Ask Genie — AI assistant across ALL products
   Context-aware help, voice I/O (STT + TTS) in 85+ languages, 16 regions, workflow diagrams
   Available inside every product via the chat panel

GLOBAL COVERAGE:
- 16 parent regions: NAM, EU, EURASIA, TURKEY, MENA, AFRICA, INDIA, PAKISTAN, BANGLADESH, SOUTH_ASIA, SEA, CJK, LATAM, CARIBBEAN, OCEANIA, CENTRAL_ASIA
- 62 subregions with cultural adaptation
- 85+ languages (63 with voice STT/TTS support)
- 4 AI zones: Claude Zone, Alibaba Zone, Gemini Zone, Fallback Zone (GPT-4o)

SUBSCRIPTION TIERS:
- Free ($0/mo): 3 products, 50 credits/mo, 720p, 2 languages, community support
- Starter ($19/mo): 5 products, 200 credits/mo, 1080p, 5 languages, email support (24h SLA)
- Creator ($39/mo): All products, 500 credits/mo, 1080p + social formats, 10 languages, priority email (24h SLA)
- Pro ($79/mo): All products, 2000 credits/mo, 4K, 25 languages, priority support (12h SLA)
- Business ($149/mo): All products, 5000 credits/mo, 4K + custom, all languages, dedicated agent (4h SLA)
- Enterprise (custom): Unlimited, custom SLA (1h), dedicated team, on-premise option

COMMON ISSUES & SOLUTIONS:
- Login problems: Clear browser cache, check email/password, try "Forgot Password", check if account is verified
- Billing questions: Go to Settings > Subscription, check invoice history, changes apply next billing cycle
- Export failures: Check file size limits for your tier, ensure content is fully generated before export
- Performance issues: Try refreshing, clear cache, check internet connection, reduce video quality if needed
- Bug reports: Note the exact steps to reproduce, include browser/OS info, check if issue persists in incognito
- Cast production stuck: Check AI provider status, verify region/language settings, try regenerating the scene
- Hub module not loading: Refresh page, check subscription tier access, clear local storage cache
`.trim();

// ── Hook ────────────────────────────────────────────────────────────────────

export interface UseAskGenieSupportReturn {
  /** Whether we're in support mode */
  isSupport: boolean;
  /** Whether escalation banner should show */
  escalationNeeded: boolean;
  /** Current support session ID */
  supportSessionId: string | null;
  /** The support knowledge base to inject into the system prompt */
  supportKnowledgeBase: string;
  /** Additional support context for the system prompt */
  getSupportPromptContext: () => string;
  /** Check if a message contains escalation intent */
  detectEscalation: (text: string) => boolean;
  /** Create a support session (called on first message) */
  createSession: () => Promise<void>;
  /** Escalate to human agent */
  escalateToHuman: (reason?: string) => Promise<void>;
  /** Clear conversation and reset state */
  clearConversation: () => void;
  /** Called when messages are cleared externally */
  onMessagesCleared: () => void;
}

export function useAskGenieSupport(isActive: boolean): UseAskGenieSupportReturn {
  const { genieUser, isAuthenticated } = useGenieStudioAuth();
  const [supportSessionId, setSupportSessionId] = useState<string | null>(null);
  const [escalationNeeded, setEscalationNeeded] = useState(false);

  // ── Create support session in DB ──
  const createSession = useCallback(async () => {
    if (!isActive || !isAuthenticated || supportSessionId) return;
    try {
      const { data, error } = await supabase
        .from('genie_support_sessions')
        .insert({
          user_id: genieUser?.auth_user_id,
          status: 'active',
          user_tier: genieUser?.current_subscription_tier,
        })
        .select()
        .single();
      if (!error && data) setSupportSessionId(data.id);
    } catch (err) {
      console.error('[AskGenieSupport] Failed to create session:', err);
    }
  }, [isActive, isAuthenticated, genieUser, supportSessionId]);

  // ── Detect escalation keywords ──
  const detectEscalation = useCallback((text: string): boolean => {
    if (!isActive) return false;
    const detected = ESCALATION_KEYWORDS.test(text);
    if (detected) setEscalationNeeded(true);
    return detected;
  }, [isActive]);

  // ── Escalate to human agent ──
  const escalateToHuman = useCallback(async (reason?: string) => {
    if (!supportSessionId) await createSession();

    try {
      if (supportSessionId) {
        await supabase
          .from('genie_support_sessions')
          .update({
            status: 'escalated',
            escalation_requested: true,
            ended_at: new Date().toISOString(),
          })
          .eq('id', supportSessionId);
      }
      setEscalationNeeded(false);
      toast.success('Escalation submitted — a support agent will contact you soon.');
    } catch (err) {
      console.error('[AskGenieSupport] Escalation failed:', err);
      toast.error('Escalation failed — please try again.');
    }
  }, [supportSessionId, createSession]);

  // ── Get support-mode prompt context ──
  const getSupportPromptContext = useCallback((): string => {
    if (!isActive) return '';
    return `\nSUPPORT MODE ACTIVE:
- User tier: ${genieUser?.current_subscription_tier || 'free'}
- Authenticated: ${isAuthenticated ? 'Yes' : 'No'}
- Session: ${supportSessionId || 'none'}
- If you cannot resolve the issue after 2 attempts, suggest escalation to a human agent.
- For billing/account/security issues, proactively offer escalation.

${SUPPORT_KNOWLEDGE_BASE}`;
  }, [isActive, genieUser, isAuthenticated, supportSessionId]);

  // ── Clear conversation ──
  const clearConversation = useCallback(() => {
    setSupportSessionId(null);
    setEscalationNeeded(false);
  }, []);

  const onMessagesCleared = useCallback(() => {
    setEscalationNeeded(false);
  }, []);

  return {
    isSupport: isActive,
    escalationNeeded,
    supportSessionId,
    supportKnowledgeBase: isActive ? SUPPORT_KNOWLEDGE_BASE : '',
    getSupportPromptContext,
    detectEscalation,
    createSession,
    escalateToHuman,
    clearConversation,
    onMessagesCleared,
  };
}
