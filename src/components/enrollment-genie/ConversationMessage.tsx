/**
 * CONVERSATION MESSAGE COMPONENT
 * Enhanced message display with proper formatting, Genie branding, and conversational UI
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, User, Database, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConversationMessage as MessageType } from '@/hooks/useConversationState';
import { RichMediaRenderer } from './RichMediaRenderer';
import { universalMediaService } from '@/services/universalMediaService';
import { ContentDownloader } from '@/components/genie/ContentDownloader';

interface ConversationMessageProps {
  message: MessageType;
  isLast?: boolean;
}

export const ConversationMessage: React.FC<ConversationMessageProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  const isError = message.error;
  
  // Detect if message contains downloadable content
  const hasTable = message.content.includes('<table') || /\|.*\|/.test(message.content);
  const hasHTML = message.content.includes('<') && message.content.includes('>');
  const hasStructuredContent = hasTable || hasHTML || message.content.length > 500;

  const getContentType = () => {
    if (hasTable) return 'table';
    if (hasHTML) return 'html';
    if (message.content.includes('```')) return 'code';
    return 'text';
  };
  
  const handleGenerateImage = async (prompt: string): Promise<string> => {
    try {
      const response = await universalMediaService.generateImageSmart(prompt);
      if (response.success && response.mediaUrl) {
        return response.mediaUrl;
      }
      throw new Error(response.error || 'Failed to generate image');
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  };

  const handleGenerateVideo = async (prompt: string): Promise<string> => {
    try {
      const response = await universalMediaService.generateVideo({ prompt });
      if (response.success && response.mediaUrl) {
        return response.mediaUrl;
      }
      throw new Error(response.error || 'Failed to generate video');
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-0.5">
            <img 
              src="/lovable-uploads/f995d61d-e4c0-44c3-bdcb-8ff8e2c93448.png" 
              alt="Genie" 
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
        {/* Message Bubble */}
        <Card className={`${
          isUser 
            ? 'bg-primary text-primary-foreground border-primary/20 shadow-md' 
            : isError 
              ? 'bg-destructive/10 border-destructive/20 text-destructive' 
              : 'bg-card border-border shadow-sm hover:shadow-md transition-shadow'
        }`}>
          <CardContent className="p-4">
            {/* Content with Rich Media Support */}
            <div className={`${isUser ? 'text-primary-foreground' : isError ? 'text-destructive' : 'text-foreground'}`}>
              {isUser ? (
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                  {/* Add contextual user prompt enhancement */}
                  <div className="flex items-center gap-1 text-xs opacity-80">
                    <span>•</span>
                    <span>Sent to Genie AI</span>
                  </div>
                </div>
              ) : (
                <div className="max-w-none overflow-visible">
                  <RichMediaRenderer
                    content={message.content}
                    metadata={message.metadata}
                    onGenerateImage={handleGenerateImage}
                    onGenerateVideo={handleGenerateVideo}
                    enableVisualSearch={true}
                  />
                </div>
              )}
            </div>

            {/* Metadata */}
            {!isUser && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {message.provider && message.model && (
                    <Badge variant="secondary" className="text-xs">
                      {message.provider.toUpperCase()} • {message.model}
                    </Badge>
                  )}
                  {message.metadata?.ragEnhanced && (
                    <Badge variant="outline" className="text-xs">
                      <Database className="h-2 w-2 mr-1" />
                      RAG Enhanced
                    </Badge>
                  )}
                  {isError && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-2 w-2 mr-1" />
                      Error
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Download button for AI responses with structured content */}
                  {hasStructuredContent && (
                    <ContentDownloader
                      content={message.content}
                      contentType={getContentType()}
                      filename={`genie-response-${Date.now()}`}
                    />
                  )}
                  
                  {/* Timestamp */}
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User message timestamp */}
        {isUser && (
          <div className="text-xs text-gray-500 mt-1 mr-2">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </motion.div>
  );
};