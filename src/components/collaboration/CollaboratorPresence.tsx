import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface Collaborator {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  cursor_position?: { x: number; y: number };
  active_component?: string;
  last_activity: string;
}

interface CollaboratorPresenceProps {
  collaborators: Collaborator[];
  isConnected: boolean;
}

export const CollaboratorPresence: React.FC<CollaboratorPresenceProps> = ({
  collaborators,
  isConnected
}) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-muted-foreground">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {collaborators.length > 0 && (
        <>
          <div className="w-px h-4 bg-border mx-2" />
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-2">
              {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
            </span>
            <TooltipProvider>
              <AnimatePresence>
                {collaborators.map((collaborator) => (
                  <motion.div
                    key={collaborator.user_id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative"
                  >
                    <Tooltip>
                      <TooltipTrigger>
                        <Avatar className="w-6 h-6 border-2 border-background">
                          <AvatarImage src={collaborator.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {collaborator.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-medium">{collaborator.user_name}</p>
                          {collaborator.active_component && (
                            <p className="text-xs text-muted-foreground">
                              Working on: {collaborator.active_component}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Last seen: {new Date(collaborator.last_activity).toLocaleTimeString()}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
              </AnimatePresence>
            </TooltipProvider>
          </div>
        </>
      )}
    </div>
  );
};