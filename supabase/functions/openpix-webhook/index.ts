
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para formatar o número de telefone para o formato correto
const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove todos os caracteres que não são números
  const numbersOnly = phoneNumber.replace(/\D/g, '');
  
  // Se já tem código do país (55), retorna como está
  if (numbersOnly.startsWith('55') && numbersOnly.length >= 12) {
    return numbersOnly;
  }
  
  // Se não tem código do país, adiciona o 55
  if (numbersOnly.length >= 10) {
    return `55${numbersOnly}`;
  }
  
  // Se não conseguir formatar, retorna o original
  return phoneNumber;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('OpenPix webhook called:', req.method, req.url)
    console.log('Headers:', Object.fromEntries(req.headers.entries()))

    // Log the raw body for debugging
    const body = await req.text()
    console.log('Raw webhook body:', body)

    // Parse the webhook data
    let webhookData
    try {
      webhookData = JSON.parse(body)
    } catch (parseError) {
      console.error('Failed to parse webhook body as JSON:', parseError)
      // Still return 200 to acknowledge receipt
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook received but could not parse JSON' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Parsed webhook data:', JSON.stringify(webhookData, null, 2))

    // Check if this is a charge completed event
    if (webhookData.event === 'OPENPIX:CHARGE_COMPLETED' && webhookData.charge) {
      const charge = webhookData.charge
      const messageId = charge.correlationID

      console.log('Processing payment completion for message:', messageId)

      if (!messageId) {
        console.log('No correlationID found in webhook, skipping processing')
        return new Response(
          JSON.stringify({ success: true, message: 'No correlation ID found' }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Connect to Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Update message status in database
      let updateData: any = {
        status: 'paid',
        transaction_id: charge.transactionID || `OPENPIX_${charge.globalID}`,
        openpix_charge_id: charge.globalID,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Se a mensagem era agendada, manter o agendamento mas marcar como paga
      const { data: currentMessage } = await supabase
        .from('messages')
        .select('is_scheduled, scheduled_for')
        .eq('id', messageId)
        .single();

      if (currentMessage?.is_scheduled) {
        // Para mensagens agendadas pagas, manter o status como 'scheduled' mas marcar como paga
        updateData.status = 'scheduled';
        console.log('Message is scheduled, keeping scheduled status but marking as paid');
      }

      const { data: updatedMessage, error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', messageId)
        .select()
        .single()

      if (error) {
        console.error('Error updating message status:', error)
        // Still return 200 to avoid webhook retries
        return new Response(
          JSON.stringify({ success: false, error: 'Database update failed', details: error.message }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('Message status updated successfully:', updatedMessage)

      // Formatar o número de telefone para o formato correto
      const formattedPhoneNumber = formatPhoneNumber(updatedMessage.phone_number);
      console.log('Número original:', updatedMessage.phone_number, '-> Número formatado:', formattedPhoneNumber);

      // Send data to N8N webhook
      const n8nWebhookUrl = 'https://webhook.zapelegante.com.br/webhook/9d0cf2ea-019d-4e28-b147-f542b27a6cc9'
      
      try {
        console.log('Sending data to N8N webhook...')
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageId: updatedMessage.id,
            phoneNumber: formattedPhoneNumber, // Usando o número formatado
            messageText: updatedMessage.message_text,
            mediaType: updatedMessage.media_type,
            mediaFileUrl: updatedMessage.media_file_url,
            transactionId: updatedMessage.transaction_id,
            status: updatedMessage.status,
            paidAt: updatedMessage.paid_at,
            event: 'payment_confirmed'
          })
        })

        if (n8nResponse.ok) {
          console.log('Data sent to N8N webhook successfully')
        } else {
          console.error('Failed to send data to N8N webhook:', n8nResponse.status, await n8nResponse.text())
        }
      } catch (n8nError) {
        console.error('Error sending to N8N webhook:', n8nError)
      }
    } else {
      console.log('Webhook event is not CHARGE_COMPLETED, ignoring:', webhookData.event)
    }

    // Always return 200 to acknowledge successful receipt
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Still return 200 to avoid webhook retries, but log the error
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Webhook processing failed',
        details: error.message 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
