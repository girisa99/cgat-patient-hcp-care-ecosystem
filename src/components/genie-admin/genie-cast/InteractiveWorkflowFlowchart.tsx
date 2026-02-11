/**
 * Interactive Workflow Flowchart using @xyflow/react
 * Vertical layout matching the reference image style with branching sub-regions,
 * feedback loops, and accurate AI provider routing labels.
 * All routing verified against getZoneAIProviders() + getSubRegionTTSProvider()
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/* ──────────────────── REGION DATA ──────────────────── */

interface RegionConfig {
  label: string;
  subRegions: { code: string; lang: string; llm: string; ttsProvider: string; ttsLocale: string }[];
}

const REGION_CONFIGS: Record<string, RegionConfig> = {
  AFRICA: {
    label: 'AFRICA',
    subRegions: [
      { code: 'AFRICA_WEST', lang: 'French', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'fr-SN' },
      { code: 'AFRICA_EAST', lang: 'Swahili', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'sw-KE' },
      { code: 'AFRICA_SOUTH', lang: 'English ZA', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'en-ZA' },
      { code: 'AFRICA_FRANCO', lang: 'French Maghreb', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'fr-SN' },
    ],
  },
  INDIA: {
    label: 'INDIA',
    subRegions: [
      { code: 'INDIA_NORTH', lang: 'Hindi', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'hi-IN' },
      { code: 'INDIA_SOUTH', lang: 'Tamil/Telugu', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'ta-IN' },
      { code: 'INDIA_WEST', lang: 'Marathi', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'mr-IN' },
      { code: 'INDIA_EAST', lang: 'Bengali', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'bn-IN' },
      { code: 'INDIA_PAN', lang: 'Indian English', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'en-IN' },
    ],
  },
  CJK: {
    label: 'CJK',
    subRegions: [
      { code: 'CJK_CN', lang: 'Mandarin', llm: 'Qwen Max', ttsProvider: 'Qwen3-TTS', ttsLocale: 'longwan' },
      { code: 'CJK_TW', lang: 'Traditional Chinese', llm: 'Qwen Max', ttsProvider: 'Azure', ttsLocale: 'zh-TW' },
      { code: 'CJK_JP', lang: 'Japanese', llm: 'Qwen Max', ttsProvider: 'Qwen3-TTS', ttsLocale: 'longyue' },
      { code: 'CJK_KR', lang: 'Korean', llm: 'Qwen Max', ttsProvider: 'Azure', ttsLocale: 'ko-KR' },
    ],
  },
  MENA: {
    label: 'MENA',
    subRegions: [
      { code: 'MENA_GULF', lang: 'Gulf Arabic', llm: 'Qwen Max', ttsProvider: 'Azure', ttsLocale: 'ar-SA' },
      { code: 'MENA_EGYPT', lang: 'Egyptian Arabic', llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ar-EG' },
      { code: 'MENA_LEVANT', lang: 'Levantine', llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ar-JO' },
      { code: 'MENA_MAGHREB', lang: 'French-Arabic', llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'ar-MA' },
      { code: 'MENA_MSA', lang: 'Formal Arabic', llm: 'Qwen Max', ttsProvider: 'Azure', ttsLocale: 'ar-SA' },
    ],
  },
  EU: {
    label: 'EUROPE',
    subRegions: [
      { code: 'EU_WEST', lang: 'British English', llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-GB' },
      { code: 'EU_DACH', lang: 'German', llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'de-DE' },
      { code: 'EU_FRANCE', lang: 'French', llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'fr-FR' },
      { code: 'EU_IBERIA', lang: 'Spanish/Portuguese', llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'es-ES' },
      { code: 'EU_NORDIC', lang: 'Nordic', llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'sv-SE' },
      { code: 'EU_EAST', lang: 'Polish/Czech', llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'pl-PL' },
    ],
  },
  LATAM: {
    label: 'LATAM',
    subRegions: [
      { code: 'LATAM_BRAZIL', lang: 'PT-BR', llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'pt-BR' },
      { code: 'LATAM_MEXICO', lang: 'Spanish MX', llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'es-MX' },
      { code: 'LATAM_CONESUR', lang: 'Rioplatense', llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'es-AR' },
      { code: 'LATAM_ANDEAN', lang: 'Andean Spanish', llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'es-CO' },
      { code: 'LATAM_CARIB', lang: 'Caribbean', llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'es-DO' },
    ],
  },
  NAM: {
    label: 'NAM',
    subRegions: [
      { code: 'NAM_US', lang: 'American English', llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-US' },
      { code: 'NAM_CA', lang: 'EN+FR Canada', llm: 'Claude 4', ttsProvider: 'Azure', ttsLocale: 'en-CA' },
    ],
  },
  SEA: {
    label: 'SEA',
    subRegions: [
      { code: 'SEA_MALAY', lang: 'Malay/Indo', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'ms-MY' },
      { code: 'SEA_THAI', lang: 'Thai', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'th-TH' },
      { code: 'SEA_VIET', lang: 'Vietnamese', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'vi-VN' },
      { code: 'SEA_PHIL', lang: 'Filipino', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'fil-PH' },
      { code: 'SEA_PAN', lang: 'SEA English', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'en-SG' },
    ],
  },
  STANDALONE: {
    label: 'STANDALONE',
    subRegions: [
      { code: 'PAKISTAN', lang: 'Urdu', llm: 'GPT-4o', ttsProvider: 'Azure', ttsLocale: 'ur-PK' },
      { code: 'BANGLADESH', lang: 'Bengali', llm: 'Gemini 3 Pro', ttsProvider: 'Azure', ttsLocale: 'bn-BD' },
    ],
  },
};

/* ──────────────────── CUSTOM NODE COMPONENTS ──────────────────── */

const StageNode = ({ data }: { data: { label: string; subtitle?: string; color: string } }) => (
  <div
    className="rounded-lg border-2 px-4 py-3 text-center min-w-[200px] shadow-sm"
    style={{
      background: `hsl(${data.color} / 0.08)`,
      borderColor: `hsl(${data.color} / 0.4)`,
    }}
  >
    <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
    <p className="text-xs font-semibold" style={{ color: `hsl(${data.color})` }}>{data.label}</p>
    {data.subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{data.subtitle}</p>}
    <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
  </div>
);

const DiamondNode = ({ data }: { data: { label: string; color: string } }) => (
  <div className="relative w-[90px] h-[90px] flex items-center justify-center">
    <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2 !top-0" />
    <div
      className="w-[64px] h-[64px] rotate-45 border-2 flex items-center justify-center shadow-sm"
      style={{
        background: `hsl(${data.color} / 0.1)`,
        borderColor: `hsl(${data.color} / 0.5)`,
      }}
    >
      <span className="-rotate-45 text-[10px] font-semibold text-center leading-tight px-1" style={{ color: `hsl(${data.color})` }}>
        {data.label}
      </span>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2 !bottom-0" />
    <Handle type="source" position={Position.Right} id="right" className="!bg-muted-foreground !w-2 !h-2" />
    <Handle type="source" position={Position.Left} id="left" className="!bg-muted-foreground !w-2 !h-2" />
  </div>
);

const ExpandNode = ({ data }: { data: { label: string } }) => (
  <div className="rounded-full border-2 border-purple-400/50 bg-purple-500/10 px-5 py-2 text-center shadow-sm">
    <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
    <p className="text-[10px] font-medium text-purple-600 dark:text-purple-400">{data.label}</p>
    <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
  </div>
);

const SubRegionNode = ({ data }: { data: { code: string; lang: string; provider: string; color: string } }) => (
  <div
    className="rounded-md border px-3 py-2 text-center min-w-[140px] shadow-sm"
    style={{
      background: `hsl(${data.color} / 0.06)`,
      borderColor: `hsl(${data.color} / 0.3)`,
    }}
  >
    <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
    <p className="text-[10px] font-semibold">{data.code}</p>
    <p className="text-[9px] text-muted-foreground">{data.lang}</p>
    <p className="text-[9px] font-medium" style={{ color: `hsl(${data.color})` }}>{data.provider}</p>
    <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
  </div>
);

const TTSSubRegionNode = ({ data }: { data: { code: string; provider: string; locale: string } }) => (
  <div className="rounded-md border border-green-400/30 bg-green-500/6 px-3 py-2 text-center min-w-[140px] shadow-sm">
    <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
    <p className="text-[10px] font-semibold">{data.code}</p>
    <p className="text-[9px] font-medium text-green-600 dark:text-green-400">{data.provider} · {data.locale}</p>
    <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
  </div>
);

const FeedbackNode = ({ data }: { data: { label: string; action: string; color: string } }) => (
  <div
    className="rounded-md border px-3 py-2 text-center min-w-[160px] shadow-sm"
    style={{
      background: `hsl(${data.color} / 0.06)`,
      borderColor: `hsl(${data.color} / 0.3)`,
    }}
  >
    <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
    <Handle type="target" position={Position.Right} id="right" className="!bg-muted-foreground !w-2 !h-2" />
    <p className="text-[10px] font-semibold" style={{ color: `hsl(${data.color})` }}>{data.label}</p>
    <p className="text-[9px] text-muted-foreground">{data.action}</p>
    <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    <Handle type="source" position={Position.Left} id="left" className="!bg-muted-foreground !w-2 !h-2" />
  </div>
);

const nodeTypes: NodeTypes = {
  stage: StageNode,
  diamond: DiamondNode,
  expand: ExpandNode,
  subRegion: SubRegionNode,
  ttsSubRegion: TTSSubRegionNode,
  feedback: FeedbackNode,
};

/* ──────────────────── LLM COLOR MAP ──────────────────── */

const LLM_COLORS: Record<string, string> = {
  'Claude 4': '220 70% 55%',
  'Qwen Max': '25 90% 55%',
  'Gemini 3 Pro': '150 60% 40%',
  'GPT-4o': '270 60% 55%',
};

/* ──────────────────── BUILD NODES & EDGES ──────────────────── */

function buildFlowchart(region: RegionConfig) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const centerX = 400;
  let y = 0;
  const edgeDefaults = {
    style: { strokeWidth: 1.5, stroke: 'hsl(var(--muted-foreground) / 0.4)' },
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: 'hsl(var(--muted-foreground) / 0.5)' },
  };

  // Stage 1
  nodes.push({ id: 's1', type: 'stage', position: { x: centerX - 100, y }, data: { label: '1. Generate English Base Script', subtitle: 'Claude 4 (Primary)', color: '220 70% 55%' } });
  y += 90;

  // Stage 2
  nodes.push({ id: 's2', type: 'stage', position: { x: centerX - 100, y }, data: { label: '2. Review and Feedback on English', subtitle: 'Human + AI Review', color: '220 70% 55%' } });
  edges.push({ id: 'e-s1-s2', source: 's1', target: 's2', ...edgeDefaults });
  y += 90;

  // Approve diamond
  nodes.push({ id: 'd1', type: 'diamond', position: { x: centerX - 45, y }, data: { label: 'Approve', color: '45 90% 50%' } });
  edges.push({ id: 'e-s2-d1', source: 's2', target: 'd1', ...edgeDefaults });
  y += 100;

  // Stage 3 - English active
  nodes.push({ id: 's3', type: 'stage', position: { x: centerX - 100, y }, data: { label: '3. English Base → Active', subtitle: 'Source of truth', color: '150 60% 40%' } });
  edges.push({ id: 'e-d1-s3', source: 'd1', target: 's3', ...edgeDefaults, label: 'Approve' });

  // Iterate loop from diamond back to s2
  edges.push({ id: 'e-d1-s2-loop', source: 'd1', sourceHandle: 'right', target: 's2', ...edgeDefaults, label: 'Iterate', type: 'smoothstep' });
  y += 90;

  // Stage 4 - Select region
  nodes.push({ id: 's4', type: 'stage', position: { x: centerX - 100, y }, data: { label: `4. Select Target Region: ${region.label}`, subtitle: `${region.subRegions.length} sub-regions`, color: '270 60% 55%' } });
  edges.push({ id: 'e-s3-s4', source: 's3', target: 's4', ...edgeDefaults });
  y += 90;

  // Auto-expand node
  nodes.push({ id: 'expand', type: 'expand', position: { x: centerX - 85, y }, data: { label: 'Auto-expand to sub-regions' } });
  edges.push({ id: 'e-s4-expand', source: 's4', target: 'expand', ...edgeDefaults });
  y += 70;

  // Sub-region nodes (LLM)
  const count = region.subRegions.length;
  const spacing = 170;
  const totalWidth = (count - 1) * spacing;
  const startX = centerX - totalWidth / 2;

  region.subRegions.forEach((sr, i) => {
    const id = `sr-${sr.code}`;
    nodes.push({
      id,
      type: 'subRegion',
      position: { x: startX + i * spacing - 70, y },
      data: { code: sr.code, lang: sr.lang, provider: sr.llm, color: LLM_COLORS[sr.llm] || '220 50% 50%' },
    });
    edges.push({ id: `e-expand-${id}`, source: 'expand', target: id, ...edgeDefaults });
  });
  y += 90;

  // Stage 5 - Review each sub-region
  nodes.push({ id: 's5', type: 'stage', position: { x: centerX - 100, y }, data: { label: '5. Review Each Sub-Region Script', subtitle: 'Draft → Approved → Active', color: '45 90% 50%' } });
  region.subRegions.forEach((sr) => {
    edges.push({ id: `e-sr-${sr.code}-s5`, source: `sr-${sr.code}`, target: 's5', ...edgeDefaults });
  });
  y += 100;

  // Feedback / Approve diamond
  nodes.push({ id: 'd2', type: 'diamond', position: { x: centerX - 45, y }, data: { label: 'Review', color: '45 90% 50%' } });
  edges.push({ id: 'e-s5-d2', source: 's5', target: 'd2', ...edgeDefaults });
  y += 110;

  // Feedback path - re-transcreate
  nodes.push({ id: 'fb1', type: 'feedback', position: { x: centerX - 280, y: y - 30 }, data: { label: '6. Re-transcreate that sub-region', action: 'Same zone-routed LLM', color: '340 70% 55%' } });
  edges.push({ id: 'e-d2-fb1', source: 'd2', sourceHandle: 'left', target: 'fb1', targetHandle: 'right', ...edgeDefaults, label: 'Feedback' });
  edges.push({ id: 'e-fb1-s5', source: 'fb1', target: 's5', ...edgeDefaults, type: 'smoothstep' });

  // Approve path
  nodes.push({ id: 's7', type: 'stage', position: { x: centerX - 100, y }, data: { label: '7. Sub-Region Script Active', subtitle: 'Approved for TTS', color: '150 60% 40%' } });
  edges.push({ id: 'e-d2-s7', source: 'd2', target: 's7', ...edgeDefaults, label: 'Approve' });
  y += 90;

  // Stage 8 - TTS per sub-region
  nodes.push({ id: 's8', type: 'stage', position: { x: centerX - 100, y }, data: { label: '8. TTS per sub-region', subtitle: 'Gated: only on Active status', color: '150 60% 40%' } });
  edges.push({ id: 'e-s7-s8', source: 's7', target: 's8', ...edgeDefaults });
  y += 80;

  // TTS sub-region nodes
  region.subRegions.forEach((sr, i) => {
    const id = `tts-${sr.code}`;
    nodes.push({
      id,
      type: 'ttsSubRegion',
      position: { x: startX + i * spacing - 70, y },
      data: { code: sr.code, provider: sr.ttsProvider, locale: sr.ttsLocale },
    });
    edges.push({ id: `e-s8-${id}`, source: 's8', target: id, ...edgeDefaults });
  });
  y += 90;

  // Stage 9 - TTS Review
  nodes.push({ id: 's9', type: 'stage', position: { x: centerX - 100, y }, data: { label: '9. TTS Review', subtitle: 'Listen & evaluate audio', color: '270 60% 55%' } });
  region.subRegions.forEach((sr) => {
    edges.push({ id: `e-tts-${sr.code}-s9`, source: `tts-${sr.code}`, target: 's9', ...edgeDefaults });
  });

  // Voice issue → re-gen TTS (loop back to s8)
  edges.push({ id: 'e-s9-voice', source: 's9', target: 's8', ...edgeDefaults, label: 'Voice issue → re-gen TTS', type: 'smoothstep', style: { ...edgeDefaults.style, stroke: 'hsl(340 70% 55% / 0.6)', strokeDasharray: '5 3' } });

  // Content issue → escalate to s5
  edges.push({ id: 'e-s9-content', source: 's9', target: 's5', ...edgeDefaults, label: 'Content issue → escalate', type: 'smoothstep', style: { ...edgeDefaults.style, stroke: 'hsl(340 70% 55% / 0.6)', strokeDasharray: '5 3' } });

  y += 90;

  // Stage 10 - Final
  nodes.push({ id: 's10', type: 'stage', position: { x: centerX - 100, y }, data: { label: '10. Final Audio Ready', subtitle: 'Append-only · versioned audit trail', color: '150 60% 40%' } });
  edges.push({ id: 'e-s9-s10', source: 's9', target: 's10', ...edgeDefaults, label: 'Approve TTS' });

  return { nodes, edges, height: y + 100 };
}

/* ──────────────────── MAIN COMPONENT ──────────────────── */

export const InteractiveWorkflowFlowchart: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('AFRICA');

  const regionConfig = REGION_CONFIGS[selectedRegion];
  const { nodes, edges, height } = useMemo(
    () => buildFlowchart(regionConfig),
    [selectedRegion]
  );

  const flowHeight = Math.max(height, 800);

  return (
    <div className="space-y-3">
      {/* Region selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-muted-foreground">Select Region to Visualize:</label>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REGION_CONFIGS).map(([key, cfg]) => (
              <SelectItem key={key} value={key} className="text-xs">
                {cfg.label} ({cfg.subRegions.length} sub-regions)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1.5 ml-auto">
          {Object.entries(LLM_COLORS).map(([llm, color]) => (
            <Badge key={llm} variant="outline" className="text-[9px]" style={{ borderColor: `hsl(${color})`, color: `hsl(${color})` }}>
              {llm}
            </Badge>
          ))}
        </div>
      </div>

      {/* Flowchart */}
      <div className="border rounded-lg overflow-hidden" style={{ height: `${flowHeight}px` }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
        >
          <Background gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default InteractiveWorkflowFlowchart;
