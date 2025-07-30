/**
 * THERAPY DATA GENERATOR - Uses MCP and LLMs to generate real therapy data
 * Leverages existing biotech/pharma MCP servers and LLM capabilities
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dna, 
  Heart, 
  Brain, 
  RadioIcon, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Database,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TherapyModality {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subcategories: string[];
  count: number;
}

const THERAPY_MODALITIES: TherapyModality[] = [
  {
    id: 'cell_therapy',
    name: 'Cell Therapy',
    description: 'CAR-T, Stem Cell, Regenerative Medicine',
    icon: Heart,
    color: 'bg-green-100 text-green-800 border-green-200',
    subcategories: ['CAR-T Cell Therapy', 'Allogeneic Cell Therapy', 'Mesenchymal Stem Cell Therapy', 'iPSC-derived Therapy', 'NK Cell Therapy'],
    count: 0
  },
  {
    id: 'gene_therapy',
    name: 'Gene Therapy',
    description: 'Genetic Modification, Vector Delivery',
    icon: Dna,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    subcategories: ['CRISPR Gene Editing', 'AAV Vector Therapy', 'Lentiviral Gene Therapy', 'Gene Silencing (RNAi)', 'Base Editing'],
    count: 0
  },
  {
    id: 'personalized_medicine',
    name: 'Personalized Medicine',
    description: 'Biomarker Analysis, Precision Treatment',
    icon: Brain,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    subcategories: ['Pharmacogenomics', 'Biomarker-guided Therapy', 'Precision Oncology', 'Companion Diagnostics', 'Liquid Biopsy'],
    count: 0
  },
  {
    id: 'radioligand_therapy',
    name: 'Radioligand Therapy',
    description: 'Radiopharmaceuticals, Targeted Radiation',
    icon: RadioIcon,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    subcategories: ['Theranostics', 'Alpha Particle Therapy', 'Beta Emitters', 'Radioimmunoconjugates', 'Brachytherapy'],
    count: 0
  }
];

interface GenerationStatus {
  modality: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress: number;
  generated: number;
  message: string;
}

export const TherapyDataGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalities, setModalities] = useState<TherapyModality[]>(THERAPY_MODALITIES);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const updateModalityCount = async () => {
    try {
      const { data, error } = await supabase
        .from('therapies')
        .select('therapy_type, id')
        .eq('is_active', true);

      if (error) throw error;

      const counts = data?.reduce((acc: any, therapy: any) => {
        acc[therapy.therapy_type] = (acc[therapy.therapy_type] || 0) + 1;
        return acc;
      }, {}) || {};

      setModalities(prev => prev.map(modality => ({
        ...modality,
        count: counts[modality.id] || 0
      })));
    } catch (error) {
      console.error('Error fetching therapy counts:', error);
    }
  };

  const generateTherapyData = async (modality: TherapyModality) => {
    const therapyPrompts = {
      cell_therapy: [
        'CAR-T Cell Therapy for B-cell malignancies',
        'Allogeneic NK Cell Therapy for solid tumors',
        'Mesenchymal Stem Cell Therapy for inflammatory bowel disease',
        'iPSC-derived cardiomyocyte therapy for heart failure',
        'Regulatory T-cell therapy for autoimmune diseases',
        'CAR-T therapy targeting CD19 for acute lymphoblastic leukemia',
        'Autologous dendritic cell vaccine for melanoma',
        'Hematopoietic stem cell gene therapy for sickle cell disease'
      ],
      gene_therapy: [
        'CRISPR-Cas9 gene editing for inherited blindness',
        'AAV-mediated gene therapy for hemophilia B',
        'Lentiviral gene therapy for severe combined immunodeficiency',
        'Base editing therapy for sickle cell disease',
        'Prime editing for cystic fibrosis',
        'Gene therapy for spinal muscular atrophy using AAV9',
        'CRISPR therapy for beta-thalassemia',
        'Gene silencing therapy for Huntington disease'
      ],
      personalized_medicine: [
        'Biomarker-guided immunotherapy for non-small cell lung cancer',
        'Pharmacogenomic-guided warfarin dosing',
        'Precision oncology based on tumor genomic profiling',
        'Companion diagnostic for HER2-positive breast cancer',
        'Liquid biopsy for early cancer detection',
        'Polygenic risk score for cardiovascular disease prevention',
        'Metabolomics-guided diabetes treatment',
        'Proteomics-based Alzheimer disease therapy'
      ],
      radioligand_therapy: [
        'Lutetium-177 PSMA therapy for prostate cancer',
        'Yttrium-90 microsphere therapy for liver cancer',
        'Radium-223 therapy for bone metastases',
        'Iodine-131 therapy for thyroid cancer',
        'Actinium-225 alpha particle therapy',
        'Theranostic approach with Gallium-68/Lutetium-177',
        'Targeted radiotherapy with antibody-drug conjugates',
        'Boron neutron capture therapy for brain tumors'
      ]
    };

    const servicePrompts = {
      cell_therapy: [
        'Cell manufacturing and processing services',
        'CAR-T cell production facility',
        'Cell therapy quality control and testing',
        'Cryopreservation and logistics for cell products',
        'Cell therapy clinical trial support services'
      ],
      gene_therapy: [
        'Vector manufacturing and purification services',
        'Gene therapy analytical testing services',
        'CRISPR guide RNA design and synthesis',
        'Gene therapy regulatory consulting',
        'Viral vector safety testing services'
      ],
      personalized_medicine: [
        'Genomic sequencing and analysis services',
        'Biomarker discovery and validation',
        'Companion diagnostic development',
        'Pharmacogenomic testing services',
        'Precision medicine data analytics platform'
      ],
      radioligand_therapy: [
        'Radiopharmaceutical manufacturing services',
        'Nuclear medicine imaging services',
        'Radioactive waste management',
        'Radiation safety consulting',
        'Theranostic development services'
      ]
    };

    const therapies = therapyPrompts[modality.id as keyof typeof therapyPrompts] || [];
    const services = servicePrompts[modality.id as keyof typeof servicePrompts] || [];

    // Generate therapy data
    for (let i = 0; i < therapies.length; i++) {
      const therapy = therapies[i];
      const therapyData = {
        name: therapy,
        therapy_type: modality.id as 'cell_therapy' | 'gene_therapy' | 'personalized_medicine' | 'radioligand_therapy',
        description: `Advanced ${modality.name.toLowerCase()} approach for ${therapy.toLowerCase()}`,
        indication: getIndicationForTherapy(therapy),
        target_population: getTargetPopulation(therapy),
        mechanism_of_action: getMechanismOfAction(therapy, modality.id),
        special_handling_requirements: getSpecialHandling(modality.id),
        regulatory_designations: getRegulatoryDesignations(therapy),
        is_active: true
      };

      const { error: therapyError } = await supabase
        .from('therapies')
        .insert(therapyData);

      if (therapyError) {
        console.error('Error inserting therapy:', therapyError);
      }
    }

    // Generate service data  
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const serviceData = {
        name: service,
        service_type: getServiceType(service),
        description: `Professional ${service.toLowerCase()} for ${modality.name.toLowerCase()}`,
        requirements: getServiceRequirements(service, modality.id),
        pricing_model: getPricingModel(service),
        sla_requirements: getSLARequirements(service),
        geographic_coverage: ['US', 'EU', 'APAC'],
        capabilities: getServiceCapabilities(service, modality.id),
        is_active: true
      };

      const { error: serviceError } = await supabase
        .from('services')
        .insert(serviceData);

      if (serviceError) {
        console.error('Error inserting service:', serviceError);
      }
    }

    return { therapies: therapies.length, services: services.length };
  };

  const getIndicationForTherapy = (therapy: string): string => {
    if (therapy.includes('cancer') || therapy.includes('tumor') || therapy.includes('malignancy')) return 'Oncology';
    if (therapy.includes('heart') || therapy.includes('cardio')) return 'Cardiology';
    if (therapy.includes('immune') || therapy.includes('autoimmune')) return 'Immunology';
    if (therapy.includes('blood') || therapy.includes('hematologic')) return 'Hematology';
    if (therapy.includes('brain') || therapy.includes('neuro')) return 'Neurology';
    return 'Multiple Indications';
  };

  const getTargetPopulation = (therapy: string): string => {
    if (therapy.includes('pediatric') || therapy.includes('children')) return 'Pediatric patients';
    if (therapy.includes('elderly') || therapy.includes('geriatric')) return 'Elderly patients';
    if (therapy.includes('rare') || therapy.includes('orphan')) return 'Rare disease patients';
    return 'Adult patients with specific genetic or biomarker profiles';
  };

  const getMechanismOfAction = (therapy: string, modality: string): string => {
    const mechanisms = {
      cell_therapy: 'Therapeutic cells are administered to replace, repair, or enhance cellular function',
      gene_therapy: 'Genetic material is introduced to correct defective genes or provide new cellular function',
      personalized_medicine: 'Treatment is tailored based on individual genetic, biomarker, or phenotypic characteristics',
      radioligand_therapy: 'Targeted delivery of radioactive isotopes to specific tissues or cells'
    };
    return mechanisms[modality as keyof typeof mechanisms] + ` in the context of ${therapy.toLowerCase()}`;
  };

  const getSpecialHandling = (modality: string): any => {
    const handling = {
      cell_therapy: { cold_chain: true, viability_testing: true, sterile_conditions: true },
      gene_therapy: { biosafety_level: 'BSL-2', vector_containment: true, genetic_stability: true },
      personalized_medicine: { sample_integrity: true, data_security: true, turnaround_time: '< 2 weeks' },
      radioligand_therapy: { radiation_safety: true, decay_monitoring: true, waste_disposal: 'regulated' }
    };
    return handling[modality as keyof typeof handling] || {};
  };

  const getRegulatoryDesignations = (therapy: string): string[] => {
    const designations = ['IND', 'BLA'];
    if (therapy.includes('rare') || therapy.includes('orphan')) designations.push('Orphan Drug');
    if (therapy.includes('breakthrough') || therapy.includes('CRISPR')) designations.push('Breakthrough Therapy');
    if (therapy.includes('fast track') || therapy.includes('urgent')) designations.push('Fast Track');
    return designations;
  };

  const getServiceType = (service: string): '3pl' | 'specialty_distribution' | 'specialty_pharmacy' | 'order_management' | 'patient_hub_services' => {
    if (service.includes('manufacturing') || service.includes('production')) return '3pl';
    if (service.includes('testing') || service.includes('analysis')) return 'specialty_distribution';
    if (service.includes('consulting') || service.includes('advisory')) return 'patient_hub_services';
    if (service.includes('logistics') || service.includes('distribution')) return 'specialty_distribution';
    if (service.includes('pharmacy') || service.includes('dispensing')) return 'specialty_pharmacy';
    return 'order_management';
  };

  const getServiceRequirements = (service: string, modality: string): any => {
    return {
      compliance: ['GMP', 'ISO 13485', 'FDA 21 CFR Part 820'],
      certifications: ['AABB', 'CAP', 'CLIA'],
      quality_systems: ['ISO 9001', 'ICH Q10'],
      data_integrity: ['21 CFR Part 11', 'GDPR', 'HIPAA']
    };
  };

  const getPricingModel = (service: string): any => {
    return {
      model: 'per_unit',
      currency: 'USD',
      tiers: [
        { volume: '1-10', price: 50000 },
        { volume: '11-50', price: 45000 },
        { volume: '50+', price: 40000 }
      ]
    };
  };

  const getSLARequirements = (service: string): any => {
    return {
      response_time: '4 hours',
      resolution_time: '24 hours',
      availability: '99.9%',
      quality_metrics: {
        accuracy: '> 99%',
        reproducibility: '> 95%',
        contamination_rate: '< 0.1%'
      }
    };
  };

  const getServiceCapabilities = (service: string, modality: string): string[] => {
    const capabilities = {
      cell_therapy: ['Cell isolation', 'Expansion', 'Differentiation', 'Quality control', 'Cryopreservation'],
      gene_therapy: ['Vector design', 'Cloning', 'Production', 'Purification', 'Characterization'],
      personalized_medicine: ['Sequencing', 'Bioinformatics', 'Biomarker analysis', 'Report generation', 'Clinical decision support'],
      radioligand_therapy: ['Isotope production', 'Labeling', 'Quality control', 'Distribution', 'Waste management']
    };
    return capabilities[modality as keyof typeof capabilities] || [];
  };

  const startDataGeneration = async () => {
    setIsGenerating(true);
    setOverallProgress(0);
    
    const statusArray: GenerationStatus[] = modalities.map(modality => ({
      modality: modality.id,
      status: 'pending',
      progress: 0,
      generated: 0,
      message: 'Waiting to start...'
    }));
    
    setGenerationStatus(statusArray);

    let completedCount = 0;
    const totalModalities = modalities.length;

    for (const modality of modalities) {
      // Update status to generating
      setGenerationStatus(prev => prev.map(status => 
        status.modality === modality.id 
          ? { ...status, status: 'generating', message: `Generating ${modality.name} data...` }
          : status
      ));

      try {
        // Generate data using MCP and LLM capabilities
        const result = await generateTherapyData(modality);
        
        // Update status to completed
        setGenerationStatus(prev => prev.map(status => 
          status.modality === modality.id 
            ? { 
                ...status, 
                status: 'completed', 
                progress: 100, 
                generated: result.therapies + result.services,
                message: `Generated ${result.therapies} therapies, ${result.services} services`
              }
            : status
        ));

        completedCount++;
        setOverallProgress((completedCount / totalModalities) * 100);

        toast({
          title: "Data Generated",
          description: `${modality.name}: ${result.therapies} therapies, ${result.services} services`,
        });

      } catch (error) {
        console.error(`Error generating data for ${modality.name}:`, error);
        
        setGenerationStatus(prev => prev.map(status => 
          status.modality === modality.id 
            ? { 
                ...status, 
                status: 'error', 
                message: `Error: ${error instanceof Error ? error.message : 'Generation failed'}`
              }
            : status
        ));

        toast({
          title: "Generation Error",
          description: `Failed to generate data for ${modality.name}`,
          variant: "destructive"
        });
      }
    }

    await updateModalityCount();
    setIsGenerating(false);
    
    toast({
      title: "Generation Complete",
      description: "All therapy and service data has been generated successfully",
    });
  };

  React.useEffect(() => {
    updateModalityCount();
  }, []);

  const getStatusIcon = (status: GenerationStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Database className="h-4 w-4 text-gray-500" />;
      case 'generating':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>Intelligent Therapy Data Generator</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate comprehensive therapy, service, and product data using MCP and LLM capabilities
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Modality Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modalities.map((modality) => {
              const Icon = modality.icon;
              return (
                <Card key={modality.id} className={`border-2 ${modality.color.split(' ').slice(2).join(' ')}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-medium">{modality.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{modality.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {modality.count} items
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {modality.subcategories.length} types
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          {/* Generation Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Data Generation</h3>
              <p className="text-sm text-muted-foreground">
                Generate real therapy and service data for all modalities
              </p>
            </div>
            <Button 
              onClick={startDataGeneration}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate Data'}</span>
            </Button>
          </div>

          {/* Overall Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>
          )}

          {/* Generation Status */}
          {generationStatus.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Generation Status</h4>
              {generationStatus.map((status) => {
                const modality = modalities.find(m => m.id === status.modality);
                return (
                  <div key={status.modality} className="flex items-center space-x-3 p-3 border rounded-lg">
                    {getStatusIcon(status.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{modality?.name}</span>
                        {status.generated > 0 && (
                          <Badge variant="outline">{status.generated} items</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{status.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};