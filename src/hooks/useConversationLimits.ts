/**
 * Conversation Limits Hook - P1 #75
 * 
 * Manages per-tier conversation limits for Genie AI.
 * Enforces rate limiting based on subscription tier.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

// ============================================================================
// TYPES
// ============================================================================

export interface TierLimits {
  conversationsPerDay: number;
  messagesPerConversation: number;
  tokensPerMessage: number;
  concurrentConversations: number;
  advancedModelsAllowed: boolean;
  voiceMinutesPerMonth: number;
  videoMinutesPerMonth: number;
}

export interface ConversationUsage {
  conversationsToday: number;
  messagesInCurrentConversation: number;
  tokensUsedToday: number;
  voiceMinutesUsedThisMonth: number;
  videoMinutesUsedThisMonth: number;
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  limit?: number;
  upgradeRequired?: boolean;
}

// Default limits by tier
const TIER_LIMITS: Record<string, TierLimits> = {
  free: {
    conversationsPerDay: 5,
    messagesPerConversation: 20,
    tokensPerMessage: 2000,
    concurrentConversations: 1,
    advancedModelsAllowed: false,
    voiceMinutesPerMonth: 10,
    videoMinutesPerMonth: 5,
  },
  starter: {
    conversationsPerDay: 25,
    messagesPerConversation: 50,
    tokensPerMessage: 4000,
    concurrentConversations: 3,
    advancedModelsAllowed: false,
    voiceMinutesPerMonth: 60,
    videoMinutesPerMonth: 30,
  },
  professional: {
    conversationsPerDay: 100,
    messagesPerConversation: 100,
    tokensPerMessage: 8000,
    concurrentConversations: 10,
    advancedModelsAllowed: true,
    voiceMinutesPerMonth: 300,
    videoMinutesPerMonth: 120,
  },
  enterprise: {
    conversationsPerDay: 999999,
    messagesPerConversation: 999999,
    tokensPerMessage: 32000,
    concurrentConversations: 999999,
    advancedModelsAllowed: true,
    voiceMinutesPerMonth: 999999,
    videoMinutesPerMonth: 999999,
  },
  beta: {
    conversationsPerDay: 999999,
    messagesPerConversation: 999999,
    tokensPerMessage: 32000,
    concurrentConversations: 999999,
    advancedModelsAllowed: true,
    voiceMinutesPerMonth: 999999,
    videoMinutesPerMonth: 999999,
  },
};

// ============================================================================
// HOOK
// ============================================================================

export const useConversationLimits = (conversationId?: string) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const tier = subscription?.subscription_tier || 'free';
  
  // Get tier limits
  const tierLimits = useMemo(() => {
    const tierKey = tier?.toLowerCase() || 'free';
    return TIER_LIMITS[tierKey] || TIER_LIMITS.free;
  }, [tier]);

  // Fetch today's conversation count
  const { data: todayConversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations-today', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('agent_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });

  // Fetch message count for current conversation
  const { data: currentConversationMessages } = useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return 0;
      
      const { data, error } = await supabase
        .from('agent_conversations')
        .select('conversation_data')
        .eq('id', conversationId)
        .single();
      
      if (error) throw error;
      
      const conversationData = data?.conversation_data as any;
      return conversationData?.messages?.length || 0;
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000,
  });

  // Fetch monthly voice/video usage
  const { data: monthlyUsage } = useQuery({
    queryKey: ['monthly-media-usage', user?.id],
    queryFn: async () => {
      if (!user?.id) return { voice: 0, video: 0 };
      
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      // This would query actual usage from a media_usage table
      // For now, return placeholder
      return { voice: 0, video: 0 };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Current usage state
  const usage: ConversationUsage = {
    conversationsToday: todayConversations || 0,
    messagesInCurrentConversation: currentConversationMessages || 0,
    tokensUsedToday: 0, // Would be tracked from AI usage
    voiceMinutesUsedThisMonth: monthlyUsage?.voice || 0,
    videoMinutesUsedThisMonth: monthlyUsage?.video || 0,
  };

  // Check if new conversation is allowed
  const canStartNewConversation = useCallback((): LimitCheckResult => {
    const remaining = tierLimits.conversationsPerDay - usage.conversationsToday;
    
    if (remaining <= 0) {
      return {
        allowed: false,
        reason: `Daily conversation limit reached (${tierLimits.conversationsPerDay}/day)`,
        remaining: 0,
        limit: tierLimits.conversationsPerDay,
        upgradeRequired: true,
      };
    }
    
    return {
      allowed: true,
      remaining,
      limit: tierLimits.conversationsPerDay,
    };
  }, [tierLimits, usage]);

  // Check if new message is allowed
  const canSendMessage = useCallback((): LimitCheckResult => {
    const remaining = tierLimits.messagesPerConversation - usage.messagesInCurrentConversation;
    
    if (remaining <= 0) {
      return {
        allowed: false,
        reason: `Message limit reached for this conversation (${tierLimits.messagesPerConversation}/conversation)`,
        remaining: 0,
        limit: tierLimits.messagesPerConversation,
        upgradeRequired: true,
      };
    }
    
    return {
      allowed: true,
      remaining,
      limit: tierLimits.messagesPerConversation,
    };
  }, [tierLimits, usage]);

  // Check if advanced models are allowed
  const canUseAdvancedModels = useCallback((): LimitCheckResult => {
    if (!tierLimits.advancedModelsAllowed) {
      return {
        allowed: false,
        reason: 'Advanced AI models require Professional tier or higher',
        upgradeRequired: true,
      };
    }
    
    return { allowed: true };
  }, [tierLimits]);

  // Check voice minutes
  const canUseVoice = useCallback((minutesNeeded: number = 1): LimitCheckResult => {
    const remaining = tierLimits.voiceMinutesPerMonth - usage.voiceMinutesUsedThisMonth;
    
    if (remaining < minutesNeeded) {
      return {
        allowed: false,
        reason: `Voice minutes limit reached (${tierLimits.voiceMinutesPerMonth} min/month)`,
        remaining,
        limit: tierLimits.voiceMinutesPerMonth,
        upgradeRequired: true,
      };
    }
    
    return {
      allowed: true,
      remaining,
      limit: tierLimits.voiceMinutesPerMonth,
    };
  }, [tierLimits, usage]);

  // Check video minutes
  const canUseVideo = useCallback((minutesNeeded: number = 1): LimitCheckResult => {
    const remaining = tierLimits.videoMinutesPerMonth - usage.videoMinutesUsedThisMonth;
    
    if (remaining < minutesNeeded) {
      return {
        allowed: false,
        reason: `Video minutes limit reached (${tierLimits.videoMinutesPerMonth} min/month)`,
        remaining,
        limit: tierLimits.videoMinutesPerMonth,
        upgradeRequired: true,
      };
    }
    
    return {
      allowed: true,
      remaining,
      limit: tierLimits.videoMinutesPerMonth,
    };
  }, [tierLimits, usage]);

  // Get usage percentages
  const usagePercentages = useMemo(() => ({
    conversations: (usage.conversationsToday / tierLimits.conversationsPerDay) * 100,
    messages: (usage.messagesInCurrentConversation / tierLimits.messagesPerConversation) * 100,
    voice: (usage.voiceMinutesUsedThisMonth / tierLimits.voiceMinutesPerMonth) * 100,
    video: (usage.videoMinutesUsedThisMonth / tierLimits.videoMinutesPerMonth) * 100,
  }), [usage, tierLimits]);

  // Warning threshold (80%)
  const isNearLimit = useMemo(() => ({
    conversations: usagePercentages.conversations >= 80,
    messages: usagePercentages.messages >= 80,
    voice: usagePercentages.voice >= 80,
    video: usagePercentages.video >= 80,
    any: usagePercentages.conversations >= 80 || 
         usagePercentages.messages >= 80 ||
         usagePercentages.voice >= 80 ||
         usagePercentages.video >= 80,
  }), [usagePercentages]);

  return {
    // Current state
    tierLimits,
    usage,
    usagePercentages,
    isNearLimit,
    
    // Limit checks
    canStartNewConversation,
    canSendMessage,
    canUseAdvancedModels,
    canUseVoice,
    canUseVideo,
    
    // Actions
    refetchConversations,
  };
};

export default useConversationLimits;
