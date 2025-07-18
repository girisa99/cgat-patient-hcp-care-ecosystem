/**
 * Specialized MCP Servers for Biotech/Pharma/Life Sciences
 * Includes BioMCP, ADK, and other specialized healthcare servers
 */

import { HealthcareMCPServer, MCPServerConfig, MCPResource, MCPTool } from './healthcare-server';

// BioMCP Server Configuration
export interface BioMCPConfig extends MCPServerConfig {
  genomicsDataAccess: boolean;
  clinicalTrialIntegration: boolean;
  adverseEventMonitoring: boolean;
  regulatoryCompliance: 'FDA' | 'EMA' | 'PMDA' | 'ALL';
  therapyTypes: ('cell' | 'gene' | 'personalized' | 'radioland')[];
}

/**
 * BioMCP Server - Specialized for Biotech/Pharma workflows
 */
export class BioMCPServer extends HealthcareMCPServer {
  private bioConfig: BioMCPConfig;

  constructor(config: BioMCPConfig) {
    super(config);
    this.bioConfig = config;
  }

  getTools(): MCPTool[] {
    const tools = super.getTools();
    
    return [
      ...tools,
      {
        name: 'genomics_analysis',
        description: 'Analyze genomic data for personalized therapy recommendations',
        inputSchema: {
          type: 'object',
          properties: {
            patientId: { type: 'string' },
            genomicVariants: { type: 'array', items: { type: 'string' } },
            therapyType: { type: 'string', enum: ['cell', 'gene', 'personalized', 'radioland'] }
          },
          required: ['patientId', 'genomicVariants', 'therapyType']
        }
      },
      {
        name: 'clinical_trial_matching',
        description: 'Match patients to relevant clinical trials based on biomarkers and therapy type',
        inputSchema: {
          type: 'object',
          properties: {
            patientProfile: { type: 'object' },
            inclusion_criteria: { type: 'array', items: { type: 'string' } },
            therapy_modality: { type: 'string', enum: ['CAR-T', 'Gene Therapy', 'Personalized Medicine', 'Radioland'] }
          },
          required: ['patientProfile', 'therapy_modality']
        }
      },
      {
        name: 'adverse_event_prediction',
        description: 'Predict potential adverse events for specific therapy combinations',
        inputSchema: {
          type: 'object',
          properties: {
            patientData: { type: 'object' },
            proposedTherapy: { type: 'string' },
            riskFactors: { type: 'array', items: { type: 'string' } }
          },
          required: ['patientData', 'proposedTherapy']
        }
      },
      {
        name: 'regulatory_compliance_check',
        description: 'Verify regulatory compliance for biotech/pharma protocols',
        inputSchema: {
          type: 'object',
          properties: {
            protocol: { type: 'object' },
            regulatory_body: { type: 'string', enum: ['FDA', 'EMA', 'PMDA'] },
            therapy_type: { type: 'string' }
          },
          required: ['protocol', 'regulatory_body', 'therapy_type']
        }
      },
      {
        name: 'biomarker_analysis',
        description: 'Analyze biomarkers for therapy selection and monitoring',
        inputSchema: {
          type: 'object',
          properties: {
            biomarkers: { type: 'array', items: { type: 'object' } },
            therapy_context: { type: 'string' },
            predictive_markers: { type: 'array', items: { type: 'string' } }
          },
          required: ['biomarkers', 'therapy_context']
        }
      },
      {
        name: 'therapy_optimization',
        description: 'Optimize multi-modal therapy combinations for personalized treatment',
        inputSchema: {
          type: 'object',
          properties: {
            patient_profile: { type: 'object' },
            available_therapies: { type: 'array', items: { type: 'string' } },
            treatment_goals: { type: 'array', items: { type: 'string' } },
            contraindications: { type: 'array', items: { type: 'string' } }
          },
          required: ['patient_profile', 'available_therapies', 'treatment_goals']
        }
      }
    ];
  }

