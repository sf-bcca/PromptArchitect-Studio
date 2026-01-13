import { createClient, PostgrestError } from "@supabase/supabase-js";
import { AppError, ErrorCode } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * The Supabase client instance used to interact with the Supabase project.
 * It is initialized with the project URL and anonymous key from environment variables.
 *
 * @const {SupabaseClient} supabase
 */
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

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