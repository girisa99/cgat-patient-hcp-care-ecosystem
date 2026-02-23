/**
 * BrandVoiceChecker - Validates script against brand voice guidelines
 * Uses the enhance-script edge function with brand context injected
 * via customInstructions, and the brandIntelligenceEngine for profile data.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrandVoiceIssue {
  id: string;
  type: 'forbidden_word' | 'tone_mismatch' | 'formality' | 'readability' | 'missing_element' | 'cultural';
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  originalText?: string;
  suggestedFix?: string;
  resolved: boolean;
}

interface BrandVoiceResult {
  overallScore: number;
  toneMatch: number;
  formalityMatch: number;
  readabilityMatch: number;
  issues: BrandVoiceIssue[];
  summary: string;
}

interface BrandVoiceCheckerProps {
  scriptContent: string;
  isVisible: boolean;
  onClose: () => void;
  onApplyFix: (originalText: string, suggestedText: string) => void;
  brandName?: string;
  brandTone?: string;
  brandVoiceAvoid?: string[];
}

const SEVERITY_COLORS = {
  error: { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-600', icon: <X className="h-3 w-3" /> },
  warning: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-600', icon: <AlertTriangle className="h-3 w-3" /> },
  info: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-600', icon: <BookOpen className="h-3 w-3" /> },
};

export function BrandVoiceChecker({
  scriptContent,
  isVisible,
  onClose,
  onApplyFix,
  brandName = 'GenieSuite',
  brandTone = 'empowering, approachable',
  brandVoiceAvoid = ['condescending', 'corporate jargon', 'exclusionary language'],
}: BrandVoiceCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<BrandVoiceResult | null>(null);

  if (!isVisible) return null;

  const handleCheck = async () => {
    if (!scriptContent.trim()) {
      toast.error('No script content to check');
      return;
    }
    setIsChecking(true);
    setResult(null);
    try {
      const brandInstructions = [
        `BRAND VOICE AUDIT for ${brandName}:`,
        `Tone: ${brandTone}`,
        `Avoid: ${brandVoiceAvoid.join(', ')}`,
        `Formality level: 3/5 (professional but approachable)`,
        `Reading level: intermediate`,
        '',
        'Analyze this script for brand voice compliance. For each issue found, provide:',
        '- type: forbidden_word | tone_mismatch | formality | readability | missing_element | cultural',
        '- severity: error | warning | info',
        '- title: short description',
        '- description: explanation of the issue',
        '- originalText: the problematic text (if applicable)',
        '- suggestedFix: recommended replacement (if applicable)',
        '',
        'Also provide overall scores (0-100) for toneMatch, formalityMatch, readabilityMatch.',
        'Return a summary of overall brand voice alignment.',
      ].join('\n');

      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: {
          scriptContent,
          mode: 'analyze',
          provider: 'gemini',
          customInstructions: brandInstructions,
        },
      });

      if (error) throw error;

      // Parse AI response into brand voice issues
      const aiData = data?.data || {};
      const issues: BrandVoiceIssue[] = [];

      // Extract brand-specific issues from AI recommendations
      if (aiData.recommendations) {
        aiData.recommendations.forEach((rec: any, i: number) => {
          issues.push({
            id: `brand-${i}`,
            type: mapRecTypeToVoiceType(rec.type),
            severity: rec.severity === 'warning' ? 'warning' : rec.severity === 'info' ? 'info' : 'error',
            title: rec.title || 'Brand voice issue',
            description: rec.description || '',
            originalText: rec.originalText,
            suggestedFix: rec.suggestedText,
            resolved: false,
          });
        });
      }

      // Local checks for forbidden words
      brandVoiceAvoid.forEach(word => {
        const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = scriptContent.match(regex);
        if (matches) {
          issues.push({
            id: `forbidden-${word}`,
            type: 'forbidden_word',
            severity: 'error',
            title: `Forbidden phrase: "${word}"`,
            description: `Found ${matches.length} occurrence(s) of "${word}" which conflicts with brand guidelines.`,
            resolved: false,
          });
        }
      });

      // Calculate scores
      const engagementScore = aiData.overallAssessment?.engagementScore || 7;
      const toneMatch = Math.min(100, Math.max(0, engagementScore * 10 + (issues.filter(i => i.type === 'tone_mismatch').length === 0 ? 10 : -10)));
      const formalityMatch = issues.filter(i => i.type === 'formality').length === 0 ? 90 : 60;
      const readabilityMatch = aiData.overallAssessment?.voiceoverReadiness === 'ready' ? 95 : aiData.overallAssessment?.voiceoverReadiness === 'needs_minor_edits' ? 75 : 50;
      const overallScore = Math.round((toneMatch + formalityMatch + readabilityMatch) / 3);

      setResult({
        overallScore,
        toneMatch,
        formalityMatch,
        readabilityMatch,
        issues,
        summary: aiData.overallAssessment?.topPriority || `Found ${issues.length} brand voice ${issues.length === 1 ? 'issue' : 'issues'}.`,
      });

      toast.success(`Brand voice check complete: ${overallScore}/100`);
    } catch (err: any) {
      console.error('Brand voice check error:', err);
      toast.error(err.message || 'Brand voice check failed');
    } finally {
      setIsChecking(false);
    }
  };

  const handleResolveIssue = (issueId: string) => {
    setResult(prev => prev ? {
      ...prev,
      issues: prev.issues.map(i => i.id === issueId ? { ...i, resolved: true } : i),
    } : null);
  };

  const unresolvedCount = result?.issues.filter(i => !i.resolved).length || 0;

  return (
    <div className="mb-6 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-500" />
          Brand Voice Compliance
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCheck}
            disabled={isChecking || !scriptContent.trim()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
          >
            {isChecking ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Checking...</>
            ) : (
              <><Shield className="h-4 w-4 mr-1" />Run Check</>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Brand Guidelines Summary */}
      <div className="mb-3 p-2 rounded bg-muted/50 border border-border/50">
        <div className="flex items-center gap-4 text-xs">
          <span><strong>Brand:</strong> {brandName}</span>
          <span><strong>Tone:</strong> {brandTone}</span>
          <span><strong>Avoid:</strong> {brandVoiceAvoid.slice(0, 3).join(', ')}</span>
        </div>
      </div>

      {result && (
        <ScrollArea className="max-h-[400px] pr-2">
          {/* Score Dashboard */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <ScoreCard label="Overall" score={result.overallScore} />
            <ScoreCard label="Tone" score={result.toneMatch} />
            <ScoreCard label="Formality" score={result.formalityMatch} />
            <ScoreCard label="Readability" score={result.readabilityMatch} />
          </div>

          {/* Summary */}
          <div className="mb-4 p-2 rounded bg-background border">
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </div>

          {/* Issues List */}
          {result.issues.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Issues ({unresolvedCount} unresolved / {result.issues.length} total)
                </Label>
              </div>
              {result.issues.map(issue => {
                const colors = SEVERITY_COLORS[issue.severity];
                return (
                  <div
                    key={issue.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      colors.border, colors.bg,
                      issue.resolved && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={colors.text}>{colors.icon}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{issue.type.replace('_', ' ')}</Badge>
                      <span className="text-sm font-medium">{issue.title}</span>
                      {issue.resolved && (
                        <Badge variant="default" className="text-[10px] ml-auto">Resolved</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                    {issue.originalText && !issue.resolved && (
                      <div className="mt-2 p-1.5 rounded bg-red-500/5 border border-red-500/20">
                        <span className="text-[10px] text-red-600">Found: </span>
                        <span className="text-xs text-red-600/80 line-through">{issue.originalText}</span>
                      </div>
                    )}
                    {issue.suggestedFix && !issue.resolved && (
                      <div className="mt-1 p-1.5 rounded bg-green-500/10 border border-green-500/20">
                        <span className="text-[10px] text-green-600">Suggested: </span>
                        <span className="text-xs text-green-700">{issue.suggestedFix}</span>
                      </div>
                    )}
                    {!issue.resolved && (
                      <div className="flex gap-1 mt-2">
                        {issue.suggestedFix && issue.originalText && (
                          <Button
                            variant="outline" size="sm" className="h-6 px-2 text-xs border-green-500/30 hover:bg-green-500/10"
                            onClick={() => { onApplyFix(issue.originalText!, issue.suggestedFix!); handleResolveIssue(issue.id); }}
                          >
                            <Sparkles className="h-3 w-3 mr-1 text-green-600" />Apply Fix
                          </Button>
                        )}
                        <Button
                          variant="ghost" size="sm" className="h-6 px-2 text-xs"
                          onClick={() => handleResolveIssue(issue.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Check className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <p>Script fully complies with brand voice guidelines!</p>
            </div>
          )}
        </ScrollArea>
      )}

      {!result && !isChecking && (
        <div className="text-center py-8 text-muted-foreground">
          <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click "Run Check" to validate against brand guidelines</p>
          <p className="text-xs mt-1">Checks tone, formality, forbidden words, readability</p>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="text-center p-2 rounded-lg bg-background border">
      <p className={cn(
        "text-xl font-bold",
        score >= 80 && "text-emerald-500",
        score >= 60 && score < 80 && "text-amber-500",
        score < 60 && "text-red-500"
      )}>
        {score}
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <Progress
        value={score}
        className={cn(
          "h-1 mt-1",
          score >= 80 && "[&>div]:bg-emerald-500",
          score >= 60 && score < 80 && "[&>div]:bg-amber-500",
          score < 60 && "[&>div]:bg-red-500"
        )}
      />
    </div>
  );
}

function mapRecTypeToVoiceType(type: string): BrandVoiceIssue['type'] {
  switch (type) {
    case 'readability': return 'readability';
    case 'engagement': return 'missing_element';
    case 'pacing': return 'formality';
    case 'length': return 'readability';
    default: return 'tone_mismatch';
  }
}
