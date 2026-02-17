/**
 * ProjectAssetBreakdown - CONSOLIDATED
 * 
 * Now re-exports from UnifiedCostPanel for backwards compatibility.
 * The UnifiedCostPanel combines VibeCostTracker + ProjectAssetBreakdown.
 */

import React from 'react';
import { UnifiedCostPanel } from '@/components/shared/UnifiedCostPanel';
import type { MediaProjectAsset } from '../hooks/useMediaProject';

interface ProjectAssetBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  assets: MediaProjectAsset[];
  totalCost: number;
}

export function ProjectAssetBreakdown({
  isOpen,
  onClose,
  projectName,
  assets,
  totalCost,
}: ProjectAssetBreakdownProps) {
  // Create a minimal project object for the unified component
  const project = {
    id: 'legacy',
    name: projectName,
    status: 'active',
    total_estimated_cost: totalCost,
  };

  return (
    <UnifiedCostPanel
      mode="sheet"
      project={project}
      assets={assets}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
