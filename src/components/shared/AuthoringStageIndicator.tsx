 /**
  * AuthoringStageIndicator - Visual Progress Indicator for Authoring Workflow
  * 
  * Shows current stage in the authoring pipeline with clickable navigation
  * Cross-product compatible (Spark, Mind, Deck, Vibe, Cast)
  */
 
 import React from 'react';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
 import { 
   Check, 
   Circle, 
   ChevronRight,
   FileText,
   MessageSquare,
   Layers,
   Mic,
   Film,
   CheckCircle2,
   Send,
   LayoutTemplate,
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import type { AuthoringStage } from '@/hooks/useUnifiedAuthoring';
 
 interface StageConfig {
   id: AuthoringStage;
   label: string;
   shortLabel: string;
   icon: React.ElementType;
   description: string;
 }
 
 const STAGE_CONFIGS: StageConfig[] = [
   { 
     id: 'template_selection', 
     label: 'Template Selection', 
     shortLabel: 'Template',
     icon: LayoutTemplate,
     description: 'Choose a video template/blueprint'
   },
   { 
     id: 'messaging_generation', 
     label: 'Messaging', 
     shortLabel: 'Messaging',
     icon: MessageSquare,
     description: 'Generate hooks, CTAs, and value propositions'
   },
   { 
     id: 'script_composition', 
     label: 'Script Composition', 
     shortLabel: 'Script',
     icon: FileText,
     description: 'Compose and refine scripts for each scene'
   },
   { 
     id: 'template_mapping', 
     label: 'Scene Mapping', 
     shortLabel: 'Mapping',
     icon: Layers,
     description: 'Map scripts to template scenes with timing'
   },
   { 
     id: 'tts_generation', 
     label: 'TTS Generation', 
     shortLabel: 'TTS',
     icon: Mic,
     description: 'Generate voiceovers for each scene'
   },
   { 
     id: 'av_sync', 
     label: 'A/V Sync', 
     shortLabel: 'Sync',
     icon: Film,
     description: 'Synchronize audio with visual elements'
   },
   { 
     id: 'approval', 
     label: 'Approval', 
     shortLabel: 'Approve',
     icon: CheckCircle2,
     description: 'Review and approve final output'
   },
   { 
     id: 'publishing', 
     label: 'Publishing', 
     shortLabel: 'Publish',
     icon: Send,
     description: 'Publish to platforms and schedule'
   },
 ];
 
 interface AuthoringStageIndicatorProps {
   currentStage: AuthoringStage;
   enabledStages: AuthoringStage[];
   isStageComplete: (stage: AuthoringStage) => boolean;
   onStageClick?: (stage: AuthoringStage) => void;
   progress: {
     current: number;
     total: number;
     percentage: number;
   };
   variant?: 'full' | 'compact' | 'minimal';
 }
 
 export const AuthoringStageIndicator: React.FC<AuthoringStageIndicatorProps> = ({
   currentStage,
   enabledStages,
   isStageComplete,
   onStageClick,
   progress,
   variant = 'full',
 }) => {
   const enabledConfigs = STAGE_CONFIGS.filter(s => enabledStages.includes(s.id));
 
   if (variant === 'minimal') {
     const currentConfig = STAGE_CONFIGS.find(s => s.id === currentStage);
     return (
       <div className="flex items-center gap-2">
         <Badge variant="outline" className="text-xs">
           {progress.current}/{progress.total}
         </Badge>
         <span className="text-sm font-medium">
           {currentConfig?.label || currentStage}
         </span>
         <Progress value={progress.percentage} className="w-24 h-2" />
       </div>
     );
   }
 
   if (variant === 'compact') {
     return (
       <div className="flex items-center gap-1 overflow-x-auto pb-2">
         {enabledConfigs.map((stage, index) => {
           const isCurrent = stage.id === currentStage;
           const isComplete = isStageComplete(stage.id);
           const Icon = stage.icon;
 
           return (
             <React.Fragment key={stage.id}>
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Button
                       variant={isCurrent ? "default" : isComplete ? "secondary" : "ghost"}
                       size="sm"
                       className={cn(
                         "h-8 px-2",
                         isCurrent && "ring-2 ring-primary/20"
                       )}
                       onClick={() => onStageClick?.(stage.id)}
                     >
                       {isComplete ? (
                         <Check className="h-4 w-4 text-primary" />
                       ) : (
                         <Icon className="h-4 w-4" />
                       )}
                       <span className="ml-1 text-xs hidden sm:inline">
                         {stage.shortLabel}
                       </span>
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent>
                     <p className="font-medium">{stage.label}</p>
                     <p className="text-xs text-muted-foreground">{stage.description}</p>
                   </TooltipContent>
                 </Tooltip>
               </TooltipProvider>
               
               {index < enabledConfigs.length - 1 && (
                 <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
               )}
             </React.Fragment>
           );
         })}
       </div>
     );
   }
 
   // Full variant
   return (
     <div className="space-y-3">
       <div className="flex items-center justify-between">
         <h3 className="text-sm font-medium">Authoring Progress</h3>
         <Badge variant="secondary" className="text-xs">
           Step {progress.current} of {progress.total}
         </Badge>
       </div>
       
       <Progress value={progress.percentage} className="h-2" />
 
       <div className="flex items-center justify-between">
         {enabledConfigs.map((stage, index) => {
           const isCurrent = stage.id === currentStage;
           const isComplete = isStageComplete(stage.id);
           const isPast = enabledStages.indexOf(stage.id) < enabledStages.indexOf(currentStage);
           const Icon = stage.icon;
 
           return (
             <React.Fragment key={stage.id}>
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <button
                       className={cn(
                         "flex flex-col items-center gap-1 transition-all",
                         onStageClick && "cursor-pointer hover:opacity-80",
                         !onStageClick && "cursor-default"
                       )}
                       onClick={() => onStageClick?.(stage.id)}
                     >
                       <div className={cn(
                         "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                         isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                         isComplete && !isCurrent && "bg-primary/20 text-primary",
                         isPast && !isComplete && "bg-muted text-muted-foreground",
                         !isCurrent && !isComplete && !isPast && "bg-muted/50 text-muted-foreground/50"
                       )}>
                         {isComplete ? (
                           <Check className="h-5 w-5" />
                         ) : (
                           <Icon className="h-5 w-5" />
                         )}
                       </div>
                       
                       <span className={cn(
                         "text-[10px] text-center max-w-[60px] leading-tight",
                         isCurrent && "font-medium text-foreground",
                         !isCurrent && "text-muted-foreground"
                       )}>
                         {stage.shortLabel}
                       </span>
                     </button>
                   </TooltipTrigger>
                   <TooltipContent>
                     <p className="font-medium">{stage.label}</p>
                     <p className="text-xs text-muted-foreground">{stage.description}</p>
                   </TooltipContent>
                 </Tooltip>
               </TooltipProvider>
 
               {index < enabledConfigs.length - 1 && (
                 <div className={cn(
                   "flex-1 h-0.5 mx-1",
                   isPast || isComplete ? "bg-primary/40" : "bg-muted"
                 )} />
               )}
             </React.Fragment>
           );
         })}
       </div>
     </div>
   );
 };
 
 export default AuthoringStageIndicator;