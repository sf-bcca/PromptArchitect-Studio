import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Session } from '@supabase/supabase-js';

/**
 * Context for managing session data and authentication modal visibility.
 */
interface SessionContextType {
  session: Session | null;
  showAuth: boolean;
  setShowAuth: (show: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

/**
 * Provides the session context to its children.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render.
 */
export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, showAuth, setShowAuth } = useAuth();

  return (
    <SessionContext.Provider value={{ session, showAuth, setShowAuth }}>
      {children}
    </SessionContext.Provider>
  );
};

/**
 * Custom hook for accessing the session context.
 * Throws an error if used outside of a SessionProvider.
 *
 * @returns {SessionContextType} The session context.
 */
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