  getResources(): MCPResource[] {
    const resources = super.getResources();
    
    return [
      ...resources,
      {
        uri: 'biomcp://genomics/variants',
        name: 'Genomic Variants Database',
        description: 'Access to genomic variant databases for therapy selection',
        mimeType: 'application/json'
      },
      {
        uri: 'biomcp://trials/matching',
        name: 'Clinical Trial Matching Engine',
        description: 'Advanced matching algorithms for clinical trial enrollment',
        mimeType: 'application/json'
      },
      {
        uri: 'biomcp://adverse-events/prediction',
        name: 'Adverse Event Prediction Models',
        description: 'AI models for predicting therapy-related adverse events',
        mimeType: 'application/json'
      },
      {
        uri: 'biomcp://regulatory/compliance',
        name: 'Regulatory Compliance Framework',
        description: 'Real-time regulatory compliance checking for multiple jurisdictions',
        mimeType: 'application/json'
      },
      {
        uri: 'biomcp://biomarkers/analysis',
        name: 'Biomarker Analysis Pipeline',
        description: 'Comprehensive biomarker analysis for personalized therapy',
        mimeType: 'application/json'
      }
    ];
  }

  async start(): Promise<void> {
    console.log(`🧬 Initializing BioMCP Server: ${this.bioConfig.name}`);
    console.log(`📊 Therapy Types: ${this.bioConfig.therapyTypes.join(', ')}`);
    console.log(`🏛️ Regulatory Compliance: ${this.bioConfig.regulatoryCompliance}`);
    
    await super.start();
    
    // Initialize specialized biotech/pharma capabilities
    if (this.bioConfig.genomicsDataAccess) {
      console.log("🧪 Genomics data access enabled");
    }
    
    if (this.bioConfig.clinicalTrialIntegration) {
      console.log("📋 Clinical trial integration enabled");
    }
    
    if (this.bioConfig.adverseEventMonitoring) {
      console.log("⚠️ Adverse event monitoring enabled");
    }
    
    console.log("✅ BioMCP Server ready for biotech/pharma AI interactions");
  }
}

/**
 * Agent Development Kit (ADK) MCP Server
 */
export class ADKServer extends HealthcareMCPServer {
  getTools(): MCPTool[] {
    return [
      {
        name: 'agent_scaffold_generator',
        description: 'Generate agent scaffolding for healthcare AI applications',
        inputSchema: {
          type: 'object',
          properties: {
            agentType: { type: 'string', enum: ['conversational', 'analytical', 'predictive', 'diagnostic'] },
            specialty: { type: 'string' },
            capabilities: { type: 'array', items: { type: 'string' } }
          },
          required: ['agentType', 'specialty']
        }
      },
      {
        name: 'workflow_orchestrator',
        description: 'Orchestrate complex multi-modal therapy workflows',
        inputSchema: {
          type: 'object',
          properties: {
            workflow_type: { type: 'string' },
            therapy_modalities: { type: 'array', items: { type: 'string' } },
            decision_points: { type: 'array', items: { type: 'object' } }
          },
          required: ['workflow_type', 'therapy_modalities']
        }
      },
      {
        name: 'speech_to_text_processor',
        description: 'Process speech input for medical conversations with specialized medical vocabulary',
        inputSchema: {
          type: 'object',
          properties: {
            audio_data: { type: 'string' },
            medical_context: { type: 'string' },
            language: { type: 'string', default: 'en' },
            specialty_terms: { type: 'array', items: { type: 'string' } }
          },
          required: ['audio_data', 'medical_context']
        }
      },
      {
        name: 'text_to_speech_generator',
        description: 'Generate speech output for patient communications and adverse event alerts',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            voice_profile: { type: 'string', enum: ['professional', 'empathetic', 'urgent', 'educational'] },
            medical_terms: { type: 'array', items: { type: 'string' } },
            patient_context: { type: 'object' }
          },
          required: ['text', 'voice_profile']
        }
      },
      {
        name: 'conversation_manager',
        description: 'Manage healthcare conversations with context awareness and adverse event detection',
        inputSchema: {
          type: 'object',
          properties: {
            conversation_id: { type: 'string' },
            patient_id: { type: 'string' },
            conversation_type: { type: 'string', enum: ['intake', 'follow-up', 'adverse-event', 'emergency'] },
            context_data: { type: 'object' }
          },
          required: ['conversation_id', 'conversation_type']
        }
      }
    ];
  }
}

