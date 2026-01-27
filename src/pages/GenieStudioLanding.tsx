/**
 * GENIE STUDIO LANDING PAGE
 * Geo-contextual landing with 7 products, 206 pipelines, regional content
 * 
 * Test regions: ?simulate_region=IND or ?simulate_region=MENA
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Check,
  ChevronRight,
  ChevronLeft,
  Youtube,
  Twitter,
  Linkedin,
  Mail,
  Globe,
  Play
} from 'lucide-react';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

// Product logos
import genieSparkLogo from '@/assets/logos/products/genie-spark.png';
import genieMindLogo from '@/assets/logos/products/genie-mind.png';
import genieVibeLogo from '@/assets/logos/products/genie-vibe.png';
import genieDeckLogo from '@/assets/logos/products/genie-deck.png';
import genieArcLogo from '@/assets/logos/products/genie-arc.png';
import genieCastLogo from '@/assets/logos/products/genie-cast.png';
import askGenieLogo from '@/assets/logos/products/ask-genie.png';

// ============================================
// CONSTANTS & DATA
// ============================================

const PRODUCTS = [
  { id: 'spark', name: 'Genie Spark', tagline: 'Ignite Your Ideas', logo: genieSparkLogo, color: 'from-orange-500 to-red-500', pipelines: 28, desc: 'Input processing & script generation' },
  { id: 'mind', name: 'Genie Mind', tagline: 'AI That Understands', logo: genieMindLogo, color: 'from-cyan-500 to-teal-500', pipelines: 30, desc: 'Script enhancement, TTS, translation' },
  { id: 'vibe', name: 'Genie Vibe', tagline: 'Script to Screen', logo: genieVibeLogo, color: 'from-purple-500 to-violet-500', pipelines: 74, desc: 'Video production, avatar, dubbing' },
  { id: 'deck', name: 'Genie Deck', tagline: 'Ideas to Impact', logo: genieDeckLogo, color: 'from-blue-500 to-indigo-500', pipelines: 34, desc: 'Presentations, visual design, 3D' },
  { id: 'arc', name: 'Genie Arc', tagline: 'Your Production Journey', logo: genieArcLogo, color: 'from-red-500 to-orange-500', pipelines: 14, desc: 'Scheduling & collaboration' },
  { id: 'cast', name: 'Genie Cast', tagline: 'Make It. Show It. Scale It.', logo: genieCastLogo, color: 'from-green-500 to-emerald-500', pipelines: 26, desc: 'Distribution, marketing, analytics' },
  { id: 'ask', name: 'Ask Genie', tagline: 'Your Wish is My Command', logo: askGenieLogo, color: 'from-amber-500 to-yellow-500', pipelines: 0, desc: 'AI assistant available everywhere' },
];

type RegionCode = 'NAM' | 'EUR' | 'MENA' | 'IND' | 'AFR' | 'APAC' | 'LATAM' | 'CARIB';

interface HeroContent {
  flag: string;
  region: string;
  headline: string;
  subheadline: string;
  theme: string;
  stats: { reach: string; languages?: string; dialects?: string; savings: string };
  isRTL?: boolean;
  video: string;
  industries: string[];
}

const HERO_CONTENT: Record<RegionCode, HeroContent> = {
  NAM: {
    flag: '🇺🇸', region: 'North America',
    headline: 'Transform Your Content Strategy',
    subheadline: 'AI-powered production for Healthcare, Finance & Tech leaders',
    theme: 'Digital Transformation',
    stats: { reach: '50M+', languages: '70+', savings: '80%' },
    video: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop',
    industries: ['Healthcare', 'Finance', 'Technology', 'Retail'],
  },
  EUR: {
    flag: '🇪🇺', region: 'Europe',
    headline: 'Scale Content Across Europe',
    subheadline: 'Multilingual production for Manufacturing & Finance',
    theme: 'Industry 4.0',
    stats: { reach: '40M+', languages: '25+', savings: '75%' },
    video: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop',
    industries: ['Finance', 'Manufacturing', 'Professional Services'],
  },
  MENA: {
    flag: '🇦🇪', region: 'Middle East',
    headline: 'رؤية 2030 تبدأ هنا',
    subheadline: 'AI content production in 7 Arabic dialects',
    theme: 'Vision 2030',
    stats: { reach: '100M+', dialects: '7', savings: '85%' },
    isRTL: true,
    video: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=450&fit=crop',
    industries: ['Government', 'Tourism', 'Real Estate', 'Finance'],
  },
  IND: {
    flag: '🇮🇳', region: 'India',
    headline: 'India का Education Revolution',
    subheadline: 'Create once, reach 500M+ students in 22 Indian languages',
    theme: 'EdTech Revolution',
    stats: { reach: '500M+', languages: '22', savings: '90%' },
    video: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop',
    industries: ['EdTech', 'Fintech', 'Entertainment', 'E-commerce'],
  },
  AFR: {
    flag: '🌍', region: 'Africa',
    headline: "Africa's Content Revolution",
    subheadline: 'Fintech & AgriTech content in 10 African languages',
    theme: 'Mobile Money Revolution',
    stats: { reach: '200M+', languages: '10', savings: '85%' },
    video: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=450&fit=crop',
    industries: ['Fintech', 'AgriTech', 'NGO', 'Tourism'],
  },
  APAC: {
    flag: '🌏', region: 'Asia Pacific',
    headline: 'Smart Content for Smart Nations',
    subheadline: 'E-commerce & Tech content across Asia Pacific',
    theme: 'Smart Nation',
    stats: { reach: '300M+', languages: '15+', savings: '80%' },
    video: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=450&fit=crop',
    industries: ['Technology', 'E-commerce', 'Finance', 'Manufacturing'],
  },
  LATAM: {
    flag: '🌎', region: 'Latin America',
    headline: 'Contenido que Conecta',
    subheadline: 'Tourism & Fintech content in Spanish & Portuguese',
    theme: 'Creator Economy',
    stats: { reach: '150M+', languages: '3', savings: '75%' },
    video: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&h=450&fit=crop',
    industries: ['Tourism', 'Entertainment', 'Fintech', 'Retail'],
  },
  CARIB: {
    flag: '🏝️', region: 'Caribbean',
    headline: 'Paradise Meets Technology',
    subheadline: 'Tourism & Hospitality content that captivates',
    theme: 'Tourism Tech',
    stats: { reach: '20M+', languages: '3', savings: '70%' },
    video: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=450&fit=crop',
    industries: ['Tourism', 'Hospitality', 'Real Estate'],
  },
};

const ARABIC_DIALECTS = [
  { code: 'ar-msa', name: 'MSA', region: 'Formal/News', example: 'ابدأ بإنشاء مقاطع فيديو رائعة' },
  { code: 'ar-SA', name: 'Saudi', region: 'Saudi Arabia', example: 'ابدأ تسوي فيديوهات روعة' },
  { code: 'ar-gulf', name: 'Gulf', region: 'UAE/Kuwait/Qatar', example: 'ابدا سوّي فيديوهات حلوة' },
  { code: 'ar-EG', name: 'Egyptian', region: 'Egypt', example: 'ابدأ اعمل فيديوهات جامدة' },
  { code: 'ar-levantine', name: 'Levantine', region: 'Lebanon/Syria', example: 'بلّش اعمل فيديوهات كتير حلوة' },
  { code: 'ar-maghrebi', name: 'Maghrebi', region: 'Morocco/Algeria', example: 'بدا دير فيديوهات زوينين' },
  { code: 'ar-IQ', name: 'Iraqi', region: 'Iraq', example: 'ابدي سوّي فيديوهات روعة' },
];

const PRICING_TIERS = [
  { name: 'Free', price: 0, pipelines: 41, languages: 10, credits: 50, features: ['720p', '5 exports/mo', 'Watermark'] },
  { name: 'Creator', price: 29, pipelines: 120, languages: 20, credits: 500, features: ['1080p', '30 exports/mo', 'Basic avatar'] },
  { name: 'Professional', price: 59, pipelines: 165, languages: 40, credits: 1200, features: ['4K', '100 exports/mo', 'Voice cloning', 'API'], popular: true },
  { name: 'Studio', price: 99, pipelines: 194, languages: '70+', credits: 2500, features: ['4K', 'Unlimited', '7 Arabic dialects', '22 Indian langs'] },
  { name: 'Enterprise', price: 299, pipelines: 206, languages: '140+', credits: '10K+', features: ['8K', 'White-label', 'SSO/SAML', 'VR/AR Labs'] },
];

const AI_PROVIDERS = [
  { name: 'OpenAI', icon: '🤖', use: 'Script' },
  { name: 'Claude', icon: '🧠', use: 'Analysis' },
  { name: 'Gemini', icon: '💎', use: 'Indian' },
  { name: 'ElevenLabs', icon: '🎙️', use: 'Voice' },
  { name: 'Azure', icon: '☁️', use: 'TTS' },
  { name: 'Alibaba', icon: '🌏', use: 'CJK' },
  { name: 'DeepL', icon: '📝', use: 'Translation' },
  { name: 'ModelsLab', icon: '🎬', use: 'Video' },
  { name: 'Meshy', icon: '🎲', use: '3D' },
  { name: 'Whisper', icon: '👂', use: 'STT' },
  { name: 'Suno', icon: '🎵', use: 'Music' },
  { name: 'NLLB', icon: '🌐', use: 'Rare langs' },
];

const socialLinks = [
  { icon: Youtube, href: 'https://youtube.com/@genieaisuite', label: 'YouTube' },
  { icon: Twitter, href: 'https://twitter.com/genieaisuite', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/genieaisuite', label: 'LinkedIn' },
];

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const GenieStudioLanding: React.FC = () => {
  const navigate = useNavigate();
  const productCarouselRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<RegionCode>('NAM');
  const [isSimulated, setIsSimulated] = useState(false);
  const [activeProduct, setActiveProduct] = useState('vibe');
  const [showTranscreation, setShowTranscreation] = useState(true);
  const [langTab, setLangTab] = useState<'arabic' | 'indian' | 'african'>('arabic');

  // Detect region on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const simRegion = params.get('simulate_region') as RegionCode | null;
    if (simRegion && HERO_CONTENT[simRegion]) {
      setRegion(simRegion);
      setIsSimulated(true);
    } else {
      // Auto-detect from timezone
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Kolkata') || tz.includes('Mumbai')) setRegion('IND');
      else if (tz.includes('Dubai') || tz.includes('Riyadh')) setRegion('MENA');
      else if (tz.includes('Africa/')) setRegion('AFR');
      else if (tz.includes('Singapore') || tz.includes('Tokyo')) setRegion('APAC');
      else if (tz.includes('Europe/')) setRegion('EUR');
      else if (tz.includes('Mexico') || tz.includes('Sao_Paulo')) setRegion('LATAM');
    }
  }, []);

  const hero = HERO_CONTENT[region];
  const activeProductData = PRODUCTS.find(p => p.id === activeProduct)!;

  return (
    <main className={`min-h-screen bg-background text-foreground ${hero?.isRTL ? 'rtl' : 'ltr'}`}>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={genieSuiteLogo} alt="Genie Suite" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Genie Studio
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#products" className="text-muted-foreground hover:text-foreground transition">Products</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a>
            <a href="#languages" className="text-muted-foreground hover:text-foreground transition">Languages</a>
            <Link to="/explore">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Explore
              </Button>
            </Link>
            <Link to="/genie-studio-auth">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Simulated region indicator */}
      {isSimulated && (
        <div className="fixed top-20 left-4 z-50 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
          🔧 DEV: Simulating {region}
        </div>
      )}

      {/* SECTION 1: HERO - GEO-CONTEXTUAL */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <span className="text-2xl">{hero.flag}</span>
                <span className="text-muted-foreground text-sm">Content optimized for {hero.region}</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                  {hero.headline}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl">
                {hero.subheadline}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-3xl font-bold text-foreground">{hero.stats.reach}</p>
                  <p className="text-muted-foreground">Audience Reach</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{hero.stats.languages || hero.stats.dialects}</p>
                  <p className="text-muted-foreground">{hero.stats.dialects ? 'Arabic Dialects' : 'Languages'}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">{hero.stats.savings}</p>
                  <p className="text-muted-foreground">Cost Savings</p>
                </div>
              </div>

              {/* Platform stats */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="px-2 py-1 bg-muted rounded">7 Products</span>
                <span>•</span>
                <span className="px-2 py-1 bg-muted rounded">206 Pipelines</span>
                <span>•</span>
                <span className="px-2 py-1 bg-muted rounded">12 AI Providers</span>
                <span>•</span>
                <span className="px-2 py-1 bg-muted rounded">95% Confidence</span>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Link to="/genie-studio-auth?tab=signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg text-lg px-8 py-6">
                    Start Creating Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/explore">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6">
                    <Play className="mr-2 h-4 w-4" />
                    See How It Works
                  </Button>
                </Link>
              </div>

              {/* Returning user link */}
              <p className="text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link to="/genie-studio-auth" className="text-primary hover:underline font-medium">
                  Sign in →
                </Link>
              </p>

              <p className="text-muted-foreground text-sm">
                ✓ 50 free credits • ✓ No credit card required • ✓ 41 pipelines included
              </p>
            </div>

            {/* Right: Video showcase */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border">
                <img 
                  src={hero.video} 
                  alt={hero.theme}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Video overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-primary/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-primary/30 transition">
                    <Play className="h-8 w-8 ml-1 text-primary-foreground" />
                  </button>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full backdrop-blur">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400">95% AI Confidence</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-black/50 rounded text-xs backdrop-blur text-white">4K</span>
                    <span className="px-2 py-1 bg-black/50 rounded text-xs backdrop-blur text-white">AI Avatar</span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 px-4 py-2 bg-primary rounded-lg shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                <p className="text-sm font-medium text-primary-foreground">🌍 {hero.stats.languages || hero.stats.dialects} Languages</p>
              </div>
              <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-accent rounded-lg shadow-lg">
                <p className="text-sm font-medium text-accent-foreground">⚡ Generated in 4 min</p>
              </div>
            </div>
          </div>

          {/* Industries for this region */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">Trusted by {hero.region} leaders in:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {hero.industries.map((ind: string) => (
                <span key={ind} className="px-4 py-2 bg-muted rounded-full text-foreground hover:bg-muted/80 transition cursor-pointer">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-border rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* SECTION 2: PRODUCT ECOSYSTEM */}
      <section id="products" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              7 Products. 206 Pipelines. One Platform.
            </h2>
            <p className="text-xl text-muted-foreground">
              From idea to global distribution — every tool you need
            </p>
          </div>

          {/* Product Carousel */}
          <div className="relative group">
            {/* Left scroll button */}
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/90 backdrop-blur shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                if (productCarouselRef.current) {
                  productCarouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                }
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* Right scroll button */}
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/90 backdrop-blur shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                if (productCarouselRef.current) {
                  productCarouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                }
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Horizontal scroll container */}
            <div 
              ref={productCarouselRef}
              className="flex gap-6 overflow-x-auto px-4 py-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {PRODUCTS.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setActiveProduct(product.id)}
                  className={`group/card flex-shrink-0 w-[280px] relative p-6 rounded-2xl transition-all flex flex-col items-center text-center snap-center ${
                    activeProduct === product.id
                      ? 'bg-card border-2 border-primary scale-105 shadow-xl'
                      : 'bg-card border border-border hover:border-primary/50 hover:shadow-lg'
                  }`}
                >
                  <div className="w-32 h-32 mb-4 relative">
                    <img 
                      src={product.logo} 
                      alt={product.name}
                      className="w-full h-full object-contain group-hover/card:scale-110 transition-transform"
                    />
                  </div>
                  <p className="font-bold text-foreground text-lg">{product.name}</p>
                  <p className="text-sm text-muted-foreground mt-1 italic">"{product.tagline}"</p>
                  {product.pipelines > 0 && (
                    <Badge variant="secondary" className="mt-3">
                      {product.pipelines} pipelines
                    </Badge>
                  )}
                  {product.id === 'ask' && (
                    <Badge variant="outline" className="mt-3 border-amber-500 text-amber-600">
                      Available Everywhere
                    </Badge>
                  )}
                  {activeProduct === product.id && (
                    <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-gradient-to-r ${product.color}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active product detail */}
          <div className={`mt-8 bg-gradient-to-r ${activeProductData.color} p-[1px] rounded-2xl max-w-4xl mx-auto`}>
            <div className="bg-card rounded-2xl p-8">
              <div className="flex items-center gap-6 mb-4">
                <img 
                  src={activeProductData.logo} 
                  alt={activeProductData.name}
                  className="w-24 h-24 object-contain"
                />
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{activeProductData.name}</h3>
                  <p className={`bg-gradient-to-r ${activeProductData.color} bg-clip-text text-transparent font-medium text-lg`}>
                    "{activeProductData.tagline}"
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-lg mb-4">{activeProductData.desc}</p>
              <div className="flex items-center gap-4">
                {activeProductData.pipelines > 0 && (
                  <span className="px-4 py-2 bg-muted rounded-full text-foreground font-medium">{activeProductData.pipelines} Pipelines</span>
                )}
                <Link to="/products" className="text-primary hover:text-primary/80 transition font-medium">
                  Explore {activeProductData.name} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: AI ORCHESTRATION */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/5" />
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              12 AI Providers. Best for Each Task.
            </h2>
            <p className="text-xl text-muted-foreground">
              We pick the right AI for YOUR context — automatically
            </p>
          </div>

          {/* Provider grid */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mb-12">
            {AI_PROVIDERS.map((provider) => (
              <div key={provider.name} className="p-4 bg-card border border-border rounded-xl hover:bg-muted transition text-center shadow-sm">
                <span className="text-3xl">{provider.icon}</span>
                <p className="text-sm font-medium mt-2 text-foreground">{provider.name}</p>
                <p className="text-xs text-muted-foreground">{provider.use}</p>
              </div>
            ))}
          </div>

          {/* Confidence guarantee */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 rounded-full border border-green-500/30">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600 dark:text-green-400">
                <strong>95% Confidence Guarantee</strong> — or we regenerate for free
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: LANGUAGE POWER */}
      <section id="languages" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              True Localization. Not Translation.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We adapt meaning, culture, and context. This is <span className="text-primary font-bold">transcreation</span>.
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">70+</p>
              <p className="text-muted-foreground">Core Languages</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">140+</p>
              <p className="text-muted-foreground">Extended</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="text-4xl font-bold text-accent">249+</p>
              <p className="text-muted-foreground">Translation</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { id: 'arabic' as const, label: '🇸🇦 7 Arabic Dialects', badge: 'Exclusive' },
              { id: 'indian' as const, label: '🇮🇳 22 Indian Languages', badge: 'Most complete' },
              { id: 'african' as const, label: '🌍 10 African Languages', badge: 'First mover' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLangTab(tab.id)}
                className={`relative px-6 py-3 rounded-full transition ${
                  langTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                  {tab.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Arabic dialects */}
          {langTab === 'arabic' && (
            <div className="bg-card border border-border rounded-2xl p-8 shadow-md">
              <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
                Same Message, 7 Different Dialects
              </h3>
              <p className="text-muted-foreground text-center mb-8">
                "Start creating amazing videos today!" — naturally localized
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ARABIC_DIALECTS.map((dialect) => (
                  <div key={dialect.code} className="p-4 bg-muted rounded-xl hover:bg-muted/80 transition">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-primary font-bold">{dialect.name}</span>
                      <span className="text-muted-foreground text-sm">{dialect.region}</span>
                    </div>
                    <p className="text-xl text-right text-foreground" dir="rtl">{dialect.example}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/30 text-center">
                <p className="text-green-600 dark:text-green-400">
                  ⭐ <strong>NO competitor offers all 7 Arabic dialects</strong> — this is our moat!
                </p>
              </div>
            </div>
          )}

          {/* Indian languages */}
          {langTab === 'indian' && (
            <div className="bg-card border border-border rounded-2xl p-8 shadow-md">
              <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
                22 Indian Languages + Code-Mixing
              </h3>
              
              {/* Toggle */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex p-1 bg-muted rounded-full">
                  <button
                    onClick={() => setShowTranscreation(false)}
                    className={`px-4 py-2 rounded-full transition ${!showTranscreation ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground'}`}
                  >
                    ❌ Literal Translation
                  </button>
                  <button
                    onClick={() => setShowTranscreation(true)}
                    className={`px-4 py-2 rounded-full transition ${showTranscreation ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  >
                    ✅ Genie Transcreation
                  </button>
                </div>
              </div>

              {/* Comparison */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className={`p-6 rounded-xl ${!showTranscreation ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted'}`}>
                  <p className="text-muted-foreground mb-2">Hindi (Literal - Robotic):</p>
                  <p className="text-xl text-foreground">"कृपया हमारे AI-संचालित पाठ्यक्रम निर्माता को मुफ्त में आज़माएं"</p>
                  {!showTranscreation && <p className="text-destructive text-sm mt-2">❌ Textbook style. Nobody talks like this.</p>}
                </div>
                <div className={`p-6 rounded-xl ${showTranscreation ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted'}`}>
                  <p className="text-muted-foreground mb-2">Hinglish (Natural speech):</p>
                  <p className="text-xl text-foreground">"AI course creator free में try करो! एकदम मस्त है!"</p>
                  {showTranscreation && <p className="text-green-600 dark:text-green-400 text-sm mt-2">✅ Natural urban speech with English terms</p>}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['Hindi', 'Bengali', 'Telugu', 'Tamil', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam'].map((lang) => (
                  <span key={lang} className="px-3 py-1 bg-muted rounded-full text-sm text-foreground">{lang}</span>
                ))}
                <span className="px-3 py-1 bg-primary/20 rounded-full text-sm text-primary">+14 more</span>
              </div>
            </div>
          )}

          {/* African languages */}
          {langTab === 'african' && (
            <div className="bg-card border border-border rounded-2xl p-8 shadow-md">
              <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
                10 African Languages — First Mover Advantage
              </h3>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {['Swahili', 'Yoruba', 'Hausa', 'Zulu', 'Amharic', 'Igbo', 'Xhosa', 'Afrikaans', 'Kinyarwanda', 'Somali'].map((lang) => (
                  <span key={lang} className="px-4 py-2 bg-muted rounded-full text-foreground">{lang}</span>
                ))}
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30 text-center">
                <p className="text-yellow-600 dark:text-yellow-400">
                  🌍 <strong>First mover in African language AI content</strong> — 500M+ potential users
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: PRICING */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free. Scale as you grow. <span className="text-green-600 dark:text-green-400">Save 55%</span> vs separate tools.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-5 gap-4">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 ${
                  tier.popular
                    ? 'bg-gradient-to-b from-primary to-accent text-white scale-105 shadow-xl relative'
                    : 'bg-card border border-border text-foreground shadow-md'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <div className="my-4">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className={tier.popular ? 'text-white/80' : 'text-muted-foreground'}>/mo</span>
                </div>
                
                <div className="space-y-1 text-sm mb-4">
                  <p><span className={tier.popular ? 'text-white font-bold' : 'text-primary font-bold'}>{tier.credits}</span> credits</p>
                  <p><span className={tier.popular ? 'text-white font-bold' : 'text-primary font-bold'}>{tier.pipelines}</span> pipelines</p>
                  <p><span className={tier.popular ? 'text-white font-bold' : 'text-primary font-bold'}>{tier.languages}</span> languages</p>
                </div>

                <ul className="space-y-1 mb-4">
                  {tier.features.map((f) => (
                    <li key={f} className={`text-xs flex items-center gap-1 ${tier.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                      <Check className="h-3 w-3 text-green-400" /> {f}
                    </li>
                  ))}
                </ul>

                <Link to={`/genie-studio-auth?tier=${tier.name.toLowerCase()}`}>
                  <Button className={`w-full ${
                    tier.popular ? 'bg-white text-primary hover:bg-gray-100' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}>
                    {tier.price === 0 ? 'Start Free' : 'Get Started'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Savings callout */}
          <div className="mt-12 p-6 bg-green-500/10 rounded-2xl border border-green-500/30 text-center">
            <p className="text-green-600 dark:text-green-400 text-lg">
              💰 <strong>Save 55%</strong> compared to Synthesia + ElevenLabs + Descript + DeepL + InVideo + Buffer + Canva
            </p>
            <p className="text-muted-foreground mt-2">
              That's $220/month for just $99/month with Studio — plus features they don't have!
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: DOGFOODING - GENIE CAST */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/10" />
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-5xl">📡</span>
                <div className="text-left">
                  <h3 className="text-3xl font-bold text-foreground">Genie Cast</h3>
                  <p className="text-green-600 dark:text-green-400 font-medium text-xl">"Make It. Show It. Scale It."</p>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mt-6 mb-4 text-foreground">
                This Website? Built with Genie.
              </h2>
              <p className="text-xl text-muted-foreground">
                We don't just build AI tools. We use them. Every day.
              </p>
            </div>

            {/* What we built */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">24</p>
                <p className="text-muted-foreground">Regional Showcases</p>
                <p className="text-xs text-muted-foreground mt-1">Auto-generated per region</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">72</p>
                <p className="text-muted-foreground">Industry Templates</p>
                <p className="text-xs text-muted-foreground mt-1">AI-created examples</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">12</p>
                <p className="text-muted-foreground">Language Versions</p>
                <p className="text-xs text-muted-foreground mt-1">Including RTL Arabic</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">4 min</p>
                <p className="text-muted-foreground">Avg Generation Time</p>
                <p className="text-xs text-muted-foreground mt-1">Full video with avatar</p>
              </div>
            </div>

            {/* Genie Cast features used */}
            <div className="bg-muted rounded-xl p-6">
              <p className="text-muted-foreground mb-4 text-center">Built using Genie Cast pipelines:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['social-publish', 'multi-platform', 'analytics-dash', 'campaign-auto', 'content-scheduler', 'a-b-testing', 'engagement-track'].map((pipeline) => (
                  <span key={pipeline} className="px-3 py-1 bg-green-500/20 rounded-full text-green-600 dark:text-green-400 text-sm">
                    {pipeline}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link to="/explore">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  See Behind the Scenes
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA FOOTER */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-background" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Mind to Media.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Start Now.
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands transforming their content with AI
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/genie-studio-auth?tab=signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg text-lg px-8 py-6">
                Start Creating Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/support">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6">
                Schedule Demo
              </Button>
            </Link>
          </div>

          {/* Returning user link */}
          <p className="text-muted-foreground mb-4">
            Already have an account?{' '}
            <Link to="/genie-studio-auth" className="text-primary hover:underline font-medium">
              Sign in →
            </Link>
          </p>

          <p className="text-muted-foreground">
            ✓ 50 free credits • ✓ No credit card • ✓ 41 pipelines included
          </p>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground text-sm mb-8">
              <a href="#products" className="hover:text-foreground transition">Products</a>
              <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
              <a href="#languages" className="hover:text-foreground transition">Languages</a>
              <Link to="/products" className="hover:text-foreground transition">Templates</Link>
              <Link to="/support" className="hover:text-foreground transition">Documentation</Link>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </a>
              ))}
            </div>
            
            <div className="flex justify-center items-center gap-2">
              <img src={genieSuiteLogo} alt="Genie Suite" className="h-6 w-auto" />
              <span className="font-bold text-foreground">Genie Studio</span>
              <span className="text-muted-foreground">© 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* REGION SWITCHER (DEV TOOL) */}
      <div className="fixed bottom-4 right-4 z-50">
        <details className="bg-card border border-border rounded-lg shadow-lg">
          <summary className="px-4 py-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            🌍 Switch Region
          </summary>
          <div className="p-2 space-y-1">
            {(Object.keys(HERO_CONTENT) as RegionCode[]).map((code) => (
              <button
                key={code}
                onClick={() => {
                  window.location.href = `?simulate_region=${code}`;
                }}
                className={`block w-full text-left px-3 py-1 rounded text-sm transition ${
                  region === code ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                }`}
              >
                {HERO_CONTENT[code].flag} {code}
              </button>
            ))}
          </div>
        </details>
      </div>
    </main>
  );
};

export default GenieStudioLanding;
