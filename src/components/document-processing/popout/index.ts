/**
 * Pop-out Genie Vibe
 * 
 * This module provides the pop-out Genie Vibe (recording studio) functionality.
 * Modular architecture with separate files for styles, template, camera, and UI logic.
 */

export { openPopoutRecordingStudio } from './openPopoutRecordingStudio';
export { generatePopoutHTML } from './generatePopoutHTML';
export { getStatePersistenceScript, getStatePersistenceStyles } from './popoutStatePersistence';
export { getBackendSyncScript, getBackendSyncStyles } from './popoutBackendSync';
export type { 
  PopoutConfig, 
  PopoutScriptData, 
  PopoutVoiceoverData, 
  PopoutMusicData,
  MediaItemForPopout,
  ScriptItemForPopout
} from './types';
export type { PopoutRecordingState } from './popoutStatePersistence';
export type { BackendSyncConfig } from './popoutBackendSync';
