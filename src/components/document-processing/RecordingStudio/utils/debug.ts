/**
 * Debug utility for RecordingStudio
 * Centralizes logging and allows easy enable/disable
 */

const DEBUG_ENABLED = process.env.NODE_ENV === 'development';

type LogLevel = 'info' | 'warn' | 'error';

interface DebugOptions {
  prefix?: string;
  level?: LogLevel;
}

/**
 * Debug logger that only logs in development mode
 */
export function debug(message: string, data?: unknown, options: DebugOptions = {}) {
  if (!DEBUG_ENABLED) return;
  
  const { prefix = '[RecordingStudio]', level = 'info' } = options;
  const fullMessage = `${prefix} ${message}`;
  
  switch (level) {
    case 'error':
      console.error(fullMessage, data !== undefined ? data : '');
      break;
    case 'warn':
      console.warn(fullMessage, data !== undefined ? data : '');
      break;
    default:
      console.log(fullMessage, data !== undefined ? data : '');
  }
}

/**
 * Create a scoped debug logger with a specific prefix
 */
export function createDebugLogger(prefix: string) {
  return {
    log: (message: string, data?: unknown) => debug(message, data, { prefix }),
    warn: (message: string, data?: unknown) => debug(message, data, { prefix, level: 'warn' }),
    error: (message: string, data?: unknown) => debug(message, data, { prefix, level: 'error' }),
  };
}

// Pre-configured loggers for different modules
export const recordingLog = createDebugLogger('[Recording]');
export const audioLog = createDebugLogger('[Audio]');
export const scriptLog = createDebugLogger('[Script]');
export const cameraLog = createDebugLogger('[Camera]');
export const studioLog = createDebugLogger('[RecordingStudio]');
