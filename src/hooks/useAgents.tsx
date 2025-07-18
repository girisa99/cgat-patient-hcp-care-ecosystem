/**
 * Agents Hook - Following Stability Framework Structure
 * Uses useTypeSafeModuleTemplate for consistency
 */

import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

const agentsConfig = {
  tableName: 'agents',
  moduleName: 'Agents',
  requiredFields: ['name', 'status', 'agent_type'],
  customValidation: (data: any) => {
    return data.name && data.name.length > 0;
  }
};

export const useAgents = () => {
  const templateResult = useTypeSafeModuleTemplate(agentsConfig);

  return {
    ...templateResult,
    // Specific agent methods if needed
    deployAgent: async (agentId: string) => {
      return templateResult.updateItem(agentId, { status: 'deployed' });
    },
    pauseAgent: async (agentId: string) => {
      return templateResult.updateItem(agentId, { status: 'paused' });
    }
  };
};

export default useAgents;