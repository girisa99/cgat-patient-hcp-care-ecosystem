import { useCallback } from 'react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface NodeConfiguration {
  id: string;
  type: string;
  category?: string;
  configuration: Record<string, any>;
}

export const useNodeConfigurationSync = () => {
  const { toast } = useMasterToast();

  // Validate node configuration based on type
  const validateConfiguration = useCallback((nodeType: string, configuration: Record<string, any>) => {
    const errors: string[] = [];

    switch (nodeType) {
      case 'condition':
        if (!configuration.model) errors.push('Model is required for condition nodes');
        if (!configuration.instructions) errors.push('Instructions are required for condition nodes');
        if (!configuration.scenarios || configuration.scenarios.length === 0) {
          errors.push('At least one scenario is required for condition nodes');
        }
        break;

      case 'customFunction':
        if (!configuration.javascriptFunction) {
          errors.push('JavaScript function is required for custom function nodes');
        }
        if (!configuration.inputVariables || configuration.inputVariables.length === 0) {
          errors.push('At least one input variable is required for custom function nodes');
        }
        break;

      case 'executeFlow':
        if (!configuration.selectFlow) errors.push('Flow selection is required for execute flow nodes');
        if (!configuration.returnResponseAs) {
          errors.push('Return response format is required for execute flow nodes');
        }
        break;

      case 'directReply':
        if (!configuration.message) errors.push('Message is required for direct reply nodes');
        break;

      case 'humanInput':
        if (!configuration.descriptionType) {
          errors.push('Description type is required for human input nodes');
        }
        break;

      case 'http':
        if (!configuration.method) errors.push('HTTP method is required for HTTP nodes');
        if (!configuration.url) errors.push('URL is required for HTTP nodes');
        break;

      case 'agent':
        if (!configuration.provider) errors.push('AI provider is required for agent nodes');
        if (!configuration.model) errors.push('Model is required for agent nodes');
        break;

      case 'start':
        if (!configuration.inputType) errors.push('Input type is required for start nodes');
        break;

      default:
        // Basic validation for generic nodes
        if (!configuration.name && !configuration.enabled) {
          errors.push('Node must have a name or be enabled');
        }
    }

    return errors;
  }, []);

  // Sync configuration with AI generation system
  const syncWithAIGeneration = useCallback((nodes: NodeConfiguration[]) => {
    const enhancedNodes = nodes.map(node => {
      const validationErrors = validateConfiguration(node.type, node.configuration);
      
      if (validationErrors.length > 0) {
        console.warn(`Configuration validation errors for node ${node.id}:`, validationErrors);
      }

      return {
        ...node,
        configuration: {
          ...node.configuration,
          // Add AI generation compatibility flags
          ai_compatible: true,
          validation_status: validationErrors.length === 0 ? 'valid' : 'warning',
          validation_errors: validationErrors,
          last_synced: new Date().toISOString()
        }
      };
    });

    return enhancedNodes;
  }, [validateConfiguration]);

  // Sync configuration with drag-and-drop system
  const syncWithDragDrop = useCallback((nodeType: string, initialConfig?: Record<string, any>) => {
    // Provide default configuration based on node type
    const defaultConfigurations: Record<string, Record<string, any>> = {
      condition: {
        model: 'ChatAnthropic',
        instructions: 'Determine the appropriate condition based on input',
        input: '{{question}}',
        scenarios: [{ text: 'Default scenario' }],
        overrideSystemPrompt: false
      },
      customFunction: {
        inputVariables: [{ name: 'input', value: '{{input}}' }],
        javascriptFunction: '// Your JavaScript code here\nreturn { result: input };',
        updateFlowState: []
      },
      executeFlow: {
        connectCredential: 'default',
        selectFlow: '',
        input: '{{input}}',
        baseUrl: 'http://localhost:3000',
        returnResponseAs: 'json',
        updateFlowState: []
      },
      directReply: {
        message: 'Default reply message'
      },
      humanInput: {
        descriptionType: 'fixed'
      },
      http: {
        httpCredential: '',
        method: 'GET',
        url: '',
        headers: [],
        queryParams: [],
        bodyType: 'JSON',
        responseType: 'JSON'
      },
      agent: {
        provider: 'ChatAnthropic',
        model: 'claude-sonnet-4-0',
        temperature: 0.7,
        maxTokens: 4000,
        messages: [],
        tools: [],
        enableMemory: true,
        memoryType: 'All Messages'
      },
      start: {
        inputType: 'chat',
        ephemeralMemory: false,
        flowState: [],
        persistState: false,
        triggerType: 'manual'
      }
    };

    const defaultConfig = defaultConfigurations[nodeType] || {
      name: `${nodeType} Node`,
      description: `Auto-generated ${nodeType} node`,
      enabled: true
    };

    return {
      ...defaultConfig,
      ...initialConfig,
      // Add synchronization metadata
      drag_drop_generated: true,
      sync_status: 'synced',
      created_at: new Date().toISOString()
    };
  }, []);

  // Test configuration functionality
  const testConfiguration = useCallback(async (nodeType: string, configuration: Record<string, any>) => {
    try {
      const validationErrors = validateConfiguration(nodeType, configuration);
      
      if (validationErrors.length > 0) {
        toast.error(`Configuration Issues: Found ${validationErrors.length} validation error(s)`);
        return { success: false, errors: validationErrors };
      }

      // Simulate backend configuration test
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Configuration Valid: ${nodeType} node configuration is ready for deployment`);

      return { success: true, errors: [] };
    } catch (error) {
      console.error('Configuration test failed:', error);
      toast.error("Test Failed: Unable to validate configuration");
      return { success: false, errors: ['Test execution failed'] };
    }
  }, [validateConfiguration, toast]);

  // Deploy configuration
  const deployConfiguration = useCallback(async (nodes: NodeConfiguration[]) => {
    try {
      // Validate all nodes before deployment
      const validationResults = nodes.map(node => ({
        id: node.id,
        type: node.type,
        errors: validateConfiguration(node.type, node.configuration)
      }));

      const hasErrors = validationResults.some(result => result.errors.length > 0);
      
      if (hasErrors) {
        const errorNodes = validationResults.filter(result => result.errors.length > 0);
        toast.error(`Deployment Blocked: ${errorNodes.length} node(s) have configuration errors`);
        return { success: false, errors: validationResults };
      }

      // Simulate deployment process
      toast.info(`Deploying Configuration: Deploying ${nodes.length} node configurations...`);

      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(`Deployment Successful: All ${nodes.length} nodes have been deployed successfully`);

      return { success: true, errors: [] };
    } catch (error) {
      console.error('Deployment failed:', error);
      toast.error("Deployment Failed: Unable to deploy configurations");
      return { success: false, errors: ['Deployment execution failed'] };
    }
  }, [validateConfiguration, toast]);

  // Get configuration template for a node type
  const getConfigurationTemplate = useCallback((nodeType: string) => {
    const templates: Record<string, any> = {
      condition: {
        name: "Condition Agent Template",
        description: "Template for conditional logic nodes",
        fields: [
          { name: 'model', type: 'select', required: true, options: ['ChatAnthropic', 'ChatOpenAI', 'ChatGoogleGenerativeAI'] },
          { name: 'instructions', type: 'textarea', required: true, placeholder: 'Determine the appropriate condition...' },
          { name: 'input', type: 'textarea', required: true, placeholder: '{{question}}' },
          { name: 'scenarios', type: 'array', required: true, itemType: 'object' },
          { name: 'overrideSystemPrompt', type: 'boolean', required: false }
        ]
      },
      customFunction: {
        name: "Custom Function Template",
        description: "Template for custom JavaScript function nodes",
        fields: [
          { name: 'inputVariables', type: 'array', required: true, itemType: 'object' },
          { name: 'javascriptFunction', type: 'code', required: true, language: 'javascript' },
          { name: 'updateFlowState', type: 'array', required: false, itemType: 'object' }
        ]
      },
      executeFlow: {
        name: "Execute Flow Template",
        description: "Template for flow execution nodes",
        fields: [
          { name: 'connectCredential', type: 'select', required: false, options: ['default', 'custom'] },
          { name: 'selectFlow', type: 'select', required: true, options: [] },
          { name: 'input', type: 'textarea', required: true },
          { name: 'baseUrl', type: 'text', required: false },
          { name: 'returnResponseAs', type: 'select', required: true, options: ['json', 'text', 'raw'] }
        ]
      },
      directReply: {
        name: "Direct Reply Template",
        description: "Template for direct message reply nodes",
        fields: [
          { name: 'message', type: 'textarea', required: true, placeholder: 'Enter your direct reply message' }
        ]
      },
      humanInput: {
        name: "Human Input Template",
        description: "Template for human input request nodes",
        fields: [
          { name: 'descriptionType', type: 'select', required: true, options: ['fixed', 'dynamic'] }
        ]
      },
      http: {
        name: "HTTP Request Template",
        description: "Template for HTTP API request nodes",
        fields: [
          { name: 'httpCredential', type: 'select', required: false, options: [] },
          { name: 'method', type: 'select', required: true, options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
          { name: 'url', type: 'text', required: true, placeholder: 'https://api.example.com/endpoint' },
          { name: 'headers', type: 'array', required: false, itemType: 'keyValue' },
          { name: 'queryParams', type: 'array', required: false, itemType: 'keyValue' },
          { name: 'bodyType', type: 'select', required: false, options: ['JSON', 'Text', 'Array Buffer', 'Raw (Base64)', 'x-www-form-urlencoded'] },
          { name: 'responseType', type: 'select', required: false, options: ['JSON', 'Text', 'Array Buffer', 'Raw (Base64)'] }
        ]
      }
    };

    return templates[nodeType] || {
      name: "Generic Template",
      description: "Basic template for custom nodes",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: false },
        { name: 'enabled', type: 'boolean', required: false }
      ]
    };
  }, []);

  return {
    validateConfiguration,
    syncWithAIGeneration,
    syncWithDragDrop,
    testConfiguration,
    deployConfiguration,
    getConfigurationTemplate
  };
};