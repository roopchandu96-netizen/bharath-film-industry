import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpgidlybygavthytsxvl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IfneTTGO7RqW4vjlMJ8HQw_xRq83L6o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const email = 'bharathfilmindustry@gmail.com';
const password = 'Damalcheruvu@57152';

async function run() {
  try {
    console.log("Logging in as bharathfilmindustry@gmail.com...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      console.error("Login failed:", authError.message);
      return;
    }
    console.log("Login successful! User ID:", authData.user?.id);

    console.log("\nFetching admin profile from 'profiles' table...");
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .maybeSingle();

    if (pErr) {
      console.error("Failed to fetch profile:", pErr);
    } else {
      console.log("Admin Profile:", profile);
    }

    console.log("\nFetching movie_bookings as authenticated admin...");
    const { data: bookings, error: bErr } = await supabase
      .from('movie_bookings')
      .select('*');

    if (bErr) {
      console.error("Failed to fetch bookings:", bErr.message);
    } else {
      console.log(`Successfully fetched ${bookings.length} bookings as admin.`);
      for (const b of bookings) {
        console.log(`- Booking Ref: ${b.booking_id}, Email: ${b.email}, Status: ${b.status}, PaymentStatus: ${b.payment_status}`);
      }
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
