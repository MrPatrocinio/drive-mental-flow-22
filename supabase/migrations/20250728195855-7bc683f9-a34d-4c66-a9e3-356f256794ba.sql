-- Criar usuário normal no sistema de autenticação
-- Inserir diretamente na tabela profiles com user_id fictício para demonstração
-- O usuário real será criado através do sistema de autenticação

-- Primeiro, vamos criar um exemplo de como seria um usuário normal
-- Inserir um perfil de usuário normal
INSERT INTO public.profiles (user_id, display_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Usuário Teste',
  'user'
);

-- Nota: Para criar um usuário real, seria necessário usar o sistema de autenticação do Supabase
-- através da interface ou programaticamente com supabase.auth.signUp()