/**
 * Content Type Selector Component
 * Grid of content type options for script generation
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ContentType, ContentTypeOption } from './types';

interface ContentTypeSelectorProps {
  contentTypes: ContentTypeOption[];
  selectedType: ContentType;
  onSelect: (type: ContentType) => void;
  className?: string;
}

export function ContentTypeSelector({
  contentTypes,
  selectedType,
  onSelect,
  className,
}: ContentTypeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-2", className)}>
      {contentTypes.map((type) => (
        <Button
          key={type.id}
          variant={selectedType === type.id ? 'default' : 'outline'}
          className={cn(
            "h-auto py-3 px-3 flex flex-col items-start gap-1 text-left",
            selectedType === type.id && "ring-2 ring-primary ring-offset-2"
          )}
          onClick={() => onSelect(type.id)}
        >
          <div className="flex items-center gap-2">
            {type.icon}
            <span className="font-medium text-sm">{type.label}</span>
          </div>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {type.description}
          </span>
        </Button>
      ))}
    </div>
  );
}
