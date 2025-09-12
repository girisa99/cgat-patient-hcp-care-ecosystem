/**
 * VISUAL CONTENT DISPLAY COMPONENT
 * Shows external visual content (videos, infographics, research images)
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image, 
  Video, 
  ExternalLink, 
  Play, 
  Eye, 
  Calendar,
  Search,
  Filter,
  Loader2,
  Youtube,
  FileImage,
  Microscope
} from 'lucide-react';
import { motion } from 'framer-motion';
import { VisualContentSource } from '@/services/externalVisualContentService';

interface VisualContentDisplayProps {
  sources: VisualContentSource[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  onCategoryFilter?: (category: string) => void;
}

export const VisualContentDisplay: React.FC<VisualContentDisplayProps> = ({
  sources,
  isLoading = false,
  onSearch,
  onCategoryFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (onCategoryFilter) {
      onCategoryFilter(category === 'all' ? '' : category);
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'youtube':
        return <Youtube className="h-4 w-4 text-red-600" />;
      case 'infographic':
        return <FileImage className="h-4 w-4 text-blue-600" />;
      case 'research_paper':
        return <Microscope className="h-4 w-4 text-green-600" />;
      default:
        return <Image className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSourceBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'youtube':
        return 'bg-red-100 text-red-800';
      case 'infographic':
        return 'bg-blue-100 text-blue-800';
      case 'research_paper':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group sources by type
  const sourcesByType = sources.reduce((acc, source) => {
    const type = source.sourceType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(source);
    return acc;
  }, {} as Record<string, VisualContentSource[]>);

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Content Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search visual content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('all')}
            >
              All Sources
            </Button>
            <Button
              variant={selectedCategory === 'medical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('medical')}
            >
              Medical
            </Button>
            <Button
              variant={selectedCategory === 'research' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('research')}
            >
              Research
            </Button>
            <Button
              variant={selectedCategory === 'regulatory' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('regulatory')}
            >
              Regulatory
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Display */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : sources.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({sources.length})</TabsTrigger>
            <TabsTrigger value="youtube">Videos ({sourcesByType.youtube?.length || 0})</TabsTrigger>
            <TabsTrigger value="infographic">Infographics ({sourcesByType.infographic?.length || 0})</TabsTrigger>
            <TabsTrigger value="research_paper">Research ({sourcesByType.research_paper?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources.map((source, index) => (
                <VisualContentCard key={source.id} source={source} index={index} />
              ))}
            </div>
          </TabsContent>

          {Object.entries(sourcesByType).map(([type, typeSources]) => (
            <TabsContent key={type} value={type} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeSources.map((source, index) => (
                  <VisualContentCard key={source.id} source={source} index={index} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No visual content found for your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const VisualContentCard: React.FC<{ source: VisualContentSource; index: number }> = ({ source, index }) => {
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'youtube':
        return <Youtube className="h-4 w-4 text-red-600" />;
      case 'infographic':
        return <FileImage className="h-4 w-4 text-blue-600" />;
      case 'research_paper':
        return <Microscope className="h-4 w-4 text-green-600" />;
      default:
        return <Image className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSourceBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'youtube':
        return 'bg-red-100 text-red-800';
      case 'infographic':
        return 'bg-blue-100 text-blue-800';
      case 'research_paper':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Media Preview */}
        <div className="relative aspect-video bg-gray-100">
          {source.thumbnailUrl ? (
            <img 
              src={source.thumbnailUrl} 
              alt={source.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {source.sourceType === 'youtube' ? (
                <Video className="h-12 w-12 text-gray-400" />
              ) : (
                <Image className="h-12 w-12 text-gray-400" />
              )}
            </div>
          )}
          
          {/* Play button for videos */}
          {source.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-60 rounded-full p-3">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>
          )}

          {/* Relevance Score Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {Math.round(source.relevanceScore * 100)}% match
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Source Info */}
          <div className="flex items-center gap-2 mb-2">
            {getSourceIcon(source.sourceType)}
            <span className="text-sm font-medium text-gray-600">{source.sourceName}</span>
            <Badge className={`text-xs ${getSourceBadgeColor(source.sourceType)}`}>
              {source.sourceType.replace('_', ' ')}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2">{source.title}</h3>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3 line-clamp-3">{source.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {source.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {source.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{source.tags.length - 3} more
              </Badge>
            )}
          </div>

          {/* Date and Actions */}
          <div className="flex items-center justify-between">
            {source.publishedDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {new Date(source.publishedDate).toLocaleDateString()}
              </div>
            )}
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                const url = source.videoUrl || source.imageUrl;
                if (url) window.open(url, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};