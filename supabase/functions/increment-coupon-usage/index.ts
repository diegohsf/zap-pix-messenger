
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { coupon_id, coupon_code } = await req.json()

    // Aceitar tanto coupon_id quanto coupon_code
    if (!coupon_id && !coupon_code) {
      throw new Error('coupon_id or coupon_code is required')
    }

    let updateQuery = supabase
      .from('discount_coupons')
      .update({ 
        used_count: supabase.raw('used_count + 1'),
        updated_at: new Date().toISOString()
      })

    // Usar o campo apropriado para a busca
    if (coupon_id) {
      updateQuery = updateQuery.eq('id', coupon_id)
    } else {
      updateQuery = updateQuery.eq('code', coupon_code.toUpperCase())
    }

    const { data, error } = await updateQuery
      .select()
      .single()

    if (error) {
      console.error('Error incrementing coupon usage:', error)
      throw error
    }

    console.log('Coupon usage incremented:', data)

    return new Response(
      JSON.stringify({ success: true, coupon: data }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in increment-coupon-usage function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
