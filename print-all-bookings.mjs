import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpgidlybygavthytsxvl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IfneTTGO7RqW4vjlMJ8HQw_xRq83L6o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  try {
    const { data: bookings, error } = await supabase
      .from('movie_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return;
    }

    console.log(`FOUND ${bookings.length} TOTAL BOOKINGS:`);
    for (const b of bookings) {
      console.log(`- Ref: ${b.booking_id}, Email: '${b.email}', Status: ${b.status}, PaymentStatus: ${b.payment_status}, UserID: ${b.user_id}`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
