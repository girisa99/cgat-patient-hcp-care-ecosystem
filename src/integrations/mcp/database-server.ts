/**
 * MCP Database Server - Supabase Integration
 * Provides real-time database context and AI integration for healthcare workflows
 */

import { supabase } from "@/integrations/supabase/client";
import { HealthcareMCPServer, MCPServerConfig, MCPTool, MCPResource, MCPPrompt } from './healthcare-server';

export interface DatabaseMCPConfig extends MCPServerConfig {
  realtimeEnabled: boolean;
  tables: string[];
  maxResults: number;
  cacheTTL: number;
}

export class DatabaseMCPServer extends HealthcareMCPServer {
  private dbConfig: DatabaseMCPConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private realtimeChannels: Map<string, any> = new Map();

  constructor(config: DatabaseMCPConfig) {
    super(config);
    this.dbConfig = {
      realtimeEnabled: config.realtimeEnabled ?? true,
      tables: config.tables || ['profiles', 'agents', 'facilities', 'modules'],
      maxResults: config.maxResults || 100,
      cacheTTL: config.cacheTTL || 300000, // 5 minutes
      ...config
    };
  }

  /**
   * Get database resources for AI context
   */
  getDatabaseResources(): MCPResource[] {
    return [
      {
        uri: "db://supabase/profiles",
        name: "User Profiles Database",
        description: "Healthcare user profiles and contact information",
        mimeType: "application/json"
      },
      {
        uri: "db://supabase/facilities", 
        name: "Healthcare Facilities Database",
        description: "Healthcare facilities, departments, and organizational data",
        mimeType: "application/json"
      },
      {
        uri: "db://supabase/agents",
        name: "AI Agents Database", 
        description: "Healthcare AI agents and their configurations",
        mimeType: "application/json"
      },
      {
        uri: "db://supabase/agent_conversations",
        name: "Conversation History Database",
        description: "AI agent conversation history and context",
        mimeType: "application/json"
      },
      {
        uri: "db://supabase/modules",
        name: "Healthcare Modules Database",
        description: "Healthcare workflow modules and configurations",
        mimeType: "application/json"
      }
    ];
  }

  /**
   * Get database-specific AI prompts
   */
  getDatabasePrompts(): MCPPrompt[] {
    return [
      {
        name: "context-from-conversation",
        description: "Extract relevant context from conversation history for AI decision making",
        arguments: [
          {
            name: "conversation_id",
            description: "Conversation ID to analyze",
            required: true
          },
          {
            name: "context_type",
            description: "Type of context: medical, administrative, technical",
            required: false
          }
        ]
      },
      {
        name: "user-profile-analysis",
        description: "Analyze user profile data for personalized healthcare interactions",
        arguments: [
          {
            name: "user_id",
            description: "User ID to analyze",
            required: true
          },
          {
            name: "analysis_scope",
            description: "Scope: preferences, history, permissions, clinical",
            required: false
          }
        ]
      },
      {
        name: "facility-context-enrichment",
        description: "Enrich AI responses with facility-specific context and capabilities",
        arguments: [
          {
            name: "facility_id",
            description: "Healthcare facility ID",
            required: true
          },
          {
            name: "context_level",
            description: "Level: basic, detailed, comprehensive",
            required: false
          }
        ]
      }
    ];
  }

