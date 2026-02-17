/**
 * GLOBAL INSPIRATION SECTION
 * Commercially-driven use cases — what teams achieve with Genie Suite
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
  TrendingUp,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const REGIONAL_STORIES = [
  {
    region: 'MENA',
    flag: '🇸🇦',
    company: 'Government Education Initiative',
    industry: 'Government & Education',
    useCase: 'Launched nationwide educational content across all 7 Arabic dialects — from Gulf to Levantine — with full RTL support and Quranic-sensitive phrasing.',
    stats: { reach: '5M students', languages: '7 dialects', time: '3 weeks' },
    quote: 'We went from months of agency work to weeks of self-service. Every dialect felt authentic to the region.',
    featured: true,
    outcomes: ['80% faster delivery', 'Zero dialect complaints', 'Full MENA compliance'],
  },
  {
    region: 'India',
    flag: '🇮🇳',
    company: 'EdTech Learning Platform',
    industry: 'EdTech & Training',
    useCase: 'Course content transcreated into 22 Indian languages with Hinglish code-mixing for urban audiences — each with regional TTS voices.',
    stats: { reach: '140M learners', languages: '22', time: '6 weeks' },
    quote: 'Hinglish transcreation doubled our engagement in metro cities. Rural learners finally got content in their mother tongue.',
    outcomes: ['2x engagement uplift', '22 language variants', 'Native prosody via Azure Neural'],
  },
  {
    region: 'Africa',
    flag: '🌍',
    company: 'Mobile Financial Services',
    industry: 'Fintech & Banking',
    useCase: 'Financial literacy videos produced in 10 African languages including Swahili, Yoruba, and Amharic — with M-Pesa payment context.',
    stats: { reach: '50M users', languages: '10', time: '4 weeks' },
    quote: 'First time our customers heard financial advice in their mother tongue. Trust scores increased overnight.',
    outcomes: ['40% trust increase', '10 native languages', 'Mobile-first delivery'],
  },
  {
    region: 'Europe',
    flag: '🇪🇺',
    company: 'Industrial Manufacturing Group',
    industry: 'Manufacturing & Safety',
    useCase: 'Factory safety training across 15 European facilities — GDPR-compliant, culturally adapted for each market.',
    stats: { reach: '100K workers', languages: '12', time: '2 weeks' },
    quote: 'We reduced training localization costs by 80% while comprehension scores went up. Workers actually watch these now.',
    outcomes: ['80% cost reduction', 'GDPR compliant', '15 facilities covered'],
  },
  {
    region: 'APAC',
    flag: '🌏',
    company: 'Cloud Technology Provider',
    industry: 'Technology & SaaS',
    useCase: 'Technical documentation and developer tutorials with CJK-optimized AI voices and proper honorific adaptation.',
    stats: { reach: '10M developers', languages: '8', time: '1 week' },
    quote: 'Natural Mandarin, proper Japanese keigo, contextual Korean — our developers finally engage with documentation.',
    outcomes: ['3x doc engagement', 'CJK-native voices', 'Honorific accuracy'],
  },
  {
    region: 'LATAM',
    flag: '🌎',
    company: 'Digital Banking Platform',
    industry: 'Fintech & Consumer',
    useCase: 'Customer onboarding videos transcreated between Brazilian Portuguese and 5 Spanish dialects — respecting regional slang.',
    stats: { reach: '80M customers', languages: '6 variants', time: '2 weeks' },
    quote: 'Our Mexican customers noticed we stopped sounding "Spanish" and started sounding local. That matters.',
    outcomes: ['30% onboarding uplift', '6 dialect variants', 'Regional slang support'],
  },
];

export const GlobalInspirationSection: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState(REGIONAL_STORIES[0]);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-accent/5" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-4">
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
            <Globe className="h-3 w-3 mr-1" />
            Real Results, Real Markets
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Your Market. Your Language. Your Growth.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Teams across <span className="text-primary font-bold">6 continents</span> use Genie Suite to create content 
            that doesn't just translate — it <span className="text-primary font-bold">converts</span>.
          </p>
        </div>

        {/* Proof strip */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-sm">
            <span className="font-bold text-primary">We Support</span>
            <span className="text-muted-foreground"> — 50+ Languages, 140+ Dialects</span>
          </div>
          <div className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-sm">
            <span className="font-bold text-primary">We Deliver</span>
            <span className="text-muted-foreground"> — 50+ Industries Globally</span>
          </div>
          <div className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-sm">
            <span className="font-bold text-primary">We Guide</span>
            <span className="text-muted-foreground"> — End-to-End Production & Compliance</span>
          </div>
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

              {/* Outcomes */}
              {'outcomes' in selectedStory && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedStory.outcomes.map((outcome) => (
                    <span key={outcome} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {outcome}
                    </span>
                  ))}
                </div>
              )}

              <Link to="/explore">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  See How It Works
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
                  <p className="text-sm text-muted-foreground">Audience Reached</p>
                </div>
                <div className="text-center">
                  <Globe className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{selectedStory.stats.languages}</p>
                  <p className="text-sm text-muted-foreground">Languages</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{selectedStory.stats.time}</p>
                  <p className="text-sm text-muted-foreground">Time to Market</p>
                </div>
              </div>

              {/* What Genie provided */}
              <div className="mt-6 p-4 bg-card/80 rounded-xl border border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">What Genie Provided</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs">Transcreation</Badge>
                  <Badge variant="secondary" className="text-xs">Native TTS</Badge>
                  <Badge variant="secondary" className="text-xs">Lip-Sync</Badge>
                  <Badge variant="secondary" className="text-xs">Brand QA</Badge>
                  <Badge variant="secondary" className="text-xs">Compliance</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Ready to speak your audience's language? Start creating — we'll guide you every step.
          </p>
          <Link to="/genie-studio-auth?tab=signup">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Start Creating for Your Market
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GlobalInspirationSection;