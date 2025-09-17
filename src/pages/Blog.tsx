import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, BookOpen, PenTool } from 'lucide-react';
import Footer from '@/components/Footer';

const Blog: React.FC = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Beautiful Header */}
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-blue-50/50 -z-10"></div>
        
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-white/10 rounded-full -translate-y-24 translate-x-24 md:-translate-y-48 md:translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-white/5 rounded-full translate-y-16 -translate-x-16 md:translate-y-32 md:-translate-x-32"></div>
          
          <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
            {/* Back Button */}
            <div className="mb-6 md:mb-8">
              <Link to="/">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>
            
            {/* Header Content */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <div className="bg-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-sm">
                  <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
                Blog do Zap Elegante
              </h1>
              
              <p className="text-white/90 text-base md:text-xl max-w-3xl mx-auto px-4 leading-relaxed">
                Fique por dentro das novidades, dicas e histórias sobre mensagens anônimas
              </p>
              
              {/* Decorative Elements */}
              <div className="flex items-center justify-center gap-6 md:gap-8 mt-6 md:mt-8 text-white/70">
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base">Artigos Exclusivos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base">Sempre Atualizado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-300">
                {post.image_url && (
                  <div className="overflow-hidden rounded-t-lg">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Zap Elegante</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to={`/blog/${post.slug}`}>
                    <Button className="w-full">
                      Ler mais
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum post encontrado
            </h3>
            <p className="text-gray-500">
              Em breve teremos conteúdo incrível para você!
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blog;