/**
 * REGIONAL SHOWCASE SECTION
 * 
 * Visual "See It In Action" cards showing region-specific
 * input → pipeline → output examples + first-to-market differentiators.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Trophy, Zap, CheckCircle2, 
  Sparkles, Globe, ChevronRight 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { RegionalConfig, RegionalShowcaseExample } from '@/config/regionalLandingConfig';

interface RegionalShowcaseSectionProps {
  config: RegionalConfig;
}

// ============================================
// DIFFERENTIATOR BADGES
// ============================================
const DifferentiatorStrip: React.FC<{ config: RegionalConfig }> = ({ config }) => {
  const { differentiators } = config;
  
  return (
    <div className="space-y-6">
      {/* First-to-Market Claims */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">First to Market</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {differentiators.firstToMarket.map((claim, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
            >
              <Trophy className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
              <span className="text-sm text-foreground">{claim}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Capability Depth Claims */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Only Here</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {differentiators.capabilityDepth.map((claim, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="flex items-start gap-2 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl"
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
// SHOWCASE CARD
// ============================================
const ShowcaseCard: React.FC<{ example: RegionalShowcaseExample; index: number }> = ({ example, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="h-full border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-6 space-y-4">
        {/* Industry Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{example.icon}</span>
            <h4 className="font-bold text-foreground">{example.industry}</h4>
          </div>
          <Badge variant="secondary" className="text-[10px] font-medium bg-primary/10 text-primary border-primary/20">
            See It In Action
          </Badge>
        </div>

        {/* Pipeline Flow */}
        <div className="space-y-3">
          {/* Input */}
          <div className="flex items-start gap-3">
            <div className="w-16 shrink-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Input</div>
            <div className="flex-1 px-3 py-2 bg-muted/50 rounded-lg text-sm text-foreground">
              {example.input}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-2 pl-16">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-accent/30" />
            <ChevronRight className="h-4 w-4 text-primary animate-pulse" />
            <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-primary/30" />
          </div>

          {/* Pipeline */}
          <div className="flex items-start gap-3">
            <div className="w-16 shrink-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Pipeline</div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-1">
                {example.pipeline.split(' → ').map((step, i, arr) => (
                  <React.Fragment key={i}>
                    <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary font-semibold">
                      {step}
                    </Badge>
                    {i < arr.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground self-center" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-2 pl-16">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-green-500/30" />
            <ChevronRight className="h-4 w-4 text-green-500 animate-pulse" />
            <div className="h-px flex-1 bg-gradient-to-r from-green-500/30 to-primary/30" />
          </div>

          {/* Output */}
          <div className="flex items-start gap-3">
            <div className="w-16 shrink-0 text-[11px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mt-0.5">Output</div>
            <div className="flex-1 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-foreground font-medium">
              {example.output}
            </div>
          </div>
        </div>

        {/* Footer: Languages + Impact */}
        <div className="pt-3 border-t border-border/50 space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{example.languages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">{example.impact}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export const RegionalShowcaseSection: React.FC<RegionalShowcaseSectionProps> = ({ config }) => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20">
            <Trophy className="h-3 w-3 mr-1" />
            {config.differentiators.heroBadge}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            See It In Action — {config.hero.regionName}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Real-world examples of how Genie Suite transforms content for{' '}
            <span className="text-primary font-semibold">{config.hero.regionName}</span> industries
          </p>
        </motion.div>

        {/* Differentiator Claims */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <DifferentiatorStrip config={config} />
        </motion.div>

        {/* Showcase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.showcaseExamples.map((example, index) => (
            <ShowcaseCard key={index} example={example} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">
            These are just examples — Genie Suite supports <strong>50+ industries</strong> across{' '}
            <strong>50+ languages, 140+ dialects</strong>. Your content, your market, your language.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default RegionalShowcaseSection;
