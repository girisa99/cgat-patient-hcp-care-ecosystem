/**
 * Drug Label RLD Comparison Tab — dynamic dual-channel extraction
 *
 * Single source of truth: one call to ai-universal-processor returns BOTH
 * Proposed and RLD values per dynamically-discovered field. This tab renders
 * the comparison directly — no manual re-entry required.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tag, AlertTriangle, CheckCircle2, Loader2, FileText, Sparkles,
  ShieldCheck, Upload, Image as ImageIcon, RefreshCw, Globe,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getDocumentTypeById } from '@/config/documentTypes';

// ---------- Types ----------
interface ProcessingResult {
  fileName?: string;
  rawText?: string;
  imageUrl?: string;
  extractedFields?: Record<string, any>;
}

type Side = { value: string; confidence?: number; evidence?: string } | null;

interface DualField {
  key: string;
  label: string;
  proposed: Side;
  rld: Side;
  accepted?: boolean;
}

interface DualExtraction {
  documentContains: 'proposed_only' | 'rld_only' | 'both' | 'unknown';
  fields: DualField[];
  rawAiSummary?: string;
}

type RowStatus = 'match' | 'partial' | 'mismatch' | 'missing_proposed' | 'missing_rld' | 'missing_both';

interface Props {
  processingResult: ProcessingResult | null;
}

// ---------- Helpers ----------
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const stripDataUrl = (s: string) => (s.includes(',') ? s.split(',')[1] : s);

const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

const computeStatus = (p: Side, r: Side): RowStatus => {
  const pv = p?.value?.trim() || '';
  const rv = r?.value?.trim() || '';
  if (!pv && !rv) return 'missing_both';
  if (!pv) return 'missing_proposed';
  if (!rv) return 'missing_rld';
  const np = norm(pv), nr = norm(rv);
  if (np === nr) return 'match';
  if (np.includes(nr) || nr.includes(np)) return 'partial';
  return 'mismatch';
};

const STATUS_BADGE: Record<RowStatus, { label: string; cls: string }> = {
  match: { label: 'Match', cls: 'bg-green-600 text-white' },
  partial: { label: 'Partial', cls: 'bg-yellow-500 text-black' },
  mismatch: { label: 'Mismatch', cls: 'bg-orange-600 text-white' },
  missing_proposed: { label: 'Missing in Proposed', cls: 'bg-red-600 text-white' },
  missing_rld: { label: 'Missing in RLD', cls: 'bg-red-500 text-white' },
  missing_both: { label: 'Missing both', cls: 'bg-muted text-muted-foreground' },
};

// Word-level diff (LCS) for inline highlighting
type DiffPart = { text: string; type: 'same' | 'add' | 'remove' };
const tokenize = (s: string) => (s || '').split(/(\s+)/).filter(Boolean);
const diffWords = (a: string, b: string): { left: DiffPart[]; right: DiffPart[] } => {
  const A = tokenize(a), B = tokenize(b);
  const n = A.length, m = B.length;
  if (n * m > 40000) {
    return { left: [{ text: a, type: a === b ? 'same' : 'remove' }], right: [{ text: b, type: a === b ? 'same' : 'add' }] };
  }
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  const eq = (x: string, y: string) => x.toLowerCase() === y.toLowerCase();
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = eq(A[i], B[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const left: DiffPart[] = [], right: DiffPart[] = [];
  const push = (arr: DiffPart[], t: string, type: DiffPart['type']) => {
    const last = arr[arr.length - 1];
    if (last && last.type === type) last.text += t; else arr.push({ text: t, type });
  };
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (eq(A[i], B[j])) { push(left, A[i], 'same'); push(right, B[j], 'same'); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { push(left, A[i], 'remove'); i++; }
    else { push(right, B[j], 'add'); j++; }
  }
  while (i < n) push(left, A[i++], 'remove');
  while (j < m) push(right, B[j++], 'add');
  return { left, right };
};

const DiffText: React.FC<{ parts: DiffPart[]; side: 'left' | 'right' }> = ({ parts, side }) => (
  <span className="whitespace-pre-wrap break-words">
    {parts.map((p, i) => {
      if (p.type === 'same') return <span key={i}>{p.text}</span>;
      const cls = side === 'left'
        ? 'bg-orange-200/80 dark:bg-orange-900/60 text-orange-900 dark:text-orange-100 rounded px-0.5'
        : 'bg-green-200/80 dark:bg-green-900/60 text-green-900 dark:text-green-100 rounded px-0.5';
      return <span key={i} className={cls}>{p.text}</span>;
    })}
  </span>
);

// ---------- Dual extraction call ----------
const seedHints = (): { key: string; label: string }[] => {
  const cfg = getDocumentTypeById('drug-label');
  return cfg?.targetFields.map(f => ({ key: f.key, label: f.label })) || [];
};

async function dualExtract(opts: {
  imageBase64?: string;
  rawText?: string;
  mode: 'auto' | 'rld_only' | 'proposed_only';
}): Promise<DualExtraction> {
  const seeds = seedHints();
  const seedList = seeds.map(s => `"${s.key}" (${s.label})`).join(', ');

  const systemPrompt = `You are an FDA drug-label parser. You receive a label (image and/or OCR text) that may contain:
- the PROPOSED label (the manufacturer's draft / submitted label), and/or
- the REFERENCE LISTED DRUG (RLD) label (the FDA-approved comparator).

Your job: identify which sections/fields the document actually contains, and for EACH field return BOTH the Proposed value and the RLD value when present. Do NOT invent values. Copy text VERBATIM. Field list is dynamic — only include fields actually present. You MAY use these FDA seed keys when applicable: ${seedList}. You MAY also add custom keys (snake_case) for any other distinct sections you find.`;

  const modeRule =
    opts.mode === 'rld_only'
      ? 'Treat the entire input as RLD content. Always set proposed=null.'
      : opts.mode === 'proposed_only'
      ? 'Treat the entire input as Proposed content. Always set rld=null.'
      : `Auto-detect. Common signals: side-by-side columns, headers like "Proposed Label" / "RLD" / "Reference Listed Drug", strikethrough vs. clean text, two stacked labels. If the doc only contains one side, set the other to null.`;

  const userPrompt = `${modeRule}

Return STRICT JSON only — no prose, no markdown — of shape:
{
  "documentContains": "proposed_only" | "rld_only" | "both" | "unknown",
  "fields": [
    {
      "key": "snake_case_key",
      "label": "Human readable section label",
      "proposed": { "value": "verbatim text", "confidence": 0.0-1.0, "evidence": "short quote/locator" } | null,
      "rld":      { "value": "verbatim text", "confidence": 0.0-1.0, "evidence": "short quote/locator" } | null
    }
  ]
}

${opts.rawText ? `=== OCR TEXT (may be empty) ===\n${opts.rawText.slice(0, 24000)}` : ''}`;

  const body: any = {
    provider: opts.imageBase64 ? 'gemini' : 'openai',
    action: opts.imageBase64 ? 'analyze_scene' : 'generate',
    systemPrompt,
    prompt: userPrompt,
    temperature: 0,
    maxTokens: 8000,
  };
  if (opts.imageBase64) body.context = { image: opts.imageBase64 };

  const { data, error } = await supabase.functions.invoke('ai-universal-processor', { body });
  if (error) throw new Error(error.message || 'Extraction failed');
  const content: string = data?.content || '';
  const m = content.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Model did not return JSON');

  let parsed: any;
  try { parsed = JSON.parse(m[0]); } catch (e: any) {
    throw new Error('Failed to parse extraction JSON: ' + e.message);
  }
  const fields: DualField[] = Array.isArray(parsed.fields) ? parsed.fields.map((f: any) => ({
    key: String(f.key || '').trim() || `field_${Math.random().toString(36).slice(2, 8)}`,
    label: String(f.label || f.key || 'Untitled').trim(),
    proposed: f.proposed && (f.proposed.value || f.proposed.value === '') ? {
      value: String(f.proposed.value || ''),
      confidence: typeof f.proposed.confidence === 'number' ? f.proposed.confidence : undefined,
      evidence: f.proposed.evidence,
    } : null,
    rld: f.rld && (f.rld.value || f.rld.value === '') ? {
      value: String(f.rld.value || ''),
      confidence: typeof f.rld.confidence === 'number' ? f.rld.confidence : undefined,
      evidence: f.rld.evidence,
    } : null,
  })) : [];

  return {
    documentContains: parsed.documentContains || 'unknown',
    fields,
  };
}

// Merge a second dual-extraction (from a separate RLD upload) into the existing one
function mergeRldUpload(base: DualExtraction, addition: DualExtraction): DualExtraction {
  const map = new Map<string, DualField>(base.fields.map(f => [f.key, { ...f }]));
  for (const f of addition.fields) {
    const incoming = f.rld || f.proposed; // treat all as RLD
    if (!incoming) continue;
    const existing = map.get(f.key);
    if (existing) {
      existing.rld = incoming;
      existing.label = existing.label || f.label;
    } else {
      map.set(f.key, { key: f.key, label: f.label, proposed: null, rld: incoming });
    }
  }
  return { documentContains: 'both', fields: Array.from(map.values()) };
}

// ---------- Component ----------
const STORAGE_KEY = 'drugLabel_dualExtraction_v2';

const DrugLabelRLDTab: React.FC<Props> = ({ processingResult }) => {
  const [extraction, setExtraction] = useState<DualExtraction | null>(() => {
    try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isUploadingRld, setIsUploadingRld] = useState(false);
  const [isFetchingFda, setIsFetchingFda] = useState(false);
  const [fdaSource, setFdaSource] = useState<string | null>(null);
  const lastSourceRef = useRef<string>('');

  // Persist
  useEffect(() => {
    try {
      if (extraction) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(extraction));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [extraction]);

  const sourceImageBase64 = useMemo(() => {
    const url = processingResult?.imageUrl || '';
    if (url.startsWith('data:image')) return stripDataUrl(url);
    return undefined;
  }, [processingResult?.imageUrl]);

  const sourceRawText = (processingResult?.rawText || '').trim();

  // Fingerprint to detect new document and re-run extraction automatically
  const sourceFingerprint = useMemo(() => {
    return `${processingResult?.fileName || ''}|${sourceRawText.length}|${(sourceImageBase64 || '').length}`;
  }, [processingResult?.fileName, sourceRawText, sourceImageBase64]);

  const runExtraction = useCallback(async (silent = false) => {
    if (!sourceImageBase64 && !sourceRawText) {
      if (!silent) toast.error('Process a drug label on the Upload tab first.');
      return;
    }
    setIsExtracting(true);
    setExtractError(null);
    try {
      const result = await dualExtract({
        imageBase64: sourceImageBase64,
        rawText: sourceRawText,
        mode: 'auto',
      });
      setExtraction(result);
      const total = result.fields.length;
      const both = result.fields.filter(f => f.proposed && f.rld).length;
      toast.success(`Extracted ${total} fields — ${both} have both Proposed & RLD values`);
    } catch (e: any) {
      console.error('[DrugLabelRLD] extraction failed:', e);
      setExtractError(e?.message || 'Extraction failed');
      if (!silent) toast.error(e?.message || 'Extraction failed');
    } finally {
      setIsExtracting(false);
    }
  }, [sourceImageBase64, sourceRawText]);

  // Auto-run once per new source
  useEffect(() => {
    if (!processingResult) return;
    if (!sourceImageBase64 && !sourceRawText) return;
    if (lastSourceRef.current === sourceFingerprint) return;
    lastSourceRef.current = sourceFingerprint;
    runExtraction(true);
  }, [processingResult, sourceFingerprint, sourceImageBase64, sourceRawText, runExtraction]);

  const handleRldUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingRld(true);
    try {
      let imageBase64: string | undefined;
      let text: string | undefined;
      if (file.type.startsWith('image/')) {
        const dataUrl = await fileToBase64(file);
        imageBase64 = stripDataUrl(dataUrl);
      } else {
        text = await file.text().catch(() => '');
      }
      const addition = await dualExtract({ imageBase64, rawText: text, mode: 'rld_only' });
      setExtraction(prev => prev ? mergeRldUpload(prev, addition) : { ...addition, documentContains: 'rld_only' });
      toast.success(`RLD merged — ${addition.fields.length} fields added/updated`);
    } catch (e: any) {
      console.error('[DrugLabelRLD] RLD upload failed:', e);
      toast.error(e?.message || 'RLD upload failed');
    } finally {
      setIsUploadingRld(false);
    }
  };

  // Pull identifiers from the proposed side to query openFDA / DailyMed
  const proposedIdentifiers = useMemo(() => {
    const out: { brand_name?: string; generic_name?: string; ndc?: string; application_number?: string } = {};
    for (const f of extraction?.fields || []) {
      const v = f.proposed?.value?.trim();
      if (!v) continue;
      if (f.key === 'brand_name' && !out.brand_name) out.brand_name = v;
      if (f.key === 'generic_name' && !out.generic_name) out.generic_name = v;
      if (f.key === 'ndc' && !out.ndc) out.ndc = v;
      if (f.key === 'application_number' && !out.application_number) out.application_number = v;
    }
    return out;
  }, [extraction]);

  const fetchRldFromFda = async () => {
    if (!proposedIdentifiers.brand_name && !proposedIdentifiers.generic_name && !proposedIdentifiers.ndc && !proposedIdentifiers.application_number) {
      toast.error('Need at least brand name, generic name, NDC, or NDA/ANDA number from the proposed label first.');
      return;
    }
    setIsFetchingFda(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-rld-label', {
        body: proposedIdentifiers,
      });
      if (error) throw new Error(error.message || 'FDA lookup failed');
      if (!data?.fields?.length) throw new Error(data?.error || 'No RLD label found');

      const additionFields: DualField[] = data.fields.map((f: any) => ({
        key: f.key,
        label: f.label || f.key,
        proposed: null,
        rld: { value: f.value, confidence: 0.95, evidence: f.evidence || data.source },
      }));
      const addition: DualExtraction = { documentContains: 'rld_only', fields: additionFields };
      setExtraction(prev => prev ? mergeRldUpload(prev, addition) : addition);
      setFdaSource(`${data.source} · ${data.identifier}`);
      toast.success(`RLD pulled from ${data.source} — ${data.fields.length} fields merged`);
    } catch (e: any) {
      console.error('[DrugLabelRLD] FDA fetch failed:', e);
      toast.error(e?.message || 'FDA / DailyMed lookup failed');
    } finally {
      setIsFetchingFda(false);
    }
  };

  const fields = extraction?.fields || [];
  const stats = useMemo(() => {
    const counts = { total: fields.length, match: 0, partial: 0, mismatch: 0, missing: 0 };
    fields.forEach(f => {
      const s = computeStatus(f.proposed, f.rld);
      if (s === 'match') counts.match++;
      else if (s === 'partial') counts.partial++;
      else if (s === 'mismatch') counts.mismatch++;
      else counts.missing++;
    });
    return counts;
  }, [fields]);

  const acceptRow = (key: string) =>
    setExtraction(prev => prev ? { ...prev, fields: prev.fields.map(f => f.key === key ? { ...f, accepted: !f.accepted } : f) } : prev);

  const acceptAllMatches = () =>
    setExtraction(prev => prev ? {
      ...prev,
      fields: prev.fields.map(f => computeStatus(f.proposed, f.rld) === 'match' ? { ...f, accepted: true } : f),
    } : prev);

  // ---------- Render ----------
  const previewUrl = processingResult?.imageUrl;
  const previewIsPdf = previewUrl
    ? (processingResult?.fileName?.toLowerCase().endsWith('.pdf') || previewUrl.startsWith('data:application/pdf'))
    : false;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Tag className="h-5 w-5" /> Drug Label vs. Reference Listed Drug (RLD)
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => runExtraction(false)} disabled={isExtracting || (!sourceImageBase64 && !sourceRawText)}>
                {isExtracting ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
                Re-extract
              </Button>
              <Button size="sm" variant="outline" asChild disabled={isUploadingRld}>
                <label className="cursor-pointer">
                  {isUploadingRld ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                  Upload RLD separately
                  <input type="file" accept="image/*,.txt,.pdf" className="hidden"
                    onChange={e => e.target.files?.[0] && handleRldUpload(e.target.files[0])} />
                </label>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertTitle>How this works</AlertTitle>
            <AlertDescription className="text-xs">
              When you process a drug label on the Upload tab, this tab automatically separates the
              <strong> Proposed</strong> and <strong> RLD</strong> content found in the same document into a
              dynamic field set and shows mismatches, missing sections, and confidence side-by-side.
              If the document only contains one side, use <em>Upload RLD separately</em> to add the other.
              {processingResult ? (
                <span className="block mt-1 text-green-700 dark:text-green-400">
                  ✓ Source: <strong>{processingResult.fileName || 'last document'}</strong>
                </span>
              ) : (
                <span className="block mt-1 text-orange-700 dark:text-orange-400">
                  ⚠ No extraction loaded yet — go to the Upload tab and process a drug label first.
                </span>
              )}
            </AlertDescription>
          </Alert>

          {previewUrl && (
            <div className="rounded-md border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Source Document Preview
                  <Badge variant="outline" className="text-[10px]">{processingResult?.fileName || 'document'}</Badge>
                  {extraction?.documentContains && (
                    <Badge variant="secondary" className="text-[10px]">contains: {extraction.documentContains}</Badge>
                  )}
                </span>
                <a href={previewUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Open in new tab</a>
              </div>
              <div className="bg-background rounded p-2">
                {previewIsPdf ? (
                  <iframe src={previewUrl} title="Source document preview" className="w-full h-72 rounded border" />
                ) : (
                  <div className="flex justify-center max-h-72 overflow-auto">
                    <img src={previewUrl} alt="Extracted document preview" className="max-h-64 object-contain rounded shadow-sm" />
                  </div>
                )}
              </div>
            </div>
          )}

          {isExtracting && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Separating Proposed vs RLD…</AlertTitle>
              <AlertDescription className="text-xs">
                The model is reading the label and emitting only the sections actually present.
              </AlertDescription>
            </Alert>
          )}

          {extractError && !isExtracting && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Extraction error</AlertTitle>
              <AlertDescription className="text-xs">{extractError}</AlertDescription>
            </Alert>
          )}

          {extraction && fields.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <Badge>{stats.total} dynamic fields</Badge>
                <Badge className="bg-green-600 text-white">{stats.match} match</Badge>
                <Badge className="bg-yellow-500 text-black">{stats.partial} partial</Badge>
                <Badge className="bg-orange-600 text-white">{stats.mismatch} mismatch</Badge>
                <Badge className="bg-red-600 text-white">{stats.missing} missing</Badge>
                <div className="ml-auto">
                  <Button size="sm" variant="ghost" onClick={acceptAllMatches}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept all matches
                  </Button>
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <div className="grid grid-cols-12 bg-muted px-3 py-2 text-xs font-semibold gap-2">
                  <div className="col-span-3">Field (dynamic)</div>
                  <div className="col-span-4 flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Proposed</div>
                  <div className="col-span-4 flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> RLD</div>
                  <div className="col-span-1 text-center">Status</div>
                </div>
                <div className="divide-y max-h-[560px] overflow-y-auto">
                  {fields.map(f => {
                    const status = computeStatus(f.proposed, f.rld);
                    const meta = STATUS_BADGE[status];
                    const showDiff = (status === 'mismatch' || status === 'partial') && f.proposed?.value && f.rld?.value;
                    const diff = showDiff ? diffWords(f.proposed!.value, f.rld!.value) : null;
                    return (
                      <div key={f.key} className={`grid grid-cols-12 px-3 py-2 gap-2 text-xs items-start hover:bg-muted/40 ${f.accepted ? 'bg-green-50/50 dark:bg-green-950/10' : ''}`}>
                        <div className="col-span-3 pt-1">
                          <div className="font-medium">{f.label}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{f.key}</div>
                          {f.accepted && <Badge variant="outline" className="text-[10px] mt-1">accepted</Badge>}
                        </div>
                        <div className="col-span-4">
                          {f.proposed?.value ? (
                            <div className="space-y-1">
                              <div className="font-mono text-xs leading-snug">
                                {diff ? <DiffText parts={diff.left} side="left" /> : f.proposed.value}
                              </div>
                              {typeof f.proposed.confidence === 'number' && (
                                <Badge variant={f.proposed.confidence >= 0.8 ? 'default' : f.proposed.confidence >= 0.5 ? 'secondary' : 'destructive'} className="text-[10px]">
                                  {Math.round(f.proposed.confidence * 100)}%
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-orange-600 dark:text-orange-400 italic">— not in proposed —</span>
                          )}
                        </div>
                        <div className="col-span-4">
                          {f.rld?.value ? (
                            <div className="space-y-1">
                              <div className="font-mono text-xs leading-snug">
                                {diff ? <DiffText parts={diff.right} side="right" /> : f.rld.value}
                              </div>
                              {typeof f.rld.confidence === 'number' && (
                                <Badge variant={f.rld.confidence >= 0.8 ? 'default' : f.rld.confidence >= 0.5 ? 'secondary' : 'destructive'} className="text-[10px]">
                                  {Math.round(f.rld.confidence * 100)}%
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 italic">— not in RLD —</span>
                          )}
                        </div>
                        <div className="col-span-1 flex flex-col items-center gap-1 pt-1">
                          <Badge className={`${meta.cls} text-[10px] whitespace-nowrap`}>{meta.label}</Badge>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => acceptRow(f.key)}>
                            {f.accepted ? 'Unaccept' : 'Accept'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {extraction && fields.length === 0 && !isExtracting && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No fields detected</AlertTitle>
              <AlertDescription className="text-xs">
                The model did not find any structured sections. Try Re-extract, or upload the RLD separately.
              </AlertDescription>
            </Alert>
          )}

          {!extraction && !isExtracting && (
            <div className="text-center text-xs text-muted-foreground py-6">
              <Sparkles className="h-5 w-5 mx-auto mb-2 opacity-60" />
              Process a drug label on the Upload tab to populate this comparison automatically.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DrugLabelRLDTab;