/**
 * MCP Toolbox for Databases - Specialized for Healthcare Databases
 */
export class HealthcareDatabaseMCPServer extends HealthcareMCPServer {
  getTools(): MCPTool[] {
    return [
      {
        name: 'patient_data_query',
        description: 'Query patient databases with HIPAA compliance',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            patient_id: { type: 'string' },
            access_level: { type: 'string', enum: ['basic', 'full', 'emergency'] },
            audit_trail: { type: 'boolean', default: true }
          },
          required: ['query', 'access_level']
        }
      },
      {
        name: 'clinical_trial_database',
        description: 'Access clinical trial databases for biotech/pharma research',
        inputSchema: {
          type: 'object',
          properties: {
            trial_phase: { type: 'string', enum: ['I', 'II', 'III', 'IV'] },
            therapy_type: { type: 'string' },
            indication: { type: 'string' },
            enrollment_status: { type: 'string' }
          },
          required: ['trial_phase', 'therapy_type']
        }
      },
      {
        name: 'adverse_event_database',
        description: 'Query adverse event databases for safety monitoring',
        inputSchema: {
          type: 'object',
          properties: {
            product_name: { type: 'string' },
            event_type: { type: 'string' },
            severity: { type: 'string', enum: ['mild', 'moderate', 'severe', 'life-threatening'] },
            date_range: { type: 'object' }
          },
          required: ['product_name']
        }
      },
      {
        name: 'genomics_database_query',
        description: 'Query genomics databases for personalized therapy selection',
        inputSchema: {
          type: 'object',
          properties: {
            gene_variants: { type: 'array', items: { type: 'string' } },
            population: { type: 'string' },
            therapy_context: { type: 'string' }
          },
          required: ['gene_variants']
        }
      }
    ];
  }
}

// Factory functions for creating specialized servers
export const createBioMCPServer = (config: BioMCPConfig): BioMCPServer => {
  return new BioMCPServer(config);
};

export const createADKServer = (config: MCPServerConfig): ADKServer => {
  return new ADKServer(config);
};

export const createHealthcareDatabaseMCPServer = (config: MCPServerConfig): HealthcareDatabaseMCPServer => {
  return new HealthcareDatabaseMCPServer(config);
};

// Default server configurations
export const defaultBioMCPServer = createBioMCPServer({
  name: "biomcp-biotech-pharma-server",
  version: "1.0.0",
  description: "Specialized MCP server for biotech and pharma workflows including cell, gene, personalized, and radioland therapies",
  capabilities: ['resources', 'tools', 'prompts', 'logging'],
  genomicsDataAccess: true,
  clinicalTrialIntegration: true,
  adverseEventMonitoring: true,
  regulatoryCompliance: 'ALL',
  therapyTypes: ['cell', 'gene', 'personalized', 'radioland']
});

export const defaultADKServer = createADKServer({
  name: "adk-healthcare-agent-server",
  version: "1.0.0", 
  description: "Agent Development Kit for healthcare AI with speech capabilities and adverse event monitoring",
  capabilities: ['resources', 'tools', 'prompts', 'logging']
});

export const defaultHealthcareDatabaseServer = createHealthcareDatabaseMCPServer({
  name: "healthcare-database-mcp-server",
  version: "1.0.0",
  description: "MCP Toolbox for healthcare databases with HIPAA compliance and audit trails",
  capabilities: ['resources', 'tools', 'prompts', 'logging']
});