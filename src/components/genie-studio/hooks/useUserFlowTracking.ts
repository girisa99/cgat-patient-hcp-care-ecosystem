/**
 * useUserFlowTracking - Tracks user actions for journey analysis
 * DEV-ONLY: Used by Ralph Wiggum to understand user journey
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface UserFlowEvent {
  id: string;
  timestamp: number;
  action: string;
  details?: Record<string, any>;
  tab?: string;
  component?: string;
}

export interface LoadedComponent {
  id: string;
  name: string;
  loadedAt: number;
  isVisible: boolean;
}

const MAX_EVENTS = 100;

// Only run in development
const isDev = import.meta.env.DEV;

export function useUserFlowTracking(currentTab: string) {
  const [userFlow, setUserFlow] = useState<UserFlowEvent[]>([]);
  const [loadedComponents, setLoadedComponents] = useState<LoadedComponent[]>([]);
  const lastTabRef = useRef<string>('');
  
  // Generate unique ID
  const generateId = () => `flow-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  // Track a user action
  const trackAction = useCallback((action: string, details?: Record<string, any>, component?: string) => {
    if (!isDev) return;
    
    const event: UserFlowEvent = {
      id: generateId(),
      timestamp: Date.now(),
      action,
      details,
      tab: currentTab,
      component
    };
    
    setUserFlow(prev => {
      const updated = [...prev, event];
      // Keep only last MAX_EVENTS
      return updated.slice(-MAX_EVENTS);
    });
  }, [currentTab]);
  
  // Register a loaded component
  const registerComponent = useCallback((name: string, isVisible: boolean = true) => {
    if (!isDev) return;
    
    setLoadedComponents(prev => {
      // Check if already registered
      const existing = prev.find(c => c.name === name);
      if (existing) {
        // Update visibility
        return prev.map(c => c.name === name ? { ...c, isVisible } : c);
      }
      
      return [...prev, {
        id: generateId(),
        name,
        loadedAt: Date.now(),
        isVisible
      }];
    });
  }, []);
  
  // Unregister a component
  const unregisterComponent = useCallback((name: string) => {
    if (!isDev) return;
    
    setLoadedComponents(prev => prev.filter(c => c.name !== name));
  }, []);
  
  // Track tab changes
  useEffect(() => {
    if (!isDev) return;
    
    if (lastTabRef.current !== currentTab && lastTabRef.current !== '') {
      trackAction('tab_change', { 
        from: lastTabRef.current, 
        to: currentTab 
      });
    }
    lastTabRef.current = currentTab;
  }, [currentTab, trackAction]);
  
  // Track initial page load
  useEffect(() => {
    if (!isDev) return;
    
    trackAction('page_load', { initialTab: currentTab });
    registerComponent('GenieStudio', true);
    registerComponent('Navigation', true);
    registerComponent('Header', true);
  }, []); // Only on mount
  
  // Get flow summary for Ralph Wiggum
  const getFlowSummary = useCallback(() => {
    const tabVisits: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};
    
    userFlow.forEach(event => {
      if (event.tab) {
        tabVisits[event.tab] = (tabVisits[event.tab] || 0) + 1;
      }
      actionCounts[event.action] = (actionCounts[event.action] || 0) + 1;
    });
    
    return {
      totalEvents: userFlow.length,
      tabVisits,
      actionCounts,
      recentActions: userFlow.slice(-10).map(e => e.action),
      sessionDuration: userFlow.length > 0 
        ? Date.now() - userFlow[0].timestamp 
        : 0
    };
  }, [userFlow]);
  
  // Clear flow history
  const clearFlow = useCallback(() => {
    setUserFlow([]);
  }, []);
  
  return {
    userFlow,
    loadedComponents,
    trackAction,
    registerComponent,
    unregisterComponent,
    getFlowSummary,
    clearFlow,
    isTracking: isDev
  };
}
