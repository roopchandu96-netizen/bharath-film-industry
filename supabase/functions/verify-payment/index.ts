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
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!keySecret) {
      console.error("Razorpay Key Secret is missing.")
      return new Response(
        JSON.stringify({ error: "Server authentication error." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Verify Signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
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
      return new Response(
        JSON.stringify({ success: false, error: "Signature mismatch. Unauthorized payment attempt." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
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
