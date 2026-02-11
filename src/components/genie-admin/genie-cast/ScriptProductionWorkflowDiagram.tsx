/**
 * Script Production Workflow Diagram
 * 5-stage lifecycle diagram reflecting actual implemented AI provider routing
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Brain, Mic, MessageCircle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

export const ScriptProductionWorkflowDiagram: React.FC = () => {
  const [expandedRegions, setExpandedRegions] = useState<Record<number, boolean>>({});

  const toggleRegions = (stageNum: number) => {
    setExpandedRegions(prev => ({ ...prev, [stageNum]: !prev[stageNum] }));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold">Script Production Lifecycle</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          End-to-end 5-stage pipeline from English Base → 38 Sub-Region Transcreation → Review → Gated TTS → Feedback with zone-routed AI providers
        </p>
      </div>

      {/* Stages */}
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
                    {/* AI Provider Routing */}
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
                    {/* Outputs */}
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Outputs</p>
                      <ul className="space-y-0.5">
                        {stage.outputs.map((o, i) => (
                          <li key={i} className="text-muted-foreground text-[11px]">• {o}</li>
                        ))}
                      </ul>
                    </div>
                    {/* Gate */}
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Stage Gate</p>
                      <p className="text-muted-foreground italic text-[11px]">{stage.gate}</p>
                    </div>
                  </div>

                  {/* Expandable sub-regions for Stage 2 */}
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

export default ScriptProductionWorkflowDiagram;
