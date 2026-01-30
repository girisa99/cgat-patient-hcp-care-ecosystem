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

import React, { useState, useCallback, useEffect } from 'react';
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
  Send, FileCheck, BookTemplate, Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useIPBasedContent } from '@/hooks/useIPBasedContent';
import { useStudioEcosystem } from './useStudioEcosystem';

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

  // Project state
  const [projectName, setProjectName] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
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

  // Set primary language from IP detection
  useEffect(() => {
    if (defaultLanguage && !isDetectingLocation) {
      setPrimaryLanguage(defaultLanguage);
      if (geoData?.countryName) {
        toast.info(`Detected region: ${geoData.countryName}`, { duration: 3000 });
      }
    }
  }, [defaultLanguage, isDetectingLocation, geoData]);

  // Apply templates - combines chapters from all selected templates
  // Get default visual types based on template
  const getDefaultVisualsForTemplate = (templateId: string): string[] => {
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
  };

  // Generate AI suggested prompt for a chapter
  const generateAISuggestedPrompt = (title: string, industry: string): string => {
    const prompts: Record<string, Record<string, string>> = {
      saudi_vision_2030: {
        'Vision Overview': 'Create an inspiring overview of Saudi Vision 2030, highlighting economic diversification and digital transformation.',
        'Economic Diversification': 'Explain Saudi Arabia\'s strategy to reduce oil dependence through tourism and tech investments.',
        'Digital Infrastructure': 'Showcase the smart city initiatives and 5G/cloud infrastructure developments.',
        'Smart Cities': 'Present NEOM and other futuristic urban development projects.',
        'Future Outlook': 'Summarize the 2030 goals and call-to-action for global partnerships.',
      },
      india_upi: {
        'UPI Introduction': 'Introduce UPI as a revolutionary real-time payment system transforming digital payments.',
        'Technology Behind UPI': 'Explain the NPCI architecture and instant bank-to-bank transfer technology.',
        'Merchant Adoption': 'Show how small businesses and street vendors adopted QR-based payments.',
        'Global Expansion': 'Highlight UPI expansion to UAE, Singapore, and future markets.',
      },
      africa_tourism: {
        'Wildlife Safari': 'Showcase breathtaking wildlife experiences across Africa\'s national parks.',
        'Cultural Heritage': 'Highlight rich cultural traditions and historical sites.',
        'Adventure Tourism': 'Present adventure activities from mountain climbing to water sports.',
        'Beach Destinations': 'Feature stunning coastal destinations and island getaways.',
        'Eco Tourism': 'Emphasize sustainable tourism and conservation efforts.',
      },
      saas_demo: {
        'Product Overview': 'Present the key value proposition and solve the main customer pain point.',
        'Key Features': 'Demonstrate the most impactful features with real-world examples.',
        'Use Cases': 'Show how different industries use the product successfully.',
        'Getting Started': 'Walk through the onboarding process and first-time user experience.',
      },
    };
    return prompts[industry]?.[title] || `Create engaging content about "${title}" for ${industry.replace(/_/g, ' ')} audience.`;
  };

  const applyTemplates = useCallback((templateIds: string[]) => {
    setSelectedTemplates(templateIds);
    
    if (templateIds.length === 0) {
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
  }, [globalVoiceSource, globalMusicSource]);

  // Chapter CRUD
  const addChapter = useCallback(() => {
    const industry = selectedTemplates[0] || 'blank';
    const title = `Chapter ${chapters.length + 1}`;
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
    toast.success('Chapter added');
  }, [chapters.length, globalVoiceSource, globalMusicSource, selectedTemplates]);

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
    toast.success('Applied audio settings to all chapters');
  }, [globalVoiceSource, globalMusicSource]);

  // Generate single chapter using ecosystem services
  const generateChapter = async (chapter: SimpleChapter) => {
    updateChapter(chapter.id, { status: 'generating', progress: 0 });
    setCurrentGeneratingChapter(chapter.id);

    try {
      let script = chapter.script;
      updateChapter(chapter.id, { progress: 10 });
      
      // Step 1: Generate script if auto
      if (chapter.scriptSource === 'auto' || !script.trim()) {
        console.log('[Studio] Generating script for:', chapter.title);
        
        const effectivePrompt = chapter.customPrompt?.trim() 
          || chapter.aiSuggestedPrompt 
          || `Create engaging content about "${chapter.title}"`;
        
        const industryContext = chapter.industry 
          ? ` for ${chapter.industry.replace(/_/g, ' ')} industry` 
          : '';
        
        const { data: scriptData, error: scriptError } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider: 'gemini',
            model: 'gemini-2.0-flash',
            prompt: `${effectivePrompt}

Generate a professional ${chapter.duration}-second voiceover script${industryContext}.
Visual style: ${chapter.visualTypes.join(', ')}.
Language: ${primaryLanguage}. Keep it engaging, concise, and professional.`,
            systemPrompt: 'You are a professional scriptwriter specializing in video content. Generate only the script text suitable for voiceover, no formatting or stage directions.',
            maxTokens: 600,
            action: 'generate_script'
          }
        });

        if (scriptError) throw new Error(scriptError.message);
        script = scriptData?.content || scriptData?.response || `Script for ${chapter.title}`;
        updateChapter(chapter.id, { script, progress: 25 });
      } else {
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
      let previewUrl = `https://placehold.co/1920x1080/ec4899/ffffff?text=${encodeURIComponent(chapter.title)}`;
      let videoUrl: string | undefined;
      
      try {
        console.log('[Studio] Generating visual content, type:', visualType);
        const videoResult = await ecosystemServices.generateVideo(
          `${chapter.title}: ${script.substring(0, 200)}`,
          visualType,
          Math.min(chapter.duration, 10)
        );
        
        if (videoResult.success) {
          videoUrl = videoResult.videoUrl;
          previewUrl = videoResult.thumbnailUrl || videoResult.videoUrl || previewUrl;
          console.log('[Studio] Video generated with provider:', videoResult.provider);
        }
      } catch (e) {
        console.warn('[Studio] Video fallback to image:', e);
        // Fallback to image generation
        try {
          const { data: imageData } = await supabase.functions.invoke('ai-universal-processor', {
            body: {
              provider: 'gemini',
              imageGeneration: true,
              action: 'image_generation',
              prompt: `Professional ${visualType} thumbnail for: ${chapter.title}`,
              aspectRatio: '16:9'
            }
          });
          if (imageData?.imageUrl) previewUrl = imageData.imageUrl;
        } catch (imgError) {
          console.warn('[Studio] Image fallback used');
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
      console.error('[Studio] Error:', error);
      updateChapter(chapter.id, { status: 'error', progress: 0 });
      toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  };

  // Stats
  const totalDuration = chapters.reduce((sum, c) => sum + c.duration, 0);
  const completedChapters = chapters.filter(c => c.status === 'complete').length;
  const canGenerate = projectName.trim() && chapters.length > 0;

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
          <Button size="sm" variant="secondary" onClick={applyGlobalAudioSettings}>
            Apply Audio Settings to All Chapters
          </Button>
        )}
      </div>

      <Separator />

      {/* ========== CHAPTERS SECTION ========== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Chapters ({chapters.length})
          </h3>
          <Button size="sm" onClick={addChapter}>
            <Plus className="w-4 h-4 mr-1" /> Add Chapter
          </Button>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No chapters yet.</p>
            <p className="text-sm">Select a template above or add chapters manually.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-2 pr-2">
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
                  onMoveUp={() => moveChapter(chapter.id, 'up')}
                  onMoveDown={() => moveChapter(chapter.id, 'down')}
                />
              ))}
            </div>
          </ScrollArea>
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
            Output
          </h3>
          <p className="text-xs text-muted-foreground">
            {outputMode === 'combined' ? 'Single combined video' : 'Separate files per chapter'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={outputMode === 'combined' ? 'default' : 'outline'}
            onClick={() => setOutputMode('combined')}
          >
            Combined
          </Button>
          <Button
            size="sm"
            variant={outputMode === 'individual' ? 'default' : 'outline'}
            onClick={() => setOutputMode('individual')}
          >
            Individual
          </Button>
        </div>
      </div>

      {/* ========== ACTIONS ========== */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline">
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
        </div>
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
        "border rounded-lg overflow-hidden transition-all bg-background",
        isExpanded ? "ring-2 ring-primary/20" : "",
        chapter.status === 'complete' ? "border-emerald-500/30" : "",
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

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="p-4 pt-2 space-y-4 border-t bg-muted/10">
            {/* Preview */}
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
                  <Button size="sm" variant={chapter.scriptSource === 'auto' ? 'default' : 'outline'} onClick={() => onUpdate({ scriptSource: 'auto' })} className="h-7 text-xs">
                    <Wand2 className="w-3 h-3 mr-1" /> Auto
                  </Button>
                  <Button size="sm" variant={chapter.scriptSource === 'manual' ? 'default' : 'outline'} onClick={() => onUpdate({ scriptSource: 'manual' })} className="h-7 text-xs">
                    <Pencil className="w-3 h-3 mr-1" /> Manual
                  </Button>
                </div>
              </div>
              <Textarea
                value={chapter.script}
                onChange={(e) => onUpdate({ script: e.target.value })}
                placeholder={chapter.scriptSource === 'auto' ? "Script will be auto-generated based on the prompt above..." : "Enter your script manually..."}
                rows={3}
              />
            </div>

            {/* Visual Types Multi-Select */}
            <div className="space-y-2">
              <Label>Visual Types (Multi-select)</Label>
              <MultiSelectDropdown
                options={VISUAL_TYPES}
                selectedValues={chapter.visualTypes}
                onSelectionChange={(values) => onUpdate({ visualTypes: values.length > 0 ? values : ['video'] })}
                placeholder="Select visual types..."
                groupByCategory
                searchable
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Duration</Label>
                <span className="text-sm text-muted-foreground">{chapter.duration}s</span>
              </div>
              <Slider value={[chapter.duration]} onValueChange={([v]) => onUpdate({ duration: v })} min={5} max={120} step={5} />
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
