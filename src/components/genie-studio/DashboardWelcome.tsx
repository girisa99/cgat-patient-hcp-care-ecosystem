/**
 * DashboardWelcome - First-time user experience component
 * Provides clear CTAs and guidance for new users
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  PenTool, 
  Mic, 
  Play,
  ArrowRight,
  CheckCircle2,
  Circle,
  Rocket,
  Lightbulb,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardWelcomeProps {
  scriptsCount: number;
  voiceoversCount: number;
  musicCount: number;
  recordingsCount: number;
  onNavigate: (tab: string) => void;
  onTrackAction?: (action: string, details?: Record<string, any>) => void;
}

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tab: string;
  completed: boolean;
  color: string;
}

export const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({
  scriptsCount,
  voiceoversCount,
  musicCount,
  recordingsCount,
  onNavigate,
  onTrackAction
}) => {
  // Calculate journey progress
  const journeySteps: JourneyStep[] = [
    {
      id: 'spark',
      title: 'Generate Ideas',
      description: 'Use Genie Spark to brainstorm content ideas',
      icon: Sparkles,
      tab: 'spark',
      completed: scriptsCount > 0 || recordingsCount > 0,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'script',
      title: 'Write Your Script',
      description: 'Create or enhance your script with AI',
      icon: PenTool,
      tab: 'script-editor',
      completed: scriptsCount > 0,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'voice',
      title: 'Add Voice',
      description: 'Generate AI voiceover or record yourself',
      icon: Mic,
      tab: 'voice-generator',
      completed: voiceoversCount > 0,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'produce',
      title: 'Produce & Publish',
      description: 'Record, edit and share your content',
      icon: Play,
      tab: 'recording',
      completed: recordingsCount > 0,
      color: 'from-green-500 to-emerald-500'
    }
  ];
  
  const completedSteps = journeySteps.filter(s => s.completed).length;
  const progressPercent = (completedSteps / journeySteps.length) * 100;
  const isNewUser = completedSteps === 0;
  const currentStep = journeySteps.find(s => !s.completed) || journeySteps[0];
  
  const handleStepClick = (step: JourneyStep) => {
    onTrackAction?.('journey_step_clicked', { step: step.id, tab: step.tab });
    onNavigate(step.tab);
  };
  
  const handleQuickStart = () => {
    onTrackAction?.('quick_start_clicked', { destination: currentStep.tab });
    onNavigate(currentStep.tab);
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome Hero - Only for new users */}
      {isNewUser && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Getting Started
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome to Genie Suite! ✨
                </h2>
                <p className="text-muted-foreground mb-4">
                  Your AI-powered content creation hub. Create scripts, generate voiceovers, 
                  and produce professional media in minutes.
                </p>
                <Button 
                  onClick={handleQuickStart}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Start Creating
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/10">
                <Lightbulb className="h-16 w-16 text-primary/60" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Journey Progress */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Your Creative Journey
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isNewUser 
                  ? "Complete these steps to create your first content"
                  : `${completedSteps} of ${journeySteps.length} steps completed`
                }
              </p>
            </div>
            <Badge variant="outline" className={cn(
              "text-xs",
              progressPercent === 100 && "bg-green-500/10 text-green-600 border-green-500/20"
            )}>
              {Math.round(progressPercent)}% Complete
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <Progress value={progressPercent} className="h-2 mb-6" />
          
          {/* Journey Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {journeySteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep.id && !step.completed;
              
              return (
                <div
                  key={step.id}
                  onClick={() => handleStepClick(step)}
                  className={cn(
                    "relative p-4 rounded-xl border cursor-pointer transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.02]",
                    step.completed 
                      ? "border-green-500/30 bg-green-500/5" 
                      : isActive
                        ? "border-primary/50 bg-primary/5 shadow-sm"
                        : "border-border/50 hover:border-border"
                  )}
                >
                  {/* Step Number */}
                  <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-background border-2 border-border flex items-center justify-center text-xs font-medium">
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  {/* Icon */}
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                    step.completed 
                      ? "bg-green-500/10" 
                      : `bg-gradient-to-br ${step.color} bg-opacity-10`
                  )}>
                    <StepIcon className={cn(
                      "h-5 w-5",
                      step.completed ? "text-green-500" : "text-white"
                    )} />
                  </div>
                  
                  {/* Content */}
                  <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {step.description}
                  </p>
                  
                  {/* Active indicator */}
                  {isActive && !step.completed && (
                    <Badge className="mt-2 text-[10px] bg-primary/10 text-primary border-0">
                      Next Step
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Stats - Only show if user has content */}
      {!isNewUser && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{scriptsCount}</div>
              <div className="text-xs text-muted-foreground">Scripts</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{voiceoversCount}</div>
              <div className="text-xs text-muted-foreground">Voiceovers</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-500">{musicCount}</div>
              <div className="text-xs text-muted-foreground">Music Tracks</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{recordingsCount}</div>
              <div className="text-xs text-muted-foreground">Recordings</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
