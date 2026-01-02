/**
 * Camera Setup Dialog - Asks user about camera configuration before recording
 * - Single camera (webcam only)
 * - Screen only
 * - Multi-camera (screen + webcam PIP)
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Camera, Monitor, MonitorPlay, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecordingMode } from '../hooks/useScreenShare';

interface CameraSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: RecordingMode, options: CameraSetupOptions) => void;
  currentMode: RecordingMode;
}

export interface CameraSetupOptions {
  enablePIP: boolean;
  enableStudioSound: boolean;
  enableBackgroundBlur: boolean;
}

export function CameraSetupDialog({
  isOpen,
  onClose,
  onConfirm,
  currentMode,
}: CameraSetupDialogProps) {
  const [selectedMode, setSelectedMode] = React.useState<RecordingMode>(currentMode);
  const [options, setOptions] = React.useState<CameraSetupOptions>({
    enablePIP: true,
    enableStudioSound: true,
    enableBackgroundBlur: false,
  });

  // Reset when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedMode(currentMode);
    }
  }, [isOpen, currentMode]);

  const handleConfirm = () => {
    onConfirm(selectedMode, options);
    onClose();
  };

  const modeOptions = [
    {
      mode: 'camera' as RecordingMode,
      icon: Camera,
      title: 'Camera Only',
      description: 'Record with your webcam only. Great for vlogs, tutorials, and talking head videos.',
      badge: 'Single Camera',
    },
    {
      mode: 'screen' as RecordingMode,
      icon: Monitor,
      title: 'Screen Only',
      description: 'Capture your screen without camera. Ideal for software demos and presentations.',
      badge: 'No Camera',
    },
    {
      mode: 'screen+camera' as RecordingMode,
      icon: MonitorPlay,
      title: 'Screen + Camera',
      description: 'Show your screen with a picture-in-picture camera overlay. Perfect for walkthroughs and tutorials.',
      badge: 'Multi-Camera',
      highlight: true,
    },
  ];

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Recording Setup
          </AlertDialogTitle>
          <AlertDialogDescription>
            Choose your camera configuration and recording options before starting.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Recording Mode Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Recording Mode</Label>
            <div className="grid gap-2">
              {modeOptions.map(({ mode, icon: Icon, title, description, badge, highlight }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedMode(mode)}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all",
                    selectedMode === mode
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-muted-foreground/30 hover:bg-muted/50",
                    highlight && selectedMode !== mode && "border-dashed"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                      selectedMode === mode ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm">{title}</span>
                        <Badge 
                          variant={highlight ? "default" : "secondary"} 
                          className={cn(
                            "text-[10px]",
                            highlight && "bg-blue-500/20 text-blue-700 border-blue-500/30"
                          )}
                        >
                          {badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Recording Options</Label>
            <div className="space-y-2 bg-muted/30 rounded-lg p-3">
              {selectedMode === 'screen+camera' && (
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-xs font-medium">Picture-in-Picture</Label>
                      <p className="text-[10px] text-muted-foreground">Show camera as overlay on screen</p>
                    </div>
                  </div>
                  <Switch
                    checked={options.enablePIP}
                    onCheckedChange={(enablePIP) => setOptions(prev => ({ ...prev, enablePIP }))}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18V5l12-2v13M9 9l12-2" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  <div>
                    <Label className="text-xs font-medium">Studio Sound</Label>
                    <p className="text-[10px] text-muted-foreground">Podcast-quality audio processing</p>
                  </div>
                </div>
                <Switch
                  checked={options.enableStudioSound}
                  onCheckedChange={(enableStudioSound) => setOptions(prev => ({ ...prev, enableStudioSound }))}
                />
              </div>

              {(selectedMode === 'camera' || selectedMode === 'screen+camera') && (
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <div>
                      <Label className="text-xs font-medium">Background Blur</Label>
                      <p className="text-[10px] text-muted-foreground">ML-powered background blur</p>
                    </div>
                  </div>
                  <Switch
                    checked={options.enableBackgroundBlur}
                    onCheckedChange={(enableBackgroundBlur) => setOptions(prev => ({ ...prev, enableBackgroundBlur }))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Continue to Recording
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
