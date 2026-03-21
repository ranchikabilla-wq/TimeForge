// Supabase Configuration  
// ======================  
// Replace the values below with your own Supabase credentials  
  
// TODO: Replace with your Supabase Project URL  
const SUPABASE_URL = "https://ijitakhmyyizzllwbxma.supabase.co";  
  
// TODO: Replace with your Supabase Public (anon) key  
const SUPABASE_PUBLIC_KEY = "sb_publishable_PCle_2S-PFza0jcVBEqebQ_DsHCZpku";  
  
// Create and export the Supabase client  
// =====================================  
import { createClient } from "@supabase/supabase-js";  
  
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

// Google OAuth Login Function
// ============================
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/home`,
    },
  });
  
  return { data, error };
}; 
