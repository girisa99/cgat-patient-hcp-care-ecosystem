
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeStats {
  recentActivity: number;
  activeUsers: number;
  systemAlerts: number;
  lastUpdated: Date;
}

interface RealTimeDashboardStatsProps {
  users: any[];
  realTimeStats: any;
  meta: any;
}

export const RealTimeDashboardStats: React.FC<RealTimeDashboardStatsProps> = ({ 
  users, 
  realTimeStats, 
  meta 
}) => {
  const [stats, setStats] = useState<RealTimeStats>({
    recentActivity: 0,
    activeUsers: 0,
    systemAlerts: 0,
    lastUpdated: new Date()
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('🔄 Setting up real-time dashboard stats...');
    
    // Set up real-time listener for audit logs
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          console.log('📊 New audit log received:', payload);
          setStats(prev => ({
            ...prev,
            recentActivity: prev.recentActivity + 1,
            lastUpdated: new Date()
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('👤 New user registered:', payload);
          setStats(prev => ({
            ...prev,
            activeUsers: prev.activeUsers + 1,
            lastUpdated: new Date()
          }));
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Fetch initial stats
    const fetchInitialStats = async () => {
      try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        const { count: recentActivity } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneHourAgo.toISOString());

        const { count: activeUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          recentActivity: recentActivity || 0,
          activeUsers: activeUsers || users.length,
          systemAlerts: 0, // This would come from a monitoring system
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('❌ Error fetching initial stats:', error);
      }
    };

    fetchInitialStats();

    return () => {
      console.log('🔌 Cleaning up real-time dashboard connection');
      supabase.removeChannel(channel);
    };
  }, [users]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Real-time Activity Dashboard
          </span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Live' : 'Disconnected'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.recentActivity}</p>
                <p className="text-sm text-muted-foreground">Activity (1h)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{realTimeStats?.totalUsers || users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.systemAlerts}</p>
                <p className="text-sm text-muted-foreground">System Alerts</p>
              </div>
            </div>
          </div>
          
          {/* Real-time stats comparison */}
          {realTimeStats && (
            <div className="mt-4 p-3 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">📊 Live Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-900">{realTimeStats.totalUsers}</div>
                  <div className="text-blue-700">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-900">{realTimeStats.verifiedUsers}</div>
                  <div className="text-green-700">Verified</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-900">{realTimeStats.totalPermissions}</div>
                  <div className="text-purple-700">Permissions</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-900">{realTimeStats.totalFacilities}</div>
                  <div className="text-orange-700">Facilities</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Last updated: {stats.lastUpdated.toLocaleTimeString()}</span>
            </div>
            <span>Data Source: {meta?.dataSource || 'Unified Management'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
