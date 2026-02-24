import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, AlertTriangle, Sparkles, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { type AuthoringStage } from '@/hooks/useUnifiedAuthoring';
import { ApprovalDashboard } from '@/components/shared/ApprovalDashboard';
import { RegionalCoverageMatrix } from '../RegionalCoverageMatrix';

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
              <Badge variant="outline" className="text-[9px] bg-green-500/10 border-green-500/30 text-green-600">✓</Badge>
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
              <Badge variant="outline" className="text-[9px] bg-green-500/10 border-green-500/30 text-green-600">✓</Badge>
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

      {/* Quality Check Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Quality Check
          </CardTitle>
          <CardDescription>
            AI-powered quality scoring and enhancement suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {castSession.session.selectedTemplate && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Selected Template</p>
              <p className="text-xs text-muted-foreground">
                {castSession.session.selectedTemplate.name} • {castSession.session.selectedTemplate.sceneCount} scenes
              </p>
            </div>
          )}
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
