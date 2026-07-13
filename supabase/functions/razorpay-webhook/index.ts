// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

export default {
  fetch: withSupabase({ auth: "none" }, async (req, { supabaseAdmin }) => {
    // 1. Get Razorpay Signature
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      console.error("Missing x-razorpay-signature header");
      return Response.json({ error: "Missing signature" }, { status: 400 });
    }

    const body = await req.text();
    const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET env variable is not set");
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // 2. Cryptographic signature verification using Web Crypto API (HMAC SHA256)
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(body)
      );

      const signatureArray = Array.from(new Uint8Array(signatureBuffer));
      const generatedSignature = signatureArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (generatedSignature !== signature) {
        console.error("Signature mismatch: unauthorized webhook call");
        return Response.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch (err) {
      console.error("Webhook signature verification exception:", err);
      return Response.json({ error: "Signature verification failed" }, { status: 401 });
    }

    // 3. Process the event payload
    try {
      const event = JSON.parse(body);
      console.log(`🔔 Razorpay event received: ${event.event} (${event.id})`);

      if (event.event === "order.paid" || event.event === "payment.captured") {
        const paymentEntity = event.payload?.payment?.entity;
        const orderEntity = event.payload?.order?.entity;

        const paymentId = paymentEntity?.id;
        const orderId = orderEntity?.id || paymentEntity?.order_id;

        if (orderId) {
          console.log(`Processing paid order: ${orderId}, payment: ${paymentId}`);

          // A. Locate the payment transaction in our DB matching the gateway order ID
          const { data: payment, error: fetchError } = await supabaseAdmin
            .from("payments")
            .select("*")
            .eq("gateway_order_id", orderId)
            .maybeSingle();

          if (fetchError) {
            console.error(`Error querying payments table for order ${orderId}:`, fetchError);
          } else if (payment) {
            // B. Mark the payment record as verified
            const { error: updatePaymentError } = await supabaseAdmin
              .from("payments")
              .update({
                gateway_payment_id: paymentId,
                gateway_signature: signature,
                payment_status: "verified",
                verified_at: new Date().toISOString()
              })
              .eq("id", payment.id);

            if (updatePaymentError) {
              console.error(`Error updating payment ${payment.id}:`, updatePaymentError);
            } else {
              console.log(`Payment transaction ${payment.id} verified successfully.`);
            }

            // C. Confirm the parent movie booking
            const { error: updateBookingError } = await supabaseAdmin
              .from("movie_bookings")
              .update({
                status: "confirmed",
                payment_status: "verified",
                confirmed_at: new Date().toISOString()
              })
              .eq("id", payment.booking_id);

            if (updateBookingError) {
              console.error(`Error updating booking ${payment.booking_id}:`, updateBookingError);
            } else {
              console.log(`Movie booking ${payment.booking_id} confirmed successfully.`);
            }

            // D. Generate and issue a digital ticket if not already issued
            const { data: existingTicket, error: fetchTicketError } = await supabaseAdmin
              .from("tickets")
              .select("id")
              .eq("booking_id", payment.booking_id)
              .maybeSingle();

            if (fetchTicketError) {
              console.error(`Error fetching ticket for booking ${payment.booking_id}:`, fetchTicketError);
            } else if (!existingTicket) {
              const ticketNumber = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
              const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

              const { error: insertTicketError } = await supabaseAdmin
                .from("tickets")
                .insert({
                  booking_id: payment.booking_id,
                  ticket_number: ticketNumber,
                  invoice_number: invoiceNumber,
                  email_sent: false
                });

              if (insertTicketError) {
                console.error(`Error creating ticket for booking ${payment.booking_id}:`, insertTicketError);
              } else {
                console.log(`Ticket ${ticketNumber} and invoice ${invoiceNumber} created for booking ${payment.booking_id}.`);
              }
            } else {
              console.log(`Ticket already exists for booking ${payment.booking_id}.`);
            }
          } else {
            console.warn(`No payment record found matching gateway_order_id: ${orderId}`);
          }
        } else {
          console.warn("Event processed, but no gateway order_id found in payload");
        }
      }

      return Response.json({ received: true });
    } catch (err) {
      console.error("Internal processing error:", err);
      return Response.json({ error: "Internal processing error" }, { status: 500 });
    }
  }),
};
