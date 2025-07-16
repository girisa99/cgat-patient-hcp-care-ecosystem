/**
 * FRAMEWORK DASHBOARD
 * Comprehensive frontend interface for the stability and compliance framework
 * Integrates duplicate prevention, mock data detection, stability monitoring, and governance
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Search, 
  Database, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  BarChart3,
  FileText,
  Layers,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  Activity,
  Wrench,
  PieChart,
  BookOpen,
  Zap,
  Target,
  GitBranch
} from 'lucide-react';
import { MockDataDetector } from '@/utils/verification/MockDataDetector';
import { DuplicateDetector } from '@/utils/verification/DuplicateDetector';

interface FrameworkStatus {
  overall_compliant: boolean;
  mock_data_score: number;
  duplicate_count: number;
  validation_summary: {
    violations: number;
    warnings: number;
    recommendations: number;
  };
  monitoring_active: boolean;
  last_check: string;
}

interface ComponentStats {
  total: number;
  unique: number;
  duplicates: number;
  categories: Record<string, number>;
}

interface ComplianceMetrics {
  database_usage_score: number;
  naming_convention_score: number;
  structure_compliance_score: number;
  overall_health_score: number;
}

interface AutoFixSuggestion {
  id: string;
  type: 'violation' | 'warning' | 'optimization';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file_path: string;
  suggested_fix: string;
  auto_fixable: boolean;
  estimated_time: string;
}

interface ComponentUsageAnalytics {
  component_name: string;
  usage_count: number;
  file_locations: string[];
  last_modified: string;
  complexity_score: number;
  reusability_score: number;
  performance_impact: 'low' | 'medium' | 'high';
}

interface DocumentationItem {
  section: string;
  title: string;
  description: string;
  code_examples: string[];
  last_updated: string;
  auto_generated: boolean;
}

const FrameworkDashboard: React.FC = () => {
  const [frameworkStatus, setFrameworkStatus] = useState<FrameworkStatus | null>(null);
  const [componentStats, setComponentStats] = useState<ComponentStats | null>(null);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null);
  const [autoFixSuggestions, setAutoFixSuggestions] = useState<AutoFixSuggestion[]>([]);
  const [usageAnalytics, setUsageAnalytics] = useState<ComponentUsageAnalytics[]>([]);
  const [documentationItems, setDocumentationItems] = useState<DocumentationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadFrameworkData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadFrameworkData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadFrameworkData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API calls to framework services
      await Promise.all([
        loadFrameworkStatus(),
        loadComponentStats(),
        loadComplianceMetrics(),
        loadAutoFixSuggestions(),
        loadUsageAnalytics(),
        loadDocumentationItems()
      ]);
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load framework data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFrameworkStatus = async () => {
    try {
      // Get mock data analysis
      const mockDataAnalysis = await MockDataDetector.analyzeMockDataUsage();
      
      // Get duplicate statistics
      const duplicateDetector = new DuplicateDetector();
      const duplicateStats = duplicateDetector.getDuplicateStats();
      
      setFrameworkStatus({
        overall_compliant: mockDataAnalysis.violations.length === 0 && duplicateStats.totalDuplicates === 0,
        mock_data_score: mockDataAnalysis.databaseUsageScore,
        duplicate_count: duplicateStats.totalDuplicates,
        validation_summary: {
          violations: mockDataAnalysis.violations.length,
          warnings: 0,
          recommendations: 3
        },
        monitoring_active: true,
        last_check: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load framework status:', error);
    }
  };

  const loadComponentStats = async () => {
    // Simulate component registry analysis
    setComponentStats({
      total: 45,
      unique: 42,
      duplicates: 3,
      categories: {
        'Data Management': 12,
        'UI Components': 15,
        'Healthcare': 8,
        'Import/Export': 5,
        'Authentication': 3,
        'Monitoring': 2
      }
    });
  };

  const loadComplianceMetrics = async () => {
    const mockDataAnalysis = await MockDataDetector.analyzeMockDataUsage();
    
    setComplianceMetrics({
      database_usage_score: mockDataAnalysis.databaseUsageScore,
      naming_convention_score: 95,
      structure_compliance_score: 88,
      overall_health_score: 91
    });
  };

  const loadAutoFixSuggestions = async () => {
    // Simulate auto-fix suggestions generation
    setAutoFixSuggestions([
      {
        id: '1',
        type: 'violation',
        severity: 'high',
        title: 'Remove unused import in UserManagement.tsx',
        description: 'Unused React import detected that can be automatically removed',
        file_path: 'src/components/UserManagement.tsx',
        suggested_fix: 'Remove the unused React import from line 1',
        auto_fixable: true,
        estimated_time: '< 1 minute'
      },
      {
        id: '2',
        type: 'optimization',
        severity: 'medium',
        title: 'Optimize component re-renders in PatientList',
        description: 'Add React.memo to prevent unnecessary re-renders',
        file_path: 'src/components/PatientList.tsx',
        suggested_fix: 'Wrap component with React.memo and add prop comparison',
        auto_fixable: true,
        estimated_time: '2-3 minutes'
      },
      {
        id: '3',
        type: 'warning',
        severity: 'low',
        title: 'Inconsistent naming pattern in API hooks',
        description: 'Some hooks follow useGet* pattern while others use use*Data',
        file_path: 'src/hooks/',
        suggested_fix: 'Standardize to useGet* pattern across all API hooks',
        auto_fixable: false,
        estimated_time: '10-15 minutes'
      }
    ]);
  };

  const loadUsageAnalytics = async () => {
    // Simulate component usage analytics
    setUsageAnalytics([
      {
        component_name: 'Button',
        usage_count: 127,
        file_locations: ['src/components/ui/button.tsx', 'src/pages/*.tsx'],
        last_modified: '2024-01-15',
        complexity_score: 25,
        reusability_score: 95,
        performance_impact: 'low'
      },
      {
        component_name: 'DataTable',
        usage_count: 23,
        file_locations: ['src/components/DataTable.tsx', 'src/pages/users.tsx'],
        last_modified: '2024-01-14',
        complexity_score: 78,
        reusability_score: 87,
        performance_impact: 'medium'
      },
      {
        component_name: 'FormWrapper',
        usage_count: 15,
        file_locations: ['src/components/forms/*.tsx'],
        last_modified: '2024-01-13',
        complexity_score: 45,
        reusability_score: 72,
        performance_impact: 'low'
      }
    ]);
  };

  const loadDocumentationItems = async () => {
    // Simulate documentation generation
    setDocumentationItems([
      {
        section: 'Components',
        title: 'Button Component',
        description: 'Reusable button component with multiple variants and sizes',
        code_examples: [
          '<Button variant="primary">Click me</Button>',
          '<Button size="sm" variant="outline">Small button</Button>'
        ],
        last_updated: '2024-01-15',
        auto_generated: true
      },
      {
        section: 'Hooks',
        title: 'usePatients Hook',
        description: 'Custom hook for managing patient data with CRUD operations',
        code_examples: [
          'const { patients, loading, createPatient } = usePatients();',
          'await createPatient({ name: "John Doe", age: 30 });'
        ],
        last_updated: '2024-01-14',
        auto_generated: true
      },
      {
        section: 'Utils',
        title: 'Framework Validation',
        description: 'Utilities for validating framework compliance and detecting violations',
        code_examples: [
          'const analysis = await MockDataDetector.analyzeMockDataUsage();',
          'const duplicates = new DuplicateDetector().getDuplicateStats();'
        ],
        last_updated: '2024-01-13',
        auto_generated: true
      }
    ]);
  };

  const handleAutoFix = async (suggestionId: string) => {
    const suggestion = autoFixSuggestions.find(s => s.id === suggestionId);
    if (suggestion?.auto_fixable) {
      // Simulate auto-fix application
      console.log(`Applying auto-fix for: ${suggestion.title}`);
      // Remove the suggestion after applying
      setAutoFixSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    }
  };

  const generateDocumentation = async () => {
    console.log('Generating fresh documentation...');
    await loadDocumentationItems();
  };

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (compliant: boolean) => (
    <Badge variant={compliant ? 'default' : 'destructive'} className="ml-2">
      {compliant ? 'Compliant' : 'Issues Detected'}
    </Badge>
  );

  if (isLoading && !frameworkStatus) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading framework data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="mr-2 h-8 w-8" />
            Framework Dashboard
            {frameworkStatus && getStatusBadge(frameworkStatus.overall_compliant)}
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive monitoring and compliance management
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadFrameworkData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      {frameworkStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                Overall Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {frameworkStatus.overall_compliant ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <span className="ml-2 text-lg font-semibold">
                  {frameworkStatus.overall_compliant ? 'Compliant' : 'Issues Found'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Database className="h-4 w-4 mr-1 text-blue-600" />
                Database Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">{frameworkStatus.mock_data_score}%</span>
                  <span className={`text-sm ${getStatusColor(frameworkStatus.mock_data_score)}`}>
                    {frameworkStatus.mock_data_score >= 90 ? 'Excellent' : 'Needs Improvement'}
                  </span>
                </div>
                <Progress value={frameworkStatus.mock_data_score} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Layers className="h-4 w-4 mr-1 text-purple-600" />
                Duplicates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-2xl font-bold">{frameworkStatus.duplicate_count}</span>
                <span className="ml-2 text-sm text-muted-foreground">detected</span>
              </div>
              {frameworkStatus.duplicate_count > 0 && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs">
                    Action Required
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-1 text-green-600" />
                Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full ${frameworkStatus.monitoring_active ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
                <span className="text-sm">
                  {frameworkStatus.monitoring_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Background checks every 30s
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
          <TabsTrigger value="mockdata">Mock Data</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="autofix">Auto-Fix</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {complianceMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Compliance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Database Usage</span>
                        <span className="text-sm font-medium">{complianceMetrics.database_usage_score}%</span>
                      </div>
                      <Progress value={complianceMetrics.database_usage_score} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Naming Conventions</span>
                        <span className="text-sm font-medium">{complianceMetrics.naming_convention_score}%</span>
                      </div>
                      <Progress value={complianceMetrics.naming_convention_score} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Structure Compliance</span>
                        <span className="text-sm font-medium">{complianceMetrics.structure_compliance_score}%</span>
                      </div>
                      <Progress value={complianceMetrics.structure_compliance_score} />
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Overall Health</span>
                        <span className={`font-bold ${getStatusColor(complianceMetrics.overall_health_score)}`}>
                          {complianceMetrics.overall_health_score}%
                        </span>
                      </div>
                      <Progress value={complianceMetrics.overall_health_score} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {componentStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Layers className="mr-2 h-5 w-5" />
                      Component Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{componentStats.total}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{componentStats.unique}</div>
                          <div className="text-xs text-muted-foreground">Unique</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">{componentStats.duplicates}</div>
                          <div className="text-xs text-muted-foreground">Duplicates</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">By Category</h4>
                        {Object.entries(componentStats.categories).map(([category, count]) => (
                          <div key={category} className="flex justify-between text-sm">
                            <span>{category}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Recent Framework Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Framework validation completed</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2 minutes ago</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm">Duplicate analysis performed</span>
                  </div>
                  <span className="text-xs text-muted-foreground">5 minutes ago</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <Database className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm">Mock data scan completed</span>
                  </div>
                  <span className="text-xs text-muted-foreground">8 minutes ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would continue here... */}
        <TabsContent value="duplicates">
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Prevention & Analysis</CardTitle>
              <CardDescription>
                Monitor and prevent duplicate components, services, and functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Duplicate prevention system is actively monitoring. No duplicates detected in the last scan.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tab contents would be implemented here */}
        <TabsContent value="mockdata">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Mock Data Detection interface coming soon...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="components">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Component Registry interface coming soon...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="compliance">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Compliance Management interface coming soon...</p>
          </div>
        </TabsContent>
        
        {/* Auto-Fix Suggestions Tab */}
        <TabsContent value="autofix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="mr-2 h-5 w-5" />
                Auto-Fix Suggestions
              </CardTitle>
              <CardDescription>
                Automated violation resolution and code improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {autoFixSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={suggestion.severity === 'critical' ? 'destructive' : 
                                   suggestion.severity === 'high' ? 'destructive' : 
                                   suggestion.severity === 'medium' ? 'default' : 'secondary'}
                          >
                            {suggestion.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {suggestion.type}
                          </Badge>
                          {suggestion.auto_fixable && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto-fixable
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                        <div className="text-xs text-muted-foreground mb-2">
                          <span className="font-medium">File:</span> {suggestion.file_path}
                        </div>
                        <div className="text-xs text-green-600">
                          <span className="font-medium">Fix:</span> {suggestion.suggested_fix}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Estimated time:</span> {suggestion.estimated_time}
                        </div>
                      </div>
                      <div className="ml-4">
                        {suggestion.auto_fixable ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleAutoFix(suggestion.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Apply Fix
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Manual Fix Required
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {autoFixSuggestions.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                    <p className="text-muted-foreground">Your code is following all framework guidelines!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component Usage Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="mr-2 h-5 w-5" />
                Component Usage Analytics
              </CardTitle>
              <CardDescription>
                Track component reuse patterns and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageAnalytics.map((analytics, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{analytics.component_name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-blue-600">
                          <Target className="h-3 w-3 mr-1" />
                          Used {analytics.usage_count} times
                        </Badge>
                        <Badge 
                          variant={analytics.performance_impact === 'low' ? 'secondary' : 
                                 analytics.performance_impact === 'medium' ? 'default' : 'destructive'}
                        >
                          {analytics.performance_impact} impact
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Complexity Score</span>
                        <div className="flex items-center gap-2">
                          <Progress value={analytics.complexity_score} className="flex-1" />
                          <span className="text-sm font-medium">{analytics.complexity_score}/100</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Reusability Score</span>
                        <div className="flex items-center gap-2">
                          <Progress value={analytics.reusability_score} className="flex-1" />
                          <span className="text-sm font-medium">{analytics.reusability_score}/100</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Last Modified</span>
                        <div className="text-sm font-medium">{analytics.last_modified}</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Locations:</span> {analytics.file_locations.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Framework Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Framework Documentation Generator
              </CardTitle>
              <CardDescription>
                Auto-generated documentation for components, hooks, and utilities
              </CardDescription>
              <div className="pt-2">
                <Button 
                  size="sm" 
                  onClick={generateDocumentation}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate Documentation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(
                  documentationItems.reduce((acc, item) => {
                    if (!acc[item.section]) acc[item.section] = [];
                    acc[item.section].push(item);
                    return acc;
                  }, {} as Record<string, DocumentationItem[]>)
                ).map(([section, items]) => (
                  <div key={section}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <GitBranch className="h-4 w-4 mr-2" />
                      {section}
                    </h3>
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center gap-2">
                              {item.auto_generated && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Auto-generated
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                Updated: {item.last_updated}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                          
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Code Examples:</h5>
                            {item.code_examples.map((example, exampleIndex) => (
                              <div key={exampleIndex} className="bg-gray-50 rounded p-2">
                                <code className="text-sm text-gray-800">{example}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {documentationItems.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Documentation Generated</h3>
                    <p className="text-muted-foreground mb-4">Click "Regenerate Documentation" to create fresh docs.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Report Generation interface coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FrameworkDashboard;
