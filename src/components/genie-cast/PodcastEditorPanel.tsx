/**
 * PODCAST EDITOR PANEL
 *
 * Multi-speaker podcast creation:
 * - Speaker config (name, voice, avatar, role)
 * - Dialogue script editor (turn-based)
 * - AI dialogue generation via DialogueScriptGenerator
 * - Per-speaker TTS preview
 * - Multi-track audio timeline visualization
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Mic, Users, Plus, Trash2, Play, Pause, Sparkles, Loader2,
  User, Volume2, GripVertical, MessageSquare, RefreshCw, Wand2,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PodcastSpeaker {
  id: string;
  name: string;
  role: 'host' | 'co-host' | 'guest' | 'narrator';
  voiceId: string;
  voiceProvider: 'elevenlabs' | 'azure' | 'google' | 'alibaba' | 'openai';
  avatarUrl?: string;
  color: string; // UI accent color for this speaker
}

export interface DialogueTurn {
  id: string;
  speakerId: string;
  text: string;
  direction?: string; // e.g. "(laughs)", "(pauses)"
  estimatedDuration: number; // seconds
  audioUrl?: string; // Generated TTS URL
  audioStatus: 'pending' | 'generating' | 'ready' | 'error';
}

export interface PodcastScript {
  title: string;
  description: string;
  speakers: PodcastSpeaker[];
  turns: DialogueTurn[];
  totalDuration: number; // sum of all turn durations
}

interface PodcastEditorPanelProps {
  /** Initial topic/prompt for AI generation */
  topic?: string;
  /** Language for TTS */
  language?: string;
  /** Callback when script changes */
  onScriptChange?: (script: PodcastScript) => void;
  className?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const SPEAKER_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const DEFAULT_VOICES: Record<string, { id: string; provider: PodcastSpeaker['voiceProvider']; label: string }[]> = {
  host: [
    { id: 'adam', provider: 'elevenlabs', label: 'Adam (ElevenLabs)' },
    { id: 'en-US-GuyNeural', provider: 'azure', label: 'Guy (Azure)' },
  ],
  'co-host': [
    { id: 'rachel', provider: 'elevenlabs', label: 'Rachel (ElevenLabs)' },
    { id: 'en-US-JennyNeural', provider: 'azure', label: 'Jenny (Azure)' },
  ],
  guest: [
    { id: 'josh', provider: 'elevenlabs', label: 'Josh (ElevenLabs)' },
    { id: 'en-US-AriaNeural', provider: 'azure', label: 'Aria (Azure)' },
  ],
  narrator: [
    { id: 'bella', provider: 'elevenlabs', label: 'Bella (ElevenLabs)' },
    { id: 'en-US-SaraNeural', provider: 'azure', label: 'Sara (Azure)' },
  ],
};

const WORDS_PER_SECOND = 2.5;

// ── Dialogue Script Generator (AI-powered) ──────────────────────────────────

async function generateDialogueScript(
  topic: string,
  speakers: PodcastSpeaker[],
  language: string = 'en',
  style: 'casual' | 'professional' | 'debate' | 'interview' = 'casual',
): Promise<DialogueTurn[]> {
  const speakerList = speakers.map(s => `${s.name} (${s.role})`).join(', ');

  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'generate_script',
        provider: 'claude',
        model: 'claude-sonnet-4-6',
        prompt: `Generate a ${style} podcast dialogue about: "${topic}"

Speakers: ${speakerList}
Language: ${language}
Duration: 5-10 minutes
Style: ${style}

Return ONLY a JSON array of dialogue turns. Each turn:
{"speakerName": "...", "text": "...", "direction": "optional stage direction"}

Rules:
- Natural conversational flow with interruptions, reactions, humor
- Each turn should be 1-3 sentences (15-45 words)
- Include occasional directions like (laughs), (pauses to think)
- Start with an engaging hook from the host
- End with a clear call-to-action or closing`,
        maxTokens: 4000,
      },
    });

    if (error) throw error;

    const content = data?.result || data?.text || data?.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as Array<{ speakerName: string; text: string; direction?: string }>;

    return parsed.map((turn, i) => {
      const speaker = speakers.find(s =>
        s.name.toLowerCase() === turn.speakerName.toLowerCase() ||
        s.role === turn.speakerName.toLowerCase()
      ) || speakers[0];

      const wordCount = turn.text.split(/\s+/).length;
      return {
        id: crypto.randomUUID(),
        speakerId: speaker.id,
        text: turn.text,
        direction: turn.direction,
        estimatedDuration: Math.max(3, Math.ceil(wordCount / WORDS_PER_SECOND)),
        audioStatus: 'pending' as const,
      };
    });
  } catch (err) {
    console.error('Dialogue generation failed:', err);
    return [];
  }
}

// ── Speaker Config Sub-Component ─────────────────────────────────────────────

