
/**
 * API PUBLISH HOOK - FIXED INTERFACES
 * Uses proper PublishFormState interface
 */
import { useState } from 'react';
import { PublishFormState } from '@/types/formState';
import { useMasterToast } from '../useMasterToast';

export const useApiPublish = () => {
  const [formState, setFormState] = useState<PublishFormState>({
    title: '',
    description: '',
    category: '',
    isPublished: false,
    version: '1.0.0',
    tags: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const addTag = (tag: string) => {
    setFormState(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag]
    }));
  };

  const removeTag = (tagIndex: number) => {
    setFormState(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, index) => index !== tagIndex) || []
    }));
  };

  const publishApi = async () => {
    setIsLoading(true);
    try {
      // API publish logic here
      showSuccess('API published successfully');
      setFormState({
        title: '',
        description: '',
        category: '',
        isPublished: false,
        version: '1.0.0',
        tags: []
      });
    } catch (error) {
      showError('Failed to publish API');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formState,
    setFormState,
    addTag,
    removeTag,
    publishApi,
    isLoading
  };
};
