/**
 * Production Episodes Service
 *
 * Unified cross-product linking — ties together Spark scripts,
 * Mind voiceovers, Cast videos, and Deck presentations into a
 * single "production episode" entity.
 *
 * This replaces fragile URL-param handoffs with proper DB relationships.
 *
 * Usage:
 *   import { productionEpisodesService } from '@/services/production/productionEpisodesService';
 *
 *   // Create episode from Spark script
 *   const episode = await productionEpisodesService.createFromScript(scriptId);
 *
 *   // Link Mind voiceover to episode
 *   await productionEpisodesService.linkVoiceover(episode.id, voiceoverId);
 *
 *   // Get full episode with all linked assets
 *   const full = await productionEpisodesService.getEpisode(episodeId);
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export type EpisodeStatus = 'draft' | 'in_progress' | 'review' | 'published' | 'archived';

export interface ProductionEpisode {
  id: string;
  userId: string;
  title: string;
  status: EpisodeStatus;

  // Cross-product asset references
  sparkScriptId: string | null;
  mindVoiceoverIds: string[];
  castProjectId: string | null;
  deckPresentationId: string | null;

  // Output
  finalVideoUrl: string | null;
  finalPresentationUrl: string | null;
  thumbnailUrl: string | null;

  // Metadata
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEpisodeInput {
  title: string;
  sparkScriptId?: string;
  metadata?: Record<string, unknown>;
}

export interface LinkAssetInput {
  episodeId: string;
  assetType: 'voiceover' | 'cast_project' | 'deck_presentation';
  assetId: string;
}

// ─── In-memory store (upgradable to Supabase table) ─────────────────────────
// When the `production_episodes` table is created in Supabase,
// swap the localStorage calls for supabase.from('production_episodes').

const STORAGE_KEY = 'genie_production_episodes';

function loadEpisodes(): ProductionEpisode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEpisodes(episodes: ProductionEpisode[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(episodes));
}

// ─── Service ────────────────────────────────────────────────────────────────

export const productionEpisodesService = {
  /** Create a new production episode */
  async create(input: CreateEpisodeInput): Promise<ProductionEpisode> {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id || 'anonymous';

    const episode: ProductionEpisode = {
      id: crypto.randomUUID(),
      userId,
      title: input.title,
      status: 'draft',
      sparkScriptId: input.sparkScriptId || null,
      mindVoiceoverIds: [],
      castProjectId: null,
      deckPresentationId: null,
      finalVideoUrl: null,
      finalPresentationUrl: null,
      thumbnailUrl: null,
      metadata: input.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const episodes = loadEpisodes();
    episodes.unshift(episode);
    saveEpisodes(episodes);

    return episode;
  },

  /** Create episode from a Spark script */
  async createFromScript(scriptId: string, scriptTitle: string): Promise<ProductionEpisode> {
    return this.create({
      title: scriptTitle,
      sparkScriptId: scriptId,
      metadata: { source: 'spark', originalScriptId: scriptId },
    });
  },

  /** Link a voiceover to an episode */
  async linkVoiceover(episodeId: string, voiceoverId: string): Promise<void> {
    const episodes = loadEpisodes();
    const episode = episodes.find((e) => e.id === episodeId);
    if (!episode) throw new Error(`Episode ${episodeId} not found`);

    if (!episode.mindVoiceoverIds.includes(voiceoverId)) {
      episode.mindVoiceoverIds.push(voiceoverId);
      episode.updatedAt = new Date().toISOString();
      saveEpisodes(episodes);
    }
  },

  /** Link a Cast project to an episode */
  async linkCastProject(episodeId: string, castProjectId: string): Promise<void> {
    const episodes = loadEpisodes();
    const episode = episodes.find((e) => e.id === episodeId);
    if (!episode) throw new Error(`Episode ${episodeId} not found`);

    episode.castProjectId = castProjectId;
    episode.updatedAt = new Date().toISOString();
    saveEpisodes(episodes);
  },

  /** Link a Deck presentation to an episode */
  async linkDeckPresentation(episodeId: string, deckPresentationId: string): Promise<void> {
    const episodes = loadEpisodes();
    const episode = episodes.find((e) => e.id === episodeId);
    if (!episode) throw new Error(`Episode ${episodeId} not found`);

    episode.deckPresentationId = deckPresentationId;
    episode.updatedAt = new Date().toISOString();
    saveEpisodes(episodes);
  },

  /** Get an episode by ID */
  async getEpisode(episodeId: string): Promise<ProductionEpisode | null> {
    const episodes = loadEpisodes();
    return episodes.find((e) => e.id === episodeId) || null;
  },

  /** Get episode by Spark script ID */
  async getByScriptId(scriptId: string): Promise<ProductionEpisode | null> {
    const episodes = loadEpisodes();
    return episodes.find((e) => e.sparkScriptId === scriptId) || null;
  },

  /** Get all episodes for the current user */
  async listEpisodes(status?: EpisodeStatus): Promise<ProductionEpisode[]> {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) return [];

    let episodes = loadEpisodes().filter((e) => e.userId === userId);
    if (status) {
      episodes = episodes.filter((e) => e.status === status);
    }
    return episodes;
  },

  /** Update episode status */
  async updateStatus(episodeId: string, status: EpisodeStatus): Promise<void> {
    const episodes = loadEpisodes();
    const episode = episodes.find((e) => e.id === episodeId);
    if (!episode) throw new Error(`Episode ${episodeId} not found`);

    episode.status = status;
    episode.updatedAt = new Date().toISOString();
    saveEpisodes(episodes);
  },

  /** Update episode metadata */
  async updateMetadata(episodeId: string, metadata: Record<string, unknown>): Promise<void> {
    const episodes = loadEpisodes();
    const episode = episodes.find((e) => e.id === episodeId);
    if (!episode) throw new Error(`Episode ${episodeId} not found`);

    episode.metadata = { ...episode.metadata, ...metadata };
    episode.updatedAt = new Date().toISOString();
    saveEpisodes(episodes);
  },

  /** Set final output URLs */
  async setFinalOutput(
    episodeId: string,
    output: { videoUrl?: string; presentationUrl?: string; thumbnailUrl?: string }
  ): Promise<void> {
    const episodes = loadEpisodes();
    const episode = episodes.find((e) => e.id === episodeId);
    if (!episode) throw new Error(`Episode ${episodeId} not found`);

    if (output.videoUrl !== undefined) episode.finalVideoUrl = output.videoUrl;
    if (output.presentationUrl !== undefined) episode.finalPresentationUrl = output.presentationUrl;
    if (output.thumbnailUrl !== undefined) episode.thumbnailUrl = output.thumbnailUrl;
    episode.updatedAt = new Date().toISOString();
    saveEpisodes(episodes);
  },

  /** Delete an episode */
  async deleteEpisode(episodeId: string): Promise<void> {
    const episodes = loadEpisodes().filter((e) => e.id !== episodeId);
    saveEpisodes(episodes);
  },
};
