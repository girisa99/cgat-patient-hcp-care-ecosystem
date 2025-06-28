interface FixedIssueRecord {
  id: string;
  issue: {
    type: string;
    message: string;
    severity: string;
    category: string;
    description: string;
  };
  fixedDate: string; // YYYY-MM-DD format
  fixedTimestamp: string; // ISO string
  fixMethod: 'manual' | 'automatic';
}

export const recordFixedIssue = (
  issue: {
    type: string;
    message: string;
    severity: string;
    category?: string;
    description?: string;
  },
  fixMethod: 'manual' | 'automatic' = 'manual'
): void => {
  try {
    const now = new Date();
    const fixedDate = now.toISOString().split('T')[0];
    
    // Determine category from issue type if not provided
    let category = issue.category || 'System';
    if (issue.type.toLowerCase().includes('security')) {
      category = 'Security';
    } else if (issue.type.toLowerCase().includes('ui') || issue.type.toLowerCase().includes('ux')) {
      category = 'UI/UX';
    } else if (issue.type.toLowerCase().includes('database') || issue.type.toLowerCase().includes('db')) {
      category = 'Database';
    } else if (issue.type.toLowerCase().includes('code') || issue.type.toLowerCase().includes('quality')) {
      category = 'Code Quality';
    }

    const record: FixedIssueRecord = {
      id: `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      issue: {
        type: issue.type,
        message: issue.message,
        severity: issue.severity || 'medium',
        category,
        description: issue.description || issue.message
      },
      fixedDate,
      fixedTimestamp: now.toISOString(),
      fixMethod
    };

    // Load existing data
    const existing = localStorage.getItem('daily-progress-history');
    const data: FixedIssueRecord[] = existing ? JSON.parse(existing) : [];
    
    // Add new record
    data.unshift(record);
    
    // Keep only last 365 days of data to prevent localStorage bloat
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    const filteredData = data.filter(item => 
      new Date(item.fixedDate) >= oneYearAgo
    );
    
    // Save back to localStorage
    localStorage.setItem('daily-progress-history', JSON.stringify(filteredData));
    
    console.log('📅 Daily progress: Recorded fixed issue:', {
      type: issue.type,
      category,
      severity: issue.severity,
      fixMethod,
      date: fixedDate
    });

    // Trigger storage event for components listening
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'daily-progress-history',
      newValue: JSON.stringify(filteredData),
      oldValue: existing
    }));

  } catch (error) {
    console.error('Error recording fixed issue for daily progress:', error);
  }
};

export const getDailyProgressStats = (days: number = 7) => {
  try {
    const stored = localStorage.getItem('daily-progress-history');
    const data: FixedIssueRecord[] = stored ? JSON.parse(stored) : [];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredData = data.filter(record => 
      new Date(record.fixedDate) >= cutoffDate
    );
    
    // Group by date
    const byDate = filteredData.reduce((acc, record) => {
      const date = record.fixedDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as Record<string, FixedIssueRecord[]>);
    
    // Group by category
    const byCategory = filteredData.reduce((acc, record) => {
      const category = record.issue.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by severity
    const bySeverity = filteredData.reduce((acc, record) => {
      const severity = record.issue.severity;
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalFixes: filteredData.length,
      byDate,
      byCategory,
      bySeverity,
      data: filteredData
    };
  } catch (error) {
    console.error('Error getting daily progress stats:', error);
    return {
      totalFixes: 0,
      byDate: {},
      byCategory: {},
      bySeverity: {},
      data: []
    };
  }
};
