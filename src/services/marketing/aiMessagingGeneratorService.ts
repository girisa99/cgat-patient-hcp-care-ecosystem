/**
 * AI Messaging Generator Service
 * 
 * Generates feature-specific hooks, CTAs, and positioning statements
 * using marketing pipelines with admin approval workflow.
 */

import { supabase } from '@/integrations/supabase/client';
import { featureDiscoveryService, MESSAGING_TEMPLATES, type CustomMessaging } from './featureDiscoveryService';
import { JOURNEY_TEMPLATES, FRAMEWORK_TEMPLATES } from './aiGenerationIntegration';
import { GENIE_PRODUCTS, type GenieProductId } from './productVersionTrackingService';

// ============================================================================
// TYPES
// ============================================================================

export interface MessagingRequest {
  id: string;
  productId: GenieProductId;
  featureId?: string;
  featureName?: string;
  type: 'product' | 'feature' | 'comparison' | 'tutorial';
  targetAudience: string[];
  competitors?: string[];
  status: 'pending' | 'generating' | 'pending_approval' | 'approved' | 'rejected';
  generatedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface GeneratedMessaging {
  requestId: string;
  productId: string;
  featureId?: string;
  
  // Core Messaging
  headline: string;
  hook: string;
  subHook: string;
  cta: string;
  ctaSecondary: string;
  
  // Value Proposition
  valueProposition: string;
  painPoints: string[];
  benefits: string[];
  differentiators: string[];
  
  // Script Components
  openingLine: string;
  closingLine: string;
  transitionPhrases: string[];
  
  // Full Script
  shortScript: string; // 30 seconds
  mediumScript: string; // 60 seconds
  longScript: string; // 90 seconds
  
  // SEO/Social
  hashtags: string[];
  keywords: string[];
  metaDescription: string;
  
  // Confidence & Metadata
  confidence: number;
  generatedBy: string;
  version: number;
  isApproved: boolean;
}

export interface CompetitorAnalysis {
  competitor: string;
  theirClaim: string;
  ourAdvantage: string;
  battleCard: string;
}

// ============================================================================
// MESSAGING FRAMEWORKS
// ============================================================================

export const MESSAGING_FRAMEWORKS = {
  problemSolution: {
    name: 'Problem → Solution',
    structure: ['State the problem', 'Agitate the pain', 'Present the solution', 'Show the result'],
  },
  beforeAfter: {
    name: 'Before → After',
    structure: ['Show the before state', 'Transform with product', 'Reveal the after', 'Call to action'],
  },
  featureBenefit: {
    name: 'Feature → Benefit',
    structure: ['Introduce feature', 'Explain how it works', 'Show the benefit', 'Prove with example'],
  },
  storyDriven: {
    name: 'Story Driven',
    structure: ['Hook with emotion', 'Share the journey', 'Reveal the transformation', 'Inspire action'],
  },
};

export const TARGET_AUDIENCES = [
  // Core Creator Segments
  { id: 'content_creators', label: 'Content Creators', painPoints: ['time-consuming editing', 'creative blocks', 'platform algorithm changes'] },
  { id: 'influencers', label: 'Influencers', painPoints: ['content fatigue', 'audience engagement', 'multi-platform demands'] },
  { id: 'knowledge_sharers', label: 'Knowledge Sharers', painPoints: ['monetizing expertise', 'production quality', 'audience building'] },
  
  // Business & Marketing
  { id: 'marketers', label: 'Marketing Teams', painPoints: ['content velocity', 'brand consistency', 'campaign ROI'] },
  { id: 'sales_teams', label: 'Sales Teams', painPoints: ['pitch personalization', 'demo creation', 'proposal turnaround'] },
  { id: 'agencies', label: 'Agencies & Freelancers', painPoints: ['client deliverables', 'scaling projects', 'white-label needs'] },
  { id: 'entrepreneurs', label: 'Entrepreneurs', painPoints: ['resource constraints', 'professional output', 'time-to-market'] },
  { id: 'smb', label: 'Small & Medium Business', painPoints: ['limited marketing budget', 'competing with big brands', 'DIY content'] },
  
  // Enterprise & Corporate
  { id: 'enterprises', label: 'Enterprise Teams', painPoints: ['compliance', 'collaboration', 'brand governance'] },
  { id: 'product_managers', label: 'Product Managers', painPoints: ['stakeholder communication', 'roadmap visualization', 'feature demos'] },
  { id: 'customer_success', label: 'Customer Success', painPoints: ['onboarding content', 'tutorial creation', 'support scalability'] },
  { id: 'executive_leadership', label: 'Executive Leadership', painPoints: ['board presentations', 'investor updates', 'internal comms'] },
  { id: 'developers', label: 'Developers & Tech Teams', painPoints: ['documentation', 'API demos', 'technical tutorials'] },
  
  // HR & People
  { id: 'hr_recruiters', label: 'HR & Recruiters', painPoints: ['employer branding', 'onboarding videos', 'culture content'] },
  { id: 'trainers', label: 'L&D Professionals', painPoints: ['engagement', 'scalability', 'learning retention'] },
  
  // Education
  { id: 'educators', label: 'Educators', painPoints: ['student engagement', 'content creation time', 'remote learning'] },
  
  // Specialized Industries
  { id: 'healthcare', label: 'Healthcare Professionals', painPoints: ['patient education', 'compliance requirements', 'clinical training'] },
  { id: 'compliance', label: 'Compliance & Legal', painPoints: ['policy communication', 'audit documentation', 'training requirements'] },
  { id: 'travelers', label: 'Travel & Hospitality', painPoints: ['destination marketing', 'multilingual content', 'seasonal campaigns'] },
];

export const COMPETITOR_DATABASE = [
  { id: 'canva', name: 'Canva', category: 'design', weakness: 'Limited AI generation' },
  { id: 'beautiful_ai', name: 'Beautiful.AI', category: 'presentations', weakness: 'No video output' },
  { id: 'lumen5', name: 'Lumen5', category: 'video', weakness: 'Template-based only' },
  { id: 'synthesia', name: 'Synthesia', category: 'avatar', weakness: 'No presentation integration' },
  { id: 'tome', name: 'Tome', category: 'presentations', weakness: 'Limited customization' },
  { id: 'gamma', name: 'Gamma', category: 'presentations', weakness: 'No audio/video' },
  { id: 'pictory', name: 'Pictory', category: 'video', weakness: 'Basic editing only' },
  { id: 'descript', name: 'Descript', category: 'video', weakness: 'Steep learning curve' },
];

// ============================================================================
// AI MESSAGING GENERATOR SERVICE
// ============================================================================

class AIMessagingGeneratorService {
  private static instance: AIMessagingGeneratorService;
  private pendingRequests: Map<string, MessagingRequest> = new Map();
  private generatedMessaging: Map<string, GeneratedMessaging> = new Map();

