/**
 * Enhancement Customization Dialog
 * Allows users to configure AI enhancement focus and custom instructions
 * Extracted from ScriptEditorTab.tsx
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wand2, Sparkles, Loader2 } from 'lucide-react';
import type { EnhancementFocus } from './types';

interface EnhancementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enhancementFocus: EnhancementFocus;
  onFocusChange: (focus: EnhancementFocus) => void;
  customInstructions: string;
  onCustomInstructionsChange: (value: string) => void;
  onQuickEnhance: () => void;
  onEnhanceWithSettings: () => void;
  isEnhancing: boolean;
}

const FOCUS_OPTIONS: Array<{ value: EnhancementFocus; label: string; description: string }> = [
  { value: 'balanced', label: 'Balanced', description: 'General improvements across all areas' },
  { value: 'engagement', label: 'Engagement', description: 'Hooks, CTAs, audience connection' },
  { value: 'clarity', label: 'Clarity', description: 'Simpler sentences, better structure' },
  { value: 'pacing', label: 'Pacing', description: 'Pauses, rhythm, breathing room' },
  { value: 'conversational', label: 'Conversational', description: 'Natural, spoken-word friendly' },
  { value: 'humor', label: 'Humor & Personality', description: 'Add wit, light humor, personality' },
];

export function EnhancementDialog({
  open,
  onOpenChange,
  enhancementFocus,
  onFocusChange,
  customInstructions,
  onCustomInstructionsChange,
  onQuickEnhance,
  onEnhanceWithSettings,
  isEnhancing,
}: EnhancementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-500" />
            Customize AI Enhancement
          </DialogTitle>
          <DialogDescription>
            Customize how AI enhances your script before generating suggestions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Enhancement Focus</Label>
            <RadioGroup
              value={enhancementFocus}
              onValueChange={(v) => onFocusChange(v as EnhancementFocus)}
              className="grid grid-cols-1 gap-2"
            >
              {FOCUS_OPTIONS.map(opt => (
                <div key={opt.value} className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <Label htmlFor={opt.value} className="flex-1 cursor-pointer">
                    <span className="font-medium">{opt.label}</span>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Custom Instructions (Optional)</Label>
            <Textarea
              placeholder="E.g., 'Make it more formal', 'Add humor', 'Focus on the opening hook', 'Keep medical terminology'..."
              value={customInstructions}
              onChange={(e) => onCustomInstructionsChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Add specific instructions for how AI should enhance your script
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onQuickEnhance}
            disabled={isEnhancing}
          >
            Quick Enhance
          </Button>
          <Button
            onClick={onEnhanceWithSettings}
            disabled={isEnhancing}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            {isEnhancing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Enhance with Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
