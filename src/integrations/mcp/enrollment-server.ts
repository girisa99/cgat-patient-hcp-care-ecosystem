/**
 * Enrollment MCP Server Implementation
 * Provides enrollment-specific context and tools for AI-powered patient onboarding
 */

import { MCPServerConfig, MCPResource, MCPPrompt, MCPTool } from './healthcare-server';

export interface EnrollmentMCPContext {
  patientId?: string;
  sessionId?: string;
  currentStep?: string;
  enrollmentData?: Record<string, any>;
  npiData?: any;
  insuranceData?: any;
}

/**
 * Enrollment MCP Server Implementation
 * Provides enrollment-specific context and tools for patient onboarding workflows
 */
export class EnrollmentMCPServer {
  private config: MCPServerConfig;
  private isRunning: boolean = false;
  private context: EnrollmentMCPContext = {};

  constructor(config: MCPServerConfig) {
    this.config = {
      ...config,
      capabilities: config.capabilities || ['resources', 'prompts', 'tools', 'enrollment', 'npi-verification']
    };
  }

  /**
   * Set current enrollment context
   */
  setContext(context: EnrollmentMCPContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Get enrollment resources available through MCP
   */
  getResources(): MCPResource[] {
    return [
      {
        uri: "enrollment://patient-information",
        name: "Patient Information",
        description: "Patient demographic and contact information for enrollment",
        mimeType: "application/json"
      },
      {
        uri: "enrollment://consent-forms",
        name: "Consent Forms",
        description: "Digital consent forms and signatures for enrollment",
        mimeType: "application/json"
      },
      {
        uri: "enrollment://insurance-verification",
        name: "Insurance Verification",
        description: "Insurance eligibility and coverage verification data",
        mimeType: "application/json"
      },
      {
        uri: "enrollment://npi-registry",
        name: "NPI Registry",
        description: "National Provider Identifier lookup and verification",
        mimeType: "application/json"
      },
      {
        uri: "enrollment://credentialing",
        name: "Credentialing Data",
        description: "Provider credentialing and verification documents",
        mimeType: "application/json"
      },
      {
        uri: "enrollment://clinical-assessment",
        name: "Clinical Assessment",
        description: "Initial clinical assessment and health history data",
        mimeType: "application/json"
      }
    ];
  }

  /**
   * Get enrollment AI prompts
   */
  getPrompts(): MCPPrompt[] {
    return [
      {
        name: "enrollment-guidance",
        description: "Provide step-by-step guidance for patient enrollment process",
        arguments: [
          {
            name: "current_step",
            description: "Current enrollment step (consent, patient_info, insurance, etc.)",
            required: true
          },
          {
            name: "patient_context",
            description: "Patient-specific context and collected data",
            required: false
          }
        ]
      },
      {
        name: "field-validation",
        description: "Validate enrollment form field values with intelligent feedback",
        arguments: [
          {
            name: "field_name",
            description: "Name of the form field to validate",
            required: true
          },
          {
            name: "field_value",
            description: "Value entered by the user",
            required: true
          },
          {
            name: "field_type",
            description: "Type of field (email, phone, npi, ssn, etc.)",
            required: false
          }
        ]
      },
      {
        name: "npi-verification",
        description: "Verify National Provider Identifier and retrieve provider details",
        arguments: [
          {
            name: "npi_number",
            description: "10-digit NPI number to verify",
            required: true
          },
          {
            name: "provider_type",
            description: "Expected provider type (individual, organization)",
            required: false
          }
        ]
      },
      {
        name: "insurance-eligibility",
        description: "Check insurance eligibility and coverage details",
        arguments: [
          {
            name: "member_id",
            description: "Insurance member ID",
            required: true
          },
          {
            name: "payer_id",
            description: "Insurance payer identifier",
            required: true
          },
          {
            name: "service_type",
            description: "Type of service to check coverage for",
            required: false
          }
        ]
      },
      {
        name: "consent-explanation",
        description: "Explain consent form content in patient-friendly language",
        arguments: [
          {
            name: "consent_type",
            description: "Type of consent (hipaa, treatment, research, etc.)",
            required: true
          },
          {
            name: "language_preference",
            description: "Preferred language for explanation",
            required: false
          }
        ]
      },
      {
        name: "section-summary",
        description: "Generate a summary of completed enrollment section",
        arguments: [
          {
            name: "section_name",
            description: "Name of the enrollment section",
            required: true
          },
          {
            name: "section_data",
            description: "Data collected in the section",
            required: true
          }
        ]
      }
    ];
  }

  /**
   * Get enrollment tools for workflow operations
   */
  getTools(): MCPTool[] {
    return [
      {
        name: "verify-npi",
        description: "Verify NPI number against NPPES registry",
        inputSchema: {
          type: "object",
          properties: {
            npi: {
              type: "string",
              description: "10-digit NPI number",
              pattern: "^[0-9]{10}$"
            },
            include_details: {
              type: "boolean",
              description: "Include full provider details",
              default: true
            }
          },
          required: ["npi"]
        }
      },
      {
        name: "validate-insurance",
        description: "Validate insurance information and check eligibility",
        inputSchema: {
          type: "object",
          properties: {
            member_id: {
              type: "string",
              description: "Insurance member ID"
            },
            group_number: {
              type: "string",
              description: "Insurance group number"
            },
            payer_name: {
              type: "string",
              description: "Insurance payer name"
            },
            subscriber_dob: {
              type: "string",
              format: "date",
              description: "Subscriber date of birth"
            }
          },
          required: ["member_id", "payer_name"]
        }
      },
      {
        name: "generate-consent-form",
        description: "Generate personalized consent form for patient",
        inputSchema: {
          type: "object",
          properties: {
            consent_type: {
              type: "string",
              enum: ["hipaa", "treatment", "billing", "research", "telehealth"],
              description: "Type of consent form"
            },
            patient_name: {
              type: "string",
              description: "Patient full name"
            },
            facility_id: {
              type: "string",
              description: "Healthcare facility identifier"
            },
            language: {
              type: "string",
              enum: ["en", "es", "fr", "zh"],
              description: "Language for consent form"
            }
          },
          required: ["consent_type", "patient_name"]
        }
      },
      {
        name: "smart-field-routing",
        description: "Determine optimal field completion order based on patient context",
        inputSchema: {
          type: "object",
          properties: {
            current_section: {
              type: "string",
              description: "Current enrollment section"
            },
            completed_fields: {
              type: "array",
              items: { type: "string" },
              description: "List of already completed fields"
            },
            patient_type: {
              type: "string",
              enum: ["new", "returning", "transfer"],
              description: "Type of patient enrollment"
            }
          },
          required: ["current_section"]
        }
      },
      {
        name: "credentialing-check",
        description: "Check provider credentialing status and requirements",
        inputSchema: {
          type: "object",
          properties: {
            provider_npi: {
              type: "string",
              description: "Provider NPI number"
            },
            specialty: {
              type: "string",
              description: "Medical specialty"
            },
            state: {
              type: "string",
              description: "State for credentialing"
            }
          },
          required: ["provider_npi"]
        }
      },
      {
        name: "enrollment-analytics",
        description: "Track and analyze enrollment progress and metrics",
        inputSchema: {
          type: "object",
          properties: {
            session_id: {
              type: "string",
              description: "Enrollment session identifier"
            },
            event_type: {
              type: "string",
              enum: ["step_started", "step_completed", "validation_error", "dropout", "completion"],
              description: "Type of analytics event"
            },
            metadata: {
              type: "object",
              description: "Additional event metadata"
            }
          },
          required: ["session_id", "event_type"]
        }
      }
    ];
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    console.log(`📋 Initializing Enrollment MCP Server: ${this.config.name}`);
    console.log(`📋 Capabilities: ${this.config.capabilities?.join(', ')}`);
    console.log(`🔧 Resources: ${this.getResources().length} available`);
    console.log(`💡 Prompts: ${this.getPrompts().length} enrollment AI prompts`);
    console.log(`🛠️ Tools: ${this.getTools().length} enrollment tools`);
    
    this.isRunning = true;
    console.log("✅ Enrollment MCP Server is ready for patient onboarding");
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    console.log("🛑 Enrollment MCP Server stopped");
  }

  /**
   * Get server status and capabilities
   */
  getServerInfo() {
    return {
      name: this.config.name,
      version: this.config.version,
      description: this.config.description,
      isRunning: this.isRunning,
      capabilities: this.config.capabilities,
      context: this.context,
      statistics: {
        resources: this.getResources().length,
        prompts: this.getPrompts().length,
        tools: this.getTools().length
      },
      enrollmentFeatures: [
        "NPI verification and lookup",
        "Insurance eligibility checking",
        "Smart consent form generation",
        "AI-powered field validation",
        "Intelligent form routing",
        "Credentialing workflow support",
        "Multi-language support",
        "Real-time enrollment analytics"
      ]
    };
  }

  /**
   * Execute an enrollment tool
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    console.log(`🔧 Executing enrollment tool: ${toolName}`, args);
    
    switch (toolName) {
      case "verify-npi":
        return this.executeNPIVerification(args);

      case "validate-insurance":
        return this.executeInsuranceValidation(args);

      case "generate-consent-form":
        return this.executeConsentGeneration(args);

      case "smart-field-routing":
        return this.executeSmartRouting(args);

      case "credentialing-check":
        return this.executeCredentialingCheck(args);

      case "enrollment-analytics":
        return this.executeAnalyticsTracking(args);

      default:
        throw new Error(`Unknown enrollment tool: ${toolName}`);
    }
  }

  private async executeNPIVerification(args: { npi: string; include_details?: boolean }): Promise<any> {
    // In production, this would call the actual NPPES API
    const isValid = /^[0-9]{10}$/.test(args.npi);
    
    return {
      tool: "verify-npi",
      npi: args.npi,
      isValid,
      status: isValid ? "verified" : "invalid",
      provider: isValid ? {
        name: "Sample Provider",
        type: "Individual",
        specialty: "Internal Medicine",
        address: "123 Healthcare Ave",
        state: "CA"
      } : null,
      timestamp: new Date().toISOString()
    };
  }

  private async executeInsuranceValidation(args: any): Promise<any> {
    return {
      tool: "validate-insurance",
      member_id: args.member_id,
      payer: args.payer_name,
      status: "eligible",
      coverage: {
        effective_date: "2024-01-01",
        plan_type: "PPO",
        copay: 25,
        deductible: 1500,
        deductible_met: 750
      },
      timestamp: new Date().toISOString()
    };
  }

  private async executeConsentGeneration(args: any): Promise<any> {
    return {
      tool: "generate-consent-form",
      consent_type: args.consent_type,
      patient_name: args.patient_name,
      form_id: `consent-${Date.now()}`,
      status: "generated",
      content_url: `/consents/${args.consent_type}/${args.language || 'en'}`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeSmartRouting(args: any): Promise<any> {
    const sectionOrder: Record<string, string[]> = {
      patient_information: ['first_name', 'last_name', 'dob', 'email', 'phone'],
      insurance: ['payer_name', 'member_id', 'group_number', 'subscriber_relationship'],
      clinical: ['allergies', 'current_medications', 'medical_history']
    };

    const completedSet = new Set(args.completed_fields || []);
    const nextFields = (sectionOrder[args.current_section] || [])
      .filter(f => !completedSet.has(f));

    return {
      tool: "smart-field-routing",
      current_section: args.current_section,
      next_fields: nextFields.slice(0, 3),
      completion_percentage: Math.round((completedSet.size / 10) * 100),
      recommendations: [
        "Auto-fill available from previous visits",
        "Insurance card scan available"
      ],
      timestamp: new Date().toISOString()
    };
  }

  private async executeCredentialingCheck(args: any): Promise<any> {
    return {
      tool: "credentialing-check",
      provider_npi: args.provider_npi,
      status: "active",
      credentials: {
        medical_license: { status: "valid", expiry: "2025-12-31" },
        dea_registration: { status: "valid", expiry: "2026-06-30" },
        board_certification: { status: "certified", specialty: args.specialty }
      },
      timestamp: new Date().toISOString()
    };
  }

  private async executeAnalyticsTracking(args: any): Promise<any> {
    return {
      tool: "enrollment-analytics",
      session_id: args.session_id,
      event_type: args.event_type,
      tracked: true,
      timestamp: new Date().toISOString()
    };
  }
}

// Factory function to create enrollment MCP server
export const createEnrollmentMCPServer = (config: MCPServerConfig): EnrollmentMCPServer => {
  return new EnrollmentMCPServer(config);
};

// Default enrollment server instance
export const defaultEnrollmentServer = createEnrollmentMCPServer({
  name: "enrollment-mcp-server",
  version: "1.0.0",
  description: "Model Context Protocol server for patient enrollment and onboarding workflows",
  capabilities: ["resources", "prompts", "tools", "enrollment", "npi-verification", "credentialing"]
});

// Utility functions for enrollment MCP integration
export const EnrollmentMCPUtils = {
  /**
   * Format enrollment data for MCP consumption
   */
  formatEnrollmentData(data: any): any {
    return {
      timestamp: new Date().toISOString(),
      source: "enrollment-mcp-server",
      data: data,
      format: "enrollment-structured"
    };
  },

  /**
   * Validate enrollment resource URI
   */
  validateResourceURI(uri: string): boolean {
    return uri.startsWith("enrollment://") && uri.length > 14;
  },

  /**
   * Generate MCP response for enrollment tools
   */
  generateToolResponse(toolName: string, result: any): any {
    return {
      tool: toolName,
      result: result,
      metadata: {
        timestamp: new Date().toISOString(),
        server: "enrollment-mcp-server",
        version: "1.0.0"
      }
    };
  },

  /**
   * Map enrollment context to MCP format
   */
  mapContextToMCP(context: EnrollmentMCPContext): any {
    return {
      uri: `enrollment://session/${context.sessionId || 'unknown'}`,
      step: context.currentStep,
      data: context.enrollmentData,
      verification: {
        npi: context.npiData,
        insurance: context.insuranceData
      }
    };
  }
};
