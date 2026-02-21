/**
 * useHolidayAwareness — AI-powered regional holiday suggestions
 * 
 * Fetches upcoming holidays from DB (cached AI-generated data),
 * matches them to visual styles and production capabilities,
 * and provides proactive suggestions for seasonal content.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RegionalHoliday {
  id: string;
  name: string;
  local_name: string | null;
  region_code: string;
  sub_region_code: string | null;
  holiday_date: string;
  holiday_type: 'religious' | 'cultural' | 'national' | 'seasonal' | 'commercial' | 'awareness';
  description: string | null;
  color_palette: string[];
  style_keywords: string[];
  greeting_templates: { language: string; greeting: string; script?: string }[];
  suggested_capabilities: string[];
  suggested_style_ids: string[];
  music_mood: string | null;
  is_recurring: boolean;
  confidence_score: number;
  source: string;
}

export interface HolidayStylePreset {
  id: string;
  holiday_id: string;
  style_id: string;
  color_overrides: Record<string, string>;
  template_prompt: string | null;
  greeting_script: string | null;
}

export interface HolidaySuggestion {
  holiday: RegionalHoliday;
  daysUntil: number;
  urgency: 'now' | 'soon' | 'upcoming' | 'planning';
  presets: HolidayStylePreset[];
}

export function useHolidayAwareness(regionCode: string, subRegionCode?: string) {
  const [holidays, setHolidays] = useState<RegionalHoliday[]>([]);
  const [presets, setPresets] = useState<HolidayStylePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      const future = futureDate.toISOString().split('T')[0];

      let query = supabase
        .from('cast_regional_holidays')
        .select('*')
        .eq('is_active', true)
        .gte('holiday_date', today)
        .lte('holiday_date', future)
        .order('holiday_date', { ascending: true });

      // Match region or global
      if (subRegionCode) {
        query = query.or(`region_code.eq.${regionCode},sub_region_code.eq.${subRegionCode},region_code.eq.global`);
      } else {
        query = query.or(`region_code.eq.${regionCode},region_code.eq.global`);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[HolidayAwareness] Fetch failed:', error.message);
        setHolidays([]);
        return;
      }

      const mapped = (data || []) as unknown as RegionalHoliday[];
      setHolidays(mapped);

      // Fetch presets for these holidays
      if (mapped.length > 0) {
        const holidayIds = mapped.map(h => h.id);
        const { data: presetData } = await supabase
          .from('cast_holiday_style_presets')
          .select('*')
          .in('holiday_id', holidayIds);
        setPresets((presetData || []) as unknown as HolidayStylePreset[]);
      }
    } catch (err) {
      console.error('[HolidayAwareness] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [regionCode, subRegionCode]);

  useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

  /** Get suggestions sorted by urgency */
  const suggestions = useMemo((): HolidaySuggestion[] => {
    const today = new Date();
    return holidays.map(holiday => {
      const holidayDate = new Date(holiday.holiday_date);
      const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const urgency: HolidaySuggestion['urgency'] =
        daysUntil <= 3 ? 'now' :
        daysUntil <= 14 ? 'soon' :
        daysUntil <= 30 ? 'upcoming' : 'planning';

      const holidayPresets = presets.filter(p => p.holiday_id === holiday.id);

      return { holiday, daysUntil, urgency, presets: holidayPresets };
    });
  }, [holidays, presets]);

  /** Get the most urgent holiday (for banner display) */
  const topSuggestion = useMemo(() => suggestions[0] || null, [suggestions]);

  /** Get holidays matching specific style keywords */
  const getHolidaysForStyle = useCallback((styleKeywords: string[]): HolidaySuggestion[] => {
    if (!styleKeywords.length) return suggestions;
    return suggestions.filter(s =>
      s.holiday.style_keywords.some(kw => styleKeywords.includes(kw))
    );
  }, [suggestions]);

  /** Get greeting template for a specific holiday and language */
  const getGreeting = useCallback((holidayId: string, langCode: string = 'en'): string | null => {
    const holiday = holidays.find(h => h.id === holidayId);
    if (!holiday) return null;
    const template = holiday.greeting_templates?.find(
      (t: any) => t.language === langCode
    );
    return template?.greeting || null;
  }, [holidays]);

  return {
    holidays,
    suggestions,
    topSuggestion,
    isLoading,
    refresh: fetchHolidays,
    getHolidaysForStyle,
    getGreeting,
  };
}
