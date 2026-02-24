/**
 * OutputFormatShowcase — "What You Can Create" section
 * Shows 6 format cards: Video, Podcast, Presentation, Website, Social, Document
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Video, Mic, FileText, Globe, Share2, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FORMAT_CARDS = [
  {
    icon: Video,
    title: 'Video',
    subFormats: ['Explainer', 'Social Short', 'Brand Anthem'],
    pipeline: 'Vertex Veo + Azure TTS',
    gradient: 'from-sky-500 to-cyan-600',
  },
  {
    icon: Mic,
    title: 'Podcast',
    subFormats: ['Expert Interview', 'Audio Drama', 'Roundtable'],
    pipeline: 'ElevenLabs + Deepgram',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: FileText,
    title: 'Presentation',
    subFormats: ['Investor Pitch', 'Sales Deck', 'Onboarding'],
    pipeline: 'GPT-4o + Gemini 3',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Globe,
    title: 'Website',
    subFormats: ['Landing Page', 'Microsite', 'Product Page'],
    pipeline: 'Claude 4 + Gemini',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Share2,
    title: 'Social',
    subFormats: ['Instagram Reel', 'LinkedIn Post', 'TikTok'],
    pipeline: 'ModelsLab + JSON2Video',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: BookOpen,
    title: 'Document',
    subFormats: ['Whitepaper', 'Case Study', 'Newsletter'],
    pipeline: 'GPT-4o + DeepL',
    gradient: 'from-indigo-500 to-blue-600',
  },
];

export const OutputFormatShowcase: React.FC = () => (
  <section id="formats" className="py-20 relative">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
    <div className="relative max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
          16 Formats · 62+ Content Types
        </Badge>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
          What You Can Create
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From video to podcast, PPT to social — one platform produces everything, transcreated for every market.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FORMAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 150 }}
              className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/10"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{card.title}</h3>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {card.subFormats.map((sf) => (
                  <span key={sf} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/50 font-medium">
                    {sf}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/70 font-medium">
                Powered by {card.pipeline}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default OutputFormatShowcase;
