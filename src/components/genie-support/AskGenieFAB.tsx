/**
 * ASK GENIE FAB (Floating Action Button)
 * Persistent floating button that opens a chat panel for quick AI support
 * 
 * ENHANCED: Draggable + Smart floating to avoid blocking buttons
 * - Can be dragged to any corner
 * - Auto-repositions when near bottom action buttons
 * - Remembers position preference
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircleQuestion, X, ExternalLink, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AskGenie } from '@/components/genie-studio/AskGenie';

interface AskGenieFABProps {
  className?: string;
}

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export const AskGenieFAB: React.FC<AskGenieFABProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<Position>('bottom-right');
  const [isAutoMinimized, setIsAutoMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const dragControls = useDragControls();

  // Check if buttons are being blocked in the viewport bottom area
  const checkForButtonOcclusion = useCallback(() => {
    if (!isOpen || isMinimized) return;

    // Find action buttons that might be blocked
    const actionButtons = document.querySelectorAll(
      'button[type="submit"], button:has(.lucide-save), button:has(.lucide-send), ' +
      '[data-action-button], .action-button, button:contains("Save"), button:contains("Generate"), ' +
      'button:contains("Publish"), button:contains("Submit")'
    );

    const viewportHeight = window.innerHeight;
    const bottomThreshold = viewportHeight - 200; // Bottom 200px zone

    let hasBlockedButton = false;
    actionButtons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      if (rect.bottom > bottomThreshold && rect.top < viewportHeight) {
        hasBlockedButton = true;
      }
    });

    // Also check if user scrolled to bottom of page
    const scrolledToBottom = 
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;

    if ((hasBlockedButton || scrolledToBottom) && position.startsWith('bottom')) {
      setIsAutoMinimized(true);
    } else {
      setIsAutoMinimized(false);
    }
  }, [isOpen, isMinimized, position]);

  // Smart scroll detection
  useEffect(() => {
    const handleScroll = () => {
      checkForButtonOcclusion();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial check
    checkForButtonOcclusion();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [checkForButtonOcclusion]);

  // Recheck when panel opens
  useEffect(() => {
    if (isOpen) {
      checkForButtonOcclusion();
    }
  }, [isOpen, checkForButtonOcclusion]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        const fab = fabRef.current;
        if (fab && !fab.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleGoToSupport = () => {
    setIsOpen(false);
    navigate('/genie-support');
  };

  // Handle drag end to snap to nearest corner
  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get the final position
    const fabElement = fabRef.current;
    if (!fabElement) return;
    
    const rect = fabElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Determine which quadrant
    const isRight = centerX > viewportWidth / 2;
    const isBottom = centerY > viewportHeight / 2;
    
    const newPosition: Position = 
      isBottom && isRight ? 'bottom-right' :
      isBottom && !isRight ? 'bottom-left' :
      !isBottom && isRight ? 'top-right' : 'top-left';
    
    setPosition(newPosition);
  };

  // Get position classes based on current position
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-20 right-6';
      case 'top-left':
        return 'top-20 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  // Get panel position based on FAB position
  const getPanelPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-20 right-6';
      case 'bottom-left':
        return 'bottom-20 left-6';
      case 'top-right':
        return 'top-20 right-6';
      case 'top-left':
        return 'top-20 left-6';
      default:
        return 'bottom-20 right-6';
    }
  };

  // Determine if we should show minimized version
  const shouldMinimize = isMinimized || isAutoMinimized;

  return (
    <>
      {/* Draggable Floating Action Button */}
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.1, zIndex: 9999 }}
        className={cn(
          "fixed z-10",
          getPositionClasses(),
          className
        )}
        style={{ touchAction: 'none' }}
      >
        <Button
          ref={fabRef}
          onClick={() => {
            if (isDragging) return; // Don't toggle if was dragging
            if (isOpen && shouldMinimize) {
              setIsMinimized(false);
              setIsAutoMinimized(false);
            } else {
              setIsOpen(!isOpen);
            }
          }}
          className={cn(
            "h-12 w-12 rounded-full shadow-lg",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "cursor-grab active:cursor-grabbing",
            isOpen && "bg-muted text-foreground hover:bg-muted/90"
          )}
          size="icon"
          aria-label={isOpen ? "Close Ask Genie" : "Open Ask Genie"}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {shouldMinimize ? <ChevronUp className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <MessageCircleQuestion className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        {/* Drag hint indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isDragging ? 1 : 0 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background/90 text-xs px-2 py-1 rounded shadow whitespace-nowrap"
        >
          <GripVertical className="h-3 w-3 inline mr-1" />
          Drag to reposition
        </motion.div>
      </motion.div>

      {/* Chat Panel - positioned relative to FAB position */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: position.startsWith('bottom') ? 20 : -20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: shouldMinimize ? 48 : 'auto'
            }}
            exit={{ opacity: 0, y: position.startsWith('bottom') ? 20 : -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-10",
              getPanelPositionClasses(),
              "w-[360px]",
              shouldMinimize ? "h-12" : "max-h-[min(480px,calc(100vh-180px))]",
              "bg-background border rounded-xl shadow-xl overflow-hidden",
              "flex flex-col"
            )}
          >
            {/* Header - always visible */}
            <div 
              className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 cursor-pointer"
              onClick={() => {
                setIsMinimized(!isMinimized);
                setIsAutoMinimized(false);
              }}
            >
              <div className="flex items-center gap-2">
                <MessageCircleQuestion className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Ask Genie</span>
                {shouldMinimize && (
                  <span className="text-xs text-muted-foreground">
                    {isAutoMinimized ? '(Auto-hidden - click to expand)' : 'Click to expand'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!shouldMinimize && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoToSupport();
                      }}
                      title="Go to Support Center"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMinimized(true);
                      }}
                      title="Minimize"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  title="Close"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Chat Content - only when not minimized */}
            {!shouldMinimize && (
              <div className="flex-1 overflow-hidden">
                <AskGenie
                  product="support"
                  position="inline"
                  isOpen={true}
                  className="h-full max-h-[400px] border-0 shadow-none"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AskGenieFAB;
