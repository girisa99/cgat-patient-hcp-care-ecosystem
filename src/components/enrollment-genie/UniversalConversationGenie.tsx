/**
 * UNIVERSAL CONVERSATION GENIE
 * Global floating genie available across the entire application
 * Supports multi-user/multi-tenant conversations for any page context
 */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles } from 'lucide-react';
import { GenieConversationInterface } from './GenieConversationInterface';
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
      icon: <Bot className="h-4 w-4" />,
      color: 'from-blue-600 to-cyan-600'
    },
    'treatment-center': {
      title: 'Facility Assistant',
      description: 'Assistance with treatment center setup, licensing, and facility management',
      icon: <Bot className="h-4 w-4" />,
      color: 'from-green-600 to-emerald-600'
    },
    customer: {
      title: 'Customer Support',
      description: 'Help with account management, billing, and customer services',
      icon: <Bot className="h-4 w-4" />,
      color: 'from-purple-600 to-pink-600'
    },
    manufacturer: {
      title: 'Manufacturing Assistant',
      description: 'Support for product registration, compliance, and manufacturing processes',
      icon: <Bot className="h-4 w-4" />,
      color: 'from-orange-600 to-red-600'
    },
    onboarding: {
      title: 'Onboarding Guide',
      description: 'Step-by-step assistance for new user onboarding and setup',
      icon: <Bot className="h-4 w-4" />,
      color: 'from-indigo-600 to-purple-600'
    },
    enrollment: {
      title: 'Enrollment Assistant',
      description: 'Smart guidance through enrollment processes and form completion',
      icon: <Bot className="h-4 w-4" />,
      color: 'from-teal-600 to-blue-600'
    },
    general: {
      title: 'AI Assistant',
      description: 'Get help with any questions or tasks across the platform',
      icon: <Bot className="h-4 w-4" />,
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
  const [position, setPosition] = useState({ bottom: 24, right: 24 }); // Dynamic positioning

  const currentContext = getPageContext(location.pathname);
  const contextInfo = getContextInfo(currentContext);

  // Smart positioning to avoid content overlap
  useEffect(() => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem('genie_position') || 'null'); } catch { return null; } })();
    if (saved && typeof saved.bottom === 'number' && typeof saved.right === 'number') {
      setPosition(saved);
    }

    const checkForOverlap = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Check for overlapping content elements
      const bottomElements = document.querySelectorAll('[data-bottom-content="true"], footer, .bottom-navigation, .footer');
      const rightElements = document.querySelectorAll('[data-right-content="true"], .sidebar-right, .right-panel');
      
      let newBottom = 24;
      let newRight = 24;
      
      // Adjust for bottom elements
      bottomElements.forEach(el => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        if (rect.top < viewportHeight && rect.bottom > viewportHeight * 0.8) {
          newBottom = Math.max(newBottom, viewportHeight - rect.top + 16);
        }
      });
      
      // Adjust for right elements
      rightElements.forEach(el => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        if (rect.left < viewportWidth && rect.right > viewportWidth * 0.8) {
          newRight = Math.max(newRight, viewportWidth - rect.left + 16);
        }
      });
      
      // Ensure Genie stays within viewport bounds
      newBottom = Math.min(newBottom, viewportHeight - 100);
      newRight = Math.min(newRight, viewportWidth - 100);
      
      setPosition({ bottom: newBottom, right: newRight });
    };
    
    checkForOverlap();
    window.addEventListener('resize', checkForOverlap);
    window.addEventListener('scroll', checkForOverlap);
    
    return () => {
      window.removeEventListener('resize', checkForOverlap);
      window.removeEventListener('scroll', checkForOverlap);
    };
  }, [location.pathname]); // Re-check when route changes

  const handleComplete = (data: any) => {
    setIsOpen(false);
    onConversationComplete?.(data);
  };

  return (
    <>
      {/* Floating Genie Button with Smart Positioning */}
      <motion.div
        className={`fixed z-[102] ${className}`}
        style={{ bottom: `${position.bottom}px`, right: `${position.right}px` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={(e, info) => {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const newRight = Math.max(12, Math.min(viewportWidth - info.point.x - 40, viewportWidth - 100));
          const newBottom = Math.max(12, Math.min(viewportHeight - info.point.y - 40, viewportHeight - 100));
          setPosition({ bottom: newBottom, right: newRight });
          try { localStorage.setItem('genie_position', JSON.stringify({ bottom: newBottom, right: newRight })); } catch {}
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative"
        >
          {/* Magical fumes/smoke effect */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-gradient-to-t from-cyan-400/30 to-transparent rounded-full"
                    style={{
                      left: `${20 + i * 8}%`,
                      bottom: '100%',
                    }}
                    initial={{ opacity: 0, y: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 0.7, 0], 
                      y: [-10, -40, -60], 
                      scale: [0.5, 1, 1.5],
                      x: [0, Math.random() * 20 - 10, Math.random() * 30 - 15]
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-20 w-20 rounded-full p-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-700 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 relative overflow-hidden group border-2 border-cyan-300/30"
          >
            {/* Genie Logo */}
            <div className="relative w-full h-full">
              <img 
                src="/lovable-uploads/f995d61d-e4c0-44c3-bdcb-8ff8e2c93448.png" 
                alt="Genie" 
                className="w-full h-full object-cover rounded-full"
              />
              
              {/* Magical overlay glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 border-2 border-cyan-400/50 rounded-full"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            {/* Sparkles effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            >
              <Sparkles className="absolute top-1 right-1 h-3 w-3 text-yellow-300 animate-pulse" />
              <Sparkles className="absolute bottom-2 left-2 h-2 w-2 text-pink-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Sparkles className="absolute top-3 left-1 h-2 w-2 text-blue-300 animate-pulse" style={{ animationDelay: '1s' }} />
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

      {/* Genie Conversation Interface */}
      <GenieConversationInterface
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tenantId={tenantId}
        userId={userId}
      />
    </>
  );
};