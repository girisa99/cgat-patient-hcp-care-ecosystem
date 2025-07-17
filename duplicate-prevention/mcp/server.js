/**
 * MCP Server for Duplicate Prevention
 * Model Context Protocol server implementation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { CoreAnalyzer } from '../core/analyzer.js';
import { ComponentRegistry } from '../core/registry.js';
import { CoreValidator } from '../core/validator.js';
import { ComponentCatalog } from '../core/catalog.js';
import { mcpConfig } from '../config/mcp.config.js';

export class DuplicatePreventionServer {
  constructor() {
    this.config = mcpConfig;
    this.server = new Server(
      {
        name: 'duplicate-prevention-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize components
    this.analyzer = new CoreAnalyzer();
    this.registry = new ComponentRegistry();
    this.validator = new CoreValidator();
    this.catalog = new ComponentCatalog();

    this.setupHandlers();
  }

  /**
   * Setup MCP handlers
   */
  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_component',
            description: 'Analyze a component for duplicates',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Component name' },
                metadata: { type: 'object', description: 'Component metadata' }
              },
              required: ['name', 'metadata']
            }
          },
          {
            name: 'register_component',
            description: 'Register a new component',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Component name' },
                metadata: { type: 'object', description: 'Component metadata' }
              },
              required: ['name', 'metadata']
            }
          },
          {
            name: 'validate_component',
            description: 'Validate a component against framework rules',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Component name' },
                metadata: { type: 'object', description: 'Component metadata' }
              },
              required: ['name', 'metadata']
            }
          },
          {
            name: 'search_catalog',
            description: 'Search the component catalog',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search query' },
                options: { type: 'object', description: 'Search options' }
              },
              required: ['query']
            }
          },
          {
            name: 'get_statistics',
            description: 'Get framework statistics',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'run_analysis',
            description: 'Run comprehensive duplicate analysis',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'validate_code',
            description: 'Validate code against framework rules',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'Code to validate' },
                type: { type: 'string', description: 'Code type' }
              },
              required: ['code']
            }
          },
          {
            name: 'get_similar_components',
            description: 'Find similar components',
            inputSchema: {
              type: 'object',
              properties: {
                componentName: { type: 'string', description: 'Component name' },
                threshold: { type: 'number', description: 'Similarity threshold' }
              },
              required: ['componentName']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_component':
            return await this.handleAnalyzeComponent(args);

          case 'register_component':
            return await this.handleRegisterComponent(args);

          case 'validate_component':
            return await this.handleValidateComponent(args);

          case 'search_catalog':
            return await this.handleSearchCatalog(args);

          case 'get_statistics':
            return await this.handleGetStatistics(args);

          case 'run_analysis':
            return await this.handleRunAnalysis(args);

          case 'validate_code':
            return await this.handleValidateCode(args);

          case 'get_similar_components':
            return await this.handleGetSimilarComponents(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  /**
   * Handle component analysis
   */
  async handleAnalyzeComponent(args) {
    const { name, metadata } = args;
    
    const analysis = await this.analyzer.registerComponent(name, metadata);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            tool: 'analyze_component',
            result: analysis,
            timestamp: new Date()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Handle component registration
   */
  async handleRegisterComponent(args) {
    const { name, metadata } = args;
    
    // Register in registry
    const registryResult = this.registry.registerComponent(name, metadata);
    
    // Add to catalog
    const catalogResult = this.catalog.addComponent(name, metadata);
    
    // Run analysis
    const analysis = await this.analyzer.registerComponent(name, metadata);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            tool: 'register_component',
            result: {
              registry: registryResult,
              catalog: catalogResult,
              analysis
            },
            timestamp: new Date()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Handle component validation
   */
  async handleValidateComponent(args) {
    const { name, metadata } = args;
    
    const validation = await this.validator.validateComponent(name, metadata);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            tool: 'validate_component',
            result: validation,
            timestamp: new Date()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Handle catalog search
   */
  async handleSearchCatalog(args) {
    const { query, options = {} } = args;
    
    const results = this.catalog.search(query, options);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            tool: 'search_catalog',
            result: {
              query,
              options,
              results,
              count: results.length
            },
            timestamp: new Date()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Handle statistics request
   */
  async handleGetStatistics(args) {
    const stats = {
      analyzer: this.analyzer.getStats(),
      registry: this.registry.getStats(),
      catalog: this.catalog.getStats()
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            tool: 'get_statistics',
            result: stats,
            timestamp: new Date()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Handle comprehensive analysis
   */
  async handleRunAnalysis(args) {
    const analysis = await this.analyzer.runAnalysis();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            tool: 'run_analysis',
            result: analysis,
            timestamp: new Date()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Handle code validation
   */
  async handleValidateCode(args) {
    const { code, type = 'unknown' } = args;
    
    const validation = await this.validator.validateCode(code, type);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            tool: 'validate_code',
            result: validation,
            timestamp: new Date()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Handle similar components request
   */
  async handleGetSimilarComponents(args) {
    const { componentName, threshold = 0.7 } = args;
    
    const similar = this.catalog.getSimilar(componentName, threshold);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            tool: 'get_similar_components',
            result: {
              componentName,
              threshold,
              similar,
              count: similar.length
            },
            timestamp: new Date()
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Start the server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('🚀 Duplicate Prevention MCP Server started');
    console.error(`📊 Configuration: ${JSON.stringify(this.config, null, 2)}`);
  }

  /**
   * Stop the server
   */
  async stop() {
    await this.server.close();
    console.error('🛑 Duplicate Prevention MCP Server stopped');
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      name: 'duplicate-prevention-server',
      version: '1.0.0',
      status: 'running',
      config: this.config,
      stats: {
        analyzer: this.analyzer.getStats(),
        registry: this.registry.getStats(),
        catalog: this.catalog.getStats()
      },
      timestamp: new Date()
    };
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DuplicatePreventionServer();
  
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });

  await server.start();
}