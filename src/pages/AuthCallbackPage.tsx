import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ResetPasswordService } from "@/services/resetPasswordService";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * AuthCallbackPage - Página de callback para fluxos de autenticação
 * Responsabilidade: Processar tokens/codes e redirecionar (princípio SRP)
 * Útil quando o provedor de email reescreve hash como query params
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      console.log('[AUTH CALLBACK] URL:', window.location.href);
      const { token, type, code } = ResetPasswordService.extractRecoveryToken();
      console.log('[AUTH CALLBACK] Extracted:', { token: token?.substring(0, 20) + '...', type, code: code?.substring(0, 20) });

      // Se encontrou access_token, redireciona para reset-password com o hash
      if (token && type === 'access_token') {
        console.log('[CALLBACK] Found access_token, redirecting to reset-password');
        navigate(`/reset-password#access_token=${token}&type=recovery`, { replace: true });
        return;
      }

      // Se encontrou code (PKCE), faz o exchange e redireciona
      if (code && type === 'code') {
        console.log('[CALLBACK] Found PKCE code, exchanging for session');
        const { error } = await ResetPasswordService.exchangeCodeForSession(code);
        
        if (error) {
          console.error('[CALLBACK] Error exchanging code:', error);
          navigate('/forgot-password', { 
            replace: true,
            state: { error: 'Link inválido ou expirado. Solicite um novo.' }
          });
          return;
        }

        console.log('[CALLBACK] Session established, redirecting to reset-password');
        navigate('/reset-password', { replace: true });
        return;
      }

      // Nenhum token encontrado, redireciona para forgot-password
      console.warn('[CALLBACK] No valid token found, redirecting to forgot-password');
      navigate('/forgot-password', { 
        replace: true,
        state: { error: 'Link de recuperação inválido.' }
      });
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-4 w-48" />
            <p className="text-sm text-muted-foreground text-center">
              Processando link de recuperação...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
