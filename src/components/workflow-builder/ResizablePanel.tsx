import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizablePanelProps {
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  position?: 'left' | 'right';
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  initialWidth = 320,
  minWidth = 280,
  maxWidth = 600,
  className,
  position = 'right'
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      let newWidth: number;

      if (position === 'right') {
        newWidth = window.innerWidth - e.clientX;
      } else {
        newWidth = e.clientX - rect.left;
      }

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth, position]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div
      ref={panelRef}
      className={cn('relative flex flex-col', className)}
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors z-10',
          position === 'right' ? '-left-0.5' : '-right-0.5'
        )}
        onMouseDown={handleMouseDown}
      >
        <div
          className={cn(
            'absolute top-1/2 transform -translate-y-1/2 w-3 h-8 rounded bg-border hover:bg-primary/40 transition-colors',
            position === 'right' ? '-left-1' : '-right-1'
          )}
        />
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Dragging overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  );
};