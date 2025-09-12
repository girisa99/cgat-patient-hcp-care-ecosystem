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

interface ConversationMessageProps {
  message: MessageType;
  isLast?: boolean;
}

export const ConversationMessage: React.FC<ConversationMessageProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  const isError = message.error;
  
  // Format the message content with proper line breaks and structure
  const formatContent = (content: string) => {
    // Split by double line breaks for paragraphs
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a list (starts with -, *, or 1.)
      if (paragraph.includes('\n-') || paragraph.includes('\n*') || paragraph.includes('\n1.')) {
        const lines = paragraph.split('\n');
        const title = lines[0];
        const listItems = lines.slice(1).filter(line => line.trim());
        
        return (
          <div key={index} className="mb-4">
            {title && <p className="font-medium mb-2">{title}</p>}
            <ul className="space-y-1 ml-4">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm">
                  {item.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="mb-3 last:mb-0 text-sm leading-relaxed">
          {paragraph}
        </p>
      );
    });
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
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        {/* Message Bubble */}
        <Card className={`${
          isUser 
            ? 'bg-blue-500 text-white border-blue-500' 
            : isError 
              ? 'bg-red-50 border-red-200' 
              : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <CardContent className="p-4">
            {/* Content */}
            <div className={`${isUser ? 'text-white' : isError ? 'text-red-800' : 'text-gray-800'}`}>
              {formatContent(message.content)}
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
                
                {/* Timestamp */}
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
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