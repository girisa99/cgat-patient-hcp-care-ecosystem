import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X, Plus } from 'lucide-react';

interface WorkflowNodeFilterProps {
  categories: string[];
  businessUnits: string[];
  topics: string[];
  selectedFilters: {
    categories: string[];
    businessUnits: string[];
    topics: string[];
  };
  onFilterChange: (filters: any) => void;
  onAddToWorkflow: (type: 'category' | 'businessUnit' | 'topic', value: string) => void;
}

export const WorkflowNodeFilter: React.FC<WorkflowNodeFilterProps> = ({
  categories,
  businessUnits, 
  topics,
  selectedFilters,
  onFilterChange,
  onAddToWorkflow
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategoryFilter = (category: string) => {
    const isSelected = selectedFilters.categories.includes(category);
    const newCategories = isSelected
      ? selectedFilters.categories.filter(c => c !== category)
      : [...selectedFilters.categories, category];
    
    onFilterChange({
      ...selectedFilters,
      categories: newCategories
    });
  };

  const toggleBusinessUnitFilter = (unit: string) => {
    const isSelected = selectedFilters.businessUnits.includes(unit);
    const newUnits = isSelected
      ? selectedFilters.businessUnits.filter(u => u !== unit)
      : [...selectedFilters.businessUnits, unit];
    
    onFilterChange({
      ...selectedFilters,
      businessUnits: newUnits
    });
  };

  const toggleTopicFilter = (topic: string) => {
    const isSelected = selectedFilters.topics.includes(topic);
    const newTopics = isSelected
      ? selectedFilters.topics.filter(t => t !== topic)
      : [...selectedFilters.topics, topic];
    
    onFilterChange({
      ...selectedFilters,
      topics: newTopics
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      categories: [],
      businessUnits: [],
      topics: []
    });
  };

  const hasActiveFilters = selectedFilters.categories.length > 0 || 
                          selectedFilters.businessUnits.length > 0 || 
                          selectedFilters.topics.length > 0;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Workflow Node Filters
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showFilters && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Categories */}
            <div>
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                  const isSelected = selectedFilters.categories.includes(category);
                  return (
                    <div key={category} className="flex items-center gap-1">
                      <Badge
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleCategoryFilter(category)}
                      >
                        {category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onAddToWorkflow('category', category)}
                        title="Add as workflow node"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Business Units */}
            <div>
              <h4 className="text-sm font-medium mb-2">Business Units</h4>
              <div className="flex flex-wrap gap-2">
                {businessUnits.map(unit => {
                  const isSelected = selectedFilters.businessUnits.includes(unit);
                  return (
                    <div key={unit} className="flex items-center gap-1">
                      <Badge
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleBusinessUnitFilter(unit)}
                      >
                        {unit}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onAddToWorkflow('businessUnit', unit)}
                        title="Add as workflow node"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Topics */}
            <div>
              <h4 className="text-sm font-medium mb-2">Topics</h4>
              <div className="flex flex-wrap gap-2">
                {topics.map(topic => {
                  const isSelected = selectedFilters.topics.includes(topic);
                  return (
                    <div key={topic} className="flex items-center gap-1">
                      <Badge
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleTopicFilter(topic)}
                      >
                        {topic}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onAddToWorkflow('topic', topic)}
                        title="Add as workflow node"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};