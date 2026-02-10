/**
 * EVERYTHING YOU NEED SECTION
 * 
 * Unified section consolidating:
 * 1. First-to-Market + Only Here differentiators
 * 2. See It In Action — region-specific input→output showcase cards
 * 3. Transcreation vs Translation — side-by-side comparison
 * 
 * Same structure across all 8 regions, populated from regional config.
 * Tagline: "Everything You Need. Nothing You Don't."
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Zap, CheckCircle2, Sparkles, Globe,
  ChevronRight, ArrowRight, Volume2, Eye, Languages,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { RegionalConfig, RegionalShowcaseExample } from '@/config/regionalLandingConfig';

interface EverythingYouNeedSectionProps {
  config: RegionalConfig;
}

// ============================================
// TAB 1: WHY GENIE — Differentiators
// ============================================
const WhyGenieTab: React.FC<{ config: RegionalConfig }> = ({ config }) => {
  const { differentiators } = config;

  return (
    <div className="space-y-8">
      {/* Value Banner */}
      <div className="p-6 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl border border-primary/20 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          We Speak Your Language. We Understand Your Market.
        </h3>
        <p className="text-muted-foreground max-w-3xl mx-auto mb-4">
          Your content deserves more than word-for-word translation. Genie adapts tone, idioms, cultural references,
          and regional compliance — so your audience feels you were{' '}
          <span className="text-primary font-semibold">built for them</span>.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium">🗣️ 140+ Languages</span>
          <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium">🌍 8 Regions</span>
          <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium">🎯 Cultural Context</span>
          <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium">📋 Regional Compliance</span>
        </div>
      </div>

      {/* First to Market */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">First to Market</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {differentiators.firstToMarket.map((claim, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-2.5 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
            >
              <Trophy className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
              <span className="text-sm text-foreground">{claim}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Only Here */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Only Here</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {differentiators.capabilityDepth.map((claim, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 + 0.15 }}
              className="flex items-start gap-2.5 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl"
            >
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-foreground">{claim}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// TAB 2: SEE IT IN ACTION — Showcase Cards
// ============================================
const ShowcaseCard: React.FC<{ example: RegionalShowcaseExample; index: number }> = ({ example, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
  >
    <Card className="h-full border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{example.icon}</span>
          <h4 className="font-bold text-foreground text-sm">{example.industry}</h4>
        </div>

        {/* Input */}
        <div className="flex items-start gap-2">
          <span className="w-14 shrink-0 text-[10px] font-semibold text-muted-foreground uppercase mt-1">Input</span>
          <div className="flex-1 px-3 py-1.5 bg-muted/50 rounded-lg text-xs text-foreground">{example.input}</div>
        </div>

        {/* Pipeline */}
        <div className="flex items-center gap-2 pl-14">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-accent/30" />
          <ChevronRight className="h-3 w-3 text-primary" />
        </div>
        <div className="flex items-start gap-2">
          <span className="w-14 shrink-0 text-[10px] font-semibold text-muted-foreground uppercase mt-1">Pipeline</span>
          <div className="flex flex-wrap gap-1">
            {example.pipeline.split(' → ').map((step, i, arr) => (
              <React.Fragment key={i}>
                <Badge variant="outline" className="text-[9px] bg-primary/5 border-primary/20 text-primary font-semibold px-1.5 py-0.5">
                  {step}
                </Badge>
                {i < arr.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground self-center" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="flex items-center gap-2 pl-14">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-green-500/30" />
          <ChevronRight className="h-3 w-3 text-green-500" />
        </div>
        <div className="flex items-start gap-2">
          <span className="w-14 shrink-0 text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase mt-1">Output</span>
          <div className="flex-1 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-foreground font-medium">
            {example.output}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground flex items-center gap-1">
            <Globe className="h-3 w-3" /> {example.languages}
          </span>
          <span className="text-yellow-600 dark:text-yellow-400 font-semibold flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> {example.impact}
          </span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const SeeItInActionTab: React.FC<{ config: RegionalConfig }> = ({ config }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {config.showcaseExamples.map((example, index) => (
      <ShowcaseCard key={index} example={example} index={index} />
    ))}
  </div>
);

// ============================================
// TAB 3: TRANSCREATION vs TRANSLATION
// ============================================
const TranscreationTab: React.FC<{ config: RegionalConfig }> = ({ config }) => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-6">
      <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
        Real examples from <span className="text-primary font-semibold">{config.hero.regionName}</span> — 
        notice how Genie preserves intent, not just words.
      </p>
    </div>

    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="bg-muted/50 px-6 py-3 border-b border-border flex items-center justify-between">
        <h4 className="font-semibold text-foreground text-sm">{config.languageShowcase.tabLabel}</h4>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" /> Transcreated
          </span>
          <span className="flex items-center gap-1 text-destructive">
            ✗ Literal
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {config.languageShowcase.languages.map((lang, i) => (
          <motion.div
            key={lang.code}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">{lang.nativeName}</span>
                <Badge variant="outline" className="text-[10px]">{lang.region}</Badge>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                <Volume2 className="h-3 w-3 mr-1" />
                {lang.azureVoice.split('-').slice(0, 2).join('-')}
              </Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase mb-1">✓ Transcreated</p>
                <p className={`text-sm text-foreground ${config.hero.isRTL ? 'text-right' : ''}`}>
                  {lang.transcreation}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-destructive uppercase mb-1">✗ Literal Translation</p>
                <p className={`text-sm text-muted-foreground line-through ${config.hero.isRTL ? 'text-right' : ''}`}>
                  {lang.literal}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================
// MAIN UNIFIED SECTION
// ============================================
export const EverythingYouNeedSection: React.FC<EverythingYouNeedSectionProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState('why-genie');

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20">
            <Trophy className="h-3 w-3 mr-1" />
            {config.differentiators.heroBadge}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Everything You Need. Nothing You Don't.
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            One platform — from idea to globally distributed content in{' '}
            <span className="text-primary font-semibold">140+ languages</span>.
            See why teams in <span className="text-primary font-semibold">{config.hero.regionName}</span> choose Genie.
          </p>
        </motion.div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-1 bg-card border border-border rounded-xl mb-8 grid grid-cols-3 gap-1">
            <TabsTrigger
              value="why-genie"
              className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-semibold"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Why Genie</span>
              <span className="sm:hidden">Why</span>
            </TabsTrigger>
            <TabsTrigger
              value="see-it"
              className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-semibold"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">See It In Action</span>
              <span className="sm:hidden">In Action</span>
            </TabsTrigger>
            <TabsTrigger
              value="transcreation"
              className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-semibold"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">Transcreation vs Translation</span>
              <span className="sm:hidden">Compare</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="why-genie" className="mt-0">
            <WhyGenieTab config={config} />
          </TabsContent>

          <TabsContent value="see-it" className="mt-0">
            <SeeItInActionTab config={config} />
          </TabsContent>

          <TabsContent value="transcreation" className="mt-0">
            <TranscreationTab config={config} />
          </TabsContent>
        </Tabs>

        {/* Universal bottom note */}
        <motion.p
          className="text-center mt-10 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <strong>50+ industries</strong> · <strong>140+ languages</strong> · <strong>19 AI providers</strong> · 
          <strong> 206 pipelines</strong> — Your content, your market, your language.
        </motion.p>
      </div>
    </section>
  );
};

export default EverythingYouNeedSection;
