/**
 * Database-Aligned Authentication Provider
 * Following verification and registry standards with proper React context
 */
import * as React from 'react';
import type { DatabaseAuthContext } from '@/hooks/useDatabaseAuth';
import { useDatabaseAuth } from '@/hooks/useDatabaseAuth';
import { Database } from '@/integrations/supabase/types';

// Database-aligned context interface following verification standards
interface DatabaseAuthContextType extends DatabaseAuthContext {
  readonly loading: boolean; // Compatibility alias
  readonly initialized: boolean; // Database initialization state
}

// Create context following database patterns
const DatabaseAuthReactContext = React.createContext<DatabaseAuthContextType | undefined>(undefined);

interface DatabaseAuthProviderProps {
  readonly children: React.ReactNode;
}

export const DatabaseAuthProvider: React.FC<DatabaseAuthProviderProps> = ({ children }) => {
  console.log('🏗️ Initializing DatabaseAuthProvider following verification standards...');
  
  const databaseAuth = useDatabaseAuth();

  // Create context value with database alignment
  const contextValue: DatabaseAuthContextType = React.useMemo(() => ({
    ...databaseAuth,
    loading: databaseAuth.isLoading, // Compatibility alias  
    initialized: !databaseAuth.isLoading // Database initialization state
  }), [databaseAuth]);

  return (
    <DatabaseAuthReactContext.Provider value={contextValue}>
      {children}
    </DatabaseAuthReactContext.Provider>
  );
};

// Database-aligned context hook following verification standards
export const useDatabaseAuthContext = (): DatabaseAuthContextType => {
  const context = React.useContext(DatabaseAuthReactContext);
  if (context === undefined) {
    throw new Error('useDatabaseAuthContext must be used within a DatabaseAuthProvider');
  }
  return context;
};

// Export for compatibility with existing code
export const useAuthContext = useDatabaseAuthContext;
export const CleanAuthProvider = DatabaseAuthProvider;