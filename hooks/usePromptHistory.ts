import { useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { PromptHistoryItem } from '../types';
import { Session } from '@supabase/supabase-js';

/**
 * Custom hook for managing the user's prompt history.
 * Provides functions to fetch, add to, and clear the history.
 *
 * @param session The current user session, used to scope database operations.
 * @returns An object containing the history state array and functions to manage it.
 */
export const usePromptHistory = (session: Session | null) => {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  /**
   * Fetches the user's prompt history from Supabase.
   */
  const fetchHistory = useCallback(async () => {
    if (!session) {
      setHistory([]);
      return;
    }

    const { data, error } = await supabase
      .from("prompt_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data && !error) {
      const mappedHistory: PromptHistoryItem[] = data.map((item) => ({
        id: item.id,
        originalInput: item.original_input,
        result: item.result,
        timestamp: new Date(item.created_at).getTime(),
      }));
      setHistory(mappedHistory);
    } else if (error) {
      console.error("Failed to fetch history:", error);
    }
  }, [session]);

  /**
   * Adds a new item to the local history state.
   * @param item The PromptHistoryItem to add.
   */
  const addToHistory = (item: PromptHistoryItem) => {
    setHistory((prev) => {
      // Avoid adding duplicates
      if (prev.find((h) => h.id === item.id)) {
        return prev;
      }
      return [item, ...prev].slice(0, 10);
    });
  };

  /**
   * Clears the prompt history from the database (if logged in) and the local state.
   */
  const clearHistory = async () => {
    if (session) {
      // First, get the list of favorite IDs so we don't clear them from local state blindly
      const { data: favorites } = await supabase
        .from('user_favorites')
        .select('prompt_history_id')
        .eq('user_id', session.user.id);

      const favoriteIds = favorites?.map(f => f.prompt_history_id) || [];

      // Delete from DB: Everything EXCEPT the favorite IDs
      let query = supabase
        .from("prompt_history")
        .delete()
        .eq("user_id", session.user.id);
      
      if (favoriteIds.length > 0) {
        // .not('id', 'in', '(' + favoriteIds.join(',') + ')') // Supabase .not syntax is simpler:
        query = query.not('id', 'in', `(${favoriteIds.join(',')})`);
      }

      const { error } = await query;

      if (error) {
        console.error("Failed to clear DB history:", error);
      }
      
      // Update local state: Keep only favorites
      setHistory(prev => prev.filter(item => favoriteIds.includes(item.id)));
    } else {
      // If not logged in (which shouldn't happen for saving anyway), clear all
       setHistory([]);
    }
  };

  return { history, setHistory, fetchHistory, addToHistory, clearHistory };
};
