import React from 'react';
import { ComprehensiveArchitectureDiagram } from '@/components/architecture';
import { 
  FeaturesOverviewDiagram,
  SolutionArchitectureDiagram,
  DocumentProcessingArchitectureDiagram,
  MedicalImagingAIPipelineDiagram,
  ContentTypeRoutingDiagram
} from '@/components/document-processing';
import { TwoStagePipelineSVGDiagram } from '@/components/document-processing/TwoStagePipelineSVGDiagram';
import { PatientOnboardingFlowDiagram } from '@/components/diagrams';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Layers, GitBranch, BarChart3, Eye, FileText, Building, Users } from 'lucide-react';
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
          <Tabs defaultValue="solution" className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-6">
              <TabsTrigger value="solution" className="flex items-center gap-1 text-xs">
                <Building className="h-3 w-3" />
                Solution
              </TabsTrigger>
              <TabsTrigger value="two-stage" className="flex items-center gap-1 text-xs">
                <GitBranch className="h-3 w-3" />
                Two-Stage
              </TabsTrigger>
              <TabsTrigger value="content-routing" className="flex items-center gap-1 text-xs">
                <Layers className="h-3 w-3" />
                Content
              </TabsTrigger>
              <TabsTrigger value="onboarding" className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                Onboarding
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-1 text-xs">
                <BarChart3 className="h-3 w-3" />
                Features
              </TabsTrigger>
              <TabsTrigger value="platform" className="flex items-center gap-1 text-xs">
                <Layers className="h-3 w-3" />
                Platform
              </TabsTrigger>
              <TabsTrigger value="document" className="flex items-center gap-1 text-xs">
                <FileText className="h-3 w-3" />
                Document
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center gap-1 text-xs">
                <Eye className="h-3 w-3" />
                Medical
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="solution" className="space-y-4">
              <SolutionArchitectureDiagram />
            </TabsContent>
            
            <TabsContent value="two-stage" className="space-y-4">
              <TwoStagePipelineSVGDiagram />
            </TabsContent>
            
            <TabsContent value="content-routing" className="space-y-4">
              <ContentTypeRoutingDiagram />
            </TabsContent>

            <TabsContent value="onboarding" className="space-y-4">
              <PatientOnboardingFlowDiagram />
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
