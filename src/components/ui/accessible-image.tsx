
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface AccessibleImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  src,
  alt,
  fallback,
  loading = 'lazy',
  aspectRatio,
  className,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const aspectMap = {
    square: 'aspect-square',
    video: 'aspect-video', 
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  if (imageError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          'border border-border rounded-md',
          aspectRatio && aspectMap[aspectRatio],
          className
        )}
        role="img"
        aria-label={alt}
      >
        {fallback || (
          <div className="flex flex-col items-center gap-2 p-4">
            <ImageIcon className="h-8 w-8" />
            <span className="text-sm">Image unavailable</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', aspectRatio && aspectMap[aspectRatio])}>
      {!imageLoaded && (
        <div 
          className={cn(
            'absolute inset-0 bg-muted animate-pulse flex items-center justify-center',
            className
          )}
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={cn(
          'transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0',
          aspectRatio ? 'w-full h-full object-cover' : 'max-w-full h-auto',
          className
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        {...props}
      />
    </div>
  );
};
