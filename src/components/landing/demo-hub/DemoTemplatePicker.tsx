/**
 * DemoTemplatePicker — Curated template cards for landing page demo hub
 * 
 * Shows industry-relevant pre-built templates that users can select
 * to auto-populate the prompt. Highlights "Create from Template" flow.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Layers, Sparkles, ArrowRight } from 'lucide-react';

export interface DemoTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  tags: string[];
  emoji: string;
}

interface DemoTemplatePickerProps {
  templates: DemoTemplate[];
  onSelect: (template: DemoTemplate) => void;
  selectedId?: string;
  pipelineLabel: string;
}

export const DemoTemplatePicker: React.FC<DemoTemplatePickerProps> = ({
  templates,
  onSelect,
  selectedId,
  pipelineLabel,
}) => {
  if (!templates.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-3 w-3" />
          Create from Template
        </label>
        <Badge variant="outline" className="text-[9px] gap-1">
          <Sparkles className="h-2.5 w-2.5" /> {templates.length} templates
        </Badge>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
        {templates.map((tpl) => {
          const isSelected = selectedId === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl)}
              className={`flex-shrink-0 text-left rounded-xl border p-3 w-[180px] sm:w-[200px] transition-all duration-200 group ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                  : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{tpl.emoji}</span>
                <p className={`text-xs font-semibold line-clamp-1 ${
                  isSelected ? 'text-primary' : 'text-foreground'
                }`}>
                  {tpl.name}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">
                {tpl.description}
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                {tpl.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[8px] px-1.5 py-0 h-4">
                    {tag}
                  </Badge>
                ))}
              </div>
              {isSelected && (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-primary font-medium">
                  <ArrowRight className="h-2.5 w-2.5" /> Applied
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Curated templates per industry and pipeline ──

export function getDemoTemplates(industryId: string, pipeline: 'deck' | 'video' | 'content'): DemoTemplate[] {
  const all = DEMO_TEMPLATES[industryId];
  if (!all) return DEMO_TEMPLATES['default']?.[pipeline] || [];
  return all[pipeline] || DEMO_TEMPLATES['default']?.[pipeline] || [];
}

const DEMO_TEMPLATES: Record<string, Record<string, DemoTemplate[]>> = {
  healthcare: {
    deck: [
      { id: 'hc-d1', emoji: '🩺', name: 'Patient Education', description: 'Chronic disease self-management guide for patients', prompt: 'Create a patient education deck about managing chronic conditions including medication adherence, lifestyle changes, and when to seek emergency care.', tags: ['Patient', '5 slides'] },
      { id: 'hc-d2', emoji: '👨‍⚕️', name: 'HCP Grand Rounds', description: 'Clinical case presentation for healthcare professionals', prompt: 'Create a grand rounds presentation on emerging immunotherapy protocols for oncology, including case studies and evidence-based outcomes.', tags: ['Clinical', '8 slides'] },
      { id: 'hc-d3', emoji: '🏥', name: 'Hospital Board', description: 'Quarterly performance review for hospital leadership', prompt: 'Create a hospital board presentation covering Q4 patient outcomes, revenue metrics, staffing KPIs, and digital health transformation initiatives.', tags: ['Executive', '6 slides'] },
    ],
    video: [
      { id: 'hc-v1', emoji: '💊', name: 'Medication Guide', description: 'Animated explainer on medication usage and side effects', prompt: 'Create a 30-second animated video script explaining how to properly take blood pressure medication, including timing, food interactions, and common side effects.', tags: ['Animation', '30s'] },
      { id: 'hc-v2', emoji: '🧠', name: 'Mental Health PSA', description: 'Public service announcement on mental wellness', prompt: 'Create a compassionate 30-second PSA video script about recognizing signs of anxiety and depression, encouraging viewers to seek help, with a helpline CTA.', tags: ['PSA', '30s'] },
      { id: 'hc-v3', emoji: '🏃', name: 'Wellness Program', description: 'Employee wellness program promo video', prompt: 'Create an energetic 30-second promotional video script for a corporate wellness program featuring fitness challenges, mental health resources, and nutrition coaching.', tags: ['Corporate', '30s'] },
    ],
    content: [
      { id: 'hc-c1', emoji: '📧', name: 'Appointment Reminder', description: 'Personalized patient appointment email', prompt: 'Write a warm, personalized appointment reminder email that includes preparation instructions, what to bring, and parking/telehealth options.', tags: ['Email', 'Patient'] },
      { id: 'hc-c2', emoji: '📱', name: 'Health Tips Post', description: 'Social media post on seasonal health', prompt: 'Write an engaging social media post about 5 essential winter health tips, including flu prevention, mental wellness during shorter days, and nutrition advice.', tags: ['Social', 'Wellness'] },
      { id: 'hc-c3', emoji: '📝', name: 'Clinical Blog', description: 'Evidence-based clinical insights article', prompt: 'Write a professional blog post on the latest advances in telemedicine, covering AI diagnostics, remote monitoring, and patient satisfaction data.', tags: ['Blog', 'Clinical'] },
    ],
  },
  education: {
    deck: [
      { id: 'ed-d1', emoji: '🎓', name: 'Course Introduction', description: 'Engaging first-day course overview', prompt: 'Create a 5-slide course introduction deck for "Data Science Fundamentals" covering learning objectives, weekly schedule, assessment methods, and tools/resources.', tags: ['Course', '5 slides'] },
      { id: 'ed-d2', emoji: '🔬', name: 'Research Presentation', description: 'Academic research findings presentation', prompt: 'Create an 8-slide research presentation on AI in personalized learning, including methodology, findings, statistical analysis, and implications for educators.', tags: ['Research', '8 slides'] },
      { id: 'ed-d3', emoji: '📊', name: 'Student Progress', description: 'Parent-teacher conference report', prompt: 'Create a 5-slide student progress report template for parent-teacher conferences covering academic performance, social development, and improvement areas.', tags: ['Report', '5 slides'] },
    ],
    video: [
      { id: 'ed-v1', emoji: '🧪', name: 'Lab Tutorial', description: 'Step-by-step science experiment guide', prompt: 'Create a 30-second video script for a chemistry lab tutorial on safe acid-base titration, including safety protocols and expected observations.', tags: ['Tutorial', '30s'] },
      { id: 'ed-v2', emoji: '🌍', name: 'Virtual Field Trip', description: 'Immersive educational journey video', prompt: 'Create a 30-second video script for a virtual field trip to the Great Barrier Reef, narrated by an AI marine biologist avatar, highlighting ecosystem facts.', tags: ['Immersive', '30s'] },
      { id: 'ed-v3', emoji: '📚', name: 'Book Summary', description: 'Animated literature review', prompt: 'Create a 30-second animated video script summarizing key themes of "To Kill a Mockingbird" for high school students, with discussion prompts.', tags: ['Literature', '30s'] },
    ],
    content: [
      { id: 'ed-c1', emoji: '📢', name: 'Course Launch', description: 'New course announcement post', prompt: 'Write an exciting social media announcement for a new AI-powered language learning course available in 12 regional languages with avatar tutors.', tags: ['Social', 'Launch'] },
      { id: 'ed-c2', emoji: '✉️', name: 'Parent Newsletter', description: 'Monthly school newsletter', prompt: 'Write a warm monthly school newsletter covering upcoming events, student achievements, new programs, and volunteer opportunities.', tags: ['Email', 'Community'] },
      { id: 'ed-c3', emoji: '📝', name: 'EdTech Blog', description: 'Future of learning article', prompt: 'Write an insightful blog post about how AI tutors and vernacular content are closing the education gap in developing countries.', tags: ['Blog', 'Thought Leadership'] },
    ],
  },
  finance: {
    deck: [
      { id: 'fn-d1', emoji: '💼', name: 'Pitch Deck', description: 'Series A startup pitch presentation', prompt: 'Create a 6-slide Series A pitch deck covering problem, solution, market size, traction, business model, and ask. Use data-driven language.', tags: ['Startup', '6 slides'] },
      { id: 'fn-d2', emoji: '📈', name: 'Market Report', description: 'Quarterly market analysis for investors', prompt: 'Create a 5-slide quarterly market report covering macro trends, sector performance, risk indicators, and portfolio recommendations.', tags: ['Analysis', '5 slides'] },
      { id: 'fn-d3', emoji: '🏦', name: 'Compliance Training', description: 'Regulatory compliance module', prompt: 'Create a 5-slide compliance training deck on AML/KYC procedures, covering red flags, reporting requirements, and case studies.', tags: ['Training', '5 slides'] },
    ],
    video: [
      { id: 'fn-v1', emoji: '📊', name: 'Market Update', description: 'Weekly market commentary video', prompt: 'Create a professional 30-second market update video script covering this week\'s key moves in equities, bonds, and crypto markets with actionable insights.', tags: ['Commentary', '30s'] },
      { id: 'fn-v2', emoji: '💳', name: 'Product Explainer', description: 'Banking product feature walkthrough', prompt: 'Create a 30-second explainer video script for a new AI-powered savings account that automatically optimizes interest rates across multiple currencies.', tags: ['Product', '30s'] },
      { id: 'fn-v3', emoji: '🛡️', name: 'Fraud Prevention', description: 'Customer security awareness video', prompt: 'Create a 30-second customer awareness video script about identifying phishing attempts and protecting online banking credentials.', tags: ['Security', '30s'] },
    ],
    content: [
      { id: 'fn-c1', emoji: '📝', name: 'Investment Insights', description: 'Weekly investment newsletter', prompt: 'Write a professional investment insights blog post about diversification strategies for 2026, covering global equities, real estate, and alternative assets.', tags: ['Blog', 'Advisory'] },
      { id: 'fn-c2', emoji: '📱', name: 'App Launch', description: 'Mobile banking app announcement', prompt: 'Write a social media post announcing a new AI-powered mobile banking app with voice commands in 15 languages and real-time currency conversion.', tags: ['Social', 'Launch'] },
      { id: 'fn-c3', emoji: '✉️', name: 'Client Update', description: 'Portfolio performance email', prompt: 'Write a quarterly client email summarizing portfolio performance, market outlook, and recommended rebalancing actions.', tags: ['Email', 'Client'] },
    ],
  },
  government: {
    deck: [
      { id: 'gv-d1', emoji: '🏛️', name: 'Policy Briefing', description: 'Executive policy summary for leaders', prompt: 'Create a 5-slide policy briefing on digital identity programs, covering citizen benefits, implementation roadmap, security measures, and budget allocation.', tags: ['Policy', '5 slides'] },
      { id: 'gv-d2', emoji: '🌆', name: 'Smart City Plan', description: 'Urban development proposal', prompt: 'Create a 6-slide smart city proposal covering IoT infrastructure, AI traffic management, digital citizen services, and sustainability metrics.', tags: ['Urban', '6 slides'] },
    ],
    video: [
      { id: 'gv-v1', emoji: '📢', name: 'Public Service', description: 'Community awareness campaign', prompt: 'Create a 30-second PSA video script about a new government digital portal, emphasizing accessibility for elderly citizens and multilingual support.', tags: ['PSA', '30s'] },
      { id: 'gv-v2', emoji: '🗳️', name: 'Voter Education', description: 'Election process explainer', prompt: 'Create a 30-second voter education video script explaining the registration process, polling locations, and ID requirements in simple, inclusive language.', tags: ['Education', '30s'] },
    ],
    content: [
      { id: 'gv-c1', emoji: '📱', name: 'Citizen Alert', description: 'Public safety notification', prompt: 'Write a clear, multilingual-ready public safety social media alert about emergency preparedness, including evacuation routes and emergency contacts.', tags: ['Social', 'Safety'] },
      { id: 'gv-c2', emoji: '📝', name: 'Annual Report', description: 'Government performance summary', prompt: 'Write a citizen-friendly blog summary of the annual government performance report, highlighting key achievements in health, education, and infrastructure.', tags: ['Blog', 'Transparency'] },
    ],
  },
  tourism: {
    deck: [
      { id: 'tr-d1', emoji: '🏖️', name: 'Destination Guide', description: 'Tourism board destination showcase', prompt: 'Create a 5-slide destination marketing deck showcasing eco-tourism experiences, cultural festivals, culinary trails, and adventure activities.', tags: ['Marketing', '5 slides'] },
      { id: 'tr-d2', emoji: '🏨', name: 'Hotel Pitch', description: 'Hotel partnership proposal', prompt: 'Create a 5-slide hotel partnership proposal covering brand alignment, revenue projections, joint marketing opportunities, and exclusive package designs.', tags: ['Partnership', '5 slides'] },
    ],
    video: [
      { id: 'tr-v1', emoji: '🌅', name: 'Destination Promo', description: 'Cinematic travel promotional', prompt: 'Create a cinematic 30-second promotional video script showcasing a tropical island destination with drone shots, local cuisine, and sunset activities.', tags: ['Cinematic', '30s'] },
      { id: 'tr-v2', emoji: '🗺️', name: 'Virtual Tour', description: 'Interactive heritage site tour', prompt: 'Create a 30-second virtual tour video script for an ancient heritage site, narrated by an AI historian avatar with cultural context and fun facts.', tags: ['Avatar', '30s'] },
    ],
    content: [
      { id: 'tr-c1', emoji: '📢', name: 'Travel Deal', description: 'Flash sale campaign ad', prompt: 'Write an urgent, compelling ad copy for a 48-hour flash sale on premium all-inclusive vacation packages, highlighting AI concierge and multilingual guides.', tags: ['Ad', 'Campaign'] },
      { id: 'tr-c2', emoji: '📝', name: 'Travel Blog', description: 'Experiential travel article', prompt: 'Write an engaging travel blog post about "Top 10 Hidden Gems" in Southeast Asia, blending cultural insights with practical traveler tips.', tags: ['Blog', 'SEO'] },
    ],
  },
  retail: {
    deck: [
      { id: 'rt-d1', emoji: '🛒', name: 'Product Launch', description: 'New product line presentation', prompt: 'Create a 5-slide product launch deck covering collection overview, target demographics, influencer strategy, pricing tiers, and launch timeline.', tags: ['Launch', '5 slides'] },
      { id: 'rt-d2', emoji: '📊', name: 'Sales Strategy', description: 'Quarterly sales plan', prompt: 'Create a 5-slide quarterly sales strategy deck covering channel performance, customer acquisition costs, retention metrics, and growth targets.', tags: ['Strategy', '5 slides'] },
    ],
    video: [
      { id: 'rt-v1', emoji: '🛍️', name: 'Product Showcase', description: 'Dynamic product demonstration', prompt: 'Create a 30-second product showcase video script for a smart home device, highlighting key features with dynamic transitions and lifestyle context.', tags: ['Product', '30s'] },
      { id: 'rt-v2', emoji: '🎬', name: 'Brand Story', description: 'Emotional brand narrative', prompt: 'Create a 30-second brand story video script that shows the journey from design concept to customer doorstep, emphasizing sustainability and craftsmanship.', tags: ['Brand', '30s'] },
    ],
    content: [
      { id: 'rt-c1', emoji: '✉️', name: 'Launch Email', description: 'Product launch announcement', prompt: 'Write a product launch email for a new AI-powered shopping assistant that gives personalized recommendations in the customer\'s native language.', tags: ['Email', 'Launch'] },
      { id: 'rt-c2', emoji: '📱', name: 'Social Campaign', description: 'Multi-platform social content', prompt: 'Write a viral social media post announcing a limited-edition collaboration, with urgency-driven copy and a strong visual description.', tags: ['Social', 'Viral'] },
    ],
  },
  manufacturing: {
    deck: [
      { id: 'mf-d1', emoji: '⚙️', name: 'Safety Training', description: 'Workplace safety protocol', prompt: 'Create a 5-slide safety training deck covering PPE requirements, hazard identification, emergency procedures, and incident reporting for factory workers.', tags: ['Safety', '5 slides'] },
      { id: 'mf-d2', emoji: '🤖', name: 'Automation Report', description: 'Factory automation ROI presentation', prompt: 'Create a 5-slide presentation on factory automation ROI, covering implementation costs, productivity gains, quality improvements, and payback timeline.', tags: ['ROI', '5 slides'] },
    ],
    video: [
      { id: 'mf-v1', emoji: '🔧', name: 'Equipment Guide', description: 'Machine operation tutorial', prompt: 'Create a 30-second instructional video script for CNC machine operation, covering startup sequence, safety checks, and emergency shutdown procedures.', tags: ['Tutorial', '30s'] },
      { id: 'mf-v2', emoji: '🏭', name: 'Quality Control', description: 'QC process walkthrough', prompt: 'Create a 30-second quality control video script showing the inspection process from raw materials to finished product, highlighting AI-powered defect detection.', tags: ['QC', '30s'] },
    ],
    content: [
      { id: 'mf-c1', emoji: '📧', name: 'SOP Update', description: 'Standard operating procedure notice', prompt: 'Write a clear, multilingual-ready SOP update email about new quality control checkpoints, emphasizing worker safety and regulatory compliance.', tags: ['Email', 'Compliance'] },
      { id: 'mf-c2', emoji: '📝', name: 'Industry 4.0 Blog', description: 'Smart manufacturing article', prompt: 'Write a thought leadership blog post about Industry 4.0 adoption, covering digital twins, predictive maintenance, and AI-driven supply chain optimization.', tags: ['Blog', 'Innovation'] },
    ],
  },
  realestate: {
    deck: [
      { id: 're-d1', emoji: '🏢', name: 'Investment Pitch', description: 'Property investment opportunity', prompt: 'Create a 5-slide real estate investment pitch covering project overview, location analysis, ROI projections, amenities, and investment timeline.', tags: ['Investment', '5 slides'] },
      { id: 're-d2', emoji: '🏠', name: 'Market Analysis', description: 'Regional property market report', prompt: 'Create a 5-slide real estate market analysis covering price trends, demand-supply dynamics, neighborhood comparisons, and investment outlook.', tags: ['Analysis', '5 slides'] },
    ],
    video: [
      { id: 're-v1', emoji: '🏗️', name: 'Property Tour', description: 'Virtual property walkthrough', prompt: 'Create a luxury 30-second property tour video script for a penthouse, describing panoramic views, smart-home features, and premium finishes with cinematic style.', tags: ['Luxury', '30s'] },
      { id: 're-v2', emoji: '🌇', name: 'Community Promo', description: 'Neighborhood lifestyle video', prompt: 'Create a 30-second community promotional video script showcasing the neighborhood lifestyle — cafes, parks, schools, and transport connectivity.', tags: ['Lifestyle', '30s'] },
    ],
    content: [
      { id: 're-c1', emoji: '📢', name: 'Listing Ad', description: 'Premium property listing', prompt: 'Write a premium property listing for a smart-home penthouse featuring AI building management, concierge services, and panoramic city views.', tags: ['Ad', 'Luxury'] },
      { id: 're-c2', emoji: '📝', name: 'Market Blog', description: 'Investment insights article', prompt: 'Write a blog post about emerging real estate investment opportunities in smart cities, covering sustainability, tech integration, and demographic shifts.', tags: ['Blog', 'Investment'] },
    ],
  },
  default: {
    deck: [
      { id: 'def-d1', emoji: '📊', name: 'Business Pitch', description: 'General business pitch deck', prompt: 'Create a compelling 5-slide business pitch deck covering the problem, solution, market opportunity, business model, and team.', tags: ['Pitch', '5 slides'] },
      { id: 'def-d2', emoji: '📋', name: 'Strategy Brief', description: 'Strategic overview presentation', prompt: 'Create a 5-slide strategic overview covering company vision, key initiatives, competitive advantages, milestones, and next steps.', tags: ['Strategy', '5 slides'] },
    ],
    video: [
      { id: 'def-v1', emoji: '🎬', name: 'Company Intro', description: 'Corporate introduction video', prompt: 'Create a 30-second corporate introduction video script covering who we are, what we do, our mission, and a call-to-action to learn more.', tags: ['Corporate', '30s'] },
      { id: 'def-v2', emoji: '🌟', name: 'Testimonial', description: 'Customer success story', prompt: 'Create a 30-second customer testimonial video script highlighting the challenge, solution, and measurable results achieved.', tags: ['Testimonial', '30s'] },
    ],
    content: [
      { id: 'def-c1', emoji: '📝', name: 'Company Blog', description: 'Thought leadership article', prompt: 'Write a thought leadership blog post about digital transformation trends in 2026, covering AI adoption, automation, and customer experience innovation.', tags: ['Blog', 'Thought Leadership'] },
      { id: 'def-c2', emoji: '📱', name: 'Social Announcement', description: 'Product update post', prompt: 'Write an engaging social media announcement about a major product update, highlighting new features, user benefits, and a limited-time offer.', tags: ['Social', 'Announcement'] },
    ],
  },
};

export default DemoTemplatePicker;