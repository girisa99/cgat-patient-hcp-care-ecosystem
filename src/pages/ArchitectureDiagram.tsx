import React, { useState } from 'react';
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
import { ArrowLeft, Layers, GitBranch, BarChart3, Eye, FileText, Building, Users, Network, ArrowRightLeft, Download, Workflow, Bot, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define diagram categories for cleaner organization
const diagramCategories = {
  overview: {
    label: 'Overview',
    icon: Building,
    diagrams: [
      { id: 'before-after', label: 'Before/After', icon: ArrowRightLeft },
      { id: 'solution', label: 'Solution', icon: Building },
      { id: 'platform', label: 'Platform', icon: Layers },
      { id: 'features', label: 'Features', icon: BarChart3 },
    ]
  },
  pipelines: {
    label: 'Pipelines',
    icon: Workflow,
    diagrams: [
      { id: 'two-stage', label: 'Two-Stage', icon: GitBranch },
      { id: 'content-routing', label: 'Content Routing', icon: Layers },
      { id: 'document', label: 'Document', icon: FileText },
      { id: 'medical', label: 'Medical AI', icon: Eye },
    ]
  },
  agents: {
    label: 'Agents & Workflows',
    icon: Bot,
    diagrams: [
      { id: 'onboarding', label: 'Onboarding', icon: Users },
      { id: 'sub-agents', label: 'Sub-Agents', icon: Network },
    ]
  },
  resources: {
    label: 'Resources',
    icon: Download,
    diagrams: [
      { id: 'scripts', label: 'Scripts', icon: Download },
    ]
  }
};

const ArchitectureDiagram = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeDiagram, setActiveDiagram] = useState('solution');

  const currentCategory = diagramCategories[activeCategory as keyof typeof diagramCategories];

  const renderDiagram = () => {
    switch (activeDiagram) {
      case 'before-after':
        return <BeforeAfterArchitectureDiagram />;
      case 'solution':
        return <SolutionArchitectureDiagram />;
      case 'platform':
        return <ComprehensiveArchitectureDiagram />;
      case 'features':
        return <FeaturesOverviewDiagram />;
      case 'two-stage':
        return <TwoStagePipelineSVGDiagram />;
      case 'content-routing':
        return <ContentTypeRoutingDiagram />;
      case 'document':
        return <DocumentProcessingArchitectureDiagram />;
      case 'medical':
        return <MedicalImagingAIPipelineDiagram />;
      case 'onboarding':
        return <PatientOnboardingFlowDiagram />;
      case 'sub-agents':
        return <SubAgentArchitectureDiagram />;
      case 'scripts':
        return <ScriptsManager />;
      default:
        return <SolutionArchitectureDiagram />;
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    const firstDiagram = diagramCategories[category as keyof typeof diagramCategories].diagrams[0];
    setActiveDiagram(firstDiagram.id);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-xl font-semibold">Platform Architecture & Diagrams</h1>
              </div>
              
              {/* Category Dropdown for mobile */}
              <div className="md:hidden">
                <Select value={activeCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(diagramCategories).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category Tabs - Desktop */}
            <div className="hidden md:block">
              <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
                <TabsList className="h-auto gap-1 p-1">
                  {Object.entries(diagramCategories).map(([key, cat]) => (
                    <TabsTrigger 
                      key={key} 
                      value={key}
                      className="flex items-center gap-2 px-4 py-2"
                    >
                      <cat.icon className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Diagram Sub-tabs */}
            <div className="flex flex-wrap gap-2">
              {currentCategory.diagrams.map((diagram) => (
                <Button
                  key={diagram.id}
                  variant={activeDiagram === diagram.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveDiagram(diagram.id)}
                  className="flex items-center gap-1.5"
                >
                  <diagram.icon className="h-3.5 w-3.5" />
                  <span>{diagram.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {renderDiagram()}
        </div>
      </div>
    </AppLayout>
  );
};

export default ArchitectureDiagram;
