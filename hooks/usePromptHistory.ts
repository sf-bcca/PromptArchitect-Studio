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
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const PAGE_SIZE = 20;

  /**
   * Fetches the user's prompt history from Supabase.
   * @param offset The number of items to skip (for pagination)
   * @param searchQuery The search query to filter the history (optional)
   */
  const fetchHistory = useCallback(async (offset = 0, searchQuery = '') => {
    if (!session) {
      setHistory([]);
      return;
    }

    setIsLoadingMore(true);
    setLastSearchQuery(searchQuery);

    try {
      let query = supabase
        .from("prompt_history")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      // If search query is provided, add filtering
      if (searchQuery.trim()) {
        const search = `%${searchQuery.trim()}%`;
        // Search in original_input, refinedPrompt (inside result JSON), and customTitle (inside result JSON)
        query = query.or(`original_input.ilike.${search},result->>refinedPrompt.ilike.${search},result->>customTitle.ilike.${search}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const mappedHistory: PromptHistoryItem[] = data.map((item) => ({
          id: item.id,
          originalInput: item.original_input,
          result: item.result,
          timestamp: new Date(item.created_at).getTime(),
          parentId: item.parent_id,
        }));

        if (offset === 0) {
            setHistory(mappedHistory);
        } else {
            setHistory(prev => [...prev, ...mappedHistory]);
        }

        // If we got fewer items than requested, we've reached the end
        if (data.length < PAGE_SIZE) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
        setIsLoadingMore(false);
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
      // Prepend without slicing limits to support infinite scroll
      return [item, ...prev];
    });
  };

  /**
   * Deletes a specific history item.
   * @param id The ID of the item to delete.
   */
  const deleteHistoryItem = async (id: string) => {
    if (!session) return;

    // Optimistic update
    setHistory((prev) => prev.filter((item) => item.id !== id));

    const { error } = await supabase
      .from("prompt_history")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Failed to delete history item:", error);
      // Revert if failed (fetch again with same search)
      fetchHistory(0, lastSearchQuery);
    }
  };

  /**
   * Renames a history item by updating the result JSON.
   * @param id The ID of the item to rename.
   * @param newTitle The new custom title.
   */
  const renameHistoryItem = async (id: string, newTitle: string) => {
    if (!session) return;

    // Find the item to update
    const item = history.find((h) => h.id === id);
    if (!item) return;

    const updatedResult = { ...item.result, customTitle: newTitle };

    // Optimistic update
    setHistory((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, result: updatedResult } : h
      )
    );

    const { error } = await supabase
      .from("prompt_history")
      .update({ result: updatedResult })
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
        console.error("Failed to rename history item:", error);
        // Revert with same search
        fetchHistory(0, lastSearchQuery);
    }
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

  return { history, setHistory, fetchHistory, addToHistory, clearHistory, deleteHistoryItem, renameHistoryItem, hasMore, isLoadingMore };
};
