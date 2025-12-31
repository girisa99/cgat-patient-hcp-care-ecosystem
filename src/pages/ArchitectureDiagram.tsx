import React from 'react';
import { ComprehensiveArchitectureDiagram } from '@/components/architecture';
import { 
  FeaturesOverviewDiagram,
  SolutionArchitectureDiagram,
  DocumentProcessingArchitectureDiagram,
  MedicalImagingAIPipelineDiagram,
  ContentTypeRoutingDiagram,
  ScriptsManager
} from '@/components/document-processing';
import { TwoStagePipelineSVGDiagram } from '@/components/document-processing/TwoStagePipelineSVGDiagram';
import { PatientOnboardingFlowDiagram, SubAgentArchitectureDiagram, BeforeAfterArchitectureDiagram } from '@/components/diagrams';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Layers, GitBranch, BarChart3, Eye, FileText, Building, Users, Network, ArrowRightLeft, Download } from 'lucide-react';
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
            <TabsList className="flex flex-wrap h-auto gap-1 mb-6 p-1">
              <TabsTrigger value="before-after" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <ArrowRightLeft className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Before/After</span>
              </TabsTrigger>
              <TabsTrigger value="solution" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <Building className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Solution</span>
              </TabsTrigger>
              <TabsTrigger value="two-stage" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <GitBranch className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Two-Stage</span>
              </TabsTrigger>
              <TabsTrigger value="content-routing" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="onboarding" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Onboarding</span>
              </TabsTrigger>
              <TabsTrigger value="sub-agents" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <Network className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Sub-Agents</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Features</span>
              </TabsTrigger>
              <TabsTrigger value="platform" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Platform</span>
              </TabsTrigger>
              <TabsTrigger value="document" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Document</span>
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <Eye className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Medical</span>
              </TabsTrigger>
              <TabsTrigger value="scripts" className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap">
                <Download className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Scripts</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="before-after" className="space-y-4">
              <BeforeAfterArchitectureDiagram />
            </TabsContent>

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

            <TabsContent value="sub-agents" className="space-y-4">
              <SubAgentArchitectureDiagram />
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

            <TabsContent value="scripts" className="space-y-4">
              <ScriptsManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default ArchitectureDiagram;
