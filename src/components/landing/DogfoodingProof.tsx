/**
 * DOGFOODING PROOF SECTION
 * Shows that Genie Studio uses its own AI to generate marketing content
 */
import React from 'react';
import { 
  Sparkles, 
  RefreshCw,
  Calendar,
  Globe,
  Video,
  Presentation,
  Music,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const GENERATED_CONTENT = [
  {
    type: 'Hero Video',
    icon: Video,
    lastGenerated: '2 hours ago',
    provider: 'ModelsLab + ElevenLabs',
    confidence: 96,
  },
  {
    type: 'Product Demos',
    icon: Presentation,
    lastGenerated: '6 hours ago',
    provider: 'Azure + Alibaba Wan2.2',
    confidence: 94,
  },
  {
    type: 'Background Music',
    icon: Music,
    lastGenerated: '1 day ago',
    provider: 'ElevenLabs Music',
    confidence: 98,
  },
  {
    type: 'Regional Avatars',
    icon: Globe,
    lastGenerated: '3 days ago',
    provider: 'Alibaba OmniAvatar',
    confidence: 95,
  },
];

const DAILY_ROTATION = [
  { day: 'Mon', region: 'NAM', content: 'Healthcare Case Study' },
  { day: 'Tue', region: 'EUR', content: 'Manufacturing Demo' },
  { day: 'Wed', region: 'MENA', content: 'Arabic Dialect Showcase' },
  { day: 'Thu', region: 'IND', content: 'EdTech Success Story' },
  { day: 'Fri', region: 'AFR', content: 'Fintech Case Study' },
  { day: 'Sat', region: 'APAC', content: 'E-commerce Demo' },
  { day: 'Sun', region: 'LATAM', content: 'Tourism Campaign' },
];

export const DogfoodingProof: React.FC = () => {
  const today = new Date().getDay();
  const todayContent = DAILY_ROTATION[today === 0 ? 6 : today - 1];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-yellow-500 text-yellow-600">
            <Sparkles className="h-3 w-3 mr-1" />
            Dogfooding
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            This Page Was Built by Genie
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We use our own AI to generate, localize, and distribute our marketing content. 
            <span className="text-primary font-bold"> Every day.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Generated content status */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">AI-Generated Content</h3>
              <Badge className="bg-green-500/20 text-green-600 border-0">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" style={{ animationDuration: '3s' }} />
                Auto-updating
              </Badge>
            </div>

            <div className="space-y-4">
              {GENERATED_CONTENT.map((content) => {
                const Icon = content.icon;
                return (
                  <div 
                    key={content.type}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{content.type}</p>
                        <p className="text-xs text-muted-foreground">{content.provider}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">{content.confidence}% confidence</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {content.lastGenerated}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Daily rotation schedule */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Daily Content Rotation</h3>
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                Automated
              </Badge>
            </div>

            <div className="space-y-2">
              {DAILY_ROTATION.map((item, index) => {
                const isToday = index === (today === 0 ? 6 : today - 1);
                return (
                  <div 
                    key={item.day}
                    className={`flex items-center justify-between p-3 rounded-lg transition ${
                      isToday 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${isToday ? '' : 'text-muted-foreground'}`}>
                        {item.day}
                      </span>
                      <Badge variant={isToday ? 'secondary' : 'outline'} className="text-xs">
                        {item.region}
                      </Badge>
                    </div>
                    <span className={`text-sm ${isToday ? '' : 'text-muted-foreground'}`}>
                      {item.content}
                    </span>
                    {isToday && (
                      <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer proof */}
        <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-border text-center">
          <p className="text-lg text-foreground">
            🎯 <strong>95% of this landing page content</strong> was generated by Genie AI, 
            including regional variants for 14 markets
          </p>
          <p className="text-muted-foreground mt-2">
            Last full regeneration: Today at 6:00 AM UTC • Next rotation: {todayContent.content} ({todayContent.region})
          </p>
        </div>
      </div>
    </section>
  );
};

export default DogfoodingProof;
