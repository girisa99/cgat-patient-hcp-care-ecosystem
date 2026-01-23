import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Globe, Brain, Users, Shield } from 'lucide-react';

/**
 * PDF-Ready One-Pager: Genie Studio Suite Overview
 * Designed for A4/Letter print at 96 DPI
 */
export const GenieStudioOnePager: React.FC = () => {
  return (
    <div 
      className="bg-background text-foreground p-8 max-w-[816px] mx-auto"
      style={{ minHeight: '1056px' }} // A4 proportion
      data-pdf-page="genie-studio-overview"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-primary">
        <div>
          <h1 className="text-3xl font-bold text-primary">Genie Studio</h1>
          <p className="text-lg text-muted-foreground">Mind to Media</p>
        </div>
        <div className="text-right">
          <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
            AI-Native Media Platform
          </Badge>
        </div>
      </div>

      {/* Hero Statement */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Create Once. Publish Everywhere.</h2>
        <p className="text-muted-foreground">
          The only platform that transforms ideas into professional content in minutes—consolidating 
          5-6 tools into one unified workspace with 80% faster production and 50-70% cost savings.
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { value: '107+', label: 'AI Pipelines' },
          { value: '70+', label: 'Languages' },
          { value: '80%', label: 'Faster' },
          { value: '50-70%', label: 'Cost Savings' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Product Suite */}
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" /> The 6-Product Ecosystem
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { name: 'Spark', tagline: 'Ignite Ideas', icon: '✨' },
          { name: 'Mind', tagline: 'AI Intelligence', icon: '🧠' },
          { name: 'Vibe', tagline: 'Script to Screen', icon: '🎬' },
          { name: 'Arc', tagline: 'Production Hub', icon: '🎯' },
          { name: 'Deck', tagline: 'Ideas to Impact', icon: '📊' },
          { name: 'Studio', tagline: 'Master Suite', icon: '🎨' },
        ].map((product) => (
          <div key={product.name} className="flex items-center gap-2 p-2 border rounded-md">
            <span className="text-xl">{product.icon}</span>
            <div>
              <div className="font-medium text-sm">{product.name}</div>
              <div className="text-xs text-muted-foreground">{product.tagline}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Core Differentiators */}
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" /> Why Genie Studio?
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { icon: Globe, title: '4-Zone AI Routing', desc: 'Best AI for each region: Claude (West), Alibaba (Asia), Gemini (India/SEA)' },
          { icon: Brain, title: 'Knowledge Base (RAG)', desc: 'Upload brand guidelines → AI writes on-brand content automatically' },
          { icon: Users, title: 'One Tool, Not Six', desc: 'Replaces Canva + Descript + VidIQ + Buffer + Synthesia' },
          { icon: Check, title: '120+ Export Locales', desc: 'Full CJK, RTL, Indic script support with native fonts' },
        ].map((item) => (
          <div key={item.title} className="flex gap-3">
            <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Competitive Edge */}
      <h3 className="text-lg font-semibold mb-3">Competitive Comparison</h3>
      <div className="overflow-hidden rounded-lg border mb-6">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 font-medium">Feature</th>
              <th className="text-center p-2 font-medium">Genie</th>
              <th className="text-center p-2 font-medium">CapCut</th>
              <th className="text-center p-2 font-medium">Descript</th>
              <th className="text-center p-2 font-medium">Synthesia</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Script-to-Video', 'Yes', 'No', 'No', 'Partial'],
              ['70+ Language Dubs', 'Yes', 'No', 'No', 'Yes'],
              ['Knowledge Base/RAG', 'Yes', 'No', 'No', 'No'],
              ['Auto Social Cuts', 'Yes', 'Partial', 'No', 'No'],
              ['HIPAA Ready', 'Yes', 'No', 'No', 'Partial'],
            ].map((row, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 font-medium">{row[0]}</td>
                <td className="p-2 text-center text-primary font-medium">{row[1]}</td>
                <td className="p-2 text-center text-muted-foreground">{row[2]}</td>
                <td className="p-2 text-center text-muted-foreground">{row[3]}</td>
                <td className="p-2 text-center">{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pricing Tiers */}
      <h3 className="text-lg font-semibold mb-3">Simple, Transparent Pricing</h3>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { tier: 'Starter', price: '$9.99', highlight: '5 dubs/mo' },
          { tier: 'Business', price: '$29.99', highlight: '20 dubs/mo' },
          { tier: 'Pro', price: '$79.99', highlight: '100 dubs/mo' },
          { tier: 'Enterprise', price: 'Custom', highlight: 'Unlimited' },
        ].map((plan) => (
          <div key={plan.tier} className="text-center p-3 border rounded-lg">
            <div className="font-medium">{plan.tier}</div>
            <div className="text-lg font-bold text-primary">{plan.price}</div>
            <div className="text-xs text-muted-foreground">{plan.highlight}</div>
          </div>
        ))}
      </div>

      {/* CTA Footer */}
      <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center">
        <p className="font-semibold mb-1">Ready to Transform Your Content Workflow?</p>
        <p className="text-sm opacity-90">Start free today → geniestudio.ai</p>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
        © 2026 Genie Studio | geniestudio.ai | hello@geniestudio.ai
      </div>
    </div>
  );
};

export default GenieStudioOnePager;
