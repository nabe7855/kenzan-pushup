import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("[Supabase Client] Checking environment variables...", {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlStart: supabaseUrl ? supabaseUrl.substring(0, 10) : "N/A",
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("[Supabase Client] Client initialized.");
