/**
 * Hook for managing script versions - save, load, and track version history
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScriptVersion {
  id: string;
  script_id: string;
  version_number: number;
  original_content: string;
  enhanced_content: string | null;
  clean_content: string | null;
  version_type: 'original' | 'enhanced' | 'manual_edit';
  change_summary: string | null;
  analysis_results: Record<string, unknown> | null;
  enhancement_changes: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
}

interface SaveVersionParams {
  scriptId: string;
  originalContent: string;
  enhancedContent?: string;
  cleanContent?: string;
  versionType: 'original' | 'enhanced' | 'manual_edit';
  changeSummary?: string;
  analysisResults?: Record<string, unknown>;
  enhancementChanges?: Record<string, unknown>;
}

interface UseScriptVersionsReturn {
  versions: ScriptVersion[];
  currentVersion: ScriptVersion | null;
  isLoading: boolean;
  isSaving: boolean;
  loadVersions: (scriptId: string) => Promise<void>;
  saveNewVersion: (params: SaveVersionParams) => Promise<ScriptVersion | null>;
  setActiveVersion: (versionId: string, scriptId: string) => Promise<boolean>;
  getVersionHistory: (scriptId: string) => Promise<ScriptVersion[]>;
  compareVersions: (versionId1: string, versionId2: string) => Promise<{ v1: ScriptVersion | null; v2: ScriptVersion | null }>;
}

export function useScriptVersions(): UseScriptVersionsReturn {
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<ScriptVersion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load all versions for a script
  const loadVersions = useCallback(async (scriptId: string) => {
    if (!scriptId) return;
    
    setIsLoading(true);
    try {
      // Get all versions - use type assertion for new table
      const { data: versionsData, error: versionsError } = await supabase
        .from('script_versions' as 'genie_scripts') // Type workaround
        .select('*')
        .eq('script_id' as 'id', scriptId)
        .order('version_number' as 'name', { ascending: false });

      if (versionsError) throw versionsError;

      // Type cast since we know the structure
      const typedVersions = (versionsData || []) as unknown as ScriptVersion[];
      setVersions(typedVersions);

      // Get current version from script
      const { data: scriptData, error: scriptError } = await supabase
        .from('genie_scripts')
        .select('current_version_id')
        .eq('id', scriptId)
        .single();

      if (scriptError) throw scriptError;

      if (scriptData?.current_version_id) {
        const current = typedVersions.find(v => v.id === scriptData.current_version_id);
        setCurrentVersion(current || typedVersions[0] || null);
      } else {
        setCurrentVersion(typedVersions[0] || null);
      }
    } catch (error) {
      console.error('Error loading script versions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save a new version
  const saveNewVersion = useCallback(async (params: SaveVersionParams): Promise<ScriptVersion | null> => {
    setIsSaving(true);
    try {
      // Get next version number
      const { data: nextVersionData, error: nextVersionError } = await supabase
        .rpc('get_next_script_version_number', { p_script_id: params.scriptId });

      if (nextVersionError) throw nextVersionError;

      const nextVersion = nextVersionData || 1;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Insert new version - use type assertion for new table
      const insertPayload = {
        script_id: params.scriptId,
        version_number: nextVersion,
        original_content: params.originalContent,
        enhanced_content: params.enhancedContent || null,
        clean_content: params.cleanContent || null,
        version_type: params.versionType,
        change_summary: params.changeSummary || null,
        analysis_results: params.analysisResults || null,
        enhancement_changes: params.enhancementChanges || null,
        created_by: user?.id || null,
      };

      // Use raw query approach since types may not be updated yet
      const { data: newVersion, error: insertError } = await supabase
        .from('script_versions' as 'genie_scripts') // Type workaround for new table
        .insert(insertPayload as never)
        .select()
        .single();

      if (insertError) throw insertError;

      // Update genie_scripts with enhanced content and current version
      const updatePayload: Record<string, unknown> = {
        current_version_id: newVersion.id,
        updated_at: new Date().toISOString(),
      };

      if (params.enhancedContent) {
        updatePayload.enhanced_content = params.enhancedContent;
      }
      if (params.cleanContent) {
        updatePayload.clean_content = params.cleanContent;
      }

      const { error: updateError } = await supabase
        .from('genie_scripts')
        .update(updatePayload as never)
        .eq('id', params.scriptId);

      if (updateError) throw updateError;

      // Reload versions
      await loadVersions(params.scriptId);

      toast.success(`Version ${nextVersion} saved to Production!`);
      return newVersion as unknown as ScriptVersion;
    } catch (error) {
      console.error('Error saving script version:', error);
      toast.error('Failed to save version');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [loadVersions]);

  // Set active version for a script
  const setActiveVersion = useCallback(async (versionId: string, scriptId: string): Promise<boolean> => {
    try {
      // Get the version content
      const { data: version, error: versionError } = await supabase
        .from('script_versions' as 'genie_scripts')
        .select('*')
        .eq('id' as 'id', versionId)
        .single();

      if (versionError) throw versionError;

      // Update script with this version's content
      const versionData = version as unknown as ScriptVersion;
      const { error: updateError } = await supabase
        .from('genie_scripts')
        .update({
          current_version_id: versionId,
          content: versionData.original_content,
          enhanced_content: versionData.enhanced_content,
          clean_content: versionData.clean_content,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', scriptId);

      if (updateError) throw updateError;

      setCurrentVersion(versionData);
      toast.success(`Switched to version ${versionData.version_number}`);
      return true;
    } catch (error) {
      console.error('Error setting active version:', error);
      toast.error('Failed to switch version');
      return false;
    }
  }, []);

  // Get version history for a script
  const getVersionHistory = useCallback(async (scriptId: string): Promise<ScriptVersion[]> => {
    try {
      const { data, error } = await supabase
        .from('script_versions' as 'genie_scripts')
        .select('*')
        .eq('script_id' as 'id', scriptId)
        .order('version_number' as 'name', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ScriptVersion[];
    } catch (error) {
      console.error('Error getting version history:', error);
      return [];
    }
  }, []);

  // Compare two versions
  const compareVersions = useCallback(async (
    versionId1: string, 
    versionId2: string
  ): Promise<{ v1: ScriptVersion | null; v2: ScriptVersion | null }> => {
    try {
      const { data, error } = await supabase
        .from('script_versions' as 'genie_scripts')
        .select('*')
        .in('id' as 'id', [versionId1, versionId2]);

      if (error) throw error;

      const versions = (data || []) as unknown as ScriptVersion[];
      return {
        v1: versions.find(v => v.id === versionId1) || null,
        v2: versions.find(v => v.id === versionId2) || null,
      };
    } catch (error) {
      console.error('Error comparing versions:', error);
      return { v1: null, v2: null };
    }
  }, []);

  return {
    versions,
    currentVersion,
    isLoading,
    isSaving,
    loadVersions,
    saveNewVersion,
    setActiveVersion,
    getVersionHistory,
    compareVersions,
  };
}