  static getInstance(): AIMessagingGeneratorService {
    if (!this.instance) {
      this.instance = new AIMessagingGeneratorService();
    }
    return this.instance;
  }

  /**
   * Create a messaging generation request
   */
  createRequest(
    productId: GenieProductId,
    options: {
      featureId?: string;
      featureName?: string;
      type: MessagingRequest['type'];
      targetAudience: string[];
      competitors?: string[];
    }
  ): MessagingRequest {
    const id = `msg_${productId}_${Date.now()}`;
    
    const request: MessagingRequest = {
      id,
      productId,
      featureId: options.featureId,
      featureName: options.featureName,
      type: options.type,
      targetAudience: options.targetAudience,
      competitors: options.competitors,
      status: 'pending',
    };

    this.pendingRequests.set(id, request);
    return request;
  }

  /**
   * Generate messaging using AI
   */
  async generateMessaging(requestId: string): Promise<GeneratedMessaging> {
    const request = this.pendingRequests.get(requestId);
    if (!request) throw new Error(`Request not found: ${requestId}`);

    request.status = 'generating';
    
    const product = GENIE_PRODUCTS[request.productId];
    const feature = request.featureId 
      ? product.features.find(f => f.id === request.featureId)
      : null;

    // Get audience pain points
    const audiencePainPoints = request.targetAudience
      .map(a => TARGET_AUDIENCES.find(t => t.id === a))
      .filter(Boolean)
      .flatMap(a => a!.painPoints);

    // Get competitor weaknesses
    const competitorWeaknesses = (request.competitors || [])
      .map(c => COMPETITOR_DATABASE.find(comp => comp.id === c))
      .filter(Boolean)
      .map(c => c!.weakness);

    // Generate using AI
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate_marketing_messaging',
          productName: product.name,
          productTagline: product.tagline,
          featureName: feature?.name || product.name,
          type: request.type,
          audiencePainPoints,
          competitorWeaknesses,
          frameworks: Object.keys(MESSAGING_FRAMEWORKS),
          templates: MESSAGING_TEMPLATES.map(t => t.template),
        },
      });

      if (error) throw error;

      // Parse AI response or use fallback generation
      const messaging = this.parseAIResponse(data, request, product, feature);
      
      request.status = 'pending_approval';
      request.generatedAt = new Date();
      
      this.generatedMessaging.set(requestId, messaging);
      
      console.log(`[AIMessaging] Generated messaging for ${product.name}${feature ? ` - ${feature.name}` : ''}`);
      return messaging;
      
    } catch (error) {
      console.warn('[AIMessaging] AI generation failed, using template-based fallback');
      
      // Fallback to template-based generation
      const messaging = this.generateFromTemplates(request, product, feature);
      request.status = 'pending_approval';
      request.generatedAt = new Date();
      
      this.generatedMessaging.set(requestId, messaging);
      return messaging;
    }
  }

  /**
   * Parse AI response into GeneratedMessaging structure
   */
  private parseAIResponse(
    data: any,
    request: MessagingRequest,
    product: typeof GENIE_PRODUCTS[GenieProductId],
    feature: { id: string; name: string } | null
  ): GeneratedMessaging {
    const aiContent = data?.content || data?.messaging || {};
    
    return {
      requestId: request.id,
      productId: request.productId,
      featureId: request.featureId,
      
      headline: aiContent.headline || this.generateHeadline(product, feature),
      hook: aiContent.hook || this.generateHook(product, feature),
      subHook: aiContent.subHook || `Discover how ${product.name} transforms your workflow`,
      cta: aiContent.cta || `Try ${product.name} Free`,
      ctaSecondary: aiContent.ctaSecondary || 'Watch Demo',
      
      valueProposition: aiContent.valueProposition || product.tagline,
      painPoints: aiContent.painPoints || ['Time-consuming manual work', 'Inconsistent quality', 'Scalability challenges'],
      benefits: aiContent.benefits || ['Save 10x time', 'Professional results', 'Scale effortlessly'],
      differentiators: aiContent.differentiators || ['Multi-modal AI', 'Regional intelligence', '200+ pipelines'],
      
      openingLine: aiContent.openingLine || `What if ${feature?.name || product.name} was just one click away?`,
      closingLine: aiContent.closingLine || `Start creating with ${product.name} today.`,
      transitionPhrases: aiContent.transitionPhrases || ['But that\'s not all...', 'Here\'s where it gets interesting...', 'Watch this...'],
      
      shortScript: this.generateScript('short', product, feature),
      mediumScript: this.generateScript('medium', product, feature),
      longScript: this.generateScript('long', product, feature),
      
      hashtags: aiContent.hashtags || this.generateHashtags(product, feature),
      keywords: aiContent.keywords || [product.name.toLowerCase(), 'ai', 'content creation', 'automation'],
      metaDescription: aiContent.metaDescription || `${product.name}: ${product.tagline}. Transform your content workflow with AI.`,
      
      confidence: aiContent.confidence || 0.85,
      generatedBy: 'ai-universal-processor',
      version: 1,
      isApproved: false,
    };
  }

  /**
   * Generate messaging from templates (fallback)
   */
  private generateFromTemplates(
    request: MessagingRequest,
    product: typeof GENIE_PRODUCTS[GenieProductId],
    feature: { id: string; name: string } | null
  ): GeneratedMessaging {
    return {
      requestId: request.id,
      productId: request.productId,
      featureId: request.featureId,
      
      headline: this.generateHeadline(product, feature),
      hook: this.generateHook(product, feature),
      subHook: `See how ${feature?.name || product.name} eliminates hours of manual work`,
      cta: `Start with ${product.name}`,
      ctaSecondary: 'See It In Action',
      
      valueProposition: product.tagline,
      painPoints: ['Wasting hours on repetitive tasks', 'Inconsistent output quality', 'Limited creative bandwidth'],
      benefits: ['Reclaim your time', 'Consistent professional results', 'Unlimited creative potential'],
      differentiators: [
        'Only platform with 200+ AI pipelines',
        'Regional AI for authentic localization',
        'From idea to multi-format output in minutes',
      ],
      
      openingLine: `Tired of spending hours on ${feature?.name?.toLowerCase() || 'content creation'}?`,
      closingLine: `${product.name}: ${product.tagline}. Try it free today.`,
      transitionPhrases: ['And the best part?', 'But here\'s what makes it different...', 'See for yourself...'],
      
      shortScript: this.generateScript('short', product, feature),
      mediumScript: this.generateScript('medium', product, feature),
      longScript: this.generateScript('long', product, feature),
      
      hashtags: this.generateHashtags(product, feature),
      keywords: [product.id, 'ai content', 'automation', feature?.id || ''].filter(Boolean),
      metaDescription: `${product.name} - ${product.tagline}. Create professional content 10x faster with AI.`,
      
      confidence: 0.75,
      generatedBy: 'template-fallback',
      version: 1,
      isApproved: false,
    };
  }

  private generateHeadline(product: typeof GENIE_PRODUCTS[GenieProductId], feature: { name: string } | null): string {
    const templates = [
      `${feature?.name || product.name}: ${product.tagline}`,
      `Transform Your Workflow with ${product.name}`,
      `${product.name} - AI That Actually Works`,
      `Stop Wasting Time. Start Using ${product.name}.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateHook(product: typeof GENIE_PRODUCTS[GenieProductId], feature: { name: string } | null): string {
    const templates = [
      `In 30 seconds, I'll show you how ${product.name} changed everything`,
      `What if ${feature?.name || 'AI content creation'} was this easy?`,
      `Stop struggling with ${feature?.name?.toLowerCase() || 'content'}. Watch this.`,
      `The secret weapon top creators use for ${feature?.name?.toLowerCase() || 'professional content'}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateScript(
    length: 'short' | 'medium' | 'long',
    product: typeof GENIE_PRODUCTS[GenieProductId],
    feature: { name: string } | null
  ): string {
    const name = feature?.name || product.name;
    
    if (length === 'short') {
      return `Stop wasting hours on ${name.toLowerCase()}. ${product.name} uses AI to do it in seconds. Watch. [Demo] That's ${product.tagline.toLowerCase()}. Try it free.`;
    }
    
    if (length === 'medium') {
      return `What if I told you ${name.toLowerCase()} could take seconds instead of hours? Meet ${product.name}. [Show problem] We've all been there - staring at a blank screen. [Show solution] With ${product.name}, just describe what you want. [Demo] The AI handles the rest. Professional results. Every time. ${product.tagline}. Link in bio.`;
    }
    
    return `There's a problem with traditional ${name.toLowerCase()}. It takes too long. The quality is inconsistent. And scaling? Forget about it. [Pause] But what if there was a better way? [Transition] Introducing ${product.name}. [Demo sequence] Watch as I create ${feature?.name || 'professional content'} in real-time. No templates. No tedious editing. Just describe what you want, and let the AI work its magic. [Show results] That's the power of 200+ AI pipelines, regional intelligence, and multi-modal generation - all in one platform. ${product.name}: ${product.tagline}. Start free today.`;
  }

  private generateHashtags(product: typeof GENIE_PRODUCTS[GenieProductId], feature: { name: string } | null): string[] {
    const base = [`#${product.name.replace(/\s/g, '')}`, '#AIContent', '#ContentCreation', '#Productivity'];
    if (feature) {
      base.push(`#${feature.name.replace(/\s/g, '')}`);
    }
    return base;
  }

  /**
   * Approve generated messaging
   */
  approveMessaging(requestId: string, approvedBy: string): void {
    const request = this.pendingRequests.get(requestId);
    const messaging = this.generatedMessaging.get(requestId);
    
    if (!request || !messaging) {
      throw new Error(`Messaging not found: ${requestId}`);
    }

    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = approvedBy;
    messaging.isApproved = true;

    // Register with feature discovery service
    if (request.featureId) {
      featureDiscoveryService.updateFeatureMessaging(request.featureId, {
        headline: messaging.headline,
        hook: messaging.hook,
        description: messaging.valueProposition,
        painPoints: messaging.painPoints,
        benefits: messaging.benefits,
        hashtags: messaging.hashtags,
      });
    }

    console.log(`[AIMessaging] Approved messaging for ${request.productId}${request.featureId ? `/${request.featureId}` : ''}`);
  }

  /**
   * Reject generated messaging
   */
  rejectMessaging(requestId: string, reason: string): void {
    const request = this.pendingRequests.get(requestId);
    if (!request) throw new Error(`Request not found: ${requestId}`);

    request.status = 'rejected';
    request.rejectionReason = reason;

    console.log(`[AIMessaging] Rejected messaging for ${requestId}: ${reason}`);
  }

  /**
   * Get messaging by request ID
   */
  getMessaging(requestId: string): GeneratedMessaging | null {
    return this.generatedMessaging.get(requestId) || null;
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(): MessagingRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(r => r.status === 'pending_approval');
  }

  /**
   * Get approved messaging for a product/feature
   */
  getApprovedMessaging(productId: string, featureId?: string): GeneratedMessaging | null {
    for (const [_, messaging] of this.generatedMessaging) {
      if (messaging.productId === productId && 
          messaging.isApproved && 
          (!featureId || messaging.featureId === featureId)) {
        return messaging;
      }
    }
    return null;
  }

  /**
   * Generate competitor battle card
   */
  generateBattleCard(productId: GenieProductId, competitorId: string): CompetitorAnalysis | null {
    const product = GENIE_PRODUCTS[productId];
    const competitor = COMPETITOR_DATABASE.find(c => c.id === competitorId);
    
    if (!product || !competitor) return null;

    return {
      competitor: competitor.name,
      theirClaim: `Leading ${competitor.category} platform`,
      ourAdvantage: `${product.name} offers ${competitor.weakness ? 'what they lack: ' + competitor.weakness : 'superior AI integration'}`,
      battleCard: `When prospects mention ${competitor.name}, highlight ${product.name}'s unique multi-modal AI capabilities and 200+ pipeline ecosystem.`,
    };
  }

  /**
   * Get all competitors for comparison
   */
  getCompetitors(): typeof COMPETITOR_DATABASE {
    return COMPETITOR_DATABASE;
  }

  /**
   * Get target audiences
   */
  getTargetAudiences(): typeof TARGET_AUDIENCES {
    return TARGET_AUDIENCES;
  }
}

export const aiMessagingGeneratorService = AIMessagingGeneratorService.getInstance();
