import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mcxtnxswggtlpunltfda.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jeHRueHN3Z2d0bHB1bmx0ZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjYzMzMsImV4cCI6MjA4MjEwMjMzM30.KaodUcgW6Yl1OYd5qTzs_71UxzOQrp9wJ6W-WWTU3zQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
