/**
 * Transcreation Demo Card — Translation vs Transcreation comparison
 * 
 * Shows the core differentiator: literal translation ✗ vs cultural transcreation ✓
 * With live TTS audio playback for each language.
 * Region-aware: defaults to region's tab group (arabic, indian, cjk, etc.)
 */

import React, { useState } from 'react';
import { Sparkles, Volume2, Loader2, Square, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTTSDemo } from '@/hooks/landing/useTTSDemo';
import { useDynamicLanguageRegistry } from '@/hooks/landing/useDynamicLanguageRegistry';
import { motion } from 'framer-motion';

const RTL_TABS = ['arabic'];

const REGION_TO_TAB: Record<string, string> = {
  mena: 'arabic',
  india: 'indian',
  apac: 'cjk',
  africa: 'african',
  latam: 'latam',
  europe: 'european',
  nam: 'european',
  caribbean: 'latam',
};

interface TranscreationDemoCardProps {
  region?: string;
}

export const TranscreationDemoCard: React.FC<TranscreationDemoCardProps> = ({ region }) => {
  const registry = useDynamicLanguageRegistry();
  const tts = useTTSDemo();

  const defaultTab = region ? (REGION_TO_TAB[region] || 'arabic') : 'arabic';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showTranscreation, setShowTranscreation] = useState(true);

  const currentTab = registry.tabs.find(t => t.id === activeTab);
  const isRTL = RTL_TABS.includes(activeTab);

  if (registry.isLoading && registry.tabs.length === 0) {
    return (
      <Card className="border-primary/20 shadow-xl">
        <CardContent className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading language data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">Transcreation vs Translation</h3>
            <p className="text-sm text-muted-foreground font-normal">
              See & hear how cultural adaptation beats literal translation
            </p>
          </div>
          <Badge variant="default" className="hidden sm:flex bg-primary text-primary-foreground">
            Our Moat
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Region group tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {registry.tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-2 rounded-full text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
              <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-accent text-accent-foreground text-[9px] font-bold rounded-full">
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
              className={`px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 ${
                !showTranscreation ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground'
              }`}
            >
              <X className="h-3.5 w-3.5" /> Literal Translation
            </button>
            <button
              onClick={() => setShowTranscreation(true)}
              className={`px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 ${
                showTranscreation ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              <Check className="h-3.5 w-3.5" /> Genie Transcreation
            </button>
          </div>
        </div>

        {/* Audio status */}
        {(tts.isLoading || tts.isPlaying) && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-xs">
              {tts.isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-primary">Generating audio...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: `${6 + Math.random() * 10}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <span className="text-primary">Playing via {tts.provider || 'Azure Neural'}</span>
                  <button onClick={tts.stopAudio} className="ml-1 p-0.5 hover:bg-primary/20 rounded">
                    <Square className="h-3 w-3 text-primary" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Language comparison grid */}
        {currentTab && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Tab header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <h4 className="text-base font-bold text-foreground">{currentTab.title}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">{currentTab.subtitle}</p>
              <p className="text-[10px] text-primary mt-1 flex items-center gap-1">
                <Volume2 className="h-3 w-3" /> Click any language to hear it spoken
              </p>
            </div>

            {/* Languages */}
            <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
              {currentTab.languages.map((lang) => {
                const isActive = tts.currentCode === lang.code;
                const isLoadingThis = isActive && tts.isLoading;
                const isPlayingThis = isActive && tts.isPlaying;

                return (
                  <div key={lang.code} className={`p-3 transition-colors ${isPlayingThis ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <span className="font-semibold text-sm text-foreground">{lang.name}</span>
                        {lang.region && <Badge variant="outline" className="text-[9px]">{lang.region}</Badge>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[9px]">
                          {lang.provider || 'Azure Neural'}
                        </Badge>
                        <Button
                          size="sm"
                          variant={isPlayingThis ? 'default' : 'outline'}
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => tts.playTranscreation(lang.code, showTranscreation ? 'transcreation' : 'literal')}
                          disabled={tts.isLoading && !isLoadingThis}
                        >
                          {isLoadingThis ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : isPlayingThis ? (
                            <Square className="h-2.5 w-2.5" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <div className={`p-2.5 rounded-lg ${showTranscreation ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                        <p className="text-[9px] font-medium text-primary uppercase mb-1">
                          ✓ Transcreated
                        </p>
                        <p className={`text-xs text-foreground ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                          {lang.transcreation || '—'}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-lg ${!showTranscreation ? 'bg-destructive/10 border border-destructive/20' : 'bg-muted/50'}`}>
                        <p className="text-[9px] font-medium text-destructive uppercase mb-1">
                          ✗ Literal Translation
                        </p>
                        <p className={`text-xs text-muted-foreground ${!showTranscreation ? '' : 'line-through'} ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                          {lang.literal || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Moat callout */}
            <div className="p-3 bg-primary/5 border-t border-border text-center">
              <p className="text-primary font-semibold text-xs">{currentTab.moat}</p>
            </div>
          </div>
        )}

        {tts.error && <p className="text-center text-destructive text-sm">{tts.error}</p>}
      </CardContent>
    </Card>
  );
};

export default TranscreationDemoCard;
