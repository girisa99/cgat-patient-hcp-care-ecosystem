/**
 * ContentFormatSelector — Per-platform format: short/long/carousel/story/thumbnail/audio.
 */

import React from 'react';
import { Film, Video, Image, Layout, BookOpen, Mic, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentFormatId } from '@/types/publishing';

interface ContentFormatSelectorProps {
  format: ContentFormatId;
  onSelect: (format: ContentFormatId) => void;
  availableFormats?: ContentFormatId[];
  compact?: boolean;
}

const FORMAT_DEFS: { id: ContentFormatId; label: string; icon: React.ElementType }[] = [
  { id: 'short_video', label: 'Short', icon: Film },
  { id: 'long_video', label: 'Long', icon: Video },
  { id: 'thumbnail', label: 'Thumbnail', icon: Image },
  { id: 'carousel', label: 'Carousel', icon: Layout },
  { id: 'story', label: 'Story', icon: BookOpen },
  { id: 'audio_podcast', label: 'Podcast', icon: Mic },
  { id: 'text_post', label: 'Text', icon: FileText },
];

export const ContentFormatSelector: React.FC<ContentFormatSelectorProps> = ({
  format,
  onSelect,
  availableFormats,
  compact = false,
}) => {
  const formats = availableFormats
    ? FORMAT_DEFS.filter(f => availableFormats.includes(f.id))
    : FORMAT_DEFS;

  return (
    <div className={cn('flex gap-1.5 flex-wrap')}>
      {formats.map(f => {
        const isActive = format === f.id;
        const Icon = f.icon;
        return (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className={cn(
              'flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors',
              isActive
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border hover:border-muted-foreground/30 text-muted-foreground',
              compact && 'px-1.5 py-0.5 text-[10px]',
            )}
          >
            <Icon className={cn('h-3 w-3', compact && 'h-2.5 w-2.5')} />
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
};
