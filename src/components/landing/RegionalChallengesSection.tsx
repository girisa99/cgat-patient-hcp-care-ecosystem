/**
 * Industry Challenges Section
 * 
 * Shows content-industry challenges that Genie Suite's 7 products solve.
 * Auto-rolling glassmorphic marquee, region-aware scroll direction.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video, Clock, Languages, TrendingUp, Layers,
  BarChart3, Mic, Globe, Megaphone, Sparkles,
  Presentation, Brain, Repeat, Users, Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RegionSlug } from '@/config/regionalLandingConfig';

interface ChallengeCardData {
  key: string;
  icon: React.ElementType;
  title: string;
  problem: string;
  growth: string;
  solver: string; // Which Genie product solves it
  gradient: string;
}

/**
 * Content-industry challenges mapped to Genie Suite products:
 * Spark, Mind, Vibe, Cast, Deck, Hub, Guide
 */
const CHALLENGE_CARDS: ChallengeCardData[] = [
  {
    key: 'video_production_cost',
    icon: Video,
    title: 'Video Production at Scale',
    problem: 'A single brand video costs $5K–$50K and takes 4–8 weeks. Scaling to 10 markets multiplies cost 10×.',
    growth: 'Video content demand growing 91% YoY — teams can\'t keep up with traditional production.',
    solver: 'Genie Cast',
    gradient: 'from-sky-500/80 to-cyan-600/80',
  },
  {
    key: 'content_velocity',
    icon: Clock,
    title: 'Speed-to-Market Gap',
    problem: 'Competitors publish 10× faster. By the time your content is approved, the trend has passed.',
    growth: 'Content lifecycle shrunk from 30 days to 72 hours — real-time production is the new baseline.',
    solver: 'Genie Spark',
    gradient: 'from-amber-500/80 to-orange-600/80',
  },
  {
    key: 'transcreation_not_translation',
    icon: Languages,
    title: 'Lost in Translation',
    problem: 'Direct translation destroys brand voice. Cultural nuance, humor, and idioms vanish — costing 40% engagement.',
    growth: '76% of consumers prefer buying in their own language — but only 6% of content is truly transcreated.',
    solver: 'Genie Vibe',
    gradient: 'from-violet-500/80 to-purple-600/80',
  },
  {
    key: 'multi_format_fragmentation',
    icon: Layers,
    title: '16-Format Fragmentation',
    problem: 'Teams use 8+ tools for video, podcast, PPT, social, email. Each has its own workflow, login, and billing.',
    growth: 'Average enterprise uses 12.3 content tools — integration tax eats 35% of creative bandwidth.',
    solver: 'Genie Hub',
    gradient: 'from-emerald-500/80 to-teal-600/80',
  },
  {
    key: 'podcast_explosion',
    icon: Mic,
    title: 'Audio-First Demand',
    problem: 'Podcasts and audio content drive 2× engagement but require expensive studios, editors, and hosts.',
    growth: 'Podcast ad revenue projected to hit $4B by 2026 — but production barriers lock out 80% of brands.',
    solver: 'Genie Cast',
    gradient: 'from-fuchsia-500/80 to-pink-600/80',
  },
  {
    key: 'data_driven_content',
    icon: BarChart3,
    title: 'Content Without Intelligence',
    problem: 'Most content is created on gut feeling. No competitive analysis, no market data, no audience signals.',
    growth: 'Data-driven content performs 3× better — but only 12% of teams have integrated analytics into creation.',
    solver: 'Genie Mind',
    gradient: 'from-blue-500/80 to-indigo-600/80',
  },
  {
    key: 'presentation_fatigue',
    icon: Presentation,
    title: 'Death by PowerPoint',
    problem: 'Teams spend 8+ hours per deck. Investor pitches, sales decks, onboarding — all manual, all outdated.',
    growth: '30M presentations created daily — AI-assisted decks close deals 2.4× faster.',
    solver: 'Genie Deck',
    gradient: 'from-rose-500/80 to-red-600/80',
  },
  {
    key: 'regional_content_gap',
    icon: Globe,
    title: 'Regional Content Desert',
    problem: 'Brands create for US/EU, then "localize" as afterthought. 85% of global audience gets second-class content.',
    growth: 'Emerging markets growing 3× faster than mature — but receive only 15% of content investment.',
    solver: 'Genie Vibe',
    gradient: 'from-teal-500/80 to-emerald-600/80',
  },
  {
    key: 'creator_economy_gap',
    icon: Users,
    title: 'Creator Bottleneck',
    problem: 'Finding creators who understand brand voice, compliance, AND cultural nuance is nearly impossible at scale.',
    growth: 'Creator economy hit $250B — but enterprise-grade AI creators are replacing freelancer dependency.',
    solver: 'Genie Guide',
    gradient: 'from-orange-500/80 to-amber-600/80',
  },
  {
    key: 'repurpose_waste',
    icon: Repeat,
    title: 'Content Repurposing Waste',
    problem: '90% of content is used once. A webinar could become 15 assets — but manual repurposing kills ROI.',
    growth: 'Repurposed content generates 3× the leads at 1/10th the cost — automation is the missing link.',
    solver: 'Genie Cast',
    gradient: 'from-lime-500/80 to-green-600/80',
  },
  {
    key: 'ai_adoption_fear',
    icon: Brain,
    title: 'AI Trust Deficit',
    problem: 'Enterprises want AI but fear hallucination, brand inconsistency, and compliance violations.',
    growth: '82% of CMOs plan AI content adoption by 2026 — but 67% cite quality control as the #1 blocker.',
    solver: 'Genie Mind',
    gradient: 'from-indigo-500/80 to-blue-600/80',
  },
  {
    key: 'campaign_fragmentation',
    icon: Megaphone,
    title: 'Campaign Silos',
    problem: 'Marketing, sales, and product teams create content independently — zero reuse, zero consistency.',
    growth: 'Unified content platforms reduce production costs by 60% and improve brand consistency by 4×.',
    solver: 'Genie Hub',
    gradient: 'from-pink-500/80 to-rose-600/80',
  },
];

