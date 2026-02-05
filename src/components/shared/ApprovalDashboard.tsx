/**
 * ApprovalDashboard - Unified Approval Queue for Genie Cast Workflow
 * 
 * Features:
 * - Visual progress through 8 stages (Template → Messaging → Script → Mapping → TTS → Sync → Approval → Publish)
 * - Pending/Approved item cards with quick actions
 * - Navigation between CREATE and PRODUCE tabs
 * - Cross-product compatible
 */

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ArrowRight,
  Play,
  FileText,
  MessageSquare,
  Film,
  Mic,
  Waves,
  ThumbsUp,
  Send,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuthoringStage, ApprovalStatus } from '@/hooks/useUnifiedAuthoring';
import type { ApprovalItem, GenieCastSessionHook } from '@/hooks/useGenieCastSession';

// ============================================
// TYPES
// ============================================

type TabType = 'create' | 'produce' | 'manage' | 'publish';

interface ApprovalDashboardProps {
  session: GenieCastSessionHook['session'];
  onNavigateToStage: (stage: AuthoringStage, tab: TabType, subTab: string) => void;
  onResetSession?: () => void;
  compact?: boolean;
}

// ============================================
// STAGE CONFIGURATION
// ============================================

const STAGE_CONFIG: Record<AuthoringStage, {
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  tab: TabType;
  subTab: string;
  description: string;
}> = {
  template_selection: {
    label: 'Template Selection',
    shortLabel: 'Template',
    icon: Film,
    tab: 'create',
    subTab: 'assets',
    description: 'Select a video template from the library',
  },
  messaging_generation: {
    label: 'Messaging Generation',
    shortLabel: 'Messaging',
    icon: MessageSquare,
    tab: 'create',
    subTab: 'messaging',
    description: 'Generate and approve marketing copy',
  },
  script_composition: {
    label: 'Script Composition',
    shortLabel: 'Script',
    icon: FileText,
    tab: 'produce',
    subTab: 'studio',
    description: 'Compose scripts from messaging',
  },
  template_mapping: {
    label: 'Template Mapping',
    shortLabel: 'Mapping',
    icon: Sparkles,
    tab: 'produce',
    subTab: 'studio',
    description: 'Map scripts to template scenes',
  },
  tts_generation: {
    label: 'TTS Generation',
    shortLabel: 'TTS',
    icon: Mic,
    tab: 'produce',
    subTab: 'studio',
    description: 'Generate voiceover audio',
  },
  av_sync: {
    label: 'A/V Synchronization',
    shortLabel: 'Sync',
    icon: Waves,
    tab: 'produce',
    subTab: 'studio',
    description: 'Verify audio-visual alignment',
  },
  approval: {
    label: 'Final Approval',
    shortLabel: 'Approve',
    icon: ThumbsUp,
    tab: 'produce',
    subTab: 'review',
    description: 'Review and approve final video',
  },
  publishing: {
    label: 'Publishing',
    shortLabel: 'Publish',
    icon: Send,
    tab: 'publish',
    subTab: 'scheduler',
    description: 'Schedule and distribute',
  },
};

