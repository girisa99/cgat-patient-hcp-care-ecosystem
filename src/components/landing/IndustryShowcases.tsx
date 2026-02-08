/**
 * INDUSTRY SHOWCASES SECTION
 * 
 * Demonstrates AI content generation capabilities with expansive, 
 * non-restrictive industry positioning. Shows FEATURED industries
 * while emphasizing the platform works for ANY industry.
 * 
 * Integrates regional messaging and transcreation positioning.
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
  Check,
  Globe,
  Sparkles,
  ArrowRight,
  Layers,
  Mic,
  Languages,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Featured industries with regional relevance tags
const FEATURED_INDUSTRIES = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    useCase: 'Patient education, HCP training, clinical trial comms',
    pipelines: ['HIPAA-compliant Videos', 'Multilingual Patient Guides', 'Clinical Training'],
    stats: { time: '4 min', languages: 22, savings: '85%' },
    regions: ['NAM', 'India', 'Europe'],
    positioning: 'Transcreated patient education in 22+ languages with compliance-ready pipelines',
  },
  {
    id: 'education',
    name: 'EdTech',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    useCase: 'Course modules, AI tutors, vernacular learning',
    pipelines: ['Course Videos', 'Interactive Quizzes', 'Avatar Instructors'],
    stats: { time: '6 min', languages: 35, savings: '90%' },
    regions: ['India', 'Africa', 'LATAM'],
    positioning: 'Vernacular course creation in 35+ languages — from Hindi to Swahili',
  },
  {
    id: 'finance',
    name: 'Finance & Banking',
    icon: Wallet,
    color: 'from-green-500 to-emerald-500',
    useCase: 'Investor decks, compliance reports, Islamic banking',
    pipelines: ['Pitch Decks', 'Compliance Training', 'Sharia-compliant Reports'],
    stats: { time: '5 min', languages: 15, savings: '75%' },
    regions: ['MENA', 'Europe', 'NAM'],
    positioning: 'MiFID II / Sharia-compliant reporting transcreated across regional dialects',
  },
  {
    id: 'government',
    name: 'Government & Public Sector',
    icon: Landmark,
    color: 'from-purple-500 to-indigo-500',
    useCase: 'Vision 2030 comms, e-governance, citizen portals',
    pipelines: ['PSA Videos', 'Policy Explainers', 'Citizen Engagement'],
    stats: { time: '3 min', languages: 40, savings: '80%' },
    regions: ['MENA', 'India', 'Africa'],
    positioning: 'Public service content transcreated in 40+ local dialects and languages',
  },
  {
    id: 'tourism',
    name: 'Travel & Hospitality',
    icon: Plane,
    color: 'from-orange-500 to-amber-500',
    useCase: 'Destination marketing, virtual tours, traveler guides',
    pipelines: ['Promo Videos', 'Virtual Tours', 'Multilingual Guides'],
    stats: { time: '4 min', languages: 25, savings: '70%' },
    regions: ['Caribbean', 'APAC', 'MENA'],
    positioning: 'Destination content transcreated for traveler languages and cultural context',
  },
  {
    id: 'retail',
    name: 'E-commerce & Retail',
    icon: ShoppingBag,
    color: 'from-pink-500 to-rose-500',
    useCase: 'Product demos, localized ads, UGC-style content',
    pipelines: ['Product Videos', 'Social Ads', 'Influencer-style Demos'],
    stats: { time: '2 min', languages: 20, savings: '85%' },
    regions: ['APAC', 'NAM', 'Europe'],
    positioning: 'Localized product content with region-specific social media formats',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industry 4.0',
    icon: Factory,
    color: 'from-slate-500 to-zinc-500',
    useCase: 'Safety training, SOPs, equipment guides in worker languages',
    pipelines: ['Safety Training', 'Multilingual SOPs', 'Maintenance Guides'],
    stats: { time: '5 min', languages: 18, savings: '75%' },
    regions: ['Europe', 'APAC', 'India'],
    positioning: 'Equipment training transcreated into worker languages with regional compliance',
  },
  {
    id: 'realestate',
    name: 'Real Estate & Construction',
    icon: Building2,
    color: 'from-teal-500 to-cyan-500',
    useCase: 'Property tours, investor decks, mega-project marketing',
    pipelines: ['Virtual Tours', 'Listing Videos', 'Investor Presentations'],
    stats: { time: '3 min', languages: 12, savings: '80%' },
    regions: ['MENA', 'APAC', 'NAM'],
    positioning: 'Property showcases with AI presenters, transcreated for investor dialects',
  },
];

// Extended industries list (not shown as cards, just referenced for credibility)
const EXTENDED_INDUSTRIES = [
  'Oil & Gas', 'Pharma', 'Legal', 'Consulting', 'NGO & Non-Profit',
  'Automotive', 'Aerospace', 'Telecom', 'Agriculture', 'Media & Entertainment',
  'Insurance', 'Logistics', 'Food & Beverage', 'Fashion', 'Sports',
  'Energy & Utilities', 'Mining', 'Professional Services', 'FMCG',
  'Architecture', 'Maritime', 'Defence', 'Biotech', 'Crypto & Web3',
  'Luxury Brands', 'Museums & Culture', 'Recruitment', 'SaaS',
  'Veterinary', 'Wellness & Fitness', 'Gaming', 'Event Management',
  'Supply Chain', 'Sustainability & ESG', 'Smart Cities',
  'Transportation', 'Coworking & PropTech', 'Digital Marketing Agencies',
  'Dental & Orthodontics', 'Nutrition & Dietetics', 'Elderly Care',
  'Mental Health', 'Fertility & IVF',
];

// Platform capabilities for the value bar
const PLATFORM_CAPABILITIES = [
  { icon: Video, label: '206 Pipelines' },
  { icon: Sparkles, label: '15 AI Providers' },
  { icon: Languages, label: '140+ Languages' },
  { icon: Globe, label: '8 Regional Zones' },
  { icon: Mic, label: '7 Arabic Dialects' },
  { icon: Layers, label: '7 Products' },
];

export const IndustryShowcases: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(FEATURED_INDUSTRIES[0]);
  const [showExtended, setShowExtended] = useState(false);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header — Expansive, not restrictive */}
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-4 gap-2">
            <Globe className="w-3 h-3" />
            Works for Every Industry, Every Region
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Your Industry. Your Language.{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Market.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pre-configured AI pipelines transcreated for{' '}
            <span className="text-primary font-bold">50+ industries</span> across{' '}
            <span className="text-primary font-bold">8 global regions</span> — 
            not translated, but culturally adapted to resonate with every audience.
          </p>
        </div>

        {/* Platform capabilities bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {PLATFORM_CAPABILITIES.map(({ icon: CapIcon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 rounded-full text-sm text-muted-foreground">
              <CapIcon className="h-3.5 w-3.5 text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Industry selector grid */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-8">
          {FEATURED_INDUSTRIES.map((industry) => {
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
                <span className="text-xs font-medium">{industry.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Selected industry detail */}
        <motion.div 
          key={selectedIndustry.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`bg-gradient-to-r ${selectedIndustry.color} p-[1px] rounded-2xl`}
        >
          <div className="bg-card rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {React.createElement(selectedIndustry.icon, { className: 'h-8 w-8 text-primary' })}
                  <h3 className="text-2xl font-bold text-foreground">{selectedIndustry.name}</h3>
                </div>

                {/* Regional relevance tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedIndustry.regions.map(region => (
                    <Badge key={region} variant="outline" className="text-[10px] gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      {region}
                    </Badge>
                  ))}
                </div>
                
                {/* Positioning statement — transcreation-focused */}
                <p className="text-base text-muted-foreground mb-5 leading-relaxed">
                  {selectedIndustry.positioning}
                </p>

                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-foreground text-sm">Pre-built Pipelines:</h4>
                  {selectedIndustry.pipelines.map((pipeline) => (
                    <div key={pipeline} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{pipeline}</span>
                    </div>
                  ))}
                </div>

                <Link to="/explore">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Play className="h-4 w-4 mr-2" />
                    Try {selectedIndustry.name.split(' ')[0]} Demo
                  </Button>
                </Link>
              </div>

              {/* Right: Stats + value props */}
              <div className="space-y-4">
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

                {/* Transcreation value prop */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <h4 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                    <Languages className="h-4 w-4 text-primary" />
                    Transcreation, Not Translation
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Every pipeline adapts content culturally — adjusting idioms, dialects, and context 
                    for each regional market. Zone-routed through Claude, Gemini, or Qwen based on your audience's language.
                  </p>
                </div>

                {/* Regional routing value prop */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <h4 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Zone-Based AI Routing
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Each region gets the best AI providers: Azure Neural for TTS, Gemini for India/SEA, 
                    Qwen-Max for Arabic dialects, Claude for Western markets — all automatic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Extended industries — proves it's NOT restricted */}
        <div className="text-center mt-10">
          <button 
            onClick={() => setShowExtended(!showExtended)}
            className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center gap-1 transition-colors"
          >
            {showExtended ? 'Show fewer' : `+ ${EXTENDED_INDUSTRIES.length} more industries we serve`}
            <ArrowRight className={`h-3.5 w-3.5 transition-transform ${showExtended ? 'rotate-90' : ''}`} />
          </button>

          {showExtended && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto"
            >
              {EXTENDED_INDUSTRIES.map(name => (
                <Badge key={name} variant="outline" className="text-xs text-muted-foreground">
                  {name}
                </Badge>
              ))}
            </motion.div>
          )}

          <p className="text-muted-foreground text-sm mt-4">
            Every industry gets the same{' '}
            <span className="text-foreground font-medium">15 AI providers</span>,{' '}
            <span className="text-foreground font-medium">206 pipelines</span>, and{' '}
            <span className="text-foreground font-medium">140+ language</span> transcreation — 
            customized for your market, compliance, and audience.
          </p>
        </div>
      </div>
    </section>
  );
};

export default IndustryShowcases;
