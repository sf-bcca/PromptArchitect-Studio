import { supabase } from "./supabaseClient";
import { FavoriteItem, PromptHistoryItem } from "../types";

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
    console.error("Error fetching favorites:", error);
    throw error;
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

export const addFavorite = async (userId: string, promptHistoryId: string) => {
  const { data, error } = await supabase
    .from("user_favorites")
    .insert([
      { user_id: userId, prompt_history_id: promptHistoryId }
    ])
    .select();

  if (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
  return data;
};

export const removeFavorite = async (userId: string, promptHistoryId: string) => {
  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .match({ user_id: userId, prompt_history_id: promptHistoryId });

  if (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};
