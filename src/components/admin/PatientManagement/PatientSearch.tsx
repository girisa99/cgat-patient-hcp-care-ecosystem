
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SearchFilter {
  field: string;
  operator: string;
  value: string;
}

interface PatientSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchableFields?: string[];
  isSearching?: boolean;
  onClearSearch?: () => void;
  onAddFilter?: (filter: SearchFilter) => void;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({
  searchTerm,
  setSearchTerm,
  searchableFields = [],
  isSearching = false,
  onClearSearch,
  onAddFilter
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search patients by name, email, or phone..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={onClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Advanced Filters</span>
        </Button>
        
        {isSearching && (
          <Badge variant="secondary">Searching...</Badge>
        )}
      </div>
      
      {searchableFields.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Searchable: {searchableFields.join(', ')}
        </div>
      )}
    </div>
  );
};
