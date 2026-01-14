/**
 * RalphWiggumIntegration - Auto-trigger wrapper for GenieStudio
 * DEV-ONLY: Automatically triggers reviews based on tab changes and content updates
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useRalphWiggum } from './useRalphWiggum';
import { RalphWiggumPanel } from './RalphWiggumPanel';
import type { 
  GenieModule, 
  MindContent, 
  SparkContent, 
  VibeContent,
  SubscriptionContent,
  VoiceGeneratorContent,
  TemplatesContent,
  LibraryContent,
  GeniePageContent
} from './types';

// DEV-ONLY check
const isDev = import.meta.env.DEV;

interface RalphWiggumIntegrationProps {
  // Current active tab in GenieStudio
  activeTab: string;
  // Script editor content
  scriptContent?: string;
  scriptName?: string;
  // Voice/TTS settings
  voiceSettings?: {
    provider?: 'openai' | 'elevenlabs';
    voice?: string;
    text?: string;
  };
  // Library counts
  scriptsCount?: number;
  voiceoversCount?: number;
  musicCount?: number;
  // Recording state
  isRecording?: boolean;
  recordingMode?: 'mobile' | 'desktop' | 'full-suite';
  // Subscription info (if available)
  subscriptionInfo?: {
    plan?: string;
    status?: string;
  };
  // User flow tracking (for journey analysis)
  userFlow?: Array<{ action: string; timestamp: number; tab?: string }>;
  loadedComponents?: Array<{ name: string; isVisible: boolean }>;
}

// Map tab names to GenieModule types
const tabToModule: Record<string, GenieModule> = {
  'dashboard': 'dashboard',
  'spark': 'spark',
  'mind': 'mind',
  'script-editor': 'mind',
  'voice-generator': 'voice-generator',
  'vibe': 'vibe',
  'recording': 'vibe',
  'guided': 'guided',
  'agents': 'agents',
  'ask-genie': 'ask-genie',
  'arc': 'arc',
  'production-hub': 'arc',
  'library': 'library',
  'templates': 'templates',
  'subscription': 'subscription',
  'settings': 'genie-page'
};

export const RalphWiggumIntegration: React.FC<RalphWiggumIntegrationProps> = ({
  activeTab,
  scriptContent,
  scriptName,
  voiceSettings,
  scriptsCount = 0,
  voiceoversCount = 0,
  musicCount = 0,
  isRecording = false,
  recordingMode = 'desktop',
  subscriptionInfo,
  userFlow = [],
  loadedComponents = []
}) => {
  const ralph = useRalphWiggum();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastReviewedTabRef = useRef<string>('');
  const lastContentHashRef = useRef<string>('');
  
  // Don't render in production
  if (!isDev) return null;
  
  // Listen for copy success event
  useEffect(() => {
    const handleCopied = () => {
      toast.success('Copied! Paste into Lovable chat to implement improvements', {
        duration: 4000,
        icon: '✨'
      });
    };
    
    window.addEventListener('ralph-copied', handleCopied);
    return () => window.removeEventListener('ralph-copied', handleCopied);
  }, []);
  
  // Build content for current module
  const buildModuleContent = useCallback(() => {
    const module = tabToModule[activeTab] || 'genie-page';
    
    switch (module) {
      case 'mind':
        return {
          module: 'mind' as const,
          content: {
            scriptContent: scriptContent || '',
            scriptName: scriptName,
            scriptType: 'video' as const,
            ttsSettings: voiceSettings ? {
              voice: voiceSettings.voice || '',
              provider: voiceSettings.provider || 'elevenlabs'
            } : undefined
          } as MindContent
        };
        
      case 'voice-generator':
        return {
          module: 'voice-generator' as const,
          content: {
            scriptText: voiceSettings?.text || scriptContent || '',
            selectedVoice: voiceSettings?.voice,
            selectedProvider: voiceSettings?.provider
          } as VoiceGeneratorContent
        };
        
      case 'spark':
        return {
          module: 'spark' as const,
          content: {
            ideas: [],
            generatedContent: scriptContent
          } as SparkContent
        };
        
      case 'vibe':
        return {
          module: 'vibe' as const,
          content: {
            mode: recordingMode,
            recordingStatus: isRecording ? 'recording' : 'idle'
          } as VibeContent
        };
        
      case 'library':
        return {
          module: 'library' as const,
          content: {
            mediaType: 'all' as const,
            itemCount: scriptsCount + voiceoversCount + musicCount,
            recentItems: [],
            organizationMethod: 'date' as const
          } as LibraryContent
        };
        
      case 'subscription':
        return {
          module: 'subscription' as const,
          content: {
            currentPlan: subscriptionInfo?.plan,
            planStatus: (subscriptionInfo?.status as any) || 'none',
            availablePlans: []
          } as SubscriptionContent
        };
        
      case 'templates':
        return {
          module: 'templates' as const,
          content: {
            customizations: {},
            templateVariables: []
          } as TemplatesContent
        };
        
      default:
        return {
          module: 'genie-page' as const,
          content: {
            activeTab,
            visibleSections: [activeTab],
            userFlow: userFlow.map(e => ({ action: e.action, timestamp: e.timestamp, tab: e.tab })),
            loadedComponents: loadedComponents.map(c => c.name)
          } as GeniePageContent
        };
    }
  }, [activeTab, scriptContent, scriptName, voiceSettings, scriptsCount, voiceoversCount, musicCount, isRecording, recordingMode, subscriptionInfo, userFlow, loadedComponents]);
  
  // Auto-trigger review on tab change or significant content change
  useEffect(() => {
    if (!ralph.config.autoReview || !ralph.isEnabled) return;
    
    // Create a hash of current content to detect changes
    const contentHash = JSON.stringify({
      tab: activeTab,
      script: scriptContent?.slice(0, 100),
      voice: voiceSettings?.voice
    });
    
    // Skip if same content
    if (contentHash === lastContentHashRef.current && activeTab === lastReviewedTabRef.current) {
      return;
    }
    
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce the review trigger
    debounceRef.current = setTimeout(() => {
      const moduleContent = buildModuleContent();
      
      // Only review if there's meaningful content
      const hasContent = 
        (scriptContent && scriptContent.length > 50) ||
        activeTab !== lastReviewedTabRef.current;
      
      if (hasContent) {
        ralph.triggerReview({
          moduleContent,
          includeJourneyAnalysis: true,
          priority: 'normal'
        });
        
        lastReviewedTabRef.current = activeTab;
        lastContentHashRef.current = contentHash;
      }
    }, ralph.config.debounceMs);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [activeTab, scriptContent, voiceSettings, ralph.config.autoReview, ralph.config.debounceMs, ralph.isEnabled, buildModuleContent, ralph.triggerReview]);
  
  // Manual trigger function
  const handleManualTrigger = useCallback((module: GenieModule, content: any) => {
    ralph.triggerReview({
      moduleContent: { module, content },
      includeJourneyAnalysis: true,
      priority: 'high'
    });
  }, [ralph]);
  
  return (
    <RalphWiggumPanel
      currentReview={ralph.currentReview}
      isReviewing={ralph.isReviewing}
      config={ralph.config}
      onTriggerReview={handleManualTrigger}
      onClearReview={ralph.clearReview}
      onUpdateConfig={ralph.updateConfig}
      onPauseAutoReview={ralph.pauseAutoReview}
      onResumeAutoReview={ralph.resumeAutoReview}
      onExportReport={ralph.exportReviewReport}
    />
  );
};

export default RalphWiggumIntegration;
