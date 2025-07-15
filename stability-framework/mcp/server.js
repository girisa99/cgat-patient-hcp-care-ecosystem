/**
 * MCP Server - Model Context Protocol server for AI integration
 * Provides AI tools and context management for the stability framework
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/server-stdio';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export class StabilityMCPServer {
  constructor(config = {}) {
    this.config = {
      name: 'stability-framework',
      version: '1.0.0',
      description: 'Stability Framework MCP Server',
      ...config
    };
    
    this.server = new Server(this.config, {
      capabilities: {
        tools: {}
      }
    });
    
    this.tools = new Map();
    this.context = {
      framework: null,
      project: null
    };
    
    this.setupDefaultTools();
    this.setupHandlers();
  }

  /**
   * Setup default tools for the stability framework
   */
  setupDefaultTools() {
    // Stability analysis tool
    this.addTool({
      name: 'analyze_stability',
      description: 'Analyze project stability and detect issues',
      inputSchema: {
        type: 'object',
        properties: {
          analysisType: {
            type: 'string',
            enum: ['full', 'duplicates', 'components', 'routes', 'hooks'],
            description: 'Type of stability analysis to perform'
          },
          options: {
            type: 'object',
            description: 'Analysis options'
          }
        }
      }
    });

    // Fix issues tool
    this.addTool({
      name: 'fix_issues',
      description: 'Automatically fix detected stability issues',
      inputSchema: {
        type: 'object',
        properties: {
          issueTypes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Types of issues to fix'
          },
          autoFix: {
            type: 'boolean',
            description: 'Enable automatic fixes'
          }
        }
      }
    });

    // Component analysis tool
    this.addTool({
      name: 'analyze_components',
      description: 'Analyze component structure and detect duplicates',
      inputSchema: {
        type: 'object',
        properties: {
          componentPath: {
            type: 'string',
            description: 'Path to analyze components'
          },
          includeUsage: {
            type: 'boolean',
            description: 'Include usage statistics'
          }
        }
      }
    });

    // Route analysis tool
    this.addTool({
      name: 'analyze_routes',
      description: 'Analyze routing configuration and detect conflicts',
      inputSchema: {
        type: 'object',
        properties: {
          checkConflicts: {
            type: 'boolean',
            description: 'Check for route conflicts'
          },
          validateGuards: {
            type: 'boolean',
            description: 'Validate route guards'
          }
        }
      }
    });

    // Generate report tool
    this.addTool({
      name: 'generate_report',
      description: 'Generate comprehensive stability report',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'markdown', 'html'],
            description: 'Report format'
          },
          sections: {
            type: 'array',
            items: { type: 'string' },
            description: 'Report sections to include'
          }
        }
      }
    });

    // Project health check tool
    this.addTool({
      name: 'health_check',
      description: 'Perform comprehensive project health check',
      inputSchema: {
        type: 'object',
        properties: {
          deep: {
            type: 'boolean',
            description: 'Perform deep health check'
          }
        }
      }
    });

    // Framework configuration tool
    this.addTool({
      name: 'configure_framework',
      description: 'Configure stability framework settings',
      inputSchema: {
        type: 'object',
        properties: {
          config: {
            type: 'object',
            description: 'Framework configuration'
          },
          restart: {
            type: 'boolean',
            description: 'Restart framework after configuration'
          }
        }
      }
    });
  }

  /**
   * Setup MCP handlers
   */
  setupHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Array.from(this.tools.values())
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        const result = await this.executeTool(name, args || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  /**
   * Add a tool to the server
   */
  addTool(tool) {
    this.tools.set(tool.name, tool);
  }

  /**
   * Execute a tool
   */
  async executeTool(toolName, args) {
    if (!this.tools.has(toolName)) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    switch (toolName) {
      case 'analyze_stability':
        return this.analyzeStability(args);
      
      case 'fix_issues':
        return this.fixIssues(args);
      
      case 'analyze_components':
        return this.analyzeComponents(args);
      
      case 'analyze_routes':
        return this.analyzeRoutes(args);
      
      case 'generate_report':
        return this.generateReport(args);
      
      case 'health_check':
        return this.healthCheck(args);
      
      case 'configure_framework':
        return this.configureFramework(args);
      
      default:
        throw new Error(`Tool implementation not found: ${toolName}`);
    }
  }

  /**
   * Analyze project stability
   */
  async analyzeStability(args) {
    const { analysisType = 'full', options = {} } = args;
    
    if (!this.context.framework) {
      throw new Error('Framework not initialized');
    }

    try {
      switch (analysisType) {
        case 'full':
          return await this.context.framework.generateReport();
        
        case 'duplicates':
          const stabilityManager = this.context.framework.getComponent('stabilityManager');
          return await stabilityManager.generateReport();
        
        case 'components':
          const componentManager = this.context.framework.getComponent('componentManager');
          return await componentManager.generateReport();
        
        case 'routes':
          const router = this.context.framework.getComponent('router');
          return await router.generateReport();
        
        case 'hooks':
          const hookManager = this.context.framework.getComponent('hookManager');
          return await hookManager.generateReport();
        
        default:
          throw new Error(`Unknown analysis type: ${analysisType}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        analysisType
      };
    }
  }

  /**
   * Fix detected issues
   */
  async fixIssues(args) {
    const { issueTypes = [], autoFix = false } = args;
    
    if (!this.context.framework) {
      throw new Error('Framework not initialized');
    }

    const results = {
      fixed: [],
      failed: [],
      skipped: []
    };

    try {
      const stabilityManager = this.context.framework.getComponent('stabilityManager');
      
      if (autoFix) {
        const stabilityCheck = await stabilityManager.performStabilityCheck();
        
        for (const duplicate of stabilityCheck.duplicates || []) {
          if (issueTypes.length === 0 || issueTypes.includes(duplicate.type)) {
            try {
              if (duplicate.canAutoFix) {
                await stabilityManager.duplicateAnalyzer.fixDuplicate(duplicate);
                results.fixed.push(duplicate);
              } else {
                results.skipped.push({
                  ...duplicate,
                  reason: 'Cannot auto-fix'
                });
              }
            } catch (error) {
              results.failed.push({
                ...duplicate,
                error: error.message
              });
            }
          }
        }
      }

      return {
        success: true,
        results,
        summary: {
          fixed: results.fixed.length,
          failed: results.failed.length,
          skipped: results.skipped.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze components
   */
  async analyzeComponents(args) {
    const { componentPath, includeUsage = true } = args;
    
    if (!this.context.framework) {
      throw new Error('Framework not initialized');
    }

    try {
      const componentManager = this.context.framework.getComponent('componentManager');
      const report = await componentManager.generateReport();
      
      if (!includeUsage) {
        delete report.usage;
      }

      return {
        success: true,
        componentPath,
        ...report
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        componentPath
      };
    }
  }

  /**
   * Analyze routes
   */
  async analyzeRoutes(args) {
    const { checkConflicts = true, validateGuards = true } = args;
    
    if (!this.context.framework) {
      throw new Error('Framework not initialized');
    }

    try {
      const router = this.context.framework.getComponent('router');
      const report = await router.generateReport();
      
      const analysis = {
        success: true,
        routes: report.routes,
        summary: report.summary
      };

      if (checkConflicts) {
        analysis.conflicts = report.conflicts;
      }

      if (validateGuards) {
        analysis.guards = {
          total: report.summary.totalGuards,
          // Add guard validation logic here
        };
      }

      return analysis;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(args) {
    const { format = 'json', sections = [] } = args;
    
    if (!this.context.framework) {
      throw new Error('Framework not initialized');
    }

    try {
      const fullReport = await this.context.framework.generateReport();
      
      // Filter sections if specified
      let report = fullReport;
      if (sections.length > 0) {
        report = {};
        sections.forEach(section => {
          if (fullReport[section]) {
            report[section] = fullReport[section];
          }
        });
      }

      // Format report
      switch (format) {
        case 'json':
          return {
            success: true,
            format,
            report
          };
        
        case 'markdown':
          return {
            success: true,
            format,
            report: this.formatReportAsMarkdown(report)
          };
        
        case 'html':
          return {
            success: true,
            format,
            report: this.formatReportAsHTML(report)
          };
        
        default:
          throw new Error(`Unknown format: ${format}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        format
      };
    }
  }

  /**
   * Perform health check
   */
  async healthCheck(args) {
    const { deep = false } = args;
    
    if (!this.context.framework) {
      return {
        success: false,
        error: 'Framework not initialized',
        status: 'unhealthy'
      };
    }

    try {
      const health = await this.context.framework.healthCheck();
      
      if (deep) {
        // Add deep health check logic
        health.details = {
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
          nodeVersion: process.version
        };
      }

      return {
        success: true,
        ...health
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'unhealthy'
      };
    }
  }

  /**
   * Configure framework
   */
  async configureFramework(args) {
    const { config, restart = false } = args;
    
    if (!this.context.framework) {
      throw new Error('Framework not initialized');
    }

    try {
      // Apply configuration
      Object.assign(this.context.framework.config, config);
      
      if (restart) {
        await this.context.framework.stop();
        await this.context.framework.start();
      }

      return {
        success: true,
        config: this.context.framework.config,
        restarted: restart
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format report as markdown
   */
  formatReportAsMarkdown(report) {
    let markdown = '# Stability Framework Report\n\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    
    // Add report sections
    Object.entries(report).forEach(([section, data]) => {
      markdown += `## ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n`;
      markdown += '```json\n';
      markdown += JSON.stringify(data, null, 2);
      markdown += '\n```\n\n';
    });
    
    return markdown;
  }

  /**
   * Format report as HTML
   */
  formatReportAsHTML(report) {
    let html = '<html><head><title>Stability Framework Report</title></head><body>';
    html += '<h1>Stability Framework Report</h1>';
    html += `<p>Generated: ${new Date().toISOString()}</p>`;
    
    Object.entries(report).forEach(([section, data]) => {
      html += `<h2>${section.charAt(0).toUpperCase() + section.slice(1)}</h2>`;
      html += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    });
    
    html += '</body></html>';
    return html;
  }

  /**
   * Set framework context
   */
  setFrameworkContext(framework) {
    this.context.framework = framework;
  }

  /**
   * Set project context
   */
  setProjectContext(project) {
    this.context.project = project;
  }

  /**
   * Start the MCP server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🤖 MCP Server started');
  }

  /**
   * Stop the MCP server
   */
  async stop() {
    await this.server.close();
    console.log('🤖 MCP Server stopped');
  }
}

export default StabilityMCPServer;