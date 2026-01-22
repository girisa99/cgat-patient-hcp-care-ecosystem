/**
 * Presence Indicators Component
 * Shows avatars of online collaborators and what they're editing
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Users, Eye, Edit3, Clock, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCollaboratorColor } from './CollaboratorCursors';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

export interface Collaborator {
  userId: string;
  userName: string;
  email?: string;
  avatarUrl?: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  status: 'online' | 'idle' | 'offline';
  activeElement?: string;
  activeMode?: 'canvas' | 'timeline' | 'document';
  lastActivity: string;
}

interface PresenceIndicatorsProps {
  collaborators: Collaborator[];
  isConnected: boolean;
  currentUserId?: string;
  maxVisible?: number;
  onViewCollaborator?: (userId: string) => void;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRoleIcon(role: Collaborator['role']) {
  switch (role) {
    case 'owner': return <Edit3 className="h-2.5 w-2.5" />;
    case 'editor': return <Edit3 className="h-2.5 w-2.5" />;
    case 'viewer': return <Eye className="h-2.5 w-2.5" />;
    default: return null;
  }
}

function getStatusColor(status: Collaborator['status']) {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'idle': return 'bg-amber-500';
    case 'offline': return 'bg-muted-foreground/50';
  }
}

// ============================================================================
// COLLABORATOR AVATAR
// ============================================================================

function CollaboratorAvatar({ 
  collaborator, 
  size = 'default',
  showStatus = true,
  onClick 
}: { 
  collaborator: Collaborator; 
  size?: 'sm' | 'default' | 'lg';
  showStatus?: boolean;
  onClick?: () => void;
}) {
  const color = getCollaboratorColor(collaborator.userId);
  const sizeClasses = {
    sm: 'h-6 w-6',
    default: 'h-8 w-8',
    lg: 'h-10 w-10',
  };
  const statusSizes = {
    sm: 'h-2 w-2',
    default: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className="relative focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
            onClick={onClick}
          >
            <Avatar 
              className={cn(
                sizeClasses[size],
                "border-2 transition-transform hover:scale-110",
              )}
              style={{ borderColor: color }}
            >
              <AvatarImage src={collaborator.avatarUrl} alt={collaborator.userName} />
              <AvatarFallback 
                className="text-xs font-medium text-white"
                style={{ backgroundColor: color }}
              >
                {collaborator.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {showStatus && (
              <span 
                className={cn(
                  "absolute bottom-0 right-0 rounded-full border-2 border-background",
                  statusSizes[size],
                  getStatusColor(collaborator.status)
                )}
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{collaborator.userName}</p>
            {collaborator.email && (
              <p className="text-xs text-muted-foreground">{collaborator.email}</p>
            )}
            <div className="flex items-center gap-2 text-xs">
              {getRoleIcon(collaborator.role)}
              <span className="capitalize">{collaborator.role}</span>
              <span className="text-muted-foreground">•</span>
              <span className="capitalize">{collaborator.status}</span>
            </div>
            {collaborator.activeElement && (
              <p className="text-xs text-muted-foreground">
                Editing: {collaborator.activeElement}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PresenceIndicators({
  collaborators,
  isConnected,
  currentUserId,
  maxVisible = 4,
  onViewCollaborator,
  className,
}: PresenceIndicatorsProps) {
  const [showAll, setShowAll] = useState(false);
  
  const onlineCollaborators = collaborators.filter(c => 
    c.userId !== currentUserId && c.status !== 'offline'
  );
  
  const visibleCollaborators = onlineCollaborators.slice(0, maxVisible);
  const hiddenCount = onlineCollaborators.length - maxVisible;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Connection Status */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
              isConnected 
                ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                : "bg-destructive/10 text-destructive"
            )}>
              {isConnected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isConnected 
              ? 'Real-time sync active' 
              : 'Connection lost. Changes will sync when reconnected.'
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Collaborator Avatars */}
      {onlineCollaborators.length > 0 && (
        <div className="flex items-center">
          <AnimatePresence mode="popLayout">
            <div className="flex -space-x-2">
              {visibleCollaborators.map((collaborator, index) => (
                <motion.div
                  key={collaborator.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ zIndex: visibleCollaborators.length - index }}
                >
                  <CollaboratorAvatar
                    collaborator={collaborator}
                    onClick={() => onViewCollaborator?.(collaborator.userId)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* Overflow Indicator */}
          {hiddenCount > 0 && (
            <Popover open={showAll} onOpenChange={setShowAll}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 ml-1 bg-muted hover:bg-muted/80"
                >
                  <span className="text-xs font-medium">+{hiddenCount}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <div className="p-3 border-b">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {onlineCollaborators.length} collaborator{onlineCollaborators.length > 1 ? 's' : ''} online
                    </span>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                  {onlineCollaborators.map((collaborator) => (
                    <button
                      key={collaborator.userId}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      onClick={() => {
                        onViewCollaborator?.(collaborator.userId);
                        setShowAll(false);
                      }}
                    >
                      <CollaboratorAvatar collaborator={collaborator} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {collaborator.userName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(collaborator.lastActivity), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {collaborator.role}
                      </Badge>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}

      {/* Empty State */}
      {onlineCollaborators.length === 0 && isConnected && (
        <span className="text-xs text-muted-foreground">
          Only you
        </span>
      )}
    </div>
  );
}

export default PresenceIndicators;
