import React, { useState, useEffect } from 'react';
import { ComprehensiveArchitectureDiagram } from '@/components/architecture';
import { 
  FeaturesOverviewDiagram,
  SolutionArchitectureDiagram,
  DocumentProcessingArchitectureDiagram,
  MedicalImagingAIPipelineDiagram,
  ContentTypeRoutingDiagram,
  GenieStudioScriptGallery,
  GenieStudioVisualAssets
} from '@/components/document-processing';
import { TwoStagePipelineSVGDiagram } from '@/components/document-processing/TwoStagePipelineSVGDiagram';
import { PatientOnboardingFlowDiagram, SubAgentArchitectureDiagram, BeforeAfterArchitectureDiagram, GenieRecordingStudioArchitectureDiagram, GenieStudioTechnicalArchDiagram, GenieStudioFunctionalArchDiagram, GenieStudioScenarioMapDiagram, GenieStudioFullArchitectureDiagram } from '@/components/diagrams';
import { Button } from '@/components/ui/button';
// Tabs imports kept for potential future use but not needed for current category navigation
import { ArrowLeft, Layers, GitBranch, BarChart3, Eye, FileText, Building, Users, Network, ArrowRightLeft, Download, Workflow, Bot, History, Sparkles, Image, Video, Server, Target, Map } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Version history for diagrams (stored in localStorage for persistence)
interface DiagramVersion {
  id: string;
  version: string;
  date: string;
  label: string;
  isLatest?: boolean;
}

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
  genieStudio: {
    label: 'Genie Studio',
    icon: Sparkles,
    diagrams: [
      { id: 'genie-full', label: 'Full Architecture', icon: Map },
      { id: 'genie-architecture', label: 'Architecture', icon: Layers },
      { id: 'genie-technical', label: 'Technical', icon: Server },
      { id: 'genie-functional', label: 'Functional', icon: Users },
      { id: 'genie-scenarios', label: 'Scenarios', icon: Target },
      { id: 'genie-assets', label: 'Visual Assets', icon: Image },
      { id: 'genie-gallery', label: 'Full Gallery', icon: Video },
    ]
  }
};

// Default versions for each diagram
const getDefaultVersions = (diagramId: string): DiagramVersion[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { id: `${diagramId}-v1`, version: '1.0', date: today, label: 'Current', isLatest: true },
  ];
};

const ArchitectureDiagram = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize from URL params or defaults - validate that category exists
  const urlCategory = searchParams.get('category') || 'overview';
  const urlDiagram = searchParams.get('diagram') || 'solution';
  
  // Validate category exists, fallback to 'overview' if not
  const validCategory = diagramCategories[urlCategory as keyof typeof diagramCategories] ? urlCategory : 'overview';
  const validDiagram = diagramCategories[validCategory as keyof typeof diagramCategories]?.diagrams.some(d => d.id === urlDiagram) 
    ? urlDiagram 
    : diagramCategories[validCategory as keyof typeof diagramCategories]?.diagrams[0]?.id || 'solution';
  
  const [activeCategory, setActiveCategory] = useState(validCategory);
  const [activeDiagram, setActiveDiagram] = useState(validDiagram);
  const [diagramVersions, setDiagramVersions] = useState<Record<string, DiagramVersion[]>>({});
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');

  // Sync URL with state changes
  useEffect(() => {
    setSearchParams({ category: activeCategory, diagram: activeDiagram }, { replace: true });
  }, [activeCategory, activeDiagram, setSearchParams]);

  // Load versions from localStorage
  useEffect(() => {
    const savedVersions = localStorage.getItem('diagram_versions');
    if (savedVersions) {
      setDiagramVersions(JSON.parse(savedVersions));
    }
  }, []);

  // Get versions for current diagram
  const getCurrentVersions = (): DiagramVersion[] => {
    return diagramVersions[activeDiagram] || getDefaultVersions(activeDiagram);
  };

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
      case 'genie-full':
        return <GenieStudioFullArchitectureDiagram />;
      case 'genie-architecture':
        return <GenieRecordingStudioArchitectureDiagram />;
      case 'genie-technical':
        return <GenieStudioTechnicalArchDiagram />;
      case 'genie-functional':
        return <GenieStudioFunctionalArchDiagram />;
      case 'genie-scenarios':
        return <GenieStudioScenarioMapDiagram />;
      case 'genie-assets':
        return <GenieStudioVisualAssets />;
      case 'genie-gallery':
        return <GenieStudioScriptGallery />;
      default:
        return <SolutionArchitectureDiagram />;
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    const firstDiagram = diagramCategories[category as keyof typeof diagramCategories].diagrams[0];
    setActiveDiagram(firstDiagram.id);
    setSelectedVersion('latest');
  };

  const handleDiagramChange = (diagramId: string) => {
    setActiveDiagram(diagramId);
    setSelectedVersion('latest');
  };

  // All diagrams now support versioning
  const supportsVersioning = true;

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
              
              <div className="flex items-center gap-2">
                {/* Version Dropdown - only for diagrams */}
                {supportsVersioning && (
                  <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                    <SelectTrigger className="w-36 bg-background border border-border">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Version" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="latest">
                        <div className="flex items-center gap-2">
                          <span>Latest</span>
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        </div>
                      </SelectItem>
                      {getCurrentVersions().map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          <div className="flex items-center gap-2">
                            <span>v{v.version}</span>
                            <span className="text-xs text-muted-foreground">{v.date}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Category Dropdown for mobile */}
                <div className="md:hidden">
                  <Select value={activeCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-40 bg-background border border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
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
            </div>

            {/* Category Tabs - Desktop */}
            <div className="hidden md:flex gap-1 p-1 bg-muted rounded-lg">
              {Object.entries(diagramCategories).map(([key, cat]) => (
                <Button
                  key={key}
                  variant={activeCategory === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleCategoryChange(key)}
                  className={`flex items-center gap-2 px-4 py-2 ${
                    activeCategory === key 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-muted-foreground/10'
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  <span>{cat.label}</span>
                </Button>
              ))}
            </div>

            {/* Diagram Sub-tabs */}
            <div className="flex flex-wrap gap-2">
              {currentCategory.diagrams.map((diagram) => (
                <Button
                  key={diagram.id}
                  variant={activeDiagram === diagram.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDiagramChange(diagram.id)}
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
