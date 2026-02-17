/**
 * SYSTEM STATUS CHECKER
 * Comprehensive verification of all monitoring and stability systems
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Shield, 
  Eye, 
  Activity,
  FileSearch,
  Zap,
  Clock
} from 'lucide-react';
import { getStabilityFrameworkStatus } from '@/utils/framework/init';
import { useComplianceMonitoring } from '@/hooks/useComplianceMonitoring';

interface SystemCheck {
  name: string;
  status: 'active' | 'inactive' | 'error' | 'partial';
  description: string;
  details?: string;
  icon: React.ReactNode;
}

export const SystemStatusChecker: React.FC = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const {
    isMonitoring,
    complianceScore,
    violations,
    promptStats,
    monitor,
    interceptor
  } = useComplianceMonitoring();

  const performSystemCheck = async () => {
    setIsChecking(true);
    
    try {
      const results: SystemCheck[] = [];

      // 1. Stability Framework Check
      const frameworkStatus = getStabilityFrameworkStatus();
      results.push({
        name: 'Stability Framework',
        status: frameworkStatus.initialized ? 'active' : 'inactive',
        description: 'Core stability monitoring and enforcement system',
        details: frameworkStatus.initialized 
          ? `Monitoring: ${frameworkStatus.monitoring ? 'Active' : 'Inactive'}`
          : 'Framework not initialized',
        icon: <Shield className="h-4 w-4" />
      });

      // 2. Compliance Monitoring Check
      results.push({
        name: 'Compliance Monitoring',
        status: isMonitoring ? 'active' : 'inactive',
        description: 'Framework compliance and rule enforcement',
        details: isMonitoring 
          ? `Score: ${complianceScore}%, Violations: ${violations.length}`
          : 'Compliance monitoring not active',
        icon: <Eye className="h-4 w-4" />
      });

      // 3. Prompt Interception Check
      results.push({
        name: 'Prompt Interception',
        status: interceptor ? 'active' : 'inactive',
        description: 'Prompt governance and enhancement system',
        details: interceptor 
          ? `Processed: ${promptStats.totalPrompts}, Violations: ${promptStats.violationsFound}`
          : 'Prompt interceptor not initialized',
        icon: <Zap className="h-4 w-4" />
      });

      // 4. Code Generation Validation Check
      const hasCodeValidation = monitor && frameworkStatus.config?.enforcement?.buildChecks;
      results.push({
        name: 'Code Generation Validation',
        status: hasCodeValidation ? 'active' : 'partial',
        description: 'Automated code quality and compliance validation',
        details: hasCodeValidation 
          ? 'Build checks and validation active'
          : 'Basic validation only - no build checks',
        icon: <FileSearch className="h-4 w-4" />
      });

      // 5. File System Monitoring Check
      const hasFileMonitoring = frameworkStatus.monitoring;
      results.push({
        name: 'File System Monitoring',
        status: hasFileMonitoring ? 'active' : 'inactive',
        description: 'Real-time file change detection and analysis',
        details: hasFileMonitoring 
          ? 'Periodic monitoring active (30s intervals)'
          : 'File system monitoring disabled',
        icon: <Activity className="h-4 w-4" />
      });

      // 6. Duplicate Analyzer Check
      // Check if stability hooks are being used (indicates duplicate protection is available)
      const hasDuplicateProtection = typeof window !== 'undefined' && 
        window.localStorage.getItem('stability-hooks-initialized');
      results.push({
        name: 'Duplicate Analyzer',
        status: hasDuplicateProtection ? 'active' : 'partial',
        description: 'Detection and prevention of duplicate operations',
        details: hasDuplicateProtection 
          ? 'Stability hooks providing duplicate protection'
          : 'Basic duplicate detection available',
        icon: <RefreshCw className="h-4 w-4" />
      });

      setChecks(results);
      setLastCheck(new Date());
      
    } catch (error) {
      console.error('System check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    performSystemCheck();
    
    // Set up periodic checks every 30 seconds
    const interval = setInterval(performSystemCheck, 30000);
    
    return () => clearInterval(interval);
  }, [isMonitoring, complianceScore, violations.length, promptStats]);

  const getStatusColor = (status: SystemCheck['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'partial': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const activeCount = checks.filter(c => c.status === 'active').length;
  const partialCount = checks.filter(c => c.status === 'partial').length;
  const inactiveCount = checks.filter(c => c.status === 'inactive').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Status Overview
            </CardTitle>
            <CardDescription>
              Real-time verification of monitoring and stability systems
            </CardDescription>
          </div>
          <Button 
            onClick={performSystemCheck} 
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {activeCount} Active
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {partialCount} Partial
            </Badge>
            <Badge variant="outline" className="gap-1">
              <XCircle className="h-3 w-3" />
              {inactiveCount} Inactive
            </Badge>
            {lastCheck && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                <Clock className="h-3 w-3" />
                Last check: {lastCheck.toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {checks.map((check, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-1">
                      {check.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{check.name}</h3>
                        {getStatusIcon(check.status)}
                      </div>
                      <p className="text-sm opacity-80 mb-2">{check.description}</p>
                      {check.details && (
                        <p className="text-xs opacity-70">{check.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {(inactiveCount > 0 || checks.some(c => c.status === 'error')) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some monitoring systems are not fully active. This may impact code quality enforcement and stability monitoring.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};