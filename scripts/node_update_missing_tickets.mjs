// scripts/node_update_missing_tickets.mjs
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
// Refresh Supabase schema cache for tickets table
await supabase.from("tickets").select("id").limit(1);

// Target user email (adjust as needed)
const targetEmail = "roopchandu96@gmail.com";

async function main() {
  // Get user profile (optional, just for logging)
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("id, role, active_role")
    .eq("email", targetEmail)
    .single();
  if (profErr) {
    console.error("Profile lookup error:", profErr);
  } else {
    console.log("User profile:", profile);
  }

  // Find all bookings for this user
  const { data: userBookings, error: ubErr } = await supabase
    .from("movie_bookings")
    .select("id")
    .eq("user_id", profile.id);
  if (ubErr) {
    console.error("User bookings fetch error:", ubErr);
    return;
  }
  const bookingIds = userBookings.map(b => b.id);

  // Find all payments for these bookings
  const { data: payments, error: payErr } = await supabase
    .from("payments")
    .select("id, gateway_payment_id, gateway_order_id, booking_id, payment_status")
    .in("booking_id", bookingIds);
  if (payErr) {
    console.error("Payments fetch error:", payErr);
    return;
  }

  for (const payment of payments) {
    // Ensure the related booking exists
    const { data: booking, error: bokErr } = await supabase
      .from("movie_bookings")
      .select("id, booking_id, status, payment_status")
      .eq("id", payment.booking_id)
      .single();
    if (bokErr) {
      console.warn(`Booking not found for payment ${payment.id}`);
      continue;
    }

    // Check if ticket already exists
    const { data: ticket, error: tErr } = await supabase
      .from("tickets")
      .select("id")
      .eq("booking_id", booking.id)
      .maybeSingle();
    if (tErr) {
      console.error("Ticket query error:", tErr);
      continue;
    }
    if (ticket) {
      console.log(`Ticket already exists for booking ${booking.id}`);
      continue;
    }

    // Generate sequential ticket numbers based on existing count
    let nextSerial = 1996;
    try {
      const { count, error: cntErr } = await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true });
      if (!cntErr && typeof count === "number") {
        nextSerial = 1996 + count;
      }
    } catch (cErr) {
      console.error("Ticket count query failed:", cErr);
    }
    const ticketNumber = `TKT-${nextSerial}`;
    const invoiceNumber = `INV-${nextSerial}`;

    // Update payment and booking status to verified/confirmed
    const now = new Date().toISOString();
    const [{ error: updPayErr }, { error: updBookErr }] = await Promise.all([
      supabase.from("payments").update({ payment_status: "verified", verified_at: now }).eq("id", payment.id),
      supabase.from("movie_bookings").update({ status: "confirmed", payment_status: "verified", confirmed_at: now }).eq("id", booking.id),
    ]);
    if (updPayErr || updBookErr) {
      console.error("Failed to update statuses for booking", booking.id, updPayErr, updBookErr);
      continue;
    }

    // Insert ticket record (without email_sent column)
    const { data: newTicket, error: insErr } = await supabase.from("tickets").insert({
      booking_id: booking.id,
      ticket_number: ticketNumber,
      invoice_number: invoiceNumber
    }).select();
    if (insErr) {
      console.error("Ticket insert failed for booking", booking.id, insErr);
      continue;
    }
    // Mark email as sent after successful insert
    const { error: emailUpdErr } = await supabase.from("tickets").update({ email_sent: true }).eq("id", newTicket[0].id);
    if (emailUpdErr) {
      console.error("Failed to set email_sent for ticket", newTicket[0].id, emailUpdErr);
    }
    console.log(`Generated ticket ${ticketNumber} for booking ${booking.id}`);
  }
}

main();
