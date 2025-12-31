import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import {
  GripVertical,
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Settings2,
  FileText,
  Volume2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface TeleprompterPopupProps {
  title: string;
  content: string;
  type: 'script' | 'audio';
  isOpen: boolean;
  onClose: () => void;
  isRecording?: boolean;
}

export const TeleprompterPopup: React.FC<TeleprompterPopupProps> = ({
  title,
  content,
  type,
  isOpen,
  onClose,
  isRecording = false,
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(30);
  const [fontSize, setFontSize] = useState(18);
  const [isExternalWindow, setIsExternalWindow] = useState(false);
  const [externalWindow, setExternalWindow] = useState<Window | null>(null);
  
  const popupRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (isAutoScrolling && scrollRef.current && !isMinimized) {
      scrollIntervalRef.current = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += 1;
        }
      }, 100 - scrollSpeed);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isAutoScrolling, scrollSpeed, isMinimized]);

  // Start auto-scroll when recording starts
  useEffect(() => {
    if (isRecording && !isAutoScrolling) {
      setIsAutoScrolling(true);
    }
  }, [isRecording]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    },
    [isDragging, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Open in external window (won't be captured in screen share)
  const openInExternalWindow = () => {
    const windowFeatures = 'width=500,height=600,left=100,top=100,toolbar=no,menubar=no,scrollbars=yes,resizable=yes';
    const newWindow = window.open('', `teleprompter-${type}`, windowFeatures);
    
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title} - Teleprompter</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #1a1a2e;
              color: #eee;
              padding: 20px;
              line-height: 1.8;
              overflow: hidden;
            }
            .header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #333;
            }
            .header h1 { font-size: 18px; flex: 1; }
            .controls {
              display: flex;
              gap: 10px;
              margin-bottom: 20px;
              flex-wrap: wrap;
            }
            button {
              background: #4a4a6a;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            }
            button:hover { background: #5a5a7a; }
            button.active { background: #6366f1; }
            .content {
              height: calc(100vh - 150px);
              overflow-y: auto;
              font-size: ${fontSize}px;
              padding: 10px;
              background: #16213e;
              border-radius: 8px;
              white-space: pre-wrap;
              scroll-behavior: smooth;
            }
            .slider-container {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            input[type="range"] {
              width: 100px;
            }
            .badge {
              background: ${type === 'script' ? '#22c55e' : '#3b82f6'};
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="badge">${type === 'script' ? 'Script' : 'Audio'}</span>
            <h1>${title}</h1>
          </div>
          <div class="controls">
            <button id="scrollBtn">▶ Auto-scroll</button>
            <button id="resetBtn">↺ Reset</button>
            <div class="slider-container">
              <span>Speed:</span>
              <input type="range" id="speedSlider" min="10" max="90" value="${scrollSpeed}">
            </div>
            <div class="slider-container">
              <span>Size:</span>
              <input type="range" id="sizeSlider" min="14" max="48" value="${fontSize}">
            </div>
          </div>
          <div class="content" id="content">${content.replace(/\n/g, '<br>')}</div>
          <script>
            let isScrolling = false;
            let scrollInterval = null;
            const contentEl = document.getElementById('content');
            const scrollBtn = document.getElementById('scrollBtn');
            const speedSlider = document.getElementById('speedSlider');
            const sizeSlider = document.getElementById('sizeSlider');
            
            scrollBtn.onclick = function() {
              isScrolling = !isScrolling;
              scrollBtn.textContent = isScrolling ? '⏸ Pause' : '▶ Auto-scroll';
              scrollBtn.classList.toggle('active', isScrolling);
              
              if (isScrolling) {
                scrollInterval = setInterval(() => {
                  contentEl.scrollTop += 1;
                }, 100 - parseInt(speedSlider.value));
              } else {
                clearInterval(scrollInterval);
              }
            };
            
            document.getElementById('resetBtn').onclick = function() {
              contentEl.scrollTop = 0;
            };
            
            speedSlider.oninput = function() {
              if (isScrolling) {
                clearInterval(scrollInterval);
                scrollInterval = setInterval(() => {
                  contentEl.scrollTop += 1;
                }, 100 - parseInt(this.value));
              }
            };
            
            sizeSlider.oninput = function() {
              contentEl.style.fontSize = this.value + 'px';
            };
          </script>
        </body>
        </html>
      `);
      newWindow.document.close();
      setExternalWindow(newWindow);
      setIsExternalWindow(true);
    }
  };

  const resetScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  if (!isOpen || isExternalWindow) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? '200px' : '400px',
      }}
    >
      <Card className={`border-2 ${type === 'script' ? 'border-green-500/50' : 'border-blue-500/50'} bg-background/95 backdrop-blur-sm`}>
        {/* Draggable Header */}
        <CardHeader
          className="cursor-move p-3 select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              {type === 'script' ? (
                <FileText className="h-4 w-4 text-green-500" />
              ) : (
                <Volume2 className="h-4 w-4 text-blue-500" />
              )}
              <CardTitle className="text-sm truncate">{title}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={openInExternalWindow}
                title="Open in separate window (won't be captured in screen share)"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onClose}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-3 pt-0 space-y-3">
            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={isAutoScrolling ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className="h-7 text-xs"
              >
                {isAutoScrolling ? (
                  <Pause className="h-3 w-3 mr-1" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                {isAutoScrolling ? 'Pause' : 'Scroll'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetScroll}
                className="h-7 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Settings2 className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Scroll Speed</Label>
                    <Slider
                      value={[scrollSpeed]}
                      onValueChange={(val) => setScrollSpeed(val[0])}
                      min={10}
                      max={90}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Font Size: {fontSize}px</Label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(val) => setFontSize(val[0])}
                      min={14}
                      max={48}
                      step={2}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Script Content */}
            <ScrollArea
              className="h-[250px] rounded-md border bg-muted/30 p-3"
              ref={scrollRef as any}
            >
              <div
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                className="whitespace-pre-wrap"
              >
                {content}
              </div>
            </ScrollArea>

            {isRecording && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Recording in progress - auto-scrolling enabled
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default TeleprompterPopup;
