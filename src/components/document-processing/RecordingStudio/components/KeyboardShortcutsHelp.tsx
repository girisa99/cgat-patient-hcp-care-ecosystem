/**
 * Keyboard Shortcuts Help Component
 * Displays available shortcuts in a popover
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Keyboard } from 'lucide-react';
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isRecording: boolean;
}

export function KeyboardShortcutsHelp({ isRecording }: KeyboardShortcutsHelpProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs">
          <Keyboard className="w-3.5 h-3.5" />
          Shortcuts
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
          <div className="space-y-1.5">
            {SHORTCUTS.map((shortcut) => {
              const isDisabled = 
                (shortcut.action === 'camera' && isRecording) ||
                (shortcut.action === 'pause' && !isRecording) ||
                (shortcut.action === 'trim' && !isRecording) ||
                (shortcut.action === 'stop' && !isRecording);

              return (
                <div
                  key={shortcut.action}
                  className={`flex items-center justify-between text-xs ${
                    isDisabled ? 'opacity-40' : ''
                  }`}
                >
                  <span className="text-muted-foreground">{shortcut.description}</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground pt-2 border-t">
            Shortcuts are disabled when typing in text fields
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
