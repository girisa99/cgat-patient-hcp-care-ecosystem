/**
 * Ralph Wiggum - Automated AI Review System for Genie Studio
 * DEV-ONLY: Reviews content quality across all modules
 * 
 * @description Exports the hook, panel, and types for the Ralph Wiggum review system.
 * This system provides automated content analysis for:
 * - Spark: Ideas/brainstorming quality
 * - Mind: Script, TTS, Voice content
 * - Vibe: Recording, clips, timeline
 * - Guided: Workflow progress
 * - Agents: Agent performance
 * - Ask Genie: Conversation quality
 * - Arc: Production hub status
 */

export { useRalphWiggum } from './useRalphWiggum';
export { RalphWiggumPanel } from './RalphWiggumPanel';
export * from './types';
