// Supabase Configuration
// ======================
// Replace the values below with your own Supabase credentials
  
// TODO: Replace with your Supabase Project URL
const SUPABASE_URL = "https://ijitakhmyyizzllwbxma.supabase.co";
  
// TODO: Replace with your Supabase Public (anon) key
// This should be the "anon" key from your Supabase project settings
// It typically starts with "eyJ..." and is much longer
const SUPABASE_PUBLIC_KEY = "sb_publishable_PCle_2S-PFza0jcVBEqebQ_DsHCZpku";
  
// Create and export the Supabase client
// =====================================
import { createClient } from "@supabase/supabase-js";

// Validate configuration
if (SUPABASE_PUBLIC_KEY === "YOUR_SUPABASE_ANON_KEY_HERE") {
  console.error(
    "⚠️ SUPABASE CONFIGURATION ERROR ⚠️\n" +
    "The Supabase API key is not configured!\n" +
    "Please update SUPABASE_PUBLIC_KEY in src/supabaseClient.js\n" +
    "See SUPABASE_OAUTH_SETUP.md for detailed instructions."
  );
}
  
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

// Google OAuth Login Function
// ============================
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  
  return { data, error };
};
