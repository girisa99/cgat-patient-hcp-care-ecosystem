/**
 * ENHANCED SECTION COMPLETION MODAL
 * Celebrates section completion and previews next section
 */
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Star, 
  ChevronRight, 
  Clock,
  Trophy,
  Zap,
  FileCheck,
  Send
} from 'lucide-react';

interface CompletedSection {
  sectionKey: string;
  sectionTitle: string;
  description: string;
  completedFields: number;
  totalFields: number;
  requiredFields: number;
  completionTime: number; // in seconds
  dataCollected: Array<{
    fieldName: string;
    displayName: string;
    value: any;
  }>;
}

interface NextSection {
  sectionKey: string;
  sectionTitle: string;
  description: string;
  estimatedTime: number; // in minutes
  totalFields: number;
  requiredFields: number;
  keyFields: string[];
}

interface EnhancedSectionCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  completedSection: CompletedSection;
  nextSection: NextSection | null;
  overallProgress: number;
  totalSections: number;
  completedSections: number;
}

export const EnhancedSectionCompletionModal: React.FC<EnhancedSectionCompletionModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  completedSection,
  nextSection,
  overallProgress,
  totalSections,
  completedSections
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setShowCelebration(true);
      setAutoAdvanceTimer(10);
      
      // Auto-advance timer
      const timer = setInterval(() => {
        setAutoAdvanceTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleContinue();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleContinue = () => {
    setShowCelebration(false);
    onContinue();
  };

  const getCompletionMessage = () => {
    const completionPercentage = Math.round((completedSection.completedFields / completedSection.totalFields) * 100);
    const timeMinutes = Math.round(completedSection.completionTime / 60);
    
    if (completionPercentage === 100) {
      return `Perfect! You completed all ${completedSection.totalFields} fields in ${timeMinutes} minutes.`;
    } else {
      return `Great progress! You completed ${completedSection.completedFields} of ${completedSection.totalFields} fields (${completionPercentage}%) in ${timeMinutes} minutes.`;
    }
  };

  const isLastSection = completedSections === totalSections;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${showCelebration ? 'animate-bounce' : ''} bg-green-100`}>
              {isLastSection ? (
                <Trophy className="h-6 w-6 text-green-600" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {isLastSection ? '🎉 Enrollment Complete!' : '✅ Section Complete!'}
              </div>
              <div className="text-sm font-normal text-muted-foreground">
                {completedSection.sectionTitle}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Completion Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Section Summary</span>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    {Math.round((completedSection.completedFields / completedSection.totalFields) * 100)}% Complete
                  </Badge>
                </div>
                
                <div className="text-sm text-green-800">
                  {getCompletionMessage()}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {completedSection.completedFields}
                    </div>
                    <div className="text-xs text-muted-foreground">Fields Completed</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {completedSection.requiredFields}
                    </div>
                    <div className="text-xs text-muted-foreground">Required Fields</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {Math.round(completedSection.completionTime / 60)}m
                    </div>
                    <div className="text-xs text-muted-foreground">Time Taken</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Enrollment Progress</span>
                  <Badge variant="outline">
                    Section {completedSections} of {totalSections}
                  </Badge>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <div className="text-sm text-muted-foreground text-center">
                  {Math.round(overallProgress)}% of enrollment completed
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Collected Preview */}
          {completedSection.dataCollected.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    <span className="font-medium">Information Collected</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {completedSection.dataCollected.slice(0, 6).map((field, index) => (
                      <div key={index} className="flex justify-between p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">{field.displayName}:</span>
                        <span className="font-medium truncate ml-2">
                          {typeof field.value === 'string' ? field.value : JSON.stringify(field.value)}
                        </span>
                      </div>
                    ))}
                    {completedSection.dataCollected.length > 6 && (
                      <div className="col-span-2 text-center text-xs text-muted-foreground">
                        ...and {completedSection.dataCollected.length - 6} more fields
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Section Preview */}
          {nextSection && !isLastSection && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Next Section</span>
                    </div>
                    <Badge variant="secondary" className="text-blue-700">
                      Coming Up
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="font-medium text-blue-900">{nextSection.sectionTitle}</div>
                    <div className="text-sm text-blue-700 mt-1">{nextSection.description}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2 bg-white rounded">
                      <div className="text-sm font-bold text-blue-600">{nextSection.totalFields}</div>
                      <div className="text-xs text-muted-foreground">Total Fields</div>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <div className="text-sm font-bold text-blue-600">{nextSection.requiredFields}</div>
                      <div className="text-xs text-muted-foreground">Required</div>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <div className="text-sm font-bold text-blue-600">~{nextSection.estimatedTime}m</div>
                      <div className="text-xs text-muted-foreground">Est. Time</div>
                    </div>
                  </div>

                  <div className="text-xs text-blue-600">
                    <div className="font-medium mb-1">Key information we'll collect:</div>
                    <div className="flex flex-wrap gap-1">
                      {nextSection.keyFields.map((field, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Completion Message */}
          {isLastSection && (
            <Card className="border-gold bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardContent className="pt-4 text-center">
                <div className="space-y-3">
                  <Trophy className="h-12 w-12 text-yellow-600 mx-auto" />
                  <div className="text-lg font-bold text-yellow-900">
                    🎉 Congratulations! 🎉
                  </div>
                  <div className="text-sm text-yellow-800">
                    You have successfully completed your enrollment! All your information has been collected and will be processed shortly.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose}>
              <Clock className="h-4 w-4 mr-2" />
              Review Later
            </Button>
            
            <div className="flex items-center gap-3">
              {!isLastSection && (
                <div className="text-sm text-muted-foreground">
                  Auto-continuing in {autoAdvanceTimer}s
                </div>
              )}
              
              <Button onClick={handleContinue} className="gap-2">
                {isLastSection ? (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Enrollment
                  </>
                ) : (
                  <>
                    Continue to {nextSection?.sectionTitle}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export type { CompletedSection, NextSection };