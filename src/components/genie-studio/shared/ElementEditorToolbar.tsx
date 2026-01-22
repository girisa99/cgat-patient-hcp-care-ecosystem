/**
 * Element Editor Toolbar
 * 
 * Unified toolbar for editing any generated element type.
 * Provides consistent UI for regenerate, enhance, revert actions.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  RefreshCw,
  Sparkles,
  Undo2,
  Save,
  X,
  ChevronDown,
  Wand2,
  Palette,
  Edit3,
  Cpu,
  Coins,
  History,
  Copy,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ElementType, EditAction } from '@/services/unifiedEditingContextService';
import { GlobalTierLevel } from '@/services/flexibleAgentConfigService';

// ============================================
// TYPES
// ============================================

export interface ElementEditorToolbarProps {
  elementType: ElementType;
  elementId: string;
  
  // State
  isLoading?: boolean;
  isRegenerating?: boolean;
  hasChanges?: boolean;
  editMode?: 'view' | 'edit' | 'regenerate';
  
  // Credits
  estimatedCredits?: number;
  currentTier?: GlobalTierLevel;
  
  // Version info
  version?: number;
  hasHistory?: boolean;
  
  // Callbacks
  onRegenerate?: () => void;
  onEnhance?: (instructions?: string) => void;
  onRefine?: () => void;
  onUpdateStyle?: () => void;
  onChangeModel?: () => void;
  onRevert?: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onViewHistory?: () => void;
  
  // Customization
  className?: string;
  compact?: boolean;
  showCredits?: boolean;
}

// ============================================
// ELEMENT TYPE LABELS
// ============================================

const ELEMENT_TYPE_LABELS: Record<ElementType, { label: string; icon: React.ReactNode }> = {
  'slide': { label: 'Slide', icon: <Edit3 className="h-3.5 w-3.5" /> },
  'video-clip': { label: 'Video Clip', icon: <Edit3 className="h-3.5 w-3.5" /> },
  'video-scene': { label: 'Scene', icon: <Edit3 className="h-3.5 w-3.5" /> },
  '3d-object': { label: '3D Object', icon: <Edit3 className="h-3.5 w-3.5" /> },
  '3d-scene': { label: '3D Scene', icon: <Edit3 className="h-3.5 w-3.5" /> },
  'ai-avatar': { label: 'AI Avatar', icon: <Edit3 className="h-3.5 w-3.5" /> },
  'animation': { label: 'Animation', icon: <Edit3 className="h-3.5 w-3.5" /> },
  'audio-segment': { label: 'Audio', icon: <Edit3 className="h-3.5 w-3.5" /> },
  'image': { label: 'Image', icon: <Edit3 className="h-3.5 w-3.5" /> },
  'infographic': { label: 'Infographic', icon: <Edit3 className="h-3.5 w-3.5" /> },
  'chart': { label: 'Chart', icon: <Edit3 className="h-3.5 w-3.5" /> },
  'diagram': { label: 'Diagram', icon: <Edit3 className="h-3.5 w-3.5" /> },
};

// ============================================
// COMPONENT
// ============================================

export function ElementEditorToolbar({
  elementType,
  elementId,
  isLoading = false,
  isRegenerating = false,
  hasChanges = false,
  editMode = 'view',
  estimatedCredits = 0,
  currentTier = 'standard',
  version = 1,
  hasHistory = false,
  onRegenerate,
  onEnhance,
  onRefine,
  onUpdateStyle,
  onChangeModel,
  onRevert,
  onSave,
  onDiscard,
  onDuplicate,
  onDelete,
  onViewHistory,
  className,
  compact = false,
  showCredits = true,
}: ElementEditorToolbarProps) {
  const elementInfo = ELEMENT_TYPE_LABELS[elementType];
  const isDisabled = isLoading || isRegenerating;
  
  return (
    <TooltipProvider>
      <div className={cn(
        "flex items-center gap-2 p-2 bg-muted/50 rounded-lg border",
        compact && "p-1.5 gap-1.5",
        className
      )}>
        {/* Element Type Badge */}
        <Badge variant="outline" className="gap-1 text-xs">
          {elementInfo.icon}
          {elementInfo.label}
          {version > 1 && <span className="text-muted-foreground">v{version}</span>}
        </Badge>
        
        <div className="h-4 w-px bg-border" />
        
        {/* Edit Mode Actions */}
        {editMode === 'edit' && hasChanges ? (
          <>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isDisabled}
              className="gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {!compact && "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDiscard}
              disabled={isDisabled}
            >
              <X className="h-3.5 w-3.5" />
              {!compact && "Discard"}
            </Button>
          </>
        ) : (
          <>
            {/* Regenerate Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRegenerate}
                  disabled={isDisabled}
                  className="gap-1.5"
                >
                  <RefreshCw className={cn(
                    "h-3.5 w-3.5",
                    isRegenerating && "animate-spin"
                  )} />
                  {!compact && "Regenerate"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Regenerate with same settings ({estimatedCredits} credits)
              </TooltipContent>
            </Tooltip>
            
            {/* Enhance Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEnhance?.()}
                  disabled={isDisabled}
                  className="gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {!compact && "Enhance"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                AI enhancement pass ({Math.ceil(estimatedCredits * 0.5)} credits)
              </TooltipContent>
            </Tooltip>
            
            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1">
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onRefine} disabled={isDisabled}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Refine
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onUpdateStyle} disabled={isDisabled}>
                  <Palette className="h-4 w-4 mr-2" />
                  Update Style
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onChangeModel} disabled={isDisabled}>
                  <Cpu className="h-4 w-4 mr-2" />
                  Change Model
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={onDuplicate} disabled={isDisabled}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                
                {hasHistory && (
                  <DropdownMenuItem onClick={onViewHistory}>
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={onRevert} disabled={isDisabled || version <= 1}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Revert to Original
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={onDelete} 
                  disabled={isDisabled}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        
        {/* Credits Display */}
        {showCredits && !compact && (
          <>
            <div className="flex-1" />
            <Badge variant="secondary" className="gap-1 text-xs">
              <Coins className="h-3 w-3" />
              ~{estimatedCredits} credits
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs capitalize",
                currentTier === 'premium' && "border-primary text-primary",
                currentTier === 'advanced' && "border-accent text-accent-foreground",
                currentTier === 'standard' && "border-muted text-muted-foreground"
              )}
            >
              {currentTier}
            </Badge>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

export default ElementEditorToolbar;