  /**
   * Get database tools for AI operations
   */
  getDatabaseTools(): MCPTool[] {
    return [
      {
        name: "query-conversation-context",
        description: "Query conversation history for AI context and continuity",
        inputSchema: {
          type: "object",
          properties: {
            agent_id: {
              type: "string",
              description: "AI Agent ID"
            },
            user_id: {
              type: "string", 
              description: "User ID for conversation history"
            },
            limit: {
              type: "number",
              description: "Number of recent conversations to analyze",
              default: 10
            },
            context_keywords: {
              type: "array",
              items: { type: "string" },
              description: "Keywords to filter relevant context"
            }
          },
          required: ["agent_id"]
        }
      },
      {
        name: "update-agent-memory",
        description: "Store important context in agent memory for future conversations",
        inputSchema: {
          type: "object",
          properties: {
            agent_id: {
              type: "string",
              description: "AI Agent ID"
            },
            memory_type: {
              type: "string",
              enum: ["patient_context", "clinical_knowledge", "user_preferences", "workflow_state"],
              description: "Type of memory to store"
            },
            content: {
              type: "object",
              description: "Memory content to store"
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "Memory priority level"
            }
          },
          required: ["agent_id", "memory_type", "content"]
        }
      },
      {
        name: "realtime-data-stream",
        description: "Subscribe to real-time database changes for AI context updates",
        inputSchema: {
          type: "object",
          properties: {
            table_name: {
              type: "string",
              description: "Database table to monitor"
            },
            filter_conditions: {
              type: "object",
              description: "Conditions to filter relevant changes"
            },
            callback_webhook: {
              type: "string",
              description: "Webhook URL for real-time notifications"
            }
          },
          required: ["table_name"]
        }
      },
      {
        name: "intelligent-search",
        description: "Perform AI-powered semantic search across healthcare data",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Natural language search query"
            },
            search_scope: {
              type: "array",
              items: { 
                type: "string",
                enum: ["profiles", "facilities", "conversations", "modules", "agents"]
              },
              description: "Tables/resources to search"
            },
            result_format: {
              type: "string",
              enum: ["raw", "summary", "structured", "conversational"],
              description: "Format of search results"
            },
            max_results: {
              type: "number",
              description: "Maximum number of results to return",
              default: 20
            }
          },
          required: ["query"]
        }
      }
    ];
  }

  /**
   * Execute database tools with real Supabase integration
   */
  async executeDatabaseTool(toolName: string, args: any): Promise<any> {
    console.log(`🗄️ Executing database tool: ${toolName}`);

    try {
      switch (toolName) {
        case "query-conversation-context":
          return await this.queryConversationContext(args);
          
        case "update-agent-memory":
          return await this.updateAgentMemory(args);
          
        case "realtime-data-stream":
          return await this.setupRealtimeStream(args);
          
        case "intelligent-search":
          return await this.performIntelligentSearch(args);
          
        default:
          // Fallback to parent healthcare tools
          return await this.executeTool(toolName, args);
      }
    } catch (error) {
      console.error(`Database tool execution failed: ${error}`);
      throw error;
    }
  }

  /**
   * Query conversation context from database
   */
  private async queryConversationContext(args: any) {
    const cacheKey = `conversation_${args.agent_id}_${args.user_id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.dbConfig.cacheTTL) {
        console.log("🚀 Returning cached conversation context");
        return { ...cached.data, source: "cache" };
      }
    }

    let query = supabase
      .from('agent_conversations')
      .select(`
        id,
        title,
        conversation_data,
        healthcare_context,
        journey_context,
        created_at,
        updated_at,
        status
      `)
      .eq('agent_id', args.agent_id)
      .order('updated_at', { ascending: false })
      .limit(args.limit || 10);

    if (args.user_id) {
      query = query.eq('user_id', args.user_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to query conversation context: ${error.message}`);
    }

    // Process context with keywords if provided
    let processedData = data;
    if (args.context_keywords && args.context_keywords.length > 0) {
      processedData = data?.filter(conv => 
        args.context_keywords.some((keyword: string) => 
          JSON.stringify(conv).toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    const result = {
      tool: "query-conversation-context",
      agent_id: args.agent_id,
      user_id: args.user_id,
      conversations_found: processedData?.length || 0,
      context_summary: this.generateContextSummary(processedData),
      recent_topics: this.extractRecentTopics(processedData),
      healthcare_context: this.extractHealthcareContext(processedData),
      timestamp: new Date().toISOString(),
      source: "database"
    };

    // Cache the result
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
  }

  /**
   * Update agent memory in database
   */
  private async updateAgentMemory(args: any) {
    // Store in agent configuration
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('configuration')
      .eq('id', args.agent_id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch agent configuration: ${fetchError.message}`);
    }

    const currentConfig = (agent?.configuration as any) || {};
    const memory = (currentConfig.memory as any) || {};
    
    // Update memory with new content
    memory[args.memory_type] = {
      content: args.content,
      priority: args.priority || "medium",
      updated_at: new Date().toISOString(),
      version: ((memory[args.memory_type] as any)?.version || 0) + 1
    };

    const updatedConfig = {
      ...currentConfig,
      memory,
      last_memory_update: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('agents')
      .update({ configuration: updatedConfig })
      .eq('id', args.agent_id);

    if (updateError) {
      throw new Error(`Failed to update agent memory: ${updateError.message}`);
    }

    return {
      tool: "update-agent-memory",
      agent_id: args.agent_id,
      memory_type: args.memory_type,
      status: "Memory updated successfully",
      memory_size: JSON.stringify(args.content).length,
      priority: args.priority,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Setup real-time data streaming
   */
  private async setupRealtimeStream(args: any) {
    if (!this.dbConfig.realtimeEnabled) {
      throw new Error("Real-time streaming is disabled");
    }

    const channelName = `mcp_${args.table_name}_${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: args.table_name,
          ...args.filter_conditions
        },
        (payload) => {
          console.log(`🔄 Real-time change detected in ${args.table_name}:`, payload);
          
          // If webhook provided, send notification
          if (args.callback_webhook) {
            fetch(args.callback_webhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                source: 'mcp-database-server',
                table: args.table_name,
                event: payload.eventType,
                data: payload.new || payload.old,
                timestamp: new Date().toISOString()
              })
            }).catch(console.error);
          }
        }
      )
      .subscribe();

    this.realtimeChannels.set(channelName, channel);

    return {
      tool: "realtime-data-stream",
      table_name: args.table_name,
      channel_name: channelName,
      status: "Real-time streaming active",
      webhook_configured: !!args.callback_webhook,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Perform intelligent search across healthcare data
   */
  private async performIntelligentSearch(args: any) {
    const searchResults: any[] = [];
    const searchScope = args.search_scope || ['profiles', 'facilities', 'conversations', 'modules'];

    // Search across specified tables
    for (const table of searchScope) {
      if (this.dbConfig.tables.includes(table)) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .textSearch('fts', args.query)
            .limit(Math.floor(args.max_results / searchScope.length));

          if (!error && data) {
            searchResults.push({
              table,
              matches: data.length,
              data: data
            });
          }
        } catch (error) {
          console.log(`Search in ${table} failed, trying alternative approach`);
          // Fallback to simple string matching
          const { data } = await supabase
            .from(table)
            .select('*')
            .limit(10);
          
          const filtered = data?.filter(item => 
            JSON.stringify(item).toLowerCase().includes(args.query.toLowerCase())
          ) || [];
          
          searchResults.push({
            table,
            matches: filtered.length,
            data: filtered
          });
        }
      }
    }

    return {
      tool: "intelligent-search",
      query: args.query,
      total_matches: searchResults.reduce((sum, result) => sum + result.matches, 0),
      search_scope: searchScope,
      results: args.result_format === 'summary' 
        ? this.generateSearchSummary(searchResults)
        : searchResults,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Helper functions for context processing
   */
  private generateContextSummary(conversations: any[]): string {
    if (!conversations || conversations.length === 0) {
      return "No recent conversation context available";
    }

    const topics = conversations
      .map(conv => conv.title || "Untitled conversation")
      .slice(0, 5)
      .join(", ");

    return `Recent conversations cover: ${topics}`;
  }

  private extractRecentTopics(conversations: any[]): string[] {
    if (!conversations) return [];
    
    return conversations
      .filter(conv => conv.title)
      .map(conv => conv.title)
      .slice(0, 10);
  }

  private extractHealthcareContext(conversations: any[]): any {
    if (!conversations) return {};

    const healthcareData = conversations
      .filter(conv => conv.healthcare_context)
      .map(conv => conv.healthcare_context);

    return {
      total_healthcare_conversations: healthcareData.length,
      common_contexts: healthcareData.length > 0 ? "Patient care, clinical workflows" : "None"
    };
  }

  private generateSearchSummary(results: any[]): any {
    const totalMatches = results.reduce((sum, result) => sum + result.matches, 0);
    const matchesByTable = results.reduce((acc, result) => {
      acc[result.table] = result.matches;
      return acc;
    }, {});

    return {
      total_matches: totalMatches,
      matches_by_table: matchesByTable,
      top_result: results.find(r => r.matches > 0)?.data?.[0] || null
    };
  }

  /**
   * Cleanup resources
   */
  async stop(): Promise<void> {
    // Unsubscribe from all real-time channels
    for (const [channelName, channel] of this.realtimeChannels) {
      await supabase.removeChannel(channel);
      console.log(`🔌 Unsubscribed from real-time channel: ${channelName}`);
    }
    this.realtimeChannels.clear();
    
    // Clear cache
    this.cache.clear();
    
    await super.stop();
    console.log("🗄️ Database MCP Server stopped");
  }

  /**
   * Get comprehensive server info
   */
  getDatabaseServerInfo() {
    const baseInfo = this.getServerInfo();
    return {
      ...baseInfo,
      database: {
        realtime_enabled: this.dbConfig.realtimeEnabled,
        monitored_tables: this.dbConfig.tables,
        active_channels: this.realtimeChannels.size,
        cache_size: this.cache.size,
        max_results: this.dbConfig.maxResults,
        cache_ttl_ms: this.dbConfig.cacheTTL
      },
      additional_resources: this.getDatabaseResources().length,
      additional_prompts: this.getDatabasePrompts().length,
      additional_tools: this.getDatabaseTools().length
    };
  }
}

// Factory function
export const createDatabaseMCPServer = (config: DatabaseMCPConfig): DatabaseMCPServer => {
  return new DatabaseMCPServer(config);
};

// Default database server with healthcare configuration
export const defaultDatabaseServer = createDatabaseMCPServer({
  name: "healthcare-database-mcp-server",
  version: "1.0.0", 
  description: "Real-time database MCP server for healthcare AI context and conversation management",
  realtimeEnabled: true,
  tables: ['profiles', 'agents', 'facilities', 'modules', 'agent_conversations', 'agent_sessions'],
  maxResults: 100,
  cacheTTL: 300000, // 5 minutes
  capabilities: ["database", "realtime", "search", "context", "memory"]
});