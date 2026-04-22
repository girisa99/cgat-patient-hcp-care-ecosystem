/**
 * VoiceSelector — Per-character voice provider/ID picker
 *
 * Shows suggested characters from the pipeline generator.
 * Each character gets a voice provider dropdown and voice ID input.
 * Stores selections in cast_project_characters table.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Mic, CheckCircle2, Loader2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { DEFAULT_ELEVENLABS_VOICE_ID } from '@/config/universal-script-schema';

const untypedSupabase = supabase as any;

const VOICE_PROVIDERS = [
  { id: 'elevenlabs', label: 'ElevenLabs', description: 'Premium voices (NAM/EU)' },
  { id: 'azure', label: 'Azure TTS', description: 'Microsoft neural voices (global)' },
  { id: 'alibaba', label: 'Alibaba CosyVoice', description: 'CJK/MENA voices' },
  { id: 'google', label: 'Google TTS', description: 'Cloud TTS (India/SEA/Africa)' },
] as const;

export interface VoiceCharacter {
  id: string;
  character_key: string;
  display_name: string;
  role_description: string;
  voice_provider: string;
  voice_id: string;
}

interface VoiceSelectorProps {
  projectId: string;
  characters: VoiceCharacter[];
  onUpdate: (characters: VoiceCharacter[]) => void;
}

export function VoiceSelector({ projectId, characters, onUpdate }: VoiceSelectorProps) {
  const [saving, setSaving] = useState<string | null>(null);

  const handleProviderChange = useCallback(async (charId: string, provider: string) => {
    const updated = characters.map(c =>
      c.id === charId ? { ...c, voice_provider: provider } : c
    );
    onUpdate(updated);

    try {
      setSaving(charId);
      await untypedSupabase
        .from('cast_project_characters')
        .update({ voice_provider: provider })
        .eq('id', charId);
    } catch (err) {
      console.error('[VoiceSelector] Provider update failed:', err);
    } finally {
      setSaving(null);
    }
  }, [characters, onUpdate]);

  const handleVoiceIdChange = useCallback(async (charId: string, voiceId: string) => {
    const updated = characters.map(c =>
      c.id === charId ? { ...c, voice_id: voiceId } : c
    );
    onUpdate(updated);

    try {
      setSaving(charId);
      await untypedSupabase
        .from('cast_project_characters')
        .update({ voice_id: voiceId })
        .eq('id', charId);
    } catch (err) {
      console.error('[VoiceSelector] Voice ID update failed:', err);
    } finally {
      setSaving(null);
    }
  }, [characters, onUpdate]);

  const applyDefaults = useCallback(async () => {
    const updated = characters.map(c => ({
      ...c,
      voice_provider: c.voice_provider || 'elevenlabs',
      voice_id: c.voice_id || DEFAULT_ELEVENLABS_VOICE_ID,
    }));
    onUpdate(updated);

    try {
      setSaving('all');
      for (const c of updated) {
        await untypedSupabase
          .from('cast_project_characters')
          .update({ voice_provider: c.voice_provider, voice_id: c.voice_id })
          .eq('id', c.id);
      }
      toast.success('Default voices applied to all characters');
    } catch (err) {
      console.error('[VoiceSelector] Bulk update failed:', err);
      toast.error('Failed to apply defaults');
    } finally {
      setSaving(null);
    }
  }, [characters, onUpdate]);

  if (characters.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Volume2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No characters yet. Run the setup wizard to generate characters.</p>
        </CardContent>
      </Card>
    );
  }

  const allHaveVoices = characters.every(c => c.voice_id);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Voice Configuration</h3>
          <Badge variant={allHaveVoices ? 'default' : 'outline'} className="text-[10px]">
            {characters.filter(c => c.voice_id).length}/{characters.length} configured
          </Badge>
        </div>
        {!allHaveVoices && (
          <Button variant="outline" size="sm" onClick={applyDefaults} disabled={saving === 'all'}>
            {saving === 'all' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Apply Defaults
          </Button>
        )}
      </div>

      {characters.map(char => (
        <Card key={char.id} className={cn(
          'transition-colors',
          char.voice_id ? 'border-green-500/20' : 'border-amber-500/20',
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">{char.character_key}</Badge>
              <span className="text-sm font-medium">{char.display_name}</span>
              <span className="text-xs text-muted-foreground">{char.role_description}</span>
              {saving === char.id && <Loader2 className="w-3 h-3 animate-spin text-primary ml-auto" />}
              {char.voice_id && saving !== char.id && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="w-full p-1.5 rounded border bg-background text-xs"
                value={char.voice_provider || 'elevenlabs'}
                onChange={e => handleProviderChange(char.id, e.target.value)}
              >
                {VOICE_PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <Input
                className="h-8 text-xs"
                placeholder="Voice ID"
                value={char.voice_id || ''}
                onChange={e => handleVoiceIdChange(char.id, e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default VoiceSelector;
