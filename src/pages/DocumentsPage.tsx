
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, FolderOpen, Download } from 'lucide-react';

const DocumentsPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Documents"
        subtitle="Manage documents and file storage"
        headerActions={
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <FolderOpen className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <CardTitle className="text-base">Recent Documents</CardTitle>
                  <CardDescription>View recently accessed files</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <FileText className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <CardTitle className="text-base">Patient Records</CardTitle>
                  <CardDescription>Access patient documentation</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <Download className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <CardTitle className="text-base">Export Center</CardTitle>
                  <CardDescription>Download and export documents</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Document Management Area */}
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                Organize and manage your healthcare documents securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents uploaded yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by uploading your first document to organize your healthcare files
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default DocumentsPage;
