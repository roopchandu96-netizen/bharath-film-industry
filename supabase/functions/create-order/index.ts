import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency, receipt } = await req.json()

    // Validate amount (Must be >= 100 paise)
    if (!amount || amount < 100) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Minimum amount is 100 paise." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!keyId || !keySecret) {
      console.error("Razorpay environment variables are missing.")
      return new Response(
        JSON.stringify({ error: "Server authentication error." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Call Razorpay REST API
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(keyId + ":" + keySecret)
      },
      body: JSON.stringify({
        amount: Math.round(amount),
        currency: currency || "INR",
        receipt: receipt || `receipt_${Date.now()}`
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Razorpay order API error:", errorText)
      return new Response(
        JSON.stringify({ error: "Failed to create order with Razorpay." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const order = await response.json()

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Internal create-order exception:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
