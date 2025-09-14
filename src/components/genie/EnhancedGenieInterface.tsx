/**
 * ENHANCED GENIE WITH PHASE 3 FEATURES
 * Comprehensive integration of Feature Integration Engine, Enhanced AI Service,
 * and Advanced Session Management capabilities
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Bot,
  Settings2,
  History,
  Activity,
  Brain,
  Zap,
  MessageSquare,
  BarChart3,
  Shield,
  Cpu,
  Network
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEnhancedGenieConversation } from '@/hooks/useEnhancedGenieConversation';
import { GenieConfigurationDashboard } from './GenieConfigurationDashboard';
import { GenieSessionManager } from './GenieSessionManager';
import { GenieProviderStatusPanel } from './GenieProviderStatusPanel';

interface EnhancedGenieInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
  mode?: 'system' | 'single' | 'multi';
}

export const EnhancedGenieInterface: React.FC<EnhancedGenieInterfaceProps> = ({
  isOpen,
  onClose,
  context = 'general',
  mode = 'single'
}) => {
  const [activeTab, setActiveTab] = useState('conversation');
  const [showConfigDashboard, setShowConfigDashboard] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [message, setMessage] = useState('');

  const {
    conversation,
    isLoading,
    error,
    providerStatus,
    sendMessage,
    updateConfiguration,
    resetConversation,
    clearError,
    testProvider,
    processingTime
  } = useEnhancedGenieConversation();

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = message;
    setMessage('');
    await sendMessage(userMessage);
  };

  const handleProviderSelect = (providerId: string) => {
    // Update conversation to use selected provider
    const provider = providerStatus.find(p => p.id === providerId);
    if (provider?.available) {
      updateConfiguration({
        selectedModels: [provider.models[0]]
      });
    }
  };

  const healthyProviders = providerStatus.filter(p => p.available).length;
  const totalProviders = providerStatus.length;

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        className="fixed top-0 right-0 h-full w-[600px] z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l rounded-l-lg shadow-xl flex flex-col"
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  GENIE Enhanced
                </h3>
                <p className="text-xs text-muted-foreground">Advanced AI Assistant v3.0</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <Cpu className="h-2 w-2 mr-1" />
                    {conversation.mode}
                  </Badge>
                  <Badge variant={healthyProviders > 0 ? "default" : "destructive"} className="text-xs">
                    <Network className="h-2 w-2 mr-1" />
                    {healthyProviders}/{totalProviders}
                  </Badge>
                  {conversation.processingMetadata?.confidence && (
                    <Badge variant="outline" className="text-xs">
                      <BarChart3 className="h-2 w-2 mr-1" />
                      {Math.round(conversation.processingMetadata.confidence * 100)}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfigDashboard(true)}
              >
                <Settings2 className="h-4 w-4 mr-1" />
                Config
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSessionManager(true)}
              >
                <History className="h-4 w-4 mr-1" />
                Sessions
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>

          {/* Enhanced Feature Status Bar */}
          {(conversation.enabledFeatures.length > 0 || conversation.processingMetadata) && (
            <div className="p-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {conversation.enabledFeatures.map(feature => (
                    <Badge key={feature} variant="secondary" className="text-xs h-5">
                      {feature}
                    </Badge>
                  ))}
                </div>
                
                {conversation.processingMetadata && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {conversation.processingMetadata.lastProcessingTime > 0 && (
                      <span>⚡ {conversation.processingMetadata.lastProcessingTime}ms</span>
                    )}
                    {conversation.processingMetadata.contextSources.length > 0 && (
                      <span>📚 {conversation.processingMetadata.contextSources.length} sources</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-3">
              <TabsTrigger value="conversation">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="status">
                <Activity className="h-4 w-4 mr-2" />
                Status
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Conversation Tab */}
            <TabsContent value="conversation" className="flex-1 flex flex-col p-4">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {conversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.provider && (
                        <p className="text-xs opacity-60 mt-1">
                          via {msg.provider} • {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin">🤖</div>
                        <span className="text-sm">Processing with enhanced features...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearError}
                      className="ml-2 h-auto p-0 text-red-600"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Message GENIE Enhanced..."
                    className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={isLoading || !message.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Status Tab */}
            <TabsContent value="status" className="flex-1 p-4">
              <GenieProviderStatusPanel
                onProviderSelect={handleProviderSelect}
                compact={true}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="flex-1 p-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Session Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Messages</p>
                        <p className="font-medium">{conversation.messages.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Features Used</p>
                        <p className="font-medium">{conversation.enabledFeatures.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-medium">
                          {conversation.processingMetadata?.confidence 
                            ? `${Math.round(conversation.processingMetadata.confidence * 100)}%`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Response</p>
                        <p className="font-medium">
                          {processingTime > 0 ? `${processingTime}ms` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {conversation.processingMetadata?.contextSources.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Context Sources</p>
                        <div className="flex gap-1 flex-wrap">
                          {conversation.processingMetadata.contextSources.map((source, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Configuration Dashboard */}
      <GenieConfigurationDashboard
        isOpen={showConfigDashboard}
        onClose={() => setShowConfigDashboard(false)}
        onConfigurationSelect={(config) => {
          updateConfiguration({
            selectedModels: config.selected_models,
            enabledFeatures: config.enabled_features,
            selectedMCPTools: config.selected_mcp_tools,
            medicalContext: config.medical_context,
            knowledgeBase: config.knowledge_base
          });
          setShowConfigDashboard(false);
        }}
      />

      {/* Session Manager */}
      <GenieSessionManager
        isOpen={showSessionManager}
        onClose={() => setShowSessionManager(false)}
        onSessionSelect={(session) => {
          // Load session would be implemented here
          setShowSessionManager(false);
        }}
        currentSessionId={conversation.id}
      />
    </>
  );
};