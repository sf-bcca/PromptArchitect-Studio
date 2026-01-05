import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session } from '@supabase/supabase-js';

/**
 * Custom hook for managing user authentication state.
 * Handles session fetching and listens for auth state changes.
 *
 * @returns An object containing the user session, a boolean indicating if the auth modal should be shown,
 * and a function to control the visibility of the auth modal.
 */
export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowAuth(false); // Automatically close modal on successful login
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, showAuth, setShowAuth };
};
