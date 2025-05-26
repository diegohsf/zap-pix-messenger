
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const webhookData = await req.json()
    console.log('OpenPix webhook received:', webhookData)

    // Verificar se é um evento de pagamento confirmado
    if (webhookData.event === 'OPENPIX:CHARGE_COMPLETED') {
      const charge = webhookData.charge
      const messageId = charge.correlationID

      console.log('Payment completed for message:', messageId)

      // Conectar ao Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Atualizar status da mensagem no banco
      const { data: updatedMessage, error } = await supabase
        .from('messages')
        .update({
          status: 'paid',
          transaction_id: charge.transactionID || `OPENPIX_${charge.globalID}`,
          openpix_charge_id: charge.globalID,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select()
        .single()

      if (error) {
        console.error('Error updating message status:', error)
        throw error
      }

      console.log('Message status updated:', updatedMessage)

      // Enviar dados para webhook do N8N
      const n8nWebhookUrl = 'https://webhook.golawtech.com.br/webhook/9d0cf2ea-019d-4e28-b147-f542b27a6cc9'
      
      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageId: updatedMessage.id,
            phoneNumber: updatedMessage.phone_number,
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
          console.error('Failed to send data to N8N webhook:', n8nResponse.status)
        }
      } catch (n8nError) {
        console.error('Error sending to N8N webhook:', n8nError)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
