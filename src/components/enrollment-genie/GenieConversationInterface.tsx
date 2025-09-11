/**
 * GENIE CONVERSATION INTERFACE
 * New conversation interface with System, Single, Multi, Medical, and Publication modes
 */
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  X, 
  Monitor, 
  User, 
  Users, 
  Stethoscope, 
  FileText, 
  Send,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GenieConversationInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  userId?: string;
}

type ConversationMode = 'system' | 'single' | 'multi' | 'medical' | 'publication';

const availableModels = [
  'GEMINI',
  'GPT',
  'CLAUDE',
  'LLAMA',
  'MIXTRAL',
  'ANTHROPIC'
];

export const GenieConversationInterface: React.FC<GenieConversationInterfaceProps> = ({
  isOpen,
  onClose,
  tenantId,
  userId
}) => {
  const [selectedMode, setSelectedMode] = useState<ConversationMode>('system');
  const [selectedModel, setSelectedModel] = useState('GEMINI');
  const [leftModel, setLeftModel] = useState('GEMINI');
  const [rightModel, setRightModel] = useState('GPT');
  const [message, setMessage] = useState('');
  const [contentQueue, setContentQueue] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const conversationModes = [
    {
      id: 'system',
      label: 'System',
      icon: <Monitor className="h-4 w-4" />,
      description: 'Utilizes all available models (Gemini, GPT, and Claude) for comprehensive and optimized responses.',
      active: selectedMode === 'system'
    },
    {
      id: 'single',
      label: 'Single',
      icon: <User className="h-4 w-4" />,
      description: 'Single model conversation for focused responses.',
      active: selectedMode === 'single'
    },
    {
      id: 'multi',
      label: 'Multi',
      icon: <Users className="h-4 w-4" />,
      description: 'Split screen with multiple models for comparative analysis.',
      active: selectedMode === 'multi'
    },
    {
      id: 'medical',
      label: 'Medical',
      icon: <Stethoscope className="h-4 w-4" />,
      description: 'Access to FDA data, ICD codes, and HCPCS codes. Responses are enriched with medical references and regulatory information.',
      active: selectedMode === 'medical'
    },
    {
      id: 'publication',
      label: 'Publication',
      icon: <FileText className="h-4 w-4" />,
      description: 'Generate content for review and publication in the knowledge base.',
      active: selectedMode === 'publication'
    }
  ];

  const handleModeSelect = (mode: ConversationMode) => {
    setSelectedMode(mode);
  };

  const handleStartChat = () => {
    // Initialize conversation based on selected mode
    console.log('Starting chat with mode:', selectedMode);
  };

  const renderModeSpecificContent = () => {
    switch (selectedMode) {
      case 'single':
        return (
          <div className="mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'multi':
        return (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Left Model</label>
              <Select value={leftModel} onValueChange={setLeftModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Right Model</label>
              <Select value={rightModel} onValueChange={setRightModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'medical':
        return (
          <div className="mt-4">
            <Card className="border-blue-200 bg-blue-50/30">
              <CardContent className="p-4">
                <p className="text-sm text-blue-700">
                  Search medical information, billing codes, and competitor products.
                </p>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  Medical Mode: Access to FDA data, ICD codes, and HCPCS codes. Responses are enriched with medical references and regulatory information.
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'publication':
        return (
          <div className="mt-4 space-y-4">
            <Card className="border-orange-200 bg-orange-50/30">
              <CardContent className="p-4">
                <p className="text-sm text-orange-700">
                  Generate content for review and publication in the knowledge base.
                </p>
              </CardContent>
            </Card>
            
            <div>
              <h4 className="font-semibold mb-2">Content Review Queue</h4>
              {contentQueue.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No content pending review
                </p>
              ) : (
                <div className="space-y-2">
                  {contentQueue.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{item.title}</span>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'system':
      default:
        return (
          <div className="mt-4">
            <Card className="border-green-200 bg-green-50/30">
              <CardContent className="p-4">
                <div className="text-sm text-green-700 font-medium mb-1">
                  System Mode: Utilizes all available models (Gemini, GPT, and Claude) for comprehensive and optimized responses.
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-0.5">
              <img 
                src="/lovable-uploads/f995d61d-e4c0-44c3-bdcb-8ff8e2c93448.png" 
                alt="Genie" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Genie</h2>
              <p className="text-sm text-gray-600">I am your Technical Navigator</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Header Text */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold mb-2">How can I help you today, Guest?</h3>
            <p className="text-gray-600">Choose how you'd like me to assist you:</p>
          </div>

          {/* Mode Selection */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {conversationModes.map((mode) => (
              <Button
                key={mode.id}
                variant={mode.active ? 'default' : 'outline'}
                size="lg"
                onClick={() => handleModeSelect(mode.id as ConversationMode)}
                className={`flex items-center gap-2 px-6 py-3 h-auto ${
                  mode.active 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {mode.icon}
                {mode.label}
              </Button>
            ))}
          </div>

          {/* Mode Description */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              {conversationModes.find(mode => mode.id === selectedMode)?.description}
            </p>
          </div>

          {/* Mode-specific Content */}
          {renderModeSpecificContent()}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This is an AI assistant for demonstration purposes. The responses generated should not be considered as medical advice. Always consult qualified healthcare professionals for medical decisions.
            </p>
          </div>

          {/* Start Chat Button */}
          <div className="mt-6 flex justify-center">
            <Button 
              size="lg" 
              onClick={handleStartChat}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-medium"
            >
              Start Chat
            </Button>
          </div>

          {/* Message Input */}
          <div className="mt-6">
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 min-h-[100px] resize-none"
              />
              <Button 
                size="icon" 
                className="self-end bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};