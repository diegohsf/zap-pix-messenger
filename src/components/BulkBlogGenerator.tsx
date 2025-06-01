
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Loader2 } from 'lucide-react';
import { generateBulkBlogPosts } from '@/services/bulkBlogService';
import { useToast } from '@/hooks/use-toast';

const BulkBlogGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateBulkPosts = async () => {
    setIsGenerating(true);
    
    try {
      const result = await generateBulkBlogPosts();
      
      toast({
        title: "Geração concluída!",
        description: result.message || `${result.successCount} posts criados com sucesso`,
      });
      
      console.log('Resultado da geração em lote:', result);
    } catch (error) {
      console.error('Erro na geração em lote:', error);
      
      toast({
        title: "Erro na geração",
        description: "Erro ao gerar posts do blog. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Geração em Lote de Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Gera posts do blog para todas as mensagens pagas que ainda não têm posts associados.
        </p>
        
        <Button 
          onClick={handleGenerateBulkPosts}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando Posts...
            </>
          ) : (
            <>
              <Newspaper className="mr-2 h-4 w-4" />
              Gerar Posts para Mensagens Pagas
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkBlogGenerator;
