import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpgidlybygavthytsxvl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IfneTTGO7RqW4vjlMJ8HQw_xRq83L6o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const email = 'bharathfilmindustry@gmail.com';
const password = 'Damalcheruvu@57152';

async function run() {
  try {
    // Log in as admin to modify the profile
    const { data: authData } = await supabase.auth.signInWithPassword({ email, password });
    
    console.log("Updating customer profile to MOVIE_LOVER...");
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: 'MOVIE_LOVER',
        active_role: 'MOVIE_LOVER',
        movie_lover_activated: true
      })
      .eq('email', 'roopchandu96@gmail.com')
      .select();

    if (error) {
      console.error("Error updating profile:", error);
    } else {
      console.log("Updated Profile:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
