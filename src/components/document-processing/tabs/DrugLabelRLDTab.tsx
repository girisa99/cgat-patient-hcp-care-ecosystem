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
  extractedFields?: Record<string, ExtractedField | any>;
}

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

const buildProposedLabelText = (result: ProcessingResult | null): string => {
  if (!result) return '';
  if (result.rawText && result.rawText.trim().length > 50) return result.rawText;

  const fields = result.extractedFields || {};
  const config = getDocumentTypeById('drug-label');
  if (!config) return '';

  const lines: string[] = [];
  config.targetFields.forEach(f => {
    const raw = fields[f.key];
    const value = raw && typeof raw === 'object' && 'value' in raw ? raw.value : raw;
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      lines.push(`${f.label}: ${String(value)}`);
    }
  });
  return lines.join('\n');
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const DrugLabelRLDTab: React.FC<Props> = ({ processingResult }) => {
  const [rldText, setRldText] = useState('');
  const [proposedOverride, setProposedOverride] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isOcrProposed, setIsOcrProposed] = useState(false);
  const [isOcrRld, setIsOcrRld] = useState(false);
  const [proposedFileName, setProposedFileName] = useState<string>('');
  const [rldFileName, setRldFileName] = useState<string>('');

  const extractedProposed = useMemo(() => buildProposedLabelText(processingResult), [processingResult]);
  const proposedText = proposedOverride.trim() ? proposedOverride : extractedProposed;

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

  const handleUpload = async (file: File, target: 'proposed' | 'rld') => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP). For PDFs, process via the Upload tab.');
      return;
    }
    const setLoading = target === 'proposed' ? setIsOcrProposed : setIsOcrRld;
    setLoading(true);
    try {
      toast.info(`Reading ${target === 'proposed' ? 'proposed' : 'RLD'} label…`);
      const text = await ocrFile(file);
      if (target === 'proposed') {
        setProposedOverride(text);
        setProposedFileName(file.name);
      } else {
        setRldText(text);
        setRldFileName(file.name);
      }
      toast.success(`Extracted ${text.length} chars from ${file.name}`);
    } catch (err: any) {
      console.error('OCR error:', err);
      toast.error(err?.message || 'Failed to extract text from image');
    } finally {
      setLoading(false);
    }
  };


  const lastComparedRef = useRef<string>('');
  const autoTimerRef = useRef<number | null>(null);

  const runComparison = useCallback(async (silent = false) => {
    if (!proposedText.trim()) {
      if (!silent) toast.error('Process a drug label first to populate the proposed label.');
      return;
    }
    if (rldText.trim().length < 50) {
      if (!silent) toast.error('Paste or upload the Reference Listed Drug (RLD) label first.');
      return;
    }

    const signature = `${proposedText.length}:${rldText.length}:${proposedText.slice(0, 80)}|${rldText.slice(0, 80)}`;
    if (silent && signature === lastComparedRef.current) return;
    lastComparedRef.current = signature;

    setIsComparing(true);
    setComparison(null);
    try {
      const config = getDocumentTypeById('drug-label');
      const fieldList = (config?.targetFields || []).map(f => `- ${f.key} (${f.label})`).join('\n');

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
${rldText.slice(0, 18000)}

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
      setComparison(parsed);
      const matched = parsed.fieldVerifications?.filter(f => f.status === 'match').length ?? 0;
      const issues = (parsed.fieldVerifications?.length ?? 0) - matched;
      toast.success(`Comparison complete — ${matched} matched, ${issues} to review`);
    } catch (err: any) {
      console.error('RLD comparison error:', err);
      if (!silent) toast.error(err?.message || 'Comparison failed');
      lastComparedRef.current = ''; // allow retry
    } finally {
      setIsComparing(false);
    }
  }, [proposedText, rldText]);

  // Auto-run comparison whenever both inputs are populated and stable for 800ms
  useEffect(() => {
    if (!proposedText.trim() || rldText.trim().length < 50) return;
    if (isComparing) return;
    if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
    autoTimerRef.current = window.setTimeout(() => {
      runComparison(true);
    }, 800);
    return () => {
      if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
    };
  }, [proposedText, rldText, isComparing, runComparison]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" /> Drug Label vs. Reference Listed Drug (RLD)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Proposed Label
                </label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {proposedText ? `${proposedText.length} chars` : 'Empty'}
                  </Badge>
                  <Button asChild size="sm" variant="outline" disabled={isOcrProposed}>
                    <label className="cursor-pointer">
                      {isOcrProposed ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                      Upload image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'proposed')}
                      />
                    </label>
                  </Button>
                </div>
              </div>
              {proposedFileName && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> {proposedFileName}
                </div>
              )}
              <Textarea
                value={proposedText}
                onChange={e => setProposedOverride(e.target.value)}
                placeholder="Proposed label text will appear here after upload, OCR, or extraction from the Upload tab. You can also paste text directly."
                className="h-64 font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Reference Listed Drug (RLD) Label
                </label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {rldText ? `${rldText.length} chars` : 'Empty'}
                  </Badge>
                  <Button asChild size="sm" variant="outline" disabled={isOcrRld}>
                    <label className="cursor-pointer">
                      {isOcrRld ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                      Upload image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'rld')}
                      />
                    </label>
                  </Button>
                </div>
              </div>
              {rldFileName && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> {rldFileName}
                </div>
              )}
              <Textarea
                value={rldText}
                onChange={e => setRldText(e.target.value)}
                placeholder="Upload an RLD label image or paste the full FDA RLD label text here (Prescribing Information / package insert)…"
                className="h-64 font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={runComparison}
              disabled={isComparing || !proposedText || rldText.trim().length < 50}
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
