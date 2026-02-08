/**
 * REGION SWITCHER NAVIGATION
 * 
 * Floating region selector for the main landing page that links
 * to dedicated regional sub-routes (/genie-landing/:region).
 * Uses the existing REGIONAL_CONFIGS registry.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  REGIONAL_CONFIGS, 
  detectRegionFromTimezone, 
  getAllRegionSlugs,
  type RegionSlug 
} from '@/config/regionalLandingConfig';

interface RegionSwitcherNavProps {
  className?: string;
  variant?: 'navbar' | 'floating';
}

export const RegionSwitcherNav: React.FC<RegionSwitcherNavProps> = ({ 
  className = '',
  variant = 'floating'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [detectedRegion] = useState<RegionSlug>(detectRegionFromTimezone);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allSlugs = getAllRegionSlugs();
  const detectedConfig = REGIONAL_CONFIGS[detectedRegion];

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
              <div className="p-3 border-b border-border bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground">
                  Explore regional landing pages
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto p-1">
                {allSlugs.map(slug => {
                  const r = REGIONAL_CONFIGS[slug];
                  const isDetected = slug === detectedRegion;
                  return (
                    <Link
                      key={slug}
                      to={`/genie-landing/${slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <span className="text-xl">{r.hero.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {r.hero.regionName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.stats.languages} languages • {r.stats.audienceReach} reach
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
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
              <h3 className="font-bold text-foreground text-sm">🌍 Explore Regional Pages</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Fully transcreated content for your market
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {allSlugs.map(slug => {
                const r = REGIONAL_CONFIGS[slug];
                const isDetected = slug === detectedRegion;
                return (
                  <Link
                    key={slug}
                    to={`/genie-landing/${slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <span className="text-2xl">{r.hero.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {r.hero.regionName}
                        </p>
                        {isDetected && (
                          <Badge variant="secondary" className="text-[9px]">
                            Detected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.stats.languages} languages • {r.hero.theme}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                );
              })}
            </div>
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
