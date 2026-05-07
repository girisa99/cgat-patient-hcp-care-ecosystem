/**
 * Drug Label RLD Comparison Tab
 *
 * Compares an extracted/proposed drug label against a Reference Listed Drug (RLD)
 * label text and surfaces missing sections, content gaps, and notable divergences.
 *
 * Uses ai-universal-processor (no hardcoded model — provider-only routing).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { Tag, AlertTriangle, CheckCircle2, Loader2, FileText, Sparkles, XCircle, MinusCircle, ShieldCheck, Upload, Image as ImageIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getDocumentTypeById } from '@/config/documentTypes';

interface ExtractedField {
  value?: any;
  confidence?: number;
}

interface ProcessingResult {
  fileName?: string;
  rawText?: string;
  imageUrl?: string;
  extractedFields?: Record<string, ExtractedField | any>;
}

const getFieldValue = (raw: any): string => {
  if (raw === undefined || raw === null) return '';
  if (typeof raw === 'object' && 'value' in raw) {
    const v = (raw as any).value;
    if (v === undefined || v === null) return '';
    return typeof v === 'string' ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
  }
  return typeof raw === 'string' ? raw : (() => { try { return JSON.stringify(raw); } catch { return String(raw); } })();
};

const getFieldConfidence = (raw: any): number | undefined => {
  if (raw && typeof raw === 'object' && 'confidence' in raw) return (raw as any).confidence;
  return undefined;
};

interface Props {
  processingResult: ProcessingResult | null;
}

interface SectionGap {
  section: string;
  status: 'missing' | 'partial' | 'divergent' | 'aligned';
  severity: 'critical' | 'high' | 'medium' | 'low';
  rldExcerpt?: string;
  proposedExcerpt?: string;
  notes?: string;
}

interface FieldVerification {
  fieldKey: string;
  fieldLabel: string;
  proposedValue: string;
  rldValue: string;
  status: 'match' | 'mismatch' | 'missing_in_proposed' | 'missing_in_rld' | 'partial';
  similarity: number; // 0-100
  severity: 'critical' | 'high' | 'medium' | 'low';
  notes?: string;
}

interface ComparisonResult {
  summary: string;
  overallAlignment: number; // 0-100
  gaps: SectionGap[];
  missingSections: string[];
  recommendations: string[];
  fieldVerifications?: FieldVerification[];
}

const SEVERITY_COLOR: Record<SectionGap['severity'], string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-muted text-muted-foreground',
};

const STATUS_ICON: Record<SectionGap['status'], React.ReactNode> = {
  missing: <AlertTriangle className="h-4 w-4 text-destructive" />,
  partial: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  divergent: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  aligned: <CheckCircle2 className="h-4 w-4 text-green-600" />,
};

const humanizeKey = (k: string) =>
  k.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const buildProposedLabelText = (result: ProcessingResult | null): string => {
  if (!result) return '';
  const rawText = (result.rawText || '').trim();
  const fields = result.extractedFields || {};
  const config = getDocumentTypeById('drug-label');

  // 1. Build mapped lines from drug-label target fields (preferred ordering)
  const lines: string[] = [];
  const usedKeys = new Set<string>();
  if (config) {
    config.targetFields.forEach(f => {
      const raw = (fields as any)[f.key];
      const value = raw && typeof raw === 'object' && 'value' in raw ? raw.value : raw;
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        lines.push(`${f.label}: ${String(value)}`);
        usedKeys.add(f.key);
      }
    });
  }

  // 2. Append any other extracted fields not in the config so nothing is lost
  Object.entries(fields).forEach(([k, raw]) => {
    if (usedKeys.has(k)) return;
    if (k === 'tables' || k === 'ai_insights_json') return;
    const value = raw && typeof raw === 'object' && 'value' in (raw as any) ? (raw as any).value : raw;
    if (value === undefined || value === null) return;
    const str = typeof value === 'string' ? value : (() => {
      try { return JSON.stringify(value); } catch { return String(value); }
    })();
    if (!str.trim()) return;
    lines.push(`${humanizeKey(k)}: ${str}`);
  });

  const fieldsBlock = lines.join('\n');

  // 3. Combine raw OCR text + structured fields so the LLM has everything
  if (rawText && fieldsBlock) return `${fieldsBlock}\n\n--- FULL EXTRACTED TEXT ---\n${rawText}`;
  if (rawText) return rawText;
  return fieldsBlock;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ---- Word-level diff (LCS) for inline highlighting ----
type DiffPart = { text: string; type: 'same' | 'add' | 'remove' };
const tokenize = (s: string): string[] => (s || '').split(/(\s+)/).filter(Boolean);

const diffWords = (a: string, b: string): { left: DiffPart[]; right: DiffPart[] } => {
  const A = tokenize(a);
  const B = tokenize(b);
  const n = A.length, m = B.length;
  // LCS DP — bounded for safety
  if (n * m > 40000) {
    return {
      left: [{ text: a, type: a === b ? 'same' : 'remove' }],
      right: [{ text: b, type: a === b ? 'same' : 'add' }],
    };
  }
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  const norm = (t: string) => t.toLowerCase();
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = norm(A[i]) === norm(B[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const left: DiffPart[] = [];
  const right: DiffPart[] = [];
  let i = 0, j = 0;
  const pushLeft = (t: string, type: DiffPart['type']) => {
    const last = left[left.length - 1];
    if (last && last.type === type) last.text += t; else left.push({ text: t, type });
  };
  const pushRight = (t: string, type: DiffPart['type']) => {
    const last = right[right.length - 1];
    if (last && last.type === type) last.text += t; else right.push({ text: t, type });
  };
  while (i < n && j < m) {
    if (norm(A[i]) === norm(B[j])) {
      pushLeft(A[i], 'same'); pushRight(B[j], 'same'); i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      pushLeft(A[i], 'remove'); i++;
    } else {
      pushRight(B[j], 'add'); j++;
    }
  }
  while (i < n) { pushLeft(A[i++], 'remove'); }
  while (j < m) { pushRight(B[j++], 'add'); }
  return { left, right };
};

const DiffText: React.FC<{ parts: DiffPart[]; side: 'left' | 'right' }> = ({ parts, side }) => (
  <span className="whitespace-pre-wrap break-words">
    {parts.map((p, i) => {
      if (p.type === 'same') return <span key={i}>{p.text}</span>;
      const cls = side === 'left'
        ? 'bg-red-200/80 dark:bg-red-900/60 text-red-900 dark:text-red-100 rounded px-0.5'
        : 'bg-green-200/80 dark:bg-green-900/60 text-green-900 dark:text-green-100 rounded px-0.5';
      return <span key={i} className={cls}>{p.text}</span>;
    })}
  </span>
);


const DrugLabelRLDTab: React.FC<Props> = ({ processingResult }) => {
  const RLD_STORAGE_KEY = 'drugLabel_rldText';
  const RLD_FIELDS_KEY = 'drugLabel_rldFields';
  const config = getDocumentTypeById('drug-label');
  const targetFields = config?.targetFields || [];

  const [rldText, setRldText] = useState<string>(() => {
    try { return sessionStorage.getItem(RLD_STORAGE_KEY) || ''; } catch { return ''; }
  });
  const [rldFieldValues, setRldFieldValues] = useState<Record<string, string>>(() => {
    try { return JSON.parse(sessionStorage.getItem(RLD_FIELDS_KEY) || '{}'); } catch { return {}; }
  });
  const [proposedOverride, setProposedOverride] = useState('');
  const [proposedFieldOverrides, setProposedFieldOverrides] = useState<Record<string, string>>({});
  const [showRawProposed, setShowRawProposed] = useState(false);
  const [showRawRld, setShowRawRld] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isOcrProposed, setIsOcrProposed] = useState(false);
  const [isOcrRld, setIsOcrRld] = useState(false);
  const [proposedFileName, setProposedFileName] = useState<string>('');
  const [rldFileName, setRldFileName] = useState<string>('');

  // Persist RLD inputs so they survive tab switches & re-extractions
  useEffect(() => {
    try {
      if (rldText) sessionStorage.setItem(RLD_STORAGE_KEY, rldText);
      else sessionStorage.removeItem(RLD_STORAGE_KEY);
    } catch {}
  }, [rldText]);
  useEffect(() => {
    try { sessionStorage.setItem(RLD_FIELDS_KEY, JSON.stringify(rldFieldValues)); } catch {}
  }, [rldFieldValues]);

  // Per-field proposed values pulled from extraction (with manual override support)
  const proposedFieldValues = useMemo(() => {
    const out: Record<string, { value: string; confidence?: number }> = {};
    const fields = processingResult?.extractedFields || {};
    targetFields.forEach(tf => {
      const raw = (fields as any)[tf.key];
      out[tf.key] = {
        value: proposedFieldOverrides[tf.key] ?? getFieldValue(raw),
        confidence: getFieldConfidence(raw),
      };
    });
    return out;
  }, [processingResult, proposedFieldOverrides, targetFields]);

  // Composite text used by the AI: structured fields + raw OCR text
  const extractedProposed = useMemo(() => buildProposedLabelText(processingResult), [processingResult]);
  const proposedText = useMemo(() => {
    if (proposedOverride.trim()) return proposedOverride;
    const lines = targetFields
      .map(tf => {
        const v = proposedFieldValues[tf.key]?.value;
        return v ? `${tf.label}: ${v}` : '';
      })
      .filter(Boolean);
    const raw = (processingResult?.rawText || '').trim();
    const block = lines.join('\n');
    if (block && raw) return `${block}\n\n--- FULL EXTRACTED TEXT ---\n${raw}`;
    return block || raw || extractedProposed;
  }, [proposedOverride, targetFields, proposedFieldValues, processingResult, extractedProposed]);

  const compositeRldText = useMemo(() => {
    const lines = targetFields
      .map(tf => (rldFieldValues[tf.key] ? `${tf.label}: ${rldFieldValues[tf.key]}` : ''))
      .filter(Boolean);
    const block = lines.join('\n');
    if (block && rldText) return `${block}\n\n--- FULL RLD TEXT ---\n${rldText}`;
    return block || rldText;
  }, [targetFields, rldFieldValues, rldText]);

  const ocrFile = async (file: File): Promise<string> => {
    const dataUrl = await fileToBase64(file);
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        action: 'analyze_scene',
        prompt: 'Extract ALL text from this drug label image verbatim. Preserve sections, headings, dosing tables, warnings, and bullet structure. Output plain text only — no commentary.',
        systemPrompt: 'You are an OCR engine specialized in pharmaceutical labels. Return only extracted text.',
        temperature: 0,
        maxTokens: 8000,
        context: { image: dataUrl },
      },
    });
    if (error) throw new Error(error.message);
    const text = (data?.content || '').trim();
    if (!text) throw new Error('No text extracted from image');
    return text;
  };

  // Structured field extractor — pulls each FDA target field out of an image into its own value
  const extractStructuredFields = async (file: File): Promise<Record<string, string>> => {
    const dataUrl = await fileToBase64(file);
    const fieldList = targetFields.map(f => `"${f.key}" (${f.label})`).join(', ');
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        action: 'analyze_scene',
        systemPrompt: 'You are an FDA drug-label parser. Read the label image and return ONLY a single JSON object — no prose, no markdown.',
        prompt: `Extract values for these FDA labeling fields from the image and return strict JSON of shape {"<key>": "<verbatim text from label or empty string>"}.
Use these exact keys: ${fieldList}.
Rules:
- Copy text VERBATIM from the label.
- If a field is not present, use an empty string "".
- Do NOT invent values.
- Return ONLY the JSON object.`,
        temperature: 0,
        maxTokens: 6000,
        context: { image: dataUrl },
      },
    });
    if (error) throw new Error(error.message);
    const content: string = data?.content || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      const parsed = JSON.parse(match[0]);
      const out: Record<string, string> = {};
      Object.entries(parsed).forEach(([k, v]) => {
        if (typeof v === 'string' && v.trim()) out[k] = v.trim();
        else if (v && typeof v === 'object') out[k] = JSON.stringify(v);
      });
      return out;
    } catch {
      return {};
    }
  };

  const handleUpload = async (file: File, target: 'proposed' | 'rld') => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP). For PDFs, process via the Upload tab.');
      return;
    }
    const setLoading = target === 'proposed' ? setIsOcrProposed : setIsOcrRld;
    setLoading(true);
    try {
      toast.info(`Reading ${target === 'proposed' ? 'proposed' : 'RLD'} label — extracting structured fields…`);
      // Run raw OCR + structured extraction in parallel so we get both the full text and per-field values
      const [text, structured] = await Promise.all([
        ocrFile(file),
        extractStructuredFields(file).catch(err => {
          console.warn('Structured extraction failed, falling back to raw text only:', err);
          return {} as Record<string, string>;
        }),
      ]);
      const structuredCount = Object.keys(structured).length;

      if (target === 'proposed') {
        setProposedOverride(text);
        setProposedFileName(file.name);
        if (structuredCount > 0) {
          setProposedFieldOverrides(prev => ({ ...prev, ...structured }));
        }
      } else {
        setRldText(text);
        setRldFileName(file.name);
        if (structuredCount > 0) {
          setRldFieldValues(prev => ({ ...prev, ...structured }));
        }
      }
      toast.success(
        `${target === 'proposed' ? 'Proposed' : 'RLD'} label parsed — ${structuredCount} fields + ${text.length} chars`
      );
    } catch (err: any) {
      console.error('OCR error:', err);
      toast.error(err?.message || 'Failed to extract text from image');
    } finally {
      setLoading(false);
    }
  };



  const lastComparedRef = useRef<string>('');
  const autoTimerRef = useRef<number | null>(null);

  const rldHasContent = useMemo(() => {
    const filledFields = Object.values(rldFieldValues).filter(v => v && v.trim()).length;
    return filledFields >= 2 || rldText.trim().length >= 50;
  }, [rldFieldValues, rldText]);

  const runComparison = useCallback(async (silent = false) => {
    if (!proposedText.trim()) {
      if (!silent) toast.error('Process a drug label first to populate the proposed label.');
      return;
    }
    if (!rldHasContent) {
      if (!silent) toast.error('Fill in RLD fields, paste, or upload the Reference Listed Drug label first.');
      return;
    }

    const rldForAI = compositeRldText;
    const signature = `${proposedText.length}:${rldForAI.length}:${proposedText.slice(0, 80)}|${rldForAI.slice(0, 80)}`;
    if (silent && signature === lastComparedRef.current) return;
    lastComparedRef.current = signature;

    setIsComparing(true);
    setComparison(null);
    try {
      const fieldList = targetFields.map(f => `- ${f.key} (${f.label})`).join('\n');

      const systemPrompt = `You are an FDA labeling regulatory expert performing TWO analyses on a drug label:

(A) SECTION-LEVEL gap analysis per FDA Physician Labeling Rule (21 CFR 201.56/57) sections:
1 Indications & Usage, 2 Dosage & Administration, 3 Dosage Forms & Strengths, 4 Contraindications, 5 Warnings & Precautions,
Boxed Warning, 6 Adverse Reactions, 7 Drug Interactions, 8 Use in Specific Populations, 10 Overdosage, 11 Description,
12 Clinical Pharmacology, 13 Nonclinical Toxicology, 14 Clinical Studies, 16 How Supplied/Storage and Handling, 17 Patient Counseling.

(B) FIELD-LEVEL TEXT VERIFICATION: for each labeling field listed below, extract the value from BOTH the PROPOSED and RLD label, compare them character/semantic-wise, and flag mismatches, missing values, or partial matches. Compute a similarity 0-100 (100 = exact text match, 90+ = semantically equivalent, <50 = clearly different).

Fields to verify:
${fieldList}

Return STRICT JSON only, no prose.`;

      const userPrompt = `Compare the PROPOSED label against the RLD label and return JSON of shape:
{
  "summary": "string",
  "overallAlignment": number (0-100),
  "missingSections": ["section name", ...],
  "gaps": [
    { "section": "string", "status": "missing|partial|divergent|aligned", "severity": "critical|high|medium|low",
      "rldExcerpt": "string (<=300 chars)", "proposedExcerpt": "string (<=300 chars)", "notes": "string" }
  ],
  "fieldVerifications": [
    { "fieldKey": "string (matches the keys above)", "fieldLabel": "string",
      "proposedValue": "string (<=400 chars, '' if not found)", "rldValue": "string (<=400 chars, '' if not found)",
      "status": "match|mismatch|missing_in_proposed|missing_in_rld|partial",
      "similarity": number (0-100), "severity": "critical|high|medium|low", "notes": "string" }
  ],
  "recommendations": ["string", ...]
}

=== RLD LABEL ===
${rldForAI.slice(0, 18000)}

=== PROPOSED LABEL ===
${proposedText.slice(0, 18000)}`;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'openai',
          prompt: userPrompt,
          systemPrompt,
          temperature: 0.1,
          maxTokens: 6000,
          action: 'generate',
        },
      });

      if (error) throw new Error(error.message);

      const content: string = data?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI did not return JSON');

      const parsed: ComparisonResult = JSON.parse(jsonMatch[0]);

      // Guarantee a row for every target field — backfill from structured inputs when AI omits
      const existing = new Map((parsed.fieldVerifications || []).map(f => [f.fieldKey, f]));
      const fullVerifications: FieldVerification[] = targetFields.map(tf => {
        const proposedVal = proposedFieldValues[tf.key]?.value || '';
        const rldVal = rldFieldValues[tf.key] || '';
        const found = existing.get(tf.key);
        if (found) {
          // Prefer structured user-entered values when AI returned empty
          return {
            ...found,
            fieldLabel: found.fieldLabel || tf.label,
            proposedValue: found.proposedValue || proposedVal,
            rldValue: found.rldValue || rldVal,
          };
        }
        // Compute a baseline status from structured inputs alone
        let status: FieldVerification['status'] = 'missing_in_proposed';
        let similarity = 0;
        if (proposedVal && rldVal) {
          const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
          if (norm(proposedVal) === norm(rldVal)) { status = 'match'; similarity = 100; }
          else if (norm(proposedVal).includes(norm(rldVal)) || norm(rldVal).includes(norm(proposedVal))) {
            status = 'partial'; similarity = 70;
          } else { status = 'mismatch'; similarity = 20; }
        } else if (proposedVal && !rldVal) { status = 'missing_in_rld'; }
        else if (!proposedVal && rldVal) { status = 'missing_in_proposed'; }

        return {
          fieldKey: tf.key,
          fieldLabel: tf.label,
          proposedValue: proposedVal,
          rldValue: rldVal,
          status,
          similarity,
          severity: 'medium',
          notes: existing.size === 0 ? '' : 'Not evaluated by AI — verified from structured fields',
        };
      });
      // Append any AI-returned fields not in config (extras)
      (parsed.fieldVerifications || []).forEach(f => {
        if (!targetFields.find(t => t.key === f.fieldKey)) fullVerifications.push(f);
      });
      parsed.fieldVerifications = fullVerifications;

      setComparison(parsed);
      const matched = fullVerifications.filter(f => f.status === 'match').length;
      const issues = fullVerifications.length - matched;
      toast.success(`Comparison complete — ${matched} matched, ${issues} to review`);
    } catch (err: any) {
      console.error('RLD comparison error:', err);
      if (!silent) toast.error(err?.message || 'Comparison failed');
      lastComparedRef.current = '';
    } finally {
      setIsComparing(false);
    }
  }, [proposedText, compositeRldText, rldHasContent, targetFields, proposedFieldValues, rldFieldValues]);

  // Auto-run comparison whenever both inputs are populated and stable for 800ms
  useEffect(() => {
    if (!proposedText.trim() || !rldHasContent) return;
    if (isComparing) return;
    if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
    autoTimerRef.current = window.setTimeout(() => {
      runComparison(true);
    }, 800);
    return () => {
      if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
    };
  }, [proposedText, rldHasContent, isComparing, runComparison]);


  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" /> Drug Label vs. Reference Listed Drug (RLD)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertTitle>How this works</AlertTitle>
            <AlertDescription className="text-xs">
              The <strong>Proposed Label</strong> is auto-populated from your most recent extraction
              (Upload tab — OCR/NLP fields + raw text). Upload or paste the <strong>RLD label</strong>{' '}
              on the right. Comparison runs automatically and shows field-by-field matches, mismatches,
              and what's missing.
              {processingResult ? (
                <span className="block mt-1 text-green-700 dark:text-green-400">
                  ✓ Loaded extraction from <strong>{processingResult.fileName || 'last document'}</strong>
                  {' '}({Object.keys(processingResult.extractedFields || {}).length} fields,{' '}
                  {(processingResult.rawText || '').length} chars of raw text)
                </span>
              ) : (
                <span className="block mt-1 text-orange-700 dark:text-orange-400">
                  ⚠ No extraction loaded yet — go to the Upload tab and process a drug label first,
                  or upload an image directly below.
                </span>
              )}
            </AlertDescription>
          </Alert>
          {/* Document preview from extraction */}
          {processingResult?.imageUrl && (
            <div className="rounded-md border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Source Document Preview
                  <Badge variant="outline" className="text-[10px]">{processingResult.fileName || 'document'}</Badge>
                </span>
              </div>
              <div className="flex justify-center bg-background rounded p-2 max-h-72 overflow-auto">
                <img
                  src={processingResult.imageUrl}
                  alt="Extracted document preview"
                  className="max-h-64 object-contain rounded shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Structured side-by-side field grid */}
          <div className="rounded-md border overflow-hidden">
            <div className="grid grid-cols-12 bg-muted px-3 py-2 text-xs font-semibold sticky top-0 z-10 gap-2">
              <div className="col-span-3">Field</div>
              <div className="col-span-4 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" /> Proposed (extracted)
              </div>
              <div className="col-span-4 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Reference Listed Drug (RLD)
                <Button asChild size="sm" variant="ghost" className="h-6 px-2 ml-auto" disabled={isOcrRld}>
                  <label className="cursor-pointer text-[10px] flex items-center">
                    {isOcrRld ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}
                    OCR image
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'rld')} />
                  </label>
                </Button>
              </div>
              <div className="col-span-1 text-center">Conf.</div>
            </div>
            <div className="divide-y max-h-[480px] overflow-y-auto">
              {targetFields.map(tf => {
                const p = proposedFieldValues[tf.key];
                const rld = rldFieldValues[tf.key] || '';
                const conf = p?.confidence;
                const proposedFilled = !!(p?.value && p.value.trim());
                const rldFilled = !!rld.trim();
                return (
                  <div key={tf.key} className="grid grid-cols-12 px-3 py-2 gap-2 text-xs items-start hover:bg-muted/40">
                    <div className="col-span-3 font-medium pt-1.5">
                      {tf.label}
                      {tf.required && <span className="text-destructive ml-1">*</span>}
                    </div>
                    <div className="col-span-4">
                      <Textarea
                        value={p?.value || ''}
                        onChange={e => setProposedFieldOverrides(s => ({ ...s, [tf.key]: e.target.value }))}
                        placeholder={proposedFilled ? '' : '— not extracted —'}
                        className={`min-h-[36px] text-xs font-mono ${!proposedFilled ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-300' : ''}`}
                        rows={Math.min(6, Math.max(1, Math.ceil((p?.value?.length || 0) / 60)))}
                      />
                    </div>
                    <div className="col-span-4">
                      <Textarea
                        value={rld}
                        onChange={e => setRldFieldValues(s => ({ ...s, [tf.key]: e.target.value }))}
                        placeholder={rldFilled ? '' : 'Paste RLD value…'}
                        className={`min-h-[36px] text-xs font-mono ${!rldFilled ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300' : ''}`}
                        rows={Math.min(6, Math.max(1, Math.ceil((rld.length || 0) / 60)))}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center pt-1.5">
                      {conf !== undefined ? (
                        <Badge variant={conf >= 0.8 ? 'default' : conf >= 0.5 ? 'secondary' : 'destructive'} className="text-[10px]">
                          {Math.round(conf * 100)}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raw text fallback (collapsed by default) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button type="button" onClick={() => setShowRawProposed(s => !s)}
                  className="text-xs font-medium underline text-muted-foreground hover:text-foreground">
                  {showRawProposed ? '▼' : '▶'} Raw proposed text ({proposedText.length} chars)
                </button>
                <Button asChild size="sm" variant="outline" disabled={isOcrProposed}>
                  <label className="cursor-pointer">
                    {isOcrProposed ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                    OCR proposed image
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'proposed')} />
                  </label>
                </Button>
              </div>
              {proposedFileName && <div className="text-[11px] text-muted-foreground">{proposedFileName}</div>}
              {showRawProposed && (
                <Textarea
                  value={proposedText}
                  onChange={e => setProposedOverride(e.target.value)}
                  placeholder="Composite proposed text used for AI comparison…"
                  className="h-48 font-mono text-xs"
                />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button type="button" onClick={() => setShowRawRld(s => !s)}
                  className="text-xs font-medium underline text-muted-foreground hover:text-foreground">
                  {showRawRld ? '▼' : '▶'} Raw RLD text ({rldText.length} chars)
                </button>
              </div>
              {rldFileName && <div className="text-[11px] text-muted-foreground">{rldFileName}</div>}
              {showRawRld && (
                <Textarea
                  value={rldText}
                  onChange={e => setRldText(e.target.value)}
                  placeholder="Optional full RLD label text (Prescribing Information / package insert)…"
                  className="h-48 font-mono text-xs"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => { lastComparedRef.current = ''; runComparison(false); }}
              disabled={isComparing || !proposedText || !rldHasContent}
            >
              {isComparing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Comparing…</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Run RLD Comparison</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Comparison Results</span>
              <Badge variant={comparison.overallAlignment >= 80 ? 'default' : 'destructive'}>
                {comparison.overallAlignment}% aligned
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>Summary</AlertTitle>
              <AlertDescription>{comparison.summary}</AlertDescription>
            </Alert>

            {comparison.missingSections?.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Missing Sections ({comparison.missingSections.length})</AlertTitle>
                <AlertDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {comparison.missingSections.map(s => (
                      <Badge key={s} variant="destructive">{s}</Badge>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {comparison.fieldVerifications && comparison.fieldVerifications.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Field-level Text Verification
                    </h4>
                    {(() => {
                      const v = comparison.fieldVerifications!;
                      const matches = v.filter(f => f.status === 'match').length;
                      const issues = v.length - matches;
                      return (
                        <div className="flex gap-2 text-xs">
                          <Badge variant="default">{matches} matched</Badge>
                          <Badge variant="destructive">{issues} issues</Badge>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-muted-foreground">Legend:</span>
                    <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800">Match</span>
                    <span className="px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/40 border border-yellow-300 dark:border-yellow-800">Partial</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800">Mismatch</span>
                    <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800">Missing in proposed</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800">Missing in RLD</span>
                  </div>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[18%]">Field</TableHead>
                          <TableHead className="w-[28%]">RLD Value</TableHead>
                          <TableHead className="w-[28%]">Proposed Value</TableHead>
                          <TableHead className="w-[10%]">Similarity</TableHead>
                          <TableHead className="w-[16%]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparison.fieldVerifications!.map((fv, i) => {
                          const statusIcon =
                            fv.status === 'match' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                            fv.status === 'partial' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                            fv.status === 'mismatch' ? <XCircle className="h-4 w-4 text-destructive" /> :
                            <MinusCircle className="h-4 w-4 text-muted-foreground" />;
                          // Row-level highlight by status
                          const rowClass =
                            fv.status === 'match' ? 'bg-green-50 dark:bg-green-950/30 hover:bg-green-100/70 dark:hover:bg-green-950/50' :
                            fv.status === 'partial' ? 'bg-yellow-50 dark:bg-yellow-950/30 hover:bg-yellow-100/70 dark:hover:bg-yellow-950/50' :
                            fv.status === 'mismatch' ? 'bg-red-50 dark:bg-red-950/30 hover:bg-red-100/70 dark:hover:bg-red-950/50' :
                            fv.status === 'missing_in_proposed' ? 'bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100/70 dark:hover:bg-orange-950/50' :
                            'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-950/50';
                          const missingProposed = !fv.proposedValue || fv.status === 'missing_in_proposed';
                          const missingRld = !fv.rldValue || fv.status === 'missing_in_rld';
                          return (
                            <TableRow key={i} className={rowClass}>
                              <TableCell className="text-xs font-medium">{fv.fieldLabel || fv.fieldKey}</TableCell>
                              <TableCell className={`text-xs whitespace-pre-wrap break-words ${missingRld ? 'bg-blue-100/60 dark:bg-blue-900/40' : ''}`}>
                                {fv.rldValue || <span className="text-blue-700 dark:text-blue-300 italic font-semibold">— not in RLD —</span>}
                              </TableCell>
                              <TableCell className={`text-xs whitespace-pre-wrap break-words ${missingProposed ? 'bg-orange-100/60 dark:bg-orange-900/40' : ''}`}>
                                {fv.proposedValue || <span className="text-orange-700 dark:text-orange-300 italic font-semibold">⚠ MISSING in proposed</span>}
                              </TableCell>
                              <TableCell className="text-xs">
                                <Badge variant={fv.similarity >= 90 ? 'default' : fv.similarity >= 50 ? 'secondary' : 'destructive'}>
                                  {fv.similarity}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1">
                                    {statusIcon}
                                    <span className="capitalize font-medium">{fv.status.replace(/_/g, ' ')}</span>
                                  </div>
                                  <Badge className={SEVERITY_COLOR[fv.severity]} variant="outline">{fv.severity}</Badge>
                                  {fv.notes && <span className="text-muted-foreground">{fv.notes}</span>}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <h4 className="text-sm font-semibold">Section-by-section findings</h4>
              {comparison.gaps?.map((gap, i) => {
                const gapClass =
                  gap.status === 'aligned' ? 'border-green-300 dark:border-green-800 bg-green-50/60 dark:bg-green-950/20' :
                  gap.status === 'partial' ? 'border-yellow-300 dark:border-yellow-800 bg-yellow-50/60 dark:bg-yellow-950/20' :
                  gap.status === 'divergent' ? 'border-orange-300 dark:border-orange-800 bg-orange-50/60 dark:bg-orange-950/20' :
                  'border-red-300 dark:border-red-800 bg-red-50/60 dark:bg-red-950/20';
                return (
                <div key={i} className={`rounded-md border p-3 space-y-2 ${gapClass}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-medium">
                      {STATUS_ICON[gap.status]}
                      <span>{gap.section}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{gap.status}</Badge>
                      <Badge className={SEVERITY_COLOR[gap.severity]}>{gap.severity}</Badge>
                    </div>
                  </div>
                  {gap.notes && <p className="text-sm text-muted-foreground">{gap.notes}</p>}
                  {(gap.rldExcerpt || gap.proposedExcerpt) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {gap.rldExcerpt && (
                        <div className="bg-muted/40 p-2 rounded">
                          <div className="font-semibold mb-1">RLD</div>
                          <div className="whitespace-pre-wrap">{gap.rldExcerpt}</div>
                        </div>
                      )}
                      {gap.proposedExcerpt && (
                        <div className="bg-muted/40 p-2 rounded">
                          <div className="font-semibold mb-1">Proposed</div>
                          <div className="whitespace-pre-wrap">{gap.proposedExcerpt}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            {comparison.recommendations?.length > 0 && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Recommendations</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    {comparison.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DrugLabelRLDTab;
