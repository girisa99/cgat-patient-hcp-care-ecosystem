import React from 'react';
import { Check, TrendingUp, Shield, Globe, Brain, Zap, Users, BarChart3 } from 'lucide-react';

/**
 * Enterprise-Grade PDF-Ready One-Pager: Genie Studio Suite Overview
 * Design: McKinsey/Bain-inspired enterprise credibility style
 * Format: A4/Letter (816x1056px at 96 DPI)
 */
export const GenieStudioOnePager: React.FC = () => {
  return (
    <div 
      className="bg-white text-slate-900 max-w-[816px] mx-auto font-sans"
      style={{ minHeight: '1056px', padding: '40px 48px' }}
      data-pdf-page="genie-studio-overview"
    >
      {/* Enterprise Header */}
      <header className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🧞</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">GENIE STUDIO</h1>
            <p className="text-sm font-medium text-slate-600 tracking-wide uppercase">AI-Native Media Production Platform</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Executive Brief</div>
          <div className="text-xs text-slate-400">January 2026</div>
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-6">
        <div className="bg-slate-50 border-l-4 border-slate-900 p-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Executive Summary</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Genie Suite consolidates 5-6 disparate content tools into a unified AI-native platform, 
            delivering <span className="font-semibold">80% faster production times</span> and{' '}
            <span className="font-semibold">50-70% cost reduction</span>. The platform serves creators, 
            SMBs, and enterprises with 107+ AI pipelines, 70+ language dubbing, and HIPAA-ready compliance.
          </p>
        </div>
      </section>

      {/* Key Metrics Row */}
      <section className="grid grid-cols-4 gap-3 mb-6">
        {[
          { value: '107+', label: 'AI Pipelines', sublabel: 'Transformation workflows' },
          { value: '70+', label: 'Languages', sublabel: 'Dubbing & TTS' },
          { value: '80%', label: 'Faster', sublabel: 'Production time' },
          { value: '50-70%', label: 'Savings', sublabel: 'vs. tool stacks' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3 border border-slate-200 rounded-lg bg-white">
            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-700">{stat.label}</div>
            <div className="text-[10px] text-slate-500">{stat.sublabel}</div>
          </div>
        ))}
      </section>

      {/* Two Column Main Content */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left Column - Product Suite */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="h-3 w-3" /> Integrated Product Suite
          </h3>
          <div className="space-y-2">
            {[
              { icon: '✨', name: 'Spark', desc: 'AI script generation & ideation' },
              { icon: '🧠', name: 'Mind', desc: 'RAG knowledge base & context memory' },
              { icon: '🎬', name: 'Vibe', desc: 'Recording, editing, dubbing (70+ langs)' },
              { icon: '🎯', name: 'Arc', desc: 'Production pipeline & team orchestration' },
              { icon: '📊', name: 'Deck', desc: 'AI presentations (120+ export locales)' },
              { icon: '🧞', name: 'Ask Genie', desc: 'Natural language AI assistant' },
            ].map((product) => (
              <div key={product.name} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-lg">{product.icon}</span>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-slate-900">{product.name}</span>
                  <span className="text-xs text-slate-600 ml-2">{product.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column - Differentiators */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield className="h-3 w-3" /> Strategic Differentiators
          </h3>
          <div className="space-y-3">
            {[
              { 
                icon: Globe, 
                title: '4-Zone AI Routing', 
                desc: 'Region-optimized models: Claude (West), Alibaba (CJK), Gemini (22 Indic langs), Azure (RTL)' 
              },
              { 
                icon: Brain, 
                title: 'Enterprise RAG', 
                desc: 'Upload brand guidelines → AI generates on-brand content automatically' 
              },
              { 
                icon: BarChart3, 
                title: 'Universal Export', 
                desc: '120+ language-font mappings with full CJK, RTL, Indic script support' 
              },
              { 
                icon: Shield, 
                title: 'Compliance Ready', 
                desc: 'HIPAA workflows, SOC2, SSO, white-label, custom retention' 
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-2">
                <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center shrink-0">
                  <item.icon className="h-3 w-3 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{item.title}</div>
                  <div className="text-[10px] text-slate-600 leading-tight">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Competitive Analysis Table */}
      <section className="mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp className="h-3 w-3" /> Competitive Analysis
        </h3>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-[10px]">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="text-left p-2 font-medium">Capability</th>
                <th className="text-center p-2 font-bold bg-slate-800">Genie Suite</th>
                <th className="text-center p-2 font-medium">CapCut</th>
                <th className="text-center p-2 font-medium">Descript</th>
                <th className="text-center p-2 font-medium">Synthesia</th>
                <th className="text-center p-2 font-medium">Canva</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Script-to-Video Pipeline', '✓', '—', '—', '○', '—'],
                ['70+ Language Dubbing', '✓', '—', '—', '✓', '—'],
                ['Knowledge Base (RAG)', '✓', '—', '—', '—', '—'],
                ['Auto Social Cuts', '✓', '○', '—', '—', '—'],
                ['Voice Cloning', '✓', '—', '○', '✓', '—'],
                ['HIPAA Compliance', '✓', '—', '—', '○', '—'],
                ['Unified Platform', '✓', '—', '—', '—', '—'],
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2 font-medium text-slate-700">{row[0]}</td>
                  <td className="p-2 text-center font-bold text-emerald-600 bg-emerald-50">{row[1]}</td>
                  <td className="p-2 text-center text-slate-400">{row[2]}</td>
                  <td className="p-2 text-center text-slate-400">{row[3]}</td>
                  <td className="p-2 text-center text-slate-400">{row[4]}</td>
                  <td className="p-2 text-center text-slate-400">{row[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[9px] text-slate-500 px-2 py-1 bg-slate-50 border-t">
            ✓ Full capability | ○ Partial | — Not available
          </div>
        </div>
      </section>

      {/* Pricing & ROI Row */}
      <section className="grid grid-cols-2 gap-4 mb-6">
        {/* Pricing Tiers */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pricing Structure</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { tier: 'Starter', price: '$9.99', feature: '5 dubs/mo' },
              { tier: 'Business', price: '$29.99', feature: '20 dubs/mo' },
              { tier: 'Pro', price: '$79.99', feature: '100 dubs/mo' },
              { tier: 'Enterprise', price: 'Custom', feature: 'Unlimited' },
            ].map((plan) => (
              <div key={plan.tier} className="p-2 border border-slate-200 rounded bg-white text-center">
                <div className="text-[10px] font-semibold text-slate-500">{plan.tier}</div>
                <div className="text-sm font-bold text-slate-900">{plan.price}</div>
                <div className="text-[9px] text-slate-500">{plan.feature}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Savings */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cost Savings vs. Competitors</h3>
          <div className="space-y-1">
            {[
              { competitor: 'vs. Synthesia Teams', savings: '72% cheaper', detail: '$67 → $29/mo' },
              { competitor: 'vs. HeyGen Business', savings: '12x more dubs', detail: '8 → 100 dubs' },
              { competitor: 'vs. Tool Stack', savings: '50%+ cheaper', detail: '$200+ → $79/mo' },
            ].map((item) => (
              <div key={item.competitor} className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded">
                <span className="text-[10px] text-slate-700">{item.competitor}</span>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700">{item.savings}</span>
                  <span className="text-[9px] text-slate-500 ml-1">({item.detail})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Segments */}
      <section className="mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Users className="h-3 w-3" /> Target Segments
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {[
            { segment: 'Creators', hook: 'Idea → Published: 10 min' },
            { segment: 'SMBs', hook: 'Enterprise quality, startup budget' },
            { segment: 'Healthcare', hook: 'HIPAA + 70 language dubbing' },
            { segment: 'Education', hook: 'Lectures → Engaging videos' },
            { segment: 'Enterprise', hook: 'Consumer UX, enterprise security' },
          ].map((item) => (
            <div key={item.segment} className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
              <div className="text-[10px] font-semibold text-slate-900">{item.segment}</div>
              <div className="text-[9px] text-slate-600">{item.hook}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-slate-900 text-white rounded-lg p-4 text-center mb-4">
        <p className="text-sm font-semibold mb-1">Transform Your Content Production</p>
        <p className="text-xs opacity-80">One platform. 80% faster. 50-70% cost savings.</p>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs">
          <span>🌐 geniestudio.ai</span>
          <span>📧 hello@geniestudio.ai</span>
          <span>📞 Schedule Demo</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-[9px] text-slate-400 border-t border-slate-200 pt-2">
        © 2026 Genie Suite Inc. | Confidential | Not for Distribution
      </footer>
    </div>
  );
};

export default GenieStudioOnePager;
