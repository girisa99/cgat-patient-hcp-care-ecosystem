import { Node } from '@xyflow/react';

export interface NodeRequirement {
  id: string;
  type: 'required' | 'optional' | 'conditional';
  category: 'credentials' | 'input_schema' | 'functions' | 'variables' | 'advanced';
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
    return logoMap[provider] || '/logos/default-ai.svg';
  },

  // Define node-specific requirements
  getNodeRequirements: (nodeType: string, nodeData: any): NodeRequirement[] => {
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
    
    // Handle AI model nodes with intelligent fallback
    if (
      nodeType === 'unknown' ||
      nodeType === 'ai_model' ||
      nodeType.startsWith('ai_model_') ||
      nodeType.includes('template_')
    ) {
      const provider = String(node.data?.provider || '').toLowerCase();
      const modelName = String(node.data?.model || node.data?.display_name || '').toLowerCase();
      
      // Map based on provider or model name
      if (provider.includes('openai') || modelName.includes('gpt')) {
        nodeType = 'openai_chat';
      } else if (provider.includes('anthropic') || modelName.includes('claude')) {
        nodeType = 'anthropic_chat';
      } else if (provider.includes('meta') || modelName.includes('llama')) {
        nodeType = 'llama_chat';
      } else if (provider.includes('google') || modelName.includes('gemini')) {
        nodeType = 'google_gemini';
      } else if (provider.includes('microsoft') || provider.includes('azure')) {
        nodeType = 'azure_openai';
      } else if (provider.includes('cohere')) {
        nodeType = 'cohere_chat';
      } else if (provider.includes('mistral')) {
        nodeType = 'mistral_chat';
      } else if (node.data?.category === 'ai_models' || nodeType.includes('ai_model')) {
        nodeType = 'ai_model'; // Generic AI model fallback
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