interface Props {
  regionSlug: RegionSlug;
  isRTL?: boolean;
}

export const RegionalChallengesSection: React.FC<Props> = ({ regionSlug, isRTL = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll marquee
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    let animationId: number;
    let scrollPos = 0;
    const speed = isRTL ? -0.5 : 0.5;

    const animate = () => {
      scrollPos += speed;
      const maxScroll = container.scrollWidth / 2;
      if (Math.abs(scrollPos) >= maxScroll) scrollPos = 0;
      container.scrollLeft = isRTL ? container.scrollWidth - scrollPos : scrollPos;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => { animationId = requestAnimationFrame(animate); };
    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mouseenter', pause);
      container.removeEventListener('mouseleave', resume);
    };
  }, [isRTL]);

  const displayCards = [...CHALLENGE_CARDS, ...CHALLENGE_CARDS];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/5 to-background" />

      <div className="relative max-w-7xl mx-auto px-4 mb-10">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 text-sm px-4 py-1 border-destructive/30 text-destructive">
            Content Industry · $400B+ Market
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-3 text-foreground">
            The Problems We Solve
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The content industry is exploding — but production workflows are stuck in 2015. 
            Here's what Genie Suite eliminates.
          </p>
        </div>
      </div>

      {/* Auto-scrolling marquee */}
      <div
        ref={scrollRef}
        className="relative flex gap-5 overflow-x-hidden px-4 py-4"
        style={{ scrollBehavior: 'auto' }}
      >
        {displayCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={`${card.key}-${idx}`}
              className="flex-shrink-0 w-[320px] md:w-[360px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx % CHALLENGE_CARDS.length) * 0.05 }}
            >
              <div className="h-full rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30 group">
                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white/90" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base leading-tight">
                      {card.title}
                    </h3>
                  </div>
                </div>

                {/* Problem */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {card.problem}
                </p>

                {/* Growth stat */}
                <div className="flex items-start gap-2 mb-4 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-primary font-medium leading-relaxed">
                    {card.growth}
                  </p>
                </div>

                {/* Solver tag */}
                <div className="pt-3 border-t border-border/30 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    Solved by {card.solver}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
    </section>
  );
};

export default RegionalChallengesSection;
