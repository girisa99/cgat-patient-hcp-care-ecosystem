
import { supabase } from '@/integrations/supabase/client';

export interface FixedIssueData {
  type: string;
  message: string;
  severity: string;
  category: string;
  description: string;
}

export interface DailyFixStats {
  fix_date: string;
  category: string;
  fix_count: number;
  severity_breakdown: Record<string, number>;
}

// Record a fixed issue in the database
export const recordFixedIssue = async (
  issueData: FixedIssueData, 
  fixMethod: 'manual' | 'automatic' | 'backend_detected' = 'manual'
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('issue_fixes')
      .insert({
        user_id: user.id,
        issue_type: issueData.type,
        issue_message: issueData.message,
        issue_source: issueData.category + ' Scanner',
        issue_severity: issueData.severity,
        category: issueData.category,
        fix_method: fixMethod,
        metadata: {
          description: issueData.description,
          timestamp: new Date().toISOString()
        }
      });

    if (error) {
      console.error('Error recording fixed issue:', error);
      return false;
    }

    console.log('✅ Fixed issue recorded in database:', issueData.type);
    return true;
  } catch (error) {
    console.error('Error in recordFixedIssue:', error);
    return false;
  }
};

// Get daily fix statistics with proper type handling
export const getDailyFixStats = async (daysBack: number = 7): Promise<DailyFixStats[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .rpc('get_daily_fix_stats', {
        days_back: daysBack,
        target_user_id: user.id
      });

    if (error) {
      console.error('Error fetching daily fix stats:', error);
      return [];
    }

    // Transform the data to ensure proper typing
    const transformedData: DailyFixStats[] = (data || []).map((item: any) => ({
      fix_date: item.fix_date,
      category: item.category,
      fix_count: Number(item.fix_count),
      severity_breakdown: typeof item.severity_breakdown === 'string' 
        ? JSON.parse(item.severity_breakdown)
        : (item.severity_breakdown || {})
    }));

    return transformedData;
  } catch (error) {
    console.error('Error in getDailyFixStats:', error);
    return [];
  }
};

// Sync current active issues with the database - THIS IS THE KEY SYNC FUNCTION
export const syncActiveIssues = async (issues: any[]) => {
  try {
    const issuesData = issues.map(issue => ({
      type: issue.type,
      message: issue.message,
      source: issue.source,
      severity: issue.severity || 'medium'
    }));

    const { error } = await supabase
      .rpc('sync_active_issues', {
        issues_data: issuesData
      });

    if (error) {
      console.error('Error syncing active issues:', error);
      return false;
    }

    console.log('✅ Active issues synced with database:', issuesData.length, 'issues');
    return true;
  } catch (error) {
    console.error('Error in syncActiveIssues:', error);
    return false;
  }
};

// Get historical fixed issues from database
export const getHistoricalFixedIssues = async (limit: number = 100) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from('issue_fixes')
      .select('*')
      .eq('user_id', user.id)
      .order('fixed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching historical fixed issues:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getHistoricalFixedIssues:', error);
    return [];
  }
};

// NEW: Get current active issues from database
export const getActiveIssuesFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('active_issues')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active issues from database:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveIssuesFromDatabase:', error);
    return [];
  }
};

// NEW: Comprehensive sync function that runs during verification
export const performDatabaseSync = async (currentIssues: any[]) => {
  console.log('🔄 PERFORMING COMPREHENSIVE DATABASE SYNC...');
  
  try {
    // 1. Sync current active issues
    const syncResult = await syncActiveIssues(currentIssues);
    
    if (syncResult) {
      console.log('✅ Database sync completed successfully');
      console.log(`📊 Synced ${currentIssues.length} active issues to database`);
      
      // 2. Log sync event for tracking
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('issue_fixes')
          .insert({
            user_id: user.id,
            issue_type: 'SYSTEM_SYNC',
            issue_message: `Database sync completed: ${currentIssues.length} active issues`,
            issue_source: 'System Sync',
            issue_severity: 'low',
            category: 'System',
            fix_method: 'automatic',
            metadata: {
              sync_timestamp: new Date().toISOString(),
              issues_count: currentIssues.length,
              sync_type: 'verification_run'
            }
          });
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    return false;
  }
};
