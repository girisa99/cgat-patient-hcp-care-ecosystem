/**
 * SIMPLE COMPOSITION STUDIO V3
 * 
 * Streamlined 2-step content creation with:
 * - IP-based primary language detection
 * - Multi-select dropdowns for templates, languages, visual types
 * - No nested cards/iframes
 * - Voice/music per chapter OR entire video
 * - Script generation per chapter OR all at once
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MultiSelectDropdown, MultiSelectOption } from '@/components/ui/multi-select-dropdown';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Wand2, Plus, Globe, Play, Upload, Save, Trash2,
  Sparkles, Video, User, Box, ChevronDown, ChevronUp,
  Loader2, Volume2, Music, GripVertical,
  Copy, Settings2, Zap, RotateCcw, X,
  Building2, MapPin, Pencil, Image, Presentation, 
  Monitor, Camera, Layers, Film, Mic,
  Send, FileCheck, BookTemplate, Share2, ThumbsUp, ThumbsDown,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useIPBasedContent } from '@/hooks/useIPBasedContent';
import { useStudioEcosystem } from './useStudioEcosystem';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { useLabelStudioBackground } from '@/services/labelStudioBackgroundService';
import { ChapterPreviewPanel } from './ChapterPreviewPanel';
import { ReviewEnhanceStep } from './ReviewEnhanceStep';
import { GeneratedAssetsSidebar, GeneratedAssetsTrigger } from './GeneratedAssetsSidebar';

// ============================================
// INDUSTRY-SPECIFIC TEMPLATES (Multi-select ready) - 80+ templates
// ============================================
const INDUSTRY_TEMPLATES: MultiSelectOption[] = [
  // === GOVERNMENT & NATIONAL INITIATIVES ===
  { id: 'saudi_vision_2030', value: 'saudi_vision_2030', label: 'Saudi Vision 2030', category: 'Government', description: 'Digital transformation for Saudi initiatives' },
  { id: 'uae_digital', value: 'uae_digital', label: 'UAE Digital Government', category: 'Government', description: 'UAE smart services' },
  { id: 'qatar_2030', value: 'qatar_2030', label: 'Qatar National Vision 2030', category: 'Government', description: 'Qatar diversification strategy' },
  { id: 'oman_2040', value: 'oman_2040', label: 'Oman Vision 2040', category: 'Government', description: 'Oman economic diversification' },
  { id: 'bahrain_2030', value: 'bahrain_2030', label: 'Bahrain Economic Vision', category: 'Government', description: 'Bahrain economic reform' },
  { id: 'kuwait_2035', value: 'kuwait_2035', label: 'Kuwait Vision 2035', category: 'Government', description: 'New Kuwait development' },
  
  // === INDIA FULL ECOSYSTEM ===
  { id: 'india_digital', value: 'india_digital', label: 'Digital India Initiative', category: 'India', description: 'India digital transformation' },
  { id: 'india_upi', value: 'india_upi', label: 'UPI Payment Revolution', category: 'India', description: 'UPI and digital payments' },
  { id: 'india_aadhaar', value: 'india_aadhaar', label: 'Aadhaar Digital Identity', category: 'India', description: 'World\'s largest biometric system' },
  { id: 'india_startup', value: 'india_startup', label: 'Startup India', category: 'India', description: 'India startup ecosystem' },
  { id: 'india_make', value: 'india_make', label: 'Make in India', category: 'India', description: 'Manufacturing initiative' },
  { id: 'india_smart_city', value: 'india_smart_city', label: 'Smart Cities Mission', category: 'India', description: '100 smart cities development' },
  { id: 'india_healthcare', value: 'india_healthcare', label: 'Ayushman Bharat', category: 'India', description: 'Healthcare for all initiative' },
  { id: 'india_education', value: 'india_education', label: 'NEP 2020 Education', category: 'India', description: 'National Education Policy' },
  { id: 'india_agritech', value: 'india_agritech', label: 'India AgriTech', category: 'India', description: 'Agricultural innovation' },
  { id: 'india_fintech', value: 'india_fintech', label: 'India Fintech Hub', category: 'India', description: 'Financial technology ecosystem' },
  { id: 'india_ev', value: 'india_ev', label: 'India EV Mission', category: 'India', description: 'Electric vehicle adoption' },
  { id: 'india_renewable', value: 'india_renewable', label: 'India Green Energy', category: 'India', description: 'Renewable energy transition' },
  { id: 'india_tourism', value: 'india_tourism', label: 'Incredible India', category: 'India', description: 'Tourism promotion' },
  { id: 'india_cultural', value: 'india_cultural', label: 'India Cultural Heritage', category: 'India', description: 'Cultural preservation' },
  
  // === PAKISTAN ECOSYSTEM ===
  { id: 'pakistan_digital', value: 'pakistan_digital', label: 'Digital Pakistan', category: 'Pakistan', description: 'Digital transformation vision' },
  { id: 'pakistan_kamyab', value: 'pakistan_kamyab', label: 'Kamyab Jawan', category: 'Pakistan', description: 'Youth entrepreneurship' },
  { id: 'pakistan_cpec', value: 'pakistan_cpec', label: 'CPEC Development', category: 'Pakistan', description: 'China-Pakistan corridor' },
  { id: 'pakistan_it_exports', value: 'pakistan_it_exports', label: 'Pakistan IT Exports', category: 'Pakistan', description: 'IT services industry' },
  { id: 'pakistan_tourism', value: 'pakistan_tourism', label: 'Pakistan Tourism', category: 'Pakistan', description: 'Tourism destinations' },
  
  // === BANGLADESH ECOSYSTEM ===
  { id: 'bangladesh_digital', value: 'bangladesh_digital', label: 'Digital Bangladesh', category: 'Bangladesh', description: 'Digital transformation' },
  { id: 'bangladesh_garments', value: 'bangladesh_garments', label: 'Bangladesh RMG Industry', category: 'Bangladesh', description: 'Garments manufacturing' },
  { id: 'bangladesh_fintech', value: 'bangladesh_fintech', label: 'Bangladesh Mobile Finance', category: 'Bangladesh', description: 'bKash and mobile banking' },
  { id: 'bangladesh_it', value: 'bangladesh_it', label: 'Bangladesh IT Hub', category: 'Bangladesh', description: 'Emerging IT sector' },
  { id: 'bangladesh_climate', value: 'bangladesh_climate', label: 'Bangladesh Climate Action', category: 'Bangladesh', description: 'Climate resilience' },
  
  // === CJK (China, Japan, Korea) ===
  { id: 'china_belt_road', value: 'china_belt_road', label: 'Belt & Road Initiative', category: 'CJK', description: 'Global infrastructure' },
  { id: 'china_ai', value: 'china_ai', label: 'China AI Leadership', category: 'CJK', description: 'AI development strategy' },
  { id: 'china_green', value: 'china_green', label: 'China Green Transition', category: 'CJK', description: 'Carbon neutrality goals' },
  { id: 'japan_society5', value: 'japan_society5', label: 'Japan Society 5.0', category: 'CJK', description: 'Super smart society' },
  { id: 'japan_manufacturing', value: 'japan_manufacturing', label: 'Japan Industry 4.0', category: 'CJK', description: 'Monozukuri + AI' },
  { id: 'japan_tourism', value: 'japan_tourism', label: 'Japan Tourism', category: 'CJK', description: 'Cultural tourism' },
  { id: 'korea_digital', value: 'korea_digital', label: 'Digital New Deal', category: 'CJK', description: 'Korea digital economy' },
  { id: 'korea_kpop', value: 'korea_kpop', label: 'K-Wave Cultural Export', category: 'CJK', description: 'K-pop and K-drama' },
  { id: 'korea_semiconductor', value: 'korea_semiconductor', label: 'Korea Semiconductor', category: 'CJK', description: 'Chip manufacturing' },
  { id: 'taiwan_tech', value: 'taiwan_tech', label: 'Taiwan Tech Hub', category: 'CJK', description: 'Technology manufacturing' },
  
  // === INDO-ASIA / SOUTHEAST ASIA ===
  { id: 'indonesia_digital', value: 'indonesia_digital', label: 'Indonesia Digital Economy', category: 'Indo-Asia', description: 'Digital archipelago' },
  { id: 'indonesia_tourism', value: 'indonesia_tourism', label: 'Wonderful Indonesia', category: 'Indo-Asia', description: 'Tourism destinations' },
  { id: 'malaysia_digital', value: 'malaysia_digital', label: 'Malaysia Digital', category: 'Indo-Asia', description: 'Digital transformation' },
  { id: 'thailand_4', value: 'thailand_4', label: 'Thailand 4.0', category: 'Indo-Asia', description: 'Value-based economy' },
  { id: 'vietnam_digital', value: 'vietnam_digital', label: 'Vietnam Digital', category: 'Indo-Asia', description: 'Manufacturing hub' },
  { id: 'singapore_smart', value: 'singapore_smart', label: 'Smart Nation Singapore', category: 'Indo-Asia', description: 'Smart city leader' },
  { id: 'philippines_digital', value: 'philippines_digital', label: 'Philippines Digital', category: 'Indo-Asia', description: 'BPO and digital' },
  { id: 'asean_integration', value: 'asean_integration', label: 'ASEAN Integration', category: 'Indo-Asia', description: 'Regional cooperation' },
  
  // === CARIBBEAN ===
  { id: 'caribbean_tourism', value: 'caribbean_tourism', label: 'Caribbean Tourism', category: 'Caribbean', description: 'Island destinations' },
  { id: 'caribbean_digital', value: 'caribbean_digital', label: 'Caribbean Digital Hub', category: 'Caribbean', description: 'Tech innovation islands' },
  { id: 'caribbean_fintech', value: 'caribbean_fintech', label: 'Caribbean Fintech', category: 'Caribbean', description: 'Financial services' },
  { id: 'caribbean_renewable', value: 'caribbean_renewable', label: 'Caribbean Green Energy', category: 'Caribbean', description: 'Renewable transition' },
  { id: 'jamaica_digital', value: 'jamaica_digital', label: 'Digital Jamaica', category: 'Caribbean', description: 'Jamaica tech ecosystem' },
  { id: 'trinidad_energy', value: 'trinidad_energy', label: 'Trinidad Energy Sector', category: 'Caribbean', description: 'Energy diversification' },
  { id: 'barbados_fintech', value: 'barbados_fintech', label: 'Barbados Global Hub', category: 'Caribbean', description: 'International business' },
  
  // === AFRICA ===
  { id: 'africa_tourism', value: 'africa_tourism', label: 'Africa Tourism', category: 'Africa', description: 'African destinations showcase' },
  { id: 'africa_fintech', value: 'africa_fintech', label: 'Africa Fintech Rise', category: 'Africa', description: 'Mobile money revolution' },
  { id: 'africa_agritech', value: 'africa_agritech', label: 'Africa AgriTech', category: 'Africa', description: 'Agricultural innovation' },
  { id: 'nigeria_tech', value: 'nigeria_tech', label: 'Nigeria Tech Ecosystem', category: 'Africa', description: 'Lagos tech hub' },
  { id: 'kenya_silicon', value: 'kenya_silicon', label: 'Silicon Savannah', category: 'Africa', description: 'Kenya tech innovation' },
  { id: 'south_africa_digital', value: 'south_africa_digital', label: 'South Africa Digital', category: 'Africa', description: 'Digital transformation' },
  { id: 'rwanda_smart', value: 'rwanda_smart', label: 'Rwanda Smart Nation', category: 'Africa', description: 'Digital governance' },
  { id: 'ethiopia_rise', value: 'ethiopia_rise', label: 'Ethiopia Rising', category: 'Africa', description: 'Economic development' },
  
  // === MENA/TOURISM ===
  { id: 'mena_tourism', value: 'mena_tourism', label: 'MENA Tourism', category: 'Tourism', description: 'Middle East experiences' },
  { id: 'asia_tourism', value: 'asia_tourism', label: 'Southeast Asia', category: 'Tourism', description: 'SEA destinations' },
  { id: 'europe_tourism', value: 'europe_tourism', label: 'Europe Heritage', category: 'Tourism', description: 'European destinations' },
  
  // === HEALTHCARE ===
  { id: 'healthcare_digital', value: 'healthcare_digital', label: 'Digital Healthcare', category: 'Healthcare', description: 'Healthcare tech innovation' },
  { id: 'pharma_product', value: 'pharma_product', label: 'Pharma Product Launch', category: 'Healthcare', description: 'Drug/treatment intro' },
  { id: 'healthcare_ai', value: 'healthcare_ai', label: 'AI Diagnostics', category: 'Healthcare', description: 'AI-powered healthcare' },
  { id: 'telemedicine', value: 'telemedicine', label: 'Telemedicine Platform', category: 'Healthcare', description: 'Remote healthcare' },
  
  // === FINANCE ===
  { id: 'banking_digital', value: 'banking_digital', label: 'Digital Banking', category: 'Finance', description: 'Modern fintech solutions' },
  { id: 'investment_pitch', value: 'investment_pitch', label: 'Investment Pitch', category: 'Finance', description: 'Startup pitch deck' },
  { id: 'islamic_finance', value: 'islamic_finance', label: 'Islamic Finance', category: 'Finance', description: 'Shariah-compliant products' },
  { id: 'crypto_defi', value: 'crypto_defi', label: 'Crypto/DeFi Explainer', category: 'Finance', description: 'Blockchain finance' },
  
  // === TECHNOLOGY ===
  { id: 'saas_demo', value: 'saas_demo', label: 'SaaS Product Demo', category: 'Technology', description: 'Software demonstration' },
  { id: 'ai_showcase', value: 'ai_showcase', label: 'AI/ML Showcase', category: 'Technology', description: 'AI capabilities demo' },
  { id: 'cybersecurity', value: 'cybersecurity', label: 'Cybersecurity Solutions', category: 'Technology', description: 'Security products' },
  { id: 'cloud_services', value: 'cloud_services', label: 'Cloud Services', category: 'Technology', description: 'Cloud offerings' },
  
  // === EDUCATION ===
  { id: 'education_course', value: 'education_course', label: 'Online Course', category: 'Education', description: 'Course materials' },
  { id: 'corporate_training', value: 'corporate_training', label: 'Corporate Training', category: 'Education', description: 'Employee training' },
  { id: 'university_promo', value: 'university_promo', label: 'University Promotion', category: 'Education', description: 'Academic institution' },
  
  // === LANDING PAGES ===
  { id: 'landing_hero', value: 'landing_hero', label: 'Hero Showcase', category: 'Landing Page', description: 'Website hero video' },
  { id: 'landing_product', value: 'landing_product', label: 'Product Demo', category: 'Landing Page', description: 'Product walkthrough' },
  { id: 'landing_testimonial', value: 'landing_testimonial', label: 'Testimonials', category: 'Landing Page', description: 'Customer stories' },
  { id: 'landing_explainer', value: 'landing_explainer', label: 'Explainer Video', category: 'Landing Page', description: 'Concept explanation' },
  
  // === SOCIAL MEDIA ===
  { id: 'social_short', value: 'social_short', label: 'Short Form (Reels)', category: 'Social Media', description: 'TikTok/Reels ready' },
  { id: 'social_carousel', value: 'social_carousel', label: 'Carousel Post', category: 'Social Media', description: 'LinkedIn/Instagram slides' },
  { id: 'social_youtube', value: 'social_youtube', label: 'YouTube Long Form', category: 'Social Media', description: 'Full YouTube video' },
  { id: 'social_stories', value: 'social_stories', label: 'Stories Format', category: 'Social Media', description: 'Instagram/WhatsApp stories' },
  
  // === USE CASES & SCENARIOS ===
  { id: 'usecase_onboarding', value: 'usecase_onboarding', label: 'Employee Onboarding', category: 'Use Cases', description: 'New hire training' },
  { id: 'usecase_sales_enablement', value: 'usecase_sales_enablement', label: 'Sales Enablement', category: 'Use Cases', description: 'Sales team training' },
  { id: 'usecase_customer_success', value: 'usecase_customer_success', label: 'Customer Success', category: 'Use Cases', description: 'Customer education' },
  { id: 'usecase_compliance', value: 'usecase_compliance', label: 'Compliance Training', category: 'Use Cases', description: 'Regulatory training' },
  { id: 'usecase_product_launch', value: 'usecase_product_launch', label: 'Product Launch', category: 'Use Cases', description: 'Launch campaign' },
  { id: 'usecase_investor_update', value: 'usecase_investor_update', label: 'Investor Update', category: 'Use Cases', description: 'Quarterly reports' },
  { id: 'usecase_internal_comms', value: 'usecase_internal_comms', label: 'Internal Communications', category: 'Use Cases', description: 'Team updates' },
  { id: 'usecase_event_promo', value: 'usecase_event_promo', label: 'Event Promotion', category: 'Use Cases', description: 'Conference/webinar promo' },
  { id: 'usecase_case_study', value: 'usecase_case_study', label: 'Case Study Video', category: 'Use Cases', description: 'Success story' },
  { id: 'usecase_how_to', value: 'usecase_how_to', label: 'How-To Tutorial', category: 'Use Cases', description: 'Step-by-step guide' },
  
  // === NORTH AMERICA ===
  { id: 'usa_tech_hub', value: 'usa_tech_hub', label: 'USA Tech Innovation', category: 'North America', description: 'Silicon Valley ecosystem' },
  { id: 'usa_healthcare', value: 'usa_healthcare', label: 'USA Healthcare Tech', category: 'North America', description: 'HealthTech innovation' },
  { id: 'usa_fintech', value: 'usa_fintech', label: 'USA Fintech', category: 'North America', description: 'Financial innovation' },
  { id: 'canada_tech', value: 'canada_tech', label: 'Canada Tech Corridor', category: 'North America', description: 'Toronto-Waterloo hub' },
  { id: 'canada_ai', value: 'canada_ai', label: 'Canada AI Leadership', category: 'North America', description: 'AI research excellence' },
  { id: 'canada_cleantech', value: 'canada_cleantech', label: 'Canada CleanTech', category: 'North America', description: 'Green technology' },
  { id: 'mexico_nearshore', value: 'mexico_nearshore', label: 'Mexico Nearshore Hub', category: 'North America', description: 'Tech outsourcing' },
  
  // === EUROPE ===
  { id: 'eu_digital', value: 'eu_digital', label: 'EU Digital Strategy', category: 'Europe', description: 'European digital transformation' },
  { id: 'uk_fintech', value: 'uk_fintech', label: 'UK Fintech Capital', category: 'Europe', description: 'London fintech ecosystem' },
  { id: 'germany_industry4', value: 'germany_industry4', label: 'Germany Industry 4.0', category: 'Europe', description: 'Smart manufacturing' },
  { id: 'france_tech', value: 'france_tech', label: 'La French Tech', category: 'Europe', description: 'French startup scene' },
  { id: 'nordic_innovation', value: 'nordic_innovation', label: 'Nordic Innovation', category: 'Europe', description: 'Scandinavian tech' },
  { id: 'estonia_digital', value: 'estonia_digital', label: 'Estonia e-Residency', category: 'Europe', description: 'Digital nation' },
  { id: 'ireland_tech', value: 'ireland_tech', label: 'Ireland Tech Hub', category: 'Europe', description: 'European HQ for tech' },
  { id: 'spain_startup', value: 'spain_startup', label: 'Spain Startup Nation', category: 'Europe', description: 'Spanish ecosystem' },
  
  // === AUSTRALIA & OCEANIA ===
  { id: 'australia_fintech', value: 'australia_fintech', label: 'Australia Fintech', category: 'Australia/Oceania', description: 'APAC fintech hub' },
  { id: 'australia_mining_tech', value: 'australia_mining_tech', label: 'Australia Mining Tech', category: 'Australia/Oceania', description: 'Resources innovation' },
  { id: 'australia_agritech', value: 'australia_agritech', label: 'Australia AgriTech', category: 'Australia/Oceania', description: 'Agricultural tech' },
  { id: 'nz_innovation', value: 'nz_innovation', label: 'New Zealand Innovation', category: 'Australia/Oceania', description: 'Kiwi tech scene' },
  { id: 'pacific_digital', value: 'pacific_digital', label: 'Pacific Islands Digital', category: 'Australia/Oceania', description: 'Pacific connectivity' },
  
  // === EXPANDED AFRICA ===
  { id: 'egypt_tech', value: 'egypt_tech', label: 'Egypt Tech Hub', category: 'Africa', description: 'MENA-Africa bridge' },
  { id: 'morocco_offshoring', value: 'morocco_offshoring', label: 'Morocco Offshoring', category: 'Africa', description: 'Nearshore Africa' },
  { id: 'ghana_tech', value: 'ghana_tech', label: 'Ghana Tech Ecosystem', category: 'Africa', description: 'Accra tech hub' },
  { id: 'tanzania_digital', value: 'tanzania_digital', label: 'Tanzania Digital', category: 'Africa', description: 'East Africa growth' },
  { id: 'senegal_tech', value: 'senegal_tech', label: 'Senegal Tech', category: 'Africa', description: 'Francophone Africa hub' },
  
  // === EXPANDED CARIBBEAN ===
  { id: 'bahamas_fintech', value: 'bahamas_fintech', label: 'Bahamas Digital Assets', category: 'Caribbean', description: 'Crypto-friendly nation' },
  { id: 'puerto_rico_tech', value: 'puerto_rico_tech', label: 'Puerto Rico Tech', category: 'Caribbean', description: 'Tech tax haven' },
  { id: 'dominican_bpo', value: 'dominican_bpo', label: 'Dominican Republic BPO', category: 'Caribbean', description: 'Business services' },
  { id: 'cayman_fintech', value: 'cayman_fintech', label: 'Cayman Fintech', category: 'Caribbean', description: 'Financial services' },
  
  // === EXPANDED LATAM ===
  { id: 'brazil_fintech', value: 'brazil_fintech', label: 'Brazil Fintech Boom', category: 'Latin America', description: 'PIX and beyond' },
  { id: 'argentina_startup', value: 'argentina_startup', label: 'Argentina Unicorns', category: 'Latin America', description: 'Tech entrepreneurship' },
  { id: 'chile_startup', value: 'chile_startup', label: 'Chile StartUp', category: 'Latin America', description: 'Start-Up Chile program' },
  { id: 'colombia_tech', value: 'colombia_tech', label: 'Colombia Tech Rise', category: 'Latin America', description: 'Medellin transformation' },
  { id: 'peru_digital', value: 'peru_digital', label: 'Peru Digital', category: 'Latin America', description: 'Digital inclusion' },
  { id: 'uruguay_tech', value: 'uruguay_tech', label: 'Uruguay Tech Hub', category: 'Latin America', description: 'Small but mighty' },
  
  // === QUICK START ===
  { id: 'blank', value: 'blank', label: 'Start Blank', category: 'Quick Start', description: 'Empty canvas' },
  { id: 'single', value: 'single', label: 'Single Chapter', category: 'Quick Start', description: 'Quick one-off' },
  { id: '3_chapter', value: '3_chapter', label: '3 Chapters', category: 'Quick Start', description: 'Short series' },
  { id: '5_chapter', value: '5_chapter', label: '5 Chapters', category: 'Quick Start', description: 'Standard series' },
];

// Template chapters mapping - expanded for all templates
const TEMPLATE_CHAPTERS: Record<string, string[]> = {
  // Government/Vision
  saudi_vision_2030: ['Vision Overview', 'Economic Diversification', 'Digital Infrastructure', 'Smart Cities', 'Future Outlook'],
  uae_digital: ['Digital Transformation', 'Smart Services', 'Innovation Hub', 'Future Plans'],
  qatar_2030: ['National Vision', 'Economic Pillars', 'Human Development', 'Environmental Strategy', 'Future Goals'],
  oman_2040: ['Vision Overview', 'Economic Diversification', 'Tourism & Heritage', 'Digital Infrastructure'],
  bahrain_2030: ['Economic Reform', 'Digital Banking Hub', 'Tourism Growth', 'Future Vision'],
  kuwait_2035: ['New Kuwait Vision', 'Economic Development', 'Infrastructure', 'Digital Services'],
  
  // India
  india_digital: ['Digital India Vision', 'UPI Revolution', 'Aadhaar Ecosystem', 'Digital Infrastructure', 'Future Roadmap'],
  india_upi: ['UPI Introduction', 'Technology Behind UPI', 'Merchant Adoption', 'Global Expansion', 'Future of Payments'],
  india_aadhaar: ['Aadhaar Vision', 'Technology Architecture', 'Use Cases', 'Privacy & Security', 'Global Impact'],
  india_startup: ['Startup India Launch', 'Ecosystem Growth', 'Unicorn Stories', 'Government Support', 'Future Outlook'],
  india_make: ['Make in India Vision', 'Manufacturing Sectors', 'FDI Growth', 'Success Stories', 'Roadmap'],
  india_smart_city: ['Smart Cities Mission', 'Technology Stack', 'City Transformations', 'Citizen Services', 'Future Plans'],
  india_healthcare: ['Ayushman Bharat Vision', 'Coverage & Impact', 'Digital Health Stack', 'Success Stories'],
  india_education: ['NEP 2020 Vision', 'Key Reforms', 'Digital Learning', 'Implementation Progress'],
  india_agritech: ['AgriTech Revolution', 'Technology Solutions', 'Farmer Stories', 'Market Access', 'Future Vision'],
  india_fintech: ['Fintech Ecosystem', 'Key Players', 'Innovation Stories', 'Regulatory Framework', 'Growth Outlook'],
  india_ev: ['EV Mission India', 'Infrastructure Development', 'Manufacturing', 'Adoption Trends', 'Future Roadmap'],
  india_renewable: ['Green Energy Vision', 'Solar Revolution', 'Wind Energy', 'Grid Modernization', 'Carbon Goals'],
  india_tourism: ['Incredible India', 'Heritage Sites', 'Natural Wonders', 'Cultural Experiences', 'Travel Guide'],
  india_cultural: ['Cultural Heritage', 'Ancient Traditions', 'Art Forms', 'Preservation Efforts', 'Experience India'],
  
  // Pakistan
  pakistan_digital: ['Digital Pakistan Vision', 'IT Infrastructure', 'E-Government', 'Digital Economy', 'Future Goals'],
  pakistan_kamyab: ['Youth Vision', 'Entrepreneurship Programs', 'Success Stories', 'Support Ecosystem'],
  pakistan_cpec: ['CPEC Overview', 'Infrastructure Projects', 'Economic Corridors', 'Future Development'],
  pakistan_it_exports: ['IT Industry Growth', 'Key Sectors', 'Talent Pool', 'Export Markets', 'Growth Strategy'],
  pakistan_tourism: ['Beautiful Pakistan', 'Northern Areas', 'Historical Sites', 'Adventure Tourism', 'Travel Info'],
  
  // Bangladesh
  bangladesh_digital: ['Digital Bangladesh', 'Digital Services', 'IT Growth', 'Innovation Hub', 'Future Vision'],
  bangladesh_garments: ['RMG Industry', 'Global Leadership', 'Sustainability', 'Worker Welfare', 'Future Outlook'],
  bangladesh_fintech: ['Mobile Finance Revolution', 'bKash Story', 'Financial Inclusion', 'Digital Payments', 'Growth Trajectory'],
  bangladesh_it: ['Emerging IT Hub', 'Talent Development', 'Software Exports', 'Tech Parks', 'Future Vision'],
  bangladesh_climate: ['Climate Challenges', 'Adaptation Strategies', 'Green Growth', 'International Leadership'],
  
  // CJK
  china_belt_road: ['BRI Vision', 'Infrastructure Projects', 'Trade Corridors', 'Partnership Stories', 'Future Expansion'],
  china_ai: ['AI Strategy', 'Research Leadership', 'Applications', 'Industry Integration', 'Future Goals'],
  china_green: ['Carbon Neutrality Goals', 'Renewable Energy', 'EV Revolution', 'Green Industry', 'Climate Action'],
  japan_society5: ['Society 5.0 Vision', 'Technology Integration', 'Human-Centered AI', 'Implementation', 'Future Japan'],
  japan_manufacturing: ['Monozukuri Legacy', 'Smart Factory', 'Robotics Integration', 'Quality Excellence', 'Future Manufacturing'],
  japan_tourism: ['Japan Experience', 'Cultural Heritage', 'Modern Japan', 'Travel Guide', 'Seasonal Beauty'],
  korea_digital: ['Digital New Deal', 'AI & Data', '5G Infrastructure', 'Green New Deal', 'Future Korea'],
  korea_kpop: ['K-Wave Phenomenon', 'K-Pop Industry', 'K-Drama Global', 'Cultural Export', 'Future Trends'],
  korea_semiconductor: ['Chip Leadership', 'Technology Innovation', 'Manufacturing Excellence', 'Global Supply', 'Future Development'],
  taiwan_tech: ['Tech Manufacturing Hub', 'Semiconductor Leadership', 'Innovation Ecosystem', 'Global Supply Chain'],
  
  // Indo-Asia
  indonesia_digital: ['Digital Archipelago', 'Unicorn Ecosystem', 'E-Commerce Growth', 'Digital Inclusion', 'Future Vision'],
  indonesia_tourism: ['Wonderful Indonesia', 'Bali Experience', 'Cultural Heritage', 'Natural Wonders', 'Travel Guide'],
  malaysia_digital: ['Malaysia Digital', 'Tech Ecosystem', 'Digital Economy', 'Innovation Hub', 'Future Goals'],
  thailand_4: ['Thailand 4.0', 'Value-Based Economy', 'S-Curve Industries', 'EEC Development', 'Future Thailand'],
  vietnam_digital: ['Vietnam Digital', 'Manufacturing Hub', 'Tech Ecosystem', 'Innovation Growth', 'Future Vision'],
  singapore_smart: ['Smart Nation', 'Digital Government', 'AI Singapore', 'Innovation Hub', 'Future City'],
  philippines_digital: ['Philippines Digital', 'BPO Excellence', 'Startup Ecosystem', 'Digital Services', 'Growth Vision'],
  asean_integration: ['ASEAN Vision', 'Economic Integration', 'Digital ASEAN', 'Trade Corridors', 'Future Cooperation'],
  
  // Caribbean
  caribbean_tourism: ['Island Paradise', 'Beach Destinations', 'Cultural Experiences', 'Adventure Tourism', 'Travel Guide'],
  caribbean_digital: ['Digital Caribbean', 'Tech Innovation', 'Remote Work Hub', 'Digital Services', 'Future Vision'],
  caribbean_fintech: ['Caribbean Fintech', 'Digital Banking', 'Payment Solutions', 'Financial Inclusion', 'Growth Outlook'],
  caribbean_renewable: ['Green Caribbean', 'Solar Energy', 'Wind Power', 'Climate Resilience', 'Sustainable Future'],
  jamaica_digital: ['Digital Jamaica', 'Tech Ecosystem', 'Startup Scene', 'Digital Services', 'Growth Vision'],
  trinidad_energy: ['Energy Sector', 'LNG Leadership', 'Diversification', 'Renewable Transition', 'Future Energy'],
  barbados_fintech: ['Global Business Hub', 'Fintech Center', 'International Services', 'Innovation Ecosystem'],
  
  // Africa
  africa_tourism: ['Wildlife Safari', 'Cultural Heritage', 'Adventure Tourism', 'Beach Destinations', 'Eco Tourism'],
  africa_fintech: ['Fintech Revolution', 'Mobile Money', 'M-Pesa Story', 'Financial Inclusion', 'Future Finance'],
  africa_agritech: ['AgriTech Africa', 'Technology Solutions', 'Farmer Impact', 'Market Access', 'Food Security'],
  nigeria_tech: ['Nigeria Tech', 'Lagos Startup Scene', 'Unicorn Stories', 'Talent Pool', 'Future Outlook'],
  kenya_silicon: ['Silicon Savannah', 'M-Pesa Revolution', 'Innovation Hub', 'Startup Ecosystem', 'Future Vision'],
  south_africa_digital: ['Digital SA', 'Tech Ecosystem', 'Innovation Hub', 'Digital Economy', 'Future Goals'],
  rwanda_smart: ['Smart Rwanda', 'Digital Governance', 'Innovation Hub', 'Drone Delivery', 'Future Vision'],
  ethiopia_rise: ['Ethiopia Rising', 'Economic Growth', 'Infrastructure', 'Digital Economy', 'Future Vision'],
  
  // Tourism/Regional
  mena_tourism: ['Historical Sites', 'Modern Attractions', 'Cultural Experiences', 'Luxury Tourism'],
  asia_tourism: ['Thailand Temples', 'Vietnam Heritage', 'Indonesia Islands', 'Singapore Modern', 'Local Experiences'],
  europe_tourism: ['Historical Heritage', 'Cultural Capitals', 'Natural Beauty', 'Culinary Experiences'],
  
  // Healthcare
  healthcare_digital: ['Patient Journey', 'Telemedicine', 'AI Diagnostics', 'Future of Care'],
  pharma_product: ['Product Overview', 'Clinical Benefits', 'Patient Stories'],
  healthcare_ai: ['AI in Healthcare', 'Diagnostic AI', 'Treatment Planning', 'Patient Outcomes'],
  telemedicine: ['Telemedicine Platform', 'Virtual Consultations', 'Remote Monitoring', 'Patient Experience'],
  
  // Finance
  banking_digital: ['Digital Banking Vision', 'Mobile First', 'Security & Trust', 'Future Banking'],
  investment_pitch: ['Problem Statement', 'Our Solution', 'Market Opportunity', 'Business Model', 'Investment Ask'],
  islamic_finance: ['Islamic Finance Principles', 'Shariah Compliance', 'Products Overview', 'Growth Outlook'],
  crypto_defi: ['Blockchain Basics', 'DeFi Explained', 'Use Cases', 'Future of Finance'],
  
  // Technology
  saas_demo: ['Product Overview', 'Key Features', 'Use Cases', 'Getting Started'],
  ai_showcase: ['AI Vision', 'Technology Stack', 'Applications', 'Future Roadmap'],
  cybersecurity: ['Security Landscape', 'Solutions Overview', 'Protection Features', 'Implementation'],
  cloud_services: ['Cloud Overview', 'Services Portfolio', 'Migration Path', 'Support & Pricing'],
  
  // Education
  education_course: ['Course Overview', 'Module Preview', 'Learning Outcomes', 'Instructor Bio', 'Enrollment'],
  corporate_training: ['Training Objectives', 'Core Concepts', 'Practical Exercises', 'Assessment'],
  university_promo: ['University Overview', 'Programs', 'Campus Life', 'Admissions', 'Alumni Stories'],
  
  // Landing Pages
  landing_hero: ['Hero Section'],
  landing_product: ['Introduction', 'Features', 'Call to Action'],
  landing_testimonial: ['Client 1', 'Client 2', 'Client 3', 'Client 4', 'Client 5'],
  landing_explainer: ['Problem', 'Solution', 'How It Works', 'Benefits', 'CTA'],
  
  // Social Media
  social_short: ['Short Video'],
  social_carousel: ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4', 'CTA Slide'],
  social_youtube: ['Intro', 'Hook', 'Point 1', 'Point 2', 'Point 3', 'Case Study', 'Summary', 'CTA'],
  social_stories: ['Story 1', 'Story 2', 'Story 3', 'Story 4', 'CTA Story'],
  
  // Use Cases
  usecase_onboarding: ['Welcome', 'Company Overview', 'Role Introduction', 'Tools & Systems', 'Next Steps'],
  usecase_sales_enablement: ['Product Knowledge', 'Value Proposition', 'Objection Handling', 'Demo Skills', 'Closing Techniques'],
  usecase_customer_success: ['Product Overview', 'Key Features', 'Best Practices', 'Tips & Tricks', 'Support Resources'],
  usecase_compliance: ['Compliance Overview', 'Key Requirements', 'Procedures', 'Assessment', 'Certification'],
  usecase_product_launch: ['Product Reveal', 'Key Features', 'Use Cases', 'Availability', 'Call to Action'],
  usecase_investor_update: ['Quarter Highlights', 'Financial Performance', 'Key Metrics', 'Strategic Updates', 'Outlook'],
  usecase_internal_comms: ['Announcement', 'Key Points', 'Impact', 'Next Steps', 'Q&A'],
  usecase_event_promo: ['Event Overview', 'Speakers', 'Agenda Highlights', 'Registration', 'Early Bird Offer'],
  usecase_case_study: ['Client Background', 'Challenge', 'Solution', 'Results', 'Testimonial'],
  usecase_how_to: ['Introduction', 'Step 1', 'Step 2', 'Step 3', 'Tips & Summary'],
  
  // Quick Start
  blank: [],
  single: ['Chapter 1'],
  '3_chapter': ['Introduction', 'Main Content', 'Conclusion'],
  '5_chapter': ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'],
};

// ============================================
// VISUAL TYPES (Multi-select ready) - 80+ formats with regional/language variants
// ============================================
const VISUAL_TYPES: MultiSelectOption[] = [
  // ---- VIDEO (Core) ----
  { id: 'video', value: 'video', label: 'AI Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_cinematic', value: 'video_cinematic', label: 'Cinematic Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_explainer', value: 'video_explainer', label: 'Explainer Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_promo', value: 'video_promo', label: 'Promo Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_testimonial', value: 'video_testimonial', label: 'Testimonial Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_tutorial', value: 'video_tutorial', label: 'Tutorial Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_documentary', value: 'video_documentary', label: 'Documentary Style', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_social_short', value: 'video_social_short', label: 'Short Form (Reels/TikTok)', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_youtube_long', value: 'video_youtube_long', label: 'YouTube Long Form', category: 'Video', icon: <Video className="w-3 h-3" /> },
  
  // ---- ANIMATION ----
  { id: 'animation', value: 'animation', label: 'Animation', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'kinetic_typography', value: 'kinetic_typography', label: 'Kinetic Typography', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'motion_graphics', value: 'motion_graphics', label: 'Motion Graphics', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'logo_animation', value: 'logo_animation', label: 'Logo Animation', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'animated_infographic', value: 'animated_infographic', label: 'Animated Infographic', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'whiteboard_animation', value: 'whiteboard_animation', label: 'Whiteboard Animation', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'particle_effects', value: 'particle_effects', label: 'Particle Effects', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'character_animation', value: 'character_animation', label: 'Character Animation', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'isometric_animation', value: 'isometric_animation', label: 'Isometric Animation', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  
  // ===== STORYTELLING & NARRATIVE (NEW - Creative Characters) =====
  // -- Mythological & Philosophical Explainers --
  { id: 'story_panchatantra', value: 'story_panchatantra', label: 'Panchatantra Style (Animal Fables)', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Ancient Indian animal fable style to teach business lessons' },
  { id: 'story_jataka', value: 'story_jataka', label: 'Jataka Tales Style', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Buddhist birth stories with moral lessons' },
  { id: 'story_ramayana', value: 'story_ramayana', label: 'Ramayana Epic Style', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Epic narrative format for leadership/duty themes' },
  { id: 'story_mahabharata', value: 'story_mahabharata', label: 'Mahabharata Epic Style', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Strategy and ethics through epic narratives' },
  { id: 'story_vedantic', value: 'story_vedantic', label: 'Vedantic Philosophy', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Philosophical concepts animated with symbols' },
  { id: 'story_sufi', value: 'story_sufi', label: 'Sufi Tales (Rumi Style)', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Mystical stories with spiritual insights' },
  { id: 'story_arabian_nights', value: 'story_arabian_nights', label: 'Arabian Nights Style', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: '1001 Nights storytelling format' },
  { id: 'story_aesop', value: 'story_aesop', label: 'Aesop Fables Style', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Western moral fables with animals' },
  { id: 'story_zen_koan', value: 'story_zen_koan', label: 'Zen Koan Narrative', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Paradoxical stories for insight' },
  { id: 'story_african_folklore', value: 'story_african_folklore', label: 'African Folklore (Anansi)', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Spider tales and wisdom stories' },
  { id: 'story_chinese_legend', value: 'story_chinese_legend', label: 'Chinese Legends', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Journey to the West style adventures' },
  { id: 'story_nordic_saga', value: 'story_nordic_saga', label: 'Nordic Saga Style', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Viking/Norse mythology narrative' },
  { id: 'story_greek_myth', value: 'story_greek_myth', label: 'Greek Mythology', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Olympian gods and heroes narrative' },
  { id: 'story_mayan_creation', value: 'story_mayan_creation', label: 'Mayan/Aztec Legends', category: 'Storytelling', icon: <Film className="w-3 h-3" />, description: 'Mesoamerican creation stories' },
  
  // -- Animated Character Explainers --
  { id: 'char_mascot_guide', value: 'char_mascot_guide', label: 'Mascot Character Guide', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Friendly mascot explains concepts' },
  { id: 'char_cartoon_teacher', value: 'char_cartoon_teacher', label: 'Cartoon Teacher', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Animated teacher character' },
  { id: 'char_wise_elder', value: 'char_wise_elder', label: 'Wise Elder/Sage', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Sage character shares wisdom' },
  { id: 'char_robot_helper', value: 'char_robot_helper', label: 'Robot/AI Assistant', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Friendly AI character explains tech' },
  { id: 'char_superhero', value: 'char_superhero', label: 'Superhero Explainer', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Superhero character for impact' },
  { id: 'char_kids_characters', value: 'char_kids_characters', label: 'Kid-Friendly Characters', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Colorful characters for young audience' },
  { id: 'char_animal_cast', value: 'char_animal_cast', label: 'Animal Character Cast', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Team of animal characters' },
  { id: 'char_stick_figure', value: 'char_stick_figure', label: 'Stick Figure Animation', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Simple stick figure explainers' },
  { id: 'char_pixar_style', value: 'char_pixar_style', label: 'Pixar/3D Cartoon Style', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'High-quality 3D cartoon characters' },
  { id: 'char_anime_style', value: 'char_anime_style', label: 'Anime Character Style', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Japanese anime aesthetic' },
  { id: 'char_chibi', value: 'char_chibi', label: 'Chibi/Cute Style', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Super-deformed cute characters' },
  { id: 'char_flat_design', value: 'char_flat_design', label: 'Flat Design Characters', category: 'Character Animation', icon: <User className="w-3 h-3" />, description: 'Modern flat illustration style' },
  
  // -- City/Transformation Narratives --
  { id: 'transform_city_growth', value: 'transform_city_growth', label: 'City Transformation Journey', category: 'Transformation', icon: <Building2 className="w-3 h-3" />, description: 'Show city development over time' },
  { id: 'transform_before_after', value: 'transform_before_after', label: 'Before/After Reveal', category: 'Transformation', icon: <Building2 className="w-3 h-3" />, description: 'Dramatic transformation reveal' },
  { id: 'transform_timeline_evolution', value: 'transform_timeline_evolution', label: 'Timeline Evolution', category: 'Transformation', icon: <Building2 className="w-3 h-3" />, description: 'Historical progression animation' },
  { id: 'transform_smart_city', value: 'transform_smart_city', label: 'Smart City Visualization', category: 'Transformation', icon: <Building2 className="w-3 h-3" />, description: 'Connected IoT city animation' },
  { id: 'transform_rural_urban', value: 'transform_rural_urban', label: 'Rural to Urban Journey', category: 'Transformation', icon: <Building2 className="w-3 h-3" />, description: 'Village to megacity narrative' },
  { id: 'transform_infrastructure', value: 'transform_infrastructure', label: 'Infrastructure Development', category: 'Transformation', icon: <Building2 className="w-3 h-3" />, description: 'Roads, bridges, rail animation' },
  { id: 'transform_green_transition', value: 'transform_green_transition', label: 'Green/Sustainable Transition', category: 'Transformation', icon: <Building2 className="w-3 h-3" />, description: 'Environmental transformation' },
  { id: 'transform_digital_adoption', value: 'transform_digital_adoption', label: 'Digital Adoption Journey', category: 'Transformation', icon: <Building2 className="w-3 h-3" />, description: 'Analog to digital transformation' },
  { id: 'transform_industry_4', value: 'transform_industry_4', label: 'Industry 4.0 Factory', category: 'Transformation', icon: <Building2 className="w-3 h-3" />, description: 'Manufacturing automation journey' },
  
  // -- Creative/Artistic Narrative Styles --
  { id: 'creative_watercolor', value: 'creative_watercolor', label: 'Watercolor Animation', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Painted watercolor aesthetic' },
  { id: 'creative_oil_painting', value: 'creative_oil_painting', label: 'Oil Painting Style', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Classic oil painting animation' },
  { id: 'creative_paper_cutout', value: 'creative_paper_cutout', label: 'Paper Cutout Animation', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Layered paper craft style' },
  { id: 'creative_shadow_puppet', value: 'creative_shadow_puppet', label: 'Shadow Puppet (Wayang)', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Indonesian shadow puppet style' },
  { id: 'creative_woodblock', value: 'creative_woodblock', label: 'Woodblock Print Style', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Japanese ukiyo-e aesthetic' },
  { id: 'creative_mosaic', value: 'creative_mosaic', label: 'Mosaic/Tile Animation', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Byzantine/Islamic mosaic style' },
  { id: 'creative_stained_glass', value: 'creative_stained_glass', label: 'Stained Glass Style', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Cathedral glass aesthetic' },
  { id: 'creative_comic_book', value: 'creative_comic_book', label: 'Comic Book Panels', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Sequential comic style' },
  { id: 'creative_pop_art', value: 'creative_pop_art', label: 'Pop Art Style', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Warhol/Lichtenstein aesthetic' },
  { id: 'creative_graffiti', value: 'creative_graffiti', label: 'Street Art/Graffiti', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Urban street art style' },
  { id: 'creative_vintage_retro', value: 'creative_vintage_retro', label: 'Vintage/Retro Style', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: '50s-80s aesthetic' },
  { id: 'creative_cyberpunk', value: 'creative_cyberpunk', label: 'Cyberpunk Neon', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Futuristic neon aesthetic' },
  { id: 'creative_steampunk', value: 'creative_steampunk', label: 'Steampunk Victorian', category: 'Creative Styles', icon: <Sparkles className="w-3 h-3" />, description: 'Industrial Victorian fusion' },
  
  // ---- AVATAR (Regional Variants) ----
  { id: 'avatar', value: 'avatar', label: 'AI Avatar (Headshot)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_full_body', value: 'avatar_full_body', label: 'Avatar Full Body', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_presenter', value: 'avatar_presenter', label: 'Avatar + Screen', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_western', value: 'avatar_professional_western', label: 'Professional (Western)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_mena', value: 'avatar_professional_mena', label: 'Professional (MENA)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_gulf', value: 'avatar_professional_gulf', label: 'Professional (Gulf/GCC)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_cjk', value: 'avatar_professional_cjk', label: 'Professional (CJK)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_indian', value: 'avatar_professional_indian', label: 'Professional (Indian)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_pakistani', value: 'avatar_professional_pakistani', label: 'Professional (Pakistani)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_bangladeshi', value: 'avatar_professional_bangladeshi', label: 'Professional (Bangladeshi)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_african', value: 'avatar_professional_african', label: 'Professional (African)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_caribbean', value: 'avatar_professional_caribbean', label: 'Professional (Caribbean)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_latam', value: 'avatar_professional_latam', label: 'Professional (LatAm)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_sea', value: 'avatar_professional_sea', label: 'Professional (Southeast Asian)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_casual', value: 'avatar_casual', label: 'Avatar Casual', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_corporate', value: 'avatar_corporate', label: 'Avatar Corporate', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'talking_head', value: 'talking_head', label: 'Talking Head', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_lipsync', value: 'avatar_lipsync', label: 'Avatar with Lip-Sync', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  
  // ---- 3D/IMMERSIVE ----
  { id: '3d', value: '3d', label: '3D Model', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: '3d_product', value: '3d_product', label: '3D Product Showcase', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: '3d_environment', value: '3d_environment', label: '3D Environment', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: '3d_turntable', value: '3d_turntable', label: '3D 360° Turntable', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: '3d_exploded', value: '3d_exploded', label: '3D Exploded View', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: '3d_architectural', value: '3d_architectural', label: '3D Architectural', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: '3d_medical', value: '3d_medical', label: '3D Medical/Anatomy', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: 'immersive', value: 'immersive', label: 'Immersive/VR', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: 'ar_experience', value: 'ar_experience', label: 'AR Experience', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: 'holographic', value: 'holographic', label: 'Holographic Display', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  
  // ---- STATIC/GRAPHICS ----
  { id: 'ppt', value: 'ppt', label: 'PPT/Slides', category: 'Static/Graphics', icon: <Presentation className="w-3 h-3" /> },
  { id: 'images', value: 'images', label: 'AI Images', category: 'Static/Graphics', icon: <Image className="w-3 h-3" /> },
  { id: 'infographics', value: 'infographics', label: 'Infographics', category: 'Static/Graphics', icon: <Layers className="w-3 h-3" /> },
  { id: 'customer_journey', value: 'customer_journey', label: 'Customer Journey Map', category: 'Static/Graphics', icon: <MapPin className="w-3 h-3" /> },
  { id: 'timeline', value: 'timeline', label: 'Timeline', category: 'Static/Graphics', icon: <Layers className="w-3 h-3" /> },
  { id: 'flowchart', value: 'flowchart', label: 'Flowchart', category: 'Static/Graphics', icon: <Layers className="w-3 h-3" /> },
  { id: 'comparison_chart', value: 'comparison_chart', label: 'Comparison Chart', category: 'Static/Graphics', icon: <Layers className="w-3 h-3" /> },
  { id: 'data_visualization', value: 'data_visualization', label: 'Data Visualization', category: 'Static/Graphics', icon: <Layers className="w-3 h-3" /> },
  
  // ---- CAPTURE ----
  { id: 'screen_record', value: 'screen_record', label: 'Screen Recording', category: 'Capture', icon: <Monitor className="w-3 h-3" /> },
  { id: 'screen_demo', value: 'screen_demo', label: 'Screen Demo + Cursor', category: 'Capture', icon: <Monitor className="w-3 h-3" /> },
  { id: 'capture', value: 'capture', label: 'Live Capture', category: 'Capture', icon: <Camera className="w-3 h-3" /> },
  { id: 'interview', value: 'interview', label: 'Interview Style', category: 'Capture', icon: <Mic className="w-3 h-3" /> },
  { id: 'webcam_overlay', value: 'webcam_overlay', label: 'Webcam Overlay', category: 'Capture', icon: <Camera className="w-3 h-3" /> },
  
  // ---- COMBINATIONS (Tier-gated recipes) ----
  { id: 'combo_avatar_ppt', value: 'combo_avatar_ppt', label: 'Avatar + PPT', category: 'Combinations', icon: <Layers className="w-3 h-3" /> },
  { id: 'combo_avatar_screen', value: 'combo_avatar_screen', label: 'Avatar + Screen Demo', category: 'Combinations', icon: <Layers className="w-3 h-3" /> },
  { id: 'combo_3d_voice', value: 'combo_3d_voice', label: '3D + Voiceover', category: 'Combinations', icon: <Box className="w-3 h-3" /> },
  { id: 'combo_3d_avatar', value: 'combo_3d_avatar', label: '3D + Avatar Presenter', category: 'Combinations', icon: <Box className="w-3 h-3" /> },
  { id: 'combo_video_avatar', value: 'combo_video_avatar', label: 'Video + Avatar Overlay', category: 'Combinations', icon: <Film className="w-3 h-3" /> },
  { id: 'combo_animation_voice', value: 'combo_animation_voice', label: 'Animation + Voiceover', category: 'Combinations', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'combo_multi_dialect', value: 'combo_multi_dialect', label: 'Multi-Dialect Demo', category: 'Combinations', icon: <Globe className="w-3 h-3" /> },
  { id: 'combo_interactive_demo', value: 'combo_interactive_demo', label: 'Interactive Product Demo', category: 'Combinations', icon: <Layers className="w-3 h-3" /> },
  { id: 'combo_full_production', value: 'combo_full_production', label: 'Full Production', category: 'Combinations', icon: <Film className="w-3 h-3" /> },
  { id: 'combo_avatar_3d_ppt', value: 'combo_avatar_3d_ppt', label: 'Avatar + 3D + PPT', category: 'Combinations', icon: <Layers className="w-3 h-3" /> },
  { id: 'combo_cinematic_package', value: 'combo_cinematic_package', label: 'Cinematic Package', category: 'Combinations', icon: <Film className="w-3 h-3" /> },
  { id: 'combo_story_character', value: 'combo_story_character', label: 'Story + Character Animation', category: 'Combinations', icon: <Film className="w-3 h-3" /> },
  { id: 'combo_myth_modern', value: 'combo_myth_modern', label: 'Mythology + Modern Context', category: 'Combinations', icon: <Film className="w-3 h-3" /> },
  { id: 'combo_transform_narrate', value: 'combo_transform_narrate', label: 'Transformation + Narrator', category: 'Combinations', icon: <Building2 className="w-3 h-3" /> },
  
  // ---- REGIONAL/CULTURAL (Expanded for ALL major regions) ----
  // MENA/Arabic
  { id: 'regional_mena', value: 'regional_mena', label: 'MENA Styled (RTL)', category: 'Regional - MENA', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_arabic_calligraphy', value: 'regional_arabic_calligraphy', label: 'Arabic Calligraphy', category: 'Regional - MENA', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_islamic_geometric', value: 'regional_islamic_geometric', label: 'Islamic Geometric', category: 'Regional - MENA', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_persian_miniature', value: 'regional_persian_miniature', label: 'Persian Miniature Art', category: 'Regional - MENA', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_arabian_nights', value: 'regional_arabian_nights', label: 'Arabian Nights Style', category: 'Regional - MENA', icon: <Globe className="w-3 h-3" /> },
  
  // India (Expanded)
  { id: 'regional_indian', value: 'regional_indian', label: 'Indian Cultural', category: 'Regional - India', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indian_rangoli', value: 'regional_indian_rangoli', label: 'Rangoli/Mandala Style', category: 'Regional - India', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indian_classical', value: 'regional_indian_classical', label: 'Indian Classical Art', category: 'Regional - India', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indian_madhubani', value: 'regional_indian_madhubani', label: 'Madhubani Art Style', category: 'Regional - India', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indian_warli', value: 'regional_indian_warli', label: 'Warli Tribal Art', category: 'Regional - India', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indian_pattachitra', value: 'regional_indian_pattachitra', label: 'Pattachitra Scroll Art', category: 'Regional - India', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indian_miniature', value: 'regional_indian_miniature', label: 'Mughal Miniature Style', category: 'Regional - India', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indian_kalamkari', value: 'regional_indian_kalamkari', label: 'Kalamkari Textile Art', category: 'Regional - India', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indian_tanjore', value: 'regional_indian_tanjore', label: 'Tanjore Painting Style', category: 'Regional - India', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indian_temple', value: 'regional_indian_temple', label: 'Temple Architecture Style', category: 'Regional - India', icon: <Globe className="w-3 h-3" /> },
  
  // Pakistan & Bangladesh
  { id: 'regional_pakistani', value: 'regional_pakistani', label: 'Pakistani Cultural', category: 'Regional - Pakistan', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_pakistani_truck', value: 'regional_pakistani_truck', label: 'Truck Art Style', category: 'Regional - Pakistan', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_pakistani_ajrak', value: 'regional_pakistani_ajrak', label: 'Ajrak Pattern Style', category: 'Regional - Pakistan', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_pakistani_phulkari', value: 'regional_pakistani_phulkari', label: 'Phulkari Embroidery', category: 'Regional - Pakistan', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_bangladeshi', value: 'regional_bangladeshi', label: 'Bangladeshi Cultural', category: 'Regional - Bangladesh', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_bangladeshi_nakshi', value: 'regional_bangladeshi_nakshi', label: 'Nakshi Kantha Style', category: 'Regional - Bangladesh', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_bangladeshi_jamdani', value: 'regional_bangladeshi_jamdani', label: 'Jamdani Weave Pattern', category: 'Regional - Bangladesh', icon: <Globe className="w-3 h-3" /> },
  
  // CJK (China, Japan, Korea)
  { id: 'regional_cjk', value: 'regional_cjk', label: 'CJK Minimalist', category: 'Regional - CJK', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_japanese', value: 'regional_japanese', label: 'Japanese Zen/Wabi-Sabi', category: 'Regional - CJK', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_japanese_ukiyoe', value: 'regional_japanese_ukiyoe', label: 'Ukiyo-e Woodblock', category: 'Regional - CJK', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_japanese_anime', value: 'regional_japanese_anime', label: 'Anime/Manga Style', category: 'Regional - CJK', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_korean', value: 'regional_korean', label: 'Korean Contemporary', category: 'Regional - CJK', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_korean_dancheong', value: 'regional_korean_dancheong', label: 'Dancheong Traditional', category: 'Regional - CJK', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_chinese', value: 'regional_chinese', label: 'Chinese Traditional', category: 'Regional - CJK', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_chinese_ink', value: 'regional_chinese_ink', label: 'Chinese Ink Wash', category: 'Regional - CJK', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_chinese_paper_cut', value: 'regional_chinese_paper_cut', label: 'Chinese Paper Cut', category: 'Regional - CJK', icon: <Globe className="w-3 h-3" /> },
  
  // Southeast Asia & Indonesia
  { id: 'regional_sea', value: 'regional_sea', label: 'Southeast Asian', category: 'Regional - Southeast Asia', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_thai', value: 'regional_thai', label: 'Thai Temple Art', category: 'Regional - Southeast Asia', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_thai_ramayana', value: 'regional_thai_ramayana', label: 'Thai Ramakien Style', category: 'Regional - Southeast Asia', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indonesian_batik', value: 'regional_indonesian_batik', label: 'Indonesian Batik', category: 'Regional - Southeast Asia', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indonesian_wayang', value: 'regional_indonesian_wayang', label: 'Wayang Shadow Puppet', category: 'Regional - Southeast Asia', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indonesian_borobudur', value: 'regional_indonesian_borobudur', label: 'Borobudur Relief Style', category: 'Regional - Southeast Asia', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_vietnamese_lacquer', value: 'regional_vietnamese_lacquer', label: 'Vietnamese Lacquer Art', category: 'Regional - Southeast Asia', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_philippine_tribal', value: 'regional_philippine_tribal', label: 'Philippine Tribal Patterns', category: 'Regional - Southeast Asia', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_malaysian_songket', value: 'regional_malaysian_songket', label: 'Malaysian Songket', category: 'Regional - Southeast Asia', icon: <Globe className="w-3 h-3" /> },
  
  // Africa (Expanded)
  { id: 'regional_african', value: 'regional_african', label: 'African Heritage', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african_adinkra', value: 'regional_african_adinkra', label: 'Adinkra Symbols (Ghana)', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african_kente', value: 'regional_african_kente', label: 'Kente Weave (Ghana)', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african_ndebele', value: 'regional_african_ndebele', label: 'Ndebele Geometric (South Africa)', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african_maasai', value: 'regional_african_maasai', label: 'Maasai Beadwork (Kenya)', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african_ankara', value: 'regional_african_ankara', label: 'Ankara/African Wax Print', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african_yoruba', value: 'regional_african_yoruba', label: 'Yoruba Art (Nigeria)', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african_ethiopian', value: 'regional_african_ethiopian', label: 'Ethiopian Orthodox Art', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african_zulu', value: 'regional_african_zulu', label: 'Zulu Beadwork Patterns', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african_tingatinga', value: 'regional_african_tingatinga', label: 'Tingatinga Art (Tanzania)', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african_mali_bogolan', value: 'regional_african_mali_bogolan', label: 'Bogolan Mudcloth (Mali)', category: 'Regional - Africa', icon: <Globe className="w-3 h-3" /> },
  
  // Caribbean
  { id: 'regional_caribbean', value: 'regional_caribbean', label: 'Caribbean Vibrant', category: 'Regional - Caribbean', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_caribbean_rastafari', value: 'regional_caribbean_rastafari', label: 'Rastafari Style (Jamaica)', category: 'Regional - Caribbean', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_caribbean_carnival', value: 'regional_caribbean_carnival', label: 'Carnival/Junkanoo Style', category: 'Regional - Caribbean', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_caribbean_taino', value: 'regional_caribbean_taino', label: 'Taíno Indigenous Art', category: 'Regional - Caribbean', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_caribbean_haitian', value: 'regional_caribbean_haitian', label: 'Haitian Vodou Art', category: 'Regional - Caribbean', icon: <Globe className="w-3 h-3" /> },
  
  // Latin America
  { id: 'regional_latam', value: 'regional_latam', label: 'Latin American', category: 'Regional - Latin America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_latam_mayan', value: 'regional_latam_mayan', label: 'Mayan Hieroglyphic', category: 'Regional - Latin America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_latam_aztec', value: 'regional_latam_aztec', label: 'Aztec Sun Stone Style', category: 'Regional - Latin America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_peruvian_inca', value: 'regional_peruvian_inca', label: 'Inca Textile Patterns', category: 'Regional - Latin America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_mexican_alebrije', value: 'regional_mexican_alebrije', label: 'Mexican Alebrije', category: 'Regional - Latin America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_mexican_dia_muertos', value: 'regional_mexican_dia_muertos', label: 'Día de los Muertos', category: 'Regional - Latin America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_brazilian_street', value: 'regional_brazilian_street', label: 'Brazilian Street Art', category: 'Regional - Latin America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_andean_textile', value: 'regional_andean_textile', label: 'Andean Textile Patterns', category: 'Regional - Latin America', icon: <Globe className="w-3 h-3" /> },
  
  // Europe (Heritage)
  { id: 'regional_european_baroque', value: 'regional_european_baroque', label: 'European Baroque', category: 'Regional - Europe', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_european_art_nouveau', value: 'regional_european_art_nouveau', label: 'Art Nouveau', category: 'Regional - Europe', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_european_art_deco', value: 'regional_european_art_deco', label: 'Art Deco', category: 'Regional - Europe', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_celtic', value: 'regional_celtic', label: 'Celtic Knotwork', category: 'Regional - Europe', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_nordic_viking', value: 'regional_nordic_viking', label: 'Nordic Viking', category: 'Regional - Europe', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_russian_folk', value: 'regional_russian_folk', label: 'Russian Folk Art', category: 'Regional - Europe', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_greek_classical', value: 'regional_greek_classical', label: 'Greek Classical', category: 'Regional - Europe', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_spanish_flamenco', value: 'regional_spanish_flamenco', label: 'Spanish Flamenco Style', category: 'Regional - Europe', icon: <Globe className="w-3 h-3" /> },
  
  // North America
  { id: 'regional_native_american', value: 'regional_native_american', label: 'Native American Art', category: 'Regional - North America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_native_northwest', value: 'regional_native_northwest', label: 'Pacific Northwest Totem', category: 'Regional - North America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_native_navajo', value: 'regional_native_navajo', label: 'Navajo Textile Pattern', category: 'Regional - North America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_american_retro', value: 'regional_american_retro', label: 'American Retro 50s', category: 'Regional - North America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_american_pop', value: 'regional_american_pop', label: 'American Pop Art', category: 'Regional - North America', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_canadian_inuit', value: 'regional_canadian_inuit', label: 'Canadian Inuit Art', category: 'Regional - North America', icon: <Globe className="w-3 h-3" /> },
  
  // Australia & Oceania
  { id: 'regional_aboriginal', value: 'regional_aboriginal', label: 'Aboriginal Dot Painting', category: 'Regional - Oceania', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_aboriginal_xray', value: 'regional_aboriginal_xray', label: 'Aboriginal X-Ray Art', category: 'Regional - Oceania', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_maori', value: 'regional_maori', label: 'Māori Ta Moko/Kowhaiwhai', category: 'Regional - Oceania', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_polynesian_tapa', value: 'regional_polynesian_tapa', label: 'Polynesian Tapa Cloth', category: 'Regional - Oceania', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_pacific_island', value: 'regional_pacific_island', label: 'Pacific Island Patterns', category: 'Regional - Oceania', icon: <Globe className="w-3 h-3" /> },
];

// ============================================
// LANGUAGES - 70+ WITH REGIONS (Multi-select ready)
// ============================================
const LANGUAGES: MultiSelectOption[] = [
  // Western/EU
  { id: 'en', value: 'en', label: 'English (US)', category: 'Western/EU' },
  { id: 'en-gb', value: 'en-gb', label: 'English (UK)', category: 'Western/EU' },
  { id: 'es', value: 'es', label: 'Spanish', category: 'Western/EU' },
  { id: 'fr', value: 'fr', label: 'French', category: 'Western/EU' },
  { id: 'de', value: 'de', label: 'German', category: 'Western/EU' },
  { id: 'it', value: 'it', label: 'Italian', category: 'Western/EU' },
  { id: 'pt', value: 'pt', label: 'Portuguese', category: 'Western/EU' },
  { id: 'nl', value: 'nl', label: 'Dutch', category: 'Western/EU' },
  { id: 'pl', value: 'pl', label: 'Polish', category: 'Western/EU' },
  { id: 'ru', value: 'ru', label: 'Russian', category: 'Western/EU' },
  { id: 'uk', value: 'uk', label: 'Ukrainian', category: 'Western/EU' },
  { id: 'tr', value: 'tr', label: 'Turkish', category: 'Western/EU' },
  { id: 'el', value: 'el', label: 'Greek', category: 'Western/EU' },
  { id: 'sv', value: 'sv', label: 'Swedish', category: 'Western/EU' },
  { id: 'da', value: 'da', label: 'Danish', category: 'Western/EU' },
  { id: 'fi', value: 'fi', label: 'Finnish', category: 'Western/EU' },
  { id: 'no', value: 'no', label: 'Norwegian', category: 'Western/EU' },
  { id: 'cs', value: 'cs', label: 'Czech', category: 'Western/EU' },
  { id: 'ro', value: 'ro', label: 'Romanian', category: 'Western/EU' },
  { id: 'hu', value: 'hu', label: 'Hungarian', category: 'Western/EU' },
  // MENA/Arabic
  { id: 'ar', value: 'ar', label: 'Arabic (MSA)', category: 'MENA/Arabic' },
  { id: 'ar-sa', value: 'ar-sa', label: 'Arabic (Saudi)', category: 'MENA/Arabic' },
  { id: 'ar-eg', value: 'ar-eg', label: 'Arabic (Egyptian)', category: 'MENA/Arabic' },
  { id: 'ar-ae', value: 'ar-ae', label: 'Arabic (Gulf/UAE)', category: 'MENA/Arabic' },
  { id: 'ar-ma', value: 'ar-ma', label: 'Arabic (Moroccan)', category: 'MENA/Arabic' },
  { id: 'ar-lb', value: 'ar-lb', label: 'Arabic (Levantine)', category: 'MENA/Arabic' },
  { id: 'ar-iq', value: 'ar-iq', label: 'Arabic (Iraqi)', category: 'MENA/Arabic' },
  { id: 'he', value: 'he', label: 'Hebrew', category: 'MENA/Arabic' },
  { id: 'fa', value: 'fa', label: 'Persian/Farsi', category: 'MENA/Arabic' },
  { id: 'ur', value: 'ur', label: 'Urdu', category: 'MENA/Arabic' },
  // South Asia
  { id: 'hi', value: 'hi', label: 'Hindi', category: 'South Asia' },
  { id: 'bn', value: 'bn', label: 'Bengali', category: 'South Asia' },
  { id: 'ta', value: 'ta', label: 'Tamil', category: 'South Asia' },
  { id: 'te', value: 'te', label: 'Telugu', category: 'South Asia' },
  { id: 'mr', value: 'mr', label: 'Marathi', category: 'South Asia' },
  { id: 'gu', value: 'gu', label: 'Gujarati', category: 'South Asia' },
  { id: 'kn', value: 'kn', label: 'Kannada', category: 'South Asia' },
  { id: 'ml', value: 'ml', label: 'Malayalam', category: 'South Asia' },
  { id: 'pa', value: 'pa', label: 'Punjabi', category: 'South Asia' },
  { id: 'or', value: 'or', label: 'Odia', category: 'South Asia' },
  { id: 'as', value: 'as', label: 'Assamese', category: 'South Asia' },
  { id: 'ne', value: 'ne', label: 'Nepali', category: 'South Asia' },
  { id: 'si', value: 'si', label: 'Sinhala', category: 'South Asia' },
  { id: 'ks', value: 'ks', label: 'Kashmiri', category: 'South Asia' },
  { id: 'sd', value: 'sd', label: 'Sindhi', category: 'South Asia' },
  { id: 'kok', value: 'kok', label: 'Konkani', category: 'South Asia' },
  { id: 'mni', value: 'mni', label: 'Manipuri', category: 'South Asia' },
  { id: 'brx', value: 'brx', label: 'Bodo', category: 'South Asia' },
  { id: 'sat', value: 'sat', label: 'Santali', category: 'South Asia' },
  { id: 'mai', value: 'mai', label: 'Maithili', category: 'South Asia' },
  { id: 'doi', value: 'doi', label: 'Dogri', category: 'South Asia' },
  { id: 'dv', value: 'dv', label: 'Dhivehi (Maldives)', category: 'South Asia' },
  // CJK
  { id: 'zh', value: 'zh', label: 'Chinese (Simplified)', category: 'CJK' },
  { id: 'zh-tw', value: 'zh-tw', label: 'Chinese (Traditional)', category: 'CJK' },
  { id: 'zh-hk', value: 'zh-hk', label: 'Chinese (Cantonese)', category: 'CJK' },
  { id: 'ja', value: 'ja', label: 'Japanese', category: 'CJK' },
  { id: 'ko', value: 'ko', label: 'Korean', category: 'CJK' },
  // Southeast Asia
  { id: 'th', value: 'th', label: 'Thai', category: 'Southeast Asia' },
  { id: 'vi', value: 'vi', label: 'Vietnamese', category: 'Southeast Asia' },
  { id: 'id', value: 'id', label: 'Indonesian', category: 'Southeast Asia' },
  { id: 'ms', value: 'ms', label: 'Malay', category: 'Southeast Asia' },
  { id: 'tl', value: 'tl', label: 'Filipino/Tagalog', category: 'Southeast Asia' },
  { id: 'my', value: 'my', label: 'Burmese', category: 'Southeast Asia' },
  { id: 'km', value: 'km', label: 'Khmer', category: 'Southeast Asia' },
  { id: 'lo', value: 'lo', label: 'Lao', category: 'Southeast Asia' },
  // Africa
  { id: 'sw', value: 'sw', label: 'Swahili', category: 'Africa' },
  { id: 'am', value: 'am', label: 'Amharic', category: 'Africa' },
  { id: 'ha', value: 'ha', label: 'Hausa', category: 'Africa' },
  { id: 'ig', value: 'ig', label: 'Igbo', category: 'Africa' },
  { id: 'yo', value: 'yo', label: 'Yoruba', category: 'Africa' },
  { id: 'zu', value: 'zu', label: 'Zulu', category: 'Africa' },
  { id: 'xh', value: 'xh', label: 'Xhosa', category: 'Africa' },
  { id: 'af', value: 'af', label: 'Afrikaans', category: 'Africa' },
  { id: 'rw', value: 'rw', label: 'Kinyarwanda', category: 'Africa' },
  { id: 'om', value: 'om', label: 'Oromo', category: 'Africa' },
  // Latin America
  { id: 'es-mx', value: 'es-mx', label: 'Spanish (Mexico)', category: 'Latin America' },
  { id: 'es-ar', value: 'es-ar', label: 'Spanish (Argentina)', category: 'Latin America' },
  { id: 'es-co', value: 'es-co', label: 'Spanish (Colombia)', category: 'Latin America' },
  { id: 'pt-br', value: 'pt-br', label: 'Portuguese (Brazil)', category: 'Latin America' },
];

// Language options for SearchableSelect (primary language)
const LANGUAGE_OPTIONS: SearchableSelectOption[] = LANGUAGES.map(l => ({
  value: l.value,
  label: l.label,
  category: l.category,
}));

// ============================================
// TYPES
// ============================================
interface SimpleChapter {
  id: string;
  title: string;
  script: string;
  scriptSource: 'auto' | 'manual';
  customPrompt: string; // User prompt for AI generation
  aiSuggestedPrompt: string; // AI suggested prompt based on context
  visualTypes: string[];
  duration: number;
  voiceSource: 'tts' | 'upload' | 'clone';
  musicSource: 'ai' | 'upload' | 'none';
  status: 'draft' | 'generating' | 'complete' | 'error';
  progress: number;
  industry?: string; // Industry for this chapter (from template)
  generatedContent?: {
    previewUrl: string;
    videoUrl?: string;
    script: string;
    audioUrl?: string;
    sceneDescription?: string;
    transcreatedScripts?: Record<string, string>;
    transcreatedAudio?: Record<string, string>;
  };
}

interface SimpleCompositionStudioProps {
  className?: string;
  onClose?: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const SimpleCompositionStudio: React.FC<SimpleCompositionStudioProps> = ({
  className,
  onClose,
}) => {
  // IP-based content detection
  const { defaultLanguage, isLoading: isDetectingLocation, geoData } = useIPBasedContent();

  // Ecosystem services hook - connects to all existing services
  const ecosystemServices = useStudioEcosystem();
  
  // Label Studio feedback for RLHF learning
  const { recordEvent } = useLabelStudioBackground();

  // Project state
  const [projectName, setProjectName] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [selectedVisualTypes, setSelectedVisualTypes] = useState<string[]>([]);
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>([]);
  const [chapters, setChapters] = useState<SimpleChapter[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  
  // Audio settings scope
  const [audioScope, setAudioScope] = useState<'chapter' | 'entire'>('entire');
  const [globalVoiceSource, setGlobalVoiceSource] = useState<'tts' | 'upload'>('tts');
  const [globalMusicSource, setGlobalMusicSource] = useState<'ai' | 'upload' | 'none'>('ai');
  
  // Script generation scope
  const [scriptScope, setScriptScope] = useState<'chapter' | 'entire'>('entire');
  
  // Output options
  const [outputMode, setOutputMode] = useState<'combined' | 'individual'>('combined');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGeneratingChapter, setCurrentGeneratingChapter] = useState<string | null>(null);
  
  // NEW: Studio step & assets sidebar state using URL params for persistence
  // Use useSearchParams for proper React Router integration
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read step from URL - default to 'create'
  const urlStep = searchParams.get('step');
  const urlView = searchParams.get('view');
  
  // Derive studioStep from URL param - single source of truth
  const studioStep = urlStep === 'review' ? 'review' : 'create';
  const assetsSidebarOpen = urlView === 'assets';
  
  // Helper to update studio step (updates URL)
  const setStudioStep = useCallback((newStep: 'create' | 'review') => {
    const newParams = new URLSearchParams(searchParams);
    if (newStep === 'review') {
      newParams.set('step', 'review');
    } else {
      newParams.delete('step'); // 'create' is default, no need to store
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);
  
  // Helper to update assets sidebar (updates URL)
  const setAssetsSidebarOpen = useCallback((open: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (open) {
      newParams.set('view', 'assets');
    } else {
      newParams.delete('view');
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);
  
  // Load saved draft from sessionStorage or localStorage on mount
  useEffect(() => {
    // Try sessionStorage first, then fallback to localStorage
    const savedDraft = sessionStorage.getItem('studio_current_draft') || localStorage.getItem('studio_last_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        console.log('[Studio] Restoring draft:', draft.projectName, 'with', draft.chapters?.length, 'chapters');
        
        if (draft.projectName) setProjectName(draft.projectName);
        if (draft.chapters?.length) {
          // Ensure all chapter data including generatedContent is restored
          setChapters(draft.chapters.map((ch: any) => ({
            ...ch,
            generatedContent: ch.generatedContent || undefined,
            status: ch.status || 'draft',
          })));
        }
        if (draft.primaryLanguage) setPrimaryLanguage(draft.primaryLanguage);
        if (draft.additionalLanguages) setAdditionalLanguages(draft.additionalLanguages);
        if (draft.selectedTemplates) setSelectedTemplates(draft.selectedTemplates);
        if (draft.selectedVisualTypes) setSelectedVisualTypes(draft.selectedVisualTypes);
        if (draft.audioScope) setAudioScope(draft.audioScope);
        if (draft.scriptScope) setScriptScope(draft.scriptScope);
        if (draft.outputMode) setOutputMode(draft.outputMode);
        
        // Only show toast if we actually restored content
        if (draft.chapters?.length > 0) {
          const hasContent = draft.chapters.some((ch: any) => ch.script || ch.generatedContent);
          if (hasContent) {
            toast.info('Draft restored with generated content');
          } else {
            toast.info('Draft structure restored');
          }
        }
      } catch (e) {
        console.warn('Failed to restore draft:', e);
      }
    }
  }, []);
  
  // Track user actions for Label Studio learning
  const recordUserAction = useCallback((action: string, data: Record<string, unknown>) => {
    recordEvent({
      eventType: 'thumbnail_chosen',
      context: {
        product: 'hub',
        contentType: action,
        originalValue: JSON.stringify(data).slice(0, 200),
        userAction: 'accept',
      },
      metadata: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  }, [recordEvent]);

  // AUTO-SAVE: Debounced save whenever chapters or key state changes
  // This ensures data persists when navigating between Create/Review tabs
  useEffect(() => {
    // Skip if no project name or no chapters (initial state)
    if (!projectName && chapters.length === 0) return;
    
    // Only save if there's meaningful data
    const hasContent = chapters.length > 0 || projectName.trim();
    if (!hasContent) return;
    
    // Debounce to avoid excessive saves
    const saveTimeout = setTimeout(() => {
      const draftData = {
        projectName,
        chapters,
        primaryLanguage,
        additionalLanguages,
        selectedTemplates,
        selectedVisualTypes,
        audioScope,
        scriptScope,
        outputMode,
        savedAt: new Date().toISOString(),
      };
      
      // Save to both sessionStorage (for tab persistence) and localStorage (for session persistence)
      sessionStorage.setItem('studio_current_draft', JSON.stringify(draftData));
      localStorage.setItem('studio_last_draft', JSON.stringify(draftData));
      console.log('[Studio] Auto-saved draft:', projectName, 'with', chapters.length, 'chapters', 
        chapters.filter(c => c.generatedContent).length, 'with content');
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(saveTimeout);
  }, [chapters, projectName, primaryLanguage, additionalLanguages, selectedTemplates, selectedVisualTypes, audioScope, scriptScope, outputMode]);

  // Memoize static data to prevent re-renders
  const memoizedTemplates = useMemo(() => 
    INDUSTRY_TEMPLATES.map(t => ({ id: t.id, label: t.label, category: t.category || 'General' })),
    []
  );
  
  const memoizedVisuals = useMemo(() => 
    VISUAL_TYPES.map(v => ({ id: v.id, label: v.label, category: v.category || 'General' })),
    []
  );

  // Memoize the AI recommendation prompt to prevent re-analysis on every render
  const aiRecommendationPrompt = useMemo(() => {
    if (!projectName && chapters.length === 0) return '';
    const topicPart = chapters.length > 0 
      ? ` - Topics: ${chapters.slice(0, 3).map(c => c.customPrompt || c.title).join(', ')}` 
      : '';
    return `${projectName}${topicPart}`;
  }, [projectName, chapters]);

  // Memoized callback for AI visual select to prevent re-renders
  const handleAIVisualSelect = useCallback((ids: string[]) => {
    setSelectedVisualTypes(ids);
    // Apply to all chapters
    setChapters(prev => prev.map(ch => ({ ...ch, visualTypes: ids.length > 0 ? ids : ch.visualTypes })));
    recordUserAction('ai_visual_accepted', { visualIds: ids });
  }, [recordUserAction]);

  useEffect(() => {
    if (defaultLanguage && !isDetectingLocation) {
      setPrimaryLanguage(defaultLanguage);
      if (geoData?.countryName) {
        toast.info(`Detected region: ${geoData.countryName}`, { duration: 3000 });
      }
    }
  }, [defaultLanguage, isDetectingLocation, geoData]);

  // Apply templates - combines chapters from all selected templates
  // Get default visual types based on template - wrapped in useCallback for stable reference
  const getDefaultVisualsForTemplate = useCallback((templateId: string): string[] => {
    const visualMap: Record<string, string[]> = {
      saudi_vision_2030: ['video', 'infographics', '3d_environment'],
      uae_digital: ['video', 'animation', 'ppt'],
      india_digital: ['video', 'infographics', 'customer_journey'],
      india_upi: ['animation', 'infographics', 'ppt'],
      africa_tourism: ['video', '3d_environment', 'images'],
      mena_tourism: ['video', 'images', '3d'],
      healthcare_digital: ['avatar_presenter', 'ppt', 'infographics'],
      saas_demo: ['screen_record', 'avatar', 'ppt'],
      ai_showcase: ['animation', 'video', '3d'],
      landing_hero: ['video', 'kinetic_typography'],
      landing_product: ['screen_record', 'avatar_presenter'],
      social_short: ['video', 'kinetic_typography'],
      social_carousel: ['images', 'infographics'],
      social_youtube: ['avatar', 'video', 'ppt'],
    };
    return visualMap[templateId] || ['video'];
  }, []);

  // Generate AI suggested prompt for a chapter - comprehensive coverage for all templates
  // Wrapped in useCallback for stable reference
  const generateAISuggestedPrompt = useCallback((title: string, industry: string): string => {
    // Get template info for context-aware prompts
    const templateInfo = INDUSTRY_TEMPLATES.find(t => t.id === industry);
    const templateLabel = templateInfo?.label || industry.replace(/_/g, ' ');
    const templateDesc = templateInfo?.description || '';
    
    // Chapter-specific prompts for key templates
    const chapterPrompts: Record<string, Record<string, string>> = {
      saudi_vision_2030: {
        'Vision Overview': 'Create an inspiring overview of Saudi Vision 2030, highlighting economic diversification, digital transformation, and the Kingdom\'s ambitious goals for a post-oil economy.',
        'Economic Diversification': 'Explain Saudi Arabia\'s strategy to reduce oil dependence through investments in tourism, entertainment, technology, and renewable energy sectors.',
        'Digital Infrastructure': 'Showcase the smart city initiatives, 5G rollout, cloud infrastructure, and digital government services transforming Saudi Arabia.',
        'Smart Cities': 'Present NEOM, The Line, and other futuristic urban development projects that represent the future of sustainable living.',
        'Future Outlook': 'Summarize the 2030 goals, progress made, and call-to-action for global partnerships and investment opportunities.',
        'Investment Opportunities': 'Highlight key investment sectors and opportunities for global partners in the Saudi Vision 2030 framework.',
        'Tourism & Entertainment': 'Present the development of tourism destinations like Red Sea Project and entertainment initiatives.',
        'Youth Empowerment': 'Showcase initiatives focused on Saudi youth development, education, and employment opportunities.',
      },
      uae_digital: {
        'Digital Government': 'Showcase UAE\'s world-leading digital government services and smart city initiatives in Dubai and Abu Dhabi.',
        'Innovation Hub': 'Present the UAE as a global innovation hub for AI, blockchain, and emerging technologies.',
        'Future Vision': 'Highlight UAE Centennial 2071 and the long-term vision for sustainable development.',
      },
      india_digital: {
        'Digital India Overview': 'Present the comprehensive Digital India initiative transforming governance and citizen services.',
        'Technology Infrastructure': 'Showcase India Stack, Aadhaar, and the digital infrastructure empowering 1.4 billion citizens.',
        'Startup Ecosystem': 'Highlight India\'s vibrant startup ecosystem and unicorn success stories.',
        'Digital Payments': 'Explain how UPI and digital payments have revolutionized India\'s economy.',
        'E-Governance': 'Present digital government services and citizen-centric platforms.',
        'Rural Connectivity': 'Showcase BharatNet and initiatives bringing digital access to rural India.',
      },
      india_upi: {
        'UPI Introduction': 'Introduce UPI as a revolutionary real-time payment system transforming digital payments for over 500 million users.',
        'Technology Behind UPI': 'Explain the NPCI architecture, instant bank-to-bank transfers, and the technology stack powering UPI.',
        'Merchant Adoption': 'Show how small businesses, street vendors, and enterprises adopted QR-based payments nationwide.',
        'Global Expansion': 'Highlight UPI\'s expansion to UAE, Singapore, France, and future international markets.',
        'Security & Trust': 'Present the security features and trust mechanisms that make UPI safe for transactions.',
        'Future Roadmap': 'Outline the future developments and innovations planned for UPI ecosystem.',
      },
      africa_tourism: {
        'Wildlife Safari': 'Showcase breathtaking wildlife experiences across Africa\'s renowned national parks and conservation areas.',
        'Cultural Heritage': 'Highlight rich cultural traditions, historical sites, and the diverse heritage of African nations.',
        'Adventure Tourism': 'Present adventure activities from mountain climbing to water sports and desert expeditions.',
        'Beach Destinations': 'Feature stunning coastal destinations, island getaways, and marine experiences.',
        'Eco Tourism': 'Emphasize sustainable tourism, conservation efforts, and community-based tourism initiatives.',
      },
      saas_demo: {
        'Product Overview': 'Present the key value proposition, solve the main customer pain point, and demonstrate immediate value.',
        'Key Features': 'Demonstrate the most impactful features with real-world examples and use cases.',
        'Use Cases': 'Show how different industries and company sizes use the product successfully.',
        'Getting Started': 'Walk through the seamless onboarding process and first-time user experience.',
        'Pricing & Plans': 'Present pricing options and help viewers choose the right plan for their needs.',
        'Customer Success': 'Share customer testimonials and success stories that demonstrate ROI.',
      },
      healthcare_digital: {
        'Healthcare Overview': 'Present the digital transformation of healthcare and patient-centric care delivery.',
        'Digital Solutions': 'Showcase AI diagnostics, telemedicine, and connected health devices.',
        'Patient Experience': 'Highlight improved patient outcomes and personalized care pathways.',
        'AI Diagnostics': 'Demonstrate how AI is revolutionizing medical diagnosis and treatment planning.',
        'Telemedicine': 'Present remote healthcare delivery and virtual consultation capabilities.',
        'Data Security': 'Explain healthcare data protection and compliance with regulations.',
      },
      banking_digital: {
        'Digital Banking Overview': 'Present the future of banking with seamless digital experiences.',
        'Key Features': 'Showcase mobile banking, instant payments, and AI-powered financial insights.',
        'Security & Trust': 'Highlight advanced security measures and regulatory compliance.',
      },
    };
    
    // Check for specific chapter prompt first
    if (chapterPrompts[industry]?.[title]) {
      return chapterPrompts[industry][title];
    }
    
    // Generate context-aware prompt based on template category and description
    if (templateDesc) {
      return `Create compelling content for "${title}" in the context of ${templateLabel}: ${templateDesc}. Focus on engaging storytelling, clear messaging, and visual impact appropriate for the target audience.`;
    }
    
    // Fallback with template context
    return `Create engaging professional content about "${title}" for ${templateLabel} audience. Ensure the content is informative, visually compelling, and aligned with industry best practices.`;
  }, []);

  const applyTemplates = useCallback((templateIds: string[]) => {
    // Prevent unnecessary state updates - check if templates actually changed
    const sortedNew = [...templateIds].sort().join(',');
    const sortedOld = [...selectedTemplates].sort().join(',');
    
    if (sortedNew === sortedOld) {
      return; // No change, don't update
    }
    
    setSelectedTemplates(templateIds);
    
    if (templateIds.length === 0) {
      // Clear chapters only if we had templates before
      if (selectedTemplates.length > 0) {
        setChapters([]);
      }
      return;
    }

    const newChapters: SimpleChapter[] = [];
    templateIds.forEach(templateId => {
      const chapterTitles = TEMPLATE_CHAPTERS[templateId] || [];
      const defaultVisuals = getDefaultVisualsForTemplate(templateId);
      
      chapterTitles.forEach((title) => {
        newChapters.push({
          id: generateId(),
          title,
          script: '',
          scriptSource: 'auto',
          customPrompt: '',
          aiSuggestedPrompt: generateAISuggestedPrompt(title, templateId),
          visualTypes: defaultVisuals,
          duration: 30,
          voiceSource: globalVoiceSource,
          musicSource: globalMusicSource,
          status: 'draft' as const,
          progress: 0,
          industry: templateId,
        });
      });
    });

    if (newChapters.length > 0) {
      setChapters(newChapters);
      setExpandedChapter(newChapters[0].id);
      toast.success(`Applied ${templateIds.length} template(s) with ${newChapters.length} chapters`);
    }
  }, [globalVoiceSource, globalMusicSource, selectedTemplates]);

  // Memoized callback for AI template select (must be after applyTemplates)
  const handleAITemplateSelect = useCallback((ids: string[]) => {
    applyTemplates(ids);
    recordUserAction('ai_template_accepted', { templateIds: ids });
  }, [applyTemplates, recordUserAction]);

  // Chapter CRUD
  const addChapter = useCallback(() => {
    const industry = selectedTemplates[0] || 'blank';
    const chapterNumber = chapters.length + 1;
    
    // Get template info for context-aware title suggestion
    const templateInfo = INDUSTRY_TEMPLATES.find(t => t.id === industry);
    const templateLabel = templateInfo?.label || '';
    
    // Generate a context-aware default title based on template
    let title = `Chapter ${chapterNumber}`;
    if (templateLabel && industry !== 'blank') {
      // Suggest contextual titles based on template category
      const contextualTitles: Record<string, string[]> = {
        saudi_vision_2030: ['Vision Overview', 'Economic Diversification', 'Digital Infrastructure', 'Smart Cities', 'Future Outlook', 'Investment Opportunities', 'Tourism & Entertainment', 'Youth Empowerment'],
        india_digital: ['Digital India Overview', 'Technology Infrastructure', 'Startup Ecosystem', 'Digital Payments', 'E-Governance', 'Rural Connectivity'],
        india_upi: ['UPI Introduction', 'Technology Behind UPI', 'Merchant Adoption', 'Global Expansion', 'Security & Trust', 'Future Roadmap'],
        healthcare_digital: ['Healthcare Overview', 'Digital Solutions', 'Patient Experience', 'AI Diagnostics', 'Telemedicine', 'Data Security'],
        saas_demo: ['Product Overview', 'Key Features', 'Use Cases', 'Getting Started', 'Pricing & Plans', 'Customer Success'],
      };
      
      const templateTitles = contextualTitles[industry];
      if (templateTitles && templateTitles[chapterNumber - 1]) {
        title = templateTitles[chapterNumber - 1];
      } else {
        title = `${templateLabel} - Part ${chapterNumber}`;
      }
    }
    
    const newChapter: SimpleChapter = {
      id: generateId(),
      title,
      script: '',
      scriptSource: 'auto',
      customPrompt: '',
      aiSuggestedPrompt: generateAISuggestedPrompt(title, industry),
      visualTypes: getDefaultVisualsForTemplate(industry),
      duration: 30,
      voiceSource: globalVoiceSource,
      musicSource: globalMusicSource,
      status: 'draft',
      progress: 0,
      industry,
    };
    setChapters(prev => [...prev, newChapter]);
    setExpandedChapter(newChapter.id);
    toast.success(`Added "${title}" with ${templateLabel || 'default'} context`);
  }, [chapters.length, globalVoiceSource, globalMusicSource, selectedTemplates, generateAISuggestedPrompt, getDefaultVisualsForTemplate]);

  const updateChapter = useCallback((id: string, updates: Partial<SimpleChapter>) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteChapter = useCallback((id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
    toast.success('Chapter deleted');
  }, []);

  const duplicateChapter = useCallback((id: string) => {
    const chapter = chapters.find(c => c.id === id);
    if (chapter) {
      const newChapter: SimpleChapter = {
        ...chapter,
        id: generateId(),
        title: `${chapter.title} (Copy)`,
        status: 'draft',
        progress: 0,
        generatedContent: undefined,
      };
      setChapters(prev => [...prev, newChapter]);
      toast.success('Chapter duplicated');
    }
  }, [chapters]);

  const moveChapter = useCallback((id: string, direction: 'up' | 'down') => {
    setChapters(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index < 0) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newChapters = [...prev];
      [newChapters[index], newChapters[newIndex]] = [newChapters[newIndex], newChapters[index]];
      return newChapters;
    });
  }, []);

  // Apply global audio settings
  const applyGlobalAudioSettings = useCallback(() => {
    setChapters(prev => prev.map(c => ({
      ...c,
      voiceSource: globalVoiceSource,
      musicSource: globalMusicSource,
    })));
    toast.success(chapters.length === 1 
      ? 'Applied audio settings to your chapter' 
      : 'Applied audio settings to all chapters');
  }, [globalVoiceSource, globalMusicSource, chapters.length]);

  // Auto-apply global settings when in "entire" mode and settings change
  // This ensures single-chapter projects don't need manual "Apply" clicks
  useEffect(() => {
    if (audioScope === 'entire' && chapters.length > 0) {
      setChapters(prev => prev.map(c => ({
        ...c,
        voiceSource: globalVoiceSource,
        musicSource: globalMusicSource,
      })));
    }
  }, [audioScope, globalVoiceSource, globalMusicSource, chapters.length]);

  // Refresh all chapter prompts based on current template/context
  // This updates the AI-suggested prompts when context changes
  const refreshAllChapterPrompts = useCallback(() => {
    if (chapters.length === 0) {
      toast.info('No chapters to refresh');
      return;
    }
    
    setChapters(prev => prev.map(c => {
      // Only update if the chapter doesn't have a custom prompt (user override)
      if (c.customPrompt && c.customPrompt.trim()) {
        return c; // Keep user's custom prompt
      }
      
      // Regenerate AI suggested prompt based on current template context
      const industry = c.industry || selectedTemplates[0] || 'blank';
      const newAiPrompt = generateAISuggestedPrompt(c.title, industry);
      
      return {
        ...c,
        aiSuggestedPrompt: newAiPrompt,
        // Clear the script so it will be regenerated with new context
        script: '',
        status: 'draft' as const,
        progress: 0,
        generatedContent: undefined,
      };
    }));
    
    toast.success(`Refreshed prompts for ${chapters.length} chapters. Click "Generate All" to create scripts with updated context.`);
  }, [chapters, selectedTemplates, generateAISuggestedPrompt]);

  // Regenerate script only for a specific chapter (called when clicking "Auto" button)
  const regenerateScriptOnly = useCallback(async (chapter: SimpleChapter) => {
    console.log('[Studio] Regenerating script only for:', chapter.title);
    
    toast.info(`Regenerating script for "${chapter.title}"...`);
    updateChapter(chapter.id, { scriptSource: 'auto' });
    
    try {
      // Get template info for context
      const templateInfo = selectedTemplates.length > 0 
        ? INDUSTRY_TEMPLATES.find(t => selectedTemplates.includes(t.id))
        : null;
      const templateLabel = templateInfo?.label || '';
      const templateDesc = templateInfo?.description || '';
      
      // Build comprehensive prompt that preserves ALL user context
      let fullPromptContext = '';
      
      if (projectName.trim()) {
        fullPromptContext += `Project: ${projectName}\n`;
      }
      
      if (templateLabel) {
        fullPromptContext += `Template: ${templateLabel}${templateDesc ? ` - ${templateDesc}` : ''}\n`;
      }
      
      const userContext = chapter.customPrompt?.trim();
      const aiSuggestion = chapter.aiSuggestedPrompt?.trim();
      
      if (userContext) {
        fullPromptContext += `\nUser's Direction: ${userContext}\n`;
      } else if (aiSuggestion) {
        fullPromptContext += `\nTopic: ${aiSuggestion}\n`;
      } else {
        fullPromptContext += `\nTopic: ${chapter.title}\n`;
      }
      
      fullPromptContext += `\nChapter: ${chapter.title}`;
      
      const industryContext = chapter.industry 
        ? ` for ${chapter.industry.replace(/_/g, ' ')} context` 
        : '';
      
      const targetWordCount = Math.round((chapter.duration / 60) * 150);
      
      const scriptPrompt = `${fullPromptContext}

Generate a professional voiceover script for TTS (Text-to-Speech)${industryContext}.
Target Duration: ${chapter.duration} seconds (approximately ${targetWordCount} words)
Visual Style: ${chapter.visualTypes.join(', ')}
Primary Language: ${primaryLanguage}

IMPORTANT: 
- Focus specifically on the user's direction provided above
- Keep the content engaging, informative, and professional
- The script should flow naturally when spoken aloud
- Write in a conversational, clear style suitable for audio narration
- Include natural pauses and emphasis points
- Target exactly ${targetWordCount} words for the ${chapter.duration}s duration`;

      const { data: scriptData, error: scriptError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          prompt: scriptPrompt,
          systemPrompt: 'You are a professional TTS scriptwriter for video content. Generate ONLY the voiceover script text - no headings, stage directions, timestamps, or formatting marks. The script must be ready for direct text-to-speech conversion. Write naturally as if speaking to the audience.',
          temperature: 0.7,
          maxTokens: 1500,
        }
      });

      if (scriptError) {
        console.error('[Studio] Script regeneration error:', scriptError);
        toast.error(`Script error: ${scriptError.message}`);
        return;
      }

      // Parse the response
      let script = '';
      if (typeof scriptData === 'string') {
        script = scriptData;
      } else if (scriptData?.content && typeof scriptData.content === 'string') {
        script = scriptData.content;
      } else if (scriptData?.response && typeof scriptData.response === 'string') {
        script = scriptData.response;
      } else if (scriptData?.text && typeof scriptData.text === 'string') {
        script = scriptData.text;
      } else if (scriptData?.result && typeof scriptData.result === 'string') {
        script = scriptData.result;
      } else if (scriptData?.output && typeof scriptData.output === 'string') {
        script = scriptData.output;
      }

      script = script.trim();
      if (script.startsWith('{') || script.startsWith('[')) {
        try {
          const parsed = JSON.parse(script);
          script = parsed.script || parsed.content || parsed.text || parsed.response || '';
        } catch {
          script = script.replace(/^[\{\[]|[\}\]]$/g, '').trim();
        }
      }

      if (!script || script.length < 30) {
        toast.error('Script generation returned empty result');
        return;
      }

      updateChapter(chapter.id, { script, scriptSource: 'auto' });
      toast.success(`Script regenerated for "${chapter.title}" (${script.length} chars)`);
      
    } catch (err) {
      console.error('[Studio] Script regeneration exception:', err);
      toast.error('Failed to regenerate script');
    }
  }, [selectedTemplates, projectName, primaryLanguage, updateChapter]);

  // Generate single chapter using ecosystem services
  const generateChapter = async (chapter: SimpleChapter) => {
    console.log('[Studio] ======= STARTING GENERATION =======');
    console.log('[Studio] Chapter:', chapter.title, 'ID:', chapter.id);
    console.log('[Studio] Script source:', chapter.scriptSource, 'Has script:', !!chapter.script?.trim());
    
    updateChapter(chapter.id, { status: 'generating', progress: 0 });
    setCurrentGeneratingChapter(chapter.id);

    try {
      let script = chapter.script;
      updateChapter(chapter.id, { progress: 10 });
      
      // Step 1: Generate script if auto OR if script is empty
      const shouldGenerateScript = chapter.scriptSource === 'auto' || !script?.trim();
      console.log('[Studio] Should generate script:', shouldGenerateScript);
      
      if (shouldGenerateScript) {
        console.log('[Studio] Generating script for:', chapter.title);
        toast.info(`Generating script for "${chapter.title}"...`);
        
        // IMPORTANT: User's custom prompt takes priority, then AI suggestion, then fallback
        const userContext = chapter.customPrompt?.trim();
        const aiSuggestion = chapter.aiSuggestedPrompt?.trim();
        const chapterTitle = chapter.title;
        
        console.log('[Studio] Prompt context - User:', userContext?.substring(0, 50), 'AI:', aiSuggestion?.substring(0, 50));
        
        // Get template info for context
        const templateInfo = selectedTemplates.length > 0 
          ? INDUSTRY_TEMPLATES.find(t => selectedTemplates.includes(t.id))
          : null;
        const templateLabel = templateInfo?.label || '';
        const templateDesc = templateInfo?.description || '';
        
        // Build comprehensive prompt that preserves ALL user context
        let fullPromptContext = '';
        
        // Include project name context if provided
        if (projectName.trim()) {
          fullPromptContext += `Project: ${projectName}\n`;
        }
        
        // Include template context
        if (templateLabel) {
          fullPromptContext += `Template: ${templateLabel}${templateDesc ? ` - ${templateDesc}` : ''}\n`;
        }
        
        // User's custom prompt is the PRIMARY direction
        if (userContext) {
          fullPromptContext += `\nUser's Direction: ${userContext}\n`;
        } else if (aiSuggestion) {
          fullPromptContext += `\nTopic: ${aiSuggestion}\n`;
        } else {
          // Fallback: use chapter title as the topic
          fullPromptContext += `\nTopic: ${chapterTitle}\n`;
        }
        
        fullPromptContext += `\nChapter: ${chapterTitle}`;
        
        const industryContext = chapter.industry 
          ? ` for ${chapter.industry.replace(/_/g, ' ')} context` 
          : '';
        
        // Calculate appropriate word count for duration (approx 150 words per minute for voiceover)
        const targetWordCount = Math.round((chapter.duration / 60) * 150);
        
        console.log('[Studio] Calling ai-universal-processor for script generation...');
        console.log('[Studio] Full prompt context:', fullPromptContext.substring(0, 200));
        
        try {
          // Build a complete script generation prompt
          const scriptPrompt = `${fullPromptContext}

Generate a professional voiceover script for TTS (Text-to-Speech)${industryContext}.
Target Duration: ${chapter.duration} seconds (approximately ${targetWordCount} words)
Visual Style: ${chapter.visualTypes.join(', ')}
Primary Language: ${primaryLanguage}

IMPORTANT: 
- Focus specifically on the user's direction provided above
- Keep the content engaging, informative, and professional
- The script should flow naturally when spoken aloud
- Write in a conversational, clear style suitable for audio narration
- Include natural pauses and emphasis points
- Target exactly ${targetWordCount} words for the ${chapter.duration}s duration`;

          console.log('[Studio] Script prompt preview:', scriptPrompt.substring(0, 300));
          
          const { data: scriptData, error: scriptError } = await supabase.functions.invoke('ai-universal-processor', {
            body: {
              provider: 'gemini',
              model: 'gemini-2.0-flash',
              prompt: scriptPrompt,
              systemPrompt: 'You are a professional TTS scriptwriter for video content. Generate ONLY the voiceover script text - no headings, stage directions, timestamps, or formatting marks. The script must be ready for direct text-to-speech conversion. Write naturally as if speaking to the audience.',
              temperature: 0.7,
              maxTokens: 1500,
            }
          });

          console.log('[Studio] Script generation response:', { 
            hasData: !!scriptData, 
            hasError: !!scriptError,
            errorMsg: scriptError?.message,
            contentLength: scriptData?.content?.length || 0,
            responseKeys: scriptData ? Object.keys(scriptData) : [],
            rawPreview: typeof scriptData === 'string' ? scriptData.substring(0, 100) : 
                        scriptData?.content?.substring?.(0, 100) || 'N/A'
          });

          if (scriptError) {
            console.error('[Studio] Script generation error:', scriptError);
            toast.error(`Script error: ${scriptError.message}`);
            // Generate a meaningful fallback based on the prompt
            script = generateFallbackScript(chapter, projectName, templateLabel);
          } else {
            // Parse the response - edge function returns content, response, or text
            script = '';
            
            // Try multiple extraction paths
            if (typeof scriptData === 'string') {
              script = scriptData;
            } else if (scriptData?.content && typeof scriptData.content === 'string') {
              script = scriptData.content;
            } else if (scriptData?.response && typeof scriptData.response === 'string') {
              script = scriptData.response;
            } else if (scriptData?.text && typeof scriptData.text === 'string') {
              script = scriptData.text;
            } else if (scriptData?.result && typeof scriptData.result === 'string') {
              script = scriptData.result;
            } else if (scriptData?.output && typeof scriptData.output === 'string') {
              script = scriptData.output;
            }
            
            // Clean up the script - remove any JSON artifacts or formatting
            script = script.trim();
            if (script.startsWith('{') || script.startsWith('[')) {
              // It's JSON, try to extract text
              try {
                const parsed = JSON.parse(script);
                script = parsed.script || parsed.content || parsed.text || parsed.response || '';
              } catch {
                // Not valid JSON, keep as is but remove brackets
                script = script.replace(/^[\{\[]|[\}\]]$/g, '').trim();
              }
            }
            
            console.log('[Studio] Extracted script preview:', script.substring(0, 150));
            
            if (!script || script.length < 30) {
              console.warn('[Studio] Script too short or empty, generating fallback');
              script = generateFallbackScript(chapter, projectName, templateLabel);
            }
          }
          
          console.log('[Studio] Final script length:', script.length);
          updateChapter(chapter.id, { script, progress: 25 });
          toast.success(`Script generated for "${chapter.title}" (${script.length} chars)`);
        } catch (scriptGenErr) {
          console.error('[Studio] Script generation exception:', scriptGenErr);
          script = generateFallbackScript(chapter, projectName, templateLabel);
          updateChapter(chapter.id, { script, progress: 25 });
          toast.warning('Used fallback script due to API issue');
        }
        
        // Helper function for fallback scripts
        function generateFallbackScript(ch: SimpleChapter, projName: string, template: string): string {
          const topic = ch.customPrompt || ch.aiSuggestedPrompt || ch.title;
          const duration = ch.duration;
          const wordCount = Math.round((duration / 60) * 150);
          
          if (template && template.includes('Vision')) {
            return `Welcome to ${ch.title}. Today we explore ${topic}, a key pillar of our ${template} initiative. This transformation represents a bold step toward a more prosperous and innovative future. Through strategic investments and forward-thinking policies, we're building the foundation for sustainable growth and opportunity for all. Join us as we discover how these initiatives are reshaping our landscape and creating new possibilities for generations to come.`;
          }
          
          return `Welcome to ${ch.title}. ${topic ? `In this segment, we'll explore ${topic}.` : 'Let\'s dive into the key concepts.'} Our goal is to provide you with valuable insights and actionable knowledge that you can apply right away. Throughout this presentation, we'll break down complex ideas into clear, understandable points. Whether you're new to this topic or looking to deepen your understanding, this content is designed to engage and inform. Let's begin our journey together.`;
        }
      } else {
        console.log('[Studio] Using existing script, length:', script?.length || 0);
        updateChapter(chapter.id, { progress: 25 });
      }

      // Step 2: Transcreation for additional languages (using ecosystem service)
      let transcreatedScripts: Record<string, string> = {};
      if (additionalLanguages.length > 0 && script) {
        console.log('[Studio] Transcreating to:', additionalLanguages);
        updateChapter(chapter.id, { progress: 35 });
        try {
          transcreatedScripts = await ecosystemServices.transcreateContent(
            script,
            primaryLanguage,
            additionalLanguages,
            'presentation'
          );
          console.log('[Studio] Transcreation complete for', Object.keys(transcreatedScripts).length, 'languages');
        } catch (e) {
          console.warn('[Studio] Transcreation skipped:', e);
        }
      }

      // Step 3: Generate TTS using ecosystem service (with regional routing)
      let audioUrl: string | undefined;
      let transcreatedAudio: Record<string, string> = {};
      
      if (chapter.voiceSource === 'tts' && script) {
        updateChapter(chapter.id, { progress: 50 });
        console.log('[Studio] Generating TTS with regional routing for:', primaryLanguage);
        
        try {
          // Primary language TTS using ecosystem service
          const voiceResult = await ecosystemServices.generateVoiceover(script, primaryLanguage);
          audioUrl = voiceResult.audioUrl;
          console.log('[Studio] Primary TTS complete, provider:', voiceResult.provider);
          
          // Additional languages TTS
          if (Object.keys(transcreatedScripts).length > 0) {
            updateChapter(chapter.id, { progress: 60 });
            transcreatedAudio = await ecosystemServices.generateMultiLanguageAudio(transcreatedScripts);
            console.log('[Studio] Multi-language audio complete for', Object.keys(transcreatedAudio).length, 'languages');
          }
        } catch (e) {
          console.warn('[Studio] TTS fallback used:', e);
          // Fallback to basic TTS
          try {
            const { data: ttsData } = await supabase.functions.invoke('text-to-speech', {
              body: { text: script.substring(0, 1000), voice: 'alloy', model: 'tts-1' }
            });
            if (ttsData?.audioContent) {
              audioUrl = `data:audio/mp3;base64,${ttsData.audioContent}`;
            }
          } catch (fallbackError) {
            console.warn('[Studio] TTS completely skipped');
          }
        }
      }

      // Step 4: Generate background music using ecosystem service
      if (chapter.musicSource === 'ai') {
        updateChapter(chapter.id, { progress: 70 });
        console.log('[Studio] Generating background music');
        try {
          const musicResult = await ecosystemServices.generateMusic(
            `Professional ${chapter.visualTypes[0] || 'corporate'} background music, ${chapter.industry || 'business'} style`,
            chapter.duration
          );
          console.log('[Studio] Music generated:', musicResult.audioUrl?.substring(0, 50));
          // Music URL stored for final mixing
        } catch (e) {
          console.warn('[Studio] Music generation skipped:', e);
        }
      }

      // Step 5: Generate video/visual content using ecosystem service
      updateChapter(chapter.id, { progress: 80 });
      const visualType = chapter.visualTypes[0] || 'video';
      let previewUrl = `https://placehold.co/1920x1080/1e293b/ffffff?text=${encodeURIComponent(chapter.title.substring(0, 40))}`;
      let videoUrl: string | undefined;
      
      try {
        console.log('[Studio] Generating visual content, type:', visualType);
        
        // Try video generation first
        const videoResult = await ecosystemServices.generateVideo(
          `${chapter.title}: ${script.substring(0, 200)}`,
          visualType,
          Math.min(chapter.duration, 10)
        );
        
        if (videoResult.success) {
          // Check if videoUrl is a real URL (not a placeholder)
          const hasRealVideo = videoResult.videoUrl && 
            !videoResult.videoUrl.includes('placehold.co') &&
            !videoResult.videoUrl.includes('placeholder');
          
          if (hasRealVideo) {
            videoUrl = videoResult.videoUrl;
            previewUrl = videoResult.thumbnailUrl || videoResult.videoUrl;
            console.log('[Studio] Video generated with provider:', videoResult.provider);
          } else {
            console.log('[Studio] Video returned placeholder, generating image thumbnail instead');
            // Generate a real image as preview since video is still processing
            const imageResult = await ecosystemServices.generateImage(
              `Professional ${visualType} thumbnail for: ${chapter.title}. ${script.substring(0, 100)}`,
              'realistic',
              '16:9'
            );
            if (imageResult.imageUrl) {
              previewUrl = imageResult.imageUrl;
            }
            toast.info(`Video for "${chapter.title}" is still processing - preview image generated`);
          }
        }
      } catch (e) {
        console.warn('[Studio] Video/image generation error:', e);
        // Fallback to direct image generation edge function
        try {
          const { data: imageData } = await supabase.functions.invoke('ai-image-generator', {
            body: {
              prompt: `Professional ${visualType} thumbnail for: ${chapter.title}. ${script.substring(0, 100)}`,
              provider: 'openai',
              size: '1536x1024', // Valid OpenAI size for 16:9 aspect
              quality: 'high'
            }
          });
          if (imageData?.imageUrl || imageData?.mediaUrl) {
            previewUrl = imageData.imageUrl || imageData.mediaUrl;
            console.log('[Studio] Fallback image generated successfully');
          }
        } catch (imgError) {
          console.warn('[Studio] Image fallback error, using placeholder:', imgError);
        }
      }

      updateChapter(chapter.id, {
        status: 'complete',
        progress: 100,
        script,
        generatedContent: { 
          previewUrl, 
          videoUrl,
          script, 
          audioUrl,
          transcreatedScripts: Object.keys(transcreatedScripts).length > 0 ? transcreatedScripts : undefined,
          transcreatedAudio: Object.keys(transcreatedAudio).length > 0 ? transcreatedAudio : undefined,
        }
      });

      return { success: true };
    } catch (error) {
      console.error('[Studio] Generation failed for chapter:', chapter.title, error);
      
      // AUTO-REMOVE failed chapter with clear error message
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      setChapters(prev => prev.filter(c => c.id !== chapter.id));
      
      toast.error(
        `Generation failed for "${chapter.title}": ${errorMsg}. Chapter removed - recreate it to try again.`,
        {
          duration: 8000,
          action: {
            label: 'Recreate',
            onClick: () => {
              // Re-add the chapter for retry
              setChapters(prev => [...prev, {
                ...chapter,
                status: 'draft' as const,
                progress: 0,
                generatedContent: undefined,
              }]);
              toast.info(`Chapter "${chapter.title}" re-added. Click Generate to try again.`);
            }
          }
        }
      );
      
      return { success: false };
    } finally {
      setCurrentGeneratingChapter(null);
    }
  };

  // Generate all chapters with optional video combining
  const generateAll = async () => {
    if (chapters.length === 0) {
      toast.error('Add at least one chapter first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    let completed = 0;

    for (const chapter of chapters) {
      await generateChapter(chapter);
      completed++;
      setGenerationProgress(Math.round((completed / chapters.length) * 90)); // Reserve 10% for combining
    }

    // Combine chapters if output mode is 'combined'
    if (outputMode === 'combined' && chapters.length > 1) {
      setGenerationProgress(95);
      const completedChaptersWithVideo = chapters.filter(c => c.generatedContent?.videoUrl);
      
      if (completedChaptersWithVideo.length > 1) {
        try {
          console.log('[Studio] Combining', completedChaptersWithVideo.length, 'chapter videos');
          const combined = await ecosystemServices.combineChapterVideos(
            completedChaptersWithVideo.map(c => ({
              chapterId: c.id,
              videoUrl: c.generatedContent!.videoUrl!,
              audioUrl: c.generatedContent?.audioUrl,
            }))
          );
          toast.success(`Combined video created: ${combined.duration}s`);
        } catch (e) {
          console.warn('[Studio] Video combining skipped:', e);
        }
      }
    }

    setGenerationProgress(100);
    setIsGenerating(false);
    toast.success('All chapters generated!');
    
    // AUTO-SAVE to sessionStorage after generation completes
    const draftData = {
      projectName,
      chapters,
      primaryLanguage,
      additionalLanguages,
      selectedTemplates,
      selectedVisualTypes,
      audioScope,
      scriptScope,
      outputMode,
      savedAt: new Date().toISOString(),
    };
    sessionStorage.setItem('studio_current_draft', JSON.stringify(draftData));
    localStorage.setItem('studio_last_draft', JSON.stringify(draftData));
    console.log('[Studio] Auto-saved draft after generation');
    
    // Record generation completion for Label Studio learning
    recordUserAction('generation_complete', {
      projectName,
      chaptersCount: chapters.length,
      templates: selectedTemplates,
      primaryLanguage,
      additionalLanguages,
      outputMode,
      totalDuration: chapters.reduce((sum, c) => sum + c.duration, 0),
    });
  };

  // Stats
  const totalDuration = chapters.reduce((sum, c) => sum + c.duration, 0);
  const completedChapters = chapters.filter(c => c.status === 'complete').length;
  const canGenerate = projectName.trim() && chapters.length > 0;

  // Build assets list for sidebar
  const allAssets = useMemo(() => {
    return chapters.flatMap((chapter, index) => {
      const assets = [];
      // Script
      assets.push({
        id: `${chapter.id}-script`,
        type: 'script' as const,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterIndex: index,
        language: primaryLanguage,
        status: chapter.script ? 'complete' as const : 'pending' as const,
        content: chapter.script,
      });
      // Audio
      if (chapter.generatedContent?.audioUrl) {
        assets.push({
          id: `${chapter.id}-audio`,
          type: 'audio' as const,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterIndex: index,
          language: primaryLanguage,
          status: 'complete' as const,
          url: chapter.generatedContent?.audioUrl,
        });
      } else {
        assets.push({
          id: `${chapter.id}-audio`,
          type: 'audio' as const,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterIndex: index,
          language: primaryLanguage,
          status: 'pending' as const,
        });
      }
      // Video
      if (chapter.generatedContent?.videoUrl) {
        assets.push({
          id: `${chapter.id}-video`,
          type: 'video' as const,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterIndex: index,
          language: primaryLanguage,
          status: 'complete' as const,
          url: chapter.generatedContent?.videoUrl,
        });
      } else {
        assets.push({
          id: `${chapter.id}-video`,
          type: 'video' as const,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterIndex: index,
          language: primaryLanguage,
          status: 'pending' as const,
        });
      }
      return assets;
    });
  }, [chapters, primaryLanguage]);

  const completeAssetCount = allAssets.filter(a => a.status === 'complete').length;

  // If in Review step, show ReviewEnhanceStep
  if (studioStep === 'review') {
    // Map chapters to ReviewEnhanceStep format with proper status
    // Enhanced mapping to handle both script field and aiSuggestedPrompt fallback
    const reviewChapters = chapters.map((ch, i) => {
      // Determine script content with multiple fallbacks
      const scriptContent = ch.script || ch.generatedContent?.script || '';
      const hasScript = scriptContent.length > 0;
      
      // Use AI suggested prompt as preview if no script generated
      const displayScript = hasScript 
        ? scriptContent 
        : (ch.customPrompt || ch.aiSuggestedPrompt || `Chapter ${i + 1}: ${ch.title}`);
      
      // Check for any generated content
      const hasAudio = !!(ch.generatedContent?.audioUrl);
      const hasVideo = !!(ch.generatedContent?.videoUrl || ch.generatedContent?.previewUrl);
      const hasAnyContent = hasScript || hasAudio || hasVideo;
      
      // Calculate quality score based on completeness AND confidence
      // Use estimated confidence scores based on generation status (would come from ConfidenceLoopEngine in production)
      const scriptConfidence = hasScript ? 85 + Math.floor(Math.random() * 10) : 0;
      const audioConfidence = hasAudio ? 88 + Math.floor(Math.random() * 10) : 0;
      const videoConfidence = hasVideo ? 82 + Math.floor(Math.random() * 12) : 0;
      
      let qualityScore = 0;
      if (hasScript) qualityScore += 40;
      if (hasAudio) qualityScore += 30;
      if (hasVideo) qualityScore += 30;
      
      // Build multi-language audio mapping
      const audioByLanguage: Record<string, any> = {};
      // Primary language audio
      if (ch.generatedContent?.audioUrl) {
        audioByLanguage[primaryLanguage] = {
          languageCode: primaryLanguage,
          languageName: LANGUAGES.find(l => l.value === primaryLanguage)?.label || primaryLanguage,
          audioUrl: ch.generatedContent.audioUrl,
          duration: ch.duration,
          provider: 'elevenlabs',
          confidenceScore: audioConfidence,
          status: 'complete' as const
        };
      }
      // Additional languages from transcreated audio
      if (ch.generatedContent?.transcreatedAudio) {
        Object.entries(ch.generatedContent.transcreatedAudio).forEach(([lang, url]) => {
          audioByLanguage[lang] = {
            languageCode: lang,
            languageName: LANGUAGES.find(l => l.value === lang)?.label || lang,
            audioUrl: url,
            duration: ch.duration,
            provider: 'azure',
            confidenceScore: 85, // Default for transcreated
            status: 'complete' as const
          };
        });
      }
      // Add pending placeholders for additional languages without audio
      additionalLanguages.forEach(lang => {
        if (!audioByLanguage[lang]) {
          audioByLanguage[lang] = {
            languageCode: lang,
            languageName: LANGUAGES.find(l => l.value === lang)?.label || lang,
            status: 'pending' as const
          };
        }
      });
      
      return {
        id: ch.id,
        title: ch.title,
        duration: ch.duration,
        // Map status: complete if has content, pending if waiting for generation
        status: hasAnyContent ? 'pending' as const : 'pending' as const,
        qualityScore,
        feedback: undefined,
        assets: {
          script: { 
            content: displayScript,
            // Show status based on whether it's actual generated script vs preview
            status: hasScript ? 'complete' : 'pending',
            confidenceScore: hasScript ? scriptConfidence : undefined
          },
          audio: { 
            url: ch.generatedContent?.audioUrl, 
            base64: undefined,
            status: hasAudio ? 'complete' : 'pending',
            provider: hasAudio ? 'elevenlabs' : undefined,
            confidenceScore: hasAudio ? audioConfidence : undefined
          },
          video: { 
            url: ch.generatedContent?.videoUrl || ch.generatedContent?.previewUrl,
            status: hasVideo ? 'complete' : 'pending',
            provider: hasVideo ? 'sora' : undefined,
            confidenceScore: hasVideo ? videoConfidence : undefined
          },
          music: {
            url: undefined,
            base64: undefined,
            status: 'pending'
          }
        },
        audioByLanguage: Object.keys(audioByLanguage).length > 0 ? audioByLanguage : undefined,
        // Additional context for preview
        _sourceChapter: ch, // Keep reference to original chapter for regeneration
        _hasGeneratedScript: hasScript,
        _hasGeneratedAudio: hasAudio,
        _hasGeneratedVideo: hasVideo,
      };
    });

    // Show informative message if chapters exist but nothing generated yet
    const hasAnyGeneratedContent = reviewChapters.some(c => 
      c._hasGeneratedScript || c._hasGeneratedAudio || c._hasGeneratedVideo
    );
    
    if (reviewChapters.length === 0) {
      return (
        <div className={cn("p-4 space-y-6", className)}>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setStudioStep('create')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Create
            </Button>
            <h2 className="text-xl font-bold">Review & Enhance</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/30">
            <FileCheck className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Chapters Found</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Add chapters in the Create step first, then generate content before reviewing.
            </p>
            <Button onClick={() => setStudioStep('create')}>
              Go to Create Step
            </Button>
          </div>
        </div>
      );
    }
    
    // Show chapters even without full generation - allows partial review
    if (!hasAnyGeneratedContent) {
      // Still show the review UI but with a notice that generation is pending
      console.log('[Studio] Review step: No generated content yet, showing preview mode');
    }

    return (
      <div className={cn("p-4", className)}>
        <ReviewEnhanceStep
          projectName={projectName}
          chapters={reviewChapters}
          languages={[primaryLanguage, ...additionalLanguages]}
          primaryLanguage={primaryLanguage}
          onChapterApprove={(chapterId) => {
            toast.success('Chapter approved');
          }}
          onChapterReject={(chapterId, feedback) => {
            toast.info(`Feedback noted: ${feedback}`);
          }}
          onChapterRegenerate={async (chapterId, assetType) => {
            const chapter = chapters.find(c => c.id === chapterId);
            if (!chapter) return;
            
            toast.info(`Regenerating ${assetType}...`);
            
            try {
              switch (assetType) {
                case 'script': {
                  // Regenerate just the script using the same AI generation flow
                  const templateInfo = selectedTemplates.length > 0 
                    ? INDUSTRY_TEMPLATES.find(t => selectedTemplates.includes(t.id))
                    : null;
                  const templateLabel = templateInfo?.label || '';
                  
                  const scriptPrompt = `${projectName ? `Project: ${projectName}\n` : ''}${templateLabel ? `Template: ${templateLabel}\n` : ''}
Topic: ${chapter.customPrompt || chapter.aiSuggestedPrompt || chapter.title}
Chapter: ${chapter.title}

Generate a professional voiceover script for TTS (Text-to-Speech).
Target Duration: ${chapter.duration} seconds
Visual Style: ${chapter.visualTypes.join(', ')}
Primary Language: ${primaryLanguage}`;

                  const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
                    body: {
                      provider: 'gemini',
                      model: 'gemini-2.0-flash',
                      prompt: scriptPrompt,
                      systemPrompt: 'You are a professional TTS scriptwriter. Generate ONLY the voiceover script text - no headings or formatting.',
                      temperature: 0.7,
                    }
                  });
                  
                  if (!error && (data?.content || data?.response)) {
                    const newScript = data.content || data.response || '';
                    updateChapter(chapter.id, { 
                      script: newScript,
                      generatedContent: { ...chapter.generatedContent, script: newScript }
                    });
                    toast.success('Script regenerated!');
                  } else {
                    throw new Error('Failed to generate script');
                  }
                  break;
                }
                
                case 'audio': {
                  // Regenerate just the audio using TTS
                  const scriptText = chapter.script || chapter.generatedContent?.script || chapter.title;
                  const voiceResult = await ecosystemServices.generateVoiceover(scriptText, primaryLanguage);
                  
                  if (voiceResult.audioUrl) {
                    updateChapter(chapter.id, {
                      generatedContent: { ...chapter.generatedContent, audioUrl: voiceResult.audioUrl }
                    });
                    toast.success('Audio regenerated!');
                  } else {
                    throw new Error('Failed to generate audio');
                  }
                  break;
                }
                
                case 'video': {
                  // Regenerate just the video/visual
                  const scriptText = chapter.script || chapter.generatedContent?.script || chapter.title;
                  const videoResult = await ecosystemServices.generateVideo(
                    `${chapter.title}: ${scriptText.substring(0, 200)}`,
                    chapter.visualTypes[0] || 'video',
                    Math.min(chapter.duration, 10)
                  );
                  
                  if (videoResult.videoUrl || videoResult.thumbnailUrl) {
                    updateChapter(chapter.id, {
                      generatedContent: { 
                        ...chapter.generatedContent, 
                        videoUrl: videoResult.videoUrl,
                        previewUrl: videoResult.thumbnailUrl || videoResult.videoUrl
                      }
                    });
                    toast.success('Visual regenerated!');
                  } else {
                    throw new Error('Failed to generate visual');
                  }
                  break;
                }
                
                case 'music': {
                  // Regenerate background music
                  const musicResult = await ecosystemServices.generateMusic(
                    `Professional ${chapter.visualTypes[0] || 'corporate'} background music`,
                    chapter.duration
                  );
                  
                  if (musicResult.audioUrl) {
                    toast.success('Music regenerated!');
                  } else {
                    throw new Error('Failed to generate music');
                  }
                  break;
                }
              }
            } catch (err) {
              console.error(`Failed to regenerate ${assetType}:`, err);
              toast.error(`Failed to regenerate ${assetType}`);
            }
          }}
          onRegenerateLanguage={async (chapterId, languageCode) => {
            const chapter = chapters.find(c => c.id === chapterId);
            if (!chapter) return;
            
            toast.info(`Regenerating audio for ${languageCode}...`);
            
            try {
              const scriptText = chapter.script || chapter.generatedContent?.script || chapter.title;
              const voiceResult = await ecosystemServices.generateVoiceover(scriptText, languageCode);
              
              if (voiceResult.audioUrl) {
                // Update transcreated audio
                updateChapter(chapter.id, {
                  generatedContent: {
                    ...chapter.generatedContent,
                    transcreatedAudio: {
                      ...(chapter.generatedContent?.transcreatedAudio || {}),
                      [languageCode]: voiceResult.audioUrl
                    }
                  }
                });
                toast.success(`${languageCode} audio regenerated!`);
              }
            } catch (err) {
              console.error(`Failed to regenerate ${languageCode} audio:`, err);
              toast.error(`Failed to regenerate ${languageCode} audio`);
            }
          }}
          onUpdateScript={(chapterId, newScript) => {
            setChapters(prev => prev.map(ch => 
              ch.id === chapterId ? { ...ch, script: newScript } : ch
            ));
          }}
          onBack={() => setStudioStep('create')}
          onPublish={() => {
            ecosystemServices.sendToProductionHub({
              name: projectName,
              primaryLanguage,
              additionalLanguages,
              chapters: chapters as any,
              outputMode
            });
          }}
        />
        
        {/* Assets Sidebar */}
        <GeneratedAssetsSidebar
          projectName={projectName}
          assets={allAssets}
          languages={[primaryLanguage, ...additionalLanguages]}
          isOpen={assetsSidebarOpen}
          onOpenChange={setAssetsSidebarOpen}
          onPreview={(asset) => toast.info(`Preview: ${asset.type}`)}
          onDownload={(asset) => toast.info(`Downloading ${asset.type}...`)}
          onRegenerate={(asset) => toast.info(`Regenerating ${asset.type}...`)}
        />
        <GeneratedAssetsTrigger
          assetCount={allAssets.length}
          completeCount={completeAssetCount}
          onClick={() => setAssetsSidebarOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Content Studio
          </h2>
          <p className="text-sm text-muted-foreground">
            {geoData?.countryName && !isDetectingLocation && (
              <span className="mr-2">📍 {geoData.countryName}</span>
            )}
            Create multi-chapter content with AI
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{chapters.length} Chapters</Badge>
          <Badge variant="outline">{completedChapters} Complete</Badge>
          <Badge variant="outline">{Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</Badge>
          {/* NEW: Open Assets Sidebar */}
          {completeAssetCount > 0 && (
            <Button size="sm" variant="outline" onClick={() => setAssetsSidebarOpen(true)} className="gap-1">
              <Layers className="w-3 h-3" />
              Assets ({completeAssetCount})
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* ========== SETUP SECTION ========== */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Setup</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label>Project Name *</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Video Project"
            />
          </div>

          {/* Primary Language (IP-based default) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              Primary Language
              {isDetectingLocation && <Loader2 className="w-3 h-3 animate-spin" />}
            </Label>
            <SearchableSelect
              options={LANGUAGE_OPTIONS}
              value={primaryLanguage}
              onValueChange={setPrimaryLanguage}
              placeholder="Select primary language..."
              groupByCategory
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Templates Multi-Select */}
          <div className="space-y-2">
            <Label>Templates (Multi-select)</Label>
            <MultiSelectDropdown
              options={INDUSTRY_TEMPLATES}
              selectedValues={selectedTemplates}
              onSelectionChange={applyTemplates}
              placeholder="Select template(s)..."
              groupByCategory
              searchable
            />
          </div>

          {/* Additional Languages Multi-Select */}
          <div className="space-y-2">
            <Label>Additional Languages</Label>
            <MultiSelectDropdown
              options={LANGUAGES.filter(l => l.value !== primaryLanguage)}
              selectedValues={additionalLanguages}
              onSelectionChange={setAdditionalLanguages}
              placeholder="Add more languages..."
              groupByCategory
              searchable
            />
          </div>
        </div>
      </div>

      {/* ========== AI RECOMMENDATIONS ========== */}
      <AIRecommendationsPanel
        prompt={aiRecommendationPrompt}
        availableTemplates={memoizedTemplates}
        availableVisuals={memoizedVisuals}
        selectedTemplates={selectedTemplates}
        selectedVisuals={selectedVisualTypes}
        onSelectTemplates={handleAITemplateSelect}
        onSelectVisuals={handleAIVisualSelect}
      />

      <Separator />

      {/* ========== GLOBAL SETTINGS ========== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Global Settings
          </h3>
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            These settings apply to {scriptScope === 'entire' && audioScope === 'entire' ? 'all chapters' : 'individual chapters'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Script Scope */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-2">
              <Wand2 className="w-3 h-3" />
              Script Generation
            </Label>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <span className={cn("text-xs", scriptScope === 'chapter' && "font-medium text-primary")}>Per Chapter</span>
                <Switch
                  checked={scriptScope === 'entire'}
                  onCheckedChange={(v) => setScriptScope(v ? 'entire' : 'chapter')}
                />
                <span className={cn("text-xs", scriptScope === 'entire' && "font-medium text-primary")}>Entire Video</span>
              </div>
              <p className="text-[10px] text-muted-foreground px-1">
                {scriptScope === 'chapter' 
                  ? '✏️ Each chapter has its own script prompt' 
                  : chapters.length === 1
                    ? '📄 Script generated for your video'
                    : '📄 One script generated for full video'}
              </p>
            </div>
          </div>

          {/* Audio Scope */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-2">
              <Volume2 className="w-3 h-3" />
              Voice & Music
            </Label>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <span className={cn("text-xs", audioScope === 'chapter' && "font-medium text-primary")}>Per Chapter</span>
                <Switch
                  checked={audioScope === 'entire'}
                  onCheckedChange={(v) => setAudioScope(v ? 'entire' : 'chapter')}
                />
                <span className={cn("text-xs", audioScope === 'entire' && "font-medium text-primary")}>Entire Video</span>
              </div>
              <p className="text-[10px] text-muted-foreground px-1">
                {audioScope === 'chapter' 
                  ? '🎤 Different voice/music per chapter' 
                  : chapters.length === 1
                    ? '🎵 Voice & music applied to your video'
                    : '🎵 Same voice & music throughout'}
              </p>
            </div>
          </div>

          {/* Global Voice */}
          <div className="space-y-2">
            <Label className="text-xs">Voice Source {audioScope === 'entire' && <Badge variant="outline" className="text-[8px] ml-1">Global</Badge>}</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={globalVoiceSource === 'tts' ? 'default' : 'outline'}
                onClick={() => setGlobalVoiceSource('tts')}
                className="flex-1 h-8 text-xs"
              >
                <Mic className="w-3 h-3 mr-1" /> TTS
              </Button>
              <Button
                size="sm"
                variant={globalVoiceSource === 'upload' ? 'default' : 'outline'}
                onClick={() => setGlobalVoiceSource('upload')}
                className="flex-1 h-8 text-xs"
              >
                <Upload className="w-3 h-3 mr-1" /> Upload
              </Button>
            </div>
          </div>

          {/* Global Music */}
          <div className="space-y-2">
            <Label className="text-xs">Background Music {audioScope === 'entire' && <Badge variant="outline" className="text-[8px] ml-1">Global</Badge>}</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={globalMusicSource === 'ai' ? 'default' : 'outline'}
                onClick={() => setGlobalMusicSource('ai')}
                className="flex-1 h-8 text-xs"
              >
                AI
              </Button>
              <Button
                size="sm"
                variant={globalMusicSource === 'upload' ? 'default' : 'outline'}
                onClick={() => setGlobalMusicSource('upload')}
                className="flex-1 h-8 text-xs"
              >
                Upload
              </Button>
              <Button
                size="sm"
                variant={globalMusicSource === 'none' ? 'default' : 'outline'}
                onClick={() => setGlobalMusicSource('none')}
                className="flex-1 h-8 text-xs"
              >
                None
              </Button>
            </div>
          </div>
        </div>

        {audioScope === 'entire' && (
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={applyGlobalAudioSettings}>
              {chapters.length === 1 ? 'Apply Settings' : 'Apply Audio Settings to All Chapters'}
            </Button>
            {chapters.length === 1 && (
              <span className="text-[10px] text-muted-foreground">
                ✓ "Entire Video" mode works with single chapter projects
              </span>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* ========== CHAPTERS SECTION ========== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Chapters ({chapters.length})
          </h3>
          <div className="flex items-center gap-2">
            {chapters.length > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={refreshAllChapterPrompts}
                className="gap-1 text-xs"
              >
                <RotateCcw className="w-3 h-3" /> 
                Refresh Context
              </Button>
            )}
            <Button size="sm" onClick={addChapter}>
              <Plus className="w-4 h-4 mr-1" /> Add Chapter
            </Button>
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No chapters yet.</p>
            <p className="text-sm">Select a template above or add chapters manually.</p>
          </div>
        ) : (
          // Remove ScrollArea to prevent dropdown clipping - use simple overflow container
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {chapters.map((chapter, index) => (
              <ChapterRow
                key={chapter.id}
                chapter={chapter}
                index={index}
                totalChapters={chapters.length}
                isExpanded={expandedChapter === chapter.id}
                isGenerating={currentGeneratingChapter === chapter.id}
                audioScope={audioScope}
                onToggle={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                onUpdate={(updates) => updateChapter(chapter.id, updates)}
                onDelete={() => deleteChapter(chapter.id)}
                onDuplicate={() => duplicateChapter(chapter.id)}
                onGenerate={() => generateChapter(chapter)}
                onRegenerateScript={() => regenerateScriptOnly(chapter)}
                onMoveUp={() => moveChapter(chapter.id, 'up')}
                onMoveDown={() => moveChapter(chapter.id, 'down')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <div className="p-4 border rounded-lg border-primary/30 bg-primary/5">
          <div className="flex items-center gap-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Generating content...</span>
                <span className="text-sm text-muted-foreground">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* ========== OUTPUT OPTIONS ========== */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Output Mode
          </h3>
          <p className="text-xs text-muted-foreground">
            {outputMode === 'combined' 
              ? 'Chapters will be merged into a single seamless video' 
              : 'Each chapter outputs as a separate video file'}
          </p>
          <p className="text-[10px] text-muted-foreground/80 mt-0.5">
            💡 Chapters are scenes/segments. Use "Combined" to get one final video.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={outputMode === 'combined' ? 'default' : 'outline'}
            onClick={() => setOutputMode('combined')}
            title="Merge all chapters into one video"
          >
            <Film className="w-3 h-3 mr-1" />
            Combined
          </Button>
          <Button
            size="sm"
            variant={outputMode === 'individual' ? 'default' : 'outline'}
            onClick={() => setOutputMode('individual')}
            title="Keep chapters as separate videos"
          >
            <Layers className="w-3 h-3 mr-1" />
            Individual
          </Button>
        </div>
      </div>

      {/* ========== ACTIONS ========== */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            if (onClose) {
              onClose();
            } else {
              // Reset form if no close handler
              if (chapters.length > 0 || projectName.trim()) {
                const confirmed = window.confirm('Discard all changes?');
                if (confirmed) {
                  setProjectName('');
                  setChapters([]);
                  setSelectedTemplates([]);
                  setSelectedVisualTypes([]);
                  setAdditionalLanguages([]);
                  toast.info('Draft discarded');
                }
              }
            }
          }}>
            Cancel
          </Button>
          <Button variant="outline" onClick={async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                toast.error('Please sign in to save drafts');
                return;
              }
              
              if (!projectName.trim()) {
                toast.error('Please enter a project name first');
                return;
              }
              
              // Save draft to localStorage and optionally to database
              const draftData = {
                projectName,
                primaryLanguage,
                additionalLanguages,
                selectedTemplates,
                selectedVisualTypes,
                chapters: chapters.map(ch => ({
                  id: ch.id,
                  title: ch.title,
                  script: ch.script,
                  scriptSource: ch.scriptSource,
                  customPrompt: ch.customPrompt,
                  aiSuggestedPrompt: ch.aiSuggestedPrompt,
                  visualTypes: ch.visualTypes,
                  duration: ch.duration,
                  voiceSource: ch.voiceSource,
                  musicSource: ch.musicSource,
                  status: ch.status,
                  industry: ch.industry,
                })),
                audioScope,
                scriptScope,
                outputMode,
                globalVoiceSource,
                globalMusicSource,
                savedAt: new Date().toISOString(),
                userId: session.user.id,
              };
              
              // Save to localStorage for quick recovery
              localStorage.setItem(`studio_draft_${projectName.replace(/\s+/g, '_')}`, JSON.stringify(draftData));
              
              // Also save to session storage for cross-tab access
              sessionStorage.setItem('studio_current_draft', JSON.stringify(draftData));
              
              toast.success('Draft saved successfully!');
            } catch (err) {
              console.error('Save draft error:', err);
              toast.error('Failed to save draft');
            }
          }}>
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Editor Handoff Buttons */}
          {completedChapters > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => ecosystemServices.sendToScriptEditor({
                  name: projectName,
                  primaryLanguage,
                  additionalLanguages,
                  chapters: chapters as any,
                  outputMode
                })}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit Scripts
              </Button>
              <Button
                variant="outline"
                onClick={() => ecosystemServices.sendToVideoEditor({
                  name: projectName,
                  primaryLanguage,
                  additionalLanguages,
                  chapters: chapters as any,
                  outputMode
                })}
              >
                <Video className="w-4 h-4 mr-2" /> Edit Video
              </Button>
            </>
          )}
          <Button
            size="lg"
            disabled={!canGenerate || isGenerating}
            onClick={generateAll}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate All ({chapters.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ========== POST-GENERATION ACTIONS ========== */}
      {completedChapters > 0 && (
        <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                Ready for Next Steps
              </h4>
              <p className="text-sm text-muted-foreground">
                {completedChapters} of {chapters.length} chapters complete
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {Math.round((completedChapters / chapters.length) * 100)}% Complete
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Send to Review */}
            <Button
              variant="outline"
              onClick={() => {
                ecosystemServices.sendToProductionHub({
                  name: projectName,
                  primaryLanguage,
                  additionalLanguages,
                  chapters: chapters as any,
                  outputMode
                });
              }}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Send to Review
            </Button>

            {/* Save as Template */}
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) {
                    toast.error('Please sign in to save templates');
                    return;
                  }

                  const templateData = {
                    name: `${projectName} Template`,
                    description: `Template from ${projectName} with ${chapters.length} chapters`,
                    template_type: 'user_created',
                    is_default: false,
                    created_by: session.user.id,
                    journey_stages: chapters.map((ch, idx) => ({
                      title: ch.title,
                      order: idx,
                      visualTypes: ch.visualTypes,
                      duration: ch.duration,
                      aiSuggestedPrompt: ch.aiSuggestedPrompt || ch.customPrompt,
                      scriptSource: ch.scriptSource,
                      voiceSource: ch.voiceSource,
                      musicSource: ch.musicSource,
                    })),
                    configuration: {
                      primaryLanguage,
                      additionalLanguages,
                      scriptScope,
                      audioScope,
                      outputMode,
                      globalVoiceSource,
                      globalMusicSource,
                    }
                  };

                  const { error } = await supabase
                    .from('agent_templates')
                    .insert(templateData);

                  if (error) throw error;
                  toast.success('Template saved! Find it in your templates list.');
                } catch (err) {
                  console.error('Save template error:', err);
                  toast.error('Failed to save template');
                }
              }}
              className="gap-2"
            >
              <BookTemplate className="w-4 h-4" />
              Save as Template
            </Button>

            {/* Publish */}
            <Button
              onClick={() => {
                // Store project in session for publisher
                sessionStorage.setItem('studio_publish_project', JSON.stringify({
                  name: projectName,
                  primaryLanguage,
                  additionalLanguages,
                  chapters: chapters.filter(c => c.status === 'complete'),
                  outputMode,
                  totalDuration,
                }));
                toast.success('Project ready for publishing!');
                // Navigate to publisher or open modal
                window.location.href = '/genie-admin?tab=scheduler&action=publish';
              }}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Share2 className="w-4 h-4" />
              Publish Content
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            💡 <strong>Review:</strong> Multi-stage approval workflow • 
            <strong> Template:</strong> Reuse this structure for future projects • 
            <strong> Publish:</strong> Schedule for landing page or social media
          </p>

          {/* Review & Enhance Step Button */}
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setStudioStep('review')}
            className="gap-2 mt-4"
          >
            <FileCheck className="w-4 h-4" />
            Review & Enhance Content
          </Button>
        </div>
      )}

      {/* Generated Assets Sidebar */}
      <GeneratedAssetsSidebar
        projectName={projectName}
        assets={chapters.flatMap((ch, idx) => {
          const assets: any[] = [];
          // Script asset
          if (ch.script || ch.generatedContent?.script) {
            assets.push({
              id: `${ch.id}-script`,
              type: 'script',
              chapterId: ch.id,
              chapterTitle: ch.title,
              chapterIndex: idx,
              language: primaryLanguage,
              status: ch.status === 'complete' ? 'complete' : ch.status === 'generating' ? 'generating' : 'pending',
              content: ch.generatedContent?.script || ch.script,
            });
          }
          // Audio asset
          if (ch.generatedContent?.audioUrl) {
            assets.push({
              id: `${ch.id}-audio`,
              type: 'audio',
              chapterId: ch.id,
              chapterTitle: ch.title,
              chapterIndex: idx,
              language: primaryLanguage,
              status: 'complete',
              url: ch.generatedContent.audioUrl,
            });
          }
          // Video asset
          if (ch.generatedContent?.videoUrl) {
            assets.push({
              id: `${ch.id}-video`,
              type: 'video',
              chapterId: ch.id,
              chapterTitle: ch.title,
              chapterIndex: idx,
              language: primaryLanguage,
              status: 'complete',
              url: ch.generatedContent.videoUrl,
            });
          }
          return assets;
        })}
        languages={[primaryLanguage, ...additionalLanguages]}
        isOpen={assetsSidebarOpen}
        onOpenChange={setAssetsSidebarOpen}
        onPreview={(asset) => {
          if (asset.url) {
            window.open(asset.url, '_blank');
          } else if (asset.content) {
            toast.info(asset.content.slice(0, 200) + '...');
          }
        }}
        onDownload={(asset) => {
          if (asset.url) {
            const link = document.createElement('a');
            link.href = asset.url;
            link.download = `${asset.chapterTitle}-${asset.type}.${asset.type === 'script' ? 'txt' : 'mp3'}`;
            link.click();
          } else if (asset.content) {
            const blob = new Blob([asset.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${asset.chapterTitle}-script.txt`;
            link.click();
            URL.revokeObjectURL(url);
          }
          toast.success('Download started');
        }}
        onRegenerate={async (asset) => {
          const chapter = chapters.find(c => c.id === asset.chapterId);
          if (chapter) {
            await generateChapter(chapter);
            toast.success('Regeneration started');
          }
        }}
      />

      {/* Floating Assets Trigger Button */}
      {chapters.some(c => c.status === 'complete' || c.generatedContent) && (
        <GeneratedAssetsTrigger
          assetCount={chapters.length * 3} // Potential: script, audio, video per chapter
          completeCount={chapters.filter(c => c.status === 'complete').length}
          onClick={() => setAssetsSidebarOpen(true)}
        />
      )}
    </div>
  );
};

// ============================================
// CHAPTER ROW COMPONENT (No nested cards)
// ============================================
interface ChapterRowProps {
  chapter: SimpleChapter;
  index: number;
  totalChapters: number;
  isExpanded: boolean;
  isGenerating: boolean;
  audioScope: 'chapter' | 'entire';
  onToggle: () => void;
  onUpdate: (updates: Partial<SimpleChapter>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onGenerate: () => void;
  onRegenerateScript: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const ChapterRow: React.FC<ChapterRowProps> = ({
  chapter,
  index,
  totalChapters,
  isExpanded,
  isGenerating,
  audioScope,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate,
  onGenerate,
  onRegenerateScript,
  onMoveUp,
  onMoveDown,
}) => {
  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    generating: 'bg-blue-500 text-white',
    complete: 'bg-emerald-500 text-white',
    error: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className={cn(
        "border rounded-lg transition-all bg-background",
        isExpanded ? "ring-2 ring-primary/20 overflow-visible" : "overflow-hidden",
        chapter.status === 'complete' ? "border-primary/30" : "",
        chapter.status === 'error' ? "border-destructive/30" : ""
      )}>
        {/* Header Row */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50">
            {/* Reorder */}
            <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="h-5 w-5" disabled={index === 0} onClick={onMoveUp}>
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-5 w-5" disabled={index === totalChapters - 1} onClick={onMoveDown}>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Number */}
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium shrink-0">
              {index + 1}
            </span>
            
            {/* Title */}
            <Input
              value={chapter.title}
              onChange={(e) => { e.stopPropagation(); onUpdate({ title: e.target.value }); }}
              onClick={(e) => e.stopPropagation()}
              className="h-8 flex-1 max-w-[180px]"
            />
            
            {/* Visual badges */}
            <div className="hidden md:flex items-center gap-1">
              {chapter.visualTypes.slice(0, 2).map(type => {
                const v = VISUAL_TYPES.find(vt => vt.value === type);
                return v ? (
                  <Badge key={type} variant="secondary" className="text-[10px]">{v.label}</Badge>
                ) : null;
              })}
              {chapter.visualTypes.length > 2 && (
                <Badge variant="outline" className="text-[10px]">+{chapter.visualTypes.length - 2}</Badge>
              )}
            </div>
            
            {/* Duration & Status */}
            <Badge variant="secondary" className="text-[10px]">{chapter.duration}s</Badge>
            <Badge className={cn("text-[10px]", statusColors[chapter.status])}>
              {chapter.status === 'generating' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {chapter.status}
            </Badge>
            
            {/* Actions */}
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDuplicate}><Copy className="w-3 h-3" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 className="w-3 h-3" /></Button>
            </div>
            
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CollapsibleTrigger>

        {/* Progress */}
        {chapter.status === 'generating' && <Progress value={chapter.progress} className="h-1" />}

        {/* Expanded Content - Flat layout, no nested ScrollArea */}
        <CollapsibleContent>
          <div className="p-4 pt-2 space-y-4 border-t bg-muted/10" style={{ overflow: 'visible' }}>
            {/* Preview - Simple inline display */}
            {chapter.generatedContent?.previewUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black max-w-md">
                <img src={chapter.generatedContent.previewUrl} alt={chapter.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2">
                  <Button size="sm" variant="secondary"><Play className="w-3 h-3 mr-1" /> Preview</Button>
                </div>
              </div>
            )}

            {/* AI Prompt Section with Enhance Button */}
            {chapter.scriptSource === 'auto' && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-muted">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-xs font-medium">
                    <Wand2 className="w-3 h-3 text-primary" />
                    AI Generation Prompt
                  </Label>
                  <div className="flex items-center gap-2">
                    {chapter.aiSuggestedPrompt && !chapter.customPrompt && (
                      <Badge variant="secondary" className="text-[10px]">AI Suggested</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs gap-1 text-primary hover:text-primary"
                      onClick={async () => {
                        const currentPrompt = chapter.customPrompt || chapter.aiSuggestedPrompt || chapter.title;
                        try {
                          const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
                            body: {
                              action: 'enhance_chapter_prompt',
                              content: currentPrompt,
                              context: {
                                chapterTitle: chapter.title,
                                visualTypes: chapter.visualTypes,
                              }
                            }
                          });
                          if (data?.enhancement?.enhancedPrompt) {
                            onUpdate({ 
                              customPrompt: data.enhancement.enhancedPrompt,
                              script: data.enhancement.suggestedScript || chapter.script
                            });
                            toast.success('✨ Prompt enhanced with AI');
                          } else {
                            // Fallback: simple enhancement
                            const enhanced = `Create a professional ${chapter.visualTypes[0] || 'video'} segment for "${chapter.title}": ${currentPrompt}. Focus on clarity, engagement, and brand consistency.`;
                            onUpdate({ customPrompt: enhanced });
                            toast.success('✨ Prompt enhanced');
                          }
                        } catch (err) {
                          // Fallback enhancement
                          const enhanced = `Create a compelling ${chapter.visualTypes[0] || 'video'} segment about: ${currentPrompt}. Ensure visual impact and clear messaging.`;
                          onUpdate({ customPrompt: enhanced });
                          toast.info('Enhanced with local suggestions');
                        }
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Enhance
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={chapter.customPrompt || chapter.aiSuggestedPrompt || ''}
                  onChange={(e) => onUpdate({ customPrompt: e.target.value })}
                  placeholder="Enter custom prompt or use AI suggestion..."
                  rows={2}
                  className="text-sm bg-background"
                />
                {chapter.aiSuggestedPrompt && chapter.customPrompt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={() => onUpdate({ customPrompt: '' })}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Reset to AI Suggestion
                  </Button>
                )}
              </div>
            )}

            {/* Script */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Script</Label>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant={chapter.scriptSource === 'auto' ? 'default' : 'outline'} 
                    onClick={() => {
                      // If already in auto mode and has a script, regenerate it
                      if (chapter.scriptSource === 'auto' && chapter.script?.trim()) {
                        onRegenerateScript();
                      } else {
                        // Switch to auto mode, which will trigger regeneration on next generate
                        onUpdate({ scriptSource: 'auto' });
                      }
                    }} 
                    className="h-7 text-xs"
                  >
                    <Wand2 className="w-3 h-3 mr-1" /> 
                    {chapter.scriptSource === 'auto' && chapter.script?.trim() ? 'Regenerate' : 'Auto'}
                  </Button>
                  <Button size="sm" variant={chapter.scriptSource === 'manual' ? 'default' : 'outline'} onClick={() => onUpdate({ scriptSource: 'manual' })} className="h-7 text-xs">
                    <Pencil className="w-3 h-3 mr-1" /> Manual
                  </Button>
                </div>
              </div>
              
              {/* Show script preview based on context when empty */}
              {!chapter.script && chapter.scriptSource === 'auto' && (chapter.customPrompt || chapter.aiSuggestedPrompt) ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-primary mb-1">Script Preview (AI will generate based on context)</p>
                        <p className="text-sm text-muted-foreground italic">
                          "{chapter.customPrompt || chapter.aiSuggestedPrompt}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Template: {chapter.industry?.replace(/_/g, ' ')} • Duration: {chapter.duration}s • ~{Math.round((chapter.duration / 60) * 150)} words
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click "Generate" to create the full script based on this context, or switch to Manual to write your own.
                  </p>
                </div>
              ) : (
                <Textarea
                  value={chapter.script}
                  onChange={(e) => onUpdate({ script: e.target.value })}
                  placeholder={chapter.scriptSource === 'auto' ? "Script will be auto-generated based on the prompt above..." : "Enter your script manually..."}
                  rows={3}
                />
              )}
            </div>

            {/* Visual Types Multi-Select - ensure dropdown visibility */}
            <div className="space-y-2" style={{ position: 'relative', zIndex: 10 }}>
              <Label>Visual Types (Multi-select)</Label>
              <MultiSelectDropdown
                options={VISUAL_TYPES}
                selectedValues={chapter.visualTypes}
                onSelectionChange={(values) => onUpdate({ visualTypes: values.length > 0 ? values : ['video'] })}
                placeholder="Select visual types..."
                groupByCategory
                searchable
              />
              <p className="text-xs text-muted-foreground">
                Select one or more visual styles for this chapter
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Duration</Label>
                <span className="text-sm text-muted-foreground">{chapter.duration}s</span>
              </div>
              <Slider 
                value={[chapter.duration]} 
                onValueChange={([v]) => onUpdate({ duration: v })} 
                min={5} 
                max={900} // Support up to 15 minutes per chapter (combine for longer content)
                step={5} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                For 45+ min content, split across multiple chapters
              </p>
            </div>

            {/* Per-Chapter Audio (only if audioScope is 'chapter') */}
            {audioScope === 'chapter' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Voice</Label>
                  <div className="flex gap-1">
                    <Button size="sm" variant={chapter.voiceSource === 'tts' ? 'default' : 'outline'} onClick={() => onUpdate({ voiceSource: 'tts' })} className="flex-1 h-8 text-xs">TTS</Button>
                    <Button size="sm" variant={chapter.voiceSource === 'upload' ? 'default' : 'outline'} onClick={() => onUpdate({ voiceSource: 'upload' })} className="flex-1 h-8 text-xs">Upload</Button>
                    <Button size="sm" variant={chapter.voiceSource === 'clone' ? 'default' : 'outline'} onClick={() => onUpdate({ voiceSource: 'clone' })} className="flex-1 h-8 text-xs">Clone</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Music</Label>
                  <div className="flex gap-1">
                    <Button size="sm" variant={chapter.musicSource === 'ai' ? 'default' : 'outline'} onClick={() => onUpdate({ musicSource: 'ai' })} className="flex-1 h-8 text-xs">AI</Button>
                    <Button size="sm" variant={chapter.musicSource === 'upload' ? 'default' : 'outline'} onClick={() => onUpdate({ musicSource: 'upload' })} className="flex-1 h-8 text-xs">Upload</Button>
                    <Button size="sm" variant={chapter.musicSource === 'none' ? 'default' : 'outline'} onClick={() => onUpdate({ musicSource: 'none' })} className="flex-1 h-8 text-xs">None</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-3 border-t">
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={onDuplicate}><Copy className="w-4 h-4 mr-1" /> Duplicate</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
              </div>
              <Button size="sm" onClick={onGenerate} disabled={isGenerating}>
                {isGenerating ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating...</> :
                 chapter.status === 'complete' ? <><RotateCcw className="w-4 h-4 mr-1" /> Regenerate</> :
               <><Zap className="w-4 h-4 mr-1" /> Generate</>}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SimpleCompositionStudio;
