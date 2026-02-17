/**
 * CLINICAL & TREATMENT PERMUTATION ANALYSIS
 * Comprehensive analysis of all clinical field scenarios and permutations
 * Shows progression from 27 base fields to 95+ maximum fields
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Stethoscope, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Pill, 
  Heart, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  Plus,
  Info
} from 'lucide-react';

interface FieldCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  baseFields: number;
  description: string;
  fields: string[];
  scenarios: {
    basic: number;
    enhanced: number;
    comprehensive: number;
    maximum: number;
  };
  priority: 'high' | 'medium' | 'low';
}

interface ScenarioBreakdown {
  name: string;
  totalFields: number;
  categories: {
    [key: string]: number;
  };
  description: string;
  useCases: string[];
  complianceLevel: string;
}

export const ClinicalTreatmentPermutationAnalysis: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('basic');
  const [activeCategories, setActiveCategories] = useState<string[]>(['clinical', 'medical-history']);

  const fieldCategories: FieldCategory[] = [
    {
      id: 'clinical',
      name: 'Clinical Assessment',
      icon: <Stethoscope className="h-4 w-4" />,
      baseFields: 6,
      description: 'Primary diagnosis, symptoms, and clinical evaluation',
      priority: 'high',
      fields: [
        'Primary Diagnosis/Chief Complaint', 'Secondary Diagnosis', 'ICD-10 Codes',
        'Symptom Severity (1-10)', 'Duration of Symptoms', 'Functional Impairment Level'
      ],
      scenarios: { basic: 6, enhanced: 6, comprehensive: 6, maximum: 8 }
    },
    {
      id: 'medical-history',
      name: 'Medical History',
      icon: <FileText className="h-4 w-4" />,
      baseFields: 6,
      description: 'Past medical history, treatments, and family history',
      priority: 'high',
      fields: [
        'Relevant Medical History', 'Previous Treatments Tried', 'Current Medications',
        'Known Allergies', 'Substance Use History', 'Relevant Family History'
      ],
      scenarios: { basic: 6, enhanced: 8, comprehensive: 10, maximum: 12 }
    },
    {
      id: 'treatment-planning',
      name: 'Treatment Planning',
      icon: <ShieldCheck className="h-4 w-4" />,
      baseFields: 6,
      description: 'Treatment goals, plans, and expected outcomes',
      priority: 'high',
      fields: [
        'Treatment Goals', 'Proposed Treatment Plan', 'Treatment Modality',
        'Treatment Frequency', 'Estimated Treatment Duration', 'Expected Treatment Outcomes'
      ],
      scenarios: { basic: 6, enhanced: 8, comprehensive: 10, maximum: 15 }
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      icon: <AlertTriangle className="h-4 w-4" />,
      baseFields: 4,
      description: 'Safety assessments and risk mitigation plans',
      priority: 'high',
      fields: [
        'Suicide Risk Assessment', 'Violence Risk Assessment',
        'Safety Plan Needed', 'Emergency Contact Provider'
      ],
      scenarios: { basic: 0, enhanced: 4, comprehensive: 6, maximum: 8 }
    },
    {
      id: 'medication-management',
      name: 'Medication Management',
      icon: <Pill className="h-4 w-4" />,
      baseFields: 3,
      description: 'Medication history, compliance, and management',
      priority: 'medium',
      fields: [
        'Medication Management Needed', 'Prescribing Provider',
        'Medication Compliance History'
      ],
      scenarios: { basic: 0, enhanced: 3, comprehensive: 5, maximum: 8 }
    },
    {
      id: 'special-considerations',
      name: 'Special Considerations',
      icon: <Heart className="h-4 w-4" />,
      baseFields: 4,
      description: 'Cultural, accessibility, and special needs considerations',
      priority: 'medium',
      fields: [
        'Special Accommodations Needed', 'Cultural/Religious Considerations',
        'Language Interpreter Needed', 'Transportation Barriers'
      ],
      scenarios: { basic: 0, enhanced: 0, comprehensive: 4, maximum: 6 }
    },
    {
      id: 'advanced-clinical',
      name: 'Advanced Clinical Data',
      icon: <BarChart3 className="h-4 w-4" />,
      baseFields: 12,
      description: 'Lab results, imaging, biomarkers, and advanced assessments',
      priority: 'low',
      fields: [
        'Laboratory Results', 'Imaging Studies', 'Biomarker Status', 'Genetic Testing',
        'Performance Status', 'Comorbidity Index', 'Frailty Assessment', 'Cognitive Assessment',
        'Nutritional Status', 'Pain Assessment', 'Quality of Life Scores', 'Social Determinants'
      ],
      scenarios: { basic: 0, enhanced: 0, comprehensive: 8, maximum: 12 }
    },
    {
      id: 'research-trial',
      name: 'Research & Clinical Trials',
      icon: <FileText className="h-4 w-4" />,
      baseFields: 8,
      description: 'Clinical trial eligibility and research participation',
      priority: 'low',
      fields: [
        'Clinical Trial Eligibility', 'Research Participation History', 'Informed Consent Status',
        'Protocol Compliance', 'Adverse Event History', 'Biospecimen Collection',
        'Data Sharing Consent', 'Follow-up Schedule'
      ],
      scenarios: { basic: 0, enhanced: 0, comprehensive: 0, maximum: 8 }
    }
  ];

  const scenarios: Record<string, ScenarioBreakdown> = {
    basic: {
      name: 'Basic Clinical (18 Fields)',
      totalFields: 18,
      categories: {
        clinical: 6,
        'medical-history': 6,
        'treatment-planning': 6,
        'risk-assessment': 0,
        'medication-management': 0,
        'special-considerations': 0,
        'advanced-clinical': 0,
        'research-trial': 0
      },
      description: 'Essential clinical information for basic treatment planning',
      useCases: [
        'Primary care consultations',
        'Basic treatment initiation',
        'Simple case management'
      ],
      complianceLevel: 'Standard Care'
    },
    enhanced: {
      name: 'Enhanced Clinical (29 Fields)',
      totalFields: 29,
      categories: {
        clinical: 6,
        'medical-history': 8,
        'treatment-planning': 8,
        'risk-assessment': 4,
        'medication-management': 3,
        'special-considerations': 0,
        'advanced-clinical': 0,
        'research-trial': 0
      },
      description: 'Comprehensive clinical assessment with risk evaluation',
      useCases: [
        'Specialty care referrals',
        'Complex treatment planning',
        'Risk assessment protocols'
      ],
      complianceLevel: 'Enhanced Safety'
    },
    comprehensive: {
      name: 'Comprehensive Clinical (49 Fields)',
      totalFields: 49,
      categories: {
        clinical: 6,
        'medical-history': 10,
        'treatment-planning': 10,
        'risk-assessment': 6,
        'medication-management': 5,
        'special-considerations': 4,
        'advanced-clinical': 8,
        'research-trial': 0
      },
      description: 'Complete clinical evaluation with advanced assessments',
      useCases: [
        'Complex medical conditions',
        'Multi-specialty coordination',
        'Advanced treatment protocols'
      ],
      complianceLevel: 'Comprehensive Care'
    },
    maximum: {
      name: 'Maximum Complexity (75 Fields)',
      totalFields: 75,
      categories: {
        clinical: 8,
        'medical-history': 12,
        'treatment-planning': 15,
        'risk-assessment': 8,
        'medication-management': 8,
        'special-considerations': 6,
        'advanced-clinical': 12,
        'research-trial': 8
      },
      description: 'Complete clinical profile with research and trial participation',
      useCases: [
        'Research study participation',
        'Experimental treatments',
        'Academic medical centers'
      ],
      complianceLevel: 'Research Grade'
    }
  };

  const toggleCategory = (categoryId: string) => {
    setActiveCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const calculateActiveFields = () => {
    return activeCategories.reduce((total, categoryId) => {
      const category = fieldCategories.find(c => c.id === categoryId);
      return total + (category?.baseFields || 0);
    }, 0);
  };

  const getCurrentScenario = () => scenarios[selectedScenario];

  const getImplementationGap = () => {
    const currentMapped = 2; // Only 2 fields currently mapped
    const totalExpected = getCurrentScenario().totalFields;
    return {
      mapped: currentMapped,
      missing: totalExpected - currentMapped,
      percentage: Math.round((currentMapped / totalExpected) * 100)
    };
  };

  return (
    <div className="space-y-6">
      {/* Current Implementation Gap Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-800">
          <div className="font-medium mb-2">CRITICAL IMPLEMENTATION GAP DETECTED</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>Currently Mapped: <strong>2 fields</strong></div>
            <div>Expected for Basic Scenario: <strong>18 fields</strong></div>
            <div>Implementation Coverage: <strong>11%</strong></div>
          </div>
          <div className="mt-2">Missing 16 essential clinical fields for basic treatment planning!</div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Clinical & Treatment Field Permutation Analysis
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Reference: Screenshot shows Clinical tab as part of healthcare navigation system
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedScenario} onValueChange={setSelectedScenario}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic (18)</TabsTrigger>
              <TabsTrigger value="enhanced">Enhanced (29)</TabsTrigger>
              <TabsTrigger value="comprehensive">Comprehensive (49)</TabsTrigger>
              <TabsTrigger value="maximum">Maximum (75)</TabsTrigger>
            </TabsList>

            {Object.entries(scenarios).map(([key, scenario]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">{scenario.name}</h3>
                  <p className="text-muted-foreground mt-1">{scenario.description}</p>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Field Coverage</span>
                      <span>{scenario.totalFields}/75 possible fields</span>
                    </div>
                    <Progress value={(scenario.totalFields / 75) * 100} className="w-full" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Use Cases:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {scenario.useCases.map((useCase, index) => (
                          <li key={index}>{useCase}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Compliance Level:</h4>
                      <Badge variant="outline" className="text-sm">
                        {scenario.complianceLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Field Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {fieldCategories.map((category) => {
              const isActive = getCurrentScenario().categories[category.id] > 0;
              const fieldCount = getCurrentScenario().categories[category.id];
              
              return (
                <div 
                  key={category.id}
                  className={`p-4 border rounded-lg transition-all ${
                    isActive ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {category.icon}
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={category.priority === 'high' ? 'destructive' : 
                                category.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {category.priority.toUpperCase()}
                      </Badge>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {fieldCount}/{category.baseFields} fields
                      </Badge>
                      {isActive ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {category.fields.slice(0, fieldCount).map((field, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {field}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Field Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Clinical Field Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Toggle categories to see how field count changes dynamically:
            </p>
            
            <div className="flex flex-wrap gap-2">
              {fieldCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategories.includes(category.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center gap-1"
                >
                  {category.icon}
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.baseFields}
                  </Badge>
                </Button>
              ))}
            </div>

            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Active Fields:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {calculateActiveFields()}
                  </Badge>
                  <span className="text-muted-foreground">/ 75 maximum</span>
                </div>
              </div>
              <Progress value={(calculateActiveFields() / 75) * 100} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Priority Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Priority Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg border-red-200 bg-red-50">
                <h4 className="font-medium text-red-800">HIGH PRIORITY (Immediate)</h4>
                <p className="text-sm text-red-700 mt-1">
                  Complete basic clinical assessment workflow
                </p>
                <div className="mt-2">
                  <Badge variant="destructive">18 fields</Badge>
                  <Badge variant="outline" className="ml-1">2-3 weeks</Badge>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                <h4 className="font-medium text-yellow-800">MEDIUM PRIORITY (Next Sprint)</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Add risk assessment and medication management
                </p>
                <div className="mt-2">
                  <Badge variant="default">11 fields</Badge>
                  <Badge variant="outline" className="ml-1">3-4 weeks</Badge>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
                <h4 className="font-medium text-blue-800">LOW PRIORITY (Future)</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Advanced clinical data and research integration
                </p>
                <div className="mt-2">
                  <Badge variant="secondary">20 fields</Badge>
                  <Badge variant="outline" className="ml-1">6-8 weeks</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">URGENT: Required Implementation Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div>
                <strong>Immediate Actions (This Sprint):</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Implement missing 16 basic clinical fields</li>
                  <li>Create clinical assessment workflow</li>
                  <li>Add primary diagnosis and symptom tracking</li>
                  <li>Implement medical history capture</li>
                  <li>Create treatment planning interface</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <div>
                <strong>Next Phase Actions:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Add risk assessment protocols</li>
                  <li>Implement medication management</li>
                  <li>Create safety planning workflows</li>
                  <li>Add special considerations handling</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};