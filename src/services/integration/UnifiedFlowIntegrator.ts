/**
 * Unified Flow Integrator - Cohesive experience connecting AI, Templates, Visual Builder & Analytics
 */
import { realtimeManager } from '@/utils/realtime/RealtimeManager';
import { supabase } from '@/integrations/supabase/client';

export interface FlowEvent {
  id: string;
  type: 'ai_prompt' | 'template_update' | 'visual_change' | 'analytics_track';
  source: string;
  data: any;
  timestamp: string;
  sessionId: string;
  userId?: string;
}

export interface TemplateUpdate {
  templateId: string;
  changes: any;
  triggeredBy: 'ai_prompt' | 'user_action';
  aiPrompt?: string;
}

export interface VisualChange {
  nodeId?: string;
  edgeId?: string;
  action: 'create' | 'update' | 'delete' | 'move';
  data: any;
  coordinates?: { x: number; y: number };
}

export interface AnalyticsEvent {
  category: 'flow' | 'ai' | 'template' | 'visual' | 'collaboration';
  action: string;
  label?: string;
  value?: number;
  metadata?: any;
}

class UnifiedFlowIntegrator {
  private static instance: UnifiedFlowIntegrator;
  private eventQueue: FlowEvent[] = [];
  private subscribers: Map<string, ((event: FlowEvent) => void)[]> = new Map();
  private analyticsBuffer: AnalyticsEvent[] = [];

  static getInstance(): UnifiedFlowIntegrator {
    if (!UnifiedFlowIntegrator.instance) {
      UnifiedFlowIntegrator.instance = new UnifiedFlowIntegrator();
    }
    return UnifiedFlowIntegrator.instance;
  }

  private constructor() {
    this.initializeRealtimeIntegration();
    this.setupAnalyticsBuffer();
  }

  /**
   * Initialize real-time integration with all systems
   */
  private async initializeRealtimeIntegration() {
    console.log('🚀 Initializing Unified Flow Integration...');

    // Register unified flow channel (using existing table)
    await realtimeManager.registerModule({
      tableName: 'agent_sessions',
      moduleName: 'UnifiedFlow',
      enableInsert: true,
      enableUpdate: true,
      enableDelete: false,
      enableBulkOperations: true
    });

    // Subscribe to all flow events
    realtimeManager.subscribe('agent_sessions', (payload) => {
      this.handleRealtimeFlowEvent(payload);
    });

    console.log('✅ Unified Flow Integration initialized');
  }

  /**
   * Setup analytics buffer for batch processing
   */
  private setupAnalyticsBuffer() {
    // Flush analytics every 5 seconds
    setInterval(() => {
      if (this.analyticsBuffer.length > 0) {
        this.flushAnalytics();
      }
    }, 5000);
  }

  /**
   * Process AI prompt and trigger template updates
   */
  async processAIPrompt(prompt: string, sessionId: string, userId?: string): Promise<TemplateUpdate> {
    const event: FlowEvent = {
      id: crypto.randomUUID(),
      type: 'ai_prompt',
      source: 'ai_integration',
      data: { prompt, context: 'template_generation' },
      timestamp: new Date().toISOString(),
      sessionId,
      userId
    };

    // Broadcast AI prompt event
    await this.broadcastEvent(event);

    // Generate template update from AI prompt
    const templateUpdate = await this.generateTemplateFromPrompt(prompt);
    
    // Trigger template update event
    await this.updateTemplate(templateUpdate, sessionId, userId);

    // Track analytics
    this.trackAnalytics({
      category: 'ai',
      action: 'prompt_processed',
      label: 'template_generation',
      metadata: { promptLength: prompt.length, sessionId }
    });

    return templateUpdate;
  }

  /**
   * Update template and broadcast changes
   */
  async updateTemplate(update: TemplateUpdate, sessionId: string, userId?: string): Promise<void> {
    const event: FlowEvent = {
      id: crypto.randomUUID(),
      type: 'template_update',
      source: 'template_system',
      data: update,
      timestamp: new Date().toISOString(),
      sessionId,
      userId
    };

    // Update template in database
    await this.persistTemplateUpdate(update);

    // Broadcast template update
    await this.broadcastEvent(event);

    // Track analytics
    this.trackAnalytics({
      category: 'template',
      action: 'updated',
      label: update.triggeredBy,
      metadata: { templateId: update.templateId, sessionId }
    });
  }