function SpeakerConfig({
  speaker,
  onUpdate,
  onRemove,
}: {
  speaker: PodcastSpeaker;
  onUpdate: (updated: PodcastSpeaker) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const voices = DEFAULT_VOICES[speaker.role] || DEFAULT_VOICES.guest;

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: speaker.color }}>
          {speaker.name.charAt(0).toUpperCase()}
        </div>
        <Input
          value={speaker.name}
          onChange={e => onUpdate({ ...speaker, name: e.target.value })}
          onClick={e => e.stopPropagation()}
          className="h-6 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
          placeholder="Speaker name"
        />
        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{speaker.role}</Badge>
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        <Button size="icon" variant="ghost" className="h-5 w-5 ml-auto" onClick={e => { e.stopPropagation(); onRemove(); }}>
          <Trash2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
      {expanded && (
        <div className="px-3 py-2 bg-background space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground font-medium">Role</label>
              <Select value={speaker.role} onValueChange={v => onUpdate({ ...speaker, role: v as PodcastSpeaker['role'] })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="host">Host</SelectItem>
                  <SelectItem value="co-host">Co-Host</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="narrator">Narrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-medium">Voice</label>
              <Select
                value={`${speaker.voiceProvider}:${speaker.voiceId}`}
                onValueChange={v => {
                  const [provider, id] = v.split(':');
                  onUpdate({ ...speaker, voiceProvider: provider as PodcastSpeaker['voiceProvider'], voiceId: id });
                }}
              >
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {voices.map(v => (
                    <SelectItem key={`${v.provider}:${v.id}`} value={`${v.provider}:${v.id}`}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Podcast Editor ──────────────────────────────────────────────────────

export const PodcastEditorPanel: React.FC<PodcastEditorPanelProps> = ({
  topic = '',
  language = 'en',
  onScriptChange,
  className,
}) => {
  const [speakers, setSpeakers] = useState<PodcastSpeaker[]>([
    { id: crypto.randomUUID(), name: 'Host', role: 'host', voiceId: 'adam', voiceProvider: 'elevenlabs', color: SPEAKER_COLORS[0] },
    { id: crypto.randomUUID(), name: 'Guest', role: 'guest', voiceId: 'josh', voiceProvider: 'elevenlabs', color: SPEAKER_COLORS[1] },
  ]);
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playingTurnId, setPlayingTurnId] = useState<string | null>(null);
  const [dialogueStyle, setDialogueStyle] = useState<'casual' | 'professional' | 'debate' | 'interview'>('casual');
  const [topicInput, setTopicInput] = useState(topic);

  const totalDuration = useMemo(() => turns.reduce((sum, t) => sum + t.estimatedDuration, 0), [turns]);

  const script: PodcastScript = useMemo(() => ({
    title: topicInput,
    description: '',
    speakers,
    turns,
    totalDuration,
  }), [topicInput, speakers, turns, totalDuration]);

  // Notify parent of changes
  const notifyChange = useCallback((newTurns: DialogueTurn[]) => {
    setTurns(newTurns);
    onScriptChange?.({ ...script, turns: newTurns, totalDuration: newTurns.reduce((sum, t) => sum + t.estimatedDuration, 0) });
  }, [script, onScriptChange]);

  const addSpeaker = () => {
    const idx = speakers.length;
    setSpeakers(prev => [...prev, {
      id: crypto.randomUUID(),
      name: `Speaker ${idx + 1}`,
      role: 'guest',
      voiceId: 'josh',
      voiceProvider: 'elevenlabs',
      color: SPEAKER_COLORS[idx % SPEAKER_COLORS.length],
    }]);
  };

  const updateSpeaker = (updated: PodcastSpeaker) => {
    setSpeakers(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const removeSpeaker = (id: string) => {
    if (speakers.length <= 1) { toast.error('Need at least one speaker'); return; }
    setSpeakers(prev => prev.filter(s => s.id !== id));
    notifyChange(turns.filter(t => t.speakerId !== id));
  };

  const handleGenerate = async () => {
    if (!topicInput.trim()) { toast.error('Enter a topic first'); return; }
    setIsGenerating(true);
    toast.info('Generating dialogue script...');

    const generated = await generateDialogueScript(topicInput, speakers, language, dialogueStyle);
    if (generated.length > 0) {
      notifyChange(generated);
      toast.success(`Generated ${generated.length} dialogue turns`);
    } else {
      toast.error('Generation failed — try again');
    }
    setIsGenerating(false);
  };

  const addTurn = (speakerId?: string) => {
    const sid = speakerId || speakers[0]?.id || '';
    const newTurn: DialogueTurn = {
      id: crypto.randomUUID(),
      speakerId: sid,
      text: '',
      estimatedDuration: 5,
      audioStatus: 'pending',
    };
    notifyChange([...turns, newTurn]);
  };

  const updateTurn = (turnId: string, updates: Partial<DialogueTurn>) => {
    notifyChange(turns.map(t => {
      if (t.id !== turnId) return t;
      const updated = { ...t, ...updates };
      if (updates.text !== undefined) {
        updated.estimatedDuration = Math.max(3, Math.ceil(updates.text.split(/\s+/).length / WORDS_PER_SECOND));
      }
      return updated;
    }));
  };

  const removeTurn = (turnId: string) => {
    notifyChange(turns.filter(t => t.id !== turnId));
  };

  const generateTurnAudio = async (turnId: string) => {
    const turn = turns.find(t => t.id === turnId);
    if (!turn?.text) return;
    const speaker = speakers.find(s => s.id === turn.speakerId);
    if (!speaker) return;

    updateTurn(turnId, { audioStatus: 'generating' });

    try {
      const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
        body: {
          text: turn.text,
          language,
          provider: speaker.voiceProvider,
          voiceId: speaker.voiceId,
        },
      });
      if (error) throw error;
      updateTurn(turnId, { audioUrl: data?.audioUrl || data?.url, audioStatus: 'ready' });
      toast.success(`Audio generated for ${speaker.name}`);
    } catch {
      updateTurn(turnId, { audioStatus: 'error' });
      toast.error('TTS generation failed');
    }
  };

  const getSpeaker = (id: string) => speakers.find(s => s.id === id);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                Podcast Editor
              </CardTitle>
              <CardDescription className="text-xs">
                {turns.length} turns · {speakers.length} speakers · ~{Math.floor(totalDuration / 60)}m {totalDuration % 60}s
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              <Volume2 className="w-3 h-3 mr-1" />
              {turns.filter(t => t.audioStatus === 'ready').length}/{turns.length} audio ready
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Speakers + AI Generation */}
        <div className="space-y-3">
          {/* Speaker Config */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Speakers ({speakers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {speakers.map(speaker => (
                <SpeakerConfig
                  key={speaker.id}
                  speaker={speaker}
                  onUpdate={updateSpeaker}
                  onRemove={() => removeSpeaker(speaker.id)}
                />
              ))}
              {speakers.length < 6 && (
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={addSpeaker}>
                  <Plus className="w-3 h-3 mr-1" /> Add Speaker
                </Button>
              )}
            </CardContent>
          </Card>

          {/* AI Dialogue Generator */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5 text-primary" />
                AI Dialogue Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                placeholder="Podcast topic..."
                className="text-xs h-8"
              />
              <Select value={dialogueStyle} onValueChange={v => setDialogueStyle(v as typeof dialogueStyle)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Chat</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="debate">Debate</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="w-full text-xs" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                {isGenerating ? 'Generating...' : 'Generate Dialogue'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Dialogue Script */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Dialogue Script
              </CardTitle>
              <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => addTurn()}>
                <Plus className="w-3 h-3 mr-1" /> Add Turn
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-1 p-3">
                {turns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No dialogue yet</p>
                    <p className="text-xs mt-1">Use AI generator or add turns manually</p>
                  </div>
                ) : (
                  turns.map((turn, idx) => {
                    const speaker = getSpeaker(turn.speakerId);
                    return (
                      <div key={turn.id} className="flex gap-2 group">
                        {/* Speaker indicator */}
                        <div className="flex flex-col items-center pt-2 flex-shrink-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: speaker?.color || '#666' }}
                            title={speaker?.name}
                          >
                            {speaker?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          {idx < turns.length - 1 && (
                            <div className="w-[2px] flex-1 my-1 rounded-full bg-border/30" />
                          )}
                        </div>

                        {/* Turn content */}
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold" style={{ color: speaker?.color }}>
                              {speaker?.name || 'Unknown'}
                            </span>
                            {turn.direction && (
                              <span className="text-[10px] italic text-muted-foreground">
                                {turn.direction}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              ~{turn.estimatedDuration}s
                            </span>
                          </div>
                          <Textarea
                            value={turn.text}
                            onChange={e => updateTurn(turn.id, { text: e.target.value })}
                            className="text-xs min-h-[40px] resize-none"
                            rows={2}
                            placeholder="Enter dialogue..."
                          />
                          <div className="flex items-center gap-1 mt-1">
                            <Select value={turn.speakerId} onValueChange={v => updateTurn(turn.id, { speakerId: v })}>
                              <SelectTrigger className="h-5 text-[10px] w-24 border-0 bg-muted/30"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {speakers.map(s => (
                                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="icon" variant="ghost" className="h-5 w-5"
                              onClick={() => generateTurnAudio(turn.id)}
                              disabled={turn.audioStatus === 'generating' || !turn.text}
                            >
                              {turn.audioStatus === 'generating' ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : turn.audioStatus === 'ready' ? (
                                <RefreshCw className="w-3 h-3 text-green-500" />
                              ) : (
                                <Volume2 className="w-3 h-3" />
                              )}
                            </Button>
                            {turn.audioStatus === 'ready' && (
                              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setPlayingTurnId(turn.id)}>
                                <Play className="w-3 h-3 text-primary" />
                              </Button>
                            )}
                            <Button
                              size="icon" variant="ghost"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                              onClick={() => removeTurn(turn.id)}
                            >
                              <Trash2 className="w-3 h-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PodcastEditorPanel;
