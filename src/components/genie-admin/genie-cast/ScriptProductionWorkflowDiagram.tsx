/**
 * Script Production Workflow Diagram
 * Mermaid-based 5-stage lifecycle diagram showing AI providers at each stage
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Brain, Mic, MessageCircle, CheckCircle2 } from 'lucide-react';

const STAGES = [
  {
    number: 1,
    title: 'English Base Creation',
    icon: Brain,
    color: 'bg-blue-500',
    description: 'Source of truth — mandatory entry point for all content',
    providers: ['Claude 4 (Western)', 'GPT-4o (Fallback)'],
    outputs: ['English base script', 'Hook → Problem → Solution → CTA'],
    gate: 'Requires approval to proceed to Stage 2',
  },
  {
    number: 2,
    title: 'Regional Transcreation',
    icon: GitBranch,
    color: 'bg-purple-500',
    description: 'English base auto-expands into 38 sub-regions using zone-routed LLMs',
    providers: [
      'Claude 4 → Western / EU / LATAM / Maghreb',
      'Qwen Max → CJK / Formal MENA',
      'Gemini 3 Pro → Africa / SEA / India / Bangladesh',
      'GPT-4o → Colloquial MENA / Pakistan / Nordic / Eastern EU',
    ],
    outputs: ['38 regional scripts', 'Cultural adaptation + local idioms'],
    gate: 'Each sub-region enters independent review cycle',
  },
  {
    number: 3,
    title: 'Independent Script Review',
    icon: CheckCircle2,
    color: 'bg-amber-500',
    description: 'Each sub-region follows its own Draft → Review → Active lifecycle',
    providers: ['Human reviewers', 'AI Suggestion Engine (zone-routed)'],
    outputs: ['Approved regional scripts', 'Feedback & iteration history'],
    gate: 'Script must reach "Active" status to unlock TTS',
  },
  {
    number: 4,
    title: 'Gated TTS Generation',
    icon: Mic,
    color: 'bg-green-500',
    description: 'Auto-triggered when script status → Active, using zone-routed voices',
    providers: [
      'Azure Neural → 34 sub-regions (en, de, fr, es, ar, hi, etc.)',
      'Qwen3-TTS → CJK_CN, CJK_JP (Mandarin, Japanese)',
    ],
    outputs: ['Audio versions (append-only)', 'Provider + voice + locale metadata'],
    gate: 'Audio versions retained indefinitely for audit trail',
  },
  {
    number: 5,
    title: 'Layered Feedback & Escalation',
    icon: MessageCircle,
    color: 'bg-pink-500',
    description: 'Two-path escalation: voice issues vs. content issues',
    providers: ['TTS regeneration (voice/prosody)', 'Script re-transcreation (content)'],
    outputs: [
      'Voice issue → TTS-only regen (no script change)',
      'Content issue → Revert to Review → Re-transcreate',
    ],
    gate: 'Feedback linked to exact TTS version via tts_version_id',
  },
];

export const ScriptProductionWorkflowDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold">Script Production Lifecycle</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          End-to-end 5-stage pipeline from English Base → Regional Transcreation → Review → TTS → Feedback with zone-routed AI providers
        </p>
      </div>

      {/* Flow connector line */}
      <div className="relative">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div key={stage.number} className="relative">
              {/* Connector line */}
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
                <CardContent className="px-4 pb-3 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* AI Providers */}
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">AI Providers</p>
                      <div className="flex flex-wrap gap-1">
                        {stage.providers.map((p, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] font-normal">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {/* Outputs */}
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Outputs</p>
                      <ul className="space-y-0.5">
                        {stage.outputs.map((o, i) => (
                          <li key={i} className="text-muted-foreground">• {o}</li>
                        ))}
                      </ul>
                    </div>
                    {/* Gate */}
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Stage Gate</p>
                      <p className="text-muted-foreground italic">{stage.gate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-4 text-[10px]">
            <span className="font-medium text-muted-foreground">Zone Routing:</span>
            <Badge variant="outline" className="text-[10px]">🧠 Claude 4 → Western/EU/LATAM</Badge>
            <Badge variant="outline" className="text-[10px]">🇨🇳 Qwen Max → CJK/Formal MENA</Badge>
            <Badge variant="outline" className="text-[10px]">🌏 Gemini 3 Pro → India/SEA/Africa</Badge>
            <Badge variant="outline" className="text-[10px]">🔄 GPT-4o → MENA Dialects/Nordic/Eastern EU</Badge>
            <Badge variant="outline" className="text-[10px]">🔊 Azure Neural → 34 regions TTS</Badge>
            <Badge variant="outline" className="text-[10px]">🎙 Qwen3-TTS → CJK TTS</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScriptProductionWorkflowDiagram;
