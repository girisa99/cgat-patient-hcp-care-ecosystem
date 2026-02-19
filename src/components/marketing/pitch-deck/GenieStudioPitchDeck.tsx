import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize2,
  Check,
  X,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Layers,
  Globe,
  Shield,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SlideProps {
  children: React.ReactNode;
  slideNumber?: number;
  totalSlides?: number;
}

/**
 * Enterprise-Grade Slide Component
 * McKinsey/Bain-inspired design with proper visual hierarchy
 */
const Slide: React.FC<SlideProps> = ({ children, slideNumber, totalSlides }) => (
  <div 
    className="aspect-[16/9] bg-white rounded-lg overflow-hidden flex flex-col font-sans"
    style={{ minHeight: '450px' }}
    data-slide
  >
    {children}
    {slideNumber && (
      <div className="absolute bottom-3 right-4 text-[10px] text-slate-400">
        {slideNumber} / {totalSlides}
      </div>
    )}
  </div>
);

const SlideHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="px-10 pt-8 pb-4">
    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
    {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
    <div className="w-16 h-1 bg-slate-900 mt-3" />
  </div>
);

export const GenieStudioPitchDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!deckRef.current) return;
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 720],
      });

      const slideElements = deckRef.current.querySelectorAll('[data-slide]');
      
      for (let i = 0; i < slideElements.length; i++) {
        const slideEl = slideElements[i] as HTMLElement;
        const canvas = await html2canvas(slideEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        
        if (i > 0) pdf.addPage();
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
      }
      
      pdf.save('Genie-Studio-Investor-Pitch-Deck.pdf');
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const slides = [
    // Slide 1: Title Slide
    <Slide key="title">
      <div className="flex-1 flex">
        {/* Left side - Content */}
        <div className="flex-1 flex flex-col justify-center px-12">
          <div className="mb-6">
            <span className="text-5xl">🧞</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">GENIE STUDIO</h1>
          <p className="text-xl text-slate-600 mb-6">Mind to Media</p>
          <div className="w-20 h-1 bg-slate-900 mb-6" />
          <p className="text-lg text-slate-700 mb-8">
            The AI-Native Media Production Platform
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <span>Investor Presentation</span>
            <span>•</span>
            <span>January 2026</span>
            <span>•</span>
            <span>Confidential</span>
          </div>
        </div>
        {/* Right side - Stats preview */}
        <div className="w-80 bg-slate-900 flex flex-col justify-center px-8">
          <div className="space-y-6 text-white">
            <div>
              <div className="text-3xl font-bold">107+</div>
              <div className="text-sm text-slate-400">AI Pipelines</div>
            </div>
            <div>
              <div className="text-3xl font-bold">70+</div>
              <div className="text-sm text-slate-400">Languages</div>
            </div>
            <div>
              <div className="text-3xl font-bold">80%</div>
              <div className="text-sm text-slate-400">Faster Production</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50-70%</div>
              <div className="text-sm text-slate-400">Cost Savings</div>
            </div>
          </div>
        </div>
      </div>
    </Slide>,

    // Slide 2: The Problem
    <Slide key="problem">
      <SlideHeader title="The Problem" subtitle="Content creation is fragmented, expensive, and slow" />
      <div className="flex-1 px-10 pb-8">
        <div className="grid grid-cols-2 gap-8 h-full">
          {/* Left - Tool Fragmentation */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Tool Overload</h3>
            <p className="text-sm text-slate-600 mb-4">
              The average creator uses <span className="font-bold text-slate-900">5-6 different tools</span> to produce one video:
            </p>
            <div className="space-y-2">
              {[
                { tool: 'Canva', purpose: 'Graphics & thumbnails', cost: '$13/mo' },
                { tool: 'Descript', purpose: 'Video editing', cost: '$24/mo' },
                { tool: 'VidIQ', purpose: 'SEO optimization', cost: '$8/mo' },
                { tool: 'Buffer', purpose: 'Social scheduling', cost: '$15/mo' },
                { tool: 'Synthesia', purpose: 'AI avatars', cost: '$67/mo' },
                { tool: 'ElevenLabs', purpose: 'Voice synthesis', cost: '$22/mo' },
              ].map((item) => (
                <div key={item.tool} className="flex items-center gap-3 p-2 bg-red-50 border border-red-100 rounded">
                  <X className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-700 flex-1">{item.tool}</span>
                  <span className="text-[10px] text-slate-500">{item.purpose}</span>
                  <span className="text-xs font-bold text-red-600">{item.cost}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right - Impact Metrics */}
          <div className="bg-slate-900 rounded-lg p-6 flex flex-col justify-center">
            <div className="text-white space-y-6">
              <div>
                <div className="text-4xl font-bold text-red-400">$149+</div>
                <div className="text-sm text-slate-400">Monthly tool costs (combined)</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-400">6+</div>
                <div className="text-sm text-slate-400">Separate learning curves</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-400">8+ hrs</div>
                <div className="text-sm text-slate-400">Per video production</div>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 italic">
                  "I spend more time switching between tools than actually creating content."
                </p>
                <p className="text-[10px] text-slate-500 mt-1">— Content Creator Survey, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>,

    // Slide 3: The Solution
    <Slide key="solution">
      <SlideHeader title="The Solution" subtitle="One platform that replaces your entire content stack" />
      <div className="flex-1 px-10 pb-8">
        <div className="grid grid-cols-2 gap-8 h-full">
          {/* Left - Value Propositions */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">End-to-End Capabilities</h3>
            <div className="space-y-3">
              {[
                { icon: '✏️', text: 'Write scripts with AI that understands your brand', highlight: 'RAG Knowledge Base' },
                { icon: '🎬', text: 'Record with professional teleprompter & studio tools', highlight: 'One-Take Quality' },
                { icon: '🌍', text: 'Dub in 70+ languages with native-quality voices', highlight: 'AI Lip-Sync' },
                { icon: '📱', text: 'Auto-generate thumbnails, SEO tags, and social cuts', highlight: 'Multi-Platform' },
                { icon: '🚀', text: 'Publish to all platforms simultaneously', highlight: 'One Click' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{item.text}</p>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-1 inline-block">
                      {item.highlight}
                    </span>
                  </div>
                  <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Right - Key Metrics */}
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 bg-slate-900 rounded-lg text-white">
                <div className="text-4xl font-bold">1</div>
                <div className="text-sm text-slate-300">Unified Platform</div>
              </div>
              <div className="text-center p-6 bg-slate-900 rounded-lg text-white">
                <div className="text-4xl font-bold">80%</div>
                <div className="text-sm text-slate-300">Faster Production</div>
              </div>
              <div className="text-center p-6 bg-slate-900 rounded-lg text-white">
                <div className="text-4xl font-bold">50-70%</div>
                <div className="text-sm text-slate-300">Cost Savings</div>
              </div>
              <div className="text-center p-6 bg-slate-900 rounded-lg text-white">
                <div className="text-4xl font-bold">45min</div>
                <div className="text-sm text-slate-300">Avg. Time-to-Publish</div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-emerald-100 border border-emerald-200 rounded-lg text-center">
              <p className="text-sm text-slate-700">
                <span className="font-bold">Result:</span> 8 hours → 45 minutes per video
              </p>
            </div>
          </div>
        </div>
      </div>
    </Slide>,

    // Slide 4: Product Suite
    <Slide key="products">
      <SlideHeader title="The 6-Product Ecosystem" subtitle="Integrated tools that work seamlessly together" />
      <div className="flex-1 px-10 pb-8">
        <div className="grid grid-cols-3 gap-4 h-full">
          {[
            { icon: '✨', name: 'Spark', tagline: 'Ignite Ideas', desc: 'AI script generation, ideation, story development' },
            { icon: '🧠', name: 'Mind', tagline: 'AI Intelligence', desc: 'RAG knowledge base, context memory, brand learning' },
            { icon: '🎬', name: 'Vibe', tagline: 'Script to Screen', desc: 'Recording, editing, 70+ lang dubbing, lip-sync' },
            { icon: '🎯', name: 'Arc', tagline: 'Production Hub', desc: 'Scheduling, team collab, workflow orchestration' },
            { icon: '📊', name: 'Deck', tagline: 'Ideas to Impact', desc: 'AI presentations, 120+ lang export, smart design' },
            { icon: '🧞', name: 'Ask Genie', tagline: 'AI Assistant', desc: 'Natural language control, cross-product automation' },
          ].map((product) => (
            <div key={product.name} className="p-4 border-2 border-slate-200 rounded-lg hover:border-slate-400 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <span className="text-xl">{product.icon}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Genie {product.name}</h4>
                  <p className="text-[10px] text-slate-500">{product.tagline}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{product.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <Layers className="h-4 w-4" />
            All products share the same AI intelligence, brand context, and user preferences
          </p>
        </div>
      </div>
    </Slide>,

    // Slide 5: Key Differentiators
    <Slide key="differentiators">
      <SlideHeader title="Strategic Differentiators" subtitle="Technical moats that competitors cannot easily replicate" />
      <div className="flex-1 px-10 pb-8">
        <div className="grid grid-cols-2 gap-6 h-full">
          {[
            { 
              icon: Globe, 
              title: '4-Zone Intelligent AI Routing', 
              desc: 'Region-optimized AI models for native quality',
              details: [
                'Claude for Western markets (nuanced English)',
                'Alibaba for CJK (native Japanese Keigo, Chinese)',
                'Gemini for Indic (22 Indian languages)',
                'Azure for Arabic dialects (Egyptian, Gulf, Moroccan)',
              ],
              color: 'blue'
            },
            { 
              icon: Shield, 
              title: 'Enterprise RAG Knowledge Base', 
              desc: 'AI that learns your brand automatically',
              details: [
                'Upload brand guidelines → on-brand content',
                'Upload past work → consistent style',
                'Upload research → subject matter expertise',
                'Secure, isolated per-customer data',
              ],
              color: 'purple'
            },
            { 
              icon: Layers, 
              title: 'Universal Export Engine', 
              desc: '120+ language-font mappings with full preservation',
              details: [
                'CJK, RTL, Indic, African scripts',
                'DOM-capture preserves 3D, animations',
                'PPTX, PDF, MP4, HTML, JSON formats',
                'Editable vector graphics in exports',
              ],
              color: 'emerald'
            },
            { 
              icon: Target, 
              title: '107+ AI Transformation Pipelines', 
              desc: 'Comprehensive content workflows',
              details: [
                'Script → Video (15 variations)',
                'Document → Presentation (auto-slides)',
                'Long-form → Social cuts (auto-resize)',
                'Voice → 70+ lang dubs (lip-sync)',
              ],
              color: 'amber'
            },
          ].map((item) => (
            <div key={item.title} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[10px] text-slate-500">{item.desc}</p>
                </div>
              </div>
              <div className="space-y-1 ml-13">
                {item.details.map((detail, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-slate-600">
                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>,

    // Slide 6: Competitive Landscape
    <Slide key="competition">
      <SlideHeader title="Competitive Landscape" subtitle="Genie Suite vs. point solutions" />
      <div className="flex-1 px-10 pb-8 overflow-hidden">
        <div className="h-full flex flex-col">
          <table className="w-full text-xs flex-1">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left p-3 font-medium">Capability</th>
                <th className="text-center p-3 font-bold bg-slate-800">Genie Suite</th>
                <th className="text-center p-3 font-medium">CapCut</th>
                <th className="text-center p-3 font-medium">Descript</th>
                <th className="text-center p-3 font-medium">Synthesia</th>
                <th className="text-center p-3 font-medium">Canva</th>
                <th className="text-center p-3 font-medium">Loom</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Script-to-Video Pipeline', '✓', '—', '—', '○', '—', '—'],
                ['70+ Language Dubbing', '✓', '—', '—', '✓', '—', '—'],
                ['AI Lip-Sync Technology', '✓', '—', '○', '✓', '—', '—'],
                ['Knowledge Base (RAG)', '✓', '—', '—', '—', '—', '—'],
                ['Auto Social Cuts', '✓', '○', '—', '—', '—', '—'],
                ['Voice Cloning', '✓', '—', '○', '✓', '—', '—'],
                ['Multi-Platform Publishing', '✓', '○', '—', '—', '○', '○'],
                ['HIPAA Compliance', '✓', '—', '—', '○', '—', '—'],
                ['Unified End-to-End', '✓', '—', '—', '—', '—', '—'],
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2 font-medium text-slate-700 border-b border-slate-100">{row[0]}</td>
                  <td className="p-2 text-center font-bold text-emerald-600 bg-emerald-50 border-b border-emerald-100">{row[1]}</td>
                  <td className="p-2 text-center text-slate-400 border-b border-slate-100">{row[2]}</td>
                  <td className="p-2 text-center text-slate-400 border-b border-slate-100">{row[3]}</td>
                  <td className="p-2 text-center text-slate-400 border-b border-slate-100">{row[4]}</td>
                  <td className="p-2 text-center text-slate-400 border-b border-slate-100">{row[5]}</td>
                  <td className="p-2 text-center text-slate-400 border-b border-slate-100">{row[6]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-2">
            <div className="text-[10px] text-slate-500">
              ✓ Full capability | ○ Partial | — Not available
            </div>
            <div className="text-[10px] font-medium text-slate-700">
              Genie replaces <span className="text-emerald-600">5-6 tools</span> with <span className="text-emerald-600">one platform</span>
            </div>
          </div>
        </div>
      </div>
    </Slide>,

    // Slide 7: Market Opportunity
    <Slide key="market">
      <SlideHeader title="Market Opportunity" subtitle="A massive and growing addressable market" />
      <div className="flex-1 px-10 pb-8">
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="text-center p-6 bg-slate-900 rounded-lg text-white">
            <TrendingUp className="h-8 w-8 mx-auto mb-3 text-slate-400" />
            <div className="text-3xl font-bold">$15B+</div>
            <div className="text-sm text-slate-400">Video Creation Market</div>
            <div className="text-xs text-emerald-400 mt-1">15% CAGR</div>
          </div>
          <div className="text-center p-6 bg-slate-900 rounded-lg text-white">
            <Users className="h-8 w-8 mx-auto mb-3 text-slate-400" />
            <div className="text-3xl font-bold">50M+</div>
            <div className="text-sm text-slate-400">Content Creators</div>
            <div className="text-xs text-emerald-400 mt-1">Globally</div>
          </div>
          <div className="text-center p-6 bg-slate-900 rounded-lg text-white">
            <DollarSign className="h-8 w-8 mx-auto mb-3 text-slate-400" />
            <div className="text-3xl font-bold">$200+</div>
            <div className="text-sm text-slate-400">Avg Monthly Tool Spend</div>
            <div className="text-xs text-emerald-400 mt-1">Per creator</div>
          </div>
        </div>
        
        {/* TAM/SAM/SOM */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border-2 border-slate-300 rounded-lg text-center">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">TAM</div>
            <div className="text-2xl font-bold text-slate-900">$15B</div>
            <div className="text-[10px] text-slate-600">Total video/content creation market</div>
          </div>
          <div className="p-4 border-2 border-slate-400 rounded-lg text-center">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SAM</div>
            <div className="text-2xl font-bold text-slate-900">$3B</div>
            <div className="text-[10px] text-slate-600">AI-powered creation tools segment</div>
          </div>
          <div className="p-4 border-2 border-slate-900 rounded-lg text-center bg-slate-50">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SOM</div>
            <div className="text-2xl font-bold text-slate-900">$360M</div>
            <div className="text-[10px] text-slate-600">1M users × $30 ARPU target</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
          <p className="text-sm text-slate-700">
            <span className="font-bold">Conservative Target:</span> Capture 2% of global creators = 
            <span className="font-bold text-emerald-700"> 1M users × $30 ARPU = $360M ARR</span>
          </p>
        </div>
      </div>
    </Slide>,

    // Slide 8: Business Model
    <Slide key="pricing">
      <SlideHeader title="Business Model" subtitle="Tiered SaaS pricing with strong unit economics" />
      <div className="flex-1 px-10 pb-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Pricing Tiers */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pricing Tiers</h3>
            <div className="space-y-2">
              {[
                { tier: 'Free', price: '$0', target: 'Try-before-buy', features: '5 exports/mo, watermark' },
                { tier: 'Starter', price: '$9.99', target: 'Solo creators', features: '5 dubs/mo, no watermark' },
                { tier: 'Business', price: '$29.99', target: 'Teams', features: '20 dubs/mo, collaboration' },
                { tier: 'Pro', price: '$79.99', target: 'Agencies', features: '100 dubs/mo, voice clone, API' },
                { tier: 'Enterprise', price: 'Custom', target: 'Corporations', features: 'Unlimited, HIPAA, white-label' },
              ].map((plan) => (
                <div key={plan.tier} className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="w-20">
                    <div className="text-xs font-bold text-slate-900">{plan.tier}</div>
                    <div className="text-sm font-bold text-slate-700">{plan.price}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-medium text-slate-600">{plan.target}</div>
                    <div className="text-[10px] text-slate-500">{plan.features}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Unit Economics */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Unit Economics</h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-900 rounded-lg text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">$30</div>
                    <div className="text-[10px] text-slate-400">Blended ARPU</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">75%+</div>
                    <div className="text-[10px] text-slate-400">Gross Margin</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">5:1</div>
                    <div className="text-[10px] text-slate-400">Target LTV:CAC</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{"<3%"}</div>
                    <div className="text-[10px] text-slate-400">Monthly Churn Target</div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">Pricing vs. Competitors</h3>
              <div className="space-y-1">
                {[
                  { vs: 'Synthesia Teams ($67)', save: '72% cheaper', ours: '$29' },
                  { vs: 'HeyGen Business ($149)', save: '12x more dubs', ours: '$79' },
                  { vs: 'Tool Stack ($200+)', save: '50%+ savings', ours: '$79' },
                ].map((item) => (
                  <div key={item.vs} className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded text-[10px]">
                    <span className="text-slate-600">{item.vs}</span>
                    <span className="font-bold text-emerald-700">{item.save}</span>
                    <span className="font-bold text-slate-900">{item.ours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>,

    // Slide 9: Thank You / CTA
    <Slide key="cta">
      <div className="flex-1 flex">
        {/* Left side - CTA */}
        <div className="flex-1 flex flex-col justify-center px-12">
          <div className="mb-6">
            <span className="text-5xl">🚀</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Let's Transform Content Creation Together
          </h2>
          <div className="w-20 h-1 bg-slate-900 mb-6" />
          <p className="text-lg text-slate-600 mb-8">
            One platform. 80% faster. 50-70% cost savings.
          </p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🌐</span>
              </div>
              <span className="text-slate-700">geniestudio.ai</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📧</span>
              </div>
              <span className="text-slate-700">hello@geniestudio.ai</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📅</span>
              </div>
              <span className="text-slate-700">Schedule a demo</span>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg text-sm font-medium">
            Thank You
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
        
        {/* Right side - Summary Stats */}
        <div className="w-80 bg-slate-900 flex flex-col justify-center px-8">
          <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Key Takeaways</h3>
          <div className="space-y-4 text-white">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">Replaces 5-6 tools with one unified platform</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">80% faster production, 50-70% cost savings</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">107+ AI pipelines, 70+ languages</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">4-zone AI routing for native quality</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">$360M ARR target (2% market capture)</p>
            </div>
          </div>
        </div>
      </div>
    </Slide>,
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-500 px-2 font-medium">
            Slide {currentSlide + 1} of {slides.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Current Slide Display */}
      <div ref={deckRef} className="border rounded-lg overflow-hidden shadow-lg">
        {slides[currentSlide]}
      </div>

      {/* Hidden slides for PDF export */}
      <div className="hidden">
        {slides.map((slide, index) => (
          <div key={index}>{slide}</div>
        ))}
      </div>

      {/* Slide Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`shrink-0 w-28 aspect-[16/9] rounded border-2 overflow-hidden transition-all ${
              currentSlide === index 
                ? 'border-slate-900 ring-2 ring-slate-900/20' 
                : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
            }`}
          >
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600">{index + 1}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenieStudioPitchDeck;
