/**
 * TTS Demo Card — Text-to-Speech with pre-built examples + custom text
 * 
 * Users pick from curated examples or type their own text.
 * Region-aware: defaults to region's core languages with provider chain visibility.
 */

import React, { useState } from 'react';
import { Volume2, Loader2, Square, PenLine } from 'lucide-react';
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

  // Get region-sorted languages
  const sortedLanguages = region
    ? registry.getLanguagesForRegion(region)
    : registry.ttsLanguages;

  const coreLanguages = region ? registry.getCoreLanguages(region) : [];
  const coreCodes = coreLanguages.map(l => l.code);
  const ttsLangs = sortedLanguages.filter(l => l.transcreation);

  const defaultLang = coreCodes[0] || ttsLangs[0]?.code || 'ar-SA';
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const [selectedExample, setSelectedExample] = useState<DemoExample | null>(examples[0] || null);
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const activeText = useCustom ? customText.trim() : (selectedExample?.text || '');

  const handlePlay = () => {
    if (!activeText) return;
    if (useCustom) {
      tts.playCustomText(activeText, selectedLang);
    } else {
      tts.playCustomText(activeText, selectedLang);
    }
  };

  const handlePlaySample = () => {
    tts.playTranscreation(selectedLang);
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
            /* Example chips */
            <div className="space-y-2">
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
            </div>
          ) : (
            /* Custom text input */
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

        {/* Action buttons */}
        <div className="flex items-center gap-2 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePlaySample}
            disabled={tts.isLoading}
            className="gap-1.5"
          >
            {tts.isLoading && tts.currentCode === selectedLang ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
            Play Native Sample
          </Button>
          <Button
            onClick={handlePlay}
            disabled={!activeText || tts.isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
          >
            {tts.isLoading && activeText ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
            {useCustom ? 'Speak My Text' : 'Speak Example'}
          </Button>
        </div>

        {/* Playback indicator */}
        {tts.isPlaying && (
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
        )}

        {tts.error && (
          <p className="text-sm text-destructive text-center">{tts.error}</p>
        )}

        {/* Quick language chips */}
        {coreCodes.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
              Quick Listen — Regional Languages
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
                      tts.playTranscreation(lang.code);
                    }}
                    disabled={tts.isLoading && !isLoadingThis}
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
