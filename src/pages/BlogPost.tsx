import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const BlogPost: React.FC = () => {
  const { slug } = useParams();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug não fornecido');
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Link to="/blog">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Blog
            </Button>
          </Link>
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Post não encontrado
            </h1>
            <p className="text-gray-600 mb-6">
              O post que você está procurando não existe ou foi removido.
            </p>
            <Link to="/blog">
              <Button>
                Ver todos os posts
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Link to="/blog">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Blog
          </Button>
        </Link>

        {/* Article */}
        <article className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            {/* Hero Image */}
            {post.image_url && (
              <div className="w-full h-64 md:h-80 overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="p-6 md:p-8">
              {/* Header */}
              <header className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  {post.title}
                </h1>
                
                {post.excerpt && (
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-gray-500 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Zap Elegante</span>
                  </div>
                </div>
              </header>

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <Link to="/blog">
              <Button variant="outline" size="lg">
                Ver mais posts
              </Button>
            </Link>
          </div>
        </article>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;