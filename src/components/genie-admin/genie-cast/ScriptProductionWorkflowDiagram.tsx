/**
 * Script Production Workflow Diagram
 * 5-stage lifecycle with both card view and Mermaid flow diagram
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Brain, Mic, MessageCircle, CheckCircle2, ChevronDown, ChevronRight, LayoutList, GitGraph } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    description: 'English base auto-expands into 38 sub-regions using zone-routed LLMs',
    routing: [
      { zone: 'Western / EU / LATAM / NAM / Maghreb', provider: 'Claude 4', fallback: 'GPT-4o → Gemini → DeepSeek' },
      { zone: 'CJK (CN/TW/JP/KR) + Formal MENA (Gulf/MSA)', provider: 'Qwen Max', fallback: 'GPT-4o → Claude 4 → DeepSeek' },
      { zone: 'India (5) / SEA (5) / Africa / Bangladesh', provider: 'Gemini 3 Pro', fallback: 'GPT-4o → Claude 4 → DeepSeek' },
      { zone: 'Colloquial MENA (Egypt/Levant) / Pakistan / Nordic / Eastern EU', provider: 'GPT-4o', fallback: 'Qwen Max → Claude 4 → DeepSeek' },
    ],
    subRegions: {
      'Europe (6)': ['EU_WEST (UK)', 'EU_DACH (DE/AT/CH)', 'EU_FRANCE', 'EU_IBERIA (ES/PT)', 'EU_NORDIC', 'EU_EAST (PL/CZ/RO/HU)'],
      'LATAM (5)': ['LATAM_BRAZIL', 'LATAM_MEXICO', 'LATAM_ANDEAN', 'LATAM_CONESUR', 'LATAM_CARIB'],
      'NAM (2)': ['NAM_US', 'NAM_CA (EN+FR)'],
      'CJK (4)': ['CJK_CN (Simplified)', 'CJK_TW (Traditional)', 'CJK_JP (Keigo)', 'CJK_KR (Honorifics)'],
      'MENA (5)': ['MENA_GULF', 'MENA_EGYPT', 'MENA_LEVANT', 'MENA_MAGHREB', 'MENA_MSA'],
      'India (5)': ['INDIA_NORTH (Hindi)', 'INDIA_SOUTH (Dravidian)', 'INDIA_WEST (Marathi/Gujarati)', 'INDIA_EAST (Bengali/Odia)', 'INDIA_PAN (English)'],
      'SEA (5)': ['SEA_MALAY', 'SEA_THAI', 'SEA_VIET', 'SEA_PHIL (Taglish)', 'SEA_PAN (Singlish)'],
      'Standalone (2)': ['PAKISTAN (Urdu RTL)', 'BANGLADESH (Bengali)'],
      'Africa (4)': ['AFRICA_EAST (Swahili)', 'AFRICA_WEST (Yoruba)', 'AFRICA_NORTH (Amharic)', 'AFRICA_SOUTH (Zulu)'],
    },
    outputs: ['38 regional scripts', 'Cultural adaptation + local idioms + formality registers'],
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
    description: 'Auto-triggered when script status → Active, using zone-routed voices via getSubRegionTTSProvider()',
    routing: [
      { zone: 'Western / EU / LATAM / NAM / MENA / India / SEA / Africa', provider: 'Azure Neural (PRIMARY)', fallback: 'Alibaba CosyVoice → Google TTS' },
      { zone: 'CJK_CN + CJK_JP', provider: 'Alibaba Qwen3-TTS-Flash (Singapore)', fallback: 'Azure Neural → Google TTS' },
      { zone: 'CJK_KR + CJK_TW', provider: 'Azure Neural (ko-KR, zh-TW)', fallback: 'Alibaba CosyVoice → Google TTS' },
      { zone: 'Premium / Voice Clone', provider: 'ElevenLabs', fallback: 'Alibaba CosyVoice → Azure Custom' },
    ],
    outputs: ['Audio versions (append-only, never overwritten)', 'Provider + voice + locale + duration metadata', 'Auto-increment version numbering'],
    gate: 'Audio versions retained indefinitely for audit trail',
  },
  {
    number: 5,
    title: 'Layered Feedback & Escalation',
    icon: MessageCircle,
    color: 'bg-pink-500',
    description: 'Two-path escalation: voice issues vs. content issues, linked via tts_version_id FK',
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
              {/* Stage flow - horizontal */}
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

                {/* Gate 1 */}
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

                {/* Gate 2 */}
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

      {/* LLM Zone Routing Diagram */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">LLM Zone Routing (Stage 2 — Transcreation)</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { llm: 'Claude 4', color: 'blue', zones: ['EU_WEST', 'EU_DACH', 'EU_FRANCE', 'EU_IBERIA', 'LATAM_BRAZIL', 'LATAM_MEXICO', 'LATAM_CONESUR', 'NAM_US', 'NAM_CA', 'MENA_MAGHREB'], count: 10 },
              { llm: 'Qwen Max', color: 'orange', zones: ['CJK_CN', 'CJK_TW', 'CJK_JP', 'CJK_KR', 'MENA_GULF', 'MENA_MSA'], count: 6 },
              { llm: 'Gemini 3 Pro', color: 'emerald', zones: ['INDIA × 5', 'SEA × 5', 'AFRICA × 4', 'BANGLADESH'], count: 15 },
              { llm: 'GPT-4o', color: 'violet', zones: ['MENA_EGYPT', 'MENA_LEVANT', 'PAKISTAN', 'EU_NORDIC', 'EU_EAST', 'LATAM_ANDEAN', 'LATAM_CARIB'], count: 7 },
            ].map((zone) => (
              <div key={zone.llm} className={`rounded-lg border p-3 bg-${zone.color}-500/5 border-${zone.color}-500/20`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold text-${zone.color}-600 dark:text-${zone.color}-400`}>{zone.llm}</span>
                  <Badge variant="outline" className="text-[9px]">{zone.count} zones</Badge>
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {zone.zones.map((z) => (
                    <Badge key={z} variant="secondary" className="text-[8px] font-normal">{z}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TTS Routing Diagram */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">TTS Provider Routing (Stage 4)</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 bg-sky-500/5 border-sky-500/20">
              <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mb-1">🔊 Azure Neural — PRIMARY</p>
              <p className="text-[10px] text-muted-foreground mb-2">34+ locale codes · Viseme lip-sync data</p>
              <div className="flex flex-wrap gap-0.5">
                {['en-US', 'en-GB', 'de-DE', 'fr-FR', 'es-MX', 'pt-BR', 'ar-SA', 'ar-EG', 'hi-IN', 'ta-IN', 'ko-KR', 'zh-TW', 'ms-MY', 'th-TH', 'vi-VN', 'sw-KE'].map(l => (
                  <Badge key={l} variant="outline" className="text-[8px]">{l}</Badge>
                ))}
                <Badge variant="outline" className="text-[8px]">+18 more</Badge>
              </div>
            </div>
            <div className="rounded-lg border p-3 bg-orange-500/5 border-orange-500/20">
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">🎙 Qwen3-TTS-Flash — CJK Primary</p>
              <p className="text-[10px] text-muted-foreground mb-2">Singapore hub · Native CJK prosody</p>
              <div className="flex flex-wrap gap-0.5">
                {['zh-CN (Mandarin)', 'ja-JP (Keigo)'].map(l => (
                  <Badge key={l} variant="outline" className="text-[8px]">{l}</Badge>
                ))}
              </div>
            </div>
            <div className="rounded-lg border p-3 bg-violet-500/5 border-violet-500/20">
              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">🎤 ElevenLabs — Clone Only</p>
              <p className="text-[10px] text-muted-foreground mb-2">Premium tier · Never primary for utility TTS</p>
              <div className="flex flex-wrap gap-0.5">
                {['Voice Clone', 'Music Gen', 'SFX Gen'].map(l => (
                  <Badge key={l} variant="outline" className="text-[8px]">{l}</Badge>
                ))}
              </div>
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
                        View all 38 sub-regions
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {Object.entries(stage.subRegions).map(([group, regions]) => (
                            <div key={group} className="border rounded p-2 bg-muted/20">
                              <p className="font-medium text-[10px] mb-1">{group}</p>
                              {regions.map((r, i) => (
                                <Badge key={i} variant="outline" className="text-[9px] mr-0.5 mb-0.5">{r}</Badge>
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
          <p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">LLM Transcreation Zones</p>
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <Badge variant="outline" className="text-[10px]">🧠 Claude 4 → Western / EU / LATAM / NAM / Maghreb</Badge>
            <Badge variant="outline" className="text-[10px]">🇨🇳 Qwen Max → CJK / Gulf MENA / MSA</Badge>
            <Badge variant="outline" className="text-[10px]">🌏 Gemini 3 Pro → India / SEA / Africa / Bangladesh</Badge>
            <Badge variant="outline" className="text-[10px]">🔄 GPT-4o → Egypt / Levant / Pakistan / Nordic / East EU</Badge>
          </div>
          <p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider mt-2">TTS Provider Hierarchy</p>
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <Badge variant="outline" className="text-[10px]">🔊 Azure Neural → PRIMARY (34+ locales, viseme lip-sync)</Badge>
            <Badge variant="outline" className="text-[10px]">🎙 Qwen3-TTS-Flash → CJK_CN + CJK_JP (Singapore hub)</Badge>
            <Badge variant="outline" className="text-[10px]">🎤 ElevenLabs → Premium voice clone only (never primary)</Badge>
            <Badge variant="outline" className="text-[10px]">☁️ Alibaba CosyVoice → Secondary fallback</Badge>
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
          End-to-end 5-stage pipeline with zone-routed AI providers across 38 sub-regions
        </p>
      </div>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2">
          <TabsTrigger value="flow" className="text-xs gap-1">
            <GitGraph className="w-3 h-3" />
            Flow Diagram
          </TabsTrigger>
          <TabsTrigger value="detail" className="text-xs gap-1">
            <LayoutList className="w-3 h-3" />
            Detailed View
          </TabsTrigger>
        </TabsList>

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
