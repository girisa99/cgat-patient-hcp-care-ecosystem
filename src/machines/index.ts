/**
 * Machines — XState Workflow Orchestration
 *
 * Layer 2 of the state management architecture:
 *   Layer 1: Zustand  → Global shared state (stores/)
 *   Layer 2: XState   → Workflow orchestration (machines/)
 *   Layer 3: useReducer → Complex component state (per-component)
 */

export { castSessionMachine, getStageLabel, getStageProgress, getStageMap } from './castSessionMachine';
export type { CastSessionContext } from './castSessionMachine';
