/**
 * TTS Demo Card — Text-to-Speech with pre-built examples + custom text
 * 
 * ALWAYS plays the actual displayed text via playCustomText.
 * Edge function translates text to target language before TTS.
 * Shows translated text during playback for transparency.
 * Region-aware: defaults to region's core languages with provider chain visibility.
 */

import React, { useState } from 'react';
import { Volume2, Loader2, Square, PenLine, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTTSDemo } from '@/hooks/landing/useTTSDemo';
import { useDynamicLanguageRegistry } from '@/hooks/landing/useDynamicLanguageRegistry';
import { ProviderBadge, ProviderPanel } from './RegionalProviderInfo';
import { getExamplesForRegion, DemoExample } from './demoExamples';
import { motion } from 'framer-motion';

interface TTSDemoCardProps {
  region?: string;
}

export const TTSDemoCard: React.FC<TTSDemoCardProps> = ({ region }) => {
  const registry = useDynamicLanguageRegistry();
  const tts = useTTSDemo();
  const examples = getExamplesForRegion(region);

  const sortedLanguages = region
    ? registry.getLanguagesForRegion(region)
    : registry.ttsLanguages;

  const coreLanguages = region ? registry.getCoreLanguages(region) : [];
  const coreCodes = coreLanguages.map(l => l.code);
  const ttsLangs = sortedLanguages.filter(l => l.transcreation);

  const defaultLang = coreCodes[0] || ttsLangs[0]?.code || 'ar-SA';
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const [selectedExample, setSelectedExample] = useState<DemoExample>(examples[0]);
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const activeText = useCustom ? customText.trim() : (selectedExample?.text || '');
  const selectedLangName = ttsLangs.find(l => l.code === selectedLang)?.name || selectedLang;

  const handleSpeak = (langOverride?: string) => {
    if (!activeText) return;
    tts.playCustomText(activeText, langOverride || selectedLang);
  };

  return (
    <Card className="border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Volume2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground">Text-to-Speech</h3>
            <p className="text-sm text-muted-foreground font-normal">
              Pick an example or type your own — hear it in any language
            </p>
          </div>
          <ProviderBadge capability="tts" region={region} />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Provider chain */}
        <ProviderPanel capability="tts" region={region} compact />

        {/* Language selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
            Select Language {region && coreCodes.length > 0 && '(⭐ = regional priority)'}
          </label>
          <Select value={selectedLang} onValueChange={setSelectedLang}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {ttsLangs.map(lang => {
                const isCore = coreCodes.includes(lang.code);
                return (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} {isCore ? '⭐' : ''}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Example / Custom toggle */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseCustom(false)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                !useCustom 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              📝 Pick an Example
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                useCustom 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <PenLine className="h-3 w-3" />
              Type My Own
            </button>
          </div>

          {!useCustom ? (
            <div className="grid gap-2">
              {examples.slice(0, 5).map(ex => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExample(ex)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    selectedExample?.id === ex.id
                      ? 'border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                      : 'border-border bg-card hover:border-primary/20 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg shrink-0 mt-0.5">{ex.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold mb-0.5 ${
                        selectedExample?.id === ex.id ? 'text-primary' : 'text-foreground'
                      }`}>
                        {ex.label}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {ex.text}
                      </p>
                    </div>
                    {selectedExample?.id === ex.id && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type any text here — e.g., 'Welcome to our platform! Create amazing AI videos in seconds.'"
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <span className="text-xs text-muted-foreground mt-1 block">{customText.length}/500</span>
            </div>
          )}
        </div>

        {/* Source text preview */}
        {activeText && !tts.isPlaying && !tts.isLoading && (
          <div className="p-3 bg-muted/30 rounded-lg border border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
              Source text (English)
            </p>
            <p className="text-sm text-foreground leading-relaxed italic">"{activeText}"</p>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              → Will be translated to <strong>{selectedLangName}</strong> then spoken
            </p>
          </div>
        )}

        {/* Single clear action button */}
        <div className="flex justify-end">
          <Button
            onClick={() => handleSpeak()}
            disabled={!activeText || tts.isLoading}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {tts.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {tts.isLoading ? `Translating & Speaking...` : `Speak in ${selectedLangName}`}
          </Button>
        </div>

        {/* Loading indicator with translation info */}
        {tts.isLoading && (
          <div className="flex items-center justify-center gap-3 py-3 bg-accent/5 rounded-xl border border-accent/20">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span className="text-sm text-accent font-medium">
              Translating to {selectedLangName} & generating speech...
            </span>
          </div>
        )}

        {/* Playback indicator with translated text */}
        {tts.isPlaying && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 py-3 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 bg-primary rounded-full"
                    animate={{ height: [4, 16, 8, 20, 6, 14] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                  />
                ))}
              </div>
              <span className="text-sm text-primary font-medium">
                Playing via {tts.provider || 'Azure Neural'}
              </span>
              <Button size="sm" variant="ghost" onClick={tts.stopAudio} className="h-7 px-2">
                <Square className="h-3 w-3" />
              </Button>
            </div>

            {/* Show what was actually spoken (translated text) */}
            {tts.wasTranslated && tts.translatedText && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Languages className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-semibold text-primary uppercase">
                    Speaking in {selectedLangName}
                  </p>
                </div>
                <p className="text-sm text-foreground leading-relaxed" dir={selectedLang.startsWith('ar') || selectedLang.startsWith('he') || selectedLang.startsWith('ur') ? 'rtl' : 'ltr'}>
                  "{tts.translatedText}"
                </p>
              </div>
            )}
          </div>
        )}

        {tts.error && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-center">
            <p className="text-sm text-foreground font-medium">{tts.error}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sign up for unlimited access to all AI features ✨
            </p>
          </div>
        )}

        {/* Quick language chips */}
        {coreCodes.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
              Hear Same Text in Other Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {coreLanguages.slice(0, 6).map(lang => {
                const isPlayingThis = tts.currentCode === lang.code && tts.isPlaying;
                const isLoadingThis = tts.currentCode === lang.code && tts.isLoading;
                return (
                  <Button
                    key={lang.code}
                    size="sm"
                    variant={isPlayingThis ? 'default' : 'outline'}
                    className="h-8 text-xs gap-1.5"
                    onClick={() => {
                      setSelectedLang(lang.code);
                      handleSpeak(lang.code);
                    }}
                    disabled={!activeText || (tts.isLoading && !isLoadingThis)}
                  >
                    {isLoadingThis ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                    {lang.flag} {lang.name.split(' ')[0]}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TTSDemoCard;
