
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SharedModuleConfig {
  moduleName: string;
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
}

export const useSharedModuleLogic = (config: SharedModuleConfig) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = useCallback(async (data: any) => {
    setIsCreating(true);
    try {
      await config.createMutation.mutateAsync(data);
      toast({
        title: "Success",
        description: `${config.moduleName} created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create ${config.moduleName.toLowerCase()}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [config, toast]);

  const handleUpdate = useCallback(async (id: string, data: any) => {
    setIsUpdating(true);
    try {
      await config.updateMutation.mutateAsync({ id, ...data });
      toast({
        title: "Success",
        description: `${config.moduleName} updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${config.moduleName.toLowerCase()}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [config, toast]);

  const handleDelete = useCallback(async (id: string) => {
    setIsDeleting(true);
    try {
      await config.deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: `${config.moduleName} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${config.moduleName.toLowerCase()}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [config, toast]);

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
