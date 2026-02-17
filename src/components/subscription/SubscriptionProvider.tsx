import React, { createContext, useContext, ReactNode } from 'react';
import { useSubscription, UseSubscriptionReturn } from '@/hooks/useSubscription';

const SubscriptionContext = createContext<UseSubscriptionReturn | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const subscriptionData = useSubscription();
  
  return (
    <SubscriptionContext.Provider value={subscriptionData}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};
