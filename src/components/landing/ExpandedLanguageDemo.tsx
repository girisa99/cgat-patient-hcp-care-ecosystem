/**
 * EXPANDED LANGUAGE DEMO — with LIVE TTS Audio Playback
 * 
 * Uses dynamic language registry (DB + edge function) instead of hardcoded data.
 * Extended transcreation demo with real Azure Neural TTS audio and caching.
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X, Volume2, Loader2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTTSDemo } from '@/hooks/landing/useTTSDemo';
import { useDynamicLanguageRegistry } from '@/hooks/landing/useDynamicLanguageRegistry';

// RTL tab groups
const RTL_TABS = ['arabic'];

interface ExpandedLanguageDemoProps {
  initialTab?: string;
  className?: string;
}

export const ExpandedLanguageDemo: React.FC<ExpandedLanguageDemoProps> = ({
  initialTab = 'arabic',
  className = '',
}) => {
  const registry = useDynamicLanguageRegistry();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showTranscreation, setShowTranscreation] = useState(true);
  const tts = useTTSDemo();

  const currentTab = registry.tabs.find(t => t.id === activeTab);
  const isRTL = RTL_TABS.includes(activeTab);

  // Loading state
  if (registry.isLoading && registry.tabs.length === 0) {
    return (
      <div className={`flex justify-center items-center py-20 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading language data...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Stats bar */}
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{registry.ttsLanguages.length || '70'}+</p>
          <p className="text-muted-foreground text-sm">Core Languages</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="text-4xl font-bold text-primary">140+</p>
          <p className="text-muted-foreground text-sm">Extended</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="text-4xl font-bold text-accent">249+</p>
          <p className="text-muted-foreground text-sm">Translation</p>
        </div>
      </div>

      {/* Tab navigation — driven by registry */}
      <div className="flex flex-wrap justify-center gap-2">
        {registry.tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2.5 rounded-full text-sm transition ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border text-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full">
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Transcreation toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-muted rounded-full">
          <button
            onClick={() => setShowTranscreation(false)}
            className={`px-4 py-2 rounded-full text-sm transition flex items-center gap-2 ${
              !showTranscreation ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground'
            }`}
          >
            <X className="h-4 w-4" /> Literal Translation
          </button>
          <button
            onClick={() => setShowTranscreation(true)}
            className={`px-4 py-2 rounded-full text-sm transition flex items-center gap-2 ${
              showTranscreation ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Check className="h-4 w-4" /> Genie Transcreation
          </button>
        </div>
      </div>

      {/* Audio status indicator */}
      {(tts.isLoading || tts.isPlaying) && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm">
            {tts.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-primary">Generating audio via {tts.provider || 'Azure Neural'}...</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <span className="text-primary">Playing via {tts.provider || 'Azure Neural'}</span>
                <button onClick={tts.stopAudio} className="ml-2 p-1 hover:bg-primary/20 rounded">
                  <Square className="h-3 w-3 text-primary" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content — driven by dynamic tab data */}
      {currentTab && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
          {/* Header */}
          <div className="p-6 border-b border-border bg-muted/30">
            <h3 className="text-2xl font-bold text-foreground">{currentTab.title}</h3>
            <p className="text-muted-foreground mt-1">{currentTab.subtitle}</p>
            <p className="text-xs text-primary mt-2 flex items-center gap-1">
              <Volume2 className="h-3 w-3" /> Click any language to hear it spoken by Azure Neural TTS
            </p>
          </div>

          {/* Language comparison grid */}
          <div className="divide-y divide-border">
            {currentTab.languages.map((lang) => {
              const isActive = tts.currentCode === lang.code;
              const isLoadingThis = isActive && tts.isLoading;
              const isPlayingThis = isActive && tts.isPlaying;

              return (
                <div key={lang.code} className={`p-4 transition-colors ${isPlayingThis ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-semibold text-foreground">{lang.name}</span>
                      {lang.region && <Badge variant="outline" className="text-[10px]">{lang.region}</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {lang.provider || 'Azure Neural'}
                      </Badge>
                      {/* TTS Play Button */}
                      <Button
                        size="sm"
                        variant={isPlayingThis ? 'default' : 'outline'}
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => tts.playTranscreation(
                          lang.code,
                          showTranscreation ? 'transcreation' : 'literal'
                        )}
                        disabled={tts.isLoading && !isLoadingThis}
                      >
                        {isLoadingThis ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isPlayingThis ? (
                          <Square className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg ${showTranscreation ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/50'}`}>
                      <p className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase mb-1">
                        ✓ Transcreated
                      </p>
                      <p className={`text-sm text-foreground ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                        {lang.transcreation || '—'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${!showTranscreation ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted/50'}`}>
                      <p className="text-[10px] font-medium text-red-500 uppercase mb-1">
                        ✗ Literal Translation
                      </p>
                      <p className={`text-sm text-muted-foreground ${!showTranscreation ? '' : 'line-through'} ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                        {lang.literal || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Moat callout */}
          <div className="p-4 bg-primary/5 border-t border-border text-center">
            <p className="text-primary font-semibold text-sm">{currentTab.moat}</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {tts.error && (
        <p className="text-center text-destructive text-sm">{tts.error}</p>
      )}
    </div>
  );
};

export default ExpandedLanguageDemo;
