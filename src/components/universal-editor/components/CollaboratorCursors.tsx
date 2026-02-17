/**
 * Collaborator Cursors Component
 * Displays live cursor positions of other users on canvas/timeline
 */

import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CollaboratorCursor {
  userId: string;
  userName: string;
  avatarUrl?: string;
  position: { x: number; y: number };
  color: string;
  activeElement?: string;
  isTyping?: boolean;
}

interface CollaboratorCursorsProps {
  cursors: CollaboratorCursor[];
  containerRef?: React.RefObject<HTMLElement>;
  zoom?: number;
  panOffset?: { x: number; y: number };
  className?: string;
}

// ============================================================================
// COLOR PALETTE FOR COLLABORATORS
// ============================================================================

const COLLABORATOR_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export function getCollaboratorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLLABORATOR_COLORS[Math.abs(hash) % COLLABORATOR_COLORS.length];
}

// ============================================================================
// CURSOR COMPONENT
// ============================================================================

const CursorItem = memo(function CursorItem({ 
  cursor, 
  zoom = 1, 
  panOffset = { x: 0, y: 0 } 
}: { 
  cursor: CollaboratorCursor; 
  zoom?: number; 
  panOffset?: { x: number; y: number };
}) {
  const adjustedX = cursor.position.x * zoom + panOffset.x;
  const adjustedY = cursor.position.y * zoom + panOffset.y;

  return (
    <motion.div
      key={cursor.userId}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: adjustedX,
        y: adjustedY,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className="absolute pointer-events-none z-[9999]"
      style={{ 
        left: 0, 
        top: 0,
      }}
    >
      {/* Cursor Arrow */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="drop-shadow-md"
      >
        <path
          d="M5.5 3L18.5 11.5L12 12.5L9 19L5.5 3Z"
          fill={cursor.color}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Name Label */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-5 top-4 flex items-center gap-1.5"
      >
        <div
          className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white shadow-md whitespace-nowrap flex items-center gap-1"
          style={{ backgroundColor: cursor.color }}
        >
          <Avatar className="h-3 w-3">
            <AvatarImage src={cursor.avatarUrl} />
            <AvatarFallback className="text-[6px] bg-white/20">
              {cursor.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {cursor.userName}
          {cursor.isTyping && (
            <span className="flex gap-0.5 ml-1">
              <span className="w-1 h-1 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </div>
      </motion.div>

      {/* Active Element Indicator */}
      {cursor.activeElement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute -left-2 -top-2 w-8 h-8 rounded-full"
          style={{ 
            backgroundColor: cursor.color,
            filter: 'blur(8px)',
          }}
        />
      )}
    </motion.div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CollaboratorCursors({ 
  cursors, 
  containerRef,
  zoom = 1,
  panOffset = { x: 0, y: 0 },
  className 
}: CollaboratorCursorsProps) {
  const validCursors = useMemo(() => 
    cursors.filter(c => c.position && typeof c.position.x === 'number'),
    [cursors]
  );

  if (validCursors.length === 0) return null;

  return (
    <div 
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {validCursors.map((cursor) => (
          <CursorItem 
            key={cursor.userId} 
            cursor={cursor} 
            zoom={zoom}
            panOffset={panOffset}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default CollaboratorCursors;
