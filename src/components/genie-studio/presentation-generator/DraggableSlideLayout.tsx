/**
 * Draggable Slide Layout - Flexible drag-and-drop layout for slide elements
 * Supports repositioning text, images, tables, and charts
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Move,
  Image as ImageIcon,
  Type,
  Table,
  BarChart3,
  Maximize2,
  Minimize2,
  RotateCcw,
  Lock,
  Unlock,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDraggable, useDroppable, DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export interface LayoutElement {
  id: string;
  type: 'text' | 'image' | 'table' | 'chart' | 'title' | 'subtitle' | 'bullet-list' | 'stat';
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  locked: boolean;
  alignment?: 'left' | 'center' | 'right';
}

interface DraggableSlideLayoutProps {
  elements: LayoutElement[];
  onElementsChange: (elements: LayoutElement[]) => void;
  slideSize: { width: number; height: number };
  showGrid?: boolean;
  className?: string;
}

const elementTypeIcons: Record<string, React.ReactNode> = {
  text: <Type className="h-3 w-3" />,
  title: <Type className="h-4 w-4" />,
  subtitle: <Type className="h-3 w-3" />,
  'bullet-list': <AlignLeft className="h-3 w-3" />,
  image: <ImageIcon className="h-3 w-3" />,
  table: <Table className="h-3 w-3" />,
  chart: <BarChart3 className="h-3 w-3" />,
  stat: <BarChart3 className="h-3 w-3" />
};

// Draggable Element Component
function DraggableElement({
  element,
  isSelected,
  onSelect,
  onResize,
  onToggleLock,
  children
}: {
  element: LayoutElement;
  isSelected: boolean;
  onSelect: () => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onToggleLock: (id: string) => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
    disabled: element.locked
  });

  const style = {
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
    zIndex: isDragging ? 1000 : element.zIndex,
    transform: CSS.Translate.toString(transform)
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute transition-shadow",
        isDragging && "shadow-xl opacity-90",
        isSelected && "ring-2 ring-primary ring-offset-1",
        element.locked && "opacity-75"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Element Content */}
      <div className="w-full h-full overflow-hidden rounded border bg-card">
        {children}
      </div>

      {/* Controls (shown when selected) */}
      {isSelected && (
        <>
          {/* Drag Handle */}
          <div
            {...listeners}
            {...attributes}
            className={cn(
              "absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background border rounded-t px-2 py-0.5",
              element.locked && "cursor-not-allowed"
            )}
          >
            {elementTypeIcons[element.type]}
            <Move className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] capitalize">{element.type}</span>
          </div>

          {/* Lock Button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute -top-6 -right-1 h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(element.id);
            }}
          >
            {element.locked ? (
              <Lock className="h-2.5 w-2.5" />
            ) : (
              <Unlock className="h-2.5 w-2.5" />
            )}
          </Button>

          {/* Resize Handles */}
          {!element.locked && (
            <>
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-6 bg-primary/50 rounded cursor-ew-resize" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-primary/50 rounded cursor-ns-resize" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded cursor-nwse-resize" />
            </>
          )}
        </>
      )}
    </div>
  );
}

// Drop Zone Component
function DropZone({ slideSize, showGrid }: { slideSize: { width: number; height: number }; showGrid: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'slide-canvas' });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative bg-card rounded-lg border-2 border-dashed transition-colors",
        isOver && "border-primary bg-primary/5",
        showGrid && "bg-grid-pattern"
      )}
      style={{
        width: slideSize.width,
        height: slideSize.height,
        backgroundSize: showGrid ? '20px 20px' : undefined,
        backgroundImage: showGrid 
          ? 'linear-gradient(to right, hsl(var(--muted)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--muted)) 1px, transparent 1px)'
          : undefined
      }}
    />
  );
}

