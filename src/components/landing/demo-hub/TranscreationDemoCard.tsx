/**
 * Transcreation Demo Card — Translation vs Transcreation comparison
 * 
 * Redesigned with clean language organization:
 * - Region group selector as horizontal pills
 * - Core languages highlighted with ⭐
 * - Side-by-side comparison cards with clear visual hierarchy
 * - Region-aware defaults
 */

import React, { useState, useMemo } from 'react';
import { Sparkles, Volume2, Loader2, Square, Check, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTTSDemo } from '@/hooks/landing/useTTSDemo';
import { useDynamicLanguageRegistry, LanguageEntry } from '@/hooks/landing/useDynamicLanguageRegistry';
import { ProviderBadge, ProviderPanel } from './RegionalProviderInfo';
import { motion, AnimatePresence } from 'framer-motion';

const RTL_GROUPS = ['arabic'];

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

const REGION_CORE_CODES: Record<string, string[]> = {
  mena: ['ar-SA', 'ar-EG', 'ar-AE', 'ar-LB', 'ar-MA', 'ar-IQ', 'ar-MSA'],
  india: ['hi-IN', 'ta-IN', 'te-IN', 'bn-IN'],
  apac: ['ja-JP', 'zh-CN', 'ko-KR'],
  africa: ['sw-KE', 'yo-NG', 'am-ET'],
  latam: ['es-MX', 'pt-BR', 'es-CO'],
  europe: ['de-DE', 'fr-FR', 'es-ES', 'it-IT'],
  nam: ['en-US', 'es-MX'],
  caribbean: ['es-MX', 'fr-FR'],
};

interface TranscreationDemoCardProps {
  region?: string;
  industryId?: string;
}

