// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export default {
  fetch: withSupabase({ auth: "required" }, async (req, { supabaseAdmin, user }) => {
    // Handle CORS OPTIONS preflight request
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return new Response(
          JSON.stringify({ error: "Missing required verification fields." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const keyId = Deno.env.get('RAZORPAY_KEY_ID')
      const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

      if (!keyId || !keySecret) {
        console.error("Razorpay environment variables are missing.")
        return new Response(
          JSON.stringify({ error: "Server authentication error." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      // 1. Cryptographic signature check: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
      try {
        const encoder = new TextEncoder()
        const keyData = encoder.encode(keySecret)
        const key = await crypto.subtle.importKey(
          "raw",
          keyData,
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        )
        
        const bodyData = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`)
        const signatureBuffer = await crypto.subtle.sign(
          "HMAC",
          key,
          bodyData
        )
        
        const signatureArray = Array.from(new Uint8Array(signatureBuffer))
        const generatedSignature = signatureArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")

        if (generatedSignature !== razorpay_signature) {
          console.error("Signature mismatch: expected", generatedSignature, "got", razorpay_signature)
          return new Response(
            JSON.stringify({ success: false, error: "Invalid payment signature. Authentication failed." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }
      } catch (cryptoErr) {
        console.error("Cryptographic signature check exception:", cryptoErr);
        return new Response(
          JSON.stringify({ success: false, error: "Signature verification processing failed." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      // 2. REST API verification check against Razorpay's server
      let razorpayPayment;
      try {
        const response = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          method: "GET",
          headers: {
            "Authorization": "Basic " + btoa(keyId + ":" + keySecret)
          }
        });

        if (!response.ok) {
          console.error("Razorpay fetch payment details failed");
          return new Response(
            JSON.stringify({ error: "Failed to confirm payment details with gateway." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        razorpayPayment = await response.json();
      } catch (err) {
        console.error("Razorpay REST check failed:", err);
        return new Response(
          JSON.stringify({ error: "Payment gateway connection error." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Authenticate details retrieved from API
      if (razorpayPayment.status !== "captured") {
        console.error(`Payment status is ${razorpayPayment.status}, expected captured.`);
        return new Response(
          JSON.stringify({ error: "Payment has not been captured yet." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (razorpayPayment.currency !== "INR") {
        console.error(`Payment currency is ${razorpayPayment.currency}, expected INR.`);
        return new Response(
          JSON.stringify({ error: "Invalid payment currency." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (razorpayPayment.order_id !== razorpay_order_id) {
        console.error(`Payment order_id ${razorpayPayment.order_id} does not match ${razorpay_order_id}.`);
        return new Response(
          JSON.stringify({ error: "Order ID mismatch." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 3. Prevent duplicate validation (replay attacks)
      const { data: existingVerifiedPayment } = await supabaseAdmin
        .from("payments")
        .select("id")
        .eq("gateway_payment_id", razorpay_payment_id)
        .eq("payment_status", "verified")
        .maybeSingle();

      if (existingVerifiedPayment) {
        console.error("Replay check: transaction has already been verified.");
        return new Response(
          JSON.stringify({ error: "Transaction has already been verified." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 4. Retrieve pending booking record
      const { data: paymentRecord, error: paymentError } = await supabaseAdmin
        .from("payments")
        .select("*, movie_bookings(*)")
        .eq("gateway_order_id", razorpay_order_id)
        .maybeSingle();

      if (paymentError || !paymentRecord) {
        console.error("Payment record not found for gateway order:", razorpay_order_id);
        return new Response(
          JSON.stringify({ error: "No matching payment record found." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const booking = paymentRecord.movie_bookings;
      const amountINR = razorpayPayment.amount / 100;

      // Validate payment amount match
      if (booking.amount !== amountINR) {
        console.error(`Payment amount ${amountINR} does not match booking amount ${booking.amount}.`);
        return new Response(
          JSON.stringify({ error: "Payment amount mismatch." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 5. Finalize status and generate tickets on the backend
      const ticketNumber = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      try {
        // Update payment record to verified
        await supabaseAdmin
          .from("payments")
          .update({
            gateway_payment_id: razorpay_payment_id,
            gateway_signature: razorpay_signature,
            payment_status: "verified",
            verified_at: new Date().toISOString()
          })
          .eq("id", paymentRecord.id);

        // Update booking record to confirmed
        await supabaseAdmin
          .from("movie_bookings")
          .update({
            status: "confirmed",
            payment_status: "verified",
            confirmed_at: new Date().toISOString()
          })
          .eq("id", booking.id);

        // Insert ticket/invoice record
        await supabaseAdmin
          .from("tickets")
          .insert({
            booking_id: booking.id,
            ticket_number: ticketNumber,
            invoice_number: invoiceNumber,
            email_sent: true
          });

        // 6. Send automatic confirmation email via SMTP
        const smtpHost = Deno.env.get("SMTP_HOST");
        if (smtpHost) {
          try {
            const client = new SmtpClient();
            await client.connectTLS({
              hostname: smtpHost,
              port: Number(Deno.env.get("SMTP_PORT") || 465),
              username: Deno.env.get("SMTP_USER") || "",
              password: Deno.env.get("SMTP_PASS") || "",
            });

            await client.send({
              from: `"BFI Ticketing" <${Deno.env.get("SMTP_USER")}>`,
              to: user.email,
              subject: `BFI | Booking Confirmed - Ticket ${ticketNumber}`,
              content: `Dear Film Enthusiast,

Your ticket booking for "Vishwavikhyatha Nata Sarvabhouma" has been verified and confirmed.

Booking Reference: ${booking.booking_id}
Ticket Number: ${ticketNumber}
Invoice Number: ${invoiceNumber}
Quantity: ${booking.quantity} Ticket(s)
Amount Paid: INR ${amountINR.toFixed(2)}
Payment Method: Razorpay

We look forward to hosting you. Your secure streaming link will be active on the official premiere date.

Warm regards,
Bharat Film Industry Treasury
`,
            });
            await client.close();
            console.log(`Confirmation email sent to ${user.email} for ticket ${ticketNumber}`);
          } catch (mailErr) {
            console.error("SMTP email dispatch failed:", mailErr);
          }
        } else {
          console.warn("SMTP host not set, skipping automatic email dispatch.");
        }

      } catch (dbUpdateErr) {
        console.error("Database status update transaction failed:", dbUpdateErr);
        return new Response(
          JSON.stringify({ error: "Failed to update booking status." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Payment verified successfully." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )

    } catch (error) {
      console.error("Internal verify-payment exception:", error)
      return new Response(
        JSON.stringify({ error: "Internal server error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
  })
}
