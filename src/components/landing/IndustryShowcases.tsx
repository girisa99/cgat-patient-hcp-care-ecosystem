/**
 * INDUSTRY SHOWCASES SECTION
 * Demonstrates AI content generation across 8 key industries
 */
import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Heart, 
  Wallet, 
  Plane, 
  ShoppingBag,
  Factory,
  Landmark,
  Play,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const INDUSTRIES = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    useCase: 'Patient education videos in 22 languages',
    pipelines: ['Training Videos', 'Compliance Docs', 'Multilingual Guides'],
    stats: { time: '4 min', languages: 22, savings: '85%' },
  },
  {
    id: 'education',
    name: 'EdTech',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    useCase: 'Course modules with AI tutors',
    pipelines: ['Course Videos', 'Interactive Quizzes', 'Avatar Instructors'],
    stats: { time: '6 min', languages: 35, savings: '90%' },
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: Wallet,
    color: 'from-green-500 to-emerald-500',
    useCase: 'Investor presentations with data viz',
    pipelines: ['Pitch Decks', 'Reports', 'Compliance Training'],
    stats: { time: '5 min', languages: 15, savings: '75%' },
  },
  {
    id: 'government',
    name: 'Government',
    icon: Landmark,
    color: 'from-purple-500 to-indigo-500',
    useCase: 'Public service announcements in local dialects',
    pipelines: ['PSA Videos', 'Policy Docs', 'Citizen Portals'],
    stats: { time: '3 min', languages: 40, savings: '80%' },
  },
  {
    id: 'tourism',
    name: 'Tourism',
    icon: Plane,
    color: 'from-orange-500 to-amber-500',
    useCase: 'Destination marketing in traveler languages',
    pipelines: ['Promo Videos', 'Virtual Tours', 'Travel Guides'],
    stats: { time: '4 min', languages: 25, savings: '70%' },
  },
  {
    id: 'retail',
    name: 'E-commerce',
    icon: ShoppingBag,
    color: 'from-pink-500 to-rose-500',
    useCase: 'Product demos with localized voiceover',
    pipelines: ['Product Videos', 'Ads', 'Unboxings'],
    stats: { time: '2 min', languages: 20, savings: '85%' },
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    color: 'from-slate-500 to-zinc-500',
    useCase: 'Equipment training in worker languages',
    pipelines: ['Safety Training', 'SOPs', 'Maintenance Guides'],
    stats: { time: '5 min', languages: 18, savings: '75%' },
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    icon: Building2,
    color: 'from-teal-500 to-cyan-500',
    useCase: 'Property tours with AI presenters',
    pipelines: ['Virtual Tours', 'Listing Videos', 'Market Reports'],
    stats: { time: '3 min', languages: 12, savings: '80%' },
  },
];

export const IndustryShowcases: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0]);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Built for Your Industry
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pre-configured pipelines for <span className="text-primary font-bold">50+ industries</span> — 
            from Healthcare to Entertainment
          </p>
        </div>

        {/* Industry selector grid */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-8">
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon;
            const isSelected = selectedIndustry.id === industry.id;
            
            return (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground scale-105 shadow-lg' 
                    : 'bg-card border border-border hover:border-primary/50'
                }`}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{industry.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected industry detail */}
        <div className={`bg-gradient-to-r ${selectedIndustry.color} p-[1px] rounded-2xl`}>
          <div className="bg-card rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {React.createElement(selectedIndustry.icon, { className: 'h-8 w-8 text-primary' })}
                  <h3 className="text-2xl font-bold text-foreground">{selectedIndustry.name}</h3>
                </div>
                
                <p className="text-lg text-muted-foreground mb-6">
                  {selectedIndustry.useCase}
                </p>

                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-foreground">Popular Pipelines:</h4>
                  {selectedIndustry.pipelines.map((pipeline) => (
                    <div key={pipeline} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">{pipeline}</span>
                    </div>
                  ))}
                </div>

                <Link to="/explore">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Play className="h-4 w-4 mr-2" />
                    Try {selectedIndustry.name} Demo
                  </Button>
                </Link>
              </div>

              {/* Right: Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{selectedIndustry.stats.time}</p>
                  <p className="text-sm text-muted-foreground">Avg Generation</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-accent">{selectedIndustry.stats.languages}</p>
                  <p className="text-sm text-muted-foreground">Languages</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-500">{selectedIndustry.stats.savings}</p>
                  <p className="text-sm text-muted-foreground">Cost Savings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More industries CTA */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Plus 42 more industries including Oil & Gas, Pharma, Legal, Consulting, NGO, and more
          </p>
        </div>
      </div>
    </section>
  );
};

export default IndustryShowcases;
