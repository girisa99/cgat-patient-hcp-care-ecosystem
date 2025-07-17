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

  // Mock marketplace data for demonstration
  const mockStats = {
    totalListings: 24,
    publishedListings: 18,
    featuredListings: 6,
    totalViews: 12847,
    averageRating: 4.6
  };

  const categories = [
    { id: 'all', name: 'All Categories', count: 24 },
    { id: 'healthcare', name: 'Healthcare', count: 8 },
    { id: 'communication', name: 'Communication', count: 5 },
    { id: 'analytics', name: 'Analytics', count: 4 },
    { id: 'ai-ml', name: 'AI/ML', count: 3 },
    { id: 'document', name: 'Document Processing', count: 2 },
    { id: 'other', name: 'Other', count: 2 }
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
                <p className="text-2xl font-bold text-blue-900">{mockStats.totalListings}</p>
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
                <p className="text-2xl font-bold text-green-900">{mockStats.publishedListings}</p>
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
                <p className="text-2xl font-bold text-yellow-900">{mockStats.featuredListings}</p>
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
                <p className="text-2xl font-bold text-purple-900">{mockStats.totalViews.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-orange-900">{mockStats.averageRating}</p>
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
            {/* Mock featured API listings */}
            {[
              {
                id: '1',
                title: 'Healthcare Provider Directory',
                description: 'Comprehensive directory of healthcare providers with NPI integration',
                category: 'Healthcare',
                pricing: 'Freemium',
                rating: 4.8,
                downloads: 1247,
                verified: true
              },
              {
                id: '2',
                title: 'SMS & Voice Communications',
                description: 'Send SMS messages and make voice calls with Twilio integration',
                category: 'Communication',
                pricing: 'Pay-per-use',
                rating: 4.6,
                downloads: 892,
                verified: true
              },
              {
                id: '3',
                title: 'AI Document Processing',
                description: 'Extract text and data from documents using advanced AI',
                category: 'AI/ML',
                pricing: 'Enterprise',
                rating: 4.9,
                downloads: 654,
                verified: true
              }
            ].map((api) => (
              <Card key={api.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{api.title}</h3>
                      {api.verified && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {api.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline">{api.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{api.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{api.downloads} downloads</span>
                      <Badge variant="outline">{api.pricing}</Badge>
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