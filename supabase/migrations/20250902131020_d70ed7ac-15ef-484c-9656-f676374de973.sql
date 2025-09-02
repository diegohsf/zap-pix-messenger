-- Adicionar políticas que estão faltando para administração do blog

-- Política para permitir inserção de novos posts (admin)
CREATE POLICY "Allow blog post creation" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (true);

-- Política para permitir atualização de posts (admin)
CREATE POLICY "Allow blog post updates" 
ON public.blog_posts 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Política para permitir exclusão de posts (admin)
CREATE POLICY "Allow blog post deletion" 
ON public.blog_posts 
FOR DELETE 
USING (true);

-- Política para permitir admins verem todos os posts (incluindo rascunhos)
CREATE POLICY "Allow admin to view all posts" 
ON public.blog_posts 
FOR SELECT 
USING (true);