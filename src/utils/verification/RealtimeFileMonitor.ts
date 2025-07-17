/**
 * Real-time File System Monitor
 * Monitors filesystem changes to detect duplicate code patterns
 */

export interface FileChangeEvent {
  type: 'created' | 'modified' | 'deleted';
  path: string;
  timestamp: Date;
  content?: string;
}

export interface DuplicateCodeAlert {
  severity: 'low' | 'medium' | 'high';
  duplicateType: 'exact' | 'similar' | 'pattern';
  files: string[];
  similarityScore: number;
  suggestions: string[];
}

export class RealtimeFileMonitor {
  private watchedPaths: Set<string> = new Set();
  private duplicateThreshold = 0.85; // 85% similarity
  private callbacks: Map<string, Function[]> = new Map();
  private fileCache: Map<string, string> = new Map();

  /**
   * Start monitoring specified paths
   */
  startMonitoring(paths: string[]): void {
    console.log('🔍 Starting real-time file monitoring...');
    
    paths.forEach(path => {
      this.watchedPaths.add(path);
      // In a real implementation, this would use filesystem watchers
      this.simulateFileWatching(path);
    });
  }

  /**
   * Stop monitoring all paths
   */
  stopMonitoring(): void {
    console.log('⏹️ Stopping file monitoring...');
    this.watchedPaths.clear();
    this.callbacks.clear();
  }

  /**
   * Register callback for duplicate detection events
   */
  onDuplicateDetected(callback: (alert: DuplicateCodeAlert) => void): void {
    const callbacks = this.callbacks.get('duplicate') || [];
    callbacks.push(callback);
    this.callbacks.set('duplicate', callbacks);
  }

  /**
   * Register callback for file change events
   */
  onFileChanged(callback: (event: FileChangeEvent) => void): void {
    const callbacks = this.callbacks.get('fileChange') || [];
    callbacks.push(callback);
    this.callbacks.set('fileChange', callbacks);
  }

  /**
   * Simulate file watching (in real implementation, use fs.watch or chokidar)
   */
  private simulateFileWatching(path: string): void {
    // This would be replaced with actual filesystem watching
    // For demonstration purposes, we simulate periodic checks
    setInterval(() => {
      this.checkForDuplicates(path);
    }, 5000); // Check every 5 seconds
  }

  /**
   * Check for duplicate code patterns
   */
  private async checkForDuplicates(path: string): Promise<void> {
    try {
      // In real implementation, read actual files
      const mockFiles = this.getMockFileContents(path);
      const duplicates = await this.analyzeDuplicates(mockFiles);
      
      if (duplicates.length > 0) {
        duplicates.forEach(duplicate => {
          this.notifyDuplicateDetected(duplicate);
        });
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    }
  }

  /**
   * Analyze files for duplicate patterns
   */
  private async analyzeDuplicates(files: { path: string; content: string }[]): Promise<DuplicateCodeAlert[]> {
    const alerts: DuplicateCodeAlert[] = [];
    
    // Compare each file against others
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const similarity = this.calculateSimilarity(files[i].content, files[j].content);
        
        if (similarity > this.duplicateThreshold) {
          alerts.push({
            severity: similarity > 0.95 ? 'high' : similarity > 0.9 ? 'medium' : 'low',
            duplicateType: similarity > 0.98 ? 'exact' : similarity > 0.9 ? 'similar' : 'pattern',
            files: [files[i].path, files[j].path],
            similarityScore: similarity,
            suggestions: this.generateDuplicateSuggestions(files[i], files[j], similarity)
          });
        }
      }
    }
    
    return alerts;
  }

  /**
   * Calculate similarity between two code snippets
   */
  private calculateSimilarity(content1: string, content2: string): number {
    // Simple similarity calculation (in real implementation, use more sophisticated algorithms)
    if (content1 === content2) return 1.0;
    
    const lines1 = content1.split('\n').filter(line => line.trim());
    const lines2 = content2.split('\n').filter(line => line.trim());
    
    let matches = 0;
    const totalLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < Math.min(lines1.length, lines2.length); i++) {
      if (lines1[i].trim() === lines2[i].trim()) {
        matches++;
      }
    }
    
    return matches / totalLines;
  }

  /**
   * Generate suggestions for duplicate code
   */
  private generateDuplicateSuggestions(
    file1: { path: string; content: string },
    file2: { path: string; content: string },
    similarity: number
  ): string[] {
    const suggestions = [];
    
    if (similarity > 0.95) {
      suggestions.push('Consider creating a shared utility function');
      suggestions.push('Extract common logic into a reusable component');
    }
    
    if (file1.path.includes('Component') && file2.path.includes('Component')) {
      suggestions.push('Create a base component with common functionality');
      suggestions.push('Use composition pattern to share behavior');
    }
    
    if (file1.path.includes('hook') || file2.path.includes('hook')) {
      suggestions.push('Combine similar hooks into a single customizable hook');
      suggestions.push('Create hook composition pattern');
    }
    
    suggestions.push('Review code for refactoring opportunities');
    
    return suggestions;
  }

  /**
   * Notify registered callbacks about duplicate detection
   */
  private notifyDuplicateDetected(alert: DuplicateCodeAlert): void {
    const callbacks = this.callbacks.get('duplicate') || [];
    callbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in duplicate detection callback:', error);
      }
    });
  }

  /**
   * Mock file contents for demonstration
   */
  private getMockFileContents(path: string): { path: string; content: string }[] {
    return [
      {
        path: `${path}/Component1.tsx`,
        content: `
          import React from 'react';
          export const Component1 = () => {
            const handleClick = () => console.log('clicked');
            return <button onClick={handleClick}>Click me</button>;
          };
        `
      },
      {
        path: `${path}/Component2.tsx`,
        content: `
          import React from 'react';
          export const Component2 = () => {
            const handleClick = () => console.log('clicked');
            return <button onClick={handleClick}>Click me too</button>;
          };
        `
      }
    ];
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats() {
    return {
      watchedPaths: Array.from(this.watchedPaths),
      activeCallbacks: this.callbacks.size,
      duplicateThreshold: this.duplicateThreshold,
      isActive: this.watchedPaths.size > 0
    };
  }

  /**
   * Update duplicate detection threshold
   */
  setDuplicateThreshold(threshold: number): void {
    if (threshold >= 0 && threshold <= 1) {
      this.duplicateThreshold = threshold;
      console.log(`🔧 Duplicate threshold updated to ${threshold * 100}%`);
    }
  }
}

export const realtimeFileMonitor = new RealtimeFileMonitor();