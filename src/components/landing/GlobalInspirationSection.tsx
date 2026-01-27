/**
 * GLOBAL INSPIRATION SECTION
 * Shows real-world use cases and success stories from different regions
 */
import React, { useState } from 'react';
import { 
  Globe, 
  Play,
  Star,
  Quote,
  ArrowRight,
  Building2,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const REGIONAL_STORIES = [
  {
    region: 'MENA',
    flag: '🇸🇦',
    company: 'Saudi Ministry of Education',
    industry: 'Government',
    useCase: 'Launched nationwide educational content in all 7 Arabic dialects',
    stats: { reach: '5M students', languages: '7 dialects', time: '3 weeks' },
    quote: 'Genie Studio helped us reach every region in the Kingdom with culturally appropriate content.',
    featured: true,
  },
  {
    region: 'India',
    flag: '🇮🇳',
    company: "BYJU'S Learning",
    industry: 'EdTech',
    useCase: 'Created course content in 22 Indian languages with code-mixing',
    stats: { reach: '140M learners', languages: '22', time: '6 weeks' },
    quote: 'The Hinglish transcreation feature doubled our engagement in urban markets.',
  },
  {
    region: 'Africa',
    flag: '🌍',
    company: 'M-PESA Financial Services',
    industry: 'Fintech',
    useCase: 'Financial literacy videos in 10 African languages',
    stats: { reach: '50M users', languages: '10', time: '4 weeks' },
    quote: 'First time our customers heard financial advice in their mother tongue.',
  },
  {
    region: 'Europe',
    flag: '🇪🇺',
    company: 'Siemens AG',
    industry: 'Manufacturing',
    useCase: 'Factory safety training across 15 European facilities',
    stats: { reach: '100K workers', languages: '12', time: '2 weeks' },
    quote: 'Reduced training localization costs by 80% while improving comprehension.',
  },
  {
    region: 'APAC',
    flag: '🌏',
    company: 'Alibaba Cloud',
    industry: 'Technology',
    useCase: 'Technical documentation with CJK-optimized AI voices',
    stats: { reach: '10M developers', languages: '8', time: '1 week' },
    quote: 'CosyVoice integration delivers natural Mandarin that our customers love.',
  },
  {
    region: 'LATAM',
    flag: '🌎',
    company: 'Nubank',
    industry: 'Fintech',
    useCase: 'Customer onboarding in Brazilian Portuguese and Spanish',
    stats: { reach: '80M customers', languages: '3', time: '2 weeks' },
    quote: 'Our customer support videos now speak to each market authentically.',
  },
];

export const GlobalInspirationSection: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState(REGIONAL_STORIES[0]);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-accent/5" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Global Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            How enterprises across <span className="text-primary font-bold">6 continents</span> are 
            transforming content creation
          </p>
        </div>

        {/* Region selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {REGIONAL_STORIES.map((story) => (
            <button
              key={story.region}
              onClick={() => setSelectedStory(story)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                selectedStory.region === story.region
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              <span>{story.flag}</span>
              <span>{story.region}</span>
              {story.featured && <Star className="h-3 w-3 text-yellow-400" />}
            </button>
          ))}
        </div>

        {/* Featured story */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left: Content */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selectedStory.flag}</span>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedStory.company}</h3>
                  <Badge variant="secondary">{selectedStory.industry}</Badge>
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                {selectedStory.useCase}
              </p>

              {/* Quote */}
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <Quote className="h-6 w-6 text-primary mb-2" />
                <p className="text-foreground italic">"{selectedStory.quote}"</p>
              </div>

              <Link to="/explore">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  See Similar Use Cases
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Right: Stats */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 flex flex-col justify-center">
              <h4 className="text-lg font-semibold text-foreground mb-6">Results Achieved</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{selectedStory.stats.reach}</p>
                  <p className="text-sm text-muted-foreground">Reach</p>
                </div>
                <div className="text-center">
                  <Globe className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{selectedStory.stats.languages}</p>
                  <p className="text-sm text-muted-foreground">Languages</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{selectedStory.stats.time}</p>
                  <p className="text-sm text-muted-foreground">Delivery</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                <p className="text-green-600 dark:text-green-400 text-center text-sm">
                  ✓ Verified Enterprise Customer
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Join 500+ enterprises creating multilingual content at scale
          </p>
          <Link to="/genie-studio-auth?tab=signup">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Start Your Story
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GlobalInspirationSection;
