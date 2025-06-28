
import { useState, useEffect } from 'react';

// Simplified tab synchronization for database-first approach
export const useTabSynchronization = () => {
  const [activeTab, setActiveTab] = useState('active');

  const switchTab = (tab: string) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    switchTab
  };
};
