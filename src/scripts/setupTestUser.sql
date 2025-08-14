
-- Script para configurar usuário de teste com assinatura premium
-- Usuário: maranatj@gmail.com

-- Primeiro, vamos verificar se o usuário existe
DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT := 'maranatj@gmail.com';
BEGIN
    -- Buscar o user_id do usuário de teste
    SELECT user_id INTO test_user_id 
    FROM public.profiles 
    WHERE EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = profiles.user_id 
        AND auth.users.email = test_email
    );

    -- Se encontrou o usuário, configurar assinatura
    IF test_user_id IS NOT NULL THEN
        -- Inserir ou atualizar assinatura
        INSERT INTO public.subscribers (
            user_id,
            email,
            subscribed,
            subscription_tier,
            subscription_end,
            created_at,
            updated_at
        ) VALUES (
            test_user_id,
            test_email,
            true,
            'premium',
            now() + interval '1 year', -- Assinatura válida por 1 ano
            now(),
            now()
        )
        ON CONFLICT (user_id, email) 
        DO UPDATE SET
            subscribed = true,
            subscription_tier = 'premium',
            subscription_end = now() + interval '1 year',
            updated_at = now();

        RAISE NOTICE 'Usuário % configurado com assinatura premium até %', 
            test_email, 
            (now() + interval '1 year')::date;
    ELSE
        RAISE NOTICE 'Usuário % não encontrado no sistema', test_email;
    END IF;
END $$;
