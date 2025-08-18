import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UseCase {
  id: string;
  name: string;
  description?: string;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  industry?: string;
  recommended_journey?: any[];
  required_components?: any[];
  optional_components?: any[];
  templates?: any;
  is_system_template: boolean;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface NewUseCaseData {
  name: string;
  description?: string;
  category?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  industry?: string;
}

export const useUseCases = () => {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch use cases from database
  const fetchUseCases = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .eq('is_active', true)
        .order('is_system_template', { ascending: false })
        .order('name');

      if (error) throw error;
      // Type cast the data to match our interface
      const typedData: UseCase[] = (data || []).map(item => ({
        ...item,
        complexity: item.complexity as 'simple' | 'moderate' | 'complex',
        recommended_journey: Array.isArray(item.recommended_journey) ? item.recommended_journey : [],
        required_components: Array.isArray(item.required_components) ? item.required_components : [],
        optional_components: Array.isArray(item.optional_components) ? item.optional_components : [],
        templates: typeof item.templates === 'object' ? item.templates : {},
        description: item.description || undefined,
        industry: item.industry || undefined,
        created_by: item.created_by || undefined,
        created_at: item.created_at || undefined,
        updated_at: item.updated_at || undefined
      }));
      setUseCases(typedData);
    } catch (error) {
      console.error('Error fetching use cases:', error);
      toast({
        title: 'Error',
        description: 'Failed to load use cases',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new use case
  const addUseCase = async (newUseCaseData: NewUseCaseData) => {
    setIsAdding(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const useCaseData = {
        name: newUseCaseData.name.trim(),
        description: newUseCaseData.description?.trim() || null,
        category: newUseCaseData.category || 'general',
        complexity: newUseCaseData.complexity || 'moderate',
        industry: newUseCaseData.industry?.trim() || null,
        recommended_journey: [],
        required_components: [],
        optional_components: [],
        templates: {},
        is_system_template: false,
        is_active: true,
        created_by: user.user?.id
      };

      const { data, error } = await supabase
        .from('use_cases')
        .insert(useCaseData)
        .select()
        .single();

      if (error) throw error;

      // Type cast the returned data
      const typedData: UseCase = {
        ...data,
        complexity: data.complexity as 'simple' | 'moderate' | 'complex',
        recommended_journey: Array.isArray(data.recommended_journey) ? data.recommended_journey : [],
        required_components: Array.isArray(data.required_components) ? data.required_components : [],
        optional_components: Array.isArray(data.optional_components) ? data.optional_components : [],
        templates: typeof data.templates === 'object' ? data.templates : {},
        description: data.description || undefined,
        industry: data.industry || undefined,
        created_by: data.created_by || undefined,
        created_at: data.created_at || undefined,
        updated_at: data.updated_at || undefined
      };

      // Add to local state
      setUseCases(prev => [...prev, typedData]);

      toast({
        title: 'Success!',
        description: `Use case "${newUseCaseData.name}" added successfully`
      });

      return data;
    } catch (error: any) {
      console.error('Error adding use case:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add use case',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  // Update use case
  const updateUseCase = async (id: string, updates: Partial<NewUseCaseData>) => {
    try {
      const { data, error } = await supabase
        .from('use_cases')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Type cast the returned data
      const typedData: UseCase = {
        ...data,
        complexity: data.complexity as 'simple' | 'moderate' | 'complex',
        recommended_journey: Array.isArray(data.recommended_journey) ? data.recommended_journey : [],
        required_components: Array.isArray(data.required_components) ? data.required_components : [],
        optional_components: Array.isArray(data.optional_components) ? data.optional_components : [],
        templates: typeof data.templates === 'object' ? data.templates : {},
        description: data.description || undefined,
        industry: data.industry || undefined,
        created_by: data.created_by || undefined,
        created_at: data.created_at || undefined,
        updated_at: data.updated_at || undefined
      };

      // Update local state
      setUseCases(prev => prev.map(useCase => 
        useCase.id === id ? typedData : useCase
      ));

      toast({
        title: 'Updated',
        description: 'Use case updated successfully'
      });

      return data;
    } catch (error: any) {
      console.error('Error updating use case:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update use case',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Delete use case (only non-system templates)
  const deleteUseCase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('use_cases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      setUseCases(prev => prev.filter(useCase => useCase.id !== id));

      toast({
        title: 'Deleted',
        description: 'Use case deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting use case:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete use case',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Get use case by id
  const getUseCaseById = (id: string): UseCase | undefined => {
    return useCases.find(useCase => useCase.id === id);
  };

  // Get use cases by category
  const getUseCasesByCategory = (category: string): UseCase[] => {
    return useCases.filter(useCase => useCase.category === category);
  };

  // Get available categories
  const getCategories = (): string[] => {
    const categories = new Set(useCases.map(useCase => useCase.category));
    return Array.from(categories).sort();
  };

  // Get available industries
  const getIndustries = (): string[] => {
    const industries = new Set(
      useCases
        .map(useCase => useCase.industry)
        .filter(industry => industry && industry.trim() !== '')
    );
    return Array.from(industries).sort();
  };

  // Load use cases on mount
  useEffect(() => {
    fetchUseCases();
  }, []);

  return {
    useCases,
    isLoading,
    isAdding,
    fetchUseCases,
    addUseCase,
    updateUseCase,
    deleteUseCase,
    getUseCaseById,
    getUseCasesByCategory,
    getCategories,
    getIndustries
  };
};