export const TranscreationDemoCard: React.FC<TranscreationDemoCardProps> = ({ region, industryId }) => {
  const registry = useDynamicLanguageRegistry();
  const tts = useTTSDemo();

  const defaultTab = region ? (REGION_TO_TAB[region] || 'arabic') : 'arabic';
  const [activeGroup, setActiveGroup] = useState(defaultTab);
  const [showTranscreation, setShowTranscreation] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const currentTab = registry.tabs.find(t => t.id === activeGroup);
  const isRTL = RTL_GROUPS.includes(activeGroup);

  // Split languages into core (⭐) and others
  const { coreLanguages, otherLanguages } = useMemo(() => {
    if (!currentTab) return { coreLanguages: [], otherLanguages: [] };
    const coreCodes = region ? (REGION_CORE_CODES[region] || []) : [];
    const core: LanguageEntry[] = [];
    const other: LanguageEntry[] = [];

    currentTab.languages.forEach(lang => {
      if (coreCodes.includes(lang.code)) {
        core.push({ ...lang, isCore: true });
      } else {
        other.push(lang);
      }
    });

    // If no region-specific cores, treat first 3 as featured
    if (core.length === 0 && currentTab.languages.length > 0) {
      return {
        coreLanguages: currentTab.languages.slice(0, 3).map(l => ({ ...l, isCore: true })),
        otherLanguages: currentTab.languages.slice(3),
      };
    }

    return { coreLanguages: core, otherLanguages: other };
  }, [currentTab, region]);

  const activeLang = selectedLang 
    ? currentTab?.languages.find(l => l.code === selectedLang) 
    : (coreLanguages[0] || currentTab?.languages[0]);

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

  const handlePlay = (langCode: string, type: 'transcreation' | 'literal') => {
    tts.playTranscreation(langCode, type);
  };

  return (
    <Card className="border-primary/20 shadow-xl overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border py-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground">Transcreation vs Translation</h3>
            <p className="text-sm text-muted-foreground font-normal">
              Cultural adaptation beats literal translation — hear the difference
            </p>
          </div>
          <ProviderBadge capability="transcreation" region={region} />
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Provider chain + Region group selector */}
        <div className="px-4 pt-4 pb-3 border-b border-border bg-muted/20 space-y-3">
          <ProviderPanel capability="transcreation" region={region} compact />
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {registry.tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveGroup(tab.id);
                  setSelectedLang(null);
                }}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeGroup === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                    : 'bg-card border border-border text-foreground hover:bg-muted hover:border-primary/30'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeGroup === tab.id 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {currentTab && (
          <div className="grid md:grid-cols-[280px_1fr] divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left: Language selector panel */}
            <div className="p-3 space-y-3 max-h-[520px] overflow-y-auto">
              {/* Tab description */}
              <div className="px-1">
                <p className="text-xs text-muted-foreground">{currentTab.subtitle}</p>
              </div>

              {/* Core languages */}
              {coreLanguages.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider px-1">
                    ⭐ Featured Languages
                  </p>
                  {coreLanguages.map(lang => (
                    <LanguageChip
                      key={lang.code}
                      lang={lang}
                      isSelected={(selectedLang || coreLanguages[0]?.code) === lang.code}
                      isCore
                      onClick={() => setSelectedLang(lang.code)}
                    />
                  ))}
                </div>
              )}

              {/* Other languages */}
              {otherLanguages.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    More Languages
                  </p>
                  {otherLanguages.map(lang => (
                    <LanguageChip
                      key={lang.code}
                      lang={lang}
                      isSelected={selectedLang === lang.code}
                      onClick={() => setSelectedLang(lang.code)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Comparison panel */}
            <div className="p-4 space-y-4 flex flex-col">
              {activeLang ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLang.code}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 flex-1"
                  >
                    {/* Active language header */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{activeLang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground">{activeLang.name}</h4>
                        {activeLang.region && (
                          <p className="text-xs text-muted-foreground">{activeLang.region}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {activeLang.provider || 'Azure Neural'}
                      </Badge>
                    </div>

                    {/* Comparison cards */}
                    <div className="grid gap-3">
                      {/* Transcreated version */}
                      <ComparisonBlock
                        type="transcreation"
                        label="✓ Genie Transcreation"
                        text={activeLang.transcreation || '—'}
                        isActive={showTranscreation}
                        isRTL={isRTL}
                        isPlaying={tts.isPlaying && tts.currentCode === activeLang.code}
                        isLoading={tts.isLoading && tts.currentCode === activeLang.code}
                        onToggle={() => setShowTranscreation(true)}
                        onPlay={() => handlePlay(activeLang.code, 'transcreation')}
                        onStop={tts.stopAudio}
                        disabled={tts.isLoading}
                      />

                      {/* Literal version */}
                      <ComparisonBlock
                        type="literal"
                        label="✗ Literal Translation"
                        text={activeLang.literal || '—'}
                        isActive={!showTranscreation}
                        isRTL={isRTL}
                        isPlaying={tts.isPlaying && tts.currentCode === activeLang.code}
                        isLoading={tts.isLoading && tts.currentCode === activeLang.code}
                        onToggle={() => setShowTranscreation(false)}
                        onPlay={() => handlePlay(activeLang.code, 'literal')}
                        onStop={tts.stopAudio}
                        disabled={tts.isLoading}
                        strikethrough={showTranscreation}
                      />
                    </div>

                    {/* Audio status */}
                    {(tts.isLoading || tts.isPlaying) && tts.currentCode === activeLang.code && (
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
                              <span className="text-primary">Playing — {activeLang.name}</span>
                              <button onClick={tts.stopAudio} className="ml-1 p-0.5 hover:bg-primary/20 rounded">
                                <Square className="h-3 w-3 text-primary" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  Select a language to see the comparison
                </div>
              )}

              {/* Moat callout */}
              <div className="mt-auto pt-3 border-t border-border text-center">
                <p className="text-primary font-semibold text-xs">{currentTab.moat}</p>
              </div>
            </div>
          </div>
        )}

        {tts.error && (
          <div className="px-4 pb-3">
            <p className="text-center text-destructive text-sm">{tts.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

interface LanguageChipProps {
  lang: LanguageEntry;
  isSelected: boolean;
  isCore?: boolean;
  onClick: () => void;
}

const LanguageChip: React.FC<LanguageChipProps> = ({ lang, isSelected, isCore, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
      isSelected
        ? 'bg-primary/10 border border-primary/30 shadow-sm'
        : 'hover:bg-muted/50 border border-transparent'
    }`}
  >
    <span className="text-base shrink-0">{lang.flag}</span>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
          {lang.name}
        </span>
        {isCore && <span className="text-[10px]">⭐</span>}
      </div>
      {lang.region && (
        <span className="text-[10px] text-muted-foreground truncate block">{lang.region}</span>
      )}
    </div>
    {isSelected && <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />}
  </button>
);

interface ComparisonBlockProps {
  type: 'transcreation' | 'literal';
  label: string;
  text: string;
  isActive: boolean;
  isRTL: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  onToggle: () => void;
  onPlay: () => void;
  onStop: () => void;
  disabled: boolean;
  strikethrough?: boolean;
}

const ComparisonBlock: React.FC<ComparisonBlockProps> = ({
  type, label, text, isActive, isRTL, isPlaying, isLoading, onToggle, onPlay, onStop, disabled, strikethrough,
}) => {
  const isTranscreation = type === 'transcreation';

  return (
    <div
      onClick={onToggle}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isActive
          ? isTranscreation
            ? 'border-primary/40 bg-primary/5 shadow-sm'
            : 'border-destructive/40 bg-destructive/5 shadow-sm'
          : 'border-border bg-card hover:border-muted-foreground/30'
      }`}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            isTranscreation 
              ? 'bg-primary/20 text-primary' 
              : 'bg-destructive/20 text-destructive'
          }`}>
            {isTranscreation ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          </div>
          <span className={`text-xs font-semibold uppercase tracking-wide ${
            isTranscreation ? 'text-primary' : 'text-destructive'
          }`}>
            {label}
          </span>
        </div>
        <Button
          size="sm"
          variant={isPlaying && isActive ? 'default' : 'ghost'}
          className="h-7 w-7 p-0 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            if (isPlaying) { onStop(); } else { onPlay(); }
          }}
          disabled={disabled && !isPlaying}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPlaying ? (
            <Square className="h-2.5 w-2.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Text */}
      <p
        className={`text-sm leading-relaxed ${
          strikethrough ? 'line-through text-muted-foreground' : 'text-foreground'
        } ${isRTL ? 'text-right' : ''}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {text}
      </p>
    </div>
  );
};

export default TranscreationDemoCard;
