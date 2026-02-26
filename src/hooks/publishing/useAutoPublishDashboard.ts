/**
 * useAutoPublishDashboard — React hook for the auto-publish review/approval workflow.
 *
 * Manages content batch generation, approval state, transcreation triggers,
 * and publishing actions for the AskGenie auto-publisher.
 */

import { useState, useCallback, useMemo } from 'react';
import type { PublishingOperationResult } from '@/types/publishing';
import {
  type AutoPublishContentItem,
  type AutoPublishContentPlan,
  type MessagingArchetype,
  type IndustryVertical,
  generateContentPlan,
  generateContentBatch,
  rotateArchetypes,
} from '@/services/publishing/autoPublishContentEngine';
import { transcreateContent } from '@/services/publishing/autoPublishTranscreator';

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAutoPublishDashboard() {
  const [contentItems, setContentItems] = useState<AutoPublishContentItem[]>([]);
  const [currentPlan, setCurrentPlan] = useState<AutoPublishContentPlan | null>(null);
  const [cadenceDays, setCadenceDays] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filters
  const [archetypeFilter, setArchetypeFilter] = useState<MessagingArchetype | null>(null);
  const [industryFilter, setIndustryFilter] = useState<IndustryVertical | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // ── Derived lists ─────────────────────────────────────────────────────

  const filteredItems = useMemo(() => {
    let items = contentItems;
    if (archetypeFilter) items = items.filter(i => i.archetype === archetypeFilter);
    if (industryFilter) items = items.filter(i => i.industry === industryFilter);
    if (statusFilter) items = items.filter(i => i.status === statusFilter);
    return items;
  }, [contentItems, archetypeFilter, industryFilter, statusFilter]);

  const pendingReview = useMemo(
    () => contentItems.filter(i => i.status === 'draft' || i.status === 'pending_review'),
    [contentItems],
  );

  const approved = useMemo(
    () => contentItems.filter(i => i.status === 'approved'),
    [contentItems],
  );

  const published = useMemo(
    () => contentItems.filter(i => i.status === 'published'),
    [contentItems],
  );

  // ── Actions ──────────────────────────────────────────────────────────

  const generateNewBatch = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Rotate archetypes based on previous batch for variety
      const rotated = contentItems.length > 0
        ? rotateArchetypes(contentItems)
        : undefined;

      const plan = generateContentPlan({
        cadenceDays,
        targetArchetypes: rotated,
      });
      setCurrentPlan(plan);

      const batch = generateContentBatch(plan);
      // Mark as pending_review
      const withStatus = batch.map(item => ({ ...item, status: 'pending_review' as const }));
      setContentItems(prev => [...withStatus, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  }, [cadenceDays, contentItems]);

  const approveItem = useCallback((itemId: string, notes?: string) => {
    setContentItems(prev =>
      prev.map(item =>
        item.itemId === itemId
          ? {
              ...item,
              status: 'approved' as const,
              reviewNotes: notes,
              approvedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  }, []);

  const rejectItem = useCallback((itemId: string, reason: string) => {
    setContentItems(prev =>
      prev.map(item =>
        item.itemId === itemId
          ? { ...item, status: 'rejected' as const, reviewNotes: reason }
          : item,
      ),
    );
  }, []);

  const publishApproved = useCallback(async (): Promise<PublishingOperationResult[]> => {
    // Mark all approved as published (actual API calls would happen via usePublishingSession)
    const results: PublishingOperationResult[] = [];
    setContentItems(prev =>
      prev.map(item => {
        if (item.status === 'approved') {
          results.push(
            ...item.publishTargets.map(platformId => ({
              platformId,
              success: true,
              deliveryMode: 'direct_publish' as const,
            })),
          );
          return { ...item, status: 'published' as const, publishResults: results };
        }
        return item;
      }),
    );
    return results;
  }, []);

  const scheduleApproved = useCallback(async (scheduledAt: string) => {
    setContentItems(prev =>
      prev.map(item =>
        item.status === 'approved'
          ? { ...item, status: 'scheduled' as const }
          : item,
      ),
    );
  }, []);

  const transcreateItem = useCallback(async (itemId: string) => {
    setContentItems(prev =>
      prev.map(item => {
        if (item.itemId !== itemId) return item;
        const results = transcreateContent({
          titleEN: item.titleEN,
          bodyEN: item.bodyEN,
          ctaEN: item.ctaEN,
          hashtagsEN: item.hashtags,
        });
        const transcreations: AutoPublishContentItem['transcreations'] = {};
        for (const r of results) {
          const key = r.subRegionCode ? `${r.regionCode}_${r.subRegionCode}` : r.regionCode;
          transcreations[key] = {
            title: r.title,
            body: r.body,
            cta: r.cta,
            hashtags: r.hashtags,
            language: r.language,
            isRTL: r.isRTL,
          };
        }
        return { ...item, transcreations };
      }),
    );
  }, []);

  const transcreateAll = useCallback(async () => {
    const approvedIds = approved.map(i => i.itemId);
    for (const id of approvedIds) {
      await transcreateItem(id);
    }
  }, [approved, transcreateItem]);

  // ── Filter setters ───────────────────────────────────────────────────

  const filterByArchetype = useCallback((archetype: MessagingArchetype) => {
    setArchetypeFilter(prev => (prev === archetype ? null : archetype));
  }, []);

  const filterByIndustry = useCallback((vertical: IndustryVertical) => {
    setIndustryFilter(prev => (prev === vertical ? null : vertical));
  }, []);

  const filterByStatus = useCallback((status: string) => {
    setStatusFilter(prev => (prev === status ? null : status));
  }, []);

  return {
    // Content
    contentItems: filteredItems,
    allItems: contentItems,
    pendingReview,
    approved,
    published,
    currentPlan,
    // Actions
    generateNewBatch,
    approveItem,
    rejectItem,
    publishApproved,
    scheduleApproved,
    // Transcreation
    transcreateItem,
    transcreateAll,
    // Filters
    filterByArchetype,
    filterByIndustry,
    filterByStatus,
    archetypeFilter,
    industryFilter,
    statusFilter,
    // Settings
    cadenceDays,
    setCadenceDays,
    isGenerating,
  };
}
