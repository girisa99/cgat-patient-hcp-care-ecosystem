import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Store, Search, Star, Download, TrendingUp, Tag,
  CheckCircle, Shield, RefreshCw, ExternalLink, Heart,
  Grid, List, Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  preview_url?: string;
  avg_rating: number;
  install_count: number;
  is_featured?: boolean;
  is_verified?: boolean;
  price?: number;
  currency?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const TemplateMarketplace: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: categories } = useQuery({
    queryKey: ['marketplace-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('template-marketplace', {
        body: { action: 'get_categories' }
      });
      if (error) throw error;
      return data.categories as Category[];
    }
  });

  const { data: featured } = useQuery({
    queryKey: ['marketplace-featured'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('template-marketplace', {
        body: { action: 'get_featured' }
      });
      if (error) throw error;
      return data as { featured: Template[]; popular: Template[]; newest: Template[] };
    }
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['marketplace-templates', selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('template-marketplace', {
        body: { action: 'list_templates', category: selectedCategory }
      });
      if (error) throw error;
      return data.templates as Template[];
    }
  });

  const { data: searchResults } = useQuery({
    queryKey: ['marketplace-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return null;
      const { data, error } = await supabase.functions.invoke('template-marketplace', {
        body: { action: 'search', search_query: searchQuery }
      });
      if (error) throw error;
      return data.results as Template[];
    },
    enabled: searchQuery.length > 2
  });

  const installMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { data, error } = await supabase.functions.invoke('template-marketplace', {
        body: { action: 'install_template', template_id: templateId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-templates'] });
      toast.success('Template installed successfully!');
      if (data.created_agent_id) {
        toast.info('Agent created from template. Check your agents list.');
      }
      setSelectedTemplate(null);
    },
    onError: (error) => {
      toast.error('Install failed: ' + (error as Error).message);
    }
  });

  const displayTemplates = searchQuery.length > 2 ? searchResults : templates;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const TemplateCard = ({ template, featured = false }: { template: Template; featured?: boolean }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
        featured ? 'border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent' : ''
      }`}
      onClick={() => setSelectedTemplate(template)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {template.name}
              {template.is_verified && <Shield className="h-4 w-4 text-blue-500" />}
              {template.is_featured && <TrendingUp className="h-4 w-4 text-yellow-500" />}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">{template.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline">{template.category}</Badge>
          {template.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {renderStars(template.avg_rating || 0)}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Download className="h-3 w-3" />
              {template.install_count || 0}
            </span>
          </div>
          {template.price && template.price > 0 ? (
            <Badge className="bg-green-100 text-green-800">${template.price}</Badge>
          ) : (
            <Badge variant="secondary">Free</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Template Marketplace</h2>
            <p className="text-muted-foreground">Discover and install ready-to-use templates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories?.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
            <Badge variant="secondary" className="ml-2 text-xs">{cat.count}</Badge>
          </Button>
        ))}
      </div>

      {/* Featured Section */}
      {!searchQuery && !selectedCategory && featured?.featured && featured.featured.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.featured.map(template => (
              <TemplateCard key={template.id} template={template} featured />
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="newest">Newest</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : displayTemplates?.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground">Try a different search or category</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-3'
            }>
              {displayTemplates?.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured?.popular?.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="newest">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured?.newest?.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Detail Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTemplate.name}
                  {selectedTemplate.is_verified && (
                    <Badge variant="secondary" className="text-blue-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>{selectedTemplate.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {selectedTemplate.preview_url && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={selectedTemplate.preview_url} 
                      alt={selectedTemplate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {renderStars(selectedTemplate.avg_rating || 0)}
                    <span className="text-sm text-muted-foreground">
                      {selectedTemplate.install_count || 0} installs
                    </span>
                  </div>
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags?.map(tag => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => installMutation.mutate(selectedTemplate.id)}
                  disabled={installMutation.isPending}
                >
                  {installMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {selectedTemplate.price && selectedTemplate.price > 0 
                    ? `Install ($${selectedTemplate.price})`
                    : 'Install Free'
                  }
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateMarketplace;
