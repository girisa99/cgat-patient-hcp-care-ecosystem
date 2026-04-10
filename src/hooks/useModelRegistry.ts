/**
 * useModelRegistry — React hook for DB-driven AI model resolution
 *
 * Provides reactive access to the AI model registry with automatic
 * resolution of aliases and retired model IDs.
 *
 * Module-level cache: loads once, shared across all component instances.
 *
 * @example
 *   const { resolveModel, getModelsForCapability, isLoaded } = useModelRegistry();
 *   const currentModel = resolveModel('claude-3-5-sonnet'); // → 'claude-sonnet-4-6'
 *   const llmModels = getModelsForCapability('llm'); // → [{ modelId, displayName, ... }]
 */

import { useState, useEffect, useCallback } from 'react';
import {
  resolveModelId,
  getActiveModel,
  getModelsForCapability as getModelsForCap,
  isDBInitialized,
  initializeFromDB,
  type ProviderModelVersion,
} from '@/config/provider-version-registry';

interface UseModelRegistryReturn {
  /** Resolve any model ID (including retired aliases) to current canonical model */
  resolveModel: (modelIdOrAlias: string) => string;
  /** Get the active model for a provider + capability */
  getActiveModelForProvider: (provider: string, capability: string) => string | undefined;
  /** Get all active models for a capability (for UI dropdowns) */
  getModelsForCapability: (capability: string) => Array<{
    modelId: string;
    displayName: string;
    provider: string;
    qualityTier: string;
    speedTier: string;
  }>;
  /** Whether the DB-backed registry has loaded */
  isLoaded: boolean;
}

export function useModelRegistry(): UseModelRegistryReturn {
  const [isLoaded, setIsLoaded] = useState(isDBInitialized());

  useEffect(() => {
    if (!isDBInitialized()) {
      initializeFromDB().then(() => {
        setIsLoaded(true);
      });
    }
  }, []);

  const resolveModel = useCallback((modelIdOrAlias: string): string => {
    return resolveModelId(modelIdOrAlias);
  }, []);

  const getActiveModelForProvider = useCallback((provider: string, capability: string): string | undefined => {
    return getActiveModel(provider, capability);
  }, []);

  const getModelsForCapability = useCallback((capability: string) => {
    return getModelsForCap(capability);
  }, []);

  return {
    resolveModel,
    getActiveModelForProvider,
    getModelsForCapability,
    isLoaded,
  };
}
