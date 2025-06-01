
import { supabase } from '@/integrations/supabase/client';

export const generateBlogPost = async (messageId: string) => {
  try {
    console.log('🤖 Gerando post do blog para mensagem:', messageId);
    
    const { data, error } = await supabase.functions.invoke('generate-blog-post', {
      body: { messageId }
    });

    if (error) {
      console.error('❌ Erro ao gerar post do blog:', error);
      throw error;
    }

    console.log('✅ Post do blog gerado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro no serviço de geração de blog:', error);
    throw error;
  }
};

export const getBlogPosts = async (limit = 10) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const getBlogPostBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) throw error;
  return data;
};
