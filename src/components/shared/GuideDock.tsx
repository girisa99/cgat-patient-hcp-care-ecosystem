/**
 * GuideDock — Right-side character guide dock (REDESIGNED)
 * 
 * Features:
 * - Collapsed: sleek stacked circular avatars with glass morphism
 * - Peek: animated hint bubble with character-specific glow
 * - Open: full side panel with conversation + handoff transitions
 * - HANDOFF ANIMATIONS: Uses guideHandoffMachine for contextual motion
 *   - Crossfade: smooth for mode switch / page load
 *   - Tag-team: baton-pass with both visible for category select
 *   - Split-morph: dramatic split for publish readiness
 *   - Instant: immediate for user clicks
 * - REGIONALIZED: Uses IP detection → regional messages + TTS voices
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGuideStore, GUIDE_CHARACTERS, ANIM_TOKENS, type GuideAgent, type GuideMessage } from '@/stores/guideStore';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { useGuideTTS } from '@/hooks/useGuideTTS';
import { useIPBasedContent } from '@/hooks/useIPBasedContent';
import { resolveGuideRegion } from '@/config/guideMessageCatalog';
import {
  type HandoffContext, type HandoffStyle, type HandoffState,
  INITIAL_HANDOFF_CONTEXT, handoffTransition,
  resolveHandoffStyle, getHandoffVariants, HANDOFF_MOTIONS,
} from '@/machines/guideHandoffMachine';

// Character avatars
import oriAvatar from '@/assets/characters/ori-avatar.png';
import arcAvatar from '@/assets/characters/arc-avatar.png';

const AVATARS: Record<GuideAgent, string> = {
  ori: oriAvatar,
  arc: arcAvatar,
};

// ── Character Avatar with Handoff Animation ──────────────────────────────────

const CharacterAvatar: React.FC<{
  agent: GuideAgent;
  isActive: boolean;
  isExiting: boolean;
  isEntering: boolean;
  handoffStyle: HandoffStyle;
  onClick: () => void;
}> = ({ agent, isActive, isExiting, isEntering, handoffStyle, onClick }) => {
  const char = GUIDE_CHARACTERS[agent];
  const variants = getHandoffVariants(handoffStyle);

  // Determine animation state
  const getAnimateProps = (): any => {
    if (isExiting) return variants.exitVariant;
    if (isEntering) return {
      ...variants.enterAnimate,
      transition: variants.enterAnimate.transition,
    };
    if (isActive) return {
      scale: [1, 1.02, 1],
      transition: { duration: 3.2, ease: 'easeInOut' as const, repeat: Infinity },
    };
    return { scale: 1, opacity: 0.5 };
  };

  const initialProps = isEntering ? variants.enterInitial : undefined;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative w-12 h-12 rounded-full overflow-hidden transition-all duration-300',
        'border-2',
        isActive
          ? `${char.borderClass} ${char.glowClass}`
          : 'border-white/10 hover:opacity-80',
      )}
      initial={initialProps}
      animate={getAnimateProps()}
      whileHover={{ scale: 1.08 }}
      title={`${char.name} — ${char.role}`}
    >
      <img
        src={AVATARS[agent]}
        alt={char.name}
        className="w-full h-full object-cover"
      />
      {/* Active glow ring */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 12px ${char.color}40` }}
          animate={{
            boxShadow: [
              `0 0 8px ${char.color}20`,
              `0 0 20px ${char.color}50`,
              `0 0 8px ${char.color}20`,
            ],
          }}
          transition={{ duration: ANIM_TOKENS.GLOW_PULSE.duration, repeat: Infinity }}
        />
      )}
      {/* Entering glow pulse */}
      {isEntering && variants.glowPulse && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ boxShadow: `0 0 0px ${char.color}00` }}
          animate={{
            boxShadow: [
              `0 0 0px ${char.color}00`,
              `0 0 24px ${char.color}60`,
              `0 0 8px ${char.color}30`,
            ],
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}
    </motion.button>
  );
};

// ── Peek Bubble (Redesigned) ─────────────────────────────────────────────────

const PeekBubble: React.FC<{
  message: GuideMessage;
  isRTL: boolean;
  onDismiss: () => void;
  onCTA: (signal: GuideMessage['ctas'][0]['signal']) => void;
}> = ({ message, isRTL, onDismiss, onCTA }) => {
  const char = GUIDE_CHARACTERS[message.agent];

  useEffect(() => {
    if (message.autoDismissMs && message.autoDismissMs > 0) {
      const t = setTimeout(onDismiss, message.autoDismissMs);
      return () => clearTimeout(t);
    }
  }, [message.autoDismissMs, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.92 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'w-72 p-4 rounded-2xl backdrop-blur-2xl border',
        'bg-background/80 border-border/50',
        'shadow-[0_8px_40px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.05)]',
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header with character indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: char.color }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className={cn('text-xs font-bold tracking-wide uppercase', char.colorClass)}>
            {char.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {message.tone === 'celebratory' ? '🎉' : message.tone === 'encouraging' ? '✨' : ''}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-0.5 rounded-md hover:bg-muted/30"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message text */}
      <p className="text-sm text-foreground/90 leading-relaxed mb-3">{message.text}</p>

      {/* CTAs */}
      {message.ctas && message.ctas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.ctas.map((cta, i) => (
            <Button
              key={i}
              variant={i === 0 ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCTA(cta.signal)}
              className={cn(
                'h-7 text-xs rounded-lg',
                i === 0
                  ? 'bg-primary/90 hover:bg-primary text-primary-foreground'
                  : 'border-border/50 bg-background/50 hover:bg-muted/50',
              )}
            >
              {cta.label}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ── Open Panel (Redesigned) ──────────────────────────────────────────────────

const OpenPanel: React.FC<{
  messages: GuideMessage[];
  isRTL: boolean;
  onDismiss: () => void;
  onCTA: (signal: GuideMessage['ctas'][0]['signal']) => void;
}> = ({ messages, isRTL, onDismiss, onCTA }) => {
  const activeAgent = messages[0]?.agent || 'ori';
  const char = GUIDE_CHARACTERS[activeAgent];

  return (
    <motion.div
      initial={{ x: isRTL ? -24 : 24, opacity: 0, scale: 0.96 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: isRTL ? -24 : 24, opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'w-[320px] h-full rounded-2xl backdrop-blur-2xl border overflow-hidden flex flex-col',
        'bg-background/90 border-border/40',
        'shadow-[0_8px_48px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]',
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={AVATARS[activeAgent]}
              alt={char.name}
              className="w-9 h-9 rounded-full object-cover border-2"
              style={{ borderColor: `${char.color}40` }}
            />
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background"
              style={{ backgroundColor: char.color }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <p className={cn('text-sm font-bold', char.colorClass)}>{char.name}</p>
            <p className="text-[10px] text-muted-foreground">{char.role}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground/60 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/40"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.08 }}
            className="space-y-2"
          >
            <p className="text-sm text-foreground/90 leading-relaxed">{msg.text}</p>
            {msg.ctas && msg.ctas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {msg.ctas.map((cta, i) => (
                  <Button
                    key={i}
                    variant={i === 0 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onCTA(cta.signal)}
                    className={cn(
                      'h-8 text-xs rounded-lg',
                      i === 0
                        ? 'bg-primary/90 hover:bg-primary'
                        : 'border-border/40 hover:bg-muted/40',
                    )}
                  >
                    {cta.label}
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ── Main GuideDock (Redesigned) ──────────────────────────────────────────────

export const GuideDock: React.FC<{ className?: string }> = ({ className }) => {
  const {
    agent,
    surface,
    queue,
    voiceEnabled,
    regionalContext,
    handoff,
    dispatch,
    dismissGuide,
    setVoiceEnabled,
    setRegionalContext,
  } = useGuideStore();

  // IP-based content detection
  const { geoData, detectedZone, isDetected } = useIPBasedContent();

  // Update regional context when IP detection completes
  useEffect(() => {
    if (isDetected && geoData?.countryCode) {
      const ctx = resolveGuideRegion(
        navigator.languages?.[0] || navigator.language,
        geoData.countryCode,
      );
      setRegionalContext(ctx);
    }
  }, [isDetected, geoData?.countryCode, setRegionalContext]);

  // Idle detection
  useIdleTimer(dispatch, 20000, surface !== 'open');

  // TTS integration
  useGuideTTS({ countryCode: geoData?.countryCode });

  // Fire PAGE_LOAD on mount
  useEffect(() => {
    dispatch({ type: 'PAGE_LOAD' });
  }, [dispatch]);

  // Auto-advance handoff state machine after animation durations
  useEffect(() => {
    if (handoff.state === 'idle' || handoff.state === 'complete') return;

    const motionConfig = HANDOFF_MOTIONS[handoff.style];
    let timeoutMs = 0;

    if (handoff.state === 'exiting') {
      timeoutMs = motionConfig.exit.duration * 1000;
    } else if (handoff.state === 'overlap') {
      timeoutMs = motionConfig.overlapMs;
    } else if (handoff.state === 'entering') {
      timeoutMs = (motionConfig.enter.duration + motionConfig.enter.delay) * 1000;
    }

    const timer = setTimeout(() => {
      const state = useGuideStore.getState();
      let nextEvent: 'EXIT_COMPLETE' | 'OVERLAP_COMPLETE' | 'ENTER_COMPLETE';
      if (state.handoff.state === 'exiting') nextEvent = 'EXIT_COMPLETE';
      else if (state.handoff.state === 'overlap') nextEvent = 'OVERLAP_COMPLETE';
      else nextEvent = 'ENTER_COMPLETE';

      useGuideStore.setState({
        handoff: handoffTransition(state.handoff, { type: nextEvent }),
      });
    }, Math.max(timeoutMs, 16));

    return () => clearTimeout(timer);
  }, [handoff.state, handoff.style, handoff.startedAt]);

  const handleCTA = (signal: GuideMessage['ctas'][0]['signal']) => {
    dispatch(signal);
  };

  const handleAvatarClick = (clickedAgent: GuideAgent) => {
    if (clickedAgent === agent && surface !== 'collapsed') {
      dismissGuide();
    } else {
      useGuideStore.setState({ agent: clickedAgent, surface: 'open' });
    }
  };

  const isRTL = regionalContext.isRTL;

  // Derive avatar animation states from handoff machine
  const isOriExiting = handoff.state === 'exiting' && handoff.fromAgent === 'ori';
  const isArcExiting = handoff.state === 'exiting' && handoff.fromAgent === 'arc';
  const isOriEntering = (handoff.state === 'entering' || handoff.state === 'overlap') && handoff.toAgent === 'ori';
  const isArcEntering = (handoff.state === 'entering' || handoff.state === 'overlap') && handoff.toAgent === 'arc';

  return (
    <div className={cn('flex flex-col items-end gap-3 h-full', isRTL && 'items-start', className)}>
      {/* Open panel */}
      <AnimatePresence mode="wait">
        {surface === 'open' && queue.length > 0 && (
          <OpenPanel messages={queue} isRTL={isRTL} onDismiss={dismissGuide} onCTA={handleCTA} />
        )}
      </AnimatePresence>

      {/* Peek bubble */}
      <AnimatePresence>
        {surface === 'peek' && queue.length > 0 && (
          <div className="relative">
            <PeekBubble message={queue[queue.length - 1]} isRTL={isRTL} onDismiss={dismissGuide} onCTA={handleCTA} />
          </div>
        )}
      </AnimatePresence>

      {/* Avatar dock — always visible, now with handoff-aware animations */}
      <div className="flex flex-col items-center gap-2.5 p-2.5 rounded-2xl backdrop-blur-2xl bg-background/60 border border-border/30 shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
        <CharacterAvatar
          agent="ori"
          isActive={agent === 'ori'}
          isExiting={isOriExiting}
          isEntering={isOriEntering}
          handoffStyle={handoff.style}
          onClick={() => handleAvatarClick('ori')}
        />

        {/* Separator with handoff indicator */}
        <div className="relative w-8">
          <div className="w-full h-[1px] bg-border/30" />
          {(handoff.state === 'overlap' || handoff.state === 'exiting') && (
            <motion.div
              className="absolute inset-x-0 top-0 h-[2px] rounded-full bg-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: HANDOFF_MOTIONS[handoff.style].overlapMs / 1000 || 0.3 }}
            />
          )}
        </div>

        <CharacterAvatar
          agent="arc"
          isActive={agent === 'arc'}
          isExiting={isArcExiting}
          isEntering={isArcEntering}
          handoffStyle={handoff.style}
          onClick={() => handleAvatarClick('arc')}
        />

        {/* Voice toggle */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="mt-1 p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-all"
          title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
        >
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default GuideDock;
