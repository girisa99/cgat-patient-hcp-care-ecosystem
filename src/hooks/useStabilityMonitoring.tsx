import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface StabilityViolation {
  id: string;
  type: 'naming' | 'duplicate' | 'complexity' | 'update-first';
  severity: 'high' | 'medium' | 'low';
  message: string;
  file?: string;
  line?: number;
  timestamp: Date;
}

interface StabilityMetrics {
  violations: StabilityViolation[];
  totalFiles: number;
  complianceScore: number;
  lastScan: Date;
  isMonitoring: boolean;
}

export const useStabilityMonitoring = () => {
  const [metrics, setMetrics] = useState<StabilityMetrics>({
    violations: [],
    totalFiles: 0,
    complianceScore: 100,
    lastScan: new Date(),
    isMonitoring: false
  });
  const [isScanning, setIsScanning] = useState(false);
  // Using sonner toast directly

  const startMonitoring = useCallback(() => {
    setMetrics(prev => ({ ...prev, isMonitoring: true }));
    
    // Start periodic monitoring
    const interval = setInterval(() => {
      performStabilityCheck();
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
      setMetrics(prev => ({ ...prev, isMonitoring: false }));
    };
  }, []);

  const stopMonitoring = useCallback(() => {
    setMetrics(prev => ({ ...prev, isMonitoring: false }));
  }, []);

  const performStabilityCheck = useCallback(async () => {
    if (isScanning) return; // Prevent concurrent scans
    
    setIsScanning(true);
    
    try {
      // Simulate stability framework checks
      const violations = await simulateStabilityCheck();
      const complianceScore = calculateComplianceScore(violations);
      
      setMetrics(prev => ({
        ...prev,
        violations,
        complianceScore,
        lastScan: new Date(),
        totalFiles: Math.floor(Math.random() * 100) + 50
      }));

      // Notify about new high-severity violations
      const highSeverityViolations = violations.filter(v => v.severity === 'high');
      if (highSeverityViolations.length > 0) {
        toast.error("High Severity Violations Detected", {
          description: `${highSeverityViolations.length} critical issues need attention`
        });
      }

    } catch (error) {
      console.error('Stability check failed:', error);
      toast.error("Monitoring Error", {
        description: "Failed to perform stability check"
      });
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, toast]);

  const simulateStabilityCheck = async (): Promise<StabilityViolation[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const violations: StabilityViolation[] = [];
    
    // Generate random violations for demo
    const violationTypes: Array<{ type: StabilityViolation['type'], message: string, severity: StabilityViolation['severity'] }> = [
      { type: 'naming', message: 'Component name does not follow PascalCase convention', severity: 'high' },
      { type: 'duplicate', message: 'Duplicate code block detected', severity: 'medium' },
      { type: 'complexity', message: 'Function complexity exceeds threshold (15 > 10)', severity: 'medium' },
      { type: 'update-first', message: 'Similar component exists, consider updating instead', severity: 'low' }
    ];
    
    // Randomly generate 0-5 violations
    const numViolations = Math.floor(Math.random() * 6);
    
    for (let i = 0; i < numViolations; i++) {
      const template = violationTypes[Math.floor(Math.random() * violationTypes.length)];
      violations.push({
        id: `violation-${Date.now()}-${i}`,
        ...template,
        file: `src/${['components', 'hooks', 'services'][Math.floor(Math.random() * 3)]}/example${i + 1}.tsx`,
        line: Math.floor(Math.random() * 100) + 1,
        timestamp: new Date()
      });
    }
    
    return violations;
  };

  const calculateComplianceScore = (violations: StabilityViolation[]): number => {
    if (violations.length === 0) return 100;
    
    const severityWeights = { high: 3, medium: 2, low: 1 };
    const totalWeight = violations.reduce((sum, v) => sum + severityWeights[v.severity], 0);
    
    // Calculate compliance as a percentage (lower is worse)
    const maxPossibleWeight = violations.length * 3; // All high severity
    const compliancePercentage = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100);
    
    return Math.round(compliancePercentage);
  };

  const getViolationsByType = useCallback(() => {
    const byType = metrics.violations.reduce((acc, violation) => {
      acc[violation.type] = (acc[violation.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return byType;
  }, [metrics.violations]);

  const getViolationsBySeverity = useCallback(() => {
    const bySeverity = metrics.violations.reduce((acc, violation) => {
      acc[violation.severity] = (acc[violation.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return bySeverity;
  }, [metrics.violations]);

  const clearViolation = useCallback((violationId: string) => {
    setMetrics(prev => ({
      ...prev,
      violations: prev.violations.filter(v => v.id !== violationId)
    }));
    
    toast.success("Violation Cleared", {
      description: "The violation has been marked as resolved"
    });
  }, [toast]);

  const refreshMetrics = useCallback(() => {
    performStabilityCheck();
  }, [performStabilityCheck]);

  useEffect(() => {
    // Start monitoring on mount
    const cleanup = startMonitoring();
    
    return cleanup;
  }, [startMonitoring]);

  return {
    metrics,
    isScanning,
    startMonitoring,
    stopMonitoring,
    performStabilityCheck,
    getViolationsByType,
    getViolationsBySeverity,
    clearViolation,
    refreshMetrics
  };
};