
import { supabase } from '@/integrations/supabase/client';

export const generateBulkBlogPosts = async () => {
  try {
    console.log('🔄 Iniciando geração em lote de posts do blog...');
    
    const { data, error } = await supabase.functions.invoke('generate-bulk-blog-posts');

    if (error) {
      console.error('❌ Erro ao gerar posts em lote:', error);
      throw error;
    }

    console.log('✅ Posts gerados em lote:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro no serviço de geração em lote:', error);
    throw error;
  }
};
