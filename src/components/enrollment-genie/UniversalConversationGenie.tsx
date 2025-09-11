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
import { Bot, Sparkles, X, MessageCircle, Users, Building2, FileText, Settings, HelpCircle } from 'lucide-react';
import { EnhancedEnrollmentInterface } from '@/components/patient-enrollment/EnhancedEnrollmentInterface';
import { UniversalLLMAssistant } from '@/components/intelligent-assistant/UniversalLLMAssistant';
import { motion, AnimatePresence } from 'framer-motion';

interface UniversalConversationGenieProps {
  className?: string;
  onConversationComplete?: (data: any) => void;
  tenantId?: string;
  userId?: string;
}

// Context detection based on current route
const getPageContext = (pathname: string) => {
  if (pathname.includes('/patient')) return 'patient';
  if (pathname.includes('/treatment-center') || pathname.includes('/facilities')) return 'treatment-center';
  if (pathname.includes('/customer')) return 'customer';
  if (pathname.includes('/manufacturer') || pathname.includes('/order-management')) return 'manufacturer';
  if (pathname.includes('/onboarding')) return 'onboarding';
  if (pathname.includes('/enrollment')) return 'enrollment';
  return 'general';
};

const getContextInfo = (context: string) => {
  const contextConfig = {
    patient: {
      title: 'Patient Assistant',
      description: 'Get help with patient enrollment, medical forms, and healthcare processes',
      icon: <Users className="h-4 w-4" />,
      color: 'from-blue-600 to-cyan-600'
    },
    'treatment-center': {
      title: 'Facility Assistant',
      description: 'Assistance with treatment center setup, licensing, and facility management',
      icon: <Building2 className="h-4 w-4" />,
      color: 'from-green-600 to-emerald-600'
    },
    customer: {
      title: 'Customer Support',
      description: 'Help with account management, billing, and customer services',
      icon: <MessageCircle className="h-4 w-4" />,
      color: 'from-purple-600 to-pink-600'
    },
    manufacturer: {
      title: 'Manufacturing Assistant',
      description: 'Support for product registration, compliance, and manufacturing processes',
      icon: <Settings className="h-4 w-4" />,
      color: 'from-orange-600 to-red-600'
    },
    onboarding: {
      title: 'Onboarding Guide',
      description: 'Step-by-step assistance for new user onboarding and setup',
      icon: <FileText className="h-4 w-4" />,
      color: 'from-indigo-600 to-purple-600'
    },
    enrollment: {
      title: 'Enrollment Assistant',
      description: 'Smart guidance through enrollment processes and form completion',
      icon: <FileText className="h-4 w-4" />,
      color: 'from-teal-600 to-blue-600'
    },
    general: {
      title: 'AI Assistant',
      description: 'Get help with any questions or tasks across the platform',
      icon: <HelpCircle className="h-4 w-4" />,
      color: 'from-gray-600 to-slate-600'
    }
  };
  
  return contextConfig[context as keyof typeof contextConfig] || contextConfig.general;
};

export const UniversalConversationGenie: React.FC<UniversalConversationGenieProps> = ({
  className = '',
  onConversationComplete,
  tenantId,
  userId
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [conversationMode, setConversationMode] = useState<'enrollment' | 'general'>('general');

  const currentContext = getPageContext(location.pathname);
  const contextInfo = getContextInfo(currentContext);

  const handleComplete = (data: any) => {
    setIsOpen(false);
    onConversationComplete?.(data);
  };

  const isEnrollmentContext = ['patient', 'onboarding', 'enrollment'].includes(currentContext);

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
            className={`h-16 w-16 rounded-full bg-gradient-to-r ${contextInfo.color} hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
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

            {/* Context indicator */}
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-md">
              {contextInfo.icon}
            </div>
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
              <div className="bg-popover border rounded-lg p-3 shadow-lg max-w-64">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{contextInfo.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {contextInfo.description}
                </p>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {tenantId ? 'Multi-tenant' : 'Single'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Click to start
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Universal Conversation Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden">
          <div className={`flex items-center justify-between p-6 border-b bg-gradient-to-r ${contextInfo.color.replace('to-', 'to-').replace('from-', 'from-').replace('-600', '-50')}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-r ${contextInfo.color} rounded-lg`}>
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{contextInfo.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {contextInfo.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode Toggle for enrollment contexts */}
              {isEnrollmentContext && (
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant={conversationMode === 'enrollment' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setConversationMode('enrollment')}
                    className="h-8 px-3"
                  >
                    Enrollment
                  </Button>
                  <Button
                    variant={conversationMode === 'general' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setConversationMode('general')}
                    className="h-8 px-3"
                  >
                    General
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversationMode === 'enrollment' && isEnrollmentContext ? (
              <EnhancedEnrollmentInterface
                onSubmit={handleComplete}
              />
            ) : (
              <UniversalLLMAssistant
                context={{
                  page: currentContext,
                  route: location.pathname,
                  tenantId,
                  userId
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};