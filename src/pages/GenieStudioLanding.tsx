/**
 * GENIE STUDIO LANDING PAGE
 * Public landing page with product showcase, social links, and CTA to pricing/auth
 * Root path for dev environment - combined marketing and product show
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  Check, 
  Star, 
  Zap,
  Brain,
  Wand2,
  Video,
  Presentation,
  Users,
  Globe,
  Youtube,
  Twitter,
  Linkedin,
  Mail,
  ChevronRight
} from 'lucide-react';

// Import assets
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';
import { GENIE_PRODUCTS } from '@/hooks/useSubscription';

// Product cards data
const products = [
  {
    key: 'mind',
    icon: Brain,
    name: 'Genie Mind',
    tagline: 'AI that understands',
    description: 'Semantic search, document processing, and intelligent content analysis.',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    key: 'spark',
    icon: Zap,
    name: 'Genie Spark',
    tagline: 'Ignite your Ideas',
    description: 'Transform ideas into polished scripts with natural language prompts.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    key: 'vibe',
    icon: Video,
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    description: 'Professional recording studio with AI voice generation.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    key: 'deck',
    icon: Presentation,
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    description: 'AI-powered presentations with multi-language export.',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    key: 'studio',
    icon: Wand2,
    name: 'Genie Studio',
    tagline: 'Mind to Media',
    description: 'Complete AI-powered media production suite.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    featured: true,
  },
  {
    key: 'arc',
    icon: Users,
    name: 'Genie Arc',
    tagline: 'Production Hub',
    description: 'Team coordination and multi-person productions.',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-500/10',
  },
];

const socialLinks = [
  { icon: Youtube, href: 'https://youtube.com/@genieaisuite', label: 'YouTube' },
  { icon: Twitter, href: 'https://twitter.com/genieaisuite', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/genieaisuite', label: 'LinkedIn' },
];

const GenieStudioLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={genieSuiteLogo} 
                alt="Genie Suite" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-white">Genie Suite</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/genie-studio-pricing">
                <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                  Pricing
                </Button>
              </Link>
              <Link to="/genie-studio-auth">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            AI-Powered Content Creation Suite
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Transform Your Ideas Into
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent block mt-2">
              Professional Content
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto mb-10">
            From concept to creation — Genie Suite combines AI intelligence, script generation, 
            professional recording, and presentation design in one unified platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/genie-studio-auth?tab=signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/genie-studio-pricing">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6">
                View Pricing
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>SOC 2 Type II</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">The Complete Genie Ecosystem</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Six powerful AI tools working together to streamline your content creation workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card 
                key={product.key}
                className={`bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer group ${
                  product.featured ? 'md:col-span-2 lg:col-span-1 ring-2 ring-purple-500/50' : ''
                }`}
                onClick={() => navigate('/genie-studio-auth')}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${product.bgColor} flex items-center justify-center mb-4`}>
                    <product.icon className={`h-6 w-6 text-white`} />
                  </div>
                  
                  {product.featured && (
                    <Badge className="mb-3 bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                      Flagship Product
                    </Badge>
                  )}
                  
                  <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                  <p className={`text-sm font-medium bg-gradient-to-r ${product.color} bg-clip-text text-transparent mb-2`}>
                    {product.tagline}
                  </p>
                  <p className="text-sm text-white/60">{product.description}</p>
                  
                  <div className="mt-4 flex items-center text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-amber-500/20 text-amber-300 border-amber-500/30">
                Why Genie Suite
              </Badge>
              <h2 className="text-3xl font-bold text-white mb-6">
                One Platform. Unlimited Possibilities.
              </h2>
              <div className="space-y-4">
                {[
                  'AI-powered script generation in seconds',
                  'Professional voice synthesis with ElevenLabs',
                  'Multi-language support (10+ languages)',
                  'Seamless workflow from idea to publish',
                  'Enterprise-grade security & compliance',
                  'Real-time team collaboration'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-green-500/20">
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    </div>
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl p-8 border border-purple-500/20">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 mb-4">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-white">Beta Tester Benefits</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Join Early Access</h3>
                <p className="text-white/60 mb-6">
                  Get lifetime benefits and help shape the future of content creation
                </p>
                <Link to="/genie-studio-auth?tab=signup">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social & CTA Section */}
      <section className="py-20 px-4 bg-black/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Join thousands of creators, businesses, and enterprises using Genie Suite to transform their content workflow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/genie-studio-pricing">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                View Pricing Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/genie-studio-auth">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-white/40 text-sm">Follow us:</span>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5 text-white/60 hover:text-white" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={genieSuiteLogo} alt="Genie Suite" className="h-6 w-auto" />
              <span className="text-white/60 text-sm">© 2025 Genie AI Suite. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="mailto:support@genieaisuite.com" className="hover:text-white transition-colors flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GenieStudioLanding;
