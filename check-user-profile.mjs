import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpgidlybygavthytsxvl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IfneTTGO7RqW4vjlMJ8HQw_xRq83L6o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const email = 'bharathfilmindustry@gmail.com';
const password = 'Damalcheruvu@57152';

async function run() {
  try {
    // Log in as admin to bypass client RLS on other profiles
    const { data: authData } = await supabase.auth.signInWithPassword({ email, password });
    
    console.log("Fetching customer profile...");
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'roopchandu96@gmail.com')
      .maybeSingle();

    if (error) {
      console.error("Error:", error);
    } else {
      console.log("Customer Profile:", profile);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
