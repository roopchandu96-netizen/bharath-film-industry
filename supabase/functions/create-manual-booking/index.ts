// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

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
      const { quantity, utrId, phone, name } = await req.json();

      // Validate ticket quantity
      if (!quantity || quantity < 1 || quantity > 10) {
        return new Response(
          JSON.stringify({ error: "Invalid ticket quantity." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate UTR / Transaction ID presence
      if (!utrId || !utrId.trim()) {
        return new Response(
          JSON.stringify({ error: "Missing Transaction Reference ID (UTR)." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ticketPriceINR = 59;
      const bookingId = 'BFI-VNS-' + Math.floor(100000 + Math.random() * 900000);

      // Check for duplicate UTR submission
      const { data: existingPayment } = await supabaseAdmin
        .from("payments")
        .select("id")
        .eq("gateway_order_id", utrId.trim())
        .maybeSingle();

      if (existingPayment) {
        return new Response(
          JSON.stringify({ error: "This UTR / Transaction Reference ID has already been submitted." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert pending booking and pending payment records via admin client
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
            JSON.stringify({ error: "Failed to initialize manual booking record." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: payError } = await supabaseAdmin
          .from("payments")
          .insert({
            booking_id: mbData.id,
            gateway_order_id: utrId.trim(),
            amount: ticketPriceINR * quantity,
            payment_status: "pending"
          });

        if (payError) {
          console.error("Supabase payment record insert failed:", payError);
          return new Response(
            JSON.stringify({ error: "Failed to initialize manual payment record." }),
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
        JSON.stringify({ success: true, booking_id: bookingId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (error) {
      console.error("Internal create-manual-booking exception:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  })
}
