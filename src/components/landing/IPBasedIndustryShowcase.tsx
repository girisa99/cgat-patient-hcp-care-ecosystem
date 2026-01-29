/**
 * IP-BASED INDUSTRY SHOWCASE
 * 
 * Auto-detects visitor location and shows relevant industry content
 * Features:
 * - IP-based region detection
 * - Industry-specific videos
 * - Language auto-selection
 * - Manual override option
 */

import React, { useState, useMemo } from 'react';
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
  MapPin,
  ChevronDown,
  Loader2,
  Sparkles,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIPBasedContent } from '@/hooks/useIPBasedContent';
import { 
  IndustryCategory, 
  RegionalZone,
  INDUSTRY_TEMPLATES,
  REGIONAL_DETECTION_CONFIGS,
} from '@/config/content-generation-pipeline';

// Use Partial to allow for extensibility - not all industries need icons defined
const INDUSTRY_ICONS: Partial<Record<IndustryCategory, React.ElementType>> = {
  technology: Sparkles,
  healthcare: Heart,
  finance: Wallet,
  government: Landmark,
  education: GraduationCap,
  tourism: Plane,
  retail: ShoppingBag,
  manufacturing: Factory,
  real_estate: Building2,
  energy: Factory,
  media: Play,
  transportation: Plane,
  aerospace: Factory,
  telecommunications: Sparkles,
  agriculture: Factory,
  legal: Landmark,
  hospitality: Building2,
};

// Use Partial to allow for extensibility
const INDUSTRY_COLORS: Partial<Record<IndustryCategory, string>> = {
  technology: 'from-blue-500 to-cyan-500',
  healthcare: 'from-red-500 to-pink-500',
  finance: 'from-green-500 to-emerald-500',
  government: 'from-purple-500 to-indigo-500',
  education: 'from-blue-500 to-cyan-500',
  tourism: 'from-orange-500 to-amber-500',
  retail: 'from-pink-500 to-rose-500',
  manufacturing: 'from-slate-500 to-zinc-500',
  real_estate: 'from-teal-500 to-cyan-500',
  energy: 'from-yellow-500 to-orange-500',
  media: 'from-violet-500 to-purple-500',
  transportation: 'from-sky-500 to-blue-500',
  aerospace: 'from-indigo-500 to-blue-500',
  telecommunications: 'from-cyan-500 to-teal-500',
  agriculture: 'from-green-500 to-lime-500',
  legal: 'from-gray-500 to-slate-500',
  hospitality: 'from-amber-500 to-yellow-500',
};

const REGION_LABELS: Record<RegionalZone, string> = {
  mena: 'Middle East & North Africa',
  gcc: 'GCC (Gulf)',
  south_asia: 'South Asia',
  sea: 'Southeast Asia',
  cjk: 'East Asia (CJK)',
  europe: 'Europe',
  latam: 'Latin America',
  africa: 'Africa',
  north_america: 'North America',
  oceania: 'Australia & Pacific',
};

