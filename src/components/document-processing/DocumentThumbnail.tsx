/**
 * DocumentThumbnail Component
 * Handles document image thumbnails with proper error fallback
 * Works for images, PDFs, and missing images
 */

import React, { useState } from 'react';
import { FileText, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentThumbnailProps {
  imageUrl?: string;
  fileName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DocumentThumbnail({
  imageUrl,
  fileName = 'Document',
  size = 'md',
  className
}: DocumentThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Determine if it's a PDF
  const isPdf = fileName?.toLowerCase().endsWith('.pdf') || 
                imageUrl?.startsWith('data:application/pdf');

  // Check if imageUrl is valid (not empty, not placeholder, etc.)
  const hasValidImageUrl = imageUrl && 
                           imageUrl.length > 10 && 
                           !imageUrl.includes('[base64:') &&
                           !imageUrl.startsWith('unknown');

  // PDF files - show PDF icon
  if (isPdf || (hasValidImageUrl && imageUrl?.startsWith('data:application/pdf'))) {
    return (
      <div className={cn(
        sizeClasses[size],
        "rounded border bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0",
        className
      )}>
        <FileText className={cn(iconSizes[size], "text-red-500")} />
      </div>
    );
  }

  // No valid image URL - show generic document icon
  if (!hasValidImageUrl || hasError) {
    return (
      <div className={cn(
        sizeClasses[size],
        "rounded border bg-muted flex items-center justify-center shrink-0",
        className
      )}>
        {hasError ? (
          <ImageOff className={cn(iconSizes[size], "text-muted-foreground opacity-50")} />
        ) : (
          <FileText className={cn(iconSizes[size], "text-muted-foreground")} />
        )}
      </div>
    );
  }

  // Image files - show thumbnail with error handling
  return (
    <div className={cn(
      sizeClasses[size],
      "rounded border overflow-hidden shrink-0 bg-muted relative",
      className
    )}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <FileText className={cn(iconSizes[size], "text-muted-foreground opacity-30")} />
        </div>
      )}
      <img 
        src={imageUrl} 
        alt={fileName}
        className={cn(
          "w-full h-full object-cover transition-opacity",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}

export default DocumentThumbnail;