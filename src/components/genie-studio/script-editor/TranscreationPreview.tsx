/**
 * TranscreationPreview - Side-by-side original vs culturally adapted script
 * Uses the translation-service edge function's 'transcreate' action
 * and the regional language infrastructure for language/region selection.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe,
  Languages,
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TranscreationResult {
  transcreatedText: string;
  confidence: number;
  alternatives?: string[];
  culturalNotes?: string;
  provider?: string;
}

interface TranscreationPreviewProps {
  originalScript: string;
  scriptName: string;
  isVisible: boolean;
  onClose: () => void;
  onApplyTranscreation: (transcreatedText: string, languageCode: string) => void;
}

const TARGET_LANGUAGES = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'LATAM' },
  { code: 'pt-BR', name: 'Portuguese (BR)', nativeName: 'Português', flag: '🇧🇷', region: 'LATAM' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'Europe' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Europe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Europe' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'CJK' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'CJK' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', region: 'CJK' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'MENA' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'India' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'India' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Europe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Europe' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'SEA' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'SEA' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', region: 'Africa' },
];

export function TranscreationPreview({
  originalScript,
  scriptName,
  isVisible,
  onClose,
  onApplyTranscreation,
}: TranscreationPreviewProps) {
  const [targetLang, setTargetLang] = useState('es');
  const [isTranscreating, setIsTranscreating] = useState(false);
  const [result, setResult] = useState<TranscreationResult | null>(null);
  const [copiedSide, setCopiedSide] = useState<'original' | 'transcreated' | null>(null);

  if (!isVisible) return null;

  const selectedLang = TARGET_LANGUAGES.find(l => l.code === targetLang);

  const handleTranscreate = async () => {
    if (!originalScript.trim()) {
      toast.error('No script content to transcreate');
      return;
    }
    setIsTranscreating(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('translation-service', {
        body: {
          action: 'transcreate',
          text: originalScript,
          sourceLanguage: 'en',
          targetLanguage: targetLang,
          context: `Script for ${scriptName}. This is a voiceover/video script that needs cultural adaptation, not literal translation.`,
        },
      });
      if (error) throw error;
      if (data?.success !== false) {
        setResult({
          transcreatedText: data?.transcreatedText || data?.translatedText || data?.text || '',
          confidence: data?.confidence || 0.85,
          alternatives: data?.alternatives || [],
          culturalNotes: data?.culturalNotes || data?.notes || '',
          provider: data?.provider || 'AI',
        });
        toast.success(`Transcreation complete for ${selectedLang?.name}`);
      } else {
        throw new Error(data?.error || 'Transcreation failed');
      }
    } catch (err: any) {
      console.error('Transcreation error:', err);
      toast.error(err.message || 'Transcreation failed');
    } finally {
      setIsTranscreating(false);
    }
  };

  const handleCopy = async (side: 'original' | 'transcreated') => {
    const text = side === 'original' ? originalScript : result?.transcreatedText || '';
    await navigator.clipboard.writeText(text);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 2000);
    toast.success('Copied to clipboard');
  };

  const originalWordCount = originalScript.trim().split(/\s+/).length;
  const transcreatedWordCount = result?.transcreatedText ? result.transcreatedText.trim().split(/\s+/).length : 0;

  return (
    <div className="mb-6 p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-cyan-500" />
          Transcreation Preview
        </h3>
        <div className="flex items-center gap-2">
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {TARGET_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    <Badge variant="outline" className="text-[10px] ml-1">{lang.region}</Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleTranscreate}
            disabled={isTranscreating || !originalScript.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
          >
            {isTranscreating ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Adapting...</>
            ) : (
              <><Languages className="h-4 w-4 mr-1" />Transcreate</>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="rounded-lg border bg-background p-3">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span>🇺🇸</span> Original (English)
            </Label>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px]">{originalWordCount} words</Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopy('original')}>
                {copiedSide === 'original' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[250px]">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{originalScript}</p>
          </ScrollArea>
        </div>

        {/* Transcreated */}
        <div className={cn(
          "rounded-lg border p-3",
          result ? "border-cyan-500/30 bg-cyan-500/5" : "bg-muted/30"
        )}>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span>{selectedLang?.flag}</span> {selectedLang?.nativeName || selectedLang?.name}
            </Label>
            <div className="flex items-center gap-1">
              {result && (
                <>
                  <Badge variant="outline" className="text-[10px]">{transcreatedWordCount} words</Badge>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    (result.confidence || 0) >= 0.8 ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
                  )}>
                    {Math.round((result.confidence || 0) * 100)}% conf
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopy('transcreated')}>
                    {copiedSide === 'transcreated' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </>
              )}
            </div>
          </div>
          <ScrollArea className="h-[250px]">
            {result ? (
              <p className="text-sm whitespace-pre-wrap leading-relaxed" dir={targetLang === 'ar' ? 'rtl' : 'ltr'}>
                {result.transcreatedText}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Languages className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Select a language and click Transcreate</p>
                <p className="text-xs mt-1">Cultural adaptation, not literal translation</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Cultural Notes & Actions */}
      {result && (
        <div className="mt-3 space-y-2">
          {result.culturalNotes && (
            <div className="p-2 rounded bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                <strong>Cultural Notes:</strong> {result.culturalNotes}
              </p>
            </div>
          )}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="p-2 rounded bg-purple-500/5 border border-purple-500/20">
              <p className="text-xs font-medium text-purple-600 mb-1">
                <Sparkles className="h-3 w-3 inline mr-1" />
                Alternative Adaptations:
              </p>
              {result.alternatives.map((alt, i) => (
                <p key={i} className="text-xs text-muted-foreground ml-4">• {alt}</p>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Provider: {result.provider} | {selectedLang?.region} region
            </span>
            <Button
              size="sm"
              onClick={() => onApplyTranscreation(result.transcreatedText, targetLang)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            >
              <Check className="h-4 w-4 mr-1" />
              Save as {selectedLang?.name} Version
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
