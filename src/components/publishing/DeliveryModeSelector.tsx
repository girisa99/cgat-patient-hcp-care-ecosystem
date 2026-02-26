/**
 * DeliveryModeSelector — Direct/Scheduled/Download/URL per platform.
 */

import React from 'react';
import { Upload, Clock, Download, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeliveryMode } from '@/types/publishing';

interface DeliveryModeSelectorProps {
  mode: DeliveryMode;
  onSelect: (mode: DeliveryMode) => void;
  supportsScheduling?: boolean;
  compact?: boolean;
}

const MODES: { id: DeliveryMode; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'direct_publish', label: 'Publish', icon: Upload, desc: 'Post now' },
  { id: 'scheduled', label: 'Schedule', icon: Clock, desc: 'Set date/time' },
  { id: 'download_export', label: 'Download', icon: Download, desc: 'Export file' },
  { id: 'url_share', label: 'Share Link', icon: Link2, desc: 'Copy URL' },
];

export const DeliveryModeSelector: React.FC<DeliveryModeSelectorProps> = ({
  mode,
  onSelect,
  supportsScheduling = true,
  compact = false,
}) => {
  const available = MODES.filter(m => {
    if (m.id === 'scheduled' && !supportsScheduling) return false;
    return true;
  });

  return (
    <div className={cn('flex gap-1.5', compact ? 'flex-wrap' : 'flex-row')}>
      {available.map(m => {
        const isActive = mode === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors',
              isActive
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border hover:border-muted-foreground/30 text-muted-foreground',
            )}
          >
            <Icon className="h-3 w-3" />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
