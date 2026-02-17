/**
 * Circuit Breaker Service
 * P4-REC-05: Auto-disable failing providers after N consecutive failures
 * 
 * Implements the Circuit Breaker pattern for provider resilience:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Provider disabled, requests fail fast
 * - HALF_OPEN: Testing if provider recovered
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening
  successThreshold: number;      // Number of successes to close from half-open
  timeout: number;               // Time in ms before attempting recovery
  monitoringWindow: number;      // Time window for failure counting
}

export interface ProviderCircuit {
  providerId: string;
  providerName: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  openedAt: number | null;
  halfOpenAt: number | null;
  totalRequests: number;
  totalFailures: number;
  consecutiveSuccesses: number;
}

export interface CircuitBreakerEvent {
  type: 'STATE_CHANGE' | 'FAILURE' | 'SUCCESS' | 'TIMEOUT';
  providerId: string;
  previousState?: CircuitState;
  newState?: CircuitState;
  timestamp: number;
  details?: string;
}

// Default configurations by provider type
const DEFAULT_CONFIGS: Record<string, CircuitBreakerConfig> = {
  llm: { failureThreshold: 5, successThreshold: 3, timeout: 60000, monitoringWindow: 300000 },
  tts: { failureThreshold: 3, successThreshold: 2, timeout: 30000, monitoringWindow: 180000 },
  image: { failureThreshold: 4, successThreshold: 2, timeout: 45000, monitoringWindow: 240000 },
  video: { failureThreshold: 3, successThreshold: 2, timeout: 90000, monitoringWindow: 600000 },
  translation: { failureThreshold: 5, successThreshold: 3, timeout: 30000, monitoringWindow: 180000 },
  default: { failureThreshold: 5, successThreshold: 3, timeout: 60000, monitoringWindow: 300000 },
};

class CircuitBreakerService {
  private circuits: Map<string, ProviderCircuit> = new Map();
  private configs: Map<string, CircuitBreakerConfig> = new Map();
  private eventListeners: ((event: CircuitBreakerEvent) => void)[] = [];
  private recoveryTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Load persisted state
    this.loadPersistedState();
  }

  // ============================================================================
  // CIRCUIT MANAGEMENT
  // ============================================================================

  /**
   * Register a provider with the circuit breaker
   */
  registerProvider(
    providerId: string,
    providerName: string,
    providerType: string = 'default',
    customConfig?: Partial<CircuitBreakerConfig>
  ): void {
    const baseConfig = DEFAULT_CONFIGS[providerType] || DEFAULT_CONFIGS.default;
    const config = { ...baseConfig, ...customConfig };
    
    this.configs.set(providerId, config);
    
    if (!this.circuits.has(providerId)) {
      this.circuits.set(providerId, {
        providerId,
        providerName,
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        lastFailureTime: null,
        lastSuccessTime: null,
        openedAt: null,
        halfOpenAt: null,
        totalRequests: 0,
        totalFailures: 0,
        consecutiveSuccesses: 0,
      });
    }
  }

  /**
   * Check if a provider is available
   */
  isAvailable(providerId: string): boolean {
    const circuit = this.circuits.get(providerId);
    if (!circuit) return true; // Unknown providers are available
    
    // Check if we should transition from OPEN to HALF_OPEN
    if (circuit.state === 'OPEN' && circuit.openedAt) {
      const config = this.configs.get(providerId) || DEFAULT_CONFIGS.default;
      if (Date.now() - circuit.openedAt >= config.timeout) {
        this.transitionState(providerId, 'HALF_OPEN');
        return true;
      }
      return false;
    }
    
    return circuit.state !== 'OPEN';
  }

  /**
   * Record a successful request
   */
  recordSuccess(providerId: string): void {
    const circuit = this.circuits.get(providerId);
    if (!circuit) return;

    const config = this.configs.get(providerId) || DEFAULT_CONFIGS.default;
    const now = Date.now();

    circuit.totalRequests++;
    circuit.lastSuccessTime = now;
    circuit.consecutiveSuccesses++;
    circuit.failureCount = 0; // Reset failure count on success

    if (circuit.state === 'HALF_OPEN') {
      circuit.successCount++;
      if (circuit.successCount >= config.successThreshold) {
        this.transitionState(providerId, 'CLOSED');
      }
    }

    this.persistState();
    this.emitEvent({ type: 'SUCCESS', providerId, timestamp: now });
  }

  /**
   * Record a failed request
   */
  recordFailure(providerId: string, error?: Error): void {
    const circuit = this.circuits.get(providerId);
    if (!circuit) return;

    const config = this.configs.get(providerId) || DEFAULT_CONFIGS.default;
    const now = Date.now();

    // Clean old failures outside monitoring window
    if (circuit.lastFailureTime && now - circuit.lastFailureTime > config.monitoringWindow) {
      circuit.failureCount = 0;
    }

    circuit.totalRequests++;
    circuit.totalFailures++;
    circuit.failureCount++;
    circuit.lastFailureTime = now;
    circuit.consecutiveSuccesses = 0;

    if (circuit.state === 'HALF_OPEN') {
      // Immediately re-open on failure during half-open
      this.transitionState(providerId, 'OPEN');
    } else if (circuit.state === 'CLOSED' && circuit.failureCount >= config.failureThreshold) {
      this.transitionState(providerId, 'OPEN');
    }

    this.persistState();
    this.emitEvent({
      type: 'FAILURE',
      providerId,
      timestamp: now,
      details: error?.message,
    });
  }

  /**
   * Force a provider state
   */
  forceState(providerId: string, state: CircuitState): void {
    this.transitionState(providerId, state, true);
  }

  /**
   * Reset a provider's circuit
   */
  reset(providerId: string): void {
    const circuit = this.circuits.get(providerId);
    if (!circuit) return;

    circuit.state = 'CLOSED';
    circuit.failureCount = 0;
    circuit.successCount = 0;
    circuit.consecutiveSuccesses = 0;
    circuit.openedAt = null;
    circuit.halfOpenAt = null;

    this.clearRecoveryTimer(providerId);
    this.persistState();
  }

  // ============================================================================
  // STATE TRANSITIONS
  // ============================================================================

  private transitionState(providerId: string, newState: CircuitState, forced = false): void {
    const circuit = this.circuits.get(providerId);
    if (!circuit || circuit.state === newState) return;

    const previousState = circuit.state;
    const now = Date.now();

    circuit.state = newState;

    switch (newState) {
      case 'OPEN':
        circuit.openedAt = now;
        circuit.halfOpenAt = null;
        circuit.successCount = 0;
        this.scheduleRecoveryAttempt(providerId);
        console.warn(`[CircuitBreaker] ${circuit.providerName} OPENED - failures: ${circuit.failureCount}`);
        break;
        
      case 'HALF_OPEN':
        circuit.halfOpenAt = now;
        circuit.successCount = 0;
        this.clearRecoveryTimer(providerId);
        console.info(`[CircuitBreaker] ${circuit.providerName} HALF_OPEN - testing recovery`);
        break;
        
      case 'CLOSED':
        circuit.openedAt = null;
        circuit.halfOpenAt = null;
        circuit.failureCount = 0;
        circuit.successCount = 0;
        this.clearRecoveryTimer(providerId);
        console.info(`[CircuitBreaker] ${circuit.providerName} CLOSED - recovered`);
        break;
    }

    this.persistState();
    this.emitEvent({
      type: 'STATE_CHANGE',
      providerId,
      previousState,
      newState,
      timestamp: now,
      details: forced ? 'Forced transition' : undefined,
    });
  }

  private scheduleRecoveryAttempt(providerId: string): void {
    this.clearRecoveryTimer(providerId);

    const config = this.configs.get(providerId) || DEFAULT_CONFIGS.default;
    const timer = setTimeout(() => {
      if (this.circuits.get(providerId)?.state === 'OPEN') {
        this.transitionState(providerId, 'HALF_OPEN');
      }
    }, config.timeout);

    this.recoveryTimers.set(providerId, timer);
  }

  private clearRecoveryTimer(providerId: string): void {
    const timer = this.recoveryTimers.get(providerId);
    if (timer) {
      clearTimeout(timer);
      this.recoveryTimers.delete(providerId);
    }
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  getCircuitState(providerId: string): ProviderCircuit | null {
    return this.circuits.get(providerId) || null;
  }

  getAllCircuits(): ProviderCircuit[] {
    return Array.from(this.circuits.values());
  }

  getOpenCircuits(): ProviderCircuit[] {
    return this.getAllCircuits().filter(c => c.state === 'OPEN');
  }

  getHealthyProviders(providerIds: string[]): string[] {
    return providerIds.filter(id => this.isAvailable(id));
  }

  getCircuitStats(): {
    total: number;
    closed: number;
    open: number;
    halfOpen: number;
    overallHealth: number;
  } {
    const circuits = this.getAllCircuits();
    const closed = circuits.filter(c => c.state === 'CLOSED').length;
    const open = circuits.filter(c => c.state === 'OPEN').length;
    const halfOpen = circuits.filter(c => c.state === 'HALF_OPEN').length;

    return {
      total: circuits.length,
      closed,
      open,
      halfOpen,
      overallHealth: circuits.length > 0 ? (closed / circuits.length) * 100 : 100,
    };
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  onEvent(listener: (event: CircuitBreakerEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index >= 0) this.eventListeners.splice(index, 1);
    };
  }

  private emitEvent(event: CircuitBreakerEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('[CircuitBreaker] Event listener error:', e);
      }
    });
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  private persistState(): void {
    try {
      const state = Object.fromEntries(this.circuits);
      localStorage.setItem('circuit_breaker_state', JSON.stringify(state));
    } catch (e) {
      console.warn('[CircuitBreaker] Failed to persist state:', e);
    }
  }

  private loadPersistedState(): void {
    try {
      const stored = localStorage.getItem('circuit_breaker_state');
      if (stored) {
        const state = JSON.parse(stored) as Record<string, ProviderCircuit>;
        Object.entries(state).forEach(([id, circuit]) => {
          this.circuits.set(id, circuit);
          // Reschedule recovery for open circuits
          if (circuit.state === 'OPEN') {
            this.scheduleRecoveryAttempt(id);
          }
        });
      }
    } catch (e) {
      console.warn('[CircuitBreaker] Failed to load persisted state:', e);
    }
  }
}

