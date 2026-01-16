/**
 * Slide AI Enhancer - AI enhancement panel for individual slides
 * Provides enhancement types: rewrite, expand, summarize, polish, regenerate, add stats/visuals
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Wand2, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  X,
  Undo2,
  BarChart3,
  Image as ImageIcon,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresentationSlide, SlideEnhancementType } from './types';

interface EnhancementOption {
  type: SlideEnhancementType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const SLIDE_ENHANCEMENT_OPTIONS: EnhancementOption[] = [
  {
    type: 'rewrite',
    label: 'Rewrite',
    description: 'Improve clarity and flow',
    icon: <RefreshCw className="h-4 w-4" />,
  },
  {
    type: 'expand',
    label: 'Expand',
    description: 'Add more detail',
    icon: <Maximize2 className="h-4 w-4" />,
  },
  {
    type: 'summarize',
    label: 'Summarize',
    description: 'Make more concise',
    icon: <Minimize2 className="h-4 w-4" />,
  },
  {
    type: 'polish',
    label: 'Polish',
    description: 'Professional refinement',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    type: 'add_stats',
    label: 'Add Stats',
    description: 'Insert relevant statistics',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    type: 'add_visuals',
    label: 'Visual Notes',
    description: 'Enhance visual descriptions',
    icon: <ImageIcon className="h-4 w-4" />,
  },
  {
    type: 'simplify',
    label: 'Simplify',
    description: 'Easier to understand',
    icon: <Lightbulb className="h-4 w-4" />,
  },
  {
    type: 'regenerate',
    label: 'Regenerate',
    description: 'Create new content',
    icon: <RefreshCw className="h-4 w-4" />,
  },
];

interface SlideAIEnhancerProps {
  slide: PresentationSlide;
  onEnhance: (type: SlideEnhancementType, customInstructions?: string) => Promise<void>;
  onRevert?: () => void;
  onClose: () => void;
  className?: string;
}

export function SlideAIEnhancer({
  slide,
  onEnhance,
  onRevert,
  onClose,
  className,
}: SlideAIEnhancerProps) {
  const [selectedType, setSelectedType] = useState<SlideEnhancementType | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!selectedType) return;
    
    setIsEnhancing(true);
    try {
      await onEnhance(selectedType, customInstructions || undefined);
      onClose();
    } catch (error) {
      console.error('Slide enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const hasOriginal = slide.originalTitle || slide.originalContent;

  return (
    <div className={cn("rounded-lg border bg-card p-3 space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Enhancement</span>
          <span className="text-xs text-muted-foreground">Slide {slide.slideNumber}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Enhancement Options Grid */}
      <div className="grid grid-cols-4 gap-2">
        {SLIDE_ENHANCEMENT_OPTIONS.map((option) => (
          <button
            key={option.type}
            onClick={() => setSelectedType(option.type)}
            disabled={isEnhancing}
            className={cn(
              "p-2 rounded-lg border text-left transition-all",
              selectedType === option.type
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:border-primary/50 hover:bg-muted/50",
              isEnhancing && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="text-primary">{option.icon}</div>
              <span className="text-xs font-medium truncate">{option.label}</span>
            </div>
            <p className="text-[9px] text-muted-foreground line-clamp-1">
              {option.description}
            </p>
          </button>
        ))}
      </div>

      {/* Custom Instructions */}
      {selectedType && (
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Custom instructions (optional)
          </label>
          <Textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder={`E.g., "Make it more data-driven" or "Focus on healthcare benefits"`}
            rows={2}
            className="text-xs resize-none"
            disabled={isEnhancing}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {hasOriginal && onRevert && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRevert}
            disabled={isEnhancing}
            className="text-xs"
          >
            <Undo2 className="h-3 w-3 mr-1" />
            Revert
          </Button>
        )}
        
        <div className="flex-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isEnhancing}
          className="text-xs"
        >
          Cancel
        </Button>
        
        <Button
          size="sm"
          onClick={handleEnhance}
          disabled={!selectedType || isEnhancing}
          className="text-xs"
        >
          {isEnhancing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 mr-1" />
              Apply {selectedType ? SLIDE_ENHANCEMENT_OPTIONS.find(o => o.type === selectedType)?.label : ''}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
