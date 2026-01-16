/**
 * Slide Card - Individual slide display with editing and AI enhancement
 * Supports: Edit, Accept, Skip, Enhance, Refresh, Regenerate Image
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Check, 
  X, 
  Edit3, 
  Wand2, 
  RefreshCw,
  SkipForward,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  FileText,
  BarChart3,
  Map,
  Presentation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresentationSlide, SlideEnhancementType } from './types';
import { SlideAIEnhancer } from './SlideAIEnhancer';
import { BulletPointEditor } from './BulletPointEditor';

interface SlideCardProps {
  slide: PresentationSlide;
  onUpdate: (slideId: string, updates: Partial<PresentationSlide>) => void;
  onAccept: (slideId: string) => void;
  onSkip: (slideId: string) => void;
  onEnhance: (slideId: string, type: SlideEnhancementType, customInstructions?: string) => Promise<void>;
  onRefresh: (slideId: string) => Promise<void>;
  onRevert: (slideId: string) => void;
  onRegenerateImage: (slideId: string) => Promise<void>;
  onBulletUpdate: (slideId: string, bulletId: string, text: string) => void;
  onBulletAccept: (slideId: string, bulletId: string) => void;
  onBulletSkip: (slideId: string, bulletId: string) => void;
  onBulletEnhance: (slideId: string, bulletId: string, type: SlideEnhancementType) => Promise<void>;
  onBulletRefresh: (slideId: string, bulletId: string) => Promise<void>;
  onBulletRevert: (slideId: string, bulletId: string) => void;
  className?: string;
}

const slideTypeIcons: Record<string, React.ReactNode> = {
  title: <Presentation className="h-4 w-4" />,
  content: <FileText className="h-4 w-4" />,
  section: <FileText className="h-4 w-4" />,
  stats: <BarChart3 className="h-4 w-4" />,
  journey: <Map className="h-4 w-4" />,
  infographic: <BarChart3 className="h-4 w-4" />,
  conclusion: <Check className="h-4 w-4" />,
  cta: <Check className="h-4 w-4" />,
};

export function SlideCard({
  slide,
  onUpdate,
  onAccept,
  onSkip,
  onEnhance,
  onRefresh,
  onRevert,
  onRegenerateImage,
  onBulletUpdate,
  onBulletAccept,
  onBulletSkip,
  onBulletEnhance,
  onBulletRefresh,
  onBulletRevert,
  className,
}: SlideCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(slide.title);
  const [showEnhancer, setShowEnhancer] = useState(false);

  const handleSaveTitle = () => {
    onUpdate(slide.id, { title: editedTitle });
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setEditedTitle(slide.title);
    setIsEditingTitle(false);
  };

  const handleEnhance = async (type: SlideEnhancementType, customInstructions?: string) => {
    await onEnhance(slide.id, type, customInstructions);
    setShowEnhancer(false);
  };

  const hasOriginal = slide.originalTitle || slide.originalContent;
  const isProcessing = slide.isEnhancing || slide.isRegenerating;

  return (
    <Card className={cn(
      "transition-all duration-200",
      slide.isAccepted && "border-green-500/50 bg-green-500/5",
      slide.isSkipped && "border-muted opacity-60",
      isProcessing && "border-primary/50",
      className
    )}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between gap-2">
          {/* Slide number and type */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              {slide.slideNumber}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              {slideTypeIcons[slide.type] || <FileText className="h-4 w-4" />}
              <span className="text-xs capitalize">{slide.type}</span>
            </div>
            {slide.importance === 'high' && (
              <Badge variant="destructive" className="text-[10px]">Important</Badge>
            )}
            {slide.isAccepted && (
              <Badge variant="default" className="text-[10px] bg-green-600">Accepted</Badge>
            )}
            {slide.isSkipped && (
              <Badge variant="secondary" className="text-[10px]">Skipped</Badge>
            )}
            {slide.enhancementApplied && (
              <Badge variant="outline" className="text-[10px] text-primary">
                {slide.enhancementApplied}
              </Badge>
            )}
          </div>

          {/* Slide actions */}
          <div className="flex items-center gap-1">
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <>
                {/* AI Enhance */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowEnhancer(!showEnhancer)}
                  title="AI Enhance"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                </Button>
                
                {/* Refresh/Regenerate */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onRefresh(slide.id)}
                  title="Regenerate slide"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                
                {/* Accept */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-green-600"
                  onClick={() => onAccept(slide.id)}
                  title="Accept slide"
                  disabled={slide.isAccepted}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                
                {/* Skip */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => onSkip(slide.id)}
                  title="Skip slide"
                  disabled={slide.isSkipped}
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </Button>
                
                {/* Revert (if enhanced) */}
                {hasOriginal && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-orange-500"
                    onClick={() => onRevert(slide.id)}
                    title="Revert to original"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}
            
            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="mt-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-8 text-sm font-semibold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') handleCancelTitle();
                }}
                autoFocus
              />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveTitle}>
                <Check className="h-3 w-3 text-green-600" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelTitle}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <h3 
              className="text-sm font-semibold cursor-text hover:bg-muted/50 rounded px-1 -mx-1 py-0.5"
              onClick={() => {
                setEditedTitle(slide.title);
                setIsEditingTitle(true);
              }}
            >
              {slide.title}
            </h3>
          )}
          {slide.subtitle && !isEditingTitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{slide.subtitle}</p>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-3 pt-2 space-y-3">
          {/* AI Enhancer Panel */}
          {showEnhancer && (
            <SlideAIEnhancer
              slide={slide}
              onEnhance={handleEnhance}
              onRevert={hasOriginal ? () => onRevert(slide.id) : undefined}
              onClose={() => setShowEnhancer(false)}
            />
          )}

          {/* Content - Bullets */}
          {slide.content.bullets && slide.content.bullets.length > 0 && (
            <div className="space-y-0 border rounded-lg overflow-hidden">
              {slide.content.bullets.map((bullet, idx) => (
                <BulletPointEditor
                  key={bullet.id}
                  bullet={bullet}
                  index={idx}
                  onUpdate={(id, text) => onBulletUpdate(slide.id, id, text)}
                  onAccept={(id) => onBulletAccept(slide.id, id)}
                  onSkip={(id) => onBulletSkip(slide.id, id)}
                  onEnhance={(id, type) => onBulletEnhance(slide.id, id, type)}
                  onRefresh={(id) => onBulletRefresh(slide.id, id)}
                  onRevert={bullet.originalText ? (id) => onBulletRevert(slide.id, id) : undefined}
                  isLast={idx === slide.content.bullets!.length - 1}
                />
              ))}
            </div>
          )}

          {/* Content - Stats */}
          {slide.content.stats && slide.content.stats.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slide.content.stats.map((stat, idx) => (
                <div key={idx} className="text-center p-2 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Content - Journey Steps */}
          {slide.content.journeySteps && slide.content.journeySteps.length > 0 && (
            <div className="flex items-start gap-2 overflow-x-auto pb-2">
              {slide.content.journeySteps.map((step, idx) => (
                <div 
                  key={step.id} 
                  className={cn(
                    "flex-shrink-0 w-32 p-2 rounded-lg border text-center",
                    step.status === 'current' && "border-primary bg-primary/5",
                    step.status === 'completed' && "border-green-500/50 bg-green-500/5"
                  )}
                >
                  <div className="text-lg mb-1">{step.icon || `${idx + 1}`}</div>
                  <div className="text-xs font-medium">{step.title}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-2">{step.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Image */}
          {slide.image && (
            <div className="relative group">
              <img 
                src={slide.image.url} 
                alt={slide.image.alt}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => onRegenerateImage(slide.id)}
                  disabled={slide.image?.isRegenerating}
                >
                  {slide.image?.isRegenerating ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Regenerate
                </Button>
              </div>
              <Badge className="absolute bottom-2 left-2 text-[10px]">
                <ImageIcon className="h-2.5 w-2.5 mr-1" />
                {slide.image.type}
              </Badge>
            </div>
          )}

          {/* Speaker Notes */}
          {slide.speakerNotes && (
            <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
              <span className="font-medium">Notes:</span> {slide.speakerNotes}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
