/**
 * SCENE CHARACTER VISUALIZER
 * Shows all 3 Pixar-style characters (Atlas, Nova, Host) as they appear
 * across EP04 scenes — cycling per scene, with lip-sync status, voice
 * identity, and motion style indicators.
 *
 * NOT icons — each character has a rich illustrated card with:
 *   - Character identity ring (color palette)
 *   - Pixar traits (props, motion style)
 *   - Lip-sync status (provider, viseme mode)
 *   - Voice provider badge
 *   - Active-in-scene pulse
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Mic,
  Zap,
  Brain,
  Sparkles,
  Music2,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EP04_AVATAR_CONFIG, EP04_VOICES, EP04_SCENE_PIPELINES } from '@/config/ep04-production-config';

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────

type Character = 'atlas' | 'nova' | 'host';
type LipSyncStatus = 'idle' | 'queued' | 'syncing' | 'done' | 'deferred';

interface ScenePipelineItem {
  type: string;
  character?: Character;
  voice?: Character;
  screenIds?: string[];
  multiCapture?: boolean;
  text?: string;
  content?: string;
  scriptKey?: string;
}

interface CharacterSceneState {
  character: Character;
  isActiveInScene: boolean;
  isSpeaking: boolean;
  lipSyncStatus: LipSyncStatus;
  motionPhase: 'idle' | 'speaking' | 'gesture' | 'transition';
}

// ──────────────────────────────────────────────────────────────────────────────
// SCENE DATA
// ──────────────────────────────────────────────────────────────────────────────

const SCENES = Object.entries(EP04_SCENE_PIPELINES).map(([id, steps]) => ({
  id,
  label: id.replace('scene-', 'Scene ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  shortLabel: id.split('-').slice(0, 3).join(' ').replace(/-/g, ' '),
  steps: steps as ScenePipelineItem[],
  characters: (steps as ScenePipelineItem[])
    .filter(s => s.type === 'avatar-3d')
    .map(s => s.character as Character),
  voices: (steps as ScenePipelineItem[])
    .filter(s => s.type === 'tts')
    .map(s => s.voice as Character),
  hasScreenCapture: (steps as ScenePipelineItem[]).some(s => s.type === 'screen-capture'),
  hasMotionGraphics: (steps as ScenePipelineItem[]).some(s => s.type === 'motion-graphics'),
}));

// ──────────────────────────────────────────────────────────────────────────────
// CHARACTER VISUAL CONFIGS
// ──────────────────────────────────────────────────────────────────────────────

const CHARACTER_CONFIG = {
  atlas: {
    name: 'Atlas',
    role: 'Claude Code · Backend Tech Lead',
    emoji: '🤖',
    gradient: 'from-blue-600 via-violet-600 to-blue-800',
    ringGradient: 'from-blue-400 to-violet-500',
    glowColor: 'shadow-blue-500/40',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-950/60',
    borderColor: 'border-blue-500/40',
    traits: ['Wire-frame glasses', 'Floating code blocks', 'Architectural diagrams'],
    motionDesc: 'Adjusts glasses, pauses before speaking, precise gestures',
    voiceDesc: 'Measured · Reverb · Azure Neural GuyNeural',
    voiceProvider: 'Azure Neural',
    voiceIcon: Brain,
    pixarDesc: 'Geometric precise features, glowing circuit clothing, calm engineer archetype',
    lipSyncProvider: 'Alibaba Wan2.2',
    lipSyncMode: 'phoneme-level',
  },
  nova: {
    name: 'Nova',
    role: 'Lovable · Frontend Dev',
    emoji: '✨',
    gradient: 'from-emerald-500 via-pink-500 to-emerald-700',
    ringGradient: 'from-emerald-400 to-pink-500',
    glowColor: 'shadow-emerald-500/40',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950/60',
    borderColor: 'border-emerald-500/40',
    traits: ['Glowing UI paintbrush', 'Floating components', 'Color swatches'],
    motionDesc: 'Fast gestures, builds UI in mid-air, energetic delivery',
    voiceDesc: 'Energetic · Compressed · ElevenLabs Domi',
    voiceProvider: 'ElevenLabs',
    voiceIcon: Sparkles,
    pixarDesc: 'Expressive proportions, big eyes, paint-splash clothing, frontend dev archetype',
    lipSyncProvider: 'Alibaba Wan2.2',
    lipSyncMode: 'phoneme-level',
  },
  host: {
    name: 'Host',
    role: 'Product Owner · Narrator',
    emoji: '🎬',
    gradient: 'from-amber-600 via-orange-700 to-amber-900',
    ringGradient: 'from-amber-400 to-orange-500',
    glowColor: 'shadow-amber-500/40',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950/60',
    borderColor: 'border-amber-500/40',
    traits: ['Half-empty coffee mug', 'Sticky notes', 'Checklists'],
    motionDesc: 'Direct to camera, self-deprecating shrug, warm delivery',
    voiceDesc: 'Warm · Conversational · ElevenLabs Rachel',
    voiceProvider: 'ElevenLabs',
    voiceIcon: Mic,
    pixarDesc: 'Most realistic proportions, warm earth tones, business casual, product owner archetype',
    lipSyncProvider: 'Alibaba Wan2.2',
    lipSyncMode: 'phoneme-level',
  },
} as const;

const ALL_CHARACTERS: Character[] = ['atlas', 'nova', 'host'];

// ──────────────────────────────────────────────────────────────────────────────
// CHARACTER AVATAR CARD
// ──────────────────────────────────────────────────────────────────────────────

interface CharacterAvatarCardProps {
  character: Character;
  state: CharacterSceneState;
  size?: 'sm' | 'md' | 'lg';
}

function CharacterAvatarCard({ character, state, size = 'md' }: CharacterAvatarCardProps) {
  const cfg = CHARACTER_CONFIG[character];
  const VoiceIcon = cfg.voiceIcon;
  const isActive = state.isActiveInScene;
  const isSpeaking = state.isSpeaking;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: isActive ? 1 : 0.45,
        scale: isActive ? 1 : 0.95,
      }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'relative rounded-2xl border-2 transition-all overflow-hidden',
        isActive ? `${cfg.borderColor} ${cfg.bgColor}` : 'border-border/30 bg-card/30',
        isActive && `shadow-xl ${cfg.glowColor}`,
      )}
    >
      {/* Active pulse ring */}
      {isActive && (
        <div className={cn(
          'absolute inset-0 rounded-2xl',
          isSpeaking ? 'animate-pulse' : '',
        )}>
          <div className={cn('absolute inset-0 rounded-2xl opacity-10 bg-gradient-to-br', cfg.gradient)} />
        </div>
      )}

      {/* Speaking waveform indicator */}
      {isSpeaking && (
        <div className="absolute top-3 right-3 flex items-center gap-0.5">
          {[4, 7, 5, 9, 6].map((h, i) => (
            <motion.div
              key={i}
              className={cn('w-1 rounded-full bg-gradient-to-t', cfg.ringGradient)}
              animate={{ height: [h * 2, h * 4, h * 2] }}
              transition={{ duration: 0.4 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
              style={{ height: h * 2 }}
            />
          ))}
        </div>
      )}

      <div className={cn('p-4', size === 'lg' ? 'p-6' : size === 'sm' ? 'p-3' : 'p-4')}>
        {/* Character avatar circle */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className={cn(
            'relative rounded-full flex items-center justify-center',
            'bg-gradient-to-br',
            cfg.gradient,
            size === 'lg' ? 'w-24 h-24 text-4xl' : size === 'sm' ? 'w-14 h-14 text-2xl' : 'w-20 h-20 text-3xl',
            isActive && `shadow-lg ${cfg.glowColor}`,
          )}>
            <span>{cfg.emoji}</span>
            {/* Pixar style ring */}
            <div className={cn(
              'absolute inset-[-3px] rounded-full border-2 opacity-70',
              isActive ? 'border-white/30' : 'border-transparent',
            )} />
          </div>

          <div className="text-center">
            <div className={cn('font-bold', cfg.textColor, size === 'sm' ? 'text-sm' : 'text-base')}>
              {cfg.name}
            </div>
            <div className="text-xs text-muted-foreground leading-tight">{cfg.role}</div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
          {isActive ? (
            <Badge className={cn('text-xs', cfg.textColor, 'bg-transparent border', cfg.borderColor)}>
              <Activity className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Off-scene
            </Badge>
          )}

          {isSpeaking && (
            <Badge className="text-xs bg-primary/20 text-primary border-primary/30 border">
              <Volume2 className="w-3 h-3 mr-1" />
              Speaking
            </Badge>
          )}

          {/* Lip-sync status */}
          <Badge variant="outline" className={cn(
            'text-xs',
            state.lipSyncStatus === 'done' ? 'text-emerald-400 border-emerald-500/40' :
            state.lipSyncStatus === 'syncing' ? 'text-blue-400 border-blue-500/40' :
            state.lipSyncStatus === 'deferred' ? 'text-amber-400 border-amber-500/40' :
            'text-muted-foreground'
          )}>
            <Zap className="w-3 h-3 mr-1" />
            {state.lipSyncStatus === 'done' ? 'Lip-sync ✓' :
             state.lipSyncStatus === 'syncing' ? 'Syncing…' :
             state.lipSyncStatus === 'deferred' ? 'Queued' : 'Awaiting'}
          </Badge>
        </div>

        {size !== 'sm' && (
          <>
            {/* Props */}
            <div className="space-y-1.5 mb-3">
              {cfg.traits.map((trait) => (
                <div key={trait} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="w-2.5 h-2.5 flex-shrink-0 text-muted-foreground/60" />
                  {trait}
                </div>
              ))}
            </div>

            {/* Voice info */}
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
              cfg.bgColor, 'border', cfg.borderColor,
            )}>
              <VoiceIcon className={cn('w-3.5 h-3.5 flex-shrink-0', cfg.textColor)} />
              <span className="text-muted-foreground">{cfg.voiceDesc}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SCENE PIPELINE STEPS LEGEND
// ──────────────────────────────────────────────────────────────────────────────

function SceneStepsLegend({ steps }: { steps: ScenePipelineItem[] }) {
  const typeColors: Record<string, string> = {
    'avatar-3d': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    'tts': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'screen-capture': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'motion-graphics': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'kinetic-text': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  };
  const typeIcons: Record<string, React.ElementType> = {
    'avatar-3d': Layers,
    'tts': Mic,
    'screen-capture': Play,
    'motion-graphics': Sparkles,
    'kinetic-text': Zap,
  };
  const typeLabels: Record<string, string> = {
    'avatar-3d': '3D Pixar Avatar',
    'tts': 'TTS Voice',
    'screen-capture': 'Screen Capture',
    'motion-graphics': 'Motion Graphics',
    'kinetic-text': 'Kinetic Text',
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {steps.map((step, i) => {
        const Icon = typeIcons[step.type] || Layers;
        const label = step.type === 'avatar-3d'
          ? `${typeLabels[step.type]}: ${step.character}`
          : step.type === 'tts'
          ? `TTS: ${step.voice}`
          : typeLabels[step.type] || step.type;

        return (
          <Badge
            key={i}
            variant="outline"
            className={cn('text-xs border', typeColors[step.type] || 'bg-muted text-muted-foreground border-border')}
          >
            <Icon className="w-3 h-3 mr-1" />
            {label}
          </Badge>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

interface SceneCharacterVisualizerProps {
  className?: string;
  autoPlay?: boolean;
}

export function SceneCharacterVisualizer({ className, autoPlay = false }: SceneCharacterVisualizerProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [lipSyncStatuses, setLipSyncStatuses] = useState<Record<string, LipSyncStatus>>({
    atlas: 'idle',
    nova: 'idle',
    host: 'idle',
  });

  const currentScene = SCENES[currentSceneIndex];

  // Derive per-character state for current scene
  const characterStates: Record<Character, CharacterSceneState> = {
    atlas: {
      character: 'atlas',
      isActiveInScene: currentScene.characters.includes('atlas') || currentScene.voices.includes('atlas'),
      isSpeaking: currentScene.voices.includes('atlas'),
      lipSyncStatus: lipSyncStatuses.atlas,
      motionPhase: currentScene.voices.includes('atlas') ? 'speaking' : currentScene.characters.includes('atlas') ? 'idle' : 'idle',
    },
    nova: {
      character: 'nova',
      isActiveInScene: currentScene.characters.includes('nova') || currentScene.voices.includes('nova'),
      isSpeaking: currentScene.voices.includes('nova'),
      lipSyncStatus: lipSyncStatuses.nova,
      motionPhase: currentScene.voices.includes('nova') ? 'speaking' : currentScene.characters.includes('nova') ? 'idle' : 'idle',
    },
    host: {
      character: 'host',
      isActiveInScene: currentScene.characters.includes('host') || currentScene.voices.includes('host'),
      isSpeaking: currentScene.voices.includes('host'),
      lipSyncStatus: lipSyncStatuses.host,
      motionPhase: currentScene.voices.includes('host') ? 'speaking' : currentScene.characters.includes('host') ? 'idle' : 'idle',
    },
  };

  const activeCount = ALL_CHARACTERS.filter(c => characterStates[c].isActiveInScene).length;

  // Auto-advance scenes
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSceneIndex(i => (i + 1) % SCENES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Simulate lip-sync status when scene changes
  useEffect(() => {
    const speakingChars = currentScene.voices;
    const avatarChars = currentScene.characters;

    setLipSyncStatuses({ atlas: 'idle', nova: 'idle', host: 'idle' });

    if (speakingChars.length > 0) {
      const timeout = setTimeout(() => {
        setLipSyncStatuses(prev => {
          const next = { ...prev };
          speakingChars.forEach(c => { next[c] = 'syncing'; });
          return next;
        });
        setTimeout(() => {
          setLipSyncStatuses(prev => {
            const next = { ...prev };
            speakingChars.forEach(c => { next[c] = 'done'; });
            return next;
          });
        }, 1200);
      }, 400);
      return () => clearTimeout(timeout);
    }

    if (avatarChars.length > 0) {
      setLipSyncStatuses(prev => {
        const next = { ...prev };
        avatarChars.forEach(c => { next[c] = 'queued'; });
        return next;
      });
    }
  }, [currentSceneIndex]);

  const goToScene = useCallback((index: number) => {
    setCurrentSceneIndex(index);
  }, []);

  const progress = ((currentSceneIndex + 1) / SCENES.length) * 100;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Scene Character Visualizer
          </h3>
          <p className="text-sm text-muted-foreground">
            All 3 Pixar-style characters · Alibaba Wan2.2 lip-sync · per scene
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {currentSceneIndex + 1} / {SCENES.length}
          </Badge>
          <Button
            size="sm"
            variant={isPlaying ? 'default' : 'outline'}
            onClick={() => setIsPlaying(p => !p)}
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isPlaying ? 'Pause' : 'Auto-Play'}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1.5" />

      {/* Scene selector pills */}
      <div className="flex gap-1.5 flex-wrap">
        {SCENES.map((scene, i) => (
          <button
            key={scene.id}
            onClick={() => goToScene(i)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
              i === currentSceneIndex
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            S{i + 1}
          </button>
        ))}
      </div>

      {/* Current scene info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Scene header */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-sm mb-1">{currentScene.label}</div>
                  <SceneStepsLegend steps={currentScene.steps} />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30 border">
                    <Activity className="w-3 h-3 mr-1" />
                    {activeCount} active
                  </Badge>
                  {currentScene.hasScreenCapture && (
                    <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/40">
                      Auto-capture
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All 3 characters — always shown, dim if not in scene */}
          <div className="grid grid-cols-3 gap-4">
            {ALL_CHARACTERS.map(character => (
              <CharacterAvatarCard
                key={character}
                character={character}
                state={characterStates[character]}
                size="md"
              />
            ))}
          </div>

          {/* Lip-sync pipeline status */}
          <Card className="bg-card/50">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Music2 className="w-4 h-4 text-primary" />
                Lip-Sync Pipeline · Alibaba Wan2.2 → ModelsLab fallback
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-3 gap-3">
                {ALL_CHARACTERS.map(character => {
                  const cfg = CHARACTER_CONFIG[character];
                  const status = lipSyncStatuses[character];
                  const isActive = characterStates[character].isActiveInScene;

                  return (
                    <div
                      key={character}
                      className={cn(
                        'rounded-lg p-3 border text-xs space-y-2',
                        isActive ? `${cfg.bgColor} ${cfg.borderColor}` : 'bg-muted/20 border-border/20',
                      )}
                    >
                      <div className={cn('font-semibold', cfg.textColor)}>{cfg.name}</div>
                      <div className="text-muted-foreground">{cfg.lipSyncProvider}</div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'w-full justify-center text-xs',
                          status === 'done' ? 'text-emerald-400 border-emerald-500/40' :
                          status === 'syncing' ? 'text-blue-400 border-blue-500/40 animate-pulse' :
                          status === 'queued' ? 'text-amber-400 border-amber-500/40' :
                          'text-muted-foreground border-border/30',
                        )}
                      >
                        {status === 'done' ? '✓ Synced' :
                         status === 'syncing' ? '⟳ Syncing' :
                         status === 'queued' ? '⏳ Queued' : '— Idle'}
                      </Badge>
                      <div className="text-muted-foreground/70 text-[10px]">{cfg.lipSyncMode}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pixar character prompts (collapsed accordion feel) */}
          <div className="grid grid-cols-1 gap-2">
            {ALL_CHARACTERS.map(character => {
              const cfg = CHARACTER_CONFIG[character];
              const isActive = characterStates[character].isActiveInScene;
              if (!isActive) return null;
              return (
                <div
                  key={character}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border text-xs',
                    cfg.bgColor, cfg.borderColor,
                  )}
                >
                  <span className="text-2xl leading-none">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className={cn('font-semibold', cfg.textColor)}>{cfg.name}</span>
                    <span className="text-muted-foreground ml-2">{cfg.motionDesc}</span>
                    <div className="mt-1 text-muted-foreground/70 text-[10px] line-clamp-2">{cfg.pixarDesc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToScene(Math.max(0, currentSceneIndex - 1))}
          disabled={currentSceneIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Prev Scene
        </Button>
        <span className="text-xs text-muted-foreground">
          {currentScene.characters.length + currentScene.voices.length} pipeline steps
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToScene(Math.min(SCENES.length - 1, currentSceneIndex + 1))}
          disabled={currentSceneIndex === SCENES.length - 1}
        >
          Next Scene
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default SceneCharacterVisualizer;
