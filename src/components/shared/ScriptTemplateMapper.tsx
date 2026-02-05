 /**
  * ScriptTemplateMapper - Visual Scene-to-Script Alignment Component
  * 
  * Features:
  * - Drag-drop scene reordering
  * - Duration estimation and adjustment
  * - Script variable injection preview
  * - TTS provider display per scene
  * - Cross-product compatible (Spark, Mind, Deck, Vibe, Cast)
  */
 
 import React, { useState, useCallback } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Textarea } from '@/components/ui/textarea';
 import { Slider } from '@/components/ui/slider';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
 import { 
   GripVertical, 
   Clock, 
   FileText, 
   Check, 
   X, 
   Edit3, 
   ChevronDown,
   Mic,
   Sparkles,
   AlertCircle,
   Play,
   Volume2,
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import type { SceneScript, TemplateMapping, ApprovalStatus } from '@/hooks/useUnifiedAuthoring';
 
 interface ScriptTemplateMapperProps {
   mapping: TemplateMapping | null;
   onSceneUpdate: (sceneId: string, updates: Partial<SceneScript>) => void;
   onApproveAll: () => void;
   onGenerateTTS?: (sceneId: string) => Promise<string | null>;
   isProcessing?: boolean;
   compact?: boolean;
 }
 
 export const ScriptTemplateMapper: React.FC<ScriptTemplateMapperProps> = ({
   mapping,
   onSceneUpdate,
   onApproveAll,
   onGenerateTTS,
   isProcessing = false,
   compact = false,
 }) => {
   const [expandedScenes, setExpandedScenes] = useState<string[]>([]);
   const [editingScene, setEditingScene] = useState<string | null>(null);
   const [editedText, setEditedText] = useState<string>('');
 
   const toggleSceneExpand = (sceneId: string) => {
     setExpandedScenes(prev =>
       prev.includes(sceneId)
         ? prev.filter(id => id !== sceneId)
         : [...prev, sceneId]
     );
   };
 
   const startEditing = (scene: SceneScript) => {
     setEditingScene(scene.sceneId);
     setEditedText(scene.editedText || scene.scriptText);
   };
 
   const saveEdit = (sceneId: string) => {
     onSceneUpdate(sceneId, { 
       editedText,
       sourceType: 'custom',
     });
     setEditingScene(null);
   };
 
   const cancelEdit = () => {
     setEditingScene(null);
     setEditedText('');
   };
 
   const updateDuration = (sceneId: string, duration: number) => {
     onSceneUpdate(sceneId, { durationSeconds: duration });
   };
 
   const updateApprovalStatus = (sceneId: string, status: ApprovalStatus) => {
     onSceneUpdate(sceneId, { approvalStatus: status });
   };
 
   const getStatusColor = (status: ApprovalStatus) => {
     switch (status) {
       case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/50';
       case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
       case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
       case 'revision_requested': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
       default: return 'bg-muted text-muted-foreground';
     }
   };
 
   const estimateWordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
   const estimateDuration = (text: string) => Math.ceil(estimateWordCount(text) / 2.5); // ~150 wpm
 
   if (!mapping) {
     return (
       <Card className="border-dashed">
         <CardContent className="py-12 text-center">
           <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
           <h3 className="text-lg font-medium mb-2">No Template Selected</h3>
           <p className="text-sm text-muted-foreground">
             Select a template and generate messaging to create script mappings
           </p>
         </CardContent>
       </Card>
     );
   }
 
   const allApproved = mapping.scenes.every(s => s.approvalStatus === 'approved');
   const approvedCount = mapping.scenes.filter(s => s.approvalStatus === 'approved').length;
 
   return (
     <TooltipProvider>
       <Card>
         <CardHeader className="pb-3">
           <div className="flex items-center justify-between">
             <div>
               <CardTitle className="text-lg flex items-center gap-2">
                 <FileText className="h-5 w-5" />
                 Script Mapping: {mapping.templateName}
               </CardTitle>
               <p className="text-sm text-muted-foreground mt-1">
                 {mapping.scenes.length} scenes • {Math.floor(mapping.totalDuration / 60)}:{String(mapping.totalDuration % 60).padStart(2, '0')} total
               </p>
             </div>
             
             <div className="flex items-center gap-2">
               <Badge variant="outline" className="text-xs">
                 {approvedCount}/{mapping.scenes.length} approved
               </Badge>
               
               <Button
                 size="sm"
                 onClick={onApproveAll}
                 disabled={allApproved || isProcessing}
               >
                 {allApproved ? (
                   <>
                     <Check className="h-4 w-4 mr-1" />
                     All Approved
                   </>
                 ) : (
                   <>
                     <Sparkles className="h-4 w-4 mr-1" />
                     Approve All
                   </>
                 )}
               </Button>
             </div>
           </div>
           
           {/* Provider Pills */}
           <div className="flex flex-wrap gap-1 mt-2">
             <Tooltip>
               <TooltipTrigger>
                 <Badge variant="secondary" className="text-[10px]">
                   🎨 {mapping.resolvedProviders.image}
                 </Badge>
               </TooltipTrigger>
               <TooltipContent>Image Provider</TooltipContent>
             </Tooltip>
             <Tooltip>
               <TooltipTrigger>
                 <Badge variant="secondary" className="text-[10px]">
                   🎬 {mapping.resolvedProviders.video}
                 </Badge>
               </TooltipTrigger>
               <TooltipContent>Video Provider</TooltipContent>
             </Tooltip>
             <Tooltip>
               <TooltipTrigger>
                 <Badge variant="secondary" className="text-[10px]">
                   🎙️ {mapping.resolvedProviders.tts}
                 </Badge>
               </TooltipTrigger>
               <TooltipContent>TTS Provider</TooltipContent>
             </Tooltip>
             <Tooltip>
               <TooltipTrigger>
                 <Badge variant="secondary" className="text-[10px]">
                   🧠 {mapping.resolvedProviders.llm}
                 </Badge>
               </TooltipTrigger>
               <TooltipContent>LLM Provider</TooltipContent>
             </Tooltip>
           </div>
         </CardHeader>
 
         <CardContent>
           <ScrollArea className={compact ? "h-[300px]" : "h-[500px]"}>
             <div className="space-y-2">
               {mapping.scenes.map((scene, index) => (
                 <Collapsible
                   key={scene.sceneId}
                   open={expandedScenes.includes(scene.sceneId)}
                   onOpenChange={() => toggleSceneExpand(scene.sceneId)}
                 >
                   <div className={cn(
                     "border rounded-lg transition-colors",
                     scene.approvalStatus === 'approved' && "border-primary/30 bg-primary/5",
                     expandedScenes.includes(scene.sceneId) && "ring-1 ring-primary/20"
                   )}>
                     {/* Scene Header */}
                     <CollapsibleTrigger asChild>
                       <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50">
                         <GripVertical className="h-4 w-4 text-muted-foreground" />
                         
                         <div className="flex items-center gap-2 flex-1 min-w-0">
                           <Badge variant="outline" className="text-xs shrink-0">
                             {index + 1}
                           </Badge>
                           
                           <span className="font-medium text-sm truncate">
                             {scene.title}
                           </span>
                           
                           <Badge 
                             variant="outline" 
                             className={cn("text-[10px] ml-auto shrink-0", getStatusColor(scene.approvalStatus))}
                           >
                             {scene.approvalStatus}
                           </Badge>
                         </div>
 
                         <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                           <Clock className="h-3 w-3" />
                           <span>{scene.durationSeconds}s</span>
                           
                           <Badge variant="secondary" className="text-[9px]">
                             {scene.sourceType}
                           </Badge>
                         </div>
 
                         <ChevronDown className={cn(
                           "h-4 w-4 transition-transform",
                           expandedScenes.includes(scene.sceneId) && "rotate-180"
                         )} />
                       </div>
                     </CollapsibleTrigger>
 
                     {/* Expanded Content */}
                     <CollapsibleContent>
                       <div className="px-3 pb-3 space-y-3 border-t">
                         {/* Script Text */}
                         <div className="mt-3">
                           {editingScene === scene.sceneId ? (
                             <div className="space-y-2">
                               <Textarea
                                 value={editedText}
                                 onChange={(e) => setEditedText(e.target.value)}
                                 rows={4}
                                 className="text-sm"
                               />
                               <div className="flex items-center justify-between">
                                 <span className="text-xs text-muted-foreground">
                                   {estimateWordCount(editedText)} words • ~{estimateDuration(editedText)}s
                                 </span>
                                 <div className="flex gap-2">
                                   <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                     <X className="h-3 w-3 mr-1" />
                                     Cancel
                                   </Button>
                                   <Button size="sm" onClick={() => saveEdit(scene.sceneId)}>
                                     <Check className="h-3 w-3 mr-1" />
                                     Save
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           ) : (
                             <div className="space-y-2">
                               <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                 {scene.editedText || scene.scriptText || (
                                   <span className="italic text-muted-foreground/50">
                                     No script defined - click edit to add
                                   </span>
                                 )}
                               </p>
                               <div className="flex items-center justify-between">
                                 <span className="text-xs text-muted-foreground">
                                   {estimateWordCount(scene.editedText || scene.scriptText)} words
                                 </span>
                                 <Button 
                                   size="sm" 
                                   variant="ghost"
                                   onClick={() => startEditing(scene)}
                                 >
                                   <Edit3 className="h-3 w-3 mr-1" />
                                   Edit
                                 </Button>
                               </div>
                             </div>
                           )}
                         </div>
 
                         {/* Duration Slider */}
                         <div className="space-y-1">
                           <div className="flex items-center justify-between text-xs">
                             <span className="text-muted-foreground">Duration</span>
                             <span>{scene.durationSeconds}s ({scene.minDuration}s - {scene.maxDuration}s)</span>
                           </div>
                           <Slider
                             value={[scene.durationSeconds]}
                             min={scene.minDuration}
                             max={scene.maxDuration}
                             step={5}
                             onValueChange={([value]) => updateDuration(scene.sceneId, value)}
                           />
                         </div>
 
                         {/* TTS & Actions */}
                         <div className="flex items-center justify-between pt-2 border-t">
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-[10px]">
                               <Mic className="h-3 w-3 mr-1" />
                               {scene.ttsConfig.provider}
                             </Badge>
                             
                             {onGenerateTTS && (
                               <Button 
                                 size="sm" 
                                 variant="outline"
                                 onClick={() => onGenerateTTS(scene.sceneId)}
                                 disabled={isProcessing}
                               >
                                 <Volume2 className="h-3 w-3 mr-1" />
                                 Preview TTS
                               </Button>
                             )}
                           </div>
 
                           <div className="flex gap-1">
                             {scene.approvalStatus !== 'approved' && (
                               <Button
                                 size="sm"
                                 variant="ghost"
                                className="text-primary hover:text-primary/80"
                                 onClick={() => updateApprovalStatus(scene.sceneId, 'approved')}
                               >
                                 <Check className="h-4 w-4" />
                               </Button>
                             )}
                             {scene.approvalStatus !== 'rejected' && (
                               <Button
                                 size="sm"
                                 variant="ghost"
                                className="text-destructive hover:text-destructive/80"
                                 onClick={() => updateApprovalStatus(scene.sceneId, 'rejected')}
                               >
                                 <X className="h-4 w-4" />
                               </Button>
                             )}
                           </div>
                         </div>
                       </div>
                     </CollapsibleContent>
                   </div>
                 </Collapsible>
               ))}
             </div>
           </ScrollArea>
         </CardContent>
       </Card>
     </TooltipProvider>
   );
 };
 
 export default ScriptTemplateMapper;