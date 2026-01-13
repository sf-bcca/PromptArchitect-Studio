import { supabase, handleSupabaseError } from "./supabaseClient";
import { UserSettings } from "../types";

/**
 * Fetches settings for a specific user.
 * @param userId The UUID of the user.
 * @returns The user's settings or null if not found.
 */
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        // No rows found, return null instead of throwing
        return null;
    }
    handleSupabaseError(error, "getUserSettings");
  }

  return data as UserSettings;
};

/**
 * Upserts user settings (creates if missing, updates if exists).
 * @param settings The settings object to save.
 * @returns The saved settings data.
 */
export const saveUserSettings = async (settings: Partial<UserSettings> & { user_id: string }): Promise<UserSettings> => {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert(settings, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, "saveUserSettings");
  }

  return data as UserSettings;
};
