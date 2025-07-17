-- Primeiro, vamos verificar se precisamos de uma tabela de usuários/profiles
-- Se não existir, vamos criar uma estrutura completa para autenticação

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email),
    CASE 
      WHEN new.email = 'dppsoft@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para obter role do usuário atual (evita recursão em RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contagem de áudios nos fields
CREATE OR REPLACE FUNCTION public.update_field_audio_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.fields 
  SET audio_count = (
    SELECT COUNT(*) FROM public.audios WHERE field_id = COALESCE(NEW.field_id, OLD.field_id)
  )
  WHERE id = COALESCE(NEW.field_id, OLD.field_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de updated_at nas tabelas necessárias
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_fields_updated_at ON public.fields;  
CREATE TRIGGER update_fields_updated_at
  BEFORE UPDATE ON public.fields
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_audios_updated_at ON public.audios;
CREATE TRIGGER update_audios_updated_at
  BEFORE UPDATE ON public.audios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_playlists_updated_at ON public.playlists;
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_landing_content_updated_at ON public.landing_content;
CREATE TRIGGER update_landing_content_updated_at
  BEFORE UPDATE ON public.landing_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar contagem de áudios
DROP TRIGGER IF EXISTS update_audio_count_trigger ON public.audios;
CREATE TRIGGER update_audio_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.audios
  FOR EACH ROW EXECUTE FUNCTION public.update_field_audio_count();