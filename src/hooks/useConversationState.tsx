import { useState, useCallback, useRef } from 'react';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  provider?: string;
  model?: string;
  error?: boolean;
  metadata?: any;
}

export interface ConversationState {
  messages: ConversationMessage[];
  isActive: boolean;
  selectedMode: 'system' | 'single' | 'multi';
  selectedModel: string;
  leftModel: string;
  rightModel: string;
  selectedModelType: 'llm' | 'slm' | 'vlm';
  enabledFeatures: string[];
  selectedMCPTools: string[];
  conversationId: string;
}

export const useConversationState = () => {
  const conversationIdRef = useRef(0);
  
  const getInitialState = (): ConversationState => ({
    messages: [],
    isActive: false,
    selectedMode: 'system',
    selectedModel: 'GEMINI',
    leftModel: 'GEMINI',
    rightModel: 'GPT',
    selectedModelType: 'llm',
    enabledFeatures: [],
    selectedMCPTools: [],
    conversationId: `conv_${++conversationIdRef.current}_${Date.now()}`
  });

  const [state, setState] = useState<ConversationState>(getInitialState);

  const resetConversation = useCallback(() => {
    console.log('🔄 Resetting conversation state');
    setState(getInitialState());
  }, []);

  const startConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: true
    }));
  }, []);

  const addMessage = useCallback((message: Omit<ConversationMessage, 'id'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
    
    return newMessage.id;
  }, []);

  const updateConversationConfig = useCallback((updates: Partial<ConversationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const switchMode = useCallback((newMode: 'system' | 'single' | 'multi') => {
    console.log(`🔀 Switching conversation mode: ${state.selectedMode} → ${newMode}`);
    
    // If switching modes mid-conversation, reset the conversation
    if (state.isActive && state.messages.length > 0) {
      const newState = getInitialState();
      setState({
        ...newState,
        selectedMode: newMode,
        selectedModel: state.selectedModel,
        leftModel: state.leftModel,
        rightModel: state.rightModel,
        selectedModelType: state.selectedModelType,
        enabledFeatures: state.enabledFeatures,
        selectedMCPTools: state.selectedMCPTools
      });
    } else {
      setState(prev => ({ ...prev, selectedMode: newMode }));
    }
  }, [state.selectedMode, state.isActive, state.messages.length]);

  return {
    state,
    resetConversation,
    startConversation,
    addMessage,
    updateConversationConfig,
    switchMode
  };
};