
import React from 'react';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, CheckCircle, AlertTriangle } from 'lucide-react';

interface ImplementationTabContentProps {
  syncData: TabSyncData;
}

const ImplementationTabContent: React.FC<ImplementationTabContentProps> = ({
  syncData
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Implementation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{syncData.totalFixedCount}</div>
              <div className="text-sm text-gray-600">Total Implementations</div>
              <Badge variant="default" className="mt-2 bg-green-600">Complete</Badge>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{syncData.realFixesApplied}</div>
              <div className="text-sm text-gray-600">Manual Fixes Applied</div>
              <Badge variant="outline" className="mt-2">User Applied</Badge>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{syncData.backendFixedCount}</div>
              <div className="text-sm text-gray-600">Auto-Detected Fixes</div>
              <Badge variant="outline" className="mt-2 bg-purple-50">Backend</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImplementationTabContent;
