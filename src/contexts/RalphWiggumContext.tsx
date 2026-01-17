/**
 * Global Ralph Wiggum Context - Dev-Only UI/UX Review System
 * Provides centralized finding management across all pages
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// DEV-ONLY check - evaluated at module load time
const isDev = import.meta.env.DEV;

// Finding types
export type FindingType = 'critical' | 'warning' | 'suggestion' | 'journey';
export type FindingSeverity = 'high' | 'medium' | 'low';
export type FindingStatus = 'new' | 'acknowledged' | 'in_progress' | 'fixed' | 'verified' | 'wont_fix' | 'duplicate';

export interface RalphFinding {
  id: string;
  finding_hash: string;
  page_route: string;
  module_name: string;
  finding_type: FindingType;
  severity: FindingSeverity;
  title: string;
  description: string;
  recommendation?: string;
  status: FindingStatus;
  status_changed_at?: string;
  status_changed_by?: string;
  ai_confidence?: number;
  ai_model_used?: string;
  raw_ai_response?: Record<string, unknown>;
  page_content_snapshot?: Record<string, unknown>;
  user_flow_snapshot?: Record<string, unknown>;
  first_detected_at: string;
  last_seen_at: string;
  occurrence_count: number;
  exported_at?: string;
  export_format?: string;
  created_at: string;
  updated_at: string;
}

export interface RalphWiggumContextValue {
  // State
  findings: RalphFinding[];
  isLoading: boolean;
  isAnalyzing: boolean;
  currentPageRoute: string;
  isPanelOpen: boolean;
  isEnabled: boolean;
  activeOverlay: string | null; // Track floating overlays like "ask-genie"
  
  // Actions
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  refreshFindings: () => Promise<void>;
  addFinding: (finding: Omit<RalphFinding, 'id' | 'created_at' | 'updated_at' | 'first_detected_at' | 'last_seen_at' | 'occurrence_count'>) => Promise<void>;
  updateFindingStatus: (id: string, status: FindingStatus, changedBy?: string) => Promise<void>;
  deleteFinding: (id: string) => Promise<void>;
  exportFindings: (format: 'json' | 'markdown' | 'lovable') => Promise<string>;
  triggerAnalysis: (pageContent: Record<string, unknown>) => void;
  setActiveOverlay: (overlay: string | null) => void; // Set active overlay
  
  // Filters
  filterByPage: (route: string) => RalphFinding[];
  filterByStatus: (status: FindingStatus) => RalphFinding[];
  filterByType: (type: FindingType) => RalphFinding[];
  
  // Stats
  stats: {
    total: number;
    byStatus: Record<FindingStatus, number>;
    byType: Record<FindingType, number>;
    byPage: Record<string, number>;
  };
}

// Default no-op context for production
const defaultContextValue: RalphWiggumContextValue = {
  findings: [],
  isLoading: false,
  isAnalyzing: false,
  currentPageRoute: '',
  isPanelOpen: false,
  isEnabled: false,
  activeOverlay: null,
  togglePanel: () => {},
  openPanel: () => {},
  closePanel: () => {},
  refreshFindings: async () => {},
  addFinding: async () => {},
  updateFindingStatus: async () => {},
  deleteFinding: async () => {},
  exportFindings: async () => '',
  triggerAnalysis: () => {},
  setActiveOverlay: () => {},
  filterByPage: () => [],
  filterByStatus: () => [],
  filterByType: () => [],
  stats: {
    total: 0,
    byStatus: { new: 0, acknowledged: 0, in_progress: 0, fixed: 0, verified: 0, wont_fix: 0, duplicate: 0 },
    byType: { critical: 0, warning: 0, suggestion: 0, journey: 0 },
    byPage: {}
  }
};

const RalphWiggumContext = createContext<RalphWiggumContextValue>(defaultContextValue);

// Generate hash for duplicate detection
const generateFindingHash = (title: string, description: string, pageRoute: string): string => {
  const content = `${title}|${description}|${pageRoute}`.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `ralph_${Math.abs(hash).toString(16)}`;
};

// Production-safe provider that just passes through children
const ProductionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RalphWiggumContext.Provider value={defaultContextValue}>
      {children}
    </RalphWiggumContext.Provider>
  );
};

// Dev-only provider with full functionality
const DevProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [findings, setFindings] = useState<RalphFinding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const location = useLocation();
  
  const currentPageRoute = location.pathname;
  
  // Load findings from database
  const refreshFindings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ralph_wiggum_findings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFindings((data as RalphFinding[]) || []);
    } catch (error) {
      console.error('Failed to load Ralph Wiggum findings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load findings on mount
  useEffect(() => {
    refreshFindings();
  }, [refreshFindings]);
  
  // Add or update finding
  const addFinding = useCallback(async (finding: Omit<RalphFinding, 'id' | 'created_at' | 'updated_at' | 'first_detected_at' | 'last_seen_at' | 'occurrence_count'>) => {
    try {
      const hash = finding.finding_hash || generateFindingHash(finding.title, finding.description, finding.page_route);
      
      // Check if finding exists
      const existing = findings.find(f => f.finding_hash === hash);
      
      if (existing) {
        // Update occurrence count and last seen
        const { error } = await supabase
          .from('ralph_wiggum_findings')
          .update({
            last_seen_at: new Date().toISOString(),
            occurrence_count: existing.occurrence_count + 1,
            page_content_snapshot: finding.page_content_snapshot as unknown as Json,
            user_flow_snapshot: finding.user_flow_snapshot as unknown as Json
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new finding - construct proper insert object
        const insertData = {
          finding_hash: hash,
          page_route: finding.page_route,
          module_name: finding.module_name,
          finding_type: finding.finding_type,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          recommendation: finding.recommendation,
          status: 'new' as const,
          ai_confidence: finding.ai_confidence,
          ai_model_used: finding.ai_model_used,
          raw_ai_response: finding.raw_ai_response as unknown as Json,
          page_content_snapshot: finding.page_content_snapshot as unknown as Json,
          user_flow_snapshot: finding.user_flow_snapshot as unknown as Json
        };
        
        const { error } = await supabase
          .from('ralph_wiggum_findings')
          .insert(insertData);
        
        if (error) throw error;
      }
      
      await refreshFindings();
    } catch (error) {
      console.error('Failed to add finding:', error);
      toast.error('Failed to save finding');
    }
  }, [findings, refreshFindings]);
  
  // Update finding status
  const updateFindingStatus = useCallback(async (id: string, status: FindingStatus, changedBy?: string) => {
    try {
      const { error } = await supabase
        .from('ralph_wiggum_findings')
        .update({
          status,
          status_changed_at: new Date().toISOString(),
          status_changed_by: changedBy || 'user'
        })
        .eq('id', id);
      
      if (error) throw error;
      await refreshFindings();
      toast.success(`Finding marked as ${status}`);
    } catch (error) {
      console.error('Failed to update finding status:', error);
      toast.error('Failed to update finding');
    }
  }, [refreshFindings]);
  
  // Delete finding
  const deleteFinding = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('ralph_wiggum_findings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshFindings();
      toast.success('Finding deleted');
    } catch (error) {
      console.error('Failed to delete finding:', error);
      toast.error('Failed to delete finding');
    }
  }, [refreshFindings]);
  
  // Export findings
  const exportFindings = useCallback(async (format: 'json' | 'markdown' | 'lovable'): Promise<string> => {
    const exportData = findings.filter(f => f.status !== 'verified' && f.status !== 'duplicate');
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    if (format === 'markdown' || format === 'lovable') {
      const grouped = exportData.reduce((acc, f) => {
        const key = f.page_route;
        if (!acc[key]) acc[key] = [];
        acc[key].push(f);
        return acc;
      }, {} as Record<string, RalphFinding[]>);
      
      let md = '# Ralph Wiggum UI/UX Findings Report\n\n';
      md += `**Generated:** ${new Date().toISOString()}\n`;
      md += `**Total Findings:** ${exportData.length}\n\n`;
      
      Object.entries(grouped).forEach(([route, routeFindings]) => {
        md += `## ${route}\n\n`;
        routeFindings.forEach(f => {
          const statusIcon = {
            new: '🆕',
            acknowledged: '👀',
            in_progress: '🔧',
            fixed: '✅',
            verified: '✔️',
            wont_fix: '❌',
            duplicate: '🔁'
          }[f.status];
          
          const typeIcon = {
            critical: '🚨',
            warning: '⚠️',
            suggestion: '💡',
            journey: '🗺️'
          }[f.finding_type];
          
          md += `### ${typeIcon} ${f.title}\n\n`;
          md += `- **Status:** ${statusIcon} ${f.status}\n`;
          md += `- **Severity:** ${f.severity}\n`;
          md += `- **Module:** ${f.module_name}\n`;
          md += `- **Occurrences:** ${f.occurrence_count}\n\n`;
          md += `${f.description}\n\n`;
          if (f.recommendation) {
            md += `**Recommendation:** ${f.recommendation}\n\n`;
          }
          md += '---\n\n';
        });
      });
      
      // Mark as exported
      const ids = exportData.map(f => f.id);
      if (ids.length > 0) {
        await supabase
          .from('ralph_wiggum_findings')
          .update({
            exported_at: new Date().toISOString(),
            export_format: format
          })
          .in('id', ids);
      }
      
      return md;
    }
    
    return '';
  }, [findings]);
  
  // Trigger analysis for current page
  const triggerAnalysis = useCallback((_pageContent: Record<string, unknown>) => {
    setIsAnalyzing(true);
    // This will be called by the RalphWiggumGlobalPanel
    setTimeout(() => setIsAnalyzing(false), 3000);
  }, []);
  
  // Filter helpers
  const filterByPage = useCallback((route: string) => 
    findings.filter(f => f.page_route === route), [findings]);
  
  const filterByStatus = useCallback((status: FindingStatus) => 
    findings.filter(f => f.status === status), [findings]);
  
  const filterByType = useCallback((type: FindingType) => 
    findings.filter(f => f.finding_type === type), [findings]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const byStatus: Record<FindingStatus, number> = {
      new: 0, acknowledged: 0, in_progress: 0, fixed: 0, verified: 0, wont_fix: 0, duplicate: 0
    };
    const byType: Record<FindingType, number> = {
      critical: 0, warning: 0, suggestion: 0, journey: 0
    };
    const byPage: Record<string, number> = {};
    
    findings.forEach(f => {
      byStatus[f.status]++;
      byType[f.finding_type]++;
      byPage[f.page_route] = (byPage[f.page_route] || 0) + 1;
    });
    
    return {
      total: findings.length,
      byStatus,
      byType,
      byPage
    };
  }, [findings]);
  
  // Memoize callbacks to prevent unnecessary re-renders
  const togglePanel = useCallback(() => setIsPanelOpen(p => !p), []);
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const setActiveOverlayCallback = useCallback((overlay: string | null) => setActiveOverlay(overlay), []);
  
  // Memoize the context value to prevent unnecessary re-renders
  const value: RalphWiggumContextValue = useMemo(() => ({
    findings,
    isLoading,
    isAnalyzing,
    currentPageRoute,
    isPanelOpen,
    isEnabled: true,
    activeOverlay,
    togglePanel,
    openPanel,
    closePanel,
    refreshFindings,
    addFinding,
    updateFindingStatus,
    deleteFinding,
    exportFindings,
    triggerAnalysis,
    setActiveOverlay: setActiveOverlayCallback,
    filterByPage,
    filterByStatus,
    filterByType,
    stats
  }), [
    findings,
    isLoading,
    isAnalyzing,
    currentPageRoute,
    isPanelOpen,
    activeOverlay,
    togglePanel,
    openPanel,
    closePanel,
    refreshFindings,
    addFinding,
    updateFindingStatus,
    deleteFinding,
    exportFindings,
    triggerAnalysis,
    setActiveOverlayCallback,
    filterByPage,
    filterByStatus,
    filterByType,
    stats
  ]);
  
  return (
    <RalphWiggumContext.Provider value={value}>
      {children}
    </RalphWiggumContext.Provider>
  );
};

// Export the appropriate provider based on environment
export const RalphWiggumProvider: React.FC<{ children: React.ReactNode }> = isDev ? DevProvider : ProductionProvider;

export const useRalphWiggumGlobal = (): RalphWiggumContextValue => {
  return useContext(RalphWiggumContext);
};
