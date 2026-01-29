import { supabase, handleSupabaseError } from "./supabaseClient";
import { FavoriteItem, PromptHistoryItem } from "../types";

/**
 * Retrieves all favorite prompts for a specific user.
 * Performs a join with prompt_history to include the full prompt data.
 * 
 * @param userId - The UUID of the user
 * @returns A promise resolving to an array of FavoriteItem objects
 */
export const getFavorites = async (userId: string): Promise<FavoriteItem[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("user_favorites")
    .select(`
      *,
      prompt_history:prompt_history_id (
        id,
        user_id,
        original_input,
        result,
        created_at
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    handleSupabaseError(error, "getFavorites");
  }

  // Transform data to match our frontend types
  return (data || []).map((item: any) => ({
    id: item.id,
    user_id: item.user_id,
    prompt_history_id: item.prompt_history_id,
    created_at: item.created_at,
    prompt_history: item.prompt_history ? {
        id: item.prompt_history.id,
        originalInput: item.prompt_history.original_input,
        result: item.prompt_history.result,
        timestamp: new Date(item.prompt_history.created_at).getTime()
    } as PromptHistoryItem : undefined
  }));
};

/**
 * Adds a prompt to the user's favorites list.
 * 
 * @param userId - The UUID of the user
 * @param promptHistoryId - The UUID of the prompt history item to favorite
 * @returns A promise resolving to the created favorite record
 */
export const addFavorite = async (userId: string, promptHistoryId: string) => {
  console.log('[FavoritesService] Inserting favorite:', { userId, promptHistoryId });
  
  const { data, error } = await supabase
    .from("user_favorites")
    .insert([
      { user_id: userId, prompt_history_id: promptHistoryId }
    ])
    .select();

  if (error) {
    handleSupabaseError(error, "addFavorite");
  }
  
  console.log('[FavoritesService] Insert successful:', data);
  return data;
};

/**
 * Removes a prompt from the user's favorites list.
 * 
 * @param userId - The UUID of the user
 * @param promptHistoryId - The UUID of the prompt history item to unfavorite
 */
export const removeFavorite = async (userId: string, promptHistoryId: string) => {
  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .match({ user_id: userId, prompt_history_id: promptHistoryId });

  if (error) {
    handleSupabaseError(error, "removeFavorite");
  }
};