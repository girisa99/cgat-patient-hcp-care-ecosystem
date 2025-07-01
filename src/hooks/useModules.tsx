
import { useModuleData } from './modules/useModuleData';
import { useModuleMutations } from './modules/useModuleMutations';

export const useModules = () => {
  const { data: modules, isLoading, error, refetch } = useModuleData();
  const moduleMutations = useModuleMutations();

  // Mock user modules data for now - this would come from a real query
  const userModules = modules?.map(module => ({
    module_id: module.id,
    module_name: module.name,
    module_description: module.description || 'No description available'
  })) || [];

  return {
    modules,
    userModules,
    isLoading,
    error,
    refetch,
    ...moduleMutations
  };
};
