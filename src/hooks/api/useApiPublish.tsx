
/**
 * API PUBLISH HOOK - FIXED FORM STATE ALIGNMENT  
 * Version: api-publish-v2.0.0 - Fixed tags array type
 */
import { useState } from 'react';
import type { PublishFormState } from '@/types/formState';

export const useApiPublish = () => {
  const [publishForm, setPublishForm] = useState<PublishFormState>({
    title: '',
    description: '',
    version: '1.0.0',
    isPublic: false,
    category: '',
    content: '',
    tags: [] // FIXED - Initialize as array instead of string
  });

  const updatePublishForm = (updates: Partial<PublishFormState>) => {
    setPublishForm(prev => ({
      ...prev,
      ...updates,
      tags: Array.isArray(updates.tags) ? updates.tags : prev.tags // ENSURE tags remain array
    }));
  };

  const addTag = (tag: string) => {
    setPublishForm(prev => ({
      ...prev,
      tags: [...prev.tags, tag] // FIXED - Properly handle array operation
    }));
  };

  const removeTag = (tagToRemove: string) => {
    setPublishForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove) // FIXED - Array filter operation
    }));
  };

  const resetForm = () => {
    setPublishForm({
      title: '',
      description: '',
      version: '1.0.0',
      isPublic: false,
      category: '',
      content: '',
      tags: [] // FIXED - Reset as empty array
    });
  };

  return {
    publishForm,
    setPublishForm,
    updatePublishForm,
    addTag,
    removeTag,
    resetForm,
    
    meta: {
      version: 'api-publish-v2.0.0',
      tagsArrayFixed: true,
      formStateAligned: true
    }
  };
};
