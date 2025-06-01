
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogSection: React.FC = () => {
  const { data: recentPosts, isLoading } = useQuery({
    queryKey: ['recent-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, created_at, image_url')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (isLoading || !recentPosts || recentPosts.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            📰 Últimas do Blog
          </CardTitle>
          <p className="text-sm text-gray-600">
            Mensagens transformadas em notícias fascinantes
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {recentPosts.map((post) => (
              <div 
                key={post.id}
                className="group bg-gradient-to-br from-blue-50 to-green-50 p-4 rounded-lg border hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-video mb-3 overflow-hidden rounded-lg">
                  <img
                    src={post.image_url || `https://picsum.photos/300/150?random=${post.id}`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                      Ler
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/blog">
              <Button className="gap-2">
                Ver Todas as Notícias
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default BlogSection;
