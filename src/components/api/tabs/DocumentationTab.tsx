import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, Code } from "lucide-react";

const DocumentationTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Documentation</h2>
          <p className="text-gray-600">Interactive API documentation and specifications</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Docs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Available Documentation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold mb-2">Documentation Coming Soon</h3>
            <p className="text-sm">Interactive API documentation will be available here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentationTab;