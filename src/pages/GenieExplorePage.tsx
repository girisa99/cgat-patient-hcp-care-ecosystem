/**
 * GENIE EXPLORE PAGE - INTERACTIVE JOURNEY
 * Step 1: Use case selection → Step 2: Mini demo → Step 3: Recommendation
 * Styled to match GenieStudioLanding corporate look
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Globe,
  Check
} from 'lucide-react';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

// Product logos
import genieSparkLogo from '@/assets/logos/products/genie-spark.png';
import genieMindLogo from '@/assets/logos/products/genie-mind.png';
import genieVibeLogo from '@/assets/logos/products/genie-vibe.png';
import genieDeckLogo from '@/assets/logos/products/genie-deck.png';
import genieArcLogo from '@/assets/logos/products/genie-arc.png';
import genieCastLogo from '@/assets/logos/products/genie-cast.png';

interface UseCase {
  id: string;
  title: string;
  description: string;
  logo: string;
  color: string;
  recommendedProducts: string[];
  popularIn: string[];
}

const USE_CASES: UseCase[] = [
  {
    id: 'presentations',
    title: 'Presentations & Slides',
    description: 'Create stunning slide decks with AI-generated content and visuals',
    logo: genieDeckLogo,
    color: 'from-blue-500 to-indigo-500',
    recommendedProducts: ['deck', 'spark'],
    popularIn: ['Business', 'Education', 'Consulting'],
  },
  {
    id: 'video-content',
    title: 'Video Content',
    description: 'Generate videos, avatars, and animated explainers',
    logo: genieVibeLogo,
    color: 'from-purple-500 to-violet-500',
    recommendedProducts: ['arc', 'vibe'],
    popularIn: ['Marketing', 'Training', 'Social Media'],
  },
  {
    id: 'voice-audio',
    title: 'Voice & Audio',
    description: 'Voice cloning, transcription, and podcast production',
    logo: genieSparkLogo,
    color: 'from-orange-500 to-red-500',
    recommendedProducts: ['vibe', 'spark'],
    popularIn: ['Podcasting', 'Audiobooks', 'Localization'],
  },
  {
    id: 'knowledge-base',
    title: 'Knowledge Management',
    description: 'Build AI-powered knowledge bases with semantic search',
    logo: genieMindLogo,
    color: 'from-cyan-500 to-teal-500',
    recommendedProducts: ['mind'],
    popularIn: ['Enterprise', 'Support', 'Documentation'],
  },
  {
    id: 'marketing',
    title: 'Marketing & Distribution',
    description: 'Social posts, ad creatives, and campaign content',
    logo: genieCastLogo,
    color: 'from-green-500 to-emerald-500',
    recommendedProducts: ['cast', 'spark', 'deck'],
    popularIn: ['Agencies', 'Startups', 'Creators'],
  },
  {
    id: 'production',
    title: 'Production & Scheduling',
    description: 'Project management, scheduling, and team collaboration',
    logo: genieArcLogo,
    color: 'from-red-500 to-orange-500',
    recommendedProducts: ['arc', 'vibe', 'deck'],
    popularIn: ['Corporate', 'Agencies', 'Studios'],
  },
];

const GenieExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { regionName } = useRegionalDetection();
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);

  const handleSelectUseCase = (useCaseId: string) => {
    setSelectedUseCase(useCaseId);
  };

  const handleContinue = () => {
    if (selectedUseCase) {
      navigate(`/explore/demo?useCase=${selectedUseCase}`);
    }
  };

  const selectedUseCaseData = USE_CASES.find(uc => uc.id === selectedUseCase);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAVBAR - Matching landing page */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/genie-landing" className="flex items-center gap-2">
            <img src={genieSuiteLogo} alt="Genie Suite" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Genie Studio
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/genie-landing')} className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <Link to="/genie-studio-auth">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Globe className="h-3 w-3 mr-1" />
              {regionName}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              What do you want to create?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select your primary use case and we'll show you the perfect Genie tools 
              with a free interactive demo.
            </p>
          </div>

          {/* Use Case Grid - Corporate styled cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {USE_CASES.map((useCase) => {
              const isSelected = selectedUseCase === useCase.id;
              return (
                <Card 
                  key={useCase.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl bg-card border-2 ${
                    isSelected 
                      ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectUseCase(useCase.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className={`w-20 h-20 rounded-xl bg-white shadow-md flex items-center justify-center p-2 border ${
                        isSelected ? 'border-primary' : 'border-border'
                      }`}>
                        <img 
                          src={useCase.logo} 
                          alt={useCase.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg text-foreground">{useCase.title}</CardTitle>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <CardDescription className="mt-1">{useCase.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {useCase.popularIn.map((industry) => (
                        <Badge 
                          key={industry} 
                          variant="outline" 
                          className={`text-xs ${
                            isSelected 
                              ? 'bg-primary/10 border-primary/30 text-primary' 
                              : 'bg-muted border-border text-muted-foreground'
                          }`}
                        >
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Use Case Preview */}
          {selectedUseCaseData && (
            <div className={`mb-8 bg-gradient-to-r ${selectedUseCaseData.color} p-[1px] rounded-2xl max-w-3xl mx-auto`}>
              <div className="bg-card rounded-2xl p-6 flex items-center gap-6">
                <img 
                  src={selectedUseCaseData.logo} 
                  alt={selectedUseCaseData.title}
                  className="w-16 h-16 object-contain"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground">{selectedUseCaseData.title}</h3>
                  <p className="text-muted-foreground">{selectedUseCaseData.description}</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleContinue}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Try Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Continue Button (fallback) */}
          {!selectedUseCaseData && (
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={handleContinue}
                disabled={!selectedUseCase}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                Select a Use Case to Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Skip to pricing */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Already know what you need?{' '}
            <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80" onClick={() => navigate('/pricing')}>
              View pricing →
            </Button>
            {' '}or{' '}
            <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80" onClick={() => navigate('/genie-studio-auth')}>
              Sign in
            </Button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={genieSuiteLogo} alt="Genie Suite" className="h-6 w-auto" />
            <span className="font-semibold text-foreground">Genie Studio</span>
          </div>
          <p className="text-sm text-muted-foreground">
            7 Products • 206 Pipelines • One Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GenieExplorePage;
