
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

// Get daily fix statistics
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

    return data || [];
  } catch (error) {
    console.error('Error in getDailyFixStats:', error);
    return [];
  }
};

// Sync current active issues with the database
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

    console.log('✅ Active issues synced with database:', issuesData.length);
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
