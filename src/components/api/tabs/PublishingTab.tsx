import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Upload, ArrowRight, CheckCircle, Clock, 
  AlertTriangle, RefreshCw, Eye, Globe,
  FileText, Settings
} from "lucide-react";
import { useExternalApiPublishing } from '@/hooks/useExternalApiPublishing';

const PublishingTab: React.FC = () => {
  const {
    createDraftMutation,
    moveToReviewMutation,
    publishApiMutation,
    completeWorkflowMutation
  } = useExternalApiPublishing();

  const [selectedApi, setSelectedApi] = useState<string>('');

  // Mock data for demonstration
  const publishingPipeline = [
    {
      id: '1',
      name: 'Healthcare Core API',
      status: 'draft',
      version: '1.0.0',
      created_at: '2024-01-15',
      endpoints: 12,
      category: 'healthcare'
    },
    {
      id: '2', 
      name: 'Patient Management API',
      status: 'review',
      version: '1.2.0',
      created_at: '2024-01-10',
      endpoints: 8,
      category: 'patient-care'
    },
    {
      id: '3',
      name: 'Facilities API',
      status: 'published',
      version: '2.0.0',
      created_at: '2024-01-05',
      published_at: '2024-01-20',
      endpoints: 15,
      category: 'administration'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'review': return 'bg-yellow-500';
      case 'published': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'review': return <Clock className="h-4 w-4" />;
      case 'published': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleMoveToReview = async (apiId: string) => {
    try {
      await moveToReviewMutation.mutateAsync(apiId);
    } catch (error) {
      console.error('Failed to move to review:', error);
    }
  };

  const handlePublish = async (apiId: string) => {
    try {
      await publishApiMutation.mutateAsync(apiId);
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Publishing Pipeline</h2>
          <p className="text-gray-600">Manage the publishing workflow for internal to external API exposure</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Create Draft
          </Button>
        </div>
      </div>

      {/* Publishing Workflow Status */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Workflow Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="font-semibold">Draft</h3>
              <p className="text-sm text-gray-600">API specification created</p>
              <Badge variant="secondary" className="mt-2">
                {publishingPipeline.filter(api => api.status === 'draft').length} APIs
              </Badge>
            </div>
            
            <div className="text-center">
              <ArrowRight className="h-6 w-6 text-gray-400 mx-auto mb-6" />
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold">Review</h3>
              <p className="text-sm text-gray-600">Under technical review</p>
              <Badge variant="secondary" className="mt-2">
                {publishingPipeline.filter(api => api.status === 'review').length} APIs
              </Badge>
            </div>
            
            <div className="text-center">
              <ArrowRight className="h-6 w-6 text-gray-400 mx-auto mb-6" />
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold">Staging</h3>
              <p className="text-sm text-gray-600">Testing & validation</p>
              <Badge variant="secondary" className="mt-2">
                0 APIs
              </Badge>
            </div>
            
            <div className="text-center">
              <ArrowRight className="h-6 w-6 text-gray-400 mx-auto mb-6" />
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold">Published</h3>
              <p className="text-sm text-gray-600">Live & accessible</p>
              <Badge variant="secondary" className="mt-2">
                {publishingPipeline.filter(api => api.status === 'published').length} APIs
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* APIs in Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>APIs in Publishing Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {publishingPipeline.map((api) => (
              <Card key={api.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{api.name}</h3>
                        <Badge variant="outline" className={`${getStatusColor(api.status)} text-white`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(api.status)}
                            {api.status}
                          </div>
                        </Badge>
                        <Badge variant="outline">v{api.version}</Badge>
                        <Badge variant="outline">{api.category}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Endpoints:</span> {api.endpoints}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(api.created_at).toLocaleDateString()}
                        </div>
                        {api.published_at && (
                          <div>
                            <span className="font-medium">Published:</span> {new Date(api.published_at).toLocaleDateString()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Version:</span> {api.version}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      
                      {api.status === 'draft' && (
                        <Button 
                          size="sm"
                          onClick={() => handleMoveToReview(api.id)}
                          disabled={moveToReviewMutation.isPending}
                        >
                          Submit for Review
                        </Button>
                      )}
                      
                      {api.status === 'review' && (
                        <Button 
                          size="sm"
                          onClick={() => handlePublish(api.id)}
                          disabled={publishApiMutation.isPending}
                        >
                          Approve & Publish
                        </Button>
                      )}
                      
                      {api.status === 'published' && (
                        <Button variant="outline" size="sm">
                          <Globe className="h-4 w-4 mr-1" />
                          View Live
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Publishing Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Draft Stage:</strong> API specification is created with endpoints, schemas, and documentation</p>
            <p><strong>Review Stage:</strong> Technical review for security, performance, and compliance</p>
            <p><strong>Staging:</strong> Testing environment with full functionality validation</p>
            <p><strong>Published:</strong> Live API accessible via external endpoints with monitoring</p>
            <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
              <p className="text-blue-800 font-medium">💡 Best Practice:</p>
              <p>Always test APIs thoroughly in staging before publishing to production</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishingTab;