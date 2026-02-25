/**
 * Regional Challenges Section
 * 
 * Auto-rolling glassmorphic marquee showing 4-5 region-specific
 * industry challenges. Data sourced from regional_content_cache
 * with content_type='challenges'.
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Database, Zap, DollarSign, Video,
  Globe, Languages, Monitor, Users, FileText,
  MessageSquare, Stethoscope, Building2, Wifi, Smartphone,
  Lock, Type, Scale, Heart, AppWindow,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { RegionSlug } from '@/config/regionalLandingConfig';

interface ChallengeCard {
  content_key: string;
  english_source: string;
  transcreated_content: string;
  cultural_tone: string;
}

// Map content_key → icon
const CHALLENGE_ICONS: Record<string, React.ElementType> = {
  hipaa_compliance: ShieldAlert,
  emr_integration: Database,
  content_velocity: Zap,
  cost_pressure: DollarSign,
  telehealth_scale: Video,
  gdpr_compliance: Lock,
  language_fragmentation: Languages,
  digital_transformation: Monitor,
  talent_shortage: Users,
  reimbursement_complexity: FileText,
  arabization_gap: MessageSquare,
  telemedicine_growth: Stethoscope,
  vision_2030: Building2,
  workforce_diversity: Users,
  data_localization: Lock,
  language_diversity: Languages,
  rural_access: Wifi,
  ayushman_bharat: Building2,
  cost_sensitivity: DollarSign,
  doctor_ratio: Heart,
  multilingual_markets: Globe,
  mobile_first: Smartphone,
  regulatory_patchwork: Scale,
  traditional_medicine: Stethoscope,
  island_connectivity: Wifi,
  quality_standards: ShieldAlert,
  character_systems: Type,
  data_sovereignty: Lock,
  aging_population: Heart,
  platform_ecosystem: AppWindow,
};

// Map content_key → short title
const CHALLENGE_TITLES: Record<string, string> = {
  hipaa_compliance: 'HIPAA & Compliance',
  emr_integration: 'EMR Data Silos',
  content_velocity: 'Content at Speed',
  cost_pressure: 'Cost Pressure',
  telehealth_scale: 'Telehealth Scale',
  gdpr_compliance: 'GDPR Complexity',
  language_fragmentation: '24-Language Gap',
  digital_transformation: 'Digital Lag',
  talent_shortage: 'Talent Shortage',
  reimbursement_complexity: 'Payer Complexity',
  arabization_gap: 'Arabic NLP Gap',
  telemedicine_growth: 'Telemedicine Boom',
  vision_2030: 'Vision 2030',
  workforce_diversity: 'Diverse Workforce',
  data_localization: 'Data Residency',
  language_diversity: '22 Languages',
  rural_access: 'Rural Access',
  ayushman_bharat: 'Ayushman Bharat',
  cost_sensitivity: 'Price Sensitivity',
  doctor_ratio: 'Doctor Shortage',
  multilingual_markets: '1,000+ Languages',
  mobile_first: 'Mobile-First',
  regulatory_patchwork: 'Regulatory Patchwork',
  traditional_medicine: 'Traditional Medicine',
  island_connectivity: 'Island Connectivity',
  quality_standards: 'Quality Standards',
  character_systems: 'CJK Typography',
  data_sovereignty: 'Data Sovereignty',
  aging_population: 'Aging Population',
  platform_ecosystem: 'Platform Ecosystem',
};

const SLUG_TO_REGION: Record<string, string> = {
  nam: 'nam',
  europe: 'eu',
  mena: 'mena',
  india: 'india',
  'south-asia': 'india',
  sea: 'sea',
  cjk: 'cjk',
  africa: 'africa',
  latam: 'latam',
  caribbean: 'caribbean',
};

// Fallback challenges for zones without DB data
const FALLBACK_CHALLENGES: ChallengeCard[] = [
  { content_key: 'content_velocity', english_source: 'Content teams struggle to produce compliant, multilingual content at the speed modern audiences demand.', transcreated_content: 'Content teams struggle to produce compliant, multilingual content at the speed modern audiences demand.', cultural_tone: 'professional' },
  { content_key: 'cost_pressure', english_source: 'Rising costs force organizations to do more with less — AI tools must prove ROI within weeks.', transcreated_content: 'Rising costs force organizations to do more with less — AI tools must prove ROI within weeks.', cultural_tone: 'professional' },
  { content_key: 'language_fragmentation', english_source: 'Global markets demand culturally adapted content — not just translated, but truly localized.', transcreated_content: 'Global markets demand culturally adapted content — not just translated, but truly localized.', cultural_tone: 'professional' },
  { content_key: 'digital_transformation', english_source: 'Legacy systems and fragmented workflows slow digital adoption across industries.', transcreated_content: 'Legacy systems and fragmented workflows slow digital adoption across industries.', cultural_tone: 'professional' },
  { content_key: 'talent_shortage', english_source: 'Finding creators who understand both technical accuracy and cultural nuance remains a global challenge.', transcreated_content: 'Finding creators who understand both technical accuracy and cultural nuance remains a global challenge.', cultural_tone: 'professional' },
];

interface Props {
  regionSlug: RegionSlug;
  isRTL?: boolean;
}

export const RegionalChallengesSection: React.FC<Props> = ({ regionSlug, isRTL = false }) => {
  const [challenges, setChallenges] = useState<ChallengeCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      const regionKey = SLUG_TO_REGION[regionSlug] || 'nam';
      const { data, error } = await supabase
        .from('regional_content_cache')
        .select('content_key, english_source, transcreated_content, cultural_tone')
        .eq('region_slug', regionKey)
        .eq('content_type', 'challenges')
        .eq('status', 'approved')
        .order('content_key');

      if (!error && data && data.length > 0) {
        setChallenges(data);
      } else {
        setChallenges(FALLBACK_CHALLENGES);
      }
      setIsLoading(false);
    };

    fetchChallenges();
  }, [regionSlug]);

  // Auto-scroll marquee
  useEffect(() => {
    if (!scrollRef.current || challenges.length === 0) return;
    const container = scrollRef.current;
    let animationId: number;
    let scrollPos = 0;
    const speed = isRTL ? -0.5 : 0.5; // RTL scrolls right-to-left

    const animate = () => {
      scrollPos += speed;
      const maxScroll = container.scrollWidth / 2;
      if (Math.abs(scrollPos) >= maxScroll) scrollPos = 0;
      container.scrollLeft = isRTL ? container.scrollWidth - scrollPos : scrollPos;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Pause on hover
    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => { animationId = requestAnimationFrame(animate); };
    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mouseenter', pause);
      container.removeEventListener('mouseleave', resume);
    };
  }, [challenges, isRTL]);

  if (isLoading) return null;

  // Duplicate cards for infinite scroll illusion
  const displayCards = [...challenges, ...challenges];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/5 to-background" />

      <div className="relative max-w-7xl mx-auto px-4 mb-8">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 text-sm px-4 py-1 border-destructive/30 text-destructive">
            Industry Challenges
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
            The Problems We Solve
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every region faces unique content challenges. Here's what keeps your industry up at night.
          </p>
        </div>
      </div>

      {/* Auto-scrolling marquee */}
      <div
        ref={scrollRef}
        className="relative flex gap-6 overflow-x-hidden px-4 py-4"
        style={{ scrollBehavior: 'auto' }}
      >
        {displayCards.map((card, idx) => {
          const Icon = CHALLENGE_ICONS[card.content_key] || Zap;
          const title = CHALLENGE_TITLES[card.content_key] || card.content_key.replace(/_/g, ' ');

          return (
            <motion.div
              key={`${card.content_key}-${idx}`}
              className="flex-shrink-0 w-[320px] md:w-[380px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx % challenges.length) * 0.1 }}
            >
              <div className="h-full rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-destructive/30 group">
                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                    <Icon className="w-5 h-5 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg capitalize">
                    {title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.transcreated_content || card.english_source}
                </p>

                {/* Cultural tone tag */}
                <div className="mt-4 pt-3 border-t border-border/30">
                  <span className="text-xs text-muted-foreground/60 italic">
                    {card.cultural_tone}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default RegionalChallengesSection;
