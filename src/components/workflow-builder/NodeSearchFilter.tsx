/**
 * Node Search and Filter Component
 * Provides advanced search and filtering capabilities for workflow nodes
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Tag,
  Grid3X3,
  Heart,
  Zap,
  Settings,
  Database,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  is_premium: boolean;
  is_featured: boolean;
  usage_count: number;
  configuration_schema: any;
  tags: string[];
  complexity_level: 'beginner' | 'intermediate' | 'advanced';
  ai_model_config?: any;
}

interface NodeSearchFilterProps {
  nodes: WorkflowNode[];
  onFilteredNodesChange: (nodes: WorkflowNode[]) => void;
  favorites?: string[];
  recentlyUsed?: string[];
  onToggleFavorite?: (nodeId: string) => void;
}

export const NodeSearchFilter: React.FC<NodeSearchFilterProps> = ({
  nodes,
  onFilteredNodesChange,
  favorites = [],
  recentlyUsed = [],
  onToggleFavorite
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedComplexity, setSelectedComplexity] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Extract unique values for filters
  const categories = useMemo(() => 
    Array.from(new Set(nodes.map(n => n.category))).sort(),
    [nodes]
  );

  const allTags = useMemo(() => 
    Array.from(new Set(nodes.flatMap(n => n.tags || []))).sort(),
    [nodes]
  );

  const complexityLevels = ['beginner', 'intermediate', 'advanced'];

  // Filter and sort nodes
  const filteredNodes = useMemo(() => {
    let filtered = nodes.filter(node => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(node.category);

      // Complexity filter
      const matchesComplexity = selectedComplexity.length === 0 || 
        selectedComplexity.includes(node.complexity_level);

      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => (node.tags || []).includes(tag));

      // Premium filter
      const matchesPremium = !showPremiumOnly || node.is_premium;

      // Featured filter
      const matchesFeatured = !showFeaturedOnly || node.is_featured;

      return matchesSearch && matchesCategory && matchesComplexity && 
             matchesTags && matchesPremium && matchesFeatured;
    });

    // Sort nodes
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'usage':
          comparison = (a.usage_count || 0) - (b.usage_count || 0);
          break;
        case 'recent':
          const aIndex = recentlyUsed.indexOf(a.id);
          const bIndex = recentlyUsed.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) comparison = 0;
          else if (aIndex === -1) comparison = 1;
          else if (bIndex === -1) comparison = -1;
          else comparison = aIndex - bIndex;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [
    nodes, searchTerm, selectedCategories, selectedComplexity, selectedTags,
    showPremiumOnly, showFeaturedOnly, sortBy, sortOrder, recentlyUsed
  ]);

  useEffect(() => {
    onFilteredNodesChange(filteredNodes);
  }, [filteredNodes, onFilteredNodesChange]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleComplexity = (level: string) => {
    setSelectedComplexity(prev => 
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedComplexity([]);
    setSelectedTags([]);
    setShowPremiumOnly(false);
    setShowFeaturedOnly(false);
  };

  const getActiveFilterCount = () => {
    return selectedCategories.length + selectedComplexity.length + selectedTags.length +
           (showPremiumOnly ? 1 : 0) + (showFeaturedOnly ? 1 : 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Node Search & Filter
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filteredNodes.length} / {nodes.length} nodes
            </Badge>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="h-7"
              >
                <X className="w-3 h-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search nodes by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="name">Name</option>
                  <option value="usage">Usage Count</option>
                  <option value="recent">Recently Used</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="h-7"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {allTags.length > 0 && (
              <div>
                <span className="text-sm font-medium">Popular Tags:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {allTags.slice(0, 10).map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleTag(tag)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div>
              <span className="text-sm font-medium">Categories:</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer justify-center"
                    onClick={() => toggleCategory(category)}
                  >
                    <Grid3X3 className="w-3 h-3 mr-1" />
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Complexity Level:</span>
              <div className="flex gap-2 mt-2">
                {complexityLevels.map(level => (
                  <Badge
                    key={level}
                    variant={selectedComplexity.includes(level) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleComplexity(level)}
                  >
                    {level === 'beginner' && <Zap className="w-3 h-3 mr-1" />}
                    {level === 'intermediate' && <Settings className="w-3 h-3 mr-1" />}
                    {level === 'advanced' && <Database className="w-3 h-3 mr-1" />}
                    {level}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showPremiumOnly}
                  onChange={(e) => setShowPremiumOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Premium nodes only</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Featured nodes only</span>
              </label>
            </div>

            {selectedTags.length > 0 && (
              <div>
                <span className="text-sm font-medium">Selected Tags:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Favorite Nodes ({favorites.length})</span>
              </div>
              
              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {favorites.map(nodeId => {
                    const node = nodes.find(n => n.id === nodeId);
                    return node ? (
                      <div key={nodeId} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{node.name}</span>
                        {onToggleFavorite && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleFavorite(nodeId)}
                            className="h-6 w-6 p-0"
                          >
                            <Heart className="w-3 h-3 text-red-500 fill-current" />
                          </Button>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No favorite nodes yet</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Recently Used ({recentlyUsed.length})</span>
              </div>
              
              {recentlyUsed.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {recentlyUsed.slice(0, 5).map(nodeId => {
                    const node = nodes.find(n => n.id === nodeId);
                    return node ? (
                      <div key={nodeId} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{node.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {node.category}
                        </Badge>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recently used nodes</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};