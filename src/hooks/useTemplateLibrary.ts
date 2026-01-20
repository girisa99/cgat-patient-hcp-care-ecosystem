/**
 * useTemplateLibrary - Hook for managing consulting frameworks and industry templates
 * Combines database-stored templates with system defaults
 * Supports user-created templates with public/private visibility
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { toast } from 'sonner';

// Types
export interface ConsultingFramework {
  id: string;
  name: string;
  description?: string;
  category: 'strategy' | 'growth' | 'operations' | 'universal' | 'industry-specific' | 'custom';
  frameworks: string[];
  tags: string[];
  useCases: string[];
  visualStyle: 'minimal' | 'data-heavy' | 'balanced';
  industries: string[];
  isSystem: boolean;
  visibility: 'private' | 'public' | 'pending_review';
  createdBy?: string;
  usageCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt?: string;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  description?: string;
  industry: string;
  subIndustry?: string;
  templateType: string;
  frameworks: string[];
  tags: string[];
  slideSuggestions: any[];
  recommendedVisuals: string[];
  isSystem: boolean;
  visibility: 'private' | 'public' | 'pending_review';
  createdBy?: string;
  usageCount: number;
  ratingAvg: number;
  ratingCount: number;
  previewImageUrl?: string;
  createdAt?: string;
}

// Default system frameworks (fallback if DB is empty)
const DEFAULT_CONSULTING_FRAMEWORKS: ConsultingFramework[] = [
  // Strategy
  { id: 'seven-s', name: '7-S Framework', description: 'Organizational alignment across 7 elements', category: 'strategy', frameworks: ['Strategy', 'Structure', 'Systems', 'Shared Values', 'Style', 'Staff', 'Skills'], tags: ['organization', 'alignment'], useCases: ['strategic', 'business'], visualStyle: 'minimal', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'three-horizons', name: 'Three Horizons Growth', description: 'Strategic planning across growth horizons', category: 'strategy', frameworks: ['Horizon 1: Core', 'Horizon 2: Emerging', 'Horizon 3: Transformational'], tags: ['growth', 'innovation'], useCases: ['strategic', 'investor'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'change-influence', name: 'Change Influence Model', description: 'Leadership-driven change management', category: 'strategy', frameworks: ['Change Vision', 'Stakeholder Alignment', 'Communication Plan'], tags: ['change', 'transformation'], useCases: ['training', 'business'], visualStyle: 'minimal', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'playing-to-win', name: 'Playing to Win', description: 'Five strategic choices cascade', category: 'strategy', frameworks: ['Winning Aspiration', 'Where to Play', 'How to Win', 'Capabilities', 'Management Systems'], tags: ['strategy', 'competitive'], useCases: ['strategic'], visualStyle: 'minimal', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'strategy-diamond', name: 'Strategy Diamond', description: 'Comprehensive strategy articulation', category: 'strategy', frameworks: ['Arenas', 'Vehicles', 'Differentiators', 'Staging', 'Economic Logic'], tags: ['strategy', 'execution'], useCases: ['strategic'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  
  // Growth
  { id: 'bcg-matrix', name: 'Growth-Share Matrix', description: 'Portfolio analysis using growth and share', category: 'growth', frameworks: ['Stars', 'Cash Cows', 'Question Marks', 'Dogs'], tags: ['portfolio', 'investment'], useCases: ['strategic', 'investor'], visualStyle: 'data-heavy', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'competitive-advantage', name: 'Competitive Advantage Matrix', description: 'Mapping competitive position', category: 'growth', frameworks: ['Cost Leadership', 'Differentiation', 'Focus'], tags: ['competition', 'strategy'], useCases: ['strategic'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'digital-maturity', name: 'Digital Maturity Index', description: 'Digital transformation readiness', category: 'growth', frameworks: ['Initiate', 'Enable', 'Integrate', 'Optimize', 'Transform'], tags: ['digital', 'transformation'], useCases: ['technical', 'business'], visualStyle: 'data-heavy', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'market-entry', name: 'Market Entry Strategy', description: 'Market expansion framework', category: 'growth', frameworks: ['Market Analysis', 'Entry Modes', 'Risk Assessment', 'Go-to-Market'], tags: ['expansion', 'market'], useCases: ['strategic', 'business'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'ma-integration', name: 'M&A Integration', description: 'Merger integration framework', category: 'growth', frameworks: ['Due Diligence', 'Synergy Capture', 'Integration Planning', 'Day 1 Readiness'], tags: ['merger', 'acquisition'], useCases: ['strategic', 'investor'], visualStyle: 'data-heavy', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  
  // Operations
  { id: 'nps', name: 'Customer Loyalty System', description: 'NPS and promoter methodology', category: 'operations', frameworks: ['Promoters', 'Passives', 'Detractors', 'Root Cause'], tags: ['customer', 'loyalty'], useCases: ['marketing', 'business'], visualStyle: 'data-heavy', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'lean-six-sigma', name: 'Lean Six Sigma', description: 'Process improvement framework', category: 'operations', frameworks: ['Define', 'Measure', 'Analyze', 'Improve', 'Control'], tags: ['process', 'quality'], useCases: ['operational'], visualStyle: 'data-heavy', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'supply-chain', name: 'Supply Chain Excellence', description: 'End-to-end supply chain optimization', category: 'operations', frameworks: ['Plan', 'Source', 'Make', 'Deliver', 'Return'], tags: ['supply-chain', 'logistics'], useCases: ['operational'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'customer-journey', name: 'Customer Journey Map', description: 'Touchpoint and experience mapping', category: 'operations', frameworks: ['Awareness', 'Consideration', 'Purchase', 'Retention', 'Advocacy'], tags: ['customer', 'experience'], useCases: ['marketing', 'business'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  
  // Universal
  { id: 'five-forces', name: 'Five Forces Analysis', description: 'Industry competitive analysis', category: 'universal', frameworks: ['Rivalry', 'New Entrants', 'Substitutes', 'Buyer Power', 'Supplier Power'], tags: ['competition', 'industry'], useCases: ['strategic', 'research'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'swot', name: 'SWOT Analysis', description: 'Strengths, Weaknesses, Opportunities, Threats', category: 'universal', frameworks: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'], tags: ['analysis', 'planning'], useCases: ['strategic', 'proposal'], visualStyle: 'minimal', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'pestle', name: 'PESTLE Analysis', description: 'Macro environment analysis', category: 'universal', frameworks: ['Political', 'Economic', 'Social', 'Technological', 'Legal', 'Environmental'], tags: ['environment', 'trends'], useCases: ['strategic', 'research'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'value-chain', name: 'Value Chain Analysis', description: 'Primary and support activities', category: 'universal', frameworks: ['Inbound Logistics', 'Operations', 'Outbound Logistics', 'Marketing', 'Service'], tags: ['operations', 'value'], useCases: ['operational', 'strategic'], visualStyle: 'data-heavy', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'balanced-scorecard', name: 'Balanced Scorecard', description: 'Multi-perspective KPIs', category: 'universal', frameworks: ['Financial', 'Customer', 'Internal Process', 'Learning & Growth'], tags: ['performance', 'metrics'], useCases: ['business', 'operational'], visualStyle: 'data-heavy', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'bmc', name: 'Business Model Canvas', description: '9-block business model visualization', category: 'universal', frameworks: ['Value Proposition', 'Customer Segments', 'Channels', 'Revenue Streams', 'Key Resources', 'Key Activities', 'Key Partners', 'Cost Structure', 'Customer Relationships'], tags: ['business-model', 'startup'], useCases: ['investor', 'strategic'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'okr', name: 'OKR Framework', description: 'Objectives and Key Results', category: 'universal', frameworks: ['Objectives', 'Key Results', 'Initiatives'], tags: ['goals', 'performance'], useCases: ['business', 'operational'], visualStyle: 'minimal', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'blue-ocean', name: 'Blue Ocean Strategy', description: 'Value innovation framework', category: 'universal', frameworks: ['Eliminate', 'Reduce', 'Raise', 'Create'], tags: ['innovation', 'differentiation'], useCases: ['strategic', 'creative'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'root-cause', name: 'Root Cause Analysis', description: '5 Whys and Fishbone diagram', category: 'universal', frameworks: ['5 Whys', 'Ishikawa Diagram', 'Cause Categories'], tags: ['problem-solving', 'quality'], useCases: ['operational', 'technical'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'raci', name: 'RACI Matrix', description: 'Responsibility assignment', category: 'universal', frameworks: ['Responsible', 'Accountable', 'Consulted', 'Informed'], tags: ['responsibility', 'roles'], useCases: ['operational', 'business'], visualStyle: 'minimal', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'stakeholder', name: 'Stakeholder Mapping', description: 'Influence and interest analysis', category: 'universal', frameworks: ['Power/Interest Grid', 'Influence Matrix', 'Engagement Strategy'], tags: ['stakeholders', 'management'], useCases: ['business', 'strategic'], visualStyle: 'balanced', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'risk-matrix', name: 'Risk Assessment Matrix', description: 'Probability and impact analysis', category: 'universal', frameworks: ['Probability', 'Impact', 'Risk Score', 'Mitigation'], tags: ['risk', 'assessment'], useCases: ['compliance', 'operational'], visualStyle: 'data-heavy', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'ansoff', name: 'Ansoff Growth Matrix', description: 'Product-market growth strategies', category: 'universal', frameworks: ['Market Penetration', 'Market Development', 'Product Development', 'Diversification'], tags: ['growth', 'market'], useCases: ['strategic'], visualStyle: 'minimal', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'vrio', name: 'VRIO Framework', description: 'Resource-based competitive advantage', category: 'universal', frameworks: ['Valuable', 'Rare', 'Imitable', 'Organized'], tags: ['competitive', 'resources'], useCases: ['strategic'], visualStyle: 'minimal', industries: [], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
];

// Default industry templates
const DEFAULT_INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  // Healthcare
  { id: 'healthcare-clinical', name: 'Clinical Workflow', description: 'Clinical process optimization', industry: 'healthcare', templateType: 'presentation', frameworks: ['Patient Flow', 'Care Pathways'], tags: ['clinical', 'workflow'], slideSuggestions: [], recommendedVisuals: ['flowcharts', 'timelines'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'healthcare-journey', name: 'Patient Journey', description: 'End-to-end patient experience', industry: 'healthcare', templateType: 'presentation', frameworks: ['Journey Stages', 'Touchpoints'], tags: ['patient', 'journey'], slideSuggestions: [], recommendedVisuals: ['journey-map', 'timeline'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'healthcare-compliance', name: 'Regulatory Compliance', description: 'HIPAA and FDA compliance', industry: 'healthcare', templateType: 'presentation', frameworks: ['Compliance Checklist', 'Risk Matrix'], tags: ['compliance', 'regulatory'], slideSuggestions: [], recommendedVisuals: ['checklists', 'tables'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'healthcare-trials', name: 'Clinical Trial Results', description: 'Study findings presentation', industry: 'healthcare', templateType: 'presentation', frameworks: ['Study Design', 'Statistical Results'], tags: ['clinical-trial', 'research'], slideSuggestions: [], recommendedVisuals: ['charts', 'tables'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  
  // Technology
  { id: 'tech-roadmap', name: 'Product Roadmap', description: 'Product development timeline', industry: 'technology', templateType: 'presentation', frameworks: ['Timeline', 'Feature Prioritization'], tags: ['product', 'roadmap'], slideSuggestions: [], recommendedVisuals: ['timeline', 'kanban'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'tech-architecture', name: 'System Architecture', description: 'Technical architecture overview', industry: 'technology', templateType: 'presentation', frameworks: ['Architecture Diagram', 'Data Flow'], tags: ['architecture', 'technical'], slideSuggestions: [], recommendedVisuals: ['diagrams', 'flowcharts'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'tech-sprint', name: 'Sprint Review', description: 'Agile sprint summary', industry: 'technology', templateType: 'presentation', frameworks: ['Sprint Metrics', 'Burndown'], tags: ['agile', 'sprint'], slideSuggestions: [], recommendedVisuals: ['charts', 'kanban'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'tech-api', name: 'API Documentation', description: 'Technical API reference', industry: 'technology', templateType: 'presentation', frameworks: ['Endpoint Reference', 'Authentication'], tags: ['api', 'documentation'], slideSuggestions: [], recommendedVisuals: ['code-blocks', 'diagrams'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'tech-cloud', name: 'Cloud Migration', description: 'Cloud transformation planning', industry: 'technology', templateType: 'presentation', frameworks: ['Migration Phases', 'Cost Analysis'], tags: ['cloud', 'migration'], slideSuggestions: [], recommendedVisuals: ['diagrams', 'timelines'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  
  // Finance
  { id: 'finance-thesis', name: 'Investment Thesis', description: 'Investment analysis', industry: 'finance', templateType: 'presentation', frameworks: ['Market Analysis', 'Financial Model'], tags: ['investment', 'analysis'], slideSuggestions: [], recommendedVisuals: ['charts', 'tables'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'finance-portfolio', name: 'Portfolio Analysis', description: 'Portfolio performance review', industry: 'finance', templateType: 'presentation', frameworks: ['Asset Allocation', 'Risk Metrics'], tags: ['portfolio', 'investment'], slideSuggestions: [], recommendedVisuals: ['pie-charts', 'line-graphs'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'finance-risk', name: 'Risk Management', description: 'Enterprise risk framework', industry: 'finance', templateType: 'presentation', frameworks: ['Risk Matrix', 'Control Framework'], tags: ['risk', 'management'], slideSuggestions: [], recommendedVisuals: ['matrices', 'heatmaps'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'finance-ma', name: 'M&A Deal Book', description: 'M&A transaction documentation', industry: 'finance', templateType: 'presentation', frameworks: ['Deal Overview', 'Valuation'], tags: ['m&a', 'deal'], slideSuggestions: [], recommendedVisuals: ['financial-tables', 'charts'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  
  // Manufacturing
  { id: 'mfg-lean', name: 'Lean Operations', description: 'Lean manufacturing metrics', industry: 'manufacturing', templateType: 'presentation', frameworks: ['OEE Metrics', 'Waste Analysis'], tags: ['lean', 'operations'], slideSuggestions: [], recommendedVisuals: ['dashboards', 'gauges'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'mfg-supply', name: 'Supply Chain Visibility', description: 'Supply chain monitoring', industry: 'manufacturing', templateType: 'presentation', frameworks: ['Supply Chain Map', 'Inventory Levels'], tags: ['supply-chain', 'logistics'], slideSuggestions: [], recommendedVisuals: ['maps', 'flowcharts'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'mfg-quality', name: 'Quality Control', description: 'Product quality metrics', industry: 'manufacturing', templateType: 'presentation', frameworks: ['Quality Metrics', 'SPC Charts'], tags: ['quality', 'control'], slideSuggestions: [], recommendedVisuals: ['pareto-charts', 'control-charts'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  
  // Retail
  { id: 'retail-segment', name: 'Customer Segmentation', description: 'Customer analysis', industry: 'retail', templateType: 'presentation', frameworks: ['Segment Profiles', 'Value Mapping'], tags: ['customer', 'segmentation'], slideSuggestions: [], recommendedVisuals: ['personas', 'charts'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'retail-omni', name: 'Omnichannel Strategy', description: 'Unified commerce', industry: 'retail', templateType: 'presentation', frameworks: ['Channel Map', 'Integration Plan'], tags: ['omnichannel', 'commerce'], slideSuggestions: [], recommendedVisuals: ['diagrams', 'journey-maps'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'retail-campaign', name: 'Seasonal Campaign', description: 'Marketing campaign planning', industry: 'retail', templateType: 'presentation', frameworks: ['Campaign Calendar', 'Creative Brief'], tags: ['campaign', 'seasonal'], slideSuggestions: [], recommendedVisuals: ['calendars', 'timelines'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  
  // Startup
  { id: 'startup-seed', name: 'Seed Pitch Deck', description: 'Early-stage pitch', industry: 'startup', templateType: 'presentation', frameworks: ['Problem-Solution', 'Market Size', 'Team'], tags: ['pitch', 'seed'], slideSuggestions: [], recommendedVisuals: ['simple-charts', 'team-photos'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'startup-series', name: 'Series A Pitch', description: 'Growth-stage pitch', industry: 'startup', templateType: 'presentation', frameworks: ['Traction', 'Unit Economics', 'Growth Plan'], tags: ['pitch', 'series-a'], slideSuggestions: [], recommendedVisuals: ['metric-cards', 'growth-charts'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'startup-board', name: 'Board Deck', description: 'Board meeting presentation', industry: 'startup', templateType: 'presentation', frameworks: ['Financial Review', 'OKR Progress'], tags: ['board', 'governance'], slideSuggestions: [], recommendedVisuals: ['dashboards', 'tables'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  
  // Consulting
  { id: 'consult-strategy', name: 'Strategy Recommendation', description: 'Strategic consulting presentation', industry: 'consulting', templateType: 'presentation', frameworks: ['Situation Analysis', 'Options', 'Recommendation'], tags: ['strategy', 'consulting'], slideSuggestions: [], recommendedVisuals: ['frameworks', 'matrices'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'consult-dd', name: 'Due Diligence Report', description: 'Due diligence findings', industry: 'consulting', templateType: 'presentation', frameworks: ['Financial Analysis', 'Risk Assessment'], tags: ['due-diligence', 'analysis'], slideSuggestions: [], recommendedVisuals: ['tables', 'charts'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
  { id: 'consult-transform', name: 'Transformation Roadmap', description: 'Organizational transformation', industry: 'consulting', templateType: 'presentation', frameworks: ['Current State', 'Future Vision', 'Waves'], tags: ['transformation', 'change'], slideSuggestions: [], recommendedVisuals: ['timelines', 'maturity-models'], isSystem: true, visibility: 'public', usageCount: 0, ratingAvg: 0, ratingCount: 0 },
];

// Map DB record to ConsultingFramework
function mapDbToFramework(record: any): ConsultingFramework {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    category: record.category,
    frameworks: record.frameworks || [],
    tags: record.tags || [],
    useCases: record.use_cases || [],
    visualStyle: record.visual_style || 'balanced',
    industries: record.industries || [],
    isSystem: record.is_system,
    visibility: record.visibility,
    createdBy: record.created_by,
    usageCount: record.usage_count || 0,
    ratingAvg: record.rating_avg || 0,
    ratingCount: record.rating_count || 0,
    createdAt: record.created_at,
  };
}

// Map DB record to IndustryTemplate
function mapDbToTemplate(record: any): IndustryTemplate {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    industry: record.industry,
    subIndustry: record.sub_industry,
    templateType: record.template_type || 'presentation',
    frameworks: record.frameworks || [],
    tags: record.tags || [],
    slideSuggestions: record.slide_suggestions || [],
    recommendedVisuals: record.recommended_visuals || [],
    isSystem: record.is_system,
    visibility: record.visibility,
    createdBy: record.created_by,
    usageCount: record.usage_count || 0,
    ratingAvg: record.rating_avg || 0,
    ratingCount: record.rating_count || 0,
    previewImageUrl: record.preview_image_url,
    createdAt: record.created_at,
  };
}

export function useTemplateLibrary() {
  const { user } = useMasterAuth();
  const [consultingFrameworks, setConsultingFrameworks] = useState<ConsultingFramework[]>(DEFAULT_CONSULTING_FRAMEWORKS);
  const [industryTemplates, setIndustryTemplates] = useState<IndustryTemplate[]>(DEFAULT_INDUSTRY_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch from database
  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch consulting frameworks
        const { data: frameworksData, error: frameworksError } = await supabase
          .from('custom_consulting_frameworks')
          .select('*')
          .order('name');

        if (frameworksError) throw frameworksError;

        // Fetch industry templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('industry_template_library')
          .select('*')
          .order('name');

        if (templatesError) throw templatesError;

        // Use DB data if available, otherwise use defaults
        if (frameworksData && frameworksData.length > 0) {
          setConsultingFrameworks(frameworksData.map(mapDbToFramework));
        }

        if (templatesData && templatesData.length > 0) {
          setIndustryTemplates(templatesData.map(mapDbToTemplate));
        }
      } catch (err: any) {
        console.warn('Failed to fetch template library from DB, using defaults:', err.message);
        // Keep using defaults
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  // Get frameworks by category
  const getFrameworksByCategory = useMemo(() => {
    return (category?: string) => {
      if (!category) return consultingFrameworks;
      return consultingFrameworks.filter(f => f.category === category);
    };
  }, [consultingFrameworks]);

  // Get templates by industry
  const getTemplatesByIndustry = useMemo(() => {
    return (industry?: string) => {
      if (!industry) return industryTemplates;
      return industryTemplates.filter(t => 
        t.industry.toLowerCase().includes(industry.toLowerCase())
      );
    };
  }, [industryTemplates]);

  // Get user's own frameworks
  const userFrameworks = useMemo(() => {
    if (!user) return [];
    return consultingFrameworks.filter(f => f.createdBy === user.id);
  }, [consultingFrameworks, user]);

  // Get user's own templates
  const userTemplates = useMemo(() => {
    if (!user) return [];
    return industryTemplates.filter(t => t.createdBy === user.id);
  }, [industryTemplates, user]);

  // Create new framework
  const createFramework = async (framework: Omit<ConsultingFramework, 'id' | 'isSystem' | 'usageCount' | 'ratingAvg' | 'ratingCount' | 'createdAt' | 'createdBy'>) => {
    if (!user) {
      toast.error('Please sign in to create frameworks');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('custom_consulting_frameworks')
        .insert({
          name: framework.name,
          description: framework.description,
          category: framework.category,
          frameworks: framework.frameworks,
          tags: framework.tags,
          use_cases: framework.useCases,
          visual_style: framework.visualStyle,
          industries: framework.industries,
          visibility: framework.visibility,
          created_by: user.id,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newFramework = mapDbToFramework(data);
      setConsultingFrameworks(prev => [...prev, newFramework]);
      toast.success('Framework created successfully');
      return newFramework;
    } catch (err: any) {
      toast.error(`Failed to create framework: ${err.message}`);
      return null;
    }
  };

  // Create new template
  const createTemplate = async (template: Omit<IndustryTemplate, 'id' | 'isSystem' | 'usageCount' | 'ratingAvg' | 'ratingCount' | 'createdAt' | 'createdBy'>) => {
    if (!user) {
      toast.error('Please sign in to create templates');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('industry_template_library')
        .insert({
          name: template.name,
          description: template.description,
          industry: template.industry,
          sub_industry: template.subIndustry,
          template_type: template.templateType,
          frameworks: template.frameworks,
          tags: template.tags,
          slide_suggestions: template.slideSuggestions,
          recommended_visuals: template.recommendedVisuals,
          visibility: template.visibility,
          created_by: user.id,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newTemplate = mapDbToTemplate(data);
      setIndustryTemplates(prev => [...prev, newTemplate]);
      toast.success('Template created successfully');
      return newTemplate;
    } catch (err: any) {
      toast.error(`Failed to create template: ${err.message}`);
      return null;
    }
  };

  // Refresh from database
  const refresh = async () => {
    setLoading(true);
    try {
      const { data: frameworksData } = await supabase
        .from('custom_consulting_frameworks')
        .select('*')
        .order('name');

      const { data: templatesData } = await supabase
        .from('industry_template_library')
        .select('*')
        .order('name');

      if (frameworksData && frameworksData.length > 0) {
        setConsultingFrameworks(frameworksData.map(mapDbToFramework));
      }

      if (templatesData && templatesData.length > 0) {
        setIndustryTemplates(templatesData.map(mapDbToTemplate));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    consultingFrameworks,
    industryTemplates,
    userFrameworks,
    userTemplates,
    loading,
    error,
    
    // Getters
    getFrameworksByCategory,
    getTemplatesByIndustry,
    
    // Actions
    createFramework,
    createTemplate,
    refresh,
  };
}

export default useTemplateLibrary;
