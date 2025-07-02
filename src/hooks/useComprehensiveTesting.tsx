
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  comprehensiveTestingService, 
  ComprehensiveTestCase, 
  TestExecutionResult, 
  SystemFunctionality 
} from '@/services/comprehensiveTestingService';

interface UseComprehensiveTestingResult {
  // Data state
  testCases: ComprehensiveTestCase[];
  systemFunctionality: SystemFunctionality[];
  executionHistory: any[];
  testStatistics: any;
  
  // Loading states
  isLoading: boolean;
  isInitializing: boolean;
  isExecuting: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  initializeSystem: () => Promise<void>;
  detectFunctionality: () => Promise<void>;
  generateTestCases: (functionalityId?: string) => Promise<number>;
  executeTestSuite: (suiteType?: string, batchSize?: number) => Promise<TestExecutionResult>;
  refreshTestCases: (filters?: any) => Promise<void>;
  refreshFunctionality: (filters?: any) => Promise<void>;
  refreshStatistics: () => Promise<void>;
  
  // Metadata
  lastInitialized: Date | null;
  systemHealth: {
    totalFunctionality: number;
    totalTestCases: number;
    overallCoverage: number;
    criticalIssues: number;
  };
}

export const useComprehensiveTesting = (): UseComprehensiveTestingResult => {
  // State management
  const [testCases, setTestCases] = useState<ComprehensiveTestCase[]>([]);
  const [systemFunctionality, setSystemFunctionality] = useState<SystemFunctionality[]>([]);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [testStatistics, setTestStatistics] = useState<any>({});
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Error and metadata
  const [error, setError] = useState<string | null>(null);
  const [lastInitialized, setLastInitialized] = useState<Date | null>(null);
  
  const { toast } = useToast();

  // Initialize system
  const initializeSystem = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      console.log('🚀 Initializing comprehensive testing system...');
      
      const result = await comprehensiveTestingService.initializeComprehensiveTesting();
      
      setLastInitialized(new Date());
      
      toast({
        title: "✅ Comprehensive Testing Initialized",
        description: `Detected ${result.functionalityDetected} functions, generated ${result.testCasesGenerated} test cases. Coverage: ${result.coverageAnalysis.overallCoverage}%`,
      });

      // Refresh all data after initialization
      await Promise.all([
        refreshTestCases(),
        refreshFunctionality(),
        refreshStatistics()
      ]);
      
      console.log('✅ Comprehensive testing system fully initialized');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize system';
      setError(errorMessage);
      
      toast({
        title: "❌ Initialization Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error('❌ System initialization failed:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  // Detect functionality
  const detectFunctionality = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await comprehensiveTestingService.detectSystemFunctionality();
      await refreshFunctionality();
      
      toast({
        title: "✅ Functionality Detection Complete",
        description: "System functionality has been detected and registered",
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to detect functionality';
      setError(errorMessage);
      
      toast({
        title: "❌ Detection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate test cases
  const generateTestCases = async (functionalityId?: string): Promise<number> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const testCasesCreated = await comprehensiveTestingService.generateTestCases(functionalityId);
      await refreshTestCases();
      await refreshStatistics();
      
      toast({
        title: "✅ Test Cases Generated",
        description: `Generated ${testCasesCreated} comprehensive test cases`,
      });
      
      return testCasesCreated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate test cases';
      setError(errorMessage);
      
      toast({
        title: "❌ Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Execute test suite
  const executeTestSuite = async (suiteType?: string, batchSize?: number): Promise<TestExecutionResult> => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const result = await comprehensiveTestingService.executeTestSuite(suiteType, batchSize);
      
      // Refresh data after execution
      await Promise.all([
        refreshTestCases(),
        refreshStatistics()
      ]);
      
      toast({
        title: "✅ Test Suite Executed",
        description: `${result.passed_tests}/${result.total_tests} tests passed (${result.pass_rate.toFixed(1)}%)`,
        variant: result.pass_rate >= 80 ? "default" : "destructive",
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute test suite';
      setError(errorMessage);
      
      toast({
        title: "❌ Execution Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  // Refresh functions
  const refreshTestCases = async (filters?: any) => {
    try {
      const data = await comprehensiveTestingService.getTestCases(filters);
      setTestCases(data);
    } catch (err) {
      console.error('Failed to refresh test cases:', err);
    }
  };

  const refreshFunctionality = async (filters?: any) => {
    try {
      const data = await comprehensiveTestingService.getSystemFunctionality(filters);
      setSystemFunctionality(data);
    } catch (err) {
      console.error('Failed to refresh functionality:', err);
    }
  };

  const refreshStatistics = async () => {
    try {
      const stats = await comprehensiveTestingService.getTestStatistics();
      setTestStatistics(stats);
    } catch (err) {
      console.error('Failed to refresh statistics:', err);
    }
  };

  // System health calculation
  const systemHealth = {
    totalFunctionality: systemFunctionality.length,
    totalTestCases: testCases.length,
    overallCoverage: testStatistics.overallCoverage || 0,
    criticalIssues: testCases.filter(tc => tc.test_status === 'failed').length
  };

  // Auto-initialize on mount
  useEffect(() => {
    const autoInitialize = async () => {
      // Check if system has been initialized recently
      const lastInit = localStorage.getItem('comprehensive_testing_last_init');
      const now = new Date().getTime();
      const oneHourAgo = now - (60 * 60 * 1000);
      
      if (!lastInit || parseInt(lastInit) < oneHourAgo) {
        console.log('🔄 Auto-initializing comprehensive testing system...');
        await initializeSystem();
        localStorage.setItem('comprehensive_testing_last_init', now.toString());
      } else {
        // Just refresh existing data
        await Promise.all([
          refreshTestCases(),
          refreshFunctionality(),
          refreshStatistics()
        ]);
      }
    };

    autoInitialize();
  }, []);

  return {
    // Data state
    testCases,
    systemFunctionality,
    executionHistory,
    testStatistics,
    
    // Loading states
    isLoading,
    isInitializing,
    isExecuting,
    
    // Error state
    error,
    
    // Actions
    initializeSystem,
    detectFunctionality,
    generateTestCases,
    executeTestSuite,
    refreshTestCases,
    refreshFunctionality,
    refreshStatistics,
    
    // Metadata
    lastInitialized,
    systemHealth
  };
};
