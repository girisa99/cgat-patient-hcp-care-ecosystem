/**
 * Analysis Results Panel - Displays script analysis results
 * Including overall assessment, engagement analysis, pause opportunities,
 * section breaks, and individual recommendations
 * Extracted from ScriptEditorTab.tsx
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Search,
  Check,
  X,
  ChevronDown,
  Clock,
  AlertTriangle,
  Loader2,
  FileText,
  FileCheck,
  Sparkles,
  Wand2,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisResult, AnalysisRecommendation } from './types';

interface AnalysisResultsPanelProps {
  analysisResult: AnalysisResult;
  isAnalyzing: boolean;
  onReAnalyze: () => void;
  onClose: () => void;
  onApplyFix: (originalText: string, suggestedText: string) => void;
  onUpdateRecommendation: (recId: string, accepted: boolean) => void;
  onNoteAll: () => void;
}

export function AnalysisResultsPanel({
  analysisResult,
  isAnalyzing,
  onReAnalyze,
  onClose,
  onApplyFix,
  onUpdateRecommendation,
  onNoteAll,
}: AnalysisResultsPanelProps) {
  return (
    <div className="mb-6 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          Script Analysis Results
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReAnalyze}
            disabled={isAnalyzing}
            className="gap-1"
          >
            {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Re-Analyze
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[400px] pr-2">

      {/* Overall Assessment */}
      {analysisResult.overallAssessment && (
        <OverallAssessmentSection assessment={analysisResult.overallAssessment} />
      )}

      {/* Engagement Analysis */}
      {analysisResult.engagementAnalysis && (
        <EngagementAnalysisSection analysis={analysisResult.engagementAnalysis} />
      )}

      {/* Pause Opportunities */}
      {analysisResult.pauseOpportunities && analysisResult.pauseOpportunities.length > 0 && (
        <PauseOpportunitiesSection pauses={analysisResult.pauseOpportunities} />
      )}

      {/* Section Breaks */}
      {analysisResult.sectionBreaks && analysisResult.sectionBreaks.length > 0 && (
        <SectionBreaksSection breaks={analysisResult.sectionBreaks} />
      )}

      {/* Recommendations */}
      {analysisResult.recommendations.length > 0 ? (
        <RecommendationsSection
          recommendations={analysisResult.recommendations}
          onApplyFix={onApplyFix}
          onUpdateRecommendation={onUpdateRecommendation}
          onNoteAll={onNoteAll}
        />
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p>Script looks great! No major issues found.</p>
        </div>
      )}
      </ScrollArea>
    </div>
  );
}

/* Sub-sections */

