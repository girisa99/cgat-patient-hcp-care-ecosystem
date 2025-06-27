
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const PerformanceTrendsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Performance Trends (Last 24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Response Time Trends</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Peak Performance</span>
                <span className="text-sm font-medium">0.8s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average</span>
                <span className="text-sm font-medium">1.2s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Slowest Response</span>
                <span className="text-sm font-medium">2.1s</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Resource Usage</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">64%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Disk I/O</span>
                <span className="text-sm font-medium">23%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Network Traffic</span>
                <span className="text-sm font-medium">156 MB</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrendsCard;
