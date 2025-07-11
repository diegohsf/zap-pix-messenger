import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateCheckoutRequest {
  messageId: string;
  amount: number;
  description: string;
  phoneNumber: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId, amount, description, phoneNumber }: CreateCheckoutRequest = await req.json();
    
    console.log('Creating Stripe checkout:', { messageId, amount, description });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error('Stripe secret key not found');
      return new Response(
        JSON.stringify({ error: 'Stripe secret key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { 
              name: description,
              description: `WhatsApp para ${phoneNumber}`
            },
            unit_amount: Math.round(amount * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: `${req.headers.get("origin")}/confirmation/{CHECKOUT_SESSION_ID}?message_id=${messageId}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        messageId: messageId,
        phoneNumber: phoneNumber,
      },
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
    });

    // Update message with Stripe session ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });

      await supabase
        .from('messages')
        .update({
          transaction_id: `STRIPE_${session.id}`,
          status: 'pending_payment'
        })
        .eq('id', messageId);
    }

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating Stripe checkout:', error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to create checkout session",
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});