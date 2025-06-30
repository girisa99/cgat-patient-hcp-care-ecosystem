
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle, Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  key: string;
  label: string;
  required: boolean;
}

interface Section {
  id: string;
  label: string;
  description: string;
  steps: Step[];
  completionWeight: number;
}

interface AnimatedJourneyProps {
  sections: Section[];
  activeSection: string;
  activeStep: string;
  getStepCompletion: (stepKey: string) => 'complete' | 'incomplete' | 'needs_review';
  onSectionChange: (sectionId: string) => void;
  onStepChange: (stepKey: string) => void;
  overallProgress: number;
}

export const AnimatedJourney: React.FC<AnimatedJourneyProps> = ({
  sections,
  activeSection,
  activeStep,
  getStepCompletion,
  onSectionChange,
  onStepChange,
  overallProgress,
}) => {
  const getSectionCompletion = (sectionId: string): number => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return 0;
    
    const completedSteps = section.steps.filter(step => getStepCompletion(step.key) === 'complete').length;
    return Math.round((completedSteps / section.steps.length) * 100);
  };

  const getSectionStatus = (sectionId: string): 'complete' | 'active' | 'pending' => {
    const completion = getSectionCompletion(sectionId);
    if (completion === 100) return 'complete';
    if (sectionId === activeSection) return 'active';
    return 'pending';
  };

  const getStepIcon = (stepKey: string, isActive: boolean) => {
    const completion = getStepCompletion(stepKey);
    
    if (completion === 'complete') {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    if (completion === 'needs_review') {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
    if (isActive) {
      return <Play className="h-4 w-4 text-blue-600 animate-pulse" />;
    }
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="w-full space-y-6">
      {/* Overall Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Treatment Center Onboarding Journey
              </h2>
              <p className="text-muted-foreground">Complete your partnership application step by step</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          
          {/* Animated Progress Bar */}
          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${overallProgress}%` }}
            >
              <div className="absolute top-0 right-0 w-4 h-full bg-white/30 rounded-full animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* Journey Line */}
            <div className="absolute top-8 left-6 right-6 h-1 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out rounded-full"
                style={{ 
                  width: `${(sections.findIndex(s => s.id === activeSection) / (sections.length - 1)) * 100}%` 
                }}
              />
            </div>

            {/* Section Nodes */}
            <div className="flex justify-between items-start relative z-10">
              {sections.map((section, index) => {
                const status = getSectionStatus(section.id);
                const completion = getSectionCompletion(section.id);
                const isActive = section.id === activeSection;
                
                return (
                  <div 
                    key={section.id}
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => onSectionChange(section.id)}
                  >
                    {/* Section Circle */}
                    <div className={cn(
                      "w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110",
                      status === 'complete' && "bg-green-500 border-green-500 shadow-lg shadow-green-200",
                      status === 'active' && "bg-blue-500 border-blue-500 shadow-lg shadow-blue-200 animate-pulse",
                      status === 'pending' && "bg-white border-gray-300 group-hover:border-blue-300"
                    )}>
                      {status === 'complete' ? (
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      ) : status === 'active' ? (
                        <Play className="h-6 w-6 text-white" />
                      ) : (
                        <span className="text-lg font-semibold text-gray-400">{index + 1}</span>
                      )}
                    </div>

                    {/* Section Info */}
                    <div className="mt-4 text-center max-w-40">
                      <h3 className={cn(
                        "font-semibold text-sm transition-colors duration-200",
                        isActive ? "text-blue-600" : "text-gray-700"
                      )}>
                        {section.label}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {section.description}
                      </p>
                      <Badge 
                        variant={status === 'complete' ? 'default' : status === 'active' ? 'secondary' : 'outline'}
                        className="mt-2 text-xs"
                      >
                        {completion}%
                      </Badge>
                    </div>

                    {/* Arrow to Next Section */}
                    {index < sections.length - 1 && (
                      <ArrowRight className={cn(
                        "absolute top-8 h-4 w-4 transition-opacity duration-300",
                        "transform translate-x-16 -translate-y-2",
                        status === 'complete' ? "text-blue-500 opacity-100" : "text-gray-300 opacity-50"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Section Steps */}
      {sections.find(s => s.id === activeSection) && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {sections.find(s => s.id === activeSection)?.label} Steps
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete each step to progress through this section
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.find(s => s.id === activeSection)?.steps.map((step) => {
                const completion = getStepCompletion(step.key);
                const isActive = step.key === activeStep;
                
                return (
                  <div
                    key={step.key}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-105",
                      isActive && "border-blue-500 bg-blue-50 shadow-md",
                      completion === 'complete' && !isActive && "border-green-500 bg-green-50",
                      completion === 'needs_review' && !isActive && "border-yellow-500 bg-yellow-50",
                      completion === 'incomplete' && !isActive && "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => onStepChange(step.key)}
                  >
                    <div className="flex items-center space-x-3">
                      {getStepIcon(step.key, isActive)}
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-medium text-sm truncate",
                          isActive ? "text-blue-900" : 
                          completion === 'complete' ? "text-green-900" :
                          completion === 'needs_review' ? "text-yellow-900" :
                          "text-gray-700"
                        )}>
                          {step.label}
                        </h4>
                        {step.required && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-2 flex items-center space-x-2 text-xs text-blue-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span>Current Step</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
