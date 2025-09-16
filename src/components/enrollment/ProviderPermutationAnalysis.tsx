/**
 * PROVIDER PERMUTATION ANALYSIS
 * Analyzes and displays all possible provider field scenarios
 * Shows progression from 16 base fields to 44 maximum fields
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Building, 
  ShieldCheck, 
  Award, 
  Network, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  Plus
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
    maximum: number;
  };
}

interface ScenarioBreakdown {
  name: string;
  totalFields: number;
  categories: {
    [key: string]: number;
  };
  description: string;
  useCases: string[];
}

export const ProviderPermutationAnalysis: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('basic');
  const [activeCategories, setActiveCategories] = useState<string[]>(['provider']);

  const fieldCategories: FieldCategory[] = [
    {
      id: 'provider',
      name: 'Provider Information',
      icon: <User className="h-4 w-4" />,
      baseFields: 16,
      description: 'Core provider demographics and professional details',
      fields: [
        'First Name', 'Last Name', 'Middle Initial', 'Suffix',
        'NPI Number', 'Taxonomy Code', 'Primary Specialty', 'Secondary Specialty',
        'Email', 'Phone', 'Fax', 'Date of Birth',
        'SSN', 'Medical License Number', 'Medical License State', 'Medical License Expiration'
      ],
      scenarios: { basic: 16, enhanced: 16, maximum: 16 }
    },
    {
      id: 'facility',
      name: 'Facility Information',
      icon: <Building className="h-4 w-4" />,
      baseFields: 8,
      description: 'Practice location and facility details',
      fields: [
        'Facility Name', 'Facility NPI', 'Facility Address', 'Facility City',
        'Facility State', 'Facility ZIP', 'Facility Phone', 'Facility Type'
      ],
      scenarios: { basic: 0, enhanced: 8, maximum: 8 }
    },
    {
      id: 'verification',
      name: 'NPI Verification & Credentialing',
      icon: <ShieldCheck className="h-4 w-4" />,
      baseFields: 12,
      description: 'Credentialing, licensing, and verification details',
      fields: [
        'DEA Number', 'DEA Expiration', 'CDS Number', 'Board Certification',
        'Board Certification Expiration', 'Malpractice Insurance', 'Malpractice Carrier',
        'Malpractice Policy Number', 'Malpractice Expiration', 'Background Check Status',
        'Credentialing Status', 'Last Credentialing Date'
      ],
      scenarios: { basic: 0, enhanced: 6, maximum: 12 }
    },
    {
      id: 'certifications',
      name: 'Advanced Therapy Certifications',
      icon: <Award className="h-4 w-4" />,
      baseFields: 5,
      description: 'Specialized certifications for addiction treatment',
      fields: [
        'Suboxone Waiver', 'Suboxone Waiver Number', 'MAT Certification',
        'Opioid Treatment License', 'Specialized Training'
      ],
      scenarios: { basic: 0, enhanced: 0, maximum: 5 }
    },
    {
      id: 'network',
      name: 'Referral Network',
      icon: <Network className="h-4 w-4" />,
      baseFields: 3,
      description: 'Referral partnerships and network affiliations',
      fields: [
        'Referral Network ID', 'Preferred Referral Partners', 'Referral Agreements'
      ],
      scenarios: { basic: 0, enhanced: 0, maximum: 3 }
    }
  ];

  const scenarios: Record<string, ScenarioBreakdown> = {
    basic: {
      name: 'Basic Provider (16 Fields)',
      totalFields: 16,
      categories: {
        provider: 16,
        facility: 0,
        verification: 0,
        certifications: 0,
        network: 0
      },
      description: 'Minimum required provider information for basic enrollment',
      useCases: [
        'Initial provider registration',
        'Basic referral setup',
        'Quick enrollment process'
      ]
    },
    enhanced: {
      name: 'Enhanced Provider (30 Fields)',
      totalFields: 30,
      categories: {
        provider: 16,
        facility: 8,
        verification: 6,
        certifications: 0,
        network: 0
      },
      description: 'Comprehensive provider profile with facility and basic credentialing',
      useCases: [
        'Full facility enrollment',
        'Provider credentialing',
        'Network participation'
      ]
    },
    maximum: {
      name: 'Maximum Complexity (44 Fields)',
      totalFields: 44,
      categories: {
        provider: 16,
        facility: 8,
        verification: 12,
        certifications: 5,
        network: 3
      },
      description: 'Complete provider profile with all specializations and certifications',
      useCases: [
        'Addiction treatment specialists',
        'Multi-facility networks',
        'Complete compliance documentation'
      ]
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Provider Field Permutation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedScenario} onValueChange={setSelectedScenario}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic (16)</TabsTrigger>
              <TabsTrigger value="enhanced">Enhanced (30)</TabsTrigger>
              <TabsTrigger value="maximum">Maximum (44)</TabsTrigger>
            </TabsList>

            {Object.entries(scenarios).map(([key, scenario]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">{scenario.name}</h3>
                  <p className="text-muted-foreground mt-1">{scenario.description}</p>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Field Coverage</span>
                      <span>{scenario.totalFields}/44 fields</span>
                    </div>
                    <Progress value={(scenario.totalFields / 44) * 100} className="w-full" />
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Use Cases:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {scenario.useCases.map((useCase, index) => (
                        <li key={index}>{useCase}</li>
                      ))}
                    </ul>
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
          <CardTitle>Field Categories</CardTitle>
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
          <CardTitle>Interactive Field Calculator</CardTitle>
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
                  <span className="text-muted-foreground">/ 44 maximum</span>
                </div>
              </div>
              <Progress value={(calculateActiveFields() / 44) * 100} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-green-600">Basic Scenario</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Quick provider onboarding with essential information only
                </p>
                <div className="mt-2">
                  <Badge variant="outline">16 fields</Badge>
                  <Badge variant="outline" className="ml-1">5 min completion</Badge>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-blue-600">Enhanced Scenario</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive enrollment with facility and credentialing
                </p>
                <div className="mt-2">
                  <Badge variant="outline">30 fields</Badge>
                  <Badge variant="outline" className="ml-1">12 min completion</Badge>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-purple-600">Maximum Scenario</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete provider profile with all specializations
                </p>
                <div className="mt-2">
                  <Badge variant="outline">44 fields</Badge>
                  <Badge variant="outline" className="ml-1">20 min completion</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};