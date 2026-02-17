/**
 * Draggable Panel Component - Floating panel that can be dragged anywhere on screen
 * Used for Audio Mixer and Teleprompter overlays
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GripHorizontal, X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggablePanelProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  className?: string;
  headerClassName?: string;
  isMinimized?: boolean;
  onMinimizeToggle?: () => void;
}

export function DraggablePanel({
  title,
  icon,
  children,
  isOpen,
  onClose,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 320, height: 400 },
  minWidth = 200,
  minHeight = 100,
  className,
  headerClassName,
  isMinimized = false,
  onMinimizeToggle,
}: DraggablePanelProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Handle dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    e.preventDefault();
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      
      const newX = Math.max(0, Math.min(window.innerWidth - 100, dragStartRef.current.posX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStartRef.current.posY + deltaY));
      
      setPosition({ x: newX, y: newY });
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      
      const newWidth = Math.max(minWidth, resizeStartRef.current.width + deltaX);
      const newHeight = Math.max(minHeight, resizeStartRef.current.height + deltaY);
      
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, minWidth, minHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Handle resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

  // Add global mouse listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed bg-card border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden",
        isDragging && "cursor-grabbing select-none",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 280 : size.width,
        height: isMinimized ? 'auto' : size.height,
      }}
    >
      {/* Header - Drag handle */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 bg-muted/50 border-b cursor-grab",
          isDragging && "cursor-grabbing",
          headerClassName
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {onMinimizeToggle && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onMinimizeToggle();
              }}
            >
              {isMinimized ? (
                <Maximize2 className="w-3 h-3" />
              ) : (
                <Minimize2 className="w-3 h-3" />
              )}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      )}

      {/* Resize handle */}
      {!isMinimized && (
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        >
          <svg
            className="w-4 h-4 text-muted-foreground/50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 21L12 21M21 21L21 12M21 21L14 14" />
          </svg>
        </div>
      )}
    </div>
  );
}
