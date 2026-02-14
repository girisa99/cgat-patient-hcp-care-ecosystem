/**
 * useCompetitiveIntelligence Hook
 * 
 * React Query-based hook for competitive intelligence data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { competitiveIntelligenceService } from '@/services/competitiveIntelligenceService';
import { toast } from 'sonner';

export function useCompetitiveIntelligence() {
  const queryClient = useQueryClient();

  const competitors = useQuery({
    queryKey: ['competitive-intelligence', 'competitors'],
    queryFn: () => competitiveIntelligenceService.getCompetitors(),
    staleTime: 5 * 60 * 1000,
  });

  const featureMatrix = useQuery({
    queryKey: ['competitive-intelligence', 'features'],
    queryFn: () => competitiveIntelligenceService.getFeatureMatrix(),
    staleTime: 5 * 60 * 1000,
  });

  const usps = useQuery({
    queryKey: ['competitive-intelligence', 'usps'],
    queryFn: () => competitiveIntelligenceService.getUSPs(),
    staleTime: 5 * 60 * 1000,
  });

  const dashboardStats = useQuery({
    queryKey: ['competitive-intelligence', 'stats'],
    queryFn: () => competitiveIntelligenceService.getDashboardStats(),
    staleTime: 2 * 60 * 1000,
  });

  const trends = useQuery({
    queryKey: ['competitive-intelligence', 'trends'],
    queryFn: () => competitiveIntelligenceService.getTrends(),
    staleTime: 2 * 60 * 1000,
  });

  const analyses = useQuery({
    queryKey: ['competitive-intelligence', 'analyses'],
    queryFn: () => competitiveIntelligenceService.getAnalyses(),
    staleTime: 5 * 60 * 1000,
  });

  const runAnalysis = useMutation({
    mutationFn: ({ type, scope, filter }: { type: string; scope: string; filter?: string }) =>
      competitiveIntelligenceService.runAIAnalysis(type, scope, filter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitive-intelligence', 'analyses'] });
      toast.success('Market analysis completed');
    },
    onError: (err: Error) => {
      toast.error(`Analysis failed: ${err.message}`);
    },
  });

  return {
    competitors: competitors.data || [],
    featureMatrix: featureMatrix.data || [],
    usps: usps.data || [],
    trends: trends.data || [],
    analyses: analyses.data || [],
    stats: dashboardStats.data,
    isLoading: competitors.isLoading || featureMatrix.isLoading,
    runAnalysis,
  };
}