export function DraggableSlideLayout({
  elements,
  onElementsChange,
  slideSize,
  showGrid = false,
  className
}: DraggableSlideLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [gridVisible, setGridVisible] = useState(showGrid);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (!delta) return;

    const updatedElements = elements.map(el => {
      if (el.id === active.id) {
        return {
          ...el,
          position: {
            x: Math.max(0, Math.min(el.position.x + delta.x, slideSize.width - el.size.width)),
            y: Math.max(0, Math.min(el.position.y + delta.y, slideSize.height - el.size.height))
          }
        };
      }
      return el;
    });

    onElementsChange(updatedElements);
    setActiveDragId(null);
  };

  const handleResize = (id: string, newSize: { width: number; height: number }) => {
    onElementsChange(elements.map(el => 
      el.id === id ? { ...el, size: newSize } : el
    ));
  };

  const handleToggleLock = (id: string) => {
    onElementsChange(elements.map(el => 
      el.id === id ? { ...el, locked: !el.locked } : el
    ));
  };

  const handleAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedId) return;
    
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;

    let newX = element.position.x;
    switch (alignment) {
      case 'left':
        newX = 20;
        break;
      case 'center':
        newX = (slideSize.width - element.size.width) / 2;
        break;
      case 'right':
        newX = slideSize.width - element.size.width - 20;
        break;
    }

    onElementsChange(elements.map(el => 
      el.id === selectedId ? { ...el, position: { ...el.position, x: newX }, alignment } : el
    ));
  };

  const handleReset = () => {
    // Reset to default positions
    const defaultElements = elements.map((el, idx) => ({
      ...el,
      position: { x: 20, y: 20 + idx * 100 },
      locked: false
    }));
    onElementsChange(defaultElements);
    setSelectedId(null);
  };

  const renderElementContent = (element: LayoutElement) => {
    switch (element.type) {
      case 'title':
        return (
          <div className="p-3">
            <h2 className="text-lg font-bold">{element.content || 'Title'}</h2>
          </div>
        );
      case 'subtitle':
        return (
          <div className="p-2">
            <p className="text-sm text-muted-foreground">{element.content || 'Subtitle'}</p>
          </div>
        );
      case 'text':
      case 'bullet-list':
        return (
          <div className="p-3 text-sm">
            {Array.isArray(element.content) ? (
              <ul className="list-disc list-inside space-y-1">
                {element.content.map((item: string, i: number) => (
                  <li key={i} className="text-xs">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs">{element.content || 'Text content'}</p>
            )}
          </div>
        );
      case 'image':
        return (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            {element.content?.url ? (
              <img 
                src={element.content.url} 
                alt={element.content.alt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground mt-1">Image placeholder</p>
              </div>
            )}
          </div>
        );
      case 'table':
        return (
          <div className="p-2 overflow-auto">
            <Table className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="text-[10px] text-center text-muted-foreground">Table</p>
          </div>
        );
      case 'chart':
        return (
          <div className="p-2 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary/50" />
          </div>
        );
      case 'stat':
        return (
          <div className="p-2 text-center">
            <div className="text-xl font-bold text-primary">{element.content?.value || '0'}</div>
            <div className="text-[10px] text-muted-foreground">{element.content?.label || 'Stat'}</div>
          </div>
        );
      default:
        return (
          <div className="p-2 text-xs text-muted-foreground">
            {JSON.stringify(element.content)}
          </div>
        );
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px]">
            {elements.length} elements
          </Badge>
          {selectedId && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleAlignment('left')}
                title="Align left"
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleAlignment('center')}
                title="Align center"
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleAlignment('right')}
                title="Align right"
              >
                <AlignRight className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setGridVisible(!gridVisible)}
            title="Toggle grid"
          >
            <Grid className={cn("h-3 w-3", gridVisible && "text-primary")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleReset}
            title="Reset layout"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div 
        className="relative overflow-auto bg-muted/30 rounded-lg p-4"
        onClick={() => setSelectedId(null)}
      >
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="relative" style={{ width: slideSize.width, height: slideSize.height }}>
            <DropZone slideSize={slideSize} showGrid={gridVisible} />
            
            {elements.map(element => (
              <DraggableElement
                key={element.id}
                element={element}
                isSelected={selectedId === element.id}
                onSelect={() => setSelectedId(element.id)}
                onResize={handleResize}
                onToggleLock={handleToggleLock}
              >
                {renderElementContent(element)}
              </DraggableElement>
            ))}
          </div>
        </DndContext>
      </div>

      {/* Tips */}
      <p className="text-[10px] text-muted-foreground text-center">
        Click an element to select • Drag to reposition • Use toolbar to align
      </p>
    </div>
  );
}
