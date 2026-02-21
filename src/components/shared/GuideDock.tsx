/**
 * GuideDock — Right-side character guide dock
 * 
 * Features:
 * - Collapsed: stacked circular avatars (Ori + Arc)
 * - Peek: small hint bubble next to active character
 * - Open: full side panel (320px max) with conversation
 * - Framer-motion animations using ANIM_TOKENS
 * - One character visible/active at a time
 * - REGIONALIZED: Uses IP detection → regional messages + TTS voices
 * 
 * Part of the Genie Suite global guide system.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGuideStore, GUIDE_CHARACTERS, ANIM_TOKENS, type GuideAgent, type GuideMessage } from '@/stores/guideStore';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { useGuideTTS } from '@/hooks/useGuideTTS';
import { useIPBasedContent } from '@/hooks/useIPBasedContent';
import { resolveGuideRegion } from '@/config/guideMessageCatalog';

// Character avatars
import oriAvatar from '@/assets/characters/ori-avatar.png';
import arcAvatar from '@/assets/characters/arc-avatar.png';

const AVATARS: Record<GuideAgent, string> = {
  ori: oriAvatar,
  arc: arcAvatar,
};

// ── Avatar Button ────────────────────────────────────────────────────────────

const CharacterAvatar: React.FC<{
  agent: GuideAgent;
  isActive: boolean;
  onClick: () => void;
}> = ({ agent, isActive, onClick }) => {
  const char = GUIDE_CHARACTERS[agent];
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300',
        isActive
          ? `${char.borderClass} ${char.glowClass}`
          : 'border-white/10 opacity-50 hover:opacity-80',
      )}
      animate={
        isActive
          ? {
              scale: [1, 1.02, 1],
              transition: {
                duration: 3.2,
                ease: 'easeInOut',
                repeat: Infinity,
              },
            }
          : { scale: 1 }
      }
      whileHover={{ scale: 1.08 }}
      title={`${char.name} — ${char.role}`}
    >
      <img
        src={AVATARS[agent]}
        alt={char.name}
        className="w-full h-full object-cover"
      />
      {isActive && (
        <motion.div
          className={cn('absolute inset-0 rounded-full', char.ringClass)}
          style={{ boxShadow: `0 0 12px ${char.color}40` }}
          animate={{
            boxShadow: [
              `0 0 8px ${char.color}20`,
              `0 0 16px ${char.color}40`,
              `0 0 8px ${char.color}20`,
            ],
          }}
          transition={{ duration: ANIM_TOKENS.GLOW_PULSE.duration, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

// ── Peek Bubble ──────────────────────────────────────────────────────────────

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
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className={cn(
        'w-64 p-3 rounded-xl backdrop-blur-xl border',
        'bg-white/[0.06] border-white/[0.1]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: char.color }} />
          <span className={cn('text-xs font-semibold', char.colorClass)}>{char.name}</span>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed mb-2">{message.text}</p>
      {message.ctas && message.ctas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {message.ctas.map((cta, i) => (
            <Button key={i} variant="outline" size="sm" onClick={() => onCTA(cta.signal)}
              className="h-7 text-xs rounded-lg border-white/10 bg-white/[0.04] hover:bg-white/[0.08]">
              {cta.label}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ── Open Panel ───────────────────────────────────────────────────────────────

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
      initial={{ x: isRTL ? -20 : 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isRTL ? -20 : 20, opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'w-[300px] h-full rounded-2xl backdrop-blur-xl border overflow-hidden flex flex-col',
        'bg-white/[0.03] border-white/[0.08]',
        'shadow-[0_8px_40px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]',
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <img src={AVATARS[activeAgent]} alt={char.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
          <div>
            <p className={cn('text-sm font-semibold', char.colorClass)}>{char.name}</p>
            <p className="text-[10px] text-muted-foreground">{char.role}</p>
          </div>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-white/[0.06]">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-foreground/90 leading-relaxed">{msg.text}</p>
            {msg.ctas && msg.ctas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {msg.ctas.map((cta, i) => (
                  <Button key={i} variant="outline" size="sm" onClick={() => onCTA(cta.signal)}
                    className="h-8 text-xs rounded-lg border-white/10 bg-white/[0.04] hover:bg-white/[0.08]">
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

// ── Main GuideDock ───────────────────────────────────────────────────────────

export const GuideDock: React.FC<{ className?: string }> = ({ className }) => {
  const {
    agent,
    surface,
    queue,
    voiceEnabled,
    regionalContext,
    dispatch,
    dismissGuide,
    setVoiceEnabled,
    setRegionalContext,
  } = useGuideStore();

  // IP-based content detection (reuse existing hook)
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

  // TTS integration — passes regional context to edge function
  useGuideTTS({
    countryCode: geoData?.countryCode,
  });

  // Fire PAGE_LOAD on mount
  useEffect(() => {
    dispatch({ type: 'PAGE_LOAD' });
  }, [dispatch]);

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

      {/* Avatar dock — always visible */}
      <div className="flex flex-col items-center gap-2 p-2 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.06]">
        <CharacterAvatar agent="ori" isActive={agent === 'ori'} onClick={() => handleAvatarClick('ori')} />
        <div className="w-6 h-[1px] bg-white/[0.08]" />
        <CharacterAvatar agent="arc" isActive={agent === 'arc'} onClick={() => handleAvatarClick('arc')} />
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="mt-1 p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/[0.06] transition-all"
          title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
        >
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default GuideDock;
