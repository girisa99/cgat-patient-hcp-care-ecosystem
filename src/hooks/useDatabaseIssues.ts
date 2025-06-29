
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issuesTypes';
import { useUnifiedVerificationData } from './useUnifiedVerificationData';

interface DatabaseIssuesData {
  activeIssues: Issue[];
  totalFixedCount: number;
  lastScanTime: Date | null;
  isLoading: boolean;
  error: string | null;
  categorizedIssues: {
    critical: Issue[];
    high: Issue[];
    medium: Issue[];
    low: Issue[];
    byTopic: Record<string, Issue[]>;
    total: number;
  };
}

export const useDatabaseIssues = (): DatabaseIssuesData & {
  refreshIssues: () => Promise<void>;
} => {
  // Use unified verification data to ensure consistency
  const {
    activeIssues,
    categorizedIssues,
    totalFixedIssues,
    lastCalculated,
    isLoading,
    error,
    refresh
  } = useUnifiedVerificationData();

  console.log('📋 DatabaseIssues hook: Using unified verification data for consistency');

  const refreshIssues = async () => {
    console.log('🔄 DatabaseIssues: Triggering unified data refresh');
    await refresh();
    console.log('✅ DatabaseIssues: Unified data refresh completed');
  };

  return {
    activeIssues,
    totalFixedCount: totalFixedIssues,
    lastScanTime: lastCalculated,
    isLoading,
    error,
    categorizedIssues,
    refreshIssues
  };
};
