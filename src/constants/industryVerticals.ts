/**
 * INDUSTRY_VERTICALS — Single source of truth
 * Used by: SubscriberProductSetup, CreateContextSelector, HeroBannerCarouselMode, enrichment pipeline
 */

export interface IndustryVertical {
  value: string;
  label: string;
  /** Short display label for badges/chips */
  shortLabel: string;
}

export const INDUSTRY_VERTICALS: IndustryVertical[] = [
  { value: 'finance', label: 'Finance & Banking', shortLabel: 'Finance' },
  { value: 'travel', label: 'Travel & Hospitality', shortLabel: 'Tourism' },
  { value: 'food_beverage', label: 'Food & Beverages', shortLabel: 'F&B' },
  { value: 'healthcare', label: 'Healthcare & Wellness', shortLabel: 'Healthcare' },
  { value: 'technology', label: 'Technology & SaaS', shortLabel: 'Tech' },
  { value: 'education', label: 'Education & E-Learning', shortLabel: 'EdTech' },
  { value: 'real_estate', label: 'Real Estate', shortLabel: 'Real Estate' },
  { value: 'retail', label: 'Retail & E-Commerce', shortLabel: 'Retail' },
  { value: 'automotive', label: 'Automotive', shortLabel: 'Auto' },
  { value: 'entertainment', label: 'Entertainment & Media', shortLabel: 'Media' },
  { value: 'professional_services', label: 'Professional Services', shortLabel: 'Services' },
  { value: 'manufacturing', label: 'Manufacturing', shortLabel: 'Manufacturing' },
  { value: 'nonprofit', label: 'Nonprofit & NGO', shortLabel: 'Non-Profit' },
  { value: 'legal', label: 'Legal Services', shortLabel: 'Legal' },
  { value: 'logistics', label: 'Logistics & Supply Chain', shortLabel: 'Logistics' },
  { value: 'telecom', label: 'Telecom & Communications', shortLabel: 'Telecom' },
  { value: 'insurance', label: 'Insurance', shortLabel: 'Insurance' },
  { value: 'government', label: 'Government & Public Sector', shortLabel: 'Government' },
  { value: 'other', label: 'Other', shortLabel: 'Other' },
];

/** Get vertical by value key */
export const getVerticalByValue = (value: string): IndustryVertical | undefined =>
  INDUSTRY_VERTICALS.find(v => v.value === value);

/** Get short labels for badge display */
export const getVerticalShortLabels = (): string[] =>
  INDUSTRY_VERTICALS.filter(v => v.value !== 'other').map(v => v.shortLabel);