// Singleton instance
export const circuitBreakerService = new CircuitBreakerService();

// Provider registration helpers
export function registerProviders(): void {
  // LLM Providers
  circuitBreakerService.registerProvider('openai', 'OpenAI', 'llm');
  circuitBreakerService.registerProvider('claude', 'Claude', 'llm');
  circuitBreakerService.registerProvider('gemini', 'Gemini', 'llm');
  circuitBreakerService.registerProvider('deepseek', 'DeepSeek', 'llm');
  
  // TTS Providers
  circuitBreakerService.registerProvider('elevenlabs', 'ElevenLabs', 'tts');
  circuitBreakerService.registerProvider('azure-tts', 'Azure TTS', 'tts');
  circuitBreakerService.registerProvider('alibaba-qwen3-tts', 'Alibaba Qwen3-TTS', 'tts');
  
  // Image Providers
  circuitBreakerService.registerProvider('modelslab', 'ModelsLab', 'image');
  circuitBreakerService.registerProvider('replicate', 'Replicate', 'image');
  
  // Video Providers
  circuitBreakerService.registerProvider('modelslab-video', 'ModelsLab Video', 'video');
  circuitBreakerService.registerProvider('alibaba-wan', 'Alibaba Wan2.2', 'video');
  
  // Translation
  circuitBreakerService.registerProvider('deepl', 'DeepL', 'translation');
  circuitBreakerService.registerProvider('google-translate', 'Google Translate', 'translation');
}

// Initialize on import
registerProviders();
