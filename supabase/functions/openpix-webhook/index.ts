
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('OpenPix webhook called:', req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log headers for debugging
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    const body = await req.text();
    console.log('Raw webhook body:', body);

    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('Error parsing webhook body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Parsed webhook data:', JSON.stringify(webhookData, null, 2));

    // Process payment completion
    if (webhookData.event === 'OPENPIX:CHARGE_COMPLETED') {
      const messageId = webhookData.charge?.correlationID;
      
      if (!messageId) {
        console.error('No messageId found in webhook data');
        return new Response(JSON.stringify({ error: 'No messageId found' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Processing payment completion for message:', messageId);

      // Update message status to paid
      const { data: updatedMessage, error: updateError } = await supabase
        .from('messages')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating message status:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update message' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Message status updated successfully:', updatedMessage);

      // Se a mensagem tem um cupom, incrementar o uso
      if (updatedMessage.coupon_code) {
        console.log('Incrementing coupon usage for code:', updatedMessage.coupon_code);
        
        const { error: couponError } = await supabase.functions.invoke('increment-coupon-usage', {
          body: { coupon_code: updatedMessage.coupon_code }
        });

        if (couponError) {
          console.error('Error incrementing coupon usage:', couponError);
          // Não falhar o webhook por causa disso, apenas logar
        } else {
          console.log('Coupon usage incremented successfully');
        }
      }

      // Format phone number for N8N
      const phoneNumber = updatedMessage.phone_number;
      const formattedPhoneNumber = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
      console.log(`Número original: ${phoneNumber} -> Número formatado: ${formattedPhoneNumber}`);

      // Send data to N8N webhook
      const n8nWebhookUrl = 'https://zaperelegante.app.n8n.cloud/webhook/f4b7c8e4-a0a8-4b97-bc21-60a5d7aa2741';
      
      console.log('Sending data to N8N webhook...');
      
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhoneNumber,
          message: updatedMessage.message_text,
          mediaUrl: updatedMessage.media_file_url,
          mediaType: updatedMessage.media_type,
          messageId: updatedMessage.id,
          status: updatedMessage.status
        }),
      });

      if (!n8nResponse.ok) {
        console.error('Error sending to N8N:', await n8nResponse.text());
      } else {
        console.log('Data sent to N8N webhook successfully');
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
