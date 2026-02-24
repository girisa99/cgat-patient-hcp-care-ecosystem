import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, AlertTriangle, Sparkles, ArrowLeft, TrendingUp, Shield, Loader2, RefreshCw, Zap, Target, Palette, Type, Volume2, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { type AuthoringStage } from '@/hooks/useUnifiedAuthoring';
import { ApprovalDashboard } from '@/components/shared/ApprovalDashboard';
import { RegionalCoverageMatrix } from '../RegionalCoverageMatrix';
import { useViralScorePredictor, type ViralScorePrediction } from '@/hooks/useViralScorePredictor';
import { useBrandGuidelinesCheck, type BrandCheckReport, type BrandViolation } from '@/hooks/useBrandGuidelinesCheck';

interface ProduceReviewStepProps {
  castSession: any;
  authoring: any;
  setSubTab: (mainTab: string, subTab: string) => void;
  setActiveMainTab: (tab: string) => void;
  handleNavigateToStage: (stage: AuthoringStage, tab: string, subTab: string) => void;
}

export const ProduceReviewStep: React.FC<ProduceReviewStepProps> = ({
  castSession,
  authoring,
  setSubTab,
  setActiveMainTab,
  handleNavigateToStage,
}) => {
  // ── Quality pipeline hooks ──
  const viralScore = useViralScorePredictor();
  const brandCheck = useBrandGuidelinesCheck();
  const [qualityTab, setQualityTab] = useState<'viral' | 'brand'>('viral');
  const [selectedPlatform, setSelectedPlatform] = useState<'youtube' | 'tiktok' | 'instagram' | 'linkedin'>('youtube');

  // Build content input from session for viral score
  const contentInput = {
    title: castSession.session.selectedTemplate?.name || castSession.session.approvedMessaging?.hook || 'Untitled',
    description: castSession.session.approvedMessaging?.mediumScript?.substring(0, 300) || '',
    category: castSession.session.selectedTemplate?.styleIntent || 'marketing',
    duration: castSession.session.templateMapping?.totalDuration,
  };

  // Run viral score prediction
  const handleRunViralScore = async () => {
    try {
      await viralScore.predictViralScore(contentInput, selectedPlatform);
    } catch {
      // error handled by hook
    }
  };

  // Run brand guidelines check
  const handleRunBrandCheck = async () => {
    const scriptText = castSession.session.templateMapping?.scenes
      ?.map((s: any) => s.editedText || s.scriptText || '')
      .join('\n\n') || castSession.session.approvedMessaging?.mediumScript || '';
    try {
      await brandCheck.runBrandCheck({
        contentText: scriptText,
        contentType: 'text',
        categories: ['tone', 'colors', 'typography', 'imagery'],
      });
    } catch {
      // error handled by hook
    }
  };

  // Compliance category icon mapping
  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'colors': return <Palette className="w-3.5 h-3.5" />;
      case 'typography': return <Type className="w-3.5 h-3.5" />;
      case 'tone': return <Volume2 className="w-3.5 h-3.5" />;
      case 'imagery': return <Image className="w-3.5 h-3.5" />;
      default: return <Shield className="w-3.5 h-3.5" />;
    }
  };

  const complianceColor = (level: string) => {
    switch (level) {
      case 'compliant': return 'text-green-600 bg-green-500/10 border-green-500/30';
      case 'warning': return 'text-amber-600 bg-amber-500/10 border-amber-500/30';
      case 'violation': return 'text-red-600 bg-red-500/10 border-red-500/30';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Step 3 of 3: Review & Approve */}
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setSubTab('produce', 'edit')}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Edit
        </Button>
      </div>

      {/* Approval Dashboard */}
      <ApprovalDashboard
        session={castSession.session}
        onNavigateToStage={handleNavigateToStage}
        onResetSession={castSession.resetSession}
      />

      {/* Session Handoff Summary — full state from CREATE */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Production State Handoff
          </CardTitle>
          <CardDescription className="text-xs">
            Complete pipeline state from CREATE → PRODUCE
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-background rounded-lg border text-center">
              <div className="text-lg font-bold text-primary">
                {castSession.session.completedStages.length}
              </div>
              <div className="text-[10px] text-muted-foreground">Stages Complete</div>
            </div>
            <div className="p-3 bg-background rounded-lg border text-center">
              <div className="text-lg font-bold text-primary">
                {castSession.session.approvalItems.filter((i: any) => i.status === 'approved').length}
              </div>
              <div className="text-[10px] text-muted-foreground">Items Approved</div>
            </div>
            <div className="p-3 bg-background rounded-lg border text-center">
              <div className="text-lg font-bold text-primary">
                {castSession.session.selectedDialects.length}
              </div>
              <div className="text-[10px] text-muted-foreground">Languages</div>
            </div>
          </div>

          {castSession.session.selectedTemplate && (
            <div className="p-2 bg-muted/50 rounded-md flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Template: {castSession.session.selectedTemplate.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {castSession.session.selectedTemplate.sceneCount} scenes • Style: {castSession.session.selectedTemplate.styleIntent}
                </p>
              </div>
              <Badge variant="outline" className="text-[9px]">Selected</Badge>
            </div>
          )}

          {castSession.session.approvedMessaging && (
            <div className="p-2 bg-muted/50 rounded-md flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Messaging: Approved</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[250px]">
                  Hook: "{castSession.session.approvedMessaging.hook?.substring(0, 60)}..."
                </p>
              </div>
              <Badge variant="outline" className="text-[9px] bg-green-500/10 border-green-500/30 text-green-600">&#10003;</Badge>
            </div>
          )}

          {castSession.session.templateMapping && (
            <div className="p-2 bg-muted/50 rounded-md flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Script Mapping</p>
                <p className="text-[10px] text-muted-foreground">
                  {castSession.session.templateMapping.scenes.length} scenes • {Math.round(castSession.session.templateMapping.totalDuration / 60)}min
                </p>
              </div>
              <Badge variant="outline" className="text-[9px] bg-green-500/10 border-green-500/30 text-green-600">&#10003;</Badge>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-muted-foreground">Regional:</span>
            <div className="flex gap-1">
              {castSession.session.selectedDialects.map((d: string) => (
                <Badge key={d} variant="outline" className="text-[9px]">{d}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 7: Regional Coverage Matrix */}
      <RegionalCoverageMatrix
        targetRegions={castSession.session.targetRegions as string[]}
        selectedDialects={castSession.session.selectedDialects}
        projectId={castSession.session.projectId || undefined}
        compact={false}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Quality Intelligence — Viral Score + Brand Guidelines  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Quality Intelligence
          </CardTitle>
          <CardDescription>
            AI-powered viral potential analysis and brand compliance checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={qualityTab} onValueChange={(v) => setQualityTab(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="viral" className="flex-1 gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Viral Score
              </TabsTrigger>
              <TabsTrigger value="brand" className="flex-1 gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Brand Compliance
              </TabsTrigger>
            </TabsList>

            {/* ── VIRAL SCORE TAB ── */}
            <TabsContent value="viral" className="mt-4 space-y-4">
              {/* Platform selector + Run button */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {(['youtube', 'tiktok', 'instagram', 'linkedin'] as const).map((p) => (
                    <Button
                      key={p}
                      variant={selectedPlatform === p ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => setSelectedPlatform(p)}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="ml-auto gap-1.5"
                  onClick={handleRunViralScore}
                  disabled={viralScore.isLoading}
                >
                  {viralScore.isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  Predict Viral Score
                </Button>
              </div>

              {/* Results */}
              {viralScore.lastPrediction && (
                <div className="space-y-3">
                  {/* Overall score */}
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className={cn(
                        "text-3xl font-bold",
                        viralScore.lastPrediction.overallScore >= 70 ? 'text-green-600' :
                        viralScore.lastPrediction.overallScore >= 40 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {viralScore.lastPrediction.overallScore}
                      </div>
                      <div className="text-[10px] text-muted-foreground">/ 100</div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {Object.entries(viralScore.lastPrediction.breakdown).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-20 capitalize">{key.replace('Score', '').replace(/([A-Z])/g, ' $1')}</span>
                          <Progress value={val as number} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-medium w-6 text-right">{val as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Predictions */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-xs font-medium">
                        {viralScore.lastPrediction.prediction.estimatedViews.mid.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Est. Views</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-xs font-medium">
                        {Math.round(viralScore.lastPrediction.prediction.estimatedEngagement * 100)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">Engagement</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-xs font-medium">
                        {Math.round(viralScore.lastPrediction.prediction.viralProbability * 100)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">Viral Prob.</div>
                    </div>
                  </div>

                  {/* Factor analysis */}
                  {viralScore.lastPrediction.factors.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium">Key Factors</p>
                      {viralScore.lastPrediction.factors.slice(0, 5).map((f, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded border text-xs">
                          <Badge variant="outline" className={cn(
                            "text-[9px] shrink-0",
                            f.impact === 'positive' ? 'text-green-600 border-green-300' :
                            f.impact === 'negative' ? 'text-red-600 border-red-300' : ''
                          )}>
                            {f.impact === 'positive' ? '+' : f.impact === 'negative' ? '-' : '~'}{f.score}
                          </Badge>
                          <div>
                            <span className="font-medium">{f.factor}</span>
                            {f.recommendation && (
                              <p className="text-muted-foreground mt-0.5">{f.recommendation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!viralScore.lastPrediction && !viralScore.isLoading && (
                <div className="text-center py-6 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Click "Predict Viral Score" to analyze your content</p>
                  <p className="text-xs mt-1">Uses AI to estimate viral potential on {selectedPlatform}</p>
                </div>
              )}

              {viralScore.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-600">
                  {viralScore.error}
                </div>
              )}
            </TabsContent>

            {/* ── BRAND COMPLIANCE TAB ── */}
            <TabsContent value="brand" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Checks tone, colors, typography, and imagery against brand guidelines
                </p>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={handleRunBrandCheck}
                  disabled={brandCheck.isChecking}
                >
                  {brandCheck.isChecking ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Shield className="w-3.5 h-3.5" />
                  )}
                  Run Brand Check
                </Button>
              </div>

              {/* Report */}
              {brandCheck.report && (
                <div className="space-y-3">
                  {/* Overall compliance score */}
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className={cn(
                        "text-3xl font-bold",
                        brandCheck.report.complianceLevel === 'compliant' ? 'text-green-600' :
                        brandCheck.report.complianceLevel === 'warning' ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {brandCheck.report.overallScore}%
                      </div>
                      <Badge variant="outline" className={cn("text-[9px]", complianceColor(brandCheck.report.complianceLevel))}>
                        {brandCheck.report.complianceLevel === 'compliant' ? 'Compliant' :
                         brandCheck.report.complianceLevel === 'warning' ? 'Needs Review' : 'Non-Compliant'}
                      </Badge>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      {Object.entries(brandCheck.report.categoryScores).map(([cat, score]) => (
                        <div key={cat} className="flex items-center gap-1.5">
                          {categoryIcon(cat)}
                          <span className="text-[10px] capitalize w-14">{cat}</span>
                          <Progress value={score as number} className="h-1.5 flex-1" />
                          <Badge variant="outline" className={cn(
                            "text-[9px] px-1",
                            complianceColor(brandCheck.report!.summary[cat as keyof typeof brandCheck.report.summary])
                          )}>
                            {score as number}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Violations list */}
                  {brandCheck.violations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        {brandCheck.violations.length} Issue{brandCheck.violations.length !== 1 ? 's' : ''} Found
                      </p>
                      {brandCheck.violations.map((v: BrandViolation) => (
                        <div key={v.id} className="p-2.5 rounded border space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {categoryIcon(v.category)}
                              <span className="text-xs font-medium">{v.title}</span>
                            </div>
                            <Badge variant="outline" className={cn("text-[9px]", complianceColor(v.level))}>
                              {v.level}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{v.description}</p>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-muted-foreground">Current: <code className="bg-muted px-1 rounded">{v.currentValue}</code></span>
                            <span className="text-muted-foreground">Expected: <code className="bg-muted px-1 rounded">{v.expectedValue}</code></span>
                          </div>
                          {v.autoFixAvailable && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] gap-1"
                              onClick={() => brandCheck.autoFixViolation(v.id)}
                            >
                              <RefreshCw className="w-3 h-3" /> Auto-Fix
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {brandCheck.report.recommendations.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Recommendations</p>
                      {brandCheck.report.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <Target className="w-3 h-3 mt-0.5 shrink-0" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Approve with warnings */}
                  {brandCheck.report.complianceLevel === 'warning' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={() => brandCheck.approveWithWarnings({
                        contentType: 'text',
                        contentText: castSession.session.approvedMessaging?.mediumScript || '',
                      })}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve with Warnings
                    </Button>
                  )}
                </div>
              )}

              {!brandCheck.report && !brandCheck.isChecking && (
                <div className="text-center py-6 text-muted-foreground">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Click "Run Brand Check" to verify compliance</p>
                  <p className="text-xs mt-1">Checks tone, colors, typography, and imagery</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Phase 6: Approve for Publish Gate */}
      <Card className={cn(
        "border-2 transition-colors",
        castSession.session.completedStages.includes('approval' as AuthoringStage)
          ? "border-green-500/50 bg-green-500/5"
          : "border-amber-500/50 bg-amber-500/5"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {castSession.session.completedStages.includes('approval' as AuthoringStage) ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            )}
            Publish Approval Gate
          </CardTitle>
          <CardDescription>
            {castSession.session.completedStages.includes('approval' as AuthoringStage)
              ? "Content approved for publishing. PUBLISH tab is now unlocked."
              : "Review all items above, then approve to unlock the PUBLISH tab."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!castSession.session.completedStages.includes('approval' as AuthoringStage) ? (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Before approving, verify:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>All approval items above are reviewed</li>
                  <li>Template mapping and scripts are finalized</li>
                  <li>Regional dialects are configured ({castSession.session.selectedDialects.length} selected)</li>
                  <li>TTS and AV sync are verified (if applicable)</li>
                </ul>
              </div>
              <Button
                onClick={() => {
                  castSession.updateSession({
                    currentStage: 'publishing' as AuthoringStage,
                    completedStages: [
                      ...castSession.session.completedStages.filter((s: string) => s !== 'approval'),
                      'approval' as AuthoringStage,
                    ],
                  });
                  toast.success('Content approved for publishing! PUBLISH tab is now unlocked.');
                  setActiveMainTab('publish');
                  setSubTab('publish', 'scheduler');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve for Publish
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Check className="w-4 h-4" />
                Approved — PUBLISH tab unlocked
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  castSession.updateSession({
                    currentStage: 'approval' as AuthoringStage,
                    completedStages: castSession.session.completedStages.filter((s: string) => s !== 'approval'),
                  });
                  toast.info('Approval revoked. Review and re-approve when ready.');
                }}
              >
                Revoke Approval
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
