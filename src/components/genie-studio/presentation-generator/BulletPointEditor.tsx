/**
 * Bullet Point Editor - Individual bullet editing with AI enhancement
 * Supports: Edit, Accept, Skip, Enhance, Refresh for each bullet point
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Check, 
  X, 
  Edit3, 
  Wand2, 
  RefreshCw,
  SkipForward,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BulletPoint, SlideEnhancementType } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulletPointEditorProps {
  bullet: BulletPoint;
  index: number;
  onUpdate: (id: string, text: string) => void;
  onAccept: (id: string) => void;
  onSkip: (id: string) => void;
  onEnhance: (id: string, type: SlideEnhancementType) => Promise<void>;
  onRefresh: (id: string) => Promise<void>;
  onRevert?: (id: string) => void;
  isLast?: boolean;
}

export function BulletPointEditor({
  bullet,
  index,
  onUpdate,
  onAccept,
  onSkip,
  onEnhance,
  onRefresh,
  onRevert,
  isLast
}: BulletPointEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(bullet.text);
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditedText(bullet.text);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdate(bullet.id, editedText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(bullet.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const enhancementOptions: { type: SlideEnhancementType; label: string; icon: React.ReactNode }[] = [
    { type: 'rewrite', label: 'Rewrite', icon: <RefreshCw className="h-3 w-3" /> },
    { type: 'expand', label: 'Expand', icon: <ChevronUp className="h-3 w-3" /> },
    { type: 'summarize', label: 'Shorten', icon: <ChevronDown className="h-3 w-3" /> },
    { type: 'polish', label: 'Polish', icon: <Sparkles className="h-3 w-3" /> },
  ];

  const hasOriginal = bullet.originalText && bullet.originalText !== bullet.text;

  return (
    <div className={cn(
      "group flex items-start gap-2 py-1.5 px-2 rounded-md transition-all",
      "hover:bg-muted/50",
      bullet.isEnhancing && "bg-primary/5",
      !isLast && "border-b border-border/30"
    )}>
      {/* Bullet marker */}
      <span className="text-primary font-bold mt-0.5 select-none">•</span>
      
      {/* Content area */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm flex-1"
            />
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSaveEdit}>
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancelEdit}>
              <X className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <p 
              className={cn(
                "text-sm cursor-text flex-1",
                bullet.enhancementApplied && "text-primary",
                hasOriginal && "italic"
              )}
              onClick={handleStartEdit}
            >
              {bullet.text}
              {bullet.enhancementApplied && (
                <span className="ml-2 text-[10px] text-primary/70 font-medium">
                  ({bullet.enhancementApplied})
                </span>
              )}
            </p>
            
            {/* Action buttons - visible on hover */}
            <div className={cn(
              "flex items-center gap-0.5 transition-opacity",
              "opacity-0 group-hover:opacity-100",
              bullet.isEnhancing && "opacity-100"
            )}>
              {bullet.isEnhancing ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <>
                  {/* Edit */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleStartEdit}
                    title="Edit"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  
                  {/* AI Enhance dropdown */}
                  <DropdownMenu open={showEnhanceMenu} onOpenChange={setShowEnhanceMenu}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title="AI Enhance"
                      >
                        <Wand2 className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      {enhancementOptions.map(opt => (
                        <DropdownMenuItem 
                          key={opt.type}
                          onClick={() => {
                            onEnhance(bullet.id, opt.type);
                            setShowEnhanceMenu(false);
                          }}
                          className="text-xs"
                        >
                          {opt.icon}
                          <span className="ml-2">{opt.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Refresh */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRefresh(bullet.id)}
                    title="Regenerate"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  
                  {/* Accept */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-green-600"
                    onClick={() => onAccept(bullet.id)}
                    title="Accept"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  
                  {/* Skip */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                    onClick={() => onSkip(bullet.id)}
                    title="Skip"
                  >
                    <SkipForward className="h-3 w-3" />
                  </Button>
                  
                  {/* Revert (if enhanced) */}
                  {hasOriginal && onRevert && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-orange-500"
                      onClick={() => onRevert(bullet.id)}
                      title="Revert to original"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
