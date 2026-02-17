/**
 * ENROLLMENT SECTION PROGRESS TRACKER
 * Shows field-by-field progress within sections with completion confirmations
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Clock,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';

interface FieldProgress {
  fieldName: string;
  displayName: string;
  isRequired: boolean;
  isCompleted: boolean;
  isCurrentField: boolean;
  value?: any;
  validationStatus: 'valid' | 'invalid' | 'pending' | 'not_started';
  helperText?: string;
}

interface SectionProgress {
  sectionKey: string;
  sectionTitle: string;
  description: string;
  isCompleted: boolean;
  isCurrentSection: boolean;
  completedFields: number;
  totalFields: number;
  requiredFields: number;
  completedRequiredFields: number;
  fields: FieldProgress[];
  nextSectionPreview?: {
    title: string;
    description: string;
  };
}

interface EnrollmentSectionProgressTrackerProps {
  currentSection: SectionProgress;
  onFieldFocus?: (fieldName: string) => void;
  onSectionComplete?: () => void;
  showCompletionCelebration?: boolean;
}

export const EnrollmentSectionProgressTracker: React.FC<EnrollmentSectionProgressTrackerProps> = ({
  currentSection,
  onFieldFocus,
  onSectionComplete,
  showCompletionCelebration = false
}) => {
  const sectionProgress = (currentSection.completedFields / currentSection.totalFields) * 100;
  const requiredProgress = (currentSection.completedRequiredFields / currentSection.requiredFields) * 100;
  
  const getCurrentField = () => {
    return currentSection.fields.find(field => field.isCurrentField);
  };

  const getNextRequiredField = () => {
    return currentSection.fields.find(field => 
      field.isRequired && !field.isCompleted && !field.isCurrentField
    );
  };

  const canSkipToNext = () => {
    return currentSection.completedRequiredFields === currentSection.requiredFields;
  };

  return (
    <div className="space-y-6">
      {/* Section Header with Progress */}
      <Card className={`transition-all duration-300 ${
        currentSection.isCompleted ? 'border-green-200 bg-green-50/50' : 'border-primary/20'
      }`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {currentSection.isCompleted ? (
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-primary/10 rounded-full">
                  <Circle className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <div className="text-lg">{currentSection.sectionTitle}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {currentSection.description}
                </div>
              </div>
            </CardTitle>
            
            <div className="text-right">
              <Badge variant={currentSection.isCompleted ? "default" : "secondary"} className="mb-2">
                {currentSection.completedFields}/{currentSection.totalFields} Fields
              </Badge>
              <div className="text-xs text-muted-foreground">
                {currentSection.completedRequiredFields}/{currentSection.requiredFields} Required
              </div>
            </div>
          </div>
          
          {/* Progress Bars */}
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(sectionProgress)}%</span>
              </div>
              <Progress value={sectionProgress} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-600">Required Fields</span>
                <span className="text-sm text-red-600">{Math.round(requiredProgress)}%</span>
              </div>
              <Progress value={requiredProgress} className="h-2" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Section Completion Celebration */}
      {showCompletionCelebration && currentSection.isCompleted && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">🎉 Section Complete!</div>
                <div className="text-sm mt-1">
                  Great job! You've completed all required fields for {currentSection.sectionTitle}.
                </div>
              </div>
              {currentSection.nextSectionPreview && (
                <div className="text-right">
                  <div className="text-sm font-medium">Next:</div>
                  <div className="text-xs">{currentSection.nextSectionPreview.title}</div>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Field Focus */}
      {!currentSection.isCompleted && getCurrentField() && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Currently collecting:</div>
                <div className="text-sm text-muted-foreground">
                  {getCurrentField()?.displayName}
                  {getCurrentField()?.isRequired && <span className="text-red-500 ml-1">*</span>}
                </div>
                {getCurrentField()?.helperText && (
                  <div className="text-xs text-primary mt-1">
                    💡 {getCurrentField()?.helperText}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Field-by-Field Progress List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentSection.fields.map((field, index) => (
              <div
                key={field.fieldName}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
                  field.isCurrentField ? 'border-primary bg-primary/5' : 
                  field.isCompleted ? 'border-green-200 bg-green-50/50' :
                  'border-muted'
                }`}
                onClick={() => onFieldFocus?.(field.fieldName)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  {field.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : field.isCurrentField ? (
                    <Circle className="h-4 w-4 text-primary animate-pulse" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {field.displayName}
                    </span>
                    {field.isRequired && (
                      <Badge variant="destructive" className="text-xs h-4">
                        Required
                      </Badge>
                    )}
                    {field.isCurrentField && (
                      <Badge variant="default" className="text-xs h-4">
                        <Zap className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  {field.value && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Value: {field.value}
                    </div>
                  )}
                  
                  {field.validationStatus === 'invalid' && (
                    <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Needs correction
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {field.validationStatus === 'valid' && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                      Valid
                    </Badge>
                  )}
                  {field.validationStatus === 'pending' && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {field.isCurrentField && (
                    <ChevronRight className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Section Preview */}
      {canSkipToNext() && currentSection.nextSectionPreview && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Star className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-blue-900">Ready for next section!</div>
                  <div className="text-sm text-blue-700">
                    Up next: {currentSection.nextSectionPreview.title}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {currentSection.nextSectionPreview.description}
                  </div>
                </div>
              </div>
              
              <button
                onClick={onSectionComplete}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Continue to Next Section
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Required Fields Alert */}
      {!canSkipToNext() && getNextRequiredField() && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="font-semibold">Required field missing</div>
            <div className="text-sm mt-1">
              Please complete: <strong>{getNextRequiredField()?.displayName}</strong>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export type { FieldProgress, SectionProgress };