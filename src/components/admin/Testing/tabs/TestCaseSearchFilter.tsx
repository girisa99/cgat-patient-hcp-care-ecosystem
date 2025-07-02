
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

interface TestCaseFilters {
  suite_type?: string;
  test_status?: string;
  functionality?: string;
  module_name?: string;
  topic?: string;
  coverage_area?: string;
  business_function?: string;
}

interface TestCaseSearchFilterProps {
  filters: TestCaseFilters;
  onFiltersChange: (filters: TestCaseFilters) => void;
  testStatistics: any;
}

export const TestCaseSearchFilter: React.FC<TestCaseSearchFilterProps> = ({
  filters,
  onFiltersChange,
  testStatistics
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.functionality || '');

  const handleFilterChange = (key: keyof TestCaseFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleFilterChange('functionality', value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  const suiteTypes = [
    { value: 'unit', label: 'Unit Tests' },
    { value: 'integration', label: 'Integration Tests' },
    { value: 'system', label: 'System Tests' },
    { value: 'regression', label: 'Regression Tests' },
    { value: 'api_integration', label: 'API Integration' },
    { value: 'uat', label: 'User Acceptance Tests' }
  ];

  const testStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'passed', label: 'Passed' },
    { value: 'failed', label: 'Failed' },
    { value: 'skipped', label: 'Skipped' },
    { value: 'blocked', label: 'Blocked' }
  ];

  // Helper function to safely get count values
  const getCount = (obj: any, key: string): number => {
    return typeof obj?.[key] === 'number' ? obj[key] : 0;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Test Case Filters
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
      <CardContent className="space-y-4">
        {/* Search by functionality */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by functionality name..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Test Suite Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Test Suite Type</label>
            <Select value={filters.suite_type || 'all'} onValueChange={(value) => handleFilterChange('suite_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Suite Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suite Types</SelectItem>
                {suiteTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} ({getCount(testStatistics.testsByType, type.value)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Test Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Test Status</label>
            <Select value={filters.test_status || 'all'} onValueChange={(value) => handleFilterChange('test_status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {testStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label} ({getCount(testStatistics.testsByStatus, status.value)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Module Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Module</label>
            <Select value={filters.module_name || 'all'} onValueChange={(value) => handleFilterChange('module_name', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {Object.entries(testStatistics.testsByModule || {}).map(([module, count]) => (
                  <SelectItem key={module} value={module}>
                    {module} ({typeof count === 'number' ? count : 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div>
            <label className="text-sm font-medium mb-2 block">Topic</label>
            <Select value={filters.topic || 'all'} onValueChange={(value) => handleFilterChange('topic', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {Object.entries(testStatistics.testsByTopic || {}).map(([topic, count]) => (
                  <SelectItem key={topic} value={topic}>
                    {topic} ({typeof count === 'number' ? count : 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Coverage Area */}
          <div>
            <label className="text-sm font-medium mb-2 block">Coverage Area</label>
            <Select value={filters.coverage_area || 'all'} onValueChange={(value) => handleFilterChange('coverage_area', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Coverage Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coverage Areas</SelectItem>
                {Object.entries(testStatistics.testsByCoverageArea || {}).map(([area, count]) => (
                  <SelectItem key={area} value={area}>
                    {area} ({typeof count === 'number' ? count : 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Function */}
          <div>
            <label className="text-sm font-medium mb-2 block">Business Function</label>
            <Select value={filters.business_function || 'all'} onValueChange={(value) => handleFilterChange('business_function', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Business Functions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Business Functions</SelectItem>
                {Object.entries(testStatistics.testsByBusinessFunction || {}).map(([func, count]) => (
                  <SelectItem key={func} value={func}>
                    {func} ({typeof count === 'number' ? count : 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {key.replace('_', ' ')}: {value}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange(key as keyof TestCaseFilters, '')}
                />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
