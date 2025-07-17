import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Star, Plus, RefreshCw, ExternalLink, TrendingUp,
  Search, Filter, Eye, DollarSign, Users,
  CheckCircle, Clock, Globe
} from "lucide-react";
import { useExternalApis } from '@/hooks/useExternalApis';

const MarketplaceTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const {
    marketplaceListings,
    marketplaceStats,
    isLoadingListings
  } = useExternalApis();

  // Filter listings based on search and category
  const filteredListings = (marketplaceListings || []).filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate real marketplace statistics
  const realStats = {
    totalListings: marketplaceListings?.length || 0,
    publishedListings: marketplaceListings?.filter(listing => listing.listing_status === 'approved').length || 0,
    featuredListings: marketplaceListings?.filter(listing => listing.featured).length || 0,
    totalViews: marketplaceListings?.reduce((sum, listing) => sum + (listing.metrics?.views || 0), 0) || 0,
    averageRating: marketplaceListings?.length > 0 
      ? marketplaceListings.reduce((sum, listing) => sum + (listing.metrics?.rating || 0), 0) / marketplaceListings.length 
      : 0
  };

  // Calculate real categories from marketplace listings
  const categoryStats = (marketplaceListings || []).reduce((acc, listing) => {
    const category = listing.category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = [
    { id: 'all', name: 'All Categories', count: marketplaceListings?.length || 0 },
    ...Object.entries(categoryStats).map(([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      count
    }))
  ];

  const handleRefresh = () => {
    // Refresh functionality would go here
    console.log('Refreshing marketplace listings...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Marketplace</h2>
          <p className="text-gray-600">Discover and publish APIs in the marketplace</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoadingListings}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingListings ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>
      </div>

      {/* Marketplace Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Listings</p>
                <p className="text-2xl font-bold text-blue-900">{realStats.totalListings}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Published</p>
                <p className="text-2xl font-bold text-green-900">{realStats.publishedListings}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Featured</p>
                <p className="text-2xl font-bold text-yellow-900">{realStats.featuredListings}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Views</p>
                <p className="text-2xl font-bold text-purple-900">{realStats.totalViews.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Avg Rating</p>
                <p className="text-2xl font-bold text-orange-900">{realStats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search marketplace listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured APIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Featured APIs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured API listings from real data */}
            {(marketplaceListings?.filter(listing => listing.featured) || []).slice(0, 3).map((api) => (
              <Card key={api.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{api.title}</h3>
                        {api.is_verified && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {api.short_description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{api.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span>{api.metrics?.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{api.metrics?.views || 0} views</span>
                        <Badge variant="outline">{api.pricing_info?.model || 'Free'}</Badge>
                      </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Marketplace Listings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>All Marketplace Listings ({filteredListings.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredListings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">
                {searchQuery || selectedCategory !== 'all' ? 'No Listings Match Your Filters' : 'No Marketplace Listings'}
              </h3>
              <p className="text-sm mb-4">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search terms or filters.'
                  : 'No APIs have been published to the marketplace yet.'
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Listing
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{listing.title}</h3>
                          {listing.featured && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                              <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                              Featured
                            </Badge>
                          )}
                          {listing.is_verified && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant="outline">{listing.category}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {listing.short_description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Published: {new Date(listing.published_at || listing.created_at).toLocaleDateString()}</span>
                          {listing.pricing_info && (
                            <span>Pricing: {typeof listing.pricing_info === 'object' ? 'Custom' : listing.pricing_info}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Publish
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marketplace Guidelines */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Marketplace Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-green-700 space-y-2">
            <p><strong>Quality Standards:</strong> All APIs must have comprehensive documentation and example code</p>
            <p><strong>Verification:</strong> Verified APIs have passed security and reliability reviews</p>
            <p><strong>Pricing:</strong> Transparent pricing models with clear usage limits and costs</p>
            <p><strong>Support:</strong> Provide adequate developer support and maintenance commitments</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplaceTab;