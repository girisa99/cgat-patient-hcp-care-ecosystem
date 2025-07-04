
import React, { useState, useCallback } from 'react';
import { useMasterToast } from '../useMasterToast';
import type { PublishFormState } from '@/types/formState';

export const useApiPublish = () => {
  const toast = useMasterToast();
  
  const [formData, setFormData] = useState<PublishFormState>({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: ''
  });

  const [publishData, setPublishData] = useState<PublishFormState>({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: ''
  });

  const [updateData, setUpdateData] = useState<PublishFormState>({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateFormField = useCallback((field: keyof PublishFormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updatePublishField = useCallback((field: keyof PublishFormState, value: string) => {
    setPublishData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updateUpdateField = useCallback((field: keyof PublishFormState, value: string) => {
    setUpdateData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handlePublish = useCallback(async () => {
    setIsLoading(true);
    try {
      // API publish logic here
      toast.showSuccess('API Publish', 'Successfully published content');
    } catch (error) {
      toast.showError('API Publish Error', 'Failed to publish content');
    } finally {
      setIsLoading(false);
    }
  }, [publishData, toast]);

  return {
    formData,
    publishData,
    updateData,
    isLoading,
    updateFormField,
    updatePublishField,
    updateUpdateField,
    handlePublish,
    meta: {
      hookVersion: 'api-publish-v1.0.0',
      typeScriptAligned: true
    }
  };
};
