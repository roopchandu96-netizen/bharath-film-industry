// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export default {
  async fetch(req: Request) {
    // Handle CORS OPTIONS preflight request
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      // 1. Authenticate user using the Authorization header
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Missing or invalid authorization header." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.split(" ")[1];
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

      if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
        console.error("Missing system environment variables.");
        return new Response(
          JSON.stringify({ error: "Server configuration error." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create a client with the user's token to verify identity
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });

      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      if (authError || !user) {
        console.error("Authentication failed:", authError);
        return new Response(
          JSON.stringify({ error: "Unauthorized." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create admin client
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()

      if (!razorpay_payment_id || !razorpay_order_id) {
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
      // (Optional for manual recovery checks if signature is not available or starts with 'manual')
      const isManualRecovery = !razorpay_signature || razorpay_signature.startsWith('manual') || razorpay_signature.startsWith('recovery');

      if (!isManualRecovery) {
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
      } else {
        console.log(`Performing manual recovery check for payment ${razorpay_payment_id} and order ${razorpay_order_id}`);
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
      if (razorpayPayment.status !== "captured" && razorpayPayment.status !== "authorized") {
        console.error(`Payment status is ${razorpayPayment.status}, expected captured or authorized.`);
        return new Response(
          JSON.stringify({ error: "Payment is in an invalid state: " + razorpayPayment.status }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Automatically capture payment if it is in authorized state
      if (razorpayPayment.status === "authorized") {
        try {
          console.log(`Payment ${razorpay_payment_id} is authorized. Capturing payment now...`);
          const captureResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}/capture`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Basic " + btoa(keyId + ":" + keySecret)
            },
            body: JSON.stringify({
              amount: razorpayPayment.amount,
              currency: "INR"
            })
          });

          if (!captureResponse.ok) {
            const captureErrorText = await captureResponse.text();
            console.error("Failed to capture authorized payment:", captureErrorText);
            return new Response(
              JSON.stringify({ error: "Failed to capture authorized payment." }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          console.log(`Payment ${razorpay_payment_id} captured successfully.`);
        } catch (captureErr) {
          console.error("Exception during payment capture:", captureErr);
          return new Response(
            JSON.stringify({ error: "Payment capture process failed." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
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

      let booking = paymentRecord.movie_bookings;
      if (Array.isArray(booking)) {
        booking = booking[0];
      }

      if (!booking) {
        console.error("Booking relation object is empty on payment record.");
        return new Response(
          JSON.stringify({ error: "Failed to retrieve associated booking details." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
      // Sequential numbers starting at 1996 based on row count
      let nextSerial = 1996;
      try {
        const { count, error: countErr } = await supabaseAdmin
          .from("tickets")
          .select("id", { count: "exact", head: true });
        
        if (!countErr && typeof count === 'number') {
          nextSerial = 1996 + count;
        }
      } catch (cErr) {
        console.error("Failed to query ticket count. Generating fallback timestamp serial:", cErr);
        nextSerial = Math.floor(1996 + Math.random() * 1000);
      }

      const ticketNumber = `TKT-${nextSerial}`;
      const invoiceNumber = `INV-${nextSerial}`;

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
  }
}
