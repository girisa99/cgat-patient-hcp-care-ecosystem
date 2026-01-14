/**
 * VibeKeyboardShortcuts - Keyboard Shortcuts Panel & Help for Genie Vibe
 * 
 * Shows available shortcuts and handles keyboard navigation
 * Responsive: Compact on mobile, full panel on desktop
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Keyboard, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShortcutInfo {
  key: string;
  description: string;
  category: 'recording' | 'audio' | 'navigation' | 'editing';
  modifier?: 'ctrl' | 'shift' | 'alt';
  available?: boolean;
}

const SHORTCUTS: ShortcutInfo[] = [
  // Recording
  { key: 'Space', description: 'Start/Stop Recording', category: 'recording' },
  { key: 'P', description: 'Pause/Resume Recording', category: 'recording' },
  { key: 'Escape', description: 'Cancel Recording', category: 'recording' },
  
  // Audio
  { key: 'C', description: 'Toggle Camera', category: 'audio' },
  { key: 'M', description: 'Toggle Microphone', category: 'audio' },
  { key: 'B', description: 'Toggle Background Blur', category: 'audio' },
  
  // Navigation
  { key: 'T', description: 'Toggle Teleprompter', category: 'navigation' },
  { key: '1-5', description: 'Switch Pipeline Tab', category: 'navigation' },
  
  // Editing
  { key: 'Backspace', description: 'Trim Last 5 Seconds', category: 'editing', available: false },
  { key: 'Z', description: 'Undo Last Action', category: 'editing', modifier: 'ctrl' },
];

interface VibeKeyboardShortcutsProps {
  isRecording: boolean;
  isPaused: boolean;
  className?: string;
}

export function VibeKeyboardShortcuts({
  isRecording,
  isPaused,
  className,
}: VibeKeyboardShortcutsProps) {
  const isMobile = useIsMobile();

  // Group shortcuts by category
  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = [];
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutInfo[]>);

  const categoryLabels: Record<string, string> = {
    recording: 'Recording',
    audio: 'Camera & Audio',
    navigation: 'Navigation',
    editing: 'Editing',
  };

  // Render key badge
  const KeyBadge = ({ shortcut }: { shortcut: ShortcutInfo }) => (
    <div className="flex items-center gap-1">
      {shortcut.modifier && (
        <>
          <Badge variant="outline" className="font-mono text-xs px-1.5">
            {shortcut.modifier === 'ctrl' ? '⌘/Ctrl' : shortcut.modifier}
          </Badge>
          <span className="text-muted-foreground">+</span>
        </>
      )}
      <Badge variant="secondary" className="font-mono text-xs px-2">
        {shortcut.key}
      </Badge>
    </div>
  );

  // Mobile: Don't show (keyboard shortcuts aren't useful on mobile)
  if (isMobile) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-2", className)}>
          <Keyboard className="h-4 w-4" />
          <span className="hidden lg:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {categoryLabels[category]}
              </h4>
              <div className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <div 
                    key={shortcut.key} 
                    className={cn(
                      "flex items-center justify-between py-1.5 px-2 rounded",
                      shortcut.available === false && "opacity-50"
                    )}
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <KeyBadge shortcut={shortcut} />
                  </div>
                ))}
              </div>
              {category !== 'editing' && <Separator className="mt-3" />}
            </div>
          ))}

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <Info className="h-3 w-3" />
            <span>
              {isRecording 
                ? isPaused 
                  ? 'Recording paused. Press Space to resume or P to pause/resume.'
                  : 'Recording active. Press Space or Escape to stop.'
                : 'Press Space to start recording.'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VibeKeyboardShortcuts;
