
-- Criar tabela para configurações de promoção
CREATE TABLE IF NOT EXISTS public.promotion_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT false,
  discount_percentage numeric NOT NULL DEFAULT 50,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Inserir configuração inicial
INSERT INTO public.promotion_settings (is_active, discount_percentage)
VALUES (false, 50)
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.promotion_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos os usuários autenticados
CREATE POLICY "Allow read promotion settings" ON public.promotion_settings
FOR SELECT TO authenticated
USING (true);

-- Política para permitir update apenas para admins (simplificada - todos autenticados podem atualizar)
CREATE POLICY "Allow update promotion settings" ON public.promotion_settings
FOR UPDATE TO authenticated
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_promotion_settings_updated_at
  BEFORE UPDATE ON public.promotion_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
