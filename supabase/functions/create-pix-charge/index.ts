
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateChargeRequest {
  messageId: string;
  phoneNumber: string;
  amount: number;
  description: string;
}

interface OpenPixCharge {
  charge: {
    id: string;
    brCode: string;
    qrCodeImage: string;
    status: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messageId, phoneNumber, amount, description }: CreateChargeRequest = await req.json()
    
    console.log('Creating PIX charge:', { messageId, phoneNumber, amount, description })

    // Buscar a chave da API do OpenPix nos secrets
    const openPixApiKey = Deno.env.get('OPENPIX_API_KEY')
    
    if (!openPixApiKey) {
      console.error('OpenPix API key not found')
      return new Response(
        JSON.stringify({ error: 'OpenPix API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Criar cobrança no OpenPix
    const openPixResponse = await fetch('https://api.openpix.com.br/api/v1/charge', {
      method: 'POST',
      headers: {
        'Authorization': openPixApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correlationID: messageId,
        value: Math.round(amount * 100), // OpenPix usa centavos
        comment: description,
        customer: {
          phone: phoneNumber,
        },
        additionalInfo: [
          {
            key: 'messageId',
            value: messageId
          }
        ]
      })
    })

    if (!openPixResponse.ok) {
      const errorData = await openPixResponse.text()
      console.error('OpenPix API error:', errorData)
      throw new Error(`OpenPix API error: ${openPixResponse.status}`)
    }

    const openPixData: OpenPixCharge = await openPixResponse.json()
    console.log('OpenPix charge created:', openPixData)

    // Retornar dados da cobrança
    return new Response(
      JSON.stringify({
        success: true,
        chargeId: openPixData.charge.id,
        pixCode: openPixData.charge.brCode,
        qrCodeUrl: openPixData.charge.qrCodeImage,
        status: openPixData.charge.status
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error creating PIX charge:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create PIX charge',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
