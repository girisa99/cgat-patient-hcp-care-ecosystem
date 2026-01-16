/**
 * Genie Deck - AI-Powered Presentation Generator
 * "Ideas to Impact" - Transform ideas into stunning presentations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Presentation, 
  Sparkles, 
  PenTool, 
  Wand2, 
  LayoutTemplate
} from 'lucide-react';
import { PresentationWizard } from '@/components/genie-studio/presentation-generator/PresentationWizard';
import { BackToSubscription } from '@/components/subscription/BackToSubscription';
import { AskGenie } from '@/components/genie-studio/AskGenie';
import { toast } from 'sonner';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';

const GenieDeck = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/10">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-indigo-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <BackToSubscription 
                  fallbackPath="/genie-studio" 
                  fallbackLabel="Back to Studio" 
                />
                
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-white/90 backdrop-blur border border-purple-200/50 flex items-center justify-center shadow-lg overflow-hidden p-2">
                    <img src={genieDeckLogo} alt="Genie Deck" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                      Genie Deck
                    </h1>
                    <p className="text-sm text-muted-foreground">Presentation Generator • Ideas to Impact</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/genie-spark')}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Content Pipeline
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                  onClick={() => navigate('/genie-vibe')}
                >
                  <Presentation className="h-4 w-4 mr-2" />
                  Record Presentation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-muted/50 border border-border/50">
              <TabsTrigger value="create" className="gap-2">
                <Wand2 className="h-4 w-4" />
                Create Presentation
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <LayoutTemplate className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="library" className="gap-2">
                <Presentation className="h-4 w-4" />
                My Presentations
              </TabsTrigger>
            </TabsList>

            {/* Create Presentation Tab */}
            <TabsContent value="create" className="mt-0">
              <div className="bg-card border rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
                <PresentationWizard 
                  className="h-full"
                  onComplete={(presentation) => {
                    setHasGeneratedContent(true);
                    toast.success('Presentation generated successfully!');
                  }}
                />
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-0">
              <div className="bg-card border rounded-xl shadow-sm p-6 min-h-[500px]">
                <div className="text-center py-12">
                  <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Presentation Templates</h3>
                  <p className="text-muted-foreground mb-4">
                    Pre-designed templates for different use cases coming soon
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab('create')}>
                    Create Custom Presentation
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="mt-0">
              <div className="bg-card border rounded-xl shadow-sm p-6 min-h-[500px]">
                <div className="text-center py-12">
                  <Presentation className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">My Presentations</h3>
                  <p className="text-muted-foreground mb-4">
                    Your saved presentations will appear here
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab('create')}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Create New Presentation
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Ask Genie - Context-aware AI for Deck */}
          <AskGenie 
            product="deck" 
            currentTab={activeTab}
            sessionData={{ hasGeneratedContent }}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default GenieDeck;