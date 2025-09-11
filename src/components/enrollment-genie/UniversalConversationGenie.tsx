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
import { UniversalLLMAssistant } from '@/components/intelligent-assistant/UniversalLLMAssistant';
import { StructuredEnrollmentForm } from './StructuredEnrollmentForm';
import { ComprehensiveEnrollmentForm } from './ComprehensiveEnrollmentForm';
import { motion, AnimatePresence } from 'framer-motion';

interface UniversalConversationGenieProps {
  className?: string;
  onConversationComplete?: (data: any) => void;
  tenantId?: string;
  userId?: string;
}

type EnrollmentOption = 'natural_conversation' | 'auto_fill_forms' | 'audit_trails';
type LLMProvider = 'openai' | 'anthropic' | 'google';
type ConversationStyle = 'structured_form' | 'natural_conversation';

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
  const [enrollmentOption, setEnrollmentOption] = useState<EnrollmentOption>('natural_conversation');
  const [llmProvider, setLlmProvider] = useState<LLMProvider>('openai');
  const [conversationStyle, setConversationStyle] = useState<ConversationStyle>('natural_conversation');

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

      {/* Universal Conversation Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30">
          {/* Header with Genie Branding */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-sm relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-300 rounded-full"
                  style={{
                    left: `${10 + i * 12}%`,
                    top: `${20 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [-5, 5, -5],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              {/* Genie Avatar */}
              <motion.div 
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 shadow-lg">
                  <img 
                    src="/lovable-uploads/f995d61d-e4c0-44c3-bdcb-8ff8e2c93448.png" 
                    alt="Genie" 
                    className="w-full h-full object-cover rounded-full border-2 border-white/50"
                  />
                </div>
                
                {/* Magical aura */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-cyan-300/50"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity 
                  }}
                />
              </motion.div>
              
              <div>
                <motion.h2 
                  className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  ✨ I am Genie
                </motion.h2>
                <motion.p 
                  className="text-lg text-slate-600 font-medium"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  How can I help you? 🪄
                </motion.p>
                <motion.p 
                  className="text-sm text-slate-500"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  {contextInfo.description}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              {/* Mode Toggle for enrollment contexts */}
              {isEnrollmentContext && (
                <motion.div 
                  className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-cyan-200/50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    variant={conversationMode === 'enrollment' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setConversationMode('enrollment')}
                    className={`h-8 px-3 ${conversationMode === 'enrollment' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : ''}`}
                  >
                    📋 Enrollment
                  </Button>
                  <Button
                    variant={conversationMode === 'general' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setConversationMode('general')}
                    className={`h-8 px-3 ${conversationMode === 'general' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : ''}`}
                  >
                    💬 General
                  </Button>
                </motion.div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Configuration Panel for Enrollment Mode */}
          {conversationMode === 'enrollment' && isEnrollmentContext && (
            <div className="border-b bg-gradient-to-r from-teal-50/50 to-cyan-50/50 p-4">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Enrollment Options */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">Method:</span>
                  <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                    <Button
                      variant={enrollmentOption === 'natural_conversation' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setEnrollmentOption('natural_conversation')}
                      className="h-7 px-2 text-xs"
                    >
                      🗣️ Natural Conversation
                    </Button>
                    <Button
                      variant={enrollmentOption === 'auto_fill_forms' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setEnrollmentOption('auto_fill_forms')}
                      className="h-7 px-2 text-xs"
                    >
                      📝 Auto Fill Forms
                    </Button>
                    <Button
                      variant={enrollmentOption === 'audit_trails' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setEnrollmentOption('audit_trails')}
                      className="h-7 px-2 text-xs"
                    >
                      🔍 Audit Trails
                    </Button>
                  </div>
                </div>

                {/* Conversation Settings - Only show for natural conversation */}
                {enrollmentOption === 'natural_conversation' && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">LLM Provider:</span>
                      <select 
                        value={llmProvider} 
                        onChange={(e) => setLlmProvider(e.target.value as LLMProvider)}
                        className="text-xs px-2 py-1 border rounded bg-white"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">Mode:</span>
                      <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                        <Button
                          variant={conversationStyle === 'structured_form' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setConversationStyle('structured_form')}
                          className="h-7 px-2 text-xs"
                        >
                          📋 Structured Form
                        </Button>
                        <Button
                          variant={conversationStyle === 'natural_conversation' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setConversationStyle('natural_conversation')}
                          className="h-7 px-2 text-xs"
                        >
                          💬 Natural Chat
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Info text about structured form */}
              {conversationStyle === 'structured_form' && enrollmentOption === 'natural_conversation' && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Structured Form:</strong> Step-by-step questionnaire format with guided questions and validation. Perfect for systematic data collection.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Conversation Area with Genie Theming */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent via-cyan-50/20 to-blue-50/30 relative">
            {/* Floating magical elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-300/40 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    x: [-5, 5, -5],
                    opacity: [0.2, 0.6, 0.2],
                    scale: [0.5, 1.5, 0.5]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            {conversationMode === 'enrollment' && isEnrollmentContext ? (
              <div className="relative z-10 p-6">
                {enrollmentOption === 'natural_conversation' && (
                  <div className="space-y-4">
                    {conversationStyle === 'structured_form' ? (
                      <ComprehensiveEnrollmentForm
                        sessionId={`enrollment_${Date.now()}`}
                        userId={userId}
                        tenantId={tenantId}
                        onSectionComplete={(sectionId, data) => {
                          console.log('🎯 Section completed:', sectionId, data);
                        }}
                        onFormComplete={(formData) => {
                          console.log('🎉 Form completed:', formData);
                          handleComplete(formData);
                        }}
                      />
                    ) : (
                      <>
                        <div className="text-center p-4 bg-white/60 rounded-lg border border-cyan-200">
                          <h3 className="font-semibold text-slate-700 mb-2">
                            💬 Natural Conversation Enrollment
                          </h3>
                          <p className="text-sm text-slate-600">
                            Let's have a natural conversation to complete your enrollment.
                          </p>
                          <div className="mt-2 text-xs text-slate-500">
                            Provider: {llmProvider.toUpperCase()} • Backend: Connected ✅
                          </div>
                        </div>
                        <UniversalLLMAssistant
                          context={{
                            page: currentContext,
                            route: location.pathname,
                            tenantId,
                            userId,
                            enrollmentMode: conversationStyle,
                            llmProvider
                          }}
                        />
                      </>
                    )}
                  </div>
                )}
                {enrollmentOption === 'auto_fill_forms' && (
                  <div className="text-center p-8">
                    <div className="p-6 bg-white/60 rounded-lg border border-cyan-200">
                      <h3 className="font-semibold text-slate-700 mb-2">📝 Auto Fill Forms</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Upload documents or provide information, and I'll automatically fill out the enrollment forms for you.
                      </p>
                      <Button className="bg-gradient-to-r from-teal-500 to-cyan-500">
                        Upload Documents
                      </Button>
                    </div>
                  </div>
                )}
                {enrollmentOption === 'audit_trails' && (
                  <div className="text-center p-8">
                    <div className="p-6 bg-white/60 rounded-lg border border-cyan-200">
                      <h3 className="font-semibold text-slate-700 mb-2">🔍 Audit Trails</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        View detailed logs and track all enrollment activities and changes.
                      </p>
                      <Button className="bg-gradient-to-r from-teal-500 to-cyan-500">
                        View Audit Logs
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative z-10">
                <UniversalLLMAssistant
                  context={{
                    page: currentContext,
                    route: location.pathname,
                    tenantId,
                    userId
                  }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};