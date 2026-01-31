/**
 * ASK GENIE FAB (Floating Action Button)
 * Persistent floating button that opens a chat panel for quick AI support
 * Available on all Genie Studio pages
 * 
 * FIXED: Scroll-aware positioning to avoid blocking action buttons
 */
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircleQuestion, X, Minimize2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AskGenieChat } from './AskGenieChat';

interface AskGenieFABProps {
  className?: string;
}

export const AskGenieFAB: React.FC<AskGenieFABProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const lastScrollY = useRef(0);

  // Track scroll direction to auto-minimize when scrolling down (to reveal buttons)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;
      
      // If scrolling down significantly and panel is open, auto-minimize
      if (scrollingDown && currentScrollY - lastScrollY.current > 50 && isOpen && !isMinimized) {
        setIsMinimized(true);
      }
      
      // Track if user scrolled up (show full panel)
      setIsScrolledUp(currentScrollY < lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, isMinimized]);

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
        // Only close if clicking truly outside (not on FAB button)
        const fab = document.getElementById('ask-genie-fab');
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

  return (
    <>
      {/* Floating Action Button - z-10 to stay below everything important
       * Position: bottom-6 right-6 when not open, adjust when open */}
      <Button
        id="ask-genie-fab"
        onClick={() => {
          if (isOpen && isMinimized) {
            setIsMinimized(false);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "fixed z-10 h-12 w-12 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          // Move up when panel is open to not overlap
          isOpen ? "bottom-[520px] right-6" : "bottom-6 right-6",
          isOpen && isMinimized && "bottom-20 right-6",
          isOpen && "bg-muted text-foreground hover:bg-muted/90",
          className
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
              {isMinimized ? <ChevronUp className="h-5 w-5" /> : <X className="h-5 w-5" />}
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

      {/* Chat Panel - positioned above FAB, low z-index to not block UI */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 48 : 'auto'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-6 right-6 z-10",
              "w-[360px]",
              isMinimized ? "h-12" : "max-h-[480px]",
              "bg-background border rounded-xl shadow-xl overflow-hidden",
              "flex flex-col"
            )}
          >
            {/* Header - always visible */}
            <div 
              className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 cursor-pointer"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-2">
                <MessageCircleQuestion className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Ask Genie</span>
                {isMinimized && (
                  <span className="text-xs text-muted-foreground">Click to expand</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!isMinimized && (
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
            {!isMinimized && (
              <div className="flex-1 overflow-hidden">
                <AskGenieChat 
                  className="h-full max-h-[400px]" 
                  compact
                  onEscalate={handleGoToSupport}
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
