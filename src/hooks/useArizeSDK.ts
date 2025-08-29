import { useState, useCallback, useRef } from 'react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface ArizeSpan {
  id: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'success' | 'error';
  attributes: Record<string, any>;
  events: Array<{
    name: string;
    timestamp: number;
    attributes: Record<string, any>;
  }>;
}

interface ArizeMetrics {
  totalSpans: number;
  successfulSpans: number;
  failedSpans: number;
  averageDuration: number;
  traces: string[];
}

export const useArizeSDK = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [spans, setSpans] = useState<Map<string, ArizeSpan>>(new Map());
  const [metrics, setMetrics] = useState<ArizeMetrics>({
    totalSpans: 0,
    successfulSpans: 0,
    failedSpans: 0,
    averageDuration: 0,
    traces: []
  });
  
  const { showSuccess, showError } = useMasterToast();
  const spanCounter = useRef(0);

  const initialize = useCallback(async (config: {
    spaceKey: string;
    modelId: string;
    modelVersion: string;
  }) => {
    try {
      // Test Arize connection via edge function
      const response = await fetch('/api/arize-tracing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          ...config
        })
      });

      if (response.ok) {
        setIsInitialized(true);
        showSuccess('Arize SDK initialized successfully');
        return true;
      } else {
        showError('Failed to initialize Arize SDK');
        return false;
      }
    } catch (error) {
      console.error('Arize SDK initialization error:', error);
      showError('Arize SDK initialization failed');
      return false;
    }
  }, [showSuccess, showError]);

  const createSpan = useCallback((
    name: string,
    attributes: Record<string, any> = {},
    parentSpanId?: string
  ): string => {
    const spanId = `span_${++spanCounter.current}`;
    const traceId = parentSpanId ? 
      spans.get(parentSpanId)?.traceId || `trace_${Date.now()}` : 
      `trace_${Date.now()}`;

    const span: ArizeSpan = {
      id: spanId,
      traceId,
      parentSpanId,
      name,
      startTime: Date.now(),
      status: 'running',
      attributes: {
        'span.kind': 'internal',
        'service.name': 'workflow-builder',
        'service.version': '1.0.0',
        ...attributes
      },
      events: []
    };

    setSpans(prev => new Map(prev).set(spanId, span));
    
    // Update metrics
    setMetrics(prev => ({
      ...prev,
      totalSpans: prev.totalSpans + 1,
      traces: prev.traces.includes(traceId) ? prev.traces : [...prev.traces, traceId]
    }));

    return spanId;
  }, [spans]);

  const finishSpan = useCallback(async (
    spanId: string,
    status: 'success' | 'error' = 'success',
    attributes: Record<string, any> = {}
  ) => {
    const span = spans.get(spanId);
    if (!span) return;

    const endTime = Date.now();
    const duration = endTime - span.startTime;

    const updatedSpan: ArizeSpan = {
      ...span,
      endTime,
      status,
      attributes: {
        ...span.attributes,
        'span.duration_ms': duration,
        'span.status': status,
        ...attributes
      }
    };

    setSpans(prev => new Map(prev).set(spanId, updatedSpan));

    // Update metrics
    setMetrics(prev => {
      const newSuccessful = status === 'success' ? prev.successfulSpans + 1 : prev.successfulSpans;
      const newFailed = status === 'error' ? prev.failedSpans + 1 : prev.failedSpans;
      const totalCompleted = newSuccessful + newFailed;
      const totalDuration = Array.from(spans.values())
        .filter(s => s.endTime)
        .reduce((sum, s) => sum + (s.endTime! - s.startTime), 0) + duration;

      return {
        ...prev,
        successfulSpans: newSuccessful,
        failedSpans: newFailed,
        averageDuration: totalCompleted > 0 ? totalDuration / totalCompleted : 0
      };
    });

    // Send to Arize if initialized
    if (isInitialized) {
      try {
        await fetch('/api/arize-tracing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'end_trace',
            traceId: span.traceId,
            spanId,
            status,
            duration,
            result: attributes
          })
        });
      } catch (error) {
        console.error('Failed to send span to Arize:', error);
      }
    }
  }, [spans, isInitialized]);

  const addSpanEvent = useCallback((
    spanId: string,
    eventName: string,
    attributes: Record<string, any> = {}
  ) => {
    const span = spans.get(spanId);
    if (!span) return;

    const event = {
      name: eventName,
      timestamp: Date.now(),
      attributes
    };

    const updatedSpan: ArizeSpan = {
      ...span,
      events: [...span.events, event]
    };

    setSpans(prev => new Map(prev).set(spanId, updatedSpan));

    // Send event to Arize if initialized
    if (isInitialized) {
      fetch('/api/arize-tracing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_event',
          traceId: span.traceId,
          operationName: eventName,
          metadata: attributes
        })
      }).catch(console.error);
    }
  }, [spans, isInitialized]);

  const getSpan = useCallback((spanId: string): ArizeSpan | undefined => {
    return spans.get(spanId);
  }, [spans]);

  const getTraceSpans = useCallback((traceId: string): ArizeSpan[] => {
    return Array.from(spans.values()).filter(span => span.traceId === traceId);
  }, [spans]);

  const clearSpans = useCallback(() => {
    setSpans(new Map());
    setMetrics({
      totalSpans: 0,
      successfulSpans: 0,
      failedSpans: 0,
      averageDuration: 0,
      traces: []
    });
  }, []);

  const exportTrace = useCallback((traceId: string) => {
    const traceSpans = getTraceSpans(traceId);
    const traceData = {
      traceId,
      spans: traceSpans.map(span => ({
        ...span,
        duration: span.endTime ? span.endTime - span.startTime : undefined
      })),
      summary: {
        totalSpans: traceSpans.length,
        successfulSpans: traceSpans.filter(s => s.status === 'success').length,
        failedSpans: traceSpans.filter(s => s.status === 'error').length,
        totalDuration: traceSpans.reduce((sum, s) => {
          return sum + (s.endTime ? s.endTime - s.startTime : 0);
        }, 0)
      }
    };

    const blob = new Blob([JSON.stringify(traceData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arize-trace-${traceId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getTraceSpans]);

  return {
    // State
    isInitialized,
    spans: Array.from(spans.values()),
    metrics,
    
    // Actions
    initialize,
    createSpan,
    finishSpan,
    addSpanEvent,
    getSpan,
    getTraceSpans,
    clearSpans,
    exportTrace
  };
};