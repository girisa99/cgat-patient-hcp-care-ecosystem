
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, CheckCircle, Clock, Database } from 'lucide-react';
import { getDailyFixStats, getHistoricalFixedIssues, DailyFixStats } from '@/utils/dailyProgressTracker';

interface EnhancedDailyProgressTabProps {
  className?: string;
}

interface HistoricalFix {
  id: string;
  user_id: string;
  issue_type: string;
  issue_message: string;
  issue_source: string;
  issue_severity: string;
  category: string;
  fix_method: string;
  fixed_at: string;
  created_at: string;
  metadata?: Record<string, any>;
}

const EnhancedDailyProgressTab: React.FC<EnhancedDailyProgressTabProps> = ({ className }) => {
  const [dailyStats, setDailyStats] = useState<DailyFixStats[]>([]);
  const [historicalFixes, setHistoricalFixes] = useState<HistoricalFix[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(7);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('📊 Loading daily progress data from database...');
        
        const [stats, fixes] = await Promise.all([
          getDailyFixStats(dateRange),
          getHistoricalFixedIssues(50)
        ]);
        
        console.log('✅ Loaded data:', { statsCount: stats.length, fixesCount: fixes.length });
        
        setDailyStats(stats);
        setHistoricalFixes(fixes as HistoricalFix[]);
      } catch (error) {
        console.error('Error loading daily progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dateRange]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-gray-600';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Group fixes by date with proper type checking
  const groupedFixes = historicalFixes.reduce((acc: Record<string, HistoricalFix[]>, fix) => {
    const date = new Date(fix.fixed_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(fix);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-500 font-medium">Loading daily progress data from database...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Database Integration Status */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Database className="h-5 w-5" />
            Database-Powered Daily Progress Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 text-sm">
            ✅ Connected to Supabase database for persistent issue tracking
            <br />
            📊 Displaying {Array.isArray(historicalFixes) ? historicalFixes.length : 0} historical fixes from database
            <br />
            📈 Daily statistics calculated from real database records
            <br />
            🔄 Database syncs automatically whenever verification system runs
          </p>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Array.isArray(historicalFixes) ? historicalFixes.length : 0}
            </div>
            <div className="text-sm text-gray-600">Total Fixes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{dailyStats.length}</div>
            <div className="text-sm text-gray-600">Active Days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {dailyStats.reduce((sum, stat) => sum + stat.fix_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Period Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(dailyStats.reduce((sum, stat) => sum + stat.fix_count, 0) / Math.max(dateRange, 1))}
            </div>
            <div className="text-sm text-gray-600">Daily Average</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Progress Display */}
      <div className="space-y-4">
        {Object.keys(groupedFixes).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 font-medium">No fixes recorded in database yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start fixing issues to see your daily progress here. Data syncs automatically with each verification run.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedFixes)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .slice(0, dateRange)
            .map(([date, fixes]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      {formatDate(date)}
                      <Badge variant="outline">{Array.isArray(fixes) ? fixes.length : 0} fixes</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(date).toLocaleDateString()}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(fixes) && fixes.map((fix) => (
                      <div key={fix.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{fix.issue_type}</span>
                            <Badge className={getSeverityColor(fix.issue_severity)}>
                              {fix.issue_severity}
                            </Badge>
                            <Badge variant="outline">{fix.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(fix.fixed_at).toLocaleTimeString()}
                            <Badge variant={fix.fix_method === 'manual' ? 'default' : 'secondary'}>
                              {fix.fix_method}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {fix.metadata?.description || fix.issue_message || 'No description available'}
                        </p>
                        <p className="text-xs text-gray-500">{fix.issue_message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Daily Statistics Summary */}
      {dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Daily Statistics Summary (Database-Powered)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatDate(stat.fix_date)}</span>
                    <Badge variant="outline">{stat.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{stat.fix_count} fixes</span>
                    <div className="flex gap-1">
                      {Object.entries(stat.severity_breakdown).map(([severity, count]) => (
                        <Badge key={severity} className={getSeverityColor(severity)} variant="outline">
                          {severity}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDailyProgressTab;
