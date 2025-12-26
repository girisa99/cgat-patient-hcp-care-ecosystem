import React from 'react';
import { ComprehensiveArchitectureDiagram } from '@/components/architecture';
import { 
  TwoStagePipelineDiagram, 
  FeaturesOverviewDiagram,
  DocumentProcessingArchitectureDiagram,
  MedicalImagingAIPipelineDiagram 
} from '@/components/document-processing';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Maximize2, Layers, GitBranch, BarChart3, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';

const ArchitectureDiagram = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Platform Architecture & Diagrams</h1>
          </div>
        </div>
        
        <div className="p-4">
          <Tabs defaultValue="two-stage" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="two-stage" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Two-Stage Pipeline
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Features Overview
              </TabsTrigger>
              <TabsTrigger value="platform" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Platform Architecture
              </TabsTrigger>
              <TabsTrigger value="document" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Document Processing
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Medical Imaging
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="two-stage" className="space-y-4">
              <TwoStagePipelineDiagram />
            </TabsContent>
            
            <TabsContent value="features" className="space-y-4">
              <FeaturesOverviewDiagram />
            </TabsContent>
            
            <TabsContent value="platform" className="space-y-4">
              <ComprehensiveArchitectureDiagram />
            </TabsContent>
            
            <TabsContent value="document" className="space-y-4">
              <DocumentProcessingArchitectureDiagram />
            </TabsContent>
            
            <TabsContent value="medical" className="space-y-4">
              <MedicalImagingAIPipelineDiagram />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default ArchitectureDiagram;
