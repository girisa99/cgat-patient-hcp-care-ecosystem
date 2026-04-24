/**
 * PromptEditor — Universal AI-assisted text editor.
 *
 * Used inline (popover) or inside a drawer. Backed by the
 * `prompt-assistant` edge function, supports 4 modes:
 *   - Enhance      → polish current text
 *   - Rewrite      → user instruction transforms text
 *   - Suggest      → 3 alternatives to pick from
 *   - Localize     → translate / adapt to target language/region
 *
 * All prompt text comes from props (no hardcoded copy beyond UI labels).
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Sparkles, Wand2, Lightbulb, Languages, Loader2, Check, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PromptTarget = 'script_line' | 'visual_prompt' | 'transition_prompt' | 'generic';

export interface PromptEditorContext {
  sceneTitle?: string;
  character?: string;
  style?: string;
  industry?: string;
  audience?: string;
}

interface Props {
  initialText: string;
  target: PromptTarget;
  context?: PromptEditorContext;
  defaultLanguage?: string; // BCP-47, used as default for Localize
  onSave: (newText: string) => void | Promise<void>;
  onCancel: () => void;
  className?: string;
  /** Hide the cancel button (e.g. inside a drawer with its own close) */
  hideCancel?: boolean;
}

interface Alternative {
  text: string;
  angle: string;
}

export function PromptEditor({
  initialText,
  target,
  context,
  defaultLanguage = 'en',
  onSave,
  onCancel,
  className,
  hideCancel,
}: Props) {
  const [text, setText] = useState(initialText);
  const [busy, setBusy] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [language, setLanguage] = useState(defaultLanguage);
  const [alternatives, setAlternatives] = useState<Alternative[] | null>(null);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const callAssistant = useCallback(async (
    mode: 'enhance' | 'rewrite' | 'suggest' | 'localize',
    extra: Record<string, unknown> = {},
  ) => {
    setBusy(true);
    setAlternatives(null);
    try {
      const { data, error } = await supabase.functions.invoke('prompt-assistant', {
        body: {
          text,
          mode,
          target,
          context,
          ...extra,
        },
      });

      if (error) {
        toast.error(error.message || 'AI request failed');
        return;
      }
      const errMsg = (data as { error?: string })?.error;
      if (errMsg) {
        toast.error(errMsg);
        return;
      }

      if (mode === 'suggest') {
        const alts = (data as { alternatives?: Alternative[] })?.alternatives;
        if (Array.isArray(alts) && alts.length > 0) {
          setAlternatives(alts);
        } else {
          toast.error('No suggestions returned');
        }
      } else {
        const newText = (data as { text?: string })?.text;
        if (newText) {
          setText(newText);
          toast.success(`Text ${mode}d`);
        } else {
          toast.error('No text returned');
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'AI request failed');
    } finally {
      setBusy(false);
    }
  }, [text, target, context]);

  const handleSave = useCallback(async () => {
    if (!text.trim()) {
      toast.error('Text cannot be empty');
      return;
    }
    await onSave(text);
  }, [text, onSave]);

  return (
    <div className={cn('space-y-3 w-full', className)}>
      {/* Main textarea */}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={Math.min(8, Math.max(3, text.split('\n').length))}
        className="text-sm font-mono"
        disabled={busy}
        placeholder="Enter or refine the prompt…"
      />

      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={busy || !text.trim()}
          onClick={() => callAssistant('enhance')}
          className="h-7 text-xs gap-1"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Enhance
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={busy || !text.trim()}
          onClick={() => setShowInstruction(v => !v)}
          className="h-7 text-xs gap-1"
        >
          <Wand2 className="h-3 w-3" />
          Rewrite…
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={busy || !text.trim()}
          onClick={() => callAssistant('suggest')}
          className="h-7 text-xs gap-1"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lightbulb className="h-3 w-3" />}
          Suggest 3
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={busy || !text.trim()}
          onClick={() => setShowLanguage(v => !v)}
          className="h-7 text-xs gap-1"
        >
          <Languages className="h-3 w-3" />
          Localize…
        </Button>

        <div className="flex-1" />

        {!hideCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy} className="h-7 text-xs gap-1">
            <X className="h-3 w-3" /> Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={busy || !text.trim() || text === initialText}
          className="h-7 text-xs gap-1"
        >
          <Check className="h-3 w-3" /> Save
        </Button>
      </div>

      {/* Inline instruction input for Rewrite */}
      {showInstruction && (
        <div className="flex gap-2">
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. make it more dramatic, shorter, more technical…"
            className="h-8 text-xs"
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && instruction.trim()) {
                callAssistant('rewrite', { instruction });
              }
            }}
          />
          <Button
            size="sm"
            disabled={busy || !instruction.trim()}
            onClick={() => callAssistant('rewrite', { instruction })}
            className="h-8 text-xs"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
          </Button>
        </div>
      )}

      {/* Inline language input for Localize */}
      {showLanguage && (
        <div className="flex gap-2">
          <Input
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="BCP-47 code, e.g. es-MX, ar-SA, hi"
            className="h-8 text-xs font-mono w-40"
            disabled={busy}
          />
          <Button
            size="sm"
            disabled={busy || !language.trim()}
            onClick={() => callAssistant('localize', { targetLanguage: language })}
            className="h-8 text-xs"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Translate'}
          </Button>
        </div>
      )}

      {/* Alternatives picker */}
      {alternatives && alternatives.length > 0 && (
        <Card className="p-2 bg-muted/30">
          <p className="text-[11px] font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Pick an alternative
          </p>
          <div className="space-y-1.5">
            {alternatives.map((alt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setText(alt.text);
                  setAlternatives(null);
                }}
                className="w-full text-left p-2 rounded border bg-background hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    Variant {i + 1}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground italic line-clamp-1">{alt.angle}</span>
                </div>
                <p className="text-xs leading-snug">{alt.text}</p>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
