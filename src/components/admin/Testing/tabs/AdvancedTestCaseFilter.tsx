import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, RotateCcw, Clock, Shield, Database, Briefcase, AlertTriangle } from 'lucide-react';
import { AdvancedTestFilters, TestExecutionMetrics } from '@/services/enhancedTestingService';

interface AdvancedTestCaseFilterProps {
  filters: AdvancedTestFilters;
  onFiltersChange: (filters: AdvancedTestFilters) => void;
  metrics: TestExecutionMetrics;
}

export const AdvancedTestCaseFilter: React.FC<AdvancedTestCaseFilterProps> = ({
  filters,
  onFiltersChange,
  metrics
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (key: keyof AdvancedTestFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      // Type-safe assignment for each key with proper type casting
      switch (key) {
        case 'suite_type':
        case 'test_status':
        case 'module_name':
        case 'topic':
        case 'coverage_area':
        case 'business_function':
          newFilters[key] = value;
          break;
        case 'created_within':
        case 'last_executed_within':
        case 'last_updated_within':
          newFilters[key] = value as 'hour' | 'day' | 'week' | 'month';
          break;
        case 'execution_status':
          newFilters[key] = value as 'never_executed' | 'recently_executed' | 'stale' | 'failed_last_run';
          break;
        case 'test_category':
          newFilters[key] = value as 'technical' | 'system' | 'business' | 'security' | 'compliance';
          break;
        case 'compliance_level':
          newFilters[key] = value as 'IQ' | 'OQ' | 'PQ' | 'validation_plan';
          break;
        case 'risk_level':
          newFilters[key] = value as 'low' | 'medium' | 'high' | 'critical';
          break;
        case 'auto_generated':
          newFilters[key] = value === 'true';
          break;
      }
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Test Case Filtering
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600">Total Tests</div>
            <div className="text-xl font-bold text-blue-800">{metrics.totalTests}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600">Executed</div>
            <div className="text-xl font-bold text-green-800">{metrics.executedTests}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm text-yellow-600">Pending</div>
            <div className="text-xl font-bold text-yellow-800">{metrics.pendingTests}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm text-red-600">Failed</div>
            <div className="text-xl font-bold text-red-800">{metrics.failedTests}</div>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Filters</TabsTrigger>
            <TabsTrigger value="execution">Execution Status</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search test cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Test Suite Type</label>
                <Select value={filters.suite_type || 'all'} onValueChange={(value) => handleFilterChange('suite_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="unit">Unit Tests</SelectItem>
                    <SelectItem value="integration">Integration Tests</SelectItem>
                    <SelectItem value="system">System Tests</SelectItem>
                    <SelectItem value="regression">Regression Tests</SelectItem>
                    <SelectItem value="api_integration">API Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Test Status</label>
                <Select value={filters.test_status || 'all'} onValueChange={(value) => handleFilterChange('test_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="skipped">Skipped</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Module</label>
                <Select value={filters.module_name || 'all'} onValueChange={(value) => handleFilterChange('module_name', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Modules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="User Management">User Management</SelectItem>
                    <SelectItem value="Patient Management">Patient Management</SelectItem>
                    <SelectItem value="API Integration">API Integration</SelectItem>
                    <SelectItem value="Security & Compliance">Security & Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="execution" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Execution Status
                </label>
                <Select value={filters.execution_status || 'all'} onValueChange={(value) => handleFilterChange('execution_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Execution States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="never_executed">Never Executed</SelectItem>
                    <SelectItem value="recently_executed">Recently Executed</SelectItem>
                    <SelectItem value="stale">Stale (7+ days)</SelectItem>
                    <SelectItem value="failed_last_run">Failed Last Run</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Last Executed</label>
                <Select value={filters.last_executed_within || 'all'} onValueChange={(value) => handleFilterChange('last_executed_within', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Time</SelectItem>
                    <SelectItem value="hour">Last Hour</SelectItem>
                    <SelectItem value="day">Last Day</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Last Updated</label>
                <Select value={filters.last_updated_within || 'all'} onValueChange={(value) => handleFilterChange('last_updated_within', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Time</SelectItem>
                    <SelectItem value="hour">Last Hour</SelectItem>
                    <SelectItem value="day">Last Day</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Created Within</label>
                <Select value={filters.created_within || 'all'} onValueChange={(value) => handleFilterChange('created_within', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Time</SelectItem>
                    <SelectItem value="hour">Last Hour ({metrics.newTests} new)</SelectItem>
                    <SelectItem value="day">Last Day</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Test Category
                </label>
                <Select value={filters.test_category || 'all'} onValueChange={(value) => handleFilterChange('test_category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technical">Technical ({metrics.technicalTests})</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="business">Business ({metrics.businessTests})</SelectItem>
                    <SelectItem value="security">Security ({metrics.securityTests})</SelectItem>
                    <SelectItem value="compliance">Compliance ({metrics.complianceTests})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Coverage Area</label>
                <Select value={filters.coverage_area || 'all'} onValueChange={(value) => handleFilterChange('coverage_area', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Business Function</label>
                <Select value={filters.business_function || 'all'} onValueChange={(value) => handleFilterChange('business_function', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Functions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Functions</SelectItem>
                    <SelectItem value="User Administration">User Administration</SelectItem>
                    <SelectItem value="Patient Care">Patient Care</SelectItem>
                    <SelectItem value="Data Exchange">Data Exchange</SelectItem>
                    <SelectItem value="Risk Management">Risk Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Auto Generated</label>
                <Select value={filters.auto_generated?.toString() || 'all'} onValueChange={(value) => handleFilterChange('auto_generated', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tests</SelectItem>
                    <SelectItem value="true">Auto-Generated</SelectItem>
                    <SelectItem value="false">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Compliance Level
                </label>
                <Select value={filters.compliance_level || 'all'} onValueChange={(value) => handleFilterChange('compliance_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="IQ">IQ - Installation Qualification</SelectItem>
                    <SelectItem value="OQ">OQ - Operational Qualification</SelectItem>
                    <SelectItem value="PQ">PQ - Performance Qualification</SelectItem>
                    <SelectItem value="validation_plan">Validation Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Level
                </label>
                <Select value={filters.risk_level || 'all'} onValueChange={(value) => handleFilterChange('risk_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Risk Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="critical">Critical Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <Select value={filters.topic || 'all'} onValueChange={(value) => handleFilterChange('topic', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="Authentication & Authorization">Authentication & Authorization</SelectItem>
                    <SelectItem value="Regulatory Compliance">Regulatory Compliance</SelectItem>
                    <SelectItem value="Data Privacy">Data Privacy</SelectItem>
                    <SelectItem value="System Integration">System Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {key.replace(/_/g, ' ')}: {String(value)}
                <button
                  onClick={() => handleFilterChange(key as keyof AdvancedTestFilters, '')}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
