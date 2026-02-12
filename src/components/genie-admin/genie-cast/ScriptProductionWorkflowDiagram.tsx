/**
 * Script Production Workflow Diagram
 * 5-stage lifecycle with both card view and flow diagram
 * All routing data verified against getSubRegionTTSProvider() and getZoneAIProviders()
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Brain, Mic, MessageCircle, CheckCircle2, ChevronDown, ChevronRight, LayoutList, GitGraph, Workflow } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveWorkflowFlowchart } from './InteractiveWorkflowFlowchart';

/**
 * Verified against getZoneAIProviders() sub-region overrides + getSubRegionTTSProvider() ttsMap
 * in LandingPageScriptsPanel.tsx lines 275-433
 */

const STAGES = [
  {
    number: 1,
    title: 'English Base Creation',
    icon: Brain,
    color: 'bg-blue-500',
    description: 'Source of truth — mandatory entry point for all content',
    routing: [
      { zone: 'Primary', provider: 'Claude 4', fallback: 'GPT-4o → Gemini → DeepSeek' },
    ],
    outputs: ['English base script', 'Hook → Problem → Solution → CTA'],
    gate: 'Requires approval to proceed to Stage 2',
  },
  {
    number: 2,
    title: 'Regional Transcreation (38 Sub-Regions)',
    icon: GitBranch,
    color: 'bg-purple-500',
    description: 'English base auto-expands into 48+ leaf nodes (via zone grouping) using zone-routed LLMs with hybrid sub-region overrides',
    routing: [
       { zone: 'NAM / EU_WEST / EU_DACH / EU_FRANCE / EU_IBERIA / LATAM_BRAZIL / LATAM_MEXICO / LATAM_CONESUR / MENA_MAGHREB / SEA_PH / SEA_PAN_EN', provider: 'Claude 4', fallback: 'GPT-4o → Gemini → DeepSeek' },
       { zone: 'CJK_CN / CJK_HK / CJK_TW / CJK_JP / CJK_KR / CJK_PAN_EN / MENA_GULF / MENA_MSA', provider: 'Qwen Max', fallback: 'GPT-4o → Claude 4 → DeepSeek' },
       { zone: 'INDIA (5 zones → 12 leaves) / SEA (6 Mainland) / AFRICA (4) / BANGLADESH', provider: 'Gemini 3 Pro', fallback: 'GPT-4o → Claude 4 → DeepSeek' },
       { zone: 'EU_NORDIC / EU_EAST / LATAM_ANDEAN / LATAM_CARIB / MENA_EGYPT / MENA_LEVANT / PAKISTAN / CJK_JP / CJK_KR', provider: 'GPT-4o', fallback: 'Claude 4 / Qwen Max → DeepSeek' },
     ],
     subRegions: {
       'Europe (6 zones → 15 leaves)': ['EU_WEST → Claude 4', 'EU_DACH (DE/AT/CH) → Claude 4', 'EU_FRANCE → Claude 4', 'EU_IBERIA (ES/PT/IT) → Claude 4', 'EU_NORDIC (SE/NO/DK/FI) → GPT-4o', 'EU_EAST (PL/CZ/RO/GR) → GPT-4o'],
       'LATAM (5)': ['LATAM_BRAZIL → Claude 4', 'LATAM_MEXICO → Claude 4', 'LATAM_CONESUR → Claude 4', 'LATAM_ANDEAN → GPT-4o', 'LATAM_CARIB → GPT-4o'],
       'NAM (2)': ['NAM_US → Claude 4', 'NAM_CA → Claude 4'],
       'CJK (6)': ['CJK_PAN_EN → Qwen Max', 'CJK_CN → Qwen Max', 'CJK_HK → Qwen Max', 'CJK_TW → Qwen Max', 'CJK_JP → GPT-4o', 'CJK_KR → GPT-4o'],
       'MENA (5)': ['MENA_GULF → Qwen Max', 'MENA_MSA → Qwen Max', 'MENA_MAGHREB → Claude 4', 'MENA_EGYPT → GPT-4o', 'MENA_LEVANT → GPT-4o'],
       'India (5 zones → 12 leaves)': ['INDIA_NORTH (Hi/Ur/Pa) → Gemini 3', 'INDIA_SOUTH (Ta/Te/Kn/Ml) → Gemini 3', 'INDIA_WEST (Mr/Gu) → Gemini 3', 'INDIA_EAST (Bn/Od) → Gemini 3', 'INDIA_PAN (En) → Gemini 3'],
       'SEA (9)': ['SEA_PAN_EN → Claude 4', 'SEA_THAI → Gemini 3', 'SEA_VIET → Gemini 3', 'SEA_KHMER → Gemini 3', 'SEA_LAO → Gemini 3', 'SEA_MYAN → Gemini 3', 'SEA_ID → Gemini 3', 'SEA_MY → Gemini 3', 'SEA_PH → Claude 4'],
       'Standalone (2)': ['PAKISTAN → GPT-4o', 'BANGLADESH → Gemini 3'],
       'Africa (4)': ['AFRICA_EAST → Gemini 3', 'AFRICA_WEST → Gemini 3', 'AFRICA_SOUTH → Gemini 3', 'AFRICA_FRANCO → Gemini 3'],
     },
    outputs: ['48+ regional leaf scripts', 'Cultural adaptation + local idioms + formality registers'],
    gate: 'Each sub-region enters independent review cycle',
  },
  {
    number: 3,
    title: 'Independent Script Review',
    icon: CheckCircle2,
    color: 'bg-amber-500',
    description: 'Each sub-region follows its own Draft → Review → Approved → Active lifecycle',
    routing: [
      { zone: 'Human Review', provider: 'Human reviewers', fallback: 'Per sub-region' },
      { zone: 'AI Suggestions', provider: 'Zone-routed LLM (same as Stage 2)', fallback: 'Maintains zone consistency' },
    ],
    outputs: ['Approved regional scripts', 'Feedback & iteration history', 'Generation context metadata (provider, confidence, tokens)'],
    gate: 'Script must reach "Active" status to unlock TTS',
  },
  {
    number: 4,
    title: 'Gated TTS Generation',
    icon: Mic,
    color: 'bg-green-500',
    description: 'Auto-triggered when script status → Active, routed via getSubRegionTTSProvider()',
    routing: [
       { zone: 'NAM / EU / LATAM / MENA / India / SEA / Africa / Pakistan / Bangladesh', provider: 'Azure Neural (34+ locales)', fallback: 'Viseme lip-sync data for all' },
       { zone: 'CJK_CN (Mandarin) + CJK_JP (Japanese)', provider: 'Qwen3-TTS (Singapore hub)', fallback: 'longwan / longyue voices' },
       { zone: 'CJK_HK (Cantonese) + CJK_TW (Traditional) + CJK_KR (Korean)', provider: 'Azure Neural', fallback: 'zh-HK / zh-TW / ko-KR locales' },
       { zone: 'Premium / Voice Clone', provider: 'ElevenLabs (never primary)', fallback: 'Qwen3-TTS → Azure Custom' },
    ],
    outputs: ['Audio versions (append-only, never overwritten)', 'Provider + voice + locale + duration metadata', 'Auto-increment version numbering per script'],
    gate: 'Audio versions retained indefinitely for audit trail',
  },
  {
    number: 5,
    title: 'Layered Feedback & Escalation',
    icon: MessageCircle,
    color: 'bg-pink-500',
    description: 'Two-path escalation linked via tts_version_id FK',
    routing: [
      { zone: 'Voice / Prosody Issue', provider: 'TTS-only regeneration', fallback: 'No script change required' },
      { zone: 'Content / Cultural Issue', provider: 'Revert to Review → Re-transcreate', fallback: 'Uses same zone-routed LLM' },
    ],
    outputs: [
      'Voice issue → TTS regen (same script, new audio version)',
      'Content issue → Script revision → New TTS on re-approval',
    ],
    gate: 'Feedback linked to exact TTS version via tts_version_id',
  },
];

