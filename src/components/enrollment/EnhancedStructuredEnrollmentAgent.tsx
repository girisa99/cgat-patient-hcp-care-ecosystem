/**
 * ENHANCED STRUCTURED ENROLLMENT AGENT
 * Section-by-section AI guidance with field-by-field collection and enhanced UX
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  CreditCard,
  Heart,
  FileCheck,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FieldByFieldCollector, type FieldDefinition } from '../patient-enrollment/FieldByFieldCollector';
import { EnhancedRealtimeProgressTracker } from '../patient-enrollment/EnhancedRealtimeProgressTracker';
import { EnhancedSectionCompletionModal } from '../patient-enrollment/EnhancedSectionCompletionModal';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface EnrollmentSection {
  id: string;
  title: string; 
  description: string;
  icon: React.ComponentType<any>;
  fields: FieldDefinition[];
  estimatedTime: number;
  isRequired: boolean;
  aiGuidance: string;
}

interface EnhancedStructuredEnrollmentAgentProps {
  moduleType: ModuleType;
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

export const EnhancedStructuredEnrollmentAgent: React.FC<EnhancedStructuredEnrollmentAgentProps> = ({
  moduleType,
  onComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showSectionCompletion, setShowSectionCompletion] = useState(false);
  const [completedSectionData, setCompletedSectionData] = useState<any>(null);
  const [patientId] = useState(() => crypto.randomUUID());
  const [sessionId] = useState(() => crypto.randomUUID());

  // Initialize database record on mount  
  useEffect(() => {
    initializeEnrollmentRecord();
  }, [patientId]);

  const initializeEnrollmentRecord = async () => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user?.id) return;

      // Ensure valid UUID and session_id before DB insert
      const validPatientId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientId) 
        ? patientId : crypto.randomUUID();
      const validSessionId = sessionId || `struct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await supabase.from('patient_enrollments').upsert({
        id: validPatientId,
        session_id: validSessionId,
        enrollment_status: 'in_progress',
        current_section: 'patient_information',
        progress_percentage: 0,
        enrollment_source: 'structured_ai',
        metadata: { 
          agent_type: 'structured', 
          module_type: moduleType,
          completed_sections: [],
          section_timestamps: {}
        },
        user_id: authUser.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to initialize enrollment record:', error);
    }
  };

  // Define enrollment sections based on module type
  const getEnrollmentSections = (): EnrollmentSection[] => {
    const patientSections: EnrollmentSection[] = [
      {
        id: 'patient_information',
        title: 'Patient Information',
        description: 'Basic demographics and contact information',
        icon: User,
        estimatedTime: 5,
        isRequired: true,
        aiGuidance: "I'll help you collect your basic information step by step. We'll start with your name and work through your contact details.",
        fields: [
          {
            name: 'first_name',
            displayName: 'First Name',
            type: 'text',
            isRequired: true,
            placeholder: 'Enter your first name',
            helperText: 'Your legal first name as it appears on your ID'
          },
          {
            name: 'last_name',
            displayName: 'Last Name',
            type: 'text',
            isRequired: true,
            placeholder: 'Enter your last name',
            helperText: 'Your legal last name as it appears on your ID'
          },
          {
            name: 'date_of_birth',
            displayName: 'Date of Birth',
            type: 'date',
            isRequired: true,
            helperText: 'This information is required for identity verification'
          },
          {
            name: 'email',
            displayName: 'Email Address',
            type: 'email',
            isRequired: true,
            placeholder: 'your.email@example.com',
            helperText: 'We\'ll use this for important updates about your enrollment'
          },
          {
            name: 'phone',
            displayName: 'Phone Number',
            type: 'phone',
            isRequired: true,
            placeholder: '(555) 123-4567',
            helperText: 'Include area code for contact purposes'
          },
          {
            name: 'address_line_1',
            displayName: 'Street Address',
            type: 'text',
            isRequired: true,
            placeholder: '123 Main Street',
            helperText: 'Your primary residential address'
          },
          {
            name: 'city',
            displayName: 'City',
            type: 'text',
            isRequired: true,
            placeholder: 'Enter city'
          },
          {
            name: 'state',
            displayName: 'State',
            type: 'select',
            isRequired: true,
            options: [
              { value: 'CA', label: 'California' },
              { value: 'NY', label: 'New York' },
              { value: 'TX', label: 'Texas' },
              { value: 'FL', label: 'Florida' }
              // Add more states as needed
            ]
          },
          {
            name: 'zip_code',
            displayName: 'ZIP Code',
            type: 'text',
            isRequired: true,
            placeholder: '12345',
            validation: {
              pattern: /^\d{5}(-\d{4})?$/
            }
          }
        ]
      },
      {
        id: 'provider_information',
        title: 'Provider & Treatment Center',
        description: 'Healthcare provider and facility details',
        icon: Building2,
        estimatedTime: 4,
        isRequired: true,
        aiGuidance: "Now I'll collect information about your healthcare provider and treatment facility. This includes NPI verification for credentialing.",
        fields: [
          {
            name: 'provider_name',
            displayName: 'Provider Name',
            type: 'text',
            isRequired: true,
            placeholder: 'Dr. John Smith',
            helperText: 'Full name of your healthcare provider'
          },
          {
            name: 'provider_npi',
            displayName: 'Provider NPI Number',
            type: 'text',
            isRequired: true,
            placeholder: '1234567890',
            helperText: '10-digit National Provider Identifier',
            validation: {
              pattern: /^\d{10}$/,
              customValidator: (value) => {
                if (!/^\d{10}$/.test(value)) return 'NPI must be exactly 10 digits';
                return true;
              }
            }
          },
          {
            name: 'treatment_center',
            displayName: 'Treatment Center',
            type: 'text',
            isRequired: true,
            placeholder: 'Medical Center Name',
            helperText: 'Name of the healthcare facility'
          },
          {
            name: 'facility_npi',
            displayName: 'Facility NPI (Optional)',
            type: 'text',
            isRequired: false,
            placeholder: '1234567890',
            helperText: 'Facility NPI if different from provider',
            validation: {
              pattern: /^\d{10}$/
            }
          }
        ]
      },
      {
        id: 'insurance_information',
        title: 'Insurance Information',
        description: 'Medical and pharmacy insurance details',
        icon: CreditCard,
        estimatedTime: 6,
        isRequired: true,
        aiGuidance: "Let's verify your insurance coverage. I'll need information from your insurance cards to check benefits and eligibility.",
        fields: [
          {
            name: 'primary_insurance_name',
            displayName: 'Primary Insurance Provider',
            type: 'text',
            isRequired: true,
            placeholder: 'Blue Cross Blue Shield',
            helperText: 'Name as shown on your insurance card'
          },
          {
            name: 'member_id',
            displayName: 'Member ID',
            type: 'text',
            isRequired: true,
            placeholder: 'ABC123456789',
            helperText: 'Member ID from your insurance card'
          },
          {
            name: 'group_number',
            displayName: 'Group Number',
            type: 'text',
            isRequired: false,
            placeholder: 'GRP12345',
            helperText: 'Group number if shown on your card'
          },
          {
            name: 'policy_holder_name',
            displayName: 'Policy Holder Name',
            type: 'text',
            isRequired: true,
            placeholder: 'John Doe',
            helperText: 'Name of the primary policy holder'
          },
          {
            name: 'relationship_to_patient',
            displayName: 'Relationship to Patient',
            type: 'select',
            isRequired: true,
            options: [
              { value: 'self', label: 'Self' },
              { value: 'spouse', label: 'Spouse' },
              { value: 'child', label: 'Child' },
              { value: 'parent', label: 'Parent' },
              { value: 'other', label: 'Other' }
            ]
          }
        ]
      },
      {
        id: 'clinical_assessment',
        title: 'Clinical Assessment',
        description: 'Medical history and treatment information',
        icon: Heart,
        estimatedTime: 8,
        isRequired: true,
        aiGuidance: "Finally, I need some clinical information about your condition and treatment goals. This helps ensure you receive appropriate care.",
        fields: [
          {
            name: 'primary_diagnosis',
            displayName: 'Primary Diagnosis',
            type: 'text',
            isRequired: true,
            placeholder: 'Main medical condition',
            helperText: 'Primary reason for seeking treatment'
          },
          {
            name: 'secondary_diagnoses',
            displayName: 'Secondary Diagnoses',
            type: 'textarea',
            isRequired: false,
            placeholder: 'Additional medical conditions...',
            helperText: 'Any other relevant medical conditions'
          },
          {
            name: 'current_medications',
            displayName: 'Current Medications',
            type: 'textarea',
            isRequired: false,
            placeholder: 'List current medications...',
            helperText: 'Include dosages and frequency if known'
          },
          {
            name: 'allergies',
            displayName: 'Allergies',
            type: 'textarea',
            isRequired: false,
            placeholder: 'Known allergies...',
            helperText: 'Include drug allergies and reactions'
          },
          {
            name: 'treatment_goals',
            displayName: 'Treatment Goals',
            type: 'textarea',
            isRequired: true,
            placeholder: 'What do you hope to achieve...',
            helperText: 'Your primary goals for treatment'
          }
        ]
      }
    ];

    return patientSections;
  };

  const sections = getEnrollmentSections();
  const currentSection = sections[currentSectionIndex];
  const overallProgress = (completedSections.length / sections.length) * 100;

  const handleSectionComplete = async (sectionId: string, data: Record<string, any>) => {
    // Update section data
    setSectionData(prev => ({ ...prev, [sectionId]: data }));
    
    // Mark section as completed
    if (!completedSections.includes(sectionId)) {
      setCompletedSections(prev => [...prev, sectionId]);
    }

    // Persist section completion to database with DB constraint fixes
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientId)) {
        const newCompletedSections = [...completedSections, sectionId];
        const progress = Math.round((newCompletedSections.length / sections.length) * 100);
        const nextSection = sections[currentSectionIndex + 1];

        // Clean data for DB persistence (normalize empty strings, validate NPIs)
        const cleanedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => {
            let dbValue = (typeof value === 'string' && value.trim() === '') ? null : value;
            
            // NPI validation: only persist exactly 10 digits
            if (/npi$/i.test(key) && dbValue) {
              const digits = dbValue.toString().replace(/\D/g, '');
              dbValue = digits.length === 10 ? digits : null;
            }
            
            return [key, dbValue];
          })
        );

        await supabase.from('patient_enrollments').update({
          current_section: nextSection?.id || sectionId,
          progress_percentage: progress,
          metadata: {
            agent_type: 'structured',
            module_type: moduleType,
            completed_sections: newCompletedSections,
            section_timestamps: {
              [sectionId]: new Date().toISOString()
            },
            section_data: { [sectionId]: cleanedData }
          },
          updated_at: new Date().toISOString()
        }).eq('id', patientId);
      }
    } catch (error) {
      console.error('Failed to update section completion:', error);
    }

    // Prepare completion modal data
    setCompletedSectionData({
      sectionKey: sectionId,
      sectionTitle: currentSection.title,
      description: currentSection.description,
      completedFields: Object.keys(data).length,
      totalFields: currentSection.fields.length,
      requiredFields: currentSection.fields.filter(f => f.isRequired).length,
      completionTime: currentSection.estimatedTime * 60, // Convert to seconds
      dataCollected: Object.entries(data).map(([key, value]) => ({
        fieldName: key,
        displayName: currentSection.fields.find(f => f.name === key)?.displayName || key,
        value
      }))
    });

    setShowSectionCompletion(true);

    toast({
      title: "Section Completed! 🎉",
      description: `${currentSection.title} has been completed successfully.`,
    });
  };

  const handleContinueToNext = () => {
    setShowSectionCompletion(false);
    
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      // All sections completed
      handleComplete();
    }
  };

  const handleComplete = () => {
    const result = {
      patientId,
      sessionId,
      moduleType,
      completedSections,
      sectionData,
      overallProgress: 100,
      completedAt: new Date().toISOString()
    };

    onComplete?.(result);
    
    toast({
      title: "Enrollment Complete! 🎉",
      description: "All sections have been completed successfully.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" />
                Structured Enrollment Agent
                <Badge variant="secondary">Field-by-Field</Badge>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Module: {moduleType} • Progress: {Math.round(overallProgress)}%
              </div>
            </CardHeader>
          </Card>

          {/* Section Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrollment Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={currentSection.id} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {sections.map((section, index) => {
                    const IconComponent = section.icon;
                    const isCompleted = completedSections.includes(section.id);
                    const isCurrent = index === currentSectionIndex;
                    
                    return (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        className={`flex items-center gap-2 ${
                          isCompleted ? 'text-green-600' : 
                          isCurrent ? 'text-primary' : 'text-muted-foreground'
                        }`}
                        disabled={index > currentSectionIndex}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <IconComponent className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">{section.title}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value={currentSection.id} className="mt-6">
                  {/* AI Guidance */}
                  <Alert className="mb-6 border-blue-200 bg-blue-50">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <div className="font-semibold">AI Guidance</div>
                      <div className="text-sm mt-1">{currentSection.aiGuidance}</div>
                    </AlertDescription>
                  </Alert>

                  {/* Field-by-Field Collector */}
                  <FieldByFieldCollector
                    sectionTitle={currentSection.title}
                    sectionDescription={currentSection.description}
                    fields={currentSection.fields}
                    initialData={sectionData[currentSection.id] || {}}
                    onFieldUpdate={(fieldName, value) => {
                      // Apply universal DB constraint fixes before updating state
                      let dbValue = (typeof value === 'string' && value.trim() === '') ? null : value;
                      
                      // NPI validation: only allow exactly 10 digits for DB persistence
                      const isNpiField = /npi$/i.test(fieldName);
                      if (isNpiField && dbValue) {
                        const digits = dbValue.toString().replace(/\D/g, '');
                        if (digits.length !== 10) {
                          dbValue = value; // Keep for UI validation, but won't persist invalid NPI
                        } else {
                          dbValue = digits; // Valid NPI for DB
                        }
                      }
                      
                      setSectionData(prev => ({
                        ...prev,
                        [currentSection.id]: {
                          ...prev[currentSection.id],
                          [fieldName]: dbValue
                        }
                      }));
                    }}
                    onSectionComplete={(data) => {
                      handleSectionComplete(currentSection.id, data);
                    }}
                    onCancel={onCancel}
                    showPreview={true}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Progress & Tools */}
        <div className="space-y-6">
          {/* Enhanced Real-time Progress Tracker */}
          <EnhancedRealtimeProgressTracker
            patientId={patientId}
            sessionId={sessionId}
            onSectionComplete={(sectionKey) => {
              console.log('Section completed via realtime:', sectionKey);
            }}
            onProgressUpdate={(progress) => {
              console.log('Progress updated:', progress);
            }}
            dashboardSyncEnabled={true}
          />

          {/* Section Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Section Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sections.map((section, index) => {
                  const IconComponent = section.icon;
                  const isCompleted = completedSections.includes(section.id);
                  const isCurrent = index === currentSectionIndex;
                  
                  return (
                    <div key={section.id} className={`flex items-center gap-3 p-2 rounded ${
                      isCurrent ? 'bg-primary/10 border border-primary/20' : ''
                    }`}>
                      <div className={`p-1 rounded ${
                        isCompleted ? 'bg-green-100' :
                        isCurrent ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <IconComponent className={`h-4 w-4 ${
                            isCurrent ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{section.title}</div>
                        <div className="text-xs text-muted-foreground">
                          ~{section.estimatedTime} min • {section.fields.length} fields
                        </div>
                      </div>
                      {isCurrent && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Completion Modal */}
      {showSectionCompletion && completedSectionData && (
        <EnhancedSectionCompletionModal
          isOpen={showSectionCompletion}
          onClose={() => setShowSectionCompletion(false)}
          onContinue={handleContinueToNext}
          completedSection={completedSectionData}
          nextSection={currentSectionIndex < sections.length - 1 ? {
            sectionKey: sections[currentSectionIndex + 1].id,
            sectionTitle: sections[currentSectionIndex + 1].title,
            description: sections[currentSectionIndex + 1].description,
            estimatedTime: sections[currentSectionIndex + 1].estimatedTime,
            totalFields: sections[currentSectionIndex + 1].fields.length,
            requiredFields: sections[currentSectionIndex + 1].fields.filter(f => f.isRequired).length,
            keyFields: sections[currentSectionIndex + 1].fields.slice(0, 3).map(f => f.displayName)
          } : null}
          overallProgress={overallProgress}
          totalSections={sections.length}
          completedSections={completedSections.length}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={completedSections.length < sections.length}
        >
          Complete Enrollment
        </Button>
      </div>
    </div>
  );
};