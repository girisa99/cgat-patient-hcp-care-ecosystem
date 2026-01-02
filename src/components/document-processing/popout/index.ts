/**
 * Pop-out Recording Studio
 * 
 * This module provides the pop-out recording studio functionality.
 * Modular architecture with separate files for styles, template, camera, and UI logic.
 */

export { openPopoutRecordingStudio } from './openPopoutRecordingStudio';
export { generatePopoutHTML } from './generatePopoutHTML';
export type { 
  PopoutConfig, 
  PopoutScriptData, 
  PopoutVoiceoverData, 
  PopoutMusicData,
  MediaItemForPopout,
  ScriptItemForPopout
} from './types';
