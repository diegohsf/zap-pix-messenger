
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const webhookData = await req.json()
    console.log('Webhook recebido:', JSON.stringify(webhookData, null, 2))

    // Verificar se o evento é de pagamento confirmado
    if (webhookData.event === 'OPENPIX:CHARGE_COMPLETED') {
      const charge = webhookData.charge
      const transactionId = charge.transactionID
      
      console.log('Processando pagamento confirmado para transactionID:', transactionId)

      // Buscar a mensagem pelo transaction_id
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('transaction_id', transactionId)
        .single()

      if (fetchError) {
        console.error('Erro ao buscar mensagem:', fetchError)
        throw new Error('Mensagem não encontrada')
      }

      console.log('Mensagem encontrada:', message)

      // Atualizar status da mensagem para 'paid'
      const { error: updateError } = await supabase
        .from('messages')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', message.id)

      if (updateError) {
        console.error('Erro ao atualizar mensagem:', updateError)
        throw new Error('Erro ao atualizar status da mensagem')
      }

      console.log('Status da mensagem atualizado para paid')

      // Se há cupom usado, incrementar contador de uso
      if (message.coupon_code) {
        console.log('Incrementando uso do cupom:', message.coupon_code)
        
        // Buscar o cupom pelo código
        const { data: coupon, error: couponError } = await supabase
          .from('discount_coupons')
          .select('*')
          .eq('code', message.coupon_code)
          .single()

        if (couponError) {
          console.error('Erro ao buscar cupom:', couponError)
        } else if (coupon) {
          // Incrementar o contador de uso
          const { error: incrementError } = await supabase
            .from('discount_coupons')
            .update({ 
              used_count: coupon.used_count + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', coupon.id)

          if (incrementError) {
            console.error('Erro ao incrementar uso do cupom:', incrementError)
          } else {
            console.log('Uso do cupom incrementado com sucesso. Novo count:', coupon.used_count + 1)
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Pagamento processado' }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Para outros tipos de evento, apenas retornar sucesso
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook recebido' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Erro no webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
