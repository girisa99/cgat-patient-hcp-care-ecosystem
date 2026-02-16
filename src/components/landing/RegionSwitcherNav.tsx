/**
 * REGION SWITCHER NAVIGATION
 * 
 * Floating region selector for the main landing page that links
 * to dedicated regional sub-routes (/genie-landing/:region).
 * Uses REGION_HIERARCHY as the single source of truth for 16 unique regions.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  REGIONAL_CONFIGS, 
  detectRegionFromTimezone, 
  type RegionSlug 
} from '@/config/regionalLandingConfig';
import { REGION_HIERARCHY, type RegionGroup } from '@/config/regionHierarchy';

interface RegionSwitcherNavProps {
  className?: string;
  variant?: 'navbar' | 'floating';
}

// Map hierarchy group codes to landing page slugs
const GROUP_TO_SLUG: Record<string, RegionSlug | null> = {
  NAM: 'nam', EU: 'europe', LATAM: 'latam', MENA: 'mena', AFRICA: 'africa',
  INDIA: 'india', SEA: 'sea', CJK: 'cjk', OCEANIA: 'oceania', TURKEY: 'turkey',
  CARIBBEAN: 'caribbean', EURASIA: 'eastern_europe', CENTRAL_ASIA: 'central_asia',
  PAKISTAN: 'pakistan', BANGLADESH: 'bangladesh', SOUTH_ASIA: 'south_asia',
};

const getZoneCount = (g: RegionGroup): number => g.children.length || 1;
const getLangCount = (g: RegionGroup): number => {
  if (g.children.length === 0) return 1;
  return g.children.reduce((sum, c) => sum + (c.children?.length || 1), 0);
};

export const RegionSwitcherNav: React.FC<RegionSwitcherNavProps> = ({ 
  className = '',
  variant = 'floating'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [detectedRegion] = useState<RegionSlug>(detectRegionFromTimezone);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const detectedConfig = REGIONAL_CONFIGS[detectedRegion];

  // Compute totals
  const totalZones = REGION_HIERARCHY.reduce((s, g) => s + getZoneCount(g), 0);
  const totalLangs = REGION_HIERARCHY.reduce((s, g) => s + getLangCount(g), 0);

  const renderRegionList = (compact: boolean) => (
    <>
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <p className="text-xs font-medium text-muted-foreground">
          Explore regional landing pages
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
          {REGION_HIERARCHY.length} Regions · {totalZones} Zones · {totalLangs}+ Languages
        </p>
      </div>
      <div className={`${compact ? 'max-h-80' : 'max-h-72'} overflow-y-auto p-1`}>
        {REGION_HIERARCHY.map((group) => {
          const slug = GROUP_TO_SLUG[group.groupCode];
          if (!slug) return null;
          const isDetected = slug === detectedRegion;
          const zones = getZoneCount(group);
          const langs = getLangCount(group);

          return (
            <Link
              key={group.groupCode}
              to={`/genie-landing/${slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
            >
              <span className="text-xl leading-none">{group.groupFlag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {group.groupName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {zones} zone{zones > 1 ? 's' : ''} · {langs} language{langs > 1 ? 's' : ''}
                </p>
              </div>
              {isDetected && (
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  Your region
                </Badge>
              )}
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          );
        })}
      </div>
    </>
  );

  if (variant === 'navbar') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted border border-border transition-colors"
        >
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">{detectedConfig.hero.flag}</span>
          <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
            >
              {renderRegionList(true)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Floating variant (bottom-right)
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`} ref={dropdownRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {renderRegionList(false)}
            <div className="p-3 border-t border-border bg-muted/30 text-center">
              <p className="text-[11px] text-muted-foreground">
                Each page is culturally transcreated — not translated
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-full shadow-xl hover:shadow-2xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe className="h-5 w-5" />
        <span className="text-sm font-medium">
          {detectedConfig.hero.flag} {detectedConfig.hero.regionName}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>
    </div>
  );
};

export default RegionSwitcherNav;
