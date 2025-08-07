/**
 * Global Session Save Manager
 * Prevents concurrent session saves across all components
 */

class SessionSaveManager {
  private activeSaves = new Set<string>();
  private savePromises = new Map<string, Promise<any>>();

  async saveSession(sessionId: string, saveFunction: () => Promise<any>): Promise<any> {
    // If already saving this session, return the existing promise
    if (this.activeSaves.has(sessionId)) {
      const existingPromise = this.savePromises.get(sessionId);
      if (existingPromise) {
        console.log(`🔄 Session ${sessionId} already being saved, waiting for completion...`);
        return existingPromise;
      }
    }

    // Mark as active and create promise
    this.activeSaves.add(sessionId);
    const savePromise = this.performSave(sessionId, saveFunction);
    this.savePromises.set(sessionId, savePromise);

    return savePromise;
  }

  private async performSave(sessionId: string, saveFunction: () => Promise<any>): Promise<any> {
    try {
      console.log(`🔒 Starting protected save for session ${sessionId}`);
      const result = await saveFunction();
      console.log(`✅ Protected save completed for session ${sessionId}`);
      return result;
    } catch (error) {
      console.error(`❌ Protected save failed for session ${sessionId}:`, error);
      throw error;
    } finally {
      // Clean up
      this.activeSaves.delete(sessionId);
      this.savePromises.delete(sessionId);
      console.log(`🧹 Cleaned up save lock for session ${sessionId}`);
    }
  }

  isSessionBeingSaved(sessionId: string): boolean {
    return this.activeSaves.has(sessionId);
  }

  getActiveSaves(): string[] {
    return Array.from(this.activeSaves);
  }
}

// Global singleton instance
export const sessionSaveManager = new SessionSaveManager();