import { createClient, PostgrestError } from "@supabase/supabase-js";
import { AppError, ErrorCode } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Singleton Supabase client for interacting with database and auth.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to wrap Supabase errors into AppError.
 */
export const handleSupabaseError = (error: PostgrestError | Error, context: string): never => {
  console.error(`Supabase Error [${context}]:`, error);
  throw new AppError(
    ErrorCode.NETWORK_ERROR,
    error.message || `Database operation failed in ${context}`,
    { originalError: error }
  );
};