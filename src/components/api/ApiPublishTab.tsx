
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Lock, Eye, Settings, Rocket, AlertCircle } from 'lucide-react';
import { useApiPublish } from '@/hooks/api/useApiPublish';

interface ApiPublishTabProps {
  apiId: string;
}

export const ApiPublishTab: React.FC<ApiPublishTabProps> = ({ apiId }) => {
  const {
    apiDetails,
    isLoading,
    publishApi,
    unpublishApi,
    updatePublishSettings,
    isPublishing
  } = useApiPublish(apiId);

  const [publishSettings, setPublishSettings] = useState({
    externalName: apiDetails?.external_name || '',
    externalDescription: apiDetails?.external_description || '',
    visibility: apiDetails?.visibility || 'private',
    pricingModel: apiDetails?.pricing_model || 'free',
    category: apiDetails?.category || '',
    tags: apiDetails?.tags || [],
    documentationUrl: apiDetails?.documentation_url || '',
    supportUrl: apiDetails?.support_url || '',
    marketplaceEnabled: apiDetails?.marketplace_config?.enabled || false
  });

  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !publishSettings.tags.includes(newTag.trim())) {
      setPublishSettings(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPublishSettings(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePublish = async () => {
    try {
      await updatePublishSettings(publishSettings);
      await publishApi();
    } catch (error) {
      console.error('Failed to publish API:', error);
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishApi();
    } catch (error) {
      console.error('Failed to unpublish API:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isPublished = apiDetails?.status === 'published';

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPublished ? (
              <>
                <Globe className="h-5 w-5 text-green-600" />
                API Published
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-gray-600" />
                API Draft
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {isPublished 
                  ? 'Your API is published and available to consumers.'
                  : 'Your API is in draft mode and not publicly available.'
                }
              </p>
              <div className="flex items-center gap-2">
                <Badge variant={isPublished ? "default" : "secondary"}>
                  {apiDetails?.status || 'draft'}
                </Badge>
                <Badge variant="outline">
                  {apiDetails?.visibility || 'private'}
                </Badge>
                {apiDetails?.marketplace_config?.enabled && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Marketplace
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isPublished ? (
                <Button 
                  variant="outline" 
                  onClick={handleUnpublish}
                  disabled={isPublishing}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Unpublish
                </Button>
              ) : (
                <Button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {isPublishing ? 'Publishing...' : 'Publish API'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="externalName">Public API Name</Label>
              <Input
                id="externalName"
                value={publishSettings.externalName}
                onChange={(e) => setPublishSettings(prev => ({ ...prev, externalName: e.target.value }))}
                placeholder="Enter the public name for your API"
              />
            </div>

            <div>
              <Label htmlFor="externalDescription">Public Description</Label>
              <Textarea
                id="externalDescription"
                value={publishSettings.externalDescription}
                onChange={(e) => setPublishSettings(prev => ({ ...prev, externalDescription: e.target.value }))}
                placeholder="Describe what your API does for potential consumers"
                rows={3}
              />
            </div>
          </div>

          {/* Visibility and Access */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select 
                value={publishSettings.visibility} 
                onValueChange={(value) => setPublishSettings(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Private
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="marketplace">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Marketplace
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pricingModel">Pricing Model</Label>
              <Select 
                value={publishSettings.pricingModel} 
                onValueChange={(value) => setPublishSettings(prev => ({ ...prev, pricingModel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="usage-based">Usage-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={publishSettings.category} 
                onValueChange={(value) => setPublishSettings(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="data">Data & Analytics</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {publishSettings.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="documentationUrl">Documentation URL</Label>
              <Input
                id="documentationUrl"
                value={publishSettings.documentationUrl}
                onChange={(e) => setPublishSettings(prev => ({ ...prev, documentationUrl: e.target.value }))}
                placeholder="https://docs.example.com"
              />
            </div>

            <div>
              <Label htmlFor="supportUrl">Support URL</Label>
              <Input
                id="supportUrl"
                value={publishSettings.supportUrl}
                onChange={(e) => setPublishSettings(prev => ({ ...prev, supportUrl: e.target.value }))}
                placeholder="https://support.example.com"
              />
            </div>
          </div>

          {/* Marketplace Settings */}
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketplaceEnabled">Enable Marketplace Listing</Label>
                <p className="text-sm text-gray-600">Make your API discoverable in the marketplace</p>
              </div>
              <Switch
                id="marketplaceEnabled"
                checked={publishSettings.marketplaceEnabled}
                onCheckedChange={(checked) => setPublishSettings(prev => ({ ...prev, marketplaceEnabled: checked }))}
              />
            </div>
            {publishSettings.marketplaceEnabled && (
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <AlertCircle className="h-4 w-4" />
                Your API will be reviewed before being listed in the marketplace
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => updatePublishSettings(publishSettings)}
              disabled={isPublishing}
            >
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            {!isPublished && (
              <Button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Rocket className="h-4 w-4 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish API'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
