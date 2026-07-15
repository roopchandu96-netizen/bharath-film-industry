// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

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

      const { quantity, phone, name } = await req.json();

      // Validate ticket quantity
      if (!quantity || quantity < 1 || quantity > 10) {
        return new Response(
          JSON.stringify({ error: "Invalid ticket quantity. You can book between 1 and 10 tickets." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const keyId = Deno.env.get('RAZORPAY_KEY_ID');
      const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

      if (!keyId || !keySecret) {
        console.error("Razorpay environment variables are missing.");
        return new Response(
          JSON.stringify({ error: "Server authentication error." }),
          { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Hardcoded verified pricing: ₹59 inclusive of GST per ticket
      const ticketPriceINR = 59;
      const amountPaise = ticketPriceINR * quantity * 100;
      const receiptId = `rcpt_booking_${Date.now()}`;

      // Call Razorpay REST API to create secure order ID
      let razorpayOrder;
      try {
        const response = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(keyId + ":" + keySecret)
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency: "INR",
            receipt: receiptId
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Razorpay order API error:", errorText);
          return new Response(
            JSON.stringify({ error: "Failed to create order with Razorpay." }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        razorpayOrder = await response.json();
      } catch (err) {
        console.error("Razorpay API request failed:", err);
        return new Response(
          JSON.stringify({ error: "Failed to connect to payment gateway." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate human-readable booking reference ID
      const bookingId = 'BFI-VNS-' + Math.floor(100000 + Math.random() * 900000);

      // Insert pending records in public.movie_bookings and public.payments via admin client
      try {
        const { data: mbData, error: mbError } = await supabaseAdmin
          .from("movie_bookings")
          .insert({
            booking_id: bookingId,
            amount: ticketPriceINR * quantity,
            quantity: quantity,
            phone: phone || "",
            email: user.email,
            name: name || user.user_metadata?.name || user.email,
            status: "pending",
            payment_status: "pending",
            user_id: user.id
          })
          .select()
          .single();

        if (mbError) {
          console.error("Supabase booking insert failed:", mbError);
          return new Response(
            JSON.stringify({ error: "Failed to initialize booking record." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: payError } = await supabaseAdmin
          .from("payments")
          .insert({
            booking_id: mbData.id,
            gateway_order_id: razorpayOrder.id,
            amount: ticketPriceINR * quantity,
            payment_status: "pending"
          });

        if (payError) {
          console.error("Supabase payment record insert failed:", payError);
          return new Response(
            JSON.stringify({ error: "Failed to initialize payment ledger record." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

      } catch (dbErr) {
        console.error("Database transaction failed:", dbErr);
        return new Response(
          JSON.stringify({ error: "Internal server error during record creation." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          order_id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          booking_id: bookingId
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (error) {
      console.error("Internal create-order exception:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
}
