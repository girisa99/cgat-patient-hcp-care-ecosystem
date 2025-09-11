/**
 * UNIVERSAL CONVERSATION GENIE
 * Global floating genie available across the entire application
 * Supports multi-user/multi-tenant conversations for any page context
 */
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, X, MessageCircle, Users, Building2 } from 'lucide-react';
import { EnhancedEnrollmentInterface } from '@/components/patient-enrollment/EnhancedEnrollmentInterface';
import { motion, AnimatePresence } from 'framer-motion';

interface UniversalConversationGenieProps {
  className?: string;
  onConversationComplete?: (data: any) => void;
  tenantId?: string;
  userId?: string;
}

export const EnrollmentGenie: React.FC<UniversalConversationGenieProps> = ({
  className = '',
  onConversationComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleComplete = (data: any) => {
    setIsOpen(false);
    onConversationComplete?.(data);
  };

  return (
    <>
      {/* Floating Genie Button */}
      <motion.div
        className={`fixed bottom-6 right-6 z-50 ${className}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
          >
            <motion.div
              animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Bot className="h-8 w-8 text-white" />
            </motion.div>
            
            {/* Magical sparkles effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            >
              <Sparkles className="absolute top-1 right-1 h-3 w-3 text-yellow-300" />
              <Sparkles className="absolute bottom-2 left-2 h-2 w-2 text-pink-300" />
              <Sparkles className="absolute top-3 left-1 h-2 w-2 text-blue-300" />
            </motion.div>
          </Button>
        </motion.div>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.8 }}
              className="absolute right-20 top-1/2 -translate-y-1/2"
            >
              <div className="bg-popover border rounded-lg p-3 shadow-lg max-w-48">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">AI Enrollment Genie</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Let AI guide you through patient enrollment with smart questions
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  Click to start
                </Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Genie Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">AI Enrollment Genie</h2>
                <p className="text-sm text-muted-foreground">
                  Your intelligent assistant for patient enrollment
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <EnhancedEnrollmentInterface
              onSubmit={handleComplete}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};