export const IPBasedIndustryShowcase: React.FC = () => {
  const {
    isLoading,
    geoData,
    detectedZone,
    regionalConfig,
    recommendedIndustries,
    recommendedTemplates,
    defaultTemplate,
    defaultLanguage,
    setManualZone,
    setManualIndustry,
    resetToDetected,
  } = useIPBasedContent();

  const [selectedIndustry, setSelectedIndustry] = useState<IndustryCategory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Effective industry (selected or first recommended)
  const effectiveIndustry = selectedIndustry || recommendedIndustries[0] || 'technology';
  
  // Get template for effective industry
  const currentTemplate = useMemo(() => {
    if (selectedIndustry) {
      return INDUSTRY_TEMPLATES.find(t => t.industry === selectedIndustry) || defaultTemplate;
    }
    return defaultTemplate;
  }, [selectedIndustry, defaultTemplate]);

  const Icon = INDUSTRY_ICONS[effectiveIndustry] || Sparkles;
  const colorGradient = INDUSTRY_COLORS[effectiveIndustry] || 'from-primary to-accent';

  const handleIndustrySelect = (industry: IndustryCategory) => {
    setSelectedIndustry(industry);
    setManualIndustry(industry);
    setIsPlaying(false);
  };

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header with location detection */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isLoading ? (
              <Badge variant="secondary" className="gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Detecting your region...
              </Badge>
            ) : geoData ? (
              <Badge variant="outline" className="gap-2">
                <MapPin className="w-3 h-3" />
                {geoData.city && `${geoData.city}, `}{geoData.countryName}
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-2">
                <Globe className="w-3 h-3" />
                Global
              </Badge>
            )}
            
            {/* Region override dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 h-6 px-2">
                  <Settings2 className="w-3 h-3" />
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-popover z-50">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Change Region
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(REGION_LABELS).map(([zone, label]) => (
                  <DropdownMenuItem
                    key={zone}
                    onClick={() => setManualZone(zone as RegionalZone)}
                    className={cn(
                      "cursor-pointer",
                      detectedZone === zone && "bg-accent"
                    )}
                  >
                    {label}
                    {detectedZone === zone && <Check className="w-4 h-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={resetToDetected} className="text-muted-foreground">
                  Reset to auto-detect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Built for Your Industry
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {regionalConfig ? (
              <>
                Showing content relevant to <span className="text-primary font-semibold">{REGION_LABELS[regionalConfig.zone]}</span>
              </>
            ) : (
              <>Pre-configured pipelines for <span className="text-primary font-bold">50+ industries</span></>
            )}
          </p>
        </div>

        {/* Industry selector - shows recommended first */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {recommendedIndustries.slice(0, 8).map((industry) => {
            const IndustryIcon = INDUSTRY_ICONS[industry] || Sparkles;
            const isSelected = effectiveIndustry === industry;
            
            return (
              <button
                key={industry}
                onClick={() => handleIndustrySelect(industry)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  isSelected 
                    ? 'bg-primary text-primary-foreground scale-105 shadow-lg' 
                    : 'bg-card border border-border hover:border-primary/50'
                )}
              >
                <IndustryIcon className="h-4 w-4" />
                <span className="text-sm font-medium capitalize">
                  {industry.replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected industry detail */}
        {currentTemplate && (
          <div className={`bg-gradient-to-r ${colorGradient} p-[1px] rounded-2xl`}>
            <div className="bg-card rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Video preview */}
                <div className="aspect-video bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                  {isPlaying ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Generating preview for "{currentTemplate.title}"...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 p-6">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <Icon className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {currentTemplate.title}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          {currentTemplate.narrative}
                        </p>
                      </div>
                      <Button 
                        onClick={() => setIsPlaying(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Demo
                      </Button>
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                      <Badge variant="secondary" className="capitalize">
                        {effectiveIndustry.replace('_', ' ')}
                      </Badge>
                      {regionalConfig && (
                        <Badge variant="outline" className="gap-1">
                          <Globe className="w-3 h-3" />
                          {REGION_LABELS[regionalConfig.zone]}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {currentTemplate.title}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {currentTemplate.description}
                    </p>
                  </div>

                  {/* Chapters preview */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground text-sm">Video Chapters:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {currentTemplate.chapters.slice(0, 4).map((chapter, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {i + 1}
                          </div>
                          <span className="text-muted-foreground truncate">
                            {chapter.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-2">Available Languages:</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentTemplate.languages.slice(0, 6).map((lang) => (
                        <Badge 
                          key={lang} 
                          variant={lang === defaultLanguage ? 'default' : 'outline'}
                          className="text-xs uppercase"
                        >
                          {lang}
                        </Badge>
                      ))}
                      {currentTemplate.languages.length > 6 && (
                        <Badge variant="secondary" className="text-xs">
                          +{currentTemplate.languages.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-3">
                    <Link to="/explore" className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <Play className="h-4 w-4 mr-2" />
                        Try This Template
                      </Button>
                    </Link>
                    <Link to="/genie-landing#pricing">
                      <Button variant="outline">
                        View Pricing
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* More industries CTA */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Plus templates for {INDUSTRY_TEMPLATES.length - 8}+ more industries including 
            Manufacturing, Real Estate, Media, Transportation, and more
          </p>
        </div>
      </div>
    </section>
  );
};

export default IPBasedIndustryShowcase;
