
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
    console.log('🔄 Iniciando geração em lote de posts do blog...');

    // Verificar se a chave da OpenAI está configurada
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.log('❌ OPENAI_API_KEY não configurada')
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'OPENAI_API_KEY não configurada' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar todas as mensagens pagas que não têm posts associados
    const { data: paidMessages, error: messagesError } = await supabaseClient
      .from('messages')
      .select('id, phone_number, message_text, media_type, created_at')
      .eq('status', 'paid')

    if (messagesError) {
      console.error('❌ Erro ao buscar mensagens pagas:', messagesError);
      throw new Error('Erro ao buscar mensagens pagas')
    }

    if (!paidMessages || paidMessages.length === 0) {
      console.log('📄 Nenhuma mensagem paga encontrada');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Nenhuma mensagem paga encontrada',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`📋 Encontradas ${paidMessages.length} mensagens pagas`);

    // Filtrar mensagens que já têm posts
    const messagesWithoutPosts = [];
    for (const message of paidMessages) {
      const { data: existingPost } = await supabaseClient
        .from('blog_posts')
        .select('id')
        .eq('message_id', message.id)
        .single()

      if (!existingPost) {
        messagesWithoutPosts.push(message);
      }
    }

    console.log(`🆕 ${messagesWithoutPosts.length} mensagens sem posts`);

    let successCount = 0;
    let errorCount = 0;

    // Processar cada mensagem
    for (const message of messagesWithoutPosts) {
      try {
        console.log(`🤖 Processando mensagem ${message.id}...`);

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
        - Responda APENAS com JSON válido, sem markdown ou formatação

        Exemplo de resposta:
        {"title": "Título da notícia", "excerpt": "Resumo curto", "content": "<p>Conteúdo em HTML...</p>"}
        `

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 1500,
          }),
        })

        if (!openaiResponse.ok) {
          throw new Error(`Erro na API do OpenAI: ${openaiResponse.status}`)
        }

        const openaiData = await openaiResponse.json()
        
        let generatedContent;
        try {
          // Extrair o conteúdo da resposta
          let content = openaiData.choices[0].message.content.trim()
          
          // Remover blocos de código markdown se existirem
          if (content.includes('```json')) {
            content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim()
          } else if (content.includes('```')) {
            content = content.replace(/```\s*/g, '').trim()
          }
          
          generatedContent = JSON.parse(content)
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse do JSON para mensagem', message.id, ':', parseError);
          errorCount++;
          continue;
        }

        // Gerar slug único
        const { data: slugData, error: slugError } = await supabaseClient
          .rpc('generate_unique_slug', { title_text: generatedContent.title })

        if (slugError) {
          console.error('❌ Erro ao gerar slug para mensagem', message.id, ':', slugError);
          errorCount++;
          continue;
        }

        // Salvar post no banco
        const { error: insertError } = await supabaseClient
          .from('blog_posts')
          .insert({
            title: generatedContent.title,
            slug: slugData,
            content: generatedContent.content,
            excerpt: generatedContent.excerpt,
            message_id: message.id,
            image_url: `https://picsum.photos/800/400?random=${Date.now()}-${message.id}`,
            status: 'published'
          })

        if (insertError) {
          console.error('❌ Erro ao salvar post para mensagem', message.id, ':', insertError);
          errorCount++;
          continue;
        }

        console.log(`✅ Post criado para mensagem ${message.id}: ${generatedContent.title}`);
        successCount++;

        // Pequena pausa entre requisições para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Erro ao processar mensagem ${message.id}:`, error);
        errorCount++;
      }
    }

    console.log(`🎉 Processamento concluído: ${successCount} sucessos, ${errorCount} erros`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processamento concluído: ${successCount} posts criados, ${errorCount} erros`,
      totalProcessed: messagesWithoutPosts.length,
      successCount,
      errorCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('💥 Erro geral na geração em lote:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
