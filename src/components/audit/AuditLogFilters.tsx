
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';

interface AuditLogFiltersProps {
  filters: {
    action_type?: string;
    table_name?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export const AuditLogFilters = ({ filters, onFiltersChange, onClearFilters }: AuditLogFiltersProps) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="action-filter">Action Type</Label>
            <Select
              value={filters.action_type || ''}
              onValueChange={(value) => handleFilterChange('action_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                <SelectItem value="INSERT">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="table-filter">Table</Label>
            <Select
              value={filters.table_name || ''}
              onValueChange={(value) => handleFilterChange('table_name', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All tables" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All tables</SelectItem>
                <SelectItem value="profiles">Profiles</SelectItem>
                <SelectItem value="user_roles">User Roles</SelectItem>
                <SelectItem value="facilities">Facilities</SelectItem>
                <SelectItem value="modules">Modules</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