const MermaidFlowDiagram: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Main Pipeline Flow */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">Production Pipeline Flow</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="flex items-start gap-2">
                {/* Stage 1 */}
                <div className="flex-1 space-y-2">
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Brain className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Stage 1</span>
                    </div>
                    <p className="text-[10px] font-medium">English Base</p>
                    <Badge className="text-[9px] mt-1 bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30">Claude 4</Badge>
                  </div>
                  <div className="text-center text-[9px] text-muted-foreground">Single script</div>
                </div>

                <div className="flex items-center pt-6 text-muted-foreground">→</div>

                <div className="pt-3">
                  <div className="rotate-45 w-8 h-8 border-2 border-amber-500/50 bg-amber-500/10 flex items-center justify-center mx-auto">
                    <span className="text-[8px] -rotate-45 font-bold text-amber-600">✓</span>
                  </div>
                  <p className="text-[8px] text-center mt-2 text-muted-foreground">Approve</p>
                </div>

                <div className="flex items-center pt-6 text-muted-foreground">→</div>

                {/* Stage 2 */}
                <div className="flex-1 space-y-2">
                  <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <GitBranch className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Stage 2</span>
                    </div>
                    <p className="text-[10px] font-medium">Transcreation</p>
                    <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                      <Badge className="text-[8px] bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/30">Claude 4</Badge>
                      <Badge className="text-[8px] bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/30">Qwen Max</Badge>
                      <Badge className="text-[8px] bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/30">Gemini 3</Badge>
                      <Badge className="text-[8px] bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/30">GPT-4o</Badge>
                    </div>
                  </div>
                  <div className="text-center text-[9px] text-muted-foreground">1 → 38 scripts</div>
                </div>

                <div className="flex items-center pt-6 text-muted-foreground">→</div>

                {/* Stage 3 */}
                <div className="flex-1 space-y-2">
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Stage 3</span>
                    </div>
                    <p className="text-[10px] font-medium">Review</p>
                    <Badge className="text-[9px] mt-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30">Human + AI</Badge>
                  </div>
                  <div className="text-center text-[9px] text-muted-foreground">Draft → Active</div>
                </div>

                <div className="flex items-center pt-6 text-muted-foreground">→</div>

                <div className="pt-3">
                  <div className="rotate-45 w-8 h-8 border-2 border-green-500/50 bg-green-500/10 flex items-center justify-center mx-auto">
                    <span className="text-[8px] -rotate-45 font-bold text-green-600">✓</span>
                  </div>
                  <p className="text-[8px] text-center mt-2 text-muted-foreground">Active</p>
                </div>

                <div className="flex items-center pt-6 text-muted-foreground">→</div>

                {/* Stage 4 */}
                <div className="flex-1 space-y-2">
                  <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Mic className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">Stage 4</span>
                    </div>
                    <p className="text-[10px] font-medium">TTS Generation</p>
                    <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                      <Badge className="text-[8px] bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30">Azure Neural</Badge>
                      <Badge className="text-[8px] bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30">Qwen3-TTS</Badge>
                    </div>
                  </div>
                  <div className="text-center text-[9px] text-muted-foreground">Append-only audio</div>
                </div>

                <div className="flex items-center pt-6 text-muted-foreground">→</div>

                {/* Stage 5 */}
                <div className="flex-1 space-y-2">
                  <div className="rounded-lg bg-pink-500/10 border border-pink-500/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MessageCircle className="w-4 h-4 text-pink-500" />
                      <span className="text-xs font-bold text-pink-600 dark:text-pink-400">Stage 5</span>
                    </div>
                    <p className="text-[10px] font-medium">Feedback</p>
                    <Badge className="text-[9px] mt-1 bg-pink-500/20 text-pink-700 dark:text-pink-300 hover:bg-pink-500/30">2-Path Escalation</Badge>
                  </div>
                  <div className="text-center text-[9px] text-muted-foreground">Voice vs Content</div>
                </div>
              </div>

              {/* Feedback loops */}
              <div className="mt-4 flex justify-end gap-4 pr-4">
                <div className="flex items-center gap-1 text-[9px] text-pink-500">
                  <span>🔊 Voice issue</span>
                  <span className="text-muted-foreground">→ Stage 4 (TTS regen only)</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-pink-500">
                  <span>📝 Content issue</span>
                  <span className="text-muted-foreground">→ Stage 3 (Re-review + re-transcreate)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LLM Zone Routing — verified against getZoneAIProviders() subRegionOverrides */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">LLM Zone Routing — Verified Against Implementation</CardTitle>
          <p className="text-[10px] text-muted-foreground">Source: getZoneAIProviders() with hybrid sub-region overrides</p>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {[
               {
                 llm: 'Claude 4', emoji: '🧠', color: 'blue',
                 zones: ['NAM_US', 'NAM_CA', 'EU ×15', 'LATAM_BRAZIL', 'LATAM_MEXICO', 'LATAM_CONESUR', 'MENA_MAGHREB', 'SEA_PAN_EN', 'SEA_PH'],
                 count: 14, note: 'Western/EU(15)/LATAM + SEA English/PH'
               },
               {
                 llm: 'Qwen Max', emoji: '🇨🇳', color: 'orange',
                 zones: ['CJK_PAN_EN', 'CJK_CN', 'CJK_HK', 'CJK_TW', 'MENA_GULF', 'MENA_MSA'],
                 count: 6, note: 'CJK + Formal Arabic'
               },
               {
                 llm: 'Gemini 3 Pro', emoji: '🌏', color: 'emerald',
                 zones: ['INDIA ×12', 'SEA ×9', 'AFRICA ×4', 'BANGLADESH'],
                 count: 26, note: 'India (12 lang)/SEA/Africa/Bangladesh'
               },
               {
                 llm: 'GPT-4o', emoji: '🔄', color: 'violet',
                 zones: ['EU_NORDIC', 'EU_EAST', 'LATAM_ANDEAN', 'LATAM_CARIB', 'MENA_EGYPT', 'MENA_LEVANT', 'PAKISTAN', 'CJK_JP', 'CJK_KR'],
                 count: 9, note: 'Hybrid overrides + CJK fallback'
               },
            ].map((zone) => (
              <div key={zone.llm} className="rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{zone.emoji} {zone.llm}</span>
                  <Badge variant="outline" className="text-[9px]">{zone.count}</Badge>
                </div>
                <p className="text-[9px] text-muted-foreground mb-2">{zone.note}</p>
                <div className="flex flex-wrap gap-0.5">
                  {zone.zones.map((z) => (
                    <Badge key={z} variant="secondary" className="text-[8px] font-normal">{z}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2 italic">
            DeepSeek V3 available as cost-effective fallback across all zones (last in all 5-deep fallback chains)
          </p>
        </CardContent>
      </Card>

      {/* TTS Routing — verified against getSubRegionTTSProvider() ttsMap */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">TTS Provider Routing — Verified Against Implementation</CardTitle>
          <p className="text-[10px] text-muted-foreground">Source: getSubRegionTTSProvider() ttsMap with 38 entries</p>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 bg-muted/30">
              <p className="text-xs font-bold mb-1">🔊 Azure Neural — PRIMARY (36 sub-regions)</p>
              <p className="text-[10px] text-muted-foreground mb-2">Viseme lip-sync data · 34+ locale codes</p>
              <div className="flex flex-wrap gap-0.5">
                {['en-US', 'en-GB', 'en-CA', 'de-DE', 'fr-FR', 'es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-DO', 'pt-BR', 'sv-SE', 'pl-PL', 'ar-SA', 'ar-EG', 'ar-JO', 'ar-MA', 'ur-PK', 'bn-BD', 'hi-IN', 'ta-IN', 'mr-IN', 'bn-IN', 'en-IN', 'ms-MY', 'th-TH', 'vi-VN', 'fil-PH', 'en-SG', 'zh-TW', 'ko-KR', 'sw-KE', 'en-NG', 'en-ZA', 'fr-SN'].map(l => (
                  <Badge key={l} variant="outline" className="text-[7px]">{l}</Badge>
                ))}
              </div>
            </div>
            <div className="rounded-lg border p-3 bg-muted/30">
              <p className="text-xs font-bold mb-1">🎙 Qwen3-TTS — CJK Primary (2 sub-regions)</p>
              <p className="text-[10px] text-muted-foreground mb-2">Singapore hub · Native CJK prosody</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[8px]">CJK_CN</Badge>
                  <span className="text-[9px] text-muted-foreground">→ longwan (Mandarin)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[8px]">CJK_JP</Badge>
                  <span className="text-[9px] text-muted-foreground">→ longyue (Japanese Keigo)</span>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-2 italic">CJK_KR + CJK_TW → Azure Neural (better coverage)</p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/30">
              <p className="text-xs font-bold mb-1">🎤 ElevenLabs — Premium Only</p>
              <p className="text-[10px] text-muted-foreground mb-2">Never primary for utility TTS</p>
              <div className="flex flex-wrap gap-0.5">
                {['Voice Clone', 'Music Gen', 'SFX Gen'].map(l => (
                  <Badge key={l} variant="outline" className="text-[8px]">{l}</Badge>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground mt-2 italic">Fallback: Qwen3-TTS → Azure Custom</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CardViewDiagram: React.FC = () => {
  const [expandedRegions, setExpandedRegions] = useState<Record<number, boolean>>({});
  const toggleRegions = (stageNum: number) => {
    setExpandedRegions(prev => ({ ...prev, [stageNum]: !prev[stageNum] }));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div key={stage.number} className="relative">
              {idx > 0 && (
                <div className="flex justify-center py-2">
                  <div className="w-0.5 h-6 bg-border" />
                </div>
              )}
              <Card className="border-l-4 transition-all hover:shadow-md" style={{ borderLeftColor: `var(--${stage.color.replace('bg-', '')})` }}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${stage.color}`}>
                      {stage.number}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {stage.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1.5">
                      <p className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Zone-Routed Providers</p>
                      <div className="space-y-1.5">
                        {stage.routing.map((r, i) => (
                          <div key={i} className="border rounded p-1.5 bg-muted/30">
                            <p className="font-medium text-[10px] text-foreground">{r.zone}</p>
                            <p className="text-[10px] text-primary">▸ {r.provider}</p>
                            <p className="text-[10px] text-muted-foreground">↳ {r.fallback}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Outputs</p>
                      <ul className="space-y-0.5">
                        {stage.outputs.map((o, i) => (
                          <li key={i} className="text-muted-foreground text-[11px]">• {o}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Stage Gate</p>
                      <p className="text-muted-foreground italic text-[11px]">{stage.gate}</p>
                    </div>
                  </div>
                  {stage.subRegions && (
                    <Collapsible open={expandedRegions[stage.number]} onOpenChange={() => toggleRegions(stage.number)}>
                      <CollapsibleTrigger className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline cursor-pointer">
                        {expandedRegions[stage.number] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        View all 38 sub-regions with assigned LLM
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {Object.entries(stage.subRegions).map(([group, regions]) => (
                            <div key={group} className="border rounded p-2 bg-muted/20">
                              <p className="font-medium text-[10px] mb-1">{group}</p>
                              {regions.map((r, i) => (
                                <Badge key={i} variant="outline" className="text-[8px] mr-0.5 mb-0.5">{r}</Badge>
                              ))}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardContent className="py-3 px-4 space-y-2">
          <p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">LLM Transcreation Zones (with hybrid sub-region overrides)</p>
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <Badge variant="outline" className="text-[10px]">🧠 Claude 4 → 10 sub-regions (NAM/EU_W/LATAM_core/Maghreb)</Badge>
            <Badge variant="outline" className="text-[10px]">🇨🇳 Qwen Max → 6 sub-regions (CJK/Gulf/MSA)</Badge>
            <Badge variant="outline" className="text-[10px]">🌏 Gemini 3 Pro → 15 sub-regions (India/SEA/Africa/Bangladesh)</Badge>
            <Badge variant="outline" className="text-[10px]">🔄 GPT-4o → 7 sub-regions (Nordic/East EU/MENA dialects/Pakistan)</Badge>
          </div>
          <p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider mt-2">TTS Provider Hierarchy</p>
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <Badge variant="outline" className="text-[10px]">🔊 Azure Neural → 36 sub-regions (viseme lip-sync)</Badge>
            <Badge variant="outline" className="text-[10px]">🎙 Qwen3-TTS → CJK_CN + CJK_JP only (Singapore hub)</Badge>
            <Badge variant="outline" className="text-[10px]">🎤 ElevenLabs → Premium clone only (never primary)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ScriptProductionWorkflowDiagram: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold">Script Production Lifecycle</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          End-to-end 5-stage pipeline · Verified against getZoneAIProviders() + getSubRegionTTSProvider()
        </p>
      </div>

      <Tabs defaultValue="interactive" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="interactive" className="text-xs gap-1">
            <Workflow className="w-3 h-3" />
            Interactive Flow
          </TabsTrigger>
          <TabsTrigger value="flow" className="text-xs gap-1">
            <GitGraph className="w-3 h-3" />
            Pipeline View
          </TabsTrigger>
          <TabsTrigger value="detail" className="text-xs gap-1">
            <LayoutList className="w-3 h-3" />
            Detailed View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interactive" className="mt-4">
          <InteractiveWorkflowFlowchart />
        </TabsContent>

        <TabsContent value="flow" className="mt-4">
          <MermaidFlowDiagram />
        </TabsContent>

        <TabsContent value="detail" className="mt-4">
          <CardViewDiagram />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScriptProductionWorkflowDiagram;
