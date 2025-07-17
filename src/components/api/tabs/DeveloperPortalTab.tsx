import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Plus, RefreshCw, CheckCircle, Clock,
  X, Eye, ExternalLink, Search, Code,
  FileText, Star, Shield
} from "lucide-react";
import { useExternalApis } from '@/hooks/useExternalApis';

const DeveloperPortalTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    developerApplications,
    isLoadingApplications
  } = useExternalApis();

  // Filter applications based on search
  const filteredApplications = (developerApplications || []).filter(app =>
    app.application_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock additional data for demonstration
  const portalStats = {
    totalDevelopers: 145,
    activeApplications: 89,
    pendingApprovals: 12,
    apiDocumentationViews: 2847
  };

  const recentActivity = [
    {
      type: 'application',
      action: 'New application submitted',
      developer: 'TechCorp Solutions',
      timestamp: '2 hours ago',
      status: 'pending'
    },
    {
      type: 'approval',
      action: 'Application approved',
      developer: 'HealthTech Innovations',
      timestamp: '5 hours ago',
      status: 'approved'
    },
    {
      type: 'documentation',
      action: 'API documentation accessed',
      developer: 'MedFlow Systems',
      timestamp: '1 day ago',
      status: 'active'
    }
  ];

  const handleRefresh = () => {
    // Refresh functionality would go here
    console.log('Refreshing applications...');
  };

  const handleApproveApplication = (applicationId: string) => {
    console.log('Approving application:', applicationId);
    // Implementation would use mutation
  };

  const handleRejectApplication = (applicationId: string) => {
    console.log('Rejecting application:', applicationId);
    // Implementation would use mutation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Developer Portal</h2>
          <p className="text-gray-600">Manage developer applications and API access</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoadingApplications}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingApplications ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>
      </div>

      {/* Portal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Developers</p>
                <p className="text-2xl font-bold text-blue-900">{portalStats.totalDevelopers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Active Apps</p>
                <p className="text-2xl font-bold text-green-900">{portalStats.activeApplications}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{portalStats.pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Doc Views</p>
                <p className="text-2xl font-bold text-purple-900">{portalStats.apiDocumentationViews}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Recent Portal Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'approved' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.developer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                  <Badge variant="outline" className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Developer Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Developer Applications ({filteredApplications.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">
                {searchQuery ? 'No Applications Match Your Search' : 'No Developer Applications'}
              </h3>
              <p className="text-sm mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms.'
                  : 'No developer applications have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{application.application_name}</h3>
                          <Badge variant={
                            application.status === 'approved' ? "default" :
                            application.status === 'pending' ? "secondary" :
                            application.status === 'rejected' ? "destructive" : "outline"
                          }>
                            {application.status}
                          </Badge>
                          <Badge variant="outline">{application.application_type}</Badge>
                          <Badge variant="outline">{application.environment}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">{application.description}</p>
                          
                          {application.company_name && (
                            <p className="text-sm"><strong>Company:</strong> {application.company_name}</p>
                          )}
                          
                          {application.website_url && (
                            <p className="text-sm">
                              <strong>Website:</strong> 
                              <a href={application.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                {application.website_url}
                                <ExternalLink className="h-3 w-3 inline ml-1" />
                              </a>
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Created: {new Date(application.created_at).toLocaleDateString()}</span>
                            {application.reviewed_at && (
                              <span>Reviewed: {new Date(application.reviewed_at).toLocaleDateString()}</span>
                            )}
                          </div>
                          
                          {application.requested_apis && application.requested_apis.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Requested APIs:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {application.requested_apis.map((api, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {api}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {application.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleApproveApplication(application.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRejectApplication(application.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {application.status === 'approved' && (
                          <Button variant="outline" size="sm">
                            <Shield className="h-4 w-4 mr-1" />
                            Manage Access
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Developer Resources */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Developer Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Code className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">API Documentation</h3>
              <p className="text-sm text-green-700">Interactive API docs with examples</p>
            </div>
            <div className="text-center p-4">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">Authentication Guide</h3>
              <p className="text-sm text-green-700">API key management and security</p>
            </div>
            <div className="text-center p-4">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">SDK Downloads</h3>
              <p className="text-sm text-green-700">Client libraries for popular languages</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperPortalTab;