/**
 * Retry UI Component
 * P4-REC-07: User-facing retry controls for failed operations
 * 
 * Features:
 * - Visual retry button with attempt tracking
 * - Exponential backoff indicator
 * - Provider status display
 * - Auto-retry with user override
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, RefreshCw, CheckCircle2, Clock, XCircle, Loader2, Settings2 } from 'lucide-react';
import { circuitBreakerService, type ProviderCircuit } from '@/services/resilience/circuitBreakerService';
import { gracefulDegradationService, type QualityTier } from '@/services/resilience/gracefulDegradationService';
import { cn } from '@/lib/utils';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  showProviderStatus: boolean;
  autoRetry: boolean;
  autoRetryDelayMs: number;
}

export interface RetryState {
  isRetrying: boolean;
  attemptNumber: number;
  lastError: string | null;
  nextRetryAt: number | null;
  providersAttempted: string[];
  currentProvider: string | null;
  degradedTier: QualityTier | null;
}

interface RetryUIProps {
  operationName: string;
  capability: string;
  onRetry: () => Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
  error?: Error | string | null;
  config?: Partial<RetryConfig>;
  className?: string;
  compact?: boolean;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  showProviderStatus: true,
  autoRetry: false,
  autoRetryDelayMs: 5000,
};

export const RetryUI: React.FC<RetryUIProps> = ({
  operationName,
  capability,
  onRetry,
  onCancel,
  onSuccess,
  error,
  config: userConfig,
  className,
  compact = false,
}) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attemptNumber: 0,
    lastError: error ? (error instanceof Error ? error.message : error) : null,
    nextRetryAt: null,
    providersAttempted: [],
    currentProvider: null,
    degradedTier: null,
  });

  const [countdown, setCountdown] = useState<number>(0);
  const [providerCircuits, setProviderCircuits] = useState<ProviderCircuit[]>([]);

  // Load provider states
  useEffect(() => {
    const circuits = circuitBreakerService.getAllCircuits();
    setProviderCircuits(circuits);
  }, [state.attemptNumber]);

  // Auto-retry countdown
  useEffect(() => {
    if (!config.autoRetry || state.isRetrying || !state.lastError) return;
    if (state.attemptNumber >= config.maxRetries) return;

    const startTime = Date.now();
    const endTime = startTime + config.autoRetryDelayMs;
    setState(s => ({ ...s, nextRetryAt: endTime }));

    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setCountdown(Math.ceil(remaining / 1000));
      
      if (remaining <= 0) {
        clearInterval(interval);
        handleRetry();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [state.lastError, state.attemptNumber, config.autoRetry]);

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelayMs);
  }, [config]);

  const handleRetry = useCallback(async () => {
    const newAttempt = state.attemptNumber + 1;
    
    if (newAttempt > config.maxRetries) {
      return;
    }

    setState(s => ({
      ...s,
      isRetrying: true,
      attemptNumber: newAttempt,
      lastError: null,
      nextRetryAt: null,
    }));

    try {
      // Get best available provider
      const provider = gracefulDegradationService.getBestAvailableProvider(capability);
      
      setState(s => ({
        ...s,
        currentProvider: provider?.providerName || null,
        degradedTier: provider?.tier || null,
        providersAttempted: [...s.providersAttempted, provider?.providerId || 'unknown'],
      }));

      await onRetry();
      
      setState(s => ({
        ...s,
        isRetrying: false,
        lastError: null,
      }));
      
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      setState(s => ({
        ...s,
        isRetrying: false,
        lastError: errorMessage,
      }));

      // Schedule next retry if auto-retry enabled
      if (config.autoRetry && newAttempt < config.maxRetries) {
        const delay = calculateDelay(newAttempt);
        setState(s => ({ ...s, nextRetryAt: Date.now() + delay }));
      }
    }
  }, [state.attemptNumber, config, capability, onRetry, onSuccess, calculateDelay]);

  const handleCancel = useCallback(() => {
    setState({
      isRetrying: false,
      attemptNumber: 0,
      lastError: null,
      nextRetryAt: null,
      providersAttempted: [],
      currentProvider: null,
      degradedTier: null,
    });
    onCancel?.();
  }, [onCancel]);

  const getStatusColor = (circuit: ProviderCircuit) => {
    switch (circuit.state) {
      case 'CLOSED': return 'text-green-500';
      case 'HALF_OPEN': return 'text-yellow-500';
      case 'OPEN': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (circuit: ProviderCircuit) => {
    switch (circuit.state) {
      case 'CLOSED': return <CheckCircle2 className="h-3 w-3" />;
      case 'HALF_OPEN': return <Clock className="h-3 w-3" />;
      case 'OPEN': return <XCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  // Compact mode for inline use
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {state.isRetrying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Retrying ({state.attemptNumber}/{config.maxRetries})...
            </span>
          </>
        ) : state.lastError ? (
          <>
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive truncate max-w-[200px]">
              {state.lastError}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={state.attemptNumber >= config.maxRetries}
              className="h-7"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </>
        ) : null}
      </div>
    );
  }

  // Full mode
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {state.isRetrying ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : state.lastError ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : (
            <Settings2 className="h-5 w-5" />
          )}
          {operationName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Display */}
        {state.lastError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{state.lastError}</p>
          </div>
        )}

        {/* Retry Progress */}
        {(state.attemptNumber > 0 || state.isRetrying) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Retry attempts</span>
              <span>{state.attemptNumber} / {config.maxRetries}</span>
            </div>
            <Progress 
              value={(state.attemptNumber / config.maxRetries) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Current Provider */}
        {state.currentProvider && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Using provider</span>
            <div className="flex items-center gap-2">
              <span>{state.currentProvider}</span>
              {state.degradedTier && state.degradedTier !== 'premium' && (
                <Badge variant="secondary" className="text-xs">
                  {state.degradedTier}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Auto-retry countdown */}
        {state.nextRetryAt && countdown > 0 && !state.isRetrying && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Auto-retry in {countdown}s</span>
          </div>
        )}

        {/* Provider Status Grid */}
        {config.showProviderStatus && providerCircuits.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Provider Status</p>
            <div className="grid grid-cols-2 gap-2">
              {providerCircuits.slice(0, 6).map(circuit => (
                <div 
                  key={circuit.providerId}
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded border",
                    circuit.state === 'OPEN' && "opacity-50"
                  )}
                >
                  <span className={getStatusColor(circuit)}>
                    {getStatusIcon(circuit)}
                  </span>
                  <span className="truncate">{circuit.providerName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleRetry}
            disabled={state.isRetrying || state.attemptNumber >= config.maxRetries}
            className="flex-1"
          >
            {state.isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {state.attemptNumber >= config.maxRetries ? 'Max Retries Reached' : 'Retry Now'}
              </>
            )}
          </Button>
          
          {onCancel && (
            <Button variant="outline" onClick={handleCancel} disabled={state.isRetrying}>
              Cancel
            </Button>
          )}
        </div>

        {/* Max retries warning */}
        {state.attemptNumber >= config.maxRetries && (
          <p className="text-xs text-muted-foreground text-center">
            Maximum retry attempts reached. Please try again later or contact support.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Hook for programmatic retry logic
export function useRetry<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>
) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attemptNumber: 0,
    lastError: null,
    nextRetryAt: null,
    providersAttempted: [],
    currentProvider: null,
    degradedTier: null,
  });

  const execute = useCallback(async (): Promise<T> => {
    setState(s => ({ ...s, isRetrying: true, attemptNumber: 1, lastError: null }));

    for (let attempt = 1; attempt <= fullConfig.maxRetries; attempt++) {
      try {
        const result = await operation();
        setState(s => ({ ...s, isRetrying: false }));
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setState(s => ({ ...s, attemptNumber: attempt, lastError: errorMessage }));

        if (attempt < fullConfig.maxRetries) {
          const delay = fullConfig.baseDelayMs * Math.pow(fullConfig.backoffMultiplier, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, Math.min(delay, fullConfig.maxDelayMs)));
        }
      }
    }

    setState(s => ({ ...s, isRetrying: false }));
    throw new Error(`Operation failed after ${fullConfig.maxRetries} attempts: ${state.lastError}`);
  }, [operation, fullConfig, state.lastError]);

  const reset = useCallback(() => {
    setState({
      isRetrying: false,
      attemptNumber: 0,
      lastError: null,
      nextRetryAt: null,
      providersAttempted: [],
      currentProvider: null,
      degradedTier: null,
    });
  }, []);

  return { ...state, execute, reset };
}

export default RetryUI;
