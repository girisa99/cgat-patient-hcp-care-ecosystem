/**
 * MCP Memory Server - In-Memory Context Storage
 * Provides high-speed in-memory context storage for AI conversations and workflows
 */

import { HealthcareMCPServer, MCPServerConfig, MCPTool, MCPResource, MCPPrompt } from './healthcare-server';

export interface MemoryMCPConfig extends MCPServerConfig {
  maxMemorySize: number; // bytes
  persistenceEnabled: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  ttlDefault: number; // seconds
}

export interface MemoryContext {
  id: string;
  type: 'conversation' | 'user_profile' | 'clinical_data' | 'workflow_state' | 'knowledge_base';
  data: any;
  metadata: {
    created_at: string;
    updated_at: string;
    access_count: number;
    last_accessed: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    ttl?: number;
    encrypted: boolean;
    compressed: boolean;
    size_bytes: number;
  };
}

export interface MemoryQuery {
  type?: string;
  tags?: string[];
  priority?: string;
  timeRange?: { start: string; end: string };
  limit?: number;
  sortBy?: 'created_at' | 'updated_at' | 'access_count' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export class MemoryMCPServer extends HealthcareMCPServer {
  private memoryConfig: MemoryMCPConfig;
  private memoryStore: Map<string, MemoryContext> = new Map();
  private memoryIndex: Map<string, Set<string>> = new Map(); // For fast lookups by tags
  private compressionWorker: any = null;
  private memoryStats = {
    totalSize: 0,
    itemCount: 0,
    accessCount: 0,
    lastCleanup: Date.now()
  };

  constructor(config: MemoryMCPConfig) {
    super(config);
    this.memoryConfig = {
      maxMemorySize: config.maxMemorySize || 100 * 1024 * 1024, // 100MB default
      persistenceEnabled: config.persistenceEnabled ?? false,
      compressionEnabled: config.compressionEnabled ?? true,
      encryptionEnabled: config.encryptionEnabled ?? false,
      ttlDefault: config.ttlDefault || 3600, // 1 hour default
      ...config
    };

    // Start periodic cleanup
    this.startMemoryCleanup();
  }

  /**
   * Get memory resources for AI context
   */
  getMemoryResources(): MCPResource[] {
    return [
      {
        uri: "memory://healthcare/conversations",
        name: "Conversation Memory Store",
        description: "High-speed storage for AI conversation context and history",
        mimeType: "application/json"
      },
      {
        uri: "memory://healthcare/user-profiles",
        name: "User Profile Memory Cache",
        description: "Cached user profile data for fast AI personalization",
        mimeType: "application/json"
      },
      {
        uri: "memory://healthcare/clinical-cache",
        name: "Clinical Data Memory Cache",
        description: "Temporary storage for clinical data and calculations",
        mimeType: "application/json"
      },
      {
        uri: "memory://healthcare/workflow-state",
        name: "Workflow State Memory",
        description: "Current state of healthcare workflows and processes",
        mimeType: "application/json"
      },
      {
        uri: "memory://healthcare/knowledge-base",
        name: "Knowledge Base Memory",
        description: "Cached medical knowledge and AI learning data",
        mimeType: "application/json"
      }
    ];
  }

  /**
   * Get memory-specific AI prompts
   */
  getMemoryPrompts(): MCPPrompt[] {
    return [
      {
        name: "retrieve-conversation-memory",
        description: "Retrieve conversation context from memory for AI continuity",
        arguments: [
          {
            name: "conversation_id",
            description: "Conversation identifier",
            required: true
          },
          {
            name: "context_depth",
            description: "Depth of context: shallow, medium, deep",
            required: false
          }
        ]
      },
      {
        name: "update-clinical-memory",
        description: "Update clinical memory cache with new patient data",
        arguments: [
          {
            name: "patient_id",
            description: "Patient identifier",
            required: true
          },
          {
            name: "clinical_data",
            description: "Clinical data to cache",
            required: true
          }
        ]
      },
      {
        name: "intelligent-memory-search",
        description: "Search memory using AI-powered semantic matching",
        arguments: [
          {
            name: "query",
            description: "Natural language search query",
            required: true
          },
          {
            name: "memory_types",
            description: "Types of memory to search",
            required: false
          }
        ]
      }
    ];
  }

  /**
   * Get memory tools for context management
   */
  getMemoryTools(): MCPTool[] {
    return [
      {
        name: "store-context",
        description: "Store context data in high-speed memory with optional compression and encryption",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the context"
            },
            type: {
              type: "string",
              enum: ["conversation", "user_profile", "clinical_data", "workflow_state", "knowledge_base"],
              description: "Type of context being stored"
            },
            data: {
              type: "object",
              description: "Context data to store"
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Tags for categorization and search"
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "Priority level for memory management"
            },
            ttl: {
              type: "number",
              description: "Time-to-live in seconds (overrides default)"
            },
            compress: {
              type: "boolean",
              description: "Enable compression for this item",
              default: true
            },
            encrypt: {
              type: "boolean", 
              description: "Enable encryption for this item",
              default: false
            }
          },
          required: ["id", "type", "data"]
        }
      },
      {
        name: "retrieve-context",
        description: "Retrieve context data from memory with automatic decompression",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Context identifier"
            },
            update_access_stats: {
              type: "boolean",
              description: "Update access statistics",
              default: true
            }
          },
          required: ["id"]
        }
      },
      {
        name: "search-memory",
        description: "Search memory contexts using flexible query parameters",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "object",
              properties: {
                type: { type: "string" },
                tags: { 
                  type: "array",
                  items: { type: "string" }
                },
                priority: { type: "string" },
                timeRange: {
                  type: "object",
                  properties: {
                    start: { type: "string" },
                    end: { type: "string" }
                  }
                },
                limit: { type: "number", default: 50 },
                sortBy: { 
                  type: "string",
                  enum: ["created_at", "updated_at", "access_count", "priority"],
                  default: "updated_at"
                },
                sortOrder: {
                  type: "string", 
                  enum: ["asc", "desc"],
                  default: "desc"
                }
              }
            },
            include_data: {
              type: "boolean",
              description: "Include full data in results",
              default: false
            }
          },
          required: ["query"]
        }
      },
      {
        name: "manage-memory",
        description: "Memory management operations like cleanup, compression, and statistics",
        inputSchema: {
          type: "object",
          properties: {
            operation: {
              type: "string",
              enum: ["cleanup", "compress_all", "get_stats", "export_backup", "clear_expired"],
              description: "Memory management operation to perform"
            },
            parameters: {
              type: "object",
              description: "Operation-specific parameters"
            }
          },
          required: ["operation"]
        }
      },
      {
        name: "bulk-memory-operations",
        description: "Perform bulk operations on memory contexts for efficiency",
        inputSchema: {
          type: "object",
          properties: {
            operation: {
              type: "string",
              enum: ["bulk_store", "bulk_retrieve", "bulk_delete", "bulk_update"],
              description: "Bulk operation type"
            },
            contexts: {
              type: "array",
              description: "Array of context objects for bulk operations"
            },
            options: {
              type: "object",
              description: "Bulk operation options"
            }
          },
          required: ["operation", "contexts"]
        }
      }
    ];
  }

  /**
   * Execute memory tools with optimized performance
   */
  async executeMemoryTool(toolName: string, args: any): Promise<any> {
    console.log(`🧠 Executing memory tool: ${toolName}`);

    try {
      switch (toolName) {
        case "store-context":
          return await this.storeContext(args);
          
        case "retrieve-context":
          return await this.retrieveContext(args);
          
        case "search-memory":
          return await this.searchMemory(args);
          
        case "manage-memory":
          return await this.manageMemory(args);
          
        case "bulk-memory-operations":
          return await this.performBulkOperations(args);
          
        default:
          // Fallback to parent healthcare tools
          return await this.executeTool(toolName, args);
      }
    } catch (error) {
      console.error(`Memory tool execution failed: ${error}`);
      throw error;
    }
  }

  /**
   * Store context in memory with optional compression and encryption
   */
  private async storeContext(args: any) {
    const {
      id,
      type,
      data,
      tags = [],
      priority = 'medium',
      ttl,
      compress = this.memoryConfig.compressionEnabled,
      encrypt = this.memoryConfig.encryptionEnabled
    } = args;

    // Check memory limits
    const dataSize = this.calculateDataSize(data);
    if (this.memoryStats.totalSize + dataSize > this.memoryConfig.maxMemorySize) {
      await this.performMemoryCleanup();
      
      if (this.memoryStats.totalSize + dataSize > this.memoryConfig.maxMemorySize) {
        throw new Error("Memory limit exceeded and cleanup insufficient");
      }
    }

    // Process data (compression/encryption)
    let processedData = data;
    let compressed = false;
    let encrypted = false;

    if (compress && dataSize > 1024) { // Only compress if > 1KB
      processedData = await this.compressData(processedData);
      compressed = true;
    }

    if (encrypt) {
      processedData = await this.encryptData(processedData);
      encrypted = true;
    }

    // Create memory context
    const now = new Date().toISOString();
    const context: MemoryContext = {
      id,
      type,
      data: processedData,
      metadata: {
        created_at: now,
        updated_at: now,
        access_count: 0,
        last_accessed: now,
        tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
        priority,
        ttl: ttl || this.memoryConfig.ttlDefault,
        encrypted,
        compressed,
        size_bytes: this.calculateDataSize(processedData)
      }
    };

    // Store in memory
    this.memoryStore.set(id, context);

    // Update indexes
    this.updateIndexes(id, context);

    // Update statistics
    this.memoryStats.totalSize += context.metadata.size_bytes;
    this.memoryStats.itemCount++;

    return {
      tool: "store-context",
      id,
      type,
      status: "Context stored successfully",
      size_bytes: context.metadata.size_bytes,
      compressed,
      encrypted,
      tags: context.metadata.tags,
      priority,
      ttl: context.metadata.ttl,
      timestamp: now
    };
  }

  /**
   * Retrieve context from memory with automatic decompression
   */
  private async retrieveContext(args: any) {
    const { id, update_access_stats = true } = args;

    const context = this.memoryStore.get(id);
    if (!context) {
      throw new Error(`Context not found: ${id}`);
    }

    // Check TTL
    const now = Date.now();
    const expiryTime = new Date(context.metadata.created_at).getTime() + 
                      (context.metadata.ttl! * 1000);
    
    if (now > expiryTime) {
      this.memoryStore.delete(id);
      this.removeFromIndexes(id, context);
      throw new Error(`Context expired: ${id}`);
    }

    // Process data (decrypt/decompress)
    let processedData = context.data;

    if (context.metadata.encrypted) {
      processedData = await this.decryptData(processedData);
    }

    if (context.metadata.compressed) {
      processedData = await this.decompressData(processedData);
    }

    // Update access statistics
    if (update_access_stats) {
      context.metadata.access_count++;
      context.metadata.last_accessed = new Date().toISOString();
      this.memoryStats.accessCount++;
    }

    return {
      tool: "retrieve-context",
      id,
      type: context.type,
      data: processedData,
      metadata: {
        created_at: context.metadata.created_at,
        updated_at: context.metadata.updated_at,
        access_count: context.metadata.access_count,
        tags: context.metadata.tags,
        priority: context.metadata.priority,
        size_bytes: context.metadata.size_bytes
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Search memory using flexible queries
   */
  private async searchMemory(args: any) {
    const { query, include_data = false } = args;
    let results: MemoryContext[] = Array.from(this.memoryStore.values());

    // Apply filters
    if (query.type) {
      results = results.filter(ctx => ctx.type === query.type);
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(ctx => 
        query.tags.some((tag: string) => ctx.metadata.tags.includes(tag))
      );
    }

    if (query.priority) {
      results = results.filter(ctx => ctx.metadata.priority === query.priority);
    }

    if (query.timeRange) {
      const start = new Date(query.timeRange.start).getTime();
      const end = new Date(query.timeRange.end).getTime();
      
      results = results.filter(ctx => {
        const created = new Date(ctx.metadata.created_at).getTime();
        return created >= start && created <= end;
      });
    }

    // Sort results
    const sortBy = query.sortBy || 'updated_at';
    const sortOrder = query.sortOrder || 'desc';
    
    results.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'access_count':
          aVal = a.metadata.access_count;
          bVal = b.metadata.access_count;
          break;
        case 'priority':
          const priorityMap = { low: 1, medium: 2, high: 3, critical: 4 };
          aVal = priorityMap[a.metadata.priority];
          bVal = priorityMap[b.metadata.priority];
          break;
        case 'created_at':
        case 'updated_at':
        default:
          aVal = new Date(a.metadata[sortBy]).getTime();
          bVal = new Date(b.metadata[sortBy]).getTime();
      }
      
      if (sortOrder === 'desc') {
        return bVal - aVal;
      }
      return aVal - bVal;
    });

    // Limit results
    const limit = query.limit || 50;
    results = results.slice(0, limit);

    // Prepare response
    const searchResults = await Promise.all(
      results.map(async (ctx) => {
        const result: any = {
          id: ctx.id,
          type: ctx.type,
          metadata: ctx.metadata
        };

        if (include_data) {
          // Process data if needed
          let processedData = ctx.data;
          if (ctx.metadata.encrypted) {
            processedData = await this.decryptData(processedData);
          }
          if (ctx.metadata.compressed) {
            processedData = await this.decompressData(processedData);
          }
          result.data = processedData;
        }

        return result;
      })
    );

    return {
      tool: "search-memory",
      query,
      total_results: searchResults.length,
      results: searchResults,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Memory management operations
   */
  private async manageMemory(args: any) {
    const { operation, parameters = {} } = args;

    switch (operation) {
      case "cleanup":
        return await this.performMemoryCleanup();
        
      case "compress_all":
        return await this.compressAllContexts();
        
      case "get_stats":
        return this.getMemoryStatistics();
        
      case "export_backup":
        return await this.exportMemoryBackup(parameters);
        
      case "clear_expired":
        return await this.clearExpiredContexts();
        
      default:
        throw new Error(`Unknown memory operation: ${operation}`);
    }
  }

  /**
   * Perform bulk operations for efficiency
   */
  private async performBulkOperations(args: any) {
    const { operation, contexts, options = {} } = args;
    const results: any[] = [];
    const errors: any[] = [];

    switch (operation) {
      case "bulk_store":
        for (const context of contexts) {
          try {
            const result = await this.storeContext(context);
            results.push(result);
          } catch (error) {
            errors.push({ context: context.id, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
        break;

      case "bulk_retrieve":
        for (const contextId of contexts) {
          try {
            const result = await this.retrieveContext({ id: contextId, update_access_stats: false });
            results.push(result);
          } catch (error) {
            errors.push({ context: contextId, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
        break;

      case "bulk_delete":
        for (const contextId of contexts) {
          try {
            const context = this.memoryStore.get(contextId);
            if (context) {
              this.memoryStore.delete(contextId);
              this.removeFromIndexes(contextId, context);
              this.memoryStats.totalSize -= context.metadata.size_bytes;
              this.memoryStats.itemCount--;
              results.push({ id: contextId, status: "deleted" });
            }
          } catch (error) {
            errors.push({ context: contextId, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
        break;

      default:
        throw new Error(`Unknown bulk operation: ${operation}`);
    }

    return {
      tool: "bulk-memory-operations",
      operation,
      total_processed: contexts.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Helper methods
   */
  private calculateDataSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private async compressData(data: any): Promise<any> {
    // Simple JSON compression (in production, use real compression library)
    const jsonString = JSON.stringify(data);
    return { compressed: true, data: jsonString };
  }

  private async decompressData(data: any): Promise<any> {
    if (data.compressed) {
      return JSON.parse(data.data);
    }
    return data;
  }

  private async encryptData(data: any): Promise<any> {
    // Simple encryption placeholder (use real encryption in production)
    return { encrypted: true, data: btoa(JSON.stringify(data)) };
  }

  private async decryptData(data: any): Promise<any> {
    if (data.encrypted) {
      return JSON.parse(atob(data.data));
    }
    return data;
  }

  private updateIndexes(id: string, context: MemoryContext): void {
    // Update tag indexes
    for (const tag of context.metadata.tags) {
      if (!this.memoryIndex.has(tag)) {
        this.memoryIndex.set(tag, new Set());
      }
      this.memoryIndex.get(tag)!.add(id);
    }
  }

  private removeFromIndexes(id: string, context: MemoryContext): void {
    // Remove from tag indexes
    for (const tag of context.metadata.tags) {
      const tagSet = this.memoryIndex.get(tag);
      if (tagSet) {
        tagSet.delete(id);
        if (tagSet.size === 0) {
          this.memoryIndex.delete(tag);
        }
      }
    }
  }

  private async performMemoryCleanup(): Promise<any> {
    const beforeStats = { ...this.memoryStats };
    let deletedCount = 0;
    let freedBytes = 0;

    const now = Date.now();
    
    // Remove expired contexts
    for (const [id, context] of this.memoryStore.entries()) {
      const expiryTime = new Date(context.metadata.created_at).getTime() + 
                        (context.metadata.ttl! * 1000);
      
      if (now > expiryTime) {
        this.memoryStore.delete(id);
        this.removeFromIndexes(id, context);
        freedBytes += context.metadata.size_bytes;
        deletedCount++;
      }
    }

    // Remove least recently used items if still over limit
    if (this.memoryStats.totalSize > this.memoryConfig.maxMemorySize * 0.9) {
      const contexts = Array.from(this.memoryStore.entries())
        .sort(([, a], [, b]) => 
          new Date(a.metadata.last_accessed).getTime() - 
          new Date(b.metadata.last_accessed).getTime()
        );

      for (const [id, context] of contexts) {
        if (this.memoryStats.totalSize <= this.memoryConfig.maxMemorySize * 0.7) {
          break;
        }
        
        if (context.metadata.priority !== 'critical') {
          this.memoryStore.delete(id);
          this.removeFromIndexes(id, context);
          freedBytes += context.metadata.size_bytes;
          deletedCount++;
        }
      }
    }

    // Update statistics
    this.memoryStats.totalSize -= freedBytes;
    this.memoryStats.itemCount -= deletedCount;
    this.memoryStats.lastCleanup = now;

    return {
      tool: "memory-cleanup",
      before_stats: beforeStats,
      after_stats: { ...this.memoryStats },
      deleted_contexts: deletedCount,
      freed_bytes: freedBytes,
      timestamp: new Date().toISOString()
    };
  }

  private async clearExpiredContexts(): Promise<any> {
    let deletedCount = 0;
    let freedBytes = 0;
    const now = Date.now();

    for (const [id, context] of this.memoryStore.entries()) {
      const expiryTime = new Date(context.metadata.created_at).getTime() + 
                        (context.metadata.ttl! * 1000);
      
      if (now > expiryTime) {
        this.memoryStore.delete(id);
        this.removeFromIndexes(id, context);
        freedBytes += context.metadata.size_bytes;
        deletedCount++;
      }
    }

    this.memoryStats.totalSize -= freedBytes;
    this.memoryStats.itemCount -= deletedCount;

    return {
      tool: "clear-expired",
      deleted_contexts: deletedCount,
      freed_bytes: freedBytes,
      timestamp: new Date().toISOString()
    };
  }

  private getMemoryStatistics(): any {
    const contexts = Array.from(this.memoryStore.values());
    
    const typeDistribution = contexts.reduce((acc, ctx) => {
      acc[ctx.type] = (acc[ctx.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityDistribution = contexts.reduce((acc, ctx) => {
      acc[ctx.metadata.priority] = (acc[ctx.metadata.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      tool: "memory-stats",
      overall_stats: this.memoryStats,
      memory_utilization: {
        used_bytes: this.memoryStats.totalSize,
        max_bytes: this.memoryConfig.maxMemorySize,
        utilization_percent: (this.memoryStats.totalSize / this.memoryConfig.maxMemorySize) * 100
      },
      type_distribution: typeDistribution,
      priority_distribution: priorityDistribution,
      index_stats: {
        total_tags: this.memoryIndex.size,
        average_contexts_per_tag: this.memoryIndex.size > 0 
          ? Array.from(this.memoryIndex.values()).reduce((sum, set) => sum + set.size, 0) / this.memoryIndex.size
          : 0
      },
      timestamp: new Date().toISOString()
    };
  }

  private async compressAllContexts(): Promise<any> {
    let compressedCount = 0;
    let savedBytes = 0;

    for (const [id, context] of this.memoryStore.entries()) {
      if (!context.metadata.compressed && context.metadata.size_bytes > 1024) {
        const originalSize = context.metadata.size_bytes;
        const compressedData = await this.compressData(context.data);
        const newSize = this.calculateDataSize(compressedData);
        
        context.data = compressedData;
        context.metadata.compressed = true;
        context.metadata.size_bytes = newSize;
        context.metadata.updated_at = new Date().toISOString();
        
        const savedInBytes = originalSize - newSize;
        savedBytes += savedInBytes;
        compressedCount++;
        
        this.memoryStats.totalSize -= savedInBytes;
      }
    }

    return {
      tool: "compress-all",
      compressed_contexts: compressedCount,
      saved_bytes: savedBytes,
      compression_ratio: compressedCount > 0 ? (savedBytes / (savedBytes + this.memoryStats.totalSize)) : 0,
      timestamp: new Date().toISOString()
    };
  }

  private async exportMemoryBackup(parameters: any): Promise<any> {
    const contexts = Array.from(this.memoryStore.values());
    
    // Filter contexts based on parameters
    let filteredContexts = contexts;
    if (parameters.types) {
      filteredContexts = contexts.filter(ctx => parameters.types.includes(ctx.type));
    }

    const backup = {
      version: "1.0.0",
      exported_at: new Date().toISOString(),
      total_contexts: filteredContexts.length,
      contexts: filteredContexts
    };

    return {
      tool: "export-backup",
      backup_size_bytes: this.calculateDataSize(backup),
      total_contexts: backup.total_contexts,
      backup_data: parameters.include_data ? backup : { metadata: "Data excluded for security" },
      timestamp: new Date().toISOString()
    };
  }

  private startMemoryCleanup(): void {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.performMemoryCleanup().catch(console.error);
    }, 5 * 60 * 1000);
  }

  /**
   * Stop memory server and cleanup
   */
  async stop(): Promise<void> {
    // Perform final cleanup
    await this.performMemoryCleanup();
    
    // Clear all data
    this.memoryStore.clear();
    this.memoryIndex.clear();
    
    await super.stop();
    console.log("🧠 Memory MCP Server stopped");
  }

  /**
   * Get comprehensive server info
   */
  getMemoryServerInfo() {
    const baseInfo = this.getServerInfo();
    return {
      ...baseInfo,
      memory_configuration: this.memoryConfig,
      memory_statistics: this.getMemoryStatistics(),
      additional_resources: this.getMemoryResources().length,
      additional_prompts: this.getMemoryPrompts().length,
      additional_tools: this.getMemoryTools().length
    };
  }
}

// Factory function
export const createMemoryMCPServer = (config: MemoryMCPConfig): MemoryMCPServer => {
  return new MemoryMCPServer(config);
};

// Default memory server with healthcare optimizations
export const defaultMemoryServer = createMemoryMCPServer({
  name: "healthcare-memory-mcp-server",
  version: "1.0.0",
  description: "High-speed in-memory context storage for healthcare AI workflows",
  maxMemorySize: 100 * 1024 * 1024, // 100MB
  persistenceEnabled: false,
  compressionEnabled: true,
  encryptionEnabled: false,
  ttlDefault: 3600, // 1 hour
  capabilities: ["memory-storage", "compression", "encryption", "indexing", "cleanup"]
});