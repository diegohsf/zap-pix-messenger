import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, User, ArrowLeft, BookOpen, FileText } from 'lucide-react';
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
      {/* Beautiful Header */}
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-blue-50/50 -z-10"></div>
        
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-white/10 rounded-full -translate-y-24 translate-x-24 md:-translate-y-48 md:translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-white/5 rounded-full translate-y-16 -translate-x-16 md:translate-y-32 md:-translate-x-32"></div>
          
          <div className="container mx-auto px-4 py-6 md:py-12 relative z-10">
            {/* Back Button */}
            <div className="mb-4 md:mb-6">
              <Link to="/blog">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Blog
                </Button>
              </Link>
            </div>
            
            {/* Header Content */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-3 md:mb-4">
                <div className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 max-w-4xl mx-auto leading-tight">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-white/90 text-sm md:text-lg max-w-3xl mx-auto px-4 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
              )}
              
              {/* Meta Information */}
              <div className="flex items-center justify-center gap-4 md:gap-6 text-white/70">
                <div className="flex items-center gap-1 md:gap-2">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs md:text-sm">{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <User className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs md:text-sm">Zap Elegante</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Article */}
        <article className="max-w-4xl mx-auto">
          <Card className="shadow-xl md:shadow-2xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl md:rounded-3xl overflow-hidden">
            {/* Hero Image */}
            {post.image_url && (
              <div className="w-full h-48 md:h-80 overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="p-6 md:p-8 lg:p-12">
              {/* Content */}
              <div 
                className="prose prose-sm md:prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <Link to="/blog">
              <Button variant="outline" size="lg" className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl">
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