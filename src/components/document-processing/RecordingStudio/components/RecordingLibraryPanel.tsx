/**
 * Recording Library Panel Component
 * 
 * REFACTORED: Now wraps VibeLibraryTab for full functionality
 * - FFmpeg trimming
 * - Studio Sound presets  
 * - ContentAnalyzer integration
 * - Download/Delete/Preview
 * 
 * Keeps the Sheet UI for backwards compatibility with RecordingStudio
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Library } from 'lucide-react';
import { VibeLibraryTab } from '@/components/genie-vibe/VibeLibraryTab';

interface RecordingLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingSelect?: (url: string, name: string) => void;
  onScriptGenerated?: (script: { title: string; content: string }) => void;
  // Legacy props - kept for backwards compatibility but now handled internally
  recordings?: unknown[];
  onPlay?: (id: number) => void;
  onDownload?: (id: number) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
}

export function RecordingLibraryPanel({
  isOpen,
  onClose,
  onRecordingSelect,
  onScriptGenerated,
}: RecordingLibraryPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[500px] sm:w-[600px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Library className="w-5 h-5" />
            Recording Library
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 h-[calc(100vh-80px)] overflow-auto">
          <VibeLibraryTab
            onRecordingSelect={onRecordingSelect}
            onScriptGenerated={onScriptGenerated}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
