/**
 * Production Guided Wizard
 * Step-by-step production workflow guide for ProductionHub
 * Phases: Setup → Outreach → Script → Rehearsal → Record → Post → Publish
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Settings,
  Users,
  FileText,
  Play,
  Video,
  Scissors,
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  Wand2,
  Podcast,
  Presentation,
  Briefcase,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ShowType, EventCategory } from '@/types/shows';

interface WizardPhase {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
}

interface ProductionGuidedWizardProps {
  onCreateShow: (data: { title: string; type: ShowType; category: EventCategory }) => void;
  onInviteGuests: () => void;
  onLinkScript: () => void;
  onScheduleRehearsals: () => void;
  onStartRecording: () => void;
  currentStage: string;
  hasShow: boolean;
  hasGuests: boolean;
  hasScript: boolean;
  className?: string;
}

export const ProductionGuidedWizard: React.FC<ProductionGuidedWizardProps> = ({
  onCreateShow,
  onInviteGuests,
  onLinkScript,
  onScheduleRehearsals,
  onStartRecording,
  currentStage,
  hasShow,
  hasGuests,
  hasScript,
  className,
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showTitle, setShowTitle] = useState('');
  const [showType, setShowType] = useState<ShowType | null>(null);
  const [eventCategory, setEventCategory] = useState<EventCategory>('media_production');

  const phases: WizardPhase[] = [
    {
      id: 'setup',
      title: 'Setup',
      description: 'Create your production',
      icon: <Settings className="h-5 w-5" />,
      isComplete: hasShow,
    },
    {
      id: 'outreach',
      title: 'Outreach',
      description: 'Invite guests & hosts',
      icon: <Users className="h-5 w-5" />,
      isComplete: hasGuests,
    },
    {
      id: 'script',
      title: 'Script',
      description: 'Link or create script',
      icon: <FileText className="h-5 w-5" />,
      isComplete: hasScript,
    },
    {
      id: 'rehearsal',
      title: 'Rehearsal',
      description: 'Schedule practice runs',
      icon: <Play className="h-5 w-5" />,
      isComplete: currentStage === 'rehearsal' || currentStage === 'recording',
    },
    {
      id: 'record',
      title: 'Record',
      description: 'Capture your content',
      icon: <Video className="h-5 w-5" />,
      isComplete: currentStage === 'recording' || currentStage === 'post_production',
    },
    {
      id: 'post',
      title: 'Post-Production',
      description: 'Edit & enhance',
      icon: <Scissors className="h-5 w-5" />,
      isComplete: currentStage === 'post_production' || currentStage === 'published',
    },
    {
      id: 'publish',
      title: 'Publish',
      description: 'Distribute content',
      icon: <Upload className="h-5 w-5" />,
      isComplete: currentStage === 'published',
    },
  ];

  const currentPhaseData = phases[currentPhase];
  const progress = ((currentPhase + 1) / phases.length) * 100;

  const handleCreateShow = () => {
    if (!showTitle.trim() || !showType) {
      toast.error('Please enter a title and select a type');
      return;
    }
    onCreateShow({ title: showTitle, type: showType, category: eventCategory });
    setCurrentPhase(1);
  };

  const goNext = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const goBack = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  return (
    <Card className={cn("border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="h-5 w-5 text-blue-500" />
            Production Workflow Guide
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
            Step {currentPhase + 1} of {phases.length}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="h-2 mt-3" />
        
        {/* Phase Indicators - Compact for 7 phases */}
        <div className="flex justify-between mt-4 overflow-x-auto pb-2">
          {phases.map((phase, index) => (
            <button
              key={phase.id}
              onClick={() => setCurrentPhase(index)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all min-w-[48px]",
                index === currentPhase ? "opacity-100" : "opacity-50 hover:opacity-75"
              )}
            >
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center transition-all",
                phase.isComplete 
                  ? "bg-green-500 text-white" 
                  : index === currentPhase 
                    ? "bg-blue-500 text-white" 
                    : "bg-muted"
              )}>
                {phase.isComplete ? <Check className="h-3 w-3" /> : React.cloneElement(phase.icon as React.ReactElement, { className: 'h-3 w-3' })}
              </div>
              <span className="text-[10px] font-medium hidden lg:block">{phase.title}</span>
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Phase Content */}
        <div className="min-h-[180px]">
          {/* Phase 1: Setup */}
          {currentPhase === 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{currentPhaseData.description}</h3>
              
              <div className="space-y-3">
                <div>
                  <Label>Production Title</Label>
                  <Input
                    value={showTitle}
                    onChange={(e) => setShowTitle(e.target.value)}
                    placeholder="Enter your show/event title"
                  />
                </div>
                
                <div>
                  <Label>Production Type</Label>
                  <RadioGroup
                    value={showType || ''}
                    onValueChange={(v) => setShowType(v as ShowType)}
                    className="grid grid-cols-2 gap-2 mt-2"
                  >
                    {[
                      { id: 'podcast', label: 'Podcast', icon: Podcast },
                      { id: 'webinar', label: 'Webinar', icon: Presentation },
                      { id: 'interview', label: 'Interview', icon: Users },
                      { id: 'tutorial', label: 'Tutorial', icon: Video },
                    ].map((type) => (
                      <Label
                        key={type.id}
                        htmlFor={`type-${type.id}`}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                          showType === type.id 
                            ? "border-blue-500 bg-blue-500/10" 
                            : "border-muted hover:border-blue-500/50"
                        )}
                      >
                        <RadioGroupItem value={type.id} id={`type-${type.id}`} className="sr-only" />
                        <type.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
                
                <Button 
                  onClick={handleCreateShow}
                  disabled={!showTitle.trim() || !showType}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
                >
                  Create Production
                </Button>
              </div>
            </div>
          )}

          {/* Phase 2: Outreach */}
          {currentPhase === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{currentPhaseData.description}</h3>
              <p className="text-sm text-muted-foreground">
                Add hosts, guests, and participants to your production.
              </p>
              <Button onClick={onInviteGuests} className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Invite Participants
              </Button>
              {hasGuests && (
                <Badge className="bg-green-500/10 text-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Guests added
                </Badge>
              )}
            </div>
          )}

          {/* Phase 3: Script */}
          {currentPhase === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{currentPhaseData.description}</h3>
              <p className="text-sm text-muted-foreground">
                Link an existing script or create a new one from templates.
              </p>
              <Button onClick={onLinkScript} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Link Script
              </Button>
              {hasScript && (
                <Badge className="bg-green-500/10 text-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Script linked
                </Badge>
              )}
            </div>
          )}

          {/* Phase 4: Rehearsal */}
          {currentPhase === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{currentPhaseData.description}</h3>
              <p className="text-sm text-muted-foreground">
                Schedule practice sessions with your team before recording.
              </p>
              <Button onClick={onScheduleRehearsals} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Rehearsal
              </Button>
            </div>
          )}

          {/* Phase 5: Record */}
          {currentPhase === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{currentPhaseData.description}</h3>
              <p className="text-sm text-muted-foreground">
                Start your recording session in Genie Vibe studio.
              </p>
              <Button onClick={onStartRecording} className="w-full bg-gradient-to-r from-red-500 to-pink-500">
                <Video className="h-4 w-4 mr-2" />
                Open Recording Studio
              </Button>
            </div>
          )}

          {/* Phase 6: Post-Production */}
          {currentPhase === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{currentPhaseData.description}</h3>
              <p className="text-sm text-muted-foreground">
                Edit your recording, add effects, and polish your content.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Scissors className="h-4 w-4 mr-1" />
                  Edit Clips
                </Button>
                <Button variant="outline" size="sm">
                  <Wand2 className="h-4 w-4 mr-1" />
                  AI Polish
                </Button>
              </div>
            </div>
          )}

          {/* Phase 7: Publish */}
          {currentPhase === 6 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{currentPhaseData.description}</h3>
              <p className="text-sm text-muted-foreground">
                Distribute your content to platforms and audiences.
              </p>
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                <Upload className="h-4 w-4 mr-2" />
                Publish Content
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={currentPhase === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={goNext}
            disabled={currentPhase === phases.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionGuidedWizard;
