-- Criar tabela para capturar leads da página de inscrição
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest_field TEXT,
  source TEXT DEFAULT 'inscricao_page',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todos os leads
CREATE POLICY "Admins can view all leads" 
ON public.leads 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Política para inserção pública (qualquer pessoa pode se inscrever)
CREATE POLICY "Anyone can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Política para admins gerenciarem leads
CREATE POLICY "Admins can manage leads" 
ON public.leads 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_leads_source ON public.leads(source);