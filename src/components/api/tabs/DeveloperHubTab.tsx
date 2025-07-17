import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, FileText, Users, Plus, RefreshCw, Search,
  CheckCircle, Clock, X, Eye, ExternalLink,
  Shield, Download, Book
} from "lucide-react";
import { useExternalApis } from '@/hooks/useExternalApis';

const DeveloperHubTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('applications');
  
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

  const handleRefresh = () => {
    console.log('Refreshing developer hub...');
  };

  const handleApproveApplication = (applicationId: string) => {
    console.log('Approving application:', applicationId);
  };

  const handleRejectApplication = (applicationId: string) => {
    console.log('Rejecting application:', applicationId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Developer Hub</h2>
          <p className="text-gray-600">Developer portal, applications, and documentation management</p>
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

      {/* Developer Hub Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-900">{developerApplications?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {developerApplications?.filter(app => app.status === 'approved').length || 0}
                </p>
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
                <p className="text-2xl font-bold text-yellow-900">
                  {developerApplications?.filter(app => app.status === 'pending').length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Documentation</p>
                <p className="text-2xl font-bold text-purple-900">{developerApplications?.length || 0}</p>
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

      {/* Sub-tabs for different developer hub aspects */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-6">
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
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Application
                  </Button>
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
        </TabsContent>

        <TabsContent value="documentation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>API Documentation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">Interactive API Documentation</h3>
                <p className="text-sm mb-4">Automatically generated documentation for all published APIs.</p>
                <div className="flex items-center justify-center gap-2">
                  <Button>
                    <Book className="h-4 w-4 mr-2" />
                    View Docs
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Developer Resources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <Code className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">SDK Downloads</h3>
                  <p className="text-sm text-gray-600 mb-4">Client libraries for popular programming languages</p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download SDKs
                  </Button>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Authentication Guide</h3>
                  <p className="text-sm text-gray-600 mb-4">API key management and security best practices</p>
                  <Button variant="outline">
                    <Book className="h-4 w-4 mr-2" />
                    Read Guide
                  </Button>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Code Examples</h3>
                  <p className="text-sm text-gray-600 mb-4">Sample implementations and tutorials</p>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Examples
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperHubTab;