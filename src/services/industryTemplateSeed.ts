/**
 * Industry Template Seed Service
 *
 * Migrates hardcoded INDUSTRY_TEMPLATES + TEMPLATE_CHAPTERS from
 * SimpleCompositionStudio into the video_blueprints + blueprint_scenes
 * DB tables so both Cast and Composition Studio use a single source of truth.
 *
 * Run once via admin panel or on first load when no industry templates exist.
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Industry Template Definitions ──────────────────────────────────────────
// These were previously hardcoded in SimpleCompositionStudio.tsx.
// After migration they live in video_blueprints with industry_tags = ['industry_template'].

export interface IndustryTemplateDefinition {
  id: string;
  label: string;
  category: string;
  description: string;
  chapters: string[];
}

/**
 * All 110+ industry templates with their chapter structures.
 * This is the canonical source used for seeding — after migration, DB is the source of truth.
 */
export const INDUSTRY_TEMPLATE_DEFINITIONS: IndustryTemplateDefinition[] = [
  // === GOVERNMENT & NATIONAL INITIATIVES ===
  { id: 'saudi_vision_2030', label: 'Saudi Vision 2030', category: 'Government', description: 'Digital transformation for Saudi initiatives', chapters: ['Vision Overview', 'Economic Diversification', 'Digital Infrastructure', 'Smart Cities', 'Future Outlook'] },
  { id: 'uae_digital', label: 'UAE Digital Government', category: 'Government', description: 'UAE smart services', chapters: ['Digital Transformation', 'Smart Services', 'Innovation Hub', 'Future Plans'] },
  { id: 'qatar_2030', label: 'Qatar National Vision 2030', category: 'Government', description: 'Qatar diversification strategy', chapters: ['National Vision', 'Economic Pillars', 'Human Development', 'Environmental Strategy', 'Future Goals'] },
  { id: 'oman_2040', label: 'Oman Vision 2040', category: 'Government', description: 'Oman economic diversification', chapters: ['Vision Overview', 'Economic Diversification', 'Tourism & Heritage', 'Digital Infrastructure'] },
  { id: 'bahrain_2030', label: 'Bahrain Economic Vision', category: 'Government', description: 'Bahrain economic reform', chapters: ['Economic Reform', 'Digital Banking Hub', 'Tourism Growth', 'Future Vision'] },
  { id: 'kuwait_2035', label: 'Kuwait Vision 2035', category: 'Government', description: 'New Kuwait development', chapters: ['New Kuwait Vision', 'Economic Development', 'Infrastructure', 'Digital Services'] },

  // === INDIA FULL ECOSYSTEM ===
  { id: 'india_digital', label: 'Digital India Initiative', category: 'India', description: 'India digital transformation', chapters: ['Digital India Vision', 'UPI Revolution', 'Aadhaar Ecosystem', 'Digital Infrastructure', 'Future Roadmap'] },
  { id: 'india_upi', label: 'UPI Payment Revolution', category: 'India', description: 'UPI and digital payments', chapters: ['UPI Introduction', 'Technology Behind UPI', 'Merchant Adoption', 'Global Expansion', 'Future of Payments'] },
  { id: 'india_aadhaar', label: 'Aadhaar Digital Identity', category: 'India', description: "World's largest biometric system", chapters: ['Aadhaar Vision', 'Technology Architecture', 'Use Cases', 'Privacy & Security', 'Global Impact'] },
  { id: 'india_startup', label: 'Startup India', category: 'India', description: 'India startup ecosystem', chapters: ['Startup India Launch', 'Ecosystem Growth', 'Unicorn Stories', 'Government Support', 'Future Outlook'] },
  { id: 'india_make', label: 'Make in India', category: 'India', description: 'Manufacturing initiative', chapters: ['Make in India Vision', 'Manufacturing Sectors', 'FDI Growth', 'Success Stories', 'Roadmap'] },
  { id: 'india_smart_city', label: 'Smart Cities Mission', category: 'India', description: '100 smart cities development', chapters: ['Smart Cities Mission', 'Technology Stack', 'City Transformations', 'Citizen Services', 'Future Plans'] },
  { id: 'india_healthcare', label: 'Ayushman Bharat', category: 'India', description: 'Healthcare for all initiative', chapters: ['Ayushman Bharat Vision', 'Coverage & Impact', 'Digital Health Stack', 'Success Stories'] },
  { id: 'india_education', label: 'NEP 2020 Education', category: 'India', description: 'National Education Policy', chapters: ['NEP 2020 Vision', 'Key Reforms', 'Digital Learning', 'Implementation Progress'] },
  { id: 'india_agritech', label: 'India AgriTech', category: 'India', description: 'Agricultural innovation', chapters: ['AgriTech Revolution', 'Technology Solutions', 'Farmer Stories', 'Market Access', 'Future Vision'] },
  { id: 'india_fintech', label: 'India Fintech Hub', category: 'India', description: 'Financial technology ecosystem', chapters: ['Fintech Ecosystem', 'Key Players', 'Innovation Stories', 'Regulatory Framework', 'Growth Outlook'] },
  { id: 'india_ev', label: 'India EV Mission', category: 'India', description: 'Electric vehicle adoption', chapters: ['EV Mission India', 'Infrastructure Development', 'Manufacturing', 'Adoption Trends', 'Future Roadmap'] },
  { id: 'india_renewable', label: 'India Green Energy', category: 'India', description: 'Renewable energy transition', chapters: ['Green Energy Vision', 'Solar Revolution', 'Wind Energy', 'Grid Modernization', 'Carbon Goals'] },
  { id: 'india_tourism', label: 'Incredible India', category: 'India', description: 'Tourism promotion', chapters: ['Incredible India', 'Heritage Sites', 'Natural Wonders', 'Cultural Experiences', 'Travel Guide'] },
  { id: 'india_cultural', label: 'India Cultural Heritage', category: 'India', description: 'Cultural preservation', chapters: ['Cultural Heritage', 'Ancient Traditions', 'Art Forms', 'Preservation Efforts', 'Experience India'] },

  // === PAKISTAN ECOSYSTEM ===
  { id: 'pakistan_digital', label: 'Digital Pakistan', category: 'Pakistan', description: 'Digital transformation vision', chapters: ['Digital Pakistan Vision', 'IT Infrastructure', 'E-Government', 'Digital Economy', 'Future Goals'] },
  { id: 'pakistan_kamyab', label: 'Kamyab Jawan', category: 'Pakistan', description: 'Youth entrepreneurship', chapters: ['Youth Vision', 'Entrepreneurship Programs', 'Success Stories', 'Support Ecosystem'] },
  { id: 'pakistan_cpec', label: 'CPEC Development', category: 'Pakistan', description: 'China-Pakistan corridor', chapters: ['CPEC Overview', 'Infrastructure Projects', 'Economic Corridors', 'Future Development'] },
  { id: 'pakistan_it_exports', label: 'Pakistan IT Exports', category: 'Pakistan', description: 'IT services industry', chapters: ['IT Industry Growth', 'Key Sectors', 'Talent Pool', 'Export Markets', 'Growth Strategy'] },
  { id: 'pakistan_tourism', label: 'Pakistan Tourism', category: 'Pakistan', description: 'Tourism destinations', chapters: ['Beautiful Pakistan', 'Northern Areas', 'Historical Sites', 'Adventure Tourism', 'Travel Info'] },

  // === BANGLADESH ECOSYSTEM ===
  { id: 'bangladesh_digital', label: 'Digital Bangladesh', category: 'Bangladesh', description: 'Digital transformation', chapters: ['Digital Bangladesh', 'Digital Services', 'IT Growth', 'Innovation Hub', 'Future Vision'] },
  { id: 'bangladesh_garments', label: 'Bangladesh RMG Industry', category: 'Bangladesh', description: 'Garments manufacturing', chapters: ['RMG Industry', 'Global Leadership', 'Sustainability', 'Worker Welfare', 'Future Outlook'] },
  { id: 'bangladesh_fintech', label: 'Bangladesh Mobile Finance', category: 'Bangladesh', description: 'bKash and mobile banking', chapters: ['Mobile Finance Revolution', 'bKash Story', 'Financial Inclusion', 'Digital Payments', 'Growth Trajectory'] },
  { id: 'bangladesh_it', label: 'Bangladesh IT Hub', category: 'Bangladesh', description: 'Emerging IT sector', chapters: ['Emerging IT Hub', 'Talent Development', 'Software Exports', 'Tech Parks', 'Future Vision'] },
  { id: 'bangladesh_climate', label: 'Bangladesh Climate Action', category: 'Bangladesh', description: 'Climate resilience', chapters: ['Climate Challenges', 'Adaptation Strategies', 'Green Growth', 'International Leadership'] },

  // === CJK (China, Japan, Korea) ===
  { id: 'china_belt_road', label: 'Belt & Road Initiative', category: 'CJK', description: 'Global infrastructure', chapters: ['BRI Vision', 'Infrastructure Projects', 'Trade Corridors', 'Partnership Stories', 'Future Expansion'] },
  { id: 'china_ai', label: 'China AI Leadership', category: 'CJK', description: 'AI development strategy', chapters: ['AI Strategy', 'Research Leadership', 'Applications', 'Industry Integration', 'Future Goals'] },
  { id: 'china_green', label: 'China Green Transition', category: 'CJK', description: 'Carbon neutrality goals', chapters: ['Carbon Neutrality Goals', 'Renewable Energy', 'EV Revolution', 'Green Industry', 'Climate Action'] },
  { id: 'japan_society5', label: 'Japan Society 5.0', category: 'CJK', description: 'Super smart society', chapters: ['Society 5.0 Vision', 'Technology Integration', 'Human-Centered AI', 'Implementation', 'Future Japan'] },
  { id: 'japan_manufacturing', label: 'Japan Industry 4.0', category: 'CJK', description: 'Monozukuri + AI', chapters: ['Monozukuri Legacy', 'Smart Factory', 'Robotics Integration', 'Quality Excellence', 'Future Manufacturing'] },
  { id: 'japan_tourism', label: 'Japan Tourism', category: 'CJK', description: 'Cultural tourism', chapters: ['Japan Experience', 'Cultural Heritage', 'Modern Japan', 'Travel Guide', 'Seasonal Beauty'] },
  { id: 'korea_digital', label: 'Digital New Deal', category: 'CJK', description: 'Korea digital economy', chapters: ['Digital New Deal', 'AI & Data', '5G Infrastructure', 'Green New Deal', 'Future Korea'] },
  { id: 'korea_kpop', label: 'K-Wave Cultural Export', category: 'CJK', description: 'K-pop and K-drama', chapters: ['K-Wave Phenomenon', 'K-Pop Industry', 'K-Drama Global', 'Cultural Export', 'Future Trends'] },
  { id: 'korea_semiconductor', label: 'Korea Semiconductor', category: 'CJK', description: 'Chip manufacturing', chapters: ['Chip Leadership', 'Technology Innovation', 'Manufacturing Excellence', 'Global Supply', 'Future Development'] },
  { id: 'taiwan_tech', label: 'Taiwan Tech Hub', category: 'CJK', description: 'Technology manufacturing', chapters: ['Tech Manufacturing Hub', 'Semiconductor Leadership', 'Innovation Ecosystem', 'Global Supply Chain'] },

  // === INDO-ASIA / SOUTHEAST ASIA ===
  { id: 'indonesia_digital', label: 'Indonesia Digital Economy', category: 'Indo-Asia', description: 'Digital archipelago', chapters: ['Digital Archipelago', 'Unicorn Ecosystem', 'E-Commerce Growth', 'Digital Inclusion', 'Future Vision'] },
  { id: 'indonesia_tourism', label: 'Wonderful Indonesia', category: 'Indo-Asia', description: 'Tourism destinations', chapters: ['Wonderful Indonesia', 'Bali Experience', 'Cultural Heritage', 'Natural Wonders', 'Travel Guide'] },
  { id: 'malaysia_digital', label: 'Malaysia Digital', category: 'Indo-Asia', description: 'Digital transformation', chapters: ['Malaysia Digital', 'Tech Ecosystem', 'Digital Economy', 'Innovation Hub', 'Future Goals'] },
  { id: 'thailand_4', label: 'Thailand 4.0', category: 'Indo-Asia', description: 'Value-based economy', chapters: ['Thailand 4.0', 'Value-Based Economy', 'S-Curve Industries', 'EEC Development', 'Future Thailand'] },
  { id: 'vietnam_digital', label: 'Vietnam Digital', category: 'Indo-Asia', description: 'Manufacturing hub', chapters: ['Vietnam Digital', 'Manufacturing Hub', 'Tech Ecosystem', 'Innovation Growth', 'Future Vision'] },
  { id: 'singapore_smart', label: 'Smart Nation Singapore', category: 'Indo-Asia', description: 'Smart city leader', chapters: ['Smart Nation', 'Digital Government', 'AI Singapore', 'Innovation Hub', 'Future City'] },
  { id: 'philippines_digital', label: 'Philippines Digital', category: 'Indo-Asia', description: 'BPO and digital', chapters: ['Philippines Digital', 'BPO Excellence', 'Startup Ecosystem', 'Digital Services', 'Growth Vision'] },
  { id: 'asean_integration', label: 'ASEAN Integration', category: 'Indo-Asia', description: 'Regional cooperation', chapters: ['ASEAN Vision', 'Economic Integration', 'Digital ASEAN', 'Trade Corridors', 'Future Cooperation'] },

  // === CARIBBEAN ===
  { id: 'caribbean_tourism', label: 'Caribbean Tourism', category: 'Caribbean', description: 'Island destinations', chapters: ['Island Paradise', 'Beach Destinations', 'Cultural Experiences', 'Adventure Tourism', 'Travel Guide'] },
  { id: 'caribbean_digital', label: 'Caribbean Digital Hub', category: 'Caribbean', description: 'Tech innovation islands', chapters: ['Digital Caribbean', 'Tech Innovation', 'Remote Work Hub', 'Digital Services', 'Future Vision'] },
  { id: 'caribbean_fintech', label: 'Caribbean Fintech', category: 'Caribbean', description: 'Financial services', chapters: ['Caribbean Fintech', 'Digital Banking', 'Payment Solutions', 'Financial Inclusion', 'Growth Outlook'] },
  { id: 'caribbean_renewable', label: 'Caribbean Green Energy', category: 'Caribbean', description: 'Renewable transition', chapters: ['Green Caribbean', 'Solar Energy', 'Wind Power', 'Climate Resilience', 'Sustainable Future'] },
  { id: 'jamaica_digital', label: 'Digital Jamaica', category: 'Caribbean', description: 'Jamaica tech ecosystem', chapters: ['Digital Jamaica', 'Tech Ecosystem', 'Startup Scene', 'Digital Services', 'Growth Vision'] },
  { id: 'trinidad_energy', label: 'Trinidad Energy Sector', category: 'Caribbean', description: 'Energy diversification', chapters: ['Energy Sector', 'LNG Leadership', 'Diversification', 'Renewable Transition', 'Future Energy'] },
  { id: 'barbados_fintech', label: 'Barbados Global Hub', category: 'Caribbean', description: 'International business', chapters: ['Global Business Hub', 'Fintech Center', 'International Services', 'Innovation Ecosystem'] },

  // === AFRICA ===
  { id: 'africa_tourism', label: 'Africa Tourism', category: 'Africa', description: 'African destinations showcase', chapters: ['Wildlife Safari', 'Cultural Heritage', 'Adventure Tourism', 'Beach Destinations', 'Eco Tourism'] },
  { id: 'africa_fintech', label: 'Africa Fintech Rise', category: 'Africa', description: 'Mobile money revolution', chapters: ['Fintech Revolution', 'Mobile Money', 'M-Pesa Story', 'Financial Inclusion', 'Future Finance'] },
  { id: 'africa_agritech', label: 'Africa AgriTech', category: 'Africa', description: 'Agricultural innovation', chapters: ['AgriTech Africa', 'Technology Solutions', 'Farmer Impact', 'Market Access', 'Food Security'] },
  { id: 'nigeria_tech', label: 'Nigeria Tech Ecosystem', category: 'Africa', description: 'Lagos tech hub', chapters: ['Nigeria Tech', 'Lagos Startup Scene', 'Unicorn Stories', 'Talent Pool', 'Future Outlook'] },
  { id: 'kenya_silicon', label: 'Silicon Savannah', category: 'Africa', description: 'Kenya tech innovation', chapters: ['Silicon Savannah', 'M-Pesa Revolution', 'Innovation Hub', 'Startup Ecosystem', 'Future Vision'] },
  { id: 'south_africa_digital', label: 'South Africa Digital', category: 'Africa', description: 'Digital transformation', chapters: ['Digital SA', 'Tech Ecosystem', 'Innovation Hub', 'Digital Economy', 'Future Goals'] },
  { id: 'rwanda_smart', label: 'Rwanda Smart Nation', category: 'Africa', description: 'Digital governance', chapters: ['Smart Rwanda', 'Digital Governance', 'Innovation Hub', 'Drone Delivery', 'Future Vision'] },
  { id: 'ethiopia_rise', label: 'Ethiopia Rising', category: 'Africa', description: 'Economic development', chapters: ['Ethiopia Rising', 'Economic Growth', 'Infrastructure', 'Digital Economy', 'Future Vision'] },
  { id: 'egypt_tech', label: 'Egypt Tech Hub', category: 'Africa', description: 'MENA-Africa bridge', chapters: ['Egypt Tech', 'Startup Ecosystem', 'Digital Services', 'Innovation Hub', 'Growth Vision'] },
  { id: 'morocco_offshoring', label: 'Morocco Offshoring', category: 'Africa', description: 'Nearshore Africa', chapters: ['Morocco Hub', 'Offshoring Services', 'Tech Talent', 'EU Partnership', 'Future Growth'] },
  { id: 'ghana_tech', label: 'Ghana Tech Ecosystem', category: 'Africa', description: 'Accra tech hub', chapters: ['Ghana Tech', 'Accra Hub', 'Innovation', 'Talent Pool', 'Growth Outlook'] },
  { id: 'tanzania_digital', label: 'Tanzania Digital', category: 'Africa', description: 'East Africa growth', chapters: ['Tanzania Digital', 'Mobile Services', 'Agriculture Tech', 'Tourism', 'Future Vision'] },
  { id: 'senegal_tech', label: 'Senegal Tech', category: 'Africa', description: 'Francophone Africa hub', chapters: ['Senegal Tech', 'Dakar Hub', 'Francophone Market', 'Innovation', 'Growth Vision'] },

  // === TOURISM/REGIONAL ===
  { id: 'mena_tourism', label: 'MENA Tourism', category: 'Tourism', description: 'Middle East experiences', chapters: ['Historical Sites', 'Modern Attractions', 'Cultural Experiences', 'Luxury Tourism'] },
  { id: 'asia_tourism', label: 'Southeast Asia', category: 'Tourism', description: 'SEA destinations', chapters: ['Thailand Temples', 'Vietnam Heritage', 'Indonesia Islands', 'Singapore Modern', 'Local Experiences'] },
  { id: 'europe_tourism', label: 'Europe Heritage', category: 'Tourism', description: 'European destinations', chapters: ['Historical Heritage', 'Cultural Capitals', 'Natural Beauty', 'Culinary Experiences'] },

  // === HEALTHCARE ===
  { id: 'healthcare_digital', label: 'Digital Healthcare', category: 'Healthcare', description: 'Healthcare tech innovation', chapters: ['Patient Journey', 'Telemedicine', 'AI Diagnostics', 'Future of Care'] },
  { id: 'pharma_product', label: 'Pharma Product Launch', category: 'Healthcare', description: 'Drug/treatment intro', chapters: ['Product Overview', 'Clinical Benefits', 'Patient Stories'] },
  { id: 'healthcare_ai', label: 'AI Diagnostics', category: 'Healthcare', description: 'AI-powered healthcare', chapters: ['AI in Healthcare', 'Diagnostic AI', 'Treatment Planning', 'Patient Outcomes'] },
  { id: 'telemedicine', label: 'Telemedicine Platform', category: 'Healthcare', description: 'Remote healthcare', chapters: ['Telemedicine Platform', 'Virtual Consultations', 'Remote Monitoring', 'Patient Experience'] },

  // === FINANCE ===
  { id: 'banking_digital', label: 'Digital Banking', category: 'Finance', description: 'Modern fintech solutions', chapters: ['Digital Banking Vision', 'Mobile First', 'Security & Trust', 'Future Banking'] },
  { id: 'investment_pitch', label: 'Investment Pitch', category: 'Finance', description: 'Startup pitch deck', chapters: ['Problem Statement', 'Our Solution', 'Market Opportunity', 'Business Model', 'Investment Ask'] },
  { id: 'islamic_finance', label: 'Islamic Finance', category: 'Finance', description: 'Shariah-compliant products', chapters: ['Islamic Finance Principles', 'Shariah Compliance', 'Products Overview', 'Growth Outlook'] },
  { id: 'crypto_defi', label: 'Crypto/DeFi Explainer', category: 'Finance', description: 'Blockchain finance', chapters: ['Blockchain Basics', 'DeFi Explained', 'Use Cases', 'Future of Finance'] },

  // === TECHNOLOGY ===
  { id: 'saas_demo', label: 'SaaS Product Demo', category: 'Technology', description: 'Software demonstration', chapters: ['Product Overview', 'Key Features', 'Use Cases', 'Getting Started'] },
  { id: 'ai_showcase', label: 'AI/ML Showcase', category: 'Technology', description: 'AI capabilities demo', chapters: ['AI Vision', 'Technology Stack', 'Applications', 'Future Roadmap'] },
  { id: 'cybersecurity', label: 'Cybersecurity Solutions', category: 'Technology', description: 'Security products', chapters: ['Security Landscape', 'Solutions Overview', 'Protection Features', 'Implementation'] },
  { id: 'cloud_services', label: 'Cloud Services', category: 'Technology', description: 'Cloud offerings', chapters: ['Cloud Overview', 'Services Portfolio', 'Migration Path', 'Support & Pricing'] },

  // === EDUCATION ===
  { id: 'education_course', label: 'Online Course', category: 'Education', description: 'Course materials', chapters: ['Course Overview', 'Module Preview', 'Learning Outcomes', 'Instructor Bio', 'Enrollment'] },
  { id: 'corporate_training', label: 'Corporate Training', category: 'Education', description: 'Employee training', chapters: ['Training Objectives', 'Core Concepts', 'Practical Exercises', 'Assessment'] },
  { id: 'university_promo', label: 'University Promotion', category: 'Education', description: 'Academic institution', chapters: ['University Overview', 'Programs', 'Campus Life', 'Admissions', 'Alumni Stories'] },

  // === LANDING PAGES ===
  { id: 'landing_hero', label: 'Hero Showcase', category: 'Landing Page', description: 'Website hero video', chapters: ['Hero Section'] },
  { id: 'landing_product', label: 'Product Demo', category: 'Landing Page', description: 'Product walkthrough', chapters: ['Introduction', 'Features', 'Call to Action'] },
  { id: 'landing_testimonial', label: 'Testimonials', category: 'Landing Page', description: 'Customer stories', chapters: ['Client 1', 'Client 2', 'Client 3', 'Client 4', 'Client 5'] },
  { id: 'landing_explainer', label: 'Explainer Video', category: 'Landing Page', description: 'Concept explanation', chapters: ['Problem', 'Solution', 'How It Works', 'Benefits', 'CTA'] },

  // === SOCIAL MEDIA ===
  { id: 'social_short', label: 'Short Form (Reels)', category: 'Social Media', description: 'TikTok/Reels ready', chapters: ['Short Video'] },
  { id: 'social_carousel', label: 'Carousel Post', category: 'Social Media', description: 'LinkedIn/Instagram slides', chapters: ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4', 'CTA Slide'] },
  { id: 'social_youtube', label: 'YouTube Long Form', category: 'Social Media', description: 'Full YouTube video', chapters: ['Intro', 'Hook', 'Point 1', 'Point 2', 'Point 3', 'Case Study', 'Summary', 'CTA'] },
  { id: 'social_stories', label: 'Stories Format', category: 'Social Media', description: 'Instagram/WhatsApp stories', chapters: ['Story 1', 'Story 2', 'Story 3', 'Story 4', 'CTA Story'] },

  // === USE CASES & SCENARIOS ===
  { id: 'usecase_onboarding', label: 'Employee Onboarding', category: 'Use Cases', description: 'New hire training', chapters: ['Welcome', 'Company Overview', 'Role Introduction', 'Tools & Systems', 'Next Steps'] },
  { id: 'usecase_sales_enablement', label: 'Sales Enablement', category: 'Use Cases', description: 'Sales team training', chapters: ['Product Knowledge', 'Value Proposition', 'Objection Handling', 'Demo Skills', 'Closing Techniques'] },
  { id: 'usecase_customer_success', label: 'Customer Success', category: 'Use Cases', description: 'Customer education', chapters: ['Product Overview', 'Key Features', 'Best Practices', 'Tips & Tricks', 'Support Resources'] },
  { id: 'usecase_compliance', label: 'Compliance Training', category: 'Use Cases', description: 'Regulatory training', chapters: ['Compliance Overview', 'Key Requirements', 'Procedures', 'Assessment', 'Certification'] },
  { id: 'usecase_product_launch', label: 'Product Launch', category: 'Use Cases', description: 'Launch campaign', chapters: ['Product Reveal', 'Key Features', 'Use Cases', 'Availability', 'Call to Action'] },
  { id: 'usecase_investor_update', label: 'Investor Update', category: 'Use Cases', description: 'Quarterly reports', chapters: ['Quarter Highlights', 'Financial Performance', 'Key Metrics', 'Strategic Updates', 'Outlook'] },
  { id: 'usecase_internal_comms', label: 'Internal Communications', category: 'Use Cases', description: 'Team updates', chapters: ['Announcement', 'Key Points', 'Impact', 'Next Steps', 'Q&A'] },
  { id: 'usecase_event_promo', label: 'Event Promotion', category: 'Use Cases', description: 'Conference/webinar promo', chapters: ['Event Overview', 'Speakers', 'Agenda Highlights', 'Registration', 'Early Bird Offer'] },
  { id: 'usecase_case_study', label: 'Case Study Video', category: 'Use Cases', description: 'Success story', chapters: ['Client Background', 'Challenge', 'Solution', 'Results', 'Testimonial'] },
  { id: 'usecase_how_to', label: 'How-To Tutorial', category: 'Use Cases', description: 'Step-by-step guide', chapters: ['Introduction', 'Step 1', 'Step 2', 'Step 3', 'Tips & Summary'] },

  // === NORTH AMERICA ===
  { id: 'usa_tech_hub', label: 'USA Tech Innovation', category: 'North America', description: 'Silicon Valley ecosystem', chapters: ['Innovation Hub', 'Tech Giants', 'Startup Culture', 'Venture Capital', 'Future Trends'] },
  { id: 'usa_healthcare', label: 'USA Healthcare Tech', category: 'North America', description: 'HealthTech innovation', chapters: ['HealthTech Overview', 'Digital Health', 'AI Diagnostics', 'Patient Care', 'Future Vision'] },
  { id: 'usa_fintech', label: 'USA Fintech', category: 'North America', description: 'Financial innovation', chapters: ['Fintech Landscape', 'Digital Payments', 'Banking Innovation', 'RegTech', 'Growth Outlook'] },
  { id: 'canada_tech', label: 'Canada Tech Corridor', category: 'North America', description: 'Toronto-Waterloo hub', chapters: ['Tech Corridor', 'AI Research', 'Startup Ecosystem', 'Talent Pool', 'Growth Vision'] },
  { id: 'canada_ai', label: 'Canada AI Leadership', category: 'North America', description: 'AI research excellence', chapters: ['AI Research', 'Academic Excellence', 'Industry Application', 'Global Impact', 'Future Goals'] },
  { id: 'canada_cleantech', label: 'Canada CleanTech', category: 'North America', description: 'Green technology', chapters: ['CleanTech Vision', 'Green Innovation', 'Sustainable Solutions', 'Market Growth', 'Future Plans'] },
  { id: 'mexico_nearshore', label: 'Mexico Nearshore Hub', category: 'North America', description: 'Tech outsourcing', chapters: ['Nearshore Hub', 'Tech Talent', 'Cost Advantage', 'Success Stories', 'Growth Vision'] },

  // === EUROPE ===
  { id: 'eu_digital', label: 'EU Digital Strategy', category: 'Europe', description: 'European digital transformation', chapters: ['EU Digital Vision', 'Data Strategy', 'AI Act', 'Digital Markets', 'Future Plans'] },
  { id: 'uk_fintech', label: 'UK Fintech Capital', category: 'Europe', description: 'London fintech ecosystem', chapters: ['London Fintech', 'Banking Innovation', 'RegTech Hub', 'Global Reach', 'Future Outlook'] },
  { id: 'germany_industry4', label: 'Germany Industry 4.0', category: 'Europe', description: 'Smart manufacturing', chapters: ['Industry 4.0', 'Smart Factories', 'Automation', 'Data Integration', 'Future Manufacturing'] },
  { id: 'france_tech', label: 'La French Tech', category: 'Europe', description: 'French startup scene', chapters: ['French Tech', 'Startup Ecosystem', 'Innovation Hub', 'Global Reach', 'Future Vision'] },
  { id: 'nordic_innovation', label: 'Nordic Innovation', category: 'Europe', description: 'Scandinavian tech', chapters: ['Nordic Innovation', 'Sustainability Tech', 'Digital Services', 'Design Thinking', 'Future Vision'] },
  { id: 'estonia_digital', label: 'Estonia e-Residency', category: 'Europe', description: 'Digital nation', chapters: ['e-Residency', 'Digital Government', 'Blockchain Nation', 'Startup Hub', 'Future Plans'] },
  { id: 'ireland_tech', label: 'Ireland Tech Hub', category: 'Europe', description: 'European HQ for tech', chapters: ['Tech Hub', 'Global HQ', 'Talent Pool', 'Innovation', 'Growth Vision'] },
  { id: 'spain_startup', label: 'Spain Startup Nation', category: 'Europe', description: 'Spanish ecosystem', chapters: ['Startup Nation', 'Barcelona Hub', 'Innovation', 'Tourism Tech', 'Future Vision'] },

  // === AUSTRALIA & OCEANIA ===
  { id: 'australia_fintech', label: 'Australia Fintech', category: 'Australia/Oceania', description: 'APAC fintech hub', chapters: ['Fintech Hub', 'Banking Innovation', 'Payment Tech', 'RegTech', 'Growth Outlook'] },
  { id: 'australia_mining_tech', label: 'Australia Mining Tech', category: 'Australia/Oceania', description: 'Resources innovation', chapters: ['Mining Innovation', 'Automation', 'Sustainability', 'Safety Tech', 'Future Plans'] },
  { id: 'australia_agritech', label: 'Australia AgriTech', category: 'Australia/Oceania', description: 'Agricultural tech', chapters: ['AgriTech Overview', 'Precision Farming', 'Water Tech', 'Market Access', 'Future Vision'] },
  { id: 'nz_innovation', label: 'New Zealand Innovation', category: 'Australia/Oceania', description: 'Kiwi tech scene', chapters: ['NZ Innovation', 'Tech Ecosystem', 'Clean Green', 'AgriTech', 'Growth Vision'] },
  { id: 'pacific_digital', label: 'Pacific Islands Digital', category: 'Australia/Oceania', description: 'Pacific connectivity', chapters: ['Pacific Digital', 'Connectivity', 'Marine Tech', 'Climate Tech', 'Future Plans'] },

  // === EXPANDED CARIBBEAN ===
  { id: 'bahamas_fintech', label: 'Bahamas Digital Assets', category: 'Caribbean', description: 'Crypto-friendly nation', chapters: ['Digital Assets', 'Sand Dollar', 'Crypto Hub', 'Financial Innovation', 'Future Plans'] },
  { id: 'puerto_rico_tech', label: 'Puerto Rico Tech', category: 'Caribbean', description: 'Tech tax haven', chapters: ['Tech Hub', 'Tax Incentives', 'Startup Scene', 'Innovation', 'Growth Vision'] },
  { id: 'dominican_bpo', label: 'Dominican Republic BPO', category: 'Caribbean', description: 'Business services', chapters: ['BPO Hub', 'Services Portfolio', 'Talent Pool', 'Growth Story', 'Future Plans'] },
  { id: 'cayman_fintech', label: 'Cayman Fintech', category: 'Caribbean', description: 'Financial services', chapters: ['Financial Hub', 'Digital Assets', 'Fund Services', 'Innovation', 'Future Plans'] },

  // === EXPANDED LATAM ===
  { id: 'brazil_fintech', label: 'Brazil Fintech Boom', category: 'Latin America', description: 'PIX and beyond', chapters: ['Fintech Boom', 'PIX Revolution', 'Neobanks', 'InsurTech', 'Future Finance'] },
  { id: 'argentina_startup', label: 'Argentina Unicorns', category: 'Latin America', description: 'Tech entrepreneurship', chapters: ['Unicorn Stories', 'Startup Ecosystem', 'Tech Talent', 'Innovation', 'Future Vision'] },
  { id: 'chile_startup', label: 'Chile StartUp', category: 'Latin America', description: 'Start-Up Chile program', chapters: ['Start-Up Chile', 'Ecosystem Growth', 'Mining Tech', 'Innovation Hub', 'Future Plans'] },
  { id: 'colombia_tech', label: 'Colombia Tech Rise', category: 'Latin America', description: 'Medellin transformation', chapters: ['Tech Rise', 'Medellin Hub', 'Innovation District', 'Talent Pool', 'Future Vision'] },
  { id: 'peru_digital', label: 'Peru Digital', category: 'Latin America', description: 'Digital inclusion', chapters: ['Digital Peru', 'Financial Inclusion', 'E-Government', 'Tech Growth', 'Future Plans'] },
  { id: 'uruguay_tech', label: 'Uruguay Tech Hub', category: 'Latin America', description: 'Small but mighty', chapters: ['Tech Hub', 'Innovation Punch', 'Startup Scene', 'Digital Gov', 'Future Plans'] },

  // === QUICK START ===
  { id: 'blank', label: 'Start Blank', category: 'Quick Start', description: 'Empty canvas', chapters: [] },
  { id: 'single', label: 'Single Chapter', category: 'Quick Start', description: 'Quick one-off', chapters: ['Chapter 1'] },
  { id: '3_chapter', label: '3 Chapters', category: 'Quick Start', description: 'Short series', chapters: ['Introduction', 'Main Content', 'Conclusion'] },
  { id: '5_chapter', label: '5 Chapters', category: 'Quick Start', description: 'Standard series', chapters: ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'] },
];

// ─── Category to region mapping for regional routing ────────────────────────
const CATEGORY_REGION_MAP: Record<string, string> = {
  'Government': 'MENA',
  'India': 'INDIA',
  'Pakistan': 'INDIA',
  'Bangladesh': 'INDIA',
  'CJK': 'CJK',
  'Indo-Asia': 'SEA',
  'Caribbean': 'LATAM',
  'Africa': 'AFRICA',
  'Tourism': 'GLOBAL',
  'Healthcare': 'GLOBAL',
  'Finance': 'GLOBAL',
  'Technology': 'GLOBAL',
  'Education': 'GLOBAL',
  'Landing Page': 'GLOBAL',
  'Social Media': 'GLOBAL',
  'Use Cases': 'GLOBAL',
  'North America': 'NAM',
  'Europe': 'EU',
  'Australia/Oceania': 'APAC',
  'Latin America': 'LATAM',
  'Quick Start': 'GLOBAL',
};

// ─── Seed Functions ─────────────────────────────────────────────────────────

/**
 * Check if industry templates have already been seeded into the DB.
 */
export async function checkIndustryTemplatesExist(): Promise<{ exists: boolean; count: number }> {
  const { data, error } = await supabase
    .from('video_blueprints')
    .select('id', { count: 'exact', head: true })
    .contains('industry_tags', ['industry_template'])
    .eq('is_active', true);

  if (error) {
    console.error('[IndustryTemplateSeed] Error checking:', error);
    return { exists: false, count: 0 };
  }

  const count = (data as any)?.length ?? 0;
  return { exists: count > 0, count };
}

/**
 * Seed all industry templates into video_blueprints + blueprint_scenes.
 * Idempotent: skips templates that already exist (matched by name + industry_template tag).
 *
 * Returns the count of newly inserted templates.
 */
export async function seedIndustryTemplates(
  onProgress?: (current: number, total: number) => void,
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const templates = INDUSTRY_TEMPLATE_DEFINITIONS;
  const total = templates.length;
  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Batch check existing templates
  const { data: existing } = await supabase
    .from('video_blueprints')
    .select('name')
    .contains('industry_tags', ['industry_template'])
    .eq('is_active', true);

  const existingNames = new Set((existing || []).map((b: any) => b.name));

  for (let i = 0; i < total; i++) {
    const tmpl = templates[i];
    onProgress?.(i + 1, total);

    // Skip if already exists
    if (existingNames.has(tmpl.label)) {
      skipped++;
      continue;
    }

    try {
      // Determine region from category
      const region = CATEGORY_REGION_MAP[tmpl.category] || 'GLOBAL';
      const avgChapterDuration = 30; // seconds per chapter default

      // Insert blueprint
      const { data: blueprint, error: bpError } = await supabase
        .from('video_blueprints')
        .insert({
          name: tmpl.label,
          description: tmpl.description,
          category: tmpl.category.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          estimated_duration_seconds: tmpl.chapters.length * avgChapterDuration,
          target_platform: ['youtube', 'linkedin', 'website'],
          industry_tags: ['industry_template', tmpl.category.toLowerCase(), tmpl.id],
          default_settings: {
            source: 'industry_template',
            sourceId: tmpl.id,
            region,
            chapterCount: tmpl.chapters.length,
          },
          style_preset: {},
          is_system_default: true,
          is_active: true,
          is_public: true,
          usage_count: 0,
          style_intent: 'corporate',
          target_regions: [region],
          tone_modifier: 'professional',
          aesthetic_keywords: [tmpl.category.toLowerCase()],
        })
        .select('id')
        .single();

      if (bpError) {
        errors.push(`${tmpl.id}: ${bpError.message}`);
        continue;
      }

      // Insert scenes (chapters)
      if (tmpl.chapters.length > 0 && blueprint?.id) {
        const scenes = tmpl.chapters.map((title, idx) => ({
          blueprint_id: blueprint.id,
          scene_key: `${tmpl.id}_ch${idx + 1}`,
          title,
          description: `Chapter ${idx + 1} of ${tmpl.label}`,
          order_index: idx,
          scene_type: 'chapter',
          script_template: `{{${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_content}}`,
          script_variables: [title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_content'],
          duration_seconds: avgChapterDuration,
          min_duration_seconds: 15,
          max_duration_seconds: 120,
          visual_config: {},
          audio_config: {},
          transition_config: { type: 'crossfade', duration: 0.5 },
          is_optional: false,
          is_repeatable: false,
        }));

        const { error: scenesError } = await supabase
          .from('blueprint_scenes')
          .insert(scenes);

        if (scenesError) {
          errors.push(`${tmpl.id} scenes: ${scenesError.message}`);
          continue;
        }
      }

      inserted++;
    } catch (err: any) {
      errors.push(`${tmpl.id}: ${err.message}`);
    }
  }

  console.log(`[IndustryTemplateSeed] Done: ${inserted} inserted, ${skipped} skipped, ${errors.length} errors`);
  return { inserted, skipped, errors };
}

// ─── EP04 Blueprint Protection ──────────────────────────────────────────────
const EP04_BLUEPRINT_ID = 'cafcd78a-7957-4021-ba8f-c20daba331b2';

/**
 * Full migration: soft-delete old templates, seed industry templates.
 *
 * Steps:
 * 1. Protect EP04 blueprint (podcast production — never touch)
 * 2. Soft-delete all other existing blueprints (is_active = false)
 * 3. Seed 110+ industry templates as the new primary system
 *
 * Idempotent: safe to run multiple times.
 */
export async function migrateToIndustryTemplates(
  onProgress?: (step: string, current: number, total: number) => void,
): Promise<{
  softDeleted: number;
  inserted: number;
  skipped: number;
  errors: string[];
  ep04Protected: boolean;
}> {
  const errors: string[] = [];

  // Step 1: Soft-delete old non-industry, non-EP04 blueprints
  onProgress?.('Soft-deleting legacy templates...', 0, 3);

  const { data: oldBlueprints, error: fetchError } = await supabase
    .from('video_blueprints')
    .select('id, name, industry_tags')
    .eq('is_active', true);

  if (fetchError) {
    errors.push(`Fetch old blueprints: ${fetchError.message}`);
    return { softDeleted: 0, inserted: 0, skipped: 0, errors, ep04Protected: false };
  }

  // Filter: soft-delete everything that is NOT EP04 and NOT already an industry_template
  const toSoftDelete = (oldBlueprints || []).filter((bp: any) => {
    if (bp.id === EP04_BLUEPRINT_ID) return false; // Protect EP04
    const tags = bp.industry_tags || [];
    if (tags.includes('industry_template')) return false; // Already migrated
    return true;
  });

  let softDeleted = 0;
  if (toSoftDelete.length > 0) {
    const ids = toSoftDelete.map((bp: any) => bp.id);
    // Batch soft-delete in chunks of 50
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      const { error: delError } = await supabase
        .from('video_blueprints')
        .update({ is_active: false })
        .in('id', chunk);

      if (delError) {
        errors.push(`Soft-delete batch ${i}: ${delError.message}`);
      } else {
        softDeleted += chunk.length;
      }
    }
  }

  // Verify EP04 is still active
  const { data: ep04Check } = await supabase
    .from('video_blueprints')
    .select('id, is_active')
    .eq('id', EP04_BLUEPRINT_ID)
    .single();

  const ep04Protected = ep04Check?.is_active === true;

  console.log(`[Migration] Soft-deleted ${softDeleted} legacy blueprints, EP04 protected: ${ep04Protected}`);

  // Step 2: Seed industry templates
  onProgress?.('Seeding industry templates...', 1, 3);
  const seedResult = await seedIndustryTemplates((current, total) => {
    onProgress?.(`Seeding template ${current}/${total}...`, 2, 3);
  });

  onProgress?.('Migration complete!', 3, 3);

  return {
    softDeleted,
    inserted: seedResult.inserted,
    skipped: seedResult.skipped,
    errors: [...errors, ...seedResult.errors],
    ep04Protected,
  };
}

/**
 * Get all industry templates from DB (the canonical source after migration).
 * Falls back to hardcoded definitions if DB has none yet.
 */
export async function getIndustryTemplatesFromDB(): Promise<{
  templates: Array<{ id: string; sourceId: string; label: string; category: string; description: string; chapters: string[] }>;
  fromDB: boolean;
}> {
  const { data, error } = await supabase
    .from('video_blueprints')
    .select(`
      id,
      name,
      description,
      category,
      default_settings,
      industry_tags,
      blueprint_scenes (
        title,
        order_index
      )
    `)
    .contains('industry_tags', ['industry_template'])
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data || data.length === 0) {
    // Fallback to hardcoded definitions
    return {
      templates: INDUSTRY_TEMPLATE_DEFINITIONS.map(t => ({
        id: t.id,
        sourceId: t.id,
        label: t.label,
        category: t.category,
        description: t.description,
        chapters: t.chapters,
      })),
      fromDB: false,
    };
  }

  return {
    templates: data.map((bp: any) => ({
      id: bp.id,
      sourceId: bp.default_settings?.sourceId || bp.id,
      label: bp.name,
      category: bp.category,
      description: bp.description || '',
      chapters: (bp.blueprint_scenes || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((s: any) => s.title),
    })),
    fromDB: true,
  };
}
