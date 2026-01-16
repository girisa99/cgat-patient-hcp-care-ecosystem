/**
 * Genie Command Center - Type Definitions
 * Single source of truth for all Genie Suite data types
 */

export interface MarketTrend {
  year: number;
  globalMarket: number; // in billions USD
  aiAdoption: number; // percentage
  creatorGrowth: number; // percentage
}

export interface MarketReference {
  source: string;
  year: number;
  stat: string;
  url?: string;
}

export interface Segment {
  id: string;
  name: string;
  fullName: string;
  emoji: string;
  marketSize: string;
  growthRate: string;
  cagr: string;
  tam: string;
  sam: string;
  som: string;
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  entryBarrier: 'Low' | 'Medium' | 'High' | 'Very High';
  genieFit: number;
  priority: 'P0' | 'P1' | 'P2';
  tagline: string;
  painPoints: string[];
  avgTimeSpent: string;
  fragmentation: string;
  contentImportance: number; // 1-10
}

export interface Competitor {
  name: string;
  segment: string;
  type: 'Direct' | 'Feature' | 'Platform';
  userBase: string;
  revenue: string;
  pricing: string;
  founded: number;
  yearsInMarket: number;
  languages: number;
  platforms: ('Desktop' | 'Mobile' | 'Web' | 'API')[];
  appIntegration: boolean;
  modular: boolean;
  videoEditingRating: number; // 1-5
  easeOfUse: number; // 1-5
  learningCurve: string;
  strengths: string[];
  weaknesses: string[];
  genieDifferentiator: string;
}

export interface SWOTItem {
  category: 'strength' | 'weakness' | 'opportunity' | 'threat';
  text: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface GartnerPosition {
  name: string;
  visionScore: number; // 0-100
  executionScore: number; // 0-100
  quadrant: 'Leaders' | 'Challengers' | 'Visionaries' | 'Niche Players';
}

export interface ImplementationPhase {
  id: string;
  name: string;
  weeks: string;
  status: 'completed' | 'in-progress' | 'planned';
  completion: number;
  scenariosTotal: number;
  scenariosComplete: number;
  features: { name: string; status: 'done' | 'partial' | 'pending' }[];
}

export interface ScenarioCategory {
  id: string;
  name: string;
  range: string;
  total: number;
  implemented: number;
  partial: number;
  pending: number;
  phase: string;
}

export interface FinancialProjection {
  year: number;
  quarter?: string;
  users: number;
  mrr: number;
  arr: number;
  marketingCost: number;
  hostingCost: number;
  aiModelCost: number;
  developmentCost: number;
  totalCost: number;
  revenue: number;
  netIncome: number;
}

export interface UnitEconomics {
  segment: string;
  arpu: number;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  churnRate: number;
  paybackMonths: number;
}

export interface GoToMarketPhase {
  phase: string;
  name: string;
  duration: string;
  segments: string[];
  countries: string[];
  targetUsers: number;
  activities: string[];
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  wowFeatures: string[];
  status: 'complete' | 'partial' | 'planned';
  phase: string;
  scenariosCovered: number;
  agents: string[];
  apis: string[];
}

export interface StageGateItem {
  category: string;
  item: string;
  status: 'done' | 'in-progress' | 'pending' | 'blocked';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  notes?: string;
  /** Where to update this item (file path, doc, or external system) */
  location?: string;
  /** Link to documentation or resource */
  docLink?: string;
}
