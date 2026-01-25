/**
 * GENIE EXPLORE PAGE - INTERACTIVE JOURNEY
 * Step 1: Use case selection → Step 2: Mini demo → Step 3: Recommendation
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Presentation, 
  Video, 
  Mic, 
  Brain, 
  Megaphone, 
  GraduationCap,
  ArrowRight,
  Sparkles,
  Globe
} from 'lucide-react';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';

interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  recommendedProducts: string[];
  popularIn: string[];
}

const USE_CASES: UseCase[] = [
  {
    id: 'presentations',
    title: 'Presentations & Slides',
    description: 'Create stunning slide decks with AI-generated content and visuals',
    icon: <Presentation className="h-8 w-8" />,
    recommendedProducts: ['deck', 'spark'],
    popularIn: ['Business', 'Education', 'Consulting'],
  },
  {
    id: 'video-content',
    title: 'Video Content',
    description: 'Generate videos, avatars, and animated explainers',
    icon: <Video className="h-8 w-8" />,
    recommendedProducts: ['arc', 'vibe'],
    popularIn: ['Marketing', 'Training', 'Social Media'],
  },
  {
    id: 'voice-audio',
    title: 'Voice & Audio',
    description: 'Voice cloning, transcription, and podcast production',
    icon: <Mic className="h-8 w-8" />,
    recommendedProducts: ['vibe', 'spark'],
    popularIn: ['Podcasting', 'Audiobooks', 'Localization'],
  },
  {
    id: 'knowledge-base',
    title: 'Knowledge Management',
    description: 'Build AI-powered knowledge bases with semantic search',
    icon: <Brain className="h-8 w-8" />,
    recommendedProducts: ['mind'],
    popularIn: ['Enterprise', 'Support', 'Documentation'],
  },
  {
    id: 'marketing',
    title: 'Marketing & Social',
    description: 'Social posts, ad creatives, and campaign content',
    icon: <Megaphone className="h-8 w-8" />,
    recommendedProducts: ['arc', 'spark', 'deck'],
    popularIn: ['Agencies', 'Startups', 'Creators'],
  },
  {
    id: 'training',
    title: 'Training & Education',
    description: 'E-learning modules, tutorials, and course content',
    icon: <GraduationCap className="h-8 w-8" />,
    recommendedProducts: ['deck', 'vibe', 'mind'],
    popularIn: ['Corporate', 'EdTech', 'Healthcare'],
  },
];

const GenieExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedRegion, regionName } = useRegionalDetection();
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);

  const handleSelectUseCase = (useCaseId: string) => {
    setSelectedUseCase(useCaseId);
  };

  const handleContinue = () => {
    if (selectedUseCase) {
      navigate(`/explore/demo?useCase=${selectedUseCase}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="container max-w-5xl py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Globe className="h-3 w-3 mr-1" />
            {regionName}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            What do you want to create?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your primary use case and we'll show you the perfect Genie tools 
            with a free interactive demo.
          </p>
        </div>

        {/* Use Case Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {USE_CASES.map((useCase) => (
            <Card 
              key={useCase.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedUseCase === useCase.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelectUseCase(useCase.id)}
            >
              <CardHeader className="pb-2">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                  selectedUseCase === useCase.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {useCase.icon}
                </div>
                <CardTitle className="text-lg">{useCase.title}</CardTitle>
                <CardDescription>{useCase.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {useCase.popularIn.map((industry) => (
                    <Badge key={industry} variant="outline" className="text-xs">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={handleContinue}
            disabled={!selectedUseCase}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Try Interactive Demo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Skip to pricing */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already know what you need?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/pricing')}>
            View pricing
          </Button>
        </p>
      </div>
    </div>
  );
};

export default GenieExplorePage;
