/**
 * Drug Label RLD Comparison Tab
 *
 * Compares an extracted/proposed drug label against a Reference Listed Drug (RLD)
 * label text and surfaces missing sections, content gaps, and notable divergences.
 *
 * Uses ai-universal-processor (no hardcoded model — provider-only routing).
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tag, AlertTriangle, CheckCircle2, Loader2, FileText, Sparkles, XCircle, MinusCircle, ShieldCheck } from 'lucide-react';
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

const DrugLabelRLDTab: React.FC<Props> = ({ processingResult }) => {
  const [rldText, setRldText] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const proposedText = useMemo(() => buildProposedLabelText(processingResult), [processingResult]);

  const runComparison = async () => {
    if (!proposedText.trim()) {
      toast.error('Process a drug label first to populate the proposed label.');
      return;
    }
    if (rldText.trim().length < 50) {
      toast.error('Paste the Reference Listed Drug (RLD) label text first.');
      return;
    }

    setIsComparing(true);
    setComparison(null);
    try {
      const systemPrompt = `You are an FDA labeling regulatory expert. You compare a PROPOSED drug label against the Reference Listed Drug (RLD) label.
Identify, per FDA Physician Labeling Rule (21 CFR 201.56/57) sections:
1 Indications & Usage, 2 Dosage & Administration, 3 Dosage Forms & Strengths, 4 Contraindications, 5 Warnings & Precautions,
Boxed Warning, 6 Adverse Reactions, 7 Drug Interactions, 8 Use in Specific Populations, 10 Overdosage, 11 Description,
12 Clinical Pharmacology, 13 Nonclinical Toxicology, 14 Clinical Studies, 16 How Supplied/Storage and Handling, 17 Patient Counseling.
For each section: status = missing | partial | divergent | aligned, plus severity = critical | high | medium | low.
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
          maxTokens: 4000,
          action: 'generate',
        },
      });

      if (error) throw new Error(error.message);

      const content: string = data?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI did not return JSON');

      const parsed: ComparisonResult = JSON.parse(jsonMatch[0]);
      setComparison(parsed);
      toast.success(`Comparison complete — ${parsed.gaps?.length ?? 0} findings`);
    } catch (err: any) {
      console.error('RLD comparison error:', err);
      toast.error(err?.message || 'Comparison failed');
    } finally {
      setIsComparing(false);
    }
  };

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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Proposed Label (from extraction)
                </label>
                <Badge variant="outline">
                  {proposedText ? `${proposedText.length} chars` : 'Empty — process a label first'}
                </Badge>
              </div>
              <ScrollArea className="h-64 rounded-md border bg-muted/30 p-3">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {proposedText || 'No proposed label yet. Upload and process a drug label in the Upload tab.'}
                </pre>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" /> Reference Listed Drug (RLD) Label Text
              </label>
              <Textarea
                value={rldText}
                onChange={e => setRldText(e.target.value)}
                placeholder="Paste the full FDA RLD label text here (Prescribing Information / package insert)…"
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
              <h4 className="text-sm font-semibold">Section-by-section findings</h4>
              {comparison.gaps?.map((gap, i) => (
                <div key={i} className="rounded-md border p-3 space-y-2">
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
              ))}
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
