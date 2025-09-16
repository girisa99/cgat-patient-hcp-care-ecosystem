import { useState, useEffect } from 'react';

interface EdgeFunctionAvailabilityState {
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

export const useEdgeFunctionAvailability = () => {
  const [state, setState] = useState<EdgeFunctionAvailabilityState>({
    isAvailable: true, // Default to true for better UX
    isLoading: false,
    error: null,
    lastChecked: null,
  });

  useEffect(() => {
    // Simple availability check - just assume available for now
    // In a real implementation, you might check edge function endpoints
    setState({
      isAvailable: true,
      isLoading: false,
      error: null,
      lastChecked: new Date(),
    });
  }, []);

  return state;
};