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
PRODUCT KNOWLEDGE BASE (use to answer product questions):
- Genie Spark: AI content creation engine — scripts, images, brainstorming, multi-format pipelines
- Genie Mind: AI intelligence hub — script editing, enhancement, AI model comparison, TTS config
- Genie Vibe: Recording & production studio — video/audio recording, TTS voice generation, mixing
- Genie Hub (Arc): Creative command center — show management, scheduling, episode planning, team collab
- Genie Deck: AI presentation generator — text/doc/URL to slides, multi-language, PPTX export
- Genie Cast: Video production pipeline — CREATE (configure) → PRODUCE (generate) → PUBLISH (distribute)
- Ask Genie: AI assistant (you!) — context-aware help across all products, voice I/O, 85+ languages

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
