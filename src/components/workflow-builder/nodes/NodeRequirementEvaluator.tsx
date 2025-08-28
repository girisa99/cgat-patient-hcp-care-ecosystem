import { Node } from '@xyflow/react';

export interface NodeRequirement {
  id: string;
  type: 'required' | 'optional' | 'conditional';
  category: 'credentials' | 'input_schema' | 'functions' | 'variables' | 'advanced' | 'flow_state' | 'javascript' | 'scenarios';
  field: string;
  label: string;
  description: string;
  dependsOn?: string[];
  defaultValue?: any;
  validation?: (value: any) => boolean;
}

export interface NodeEvaluation {
  isValid: boolean;
  missingRequired: string[];
  suggestions: string[];
  completeness: number; // 0-100%
  requirements: NodeRequirement[];
}

export const NodeRequirementEvaluator = {
  // Company logos mapping for AI models
  getProviderLogo: (provider: string): string => {
    const logoMap: Record<string, string> = {
      'OpenAI': '/logos/openai.svg',
      'Anthropic': '/logos/anthropic.svg',
      'Google': '/logos/google.svg',
      'Meta': '/logos/meta.svg',
      'Microsoft': '/logos/microsoft.svg',
      'AWS': '/logos/aws.svg',
      'Azure': '/logos/azure.svg',
      'Cohere': '/logos/cohere.svg',
      'HuggingFace': '/logos/huggingface.svg',
      'Mistral': '/logos/mistral.svg',
      'Fireworks': '/logos/fireworks.svg',
      'Cerebras': '/logos/cerebras.svg',
      'IBM': '/logos/ibm.svg',
      'Baidu': '/logos/baidu.svg',
      'Alibaba': '/logos/alibaba.svg',
      'Heartex': '/logos/heartex.svg'
    };
    const key = Object.keys(logoMap).find(k => k.toLowerCase() === String(provider).toLowerCase());
    return key ? logoMap[key] : '/logos/default-ai.svg';
  },

  // Dynamically generate requirements based on node capabilities and data
  getNodeRequirements: (nodeType: string, nodeData: any): NodeRequirement[] => {
    // First check for dynamic capabilities from node data
    const capabilities = nodeData?.capabilities || [];
    const dynamicRequirements: NodeRequirement[] = [];
    
    // Generate requirements based on node capabilities
    if (capabilities.includes('credentials') || nodeData?.api_key !== undefined || nodeData?.auth_token !== undefined) {
      dynamicRequirements.push({
        id: 'api_key',
        type: 'required',
        category: 'credentials',
        field: 'api_key',
        label: 'API Key',
        description: 'Authentication key for this service'
      });
    }
    
    if (capabilities.includes('flow_state') || nodeData?.state_variables !== undefined) {
      dynamicRequirements.push({
        id: 'state_variables',
        type: 'optional',
        category: 'flow_state',
        field: 'state_variables',
        label: 'State Variables',
        description: 'Variables to track across workflow execution'
      });
    }
    
    if (capabilities.includes('javascript') || nodeData?.custom_code !== undefined) {
      dynamicRequirements.push({
        id: 'custom_code',
        type: 'optional',
        category: 'javascript',
        field: 'custom_code',
        label: 'Custom JavaScript',
        description: 'Custom JavaScript code for this node'
      });
    }
    
    if (capabilities.includes('scenarios') || nodeData?.test_scenarios !== undefined) {
      dynamicRequirements.push({
        id: 'test_scenarios',
        type: 'optional',
        category: 'scenarios',
        field: 'test_scenarios',
        label: 'Test Scenarios',
        description: 'Test scenarios and expected outcomes'
      });
    }
    
    // If we have dynamic requirements, use them plus any from the base definitions
    if (dynamicRequirements.length > 0) {
      const baseReqs = NodeRequirementEvaluator.getBaseNodeRequirements(nodeType, nodeData);
      return [...baseReqs, ...dynamicRequirements];
    }
    
    // Fallback to base requirements
    return NodeRequirementEvaluator.getBaseNodeRequirements(nodeType, nodeData);
  },

  // Define node-specific base requirements
  getBaseNodeRequirements: (nodeType: string, nodeData: any): NodeRequirement[] => {
    const baseRequirements: Record<string, NodeRequirement[]> = {
      // AI Model Nodes
      'openai_chat': [
        {
          id: 'api_key',
          type: 'required',
          category: 'credentials',
          field: 'api_key',
          label: 'OpenAI API Key',
          description: 'Your OpenAI API key for authentication'
        },
        {
          id: 'model',
          type: 'required',
          category: 'input_schema',
          field: 'model',
          label: 'Model Selection',
          description: 'Choose the OpenAI model to use',
          defaultValue: 'gpt-4o-mini'
        },
        {
          id: 'temperature',
          type: 'optional',
          category: 'advanced',
          field: 'temperature',
          label: 'Temperature',
          description: 'Controls randomness (0-2)',
          defaultValue: 0.7
        },
        {
          id: 'max_tokens',
          type: 'optional',
          category: 'advanced',
          field: 'max_tokens',
          label: 'Max Tokens',
          description: 'Maximum response length',
          defaultValue: 1000
        }
      ],

      'anthropic_chat': [
        {
          id: 'api_key',
          type: 'required',
          category: 'credentials',
          field: 'api_key',
          label: 'Anthropic API Key',
          description: 'Your Anthropic API key for Claude models'
        },
        {
          id: 'model',
          type: 'required',
          category: 'input_schema',
          field: 'model',
          label: 'Claude Model',
          description: 'Choose the Claude model version',
          defaultValue: 'claude-3-5-sonnet-20241022'
        },
        {
          id: 'temperature',
          type: 'optional',
          category: 'advanced',
          field: 'temperature',
          label: 'Temperature',
          description: 'Controls randomness (0-1 for Claude)',
          defaultValue: 0.7
        },
        {
          id: 'top_p',
          type: 'optional',
          category: 'advanced',
          field: 'top_p',
          label: 'Top P',
          description: 'Controls nucleus sampling probability (0-1)',
          defaultValue: 0.9
        },
        {
          id: 'max_tokens',
          type: 'optional',
          category: 'advanced',
          field: 'max_tokens',
          label: 'Max Tokens',
          description: 'Maximum response length',
          defaultValue: 1000
        }
      ],

      // Meta AI Models
      'llama_chat': [
        {
          id: 'api_key',
          type: 'required',
          category: 'credentials',
          field: 'api_key',
          label: 'Meta API Key',
          description: 'Your Meta API key for Llama models'
        },
        {
          id: 'model',
          type: 'required',
          category: 'input_schema',
          field: 'model',
          label: 'Llama Model',
          description: 'Choose the Llama model version',
          defaultValue: 'llama-3.1-8b-instruct'
        },
        {
          id: 'temperature',
          type: 'optional',
          category: 'advanced',
          field: 'temperature',
          label: 'Temperature',
          description: 'Controls randomness (0-2)',
          defaultValue: 0.7
        },
        {
          id: 'top_p',
          type: 'optional',
          category: 'advanced',
          field: 'top_p',
          label: 'Top P',
          description: 'Controls nucleus sampling probability (0-1)',
          defaultValue: 0.9
        },
        {
          id: 'max_tokens',
          type: 'optional',
          category: 'advanced',
          field: 'max_tokens',
          label: 'Max Tokens',
          description: 'Maximum response length',
          defaultValue: 1000
        }
      ],

      // Google AI Models
      'google_gemini': [
        {
          id: 'api_key',
          type: 'required',
          category: 'credentials',
          field: 'api_key',
          label: 'Google AI API Key',
          description: 'Your Google AI API key for Gemini models'
        },
        {
          id: 'model',
          type: 'required',
          category: 'input_schema',
          field: 'model',
          label: 'Gemini Model',
          description: 'Choose the Gemini model version',
          defaultValue: 'gemini-1.5-pro'
        },
        {
          id: 'temperature',
          type: 'optional',
          category: 'advanced',
          field: 'temperature',
          label: 'Temperature',
          description: 'Controls creativity (0-2)',
          defaultValue: 0.9
        }
      ],

      // Microsoft AI Models
      'azure_openai': [
        {
          id: 'api_key',
          type: 'required',
          category: 'credentials',
          field: 'api_key',
          label: 'Azure OpenAI API Key',
          description: 'Your Azure OpenAI API key'
        },
        {
          id: 'endpoint',
          type: 'required',
          category: 'credentials',
          field: 'endpoint',
          label: 'Azure Endpoint',
          description: 'Your Azure OpenAI endpoint URL'
        },
        {
          id: 'deployment_name',
          type: 'required',
          category: 'input_schema',
          field: 'deployment_name',
          label: 'Deployment Name',
          description: 'Azure deployment name for your model'
        },
        {
          id: 'temperature',
          type: 'optional',
          category: 'advanced',
          field: 'temperature',
          label: 'Temperature',
          description: 'Controls randomness (0-2)',
          defaultValue: 0.7
        },
        {
          id: 'max_tokens',
          type: 'optional',
          category: 'advanced',
          field: 'max_tokens',
          label: 'Max Tokens',
          description: 'Maximum response length',
          defaultValue: 1000
        }
      ],

      // Cohere AI Models
      'cohere_chat': [
        {
          id: 'api_key',
          type: 'required',
          category: 'credentials',
          field: 'api_key',
          label: 'Cohere API Key',
          description: 'Your Cohere API key'
        },
        {
          id: 'model',
          type: 'required',
          category: 'input_schema',
          field: 'model',
          label: 'Cohere Model',
          description: 'Choose the Cohere model',
          defaultValue: 'command-r-plus'
        },
        {
          id: 'temperature',
          type: 'optional',
          category: 'advanced',
          field: 'temperature',
          label: 'Temperature',
          description: 'Controls randomness (0-2)',
          defaultValue: 0.7
        },
        {
          id: 'max_tokens',
          type: 'optional',
          category: 'advanced',
          field: 'max_tokens',
          label: 'Max Tokens',
          description: 'Maximum response length',
          defaultValue: 1000
        }
      ],

      // Mistral AI Models
      'mistral_chat': [
        {
          id: 'api_key',
          type: 'required',
          category: 'credentials',
          field: 'api_key',
          label: 'Mistral API Key',
          description: 'Your Mistral API key'
        },
        {
          id: 'model',
          type: 'required',
          category: 'input_schema',
          field: 'model',
          label: 'Mistral Model',
          description: 'Choose the Mistral model',
          defaultValue: 'mistral-large-latest'
        },
        {
          id: 'temperature',
          type: 'optional',
          category: 'advanced',
          field: 'temperature',
          label: 'Temperature',
          description: 'Controls randomness (0-2)',
          defaultValue: 0.7
        },
        {
          id: 'top_p',
          type: 'optional',
          category: 'advanced',
          field: 'top_p',
          label: 'Top P',
          description: 'Controls nucleus sampling probability (0-1)',
          defaultValue: 0.9
        },
        {
          id: 'max_tokens',
          type: 'optional',
          category: 'advanced',
          field: 'max_tokens',
          label: 'Max Tokens',
          description: 'Maximum response length',
          defaultValue: 1000
        }
      ],

      // Generic AI Model (catches any AI model node)
      'ai_model': [
        {
          id: 'api_key',
          type: 'required',
          category: 'credentials',
          field: 'api_key',
          label: 'API Key',
          description: 'API key for this AI service'
        },
        {
          id: 'model',
          type: 'required',
          category: 'input_schema',
          field: 'model',
          label: 'Model Name',
          description: 'Specific model to use'
        },
        {
          id: 'temperature',
          type: 'optional',
          category: 'advanced',
          field: 'temperature',
          label: 'Temperature',
          description: 'Controls randomness (0-2)',
          defaultValue: 0.7
        },
        {
          id: 'top_p',
          type: 'optional',
          category: 'advanced',
          field: 'top_p',
          label: 'Top P',
          description: 'Controls nucleus sampling probability (0-1)',
          defaultValue: 0.9
        },
        {
          id: 'max_tokens',
          type: 'optional',
          category: 'advanced',
          field: 'max_tokens',
          label: 'Max Tokens',
          description: 'Maximum response length',
          defaultValue: 1000
        }
      ],

      // API Service Nodes
      'api_request': [
        {
          id: 'url',
          type: 'required',
          category: 'input_schema',
          field: 'url',
          label: 'API Endpoint',
          description: 'The API endpoint URL'
        },
        {
          id: 'method',
          type: 'required',
          category: 'input_schema',
          field: 'method',
          label: 'HTTP Method',
          description: 'GET, POST, PUT, DELETE, etc.',
          defaultValue: 'GET'
        },
        {
          id: 'headers',
          type: 'optional',
          category: 'advanced',
          field: 'headers',
          label: 'Headers',
          description: 'Custom HTTP headers'
        },
        {
          id: 'auth_token',
          type: 'conditional',
          category: 'credentials',
          field: 'auth_token',
          label: 'Authorization Token',
          description: 'Bearer token for authenticated requests',
          dependsOn: ['requires_auth']
        }
      ],

      // Data Processing Nodes
      'json_parser': [
        {
          id: 'input_data',
          type: 'required',
          category: 'input_schema',
          field: 'input_data',
          label: 'Input Data',
          description: 'JSON data to parse'
        },
        {
          id: 'schema',
          type: 'optional',
          category: 'input_schema',
          field: 'schema',
          label: 'JSON Schema',
          description: 'Schema for validation'
        }
      ],

      // Communication Nodes
      'webhook': [
        {
          id: 'webhook_url',
          type: 'required',
          category: 'input_schema',
          field: 'webhook_url',
          label: 'Webhook URL',
          description: 'Destination webhook endpoint'
        },
        {
          id: 'secret',
          type: 'optional',
          category: 'credentials',
          field: 'secret',
          label: 'Webhook Secret',
          description: 'Secret for webhook verification'
        }
      ],

      // Function Nodes
      'javascript_function': [
        {
          id: 'function_code',
          type: 'required',
          category: 'functions',
          field: 'function_code',
          label: 'Function Code',
          description: 'JavaScript function implementation'
        },
        {
          id: 'input_variables',
          type: 'optional',
          category: 'variables',
          field: 'input_variables',
          label: 'Input Variables',
          description: 'Variables passed to the function'
        }
      ],

      // Prompt/Template Nodes (customized per type)
      'prompt_template_system_prompt': [
        { id: 'template_content', type: 'required', category: 'input_schema', field: 'template_content', label: 'System Prompt', description: 'Core system instructions and behavior guidelines' },
        { id: 'role', type: 'optional', category: 'variables', field: 'role', label: 'Role', description: 'Agent role definition' },
        { id: 'personality', type: 'optional', category: 'variables', field: 'personality', label: 'Personality', description: 'Personality traits' },
        { id: 'constraints', type: 'optional', category: 'variables', field: 'constraints', label: 'Constraints', description: 'Behavior constraints list' },
        { id: 'validation_enabled', type: 'optional', category: 'advanced', field: 'validation_enabled', label: 'Validation', description: 'Enable template validation', defaultValue: true }
      ],
      'prompt_template_few_shot': [
        { id: 'examples', type: 'required', category: 'input_schema', field: 'examples', label: 'Examples', description: 'Few-shot examples with input/output pairs' },
        { id: 'format_specification', type: 'optional', category: 'input_schema', field: 'format_specification', label: 'Format Spec', description: 'Desired output format' },
        { id: 'optimization_enabled', type: 'optional', category: 'advanced', field: 'optimization_enabled', label: 'Optimization', description: 'Suggest prompt improvements', defaultValue: true }
      ],
      'prompt_template_instruction': [
        { id: 'steps', type: 'required', category: 'input_schema', field: 'steps', label: 'Steps', description: 'Step-by-step task instructions' },
        { id: 'prerequisites', type: 'optional', category: 'input_schema', field: 'prerequisites', label: 'Prerequisites', description: 'Required pre-conditions' },
        { id: 'expected_outcome', type: 'optional', category: 'input_schema', field: 'expected_outcome', label: 'Expected Outcome', description: 'What the process should produce' }
      ],
      'prompt_template_conversation': [
        { id: 'greeting', type: 'required', category: 'input_schema', field: 'greeting', label: 'Greeting', description: 'Opening message' },
        { id: 'escalation_paths', type: 'optional', category: 'input_schema', field: 'escalation_paths', label: 'Escalation Paths', description: 'When/how to escalate' },
        { id: 'closing_phrases', type: 'optional', category: 'input_schema', field: 'closing_phrases', label: 'Closing Phrases', description: 'End-of-conversation phrases' }
      ],
      'prompt_template_analysis': [
        { id: 'criteria', type: 'required', category: 'input_schema', field: 'criteria', label: 'Criteria', description: 'Evaluation criteria list' },
        { id: 'scoring_scale', type: 'optional', category: 'input_schema', field: 'scoring_scale', label: 'Scoring Scale', description: 'Scoring system' },
        { id: 'output_format', type: 'optional', category: 'input_schema', field: 'output_format', label: 'Output Format', description: 'Desired analysis output format' }
      ],
      'prompt_template_creative': [
        { id: 'style_guidelines', type: 'required', category: 'input_schema', field: 'style_guidelines', label: 'Style Guidelines', description: 'Creative style and constraints' },
        { id: 'tone', type: 'optional', category: 'variables', field: 'tone', label: 'Tone', description: 'Tone of voice' },
        { id: 'target_audience', type: 'optional', category: 'variables', field: 'target_audience', label: 'Target Audience', description: 'Intended audience' }
      ],
      'agent_template': [
        { id: 'agent_name', type: 'required', category: 'input_schema', field: 'agent_name', label: 'Agent Name', description: 'Name for the new agent' },
        { id: 'customizations', type: 'optional', category: 'variables', field: 'customizations', label: 'Customizations', description: 'Template override values' }
      ],

      // Automation & Workflow nodes
      'condition': [
        { id: 'condition_expression', type: 'required', category: 'javascript', field: 'condition_expression', label: 'Condition (JS)', description: 'JavaScript expression that returns true/false' },
        { id: 'on_true', type: 'optional', category: 'variables', field: 'on_true', label: 'On True Path', description: 'Optional label for the true path' }
      ],
      'decision': [
        { id: 'rules', type: 'required', category: 'input_schema', field: 'rules', label: 'Decision Rules', description: 'Array of rules with conditions and outcomes' }
      ],
      'loop': [
        { id: 'max_iterations', type: 'required', category: 'advanced', field: 'max_iterations', label: 'Max Iterations', description: 'Upper bound to prevent infinite loops', defaultValue: 10 },
        { id: 'until_expression', type: 'optional', category: 'javascript', field: 'until_expression', label: 'Until (JS)', description: 'Stop when this JavaScript expression evaluates to true' }
      ],
      'iteration': [
        { id: 'items_path', type: 'required', category: 'input_schema', field: 'items_path', label: 'Items Path', description: 'Path to array in flow state to iterate' }
      ],
      'approval_workflow': [
        { id: 'approver_roles', type: 'required', category: 'input_schema', field: 'approver_roles', label: 'Approver Roles', description: 'Comma-separated list of roles that can approve' },
        { id: 'instructions', type: 'optional', category: 'variables', field: 'instructions', label: 'Instructions', description: 'Guidance shown to approvers' },
        { id: 'sla_minutes', type: 'optional', category: 'advanced', field: 'sla_minutes', label: 'SLA (minutes)', description: 'Escalate if not approved in time', defaultValue: 30 },
        { id: 'escalation_policy', type: 'optional', category: 'advanced', field: 'escalation_policy', label: 'Escalation Policy', description: 'JSON policy for escalations' }
      ],
      'human_input': [
        { id: 'instructions', type: 'required', category: 'input_schema', field: 'instructions', label: 'Instructions', description: 'What the human should do' },
        { id: 'fields', type: 'optional', category: 'input_schema', field: 'fields', label: 'Fields Schema', description: 'Schema for inputs to collect' },
        { id: 'deadline_minutes', type: 'optional', category: 'advanced', field: 'deadline_minutes', label: 'Deadline (minutes)', description: 'Optional timeout for manual step' }
      ],
      'start': [ ],

      // Data & Integration nodes
      'http': [
        { id: 'url', type: 'required', category: 'input_schema', field: 'url', label: 'API Endpoint', description: 'The API endpoint URL' },
        { id: 'method', type: 'required', category: 'input_schema', field: 'method', label: 'HTTP Method', description: 'GET, POST, PUT, DELETE, etc.', defaultValue: 'GET' },
        { id: 'headers', type: 'optional', category: 'advanced', field: 'headers', label: 'Headers', description: 'Custom HTTP headers' },
        { id: 'query_params', type: 'optional', category: 'input_schema', field: 'query_params', label: 'Query Params', description: 'Key-value query parameters' },
        { id: 'body', type: 'optional', category: 'input_schema', field: 'body', label: 'Request Body', description: 'Body payload for POST/PUT/PATCH' },
        { id: 'auth_token', type: 'conditional', category: 'credentials', field: 'auth_token', label: 'Authorization Token', description: 'Bearer token for authenticated requests', dependsOn: ['requires_auth'] }
      ],
      'database': [
        { id: 'database_type', type: 'required', category: 'input_schema', field: 'database_type', label: 'Database Type', description: 'postgres, mysql, mssql, etc.' },
        { id: 'connection_string', type: 'required', category: 'credentials', field: 'connection_string', label: 'Connection String', description: 'Database DSN or URL' },
        { id: 'connection_pool_size', type: 'optional', category: 'advanced', field: 'connection_pool_size', label: 'Pool Size', description: 'Max connections in pool', defaultValue: 10 },
        { id: 'timeout_seconds', type: 'optional', category: 'advanced', field: 'timeout_seconds', label: 'Timeout (s)', description: 'Query timeout in seconds', defaultValue: 30 },
        { id: 'ssl_enabled', type: 'optional', category: 'advanced', field: 'ssl_enabled', label: 'SSL Enabled', description: 'Enable SSL/TLS for connection', defaultValue: true },
        { id: 'encryption_at_rest', type: 'optional', category: 'advanced', field: 'encryption_at_rest', label: 'Encryption at Rest', description: 'Encrypt stored data', defaultValue: true }
      ],
      'vector_store': [
        { id: 'store_type', type: 'required', category: 'input_schema', field: 'store_type', label: 'Store Type', description: 'pinecone, pgvector, chroma, etc.' },
        { id: 'dimensions', type: 'required', category: 'input_schema', field: 'dimensions', label: 'Dimensions', description: 'Embedding vector dimensions' },
        { id: 'distance_metric', type: 'optional', category: 'advanced', field: 'distance_metric', label: 'Distance Metric', description: 'cosine, euclidean, dot', defaultValue: 'cosine' },
        { id: 'index_type', type: 'optional', category: 'advanced', field: 'index_type', label: 'Index Type', description: 'HNSW, IVF, Flat', defaultValue: 'HNSW' },
        { id: 'embedding_model', type: 'required', category: 'input_schema', field: 'embedding_model', label: 'Embedding Model', description: 'Model used for embeddings' },
        { id: 'collection_name', type: 'required', category: 'input_schema', field: 'collection_name', label: 'Collection Name', description: 'Namespace/collection to use' }
      ],

      // Human Oversight nodes
      'healthcare_compliance': [
        { id: 'compliance_level', type: 'required', category: 'input_schema', field: 'compliance_level', label: 'Compliance Level', description: 'low, medium, high' },
        { id: 'hipaa_enabled', type: 'optional', category: 'advanced', field: 'hipaa_enabled', label: 'HIPAA Enabled', description: 'Enable HIPAA mode', defaultValue: true },
        { id: 'phi_encryption', type: 'optional', category: 'advanced', field: 'phi_encryption', label: 'PHI Encryption', description: 'Encrypt protected health information', defaultValue: true },
        { id: 'audit_logging', type: 'optional', category: 'advanced', field: 'audit_logging', label: 'Audit Logging', description: 'Enable audit trails', defaultValue: true },
        { id: 'access_controls', type: 'optional', category: 'advanced', field: 'access_controls', label: 'Access Controls', description: 'Role-based controls', defaultValue: true },
        { id: 'data_retention_days', type: 'optional', category: 'advanced', field: 'data_retention_days', label: 'Data Retention (days)', description: 'Retention policy in days', defaultValue: 30 }
      ],
      'human_oversight': [
        { id: 'reviewer_group', type: 'required', category: 'input_schema', field: 'reviewer_group', label: 'Reviewer Group', description: 'Group or team handling reviews' },
        { id: 'approval_required', type: 'optional', category: 'advanced', field: 'approval_required', label: 'Approval Required', description: 'Require explicit approval', defaultValue: true }
      ],

      // Development & Testing nodes
      'flow_tester': [
        { id: 'test_type', type: 'required', category: 'input_schema', field: 'test_type', label: 'Test Type', description: 'unit, integration, e2e' },
        { id: 'test_scenarios', type: 'optional', category: 'scenarios', field: 'test_scenarios', label: 'Test Scenarios', description: 'Scenario list and expected outcomes' },
        { id: 'assertions', type: 'optional', category: 'input_schema', field: 'assertions', label: 'Assertions', description: 'Assertions to validate results' },
        { id: 'timeout_seconds', type: 'optional', category: 'advanced', field: 'timeout_seconds', label: 'Timeout (s)', description: 'Per test timeout', defaultValue: 60 },
        { id: 'parallel_execution', type: 'optional', category: 'advanced', field: 'parallel_execution', label: 'Parallel Execution', description: 'Run tests in parallel', defaultValue: true },
        { id: 'success_criteria', type: 'optional', category: 'input_schema', field: 'success_criteria', label: 'Success Criteria', description: 'Pass/fail thresholds' }
      ],
      'response_validator': [
        { id: 'assertions', type: 'required', category: 'input_schema', field: 'assertions', label: 'Assertions', description: 'Rules to validate responses' },
        { id: 'test_scenarios', type: 'optional', category: 'scenarios', field: 'test_scenarios', label: 'Test Scenarios', description: 'Scenario list and expected outcomes' }
      ],
      'load_tester': [
        { id: 'concurrency', type: 'required', category: 'input_schema', field: 'concurrency', label: 'Concurrency', description: 'Number of parallel requests' },
        { id: 'duration_seconds', type: 'required', category: 'input_schema', field: 'duration_seconds', label: 'Duration (s)', description: 'How long to run the test' },
        { id: 'target_url', type: 'required', category: 'input_schema', field: 'target_url', label: 'Target URL', description: 'Target endpoint to test' }
      ],
      'debug_console': [
        { id: 'log_level', type: 'optional', category: 'advanced', field: 'log_level', label: 'Log Level', description: 'debug, info, warn, error', defaultValue: 'info' },
        { id: 'capture_variables', type: 'optional', category: 'variables', field: 'capture_variables', label: 'Capture Variables', description: 'Comma-separated variable keys' }
      ],

      // Voice nodes
      'voice': [
        { id: 'provider', type: 'required', category: 'input_schema', field: 'provider', label: 'Voice Provider', description: 'e.g., ElevenLabs, Azure TTS, Google TTS' },
        { id: 'voice', type: 'required', category: 'input_schema', field: 'voice', label: 'Voice', description: 'Voice name or ID' },
        { id: 'language', type: 'optional', category: 'input_schema', field: 'language', label: 'Language', description: 'Language code (e.g., en-US)', defaultValue: 'en-US' },
        { id: 'speed', type: 'optional', category: 'advanced', field: 'speed', label: 'Speed', description: 'Speech speed', defaultValue: 1.0 },
        { id: 'pitch', type: 'optional', category: 'advanced', field: 'pitch', label: 'Pitch', description: 'Speech pitch', defaultValue: 0 }
      ],

      // Deployment nodes
      'docker_container': [
        { id: 'environment', type: 'required', category: 'input_schema', field: 'environment', label: 'Environment', description: 'dev, test, staging, prod' },
        { id: 'cloud_provider', type: 'optional', category: 'input_schema', field: 'cloud_provider', label: 'Cloud Provider', description: 'aws, gcp, azure' },
        { id: 'region', type: 'optional', category: 'input_schema', field: 'region', label: 'Region', description: 'Deployment region' },
        { id: 'deployment_strategy', type: 'optional', category: 'advanced', field: 'deployment_strategy', label: 'Strategy', description: 'rolling, blue-green, canary', defaultValue: 'rolling' },
        { id: 'scaling_policy', type: 'optional', category: 'advanced', field: 'scaling_policy', label: 'Scaling Policy', description: 'Auto-scaling rules' },
        { id: 'health_check_enabled', type: 'optional', category: 'advanced', field: 'health_check_enabled', label: 'Health Checks', description: 'Enable health checks', defaultValue: true },
        { id: 'rollback_on_failure', type: 'optional', category: 'advanced', field: 'rollback_on_failure', label: 'Rollback on Failure', description: 'Auto-rollback', defaultValue: true }
      ],
      'kubernetes_pod': [
        { id: 'environment', type: 'required', category: 'input_schema', field: 'environment', label: 'Environment', description: 'dev, test, staging, prod' },
        { id: 'cloud_provider', type: 'optional', category: 'input_schema', field: 'cloud_provider', label: 'Cloud Provider', description: 'aws, gcp, azure' },
        { id: 'region', type: 'optional', category: 'input_schema', field: 'region', label: 'Region', description: 'Deployment region' },
        { id: 'deployment_strategy', type: 'optional', category: 'advanced', field: 'deployment_strategy', label: 'Strategy', description: 'rolling, blue-green, canary', defaultValue: 'rolling' },
        { id: 'scaling_policy', type: 'optional', category: 'advanced', field: 'scaling_policy', label: 'Scaling Policy', description: 'Auto-scaling rules' },
        { id: 'health_check_enabled', type: 'optional', category: 'advanced', field: 'health_check_enabled', label: 'Health Checks', description: 'Enable health checks', defaultValue: true },
        { id: 'rollback_on_failure', type: 'optional', category: 'advanced', field: 'rollback_on_failure', label: 'Rollback on Failure', description: 'Auto-rollback', defaultValue: true }
      ],
      'deployment_pipeline': [
        { id: 'environment', type: 'required', category: 'input_schema', field: 'environment', label: 'Environment', description: 'dev, test, staging, prod' },
        { id: 'cloud_provider', type: 'optional', category: 'input_schema', field: 'cloud_provider', label: 'Cloud Provider', description: 'aws, gcp, azure' },
        { id: 'region', type: 'optional', category: 'input_schema', field: 'region', label: 'Region', description: 'Deployment region' },
        { id: 'deployment_strategy', type: 'optional', category: 'advanced', field: 'deployment_strategy', label: 'Strategy', description: 'rolling, blue-green, canary', defaultValue: 'rolling' },
        { id: 'scaling_policy', type: 'optional', category: 'advanced', field: 'scaling_policy', label: 'Scaling Policy', description: 'Auto-scaling rules' },
        { id: 'health_check_enabled', type: 'optional', category: 'advanced', field: 'health_check_enabled', label: 'Health Checks', description: 'Enable health checks', defaultValue: true },
        { id: 'rollback_on_failure', type: 'optional', category: 'advanced', field: 'rollback_on_failure', label: 'Rollback on Failure', description: 'Auto-rollback', defaultValue: true }
      ]
    };

    return baseRequirements[nodeType] || [
      {
        id: 'basic_config',
        type: 'optional',
        category: 'input_schema',
        field: 'config',
        label: 'Configuration',
        description: 'Basic node configuration'
      }
    ];
  },

  // Evaluate a node's current state
  evaluateNode: (node: Node): NodeEvaluation => {
    // Enhanced node type detection for AI models
    let nodeType = String(node.data?.type_key || node.type || 'unknown');
    const lt = nodeType.toLowerCase();

    // Normalize common aliases in the node type itself (e.g., "anthropic_agent" -> "anthropic_chat")
    const normalizeFromType = (t: string) => {
      if (t.includes('openai') || t.includes('gpt')) return 'openai_chat';
      if (t.includes('anthropic') || t.includes('claude')) return 'anthropic_chat';
      if (t.includes('llama') || t.includes('meta')) return 'llama_chat';
      if (t.includes('gemini') || t.includes('google')) return 'google_gemini';
      if (t.includes('azure') || t.includes('microsoft')) return 'azure_openai';
      if (t.includes('cohere')) return 'cohere_chat';
      if (t.includes('mistral')) return 'mistral_chat';
      return '';
    };

    const aliasType = normalizeFromType(lt);
    if (aliasType) {
      nodeType = aliasType;
    }
    
    // Template nodes: map to specific template requirement sets
    const tkey = String(node.data?.type_key || node.type || '').toLowerCase();
    if (tkey.includes('prompt_template_')) {
      const suffix = tkey.split('prompt_template_')[1] || '';
      if (suffix.includes('system')) nodeType = 'prompt_template_system_prompt';
      else if (suffix.includes('few') || suffix.includes('few-shot')) nodeType = 'prompt_template_few_shot';
      else if (suffix.includes('instruction')) nodeType = 'prompt_template_instruction';
      else if (suffix.includes('conversation')) nodeType = 'prompt_template_conversation';
      else if (suffix.includes('analysis')) nodeType = 'prompt_template_analysis';
      else if (suffix.includes('creative')) nodeType = 'prompt_template_creative';
      else nodeType = 'prompt_template_system_prompt';
    } else if (tkey.includes('agent_template_')) {
      nodeType = 'agent_template';
    } else {
      // Handle AI model nodes with intelligent fallback based on fields
      if (
        nodeType === 'unknown' ||
        nodeType === 'ai_model' ||
        nodeType.startsWith('ai_model_')
      ) {
        const provider = String(node.data?.provider || '').toLowerCase();
        const modelName = String(node.data?.model || node.data?.display_name || '').toLowerCase();
        
        const byFields = () => {
          if (provider.includes('openai') || modelName.includes('gpt')) return 'openai_chat';
          if (provider.includes('anthropic') || modelName.includes('claude')) return 'anthropic_chat';
          if (provider.includes('meta') || modelName.includes('llama')) return 'llama_chat';
          if (provider.includes('google') || modelName.includes('gemini')) return 'google_gemini';
          if (provider.includes('microsoft') || provider.includes('azure')) return 'azure_openai';
          if (provider.includes('cohere')) return 'cohere_chat';
          if (provider.includes('mistral')) return 'mistral_chat';
          return 'ai_model';
        };
        nodeType = byFields();
      }
    }

    // If still not mapped but clearly an AI model/processing node, fall back to generic AI model
    if (!['openai_chat','anthropic_chat','llama_chat','google_gemini','azure_openai','cohere_chat','mistral_chat','ai_model'].includes(nodeType)) {
      const cat = String(node.data?.category || '').toLowerCase();
      if (lt.includes('ai_model') || lt.includes('model') || cat.includes('ai_models') || cat.includes('processing') || lt.includes('processing')) {
        nodeType = 'ai_model'; // Generic AI model fallback, ensures full tabs
      }
    }
    
    const requirements = NodeRequirementEvaluator.getNodeRequirements(nodeType, node.data);
    
    const missingRequired: string[] = [];
    const suggestions: string[] = [];
    let requiredCount = 0;
    let fulfilledCount = 0;

    requirements.forEach(req => {
      const currentValue = node.data?.[req.field];
      const hasValue = currentValue !== undefined && currentValue !== null && currentValue !== '';

      if (req.type === 'required') {
        requiredCount++;
        if (!hasValue) {
          missingRequired.push(req.label);
        } else {
          fulfilledCount++;
        }
      } else if (req.type === 'conditional') {
        // Check if condition is met
        const shouldRequire = req.dependsOn?.every(dep => node.data?.[dep]) || false;
        if (shouldRequire) {
          requiredCount++;
          if (!hasValue) {
            missingRequired.push(req.label);
          } else {
            fulfilledCount++;
          }
        }
      } else if (req.type === 'optional' && !hasValue && req.defaultValue !== undefined) {
        suggestions.push(`Consider setting ${req.label} (default: ${String(req.defaultValue)})`);
      }
    });

    const isValid = missingRequired.length === 0;
    const completeness = requiredCount > 0 ? Math.round((fulfilledCount / requiredCount) * 100) : 100;

    return {
      isValid,
      missingRequired,
      suggestions,
      completeness,
      requirements
    };
  },

  // Get categories that have requirements for a node
  getRequiredCategories: (nodeType: string): string[] => {
    const requirements = NodeRequirementEvaluator.getNodeRequirements(nodeType, {});
    const categories = new Set<string>();
    
    requirements.forEach(req => {
      if (req.type === 'required') {
        categories.add(req.category);
      }
    });

    return Array.from(categories);
  },

  // Get category-specific requirements
  getCategoryRequirements: (nodeType: string, category: string): NodeRequirement[] => {
    const allRequirements = NodeRequirementEvaluator.getNodeRequirements(nodeType, {});
    return allRequirements.filter(req => req.category === category);
  }
};