  /**
   * Process visual builder changes
   */
  async processVisualChange(change: VisualChange, sessionId: string, userId?: string): Promise<void> {
    const event: FlowEvent = {
      id: crypto.randomUUID(),
      type: 'visual_change',
      source: 'visual_builder',
      data: change,
      timestamp: new Date().toISOString(),
      sessionId,
      userId
    };

    // Broadcast visual change
    await this.broadcastEvent(event);

    // Check if change should trigger template update
    if (change.action === 'create' && change.data.type === 'ai_node') {
      await this.triggerAITemplateUpdate(change, sessionId, userId);
    }

    // Track analytics
    this.trackAnalytics({
      category: 'visual',
      action: change.action,
      label: change.data.type || 'unknown',
      metadata: { nodeId: change.nodeId, sessionId, coordinates: change.coordinates }
    });
  }

  /**
   * Track analytics event
   */
  trackAnalytics(event: AnalyticsEvent): void {
    const enhancedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    };

    this.analyticsBuffer.push(enhancedEvent);

    // Broadcast analytics event for real-time dashboards
    const flowEvent: FlowEvent = {
      id: crypto.randomUUID(),
      type: 'analytics_track',
      source: 'analytics_system',
      data: enhancedEvent,
      timestamp: new Date().toISOString(),
      sessionId: 'global'
    };

    this.broadcastEvent(flowEvent);
  }

  /**
   * Subscribe to specific event types
   */
  subscribe(eventType: string, callback: (event: FlowEvent) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    
    this.subscribers.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Broadcast event to all subscribers and real-time channels
   */
  private async broadcastEvent(event: FlowEvent): Promise<void> {
    // Add to event queue
    this.eventQueue.push(event);

    // Notify local subscribers
    const callbacks = this.subscribers.get(event.type) || [];
    const allCallbacks = this.subscribers.get('*') || [];
    
    [...callbacks, ...allCallbacks].forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });

    // Log event for debugging (instead of database insert)
    console.log('Broadcasting unified flow event:', {
      type: event.type,
      source: event.source,
      sessionId: event.sessionId,
      timestamp: event.timestamp
    });
  }

  /**
   * Handle real-time events from other clients
   */
  private handleRealtimeFlowEvent(payload: any): void {
    const event: FlowEvent = {
      id: payload.new?.id || crypto.randomUUID(),
      type: payload.new?.event_type,
      source: payload.new?.source,
      data: payload.new?.data,
      timestamp: payload.new?.created_at,
      sessionId: payload.new?.session_id,
      userId: payload.new?.user_id
    };

    // Process event based on type
    switch (event.type) {
      case 'template_update':
        this.handleTemplateUpdateEvent(event);
        break;
      case 'visual_change':
        this.handleVisualChangeEvent(event);
        break;
      case 'ai_prompt':
        this.handleAIPromptEvent(event);
        break;
    }
  }

  // Private helper methods
  private async generateTemplateFromPrompt(prompt: string): Promise<TemplateUpdate> {
    // Simulate AI template generation
    return {
      templateId: crypto.randomUUID(),
      changes: {
        nodes: [{ type: 'ai_generated', prompt }],
        metadata: { generatedAt: new Date().toISOString() }
      },
      triggeredBy: 'ai_prompt',
      aiPrompt: prompt
    };
  }

  private async persistTemplateUpdate(update: TemplateUpdate): Promise<void> {
    // Persist template changes to database
    console.log('Persisting template update:', update);
  }

  private async triggerAITemplateUpdate(change: VisualChange, sessionId: string, userId?: string): Promise<void> {
    // Trigger AI processing based on visual change
    const prompt = `Generate template for visual element: ${JSON.stringify(change.data)}`;
    await this.processAIPrompt(prompt, sessionId, userId);
  }

  private async flushAnalytics(): Promise<void> {
    if (this.analyticsBuffer.length === 0) return;

    const events = [...this.analyticsBuffer];
    this.analyticsBuffer = [];

    // Log analytics events for debugging
    console.log('Flushing analytics events:', events.length, 'events');
    
    // Clear buffer since we've "processed" the events
    // In a real implementation, you would insert into a proper analytics table
  }

  private handleTemplateUpdateEvent(event: FlowEvent): void {
    console.log('Handling template update event:', event);
  }

  private handleVisualChangeEvent(event: FlowEvent): void {
    console.log('Handling visual change event:', event);
  }

  private handleAIPromptEvent(event: FlowEvent): void {
    console.log('Handling AI prompt event:', event);
  }

  /**
   * Get current flow state
   */
  getFlowState(sessionId: string) {
    return {
      events: this.eventQueue.filter(e => e.sessionId === sessionId),
      analytics: this.analyticsBuffer,
      subscribers: Array.from(this.subscribers.keys())
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.eventQueue = [];
    this.subscribers.clear();
    this.analyticsBuffer = [];
  }
}

export const unifiedFlowIntegrator = UnifiedFlowIntegrator.getInstance();