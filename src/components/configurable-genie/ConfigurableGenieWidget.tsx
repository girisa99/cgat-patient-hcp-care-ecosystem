/**
 * CONFIGURABLE GENIE WIDGET
 * Dynamic Genie widget that adapts to brand configuration
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Settings,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useConfigurableGenie } from '@/hooks/useConfigurableGenie';
import { EnhancedGenieInterface } from '@/components/enrollment-genie/EnhancedGenieInterface';

interface ConfigurableGenieWidgetProps {
  configId?: string;
  embedKey?: string;
  brandName?: string;
  businessUnit?: string;
  domain?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  embedType?: 'popup' | 'inline' | 'fullscreen' | 'sidebar';
  className?: string;
}

export const ConfigurableGenieWidget: React.FC<ConfigurableGenieWidgetProps> = ({
  configId,
  embedKey,
  brandName,
  businessUnit,
  domain,
  position = 'bottom-right',
  embedType = 'popup',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const {
    activeConfig,
    isConfigured,
    isLoading,
    systemPrompt,
    modelConfig,
    processMessage,
    logConversation,
    theme,
    deployment,
    welcomeMessage,
    conversationContext
  } = useConfigurableGenie({
    configId,
    embedKey,
    brandName,
    businessUnit
  });

  // Apply theme styles
  useEffect(() => {
    if (theme && isConfigured) {
      const widgetElement = document.querySelector(`[data-genie-widget="${sessionId}"]`);
      if (widgetElement) {
        const element = widgetElement as HTMLElement;
        element.style.setProperty('--genie-primary', theme.primaryColor);
        element.style.setProperty('--genie-secondary', theme.secondaryColor);
        element.style.setProperty('--genie-accent', theme.accentColor);
        element.style.setProperty('--genie-background', theme.backgroundColor);
        element.style.setProperty('--genie-text', theme.textColor);
        element.style.setProperty('--genie-font-family', theme.fontFamily);
      }
    }
  }, [theme, isConfigured, sessionId]);

  // Position styles
  const getPositionStyles = () => {
    const baseStyles = "fixed z-50";
    
    switch (position) {
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'center':
        return `${baseStyles} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      default:
        return `${baseStyles} bottom-4 right-4`;
    }
  };

  // Size styles based on embed type
  const getSizeStyles = () => {
    switch (embedType) {
      case 'fullscreen':
        return 'w-screen h-screen';
      case 'sidebar':
        return 'w-96 h-full right-0 top-0 bottom-0';
      case 'inline':
        return 'w-full h-96 relative';
      case 'popup':
      default:
        return 'w-96 h-[500px]';
    }
  };

  if (isLoading || !isConfigured || !activeConfig) {
    return (
      <div className={`${getPositionStyles()} ${className}`}>
        <div className="w-14 h-14 bg-primary rounded-full animate-pulse" />
      </div>
    );
  }

  // Trigger button for popup mode
  const TriggerButton = () => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 rounded-full shadow-lg genie-primary text-white hover:shadow-xl transition-all duration-200"
        style={{
          backgroundColor: theme?.primaryColor,
          borderColor: theme?.accentColor
        }}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </motion.div>
  );

  // Widget content
  const WidgetContent = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.2 }}
      className={`genie-branded bg-card border shadow-2xl rounded-lg overflow-hidden ${getSizeStyles()}`}
      style={{
        backgroundColor: theme?.backgroundColor,
        borderColor: theme?.accentColor,
        color: theme?.textColor,
        fontFamily: theme?.fontFamily
      }}
    >
      {/* Header */}
      {embedType === 'popup' && (
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: theme?.accentColor }}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {theme?.logoUrl ? (
                <AvatarImage src={theme.logoUrl} alt={theme.brandingText} />
              ) : (
                <AvatarFallback 
                  className="text-white text-sm font-bold"
                  style={{ backgroundColor: theme?.primaryColor }}
                >
                  🧞
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: theme?.textColor }}>
                {theme?.brandingText || 'GENIE AI'}
              </h3>
              {businessUnit && (
                <p className="text-xs opacity-75">{businessUnit}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
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
      )}

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 h-full">
          <EnhancedGenieInterface
            isOpen={true}
            onClose={() => setIsOpen(false)}
            mode={modelConfig?.defaultMode || 'single'}
            selectedModels={(modelConfig?.defaultModels || []).map(m => ({
              ...m,
              name: `${m.provider}/${m.model}`,
              role: 'primary' as const,
              weight: 1,
              category: m.category as 'llm' | 'mcp' | 'small' | 'vision'
            }))}
            userId={deployment?.requireAuth ? 'configured-user' : undefined}
          />
        </div>
      )}

      {/* Branding footer */}
      {deployment?.enableAnalytics && (
        <div 
          className="px-3 py-2 text-xs opacity-50 text-center border-t"
          style={{ borderColor: theme?.accentColor }}
        >
          Powered by {theme?.brandingText || 'GENIE AI'}
        </div>
      )}
    </motion.div>
  );

  // Inline mode - embed directly
  if (embedType === 'inline') {
    return (
      <div 
        className={`genie-widget-inline ${className}`}
        data-genie-widget={sessionId}
      >
        <WidgetContent />
      </div>
    );
  }

  // Popup mode
  return (
    <div 
      className={`genie-widget ${getPositionStyles()} ${className}`}
      data-genie-widget={sessionId}
    >
      {!isOpen ? (
        <TriggerButton />
      ) : (
        <AnimatePresence>
          <WidgetContent />
        </AnimatePresence>
      )}
    </div>
  );
};