/**
 * ENROLLMENT SUMMARY COMPONENT
 * Review collected data before final submission
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Edit, Check, AlertCircle } from 'lucide-react';

interface ConversationContext {
  moduleType: string;
  currentSection: string;
  completedSections: string[];
  formData: Record<string, any>;
  instanceId: string | null;
  templateId: string | null;
}

interface SectionProgress {
  name: string;
  completed: boolean;
  data: Record<string, any>;
  required: boolean;
}

interface EnrollmentSummaryProps {
  context: ConversationContext | null;
  sectionProgress: SectionProgress[];
  onEdit: () => void;
  onComplete: () => void;
}

export const EnrollmentSummary: React.FC<EnrollmentSummaryProps> = ({
  context,
  sectionProgress,
  onEdit,
  onComplete
}) => {
  if (!context) return null;

  const getCompletionStats = () => {
    const totalRequired = sectionProgress.filter(s => s.required).length;
    const completedRequired = sectionProgress.filter(s => s.required && s.completed).length;
    const totalOptional = sectionProgress.filter(s => !s.required).length;
    const completedOptional = sectionProgress.filter(s => !s.required && s.completed).length;
    
    return {
      totalRequired,
      completedRequired,
      totalOptional,
      completedOptional,
      isComplete: completedRequired === totalRequired
    };
  };

  const formatFieldName = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  const formatFieldValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getSectionDisplayName = (sectionName: string) => {
    return sectionName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getModuleTitle = (moduleType: string) => {
    const titles = {
      patient: 'Patient Enrollment',
      treatment_center: 'Treatment Center Onboarding',
      customer: 'Customer Registration',
      manufacturer: 'Manufacturer Registration'
    };
    return titles[moduleType as keyof typeof titles] || moduleType;
  };

  const stats = getCompletionStats();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Enrollment Summary - {getModuleTitle(context.moduleType)}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant={stats.isComplete ? "default" : "secondary"}>
              {stats.completedRequired}/{stats.totalRequired} Required Sections Complete
            </Badge>
            {stats.totalOptional > 0 && (
              <Badge variant="outline">
                {stats.completedOptional}/{stats.totalOptional} Optional Sections Complete
              </Badge>
            )}
            {!stats.isComplete && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Missing required sections</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Section Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {sectionProgress.map((section) => (
                  <div
                    key={section.name}
                    className={`p-3 rounded-lg border ${
                      section.completed
                        ? 'border-green-200 bg-green-50'
                        : section.required
                        ? 'border-red-200 bg-red-50'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {getSectionDisplayName(section.name)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {section.completed ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-600" />
                          )}
                          <Badge
                            variant={section.required ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {section.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Data Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Collected Information</span>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {Object.keys(context.formData).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No data collected yet
                  </div>
                ) : (
                  Object.entries(context.formData).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {formatFieldName(key)}
                        </label>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        <pre className="whitespace-pre-wrap font-mono">
                          {formatFieldValue(value)}
                        </pre>
                      </div>
                      <Separator />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Continue Editing
            </Button>
            
            <Button
              onClick={onComplete}
              disabled={!stats.isComplete}
              className="min-w-[200px]"
            >
              {stats.isComplete ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Proceed to Signature
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Complete Required Sections
                </>
              )}
            </Button>
          </div>
          
          {!stats.isComplete && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Please complete all required sections before proceeding to signature.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};