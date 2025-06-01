
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
    // Verificar se a chave da OpenAI está configurada
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.log('❌ OPENAI_API_KEY não configurada, abortando geração de post')
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'OPENAI_API_KEY não configurada' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { messageId } = await req.json()

    // Buscar dados da mensagem
    const { data: message, error: messageError } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      throw new Error('Mensagem não encontrada')
    }

    // Verificar se já existe um post para esta mensagem
    const { data: existingPost } = await supabaseClient
      .from('blog_posts')
      .select('id')
      .eq('message_id', messageId)
      .single()

    if (existingPost) {
      return new Response(JSON.stringify({ success: true, message: 'Post já existe' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Gerar conteúdo com ChatGPT
    const prompt = `
    Baseado na seguinte mensagem do WhatsApp enviada através do Zap Elegante, crie uma notícia interessante e criativa:

    Mensagem: "${message.message_text}"
    Tipo de mídia: ${message.media_type}

    Gere uma notícia no formato JSON com:
    - title: Título criativo e chamativo (máximo 100 caracteres)
    - excerpt: Resumo da notícia (máximo 150 caracteres)  
    - content: Conteúdo completo da notícia em HTML (3-4 parágrafos, mínimo 300 palavras)

    IMPORTANTE: 
    - NÃO mencione números de telefone ou dados pessoais
    - Trate como uma história geral baseada no contexto da mensagem
    - Use tom jornalístico mas divertido
    - Se houver mídia, mencione no contexto da história
    - Foque no aspecto humano e interessante da mensagem

    Responda APENAS com o JSON válido:
    `

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    })

    const openaiData = await openaiResponse.json()
    const generatedContent = JSON.parse(openaiData.choices[0].message.content)

    // Gerar slug único
    const { data: slugData } = await supabaseClient
      .rpc('generate_unique_slug', { title_text: generatedContent.title })

    // Salvar post no banco
    const { data: blogPost, error: insertError } = await supabaseClient
      .from('blog_posts')
      .insert({
        title: generatedContent.title,
        slug: slugData,
        content: generatedContent.content,
        excerpt: generatedContent.excerpt,
        message_id: messageId,
        image_url: `https://picsum.photos/800/400?random=${Date.now()}`, // Imagem placeholder
        status: 'published'
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    console.log('Post do blog criado:', blogPost)

    return new Response(JSON.stringify({ success: true, post: blogPost }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Erro ao gerar post do blog:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