const STAGE_ORDER: AuthoringStage[] = [
  'template_selection',
  'messaging_generation',
  'script_composition',
  'template_mapping',
  'tts_generation',
  'av_sync',
  'approval',
  'publishing',
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const getStatusIcon = (status: ApprovalStatus, isComplete: boolean) => {
  if (isComplete || status === 'approved') {
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
  if (status === 'pending') {
    return <Clock className="h-4 w-4 text-amber-500" />;
  }
  if (status === 'rejected' || status === 'revision_requested') {
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground" />;
};

const getStatusColor = (status: ApprovalStatus): string => {
  switch (status) {
    case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/30';
    case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/30';
    case 'revision_requested': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

// ============================================
// STAGE STEP COMPONENT
// ============================================

interface StageStepProps {
  stage: AuthoringStage;
  index: number;
  isComplete: boolean;
  isCurrent: boolean;
  canProceed: boolean;
  approvalItem?: ApprovalItem;
  onNavigate: () => void;
  compact?: boolean;
}

const StageStep: React.FC<StageStepProps> = ({
  stage,
  index,
  isComplete,
  isCurrent,
  canProceed,
  approvalItem,
  onNavigate,
  compact,
}) => {
  const config = STAGE_CONFIG[stage];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onNavigate}
            disabled={!canProceed}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg transition-all",
              "hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed",
              isCurrent && "ring-2 ring-primary ring-offset-2 bg-primary/5",
              isComplete && "bg-green-500/5"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0",
              isComplete ? "border-green-500 bg-green-500/10" :
              isCurrent ? "border-primary bg-primary/10" :
              "border-muted-foreground/30"
            )}>
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Icon className={cn(
                  "h-4 w-4",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )} />
              )}
            </div>
            
            {!compact && (
              <div className="text-left min-w-0">
                <p className={cn(
                  "text-xs font-medium truncate",
                  isComplete ? "text-green-600" :
                  isCurrent ? "text-primary" :
                  "text-muted-foreground"
                )}>
                  {config.shortLabel}
                </p>
                {approvalItem && (
                  <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                    {approvalItem.title}
                  </p>
                )}
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
          {approvalItem && (
            <Badge variant="outline" className={cn("mt-1 text-[10px]", getStatusColor(approvalItem.status))}>
              {approvalItem.status}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// APPROVAL ITEM CARD COMPONENT
// ============================================

interface ApprovalItemCardProps {
  item: ApprovalItem;
  onNavigate: () => void;
}

const ApprovalItemCard: React.FC<ApprovalItemCardProps> = ({ item, onNavigate }) => {
  const config = STAGE_CONFIG[item.stage];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
        "hover:bg-muted/50",
        item.status === 'approved' && "border-green-500/30 bg-green-500/5",
        item.status === 'pending' && "border-amber-500/30 bg-amber-500/5",
        item.status === 'rejected' && "border-destructive/30 bg-destructive/5"
      )}
      onClick={onNavigate}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
        item.status === 'approved' ? "bg-green-500/10" :
        item.status === 'pending' ? "bg-amber-500/10" :
        "bg-muted"
      )}>
        <Icon className={cn(
          "h-5 w-5",
          item.status === 'approved' ? "text-green-500" :
          item.status === 'pending' ? "text-amber-500" :
          "text-muted-foreground"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className={cn("text-[10px]", getStatusColor(item.status))}>
          {item.status}
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({
  session,
  onNavigateToStage,
  onResetSession,
  compact = false,
}) => {
  const handleNavigate = useCallback((stage: AuthoringStage) => {
    const config = STAGE_CONFIG[stage];
    onNavigateToStage(stage, config.tab, config.subTab);
  }, [onNavigateToStage]);

  const progress = {
    completed: session.completedStages.length,
    total: STAGE_ORDER.length,
    percentage: Math.round((session.completedStages.length / STAGE_ORDER.length) * 100),
  };

  const currentStageIndex = STAGE_ORDER.indexOf(session.currentStage);
  const nextStage = STAGE_ORDER.find(stage => !session.completedStages.includes(stage));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              Approval Dashboard
            </CardTitle>
            <CardDescription>
              {progress.completed} of {progress.total} stages complete
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {progress.percentage}%
            </Badge>
            {onResetSession && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onResetSession}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress.percentage} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stage Pipeline Visualization */}
        <div className="relative">
          <ScrollArea className="w-full">
            <div className="flex items-center gap-1 pb-2">
              {STAGE_ORDER.map((stage, index) => {
                const isComplete = session.completedStages.includes(stage);
                const isCurrent = session.currentStage === stage;
                const canProceed = index === 0 || session.completedStages.includes(STAGE_ORDER[index - 1]);
                const approvalItem = session.approvalItems.find(item => item.stage === stage);

                return (
                  <React.Fragment key={stage}>
                    <StageStep
                      stage={stage}
                      index={index}
                      isComplete={isComplete}
                      isCurrent={isCurrent}
                      canProceed={canProceed}
                      approvalItem={approvalItem}
                      onNavigate={() => handleNavigate(stage)}
                      compact={compact}
                    />
                    {index < STAGE_ORDER.length - 1 && (
                      <ArrowRight className={cn(
                        "h-4 w-4 shrink-0",
                        isComplete ? "text-green-500" : "text-muted-foreground/30"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Next Action Card */}
        {nextStage && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    {React.createElement(STAGE_CONFIG[nextStage].icon, {
                      className: "h-5 w-5 text-primary"
                    })}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Next: {STAGE_CONFIG[nextStage].label}</p>
                    <p className="text-xs text-muted-foreground">{STAGE_CONFIG[nextStage].description}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleNavigate(nextStage)}>
                  <Play className="h-3 w-3 mr-1" />
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Items */}
        {session.approvalItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Completed Items</p>
            <div className="space-y-2">
              <AnimatePresence>
                {session.approvalItems
                  .filter(item => item.status === 'approved')
                  .slice(-4) // Show last 4
                  .map(item => (
                    <ApprovalItemCard
                      key={item.id}
                      item={item}
                      onNavigate={() => handleNavigate(item.stage)}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {session.approvalItems.length === 0 && (
          <div className="text-center py-8">
            <Film className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm font-medium">No items yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Start by selecting a template from the Assets tab
            </p>
            <Button size="sm" onClick={() => handleNavigate('template_selection')}>
              Select Template
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalDashboard;
