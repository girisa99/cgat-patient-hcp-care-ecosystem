
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Eye, Grid, List } from 'lucide-react';

interface EnhancedUserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  verificationFilter: string;
  onVerificationFilterChange: (value: string) => void;
  viewMode: 'table' | 'detailed';
  onViewModeChange: (mode: 'table' | 'detailed') => void;
  resultsCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

const EnhancedUserFilters: React.FC<EnhancedUserFiltersProps> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  verificationFilter,
  onVerificationFilterChange,
  viewMode,
  onViewModeChange,
  resultsCount,
  totalCount,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || roleFilter !== 'all' || verificationFilter !== 'all';

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
      {/* Top Row: Search and View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className="h-7 w-7 p-0"
          >
            <List className="h-3 w-3" />
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('detailed')}
            className="h-7 w-7 p-0"
          >
            <Grid className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Bottom Row: Filters and Results */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="no-role">No Role</SelectItem>
              <SelectItem value="superAdmin">Super Admin</SelectItem>
              <SelectItem value="healthcareProvider">Healthcare Provider</SelectItem>
              <SelectItem value="nurse">Nurse</SelectItem>
              <SelectItem value="caseManager">Care Manager</SelectItem>
              <SelectItem value="onboardingTeam">Onboarding Team</SelectItem>
              <SelectItem value="patientCaregiver">Patient/Caregiver</SelectItem>
            </SelectContent>
          </Select>

          <Select value={verificationFilter} onValueChange={onVerificationFilterChange}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Pending</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {resultsCount} of {totalCount}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserFilters;
