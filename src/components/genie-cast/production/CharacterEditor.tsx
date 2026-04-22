/**
 * CharacterEditor — Add/remove/edit characters for a Cast project
 *
 * CRUD panel for cast_project_characters table.
 * Fields: name, role, voice provider, voice ID, avatar style.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users, Plus, Trash2, Loader2, Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { DEFAULT_ELEVENLABS_VOICE_ID } from '@/config/universal-script-schema';

const untypedSupabase = supabase as any;

export interface EditableCharacter {
  id: string;
  character_key: string;
  display_name: string;
  role_description: string;
  voice_provider: string;
  voice_id: string;
  avatar_url: string | null;
  color_class: string | null;
}

interface CharacterEditorProps {
  projectId: string;
  characters: EditableCharacter[];
  onUpdate: (characters: EditableCharacter[]) => void;
}

const AVATAR_STYLES = [
  'pixar-3d', 'realistic', 'anime', 'watercolor', 'minimal', 'corporate',
] as const;

const COLOR_CLASSES = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-orange-500',
] as const;

export function CharacterEditor({ projectId, characters, onUpdate }: CharacterEditorProps) {
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleFieldChange = useCallback((charId: string, field: keyof EditableCharacter, value: string) => {
    const updated = characters.map(c =>
      c.id === charId ? { ...c, [field]: value } : c
    );
    onUpdate(updated);
  }, [characters, onUpdate]);

  const handleSave = useCallback(async (char: EditableCharacter) => {
    try {
      setSaving(true);
      await untypedSupabase
        .from('cast_project_characters')
        .update({
          display_name: char.display_name,
          role_description: char.role_description,
          voice_provider: char.voice_provider,
          voice_id: char.voice_id,
          color_class: char.color_class,
        })
        .eq('id', char.id);
      toast.success(`${char.display_name} updated`);
    } catch (err) {
      console.error('[CharacterEditor] Save failed:', err);
      toast.error('Failed to save character');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleAdd = useCallback(async () => {
    try {
      setAdding(true);
      const newKey = `speaker-${characters.length + 1}`;
      const colorIdx = characters.length % COLOR_CLASSES.length;

      const { data, error } = await untypedSupabase
        .from('cast_project_characters')
        .insert({
          project_id: projectId,
          character_key: newKey,
          display_name: `Speaker ${characters.length + 1}`,
          role_description: 'New character',
          voice_provider: 'elevenlabs',
          voice_id: DEFAULT_ELEVENLABS_VOICE_ID,
          color_class: COLOR_CLASSES[colorIdx],
        })
        .select()
        .single();

      if (error) throw error;

      onUpdate([...characters, data as unknown as EditableCharacter]);
      toast.success('Character added');
    } catch (err) {
      console.error('[CharacterEditor] Add failed:', err);
      toast.error('Failed to add character');
    } finally {
      setAdding(false);
    }
  }, [projectId, characters, onUpdate]);

  const handleRemove = useCallback(async (charId: string) => {
    const char = characters.find(c => c.id === charId);
    if (!char) return;

    try {
      await untypedSupabase
        .from('cast_project_characters')
        .delete()
        .eq('id', charId);

      onUpdate(characters.filter(c => c.id !== charId));
      toast.success(`${char.display_name} removed`);
    } catch (err) {
      console.error('[CharacterEditor] Remove failed:', err);
      toast.error('Failed to remove character');
    }
  }, [characters, onUpdate]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Characters</h3>
          <Badge variant="outline" className="text-[10px]">
            {characters.length}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleAdd} disabled={adding}>
          {adding ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
          Add Character
        </Button>
      </div>

      {characters.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No characters. Run setup or add one manually.</p>
          </CardContent>
        </Card>
      )}

      {characters.map(char => (
        <Card key={char.id} className="border-border/30">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white', char.color_class || 'bg-primary')}>
                {char.display_name.charAt(0).toUpperCase()}
              </div>
              <Badge variant="secondary" className="text-[10px]">{char.character_key}</Badge>
              <div className="ml-auto flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleSave(char)} disabled={saving}>
                  <Save className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleRemove(char.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                className="h-7 text-xs"
                placeholder="Display name"
                value={char.display_name}
                onChange={e => handleFieldChange(char.id, 'display_name', e.target.value)}
              />
              <Input
                className="h-7 text-xs"
                placeholder="Role (e.g., Narrator, Expert)"
                value={char.role_description}
                onChange={e => handleFieldChange(char.id, 'role_description', e.target.value)}
              />
              <select
                className="w-full p-1.5 rounded border bg-background text-xs"
                value={char.voice_provider || 'elevenlabs'}
                onChange={e => handleFieldChange(char.id, 'voice_provider', e.target.value)}
              >
                <option value="elevenlabs">ElevenLabs</option>
                <option value="azure">Azure TTS</option>
                <option value="alibaba">Alibaba CosyVoice</option>
                <option value="google">Google TTS</option>
              </select>
              <Input
                className="h-7 text-xs"
                placeholder="Voice ID"
                value={char.voice_id || ''}
                onChange={e => handleFieldChange(char.id, 'voice_id', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CharacterEditor;
