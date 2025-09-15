/**
 * CONVERSATIONAL CONTEXT HOOK
 * Provides context-aware responses and maintains conversation flow
 */
import { useState, useCallback, useRef } from 'react';

export interface ConversationContext {
  currentTopic: string;
  previousTopics: string[];
  userPreferences: {
    medicalFocus?: boolean;
    technicalLevel?: 'basic' | 'intermediate' | 'advanced';
    preferredFormat?: 'concise' | 'detailed' | 'visual';
  };
  sessionMetadata: {
    startTime: Date;
    messageCount: number;
    lastActivity: Date;
  };
}

export interface ContextualResponse {
  enhancedPrompt: string;
  contextualPrefix: string;
  suggestedFollowups: string[];
  topicTransition?: string;
}

export const useConversationalContext = () => {
  const [context, setContext] = useState<ConversationContext>({
    currentTopic: '',
    previousTopics: [],
    userPreferences: {
      technicalLevel: 'intermediate',
      preferredFormat: 'detailed'
    },
    sessionMetadata: {
      startTime: new Date(),
      messageCount: 0,
      lastActivity: new Date()
    }
  });

  const conversationHistory = useRef<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);

  const extractTopics = useCallback((content: string): string[] => {
    const medicalTerms = [
      'CAR-T', 'immunotherapy', 'cancer', 'FDA', 'clinical trial', 'cell therapy',
      'biotech', 'pharmaceutical', 'treatment', 'patient', 'diagnosis', 'therapy',
      'oncology', 'hematology', 'gene therapy', 'stem cell', 'research', 'drug development'
    ];
    
    const biotechTerms = [
      'CRISPR', 'genetic engineering', 'biomanufacturing', 'protein', 'antibody',
      'vaccine', 'bioprocessing', 'fermentation', 'purification', 'quality control'
    ];

    const regulatoryTerms = [
      'FDA approval', 'clinical phases', 'regulatory pathway', 'IND', 'BLA',
      'compliance', 'GMP', 'validation', 'submission', 'inspection'
    ];

    const allTerms = [...medicalTerms, ...biotechTerms, ...regulatoryTerms];
    const foundTerms = allTerms.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );

    return [...new Set(foundTerms)]; // Remove duplicates
  }, []);

  const updateContext = useCallback((userMessage: string, isUserMessage: boolean = true) => {
    const topics = extractTopics(userMessage);
    const currentTime = new Date();

    setContext(prev => {
      const newTopics = topics.filter(topic => !prev.previousTopics.includes(topic));
      const updatedPreviousTopics = [...prev.previousTopics, ...newTopics].slice(-10); // Keep last 10 topics
      
      // Update user preferences based on content patterns
      const updatedPreferences = { ...prev.userPreferences };
      
      if (topics.some(t => ['CAR-T', 'immunotherapy', 'cancer'].includes(t))) {
        updatedPreferences.medicalFocus = true;
      }

      // Detect technical level from language complexity
      const complexTerms = ['pharmacokinetics', 'bioavailability', 'cytotoxicity', 'apoptosis'];
      if (complexTerms.some(term => userMessage.toLowerCase().includes(term))) {
        updatedPreferences.technicalLevel = 'advanced';
      }

      return {
        ...prev,
        currentTopic: topics[0] || prev.currentTopic,
        previousTopics: updatedPreviousTopics,
        userPreferences: updatedPreferences,
        sessionMetadata: {
          ...prev.sessionMetadata,
          messageCount: prev.sessionMetadata.messageCount + 1,
          lastActivity: currentTime
        }
      };
    });

    // Add to conversation history
    conversationHistory.current.push({
      role: isUserMessage ? 'user' : 'assistant',
      content: userMessage,
      timestamp: currentTime
    });

    // Keep only last 20 messages in memory
    if (conversationHistory.current.length > 20) {
      conversationHistory.current = conversationHistory.current.slice(-20);
    }
  }, [extractTopics]);

  const generateContextualResponse = useCallback((userPrompt: string): ContextualResponse => {
    const topics = extractTopics(userPrompt);
    const { currentTopic, previousTopics, userPreferences } = context;

    let contextualPrefix = '';
    let enhancedPrompt = userPrompt;
    const suggestedFollowups: string[] = [];

    // Add conversational context
    if (currentTopic && topics.length > 0) {
      const isTopicContinuation = topics.some(topic => 
        previousTopics.includes(topic) || topic === currentTopic
      );

      if (isTopicContinuation) {
        contextualPrefix = `Continuing our discussion about ${currentTopic}, `;
      } else {
        contextualPrefix = `Building on our previous conversation about ${currentTopic}, now focusing on ${topics[0]}, `;
      }
    }

    // Enhance prompt based on user preferences
    if (userPreferences.medicalFocus) {
      enhancedPrompt = `From a medical and healthcare perspective: ${enhancedPrompt}`;
    }

    if (userPreferences.technicalLevel === 'advanced') {
      enhancedPrompt += ' Please provide detailed technical information including mechanisms, pathways, and clinical implications.';
    } else if (userPreferences.technicalLevel === 'basic') {
      enhancedPrompt += ' Please explain in simple terms suitable for a general audience.';
    }

    if (userPreferences.preferredFormat === 'visual') {
      enhancedPrompt += ' Consider including relevant diagrams, charts, or visual representations.';
    }

    // Generate contextual follow-up suggestions
    if (topics.includes('CAR-T')) {
      suggestedFollowups.push(
        'What are the latest CAR-T therapy developments?',
        'Explain CAR-T manufacturing challenges',
        'Compare different CAR-T therapy approaches'
      );
    }

    if (topics.includes('clinical trial')) {
      suggestedFollowups.push(
        'What are the key phases of clinical trials?',
        'How long do clinical trials typically take?',
        'What are common clinical trial endpoints?'
      );
    }

    if (topics.includes('FDA')) {
      suggestedFollowups.push(
        'What is the FDA approval process?',
        'How does FDA fast track designation work?',
        'What are FDA breakthrough therapy criteria?'
      );
    }

    return {
      enhancedPrompt: contextualPrefix + enhancedPrompt,
      contextualPrefix,
      suggestedFollowups: suggestedFollowups.slice(0, 3),
      topicTransition: topics.length > 0 && !topics.includes(currentTopic) 
        ? `Transitioning from ${currentTopic} to ${topics[0]}` 
        : undefined
    };
  }, [context, extractTopics]);

  const getConversationSummary = useCallback(() => {
    return {
      totalMessages: context.sessionMetadata.messageCount,
      duration: Date.now() - context.sessionMetadata.startTime.getTime(),
      topicsDiscussed: context.previousTopics.length,
      currentFocus: context.currentTopic,
      userProfile: context.userPreferences
    };
  }, [context]);

  const resetContext = useCallback(() => {
    setContext({
      currentTopic: '',
      previousTopics: [],
      userPreferences: {
        technicalLevel: 'intermediate',
        preferredFormat: 'detailed'
      },
      sessionMetadata: {
        startTime: new Date(),
        messageCount: 0,
        lastActivity: new Date()
      }
    });
    conversationHistory.current = [];
  }, []);

  return {
    context,
    updateContext,
    generateContextualResponse,
    getConversationSummary,
    resetContext,
    conversationHistory: conversationHistory.current
  };
};
