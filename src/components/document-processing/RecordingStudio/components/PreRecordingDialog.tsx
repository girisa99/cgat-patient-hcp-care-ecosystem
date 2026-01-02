/**
 * Pre-Recording Dialog - Asks user to choose between original or enhanced script
 * for teleprompter and TTS playback before recording starts
 */

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreRecordingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScript: (useEnhanced: boolean) => void;
  hasEnhancedScript: boolean;
  originalScriptPreview?: string;
  enhancedScriptPreview?: string;
  scriptTitle?: string;
}

export function PreRecordingDialog({
  isOpen,
  onClose,
  onSelectScript,
  hasEnhancedScript,
  originalScriptPreview = '',
  enhancedScriptPreview = '',
  scriptTitle = 'Script',
}: PreRecordingDialogProps) {
  const [selectedOption, setSelectedOption] = React.useState<'original' | 'enhanced'>(
    hasEnhancedScript ? 'enhanced' : 'original'
  );

  // Reset selection when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedOption(hasEnhancedScript ? 'enhanced' : 'original');
    }
  }, [isOpen, hasEnhancedScript]);

  const handleConfirm = () => {
    onSelectScript(selectedOption === 'enhanced');
    onClose();
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary" />
            Choose Script for Recording
          </AlertDialogTitle>
          <AlertDialogDescription>
            Select which version of "{scriptTitle}" to use for the teleprompter and TTS during recording.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-4">
          {/* Original Script Option */}
          <button
            type="button"
            onClick={() => setSelectedOption('original')}
            className={cn(
              "w-full p-4 rounded-lg border text-left transition-all",
              selectedOption === 'original'
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                selectedOption === 'original' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Original Script</span>
                  {!hasEnhancedScript && (
                    <Badge variant="secondary" className="text-xs">Only Option</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {truncateText(originalScriptPreview) || 'No script content available'}
                </p>
              </div>
            </div>
          </button>

          {/* Enhanced Script Option */}
          <button
            type="button"
            onClick={() => hasEnhancedScript && setSelectedOption('enhanced')}
            disabled={!hasEnhancedScript}
            className={cn(
              "w-full p-4 rounded-lg border text-left transition-all",
              !hasEnhancedScript && "opacity-50 cursor-not-allowed",
              selectedOption === 'enhanced' && hasEnhancedScript
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                selectedOption === 'enhanced' && hasEnhancedScript 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Enhanced Script</span>
                  {hasEnhancedScript && (
                    <Badge variant="default" className="text-xs bg-green-500/20 text-green-700 border-green-500/30">
                      AI Improved
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {hasEnhancedScript 
                    ? truncateText(enhancedScriptPreview) 
                    : 'Enhance your script first to use this option'}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <ScrollText className="w-3.5 h-3.5" />
            The selected script will be shown in the teleprompter and used for TTS playback during recording.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Start Recording
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
