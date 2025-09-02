import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  status: string;
  slug: string;
  created_at: string;
}

interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  status: string;
}

const BlogManagement: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    excerpt: '',
    content: '',
    image_url: '',
    status: 'published',
  });

  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplos
      .trim();
  };

  const createPostMutation = useMutation({
    mutationFn: async (postData: PostFormData) => {
      const slug = generateSlug(postData.title);
      const postWithSlug = { ...postData, slug };
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postWithSlug])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Post criado com sucesso!');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao criar post');
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, postData }: { id: string; postData: PostFormData }) => {
      const slug = generateSlug(postData.title);
      const postWithSlug = { ...postData, slug };
      
      const { data, error } = await supabase
        .from('blog_posts')
        .update(postWithSlug)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Post atualizado com sucesso!');
      setEditingPost(null);
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao atualizar post:', error);
      toast.error('Erro ao atualizar post');
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Post deletado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao deletar post:', error);
      toast.error('Erro ao deletar post');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      image_url: '',
      status: 'published',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, postData: formData });
    } else {
      createPostMutation.mutate(formData);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      image_url: post.image_url || '',
      status: post.status,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este post?')) {
      deletePostMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gerenciar Posts do Blog</CardTitle>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingPost(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? 'Editar Post' : 'Criar Novo Post'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Digite o título do post"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="excerpt">Subtítulo/Resumo</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Digite um resumo ou subtítulo (opcional)"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">URL da Imagem de Capa</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    type="url"
                  />
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded border"
                        onError={() => toast.error('URL da imagem inválida')}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite o conteúdo do post (HTML é suportado)"
                    rows={10}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Você pode usar HTML básico como &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingPost(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPostMutation.isPending || updatePostMutation.isPending}
                  >
                    {editingPost ? 'Atualizar' : 'Criar'} Post
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{post.title}</h4>
                    {post.image_url && (
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="text-sm text-gray-600 mb-1">{post.excerpt}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Criado em: {formatDate(post.created_at)} | Slug: {post.slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar Post</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="edit-title">Título *</Label>
                          <Input
                            id="edit-title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Digite o título do post"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-excerpt">Subtítulo/Resumo</Label>
                          <Textarea
                            id="edit-excerpt"
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            placeholder="Digite um resumo ou subtítulo (opcional)"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-image_url">URL da Imagem de Capa</Label>
                          <Input
                            id="edit-image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://exemplo.com/imagem.jpg"
                            type="url"
                          />
                          {formData.image_url && (
                            <div className="mt-2">
                              <img
                                src={formData.image_url}
                                alt="Preview"
                                className="w-32 h-20 object-cover rounded border"
                                onError={() => toast.error('URL da imagem inválida')}
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="edit-status">Status</Label>
                          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="published">Publicado</SelectItem>
                              <SelectItem value="draft">Rascunho</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-content">Conteúdo *</Label>
                          <Textarea
                            id="edit-content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Digite o conteúdo do post (HTML é suportado)"
                            rows={10}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Você pode usar HTML básico como &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
                          </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setEditingPost(null);
                              resetForm();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={updatePostMutation.isPending}
                          >
                            Atualizar Post
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletePostMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhum post criado ainda. Clique em "Novo Post" para começar!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlogManagement;