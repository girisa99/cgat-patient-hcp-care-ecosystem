/**
 * CharacterPickerPopup — Modal popup showing character thumbnails in a grid
 * Opens when user clicks a style's character button, shows all characters
 * for that style with image thumbnails, type badges, and costume variants.
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CharacterOption {
  id: string;
  name: string;
  label: string;
  icon: string;
  description: string | null;
  character_type: string;
  thumbnail_url: string | null;
  costume_variants: any[];
}

interface CharacterPickerPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  styleName: string;
  characters: CharacterOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const CHARACTER_TYPE_COLORS: Record<string, string> = {
  hero: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  mentor: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  antagonist: 'bg-red-500/10 text-red-600 border-red-500/30',
  comic_relief: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  tech: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
  mascot: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  healthcare: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  custom: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
};

export const CharacterPickerPopup: React.FC<CharacterPickerPopupProps> = ({
  open,
  onOpenChange,
  styleName,
  characters,
  selectedIds,
  onToggle,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Select Characters — {styleName}
          </DialogTitle>
          <DialogDescription>
            Choose one or more characters for your production. {selectedIds.length > 0 && `${selectedIds.length} selected`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
            {characters.map(ch => {
              const isSelected = selectedIds.includes(ch.id);
              const isHovered = hoveredId === ch.id;
              const typeColor = CHARACTER_TYPE_COLORS[ch.character_type] || CHARACTER_TYPE_COLORS.custom;

              return (
                <button
                  key={ch.id}
                  onClick={() => onToggle(ch.id)}
                  onMouseEnter={() => setHoveredId(ch.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-left group",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-accent/50 hover:shadow-sm"
                  )}
                >
                  {/* Selection checkmark */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}

                  {/* Character thumbnail */}
                  <div className={cn(
                    "w-16 h-16 rounded-xl overflow-hidden border-2 transition-transform",
                    isSelected ? "border-primary scale-105" : "border-muted",
                    isHovered && !isSelected && "scale-105"
                  )}>
                    {ch.thumbnail_url ? (
                      <img
                        src={ch.thumbnail_url}
                        alt={ch.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const fallback = (e.target as HTMLImageElement).nextElementSibling;
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={cn(
                        "w-full h-full items-center justify-center text-2xl bg-muted/50",
                        ch.thumbnail_url ? "hidden" : "flex"
                      )}
                    >
                      {ch.icon}
                    </div>
                  </div>

                  {/* Character info */}
                  <div className="text-center w-full space-y-1">
                    <p className="text-xs font-semibold truncate">{ch.label}</p>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] px-1.5 py-0 h-4 border", typeColor)}
                    >
                      {ch.character_type}
                    </Badge>
                  </div>

                  {/* Description on hover */}
                  {ch.description && isHovered && (
                    <p className="text-[9px] text-muted-foreground text-center line-clamp-2 absolute -bottom-1 left-0 right-0 bg-popover/95 backdrop-blur-sm border rounded-b-xl px-2 py-1 z-10">
                      {ch.description}
                    </p>
                  )}

                  {/* Costume variants indicator */}
                  {ch.costume_variants && ch.costume_variants.length > 0 && (
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Sparkles className="h-2.5 w-2.5" />
                      {ch.costume_variants.length} costumes
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {selectedIds.length} of {characters.length} selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                characters.forEach(ch => {
                  if (!selectedIds.includes(ch.id)) onToggle(ch.id);
                });
              }}
            >
              Select All
            </Button>
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
