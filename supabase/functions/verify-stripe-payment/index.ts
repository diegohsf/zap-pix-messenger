import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  sessionId: string;
  messageId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, messageId }: VerifyPaymentRequest = await req.json();
    
    console.log('Verifying Stripe payment:', { sessionId, messageId });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('Stripe session status:', session.payment_status);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    if (session.payment_status === 'paid') {
      // Update message status to paid
      const { error } = await supabase
        .from('messages')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          transaction_id: `STRIPE_${session.payment_intent}`
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error updating message:', error);
        throw new Error('Failed to update message status');
      }

      // Buscar dados da mensagem atualizada para enviar ao webhook
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (!fetchError && message) {
        // Enviar para o webhook N8N
        try {
          const n8nWebhookUrl = 'https://webhook.golawtech.com.br/webhook/9d0cf2ea-019d-4e28-b147-f542b27a6cc9';
          
          const formatPhoneNumber = (phoneNumber: string): string => {
            const numbersOnly = phoneNumber.replace(/\D/g, '');
            if (numbersOnly.startsWith('55') && numbersOnly.length >= 12) {
              return numbersOnly;
            }
            if (numbersOnly.length >= 10) {
              return `55${numbersOnly}`;
            }
            return phoneNumber;
          };

          const formattedPhoneNumber = formatPhoneNumber(message.phone_number);
          
          const webhookResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messageId: message.id,
              phoneNumber: formattedPhoneNumber,
              messageText: message.message_text,
              mediaType: message.media_type,
              mediaFileUrl: message.media_file_url,
              transactionId: message.transaction_id,
              status: message.status,
              paidAt: message.paid_at,
              event: 'payment_confirmed'
            })
          });

          if (webhookResponse.ok) {
            console.log('Data sent to N8N webhook successfully');
          } else {
            console.error('Failed to send data to N8N webhook:', webhookResponse.status);
          }
        } catch (webhookError) {
          console.error('Error sending to N8N webhook:', webhookError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          status: 'paid',
          transactionId: `STRIPE_${session.payment_intent}`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false,
          status: session.payment_status
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to verify payment",
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});