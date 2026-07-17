// scripts/update_missing_tickets.mjs
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const targetEmail = "roopchandu96@gmail.com";

async function main() {
  const { data: payments, error: payErr } = await supabase
    .from("payments")
    .select("id, gateway_payment_id, gateway_order_id, booking_id, payment_status, email")
    .eq("email", targetEmail);
  if (payErr) {
    console.error("Payments fetch error:", payErr);
    return;
  }

  for (const payment of payments) {
    const { data: booking, error: bokErr } = await supabase
      .from("movie_bookings")
      .select("id, booking_id, status, payment_status")
      .eq("id", payment.booking_id)
      .single();
    if (bokErr) {
      console.warn(`Booking not found for payment ${payment.id}`);
      continue;
    }

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

    const now = new Date().toISOString();
    const [{ error: updPayErr }, { error: updBookErr }] = await Promise.all([
      supabase.from("payments").update({ payment_status: "verified", verified_at: now }).eq("id", payment.id),
      supabase.from("movie_bookings").update({ status: "confirmed", payment_status: "verified", confirmed_at: now }).eq("id", booking.id),
    ]);
    if (updPayErr || updBookErr) {
      console.error("Failed to update statuses for booking", booking.id, updPayErr, updBookErr);
      continue;
    }

    const { error: insErr } = await supabase.from("tickets").insert({
      booking_id: booking.id,
      ticket_number: ticketNumber,
      invoice_number: invoiceNumber,
      email_sent: true,
    });
    if (insErr) {
      console.error("Ticket insert failed for booking", booking.id, insErr);
      continue;
    }
    console.log(`Generated ticket ${ticketNumber} for booking ${booking.id}`);
  }
}

main();