function OverallAssessmentSection({ assessment }: { assessment: NonNullable<AnalysisResult['overallAssessment']> }) {
  return (
    <div className="mb-4 p-3 rounded-lg bg-background border">
      <div className="flex items-center gap-2 mb-3">
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-2",
            assessment.voiceoverReadiness === 'ready' && "border-green-500/50 text-green-600 bg-green-500/10",
            assessment.voiceoverReadiness === 'needs_minor_edits' && "border-yellow-500/50 text-yellow-600 bg-yellow-500/10",
            assessment.voiceoverReadiness === 'needs_significant_work' && "border-orange-500/50 text-orange-600 bg-orange-500/10"
          )}
        >
          {assessment.voiceoverReadiness === 'ready' && '✓ Ready for Recording'}
          {assessment.voiceoverReadiness === 'needs_minor_edits' && '⚠ Needs Minor Edits'}
          {assessment.voiceoverReadiness === 'needs_significant_work' && '⚡ Needs Significant Work'}
        </Badge>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {assessment.strengths?.length > 0 && (
          <div>
            <Label className="text-xs text-green-600 flex items-center gap-1 mb-1.5">
              <Check className="h-3 w-3" /> Strengths
            </Label>
            <ul className="space-y-1">
              {assessment.strengths.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-green-500 shrink-0">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {assessment.weaknesses?.length > 0 && (
          <div>
            <Label className="text-xs text-orange-600 flex items-center gap-1 mb-1.5">
              <AlertTriangle className="h-3 w-3" /> Areas to Improve
            </Label>
            <ul className="space-y-1">
              {assessment.weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-orange-500 shrink-0">•</span>{w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {(assessment.engagementScore || assessment.topPriority) && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-4">
            {assessment.engagementScore && (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Engagement:</span>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  assessment.engagementScore >= 7 && "bg-green-500/10 text-green-600 border-green-500/30",
                  assessment.engagementScore >= 4 && assessment.engagementScore < 7 && "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
                  assessment.engagementScore < 4 && "bg-red-500/10 text-red-600 border-red-500/30"
                )}>
                  {assessment.engagementScore}/10
                </Badge>
              </div>
            )}
            {assessment.topPriority && (
              <div className="flex-1">
                <span className="text-xs text-muted-foreground">Top Priority: </span>
                <span className="text-xs font-medium text-foreground">{assessment.topPriority}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EngagementAnalysisSection({ analysis }: { analysis: NonNullable<AnalysisResult['engagementAnalysis']> }) {
  return (
    <div className="mb-4">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary w-full justify-between p-2 rounded-lg hover:bg-muted/50">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Engagement Analysis
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="grid md:grid-cols-2 gap-3 pl-2">
            {analysis.openingHook && (
              <div className="p-2 rounded border border-purple-500/20 bg-purple-500/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Opening Hook</span>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    analysis.openingHook.quality === 'strong' && "bg-green-500/10 text-green-600",
                    analysis.openingHook.quality === 'moderate' && "bg-yellow-500/10 text-yellow-600",
                    analysis.openingHook.quality === 'weak' && "bg-red-500/10 text-red-600"
                  )}>
                    {analysis.openingHook.quality}
                  </Badge>
                </div>
                {analysis.openingHook.suggestion && (
                  <p className="text-[10px] text-muted-foreground">{analysis.openingHook.suggestion}</p>
                )}
              </div>
            )}

            {analysis.audienceConnection && (
              <div className="p-2 rounded border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Audience Connection</span>
                  <Badge variant="outline" className="text-[10px]">
                    {analysis.audienceConnection.score}/10
                  </Badge>
                </div>
                <div className="flex gap-2 text-[10px] text-muted-foreground">
                  {analysis.audienceConnection.uses_you && <span className="text-green-600">✓ Uses "you"</span>}
                  {analysis.audienceConnection.uses_questions && <span className="text-green-600">✓ Has questions</span>}
                </div>
              </div>
            )}

            {analysis.callToAction && (
              <div className="p-2 rounded border border-green-500/20 bg-green-500/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Call to Action</span>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    analysis.callToAction.present ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                  )}>
                    {analysis.callToAction.present ? analysis.callToAction.clarity : 'Missing'}
                  </Badge>
                </div>
                {analysis.callToAction.suggestion && (
                  <p className="text-[10px] text-muted-foreground">{analysis.callToAction.suggestion}</p>
                )}
              </div>
            )}

            {analysis.emotionalResonance && (
              <div className="p-2 rounded border border-pink-500/20 bg-pink-500/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Emotional Impact</span>
                  <Badge variant="outline" className="text-[10px]">
                    {analysis.emotionalResonance.score}/10
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {analysis.emotionalResonance.powerWords} power words found
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function PauseOpportunitiesSection({ pauses }: { pauses: NonNullable<AnalysisResult['pauseOpportunities']> }) {
  return (
    <div className="mb-4">
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary w-full justify-between p-2 rounded-lg hover:bg-muted/50">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Pause Opportunities ({pauses.length})
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="space-y-2 pl-6">
            {pauses.map((pause, i) => (
              <div key={i} className="p-2 rounded border border-blue-500/20 bg-blue-500/5">
                <p className="text-xs font-medium text-foreground">
                  After: "<span className="text-blue-600">{pause.afterText}</span>"
                </p>
                <p className="text-xs text-muted-foreground mt-1">{pause.reason}</p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function SectionBreaksSection({ breaks }: { breaks: NonNullable<AnalysisResult['sectionBreaks']> }) {
  return (
    <div className="mb-4">
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary w-full justify-between p-2 rounded-lg hover:bg-muted/50">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-500" />
            Suggested Section Breaks ({breaks.length})
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="space-y-2 pl-6">
            {breaks.map((section, i) => (
              <div key={i} className="p-2 rounded border border-purple-500/20 bg-purple-500/5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-600">
                    Section {i + 1}
                  </Badge>
                  <span className="text-xs font-medium text-foreground">{section.sectionTitle}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Starts at: "<span className="text-purple-600">{section.beforeText.slice(0, 60)}...</span>"
                </p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function RecommendationsSection({
  recommendations,
  onApplyFix,
  onUpdateRecommendation,
  onNoteAll,
}: {
  recommendations: AnalysisRecommendation[];
  onApplyFix: (originalText: string, suggestedText: string) => void;
  onUpdateRecommendation: (recId: string, accepted: boolean) => void;
  onNoteAll: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Recommendations ({recommendations.length})
        </Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onNoteAll}>
            <Check className="h-3 w-3 mr-1" />
            Note All
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {recommendations.map(rec => (
          <div
            key={rec.id}
            className={cn(
              "p-3 rounded-lg border",
              rec.severity === 'warning' && "border-orange-500/30 bg-orange-500/5",
              rec.severity === 'suggestion' && "border-purple-500/30 bg-purple-500/5",
              rec.severity === 'info' && "border-border bg-background",
              rec.accepted !== null && "opacity-60"
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-xs capitalize">{rec.type}</Badge>
                {rec.location && (
                  <Badge variant="secondary" className="text-[10px]">{rec.location}</Badge>
                )}
                {rec.severity === 'warning' && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                {rec.accepted !== null && (
                  <Badge variant={rec.accepted ? 'default' : 'secondary'} className="text-[10px]">
                    {rec.accepted ? '✓ Noted' : 'Dismissed'}
                  </Badge>
                )}
              </div>
              <p className="font-medium text-sm">{rec.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>

              {rec.originalText && rec.accepted === null && (
                <div className="mt-2 p-2 rounded bg-red-500/5 border border-red-500/20">
                  <span className="text-[10px] text-red-600 font-medium">Original: </span>
                  <span className="text-xs text-red-600/80 line-through">{rec.originalText}</span>
                </div>
              )}
              {rec.suggestedText && rec.accepted === null && (
                <div className="mt-1 p-2 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-[10px] text-green-600 font-medium">Suggested: </span>
                  <span className="text-xs text-green-700">{rec.suggestedText}</span>
                </div>
              )}
            </div>

            {rec.accepted === null && (
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                {rec.suggestedText && rec.originalText && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1 border-green-500/30 hover:bg-green-500/10"
                    onClick={() => onApplyFix(rec.originalText!, rec.suggestedText!)}
                  >
                    <Wand2 className="h-3 w-3 text-green-600" />
                    Apply Fix
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1 border-blue-500/30 hover:bg-blue-500/10"
                  onClick={() => onUpdateRecommendation(rec.id, true)}
                >
                  <Edit3 className="h-3 w-3 text-blue-600" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => onUpdateRecommendation(rec.id, false)}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
