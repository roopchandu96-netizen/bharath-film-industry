import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpgidlybygavthytsxvl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IfneTTGO7RqW4vjlMJ8HQw_xRq83L6o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  try {
    const { data: bookings, error } = await supabase
      .from('movie_bookings')
      .select('*')
      .eq('email', 'roopchandu96@gmail.com')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return;
    }

    console.log(`FOUND ${bookings.length} BOOKINGS FOR roopchandu96@gmail.com:`);
    for (const b of bookings) {
      // Check if ticket exists
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*')
        .eq('booking_id', b.id)
        .maybeSingle();

      console.log(`\nBooking ID: ${b.id}`);
      console.log(`  - Booking Ref: ${b.booking_id}`);
      console.log(`  - User ID: ${b.user_id}`);
      console.log(`  - Amount: ₹${b.amount}`);
      console.log(`  - Quantity: ${b.quantity}`);
      console.log(`  - Status: ${b.status}`);
      console.log(`  - Payment Status: ${b.payment_status}`);
      console.log(`  - Ticket No: ${ticket ? ticket.ticket_number : 'NONE'}`);
      console.log(`  - Invoice No: ${ticket ? ticket.invoice_number : 'NONE'}`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
