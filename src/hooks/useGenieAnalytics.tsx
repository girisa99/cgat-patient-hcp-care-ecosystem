/**
 * REUSABLE GENIE ANALYTICS HOOK
 * Fetches and aggregates analytics data for any Genie deployment
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GenieAnalyticsParams {
  genieId?: string;
  brandConfigId?: string;
  deploymentType?: string;
}

export const useGenieAnalytics = (params: GenieAnalyticsParams = {}) => {
  // Fetch conversations
  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['genie-conversations', params.genieId, params.brandConfigId, params.deploymentType],
    queryFn: async () => {
      const query = supabase
        .from('genie_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch access requests
  const { data: accessRequests } = useQuery({
    queryKey: ['access-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch knowledge base stats
  const { data: knowledgeBase } = useQuery({
    queryKey: ['knowledge-base'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch conversation analytics
  const { data: conversationAnalytics } = useQuery({
    queryKey: ['conversation-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genie_conversation_analytics')
        .select('*');

      if (error) throw error;
      return data || [];
    },
  });

  // Aggregate analytics
  const analytics = {
    totalUsers: conversations?.length || 0,
    registeredUsers: conversations?.filter((c: any) => c.user_id).length || 0,
    anonymousUsers: conversations?.filter((c: any) => !c.user_id).length || 0,
    activeSessions: conversations?.filter((c: any) => c.status === 'active').length || 0,
    completedSessions: conversations?.filter((c: any) => c.status === 'completed').length || 0,
    sessionsStartedToday: conversations?.filter((c: any) => {
      const today = new Date().toDateString();
      return new Date(c.created_at).toDateString() === today;
    }).length || 0,
    avgSessionDuration: conversationAnalytics?.reduce((sum: number, a: any) => sum + (a.duration_minutes || 0), 0) / Math.max(conversationAnalytics?.length || 1, 1) || 0,
    accessRequests: accessRequests?.length || 0,
    approvedRequests: accessRequests?.filter((r: any) => r.status === 'approved').length || 0,
    totalMessages: conversationAnalytics?.reduce((sum: number, a: any) => sum + (a.message_count || 0), 0) || 0,
    peakHours: '0:00 - 1:00', // TODO: Calculate from data
    userRetention: 0, // TODO: Calculate retention
    totalConversations: conversations?.length || 0,
    brandContext: params.brandConfigId || 'All brands',
    productFocus: 'Multiple products',
    verifiedDomains: 0, // TODO: Fetch from domain verifications
  };

  // Knowledge base stats
  const knowledgeEntries = knowledgeBase || [];
  const knowledgeBaseStats = {
    totalEntries: knowledgeEntries.length,
    activeEntries: knowledgeEntries.filter((k: any) => k.status === 'approved').length,
    topics: [...new Set(knowledgeEntries.map((k: any) => k.category).filter(Boolean))],
    mostQueried: knowledgeEntries.length > 0 ? (knowledgeEntries[0] as any).source_title || 'N/A' : 'N/A',
  };

  // Performance metrics
  const performanceMetrics = {
    totalRequests: conversationAnalytics?.reduce((sum: number, a: any) => sum + (a.message_count || 0), 0) || 0,
    avgResponseTime: 250, // TODO: Calculate from data
    successRate: 98.5, // TODO: Calculate from data
    uptime: 99.9,
    errorRate: 0.1,
    peakUsers: Math.max(...(conversationAnalytics?.map((a: any) => a.message_count || 0) || [0])),
  };

  const refreshData = async () => {
    await refetchConversations();
  };

  return {
    analytics,
    conversations: conversations || [],
    accessRequests: accessRequests || [],
    knowledgeBaseStats,
    performanceMetrics,
    isLoading: false,
    refreshData,
  };
};
