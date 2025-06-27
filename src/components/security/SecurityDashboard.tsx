
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Server,
  Lock,
  Eye,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import SecurityMetrics from './SecurityMetrics';
import PerformanceMonitor from './PerformanceMonitor';
import ComplianceStatus from './ComplianceStatus';

const SecurityDashboard: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(new Date());

  const handleSecurityScan = async () => {
    setIsScanning(true);
    // Simulate security scan
    setTimeout(() => {
      setIsScanning(false);
      setLastScanTime(new Date());
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Security Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Security & Performance Overview
            </div>
            <Button 
              onClick={handleSecurityScan}
              disabled={isScanning}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Run Security Scan'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">Secure</p>
                <p className="text-sm text-muted-foreground">System Status</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">98.5%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">1.2s</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Last Scan</p>
                <p className="text-xs text-muted-foreground">
                  {lastScanTime.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <SecurityMetrics />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
